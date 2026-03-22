import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface GpuSnapshot {
  timestamp_secs: number;
  temperature: number;
  power_draw: number;
  core_clock_mhz: number;
  gpu_utilization: number;
}

interface ChartPoint {
  t: number; // relative seconds from first snapshot
  temp: number;
  power: number;
  clock: number;
  util: number;
}

export default function GpuTelemetryChart() {
  const [data, setData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const snapshots = await invoke<GpuSnapshot[]>('get_gpu_history');
        if (cancelled || snapshots.length === 0) return;

        const t0 = snapshots[0].timestamp_secs;
        const points: ChartPoint[] = snapshots.map((s) => ({
          t: s.timestamp_secs - t0,
          temp: s.temperature,
          power: Math.round(s.power_draw),
          clock: s.core_clock_mhz,
          util: s.gpu_utilization,
        }));
        setData(points);
      } catch {
        // nvidia-smi unavailable — history stays empty
      }
    };

    fetch();
    const interval = setInterval(fetch, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (data.length < 2) {
    return (
      <div className="rounded-lg border border-nvidia-border bg-nvidia-panel p-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-nvidia-muted">
          GPU Telemetry History
        </span>
        <p className="mt-3 text-center font-mono text-[11px] text-nvidia-muted">
          Collecting data… ({data.length}/2 samples)
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-nvidia-border bg-nvidia-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-sm font-medium text-nvidia-text">GPU Telemetry History</span>
        <span className="font-mono text-[10px] text-nvidia-muted">{data.length} samples · 3 s interval</span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="t"
            tickFormatter={(v) => `${v}s`}
            tick={{ fontSize: 9, fill: '#666', fontFamily: 'monospace' }}
            stroke="#3a3a3a"
          />
          {/* Left axis: temperature °C and utilization % (0–100) */}
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}`}
            tick={{ fontSize: 9, fill: '#666', fontFamily: 'monospace' }}
            stroke="#3a3a3a"
            width={28}
          />
          {/* Right axis: power W and clock MHz */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={['auto', 'auto']}
            tick={{ fontSize: 9, fill: '#666', fontFamily: 'monospace' }}
            stroke="#3a3a3a"
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: 11,
            }}
            labelFormatter={(v) => `T+${v}s`}
            formatter={(value, name) => {
              const units: Record<string, string> = {
                'Temp °C': '°C',
                'Util %': '%',
                'Power W': 'W',
                'Core MHz': 'MHz',
              };
              const key = String(name ?? '');
              return [`${value ?? ''}${units[key] ?? ''}`, key] as [string, string];
            }}
          />
          <Legend
            iconSize={8}
            wrapperStyle={{ fontFamily: 'monospace', fontSize: 10, paddingTop: 4 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temp"
            name="Temp °C"
            stroke="#76B900"
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="util"
            name="Util %"
            stroke="#00ff9c"
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="power"
            name="Power W"
            stroke="#f59e0b"
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="clock"
            name="Core MHz"
            stroke="#00b4d8"
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
