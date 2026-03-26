import { BarChart4, PieChart, FileJson, Cpu, FileText } from 'lucide-react'

interface FeatureDiveProps {
  icon: React.ReactNode
  title: string
  description: string
  capabilities: string[]
}

function FeatureDiveCard({ icon, title, description, capabilities }: FeatureDiveProps) {
  return (
    <div className="rounded-lg border border-nvidia-border bg-nvidia-panel p-8 hover:bg-nvidia-panel-light transition-colors duration-300" data-animate>
      <div className="text-nvidia-green mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold text-center mb-4">{title}</h3>
      <p className="text-nvidia-muted font-mono text-center mb-6">{description}</p>
      <ul className="space-y-3">
        {capabilities.map((cap, idx) => (
          <li key={idx} className="flex gap-2 items-center text-sm text-nvidia-muted font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-nvidia-green flex-shrink-0"></span>
            {cap}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FeatureDeepDive() {
  const features = [
    {
      icon: <BarChart4 size={32} />,
      title: 'Frame-Time Visualization',
      description: 'Interactive line charts with anomaly detection',
      capabilities: [
        'Real-time frame-time graphing',
        'Average reference lines',
        'Automatic spike detection',
        'Configurable time windows',
      ],
    },
    {
      icon: <PieChart size={32} />,
      title: 'Distribution Analysis',
      description: 'Percentile and variance analysis',
      capabilities: [
        'P50 / P95 / P99 histograms',
        'Variance visualization',
        'Stutter score calculation',
        'Performance bucketing',
      ],
    },
    {
      icon: <FileJson size={32} />,
      title: 'Multi-Format Support',
      description: 'Import from all major tools',
      capabilities: [
        'FrameView CSV parser',
        'PresentMon CSV support',
        'Compressed .csv.gz files',
        'Custom format templates',
      ],
    },
    {
      icon: <Cpu size={32} />,
      title: 'Hardware Metadata Detection',
      description: 'Automatic system information extraction',
      capabilities: [
        'Auto-detect GPU model',
        'CPU identification',
        'Resolution and refresh rate',
        'Driver version detection',
      ],
    },
    {
      icon: <FileText size={32} />,
      title: 'HTML Report Export',
      description: 'Shareable, professional performance reports',
      capabilities: [
        'Interactive charts in reports',
        'Detailed per-metric statistics',
        'Shareable in minutes — no setup required',
        'Comparison exports across drivers, hardware, and settings',
      ],
    },
  ]

  return (
    <section className="py-32 relative overflow-hidden bg-nvidia-panel-light/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Feature Deep Dive</h2>
          <p className="text-lg text-nvidia-muted font-mono max-w-2xl mx-auto">
            Comprehensive tools for professional GPU performance analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.slice(0, 3).map((feature, idx) => (
            <FeatureDiveCard key={idx} {...feature} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {features.slice(3).map((feature, idx) => (
            <FeatureDiveCard key={idx + 3} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
