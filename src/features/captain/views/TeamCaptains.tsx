'use client'

import React, { useState, useEffect } from 'react'
import { UserPlus, X, User, Mail, Phone as PhoneIcon, Truck, Hash, CheckCircle, AlertTriangle, ShieldAlert, Award, Inbox, PiggyBank, ShieldCheck } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { useCaptainTranslations } from '@/features/captain/hooks/use-captain-translations'
import { selectCaptains } from '@/features/captain/store/selectors'
import {
  addCaptainToStore,
  updateCaptainStatusInStore,
  setCaptainsInStore,
  updateCaptainRelationshipStatusInStore,
  removeCaptainFromStore
} from '@/features/captain/store/data-slice'
import {
  addTeamCaptain,
  updateCaptainStatus,
  searchCaptain,
  inviteCaptain,
  getTeamCaptains,
  suspendCaptain,
  unsuspendCaptain,
  removeCaptain,
  getCaptainPerformance,
  getCaptainById
} from '@/features/office/api'
import DataTable from '@/shared/ui/DataTable'
import Badge from '@/shared/ui/Badge'
import type { Captain } from '@/features/office/types'
import { useLocale } from 'next-intl'
import clsx from 'clsx'


const STATUS_MAP: Record<Captain['status'], { variant: 'green' | 'amber' | 'gray'; label: 'available' | 'busy' | 'offline' }> = {
  available: { variant: 'green', label: 'available' },
  busy:      { variant: 'amber', label: 'busy' },
  offline:   { variant: 'gray',  label: 'offline' },
}

function StatusCell({ captain, t }: { captain: Captain; t: any }) {
  const dispatch = useAppDispatch()
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Captain['status']
    setUpdating(true)
    try {
      await updateCaptainStatus(captain.id, newStatus)
      dispatch(updateCaptainStatusInStore({ id: captain.id, status: newStatus }))
    } catch (err) {
      console.error("Failed to update status", err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {updating ? (
        <div className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin shrink-0" />
      ) : (
        <span className={clsx(
          "h-2 w-2 rounded-full shrink-0",
          captain.status === 'available' && "bg-emerald-500",
          captain.status === 'busy' && "bg-amber-500",
          captain.status === 'offline' && "bg-zinc-500"
        )} />
      )}
      <select
        value={captain.status}
        disabled={updating}
        onChange={handleStatusChange}
        className="bg-transparent border-none text-xs font-semibold text-[var(--color-text-main)] hover:bg-[var(--color-bg-muted)] rounded px-1.5 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="available" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('available')}</option>
        <option value="busy" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('busy')}</option>
        <option value="offline" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('offline')}</option>
      </select>
    </div>
  )
}

export default function TeamCaptains() {
  const t = useCaptainTranslations()
  const dispatch = useAppDispatch()
  const captains = useAppSelector(selectCaptains)
  const locale = useLocale()
  const isRTL = locale === 'ar'

  // Modal State
  const [isOpen, setIsOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicleType, setVehicleType] = useState<'motorcycle' | 'car' | 'van' | 'truck'>('motorcycle')
  const [plateNumber, setPlateNumber] = useState('')

  // Search & Filter List State
  const [searchVal, setSearchVal] = useState('')
  const [relFilter, setRelFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [isLoadingList, setIsLoadingList] = useState(false)

  // Details Modal State
  const [selectedCaptain, setSelectedCaptain] = useState<Captain | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [captainPerformance, setCaptainPerformance] = useState<any>(null)
  const [captainExtraDetails, setCaptainExtraDetails] = useState<any>(null)

  // Detail Actions state
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [removeReason, setRemoveReason] = useState('')
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')

  // Action Status
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successCaptain, setSuccessCaptain] = useState<Captain | null>(null)

  // Invitation Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [inviteSubmitting, setInviteSubmitting] = useState(false)
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('')
  const [inviteErrorMsg, setInviteErrorMsg] = useState('')

  // Effect to load data based on search and filters
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchList = async () => {
        setIsLoadingList(true)
        try {
          const list = await getTeamCaptains({
            search: searchVal.trim() || undefined,
            relationshipStatus: relFilter === 'all' ? undefined : relFilter,
          })
          dispatch(setCaptainsInStore(list))
        } catch (err) {
          console.error("Failed to load captains", err)
        } finally {
          setIsLoadingList(false)
        }
      }
      fetchList()
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [searchVal, relFilter, dispatch])

  // Handlers for Details and Actions
  const handleOpenDetails = async (captain: Captain) => {
    setSelectedCaptain(captain)
    setIsDetailOpen(true)
    setDetailLoading(true)
    setDetailError('')
    setCaptainPerformance(null)
    setCaptainExtraDetails(null)
    setShowRemoveConfirm(false)
    setRemoveReason('')
    setActionError('')

    try {
      const [perf, details] = await Promise.all([
        getCaptainPerformance(captain.id),
        getCaptainById(captain.id)
      ])
      setCaptainPerformance(perf)
      setCaptainExtraDetails(details)
    } catch (err: any) {
      console.error(err)
      setDetailError(err?.response?.data?.message || err?.message || 'Failed to load details')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCloseDetails = () => {
    setIsDetailOpen(false)
    setSelectedCaptain(null)
  }

  const handleSuspendToggle = async () => {
    if (!selectedCaptain) return
    setActionSubmitting(true)
    setActionError('')
    const isCurrentlySuspended = selectedCaptain.relationshipStatus === 'SUSPENDED'
    try {
      if (isCurrentlySuspended) {
        await unsuspendCaptain(selectedCaptain.id)
        dispatch(updateCaptainRelationshipStatusInStore({ id: selectedCaptain.id, relationshipStatus: 'ACTIVE' }))
        setSelectedCaptain(prev => prev ? { ...prev, relationshipStatus: 'ACTIVE' } : null)
      } else {
        await suspendCaptain(selectedCaptain.id)
        dispatch(updateCaptainRelationshipStatusInStore({ id: selectedCaptain.id, relationshipStatus: 'SUSPENDED' }))
        setSelectedCaptain(prev => prev ? { ...prev, relationshipStatus: 'SUSPENDED' } : null)
      }
    } catch (err: any) {
      console.error(err)
      setActionError(err?.response?.data?.message || err?.message || 'Action failed')
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleRemoveConfirm = async () => {
    if (!selectedCaptain) return
    setActionSubmitting(true)
    setActionError('')
    try {
      await removeCaptain(selectedCaptain.id, removeReason.trim() || undefined)
      dispatch(removeCaptainFromStore(selectedCaptain.id))
      handleCloseDetails()
    } catch (err: any) {
      console.error(err)
      setActionError(err?.response?.data?.message || err?.message || 'Failed to remove captain')
    } finally {
      setActionSubmitting(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    setErrorMsg('')
    setSuccessCaptain(null)
    setFullName('')
    setEmail('')
    setPhone('')
    setVehicleType('motorcycle')
    setPlateNumber('')
  }

  const handleInviteOpen = () => {
    setIsInviteOpen(true)
    setSearchQuery('')
    setSearchResult(null)
    setSearching(false)
    setInviteSubmitting(false)
    setInviteSuccessMsg('')
    setInviteErrorMsg('')
  }

  const handleInviteClose = () => {
    setIsInviteOpen(false)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchResult(null)
    setInviteErrorMsg('')
    setInviteSuccessMsg('')
    try {
      const res = await searchCaptain(searchQuery)
      setSearchResult(res)
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.message || err?.message || 'Search failed'
      setInviteErrorMsg(msg)
    } finally {
      setSearching(false)
    }
  }

  const handleSendInvite = async () => {
    setInviteSubmitting(true)
    setInviteErrorMsg('')
    setInviteSuccessMsg('')
    try {
      const payload: any = {}
      if (searchResult && searchResult.status === 'found') {
        payload.captainId = searchResult.captain.id
      } else {
        if (searchQuery.includes('@')) {
          payload.email = searchQuery.trim()
        } else {
          payload.phone = searchQuery.trim()
        }
      }
      await inviteCaptain(payload)
      setInviteSuccessMsg(
        searchResult?.status === 'found'
          ? (isRTL ? 'تم إرسال الدعوة بنجاح للكابتن!' : 'Invitation sent successfully to captain!')
          : (isRTL ? 'تم إرسال دعوة التسجيل بنجاح!' : 'Registration invitation sent successfully!')
      )
      setSearchResult(null)
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.message || err?.message || 'Failed to send invitation'
      setInviteErrorMsg(msg)
    } finally {
      setInviteSubmitting(false)
    }
  }


  const handleClose = () => {
    setIsOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessCaptain(null)

    // Validation
    if (!fullName || !email || !phone || !plateNumber) {
      setErrorMsg(t('fillRequiredFields'))
      return
    }

    const phonePattern = /^01[0125][0-9]{8}$/
    if (!phonePattern.test(phone)) {
      setErrorMsg(t('invalidPhone'))
      return
    }

    setSubmitting(true)
    try {
      const response = await addTeamCaptain({
        fullName,
        email,
        phone,
        vehicleType,
        plateNumber,
      })

      dispatch(addCaptainToStore(response.captain))
      setSuccessCaptain(response.captain)
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.message || err?.message || t('addCaptainError')
      setErrorMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { key: 'name',   header: t('captain_col'), render: (c: Captain) => (
        <div className="flex items-center gap-2">
          <span className={clsx(
            "h-2 w-2 rounded-full shrink-0",
            c.status === 'available' && "bg-emerald-500",
            c.status === 'busy' && "bg-amber-500",
            c.status === 'offline' && "bg-zinc-500"
          )} />
          <span className="font-semibold text-[var(--color-text-main)]">{c.name}</span>
        </div>
      )
    },
    { key: 'phone',  header: t('phone_col') },
    { key: 'status', header: t('status_col'), render: (c: Captain) => <StatusCell captain={c} t={t} /> },
    {
      key: 'relationshipStatus',
      header: isRTL ? 'حالة الانضمام' : 'Relationship',
      render: (c: Captain) => {
        const isSuspended = c.relationshipStatus === 'SUSPENDED'
        return (
          <Badge variant={isSuspended ? 'amber' : 'green'}>
            {isSuspended 
              ? (isRTL ? 'موقوف مؤقتاً' : 'Suspended') 
              : (isRTL ? 'نشط' : 'Active')}
          </Badge>
        )
      }
    },
    {
      key: 'actions',
      header: isRTL ? 'إجراءات' : 'Actions',
      render: (c: Captain) => (
        <button
          onClick={() => handleOpenDetails(c)}
          className="px-3 py-1 bg-[var(--color-bg-muted)] hover:bg-[var(--color-border)] text-[var(--color-text-main)] text-[11px] font-semibold rounded-lg border border-[var(--color-border)] transition-colors focus:outline-none"
        >
          {isRTL ? 'التفاصيل / الإدارة' : 'Details / Manage'}
        </button>
      )
    }
  ]

  return (
    <div className="relative">
      <div className="flex items-start justify-between mb-[22px]">
        <div>
          <h1 className="text-[22px] font-extrabold text-[var(--color-text-main)] mb-1">{t('team_title')}</h1>
          <p className="text-[13px] text-[var(--color-text-sub)]">{t('team_sub')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInviteOpen}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-md focus:outline-none"
          >
            <UserPlus size={14} />
            {isRTL ? 'دعوة كابتن' : 'Invite Captain'}
          </button>
          <button
            onClick={handleOpen}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-md focus:outline-none"
          >
            <UserPlus size={14} />
            {t('addCaptain')}
          </button>
        </div>
      </div>


      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-72">
          <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={isRTL ? 'ابحث بالاسم، البريد أو الهاتف...' : 'Search by name, email, phone...'}
            className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-8 py-2 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
          />
          {isLoadingList && (
            <div className="absolute end-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 rounded-full border-2 border-t-transparent border-blue-500 animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-[var(--color-text-sub)] font-semibold shrink-0">
            {isRTL ? 'حالة الانضمام:' : 'Affiliation:'}
          </span>
          <select
            value={relFilter}
            onChange={(e) => setRelFilter(e.target.value as any)}
            className="bg-[var(--color-bg-muted)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-main)] rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[140px]"
          >
            <option value="all" className="bg-[var(--color-bg-card)]">{isRTL ? 'الكل' : 'All'}</option>
            <option value="active" className="bg-[var(--color-bg-card)]">{isRTL ? 'نشط فقط' : 'Active Only'}</option>
            <option value="suspended" className="bg-[var(--color-bg-card)]">{isRTL ? 'الموقوفين فقط' : 'Suspended Only'}</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={captains} keyField="id" />

      {/* Modern Add Captain Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]/20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)]">
                {t('addCaptainTitle')}
              </h2>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg text-[var(--dh-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-muted)] transition-colors focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-6 overflow-y-auto flex-1">
              {successCaptain ? (
                // Success screen
                <div className="flex flex-col items-center text-center py-6 gap-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-main)]">
                      {t('captainRegisteredSuccess')}
                    </h3>
                    <p className="text-xs text-[var(--color-text-sub)] mt-1 max-w-[260px] mx-auto">
                      {t('captainAddedToList', { name: successCaptain.name })}
                    </p>
                  </div>

                  {/* OTP Sent Notice */}
                  <div className="w-full bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3 text-start">
                    <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-[var(--color-text-main)]">
                        {isRTL ? 'تم إرسال رمز التحقق (OTP)' : 'OTP Sent to Captain'}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-sub)] leading-relaxed">
                        {isRTL
                          ? `تم إرسال رمز تفعيل الحساب إلى بريد الكابتن. يجب على الكابتن تفعيل حسابه وإنشاء كلمة مرور قبل تسجيل الدخول.`
                          : `An activation OTP was sent to the captain's email. They must verify and set a password before logging in.`}
                      </span>
                      <span className="text-[10px] font-bold text-blue-400 mt-1">
                        {isRTL ? `رقم الهاتف: ${phone}` : `Phone: ${phone}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full mt-2 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md focus:outline-none"
                  >
                    {t('closeConfirmation')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {errorMsg && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-sub)]">
                      {t('fullNameLabel')} *
                    </label>
                    <div className="relative">
                      <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('fullNamePlaceholder')}
                        className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-sub)]">
                      {t('emailLabel')} *
                    </label>
                    <div className="relative">
                      <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text-sub)]">
                      {t('phoneLabel')} *
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 01012345678"
                        className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Vehicle Type */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-text-sub)]">
                        {t('vehicleTypeLabel')} *
                      </label>
                      <div className="relative">
                        <Truck className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)] pointer-events-none" />
                        <select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value as any)}
                          className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 appearance-none transition-colors"
                        >
                          <option value="motorcycle" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('vehicleMotorcycle')}</option>
                          <option value="car" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('vehicleCar')}</option>
                          <option value="van" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('vehicleVan')}</option>
                          <option value="truck" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">{t('vehicleTruck')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Plate Number */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[var(--color-text-sub)]">
                        {t('plateNumberLabel')} *
                      </label>
                      <div className="relative">
                        <Hash className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
                        <input
                          type="text"
                          required
                          value={plateNumber}
                          onChange={(e) => setPlateNumber(e.target.value)}
                          placeholder={t('plateNumberPlaceholder')}
                          className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 pe-4 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* OTP notice */}
                  <div className="flex items-start gap-2.5 p-3 bg-blue-500/5 border border-blue-500/15 rounded-lg">
                    <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-[var(--color-text-sub)] leading-relaxed">
                      {isRTL
                        ? 'سيتلقى الكابتن رمز تحقق (OTP) على بريده الإلكتروني لتفعيل حسابه وإنشاء كلمة مرور. لن يتمكن من تسجيل الدخول قبل ذلك.'
                        : 'The captain will receive an OTP to their email to activate their account and create a password. They cannot log in until verification is complete.'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all shadow-md focus:outline-none mt-2 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-t-white border-blue-800 animate-spin" />
                        <span>{t('addingCaptain')}</span>
                      </>
                    ) : (
                      <span>{t('registerCaptainBtn')}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modern Invite Captain Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]/20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)]">
                {isRTL ? 'دعوة كابتن جديد' : 'Invite New Captain'}
              </h2>
              <button
                onClick={handleInviteClose}
                className="p-1 rounded-lg text-[var(--dh-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-muted)] transition-colors focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
              {inviteSuccessMsg ? (
                <div className="flex flex-col items-center text-center py-6 gap-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-main)]">
                      {isRTL ? 'تم إرسال الدعوة!' : 'Invitation Sent!'}
                    </h3>
                    <p className="text-xs text-[var(--color-text-sub)] mt-1 max-w-[260px] mx-auto">
                      {inviteSuccessMsg}
                    </p>
                  </div>
                  <button
                    onClick={handleInviteClose}
                    className="w-full mt-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md focus:outline-none"
                  >
                    {isRTL ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              ) : (
                <>
                  {inviteErrorMsg && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{inviteErrorMsg}</span>
                    </div>
                  )}

                  {/* Search Form */}
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
                      <input
                        type="text"
                        required
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isRTL ? 'البحث عن طريق البريد الإلكتروني أو الهاتف' : 'Search by email or phone'}
                        className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg ps-9 py-2.5 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={searching}
                      className="px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-md focus:outline-none flex items-center justify-center shrink-0 min-w-[70px]"
                    >
                      {searching ? (
                        <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                      ) : (
                        isRTL ? 'بحث' : 'Search'
                      )}
                    </button>
                  </form>

                  {/* Search Result section */}
                  {searchResult && (
                    <div className="mt-2 border border-[var(--color-border)] rounded-xl p-4 bg-[var(--color-bg-muted)]/10 flex flex-col gap-3">
                      {searchResult.status === 'found' ? (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-sm shrink-0">
                              {searchResult.captain.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[var(--color-text-main)]">
                                {searchResult.captain.name}
                              </h4>
                              <p className="text-[10px] text-[var(--color-text-sub)]">
                                {searchResult.captain.email} | {searchResult.captain.phone}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-3 text-[11px]">
                            <div>
                              <span className="text-[var(--dh-text-muted)]">{isRTL ? 'التقييم:' : 'Rating:'}</span>{' '}
                              <span className="font-bold text-[var(--color-text-main)]">
                                ⭐ {searchResult.captain.rating || '0.0'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[var(--dh-text-muted)]">{isRTL ? 'التوصيلات المكتملة:' : 'Total Deliveries:'}</span>{' '}
                              <span className="font-bold text-[var(--color-text-main)]">
                                {searchResult.captain.deliveries}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 text-center mt-1">
                            {isRTL ? 'الكابتن مسجل في المنصة!' : 'Captain Found on Platform!'}
                          </div>

                          <button
                            onClick={handleSendInvite}
                            disabled={inviteSubmitting}
                            className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md focus:outline-none flex items-center justify-center gap-2"
                          >
                            {inviteSubmitting ? (
                              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                            ) : (
                              isRTL ? 'إرسال دعوة انضمام للمكتب' : 'Invite Captain to Office'
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="text-center py-4 flex flex-col items-center gap-2">
                            <div className="text-amber-500 font-bold text-sm">
                              ⚠️ {isRTL ? 'لم يتم العثور على الكابتن' : 'Captain Not Found'}
                            </div>
                            <p className="text-[11px] text-[var(--color-text-sub)] max-w-[220px]">
                              {isRTL 
                                ? 'هذا الحساب غير مسجل حالياً. يمكنك إرسال دعوة تسجيل عبر البريد الإلكتروني أو الهاتف.'
                                : 'This email/phone is not registered yet. You can send a registration invitation link.'}
                            </p>
                          </div>

                          <button
                            onClick={handleSendInvite}
                            disabled={inviteSubmitting}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md focus:outline-none flex items-center justify-center gap-2"
                          >
                            {inviteSubmitting ? (
                              <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                            ) : (
                              isRTL ? 'إرسال دعوة تسجيل' : 'Send Registration Invitation'
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modern Manage / Details Modal */}
      {isDetailOpen && selectedCaptain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]/20">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-main)]">
                  {isRTL ? 'إدارة تفاصيل الكابتن' : 'Manage Captain Details'}
                </h2>
                <p className="text-[11px] text-[var(--color-text-sub)] mt-0.5">
                  {selectedCaptain.name}
                </p>
              </div>
              <button
                onClick={handleCloseDetails}
                className="p-1 rounded-lg text-[var(--dh-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-muted)] transition-colors focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-blue-500 animate-spin" />
                  <span className="text-xs text-[var(--color-text-sub)]">{isRTL ? 'جاري تحميل التفاصيل...' : 'Loading details...'}</span>
                </div>
              ) : detailError ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{detailError}</span>
                </div>
              ) : (
                <>
                  {/* Status Banner */}
                  {selectedCaptain.relationshipStatus === 'SUSPENDED' && (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-relaxed">
                        <strong className="block font-bold mb-0.5">
                          {isRTL ? 'الحساب موقوف مؤقتاً' : 'Affiliation Suspended'}
                        </strong>
                        {isRTL
                          ? 'هذا الكابتن موقوف مؤقتاً في مكتبك ولن يتلقى أي طلبات أو شحنات جديدة حتى يتم إلغاء الإيقاف.'
                          : 'This captain is suspended and will not receive any new shipment offers or assignments from your office.'}
                      </div>
                    </div>
                  )}

                  {/* General Info Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-[var(--color-bg-muted)]/20 p-4 rounded-xl border border-[var(--color-border)]">
                    <div>
                      <span className="text-[10px] text-[var(--dh-text-muted)] block uppercase font-bold tracking-wider mb-0.5">
                        {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                      </span>
                      <span className="text-xs font-semibold text-[var(--color-text-main)] break-all">
                        {captainExtraDetails?.user?.email || selectedCaptain.phone + '@tayar.com'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--dh-text-muted)] block uppercase font-bold tracking-wider mb-0.5">
                        {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                      </span>
                      <span className="text-xs font-semibold text-[var(--color-text-main)]">
                        {selectedCaptain.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--dh-text-muted)] block uppercase font-bold tracking-wider mb-0.5">
                        {isRTL ? 'نوع المركبة' : 'Vehicle Type'}
                      </span>
                      <span className="text-xs font-semibold text-[var(--color-text-main)] capitalize">
                        {captainExtraDetails?.vehicle?.type || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--dh-text-muted)] block uppercase font-bold tracking-wider mb-0.5">
                        {isRTL ? 'رقم اللوحة' : 'Plate Number'}
                      </span>
                      <span className="text-xs font-semibold text-[var(--color-text-main)]">
                        {captainExtraDetails?.vehicle?.plateNumber || '-'}
                      </span>
                    </div>
                  </div>

                  {/* Performance stats grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border border-[var(--color-border)] rounded-xl p-3 bg-[var(--color-bg-muted)]/5 text-center flex flex-col items-center justify-center">
                      <Award className="h-5 w-5 text-yellow-500 mb-1" />
                      <span className="text-[10px] text-[var(--dh-text-muted)] block mb-0.5">{isRTL ? 'التقييم' : 'Rating'}</span>
                      <span className="text-sm font-bold text-[var(--color-text-main)]">
                        ⭐ {captainPerformance?.avgRating?.toFixed(1) || '0.0'}
                      </span>
                    </div>

                    <div className="border border-[var(--color-border)] rounded-xl p-3 bg-[var(--color-bg-muted)]/5 text-center flex flex-col items-center justify-center">
                      <Inbox className="h-5 w-5 text-blue-500 mb-1" />
                      <span className="text-[10px] text-[var(--dh-text-muted)] block mb-0.5">{isRTL ? 'التوصيلات' : 'Deliveries'}</span>
                      <span className="text-sm font-bold text-[var(--color-text-main)]">
                        {captainPerformance?.completedDeliveries || 0}
                      </span>
                    </div>

                    <div className="border border-[var(--color-border)] rounded-xl p-3 bg-[var(--color-bg-muted)]/5 text-center flex flex-col items-center justify-center">
                      <PiggyBank className="h-5 w-5 text-emerald-500 mb-1" />
                      <span className="text-[10px] text-[var(--dh-text-muted)] block mb-0.5">{isRTL ? 'رصيد المحفظة' : 'Wallet'}</span>
                      <span className="text-xs font-bold text-[var(--color-text-main)]">
                        {captainPerformance?.walletBalance || 0} EGP
                      </span>
                    </div>
                  </div>

                  {/* Action Error message */}
                  {actionError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{actionError}</span>
                    </div>
                  )}

                  {/* Actions Area */}
                  {!showRemoveConfirm ? (
                    <div className="flex gap-3 border-t border-[var(--color-border)] pt-4">
                      <button
                        onClick={handleSuspendToggle}
                        disabled={actionSubmitting}
                        className={clsx(
                          "flex-1 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm focus:outline-none flex items-center justify-center gap-2 border",
                          selectedCaptain.relationshipStatus === 'SUSPENDED'
                            ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-600 text-white"
                            : "bg-amber-600/10 hover:bg-amber-600/20 border-amber-500/20 text-amber-500"
                        )}
                      >
                        {actionSubmitting ? (
                          <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-current animate-spin" />
                        ) : selectedCaptain.relationshipStatus === 'SUSPENDED' ? (
                          isRTL ? 'إلغاء تعليق الكابتن' : 'Unsuspend Captain'
                        ) : (
                          isRTL ? 'تعليق الكابتن' : 'Suspend Captain'
                        )}
                      </button>

                      <button
                        onClick={() => setShowRemoveConfirm(true)}
                        disabled={actionSubmitting}
                        className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-500 transition-all shadow-sm focus:outline-none"
                      >
                        {isRTL ? 'إنهاء الانضمام (إزالة)' : 'Remove from Office'}
                      </button>
                    </div>
                  ) : (
                    <div className="border border-red-500/20 rounded-xl p-4 bg-red-500/5 flex flex-col gap-3.5 animate-fadeIn">
                      <div>
                        <h4 className="text-xs font-bold text-red-500 mb-1">
                          ⚠️ {isRTL ? 'هل أنت متأكد من إزالة الكابتن؟' : 'Are you sure you want to remove this captain?'}
                        </h4>
                        <p className="text-[10px] text-[var(--color-text-sub)] leading-normal">
                          {isRTL
                            ? 'سيؤدي هذا إلى قطع العلاقة بين المكتب والكابتن فقط، ولن يؤثر على حسابه الشخصي أو شحناته السابقة.'
                            : 'This will terminate the relationship with your office. The captain profile, wallet, and history remain intact.'}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[var(--color-text-sub)]">
                          {isRTL ? 'سبب الإزالة (اختياري)' : 'Reason for removal (optional)'}
                        </label>
                        <input
                          type="text"
                          value={removeReason}
                          onChange={(e) => setRemoveReason(e.target.value)}
                          placeholder={isRTL ? 'اكتب سبب الإزالة هنا...' : 'e.g. Completed affiliation, contract ended'}
                          className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs text-[var(--color-text-main)] focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleRemoveConfirm}
                          disabled={actionSubmitting}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-md focus:outline-none flex items-center justify-center gap-2"
                        >
                          {actionSubmitting ? (
                            <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                          ) : (
                            isRTL ? 'تأكيد الإزالة' : 'Confirm Removal'
                          )}
                        </button>
                        <button
                          onClick={() => setShowRemoveConfirm(false)}
                          disabled={actionSubmitting}
                          className="px-4 py-2 border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] rounded-lg text-xs font-bold hover:bg-[var(--color-bg-muted)] transition-colors focus:outline-none"
                        >
                          {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
