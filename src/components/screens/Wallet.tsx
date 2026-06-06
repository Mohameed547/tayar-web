'use client'
import { useAppSelector } from '@/store/hooks'
import { t }              from '@/lib/translations'
import Card               from '../Card'
import type { Transaction } from '@/types'

export default function Wallet() {
  const language = useAppSelector(s => s.ui.language)
  const wallet   = useAppSelector(s => s.data.wallet)

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('wallet_title', language)}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('wallet_sub', language)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wallet card */}
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] rounded-[14px] p-6 text-white">
          <p className="text-[12px] opacity-70 mb-2">{t('availableBalance', language)}</p>
          <h2 className="text-[32px] font-extrabold mb-4">EGP {wallet.balanceEGP.toLocaleString()}.00</h2>
          <button className="px-4 py-2 bg-white text-[#0F172A] text-[13px] font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            {t('withdrawBtn', language)}
          </button>
        </div>

        {/* Transactions */}
        <Card>
          <p className="text-[15px] font-bold text-[var(--color-text-main)] mb-3">{t('recentTransactions', language)}</p>
          <div className="flex flex-col divide-y divide-[var(--color-border)]">
            {wallet.transactions.map((tx: Transaction) => (
              <div key={tx.id} className="flex justify-between items-center py-2">
                <div>
                  <p className="text-[12px] text-[var(--color-text-main)]">{tx.description}</p>
                  <p className="text-[11px] text-[var(--color-text-sub)]">{tx.date}</p>
                </div>
                <span className={tx.type === 'credit' ? 'text-green-500 font-semibold text-[12px]' : 'text-[var(--color-text-sub)] font-semibold text-[12px]'}>
                  {tx.type === 'credit' ? '+' : '-'} EGP {tx.amountEGP.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
