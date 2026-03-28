'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { DropSpot } from '@/lib/types'
import { STATUS_CONFIG } from '@/lib/constants'
import { formatDistance, formatRelativeTime } from '@/lib/geo'

interface SpotMarkerProps {
  spot: DropSpot
  onSelect: (spot: DropSpot) => void
}

function createMarkerIcon(status: DropSpot['status'], upvotes: number) {
  const { color } = STATUS_CONFIG[status]

  const svg = `
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 12.627 16.227 24.718 17.107 25.44a1.5 1.5 0 001.786 0C19.773 42.718 36 30.627 36 18c0-9.94-8.06-18-18-18z" fill="${color}"/>
      <circle cx="18" cy="18" r="8" fill="white"/>
      <text x="18" y="22" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold">${upvotes > 99 ? '99+' : upvotes}</text>
    </svg>
  `

  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  })
}

export default function SpotMarker({ spot, onSelect }: SpotMarkerProps) {
  const icon = createMarkerIcon(spot.status, spot.upvotes)
  const { label, bgColor } = STATUS_CONFIG[spot.status]

  return (
    <Marker position={[spot.latitude, spot.longitude]} icon={icon}>
      <Popup>
        <div className="min-w-[200px] -m-2">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-gray-900 leading-tight">{spot.name}</h3>
            <span className={`${bgColor} text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap`}>
              {label}
            </span>
          </div>

          {spot.distance_m !== undefined && (
            <p className="text-sm text-gray-600 mb-1">{formatDistance(spot.distance_m)} away</p>
          )}

          <p className="text-xs text-gray-500 mb-3">Updated {formatRelativeTime(spot.updated_at)}</p>

          <button
            onClick={() => onSelect(spot)}
            className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            View Details
          </button>
        </div>
      </Popup>
    </Marker>
  )
}
