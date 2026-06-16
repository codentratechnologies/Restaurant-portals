import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-gradient-to-r from-brand-orange-600 to-brand-orange-500 text-white shadow-soft hover:shadow-premium hover:from-brand-orange-500 hover:to-brand-orange-400 border border-transparent",
      secondary: "bg-white text-text-primary border border-border hover:bg-gray-50 hover:border-gray-300 shadow-sm",
      outline: "bg-transparent text-brand-orange-600 border border-brand-orange-500 hover:bg-brand-orange-50",
      ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-gray-100",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs font-medium rounded-xl",
      md: "px-6 py-2.5 text-sm font-medium rounded-xl",
      lg: "px-8 py-3.5 text-base font-semibold rounded-2xl",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-200 outline-none focus:ring-2 focus:ring-brand-orange-500/50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
