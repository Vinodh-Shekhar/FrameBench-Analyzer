import { Cpu, Activity } from 'lucide-react';
import DualFanGpu from './DualFanGpu';

export default function Header() {
  return (
    <header className="relative overflow-hidden border-b border-nvidia-border bg-nvidia-panel">
      <div className="absolute inset-0 bg-gradient-to-r from-nvidia-green/5 via-transparent to-nvidia-accent/5" />
      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-nvidia-green/10 ring-1 ring-nvidia-green/30">
                <DualFanGpu size="lg" spinning />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-nvidia-accent shadow-[0_0_8px_rgba(0,255,156,0.6)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-nvidia-text sm:text-2xl">
                NeuralDriver{' '}
                <span className="text-nvidia-green">Performance Analyzer</span>
              </h1>
              <p className="mt-0.5 text-xs tracking-wide text-nvidia-muted sm:text-sm">
                AI-Assisted GPU Driver Validation Dashboard
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 sm:flex">
            <StatusIndicator icon={<Cpu className="h-4 w-4" />} label="GPU" status="active" />
            <StatusIndicator icon={<Activity className="h-4 w-4" />} label="Telemetry" status="active" />
            <div className="flex items-center gap-2 rounded-md bg-nvidia-bg/60 px-3 py-1.5 ring-1 ring-nvidia-border">
              <div className="h-2 w-2 rounded-full bg-nvidia-green animate-pulse-glow" />
              <span className="font-mono text-xs text-nvidia-green">SYSTEM READY</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatusIndicator({
  icon,
  label,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  status: 'active' | 'idle' | 'error';
}) {
  const colorMap = {
    active: 'text-nvidia-green',
    idle: 'text-nvidia-muted',
    error: 'text-nvidia-danger',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={colorMap[status]}>{icon}</span>
      <span className="font-mono text-xs text-nvidia-muted">{label}</span>
    </div>
  );
}
