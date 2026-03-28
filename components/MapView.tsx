'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import { DropSpot, Coordinates, FilterStatus, MapBounds } from '@/lib/types'
import { OSM_TILE_URL, OSM_ATTRIBUTION, DEFAULT_CENTER } from '@/lib/constants'
import SpotMarker from './SpotMarker'

// Fix Leaflet default icon issue with Next.js
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

interface MapViewProps {
  userCoords: Coordinates | null
  spots: DropSpot[]
  filter: FilterStatus
  isAddMode: boolean
  onMapCenterChange: (coords: Coordinates) => void
  onBoundsChange: (bounds: MapBounds) => void
  onSpotSelect: (spot: DropSpot) => void
  hasExtraBanner?: boolean
  isLoading?: boolean
}

// Component to fly to a location
function FlyToLocation({ coords, trigger }: { coords: Coordinates; trigger: number }) {
  const map = useMap()

  useEffect(() => {
    if (trigger > 0) {
      map.flyTo([coords.lat, coords.lng], 14, { duration: 0.8 })
    }
  }, [map, coords.lat, coords.lng, trigger])

  return null
}

// Component to center map on user location (only once on initial load)
function InitialCenterController({ center, hasInitialized }: { center: Coordinates; hasInitialized: React.MutableRefObject<boolean> }) {
  const map = useMap()

  useEffect(() => {
    if (!hasInitialized.current) {
      map.setView([center.lat, center.lng], 14) // Zoom level 14 - neighborhood view
      hasInitialized.current = true
    }
  }, [map, center.lat, center.lng, hasInitialized])

  return null
}

// Component to track all map movements and report bounds
function MapEventHandler({
  isAddMode,
  onCenterChange,
  onBoundsChange,
}: {
  isAddMode: boolean
  onCenterChange: (coords: Coordinates) => void
  onBoundsChange: (bounds: MapBounds) => void
}) {
  const map = useMap()

  const reportBounds = useCallback(() => {
    const bounds = map.getBounds()
    onBoundsChange({
      northEast: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng },
      southWest: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng },
    })
  }, [map, onBoundsChange])

  const reportCenter = useCallback(() => {
    if (isAddMode) {
      const center = map.getCenter()
      onCenterChange({ lat: center.lat, lng: center.lng })
    }
  }, [map, isAddMode, onCenterChange])

  useMapEvents({
    moveend() {
      reportBounds()
      reportCenter()
    },
    zoomend() {
      reportBounds()
    },
    move() {
      // Only report center during add mode for real-time crosshair position
      if (isAddMode) {
        reportCenter()
      }
    },
  })

  // Report initial bounds when map loads
  useEffect(() => {
    // Small delay to ensure map is fully rendered
    const timeout = setTimeout(() => {
      reportBounds()
    }, 100)
    return () => clearTimeout(timeout)
  }, [reportBounds])

  // Report center when entering add mode
  useEffect(() => {
    if (isAddMode) {
      reportCenter()
    }
  }, [isAddMode, reportCenter])

  return null
}

export default function MapView({
  userCoords,
  spots,
  filter,
  isAddMode,
  onMapCenterChange,
  onBoundsChange,
  onSpotSelect,
  hasExtraBanner = false,
  isLoading = false,
}: MapViewProps) {
  const [mapReady, setMapReady] = useState(false)
  const [flyToTrigger, setFlyToTrigger] = useState(0)
  const hasInitializedRef = useRef(false)

  const handleLocateMe = useCallback(() => {
    if (userCoords) {
      setFlyToTrigger((prev) => prev + 1)
    }
  }, [userCoords])

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
        zoom={13}
        minZoom={10}  // Prevent zooming out beyond city level
        maxZoom={18}  // Max detail level
        className="w-full h-full"
        zoomControl={true}
        preferCanvas={true}
        whenReady={handleMapReady}
      >
        <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />

        {/* Center on user location once */}
        {mapReady && userCoords && !isAddMode && (
          <InitialCenterController center={userCoords} hasInitialized={hasInitializedRef} />
        )}

        {/* Track all map movements */}
        <MapEventHandler
          isAddMode={isAddMode}
          onCenterChange={onMapCenterChange}
          onBoundsChange={onBoundsChange}
        />

        {/* User location marker */}
        {userCoords && (
          <>
            <Circle
              center={[userCoords.lat, userCoords.lng]}
              radius={100}
              pathOptions={{
                fillColor: '#3b82f6',
                fillOpacity: 0.15,
                color: '#3b82f6',
                weight: 2,
              }}
            />
            <Marker position={[userCoords.lat, userCoords.lng]} icon={userLocationIcon} />
            <FlyToLocation coords={userCoords} trigger={flyToTrigger} />
          </>
        )}

        {/* Spot markers - always show, filtered by status */}
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
          <div className="relative" style={{ marginBottom: '60px' }}>
            {/* Shadow */}
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
            {/* Pulsing ring */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <div className="w-6 h-6 bg-purple-500/40 rounded-full animate-ping" />
              <div className="absolute inset-0 w-6 h-6 bg-purple-500/60 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Spot count indicator */}
      {!isAddMode && (
        <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border z-[500]">
          <span className="text-sm text-white">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              <>
                <span className="text-primary font-bold">{filteredSpots.length}</span> spots visible
              </>
            )}
          </span>
        </div>
      )}

      {/* Locate Me button */}
      {!isAddMode && userCoords && (
        <button
          onClick={handleLocateMe}
          className="absolute bottom-4 right-4 w-12 h-12 bg-surface/90 backdrop-blur-sm rounded-full border border-border z-[500] flex items-center justify-center shadow-lg hover:bg-surface transition-colors"
          aria-label="Go to my location"
        >
          <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  )
}
