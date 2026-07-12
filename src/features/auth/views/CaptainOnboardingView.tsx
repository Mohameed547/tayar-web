'use client'

import { useState, useEffect, useRef } from 'react'
import { ShieldCheck, Eye, EyeOff, CheckCircle, Lock, Phone, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react'
import {
  verifyCaptainOtp,
  setCaptainPassword,
  resendCaptainOtp,
  getCaptainOnboardingStatus,
} from '@/features/auth/api'
import { useRouter, useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'

type Step = 'otp' | 'password' | 'success'

const OTP_EXPIRY = 1 * 60 // 1 minute in seconds
const MAX_RESENDS = 5

function PasswordStrength({ password, t }: { password: string; t: any }) {
  const checks = [
    { label: t('onboarding_pwd_len'), ok: password.length >= 8 },
    { label: t('onboarding_pwd_upper'), ok: /[A-Z]/.test(password) },
    { label: t('onboarding_pwd_lower'), ok: /[a-z]/.test(password) },
    { label: t('onboarding_pwd_num'), ok: /[0-9]/.test(password) },
    { label: t('onboarding_pwd_special'), ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const strength = checks.filter(c => c.ok).length
  const strengthLabels = {
    1: 'Very Weak',
    2: 'Weak',
    3: 'Fair',
    4: 'Good',
    5: 'Strong',
  } as const
  const strengthLabel = strengthLabels[strength as keyof typeof strengthLabels] ?? ''
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'][strength - 1] ?? 'bg-zinc-300'

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-500', strengthColor)}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-[var(--color-text-sub)] w-16 text-right">{strengthLabel}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <div key={c.label} className={clsx('flex items-center gap-1.5 text-[10px] font-semibold', c.ok ? 'text-emerald-400' : 'text-[var(--dh-text-muted)]')}>
            <div className={clsx('h-1.5 w-1.5 rounded-full shrink-0', c.ok ? 'bg-emerald-400' : 'bg-[var(--color-border)]')} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CaptainOnboardingView() {
  const t = useTranslations('captain')
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneFromQuery = searchParams.get('phone') ?? ''
  const emailFromQuery = searchParams.get('email') ?? ''

  const [step, setStep] = useState<Step>('otp')
  const [phone] = useState(phoneFromQuery)
  const [email, setEmail] = useState(emailFromQuery)

  // Fetch onboarding status on mount to retrieve email and automatically advance if already verified
  useEffect(() => {
    if (!phone) return
    const fetchStatus = async () => {
      try {
        const data = await getCaptainOnboardingStatus(phone)
        if (data.email) {
          setEmail(data.email)
        }
        if (data.isPhoneVerified) {
          setStep('password')
        }
      } catch (err) {
        console.error("Failed to fetch onboarding status:", err)
      }
    }
    fetchStatus()
  }, [phone])

  // OTP Step
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [countdown, setCountdown] = useState(OTP_EXPIRY)
  const [resendsLeft, setResendsLeft] = useState(MAX_RESENDS)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Password Step
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState('')

  // Countdown timer
  useEffect(() => {
    if (step !== 'otp') return
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [step])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // OTP digit input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otpDigits]
    next[index] = value
    setOtpDigits(next)
    setOtpError('')
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('')
    if (otp.length < 6) {
      setOtpError(t('onboarding_enter_full_otp'))
      return
    }
    setOtpLoading(true)
    setOtpError('')
    try {
      await verifyCaptainOtp(phone, otp)
      setStep('password')
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || err?.message || 'Invalid OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setResending(true)
    setOtpError('')
    try {
      const result = await resendCaptainOtp(phone)
      setResendsLeft(result.resendsLeft)
      setCountdown(OTP_EXPIRY)
      setOtpDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || err?.message || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError('')

    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ]
    if (!checks.every(Boolean)) {
      setPwdError(t('onboarding_pwd_requirements'))
      return
    }
    if (password !== confirmPassword) {
      setPwdError(t('onboarding_pwd_mismatch'))
      return
    }

    setPwdLoading(true)
    try {
      await setCaptainPassword(phone, password)
      setStep('success')
    } catch (err: any) {
      setPwdError(err?.response?.data?.message || err?.message || 'Failed to set password. Please try again.')
    } finally {
      setPwdLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-4">
            <ShieldCheck className="h-7 w-7 text-blue-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text-main)] tracking-tight">
            {step === 'otp' ? t('onboarding_title_otp') : step === 'password' ? t('onboarding_title_pwd') : t('onboarding_title_success')}
          </h1>
          <p className="text-sm text-[var(--color-text-sub)] mt-1.5 font-medium">
            {step === 'otp'
              ? t('onboarding_subtitle_otp')
              : step === 'password'
              ? t('onboarding_subtitle_pwd')
              : t('onboarding_subtitle_success')}
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(['otp', 'password', 'success'] as const).map((s, i) => {
            const stepIndex = { otp: 0, password: 1, success: 2 } as const
            const currentIndex = stepIndex[step]
            const isActive = i <= currentIndex
            return (
              <div
                key={s}
                className={clsx(
                  'h-1.5 flex-1 rounded-full transition-all duration-500',
                  isActive ? 'bg-blue-500' : 'bg-[var(--color-border)]'
                )}
              />
            )
          })}
        </div>

        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden">

          {/* ── OTP Step ─────────────────────────────────────────────────────── */}
          {step === 'otp' && (
            <div className="p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span className="text-xs text-[var(--color-text-sub)] font-medium">
                  {t('onboarding_code_sent', { email: email || phone })}
                </span>
              </div>

              {/* OTP Inputs */}
              <div className="flex gap-2.5 justify-center" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={clsx(
                      'h-14 w-11 text-center text-xl font-bold rounded-xl border-2 bg-[var(--color-bg-muted)] text-[var(--color-text-main)] focus:outline-none transition-all duration-200',
                      digit ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--color-border)]',
                      otpError && 'border-red-500'
                    )}
                  />
                ))}
              </div>

              {/* Error */}
              {otpError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Countdown + Resend */}
              <div className="flex items-center justify-between">
                <div className={clsx(
                  'text-sm font-mono font-bold tabular-nums',
                  countdown < 60 ? 'text-red-400' : 'text-[var(--color-text-sub)]'
                )}>
                  {formatTime(countdown)}
                </div>
                <button
                  type="button"
                  disabled={countdown > 0 || resending || resendsLeft <= 0}
                  onClick={handleResendOtp}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={clsx('h-3.5 w-3.5', resending && 'animate-spin')} />
                  {resendsLeft > 0 ? t('onboarding_resend_otp', { count: resendsLeft }) : t('onboarding_no_resends')}
                </button>
              </div>

              <button
                type="button"
                disabled={otpLoading || otpDigits.join('').length < 6}
                onClick={handleVerifyOtp}
                className="w-full py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {otpLoading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                ) : (
                  <>{t('onboarding_verify_code')} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></>
                )}
              </button>
            </div>
          )}

          {/* ── Password Step ─────────────────────────────────────────────────── */}
          {step === 'password' && (
            <form onSubmit={handleSetPassword} className="p-8 flex flex-col gap-5">
              <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-[var(--color-text-sub)] font-medium">
                  {t('onboarding_otp_verified')}
                </span>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--color-text-sub)]">{t('onboarding_new_pwd')}</label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('onboarding_placeholder_new')}
                    className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-xl ps-9 pe-10 py-3 text-sm text-[var(--color-text-main)] focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--dh-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && <PasswordStrength password={password} t={t} />}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--color-text-sub)]">{t('onboarding_confirm_pwd')}</label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--dh-text-muted)]" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder={t('onboarding_placeholder_confirm')}
                    className={clsx(
                      'w-full bg-[var(--color-bg-muted)] border rounded-xl ps-9 pe-10 py-3 text-sm text-[var(--color-text-main)] focus:outline-none transition-colors',
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : confirmPassword && password === confirmPassword
                        ? 'border-emerald-500'
                        : 'border-[var(--color-border)] focus:border-blue-500'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(p => !p)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--dh-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[10px] text-red-400 font-semibold mt-0.5">{t('onboarding_pwd_mismatch')}</p>
                )}
              </div>

              {pwdError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{pwdError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pwdLoading || !password || !confirmPassword}
                className="w-full py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-1"
              >
                {pwdLoading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin" />
                ) : (
                  <>{t('onboarding_set_pwd')} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></>
                )}
              </button>
            </form>
          )}

          {/* ── Success Step ──────────────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="p-8 flex flex-col items-center text-center gap-5">
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[var(--color-text-main)]">{t('onboarding_title_success')}</h2>
                <p className="text-xs text-[var(--color-text-sub)] mt-2 max-w-[280px] mx-auto leading-relaxed">
                  {t('onboarding_success_body')}
                </p>
              </div>
              <button
                onClick={() => router.push('/captain-dashboard')}
                className="w-full py-3 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {t('onboarding_go_dashboard')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-[var(--dh-text-muted)] mt-6">
          {t('onboarding_need_help')}
        </p>
      </div>
    </div>
  )
}
