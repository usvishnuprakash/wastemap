'use client'

import { useState } from 'react'
import { Coordinates, SpotStatus } from '@/lib/types'
import { STATUS_CONFIG } from '@/lib/constants'
import { useSpotActions } from '@/hooks/useSpotActions'

interface AddSpotFlowProps {
  isAddMode: boolean
  pinLocation: Coordinates | null
  userId: string | null
  onEnterAddMode: () => void
  onExitAddMode: () => void
  onSuccess: () => void
}

export default function AddSpotFlow({
  isAddMode,
  pinLocation,
  userId,
  onEnterAddMode,
  onExitAddMode,
  onSuccess,
}: AddSpotFlowProps) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<SpotStatus>('active')
  const { addSpot, loading, error } = useSpotActions()

  const handleSubmit = async () => {
    if (!pinLocation || !name.trim()) return

    try {
      await addSpot({
        name: name.trim(),
        latitude: pinLocation.lat,
        longitude: pinLocation.lng,
        status,
        userId,
      })
      setName('')
      setStatus('active')
      onSuccess()
    } catch {
      // Error handled in hook
    }
  }

  const handleCancel = () => {
    setName('')
    setStatus('active')
    onExitAddMode()
  }

  // Floating action button when not in add mode
  if (!isAddMode) {
    return (
      <button
        onClick={onEnterAddMode}
        className="fixed bottom-6 right-6 z-[1000] w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label="Add new drop spot"
      >
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    )
  }

  // Instruction banner when in add mode but no pin yet
  if (!pinLocation) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[1000]">
        <div className="bg-surface border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Tap the map</h3>
              <p className="text-sm text-muted">Place your pin on the drop spot location</p>
            </div>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Form when pin is placed
  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={handleCancel} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-surface rounded-t-2xl animate-slide-up">
        <div className="px-4 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-white">Add Drop Spot</h2>
          <p className="text-sm text-muted">
            Pin placed at {pinLocation.lat.toFixed(5)}, {pinLocation.lng.toFixed(5)}
          </p>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Corner of MG Road, Vacant plot near temple"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
              maxLength={200}
            />
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Current Status</label>
            <div className="flex gap-2">
              {(['active', 'overflowing'] as SpotStatus[]).map((s) => {
                const config = STATUS_CONFIG[s]
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                      status === s
                        ? `${config.bgColor} text-white`
                        : 'bg-border text-muted hover:bg-muted/30'
                    }`}
                  >
                    {config.icon} {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Error message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 bg-border text-muted rounded-lg font-medium hover:bg-muted/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || loading}
              className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Spot'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
