"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Package, Plus, Star, Wallet, ShieldCheck, Upload, AlertCircle, CheckCircle, FileText, LogOut, Headphones } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { mockCustomer, mockShipments } from "@/constants/mock-data";
import ShipmentCard from "../components/shipment-card";
import StatCard from "@/shared/ui/StatCard";
import { getCustomerProfile } from "@/features/profile";
import { getShipments } from "@/features/shipments/api";
import type { Shipment } from "@/features/shipments/types";
import { getWallet } from "@/features/wallet/api";
import { getReviews } from "@/features/reviews/api";
import { getCurrentUser, logout } from "@/features/auth/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCustomerDashboard } from "@/store/customer-slice";
import { useNotificationsListener, useSocketEvent, useSocket } from "@/shared/socket";
import { submitVerification } from "@/features/verification/api";

function compressDocumentImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        const maxW = 1200;
        const maxH = 1200;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > maxW) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          }
        } else {
          if (h > maxH) {
            w = Math.round((w * maxH) / h);
            h = maxH;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        resolve(compressedBase64);
      };
      img.onerror = () => {
        reject(new Error("Failed to load image for compression"));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(file);
  });
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-3/4" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-1/2" />
        </div>
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-32 shrink-0" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-5 flex flex-col justify-between" >
            <div className="flex justify-between items-start">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20" />
              <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="space-y-2 mt-2">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-12" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Shipments List Skeleton */}
      <div className="flex flex-col gap-4.5 mt-2">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-36" />
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-xl p-5 flex flex-col justify-between" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboardView() {
  const t = useTranslations("customer.dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [formattedDate, setFormattedDate] = useState("");
  const [greetingText, setGreetingText] = useState("");
  const dispatch = useAppDispatch();
  const { customerName, shipments, walletBalance, averageRating, status, verification } = useAppSelector(
    (state) => state.customer
  );
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Verification upload states
  const [docType, setDocType] = useState<string>("national_id");
  const [docNumber, setDocNumber] = useState<string>("");
  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { joinShipment, leaveShipment } = useSocket();

  useEffect(() => {
    if (!shipments || shipments.length === 0) return;
    
    shipments.forEach((s) => {
      if (s.id) {
        joinShipment(s.id);
      }
    });

    return () => {
      shipments.forEach((s) => {
        if (s.id) {
          leaveShipment(s.id);
        }
      });
    };
  }, [shipments, joinShipment, leaveShipment]);

  const activeShipments = shipments.filter(
    (shipment) =>
      shipment.status === "in_transit" ||
      shipment.status === "captain_assignment" ||
      shipment.status === "pending_offers"
  );

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (!user.isVerified) {
          router.replace(`/verify-otp?phone=${user.phone}&email=${user.email}`);
          return;
        }
        if ((user.role as string) === "customer" || user.role === "admin") {
          setAuthorized(true);
        } else if ((user.role as string) === "driver" || (user.role as string) === "office") {
          router.replace("/captain-dashboard");
        } else {
          router.replace("/login");
        }
        setCheckingAuth(false);
      })
      .catch((err) => {
        console.error("Unauthorized access to customer dashboard:", err);
        router.replace("/login");
        setCheckingAuth(false);
      });
  }, [router]);

  useEffect(() => {
    const today = new Date();
    setFormattedDate(
      today.toLocaleDateString(
        locale === "ar" ? "ar-EG" : "en-US",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    );
  }, [locale]);

  useEffect(() => {
    if (!customerName) return;
    const hour = new Date().getHours();
    let text = "";
    const nameToUse = customerName.split(" ")[0];
    if (hour >= 5 && hour < 12) {
      text = locale === "ar" ? `صباح الخير، ${nameToUse}` : `Good morning, ${nameToUse}`;
    } else if (hour >= 12 && hour < 18) {
      text = locale === "ar" ? `مساء الخير، ${nameToUse}` : `Good afternoon, ${nameToUse}`;
    } else {
      text = locale === "ar" ? `مساء الخير، ${nameToUse}` : `Good evening, ${nameToUse}`;
    }
    setGreetingText(text);
  }, [locale, customerName]);

  useEffect(() => {
    if (authorized) {
      dispatch(fetchCustomerDashboard());
    }
  }, [authorized, dispatch]);

  useNotificationsListener(() => {
    dispatch(fetchCustomerDashboard());
  });

  useSocketEvent("walletUpdate", () => {
    dispatch(fetchCustomerDashboard());
  });

  useSocketEvent("statusUpdate", () => {
    dispatch(fetchCustomerDashboard());
  });

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--dh-bg-app)] text-[var(--dh-text-sub)] text-sm font-semibold animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-t-[var(--dh-brand)] border-[var(--dh-border)] animate-spin" />
          <span>{locale === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}</span>
        </div>
      </div>
    );
  }

  const isFirstLoad = (status === "loading" || status === "idle") && shipments.length === 0;

  if (!authorized || isFirstLoad) {
    return <DashboardSkeleton />;
  }

  const isVerified = true;
  const verStatus = verification ? verification.status : "pending";
  const hasSubmitted = verification ? verification.hasSubmitted : false;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileSelected(file);
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileSelected || !docNumber) {
      setErrorMsg(locale === "ar" ? "الرجاء إدخال رقم الوثيقة وإرفاق الصورة" : "Please provide document number and attach image");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const base64Data = await compressDocumentImage(fileSelected);
      await submitVerification({
        documentType: docType as any,
        documentNumber: docNumber,
        documentImageUrl: base64Data,
      });
      setSuccessMsg(locale === "ar" ? "تم تقديم مستندات التحقق بنجاح!" : "Verification documents submitted successfully!");
      dispatch(fetchCustomerDashboard());
    } catch (err: any) {
      console.error("Verification submit error:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    router.push("/login");
  };

  if (!isVerified) {
    const isRTL = locale === "ar";
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4 text-[var(--dh-text-main)]">
        <div className="w-full max-w-xl bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 flex flex-col gap-6 transition-all duration-300">
          
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-[var(--dh-border)] pb-5">
            <div className="p-3 bg-[var(--dh-brand-subtle)] text-[var(--dh-brand)] rounded-xl">
              <ShieldCheck className="h-6 w-6 stroke-[1.5]" />
            </div>
            <div className="text-start">
              <h1 className="text-xl font-bold tracking-tight">
                {isRTL ? "تأكيد الهوية والحساب" : "Account Identity Verification"}
              </h1>
              <p className="text-xs text-[var(--dh-text-muted)] mt-0.5">
                {isRTL ? "مطلوب لتفعيل حساب العميل الخاص بك" : "Required to activate your customer account"}
              </p>
            </div>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="flex items-start gap-3 p-4 bg-[var(--dh-danger)]/10 border border-[var(--dh-danger)]/20 text-[var(--dh-danger)] rounded-xl text-xs font-semibold text-start">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-3 p-4 bg-[var(--dh-success)]/10 border border-[var(--dh-success)]/20 text-[var(--dh-success)] rounded-xl text-xs font-semibold text-start">
              <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Conditional View based on status */}
          {verStatus === "suspended" || verStatus === "blocked" ? (
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <div className="h-16 w-16 rounded-full bg-[var(--dh-danger)]/10 flex items-center justify-center text-[var(--dh-danger)] border border-[var(--dh-danger)]/20">
                <AlertCircle className="h-8 w-8 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--dh-danger)]">
                  {isRTL ? "تم تعليق / حظر الحساب" : "Account Suspended / Blocked"}
                </h3>
                <p className="text-xs text-[var(--dh-text-muted)] max-w-sm mx-auto mt-2 leading-relaxed">
                  {isRTL 
                    ? "لقد تم إيقاف حسابك بسبب مخالفة شروط الخدمة. الرجاء التواصل مع خدمة العملاء للمزيد من التفاصيل."
                    : "Your account is currently suspended or blocked due to policy violations. Please contact customer support for further information."
                  }
                </p>
              </div>
            </div>
          ) : hasSubmitted && (verStatus === "pending" || verStatus === "under_review" || verStatus === "approved") ? (
            // Under Review Status (Documents submitted but not approved yet)
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <div className="h-16 w-16 rounded-full bg-[var(--dh-brand-subtle)] flex items-center justify-center text-[var(--dh-brand)] border border-[var(--dh-brand)]/20 animate-pulse">
                <Clock className="h-8 w-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[var(--dh-brand)]">
                  {isRTL ? "مستنداتك قيد المراجعة" : "Documents Under Review"}
                </h3>
                <p className="text-xs text-[var(--dh-text-muted)] max-w-sm mx-auto leading-relaxed">
                  {isRTL 
                    ? "لقد استلمنا مستنداتك وهي الآن قيد المراجعة من قِبل المشرفين. يستغرق التحقق عادةً أقل من 24 ساعة."
                    : "We have received your verification request. Our admin team is currently reviewing your profile. Verification usually takes up to 24 hours."
                  }
                </p>
              </div>
            </div>
          ) : (
            // Upload Form (For never submitted or rejected status)
            <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-5 text-start">
              {verStatus === "rejected" && (
                <div className="flex items-start gap-3 p-4 bg-[var(--dh-danger)]/5 border border-[var(--dh-danger)]/15 text-[var(--dh-text-sub)] rounded-xl text-xs leading-relaxed">
                  <AlertCircle className="h-4.5 w-4.5 text-[var(--dh-danger)] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[var(--dh-danger)]">
                      {isRTL ? "تم رفض الطلب السابق:" : "Previous Submission Rejected:"}
                    </span>{" "}
                    {verification?.complianceText || (isRTL ? "الرجاء إعادة إرفاق مستندات صحيحة." : "Please re-upload valid documents.")}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--dh-text-sub)]">
                  {isRTL ? "نوع الوثيقة الرسمية" : "Official Document Type"}
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-[var(--dh-bg-muted)] border border-[var(--dh-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--dh-text-main)] focus:outline-none focus:border-[var(--dh-brand)]"
                >
                  <option value="national_id">{isRTL ? "البطاقة الشخصية / الرقم القومي" : "National ID / Iqama"}</option>
                  <option value="driving_license">{isRTL ? "رخصة القيادة" : "Driving License"}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--dh-text-sub)]">
                  {isRTL ? "رقم الوثيقة" : "Document Number"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRTL ? "أدخل رقم الهوية أو الرخصة" : "Enter document or license number"}
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full bg-[var(--dh-bg-muted)] border border-[var(--dh-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--dh-text-main)] placeholder-[var(--dh-text-dim)] focus:outline-none focus:border-[var(--dh-brand)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--dh-text-sub)]">
                  {isRTL ? "صورة إثبات الهوية" : "Identity Document Photo"}
                </label>
                
                <div className="relative border-2 border-dashed border-[var(--dh-border)] hover:border-[var(--dh-brand)]/50 rounded-2xl p-6 transition-all duration-200 bg-[var(--dh-bg-muted)]/50 flex flex-col items-center justify-center text-center cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {filePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative h-28 w-44 rounded-lg overflow-hidden border border-[var(--dh-border)] shadow-md">
                        <img src={filePreview} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-[11px] text-[var(--dh-brand)] font-bold">
                        {isRTL ? "تغيير الصورة" : "Change Image"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-[var(--dh-bg-muted)] text-[var(--dh-text-dim)] rounded-full group-hover:scale-105 transition-transform">
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-[var(--dh-text-sub)]">
                        {isRTL ? "انقر لتحميل أو إسقاط الصورة هنا" : "Click to upload or drag image here"}
                      </span>
                      <span className="text-[10px] text-[var(--dh-text-dim)]">
                        {isRTL ? "صيغ ملفات الصور المدعومة (PNG, JPG)" : "Supported image formats (PNG, JPG)"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[var(--dh-brand)] hover:bg-[var(--dh-brand-hover)] disabled:bg-[var(--dh-brand)]/50 text-white font-bold py-3 rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 focus:outline-none"
              >
                {submitting ? (
                  <div className="h-5 w-5 border-2 border-t-white border-white/20 rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    <span>{isRTL ? "تقديم طلب التحقق" : "Submit Verification Request"}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Action Buttons */}
          <div className="flex gap-3 border-t border-[var(--dh-border)] pt-5">
            <Link
              href="/support"
              className="flex-1 flex items-center justify-center gap-2 border border-[var(--dh-border)] hover:bg-[var(--dh-bg-muted)] text-[var(--dh-text-sub)] font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              <Headphones className="h-4 w-4" />
              <span>{isRTL ? "الدعم الفني" : "Contact Support"}</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-2 border border-[var(--dh-danger)]/20 hover:bg-[var(--dh-danger)]/5 text-[var(--dh-danger)] font-bold py-2.5 rounded-xl text-xs transition-colors animate-fade-in"
            >
              <LogOut className="h-4 w-4" />
              <span>{isRTL ? "تسجيل الخروج" : "Sign Out"}</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-[var(--dh-text-main)] max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--dh-text-main)]">
            {greetingText || (locale === "ar" ? `مرحباً بك، ${customerName}` : `Welcome back, ${customerName}`)}
          </h1>
          <p className="text-xs text-[var(--dh-text-muted)] font-semibold">{formattedDate}</p>
        </div>

        <Link
          href="/shipments/new"
          className="flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-xs font-bold bg-[var(--dh-brand)] hover:bg-[var(--dh-brand-hover)] text-white transition-all duration-200 shadow-md focus:outline-none hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>{t("newShipment")}</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("totalShipped")}
          value={shipments.length.toString()}
          icon={Package}
          description={t("totalShippedDescription")}
          colorClass="text-[var(--dh-text-main)]"
          iconColorClass="text-[var(--dh-text-sub)] bg-[var(--dh-bg-muted)] border-[var(--dh-border)]"
        />
        <StatCard
          title={t("activeNow")}
          value={activeShipments.length.toString()}
          icon={Clock}
          description={t("activeNowDescription")}
          colorClass="text-[var(--dh-brand)]"
          iconColorClass="text-[var(--dh-brand)] bg-[var(--dh-brand-subtle)] border-[var(--dh-brand)]/20"
        />
        <StatCard
          title={t("walletBalance")}
          value={walletBalance}
          icon={Wallet}
          description={t("walletDescription")}
          colorClass="text-[var(--dh-success)]"
          iconColorClass="text-[var(--dh-success)] bg-[var(--dh-success)]/10 border-[var(--dh-success)]/20"
          href="/wallet"
        />
        <StatCard
          title={t("averageRating")}
          value={`${averageRating} ★`}
          icon={Star}
          description={t("ratingDescription")}
          colorClass="text-[var(--dh-accent)]"
          iconColorClass="text-[var(--dh-accent)] bg-[var(--dh-accent)]/10 border-[var(--dh-accent)]/20"
          href="/reviews"
        />
      </div>

      <div className="flex flex-col gap-4.5 mt-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--dh-text-muted)]">
          {t("activeShipments")}
        </h2>

        {activeShipments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {activeShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-[var(--dh-bg-card)] border border-[var(--dh-border)] border-dashed rounded-xl text-center shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[var(--dh-brand-subtle)] text-[var(--dh-brand)] mb-4">
              <Package className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--dh-text-main)] mb-1">
              {locale === "ar" ? "لا توجد شحنات نشطة حالياً" : "No active shipments"}
            </h3>
            <p className="text-xs text-[var(--dh-text-muted)] max-w-sm mb-4">
              {t("noActive")}
            </p>
            <Link
              href="/shipments/new"
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg text-xs font-bold bg-[var(--dh-brand)] hover:bg-[var(--dh-brand-hover)] text-white transition-all duration-200 shadow-md focus:outline-none hover:-translate-y-0.5"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{t("requestShipment")}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
