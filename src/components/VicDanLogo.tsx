import React from 'react';

interface VicDanLogoProps {
  size?: number;
  className?: string;
}

export default function VicDanLogo({ size = 120, className = '' }: VicDanLogoProps) {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 240 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* VicDan text */}
      <text
        x="120"
        y="50"
        fontSize="36"
        fontWeight="700"
        fill="#3B82F6"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        letterSpacing="-0.5"
      >
        VicDan
      </text>
      
      {/* TECHNOLOGY text */}
      <text
        x="120"
        y="85"
        fontSize="18"
        fontWeight="500"
        fill="#14B8A6"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        letterSpacing="2"
      >
        TECHNOLOGY
      </text>
    </svg>
  );
}

