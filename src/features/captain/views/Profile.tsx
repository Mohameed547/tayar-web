'use client'

import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateProfile } from '@/features/captain/store/data-slice'
import { selectProfile, selectVerification, selectAccountType } from '@/features/captain/store/selectors'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { getProviderProfile, updateProviderProfile } from '@/features/profile'
import { User, Phone, CheckCircle } from 'lucide-react'
import { useLocale } from 'next-intl'

export default function Profile() {
  const dispatch = useAppDispatch()
  const t = useCaptainTranslations()
  const profile = useAppSelector(selectProfile)
  const verification = useAppSelector(selectVerification)
  const accountType = useAppSelector(selectAccountType)
  const locale = useLocale()

  const [activeTab, setActiveTab] = useState<'info' | 'edit'>('info')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone)

  useEffect(() => {
    getProviderProfile()
      .then((data) => {
        dispatch(updateProfile(data))
        setName(data.name)
        setPhone(data.phone)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch provider profile:", err)
        setLoading(false)
      })
  }, [dispatch])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = await updateProviderProfile({ name, phone })
      dispatch(updateProfile(data))
      setSuccessMessage(locale === 'ar' ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!')
      setActiveTab('info')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      console.error("Failed to update profile:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-zinc-400 text-sm font-semibold">
        <div className="h-6 w-6 rounded-full border-2 border-t-blue-500 border-zinc-800 animate-spin mr-2" />
        <span>{locale === 'ar' ? 'جاري تحميل الملف الشخصي...' : 'Loading profile...'}</span>
      </div>
    )
  }

  const avatarLetters = profile.name
    ? profile.name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  const isOffice = accountType === 'office'

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">{t('profile_title')}</h1>
        <p className="text-xs text-zinc-500 mt-1">{t('profile_sub')}</p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side Profile Summary */}
        <div className="md:col-span-4 bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center gap-4 shadow-sm">
          <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-600 text-white font-extrabold text-2xl border-4 border-zinc-850">
            {avatarLetters}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-zinc-200">{profile.name}</span>
            <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">
              {t(isOffice ? 'accountType_office' : 'accountType_captain')}
            </span>
          </div>
          {verification.isVerified ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {locale === 'ar' ? 'حساب موثق' : 'Verified'}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {locale === 'ar' ? 'غير موثق بعد' : 'Not Verified'}
            </span>
          )}
        </div>

        {/* Right Side Settings Tabs */}
        <div className="md:col-span-8 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* Tab Header Selector */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/40">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 focus:outline-none ${
                activeTab === 'info'
                  ? "border-blue-500 text-blue-500 bg-zinc-900/50"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {locale === 'ar' ? 'نظرة عامة' : 'Overview'}
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 focus:outline-none ${
                activeTab === 'edit'
                  ? "border-blue-500 text-blue-500 bg-zinc-900/50"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {locale === 'ar' ? 'تعديل البيانات' : 'Edit'}
            </button>
          </div>

          {/* Tab Body Contents */}
          <div className="p-6">
            {activeTab === 'info' ? (
              <div className="flex flex-col gap-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {locale === 'ar' ? 'تفاصيل الحساب' : 'Account Details'}
                </h2>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-zinc-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-zinc-500 font-medium">{t('legalName')}</span>
                      <span className="text-zinc-200 font-semibold mt-0.5">{profile.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-zinc-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-zinc-500 font-medium">{t('contactNumber')}</span>
                      <span className="text-zinc-200 font-semibold mt-0.5">{profile.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  {locale === 'ar' ? 'تحديث معلومات الملف الشخصي' : 'Update Profile Information'}
                </h2>

                {/* Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">
                    {t('legalName')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder={profile.name}
                  />
                </div>

                {/* Phone Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">
                    {t('contactNumber')}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                    placeholder={profile.phone}
                  />
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md focus:outline-none mt-2"
                >
                  {t('saveProfile')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
