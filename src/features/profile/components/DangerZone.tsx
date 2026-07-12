"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { AlertTriangle, Trash2, Lock, Loader2, CheckCircle, X } from "lucide-react";
import { logout } from "@/features/auth/api";
import { deleteAccount } from "../api";

interface DangerZoneProps {
  userProfile: {
    name?: string;
    email?: string;
    phone?: string;
  };
  role: "customer" | "driver" | "office";
}

type Step = "confirm" | "password" | "loading" | "success";

const MESSAGES = {
  en: {
    dangerZone: "Account Deactivation",
    deleteAccount: "Delete Account",
    deleteDesc:
      "Once you delete your account, there is no going back. Please be absolutely certain before proceeding.",
    explainConsequences: "You cannot proceed if any of the following apply:",
    customerConsequences: [
      "You have active or pending shipments.",
      "Your wallet balance is greater than 0.00.",
      "You have open support disputes.",
    ],
    driverConsequences: [
      "You have a delivery currently in progress.",
      "Your status is set to online.",
      "Your wallet balance is greater than 0.00.",
    ],
    officeConsequences: [
      "You have active shipments or pending offers.",
      "You have assigned captains or employees.",
      "Your wallet balance is greater than 0.00.",
    ],
    typeConfirmLabel: 'To confirm, type "DELETE" in the field below:',
    typeConfirmPlaceholder: "DELETE",
    reasonLabel: "Reason for leaving (required, min 5 characters):",
    reasonPlaceholder: "Tell us why you are deleting your account…",
    reasonError: "Please provide a reason of at least 5 characters.",
    confirmError: 'You must type "DELETE" to confirm.',
    passwordTitle: "Verify Your Password",
    passwordDesc: "Enter your account password to confirm account deletion:",
    passwordPlaceholder: "Your account password",
    passwordError: "Incorrect password. Please try again.",
    deleteBtn: "Permanently Delete My Account",
    nextBtn: "Continue",
    backBtn: "Back",
    cancelBtn: "Cancel",
    processing: "Processing…",
    successTitle: "Deletion Scheduled",
    successDesc:
      "Your account deletion has been scheduled. You have 30 days to restore it. You will now be logged out.",
  },
  ar: {
    dangerZone: "إلغاء تنشيط الحساب",
    deleteAccount: "حذف الحساب",
    deleteDesc:
      "بمجرد حذف حسابك لن تتمكن من التراجع. يرجى التأكد تمامًا قبل المتابعة.",
    explainConsequences: "لا يمكنك المتابعة إذا كان أيٌّ مما يلي ينطبق عليك:",
    customerConsequences: [
      "لديك شحنات نشطة أو معلقة.",
      "رصيد محفظتك أكبر من 0.00.",
      "لديك نزاعات دعم مفتوحة.",
    ],
    driverConsequences: [
      "لديك عملية توصيل قيد التنفيذ.",
      "حالتك الحالية متصل بالإنترنت.",
      "رصيد محفظتك أكبر من 0.00.",
    ],
    officeConsequences: [
      "لديك شحنات نشطة أو عروض معلقة.",
      "لديك كباتن أو موظفون مسجلون تحت حسابك.",
      "رصيد محفظتك أكبر من 0.00.",
    ],
    typeConfirmLabel: 'للتأكيد، اكتب كلمة "حذف" في الحقل أدناه:',
    typeConfirmPlaceholder: "حذف",
    reasonLabel: "سبب المغادرة (مطلوب، 5 أحرف على الأقل):",
    reasonPlaceholder: "أخبرنا لماذا تريد حذف حسابك…",
    reasonError: "يرجى تقديم سبب من 5 أحرف على الأقل.",
    confirmError: 'يجب كتابة كلمة "حذف" للتأكيد.',
    passwordTitle: "تأكيد كلمة المرور",
    passwordDesc: "أدخل كلمة مرور حسابك لتأكيد عملية الحذف:",
    passwordPlaceholder: "كلمة مرور حسابك",
    passwordError: "كلمة المرور غير صحيحة. حاول مرة أخرى.",
    deleteBtn: "حذف حسابي نهائيًا",
    nextBtn: "التالي",
    backBtn: "رجوع",
    cancelBtn: "إلغاء",
    processing: "جاري المعالجة…",
    successTitle: "تمت جدولة الحذف",
    successDesc:
      "تمت جدولة حذف حسابك بنجاح. لديك 30 يومًا لاستعادته. سيتم تسجيل خروجك الآن.",
  },
};

export default function DangerZone({ userProfile, role }: DangerZoneProps) {
  const locale = useLocale();
  const text = locale === "ar" ? MESSAGES.ar : MESSAGES.en;

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("confirm");

  const [typedConfirm, setTypedConfirm] = useState("");
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // --- Helpers ---
  const resetAndClose = () => {
    setIsOpen(false);
    setStep("confirm");
    setTypedConfirm("");
    setReason("");
    setPassword("");
    setErrorMsg("");
  };

  const consequences =
    role === "customer"
      ? text.customerConsequences
      : role === "driver"
      ? text.driverConsequences
      : text.officeConsequences;

  const confirmWord = locale === "ar" ? "حذف" : "DELETE";
  const isConfirmMatch = typedConfirm.trim().toUpperCase() === confirmWord.toUpperCase();
  const isReasonValid = reason.trim().length >= 5;

  // --- Step handlers ---
  const handleNextFromConfirm = () => {
    if (!isReasonValid) {
      setErrorMsg(text.reasonError);
      return;
    }
    if (!isConfirmMatch) {
      setErrorMsg(text.confirmError);
      return;
    }
    setErrorMsg("");
    setStep("password");
  };

  const handleVerifyPasswordAndDelete = async () => {
    if (!password) return;
    setErrorMsg("");
    setStep("loading");
    try {
      const { default: api } = await import("@/lib/api/client");
      // 1. Verify password via auth login endpoint
      await api.post("/api/auth/login", {
        emailOrPhone: userProfile.phone || userProfile.email,
        password,
      });

      // 2. Perform deletion directly (bypass unnecessary OTP)
      await deleteAccount(reason.trim(), password);
      
      setStep("success");
      setTimeout(async () => {
        await logout();
        window.location.href = "/login";
      }, 4000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        text.passwordError;
      setErrorMsg(msg);
      setStep("password");
    }
  };

  return (
    <div 
      className="mt-10 relative overflow-hidden border border-red-200/80 dark:border-red-950/30 bg-gradient-to-br from-red-50/20 via-transparent to-red-50/10 dark:from-red-950/5 dark:to-transparent rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_8px_30px_rgb(239,68,68,0.02)] transition-all duration-350 hover:shadow-[0_8px_30px_rgb(239,68,68,0.05)] text-start"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Background visual element */}
      <div className="absolute top-0 right-0 h-40 w-40 bg-red-400/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

      {/* Content Side */}
      <div className="flex flex-col gap-3 max-w-2xl relative z-10">
        <div className="flex items-center gap-2">
          {/* Glowing pulse indicator */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full border border-red-100 dark:border-red-900/30">
            {text.dangerZone}
          </span>
        </div>
        <p className="text-xs md:text-[13px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
          {text.deleteDesc}
        </p>
      </div>

      {/* Button Side */}
      <div className="shrink-0 flex items-center justify-start md:justify-end relative z-10">
        <button
          id="danger-zone-delete-btn"
          onClick={() => {
            resetAndClose();
            setIsOpen(true);
          }}
          className="relative group overflow-hidden flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-950 text-red-500 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 transition-all duration-300 shadow-sm hover:shadow-[0_4px_15px_rgba(239,68,68,0.2)] focus:outline-none"
        >
          <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
          <span>{text.deleteAccount}</span>
        </button>
      </div>

      {/* ─── Modal Overlay ─── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          dir={locale === "ar" ? "rtl" : "ltr"}
          onClick={(e) => {
            if (e.target === e.currentTarget && step !== "loading") resetAndClose();
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 px-5 py-4 bg-zinc-50 dark:bg-zinc-950/40">
              <div className="flex items-center gap-2 text-red-500">
                <Trash2 className="h-4.5 w-4.5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {text.deleteAccount}
                </span>
              </div>
              {step !== "loading" && step !== "success" && (
                <button
                  onClick={resetAndClose}
                  className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Step Progress Bar */}
            {step !== "loading" && step !== "success" && (
              <div className="px-5 py-3 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${step === "confirm" ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
                  <span>{locale === 'ar' ? 'التأكيد' : 'Confirm'}</span>
                </div>
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1 mx-3" />
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${step === "password" ? "bg-red-500 animate-pulse" : "bg-zinc-300 dark:bg-zinc-700"}`} />
                  <span>{locale === 'ar' ? 'كلمة المرور' : 'Password'}</span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="mx-5 mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs font-semibold flex items-start gap-2 text-start">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <div className="p-5 flex flex-col gap-4">

              {/* ── Step 1: Confirm ── */}
              {step === "confirm" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex flex-col gap-2.5 text-start">
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{text.explainConsequences}</span>
                    </p>
                    <ul className="space-y-2">
                      {consequences.map((c, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2 text-start">
                    <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-extrabold uppercase tracking-wider">
                      {text.reasonLabel}
                    </label>
                    <textarea
                      rows={2.5}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={text.reasonPlaceholder}
                      maxLength={500}
                      className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2 text-start">
                    <label className="text-[10px] text-zinc-500 dark:text-zinc-400 font-extrabold uppercase tracking-wider">
                      {text.typeConfirmLabel}
                    </label>
                    <input
                      id="danger-confirm-input"
                      type="text"
                      value={typedConfirm}
                      onChange={(e) => setTypedConfirm(e.target.value)}
                      placeholder={text.typeConfirmPlaceholder}
                      autoComplete="off"
                      className={`w-full text-xs bg-zinc-50 dark:bg-zinc-950 border rounded-xl px-3 py-3 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none transition-colors font-mono tracking-widest ${
                        typedConfirm && !isConfirmMatch
                          ? "border-red-500/50 focus:border-red-500/70"
                          : isConfirmMatch
                          ? "border-emerald-500/40"
                          : "border-zinc-200 dark:border-zinc-800 focus:border-zinc-300 dark:focus:border-zinc-700"
                      }`}
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-3.5 border-t border-zinc-150 dark:border-zinc-800">
                    <button
                      onClick={resetAndClose}
                      className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-200 transition-colors focus:outline-none"
                    >
                      {text.cancelBtn}
                    </button>
                    <button
                      id="danger-confirm-next-btn"
                      disabled={!isConfirmMatch || !isReasonValid}
                      onClick={handleNextFromConfirm}
                      className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-red-650 hover:bg-red-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none shadow-sm"
                    >
                      {text.nextBtn}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Password ── */}
              {step === "password" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-start">
                    <div className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg shrink-0">
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-0.5">{text.passwordTitle}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{text.passwordDesc}</p>
                    </div>
                  </div>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && password) handleVerifyPasswordAndDelete(); }}
                    placeholder={text.passwordPlaceholder}
                    autoComplete="current-password"
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors"
                  />

                  <div className="flex gap-3 justify-end pt-3.5 border-t border-zinc-150 dark:border-zinc-800">
                    <button
                      onClick={() => { setErrorMsg(""); setStep("confirm"); }}
                      className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-200 transition-colors focus:outline-none"
                    >
                      {text.backBtn}
                    </button>
                    <button
                      id="danger-final-submit-btn"
                      disabled={!password}
                      onClick={handleVerifyPasswordAndDelete}
                      className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-red-650 hover:bg-red-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none shadow-sm"
                    >
                      {text.deleteBtn}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Loading ── */}
              {step === "loading" && (
                <div className="flex flex-col items-center justify-center py-14 gap-3.5 animate-in fade-in duration-200">
                  <Loader2 className="h-9 w-9 text-red-500 animate-spin" />
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{text.processing}</span>
                </div>
              )}

              {/* ── Success ── */}
              {step === "success" && (
                <div className="flex flex-col items-center text-center justify-center py-10 gap-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{text.successTitle}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-xs">
                      {text.successDesc}
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
