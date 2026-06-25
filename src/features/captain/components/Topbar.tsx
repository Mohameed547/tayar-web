'use client'
import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { Menu, ChevronDown, User as UserIcon, LogOut, Settings } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  toggleOnline, toggleSidebar,
} from '@/features/captain/store/dashboard-slice'
import {
  selectActiveScreen,
  selectIsOnline,
} from '@/features/captain/store/selectors'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { LocaleToggle } from '@/shared/ui/locale-toggle'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import type { ScreenId } from '@/features/captain/types'
import { getCurrentUser, logout } from '@/features/auth/api'
import type { User } from '@/features/auth/types'

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
  const locale       = useLocale()
  const t            = useCaptainTranslations()
  const isRTL        = locale === 'ar'

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching user in Captain Topbar:", err))
  }, [])



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

  return (
    <header
      className={clsx(
        'h-16 flex items-center px-6 gap-3 sticky top-0 z-40 border-b',
        'bg-[var(--color-bg-topbar)] border-[var(--color-border)]',
        isRTL && 'flex-row-reverse',
      )}
    >
      {/* Mobile menu */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="md:hidden text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Screen title */}
      <h1 className="text-base font-bold text-[var(--color-text-main)]">
        {t(titleKey)}
      </h1>

      <div className={clsx('flex-1')} />

      <LocaleToggle className="border-0 bg-transparent dark:bg-transparent" />
      <ThemeToggle className="border-0 bg-transparent dark:bg-transparent" />



      {/* Online toggle */}
      <button
        onClick={() => dispatch(toggleOnline())}
        className={clsx(
          'flex items-center gap-2 px-3 py-[5px] rounded-full text-[12px] font-semibold transition-colors',
          isOnline
            ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400'
            : 'bg-[var(--color-bg-muted)] text-[var(--color-text-sub)]',
        )}
      >
        <span className={clsx('w-2 h-2 rounded-full', isOnline ? 'bg-green-500' : 'bg-[var(--color-text-sub)]')} />
        {isOnline ? t('online') : t('offline')}
      </button>

      {/* Vertical divider */}
      <div className="h-6 w-px bg-zinc-800" />

      {/* Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-800/50 transition-colors focus:outline-none"
        >
          {/* Avatar badge */}
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0">
            {user ? getInitials(user.name) : "..."}
          </div>
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-sm font-semibold leading-tight text-[var(--color-text-main)]">
              {user ? user.name : "Loading..."}
            </span>
            <span className="text-[10px] text-[var(--color-text-sub)]">
              {user ? getLocalizedRole(user.role) : "..."}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-sub)] transition-transform duration-200" style={{ transform: dropdownOpen ? "rotate(180deg)" : "none" }} />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            {/* Overlay blocker to close */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-20">
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  // Redirect to profile tab inside captain dashboard
                  router.push('/captain-dashboard')
                  // Set active screen is managed via Redux, but fallback or redirect is safe
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-left"
              >
                <UserIcon className="h-4 w-4 text-zinc-500" />
                <span>{locale === 'ar' ? 'ملفي الشخصي' : 'My Profile'}</span>
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
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
