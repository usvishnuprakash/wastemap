'use client'

interface HeaderProps {
  spotCount: number
}

export default function Header({ spotCount }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">WasteMap</h1>
          <p className="text-xs text-muted">Community waste management</p>
        </div>
        <div className="bg-surface px-3 py-1.5 rounded-full border border-border">
          <span className="text-sm text-muted">
            <span className="text-primary font-semibold">{spotCount}</span> spots nearby
          </span>
        </div>
      </div>
    </header>
  )
}
