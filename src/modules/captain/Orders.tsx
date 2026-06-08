'use client'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setActiveScreen }                from '@/store/features/uiSlice'
import { t }                              from '@/lib/translations'
import Card                               from '@/shared/ui/Card'

export default function Orders() {
  const dispatch    = useAppDispatch()
  const language    = useAppSelector(s => s.ui.language)
  const accountType = useAppSelector(s => s.ui.accountType)
  const orders      = useAppSelector(s => s.data.orders)
  const isOffice    = accountType === 'office'

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('orders_title', language)}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('orders_sub', language)}</p>
      </div>

      <div className="flex flex-col gap-3">
        {orders.map(order => (
          <Card key={order.id}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-semibold text-[var(--color-text-main)]">Order {order.id}</h3>
                <p className="text-[12px] text-[var(--color-text-sub)] mt-1">
                  {t('clientConfirmed', language)} EGP {order.priceEGP}
                </p>
              </div>
              <div>
                {isOffice ? (
                  <button
                    onClick={() => dispatch(setActiveScreen('team'))}
                    className="px-3 py-[6px] bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-md transition-colors"
                  >
                    {t('assignCaptain', language)}
                  </button>
                ) : (
                  <button className="px-3 py-[6px] bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold rounded-md transition-colors">
                    {t('pickUpCargo', language)}
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
