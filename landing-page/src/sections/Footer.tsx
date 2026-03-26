export default function Footer() {
  return (
    <footer className="border-t border-nvidia-border py-12 bg-nvidia-panel-light/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-nvidia-green flex-shrink-0"></span>
              <span className="font-mono font-bold text-nvidia-text">
                Frame<span className="text-nvidia-green">Bench</span> Analyzer
              </span>
            </div>
            <p className="text-nvidia-muted font-mono text-sm leading-relaxed max-w-sm">
              Professional GPU performance analysis for drivers, hardware, and game configurations. Built for validation, benchmarking, and performance engineering workflows.
            </p>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-mono font-bold mb-4 text-nvidia-text text-xs uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-nvidia-muted font-mono">
              <li>
                <span className="text-nvidia-muted">MIT License</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-nvidia-border pt-8">
          <p className="text-nvidia-muted font-mono text-sm text-center">
            © 2026 FrameBench Analyzer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
