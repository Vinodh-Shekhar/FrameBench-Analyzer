import { useState, useCallback } from 'react';
import Header from './components/Header';
import DriverUploadPanel from './components/DriverUploadPanel';
import GpuStatusWidget from './components/GpuStatusWidget';
import GpuTelemetryChart from './components/GpuTelemetryChart';
import DemoCTA from './components/DemoCTA';
import MetricsPanel from './components/MetricsPanel';
import { SingleFrameTimeChart, ComparisonChart } from './components/FrameTimeChart';
import FrameTimeDistribution from './components/FrameTimeDistribution';
import QAAnalysisPanel from './components/QAAnalysisPanel';
import RegressionPanel from './components/RegressionPanel';
import TelemetryWidgets from './components/TelemetryWidgets';
import { parseCSVFile, MAX_RENDER_FRAMES } from './lib/csvParser';
import { detectRegression } from './lib/analysis';
import { generateSampleDatasets } from './lib/sampleData';
import { generateReport, buildReportHtml } from './lib/reportGenerator';
import { supabase } from './lib/supabase';
import { Download } from 'lucide-react';
import type {
  DriverDataset,
  PerformanceMetrics,
  QAAnalysis,
  RegressionResult,
  UploadStatus,
} from './types/telemetry';

export default function App() {
  const [statusA, setStatusA] = useState<UploadStatus>('idle');
  const [statusB, setStatusB] = useState<UploadStatus>('idle');
  const [datasetA, setDatasetA] = useState<DriverDataset | null>(null);
  const [datasetB, setDatasetB] = useState<DriverDataset | null>(null);
  const [metricsA, setMetricsA] = useState<PerformanceMetrics | null>(null);
  const [metricsB, setMetricsB] = useState<PerformanceMetrics | null>(null);
  const [analysisA, setAnalysisA] = useState<QAAnalysis | null>(null);
  const [analysisB, setAnalysisB] = useState<QAAnalysis | null>(null);
  const [regression, setRegression] = useState<RegressionResult | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progressA, setProgressA] = useState<{ frames: number; bytes: number; total: number } | null>(null);
  const [progressB, setProgressB] = useState<{ frames: number; bytes: number; total: number } | null>(null);

  const processDriver = useCallback(
    async (
      file: File,
      driver: 'A' | 'B',
      setStatus: (s: UploadStatus) => void,
      setDataset: (d: DriverDataset | null) => void,
      setMetrics: (m: PerformanceMetrics | null) => void,
      setAnalysis: (a: QAAnalysis | null) => void,
      setProgress: (p: { frames: number; bytes: number; total: number } | null) => void
    ) => {
      try {
        setStatus('processing');
        setProgress({ frames: 0, bytes: 0, total: file.size });

        const { dataset, metrics, analysis } = await parseCSVFile(
          file,
          `Dataset ${driver}`,
          (frames, bytes, total) => {
            setProgress({ frames, bytes, total });
          }
        );

        setProgress(null);
        setDataset(dataset);
        setMetrics(metrics);
        setAnalysis(analysis);

        const meta = dataset.metadata;
        const metaFields = meta
          ? {
              gpu_name: meta.gpu,
              cpu_name: meta.cpu,
              resolution: meta.resolution,
              application: meta.application,
              csv_source: meta.source,
            }
          : {};

        let currentSessionId = sessionId;
        if (!currentSessionId) {
          const { data } = await supabase
            .from('telemetry_sessions')
            .insert({
              session_name: `Session ${new Date().toISOString()}`,
              driver_a_name: driver === 'A' ? file.name : '',
              driver_b_name: driver === 'B' ? file.name : '',
              ...metaFields,
            })
            .select('id')
            .maybeSingle();
          if (data) {
            currentSessionId = data.id;
            setSessionId(data.id);
          }
        } else {
          const updateField =
            driver === 'A' ? { driver_a_name: file.name } : { driver_b_name: file.name };
          await supabase
            .from('telemetry_sessions')
            .update({ ...updateField, ...metaFields })
            .eq('id', currentSessionId);
        }

        if (currentSessionId) {
          const DB_FRAME_CAP = 10_000;
          const batchSize = 500;
          const totalFrames = dataset.frames.length;
          const step = totalFrames > DB_FRAME_CAP ? totalFrames / DB_FRAME_CAP : 1;
          const count = Math.min(totalFrames, DB_FRAME_CAP);

          for (let batchStart = 0; batchStart < count; batchStart += batchSize) {
            const batchEnd = Math.min(batchStart + batchSize, count);
            const batch = [];
            for (let i = batchStart; i < batchEnd; i++) {
              const f = dataset.frames[Math.floor(i * step)];
              batch.push({
                session_id: currentSessionId,
                driver_label: driver,
                frame_number: f.frame,
                frame_time: f.frameTime,
              });
            }
            await supabase.from('frame_data').insert(batch);
          }
        }

        setStatus('ready');

        return { metrics, analysis };
      } catch {
        setProgress(null);
        setStatus('error');
        return null;
      }
    },
    [sessionId]
  );

  const handleFileA = useCallback(
    async (file: File) => {
      const result = await processDriver(
        file,
        'A',
        setStatusA,
        setDatasetA,
        setMetricsA,
        setAnalysisA,
        setProgressA
      );
      if (result && metricsB) {
        const reg = detectRegression(result.metrics, metricsB);
        setRegression(reg);
        if (reg.isRegressed && typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
          const { invoke } = await import('@tauri-apps/api/core');
          invoke('show_notification', { title: 'Regression Detected', body: reg.summary }).catch(() => {});
        }
      }
    },
    [processDriver, metricsB]
  );

  const handleFileB = useCallback(
    async (file: File) => {
      const result = await processDriver(
        file,
        'B',
        setStatusB,
        setDatasetB,
        setMetricsB,
        setAnalysisB,
        setProgressB
      );
      if (result && metricsA) {
        const reg = detectRegression(metricsA, result.metrics);
        setRegression(reg);
        if (reg.isRegressed && typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
          const { invoke } = await import('@tauri-apps/api/core');
          invoke('show_notification', { title: 'Regression Detected', body: reg.summary }).catch(() => {});
        }
      }
    },
    [processDriver, metricsA]
  );

  const clearA = useCallback(() => {
    setDatasetA(null);
    setMetricsA(null);
    setAnalysisA(null);
    setStatusA('idle');
    setProgressA(null);
    setRegression(null);
  }, []);

  const clearB = useCallback(() => {
    setDatasetB(null);
    setMetricsB(null);
    setAnalysisB(null);
    setStatusB('idle');
    setProgressB(null);
    setRegression(null);
  }, []);

  const handleGenerateSample = useCallback(() => {
    const { datasetA: sampleA, datasetB: sampleB, metricsA: mA, metricsB: mB, analysisA: aA, analysisB: aB } = generateSampleDatasets();

    setDatasetA(sampleA);
    setDatasetB(sampleB);
    setStatusA('ready');
    setStatusB('ready');

    setMetricsA(mA);
    setMetricsB(mB);
    setAnalysisA(aA);
    setAnalysisB(aB);
    setRegression(detectRegression(mA, mB));
  }, []);

  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  const handleDownloadReport = useCallback(async () => {
    const reportInput = { datasetA, datasetB, metricsA, metricsB, analysisA, analysisB, regression };
    if (isTauri) {
      const { invoke } = await import('@tauri-apps/api/core');
      const html = buildReportHtml(reportInput);
      await invoke<string>('save_report', { html }).catch((e: unknown) => {
        if (e !== 'Cancelled') console.error('Save report failed:', e);
      });
    } else {
      generateReport(reportInput);
    }
  }, [datasetA, datasetB, metricsA, metricsB, analysisA, analysisB, regression, isTauri]);

  const hasData = !!datasetA || !!datasetB;

  return (
    <div className="min-h-screen bg-nvidia-bg">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <DriverUploadPanel
              label="Dataset A"
              driverKey="A"
              status={statusA}
              dataset={datasetA}
              progress={progressA}
              onFileSelect={handleFileA}
              onClear={clearA}
            />
            <DriverUploadPanel
              label="Dataset B"
              driverKey="B"
              status={statusB}
              dataset={datasetB}
              progress={progressB}
              onFileSelect={handleFileB}
              onClear={clearB}
            />
            <GpuStatusWidget hasData={hasData} />
          </div>

          {isTauri && <GpuTelemetryChart />}

          {!hasData && <DemoCTA onGenerate={handleGenerateSample} />}

          {((datasetA?.truncated) || (datasetB?.truncated)) && (
            <div className="rounded-lg border border-nvidia-warning/30 bg-nvidia-warning/5 px-4 py-3 flex items-start gap-3">
              <div className="h-2 w-2 mt-1.5 shrink-0 rounded-full bg-nvidia-warning" />
              <p className="font-mono text-xs text-nvidia-warning leading-relaxed">
                Large dataset detected. Statistics are computed from all {
                  Math.max(
                    datasetA?.totalFrameCount ?? 0,
                    datasetB?.totalFrameCount ?? 0
                  ).toLocaleString()
                } frames. Chart rendering uses a representative sample of up to {MAX_RENDER_FRAMES.toLocaleString()} frames.
              </p>
            </div>
          )}

          {hasData && (
            <TelemetryWidgets
              metricsA={metricsA}
              metricsB={metricsB}
              analysisA={analysisA}
              analysisB={analysisB}
            />
          )}

          {hasData && (
            <div className="grid gap-4 lg:grid-cols-2">
              <MetricsPanel driverKey="A" metrics={metricsA} />
              <MetricsPanel driverKey="B" metrics={metricsB} />
            </div>
          )}

          {regression && <RegressionPanel result={regression} />}

          {(datasetA || datasetB) && (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                {datasetA && (
                  <SingleFrameTimeChart driverKey="A" data={datasetA.frames} />
                )}
                {datasetB && (
                  <SingleFrameTimeChart driverKey="B" data={datasetB.frames} />
                )}
              </div>
              {datasetA && datasetB && (
                <ComparisonChart dataA={datasetA.frames} dataB={datasetB.frames} />
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                {datasetA && (
                  <FrameTimeDistribution driverKey="A" data={datasetA.frames} />
                )}
                {datasetB && (
                  <FrameTimeDistribution driverKey="B" data={datasetB.frames} />
                )}
              </div>
            </div>
          )}

          {hasData && (
            <QAAnalysisPanel analysisA={analysisA} analysisB={analysisB} />
          )}

          <footer className="border-t border-nvidia-border pt-4 pb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-nvidia-muted">
                  FrameBench Analyzer v1.0.0
                </span>
                <span className="text-[10px] text-gray-600">
                  Prototype by Vinodh Shekhar
                </span>
              </div>
              <div className="flex items-center gap-3">
                {hasData && (
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-1.5 rounded border border-nvidia-green/40 bg-nvidia-green/10 px-3 py-1.5 font-mono text-[11px] text-nvidia-green transition-all hover:bg-nvidia-green/20 hover:border-nvidia-green/60 active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Report
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-nvidia-green animate-pulse-glow" />
                  <span className="font-mono text-[10px] text-nvidia-muted">
                    AI Engine Active
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
