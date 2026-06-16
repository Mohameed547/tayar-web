'use client'
import clsx from 'clsx'
import {
  LayoutDashboard, Inbox, Gavel, CheckCircle, Truck, Map,
  Coins, Wallet, Users, MapPin, BarChart2, Star,
  UserCircle, ShieldCheck, Ship, LogOut, X,
} from 'lucide-react'
import { useLocale } from 'next-intl'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setActiveScreen, setSidebarOpen } from '@/modules/captain/store/captain-dashboard-slice'
import {
  selectAccountType,
  selectActiveScreen,
  selectProfile,
  selectSidebarOpen,
} from '@/modules/captain/store/selectors'
import { useCaptainTranslations } from '@/modules/captain/hooks/use-captain-translations'
import type { ScreenId } from '@/modules/captain/types/provider'

interface NavEntry {
  id: ScreenId
  labelKey: string
  icon: React.ReactNode
  badge?: number
  officeOnly?: boolean
}

const NAV_ITEMS: NavEntry[] = [
  { id: 'overview', labelKey: 'nav_overview', icon: <LayoutDashboard size={17} /> },
  { id: 'requests', labelKey: 'nav_requests', icon: <Inbox size={17} />, badge: 5 },
  { id: 'offers', labelKey: 'nav_offers', icon: <Gavel size={17} /> },
  { id: 'orders', labelKey: 'nav_orders', icon: <CheckCircle size={17} />, badge: 2 },
  { id: 'deliveries', labelKey: 'nav_deliveries', icon: <Truck size={17} />, officeOnly: true },
  { id: 'tracking', labelKey: 'nav_tracking', icon: <Map size={17} />, officeOnly: true },
]

const FINANCE_ITEMS: NavEntry[] = [
  { id: 'earnings', labelKey: 'nav_earnings', icon: <Coins size={17} /> },
  { id: 'wallet', labelKey: 'nav_wallet', icon: <Wallet size={17} /> },
]

const TEAM_ITEMS: NavEntry[] = [
  { id: 'team', labelKey: 'nav_team', icon: <Users size={17} />, officeOnly: true },
  { id: 'captain-tracking', labelKey: 'nav_captainTracking', icon: <MapPin size={17} />, officeOnly: true },
  { id: 'performance', labelKey: 'nav_performance', icon: <BarChart2 size={17} />, officeOnly: true },
]

const ACCOUNT_ITEMS: NavEntry[] = [
  { id: 'ratings', labelKey: 'nav_ratings', icon: <Star size={17} /> },
  { id: 'profile', labelKey: 'nav_profile', icon: <UserCircle size={17} /> },
  { id: 'verification', labelKey: 'nav_verification', icon: <ShieldCheck size={17} /> },
]

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const accountType = useAppSelector(selectAccountType)
  const activeScreen = useAppSelector(selectActiveScreen)
  const sidebarOpen = useAppSelector(selectSidebarOpen)
  const profile = useAppSelector(selectProfile)
  const locale = useLocale()
  const t = useCaptainTranslations()
  const isOffice = accountType === 'office'
  const isRTL = locale === 'ar'

  const navigate = (id: ScreenId) => {
    dispatch(setActiveScreen(id))
    dispatch(setSidebarOpen(false))
  }

  const renderItem = (item: NavEntry) => {
    if (item.officeOnly && !isOffice) return null
    const active = activeScreen === item.id
    return (
      <button
        key={item.id}
        onClick={() => navigate(item.id)}
        className={clsx(
          'flex w-full items-center gap-[9px] px-3 py-[9px] rounded-md text-[13px] font-medium mb-[1px] transition-all duration-150',
          isRTL && 'flex-row-reverse',
          active
            ? 'bg-blue-600/40 text-white font-semibold'
            : 'text-white/60 hover:bg-white/[0.08] hover:text-white',
        )}
      >
        <span className={clsx('shrink-0', isRTL && 'scale-x-[-1]')}>{item.icon}</span>
        <span className="flex-1 text-left rtl:text-right">
          {t(item.labelKey)}
        </span>
        {item.badge !== undefined && (
          <span className={clsx('bg-red-500 text-white text-[10px] font-bold px-[6px] py-[2px] rounded-full', isRTL ? 'mr-auto' : 'ml-auto')}>
            {item.badge}
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
      <>
        <p className="px-3 pt-[14px] pb-[6px] text-[10px] font-bold uppercase tracking-[.07em] text-white/30">
          {t(labelKey)}
        </p>
        {items.map(renderItem)}
      </>
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
          'fixed md:static top-0 h-screen md:h-auto w-[252px] shrink-0 bg-[#0F172A] flex flex-col z-50 transition-transform duration-300',
          isRTL ? 'right-0' : 'left-0',
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className={clsx('flex items-center gap-[10px] px-5 py-[18px] border-b border-white/[0.08]', isRTL && 'flex-row-reverse')}>
          <div className="w-[34px] h-[34px] bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Ship size={17} color="#fff" />
          </div>
          <span className="text-base font-extrabold text-white">DeliveryHub</span>
          <button
            onClick={() => dispatch(setSidebarOpen(false))}
            className="md:hidden ml-auto text-white/40 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 pt-[10px]">
          <span className={clsx(
            'text-[10px] font-bold px-2 py-[2px] rounded-full',
            isOffice ? 'bg-blue-600/30 text-blue-200' : 'bg-amber-500/20 text-amber-200',
          )}>
            {t(isOffice ? 'accountType_office' : 'accountType_captain')}
          </span>
          <p className="text-[12px] font-semibold text-white mt-[6px]">{profile.name}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-[10px]">
          {renderSection('nav_shipmentOps', NAV_ITEMS)}
          {renderSection('nav_finance', FINANCE_ITEMS)}
          {renderSection('nav_team_mgmt', TEAM_ITEMS, isOffice)}
          {renderSection('nav_account', ACCOUNT_ITEMS)}
        </nav>

        <div className="px-[14px] py-3 border-t border-white/[0.08]">
          <div className={clsx('flex items-center gap-[10px]', isRTL && 'flex-row-reverse')}>
            <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-[13px] shrink-0">
              {profile.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{profile.name}</p>
              <p className="text-[11px] text-white/40">
                {t(isOffice ? 'accountType_office' : 'accountType_captain')}
              </p>
            </div>
            <button className="text-white/30 hover:text-white transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
