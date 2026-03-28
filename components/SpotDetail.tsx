'use client'

import { useState, useEffect } from 'react'
import { DropSpot, SpotStatus, SpotActivity } from '@/lib/types'
import { STATUS_CONFIG, ACTIVITY_LABELS } from '@/lib/constants'
import { formatDistance, formatRelativeTime } from '@/lib/geo'
import { useSpotActions } from '@/hooks/useSpotActions'

interface SpotDetailProps {
  spot: DropSpot
  userId: string | null
  onClose: () => void
  onUpdate: () => void
}

export default function SpotDetail({ spot, userId, onClose, onUpdate }: SpotDetailProps) {
  const [activities, setActivities] = useState<SpotActivity[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const { updateStatus, upvoteSpot, getActivities, loading } = useSpotActions()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getActivities(spot.id)
        setActivities(data)
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setLoadingActivities(false)
      }
    }
    fetchActivities()
  }, [spot.id, getActivities])

  const handleStatusUpdate = async (status: SpotStatus) => {
    try {
      await updateStatus(spot.id, status, userId)
      onUpdate()
    } catch {
      // Error handled in hook
    }
  }

  const handleUpvote = async () => {
    try {
      await upvoteSpot(spot.id, userId)
      onUpdate()
    } catch {
      // Error handled in hook
    }
  }

  const { label, bgColor, description: statusDescription } = STATUS_CONFIG[spot.status]

  // Detect iOS for Apple Maps
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)

  // Generate directions URL - Use coordinates with encoded name
  const openDirections = () => {
    const lat = spot.latitude
    const lng = spot.longitude
    const encodedName = encodeURIComponent(spot.name)

    let url: string
    if (isIOS) {
      // Apple Maps - supports custom label with 'q' parameter
      url = `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d&t=m`
    } else {
      // Google Maps - pass exact coordinates for navigation
      // Using 'dir' endpoint with destination coordinates
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving`
    }

    window.open(url, '_blank')
  }

  // Open spot location in maps (not directions, just view the spot)
  const openInMaps = () => {
    const lat = spot.latitude
    const lng = spot.longitude
    const encodedName = encodeURIComponent(spot.name)

    let url: string
    if (isIOS) {
      url = `https://maps.apple.com/?q=${encodedName}&ll=${lat},${lng}&z=17`
    } else {
      // Google Maps search with coordinates - shows pin at exact location
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    }

    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-surface rounded-t-2xl max-h-[80vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-bold text-white mb-1">{spot.name}</h2>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className={`${bgColor} text-white px-2 py-0.5 rounded-full text-xs`}>{label}</span>
                <span className="text-muted text-xs">{statusDescription}</span>
              </div>
              {spot.distance_m !== undefined && (
                <p className="text-muted text-sm mt-1">{formatDistance(spot.distance_m)} away from you</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-border hover:bg-muted/30 transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {/* Description */}
          {spot.description && <p className="text-muted mb-4">{spot.description}</p>}

          {/* Coordinates display */}
          <div className="bg-border/50 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-muted">
              📍 {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2 mb-3">
            {/* GET DIRECTIONS - Primary Action */}
            <button
              onClick={openDirections}
              className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Navigate
            </button>

            {/* View in Maps */}
            <button
              onClick={openInMaps}
              className="bg-surface border border-border text-white py-4 px-4 rounded-lg font-medium hover:bg-border transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open
            </button>
          </div>

          {/* Verify/Upvote button */}
          <button
            onClick={handleUpvote}
            disabled={loading}
            className="w-full bg-surface border border-primary text-primary py-3 rounded-lg font-medium mb-4 hover:bg-primary/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Verify Location ({spot.upvotes} verified)
          </button>

          {/* Status update */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted mb-2">Update Status</h3>
            <div className="flex gap-2">
              {(['active', 'overflowing', 'cleared'] as SpotStatus[]).map((status) => {
                const config = STATUS_CONFIG[status]
                const isActive = spot.status === status
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={loading || isActive}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? `${config.bgColor} text-white`
                        : 'bg-border text-muted hover:bg-muted/30 disabled:opacity-50'
                    }`}
                  >
                    {config.icon} {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Activity log */}
          <div>
            <h3 className="text-sm font-medium text-muted mb-2">Recent Activity</h3>
            {loadingActivities ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-border rounded animate-pulse" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-muted">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-white">{ACTIVITY_LABELS[activity.action] || activity.action}</span>
                    <span className="text-xs text-muted">{formatRelativeTime(activity.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
