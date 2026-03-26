import { CheckCircle, Zap, Shield } from 'lucide-react'

interface CredentialProps {
  icon: React.ReactNode
  title: string
  description: string
}

function CredentialCard({ icon, title, description }: CredentialProps) {
  return (
    <div className="rounded-lg border border-nvidia-border bg-nvidia-panel p-6 hover:bg-nvidia-panel-light transition-colors duration-300" data-animate>
      <div className="text-nvidia-green mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-nvidia-muted font-mono text-sm">{description}</p>
    </div>
  )
}

export default function CredibilitySection() {
  const credentials = [
    {
      icon: <CheckCircle size={28} />,
      title: 'Real-World QA Workflows',
      description: 'Designed using validation pipelines from GPU driver teams at major vendors',
    },
    {
      icon: <Shield size={28} />,
      title: 'Battle-Tested Analysis',
      description: 'Statistical methods validated against industry-standard benchmarking tools',
    },
    {
      icon: <Zap size={28} />,
      title: 'Performance-First Architecture',
      description: 'Rust-powered engine handles datasets with thousands of frames instantly',
    },
  ]

  return (
    <section className="py-32 relative overflow-hidden bg-nvidia-bg">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for Performance Engineers</h2>
          <p className="text-lg text-nvidia-muted font-mono max-w-2xl mx-auto">
            Designed for engineers working on GPU validation, driver development, and performance optimization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {credentials.map((cred, idx) => (
            <CredentialCard key={idx} {...cred} />
          ))}
        </div>

        <div className="rounded-lg border border-nvidia-border bg-nvidia-panel p-8 md:p-12">
          <h3 className="text-2xl font-bold mb-6">Why Performance Engineers Choose FrameBench</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Built from real-world driver, hardware, and settings validation workflows',
              'Detects anomalies that FPS alone cannot reveal',
              'Shareable HTML reports ready in minutes, not hours',
              'Handles complex, multi-dataset analysis workflows',
              'Regression detection for continuous validation pipelines',
              'Lightweight, runs on any Windows system',
            ].map((reason, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <span className="text-nvidia-green text-xl leading-none mt-0.5">✓</span>
                <p className="text-nvidia-muted font-mono text-sm">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
