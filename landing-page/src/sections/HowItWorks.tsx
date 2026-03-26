import { Upload, Layers, BarChart3, AlertTriangle } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: <Upload size={24} />,
    title: 'Capture Telemetry',
    description: 'Record frame-time data using FrameView or PresentMon',
  },
  {
    number: '02',
    icon: <Layers size={24} />,
    title: 'Import into FrameBench',
    description: 'Drop your CSV files into the app — no configuration needed',
  },
  {
    number: '03',
    icon: <BarChart3 size={24} />,
    title: 'Compare Configurations',
    description: 'Analyze drivers, hardware, and settings side-by-side',
  },
  {
    number: '04',
    icon: <AlertTriangle size={24} />,
    title: 'Identify Regressions',
    description: 'Automated detection flags performance drops instantly',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden bg-nvidia-panel-light/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
          <p className="text-lg text-nvidia-muted font-mono max-w-2xl mx-auto">
            From raw telemetry to actionable insights in four steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col" data-animate>
              <div className="rounded-lg border border-nvidia-border bg-nvidia-panel p-6 hover:bg-nvidia-panel-light transition-colors duration-300 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-3xl font-bold text-nvidia-green/25 leading-none select-none">
                    {step.number}
                  </span>
                  <div className="text-nvidia-green">{step.icon}</div>
                </div>
                <h3 className="text-base font-bold mb-2">{step.title}</h3>
                <p className="text-nvidia-muted font-mono text-sm">{step.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-8 z-10 items-center justify-center w-6">
                  <span className="text-nvidia-border text-lg font-mono">›</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
