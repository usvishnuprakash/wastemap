'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { DropSpot, Coordinates, FilterStatus } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/constants'
import { useLocation } from '@/hooks/useLocation'
import { useDropSpots } from '@/hooks/useDropSpots'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/Header'
import FilterBar from '@/components/FilterBar'
import AddSpotFlow from '@/components/AddSpotFlow'
import SpotDetail from '@/components/SpotDetail'
import Toast from '@/components/Toast'
import Onboarding from '@/components/Onboarding'
import AboutModal from '@/components/AboutModal'

// Dynamic import for MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 pt-[120px] bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted">Loading map...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  // Auth state
  const { userId } = useAuth()

  // Location state
  const {
    coords,
    loading: locationLoading,
    error: locationError,
    refetch: refetchLocation,
    useDefaultLocation,
    usingDefault,
    isSecureContext,
  } = useLocation()

  // Spots data
  const { spots, loading: spotsLoading, refetch: refetchSpots } = useDropSpots(coords)

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  // Check if onboarding is needed on mount
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE)
    if (!completed) {
      setShowOnboarding(true)
    }
    setOnboardingChecked(true)
  }, [])

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true')
    setShowOnboarding(false)
  }, [])

  // UI state
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [isAddMode, setIsAddMode] = useState(false)
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<DropSpot | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  // Filter spots for count
  const filteredSpots = spots.filter((spot) => {
    if (filter === 'all') return true
    return spot.status === filter
  })

  // Handlers
  const handleEnterAddMode = useCallback(() => {
    setIsAddMode(true)
  }, [])

  const handleExitAddMode = useCallback(() => {
    setIsAddMode(false)
  }, [])

  const handleMapCenterChange = useCallback((center: Coordinates) => {
    setMapCenter(center)
  }, [])

  const handleUseMyLocation = useCallback(() => {
    if (coords) {
      setMapCenter(coords)
    }
  }, [coords])

  const handleAddSuccess = useCallback(() => {
    setIsAddMode(false)
    setToast({ message: 'Waste spot added successfully!', type: 'success' })
    refetchSpots()
  }, [refetchSpots])

  const handleSpotSelect = useCallback((spot: DropSpot) => {
    setSelectedSpot(spot)
  }, [])

  const handleSpotClose = useCallback(() => {
    setSelectedSpot(null)
  }, [])

  const handleSpotUpdate = useCallback(() => {
    refetchSpots()
    setToast({ message: 'Spot updated!', type: 'success' })
  }, [refetchSpots])

  // Show onboarding on first visit
  if (showOnboarding && onboardingChecked) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  // Wait for onboarding check before showing anything
  if (!onboardingChecked) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Show location error if geolocation failed and not loading
  if (!locationLoading && locationError && !coords) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
            <svg className="w-10 h-10 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Location Access</h2>
          <p className="text-muted mb-6">{locationError}</p>

          <div className="space-y-3">
            <button
              onClick={refetchLocation}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={useDefaultLocation}
              className="w-full bg-surface border border-border text-white px-6 py-3 rounded-lg font-medium hover:bg-border transition-colors"
            >
              Use Default Location (Bangalore)
            </button>
          </div>

          {!isSecureContext && (
            <p className="text-xs text-warning mt-4">
              Tip: Location requires HTTPS. Deploy to Vercel for full functionality.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Show loading state while getting initial location
  if (locationLoading && !coords) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="absolute inset-2 bg-primary rounded-full" />
          </div>
          <h2 className="text-lg font-medium text-white mb-2">Getting your location...</h2>
          <p className="text-sm text-muted mb-6">
            {isSecureContext
              ? 'Please allow location access when prompted'
              : 'Checking location permissions...'}
          </p>

          <button
            onClick={useDefaultLocation}
            className="text-primary text-sm underline hover:no-underline"
          >
            Skip and use default location
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="h-screen overflow-hidden bg-background">
      {/* Header */}
      <Header spotCount={filteredSpots.length} onAboutClick={() => setShowAbout(true)} />

      {/* Default location banner */}
      {usingDefault && (
        <div className="fixed top-[72px] left-0 right-0 z-[1001] bg-warning/20 border-b border-warning/30 px-4 py-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-warning">
              Using default location (Bangalore). Enable location for accurate results.
            </p>
            <button
              onClick={refetchLocation}
              className="text-xs text-warning font-medium underline"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <FilterBar activeFilter={filter} onFilterChange={setFilter} />

      {/* Map */}
      <MapView
        userCoords={coords}
        spots={spots}
        filter={filter}
        isAddMode={isAddMode}
        onMapCenterChange={handleMapCenterChange}
        onSpotSelect={handleSpotSelect}
        hasExtraBanner={usingDefault}
      />

      {/* Add spot flow */}
      <AddSpotFlow
        isAddMode={isAddMode}
        mapCenter={mapCenter}
        userCoords={coords}
        userId={userId}
        onEnterAddMode={handleEnterAddMode}
        onExitAddMode={handleExitAddMode}
        onUseMyLocation={handleUseMyLocation}
        onSuccess={handleAddSuccess}
      />

      {/* Spot detail panel */}
      {selectedSpot && (
        <SpotDetail
          spot={selectedSpot}
          userId={userId}
          onClose={handleSpotClose}
          onUpdate={handleSpotUpdate}
        />
      )}

      {/* Loading overlay for spots */}
      {spotsLoading && spots.length === 0 && (
        <div className="fixed bottom-24 left-4 right-4 bg-surface border border-border rounded-lg p-4 z-[1000]">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted">Loading nearby spots...</span>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* About modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </main>
  )
}
