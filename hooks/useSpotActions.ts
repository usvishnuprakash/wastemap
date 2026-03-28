'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SpotStatus, ActivityAction } from '@/lib/types'

interface AddSpotParams {
  name: string
  description?: string
  latitude: number
  longitude: number
  status: SpotStatus
  userId: string | null
}

export function useSpotActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const logActivity = async (spotId: string, userId: string | null, action: ActivityAction) => {
    await supabase.from('spot_activities').insert({
      spot_id: spotId,
      user_id: userId,
      action,
    })
  }

  const addSpot = async (params: AddSpotParams) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('drop_spots')
        .insert({
          user_id: params.userId,
          name: params.name,
          description: params.description || '',
          latitude: params.latitude,
          longitude: params.longitude,
          status: params.status,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Log creation activity
      await logActivity(data.id, params.userId, 'created')

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add spot'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (spotId: string, status: SpotStatus, userId: string | null) => {
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('drop_spots')
        .update({ status })
        .eq('id', spotId)

      if (updateError) throw updateError

      // Log status change activity
      const action = `status_${status}` as ActivityAction
      await logActivity(spotId, userId, action)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const upvoteSpot = async (spotId: string, userId: string | null) => {
    setLoading(true)
    setError(null)

    try {
      // Increment upvote count
      const { data: spot } = await supabase
        .from('drop_spots')
        .select('upvotes')
        .eq('id', spotId)
        .single()

      if (!spot) throw new Error('Spot not found')

      const { error: updateError } = await supabase
        .from('drop_spots')
        .update({ upvotes: (spot.upvotes || 0) + 1 })
        .eq('id', spotId)

      if (updateError) throw updateError

      // Log upvote activity
      await logActivity(spotId, userId, 'upvoted')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upvote'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getActivities = async (spotId: string) => {
    const { data, error: fetchError } = await supabase.rpc('get_spot_activities', {
      spot_uuid: spotId,
    })

    if (fetchError) throw fetchError
    return data || []
  }

  return {
    addSpot,
    updateStatus,
    upvoteSpot,
    getActivities,
    loading,
    error,
  }
}
