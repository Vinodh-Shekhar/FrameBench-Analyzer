import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-nvidia-panel/95 backdrop-blur-sm border-b border-nvidia-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="w-2 h-2 rounded-full bg-nvidia-green animate-pulse-glow flex-shrink-0"></span>
            <span className="font-mono font-bold text-nvidia-text" style={{ fontSize: '1.8rem' }}>
              Frame<span className="text-nvidia-green">Bench</span>
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 font-mono text-sm text-nvidia-muted">
            <button
              onClick={() => scrollTo('features')}
              className="hover:text-nvidia-green transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="hover:text-nvidia-green transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo('use-cases')}
              className="hover:text-nvidia-green transition-colors"
            >
              Use Cases
            </button>
            <button
              onClick={() => scrollTo('download-section')}
              className="hover:text-nvidia-green transition-colors"
            >
              Download
            </button>
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-nvidia-muted hover:text-nvidia-green transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-nvidia-border bg-nvidia-panel/95 py-4 font-mono text-sm">
            <button
              onClick={() => scrollTo('features')}
              className="block w-full text-left px-4 py-3 text-nvidia-muted hover:text-nvidia-green transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="block w-full text-left px-4 py-3 text-nvidia-muted hover:text-nvidia-green transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo('use-cases')}
              className="block w-full text-left px-4 py-3 text-nvidia-muted hover:text-nvidia-green transition-colors"
            >
              Use Cases
            </button>
            <button
              onClick={() => scrollTo('download-section')}
              className="block w-full text-left px-4 py-3 text-nvidia-muted hover:text-nvidia-green transition-colors"
            >
              Download
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
