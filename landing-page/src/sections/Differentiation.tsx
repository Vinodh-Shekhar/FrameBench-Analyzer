import { Zap, BarChart3, Cpu, Lightbulb, WifiOff } from 'lucide-react'
import FeatureCard from '../components/FeatureCard'

export default function Differentiation() {
  const features = [
    {
      icon: <Zap size={28} />,
      title: 'Actionable Insights',
      description: 'Not just telemetry—automated analysis that tells you exactly what to fix and why',
    },
    {
      icon: <BarChart3 size={28} />,
      title: 'Automated Regression Detection',
      description: 'Z-score based statistical anomaly detection catches performance drops instantly',
    },
    {
      icon: <Cpu size={28} />,
      title: 'Built for QA Workflows',
      description: 'Designed for driver validation, hardware comparison, and settings optimization workflows',
    },
    {
      icon: <Lightbulb size={28} />,
      title: 'Performance Scoring',
      description: 'Clear PASS/WARNING/FAIL verdicts with exportable reports for validation teams',
    },
    {
      icon: <WifiOff size={28} />,
      title: 'No External Dependencies',
      description: 'Runs entirely locally with no telemetry upload or cloud processing',
    },
  ]

  return (
    <section className="py-32 relative overflow-hidden bg-nvidia-panel-light/30">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-nvidia-green/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-nvidia-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">What Makes FrameBench Different</h2>
          <p className="text-lg text-nvidia-muted font-mono max-w-2xl mx-auto">
            Purpose-built for modern GPU validation and performance analysis workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} data-animate className={features.length % 2 !== 0 && idx === features.length - 1 ? 'md:col-span-2 md:max-w-md md:mx-auto' : ''}>
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
