'use client'
import { usePathname } from 'next/navigation'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'

// These route groups have their own full-screen layouts
const SHELL_FREE_PREFIXES = [
  '/captiandashboard',
  '/dashboard',
  '/shipments',
  '/tracking',
  '/offers',
  '/wallet',
  '/notifications',
  '/profile',
  '/reviews',
  '/support',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
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
