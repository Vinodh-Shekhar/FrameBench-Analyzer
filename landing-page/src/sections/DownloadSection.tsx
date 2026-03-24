import { Download, Package, Zap, ShieldCheck } from 'lucide-react'
import Button from '../components/Button'

export default function DownloadSection() {
  return (
    <section id="download" className="py-32 relative overflow-hidden bg-nvidia-bg">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-nvidia-green/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        <div className="rounded-2xl border border-nvidia-border bg-nvidia-panel p-12 md:p-20 text-center glow-green animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-mono tracking-tight uppercase">Get Started Today</h2>
          <p className="text-lg text-nvidia-muted mb-12 max-w-2xl mx-auto font-mono">
            Download the professional-grade <span className="text-nvidia-text">FrameBench Analyzer</span>. Optimized for Windows 10/11 with zero external dependencies.
          </p>

          <div className="flex gap-6 justify-center items-center flex-wrap mb-12">
            <Button
              variant="primary"
              size="lg"
              href="https://github.com/Vinodh-Shekhar/FrameBench-Analyzer/releases/latest/download/FrameBench-Analyzer-Setup.exe"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={20} />
              Download v1.2.0 (.exe)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg border border-nvidia-border bg-nvidia-bg/50 group hover:border-nvidia-green/30 transition-colors">
              <Package size={24} className="text-nvidia-green mb-3 mx-auto" />
              <p className="font-mono text-sm font-bold text-nvidia-text mb-1 uppercase">Lightweight</p>
              <p className="font-mono text-[11px] text-nvidia-muted">~50MB portable binary</p>
            </div>
            <div className="p-4 rounded-lg border border-nvidia-border bg-nvidia-bg/50 group hover:border-nvidia-green/30 transition-colors">
              <Zap size={24} className="text-nvidia-green mb-3 mx-auto" />
              <p className="font-mono text-sm font-bold text-nvidia-text mb-1 uppercase">Fast Analysis</p>
              <p className="font-mono text-[11px] text-nvidia-muted">High-performance engine</p>
            </div>
            <div className="p-4 rounded-lg border border-nvidia-border bg-nvidia-bg/50 group hover:border-nvidia-green/30 transition-colors">
              <ShieldCheck size={24} className="text-nvidia-green mb-3 mx-auto" />
              <p className="font-mono text-sm font-bold text-nvidia-text mb-1 uppercase">Secure</p>
              <p className="font-mono text-[11px] text-nvidia-muted">100% Offline processing</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-nvidia-border text-left">
            <h3 className="font-mono text-sm font-bold text-nvidia-text mb-4 uppercase tracking-wider">System Requirements</h3>
            <ul className="space-y-2 font-mono text-nvidia-muted text-[11px]">
              <li className="flex gap-2">
                <span className="text-nvidia-green">/</span>
                Windows 10 / 11 (x64)
              </li>
              <li className="flex gap-2">
                <span className="text-nvidia-green">/</span>
                NVIDIA / AMD / Intel GPU
              </li>
              <li className="flex gap-2">
                <span className="text-nvidia-green">/</span>
                Input: FrameView or PresentMon CSV
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
