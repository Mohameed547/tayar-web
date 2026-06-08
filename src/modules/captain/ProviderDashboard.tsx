'use client'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchRequests, fetchOffers, fetchOrders,
  fetchDeliveries, fetchEarnings, fetchWallet, fetchCaptains,
} from '@/store/features/dataSlice'

import Sidebar from './Sidebar'
import Topbar from './Topbar'

// ── Screens ──────────────────────────────────────────────────────────────────
import Overview from './Overview'
import Requests from './Requests'
import Offers from './Offers'
import Orders from './Orders'
import Deliveries from './Deliveries'
import Tracking from './Tracking'
import Earnings from './Earnings'
import Wallet from './Wallet'
import TeamCaptains from './TeamCaptains'
import CaptainTracking from './CaptainTracking'
import Performance from './Performance'
import Ratings from './Ratings'
import Verification from './Verification'
import Profile from './Profile'

import type { ScreenId } from '@/shared/types'

const SCREENS: Record<ScreenId, React.ReactNode> = {
  'overview': <Overview />,
  'requests': <Requests />,
  'offers': <Offers />,
  'orders': <Orders />,
  'deliveries': <Deliveries />,
  'tracking': <Tracking />,
  'earnings': <Earnings />,
  'wallet': <Wallet />,
  'team': <TeamCaptains />,
  'captain-tracking': <CaptainTracking />,
  'performance': <Performance />,
  'ratings': <Ratings />,
  'verification': <Verification />,
  'profile': <Profile />,
}

export default function ProviderDashboard() {
  const dispatch = useAppDispatch()
  const activeScreen = useAppSelector(s => s.ui.activeScreen)
  const language = useAppSelector(s => s.ui.language)
  const theme = useAppSelector(s => s.ui.theme)
  const isRTL = language === 'ar'

  // التعديل: تفعيل الـ Dark Mode عن طريق إضافة/إزالة كلاس dark من الـ html
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Fetch all data on mount
  useEffect(() => {
    dispatch(fetchRequests())
    dispatch(fetchOffers())
    dispatch(fetchOrders())
    dispatch(fetchDeliveries())
    dispatch(fetchEarnings())
    dispatch(fetchWallet())
    dispatch(fetchCaptains())
  }, [dispatch])

  return (
    <div
      className="flex min-h-screen bg-[var(--color-bg-app)]"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Sidebar />

      {/* الـ Main area سيأخذ المساحة المتبقية بجانب الـ Sidebar */}
      <div className="flex flex-col flex-1 min-h-screen w-0">
        <Topbar />

        <main className="flex-1 p-6 md:p-7">
          {SCREENS[activeScreen] ?? <Overview />}
        </main>
      </div>
    </div>
  )
}