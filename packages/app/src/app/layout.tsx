import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Veda — RWA Platform',
  description: 'Institutional-grade Real-World Asset platform on Stellar',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">{children}</body>
    </html>
  )
}
