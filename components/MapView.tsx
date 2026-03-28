'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import { DropSpot, Coordinates, FilterStatus } from '@/lib/types'
import { OSM_TILE_URL, OSM_ATTRIBUTION, DEFAULT_ZOOM, DEFAULT_CENTER } from '@/lib/constants'
import SpotMarker from './SpotMarker'

// Fix Leaflet default icon issue with Next.js
// This runs only on client side
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet')
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// User location marker icon (blue pulsing)
const userLocationIcon = L.divIcon({
  html: `
    <div class="relative">
      <div class="absolute w-6 h-6 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
      <div class="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
    </div>
  `,
  className: 'user-location-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

// Temporary pin icon (for adding new spots)
const tempPinIcon = L.divIcon({
  html: `
    <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 12.627 16.227 24.718 17.107 25.44a1.5 1.5 0 001.786 0C19.773 42.718 36 30.627 36 18c0-9.94-8.06-18-18-18z" fill="#6366f1"/>
      <circle cx="18" cy="18" r="8" fill="white"/>
      <path d="M14 18h8M18 14v8" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  className: 'temp-pin-marker',
  iconSize: [36, 44],
  iconAnchor: [18, 44],
})

interface MapViewProps {
  userCoords: Coordinates | null
  spots: DropSpot[]
  filter: FilterStatus
  isAddMode: boolean
  onMapCenterChange: (coords: Coordinates) => void
  onSpotSelect: (spot: DropSpot) => void
  hasExtraBanner?: boolean
}

// Component to handle map centering
function MapController({ center }: { center: Coordinates }) {
  const map = useMap()

  useEffect(() => {
    map.setView([center.lat, center.lng], DEFAULT_ZOOM)
  }, [map, center.lat, center.lng])

  return null
}

// Component to track map center when dragging (for add mode)
function MapCenterTracker({
  isAddMode,
  onCenterChange,
}: {
  isAddMode: boolean
  onCenterChange: (coords: Coordinates) => void
}) {
  const map = useMap()

  useMapEvents({
    moveend() {
      if (isAddMode) {
        const center = map.getCenter()
        onCenterChange({ lat: center.lat, lng: center.lng })
      }
    },
    move() {
      if (isAddMode) {
        const center = map.getCenter()
        onCenterChange({ lat: center.lat, lng: center.lng })
      }
    },
  })

  // Send initial center when entering add mode
  useEffect(() => {
    if (isAddMode) {
      const center = map.getCenter()
      onCenterChange({ lat: center.lat, lng: center.lng })
    }
  }, [isAddMode, map, onCenterChange])

  return null
}

export default function MapView({
  userCoords,
  spots,
  filter,
  isAddMode,
  onMapCenterChange,
  onSpotSelect,
  hasExtraBanner = false,
}: MapViewProps) {
  const [mapReady, setMapReady] = useState(false)

  // Filter spots based on selected filter
  const filteredSpots = spots.filter((spot) => {
    if (filter === 'all') return true
    return spot.status === filter
  })

  const center = userCoords || DEFAULT_CENTER

  const handleMapReady = useCallback(() => {
    setMapReady(true)
  }, [])

  // 120px = header (72px) + filter bar (48px), +32px for extra banner
  const topPadding = hasExtraBanner ? 'pt-[152px]' : 'pt-[120px]'

  return (
    <div className={`fixed inset-0 ${topPadding}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={false}
        preferCanvas={true}
        whenReady={handleMapReady}
      >
        <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />

        {mapReady && userCoords && !isAddMode && <MapController center={userCoords} />}

        <MapCenterTracker isAddMode={isAddMode} onCenterChange={onMapCenterChange} />

        {/* User location marker */}
        {userCoords && (
          <>
            <Circle
              center={[userCoords.lat, userCoords.lng]}
              radius={50}
              pathOptions={{
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                color: '#3b82f6',
                weight: 1,
              }}
            />
            <Marker position={[userCoords.lat, userCoords.lng]} icon={userLocationIcon} />
          </>
        )}

        {/* Spot markers - hide in add mode for cleaner view */}
        {!isAddMode && filteredSpots.map((spot) => (
          <SpotMarker key={spot.id} spot={spot} onSelect={onSpotSelect} />
        ))}
      </MapContainer>

      {/* Crosshair overlay for add mode - FIXED in center */}
      {isAddMode && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ zIndex: 1000 }}
        >
          {/* Crosshair pin - larger and more visible */}
          <div className="relative" style={{ marginBottom: '60px' }}>
            {/* Shadow for better visibility */}
            <div className="absolute inset-0 blur-sm opacity-50">
              <svg width="56" height="68" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 0C8.06 0 0 8.06 0 18c0 12.627 16.227 24.718 17.107 25.44a1.5 1.5 0 001.786 0C19.773 42.718 36 30.627 36 18c0-9.94-8.06-18-18-18z" fill="#000"/>
              </svg>
            </div>
            {/* Main pin */}
            <svg width="56" height="68" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative drop-shadow-lg">
              <path d="M18 0C8.06 0 0 8.06 0 18c0 12.627 16.227 24.718 17.107 25.44a1.5 1.5 0 001.786 0C19.773 42.718 36 30.627 36 18c0-9.94-8.06-18-18-18z" fill="#8b5cf6"/>
              <path d="M18 0C8.06 0 0 8.06 0 18c0 12.627 16.227 24.718 17.107 25.44a1.5 1.5 0 001.786 0C19.773 42.718 36 30.627 36 18c0-9.94-8.06-18-18-18z" fill="url(#gradient)" />
              <circle cx="18" cy="18" r="9" fill="white"/>
              <circle cx="18" cy="18" r="4" fill="#8b5cf6"/>
              <defs>
                <linearGradient id="gradient" x1="18" y1="0" x2="18" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a78bfa"/>
                  <stop offset="1" stopColor="#7c3aed"/>
                </linearGradient>
              </defs>
            </svg>
            {/* Pulsing ring at bottom */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <div className="w-6 h-6 bg-purple-500/40 rounded-full animate-ping" />
              <div className="absolute inset-0 w-6 h-6 bg-purple-500/60 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
