'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { STORAGE_KEYS } from '@/lib/constants'

function generateDeviceId(): string {
  return 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get or create device ID
        let storedDeviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID)

        if (!storedDeviceId) {
          storedDeviceId = generateDeviceId()
          localStorage.setItem(STORAGE_KEYS.DEVICE_ID, storedDeviceId)
        }

        setDeviceId(storedDeviceId)

        // Check if we have a cached user ID
        const storedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID)

        if (storedUserId) {
          // Verify the user still exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', storedUserId)
            .single()

          if (existingUser) {
            setUserId(existingUser.id)
            setLoading(false)
            return
          }
        }

        // Check if user exists with this device ID
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('device_id', storedDeviceId)
          .single()

        if (existingUser) {
          setUserId(existingUser.id)
          localStorage.setItem(STORAGE_KEYS.USER_ID, existingUser.id)
        } else {
          // Create new user
          const { data: newUser, error } = await supabase
            .from('users')
            .insert({ device_id: storedDeviceId })
            .select('id')
            .single()

          if (error) {
            console.error('Error creating user:', error)
          } else if (newUser) {
            setUserId(newUser.id)
            localStorage.setItem(STORAGE_KEYS.USER_ID, newUser.id)
          }
        }
      } catch (error) {
        console.error('Auth error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  return { userId, deviceId, loading }
}
