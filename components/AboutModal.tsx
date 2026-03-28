'use client'

interface AboutModalProps {
  onClose: () => void
}

export default function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-white">About WasteMap</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-border hover:bg-muted/30 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
          {/* Mission */}
          <section className="mb-6">
            <h3 className="text-primary font-semibold mb-2">Our Mission</h3>
            <p className="text-muted text-sm leading-relaxed">
              WasteMap helps communities find and share proper waste disposal locations.
              By mapping collection points, we make it easier for everyone to dispose waste responsibly
              and keep our neighborhoods clean.
            </p>
          </section>

          {/* How it works */}
          <section className="mb-6">
            <h3 className="text-primary font-semibold mb-2">How It Works</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="text-white text-sm font-medium">Find Spots</p>
                  <p className="text-muted text-xs">Browse the map to find nearby waste disposal points</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">🧭</span>
                <div>
                  <p className="text-white text-sm font-medium">Get Directions</p>
                  <p className="text-muted text-xs">Tap any spot and get Google Maps directions</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">➕</span>
                <div>
                  <p className="text-white text-sm font-medium">Add New Spots</p>
                  <p className="text-muted text-xs">Know a spot? Add it to help others in your community</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-white text-sm font-medium">Verify & Update</p>
                  <p className="text-muted text-xs">Confirm locations and update status to keep info accurate</p>
                </div>
              </div>
            </div>
          </section>

          {/* Status guide */}
          <section className="mb-6">
            <h3 className="text-primary font-semibold mb-2">Status Guide</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-white text-sm">Available</span>
                <span className="text-muted text-xs">— Accepting waste</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="text-white text-sm">Full</span>
                <span className="text-muted text-xs">— Temporarily not accepting</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                <span className="text-white text-sm">Closed</span>
                <span className="text-muted text-xs">— No longer in use</span>
              </div>
            </div>
          </section>

          {/* Why it matters */}
          <section className="mb-6">
            <h3 className="text-primary font-semibold mb-2">Why It Matters</h3>
            <p className="text-muted text-sm leading-relaxed">
              Improper waste disposal pollutes our environment, clogs drains, and spreads disease.
              When waste reaches the right place, it can be processed, recycled, and managed properly.
              Together, we can make our cities cleaner and healthier.
            </p>
          </section>

          {/* Open source */}
          <section className="bg-background rounded-lg p-4">
            <p className="text-muted text-xs text-center">
              WasteMap is open source. Built with community in mind.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
