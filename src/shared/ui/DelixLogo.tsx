'use client';

/**
 * Official طيار (Tayar) brand logo — inline SVG (no external image required).
 * Backward-compatible with all existing usages (className, textClassName, showText).
 *
 * Once you have the brand PNG, you can switch src to next/image.
 */

interface DelixLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

function parseHeight(cls: string = ''): number {
  const m = cls.match(/\bh-(\d+(?:\.\d+)?)\b/);
  return m ? Math.round(parseFloat(m[1]) * 4) : 36;
}

export function DelixLogo({ className = 'h-8', showText, textClassName }: DelixLogoProps) {
  const h = parseHeight(className);
  // Aspect ratio ≈ 520:300
  const w = Math.round((h / 300) * 520);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 520 300"
      width={w}
      height={h}
      fill="none"
      aria-label="طيار – Tayar"
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="tblue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="torange" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#C2410C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
        <linearGradient id="tblueorange" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>

      {/* ── Arabic text "طيار" ── */}
      {/* Letter ر (Ra) - far right */}
      <path
        d="M 58 220 C 55 205 52 188 52 172 C 52 156 56 144 66 140 C 76 136 86 142 88 156 C 90 170 84 188 78 205 Z"
        fill="url(#tblue)"
      />

      {/* Letter ا (Alef) */}
      <rect x="108" y="118" width="14" height="108" rx="5" fill="url(#tblue)" />

      {/* Letter ي (Ya) body */}
      <path
        d="M 150 195 C 155 185 165 175 182 168 C 199 161 220 160 238 165 C 252 168 258 178 252 190 C 246 202 228 208 208 208 C 188 208 168 202 155 192 Z"
        fill="url(#tblue)"
      />
      {/* Ya two dots */}
      <ellipse cx="180" cy="232" rx="9" ry="9" fill="url(#tblue)" />
      <ellipse cx="210" cy="232" rx="9" ry="9" fill="url(#tblue)" />

      {/* Letter ط (Ta) - complex cup shape */}
      <path
        d="M 252 195 C 256 160 274 125 308 108 C 332 96 360 100 370 118 C 380 136 368 162 344 178 C 322 192 292 196 265 194 Z"
        fill="url(#tblue)"
      />
      {/* Inner cutout of ط */}
      <path
        d="M 270 186 C 275 162 290 140 312 130 C 326 124 340 130 342 144 C 344 158 332 172 316 178 C 300 184 280 183 272 178 Z"
        fill="white"
      />
      {/* Upward tick of ط */}
      <path
        d="M 362 120 L 374 88 C 376 82 382 82 384 88 L 390 108"
        stroke="url(#tblue)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Wing / flame feathers (orange) ── */}
      {/* Bottom feather */}
      <path
        d="M 358 205 C 390 196 430 178 472 152 L 455 160 C 420 178 388 196 362 204 Z"
        fill="url(#torange)"
        opacity="0.85"
      />
      {/* Middle feather */}
      <path
        d="M 352 185 C 387 170 432 148 480 116 L 462 126 C 428 148 392 170 358 184 Z"
        fill="url(#torange)"
        opacity="0.92"
      />
      {/* Main upper feather */}
      <path
        d="M 345 164 C 384 142 432 114 488 78 L 470 91 C 430 116 390 144 352 163 Z"
        fill="url(#torange)"
      />

      {/* ── Arrow head pointing upper-right ── */}
      <polygon points="504,52 516,92 484,72" fill="url(#torange)" />
      {/* Arrow shaft */}
      <line x1="488" y1="78" x2="510" y2="60" stroke="url(#torange)" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}
