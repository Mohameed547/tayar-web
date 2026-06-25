'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchCaptainDashboard, switchAccountTypeData } from '@/features/captain/store/data-slice'
import { setAccountType } from '@/features/captain/store/dashboard-slice'
import { getCurrentUser } from '@/features/auth/api'
import {
  selectActiveScreen,
  selectCaptainDataStatus,
} from '@/features/captain/store/selectors'

import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

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

import type { ScreenId } from '@/features/captain/types'

const SCREENS: Record<ScreenId, React.ReactNode> = {
  'overview':         <Overview />,
  'requests':         <Requests />,
  'offers':           <Offers />,
  'orders':           <Orders />,
  'deliveries':       <Deliveries />,
  'tracking':         <Tracking />,
  'earnings':         <Earnings />,
  'wallet':           <Wallet />,
  'team':             <TeamCaptains />,
  'captain-tracking': <CaptainTracking />,
  'performance':      <Performance />,
  'ratings':          <Ratings />,
  'verification':     <Verification />,
  'profile':          <Profile />,
}

export default function ProviderDashboard() {
  const dispatch   = useAppDispatch()
  const router       = useRouter()
  const activeScreen = useAppSelector(selectActiveScreen)
  const dataStatus   = useAppSelector(selectCaptainDataStatus)
  const locale       = useLocale()
  const isRTL        = locale === 'ar'

  const [authorized, setAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (!user.isVerified) {
          router.replace(`/verify-otp?phone=${user.phone}`);
          return;
        }
        if ((user.role as string) === 'driver' || (user.role as string) === 'office') {
          const type = user.role === 'office' ? 'office' : 'captain';
          dispatch(setAccountType(type))
          dispatch(switchAccountTypeData(type))
          setAuthorized(true)
        } else {
          router.replace('/dashboard')
        }
        setCheckingAuth(false)
      })
      .catch((err) => {
        console.error('Unauthorized access to captain dashboard:', err)
        router.replace('/login')
        setCheckingAuth(false)
      })
  }, [router])

  useEffect(() => {
    if (authorized && dataStatus === 'idle') {
      dispatch(fetchCaptainDashboard())
    }
  }, [authorized, dataStatus, dispatch])

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-400 text-sm font-semibold">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-t-blue-500 border-zinc-800 animate-spin" />
          <span>{locale === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}</span>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div
      className="customer-surface flex h-screen w-screen overflow-hidden bg-zinc-950"
      data-surface="customer"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          {SCREENS[activeScreen] ?? <Overview />}
        </main>
      </div>
    </div>
  )
}
