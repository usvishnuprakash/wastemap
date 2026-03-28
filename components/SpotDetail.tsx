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

  const { label, bgColor } = STATUS_CONFIG[spot.status]

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
              <div className="flex items-center gap-2 text-sm">
                <span className={`${bgColor} text-white px-2 py-0.5 rounded-full text-xs`}>{label}</span>
                {spot.distance_m !== undefined && (
                  <span className="text-muted">{formatDistance(spot.distance_m)} away</span>
                )}
              </div>
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

          {/* Upvote button */}
          <button
            onClick={handleUpvote}
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium mb-4 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirm Location ({spot.upvotes})
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
