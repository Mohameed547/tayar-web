'use client'

import React, { useState, useEffect } from 'react'
import { ShieldCheck, Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { useLocale } from 'next-intl'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { selectVerification } from '@/features/captain/store/selectors'
import { getCurrentUser } from '@/features/auth/api'
import { getVerificationStatus, submitVerification } from '@/features/verification/api'
import clsx from 'clsx'

export default function Verification() {
  const t = useCaptainTranslations()
  const locale = useLocale()
  const isRTL = locale === 'ar'

  // Loading states
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userRole, setUserRole] = useState<'office' | 'driver'>('driver')

  // Real-time verification status from backend
  const [statusData, setStatusData] = useState<{ isVerified: boolean; complianceText: string }>({
    isVerified: false,
    complianceText: '',
  })

  // Form states
  const [docType, setDocType] = useState<string>('')
  const [docNumber, setDocNumber] = useState<string>('')
  const [fileSelected, setFileSelected] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    Promise.all([
      getCurrentUser(),
      getVerificationStatus().catch(() => ({
        isVerified: false,
        complianceText: locale === 'ar' ? 'يرجى رفع المستندات لبدء توثيق حسابك.' : 'Please upload documents to verify your account.',
      })),
    ])
      .then(([user, verStatus]) => {
        setUserRole(user.role === 'office' ? 'office' : 'driver')
        setStatusData(verStatus)
        // Set default document type
        setDocType(user.role === 'office' ? 'commercial_license' : 'national_id')
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load verification status:', err)
        setLoading(false)
      })
  }, [locale])

  const documentOptions = userRole === 'office'
    ? [
        { value: 'commercial_license', label: locale === 'ar' ? 'السجل التجاري (رخصة المكتب)' : 'Commercial Register (Office License)' },
      ]
    : [
        { value: 'national_id', label: locale === 'ar' ? 'الهوية الوطنية / الإقامة' : 'National ID / Iqama' },
        { value: 'driving_license', label: locale === 'ar' ? 'رخصة القيادة' : 'Driving License' },
      ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFileSelected(file)
      setFilePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docNumber.trim()) {
      setErrorMsg(locale === 'ar' ? 'الرجاء إدخال رقم المستند' : 'Please enter the document number')
      return
    }
    if (!fileSelected) {
      setErrorMsg(locale === 'ar' ? 'الرجاء اختيار ملف أولاً' : 'Please select a file first')
      return
    }

    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const result = await submitVerification({
        documentNumber: docNumber,
        documentType: docType as any,
        documentImageUrl: 'https://deliveryhub-docs.s3.amazonaws.com/doc_' + Date.now() + '.jpg',
      })

      setStatusData(result)
      setSuccessMsg(locale === 'ar' ? 'تم تقديم مستند التوثيق بنجاح!' : 'Verification document submitted successfully!')
      setDocNumber('')
      setFileSelected(null)
      setFilePreview(null)
    } catch (err: any) {
      console.error('Failed to submit verification:', err)
      setErrorMsg(locale === 'ar' ? 'فشل إرسال طلب التوثيق. يرجى المحاولة لاحقاً.' : 'Failed to submit verification request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-zinc-400 text-sm font-semibold">
        <div className="h-6 w-6 rounded-full border-2 border-t-blue-500 border-zinc-800 animate-spin mr-2" />
        <span>{locale === 'ar' ? 'جاري تحميل حالة التوثيق...' : 'Loading verification status...'}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-2xl mx-auto">
      {/* View Header */}
      <div className={clsx(isRTL && "text-right")}>
        <h1 className="text-xl font-bold tracking-tight">{t('verification_title')}</h1>
        <p className="text-xs text-zinc-500 mt-1">{t('verification_sub')}</p>
      </div>

      {/* Verification Status Card */}
      <div
        className={clsx(
          "bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm flex items-start gap-4",
          isRTL && "flex-row-reverse text-right"
        )}
      >
        <div className={clsx(
          "p-2 rounded-lg shrink-0",
          statusData.isVerified ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
        )}>
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-zinc-200">
            {statusData.isVerified
              ? (locale === 'ar' ? 'حساب موثق بالكامل' : 'Fully Verified Account')
              : (locale === 'ar' ? 'في انتظار التوثيق' : 'Pending Verification')}
          </h3>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
            {statusData.complianceText}
          </p>
        </div>
      </div>

      {/* Success / Error Messages */}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Document Upload Form */}
      {!statusData.isVerified && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col gap-5">
          <h2 className={clsx("text-xs font-bold uppercase tracking-wider text-zinc-400", isRTL && "text-right")}>
            {locale === 'ar' ? 'رفع أوراق ومستندات جديدة' : 'Upload New Documents'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Document Type Dropdown */}
            <div className={clsx("flex flex-col gap-1.5", isRTL && "items-end")}>
              <label className="text-xs font-semibold text-zinc-400">
                {locale === 'ar' ? 'نوع المستند' : 'Document Type'}
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className={clsx(
                  "w-full bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2.5 text-xs text-zinc-200 focus:outline-none transition-colors",
                  isRTL && "text-right"
                )}
              >
                {documentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-zinc-950">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Number Input */}
            <div className={clsx("flex flex-col gap-1.5", isRTL && "items-end")}>
              <label className="text-xs font-semibold text-zinc-400">
                {locale === 'ar' ? 'رقم المستند / الرخصة' : 'Document / License Number'}
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder={locale === 'ar' ? 'أدخل رقم المستند هنا...' : 'Enter document number here...'}
                className={clsx(
                  "w-full bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors",
                  isRTL && "text-right"
                )}
              />
            </div>

            {/* Custom File Upload Area */}
            <div className={clsx("flex flex-col gap-1.5", isRTL && "items-end")}>
              <label className="text-xs font-semibold text-zinc-400">
                {locale === 'ar' ? 'ملف المستند (صورة)' : 'Document File (Image)'}
              </label>

              <label className="w-full min-h-[140px] border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded-xl flex flex-col items-center justify-center gap-3 p-4 cursor-pointer transition-colors relative overflow-hidden group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {filePreview ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Upload className="h-4 w-4" />
                    <span>{locale === 'ar' ? 'تغيير الصورة' : 'Change Image'}</span>
                  </div>
                ) : null}

                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="p-3 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded-lg group-hover:scale-105 transition-transform duration-200">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-semibold text-zinc-300 block">
                        {locale === 'ar' ? 'اضغط لرفع صورة المستند' : 'Click to upload document image'}
                      </span>
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        Supports PNG, JPG, JPEG (Max 5MB)
                      </span>
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors mt-2"
            >
              {submitting
                ? (locale === 'ar' ? 'جاري الإرسال...' : 'Submitting...')
                : (locale === 'ar' ? 'تقديم المستند للمراجعة' : 'Submit Document for Review')}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
