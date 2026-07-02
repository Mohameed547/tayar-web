'use client';

/**
 * Official طيار (Tayar) brand logo — inline SVG (no external image required).
 * Backward-compatible with all existing usages (className, textClassName, showText).
 *
 * Once you have the brand PNG, you can switch src to next/image.
 */

import { TayarLogo } from './TayarLogo';

interface DelixLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

function parseHeight(cls: string = ''): number {
  const m = cls.match(/\bh-(\d+(?:\.\d+)?)\b/);
  return m ? Math.round(parseFloat(m[1]) * 4) : 32;
}

export function DelixLogo({ className = 'h-8', showText, textClassName }: DelixLogoProps) {
  const h = parseHeight(className);

  return (
    <TayarLogo height={h} className={className} />
  );
}

