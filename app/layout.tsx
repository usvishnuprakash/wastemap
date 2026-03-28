import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'WasteMap - Community Waste Management Platform',
  description:
    'Open-source platform for mapping and managing waste collection points. Crowdsourced by communities for cleaner cities.',
  keywords: [
    'waste management',
    'garbage collection',
    'sanitation',
    'smart city',
    'crowdsourced',
    'open source',
    'community',
    'urban',
    'environment',
    'recycling',
  ],
  authors: [{ name: 'WasteMap Contributors' }],
  openGraph: {
    title: 'WasteMap - Community Waste Management Platform',
    description: 'Open-source platform for mapping and managing waste collection points.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'WasteMap',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WasteMap - Community Waste Management Platform',
    description: 'Open-source platform for mapping and managing waste collection points.',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0f0d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
