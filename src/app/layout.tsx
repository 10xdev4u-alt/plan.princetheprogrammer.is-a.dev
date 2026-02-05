import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Plan | PrinceTheProgrammer',
  description: 'Ideas to Execution',
  // PWA related metadata
  manifest: '/manifest.json', // Link to our PWA manifest
  themeColor: '#3b82f6', // Theme color, matches background_color in manifest
  appleWebApp: { // Apple PWA settings
    capable: true,
    statusBarStyle: 'default',
    title: 'Plan',
  },
  formatDetection: { // Prevent phone number detection
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head> {/* Added head tag for PWA links */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/android-chrome-192x192.png" /> {/* Apple touch icon */}
        <meta name="theme-color" content="#3b82f6" /> {/* Theme color for PWA */}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
