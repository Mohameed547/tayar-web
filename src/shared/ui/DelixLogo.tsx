import React from "react";

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
  return (
    <div className="flex items-center gap-2.5">
      {/* Icon Logo */}
      <svg
        viewBox="0 0 200 200"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Flying yellow/gold stripes on the left */}
        <rect x="15" y="65" width="55" height="14" rx="7" fill="#F3B63A" />
        <rect x="5" y="93" width="65" height="14" rx="7" fill="#F3B63A" />
        <rect x="25" y="121" width="45" height="14" rx="7" fill="#F3B63A" />
        
        {/* Main D Shape */}
        <path
          d="M75 35H125C171.944 35 210 73.0558 210 120C210 166.944 171.944 205 125 205H75V35Z"
          fill="url(#delix-gradient)"
        />
        
        {/* Inner cutout of the D */}
        <path
          d="M105 65H125C155.376 65 180 89.6243 180 120C180 150.376 155.376 175 125 175H105V65Z"
          fill="currentColor"
          className="text-[var(--dh-bg-card)]"
        />
        
        <defs>
          <linearGradient id="delix-gradient" x1="75" y1="35" x2="210" y2="205" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#3D30A2" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className={textClassName}>
          Delix
        </span>
      )}
    </div>
  );
}
