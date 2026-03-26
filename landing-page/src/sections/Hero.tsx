import { Download } from 'lucide-react'
import AnimatedGraph from '../components/AnimatedGraph'


export default function Hero() {
  return (
    <section className="relative pt-28 pb-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-nvidia-green/5 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-nvidia-green/30 to-transparent"></div>
      </div>
      <div className="absolute top-24 right-8 w-80 h-80 bg-nvidia-green/10 rounded-full blur-3xl opacity-25 animate-pulse-glow"></div>
      <div className="absolute bottom-12 left-8 w-96 h-96 bg-nvidia-accent/5 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in">
            {/* Version badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-nvidia-green/40 bg-nvidia-green/10 font-mono text-[11px] font-semibold text-nvidia-green">
              <span className="w-2 h-2 rounded-full bg-nvidia-green animate-pulse"></span>
              GPU Performance Intelligence
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-4">
                Beyond FPS.<br />
                <span className="text-nvidia-green text-glow-green">
                  Understand Frame<br />Behavior.
                </span>
              </h1>
              <p className="text-base text-nvidia-muted leading-relaxed font-mono">
                Analyze frame-time telemetry, detect stutter, and validate performance across drivers, hardware, and game settings. Identify regressions and generate shareable reports in minutes, not hours
              </p>
              <p className="text-sm text-nvidia-accent/70 font-mono mt-3">
                Compare performance across drivers, GPUs, and game configurations.
              </p>
            </div>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-8 py-5 border-t border-b border-nvidia-border">
              {[
                { value: '2', label: 'Datasets Compared', sub: 'Side-by-side comparison' },
                { value: '16+', label: 'Metrics Analyzed' },
                { value: '0', label: 'Cloud Dependencies', sub: 'Runs locally' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="font-mono text-2xl font-bold text-nvidia-green leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-nvidia-muted">
                    {stat.label}
                  </p>
                  {stat.sub && (
                    <p className="font-mono text-[10px] text-nvidia-accent/60 mt-0.5">{stat.sub}</p>
                  )}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => document.getElementById('download-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="shimmer-btn flex items-center justify-center gap-2 px-8 py-4 rounded border border-nvidia-green/50 bg-nvidia-green/10 text-nvidia-green font-mono text-base hover:bg-nvidia-green/20 transition-colors"
              >
                <Download size={18} />
                Download for Windows
              </button>
            </div>

            <p className="font-mono text-[11px] text-nvidia-muted">
              Free · Windows 10+ · No internet required
            </p>
          </div>

          {/* Right — animated graph panel */}
          <div className="relative animate-slide-up">
            <div className="rounded-lg border border-nvidia-border bg-nvidia-panel overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-nvidia-border">
                <span className="font-mono text-[11px] text-nvidia-muted uppercase tracking-wider">
                  Live Frame-Time Visualization
                </span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-nvidia-green">
                    <span className="w-2 h-2 rounded-full bg-nvidia-green flex-shrink-0"></span>
                    Driver A
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-nvidia-accent">
                    <span className="w-2 h-2 rounded-full bg-nvidia-accent flex-shrink-0"></span>
                    Driver B
                  </span>
                </div>
              </div>
              <div className="p-4">
                <AnimatedGraph />
              </div>
              {/* Panel footer metrics */}
              <div className="grid grid-cols-3 border-t border-nvidia-border">
                {[
                  { label: 'Avg FPS', a: '238.3', b: '277.2' },
                  { label: 'Stutter', a: '3.2%', b: '1.1%' },
                  { label: 'Score', a: '74', b: '91' },
                ].map((m, i) => (
                  <div key={i} className={`px-4 py-3 ${i < 2 ? 'border-r border-nvidia-border' : ''}`}>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-nvidia-muted mb-1.5">
                      {m.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-nvidia-green">{m.a}</span>
                      <span className="font-mono text-[9px] text-nvidia-muted">→</span>
                      <span className="font-mono text-xs font-bold text-nvidia-accent">{m.b}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 rounded-lg glow-green pointer-events-none opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
