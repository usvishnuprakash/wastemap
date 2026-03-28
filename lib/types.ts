// Database types for DropSpot

export interface User {
  id: string
  device_id: string
  display_name: string
  reputation: number
  created_at: string
}

export interface DropSpot {
  id: string
  user_id: string | null
  name: string
  description: string
  latitude: number
  longitude: number
  status: SpotStatus
  upvotes: number
  created_at: string
  updated_at: string
  distance_m?: number
}

export interface SpotActivity {
  id: string
  spot_id: string
  user_id: string | null
  action: ActivityAction
  created_at: string
}

export type SpotStatus = 'active' | 'overflowing' | 'cleared'

export type ActivityAction =
  | 'created'
  | 'dropped_waste'
  | 'status_active'
  | 'status_overflowing'
  | 'status_cleared'
  | 'upvoted'

export interface Coordinates {
  lat: number
  lng: number
}

export interface LocationState {
  coords: Coordinates | null
  loading: boolean
  error: string | null
}

export type FilterStatus = 'all' | SpotStatus
