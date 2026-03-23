import DualFanGpu from './DualFanGpu';

export default function Header() {
  return (
    <header className="relative overflow-hidden border-b border-nvidia-border bg-nvidia-panel">
      <div className="absolute inset-0 bg-gradient-to-r from-nvidia-green/5 via-transparent to-nvidia-accent/5" />
      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-nvidia-green/10 ring-1 ring-nvidia-green/30">
              <DualFanGpu size="lg" spinning />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-nvidia-accent shadow-[0_0_8px_rgba(0,255,156,0.6)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-nvidia-text sm:text-2xl">
              FrameBench{' '}
              <span className="text-nvidia-green">Analyzer</span>
            </h1>
            <p className="mt-0.5 text-xs tracking-wide text-nvidia-muted sm:text-sm">
              Performance Benchmarking &amp; Telemetry Analysis
            </p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-nvidia-green/40 bg-nvidia-green/10 px-3 py-1 font-mono text-[11px] font-semibold text-nvidia-green shadow-[0_0_12px_rgba(118,185,0,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-nvidia-green animate-pulse-glow" />
              Alpha v1.0
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
