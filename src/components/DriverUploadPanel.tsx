import { useCallback, useRef, useState } from 'react';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Cpu, Monitor } from 'lucide-react';
import type { DriverDataset, UploadStatus } from '../types/telemetry';
import { MAX_FILE_SIZE } from '../lib/csvParser';

interface Props {
  label: string;
  driverKey: 'A' | 'B';
  status: UploadStatus;
  dataset: DriverDataset | null;
  progress: { frames: number; bytes: number; total: number } | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export default function DriverUploadPanel({
  label,
  driverKey,
  status,
  dataset,
  progress,
  onFileSelect,
  onClear,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setSizeError(null);
      if (file.size > MAX_FILE_SIZE) {
        setSizeError(`File is ${(file.size / 1024 / 1024).toFixed(0)}MB — max ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.csv')) {
        validateAndSelect(file);
      }
    },
    [validateAndSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const accentTextClass = driverKey === 'A' ? 'text-nvidia-green' : 'text-nvidia-accent';
  const accentTextDimClass = driverKey === 'A' ? 'text-nvidia-green/60' : 'text-nvidia-accent/60';
  const accentBarClass = driverKey === 'A' ? 'bg-nvidia-green' : 'bg-nvidia-accent';
  const meta = dataset?.metadata;

  const pct = progress && progress.total > 0
    ? Math.min(100, Math.round((progress.bytes / progress.total) * 100))
    : 0;

  return (
    <div className="group rounded-lg border border-nvidia-border bg-nvidia-panel p-4 transition-all hover:border-nvidia-green/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
              driverKey === 'A'
                ? 'bg-nvidia-green/20 text-nvidia-green'
                : 'bg-nvidia-accent/20 text-nvidia-accent'
            }`}
          >
            {driverKey}
          </div>
          <span className="font-mono text-sm font-medium text-nvidia-text">{label}</span>
          {meta && (
            <span className="rounded bg-nvidia-green/10 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider text-nvidia-green">
              FrameView
            </span>
          )}
        </div>
        {dataset && (
          <button
            onClick={onClear}
            className="rounded p-1 text-nvidia-muted transition-colors hover:bg-nvidia-bg hover:text-nvidia-danger"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {status === 'ready' && dataset ? (
        <div className="animate-fade-in space-y-2">
          <div className="flex items-center gap-2 rounded-md bg-nvidia-bg/60 px-3 py-2 ring-1 ring-nvidia-border">
            <FileText className={`h-4 w-4 shrink-0 ${accentTextClass}`} />
            <span className="truncate font-mono text-xs text-nvidia-text">
              {dataset.fileName}
            </span>
            <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-nvidia-green" />
          </div>
          {meta && (meta.gpu || meta.cpu) && (
            <div className="space-y-1">
              {meta.gpu && (
                <div className="flex items-center gap-1.5 rounded bg-nvidia-bg/40 px-2 py-1 ring-1 ring-nvidia-border/50">
                  <Monitor className="h-3 w-3 shrink-0 text-nvidia-green/70" />
                  <span className="truncate font-mono text-[10px] text-nvidia-muted">
                    {meta.gpu}
                  </span>
                  {meta.resolution && (
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-nvidia-muted/60">
                      {meta.resolution}
                    </span>
                  )}
                </div>
              )}
              {meta.cpu && (
                <div className="flex items-center gap-1.5 rounded bg-nvidia-bg/40 px-2 py-1 ring-1 ring-nvidia-border/50">
                  <Cpu className="h-3 w-3 shrink-0 text-nvidia-accent/70" />
                  <span className="truncate font-mono text-[10px] text-nvidia-muted">
                    {meta.cpu}
                  </span>
                </div>
              )}
              {meta.application && (
                <div className="font-mono text-[10px] text-nvidia-muted/60 px-2">
                  App: {meta.application}
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="Frames" value={dataset.totalFrameCount.toLocaleString()} />
            <MiniStat
              label="Avg FPS"
              value={(
                dataset.frames.reduce((s, f) => s + f.fps, 0) / dataset.frames.length
              ).toFixed(1)}
            />
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => status !== 'processing' && status !== 'uploading' && inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-6 transition-all ${
            status === 'error' || sizeError
              ? 'border-nvidia-danger/50 bg-nvidia-danger/5'
              : status === 'processing' || status === 'uploading'
              ? 'cursor-default border-nvidia-border bg-nvidia-bg/30'
              : 'border-nvidia-border bg-nvidia-bg/30 hover:border-nvidia-green/40 hover:bg-nvidia-green/5'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) validateAndSelect(file);
            }}
          />
          {status === 'processing' || status === 'uploading' ? (
            <div className="w-full space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-nvidia-green/30 border-t-nvidia-green" />
                <span className="font-mono text-xs text-nvidia-muted">Analysing telemetry...</span>
              </div>
              {progress && (
                <div className="space-y-1.5">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-nvidia-border">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${accentBarClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-nvidia-muted">
                      {progress.frames > 0 ? `${progress.frames.toLocaleString()} frames` : 'Reading file...'}
                    </span>
                    <span className="font-mono text-[10px] text-nvidia-muted">
                      {pct}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : status === 'error' || sizeError ? (
            <>
              <AlertCircle className="mb-2 h-6 w-6 text-nvidia-danger" />
              <span className="font-mono text-xs text-nvidia-danger">
                {sizeError ?? 'Invalid CSV format'}
              </span>
              <span className="mt-1 font-mono text-[10px] text-nvidia-muted">Click to retry</span>
            </>
          ) : (
            <>
              <Upload className={`mb-2 h-6 w-6 ${accentTextDimClass}`} />
              <span className="font-mono text-xs text-nvidia-muted">
                Drop CSV or click to upload
              </span>
              <span className="mt-1 font-mono text-[10px] text-nvidia-muted/60">
                FrameView, PresentMon, or custom CSV
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-nvidia-bg/40 px-2 py-1.5 ring-1 ring-nvidia-border/50">
      <div className="font-mono text-[10px] uppercase tracking-wider text-nvidia-muted">
        {label}
      </div>
      <div className="font-mono text-sm font-medium text-nvidia-text">{value}</div>
    </div>
  );
}
