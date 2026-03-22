import { Cpu, Activity, Download, Info, Monitor } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import DualFanGpu from './DualFanGpu';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isRunningStandalone(): boolean {
  const isIosStandalone =
    'standalone' in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const isMediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
  return isIosStandalone || isMediaStandalone;
}

export default function Header() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't set up PWA install listeners when running inside Tauri
    if (isTauri) return;

    setIsStandalone(isRunningStandalone());
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setIsStandalone(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  useEffect(() => {
    if (!showTooltip) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTooltip]);

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsStandalone(true);
        setInstallPrompt(null);
      }
    } else {
      setShowTooltip((v) => !v);
    }
  };

  const hasNativePrompt = !!installPrompt;
  const showInstallButton = !isStandalone;

  return (
    <header className="relative overflow-hidden border-b border-nvidia-border bg-nvidia-panel">
      <div className="absolute inset-0 bg-gradient-to-r from-nvidia-green/5 via-transparent to-nvidia-accent/5" />
      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-nvidia-green/10 ring-1 ring-nvidia-green/30">
                <DualFanGpu size="lg" spinning />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-nvidia-accent shadow-[0_0_8px_rgba(0,255,156,0.6)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-nvidia-text sm:text-2xl">
                FrameBench{' '}
                <span className="text-nvidia-green">Analyzer</span>
              </h1>
              <p className="mt-0.5 text-xs tracking-wide text-nvidia-muted sm:text-sm">
                Performance Benchmarking &amp; Telemetry Analysis
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 sm:flex">
            <StatusIndicator icon={<Cpu className="h-4 w-4" />} label="Hardware" status="active" />
            <StatusIndicator icon={<Activity className="h-4 w-4" />} label="Telemetry" status="active" />

            {isTauri ? (
              <div className="flex items-center gap-2 rounded-md bg-nvidia-bg/60 px-3 py-1.5 ring-1 ring-nvidia-border">
                <Monitor className="h-3.5 w-3.5 text-nvidia-green" />
                <span className="font-mono text-xs text-nvidia-green">DESKTOP APP</span>
              </div>
            ) : isStandalone ? (
              <div className="flex items-center gap-2 rounded-md bg-nvidia-bg/60 px-3 py-1.5 ring-1 ring-nvidia-border">
                <div className="h-2 w-2 rounded-full bg-nvidia-green animate-pulse-glow" />
                <span className="font-mono text-xs text-nvidia-green">INSTALLED</span>
              </div>
            ) : showInstallButton ? (
              <div className="relative" ref={tooltipRef}>
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-2 rounded-md bg-nvidia-green/10 px-3 py-1.5 ring-1 ring-nvidia-green/50 transition-all hover:bg-nvidia-green/20 hover:ring-nvidia-green active:scale-95"
                >
                  {hasNativePrompt ? (
                    <Download className="h-3.5 w-3.5 text-nvidia-green" />
                  ) : (
                    <Info className="h-3.5 w-3.5 text-nvidia-green" />
                  )}
                  <span className="font-mono text-xs text-nvidia-green">INSTALL</span>
                </button>

                {showTooltip && (
                  <div className="absolute right-0 top-full mt-2 w-60 rounded-lg border border-nvidia-border bg-nvidia-panel p-3 shadow-xl z-50">
                    {isIos ? (
                      <p className="font-mono text-[10px] text-nvidia-muted leading-relaxed">
                        Tap the <span className="text-nvidia-green">Share</span> button in Safari then select{' '}
                        <span className="text-nvidia-green">Add to Home Screen</span>
                      </p>
                    ) : (
                      <p className="font-mono text-[10px] text-nvidia-muted leading-relaxed">
                        Open this page in <span className="text-nvidia-green">Chrome</span> or{' '}
                        <span className="text-nvidia-green">Edge</span> and use the browser menu to install
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md bg-nvidia-bg/60 px-3 py-1.5 ring-1 ring-nvidia-border">
                <div className="h-2 w-2 rounded-full bg-nvidia-green animate-pulse-glow" />
                <span className="font-mono text-xs text-nvidia-green">SYSTEM READY</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function StatusIndicator({
  icon,
  label,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  status: 'active' | 'idle' | 'error';
}) {
  const colorMap = {
    active: 'text-nvidia-green',
    idle: 'text-nvidia-muted',
    error: 'text-nvidia-danger',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={colorMap[status]}>{icon}</span>
      <span className="font-mono text-xs text-nvidia-muted">{label}</span>
    </div>
  );
}
