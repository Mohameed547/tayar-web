'use client'

import * as React from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { selectRequests, selectAccountType, selectIsOnline } from '@/features/captain/store/selectors'
import { fetchCaptainDashboard } from '@/features/captain/store/data-slice'
import { submitOffer } from '@/features/offers'
import Card from '@/shared/ui/Card'
import Badge from '@/shared/ui/Badge'
import { useLocale } from 'next-intl'
import { WifiOff, Power, Clock } from 'lucide-react'
import { getCurrentUser } from '@/features/auth/api'
import type { User } from '@/features/auth/types'
import { updateDriverAvailability, updateOfficeAvailability } from '@/features/office'
import { useNotifications } from '@/shared/providers/socket-notification-provider'
import { setOnlineState, setActiveScreen } from '@/features/captain/store/dashboard-slice'

const formatEstDelivery = (days: number, hours: number, minutes: number, isAr: boolean) => {
  const parts: string[] = [];

  // Helper for Days
  if (days > 0) {
    if (isAr) {
      if (days === 1) parts.push('يوم');
      else if (days === 2) parts.push('يومين');
      else if (days >= 3 && days <= 10) parts.push(`${days} أيام`);
      else parts.push(`${days} يوم`);
    } else {
      parts.push(`${days} day${days > 1 ? 's' : ''}`);
    }
  }

  // Helper for Hours
  if (hours > 0) {
    if (isAr) {
      if (hours === 1) parts.push('ساعة');
      else if (hours === 2) parts.push('ساعتين');
      else if (hours >= 3 && hours <= 10) parts.push(`${hours} ساعات`);
      else parts.push(`${hours} ساعة`);
    } else {
      parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    }
  }

  // Helper for Minutes
  if (minutes > 0) {
    if (isAr) {
      if (minutes === 1) parts.push('دقيقة');
      else if (minutes === 2) parts.push('دقيقتين');
      else if (minutes >= 3 && minutes <= 10) parts.push(`${minutes} دقائق`);
      else parts.push(`${minutes} دقيقة`);
    } else {
      parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    }
  }

  if (parts.length === 0) {
    return isAr ? 'فوري' : 'Immediate';
  }

  if (isAr) {
    return parts.join(' و ');
  } else {
    return parts.join(' and ');
  }
};

export default function Requests() {
  const t = useCaptainTranslations()
  const requests = useAppSelector(selectRequests)
  const accountType = useAppSelector(selectAccountType)
  const isOnline = useAppSelector(selectIsOnline)
  const dispatch = useAppDispatch()
  const locale = useLocale()
  const isRTL = locale === 'ar'

  const [user, setUser] = React.useState<User | null>(null)
  const { triggerLocalToast } = useNotifications()

  React.useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data))
      .catch((err) => console.error("Error fetching user in Requests view:", err));
  }, []);

  const handleGoOnline = async () => {
    if (!user) return;

    if (user.status === 'pending') {
      triggerLocalToast(
        locale === 'ar' ? 'الحساب قيد المراجعة' : 'Account Pending Review',
        locale === 'ar'
          ? 'عذراً، لا يمكنك تفعيل وضع النشاط لأن حسابك في انتظار التوثيق والمراجعة من قبل الإدارة.'
          : 'Sorry, you cannot go online because your account is pending verification and review.',
        'warning'
      );
      return;
    }

    try {
      if (user.role === 'office') {
        await updateOfficeAvailability('available')
      } else {
        await updateDriverAvailability('available')
      }
      dispatch(setOnlineState(true))
    } catch (err) {
      console.error("Failed to update status in DB:", err)
    }
  }

  const getPackageTypeLabel = (val: string) => {
    switch (val) {
      case "small_box":
        return locale === 'ar' ? 'طرد صغير' : 'Small Box';
      case "medium_box":
        return locale === 'ar' ? 'طرد متوسط' : 'Medium Box';
      case "large_box":
        return locale === 'ar' ? 'طرد كبير' : 'Large Box';
      case "pallet":
        return locale === 'ar' ? 'طبلية شحن' : 'Pallet';
      default:
        return val;
    }
  };

  const getSpeedLabel = (val: string) => {
    switch (val) {
      case "standard":
        return locale === 'ar' ? 'توصيل عادي' : 'Standard Delivery';
      case "express":
        return locale === 'ar' ? 'توصيل سريع' : 'Express Delivery';
      case "scheduled":
        return locale === 'ar' ? 'توصيل مجدول' : 'Scheduled Delivery';
      default:
        return val;
    }
  };

  const [activeRequest, setActiveRequest] = React.useState<any | null>(null)
  const [price, setPrice] = React.useState('')
  const [estDays, setEstDays] = React.useState<number | ''>('')
  const [estHours, setEstHours] = React.useState<number | ''>(2)
  const [estMinutes, setEstMinutes] = React.useState<number | ''>('')
  const [description, setDescription] = React.useState('')
  const [coverage, setCoverage] = React.useState<"Insured" | "None">("None")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  const handleOpenModal = (req: any) => {
    setActiveRequest(req)
    setPrice('')
    setEstDays('')
    setEstHours(2)
    setEstMinutes('')
    setDescription('')
    setCoverage('None')
    setError(null)
    setSuccessMessage(null)
  }

  const handleCloseModal = () => {
    setActiveRequest(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeRequest) return

    const priceNum = Number(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError(locale === 'ar' ? 'يرجى إدخال سعر صحيح أكبر من الصفر' : 'Please enter a valid price greater than zero')
      return
    }

    const minBudget = activeRequest.estimatedPriceMin ?? activeRequest.price ?? 0;
    const maxBudget = activeRequest.estimatedPriceMax ?? activeRequest.price ?? Infinity;

    if (priceNum < minBudget) {
      setError(
        locale === 'ar'
          ? `يجب ألا يقل السعر المعروض عن الحد الأدنى لميزانية الشحنة (${minBudget} ج.م)`
          : `Offered price cannot be less than shipment's budget minimum (${minBudget} EGP)`
      );
      return;
    }

    if (priceNum > maxBudget) {
      setError(
        locale === 'ar'
          ? `يجب ألا يزيد السعر المعروض عن الحد الأقصى لميزانية الشحنة (${maxBudget} ج.م)`
          : `Offered price cannot exceed shipment's budget maximum (${maxBudget} EGP)`
      );
      return;
    }

    // Convert estimated delivery time to total minutes and validate
    const daysNum = estDays === '' ? 0 : estDays;
    const hoursNum = estHours === '' ? 0 : estHours;
    const minutesNum = estMinutes === '' ? 0 : estMinutes;
    const totalMinutes = (daysNum * 24 * 60) + (hoursNum * 60) + minutesNum;

    if (totalMinutes <= 0) {
      setError(
        locale === 'ar'
          ? 'يرجى إدخال مدة التوصيل المتوقعة.'
          : 'Please enter the estimated delivery time.'
      );
      return;
    }

    setIsLoading(true)
    setError(null)

    try {
      const estimatedDelivery = formatEstDelivery(daysNum, hoursNum, minutesNum, locale === 'ar');
      await submitOffer({
        requestId: activeRequest.id,
        quoteEGP: priceNum,
        estimatedDelivery,
        description,
        coverage,
      })

      setSuccessMessage(t('offerSubmitSuccess'))
      dispatch(fetchCaptainDashboard(accountType))
      
      setTimeout(() => {
        handleCloseModal()
      }, 1500)
    } catch (err: any) {
      console.error('Failed to submit offer:', err)
      const msg = err.response?.data?.message || err.message || 'Failed to submit offer'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (user?.status === 'pending') {
    return (
      <div>
        <div className="mb-[22px]">
          <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">
            {t('requests_title')}
          </h1>
          <p className="text-[13px] text-[var(--color-text-sub)]">{t('requests_sub')}</p>
        </div>
        
        <div className="relative flex flex-col items-center justify-center p-10 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-2xl text-center shadow-[0_8px_32px_rgba(0,0,0,0.04)] max-w-md mx-auto mt-12 overflow-hidden transition-all duration-300">
          {/* Decorative ambient blur light */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Glowing Status Icon Container */}
          <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-6 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
            <Clock className="h-6 w-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>

          <h3 className="text-base font-extrabold !text-[var(--dh-text-main)] mb-3 tracking-tight">
            {locale === 'ar' ? 'حسابك في انتظار التوثيق' : 'Account Pending Verification'}
          </h3>

          <p className="text-[12px] !text-[var(--dh-text-muted)] leading-relaxed mb-8 max-w-[280px]">
            {locale === 'ar' 
              ? 'يرجى الانتظار لحين مراجعة وتوثيق حسابك من قِبل الإدارة لتتمكن من تفعيل النشاط واستقبل عروض الشحن.' 
              : 'Please wait for the administration to review and verify your account to activate status and receive offers.'}
          </p>

          <button
            onClick={() => dispatch(setActiveScreen('verification'))}
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] !text-black text-xs font-bold rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(245,158,11,0.2)] focus:outline-none"
          >
            <span>{locale === 'ar' ? 'الذهاب لصفحة التوثيق' : 'Go to Verification'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div>
        <div className="mb-[22px]">
          <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">
            {t('requests_title')}
          </h1>
          <p className="text-[13px] text-[var(--color-text-sub)]">{t('requests_sub')}</p>
        </div>
        
        <div className="relative flex flex-col items-center justify-center p-10 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-2xl text-center shadow-[0_8px_32px_rgba(0,0,0,0.04)] max-w-md mx-auto mt-12 overflow-hidden transition-all duration-300">
          {/* Decorative ambient blur light */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-[var(--dh-brand-glow)] rounded-full blur-3xl pointer-events-none" />

          {/* Glowing Status Icon Container */}
          <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--dh-brand-subtle)] border border-[var(--dh-brand)]/20 text-[var(--dh-brand)] mb-6 shadow-[0_0_20px_var(--dh-brand-glow)]">
            <WifiOff className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--dh-brand)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--dh-brand)]"></span>
            </span>
          </div>

          <h3 className="text-base font-extrabold !text-[var(--dh-text-main)] mb-3 tracking-tight">
            {locale === 'ar' ? 'أنت في وضع عدم الاتصال بالخدمة حالياً' : 'You are currently Offline'}
          </h3>

          <p className="text-[12px] !text-[var(--dh-text-muted)] leading-relaxed mb-8 max-w-[280px]">
            {locale === 'ar' 
              ? 'قم بتفعيل وضع النشاط لتتمكن من استقبال طلبات الشحن الجديدة وتقديم عروض أسعار تنافسية للعملاء.' 
              : 'Switch your status to active to start receiving real-time shipment requests and submitting offers.'}
          </p>

          <button
            onClick={handleGoOnline}
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-2.5 bg-[var(--dh-brand)] hover:bg-[var(--dh-brand-hover)] active:scale-[0.98] !text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-[0_4px_16px_var(--dh-brand-glow)] focus:outline-none"
          >
            <Power className="h-3.5 w-3.5" />
            <span>{locale === 'ar' ? 'تفعيل وضع النشاط' : 'Go Online'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">
          {t('requests_title')}
        </h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('requests_sub')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            {locale === 'ar' ? 'لا توجد طلبات شحن واردة حالياً' : 'No incoming shipment requests available.'}
          </div>
        ) : (
          requests.map(req => (
            <Card key={req.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="blue">{req.id}</Badge>
                  <span className="text-[12px] text-[var(--color-text-sub)]">
                    📦 {getPackageTypeLabel(req.packageType)} ({req.weight})
                  </span>
                </div>
                <button
                  onClick={() => handleOpenModal(req)}
                  className="px-3 py-[6px] bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-md transition-colors self-start sm:self-auto"
                >
                  {t('sendOffer')}
                </button>
              </div>
              <div className="text-[13px] text-[var(--color-text-main)] space-y-1">
                <p><strong>{t('pickup')}:</strong> {req.pickup}</p>
                <p><strong>{t('dropoff')}:</strong> {req.dropoff}</p>
                {req.deliverySpeed && (
                  <p>
                    <strong>{locale === 'ar' ? 'سرعة التوصيل' : 'Delivery Speed'}:</strong>{' '}
                    <span className="text-blue-400 font-semibold">{getSpeedLabel(req.deliverySpeed)}</span>
                    {req.deliverySpeed === 'scheduled' && req.scheduledDate && (
                      <span className="text-zinc-500"> ({req.scheduledDate})</span>
                    )}
                  </p>
                )}
                {(req.price || req.estimatedPriceMin || req.estimatedPriceMax) && (
                  <p className="text-[13px] text-emerald-500 font-semibold flex items-center gap-1">
                    💰 <strong>{t('customerBudget')}:</strong>{' '}
                    <span>
                      {req.estimatedPriceMin && req.estimatedPriceMax
                        ? `${req.estimatedPriceMin} - ${req.estimatedPriceMax} ${locale === 'ar' ? 'ج.م' : 'EGP'}`
                        : `${req.price || 0} ${locale === 'ar' ? 'ج.م' : 'EGP'}`}
                    </span>
                  </p>
                )}
                {req.notes && (
                  <p className="text-amber-400/90 italic bg-zinc-950/40 p-2.5 rounded-lg mt-2 border border-zinc-800/30">
                    <strong>{locale === 'ar' ? '💬 ملاحظات العميل' : '💬 Customer Notes'}:</strong> "{req.notes}"
                  </p>
                )}
              </div>
              {req.expiresIn && (
                <p className="text-[11px] text-amber-500 mt-2">⏱ {t('expiresIn')} {req.expiresIn}</p>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Offer Submission Modal */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
              <h2 className="text-sm font-bold text-zinc-800 dark:text-white uppercase tracking-wider">
                {t('sendOffer')}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-white transition-colors"
                disabled={isLoading}
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">{locale === 'ar' ? 'نوع الشحنة:' : 'Package Type:'}</span>
                <span className="text-zinc-900 dark:text-white font-medium">{getPackageTypeLabel(activeRequest.packageType)} ({activeRequest.weight})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">{locale === 'ar' ? 'سرعة التوصيل:' : 'Delivery Speed:'}</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">{getSpeedLabel(activeRequest.deliverySpeed)}</span>
              </div>
              {activeRequest.deliverySpeed === 'scheduled' && activeRequest.scheduledDate && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-500 dark:text-zinc-400">{locale === 'ar' ? 'التاريخ المجدول:' : 'Scheduled Date:'}</span>
                  <span className="text-zinc-800 dark:text-zinc-300 font-medium">{activeRequest.scheduledDate}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">{locale === 'ar' ? 'ميزانية الشحنة:' : 'Shipment Budget:'}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {activeRequest.estimatedPriceMin && activeRequest.estimatedPriceMax
                    ? `${activeRequest.estimatedPriceMin} - ${activeRequest.estimatedPriceMax} ${locale === 'ar' ? 'ج.م' : 'EGP'}`
                    : `${activeRequest.price || 0} ${locale === 'ar' ? 'ج.م' : 'EGP'}`}
                </span>
              </div>
              {activeRequest.notes && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/50 mt-1">
                  <span className="block font-semibold text-amber-600 dark:text-amber-400 mb-0.5">{locale === 'ar' ? '💬 ملاحظات العميل:' : '💬 Customer Notes:'}</span>
                  <p className="text-zinc-600 dark:text-zinc-400 italic bg-white dark:bg-zinc-900/40 p-2 rounded border border-zinc-200 dark:border-zinc-800/40 font-normal">"{activeRequest.notes}"</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="p-3 text-xs font-semibold text-red-600 dark:text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="p-3 text-xs font-semibold text-green-600 dark:text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                  {successMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {t('offerPrice')}
                </label>
                <input
                  type="number"
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500"
                  placeholder={t('offerPricePlaceholder')}
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  disabled={isLoading || !!successMessage}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  {t('estDeliveryTime')}
                </label>
                <div className="grid grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-950/30 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800/60">
                  <div className="flex flex-col gap-1 text-center">
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                      {locale === 'ar' ? 'أيام' : 'Days'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-zinc-900 dark:text-white text-xs text-center focus:outline-none focus:border-blue-500"
                      value={estDays}
                      onChange={e => {
                        const val = e.target.value;
                        setEstDays(val === '' ? '' : Math.max(0, Number(val)));
                      }}
                      disabled={isLoading || !!successMessage}
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-center border-x border-zinc-200 dark:border-zinc-800/40">
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                      {locale === 'ar' ? 'ساعات' : 'Hours'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-zinc-900 dark:text-white text-xs text-center focus:outline-none focus:border-blue-500"
                      value={estHours}
                      onChange={e => {
                        const val = e.target.value;
                        setEstHours(val === '' ? '' : Math.max(0, Math.min(23, Number(val))));
                      }}
                      disabled={isLoading || !!successMessage}
                    />
                  </div>
                  <div className="flex flex-col gap-1 text-center">
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                      {locale === 'ar' ? 'دقائق' : 'Minutes'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-zinc-900 dark:text-white text-xs text-center focus:outline-none focus:border-blue-500"
                      value={estMinutes}
                      onChange={e => {
                        const val = e.target.value;
                        setEstMinutes(val === '' ? '' : Math.max(0, Math.min(59, Number(val))));
                      }}
                      disabled={isLoading || !!successMessage}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {locale === 'ar' ? 'تأمين الشحنة (التغطية)' : 'Shipment Insurance (Coverage)'}
                </label>
                <select
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                  value={coverage}
                  onChange={e => setCoverage(e.target.value as "Insured" | "None")}
                  disabled={isLoading || !!successMessage}
                >
                  <option value="None">{locale === 'ar' ? 'بدون تأمين (بدون تغطية)' : 'No Insurance (None)'}</option>
                  <option value="Insured">{locale === 'ar' ? 'مؤمنة (شامل التغطية)' : 'Insured (With Coverage)'}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  {locale === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
                </label>
                <input
                  type="text"
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500"
                  placeholder={locale === 'ar' ? 'أدخل تفاصيل إضافية للعميل' : 'Enter details for customer'}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={isLoading || !!successMessage}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold transition-all"
                  disabled={isLoading}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                  disabled={isLoading || !!successMessage}
                >
                  {isLoading ? t('submitting') : t('sendOffer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
