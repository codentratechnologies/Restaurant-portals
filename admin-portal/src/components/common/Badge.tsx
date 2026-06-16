import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      success: "bg-brand-green/10 text-brand-green border border-brand-green/20",
      warning: "bg-brand-orange-500/10 text-brand-orange-600 border border-brand-orange-500/20",
      error: "bg-red-500/10 text-red-600 border border-red-500/20",
      info: "bg-brand-navy/10 text-brand-navy border border-brand-navy/20",
      default: "bg-gray-100 text-text-secondary border border-gray-200",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export default Badge;
