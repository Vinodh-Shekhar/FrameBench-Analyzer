import { Gamepad2, FlaskConical, HardDrive, Settings } from 'lucide-react'

interface UseCaseProps {
  icon: React.ReactNode
  title: string
  description: string
  points: string[]
}

function UseCaseCard({ icon, title, description, points }: UseCaseProps) {
  return (
    <div className="rounded-lg border border-nvidia-border bg-nvidia-panel p-8 hover:bg-nvidia-panel-light transition-colors duration-300" data-animate>
      <div className="text-nvidia-green mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-nvidia-muted font-mono mb-6">{description}</p>
      <ul className="space-y-2">
        {points.map((point, idx) => (
          <li key={idx} className="flex gap-3 items-start">
            <span className="text-nvidia-green text-lg leading-none mt-0.5">›</span>
            <span className="text-nvidia-muted text-sm font-mono">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function UseCases() {
  const useCases = [
    {
      icon: <Gamepad2 size={28} />,
      title: 'Driver Validation',
      description: 'Compare driver builds and detect regressions automatically.',
      points: [
        'Compare driver builds side-by-side',
        'Detect regressions instantly',
        'Generate validation reports',
        'Export results for stakeholders',
      ],
    },
    {
      icon: <FlaskConical size={28} />,
      title: 'Performance Analysis',
      description: 'Analyze frame-time consistency and identify stutter spikes.',
      points: [
        'Detect micro-stutter and frame pacing issues',
        'Visualize frame-time distribution',
        'Export detailed telemetry data',
        'Compare settings impact',
      ],
    },
    {
      icon: <HardDrive size={28} />,
      title: 'Hardware Benchmarking',
      description: 'Compare GPU configurations and system performance.',
      points: [
        'Compare GPU configurations side-by-side',
        'Detect performance regressions per hardware',
        'Analyze thermal and power impact',
        'Generate shareable benchmark reports',
      ],
    },
    {
      icon: <Settings size={28} />,
      title: 'Game Settings Optimization',
      description: 'Evaluate graphics settings impact on performance.',
      points: [
        'Compare Ultra vs Competitive presets',
        'Find optimal quality/performance balance',
        'Identify settings that introduce stutter or regressions',
        'Share optimization reports in minutes',
      ],
    },
  ]

  return (
    <section id="use-cases" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Use Cases</h2>
          <p className="text-lg text-nvidia-muted font-mono max-w-2xl mx-auto">
            FrameBench powers critical workflows across driver validation, hardware benchmarking, and game settings optimization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, idx) => (
            <UseCaseCard key={idx} {...useCase} />
          ))}
        </div>
      </div>
    </section>
  )
}
