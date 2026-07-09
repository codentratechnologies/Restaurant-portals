import React, { ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, className = '', position = 'top' }: TooltipProps) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className={`relative group/tooltip inline-flex items-center ${className}`}>
      {children}
      <div className={`absolute z-[100] whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none ${positionClasses[position]}`}>
        <div className="bg-white text-brand-navy text-[13px] font-bold px-3 py-2 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-border/50 relative">
          {content}
          {/* Arrow */}
          <div className={`absolute w-3 h-3 bg-white border-border/50 rotate-45 ${
            position === 'top' ? 'bottom-[-6.5px] left-1/2 -translate-x-1/2 border-b border-r' :
            position === 'bottom' ? 'top-[-6.5px] left-1/2 -translate-x-1/2 border-t border-l' :
            position === 'left' ? 'right-[-6.5px] top-1/2 -translate-y-1/2 border-t border-r' :
            'left-[-6.5px] top-1/2 -translate-y-1/2 border-b border-l'
          }`} />
        </div>
      </div>
    </div>
  );
}
