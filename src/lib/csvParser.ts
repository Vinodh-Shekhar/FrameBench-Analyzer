import type { FrameDataPoint, DriverDataset, FrameViewMetadata } from '../types/telemetry';
import type { PerformanceMetrics, QAAnalysis } from '../types/telemetry';
import { computeMetricsFromAccumulator } from './analysis';

const FRAME_TIME_HEADERS = [
  'frametime',
  'frame_time',
  'frame time',
  'msbetweenpresents',
  'msbetweendisplaychange',
];

export const MAX_RENDER_FRAMES = 25_000;
const YIELD_INTERVAL = 5_000;

const FPS_HIST_BUCKETS = 200_000;
const FPS_HIST_MAX = 2000;
const FPS_BUCKET_WIDTH = FPS_HIST_MAX / FPS_HIST_BUCKETS;

const FILE_SIZE_STREAM_THRESHOLD = 10 * 1024 * 1024;

function detectFrameViewMetadata(
  headers: string[],
  firstDataRow: string[]
): FrameViewMetadata | undefined {
  const headerMap = new Map<string, number>();
  headers.forEach((h, i) => headerMap.set(h, i));

  const hasFrameView =
    headerMap.has('msbetweenpresents') ||
    headerMap.has('msbetweendisplaychange');

  if (!hasFrameView) return undefined;

  const getValue = (key: string): string => {
    const idx = headerMap.get(key);
    if (idx === undefined) return '';
    return (firstDataRow[idx] ?? '').trim();
  };

  return {
    application: getValue('application'),
    gpu: getValue('gpu'),
    cpu: getValue('cpu').replace(/\s+/g, ' ').trim(),
    resolution: getValue('resolution'),
    source: 'frameview',
  };
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export interface ParseResult {
  dataset: DriverDataset;
  metrics: PerformanceMetrics;
  analysis: QAAnalysis;
}

export type ProgressCallback = (framesProcessed: number, bytesProcessed: number, totalBytes: number) => void;

export async function parseCSVFile(
  file: File,
  label: string,
  onProgress?: ProgressCallback
): Promise<ParseResult> {
  if (file.size > FILE_SIZE_STREAM_THRESHOLD) {
    return parseCSVFileStreaming(file, label, onProgress);
  }
  const text = await readFileAsText(file);
  return parseCSVText(text, label, file.name, onProgress ? (frames) => onProgress(frames, file.size, file.size) : undefined);
}

async function parseCSVFileStreaming(
  file: File,
  label: string,
  onProgress?: ProgressCallback
): Promise<ParseResult> {
  const decoder = new TextDecoder('utf-8');
  const reader = file.stream().getReader();

  let headerLine: string | null = null;
  let headers: string[] = [];
  let frameTimeIndex = -1;
  let metadata: FrameViewMetadata | undefined;
  let firstDataRowParsed = false;

  const fpsHistogram = new Int32Array(FPS_HIST_BUCKETS);

  let n = 0;
  let minFt = Infinity;
  let maxFt = -Infinity;
  let stutterCount = 0;
  let deviationSum = 0;
  let highCount = 0;
  let medCount = 0;

  // Welford's online algorithm state
  let wMean = 0;
  let wM2 = 0;

  // Reservoir-style evenly-spaced frame sampling
  // We collect every Nth frame where N is adaptive based on running count
  const sampledFrameTimes: number[] = [];
  let sampleStep = 1;
  let nextSampleAt = 1;

  let leftover = '';
  let bytesRead = 0;
  let yieldCounter = 0;

  const processLine = (line: string) => {
    if (line === '') return;

    if (headerLine === null) {
      headerLine = line;
      headers = line.split(',').map(h => h.trim().toLowerCase());
      frameTimeIndex = headers.findIndex(h => FRAME_TIME_HEADERS.includes(h));
      if (frameTimeIndex === -1) {
        throw new Error('CSV must contain a "FrameTime" or "MsBetweenPresents" column');
      }
      return;
    }

    const cols = line.split(',');
    const raw = (cols[frameTimeIndex] ?? '').trim();
    if (raw === '' || raw.toUpperCase() === 'NA') return;

    const frameTime = parseFloat(raw);
    if (isNaN(frameTime) || frameTime <= 0) return;

    if (!firstDataRowParsed) {
      metadata = detectFrameViewMetadata(headers, cols);
      firstDataRowParsed = true;
    }

    n++;

    // Welford's online mean + variance
    const delta = frameTime - wMean;
    wMean += delta / n;
    const delta2 = frameTime - wMean;
    wM2 += delta * delta2;

    if (frameTime < minFt) minFt = frameTime;
    if (frameTime > maxFt) maxFt = frameTime;

    const fps = 1000 / frameTime;
    const bucketIdx = Math.min(Math.floor(fps / FPS_BUCKET_WIDTH), FPS_HIST_BUCKETS - 1);
    fpsHistogram[bucketIdx]++;

    // Evenly-spaced sampling: keep MAX_RENDER_FRAMES samples
    if (n === nextSampleAt) {
      sampledFrameTimes.push(frameTime);
      if (sampledFrameTimes.length >= MAX_RENDER_FRAMES) {
        // Compact: keep every other sample and double the step
        for (let i = 0; i < sampledFrameTimes.length / 2; i++) {
          sampledFrameTimes[i] = sampledFrameTimes[i * 2];
        }
        sampledFrameTimes.length = Math.floor(sampledFrameTimes.length / 2);
        sampleStep *= 2;
      }
      nextSampleAt += sampleStep;
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    const chunk = decoder.decode(value, { stream: true });
    const combined = leftover + chunk;
    const lines = combined.split('\n');
    leftover = lines.pop() ?? '';
    for (const line of lines) {
      processLine(line.trim());
      yieldCounter++;
    }
    onProgress?.(n, bytesRead, file.size);
    if (yieldCounter >= YIELD_INTERVAL) {
      await yieldToMain();
      yieldCounter = 0;
    }
  }
  if (leftover.trim()) processLine(leftover.trim());

  if (n === 0) throw new Error('No valid frame time data found in CSV');

  const avgFt = wMean;
  const variance = n > 1 ? wM2 / n : 0;
  const stdDev = Math.sqrt(Math.max(0, variance));

  // Compute deviation-based metrics from the sampled frames (close approximation)
  // and scale to total frame count
  for (const frameTime of sampledFrameTimes) {
    deviationSum += Math.abs(frameTime - avgFt) / avgFt;
    if (frameTime > avgFt * 1.5) stutterCount++;
    if (stdDev > 0) {
      const zscore = Math.abs(frameTime - avgFt) / stdDev;
      if (zscore > 3) highCount++;
      else if (zscore > 2) medCount++;
    }
  }

  // Scale counts from sample to total population
  const sampleSize = sampledFrameTimes.length;
  if (sampleSize > 0 && sampleSize < n) {
    const scaleFactor = n / sampleSize;
    stutterCount = Math.round(stutterCount * scaleFactor);
    highCount = Math.round(highCount * scaleFactor);
    medCount = Math.round(medCount * scaleFactor);
    deviationSum = deviationSum * scaleFactor;
  }

  const avgDeviation = n > 0 ? deviationSum / n : 0;
  const truncated = n > MAX_RENDER_FRAMES;

  const frameObjects: FrameDataPoint[] = sampledFrameTimes.map((frameTime, i) => ({
    frame: Math.round((i / sampledFrameTimes.length) * n) + 1,
    frameTime,
    fps: 1000 / frameTime,
  }));

  const dataset: DriverDataset = {
    label,
    fileName: file.name,
    frames: frameObjects,
    metadata,
    truncated,
    totalFrameCount: n,
  };

  const { metrics, analysis } = computeMetricsFromAccumulator({
    n, sum: avgFt * n, sumSq: (variance + avgFt * avgFt) * n, minFt, maxFt,
    fpsHistogram, fpsHistBuckets: FPS_HIST_BUCKETS, fpsBucketWidth: FPS_BUCKET_WIDTH,
    stutterCount, avgDeviation, variance, highCount, medCount, avgFt, stdDev,
  });

  return { dataset, metrics, analysis };
}

export async function parseCSVText(
  csvText: string,
  label: string,
  fileName: string,
  onProgress?: (framesProcessed: number) => void
): Promise<ParseResult> {
  const newlineIdx = csvText.indexOf('\n');
  if (newlineIdx === -1) {
    throw new Error('CSV file must contain a header row and at least one data row');
  }

  const headerLine = csvText.slice(0, newlineIdx).trim();
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
  const frameTimeIndex = headers.findIndex(h => FRAME_TIME_HEADERS.includes(h));

  if (frameTimeIndex === -1) {
    throw new Error('CSV must contain a "FrameTime" or "MsBetweenPresents" column');
  }

  const bodyStart = newlineIdx + 1;
  const firstNewline = csvText.indexOf('\n', bodyStart);
  const firstDataCols = csvText.slice(bodyStart, firstNewline === -1 ? undefined : firstNewline).split(',');
  const metadata = detectFrameViewMetadata(headers, firstDataCols);

  const fpsHistogram = new Int32Array(FPS_HIST_BUCKETS);

  let n = 0;
  let minFt = Infinity;
  let maxFt = -Infinity;
  let stutterCount = 0;
  let deviationSum = 0;
  let highCount = 0;
  let medCount = 0;

  // Welford's online algorithm
  let wMean = 0;
  let wM2 = 0;

  // Evenly-spaced reservoir sampling
  const sampledFrameTimes: number[] = [];
  let sampleStep = 1;
  let nextSampleAt = 1;

  let pos = bodyStart;
  const len = csvText.length;
  let rowIndex = 0;

  while (pos < len) {
    let lineEnd = csvText.indexOf('\n', pos);
    if (lineEnd === -1) lineEnd = len;

    const line = csvText.slice(pos, lineEnd).trim();
    pos = lineEnd + 1;

    if (line === '') continue;

    const cols = line.split(',');
    const raw = (cols[frameTimeIndex] ?? '').trim();
    if (raw === '' || raw.toUpperCase() === 'NA') continue;

    const frameTime = parseFloat(raw);
    if (isNaN(frameTime) || frameTime <= 0) continue;

    n++;

    // Welford's online mean + variance
    const delta = frameTime - wMean;
    wMean += delta / n;
    const delta2 = frameTime - wMean;
    wM2 += delta * delta2;

    if (frameTime < minFt) minFt = frameTime;
    if (frameTime > maxFt) maxFt = frameTime;

    const fps = 1000 / frameTime;
    const bucketIdx = Math.min(Math.floor(fps / FPS_BUCKET_WIDTH), FPS_HIST_BUCKETS - 1);
    fpsHistogram[bucketIdx]++;

    // Evenly-spaced sampling
    if (n === nextSampleAt) {
      sampledFrameTimes.push(frameTime);
      if (sampledFrameTimes.length >= MAX_RENDER_FRAMES) {
        for (let i = 0; i < sampledFrameTimes.length / 2; i++) {
          sampledFrameTimes[i] = sampledFrameTimes[i * 2];
        }
        sampledFrameTimes.length = Math.floor(sampledFrameTimes.length / 2);
        sampleStep *= 2;
      }
      nextSampleAt += sampleStep;
    }

    rowIndex++;
    if (rowIndex % YIELD_INTERVAL === 0) {
      onProgress?.(n);
      await yieldToMain();
    }
  }

  if (n === 0) {
    throw new Error('No valid frame time data found in CSV');
  }

  const avgFt = wMean;
  const variance = n > 1 ? wM2 / n : 0;
  const stdDev = Math.sqrt(Math.max(0, variance));

  // Compute deviation-based metrics from sampled frames
  for (const frameTime of sampledFrameTimes) {
    deviationSum += Math.abs(frameTime - avgFt) / avgFt;
    if (frameTime > avgFt * 1.5) stutterCount++;
    if (stdDev > 0) {
      const zscore = Math.abs(frameTime - avgFt) / stdDev;
      if (zscore > 3) highCount++;
      else if (zscore > 2) medCount++;
    }
  }

  // Scale from sample to population
  const sampleSize = sampledFrameTimes.length;
  if (sampleSize > 0 && sampleSize < n) {
    const scaleFactor = n / sampleSize;
    stutterCount = Math.round(stutterCount * scaleFactor);
    highCount = Math.round(highCount * scaleFactor);
    medCount = Math.round(medCount * scaleFactor);
    deviationSum = deviationSum * scaleFactor;
  }

  const avgDeviation = deviationSum / n;
  const truncated = n > MAX_RENDER_FRAMES;

  const frames: FrameDataPoint[] = sampledFrameTimes.map((frameTime, i) => ({
    frame: Math.round((i / sampledFrameTimes.length) * n) + 1,
    frameTime,
    fps: 1000 / frameTime,
  }));

  const dataset: DriverDataset = {
    label,
    fileName,
    frames,
    metadata,
    truncated,
    totalFrameCount: n,
  };

  const { metrics, analysis } = computeMetricsFromAccumulator({
    n,
    sum: avgFt * n,
    sumSq: (variance + avgFt * avgFt) * n,
    minFt,
    maxFt,
    fpsHistogram,
    fpsHistBuckets: FPS_HIST_BUCKETS,
    fpsBucketWidth: FPS_BUCKET_WIDTH,
    stutterCount,
    avgDeviation,
    variance,
    highCount,
    medCount,
    avgFt,
    stdDev,
  });

  return { dataset, metrics, analysis };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
