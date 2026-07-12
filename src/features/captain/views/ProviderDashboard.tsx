'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchCaptainDashboard, switchAccountTypeData } from '@/features/captain/store/data-slice'
import { useNotifications } from '@/shared/providers/socket-notification-provider'
import { useNotificationsListener, useSocketEvent, useSocket } from '@/shared/socket'
import { setAccountType, setOnlineState, setActiveScreen } from '@/features/captain/store/dashboard-slice'
import { getCurrentUser } from '@/features/auth/api'
import type { User } from '@/features/auth/types'
import {
  selectActiveScreen,
  selectCaptainDataStatus,
  selectAccountType,
  selectOrders,
  selectVerification,
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
import Offices from './Offices'
import { NotificationsView } from '@/features/notifications'
import SupportView from '@/features/support/views/SupportView'
import GlobalLiveChat from '@/features/support/components/GlobalLiveChat'

import type { ScreenId } from '@/features/captain/types'

const SCREENS: Record<ScreenId, React.ReactNode> = {
  'overview':         <Overview />,
  'offices':          <Offices />,
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
  'support':          <SupportView />,
  'notifications':    <NotificationsView />,
}

export default function ProviderDashboard() {
  const dispatch   = useAppDispatch()
  const router       = useRouter()
  const activeScreen = useAppSelector(selectActiveScreen)
  const dataStatus   = useAppSelector(selectCaptainDataStatus)
  const t            = useCaptainTranslations()
  const locale       = useLocale()
  const isRTL        = locale === 'ar'

  const [authorized, setAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const fetchUser = () => {
    getCurrentUser()
      .then((user) => {
        setCurrentUser(user)
        if (!user.isVerified) {
          router.replace(`/verify-otp?phone=${user.phone}&email=${user.email}`);
          return;
        }
        if ((user.role as string) === 'driver' || (user.role as string) === 'office') {
          const type = user.role === 'office' ? 'office' : 'captain';
          dispatch(setAccountType(type))
          if (type === 'captain' && user.driverStatus) {
            dispatch(setOnlineState(user.driverStatus !== 'offline'))
          } else if (type === 'office' && user.officeStatus) {
            dispatch(setOnlineState(user.officeStatus !== 'offline'))
          }
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
  }

  useEffect(() => {
    fetchUser()
    window.addEventListener("profile-updated", fetchUser)
    return () => {
      window.removeEventListener("profile-updated", fetchUser)
    }
  }, [router, dispatch])

  const accountType = useAppSelector(selectAccountType)
  const verification = useAppSelector(selectVerification)

  useEffect(() => {
    if (currentUser && currentUser.role === 'driver' && currentUser.workingMode === 'office') {
      if (['requests', 'offers'].includes(activeScreen)) {
        dispatch(setActiveScreen('overview'));
      }
    }
  }, [currentUser, activeScreen, dispatch]);

  useEffect(() => {
    if (authorized) {
      if (!verification.isVerified) {
        const isProtected = ['overview', 'offices', 'requests', 'offers', 'orders', 'deliveries', 'tracking', 'earnings', 'wallet', 'team', 'captain-tracking', 'performance', 'ratings', 'profile', 'notifications'].includes(activeScreen);
        if (isProtected) {
          dispatch(setActiveScreen('verification'));
        }
      } else if (activeScreen === 'verification') {
        dispatch(setActiveScreen('overview'));
      }
    }
  }, [authorized, verification.isVerified, activeScreen, dispatch]);

  useEffect(() => {
    if (authorized) {
      dispatch(fetchCaptainDashboard(accountType))
    }
  }, [authorized, dispatch, accountType])

  const orders = useAppSelector(selectOrders) || [];
  const { joinShipment, leaveShipment } = useSocket();

  useEffect(() => {
    if (!orders || orders.length === 0) return;
    
    orders.forEach((o) => {
      const orderId = (o as any).id || (o as any)._id;
      if (orderId) {
        joinShipment(orderId);
      }
    });

    return () => {
      orders.forEach((o) => {
        const orderId = (o as any).id || (o as any)._id;
        if (orderId) {
          leaveShipment(orderId);
        }
      });
    };
  }, [orders, joinShipment, leaveShipment]);

  // Setup real-time updates for the dashboard stats, shipments, and wallet
  useNotificationsListener(() => {
    console.log("Real-time notification received in Captain Dashboard, refreshing...");
    if (authorized) {
      dispatch(fetchCaptainDashboard(accountType));
    }
  });

  useSocketEvent("walletUpdate", () => {
    console.log("Real-time wallet update received in Captain Dashboard, refreshing...");
    if (authorized) {
      dispatch(fetchCaptainDashboard(accountType));
    }
  });

  useSocketEvent("statusUpdate", () => {
    console.log("Real-time status update received in Captain Dashboard, refreshing...");
    if (authorized) {
      dispatch(fetchCaptainDashboard(accountType));
    }
  });

  useSocketEvent("office:shipmentUpdate", () => {
    console.log("Real-time office shipment update received, refreshing...");
    if (authorized) {
      dispatch(fetchCaptainDashboard(accountType));
    }
  });

  useSocketEvent("office:captainUpdate", () => {
    console.log("Real-time office captain update received, refreshing...");
    if (authorized) {
      dispatch(fetchCaptainDashboard(accountType));
    }
  });

  useSocketEvent("office:verificationUpdate", () => {
    console.log("Real-time office verification update received, refreshing...");
    if (authorized) {
      dispatch(fetchCaptainDashboard(accountType));
    }
  });

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--dh-bg-app)] text-[var(--dh-text-sub)] text-sm font-semibold">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-t-[var(--dh-brand)] border-[var(--dh-border)] animate-spin" />
          <span>{t('verifyingPermissions')}</span>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div
      className="customer-surface flex h-screen w-screen overflow-hidden bg-[var(--dh-bg-app)]"
      data-surface="customer"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 bg-[var(--dh-bg-app)]">
          {SCREENS[activeScreen] ?? <Overview />}
        </main>
      </div>
      <GlobalLiveChat />
    </div>
  )
}
