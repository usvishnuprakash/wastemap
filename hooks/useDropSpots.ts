'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { DropSpot, Coordinates } from '@/lib/types'
import { DEFAULT_RADIUS_M, LOCATION_CHANGE_THRESHOLD_M, STORAGE_KEYS } from '@/lib/constants'
import { haversineDistance } from '@/lib/geo'

export function useDropSpots(userCoords: Coordinates | null) {
  const [spots, setSpots] = useState<DropSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetchCoords = useRef<Coordinates | null>(null)

  const fetchSpots = useCallback(async (coords: Coordinates) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase.rpc('get_nearby_spots', {
        user_lat: coords.lat,
        user_lng: coords.lng,
        radius_m: DEFAULT_RADIUS_M,
      })

      if (fetchError) {
        throw fetchError
      }

      const fetchedSpots = (data as DropSpot[]) || []
      setSpots(fetchedSpots)
      lastFetchCoords.current = coords

      // Cache spots for offline fallback
      try {
        localStorage.setItem(STORAGE_KEYS.CACHED_SPOTS, JSON.stringify(fetchedSpots))
      } catch {
        // Ignore storage errors
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string; code?: string; hint?: string }
      console.error('Error fetching spots:', JSON.stringify(err, null, 2))

      // Check for common errors
      if (errorObj?.code === 'PGRST202' || errorObj?.message?.includes('function')) {
        setError('Database not set up. Run schema.sql in Supabase SQL Editor.')
      } else if (errorObj?.message?.includes('placeholder')) {
        setError('Supabase credentials not configured. Check .env.local')
      } else {
        setError(errorObj?.message || 'Failed to load nearby spots')
      }

      // Try to load cached spots
      try {
        const cached = localStorage.getItem(STORAGE_KEYS.CACHED_SPOTS)
        if (cached) {
          setSpots(JSON.parse(cached))
        }
      } catch {
        // Ignore cache errors
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch and refetch when location changes significantly
  useEffect(() => {
    if (!userCoords) return

    const shouldRefetch =
      !lastFetchCoords.current ||
      haversineDistance(lastFetchCoords.current, userCoords) > LOCATION_CHANGE_THRESHOLD_M

    if (shouldRefetch) {
      fetchSpots(userCoords)
    }
  }, [userCoords, fetchSpots])

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('drop_spots_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drop_spots',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newSpot = payload.new as DropSpot
            setSpots((prev) => {
              // Avoid duplicates
              if (prev.some((s) => s.id === newSpot.id)) return prev
              return [...prev, newSpot]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedSpot = payload.new as DropSpot
            setSpots((prev) =>
              prev.map((spot) => (spot.id === updatedSpot.id ? { ...spot, ...updatedSpot } : spot))
            )
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id
            setSpots((prev) => prev.filter((spot) => spot.id !== deletedId))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const refetch = useCallback(() => {
    if (userCoords) {
      fetchSpots(userCoords)
    }
  }, [userCoords, fetchSpots])

  return { spots, loading, error, refetch }
}
