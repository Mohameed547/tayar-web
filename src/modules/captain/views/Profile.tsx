'use client'
import { useState }          from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateProfile } from '@/modules/captain/store/captain-data-slice'
import { selectProfile } from '@/modules/captain/store/selectors'
import { useCaptainTranslations } from '@/modules/captain/hooks/use-captain-translations'

export default function Profile() {
  const dispatch = useAppDispatch()
  const t        = useCaptainTranslations()
  const profile  = useAppSelector(selectProfile)

  const [name,  setName]  = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone)

  const handleSave = () => dispatch(updateProfile({ name, phone }))

  return (
    <div>
      <div className="mb-[22px]">
        <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('profile_title')}</h1>
        <p className="text-[13px] text-[var(--color-text-sub)]">{t('profile_sub')}</p>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[14px] p-5 max-w-lg">
        <div className="mb-[14px]">
          <label className="block text-[12px] font-semibold text-[var(--color-text-main)] mb-[5px]">
            {t('legalName')}
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full text-[13px] px-3 py-[9px] border-[1.5px] border-[var(--color-border)] rounded-md bg-[var(--color-bg-input)] text-[var(--color-text-main)] focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="mb-[14px]">
          <label className="block text-[12px] font-semibold text-[var(--color-text-main)] mb-[5px]">
            {t('contactNumber')}
          </label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full text-[13px] px-3 py-[9px] border-[1.5px] border-[var(--color-border)] rounded-md bg-[var(--color-bg-input)] text-[var(--color-text-main)] focus:outline-none focus:border-blue-600"
          />
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-[6px] bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-md transition-colors"
        >
          {t('saveProfile')}
        </button>
      </div>
    </div>
  )
}
