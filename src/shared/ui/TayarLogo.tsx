'use client';

import Image from 'next/image';

interface TayarLogoProps {
  /** Height in pixels — width scales proportionally (logo is ~520:300 ratio ≈ 1.73:1) */
  height?: number;
  className?: string;
}

/**
 * Official طيار (Tayar) brand logo.
 *
 * Place the image file at:
 *   /public/tayar-logo.png   (primary — high-res PNG from brand kit)
 *   /public/tayar-logo.svg   (optional SVG variant)
 *
 * Usage:
 *   <TayarLogo height={42} />           // navbar
 *   <TayarLogo height={36} />           // sidebar
 *   <TayarLogo height={48} />           // footer
 *   <TayarLogo height={56} />           // auth pages
 *   <TayarLogo height={64} />           // hero / landing
 */
export function TayarLogo({ height = 42, className = '' }: TayarLogoProps) {
  // Natural logo dimensions (px) — matches the brand asset aspect ratio
  const LOGO_W = 1024;
  const LOGO_H = 682;
  const width = Math.round((height / LOGO_H) * LOGO_W);

  return (
    <Image
      src="/tayar-logo.png"
      alt="طيار – Tayar"
      width={width}
      height={height}
      priority
      className={`object-contain select-none ${className}`}
      style={{ width, height }}
    />
  );
}

/** @deprecated Use TayarLogo instead */
export const DelixLogo = TayarLogo;
