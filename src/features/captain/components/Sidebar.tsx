'use client'

import clsx from 'clsx'
import {
  LayoutDashboard, Inbox, Gavel, CheckCircle, Truck, Map,
  Coins, Wallet, Users, MapPin, BarChart2, Star,
  UserCircle, ShieldCheck, Ship, LogOut, X, Settings, Bell,
} from 'lucide-react'
import { useNotifications } from '@/shared/providers/socket-notification-provider'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/features/auth/api'
import { setActiveScreen, setSidebarOpen } from '@/features/captain/store/dashboard-slice'
import {
  selectAccountType,
  selectActiveScreen,
  selectProfile,
  selectSidebarOpen,
  selectRequests,
  selectOrders,
} from '@/features/captain/store/selectors'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import type { ScreenId } from '@/features/captain/types'

interface NavEntry {
  id: ScreenId | 'notifications'
  labelKey: string
  icon: React.ComponentType<any>
  badge?: number
  officeOnly?: boolean
}

const NAV_ITEMS: NavEntry[] = [
  { id: 'overview', labelKey: 'nav_overview', icon: LayoutDashboard },
  { id: 'requests', labelKey: 'nav_requests', icon: Inbox },
  { id: 'offers', labelKey: 'nav_offers', icon: Gavel },
  { id: 'orders', labelKey: 'nav_orders', icon: CheckCircle },
  { id: 'deliveries', labelKey: 'nav_deliveries', icon: Truck, officeOnly: true },
  { id: 'tracking', labelKey: 'nav_tracking', icon: Map, officeOnly: true },
  { id: 'notifications', labelKey: 'nav_notifications', icon: Bell },
]

const FINANCE_ITEMS: NavEntry[] = [
  { id: 'earnings', labelKey: 'nav_earnings', icon: Coins },
  { id: 'wallet', labelKey: 'nav_wallet', icon: Wallet },
]

const TEAM_ITEMS: NavEntry[] = [
  { id: 'team', labelKey: 'nav_team', icon: Users, officeOnly: true },
  { id: 'captain-tracking', labelKey: 'nav_captainTracking', icon: MapPin, officeOnly: true },
  { id: 'performance', labelKey: 'nav_performance', icon: BarChart2, officeOnly: true },
]

const ACCOUNT_ITEMS: NavEntry[] = [
  { id: 'ratings', labelKey: 'nav_ratings', icon: Star },
  { id: 'verification', labelKey: 'nav_verification', icon: ShieldCheck },
]

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const accountType = useAppSelector(selectAccountType)
  const activeScreen = useAppSelector(selectActiveScreen)
  const sidebarOpen = useAppSelector(selectSidebarOpen)
  const profile = useAppSelector(selectProfile)
  const requests = useAppSelector(selectRequests) || []
  const orders = useAppSelector(selectOrders) || []
  const locale = useLocale()
  const t = useCaptainTranslations()
  const { unreadCount } = useNotifications()
  const isOffice = accountType === 'office'
  const isRTL = locale === 'ar'

  const dynamicBadges: Record<ScreenId | 'notifications', number> = {
    overview: 0,
    requests: requests.length,
    offers: 0,
    orders: orders.filter((o: any) => {
      const status = o.rawStatus || o.status;
      return status !== 'delivered' && status !== 'cancelled';
    }).length,
    deliveries: 0,
    tracking: 0,
    earnings: 0,
    wallet: 0,
    team: 0,
    'captain-tracking': 0,
    performance: 0,
    ratings: 0,
    verification: 0,
    profile: 0,
    notifications: unreadCount,
  }

  const navigate = (id: ScreenId) => {
    dispatch(setActiveScreen(id))
    dispatch(setSidebarOpen(false))
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      console.error('Logout error from sidebar:', e)
    }
    router.push('/login')
  }

  const renderItem = (item: NavEntry) => {
    if (item.officeOnly && !isOffice) return null
    const active = activeScreen === item.id
    const Icon = item.icon
    const badgeVal = dynamicBadges[item.id]
    return (
      <button
        key={item.id}
        onClick={() => navigate(item.id)}
        className={clsx(
          'flex w-full items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:text-zinc-200 hover:bg-zinc-900 group',
          active
            ? 'bg-blue-600/10 text-blue-500 hover:bg-blue-600/15 hover:text-blue-400'
            : 'text-zinc-400'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={clsx(
              'h-4 w-4 transition-transform duration-200 group-hover:scale-105 shrink-0',
              active ? 'text-blue-500' : 'text-zinc-400'
            )}
          />
          <span>{t(item.labelKey)}</span>
        </div>
        {badgeVal > 0 && (
          <span className={clsx(
            "flex items-center justify-center h-5 w-5 rounded-full text-white text-[10px] font-bold shrink-0",
            item.id === 'notifications' ? 'bg-red-500' : 'bg-blue-600'
          )}>
            {badgeVal}
          </span>
        )}
      </button>
    )
  }

  const renderSection = (labelKey: string, items: NavEntry[], showSection = true) => {
    if (!showSection) return null
    const visibleItems = items.filter(i => !i.officeOnly || isOffice)
    if (visibleItems.length === 0) return null
    return (
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-1 mt-3 text-start">
          {t(labelKey)}
        </p>
        {items.map(renderItem)}
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <aside
        className={clsx(
          'fixed md:static top-0 h-screen w-[252px] shrink-0 bg-zinc-950 border-r border-zinc-800 text-zinc-400 p-4 flex flex-col justify-between z-50 transition-transform duration-300',
          isRTL ? 'right-0 border-l border-r-0' : 'left-0',
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="flex flex-col gap-5 overflow-y-auto flex-1">
          {/* Brand Logo */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 text-blue-500 font-bold text-xl">
            <div className="flex items-center gap-2">
              <Ship className="h-6 w-6 stroke-[2.5]" />
              <span>DeliveryHub</span>
            </div>
            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="md:hidden text-zinc-400 hover:text-zinc-200"
            >
              <X size={16} />
            </button>
          </div>

          {/* Account Type Header */}
          <div className="px-3 text-start">
            <span className={clsx(
              'text-[10px] font-bold px-2 py-[2px] rounded-full',
              isOffice ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
            )}>
              {t(isOffice ? 'accountType_office' : 'accountType_captain')}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-3">
            {renderSection('nav_shipmentOps', NAV_ITEMS)}
            {renderSection('nav_finance', FINANCE_ITEMS)}
            {renderSection('nav_team_mgmt', TEAM_ITEMS, isOffice)}
            {renderSection('nav_account', ACCOUNT_ITEMS)}
          </nav>
        </div>

        {/* Clickable user profile at the bottom */}
        <div className="pt-3 border-t border-zinc-800 mt-4">
          <div 
            onClick={() => navigate('profile')}
            className={clsx(
              'flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all duration-200',
              activeScreen === 'profile'
                ? 'bg-blue-600/10 text-blue-500 hover:bg-blue-600/15'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0">
              {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0 text-start">
              <p className="text-xs font-semibold truncate leading-tight">{profile.name}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {t(isOffice ? 'accountType_office' : 'accountType_captain')}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                handleLogout()
              }}
              title={locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
              className="text-zinc-500 hover:text-red-400 transition-colors p-1 shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
