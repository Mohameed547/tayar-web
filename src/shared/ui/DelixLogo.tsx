import React from "react";
import { useLocale } from "next-intl";

interface DelixLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function DelixLogo({
  className = "h-8 w-8",
  showText = true,
  textClassName = "text-[20px] font-black tracking-tight text-[var(--dh-text-main)]",
}: DelixLogoProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon Logo - TAYAR Wings and Arrow */}
      <svg
        viewBox="0 0 200 200"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="tayar-blue" x1="0" y1="0" x2="200" y2="200">
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="tayar-orange" x1="0" y1="0" x2="200" y2="200">
            <stop stopColor="#F97316" />
            <stop offset="1" stopColor="#EA580C" />
          </linearGradient>
        </defs>
        {/* Futuristic Wings */}
        <path
          d="M30 150 C30 110, 60 70, 110 50 C130 42, 150 48, 160 60 C170 72, 165 92, 140 110 C115 128, 85 135, 30 150 Z"
          fill="url(#tayar-blue)"
        />
        <path
          d="M60 160 C70 120, 100 85, 140 70 C155 64, 170 70, 175 80 C180 90, 175 105, 155 120 C135 135, 110 142, 60 160 Z"
          fill="url(#tayar-orange)"
          opacity="0.95"
        />
        <path
          d="M90 170 C100 140, 125 115, 160 100 C170 96, 180 100, 182 108 C184 116, 180 125, 165 135 C150 145, 130 152, 90 170 Z"
          fill="#FDBA74"
          opacity="0.8"
        />
        {/* Active Arrowhead */}
        <path d="M150 45 L185 35 L175 70 Z" fill="#F97316" />
      </svg>
      {showText && (
        <span className={`${textClassName} font-display`}>
          {isAr ? "طيار" : "TAYAR"}
        </span>
      )}
    </div>
  );
}
