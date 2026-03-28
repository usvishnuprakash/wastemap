# WasteMap

**Open-source community waste management platform**

WasteMap is a crowdsourced platform that enables communities to map, track, and manage waste collection points. Built for cities that need better waste visibility and citizen engagement.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-darkgreen)](https://supabase.com/)

---

## Features

- **Zero friction** — No signup required. Anonymous device-based authentication.
- **Real-time updates** — See new spots appear instantly via Supabase Realtime.
- **Offline support** — Cached data works without internet connectivity.
- **Mobile-first** — Optimized for smartphones with touch-friendly interface.
- **Community-driven** — Users can add spots, update status, and confirm locations.
- **PostGIS powered** — Accurate distance calculations using geographic queries.
- **PWA ready** — Installable on mobile devices.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS |
| Maps | Leaflet.js + OpenStreetMap (free, no API key) |
| Backend | Supabase (PostgreSQL + PostGIS + Realtime) |
| Auth | Anonymous device-based (zero friction) |
| Deployment | Vercel |

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- A free [Supabase](https://supabase.com) account

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/wastemap.git
cd wastemap
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql)
3. Go to **Settings > API** and copy your credentials

### 4. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
wastemap/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx            # Main page with map
│   └── globals.css         # Tailwind + custom styles
├── components/
│   ├── MapView.tsx         # Leaflet map component
│   ├── SpotMarker.tsx      # Colored markers by status
│   ├── SpotDetail.tsx      # Detail panel with actions
│   ├── AddSpotFlow.tsx     # Add new spot workflow
│   ├── FilterBar.tsx       # Status filter pills
│   ├── Header.tsx          # App header
│   ├── LocationError.tsx   # Geolocation error handling
│   └── Toast.tsx           # Toast notifications
├── hooks/
│   ├── useLocation.ts      # Browser geolocation
│   ├── useDropSpots.ts     # Fetch nearby spots + realtime
│   ├── useAuth.ts          # Anonymous authentication
│   └── useSpotActions.ts   # CRUD operations
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── types.ts            # TypeScript interfaces
│   ├── constants.ts        # App configuration
│   └── geo.ts              # Geographic utilities
├── supabase/
│   └── schema.sql          # Database schema
└── public/
    ├── favicon.svg
    └── manifest.json       # PWA manifest
```

---

## Database Schema

The app uses PostgreSQL with PostGIS extension for geographic queries.

### Tables

- **users** — Anonymous device-based users
- **drop_spots** — Waste collection points with location data
- **spot_activities** — Activity log for all actions

### Key Functions

- `get_nearby_spots(lat, lng, radius_m)` — Fetch spots within radius
- `get_spot_activities(spot_id)` — Get activity history

See [`supabase/schema.sql`](supabase/schema.sql) for complete schema.

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with `npm run build && npm start`

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contribution

- [ ] Photo uploads for spots
- [ ] Spot clustering for dense areas
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Municipal integration APIs
- [ ] Waste type categorization
- [ ] Collection schedule tracking

---

## Configuration

### Default Location

Edit `lib/constants.ts` to change the default map center:

```typescript
export const DEFAULT_CENTER = {
  lat: 12.9716,  // Your city latitude
  lng: 77.5946,  // Your city longitude
}
```

### Search Radius

```typescript
export const DEFAULT_RADIUS_M = 1000 // 1km radius
```

---

## API Reference

### Supabase RPC Functions

#### `get_nearby_spots`

Fetch spots within a radius of a point.

```typescript
const { data } = await supabase.rpc('get_nearby_spots', {
  user_lat: 12.9716,
  user_lng: 77.5946,
  radius_m: 1000
})
```

#### `get_spot_activities`

Get activity log for a spot.

```typescript
const { data } = await supabase.rpc('get_spot_activities', {
  spot_uuid: 'uuid-here'
})
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) for free map tiles
- [Leaflet](https://leafletjs.com/) for the mapping library
- [Supabase](https://supabase.com/) for backend infrastructure
- [Vercel](https://vercel.com/) for hosting

---

**Built with hope for cleaner communities.**
