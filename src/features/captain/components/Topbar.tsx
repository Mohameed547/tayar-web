'use client'

import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { Menu, ChevronDown, User as UserIcon, LogOut, Settings, Bell } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  toggleOnline, toggleSidebar, setActiveScreen,
} from '@/features/captain/store/dashboard-slice'
import {
  selectActiveScreen,
  selectIsOnline,
  selectOrders,
  selectAccountType,
} from '@/features/captain/store/selectors'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { LocaleToggle } from '@/shared/ui/locale-toggle'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import type { ScreenId } from '@/features/captain/types'
import { getCurrentUser, logout } from '@/features/auth/api'
import type { User } from '@/features/auth/types'
import { useNotifications } from '@/shared/providers/socket-notification-provider'
import { updateDriverAvailability, updateOfficeAvailability } from '@/features/office'

const SCREEN_TITLE_KEY: Record<ScreenId, string> = {
  'overview':         'screen_overview',
  'requests':         'screen_requests',
  'offers':           'screen_offers',
  'orders':           'screen_orders',
  'deliveries':       'screen_deliveries',
  'tracking':         'screen_tracking',
  'earnings':         'screen_earnings',
  'wallet':           'screen_wallet',
  'team':             'screen_team',
  'captain-tracking': 'screen_captain-tracking',
  'performance':      'screen_performance',
  'ratings':          'screen_ratings',
  'verification':     'screen_verification',
  'profile':          'screen_profile',
}

export default function Topbar() {
  const dispatch     = useAppDispatch()
  const router       = useRouter()
  const activeScreen = useAppSelector(selectActiveScreen)
  const isOnline     = useAppSelector(selectIsOnline)
  const orders       = useAppSelector(selectOrders) || []
  const accountType  = useAppSelector(selectAccountType)
  const locale       = useLocale()
  const t            = useCaptainTranslations()
  const { unreadCount } = useNotifications()
  const isRTL        = locale === 'ar'

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching user in Captain Topbar:", err))
  }, [])

  const hasActiveOrder = orders.some((order: any) => {
    const status = order.rawStatus || order.status
    return status !== 'delivered' && status !== 'cancelled' && status !== 'pending_offers'
  })
  const isCaptain = user?.role === 'driver' || accountType === 'captain'
  const isBusy = isOnline && isCaptain && hasActiveOrder

  const handleToggleOnline = async () => {
    if (!user || isBusy) return
    const nextOnline = !isOnline
    dispatch(toggleOnline())
    try {
      if (user.role === 'office') {
        await updateOfficeAvailability(nextOnline ? 'available' : 'offline')
      } else {
        await updateDriverAvailability(nextOnline ? 'available' : 'offline')
      }
    } catch (err) {
      console.error("Failed to update status in DB:", err)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  const getLocalizedRole = (role: string) => {
    if (role === "customer") return "Customer"
    if (role === "driver") return locale === 'ar' ? 'كابتن' : 'Captain'
    if (role === "office") return locale === 'ar' ? 'مكتب شحن' : 'Shipping Office'
    return role
  }

  const titleKey = SCREEN_TITLE_KEY[activeScreen] ?? 'screen_overview'

  let statusText = isOnline ? t('online') : t('offline')
  let statusClass = isOnline
    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
  let indicatorClass = isOnline ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'

  if (isBusy) {
    statusText = t('busy')
    statusClass = 'bg-amber-500/10 border border-amber-500/20 text-amber-400 cursor-not-allowed'
    indicatorClass = 'bg-amber-500'
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 gap-4 border-b bg-zinc-950 border-zinc-800 text-zinc-100">
      {/* Left section: Hamburger menu & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 md:hidden transition-colors focus:outline-none shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-sm md:text-base font-bold text-zinc-200">
          {t(titleKey)}
        </h1>
      </div>

      {/* Right section: Toggles, status pill, notification, profile */}
      <div className="flex items-center gap-4">
        {/* Localization & Theme controls */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle className="border-zinc-800 bg-zinc-900 dark:bg-zinc-900" />
          <LocaleToggle className="border-zinc-800 bg-zinc-900 dark:bg-zinc-900" />
        </div>

        {/* Online/Offline status pill */}
        <button
          onClick={handleToggleOnline}
          disabled={isBusy}
          className={clsx(
            'flex items-center gap-2 px-3 py-[5px] rounded-full text-[12px] font-semibold transition-colors',
            statusClass
          )}
        >
          <span className={clsx('w-2 h-2 rounded-full', indicatorClass)} />
          <span>{statusText}</span>
        </button>

        {/* Notification bell */}
        <button
          onClick={() => router.push("/notifications")}
          className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-zinc-950">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-zinc-800" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors focus:outline-none"
          >
            {/* Avatar badge */}
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0">
              {user ? getInitials(user.name) : "..."}
            </div>
            <div className="hidden sm:flex flex-col items-start text-start">
              <span className="text-sm font-semibold leading-tight text-zinc-200">
                {user ? user.name : "Loading..."}
              </span>
              <span className="text-[10px] text-zinc-500">
                {user ? getLocalizedRole(user.role) : "..."}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500 transition-transform duration-200" style={{ transform: dropdownOpen ? "rotate(180deg)" : "none" }} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              {/* Overlay blocker to close */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className={clsx(
                "absolute mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-20",
                isRTL ? "left-0" : "right-0"
              )}>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    dispatch(setActiveScreen('profile'))
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-start"
                >
                  <UserIcon className="h-4 w-4 text-zinc-500" />
                  <span>{locale === 'ar' ? 'ملفي الشخصي' : 'My Profile'}</span>
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    dispatch(setActiveScreen('profile'))
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-start"
                >
                  <Settings className="h-4 w-4 text-zinc-500" />
                  <span>{locale === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}</span>
                </button>
                <hr className="border-zinc-800 my-1" />
                <button
                  onClick={async () => {
                    setDropdownOpen(false)
                    try {
                      await logout()
                    } catch (e) {
                      console.error("Sign out error:", e)
                    }
                    router.push("/login")
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors text-start"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
