-- =============================================
-- WasteMap - Fetch spots by map bounds
-- This enables proper zoom behavior
-- Run this in Supabase SQL Editor
-- =============================================

-- Function to get spots within visible map bounds
CREATE OR REPLACE FUNCTION get_spots_in_bounds(
  min_lat DOUBLE PRECISION,
  max_lat DOUBLE PRECISION,
  min_lng DOUBLE PRECISION,
  max_lng DOUBLE PRECISION
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT,
  upvotes INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.id,
    ds.user_id,
    ds.name,
    ds.description,
    ds.latitude,
    ds.longitude,
    ds.status,
    ds.upvotes,
    ds.created_at,
    ds.updated_at
  FROM drop_spots ds
  WHERE ds.latitude BETWEEN min_lat AND max_lat
    AND ds.longitude BETWEEN min_lng AND max_lng
    AND NOT (ds.status = 'cleared' AND ds.updated_at < now() - INTERVAL '48 hours')
  ORDER BY ds.upvotes DESC, ds.updated_at DESC
  LIMIT 500;
END;
$$ LANGUAGE plpgsql;

-- Also create a simple function to get ALL spots (for small datasets)
CREATE OR REPLACE FUNCTION get_all_spots()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT,
  upvotes INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.id,
    ds.user_id,
    ds.name,
    ds.description,
    ds.latitude,
    ds.longitude,
    ds.status,
    ds.upvotes,
    ds.created_at,
    ds.updated_at
  FROM drop_spots ds
  WHERE NOT (ds.status = 'cleared' AND ds.updated_at < now() - INTERVAL '48 hours')
  ORDER BY ds.upvotes DESC, ds.updated_at DESC
  LIMIT 1000;
END;
$$ LANGUAGE plpgsql;

-- Add index for bounding box queries
CREATE INDEX IF NOT EXISTS idx_drop_spots_lat_lng
  ON drop_spots (latitude, longitude);
