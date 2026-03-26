import { Download, Package, Zap, WifiOff } from 'lucide-react'

const DOWNLOAD_URL =
  'https://github.com/Vinodh-Shekhar/FrameBench-Analyzer/releases/download/v1.0.6/FrameBench-Analyzer-Setup.exe'

export default function DownloadSection() {
  return (
    <section id="download-section" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-nvidia-green/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-nvidia-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        <div className="rounded-lg border border-nvidia-green/30 bg-nvidia-panel glow-green p-10 md:p-16 text-center animate-fade-in">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-nvidia-green/40 bg-nvidia-green/10 mb-8 font-mono text-[11px] font-semibold text-nvidia-green">
            <span className="w-2 h-2 rounded-full bg-nvidia-green animate-pulse"></span>
            Latest Release — v1.0.6
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Download FrameBench Analyzer
          </h2>
          <p className="text-base text-nvidia-muted font-mono mb-6 max-w-xl mx-auto">
            Free desktop app for Windows. Zero cloud. Full control. Validate performance across drivers, hardware, and game settings — in minutes, not hours.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-2 mb-4 font-mono text-xs text-nvidia-muted">
            <span>No telemetry</span>
            <span className="text-nvidia-border">•</span>
            <span>No cloud processing</span>
            <span className="text-nvidia-border">•</span>
            <span>Runs locally</span>
          </div>
          <p className="font-mono text-xs text-nvidia-muted/70 mb-8">
            Compatible with NVIDIA, AMD, and Intel GPUs
          </p>

          <a
            href={DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shimmer-btn inline-flex items-center gap-3 px-10 py-4 rounded border border-nvidia-green/60 bg-nvidia-green/15 text-nvidia-green font-mono text-lg hover:bg-nvidia-green/25 transition-colors"
          >
            <Download size={22} />
            Download for Windows
          </a>

          <p className="font-mono text-[11px] text-nvidia-muted mt-4 mb-12">
            FrameBench-Analyzer-Setup.exe · Windows 10+
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="p-5 rounded-lg bg-nvidia-panel-light/50 border border-nvidia-border">
              <Package size={22} className="text-nvidia-green mb-3 mx-auto" />
              <p className="font-mono text-sm font-bold mb-1">Lightweight Installer</p>
              <p className="text-xs text-nvidia-muted font-mono">
                Bundled WebView2 bootstrapper — no separate runtime downloads
              </p>
            </div>
            <div className="p-5 rounded-lg bg-nvidia-panel-light/50 border border-nvidia-border">
              <Zap size={22} className="text-nvidia-green mb-3 mx-auto" />
              <p className="font-mono text-sm font-bold mb-1">Rust-Powered Engine</p>
              <p className="text-xs text-nvidia-muted font-mono">
                Processes thousands of frames in milliseconds with zero lag
              </p>
            </div>
            <div className="p-5 rounded-lg bg-nvidia-panel-light/50 border border-nvidia-border">
              <WifiOff size={22} className="text-nvidia-green mb-3 mx-auto" />
              <p className="font-mono text-sm font-bold mb-1">Fully Offline</p>
              <p className="text-xs text-nvidia-muted font-mono">
                No telemetry, no cloud — runs entirely on your machine
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-nvidia-border text-left">
            <h3 className="font-mono text-xs font-bold mb-4 text-nvidia-text uppercase tracking-wider">
              System Requirements
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-nvidia-muted text-xs font-mono">
              {[
                'Windows 10 or later (64-bit)',
                '4 GB RAM minimum',
                'NVIDIA, AMD, or Intel GPU with current drivers',
                'CSV telemetry from FrameView or PresentMon',
              ].map((req, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-nvidia-green flex-shrink-0">›</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
