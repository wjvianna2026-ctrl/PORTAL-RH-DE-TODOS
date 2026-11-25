import React from 'react';

interface BrandMonogramProps {
  customLogoUrl?: string;
  companyName?: string;
  tagline?: string;
  variant?: 'light' | 'dark';
  compact?: boolean;
}

export const BrandMonogram: React.FC<BrandMonogramProps> = ({
  customLogoUrl,
  companyName = 'Cavalcante & Rolim',
  tagline = 'Signature Spaces',
  variant = 'dark',
  compact = false,
}) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#11382B]';
  const subColor = variant === 'light' ? 'text-[#D8BC83]' : 'text-[#C5A467]';

  return (
    <div className="inline-flex items-center gap-2 sm:gap-3 min-w-0 max-w-full select-none">
      {customLogoUrl ? (
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-[#C5A467]/60 bg-[#11382B] shrink-0 flex items-center justify-center">
          <img
            src={customLogoUrl}
            alt={`${companyName} Monograma`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <svg
          width="40"
          height="40"
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-9 h-9 sm:w-10 sm:h-10 shrink-0"
        >
          <rect
            x="1"
            y="1"
            width="42"
            height="42"
            rx="8"
            fill="#11382B"
            stroke="#C5A467"
            strokeWidth="1.5"
          />
          <rect
            x="4.5"
            y="4.5"
            width="35"
            height="35"
            rx="5"
            stroke="#D8BC83"
            strokeOpacity="0.4"
            strokeWidth="0.75"
          />
          <text
            x="22"
            y="26.5"
            textAnchor="middle"
            fill="#D8BC83"
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fontSize="16"
            fontWeight="700"
            letterSpacing="0.5"
          >
            C&amp;R
          </text>
        </svg>
      )}
      {!compact && (
        <div className="flex flex-col leading-none min-w-0">
          <span
            className={`font-serif text-base sm:text-xl font-semibold tracking-tight truncate ${textColor}`}
          >
            {companyName}
          </span>
          <span
            className={`text-[9px] sm:text-[10px] font-sans font-medium tracking-[0.15em] sm:tracking-[0.22em] uppercase mt-1 truncate ${subColor}`}
          >
            {tagline}
          </span>
        </div>
      )}
    </div>
  );
};
