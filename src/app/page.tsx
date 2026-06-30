"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ROUTES } from "@/constants/routes";
import {
  Zap, MapPin, Users, BarChart2, CheckCircle, ArrowLeft,
  Package, Clock, TrendingUp, ChevronDown, Send, Phone, Mail,
  Star, Shield, HeadphonesIcon, Truck
} from "lucide-react";

const SLIDES = [
  {
    badge: "منصة التوصيل الذكي #1",
    title: "حلول التوصيل الذكية",
    highlight: "لأعمالك",
    sub: "نظام متكامل لإدارة الطلبات وتتبع الشحنات بسهولة وسرعة واحترافية",
    img: "/images/hero_scooter.png",
  },
  {
    badge: "توصيل سريع وموثوق",
    title: "أدر شحناتك",
    highlight: "بكل سهولة",
    sub: "تتبع لحظي، إدارة كاملة للكباتن، وتقارير تحليلية متقدمة في مكان واحد",
    img: "/images/delivery_handoff.png",
  },
];

const FEATURES = [
  { icon: <Zap className="w-6 h-6" />, title: "توصيل سريع", desc: "متوسط وقت التوصيل أقل من 30 دقيقة مع تحسين مستمر للمسارات" },
  { icon: <MapPin className="w-6 h-6" />, title: "تتبع مباشر", desc: "تتبع شحنتك لحظياً على الخريطة مع تحديثات فورية للعميل والكابتن" },
  { icon: <Users className="w-6 h-6" />, title: "إدارة الكباتن", desc: "لوحة تحكم متكاملة لإضافة وإدارة ومتابعة أداء جميع الكباتن" },
  { icon: <BarChart2 className="w-6 h-6" />, title: "تقارير وتحليلات", desc: "رؤى تحليلية عميقة لاتخاذ قرارات أعمال أكثر ذكاءً ودقة" },
];

const STEPS = [
  { num: "01", title: "إنشاء الطلب", desc: "أدخل تفاصيل الشحنة واختر موقع الاستلام والتسليم بسهولة" },
  { num: "02", title: "تعيين الكابتن", desc: "يقوم النظام تلقائياً بمطابقة أقرب كابتن متاح لطلبك" },
  { num: "03", title: "استلام الشحنة", desc: "تتبع شحنتك حتى وصولها بأمان إلى المستلم" },
];

const STATS = [
  { value: "50K+", label: "طلب مكتمل" },
  { value: "10K+", label: "كابتن نشط" },
  { value: "3K+", label: "عميل سعيد" },
  { value: "99.8%", label: "نسبة النجاح" },
];

const FAQS = [
  { q: "ما هي منصة طيار؟", a: "طيار منصة لوجستية متكاملة تربط العملاء بالكباتن ومكاتب التوصيل مع تتبع مباشر وإدارة كاملة." },
  { q: "كيف يتم تحديد أسعار التوصيل؟", a: "يحدد العميل نطاق ميزانية مفضل ويقدم الكباتن عروض أسعار تنافسية ضمنه لضمان أفضل قيمة." },
  { q: "هل المنصة آمنة؟", a: "نعم، تشفير كامل لجميع المعاملات والبيانات مع ضمان تسليم آمن وموثق." },
];

export default function Home() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [slide, setSlide] = useState(0);
  const [faq, setFaq] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const cur = SLIDES[slide];

  return (
    <main className="bg-[var(--dh-bg-app)] text-[var(--dh-text-main)] overflow-x-hidden">

      {/* HERO */}
      <section className="hero-section relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--dh-bg-app) 0%, var(--dh-bg-card) 60%, var(--dh-bg-muted) 100%)" }}>
        {/* BG dots pattern */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(#2563EB33 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-10 pt-28 pb-20">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">

            {/* Content — always right side in RTL via flex-row-reverse */}
            <div className="flex-1 flex flex-col gap-6 text-right" dir="rtl">
              <span className="inline-flex items-center gap-2 bg-[#EFF4FF] text-[#2563EB] text-xs font-bold px-4 py-2 rounded-full border border-[#2563EB]/20 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
                {cur.badge}
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight text-[#0D1B3E]">
                {cur.title}
                <br />
                <span className="text-[#2563EB]">{cur.highlight}</span>
              </h1>

              <p className="text-base md:text-lg text-[#475569] max-w-lg leading-relaxed">{cur.sub}</p>

              <div className="flex flex-wrap gap-4 mt-2">
                <Link href={ROUTES.REGISTER_CUSTOMER}
                  className="flex items-center gap-2 px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:scale-95">
                  ابدأ الآن
                </Link>
                <Link href="/tracking"
                  className="flex items-center gap-2 px-8 py-3.5 bg-white text-[#0D1B3E] font-bold rounded-2xl border-2 border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB] transition-all">
                  تتبع شحنتك
                </Link>
              </div>

              {/* Slide indicators */}
              <div className="flex gap-2 mt-2">
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => setSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-8 bg-[#2563EB]" : "w-4 bg-[#CBD5E1]"}`} />
                ))}
              </div>
            </div>

            {/* Illustration + floating cards */}
            <div className="flex-1 relative flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[500px]">
                <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#EFF4FF] to-[#F8FAFF] p-8 shadow-2xl border border-[#E2E8F0]">
                  <img src={cur.img} alt="طيار" className="w-full h-[320px] object-contain transition-all duration-700" />
                </div>

                {/* Floating: Live order card — top left */}
                <div className="absolute -top-5 left-4 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 flex items-center gap-3 min-w-[180px] z-10" dir="rtl">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#94A3B8] font-semibold">طلب جديد</p>
                    <p className="text-sm font-bold text-[#0D1B3E]">تم التسليم ✓</p>
                  </div>
                </div>

                {/* Floating: stats card — bottom right */}
                <div className="absolute -bottom-5 right-4 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 min-w-[160px] z-10" dir="rtl">
                  <p className="text-[10px] text-[#94A3B8] font-semibold mb-1">الكباتن النشطين</p>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-[#2563EB]">320</span>
                    <span className="text-xs text-emerald-500 font-bold mb-1">+8.2%</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {[40, 65, 50, 80, 70, 90].map((h, i) => (
                      <div key={i} className="w-2 rounded-sm bg-[#DBEAFE]" style={{ height: `${h * 0.3}px` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS RIBBON */}
      <section className="landing-brand-ribbon py-12" style={{ background: "linear-gradient(135deg, var(--dh-brand-hover) 0%, var(--dh-brand) 100%)" }}>
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {STATS.map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-black">{s.value}</div>
              <div className="text-blue-200 text-sm font-semibold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24" style={{ background: "var(--dh-bg-card)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="text-center mb-16">
            <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">المميزات</span>
            <h2 className="text-4xl font-black text-[#0D1B3E] mt-3 mb-4">لماذا تختار طيار؟</h2>
            <p className="text-[#64748B] max-w-2xl mx-auto">نقدم لك أدوات متكاملة تجعل إدارة عمليات التوصيل سهلة واحترافية</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card group p-8 rounded-3xl border-2 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default" style={{ borderColor: "var(--dh-border)", background: "var(--dh-bg-card)" }}>
                <div className="w-12 h-12 rounded-2xl bg-[#EFF4FF] group-hover:bg-[#2563EB] flex items-center justify-center text-[#2563EB] group-hover:text-white transition-all duration-300 mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-[#0D1B3E] mb-3">{f.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24" style={{ background: "var(--dh-bg-app)" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-10">
          <div className="text-center mb-16">
            <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">كيف يعمل</span>
            <h2 className="text-4xl font-black text-[#0D1B3E] mt-3 mb-4">ثلاث خطوات بسيطة</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="absolute top-10 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-[#2563EB] to-[#F97316] hidden md:block opacity-30" />
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                <div className="w-20 h-20 rounded-full bg-white border-2 border-[#E2E8F0] shadow-lg flex items-center justify-center mb-6 relative z-10">
                  <span className="text-2xl font-black text-[#2563EB]">{s.num}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0D1B3E] mb-3">{s.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="py-24 overflow-hidden" style={{ background: "var(--dh-bg-card)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="text-center mb-16">
            <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">لوحة التحكم</span>
            <h2 className="text-4xl font-black text-[#0D1B3E] mt-3 mb-4">كل شيء في مكان واحد</h2>
          </div>

          {/* Dashboard mockup */}
          <div className="rounded-3xl border-2 shadow-2xl overflow-hidden dashboard-mockup" style={{ background: "var(--dh-bg-app)", borderColor: "var(--dh-border)" }}>
            {/* Top bar */}
            <div className="dashboard-mockup-topbar border-b px-6 py-4 flex items-center gap-3" style={{ background: "var(--dh-bg-card)", borderColor: "var(--dh-border)" }}>
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4 rounded-lg px-4 py-1.5 text-xs dashboard-url-bar" style={{ background: "var(--dh-bg-muted)", color: "var(--dh-text-dim)" }}>app.tayar.com/dashboard</div>
            </div>

            <div className="flex min-h-[500px]">
              {/* Sidebar */}
              <div className="dashboard-mockup-sidebar w-56 border-l p-4 flex flex-col gap-1 shrink-0" style={{ background: "var(--dh-bg-card)", borderColor: "var(--dh-border)" }}>
                <div className="flex items-center gap-2 p-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center">
                    <span className="text-white text-xs font-black">ط</span>
                  </div>
                  <span className="font-black text-[#0D1B3E]">طيار</span>
                </div>
                {["الرئيسية", "الطلبات", "الكباتن", "العملاء", "التقارير", "المحفظة"].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${i === 0 ? "bg-[#EFF4FF] text-[#2563EB]" : "text-[#64748B] hover:bg-[#F8FAFE]"}`}>
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-[#2563EB]" : "bg-[#CBD5E1]"}`} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-6 space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "إجمالي الطلبات", val: "1,248", chg: "+12.5%", color: "text-[#2563EB]" },
                    { label: "كباتن نشطين", val: "320", chg: "+8.2%", color: "text-emerald-600" },
                    { label: "توصيل اليوم", val: "928", chg: "+15.7%", color: "text-[#F97316]" },
                    { label: "إجمالي الإيرادات", val: "24,560", chg: "+21.4%", color: "text-purple-600" },
                  ].map((s, i) => (
                    <div key={i} className="dashboard-stat-card rounded-2xl p-4 border" style={{ background: "var(--dh-bg-card)", borderColor: "var(--dh-border)" }}>
                      <p className="text-[10px] text-[#94A3B8] font-semibold mb-2">{s.label}</p>
                      <div className="flex items-end justify-between">
                        <span className={`text-xl font-black ${s.color}`}>{s.val}</span>
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">{s.chg}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart + Orders + Map */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Chart */}
                  <div className="col-span-5 dashboard-chart-card rounded-2xl p-4 border" style={{ background: "var(--dh-bg-card)", borderColor: "var(--dh-border)" }}>
                    <p className="text-xs font-bold text-[#64748B] mb-4">الطلبات خلال 7 أيام</p>
                    <svg viewBox="0 0 260 120" className="w-full h-28">
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {[0.3, 0.5, 0.4, 0.7, 0.6, 0.85, 1].map((v, i) => (
                        <line key={i} x1={i * 40 + 20} y1="0" x2={i * 40 + 20} y2="110" stroke="#F1F5F9" strokeWidth="1" />
                      ))}
                      <polyline points="20,90 60,75 100,82 140,55 180,65 220,38 260,20" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polygon points="20,90 60,75 100,82 140,55 180,65 220,38 260,20 260,110 20,110" fill="url(#g1)" />
                      <circle cx="260" cy="20" r="4" fill="#2563EB" />
                      <circle cx="220" cy="38" r="3" fill="#2563EB" opacity="0.5" />
                    </svg>
                  </div>

                  {/* Recent orders */}
                  <div className="col-span-4 dashboard-chart-card rounded-2xl p-4 border" style={{ background: "var(--dh-bg-card)", borderColor: "var(--dh-border)" }}>
                    <p className="text-xs font-bold text-[#64748B] mb-3">الطلبات الأخيرة</p>
                    <div className="space-y-2.5">
                      {[
                        { id: "#ORD12546", status: "تم التوصيل", color: "bg-emerald-50 text-emerald-600" },
                        { id: "#ORD12545", status: "جاري التوصيل", color: "bg-blue-50 text-blue-600" },
                        { id: "#ORD12544", status: "قيد الانتظار", color: "bg-orange-50 text-orange-600" },
                        { id: "#ORD12543", status: "ملغي", color: "bg-red-50 text-red-500" },
                      ].map((o, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#475569]">{o.id}</span>
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ${o.color}`}>{o.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Map */}
                  <div className="col-span-3 map-panel rounded-2xl border overflow-hidden relative" style={{ background: "var(--dh-bg-muted)", borderColor: "var(--dh-border-brand)" }}>
                    <p className="text-[10px] font-bold text-[#2563EB] p-3">التتبع المباشر</p>
                    <svg viewBox="0 0 150 120" className="w-full h-28 opacity-70">
                      <path d="M10,60 Q40,30 75,50 T140,30" fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 3" />
                      <path d="M10,90 Q60,70 110,80" fill="none" stroke="#F97316" strokeWidth="1.5" strokeDasharray="3 2" />
                      <circle cx="10" cy="60" r="5" fill="#10B981" />
                      <circle cx="140" cy="30" r="5" fill="#F97316" />
                      <circle cx="75" cy="50" r="3.5" fill="#2563EB" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-16 border-y" style={{ background: "var(--dh-bg-app)", borderColor: "var(--dh-border)" }}>
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-[#94A3B8] text-sm font-semibold mb-8">موثوق من قِبَل الشركات الرائدة</p>
          <div className="flex flex-wrap justify-center gap-10 items-center opacity-60">
            {["شركة النيل للتوصيل", "سريع إكسبرس", "ديليفري برو", "لوجستيكس EG"].map((name, i) => (
              <span key={i} className="text-[#64748B] font-black text-lg">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24" style={{ background: "var(--dh-bg-card)" }}>
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">الأسئلة الشائعة</span>
            <h2 className="text-4xl font-black text-[#0D1B3E] mt-3">كل ما تريد معرفته</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((item, i) => (
              <div key={i} className="faq-item border-2 rounded-2xl overflow-hidden transition-all" style={{ borderColor: "var(--dh-border)" }}>
                <button onClick={() => setFaq(faq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-right font-bold transition-colors"
                  style={{ color: "var(--dh-text-main)" }}>
                  <span>{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#2563EB] transition-transform ${faq === i ? "rotate-180" : ""}`} />
                </button>
                {faq === i && (
                  <div className="px-6 pb-6 text-sm leading-relaxed border-t pt-4" style={{ color: "var(--dh-text-sub)", borderColor: "var(--dh-border)" }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST METRICS BAR ── */}
      <section className="py-10 border-y-2" style={{ background: "var(--dh-bg-card)", borderColor: "var(--dh-border-subtle)" }}>
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6" dir="rtl">
          {[
            { icon: "🏆", val: "50,000+", label: "طلب مكتمل بنجاح" },
            { icon: "⚡", val: "< 30 دقيقة", label: "متوسط وقت التوصيل" },
            { icon: "⭐", val: "4.9 / 5", label: "تقييم المستخدمين" },
            { icon: "🌍", val: "25+ مدينة", label: "نطاق التغطية الجغرافية" },
          ].map((m, i) => (
            <div key={i} className="trust-metric-card flex items-center gap-4 p-5 rounded-2xl border-2 transition-all" style={{ borderColor: "var(--dh-border)" }}>
              <span className="text-3xl">{m.icon}</span>
              <div>
                <div className="text-xl font-black" style={{ color: "var(--dh-text-main)" }}>{m.val}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--dh-text-muted)" }}>{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DELIVERY WORKFLOW TIMELINE ── */}
      <section className="py-24" style={{ background: "var(--dh-bg-app)" }}>
        <div className="max-w-5xl mx-auto px-4 md:px-10" dir="rtl">
          <div className="text-center mb-16">
            <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">آلية العمل</span>
            <h2 className="text-4xl font-black text-[#0D1B3E] mt-3 mb-3">من الطلب إلى التسليم</h2>
            <p className="text-[#64748B] max-w-xl mx-auto">رحلة كاملة لكل شحنة من لحظة الإنشاء حتى وصولها بأمان</p>
          </div>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute right-[28px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2563EB] via-[#F97316] to-[#10B981] md:right-1/2" />
            <div className="space-y-10">
              {[
                { step: "01", title: "إنشاء الطلب", desc: "يقوم العميل بإدخال تفاصيل الشحنة وتحديد الموقع وميزانية التوصيل المفضلة.", side: "right", color: "#2563EB", bg: "#EFF4FF", icon: "📦" },
                { step: "02", title: "استقبال العروض", desc: "يتلقى العميل عروض أسعار من الكباتن والمكاتب ضمن نطاق الميزانية المحددة.", side: "left", color: "#F97316", bg: "#FFF7ED", icon: "💬" },
                { step: "03", title: "تعيين الكابتن", desc: "يختار العميل أفضل عرض ويتم تعيين الكابتن تلقائياً مع إشعار فوري.", side: "right", color: "#8B5CF6", bg: "#F5F3FF", icon: "🏍️" },
                { step: "04", title: "التتبع المباشر", desc: "تتبع حركة الكابتن لحظياً على الخريطة مع تحديثات تلقائية للحالة.", side: "left", color: "#06B6D4", bg: "#ECFEFF", icon: "📍" },
                { step: "05", title: "التسليم والتأكيد", desc: "يتم تسليم الشحنة ويُصدر تقرير التسليم مع صورة التأكيد وتقييم الخدمة.", side: "right", color: "#10B981", bg: "#ECFDF5", icon: "✅" },
              ].map((t, i) => (
                <div key={i} className={`flex items-start gap-6 md:gap-0 ${t.side === "left" ? "md:flex-row-reverse" : ""}`}>
                  <div className="md:w-1/2 md:px-10">
                    <div className="p-6 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all" style={{ borderColor: t.color + "30", backgroundColor: t.bg }}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{t.icon}</span>
                        <span className="text-xs font-black px-3 py-1 rounded-full text-white" style={{ backgroundColor: t.color }}>خطوة {t.step}</span>
                      </div>
                      <h3 className="text-lg font-black text-[#0D1B3E] mb-2">{t.title}</h3>
                      <p className="text-sm text-[#475569] leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                  <div className="shrink-0 w-14 h-14 rounded-full border-4 border-white shadow-lg flex items-center justify-center font-black text-white text-sm z-10 md:absolute md:right-1/2 md:translate-x-1/2" style={{ backgroundColor: t.color }}>
                    {t.step}
                  </div>
                  <div className="hidden md:block md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE TRACKING SHOWCASE ── */}
      <section className="py-24 overflow-hidden" style={{ background: "var(--dh-bg-card)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Visual */}
            <div className="relative" dir="ltr">
              <div className="rounded-3xl overflow-hidden border-2 border-[#E2E8F0] shadow-2xl bg-[#F8FAFE] p-6">
                {/* Map area */}
                <div className="relative rounded-2xl bg-[#EFF4FF] h-64 flex items-center justify-center overflow-hidden border border-[#DBEAFE]">
                  <svg viewBox="0 0 400 200" className="w-full h-full absolute inset-0 opacity-40">
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#CBD5E1" strokeWidth="1"/>
                    <line x1="0" y1="100" x2="400" y2="100" stroke="#CBD5E1" strokeWidth="1"/>
                    <line x1="0" y1="150" x2="400" y2="150" stroke="#CBD5E1" strokeWidth="1"/>
                    <line x1="80" y1="0" x2="80" y2="200" stroke="#CBD5E1" strokeWidth="1"/>
                    <line x1="200" y1="0" x2="200" y2="200" stroke="#CBD5E1" strokeWidth="1"/>
                    <line x1="320" y1="0" x2="320" y2="200" stroke="#CBD5E1" strokeWidth="1"/>
                  </svg>
                  <svg viewBox="0 0 400 200" className="w-full h-full absolute inset-0">
                    <path d="M 60,160 C 100,130 160,120 200,100 S 280,60 340,40" fill="none" stroke="#2563EB" strokeWidth="3" strokeDasharray="8 4" strokeLinecap="round"/>
                    <circle cx="60" cy="160" r="8" fill="#10B981"/>
                    <circle cx="340" cy="40" r="8" fill="#F97316"/>
                    <circle cx="200" cy="100" r="6" fill="#2563EB" className="animate-pulse"/>
                    <circle cx="200" cy="100" r="14" fill="#2563EB" fillOpacity="0.15"/>
                  </svg>
                  <div className="absolute top-3 right-3 bg-white rounded-xl px-3 py-2 shadow-md border border-[#E2E8F0] text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"/>
                    مباشر الآن
                  </div>
                </div>
                {/* Bottom cards */}
                <div className="grid grid-cols-3 gap-3 mt-4" dir="rtl">
                  {[
                    { label: "المسافة المتبقية", val: "2.4 كم", color: "#2563EB" },
                    { label: "وقت الوصول", val: "12 دقيقة", color: "#F97316" },
                    { label: "حالة الشحنة", val: "في الطريق", color: "#10B981" },
                  ].map((c, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 border border-[#F1F5F9] text-center">
                      <div className="font-black text-sm" style={{ color: c.color }}>{c.val}</div>
                      <div className="text-[10px] text-[#94A3B8] mt-0.5">{c.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Content */}
            <div className="flex flex-col gap-6" dir="rtl">
              <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">تتبع مباشر</span>
              <h2 className="text-4xl font-black text-[#0D1B3E] leading-tight">اعرف أين شحنتك في كل لحظة</h2>
              <p className="text-[#475569] text-lg leading-relaxed">نظام تتبع GPS لحظي يُمكّن العميل والمرسل من متابعة الشحنة بدقة على الخريطة، مع إشعارات فورية عند كل تغيير في الحالة.</p>
              <div className="space-y-4">
                {[
                  { title: "تحديث لحظي كل 10 ثوانٍ", desc: "موقع الكابتن يتحدث تلقائياً دون الحاجة لتحديث الصفحة" },
                  { title: "إشعارات فورية على الجوال", desc: "رسائل SMS وإشعارات تطبيق عند كل مرحلة من مراحل التوصيل" },
                  { title: "رابط مشاركة للمستلم", desc: "أرسل رابط التتبع للمستلم ليتابع الشحنة مباشرة" },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-[#F8FAFE] border border-[#F1F5F9]">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <div>
                      <div className="font-bold text-[#0D1B3E] text-sm">{f.title}</div>
                      <div className="text-[#64748B] text-xs mt-1">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLE-BASED FEATURES ── */}
      <section className="py-24" style={{ background: "var(--dh-bg-app)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-10" dir="rtl">
          <div className="text-center mb-16">
            <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">حلول لكل الأدوار</span>
            <h2 className="text-4xl font-black text-[#0D1B3E] mt-3 mb-3">منصة واحدة للجميع</h2>
            <p className="text-[#64748B]">طيار يخدم كل أطراف منظومة التوصيل باحترافية</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: "العميل", emoji: "👤", color: "#2563EB", bg: "#EFF4FF",
                features: ["إنشاء طلبات بسهولة", "تحديد نطاق الميزانية", "قبول / رفض العروض", "تتبع الشحنة مباشرة", "تقييم الخدمة"]
              },
              {
                role: "الكابتن", emoji: "🏍️", color: "#F97316", bg: "#FFF7ED",
                features: ["استقبال طلبات قريبة", "تقديم عروض تنافسية", "تحديث حالة الشحنة", "إدارة الأرباح والمحفظة", "سجل التوصيلات"]
              },
              {
                role: "المكتب", emoji: "🏢", color: "#8B5CF6", bg: "#F5F3FF",
                features: ["إدارة فريق الكباتن", "قبول الطلبات بالجملة", "خريطة تتبع الأسطول", "تقارير الأداء المالي", "إدارة العقود"]
              },
              {
                role: "المشرف", emoji: "⚙️", color: "#10B981", bg: "#ECFDF5",
                features: ["لوحة تحكم شاملة", "إدارة جميع المستخدمين", "مراقبة العمليات", "حل النزاعات", "التقارير الإدارية"]
              },
            ].map((r, i) => (
              <div key={i} className="rounded-3xl border-2 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white" style={{ borderColor: r.color + "20" }}>
                <div className="p-6 text-center" style={{ backgroundColor: r.bg }}>
                  <span className="text-4xl">{r.emoji}</span>
                  <h3 className="text-xl font-black mt-3" style={{ color: r.color }}>{r.role}</h3>
                </div>
                <div className="p-5 space-y-2.5">
                  {r.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm text-[#475569]">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: r.color + "15" }}>
                        <svg className="w-3 h-3" fill="none" stroke={r.color} viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24" style={{ background: "var(--dh-bg-card)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-10" dir="rtl">
          <div className="text-center mb-16">
            <span className="text-[#2563EB] text-sm font-bold uppercase tracking-widest">آراء العملاء</span>
            <h2 className="text-4xl font-black text-[#0D1B3E] mt-3 mb-3">ماذا يقول عملاؤنا</h2>
            <p className="text-[#64748B]">تجارب حقيقية من شركات وأفراد يثقون بطيار يومياً</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "أحمد محمد", role: "مدير متجر إلكتروني", text: "منذ انضممت لطيار وعمليات التوصيل لديّ تحولت بشكل كامل. الكباتن محترفون والدعم سريع جداً.", stars: 5, initials: "أم" },
              { name: "سارة الأحمد", role: "مديرة مكتب توصيل", text: "أدرت أسطولاً من 30 كابتن عبر طيار بكل سهولة. التقارير التفصيلية أعانتني على تحسين الأداء بشكل ملحوظ.", stars: 5, initials: "سا" },
              { name: "محمد الشامي", role: "كابتن توصيل", text: "طيار غيّر حياتي المهنية. أتحكم في جدولي وأختار الطلبات المناسبة وأربح أكثر من أي منصة أخرى.", stars: 5, initials: "مش" },
            ].map((t, i) => (
              <div key={i} className="testimonial-card p-7 rounded-3xl border-2 transition-all duration-300" style={{ background: "var(--dh-bg-card)", borderColor: "var(--dh-border)" }}>
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <span key={s} className="text-[#F97316] text-lg">★</span>
                  ))}
                </div>
                <p className="text-[#475569] text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#F1F5F9]">
                  <div className="w-10 h-10 rounded-full bg-[#EFF4FF] flex items-center justify-center font-black text-[#2563EB] text-sm shrink-0">{t.initials}</div>
                  <div>
                    <div className="font-bold text-[#0D1B3E] text-sm">{t.name}</div>
                    <div className="text-xs text-[#94A3B8]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-6">ابدأ إدارة شحناتك الآن</h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            انضم لآلاف الشركات والأفراد الذين يثقون بطيار لتوصيل طلباتهم بأمان وسرعة
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={ROUTES.REGISTER_CUSTOMER}
              className="px-10 py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-black rounded-2xl shadow-lg shadow-orange-500/30 transition-all hover:-translate-y-0.5 text-lg">
              ابدأ مجاناً الآن
            </Link>
            <Link href="#contact"
              className="px-10 py-4 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-bold rounded-2xl transition-all text-lg backdrop-blur-sm">
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
