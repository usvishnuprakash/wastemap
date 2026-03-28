import { SpotStatus, FilterStatus } from './types'

// Map configuration
export const DEFAULT_ZOOM = 16
export const DEFAULT_RADIUS_M = 1000 // 1km radius for fetching spots
export const LOCATION_CHANGE_THRESHOLD_M = 50 // Refetch when user moves 50m

// Status configuration
export const STATUS_CONFIG: Record<SpotStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  active: {
    label: 'Active',
    color: '#22c55e',
    bgColor: 'bg-green-500',
    icon: '🟢',
  },
  overflowing: {
    label: 'Overflowing',
    color: '#f59e0b',
    bgColor: 'bg-amber-500',
    icon: '🟡',
  },
  cleared: {
    label: 'Cleared',
    color: '#6b7280',
    bgColor: 'bg-gray-500',
    icon: '⚪',
  },
}

// Filter options
export const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: '🟢 Active' },
  { value: 'overflowing', label: '🟡 Overflowing' },
  { value: 'cleared', label: '⚪ Cleared' },
]

// Activity action labels
export const ACTIVITY_LABELS: Record<string, string> = {
  created: 'Spot created',
  dropped_waste: 'Waste dropped',
  status_active: 'Marked as active',
  status_overflowing: 'Marked as overflowing',
  status_cleared: 'Marked as cleared',
  upvoted: 'Confirmed location',
}

// OpenStreetMap tile configuration
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Local storage keys
export const STORAGE_KEYS = {
  DEVICE_ID: 'wastemap_device_id',
  USER_ID: 'wastemap_user_id',
  CACHED_SPOTS: 'wastemap_cached_spots',
}

// Default center (Bangalore, India) - used when geolocation fails
export const DEFAULT_CENTER = {
  lat: 12.9716,
  lng: 77.5946,
}
