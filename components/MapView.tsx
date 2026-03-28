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
  pinLocation: Coordinates | null
  onPinPlace: (coords: Coordinates) => void
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

// Component to handle map clicks
function MapClickHandler({
  isAddMode,
  onPinPlace,
}: {
  isAddMode: boolean
  onPinPlace: (coords: Coordinates) => void
}) {
  useMapEvents({
    click(e) {
      if (isAddMode) {
        onPinPlace({ lat: e.latlng.lat, lng: e.latlng.lng })
      }
    },
  })

  return null
}

export default function MapView({
  userCoords,
  spots,
  filter,
  isAddMode,
  pinLocation,
  onPinPlace,
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

        {mapReady && userCoords && <MapController center={userCoords} />}

        <MapClickHandler isAddMode={isAddMode} onPinPlace={onPinPlace} />

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

        {/* Spot markers */}
        {filteredSpots.map((spot) => (
          <SpotMarker key={spot.id} spot={spot} onSelect={onSpotSelect} />
        ))}

        {/* Temporary pin when adding */}
        {isAddMode && pinLocation && (
          <Marker position={[pinLocation.lat, pinLocation.lng]} icon={tempPinIcon} />
        )}
      </MapContainer>

      {/* Add mode overlay */}
      {isAddMode && !pinLocation && (
        <div className="absolute inset-0 pointer-events-none bg-black/10 flex items-center justify-center">
          <div className="text-center text-white drop-shadow-lg">
            <svg
              className="w-12 h-12 mx-auto mb-2 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            <p className="font-medium">Tap to place pin</p>
          </div>
        </div>
      )}
    </div>
  )
}
