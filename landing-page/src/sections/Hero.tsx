import { Download, Play, Activity, Cpu } from 'lucide-react'
import Button from '../components/Button'
import AnimatedGraph from '../components/AnimatedGraph'

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-20 pb-32 overflow-hidden flex items-center bg-nvidia-bg">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-nvidia-green/5 via-transparent to-transparent"></div>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-nvidia-green/10 rounded-full blur-3xl opacity-30 animate-float"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-nvidia-accent/5 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-nvidia-green/40 bg-nvidia-green/10 mb-4">
                <span className="w-2 h-2 rounded-full bg-nvidia-green animate-pulse-glow"></span>
                <span className="font-mono text-[11px] font-bold text-nvidia-green uppercase tracking-wider">v1.2.0 Stable Build</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight font-mono">
                Beyond FPS: <span className="text-nvidia-green text-glow-green">Understand Frame Behavior</span>
              </h1>
            </div>

            <p className="text-lg text-nvidia-muted leading-relaxed font-mono">
              Analyze <span className="text-nvidia-text">Frame-Time Telemetry</span>, detect <span className="text-nvidia-text">Micro-Stutters</span>, and validate <span className="text-nvidia-text">Driver Stability</span> with professional-grade precision.
            </p>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="flex items-center gap-2 text-sm text-nvidia-muted font-mono">
                <Activity size={16} className="text-nvidia-green" />
                <span>Pacing Stability</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-nvidia-muted font-mono">
                <Cpu size={16} className="text-nvidia-green" />
                <span>Regression Analysis</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="primary"
                size="lg"
                href="https://github.com/Vinodh-Shekhar/FrameBench-Analyzer/releases/latest/download/FrameBench-Analyzer-Setup.exe"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download size={18} />
                Download Setup
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href="analyzer/"
              >
                <Play size={18} />
                Launch Web App
              </Button>
            </div>

            <div className="pt-8 border-t border-nvidia-border space-y-3">
              <p className="font-mono text-[11px] text-nvidia-muted uppercase tracking-widest">Native Performance • 0.0ms Analysis Overhead</p>
            </div>
          </div>

          {/* Right animated graph */}
          <div className="relative animate-slide-up">
            <div className="rounded-lg border border-nvidia-border bg-nvidia-panel p-4 glow-green">
              <div className="flex items-center justify-between mb-4 border-b border-nvidia-border/50 pb-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-nvidia-danger/20 border border-nvidia-danger/40"></div>
                  <div className="w-3 h-3 rounded-full bg-nvidia-warning/20 border border-nvidia-warning/40"></div>
                  <div className="w-3 h-3 rounded-full bg-nvidia-green/20 border border-nvidia-green/40"></div>
                </div>
                <div className="font-mono text-[10px] text-nvidia-muted uppercase tracking-tighter">Live Telemetry Visualization</div>
              </div>
              <AnimatedGraph />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
