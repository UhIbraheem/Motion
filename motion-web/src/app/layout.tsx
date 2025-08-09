import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
// Navigation is rendered within pages as needed
import { Toaster } from '@/components/ui/toaster'
import AuthHashGuard from '@/components/AuthHashGuard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Motion - AI-Powered Local Adventure Discovery',
  description: 'Your mindful companion for exploring what\'s around you.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Motion App - Clean White Layout with Airbnb Style
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-screen bg-white">
            <AuthHashGuard />
            {children}
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}