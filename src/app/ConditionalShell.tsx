'use client'
import { usePathname } from 'next/navigation'
import Navbar from '@/shared/layout/Navbar'
import Footer from '@/shared/layout/Footer'

// These route groups have their own full-screen layouts
const SHELL_FREE_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  '/captain-dashboard', // FIX
  '/dashboard',
  '/shipments',
  '/tracking',
  '/offers',
  '/wallet',
  '/notifications',
  '/profile',
  '/reviews',
  '/support',
]

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isShellFree = SHELL_FREE_PREFIXES.some(prefix => pathname?.startsWith(prefix))

  if (isShellFree) return <>{children}</>

  return (
    <>
      <Navbar />
      <main className="pt-5">{children}</main>
      <Footer />
    </>
  )
}


