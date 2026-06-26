'use client'

import * as React from 'react'
import { useState } from 'react'
import { UserPlus }       from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { selectCaptains } from '@/features/captain/store/selectors'
import DataTable          from '@/shared/ui/DataTable'
import Badge              from '@/shared/ui/Badge'
import type { Captain } from '@/features/office/types'

import { useLocale } from 'next-intl'
import { addTeamCaptain, updateCaptainStatus, deleteTeamCaptain } from '@/features/office'
import { fetchCaptainDashboard } from '@/features/captain/store/data-slice'

const STATUS_MAP: Record<Captain['status'], { variant: 'green' | 'amber' | 'gray'; label: 'available' | 'busy' | 'offline' }> = {
  available: { variant: 'green', label: 'available' },
  busy:      { variant: 'amber', label: 'busy' },
  offline:   { variant: 'gray',  label: 'offline' },
}

export default function TeamCaptains() {
  const t = useCaptainTranslations()
  const captains = useAppSelector(selectCaptains)
  const dispatch = useAppDispatch()
  const locale = useLocale()

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [vehicleType, setVehicleType] = useState<'motorcycle' | 'car' | 'van' | 'truck'>('motorcycle')
  const [plateNumber, setPlateNumber] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleOpen = () => {
    setFullName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setVehicleType('motorcycle')
    setPlateNumber('')
    setError(null)
    setSuccess(null)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await addTeamCaptain({
        fullName,
        email,
        phone,
        password: password || undefined,
        vehicleType,
        plateNumber,
      })

      setSuccess(locale === 'ar' ? 'تم إضافة الكابتن بنجاح!' : 'Captain added successfully!')
      dispatch(fetchCaptainDashboard())
      
      setTimeout(() => {
        setIsOpen(false)
      }, 1500)
    } catch (err: any) {
      console.error('Failed to add captain:', err)
      const msg = err.response?.data?.message || err.message || 'Failed to add captain'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (captainId: string, newStatus: Captain['status']) => {
    try {
      await updateCaptainStatus(captainId, newStatus)
      dispatch(fetchCaptainDashboard())
    } catch (err) {
      console.error('Failed to update captain status:', err)
    }
  }

  const columns = [
    { key: 'name',   header: t('captain_col'), render: (c: Captain) => <span className="font-semibold text-[var(--color-text-main)]">{c.name}</span> },
    { key: 'phone',  header: t('phone_col') },
    { key: 'status', header: t('status_col'), render: (c: Captain) => {
        return (
          <select
            value={c.status}
            onChange={(e) => handleStatusChange(c.id, e.target.value as Captain['status'])}
            className={`bg-zinc-950 border border-zinc-800 text-xs font-semibold rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer ${
              c.status === 'available' ? 'text-emerald-400' : c.status === 'busy' ? 'text-amber-400' : 'text-zinc-400'
            }`}
          >
            <option value="available" className="text-emerald-400 bg-zinc-950">{t('available')}</option>
            <option value="busy" className="text-amber-400 bg-zinc-950">{t('busy')}</option>
            <option value="offline" className="text-zinc-400 bg-zinc-950">{t('offline')}</option>
          </select>
        )
      }
    },
    { key: 'actions', header: locale === 'ar' ? 'الإجراءات' : 'Actions', render: (c: Captain) => (
        <button
          onClick={async () => {
            const confirmMsg = locale === 'ar' 
              ? `هل أنت متأكد من حذف الكابتن ${c.name}؟` 
              : `Are you sure you want to delete captain ${c.name}?`
            if (confirm(confirmMsg)) {
              try {
                await deleteTeamCaptain(c.id)
                dispatch(fetchCaptainDashboard())
              } catch (err) {
                console.error("Failed to delete captain:", err)
              }
            }
          }}
          className="px-2.5 py-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 hover:text-red-400 text-xs font-semibold rounded border border-red-500/20 hover:border-red-500/40 transition-colors"
        >
          {locale === 'ar' ? 'حذف' : 'Delete'}
        </button>
      )
    },
  ]

  return (
    <div>
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('team_title')}</h1>
          <p className="text-[13px] text-[var(--color-text-sub)]">{t('team_sub')}</p>
        </div>
        <button 
          onClick={handleOpen}
          className="flex items-center gap-2 px-3 py-[6px] bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-md transition-colors"
        >
          <UserPlus size={14} />
          {t('addCaptain')}
        </button>
      </div>
      <DataTable columns={columns} data={captains} keyField="id" />

      {/* Add Captain Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {t('addCaptain')}
              </h2>
              <button
                onClick={handleClose}
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
              {success && (
                <div className="p-3 text-xs font-semibold text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-400">
                    {locale === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder={locale === 'ar' ? 'أدخل الاسم بالكامل' : 'Enter full name'}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    disabled={isLoading || !!success}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-400">
                    {locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="mail@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading || !!success}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-400">
                    {locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 01012345678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={isLoading || !!success}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-400">
                    {locale === 'ar' ? 'كلمة المرور (اختياري)' : 'Password (Optional)'}
                  </label>
                  <input
                    type="password"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder={locale === 'ar' ? '٨ خانات على الأقل' : 'Min 8 chars'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading || !!success}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-400">
                    {locale === 'ar' ? 'نوع المركبة' : 'Vehicle Type'}
                  </label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    value={vehicleType}
                    onChange={e => setVehicleType(e.target.value as any)}
                    disabled={isLoading || !!success}
                    required
                  >
                    <option value="motorcycle">{locale === 'ar' ? 'دراجة نارية' : 'Motorcycle'}</option>
                    <option value="car">{locale === 'ar' ? 'سيارة' : 'Car'}</option>
                    <option value="van">{locale === 'ar' ? 'سيارة نقل صغيرة' : 'Van'}</option>
                    <option value="truck">{locale === 'ar' ? 'شاحنة' : 'Truck'}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-400">
                    {locale === 'ar' ? 'رقم اللوحة' : 'Plate Number'}
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 123 أ ب ج"
                    value={plateNumber}
                    onChange={e => setPlateNumber(e.target.value)}
                    disabled={isLoading || !!success}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition-all"
                  disabled={isLoading}
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                  disabled={isLoading || !!success}
                >
                  {isLoading ? t('submitting') : t('addCaptain')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
