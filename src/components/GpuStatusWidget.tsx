import { Fan, Thermometer, Zap, MemoryStick, Activity, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';
import DualFanGpu from './DualFanGpu';

interface Props {
  hasData: boolean;
}

interface GpuStats {
  name: string;
  temperature: number;
  power_draw: number;
  vram_used_mb: number;
  vram_total_mb: number;
  fan_percent: number;
  gpu_utilization: number;
  core_clock_mhz: number;
  mem_clock_mhz: number;
  pstate: string;
  available: boolean;
}

const colorStyles: Record<string, { text: string; bg: string }> = {
  green: { text: 'text-nvidia-green', bg: 'bg-nvidia-green' },
  accent: { text: 'text-nvidia-accent', bg: 'bg-nvidia-accent' },
};

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export default function GpuStatusWidget({ hasData }: Props) {
  const [gpuStats, setGpuStats] = useState<GpuStats | null>(null);

  useEffect(() => {
    if (!isTauri) return;

    let cancelled = false;

    const fetchStats = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const stats = await invoke<GpuStats>('get_gpu_stats');
        if (!cancelled) setGpuStats(stats);
      } catch {
        // GPU stats unavailable — fall back to mock display
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Derive display values: prefer real stats if available, otherwise use mock when hasData
  const useReal = isTauri && gpuStats?.available;

  const tempVal = useReal
    ? `${Math.round(gpuStats!.temperature)}°C`
    : hasData ? '67°C' : '--';
  const tempBar = useReal
    ? Math.min(100, gpuStats!.temperature)
    : hasData ? 67 : 0;

  const powerVal = useReal
    ? `${Math.round(gpuStats!.power_draw)}W`
    : hasData ? '245W' : '--';
  const powerMax = 400; // reasonable ceiling for bar scaling
  const powerBar = useReal
    ? Math.min(100, Math.round((gpuStats!.power_draw / powerMax) * 100))
    : hasData ? 78 : 0;

  const vramVal = useReal
    ? `${(gpuStats!.vram_used_mb / 1024).toFixed(1)} GB`
    : hasData ? '8.2 GB' : '--';
  const vramBar = useReal && gpuStats!.vram_total_mb > 0
    ? Math.min(100, Math.round((gpuStats!.vram_used_mb / gpuStats!.vram_total_mb) * 100))
    : hasData ? 68 : 0;

  const fanVal = useReal
    ? `${gpuStats!.fan_percent}%`
    : hasData ? '55%' : '--';
  const fanBar = useReal
    ? Math.min(100, gpuStats!.fan_percent)
    : hasData ? 55 : 0;

  const utilVal = useReal ? `${gpuStats!.gpu_utilization}%` : hasData ? '72%' : '--';
  const utilBar = useReal ? gpuStats!.gpu_utilization : hasData ? 72 : 0;

  const coreClkVal = useReal ? `${gpuStats!.core_clock_mhz} MHz` : hasData ? '2520 MHz' : '--';
  const coreClkBar = useReal
    ? Math.min(100, Math.round((gpuStats!.core_clock_mhz / 3000) * 100))
    : hasData ? 84 : 0;

  const memClkVal = useReal ? `${gpuStats!.mem_clock_mhz} MHz` : hasData ? '10251 MHz' : '--';
  const memClkBar = useReal
    ? Math.min(100, Math.round((gpuStats!.mem_clock_mhz / 12000) * 100))
    : hasData ? 85 : 0;

  const pstateVal = useReal && gpuStats!.pstate && gpuStats!.pstate !== '[N/A]'
    ? gpuStats!.pstate
    : null;

  const gpuName = useReal ? gpuStats!.name : null;

  return (
    <div className="rounded-lg border border-nvidia-border bg-nvidia-panel p-4">
      <div className="mb-3 flex items-center gap-2">
        <DualFanGpu size="sm" spinning />
        <div className="flex flex-col min-w-0">
          <span className="font-mono text-sm font-medium text-nvidia-text">GPU Status</span>
          {gpuName && (
            <span className="font-mono text-[9px] text-nvidia-muted truncate" title={gpuName}>
              {gpuName}
            </span>
          )}
        </div>
        <div
          className={`ml-auto h-2 w-2 rounded-full ${
            hasData ? 'bg-nvidia-green animate-pulse-glow' : 'bg-nvidia-muted'
          }`}
        />
      </div>

      <div className="space-y-2.5">
        <GpuStat
          icon={<Thermometer className="h-3.5 w-3.5" />}
          label="Core Temp"
          value={tempVal}
          bar={tempBar}
          color="green"
        />
        <GpuStat
          icon={<Zap className="h-3.5 w-3.5" />}
          label="Power"
          value={powerVal}
          bar={powerBar}
          color="accent"
        />
        <GpuStat
          icon={<MemoryStick className="h-3.5 w-3.5" />}
          label="VRAM"
          value={vramVal}
          bar={vramBar}
          color="green"
        />
        <GpuStat
          icon={<Fan className="h-3.5 w-3.5" />}
          label="Fan"
          value={fanVal}
          bar={fanBar}
          color="accent"
        />
        <GpuStat
          icon={<Activity className="h-3.5 w-3.5" />}
          label="GPU Util"
          value={utilVal}
          bar={utilBar}
          color="green"
        />
        <GpuStat
          icon={<Cpu className="h-3.5 w-3.5" />}
          label="Core Clk"
          value={coreClkVal}
          bar={coreClkBar}
          color="accent"
        />
        <GpuStat
          icon={<Cpu className="h-3.5 w-3.5" />}
          label="Mem Clk"
          value={memClkVal}
          bar={memClkBar}
          color="green"
        />
      </div>

      <div className="mt-3 rounded bg-nvidia-bg/40 px-2.5 py-2 ring-1 ring-nvidia-border/50">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-nvidia-muted">
            Driver Status
          </span>
          <div className="flex items-center gap-2">
            {pstateVal && (
              <span className="font-mono text-[10px] font-bold text-nvidia-accent">
                {pstateVal}
              </span>
            )}
            <span
              className={`font-mono text-[10px] font-bold ${
                hasData ? 'text-nvidia-green' : 'text-nvidia-muted'
              }`}
            >
              {hasData ? 'MONITORING' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GpuStat({
  icon,
  label,
  value,
  bar,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bar: number;
  color: string;
}) {
  const styles = colorStyles[color] ?? colorStyles.green;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={styles.text}>{icon}</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-nvidia-muted">
            {label}
          </span>
        </div>
        <span className="font-mono text-xs font-medium text-nvidia-text">{value}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-nvidia-bg">
        <div
          className={`h-full rounded-full ${styles.bg} transition-all duration-700`}
          style={{ width: `${bar}%` }}
        />
      </div>
    </div>
  );
}
