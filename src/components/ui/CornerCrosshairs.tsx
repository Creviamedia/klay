import React from 'react';

export interface CornerCrosshairsProps {
  className?: string;
  color?: string;
  size?: number;
}

/**
 * Signature Swiss architectural crosshair detail anchored at container corners.
 * Renders precision "+" markers at top-left, top-right, bottom-left, and bottom-right.
 */
export const CornerCrosshairs: React.FC<CornerCrosshairsProps> = ({
  className = '',
  color = 'text-brand-green/70',
  size = 10,
}) => {
  const half = size / 2;

  const crosshairSvg = (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <path d="M4.5 0h1v10h-1z" />
      <path d="M0 4.5h10v1H0z" />
    </svg>
  );

  return (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute select-none z-10 ${color} ${className}`}
        style={{ width: size, height: size, top: -half, left: -half }}
      >
        {crosshairSvg}
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute select-none z-10 ${color} ${className}`}
        style={{ width: size, height: size, top: -half, right: -half }}
      >
        {crosshairSvg}
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute select-none z-10 ${color} ${className}`}
        style={{ width: size, height: size, bottom: -half, left: -half }}
      >
        {crosshairSvg}
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute select-none z-10 ${color} ${className}`}
        style={{ width: size, height: size, bottom: -half, right: -half }}
      >
        {crosshairSvg}
      </span>
    </>
  );
};
