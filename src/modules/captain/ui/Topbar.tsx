'use client'
import clsx from 'clsx'
import { Menu } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setAccountType, toggleOnline, toggleSidebar,
} from '@/modules/captain/store/captain-dashboard-slice'
import { switchAccountTypeData } from '@/modules/captain/store/captain-data-slice'
import {
  selectAccountType,
  selectActiveScreen,
  selectIsOnline,
} from '@/modules/captain/store/selectors'
import { useCaptainTranslations } from '@/modules/captain/hooks/use-captain-translations'
import { LocaleToggle } from '@/shared/ui/locale-toggle'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import type { AccountType, ScreenId } from '@/modules/captain/types/provider'

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
  const activeScreen = useAppSelector(selectActiveScreen)
  const accountType  = useAppSelector(selectAccountType)
  const isOnline     = useAppSelector(selectIsOnline)
  const locale       = useLocale()
  const t            = useCaptainTranslations()
  const isRTL        = locale === 'ar'

  const handleAccountType = (type: AccountType) => {
    dispatch(setAccountType(type))
    dispatch(switchAccountTypeData(type))
  }

  const titleKey = SCREEN_TITLE_KEY[activeScreen] ?? 'screen_overview'

  return (
    <header
      className={clsx(
        'h-14 flex items-center px-6 gap-3 sticky top-0 z-40 border-b',
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

      {/* Office / Captain switcher */}
      <div className="flex gap-1 bg-[var(--color-bg-muted)] p-[3px] rounded-md">
        {(['office', 'captain'] as AccountType[]).map(type => (
          <button
            key={type}
            onClick={() => handleAccountType(type)}
            className={clsx(
              'px-[10px] py-1 text-[11px] font-semibold rounded transition-colors',
              accountType === type
                ? 'bg-[#0F172A] text-white'
                : 'text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]',
            )}
          >
            {t(type)}
          </button>
        ))}
      </div>

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
    </header>
  )
}
