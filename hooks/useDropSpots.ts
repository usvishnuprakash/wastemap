'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { DropSpot, MapBounds } from '@/lib/types'
import { STORAGE_KEYS } from '@/lib/constants'

export function useDropSpots() {
  const [spots, setSpots] = useState<DropSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastBounds = useRef<MapBounds | null>(null)
  const fetchTimeout = useRef<NodeJS.Timeout | null>(null)

  // Fetch spots within map bounds
  const fetchSpotsByBounds = useCallback(async (bounds: MapBounds) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase.rpc('get_spots_in_bounds', {
        min_lat: bounds.southWest.lat,
        max_lat: bounds.northEast.lat,
        min_lng: bounds.southWest.lng,
        max_lng: bounds.northEast.lng,
      })

      if (fetchError) {
        throw fetchError
      }

      const fetchedSpots = (data as DropSpot[]) || []
      setSpots(fetchedSpots)
      lastBounds.current = bounds

      // Cache spots for offline fallback
      try {
        localStorage.setItem(STORAGE_KEYS.CACHED_SPOTS, JSON.stringify(fetchedSpots))
      } catch {
        // Ignore storage errors
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string; code?: string }
      console.error('Error fetching spots:', err)

      // Check for function not existing error
      if (errorObj?.code === 'PGRST202' || errorObj?.message?.includes('function')) {
        // Fallback: try to get all spots
        try {
          const { data: allData } = await supabase.rpc('get_all_spots')
          if (allData) {
            setSpots(allData as DropSpot[])
            return
          }
        } catch {
          // If that also fails, try direct query
          const { data: directData } = await supabase
            .from('drop_spots')
            .select('*')
            .order('upvotes', { ascending: false })
            .limit(500)

          if (directData) {
            setSpots(directData as DropSpot[])
            return
          }
        }
        setError('Run map_bounds_function.sql in Supabase SQL Editor')
      } else {
        setError(errorObj?.message || 'Failed to load spots')
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

  // Fetch all spots (initial load)
  const fetchAllSpots = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Try RPC function first
      let data: DropSpot[] | null = null

      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_spots')

      if (!rpcError && rpcData) {
        data = rpcData as DropSpot[]
      } else {
        // Fallback to direct query
        const { data: directData, error: directError } = await supabase
          .from('drop_spots')
          .select('*')
          .neq('status', 'cleared')
          .order('upvotes', { ascending: false })
          .limit(500)

        if (!directError && directData) {
          data = directData as DropSpot[]
        }
      }

      if (data) {
        setSpots(data)
        try {
          localStorage.setItem(STORAGE_KEYS.CACHED_SPOTS, JSON.stringify(data))
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      console.error('Error fetching all spots:', err)
      setError('Failed to load spots')

      // Try cached
      try {
        const cached = localStorage.getItem(STORAGE_KEYS.CACHED_SPOTS)
        if (cached) {
          setSpots(JSON.parse(cached))
        }
      } catch {
        // Ignore
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced bounds update (don't fetch on every tiny move)
  const updateBounds = useCallback((bounds: MapBounds) => {
    if (fetchTimeout.current) {
      clearTimeout(fetchTimeout.current)
    }

    fetchTimeout.current = setTimeout(() => {
      fetchSpotsByBounds(bounds)
    }, 300) // Wait 300ms after user stops moving
  }, [fetchSpotsByBounds])

  // Initial fetch - get all spots
  useEffect(() => {
    fetchAllSpots()
  }, [fetchAllSpots])

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
              if (prev.some((s) => s.id === newSpot.id)) return prev
              return [newSpot, ...prev]
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current)
      }
    }
  }, [])

  return {
    spots,
    loading,
    error,
    refetch: fetchAllSpots,
    updateBounds
  }
}
