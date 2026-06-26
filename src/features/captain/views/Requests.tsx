'use client'

import * as React from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { selectRequests, selectAccountType } from '@/features/captain/store/selectors'
import { fetchCaptainDashboard } from '@/features/captain/store/data-slice'
import { submitOffer } from '@/features/offers'
import Card from '@/shared/ui/Card'
import Badge from '@/shared/ui/Badge'
import { useLocale } from 'next-intl'

export default function Requests() {
  const t = useCaptainTranslations()
  const requests = useAppSelector(selectRequests)
  const accountType = useAppSelector(selectAccountType)
  const dispatch = useAppDispatch()
  const locale = useLocale()
  const isRTL = locale === 'ar'

  const [activeRequest, setActiveRequest] = React.useState<any | null>(null)
  const [price, setPrice] = React.useState('')
  const [estimatedDelivery, setEstimatedDelivery] = React.useState('2 hours')
  const [description, setDescription] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  const handleOpenModal = (req: any) => {
    setActiveRequest(req)
    setPrice('')
    setEstimatedDelivery('2 hours')
    setDescription('')
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

    setIsLoading(true)
    setError(null)

    try {
      await submitOffer({
        requestId: activeRequest.id,
        quoteEGP: priceNum,
        estimatedDelivery,
        description,
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
                    📦 {req.packageType} ({req.weight})
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
                {(req.price || req.estimatedPriceMin || req.estimatedPriceMax) && (
                  <p className="text-[13px] text-emerald-500 font-semibold flex items-center gap-1">
                    💰 <strong>{t('customerBudget')}:</strong>{' '}
                    <span>
                      {req.price
                        ? `${req.price} ${locale === 'ar' ? 'ج.م' : 'EGP'}`
                        : `${req.estimatedPriceMin || 0} - ${req.estimatedPriceMax || 0} ${locale === 'ar' ? 'ج.م' : 'EGP'}`}
                    </span>
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
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {t('sendOffer')}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-zinc-500 hover:text-white transition-colors"
                disabled={isLoading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="p-3 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="p-3 text-xs font-semibold text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                  {successMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-400">
                  {t('offerPrice')}
                </label>
                <input
                  type="number"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder={t('offerPricePlaceholder')}
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  disabled={isLoading || !!successMessage}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-400">
                  {t('estDeliveryTime')}
                </label>
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder={t('estDeliveryPlaceholder')}
                  value={estimatedDelivery}
                  onChange={e => setEstimatedDelivery(e.target.value)}
                  disabled={isLoading || !!successMessage}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-400">
                  {locale === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Additional Notes (Optional)'}
                </label>
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
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
                  className="flex-1 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition-all"
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
