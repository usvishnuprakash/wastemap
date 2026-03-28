import { SpotStatus, FilterStatus } from './types'

// Map configuration
export const DEFAULT_ZOOM = 16
export const DEFAULT_RADIUS_M = 1000 // 1km radius for fetching spots
export const LOCATION_CHANGE_THRESHOLD_M = 50 // Refetch when user moves 50m

// Status configuration - internal values stay same, display labels are user-friendly
export const STATUS_CONFIG: Record<SpotStatus, { label: string; color: string; bgColor: string; icon: string; description: string }> = {
  active: {
    label: 'Available',
    color: '#22c55e',
    bgColor: 'bg-green-500',
    icon: '🟢',
    description: 'Accepting waste',
  },
  overflowing: {
    label: 'Full',
    color: '#f59e0b',
    bgColor: 'bg-amber-500',
    icon: '🟡',
    description: 'Temporarily full',
  },
  cleared: {
    label: 'Closed',
    color: '#6b7280',
    bgColor: 'bg-gray-500',
    icon: '⚪',
    description: 'Not accepting waste',
  },
}

// Filter options
export const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: '🟢 Available' },
  { value: 'overflowing', label: '🟡 Full' },
  { value: 'cleared', label: '⚪ Closed' },
]

// Activity action labels
export const ACTIVITY_LABELS: Record<string, string> = {
  created: 'Spot added',
  dropped_waste: 'Waste disposed here',
  status_active: 'Marked as available',
  status_overflowing: 'Marked as full',
  status_cleared: 'Marked as closed',
  upvoted: 'Location verified',
}

// OpenStreetMap tile configuration
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Local storage keys
export const STORAGE_KEYS = {
  DEVICE_ID: 'wastemap_device_id',
  USER_ID: 'wastemap_user_id',
  CACHED_SPOTS: 'wastemap_cached_spots',
  ONBOARDING_COMPLETE: 'wastemap_onboarding_complete',
}

// Waste types that can be accepted at a spot
export const WASTE_TYPES = [
  { id: 'dry', label: 'Dry Waste', icon: '📦', description: 'Paper, plastic, metal, glass' },
  { id: 'wet', label: 'Wet Waste', icon: '🥬', description: 'Food scraps, organic waste' },
  { id: 'ewaste', label: 'E-Waste', icon: '🔌', description: 'Electronics, batteries' },
  { id: 'hazardous', label: 'Hazardous', icon: '⚠️', description: 'Chemicals, medical waste' },
  { id: 'bulk', label: 'Bulk Waste', icon: '🛋️', description: 'Furniture, large items' },
]

// Default center (Bangalore, India) - used when geolocation fails
export const DEFAULT_CENTER = {
  lat: 12.9716,
  lng: 77.5946,
}
