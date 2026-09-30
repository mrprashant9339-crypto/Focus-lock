import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const sizeMap = {
    sm: { icon: 22, text: 'text-base' },
    md: { icon: 28, text: 'text-lg' },
    lg: { icon: 38, text: 'text-2xl' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Original FocusLock Vector Icon: Shield silhouette + Minimalist aperture iris */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-slate-900 border border-slate-700/60 shadow-inner overflow-hidden shrink-0"
        style={{ width: currentSize.icon + 10, height: currentSize.icon + 10 }}
      >
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6"
        >
          {/* Subtle geometric shield outer contour */}
          <path 
            d="M16 3L5 7.5V14.5C5 21.2 9.7 27.4 16 29C22.3 27.4 27 21.2 27 14.5V7.5L16 3Z" 
            stroke="#64748B" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="opacity-40"
          />
          {/* Concentric aperture iris representing mindful focus */}
          <circle 
            cx="16" 
            cy="15" 
            r="7" 
            stroke="#10B981" 
            strokeWidth="2" 
            strokeDasharray="3 3"
          />
          <circle 
            cx="16" 
            cy="15" 
            r="3" 
            fill="#10B981"
          />
          {/* Precision quadrant ticks */}
          <line x1="16" y1="5" x2="16" y2="7.5" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="22.5" x2="16" y2="25" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="6" y1="15" x2="8.5" y2="15" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="23.5" y1="15" x2="26" y2="15" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <span className={`font-bold tracking-tight text-slate-900 dark:text-white ${currentSize.text}`}>
          FocusLock
        </span>
      )}
    </div>
  );
};
