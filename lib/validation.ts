/**
 * Security validation utilities for WasteMap
 * Prevents XSS, SQL injection, and malicious input
 */

// HTML entities to escape
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/**
 * Escape HTML to prevent XSS attacks
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * Sanitize user input - removes potentially dangerous content
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return ''

  return input
    // Remove any HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol
    .replace(/data:/gi, '')
    // Remove event handlers
    .replace(/on\w+=/gi, '')
    // Trim whitespace
    .trim()
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
}

/**
 * Validate spot name
 */
export function validateSpotName(name: string): { valid: boolean; error?: string; sanitized: string } {
  const sanitized = sanitizeInput(name)

  if (!sanitized) {
    return { valid: false, error: 'Name is required', sanitized: '' }
  }

  if (sanitized.length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters', sanitized }
  }

  if (sanitized.length > 200) {
    return { valid: false, error: 'Name must be less than 200 characters', sanitized: sanitized.slice(0, 200) }
  }

  // Check for suspicious patterns (SQL injection attempts)
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b\s+\d+\s*=\s*\d+)/i,
    /(\bAND\b\s+\d+\s*=\s*\d+)/i,
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      return { valid: false, error: 'Invalid characters in name', sanitized: '' }
    }
  }

  return { valid: true, sanitized }
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lat: number, lng: number): { valid: boolean; error?: string } {
  // Check if numbers
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { valid: false, error: 'Invalid coordinate format' }
  }

  // Check for NaN or Infinity
  if (!isFinite(lat) || !isFinite(lng)) {
    return { valid: false, error: 'Invalid coordinate values' }
  }

  // Valid latitude range: -90 to 90
  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' }
  }

  // Valid longitude range: -180 to 180
  if (lng < -180 || lng > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' }
  }

  // Check for null island (0,0) - often indicates error
  if (lat === 0 && lng === 0) {
    return { valid: false, error: 'Invalid location' }
  }

  return { valid: true }
}

/**
 * Validate status value
 */
export function validateStatus(status: string): boolean {
  const validStatuses = ['active', 'overflowing', 'cleared']
  return validStatuses.includes(status)
}

/**
 * Rate limiting check using localStorage
 * Returns true if action is allowed, false if rate limited
 */
export function checkRateLimit(action: string, maxPerMinute: number = 5): boolean {
  const key = `wastemap_ratelimit_${action}`
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window

  try {
    const stored = localStorage.getItem(key)
    const timestamps: number[] = stored ? JSON.parse(stored) : []

    // Filter timestamps within the window
    const recentTimestamps = timestamps.filter((t) => now - t < windowMs)

    if (recentTimestamps.length >= maxPerMinute) {
      return false // Rate limited
    }

    // Add current timestamp and save
    recentTimestamps.push(now)
    localStorage.setItem(key, JSON.stringify(recentTimestamps))

    return true // Allowed
  } catch {
    // If localStorage fails, allow the action
    return true
  }
}

/**
 * Get remaining rate limit
 */
export function getRateLimitRemaining(action: string, maxPerMinute: number = 5): number {
  const key = `wastemap_ratelimit_${action}`
  const now = Date.now()
  const windowMs = 60 * 1000

  try {
    const stored = localStorage.getItem(key)
    const timestamps: number[] = stored ? JSON.parse(stored) : []
    const recentTimestamps = timestamps.filter((t) => now - t < windowMs)
    return Math.max(0, maxPerMinute - recentTimestamps.length)
  } catch {
    return maxPerMinute
  }
}
