'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { Building2, Mail, Phone, Shield, Calendar, ArrowRight, Trash2, CheckCircle2, AlertTriangle, X, ShieldAlert } from 'lucide-react'
import api from '@/lib/api/client'
import Card from '@/shared/ui/Card'
import Badge from '@/shared/ui/Badge'
import { getCurrentUser } from '@/features/auth/api'

interface OfficeAffiliation {
  id: string
  officeName: string
  officeEmail: string
  officePhone: string
  status: string
  joinedAt: string
  activeShipments: number
  isDefault: boolean
}

export default function Offices() {
  const t = useCaptainTranslations()
  const locale = useLocale()
  const isRTL = locale === 'ar'

  const [offices, setOffices] = useState<OfficeAffiliation[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Details Modal
  const [selectedOffice, setSelectedOffice] = useState<OfficeAffiliation | null>(null)
  // Leave Confirmation Modal
  const [officeToLeave, setOfficeToLeave] = useState<OfficeAffiliation | null>(null)
  const [leaving, setLeaving] = useState(false)

  // Active Office state
  const [activeOfficeId, setActiveOfficeId] = useState<string | null>(null)
  const [switchingActive, setSwitchingActive] = useState(false)

  const fetchOffices = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const [officesRes, userRes] = await Promise.all([
        api.get('/api/captain-dashboard/offices'),
        getCurrentUser()
      ])
      setOffices(officesRes.data?.data || [])
      setActiveOfficeId(userRes.activeOfficeId || null)
    } catch (err: any) {
      console.error('Failed to fetch affiliated offices:', err)
      setErrorMsg(locale === 'ar' ? 'فشل تحميل قائمة المكاتب التابعة.' : 'Failed to load affiliated offices.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffices()
  }, [])

  const handleSwitchActiveOffice = async (officeId: string | null) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setSwitchingActive(true)
    try {
      await api.post('/api/captain-dashboard/offices/active', { officeId })
      setActiveOfficeId(officeId)
      setSuccessMsg(
        officeId
          ? (locale === 'ar' ? 'تم تبديل وضع العمل للمكتب بنجاح.' : 'Active office switched successfully.')
          : (locale === 'ar' ? 'تم التبديل إلى الوضع المستقل بنجاح.' : 'Switched to Independent mode successfully.')
      )
      window.dispatchEvent(new Event("profile-updated"));
      await fetchOffices();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message
      setErrorMsg(msg || (locale === 'ar' ? 'فشل تبديل المكتب النشط.' : 'Failed to switch active office.'))
    } finally {
      setSwitchingActive(false)
    }
  }

  const handleSetDefault = async (officeId: string) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      await api.post(`/api/captain-dashboard/offices/${officeId}/default`)
      setSuccessMsg(t('default_success'))
      // Refresh the list to update defaults
      await fetchOffices()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message
      setErrorMsg(msg || (locale === 'ar' ? 'فشل تعيين المكتب الافتراضي.' : 'Failed to set default office.'))
    }
  }

  const handleLeaveOffice = async () => {
    if (!officeToLeave) return
    setErrorMsg(null)
    setSuccessMsg(null)
    setLeaving(true)
    try {
      await api.post(`/api/captain-dashboard/offices/${officeToLeave.id}/leave`)
      setSuccessMsg(t('leave_success'))
      setOfficeToLeave(null)
      // Refresh the list
      await fetchOffices()
    } catch (err: any) {
      const msg = err.response?.data?.message
      setErrorMsg(msg || (locale === 'ar' ? 'فشل مغادرة المكتب.' : 'Failed to leave office.'))
      setOfficeToLeave(null)
    } finally {
      setLeaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)]">
          {t('offices_title')}
        </h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">
          {t('offices_sub')}
        </p>
      </div>

      {/* Active Working Mode Card */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border border-emerald-500/20 dark:border-emerald-500/10 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0 shadow-[0_4px_12px_rgba(16,185,129,0.15)]">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-[15px] text-[var(--color-text-main)] mb-1">
              {locale === 'ar' ? 'وضع العمل الحالي (النشط)' : 'Current Active Mode'}
            </h3>
            <p className="text-[12px] text-[var(--color-text-sub)] max-w-xl leading-relaxed">
              {locale === 'ar'
                ? 'حدد وضع العمل النشط الخاص بك. يؤدي اختيار "الوضع المستقل" إلى تمكين استلام شحنات السوق العام، بينما يوجهك اختيار "المكتب النشط" إلى مهام ذلك المكتب فقط.'
                : 'Select your active working mode. Choosing "Independent Mode" enables receiving general marketplace shipments, while selecting an affiliated office focuses you only on that office\'s tasks.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          {switchingActive && (
            <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-emerald-500 animate-spin shrink-0" />
          )}
          <select
            value={activeOfficeId || ""}
            onChange={(e) => handleSwitchActiveOffice(e.target.value ? e.target.value : null)}
            disabled={switchingActive || loading}
            className="px-4 py-2.5 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] text-[var(--color-text-main)] text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all cursor-pointer shadow-sm min-w-[200px]"
          >
            <option value="">
              ✨ {locale === 'ar' ? 'الوضع المستقل (السوق المفتوح)' : 'Independent Mode (Marketplace)'}
            </option>
            {offices.filter(o => o.status === 'ACTIVE').map(office => (
              <option key={office.id} value={office.id}>
                🏢 {office.officeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Global alert messages */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span className="flex-1">{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fadeIn">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Offices list card */}
      <Card className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-[var(--dh-brand)] animate-spin" />
            <span className="text-[12px] text-[var(--dh-text-muted)] font-medium">
              {locale === 'ar' ? 'جاري تحميل المكاتب...' : 'Loading offices...'}
            </span>
          </div>
        ) : offices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-[var(--color-bg-muted)] text-[var(--dh-text-muted)] rounded-full mb-4">
              <Building2 size={32} />
            </div>
            <p className="text-[13px] font-bold text-[var(--color-text-main)] mb-1">
              {t('no_offices_found')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--dh-text-muted)] font-bold uppercase tracking-wider">
                  <th className={`pb-3 ${isRTL ? 'text-right' : 'text-left'}`}>{t('office_name_col')}</th>
                  <th className={`pb-3 ${isRTL ? 'text-right' : 'text-left'}`}>{t('status_col')}</th>
                  <th className={`pb-3 ${isRTL ? 'text-right' : 'text-left'}`}>{t('joined_at_col')}</th>
                  <th className={`pb-3 text-center`}>{t('active_shipments_col')}</th>
                  <th className={`pb-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t('actions_col')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {offices.map((office) => {
                  const isActive = office.status === 'ACTIVE'
                  const isSuspended = office.status === 'SUSPENDED'

                  return (
                    <tr key={office.id} className="hover:bg-[var(--color-bg-muted)]/40 transition-colors">
                      <td className={`py-4 ${isRTL ? 'text-right' : 'text-left'} font-semibold text-[var(--color-text-main)]`}>
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-[var(--dh-text-muted)]" />
                          <span>{office.officeName}</span>
                          {office.isDefault && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                              {t('default_badge')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <span className="h-1 w-1 bg-emerald-500 rounded-full" />
                            {locale === 'ar' ? 'نشط' : 'Active'}
                          </span>
                        )}
                        {isSuspended && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            <span className="h-1 w-1 bg-amber-500 rounded-full animate-pulse" />
                            {locale === 'ar' ? 'موقوف مؤقتاً' : 'Suspended'}
                          </span>
                        )}
                        {!isActive && !isSuspended && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--dh-text-muted)] bg-[var(--color-bg-muted)] border border-[var(--color-border)] px-2 py-0.5 rounded-full">
                            {office.status}
                          </span>
                        )}
                      </td>
                      <td className={`py-4 ${isRTL ? 'text-right' : 'text-left'} text-[var(--color-text-sub)]`}>
                        {formatDate(office.joinedAt)}
                      </td>
                      <td className="py-4 text-center font-bold text-[var(--color-text-main)]">
                        {office.activeShipments > 0 ? (
                          <span className="inline-flex items-center justify-center bg-blue-500/10 text-blue-500 px-2.5 py-0.5 rounded-full font-extrabold text-[10px]">
                            {office.activeShipments}
                          </span>
                        ) : (
                          <span className="text-[var(--dh-text-dim)]">0</span>
                        )}
                      </td>
                      <td className={`py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOffice(office)}
                            className="px-3 py-1.5 bg-[var(--color-bg-muted)] border border-[var(--color-border)] text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-border)] text-[11px] font-semibold rounded-lg transition-colors focus:outline-none"
                          >
                            {t('view_office_btn')}
                          </button>

                          {!office.isDefault && (
                            <button
                              onClick={() => handleSetDefault(office.id)}
                              className="px-3 py-1.5 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-600/20 text-[11px] font-semibold rounded-lg transition-colors focus:outline-none"
                            >
                              {t('set_default_btn')}
                            </button>
                          )}

                          <button
                            onClick={() => setOfficeToLeave(office)}
                            className="p-1.5 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-all focus:outline-none"
                            title={t('leave_office_btn')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Office Details Modal */}
      {selectedOffice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[var(--dh-bg-card)] border border-[var(--dh-border)] max-w-md w-full rounded-2xl p-6 shadow-2xl relative flex flex-col gap-4 animate-slideUp">
            <button
              onClick={() => setSelectedOffice(null)}
              className="absolute top-4 right-4 text-[var(--dh-text-muted)] hover:text-[var(--color-text-main)] focus:outline-none transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-[var(--dh-border)]">
              <div className="p-3 bg-[var(--dh-brand-subtle)] text-[var(--dh-brand)] rounded-xl">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[var(--color-text-main)]">
                  {t('office_details_title')}
                </h3>
                <p className="text-[11px] text-[var(--dh-text-muted)]">
                  {selectedOffice.officeName}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-[12px] py-2">
              <div className="flex items-center justify-between border-b border-[var(--dh-border)]/50 pb-2">
                <div className="flex items-center gap-2 text-[var(--dh-text-muted)]">
                  <Mail size={14} />
                  <span>{t('office_email')}</span>
                </div>
                <span className="font-semibold text-[var(--color-text-main)]">{selectedOffice.officeEmail || '-'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[var(--dh-border)]/50 pb-2">
                <div className="flex items-center gap-2 text-[var(--dh-text-muted)]">
                  <Phone size={14} />
                  <span>{t('office_phone')}</span>
                </div>
                <span className="font-semibold text-[var(--color-text-main)]">{selectedOffice.officePhone || '-'}</span>
              </div>

              <div className="flex items-center justify-between border-b border-[var(--dh-border)]/50 pb-2">
                <div className="flex items-center gap-2 text-[var(--dh-text-muted)]">
                  <Shield size={14} />
                  <span>{t('status_col')}</span>
                </div>
                <span className="font-bold uppercase text-[10px]">
                  {selectedOffice.status}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2 text-[var(--dh-text-muted)]">
                  <Calendar size={14} />
                  <span>{t('joined_at_col')}</span>
                </div>
                <span className="font-semibold text-[var(--color-text-main)]">{formatDate(selectedOffice.joinedAt)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedOffice(null)}
                className="w-full py-2.5 bg-[var(--color-bg-muted)] hover:bg-[var(--color-border)] text-[var(--color-text-main)] text-xs font-bold rounded-xl transition-colors focus:outline-none"
              >
                {t('closeBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Office Confirmation Modal */}
      {officeToLeave && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[var(--dh-bg-card)] border border-[var(--dh-border)] max-w-sm w-full rounded-2xl p-6 shadow-2xl relative flex flex-col gap-4 text-center animate-slideUp">
            <div className="mx-auto p-4 bg-red-500/10 text-red-500 rounded-full mb-2">
              <ShieldAlert size={32} />
            </div>

            <div>
              <h3 className="font-extrabold text-[15px] text-[var(--color-text-main)] mb-1">
                {t('leave_confirm_title')}
              </h3>
              <p className="text-[11px] text-[var(--dh-text-muted)] leading-relaxed">
                {t('leave_confirm_msg', { name: officeToLeave.officeName })}
              </p>
            </div>

            {officeToLeave.activeShipments > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-[10px] font-semibold text-start flex gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>
                  {locale === 'ar'
                    ? `تنبيه: لديك حالياً ${officeToLeave.activeShipments} شحنة نشطة مع هذا المكتب. لن يسمح لك النظام بمغادرة المكتب حتى اكتمال أو إلغاء جميع الشحنات المعلقة والنشطة.`
                    : `Warning: You have ${officeToLeave.activeShipments} active shipment(s) with this office. The system will prevent you from leaving until all active deliveries are finished.`}
                </span>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setOfficeToLeave(null)}
                disabled={leaving}
                className="flex-1 py-2.5 bg-[var(--color-bg-muted)] hover:bg-[var(--color-border)] text-[var(--color-text-main)] text-xs font-bold rounded-xl transition-colors focus:outline-none disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleLeaveOffice}
                disabled={leaving}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors focus:outline-none disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {leaving ? (
                  <div className="h-3 w-3 rounded-full border border-t-transparent animate-spin" />
                ) : (
                  t('leave_office_btn')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
