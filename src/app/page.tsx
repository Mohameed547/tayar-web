"use client";
import { useState } from "react";
import Link from "next/link";
import differenceSection from "@/app/assets/differenceSection.avif";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";
import {
  BarChart2,
  Bell,
  ChevronRight,
  Headphones,
  Lock,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
  Star,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const stats = [
    { value: "15K+", label: "Orders Delivered" },
    { value: "120+", label: "Delivery Offices" },
    { value: "350+", label: "Active Captains" },
    { value: "99.8%", label: "Success Rate" },
  ];
  const features = [
    {
      icon: <MapPin className="w-6 h-6 text-blue-400" />,
      title: "Live Tracking",
      description: "Track deliveries in real time.",
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-blue-400" />,
      title: "Internal Chat",
      description: "Connect offices and captains instantly.",
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      title: "Smart Assignment",
      description: "Assign available captains automatically.",
    },
    {
      icon: <BarChart2 className="w-6 h-6 text-blue-400" />,
      title: "Analytics",
      description: "Monitor revenue and delivery performance.",
    },
    {
      icon: <Wallet className="w-6 h-6 text-blue-400" />,
      title: "Wallet System",
      description: "Secure payments and balance management.",
    },
    {
      icon: <Bell className="w-6 h-6 text-blue-400" />,
      title: "Notifications",
      description: "Instant updates for every order.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0B1120] text-white overflow-hidden">
      {/* HERO */}
      <section className="relative  pb-0 px-6 overflow-hidden min-h-screen flex items-center">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,179,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Blue glow blob top-right */}
        <div className="absolute top-10 right-0 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* LEFT TEXT */}
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border border-blue-500/30 text-blue-400 bg-blue-500/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Smart Delivery Platform
            </span>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              Delivery of the
              <br />
              <span className="text-blue-500">most necessary</span>
              <br />
              things for everyone
            </h1>

            <p className="mt-6 text-lg text-gray-400 max-w-lg leading-relaxed">
              There are no delivery boundaries for us. Connect customers,
              offices and delivery captains through one powerful platform with
              live tracking and smart management.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link href={ROUTES.REGISTER_CUSTOMER} className="flex items-center gap-2 px-7 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-medium">
                Make An Order
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  ▶
                </span>
              </Link>

              <a href="#how-it-works" className="px-7 py-4 rounded-xl border border-slate-700 hover:border-blue-500 hover:text-blue-400 transition">
                Explore Features
              </a>

              <Link href={ROUTES.REGISTER_DRIVER} className="px-7 py-4 rounded-xl border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition text-sm">
                Join as Captain / Office
              </Link>
            </div>
          </div>

          {/* RIGHT — ISOMETRIC ILLUSTRATION */}
          <div className="relative flex items-center justify-center">
            <svg
              viewBox="0 0 560 520"
              className="w-full max-w-lg"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="tileGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e3a5f" />
                  <stop offset="100%" stopColor="#0f2040" />
                </linearGradient>
                <linearGradient id="phoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a3a6e" />
                  <stop offset="100%" stopColor="#0d2550" />
                </linearGradient>
                <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0a1f40" />
                  <stop offset="100%" stopColor="#071530" />
                </linearGradient>
                <linearGradient id="mapGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0d2a55" />
                  <stop offset="100%" stopColor="#0a1f40" />
                </linearGradient>
                <linearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1e6fdb" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* === BACKGROUND FLOATING TILES === */}
              <g transform="translate(30, 120)">
                <polygon
                  points="0,-18 31,-1 0,17 -31,-1"
                  fill="#0f2040"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  opacity="0.7"
                />
                <polygon
                  points="0,17 -31,-1 -31,25 0,43"
                  fill="#0a1830"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  opacity="0.7"
                />
                <polygon
                  points="0,17 31,-1 31,25 0,43"
                  fill="#0c1e38"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  opacity="0.7"
                />
              </g>
              <g transform="translate(480, 80)">
                <polygon
                  points="0,-25 43,-4 0,24 -43,-4"
                  fill="#0f2040"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <polygon
                  points="0,24 -43,-4 -43,30 0,58"
                  fill="#0a1830"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <polygon
                  points="0,24 43,-4 43,30 0,58"
                  fill="#0c1e38"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </g>
              <g transform="translate(55, 420)">
                <polygon
                  points="0,-20 34,-2 0,20 -34,-2"
                  fill="#0f2040"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <polygon
                  points="0,20 -34,-2 -34,28 0,50"
                  fill="#0a1830"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <polygon
                  points="0,20 34,-2 34,28 0,50"
                  fill="#0c1e38"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  opacity="0.6"
                />
              </g>
              <g transform="translate(510, 390)">
                <polygon
                  points="0,-14 24,-1 0,13 -24,-1"
                  fill="#0f2040"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <polygon
                  points="0,13 -24,-1 -24,17 0,31"
                  fill="#0a1830"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <polygon
                  points="0,13 24,-1 24,17 0,31"
                  fill="#0c1e38"
                  stroke="#1e3a5f"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </g>

              {/* === MAIN PHONE (isometric) === */}
              <g transform="translate(280, 260)">
                <polygon
                  points="0,-130 150,-55 0,25 -150,-55"
                  fill="url(#phoneGrad)"
                  stroke="#2a5298"
                  strokeWidth="1.5"
                />
                <polygon
                  points="-150,-55 -150,15 0,95 0,25"
                  fill="#0a1830"
                  stroke="#1a3560"
                  strokeWidth="1.5"
                />
                <polygon
                  points="150,-55 150,15 0,95 0,25"
                  fill="#0c1e38"
                  stroke="#1a3560"
                  strokeWidth="1.5"
                />
                <polygon
                  points="0,-115 135,-48 0,12 -135,-48"
                  fill="url(#screenGrad)"
                  stroke="#1e3a6e"
                  strokeWidth="1"
                />
                <g opacity="0.4">
                  {[-80, -40, 0, 40, 80].map((x, i) => (
                    <line
                      key={i}
                      x1={x}
                      y1={-115 + (x + 80) * 0.35}
                      x2={x}
                      y2={12 - (x + 80) * 0.35}
                      stroke="#2563eb"
                      strokeWidth="0.5"
                    />
                  ))}
                  {[-100, -60, -20, 20, 60, 100].map((y, i) => (
                    <line
                      key={i}
                      x1={-135 + Math.abs(y) * 0.1}
                      y1={y * 0.45 - 48}
                      x2={135 - Math.abs(y) * 0.1}
                      y2={y * 0.45 - 48}
                      stroke="#2563eb"
                      strokeWidth="0.5"
                    />
                  ))}
                </g>
                <polyline
                  points="-60,-70 -20,-55 30,-45 70,-30"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="2.5"
                  opacity="0.8"
                />
                <g transform="translate(70,-30)" filter="url(#glow)">
                  <circle cx="0" cy="0" r="8" fill="#3b82f6" />
                  <circle cx="0" cy="0" r="4" fill="white" />
                  <circle cx="0" cy="0" r="12" fill="#3b82f6" opacity="0.3" />
                </g>
                <g transform="translate(-60,-70)">
                  <circle cx="0" cy="0" r="6" fill="#10b981" />
                  <circle cx="0" cy="0" r="3" fill="white" />
                </g>
                <g transform="translate(0, -5)">
                  <rect
                    x="-55"
                    y="-14"
                    width="110"
                    height="28"
                    rx="14"
                    fill="url(#btnGrad)"
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="system-ui"
                  >
                    Order NOW
                  </text>
                </g>
              </g>

              {/* === GLOBE (bottom-left) === */}
              <g transform="translate(110, 370)">
                <circle
                  cx="0"
                  cy="0"
                  r="52"
                  fill="#0d2550"
                  stroke="#1e4080"
                  strokeWidth="1.5"
                />
                <ellipse
                  cx="0"
                  cy="0"
                  rx="52"
                  ry="20"
                  fill="none"
                  stroke="#1e5090"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <ellipse
                  cx="0"
                  cy="0"
                  rx="30"
                  ry="52"
                  fill="none"
                  stroke="#1e5090"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <line
                  x1="-52"
                  y1="0"
                  x2="52"
                  y2="0"
                  stroke="#1e5090"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <ellipse
                  cx="-10"
                  cy="-15"
                  rx="18"
                  ry="12"
                  fill="#1e6fdb"
                  opacity="0.5"
                />
                <ellipse
                  cx="15"
                  cy="10"
                  rx="12"
                  ry="16"
                  fill="#1e6fdb"
                  opacity="0.4"
                />
                <ellipse
                  cx="-20"
                  cy="15"
                  rx="10"
                  ry="8"
                  fill="#1e6fdb"
                  opacity="0.35"
                />
                <g transform="translate(-10,-15)" filter="url(#glow)">
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-20"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                  />
                  <circle cx="0" cy="-22" r="5" fill="#3b82f6" />
                </g>
                <g transform="translate(0, -75)">
                  <circle
                    cx="0"
                    cy="0"
                    r="10"
                    fill="#1a3a6e"
                    stroke="#2a5298"
                    strokeWidth="1"
                  />
                  <rect
                    x="-10"
                    y="10"
                    width="20"
                    height="22"
                    rx="4"
                    fill="#1a3a6e"
                    stroke="#2a5298"
                    strokeWidth="1"
                  />
                </g>
              </g>

              {/* === DELIVERY CAPTAIN (top-right) === */}
              <g transform="translate(430, 140)">
                <ellipse
                  cx="0"
                  cy="25"
                  rx="22"
                  ry="10"
                  fill="#0d2040"
                  opacity="0.5"
                />
                <rect
                  x="-30"
                  y="-5"
                  width="60"
                  height="22"
                  rx="8"
                  fill="#0f2a55"
                  stroke="#1e4080"
                  strokeWidth="1"
                />
                <circle
                  cx="-20"
                  cy="20"
                  r="10"
                  fill="#0a1830"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="10"
                  fill="#0a1830"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <circle cx="-20" cy="20" r="4" fill="#2563eb" />
                <circle cx="20" cy="20" r="4" fill="#2563eb" />
                <g transform="translate(5, -30)">
                  <circle
                    cx="0"
                    cy="0"
                    r="12"
                    fill="#1a3a6e"
                    stroke="#2a5298"
                    strokeWidth="1"
                  />
                  <rect
                    x="-10"
                    y="12"
                    width="20"
                    height="18"
                    rx="3"
                    fill="#1a4080"
                    stroke="#2a5298"
                    strokeWidth="1"
                  />
                </g>
                <rect
                  x="-28"
                  y="-18"
                  width="18"
                  height="16"
                  rx="2"
                  fill="#1e4080"
                  stroke="#2a60b0"
                  strokeWidth="1"
                />
                <line
                  x1="-28"
                  y1="-10"
                  x2="-10"
                  y2="-10"
                  stroke="#2a60b0"
                  strokeWidth="0.8"
                />
              </g>

              {/* === OFFICE PERSON (bottom-right) === */}
              <g transform="translate(460, 350)">
                <rect
                  x="-35"
                  y="-50"
                  width="70"
                  height="44"
                  rx="4"
                  fill="#0d2040"
                  stroke="#1e4080"
                  strokeWidth="1"
                />
                <rect
                  x="-28"
                  y="-44"
                  width="56"
                  height="32"
                  rx="2"
                  fill="#071530"
                />
                <rect
                  x="-22"
                  y="-40"
                  width="35"
                  height="4"
                  rx="2"
                  fill="#2563eb"
                  opacity="0.7"
                />
                <rect
                  x="-22"
                  y="-32"
                  width="25"
                  height="3"
                  rx="1.5"
                  fill="#1e4080"
                  opacity="0.7"
                />
                <rect
                  x="-22"
                  y="-26"
                  width="30"
                  height="3"
                  rx="1.5"
                  fill="#1e4080"
                  opacity="0.7"
                />
                <rect
                  x="-22"
                  y="-20"
                  width="20"
                  height="3"
                  rx="1.5"
                  fill="#10b981"
                  opacity="0.6"
                />
                <rect x="-4" y="-6" width="8" height="10" fill="#0a1830" />
                <rect
                  x="-15"
                  y="4"
                  width="30"
                  height="4"
                  rx="2"
                  fill="#0a1830"
                  stroke="#1e4080"
                  strokeWidth="0.5"
                />
                <g transform="translate(0, 28)">
                  <circle
                    cx="0"
                    cy="-10"
                    r="10"
                    fill="#1a3a6e"
                    stroke="#2a5298"
                    strokeWidth="1"
                  />
                  <rect
                    x="-12"
                    y="0"
                    width="24"
                    height="18"
                    rx="3"
                    fill="#1a4080"
                    stroke="#2a5298"
                    strokeWidth="1"
                  />
                </g>
              </g>

              {/* === RATING STARS === */}
              <g transform="translate(490, 50)">
                <rect
                  x="-40"
                  y="-18"
                  width="80"
                  height="36"
                  rx="8"
                  fill="#0d2040"
                  stroke="#1e4080"
                  strokeWidth="1"
                />
                {["#fbbf24", "#fbbf24", "#fbbf24", "#fbbf24", "#fbbf24"].map(
                  (c, i) => (
                    <text key={i} x={-28 + i * 14} y="7" fontSize="13" fill={c}>
                      ★
                    </text>
                  ),
                )}
              </g>

              {/* === FLOATING NOTIFICATION === */}
              <g transform="translate(160, 110)">
                <rect
                  x="-60"
                  y="-20"
                  width="120"
                  height="40"
                  rx="10"
                  fill="#0d2040"
                  stroke="#2563eb"
                  strokeWidth="1"
                  opacity="0.9"
                />
                <circle cx="-45" cy="0" r="8" fill="#10b981" />
                <text
                  x="-45"
                  y="4"
                  textAnchor="middle"
                  fill="white"
                  fontSize="9"
                >
                  ✓
                </text>
                <text
                  x="-5"
                  y="-5"
                  textAnchor="middle"
                  fill="#93c5fd"
                  fontSize="8"
                  fontFamily="system-ui"
                >
                  Delivered!
                </text>
                <text
                  x="-5"
                  y="8"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="7"
                  fontFamily="system-ui"
                >
                  Order #2548
                </text>
              </g>

              {/* === PACKAGE BOX === */}
              <g transform="translate(290, 70)">
                <polygon
                  points="0,-22 38,-4 0,15 -38,-4"
                  fill="#0f2550"
                  stroke="#1e4080"
                  strokeWidth="1"
                />
                <polygon
                  points="-38,-4 -38,20 0,39 0,15"
                  fill="#0a1830"
                  stroke="#1a3560"
                  strokeWidth="1"
                />
                <polygon
                  points="38,-4 38,20 0,39 0,15"
                  fill="#0c1e38"
                  stroke="#1a3560"
                  strokeWidth="1"
                />
                <line
                  x1="-38"
                  y1="-4"
                  x2="38"
                  y2="-4"
                  stroke="#2563eb"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <line
                  x1="0"
                  y1="-22"
                  x2="0"
                  y2="15"
                  stroke="#2563eb"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item) => (
            <div
              key={item.label}
              className="text-center p-8 rounded-2xl bg-slate-900 border border-slate-800"
            >
              <h3 className="text-4xl font-bold text-blue-500">{item.value}</h3>
              <p className="mt-2 text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>
      </section>
      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-blue-500" />
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-widest">
              How It Works
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold max-w-xl leading-tight">
            3 steps to deliver anything, anywhere
          </h2>
          <p className="text-gray-400 mt-4 max-w-lg">
            Simple, fast, and transparent — from posting your shipment to
            delivery confirmation.
          </p>

          <div className="grid md:grid-cols-3 mt-10 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {[
              {
                num: "01",
                icon: <Package className="w-6 h-6 text-blue-400" />,
                title: "Post your shipment",
                desc: "Enter pickup location, drop-off address, and package details in under 2 minutes. No calls, no back-and-forth.",
              },
              {
                num: "02",
                icon: <Zap className="w-6 h-6 text-blue-400" />,
                title: "Assign a captain",
                desc: "Receive offers from verified offices and captains. Compare prices, ratings, and estimated delivery time — then pick what suits you.",
              },
              {
                num: "03",
                icon: <MapPin className="w-6 h-6 text-blue-400" />,
                title: "Track live",
                desc: "Watch your shipment move in real time on the map. Get notified at every step until your package arrives safely.",
              },
            ].map((step, i) => (
              <div key={i} className="relative p-8 pt-6 overflow-hidden">
                <span className="absolute top-2 left-8 text-8xl font-black text-blue-900/50 select-none leading-none">
                  {step.num}
                </span>
                {i < 2 && (
                  <div className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-blue-400">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
                <div className="relative mt-20 w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE DIFFERENCE */}
      <section className="px-6 py-14">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 min-h-[420px] flex items-end">
            <Image
              src={differenceSection}
              alt="Captain handing package to customer"
              fill
              className="object-cover"
            />
            <div className="relative z-10 m-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/80 backdrop-blur border border-slate-700 w-fit">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-white">
                Verified & trusted providers
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-blue-500" />
              <span className="text-blue-500 text-sm font-semibold uppercase tracking-widest">
                The DeliveryHub Difference
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Delivery that works for everyone
            </h2>

            <p className="text-gray-400 leading-relaxed mb-10">
              We built DeliveryHub because delivery in Egypt was broken — fixed
              prices, no transparency, no tracking. Now, customers get
              competitive offers, captains get steady work, and offices grow
              without extra costs.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: <Zap className="w-6 h-6 text-blue-400" />,
                  title: "Real competition, better prices",
                  desc: "Multiple providers bid for your shipment — you always get the best deal.",
                },
                {
                  icon: <MapPin className="w-6 h-6 text-blue-400" />,
                  title: "Full visibility, zero surprises",
                  desc: "Live tracking and real-time updates from pickup to delivery.",
                },
                {
                  icon: <Users className="w-6 h-6 text-blue-400" />,
                  title: "A community you can trust",
                  desc: "Every provider is verified. Every review is real. No shortcuts.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-lg shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY TRUST US */}
      <section id="about" className="px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-blue-500" />
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-widest">
              Why Trust Us
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold max-w-lg leading-tight mb-8">
            Your shipment is safe with DeliveryHub
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
                title: "Verified providers",
                desc: "ID and license checked before joining",
              },
              {
                icon: <MapPin className="w-6 h-6 text-blue-400" />,
                title: "Live GPS",
                desc: "Track your shipment every step of the way",
              },
              {
                icon: <Lock className="w-6 h-6 text-blue-400" />,
                title: "Secure payments",
                desc: "Encrypted wallet, funds held until delivery",
              },
              {
                icon: <Star className="w-6 h-6 text-blue-400" />,
                title: "Honest reviews",
                desc: "Ratings from verified customers only",
              },
              {
                icon: <Headphones className="w-6 h-6 text-blue-400" />,
                title: "Support team",
                desc: "Here to help whenever you need us",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl mb-4">
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-4xl font-bold">Powerful Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold">{feature.title}</h3>
                <p className="text-gray-400 mt-3">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-14">
        <div className="max-w-5xl mx-auto text-center rounded-3xl border border-slate-800 bg-slate-900 p-12">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready To Transform
            <br />
            Your Delivery Business?
          </h2>
          <p className="mt-6 text-gray-400">
            Join DeliveryHub and manage deliveries smarter, faster and more
            efficiently.
          </p>
          <Link href={ROUTES.REGISTER_CUSTOMER} className="inline-block mt-8 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition">
            Get Started Today
          </Link>
        </div>
      </section>
    </main>
  );
}
