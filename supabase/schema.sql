-- DropSpot Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Enable PostGIS extension for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- TABLES
-- ============================================

-- Users table (anonymous device-based authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  display_name TEXT DEFAULT 'Anonymous',
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Drop spots - the core table
CREATE TABLE IF NOT EXISTS drop_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (char_length(name) > 0 AND char_length(name) <= 200),
  description TEXT DEFAULT '',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(Point, 4326),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'overflowing', 'cleared')),
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Spot activity ledger - tracks all actions on spots
CREATE TABLE IF NOT EXISTS spot_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID NOT NULL REFERENCES drop_spots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'dropped_waste', 'status_active', 'status_overflowing', 'status_cleared', 'upvoted')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Spatial index for fast geographic queries
CREATE INDEX IF NOT EXISTS idx_drop_spots_location ON drop_spots USING GIST (location);

-- Status and time-based indexes
CREATE INDEX IF NOT EXISTS idx_drop_spots_status ON drop_spots (status);
CREATE INDEX IF NOT EXISTS idx_drop_spots_updated ON drop_spots (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_spot_activities_spot ON spot_activities (spot_id, created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-generate geography column from lat/lng and update timestamp
CREATE OR REPLACE FUNCTION update_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_location ON drop_spots;
CREATE TRIGGER trigger_update_location
  BEFORE INSERT OR UPDATE ON drop_spots
  FOR EACH ROW EXECUTE FUNCTION update_location();

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Fetch nearby spots within a radius (in meters)
-- Called from frontend: supabase.rpc('get_nearby_spots', { user_lat, user_lng, radius_m })
CREATE OR REPLACE FUNCTION get_nearby_spots(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_m INTEGER DEFAULT 1000
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
  updated_at TIMESTAMPTZ,
  distance_m DOUBLE PRECISION
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
    ds.updated_at,
    ST_Distance(
      ds.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance_m
  FROM drop_spots ds
  WHERE ST_DWithin(
    ds.location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_m
  )
  -- Hide spots marked as cleared for more than 48 hours
  AND NOT (ds.status = 'cleared' AND ds.updated_at < now() - INTERVAL '48 hours')
  ORDER BY distance_m ASC;
END;
$$ LANGUAGE plpgsql;

-- Fetch activity log for a specific spot
CREATE OR REPLACE FUNCTION get_spot_activities(spot_uuid UUID)
RETURNS TABLE (
  id UUID,
  action TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT sa.id, sa.action, sa.created_at
  FROM spot_activities sa
  WHERE sa.spot_id = spot_uuid
  ORDER BY sa.created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_activities ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Allow all reads on users" ON users;
CREATE POLICY "Allow all reads on users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow inserts on users" ON users;
CREATE POLICY "Allow inserts on users" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow self update on users" ON users;
CREATE POLICY "Allow self update on users" ON users FOR UPDATE USING (true);

-- Drop spots policies
DROP POLICY IF EXISTS "Allow all reads on drop_spots" ON drop_spots;
CREATE POLICY "Allow all reads on drop_spots" ON drop_spots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated inserts on drop_spots" ON drop_spots;
CREATE POLICY "Allow authenticated inserts on drop_spots" ON drop_spots FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated updates on drop_spots" ON drop_spots;
CREATE POLICY "Allow authenticated updates on drop_spots" ON drop_spots FOR UPDATE USING (true);

-- Spot activities policies
DROP POLICY IF EXISTS "Allow all reads on spot_activities" ON spot_activities;
CREATE POLICY "Allow all reads on spot_activities" ON spot_activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated inserts on spot_activities" ON spot_activities;
CREATE POLICY "Allow authenticated inserts on spot_activities" ON spot_activities FOR INSERT WITH CHECK (true);

-- ============================================
-- ENABLE REALTIME
-- ============================================

-- Enable realtime for drop_spots table
ALTER PUBLICATION supabase_realtime ADD TABLE drop_spots;
