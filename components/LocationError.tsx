'use client'

interface LocationErrorProps {
  error: string
  onRetry: () => void
}

export default function LocationError({ error, onRetry }: LocationErrorProps) {
  return (
    <div className="fixed inset-0 z-[1500] bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
          <svg
            className="w-10 h-10 text-warning"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Location Required</h2>
        <p className="text-muted mb-6">{error}</p>

        <button
          onClick={onRetry}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>

        <p className="text-xs text-muted mt-4">
          DropSpot needs your location to show nearby waste drop-off spots.
        </p>
      </div>
    </div>
  )
}
