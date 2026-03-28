'use client'

import { useState, useEffect, useCallback } from 'react'
import { Coordinates, LocationState } from '@/lib/types'
import { DEFAULT_CENTER } from '@/lib/constants'

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    coords: null,
    loading: true,
    error: null,
  })
  const [usingDefault, setUsingDefault] = useState(false)

  // Check if we're on HTTPS or localhost (required for geolocation on mobile)
  const isSecureContext = typeof window !== 'undefined' &&
    (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  const useDefaultLocation = useCallback(() => {
    setUsingDefault(true)
    setState({
      coords: DEFAULT_CENTER,
      loading: false,
      error: null,
    })
  }, [])

  const getCurrentLocation = useCallback(() => {
    // Check if geolocation is available
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({
        coords: null,
        loading: false,
        error: 'Geolocation not supported. Use default location or try a different browser.',
      })
      return
    }

    // Check for secure context (HTTPS required on mobile)
    if (!isSecureContext) {
      setState({
        coords: null,
        loading: false,
        error: 'Location requires HTTPS. Use default location or deploy to Vercel.',
      })
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    // Request permission with a timeout
    const timeoutId = setTimeout(() => {
      setState((prev) => {
        if (prev.loading) {
          return {
            coords: null,
            loading: false,
            error: 'Location request timed out. Tap "Use Default Location" or check browser settings.',
          }
        }
        return prev
      })
    }, 15000)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId)
        setUsingDefault(false)
        setState({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          loading: false,
          error: null,
        })
      },
      (error) => {
        clearTimeout(timeoutId)
        let errorMessage = 'Unable to get your location'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location denied. Enable in browser settings or use default location.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable. Try again or use default location.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location timed out. Try again or use default location.'
            break
        }

        setState({
          coords: null,
          loading: false,
          error: errorMessage,
        })
      },
      {
        enableHighAccuracy: false, // Start with low accuracy for faster response
        timeout: 10000,
        maximumAge: 60000, // Accept cached position up to 1 minute old
      }
    )
  }, [isSecureContext])

  // Watch position for continuous updates
  useEffect(() => {
    getCurrentLocation()

    let watchId: number | undefined

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setState({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            loading: false,
            error: null,
          })
        },
        () => {
          // Silently ignore watch errors - we already have initial position
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      )
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [getCurrentLocation])

  return {
    ...state,
    lat: state.coords?.lat ?? null,
    lng: state.coords?.lng ?? null,
    refetch: getCurrentLocation,
    useDefaultLocation,
    usingDefault,
    isSecureContext,
  }
}
