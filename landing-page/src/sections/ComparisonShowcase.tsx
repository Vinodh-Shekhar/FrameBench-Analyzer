import { useState } from 'react'

export default function ComparisonShowcase() {
  const [activeTab, setActiveTab] = useState<'stable' | 'comparison'>('stable')

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Instantly Compare Performance Across Configurations</h2>
          <p className="text-lg text-nvidia-muted font-mono max-w-2xl mx-auto">
            Frame time, FPS, variance, and stability metrics — all in one unified view
          </p>
        </div>

        <div className="mb-8">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setActiveTab('stable')}
              className={`px-6 py-3 rounded font-mono text-sm transition-all ${
                activeTab === 'stable'
                  ? 'bg-nvidia-green/10 text-nvidia-green border border-nvidia-green/50 shimmer-btn'
                  : 'border border-nvidia-border/50 bg-nvidia-bg/40 text-nvidia-text hover:bg-nvidia-panel-light'
              }`}
            >
              Performance Metrics
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-6 py-3 rounded font-mono text-sm transition-all ${
                activeTab === 'comparison'
                  ? 'bg-nvidia-green/10 text-nvidia-green border border-nvidia-green/50 shimmer-btn'
                  : 'border border-nvidia-border/50 bg-nvidia-bg/40 text-nvidia-text hover:bg-nvidia-panel-light'
              }`}
            >
              Driver Comparison
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-nvidia-border bg-nvidia-panel overflow-hidden p-8 animate-fade-in">
          {activeTab === 'stable' ? (
            <div data-animate>
              <img
                src="image.png"
                alt="Stable performance benchmark"
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-6 p-4 bg-nvidia-panel-light rounded-lg border border-nvidia-border">
                <h3 className="text-lg font-bold text-nvidia-green mb-2 font-mono">Stable Frame Timing</h3>
                <ul className="space-y-2 text-nvidia-muted text-sm font-mono">
                  <li className="flex gap-2">
                    <span className="text-nvidia-green">›</span>
                    Consistent frame delivery with minimal variance
                  </li>
                  <li className="flex gap-2">
                    <span className="text-nvidia-green">›</span>
                    Frame time clustering around target framerate
                  </li>
                  <li className="flex gap-2">
                    <span className="text-nvidia-green">›</span>
                    No perceptible stutter or frame spikes
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div data-animate>
              <img
                src="edited-photo.png"
                alt="Driver comparison benchmark"
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-6 p-4 bg-nvidia-panel-light rounded-lg border border-nvidia-border">
                <h3 className="text-lg font-bold text-nvidia-green mb-2 font-mono">Driver A vs Driver B Analysis</h3>
                <ul className="space-y-2 text-nvidia-muted text-sm font-mono">
                  <li className="flex gap-2">
                    <span className="text-nvidia-green">›</span>
                    Dataset A: 7,123 frames @ 238.3 avg FPS
                  </li>
                  <li className="flex gap-2">
                    <span className="text-nvidia-green">›</span>
                    Dataset B: 8,023 frames @ 277.2 avg FPS
                  </li>
                  <li className="flex gap-2">
                    <span className="text-nvidia-green">›</span>
                    Performance improvement: ~16% on Driver B
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
