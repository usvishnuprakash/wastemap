'use client'

import { useState } from 'react'
import { Coordinates, SpotStatus } from '@/lib/types'
import { STATUS_CONFIG } from '@/lib/constants'
import { useSpotActions } from '@/hooks/useSpotActions'

interface AddSpotFlowProps {
  isAddMode: boolean
  mapCenter: Coordinates | null
  userCoords: Coordinates | null
  userId: string | null
  onEnterAddMode: () => void
  onExitAddMode: () => void
  onUseMyLocation: () => void
  onSuccess: () => void
}

type Step = 'position' | 'details'

export default function AddSpotFlow({
  isAddMode,
  mapCenter,
  userCoords,
  userId,
  onEnterAddMode,
  onExitAddMode,
  onUseMyLocation,
  onSuccess,
}: AddSpotFlowProps) {
  const [step, setStep] = useState<Step>('position')
  const [confirmedLocation, setConfirmedLocation] = useState<Coordinates | null>(null)
  const [name, setName] = useState('')
  const [status, setStatus] = useState<SpotStatus>('active')
  const { addSpot, loading, error } = useSpotActions()

  const handleConfirmLocation = () => {
    if (mapCenter) {
      setConfirmedLocation(mapCenter)
      setStep('details')
    }
  }

  const handleUseMyLocation = () => {
    if (userCoords) {
      onUseMyLocation()
      // Small delay to let map center update
      setTimeout(() => {
        setConfirmedLocation(userCoords)
        setStep('details')
      }, 300)
    }
  }

  const handleSubmit = async () => {
    if (!confirmedLocation || !name.trim()) return

    try {
      await addSpot({
        name: name.trim(),
        latitude: confirmedLocation.lat,
        longitude: confirmedLocation.lng,
        status,
        userId,
      })
      // Reset state
      setName('')
      setStatus('active')
      setStep('position')
      setConfirmedLocation(null)
      onSuccess()
    } catch {
      // Error handled in hook
    }
  }

  const handleCancel = () => {
    setName('')
    setStatus('active')
    setStep('position')
    setConfirmedLocation(null)
    onExitAddMode()
  }

  const handleBack = () => {
    setStep('position')
    setConfirmedLocation(null)
  }

  // Floating action button when not in add mode
  if (!isAddMode) {
    return (
      <button
        onClick={onEnterAddMode}
        className="fixed bottom-6 right-6 z-[1000] w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        aria-label="Add new waste spot"
      >
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    )
  }

  // Step 1: Position the pin
  if (step === 'position') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[1000]">
        <div className="bg-surface border-t border-border rounded-t-2xl shadow-lg">
          {/* Header */}
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-lg font-bold text-white">Add Waste Spot</h3>
            <p className="text-sm text-muted">Position the pin on the exact location</p>
          </div>

          {/* Instructions */}
          <div className="px-4 py-3 bg-indigo-500/10 border-y border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Drag the map</p>
                <p className="text-muted text-xs">Move the map so the pin is over the spot</p>
              </div>
            </div>
          </div>

          {/* Current position */}
          {mapCenter && (
            <div className="px-4 py-2 text-xs text-muted">
              Position: {mapCenter.lat.toFixed(6)}, {mapCenter.lng.toFixed(6)}
            </div>
          )}

          {/* Action buttons */}
          <div className="px-4 py-4 space-y-3">
            {/* Use my location button */}
            {userCoords && (
              <button
                onClick={handleUseMyLocation}
                className="w-full py-3 bg-surface border border-border rounded-lg font-medium text-white hover:bg-border transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use My Current Location
              </button>
            )}

            {/* Confirm and Cancel */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 bg-border text-muted rounded-lg font-medium hover:bg-muted/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLocation}
                disabled={!mapCenter}
                className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Enter details
  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={handleCancel} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-surface rounded-t-2xl animate-slide-up">
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-border hover:bg-muted/30 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg font-bold text-white">Add Details</h2>
              {confirmedLocation && (
                <p className="text-xs text-muted">
                  Location: {confirmedLocation.lat.toFixed(5)}, {confirmedLocation.lng.toFixed(5)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Spot Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Municipal bin near bus stop, Corner collection point"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
              maxLength={200}
              autoFocus
            />
            <p className="text-xs text-muted mt-1">Give a recognizable name for this location</p>
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
          <div className="flex gap-3 pt-2 pb-2">
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
