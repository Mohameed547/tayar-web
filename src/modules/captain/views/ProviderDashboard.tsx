'use client'
import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchCaptainDashboard } from '@/modules/captain/store/captain-data-slice'
import {
  selectActiveScreen,
  selectCaptainDataStatus,
} from '@/modules/captain/store/selectors'

import Sidebar from '../ui/Sidebar'
import Topbar from '../ui/Topbar'

// ── Screens ──────────────────────────────────────────────────────────────────
import Overview from './Overview'
import Requests from '../features/requests/Requests'
import Offers from '../features/offers/Offers'
import Orders from './Orders'
import Deliveries from './Deliveries'
import Tracking from '../features/tracking/Tracking'
import Earnings from './Earnings'
import Wallet from './Wallet'
import TeamCaptains from './TeamCaptains'
import CaptainTracking from './CaptainTracking'
import Performance from './Performance'
import Ratings from './Ratings'
import Verification from './Verification'
import Profile from './Profile'

import type { ScreenId } from '@/modules/captain/types/provider'

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
  const activeScreen = useAppSelector(selectActiveScreen)
  const dataStatus = useAppSelector(selectCaptainDataStatus)
  const locale = useLocale()
  const isRTL = locale === 'ar'

  useEffect(() => {
    if (dataStatus === 'idle') {
      dispatch(fetchCaptainDashboard())
    }
  }, [dataStatus, dispatch])

  return (
    <div
      className="flex min-h-screen bg-[var(--color-bg-app)]"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 min-h-screen w-0">
        <Topbar />

        <main className="flex-1 p-6 md:p-7">
          {SCREENS[activeScreen] ?? <Overview />}
        </main>
      </div>
    </div>
  )
}
