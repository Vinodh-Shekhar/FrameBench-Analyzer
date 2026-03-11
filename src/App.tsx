import { useState, useCallback } from 'react';
import Header from './components/Header';
import DriverUploadPanel from './components/DriverUploadPanel';
import GpuStatusWidget from './components/GpuStatusWidget';
import MetricsPanel from './components/MetricsPanel';
import { SingleFrameTimeChart, ComparisonChart } from './components/FrameTimeChart';
import FrameTimeDistribution from './components/FrameTimeDistribution';
import QAAnalysisPanel from './components/QAAnalysisPanel';
import RegressionPanel from './components/RegressionPanel';
import TelemetryWidgets from './components/TelemetryWidgets';
import { parseCSV, readFileAsText } from './lib/csvParser';
import { calculateMetrics, runQAAnalysis, detectRegression } from './lib/analysis';
import { supabase } from './lib/supabase';
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

  const processDriver = useCallback(
    async (
      file: File,
      driver: 'A' | 'B',
      setStatus: (s: UploadStatus) => void,
      setDataset: (d: DriverDataset | null) => void,
      setMetrics: (m: PerformanceMetrics | null) => void,
      setAnalysis: (a: QAAnalysis | null) => void
    ) => {
      try {
        setStatus('processing');
        const text = await readFileAsText(file);
        const dataset = parseCSV(text, `Driver ${driver}`, file.name);
        setDataset(dataset);

        const metrics = calculateMetrics(dataset.rawFrameTimes);
        setMetrics(metrics);

        const analysis = runQAAnalysis(dataset.rawFrameTimes);
        setAnalysis(analysis);

        let currentSessionId = sessionId;
        if (!currentSessionId) {
          const { data } = await supabase
            .from('telemetry_sessions')
            .insert({
              session_name: `Session ${new Date().toISOString()}`,
              driver_a_name: driver === 'A' ? file.name : '',
              driver_b_name: driver === 'B' ? file.name : '',
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
            .update(updateField)
            .eq('id', currentSessionId);
        }

        if (currentSessionId) {
          const batchSize = 500;
          const rows = dataset.frames.map((f) => ({
            session_id: currentSessionId,
            driver_label: driver,
            frame_number: f.frame,
            frame_time: f.frameTime,
          }));

          for (let i = 0; i < rows.length; i += batchSize) {
            await supabase.from('frame_data').insert(rows.slice(i, i + batchSize));
          }
        }

        setStatus('ready');

        return { metrics, analysis };
      } catch {
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
        setAnalysisA
      );
      if (result && metricsB) {
        setRegression(detectRegression(result.metrics, metricsB));
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
        setAnalysisB
      );
      if (result && metricsA) {
        setRegression(detectRegression(metricsA, result.metrics));
      }
    },
    [processDriver, metricsA]
  );

  const clearA = useCallback(() => {
    setDatasetA(null);
    setMetricsA(null);
    setAnalysisA(null);
    setStatusA('idle');
    setRegression(null);
  }, []);

  const clearB = useCallback(() => {
    setDatasetB(null);
    setMetricsB(null);
    setAnalysisB(null);
    setStatusB('idle');
    setRegression(null);
  }, []);

  const hasData = !!datasetA || !!datasetB;

  return (
    <div className="min-h-screen bg-nvidia-bg">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Top Row: Upload + GPU Status */}
          <div className="grid gap-4 lg:grid-cols-3">
            <DriverUploadPanel
              label="Driver A Dataset"
              driverKey="A"
              status={statusA}
              dataset={datasetA}
              onFileSelect={handleFileA}
              onClear={clearA}
            />
            <DriverUploadPanel
              label="Driver B Dataset"
              driverKey="B"
              status={statusB}
              dataset={datasetB}
              onFileSelect={handleFileB}
              onClear={clearB}
            />
            <GpuStatusWidget hasData={hasData} />
          </div>

          {/* Telemetry Score Widgets */}
          {hasData && (
            <TelemetryWidgets
              metricsA={metricsA}
              metricsB={metricsB}
              analysisA={analysisA}
              analysisB={analysisB}
            />
          )}

          {/* Middle Row: Performance Metrics */}
          {hasData && (
            <div className="grid gap-4 lg:grid-cols-2">
              <MetricsPanel driverKey="A" metrics={metricsA} />
              <MetricsPanel driverKey="B" metrics={metricsB} />
            </div>
          )}

          {/* Regression Detection */}
          {regression && <RegressionPanel result={regression} />}

          {/* Lower Row: Frame Time Charts */}
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

          {/* Bottom Row: AI QA Analysis */}
          {hasData && (
            <QAAnalysisPanel analysisA={analysisA} analysisB={analysisB} />
          )}

          {/* Footer */}
          <footer className="border-t border-nvidia-border pt-4 pb-8">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-nvidia-muted">
                NeuralDriver QA Inspector v1.0.0
              </span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-nvidia-green animate-pulse-glow" />
                <span className="font-mono text-[10px] text-nvidia-muted">
                  AI Engine Active
                </span>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
