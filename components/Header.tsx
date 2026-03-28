'use client'

interface HeaderProps {
  spotCount: number
  onAboutClick: () => void
}

export default function Header({ spotCount, onAboutClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">WasteMap</h1>
            <p className="text-xs text-muted">Community waste management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-surface px-3 py-1.5 rounded-full border border-border">
            <span className="text-sm text-muted">
              <span className="text-primary font-semibold">{spotCount}</span> spots
            </span>
          </div>
          <button
            onClick={onAboutClick}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border hover:bg-border transition-colors"
            aria-label="About"
          >
            <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
