-- =============================================
-- WasteMap Seed Data - Bangalore
-- Run this in Supabase SQL Editor to add initial spots
-- =============================================

-- First, create a system user for seeded data
INSERT INTO users (id, device_id, display_name, reputation)
VALUES ('00000000-0000-0000-0000-000000000001', 'system_seed', 'WasteMap Official', 100)
ON CONFLICT (device_id) DO NOTHING;

-- =============================================
-- MAJOR LANDFILLS & PROCESSING UNITS
-- =============================================

INSERT INTO drop_spots (user_id, name, description, latitude, longitude, status, upvotes) VALUES
('00000000-0000-0000-0000-000000000001',
 'Mavallipura Landfill',
 'Major BBMP landfill site. Accepts all types of municipal waste. Large vehicles only.',
 13.1547, 77.4897, 'active', 10),

('00000000-0000-0000-0000-000000000001',
 'KCDC Waste Processing - Mavallipura',
 'Karnataka Compost Development Corporation waste processing facility.',
 13.1510, 77.4850, 'active', 8),

('00000000-0000-0000-0000-000000000001',
 'Bellahalli Quarry Landfill',
 'BBMP managed landfill in Bellahalli area.',
 13.1367, 77.5789, 'active', 5),

('00000000-0000-0000-0000-000000000001',
 'Doddabidarakallu Processing Unit',
 'Waste processing and segregation facility near Nagasandra.',
 13.0612, 77.5089, 'active', 6),

('00000000-0000-0000-0000-000000000001',
 'Kannahalli Waste Processing',
 'Processing unit near Sarjapur Road.',
 12.8912, 77.6823, 'active', 4),

('00000000-0000-0000-0000-000000000001',
 'Chikkanagamangala Processing',
 'Near Electronic City. Handles bulk waste from IT parks.',
 12.8234, 77.6745, 'active', 5),

('00000000-0000-0000-0000-000000000001',
 'Segehalli Processing Unit',
 'East Bangalore waste processing near KR Puram.',
 13.0234, 77.7123, 'active', 4);

-- =============================================
-- KNOWN DWCCs (Dry Waste Collection Centers)
-- =============================================

INSERT INTO drop_spots (user_id, name, description, latitude, longitude, status, upvotes) VALUES
('00000000-0000-0000-0000-000000000001',
 'DWCC Koramangala - 1st Block',
 'Dry Waste Collection Center. Accepts paper, plastic, metal, glass. Open 9am-5pm.',
 12.9352, 77.6245, 'active', 12),

('00000000-0000-0000-0000-000000000001',
 'DWCC Indiranagar - 12th Main',
 'Official BBMP Dry Waste Collection Center. Accepts recyclables.',
 12.9784, 77.6408, 'active', 15),

('00000000-0000-0000-0000-000000000001',
 'DWCC Jayanagar 4th Block',
 'Dry Waste Collection Center near shopping complex.',
 12.9256, 77.5832, 'active', 10),

('00000000-0000-0000-0000-000000000001',
 'DWCC HSR Layout Sector 2',
 'BBMP authorized dry waste collection point.',
 12.9116, 77.6389, 'active', 8),

('00000000-0000-0000-0000-000000000001',
 'DWCC BTM Layout 2nd Stage',
 'Dry waste collection. Also accepts e-waste on Saturdays.',
 12.9165, 77.6101, 'active', 9),

('00000000-0000-0000-0000-000000000001',
 'DWCC Whitefield - ITPL Road',
 'Large DWCC serving Whitefield IT corridor.',
 12.9698, 77.7500, 'active', 7),

('00000000-0000-0000-0000-000000000001',
 'DWCC Marathahalli Bridge',
 'Near Marathahalli bridge junction. High capacity.',
 12.9591, 77.7009, 'active', 6),

('00000000-0000-0000-0000-000000000001',
 'DWCC Electronic City Phase 1',
 'Serves Electronic City tech parks and residential areas.',
 12.8456, 77.6603, 'active', 5),

('00000000-0000-0000-0000-000000000001',
 'DWCC Banashankari 2nd Stage',
 'Near BDA complex. Accepts all dry waste.',
 12.9254, 77.5467, 'active', 8),

('00000000-0000-0000-0000-000000000001',
 'DWCC Rajajinagar - West of Chord Road',
 'Large facility with parking. Open Mon-Sat.',
 12.9912, 77.5534, 'active', 6),

('00000000-0000-0000-0000-000000000001',
 'DWCC Malleshwaram - 8th Cross',
 'Historic area DWCC. Well maintained.',
 13.0034, 77.5712, 'active', 11),

('00000000-0000-0000-0000-000000000001',
 'DWCC Yelahanka New Town',
 'Serves north Bangalore residential areas.',
 13.1007, 77.5963, 'active', 5),

('00000000-0000-0000-0000-000000000001',
 'DWCC JP Nagar 6th Phase',
 'South Bangalore dry waste center.',
 12.8912, 77.5856, 'active', 7),

('00000000-0000-0000-0000-000000000001',
 'DWCC Hebbal - Near Flyover',
 'Near Hebbal flyover. Easy access from ring road.',
 13.0358, 77.5970, 'active', 6),

('00000000-0000-0000-0000-000000000001',
 'DWCC KR Puram - Old Madras Road',
 'East Bangalore DWCC. Large capacity.',
 13.0145, 77.6967, 'active', 5);

-- =============================================
-- E-WASTE COLLECTION CENTERS
-- =============================================

INSERT INTO drop_spots (user_id, name, description, latitude, longitude, status, upvotes) VALUES
('00000000-0000-0000-0000-000000000001',
 'E-Waste Collection - Koramangala',
 'Authorized e-waste collection. Accepts electronics, batteries, cables.',
 12.9340, 77.6156, 'active', 8),

('00000000-0000-0000-0000-000000000001',
 'BBMP E-Waste Center - Peenya',
 'Industrial area e-waste facility. Bulk collection available.',
 13.0297, 77.5185, 'active', 6),

('00000000-0000-0000-0000-000000000001',
 'E-Parisara - Electronic City',
 'Professional e-waste recycler. All electronics accepted.',
 12.8501, 77.6593, 'active', 9);

-- =============================================
-- COMPOSTING FACILITIES (Wet Waste)
-- =============================================

INSERT INTO drop_spots (user_id, name, description, latitude, longitude, status, upvotes) VALUES
('00000000-0000-0000-0000-000000000001',
 'Community Composting - HSR Layout',
 'Community managed composting pit. Accepts kitchen waste.',
 12.9089, 77.6412, 'active', 10),

('00000000-0000-0000-0000-000000000001',
 'Terra Firma Composting',
 'Large scale composting facility. Accepts bulk wet waste.',
 12.8678, 77.6234, 'active', 7),

('00000000-0000-0000-0000-000000000001',
 'Saahas Zero Waste - Collection Point',
 'NGO run waste collection. Excellent segregation support.',
 12.9423, 77.6267, 'active', 12);

-- =============================================
-- BULK WASTE COLLECTION
-- =============================================

INSERT INTO drop_spots (user_id, name, description, latitude, longitude, status, upvotes) VALUES
('00000000-0000-0000-0000-000000000001',
 'BBMP Bulk Waste - Koramangala',
 'For construction debris, furniture, large items. Call before visit.',
 12.9301, 77.6312, 'active', 5),

('00000000-0000-0000-0000-000000000001',
 'Bulk Waste Collection - Whitefield',
 'Construction and demolition waste. Commercial rates apply.',
 12.9756, 77.7412, 'active', 4);

-- =============================================
-- VERIFICATION: Check what was added
-- =============================================
-- Run this to see all added spots:
-- SELECT name, latitude, longitude, status FROM drop_spots ORDER BY created_at DESC;
