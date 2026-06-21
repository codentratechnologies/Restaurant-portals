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
      primary: "bg-gradient-to-b from-brand-orange-500 to-brand-orange-600 text-white shadow-[0_2px_8px_rgba(255,107,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_6px_20px_rgba(255,107,0,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] hover:from-brand-orange-400 hover:to-brand-orange-500 border border-brand-orange-600/80 font-bold",
      secondary: "bg-white text-text-primary border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_-2px_0_rgba(0,0,0,0.01)] hover:bg-gray-50/80 hover:border-gray-300 font-bold",
      outline: "bg-transparent text-brand-orange-600 border border-brand-orange-500 hover:bg-brand-orange-50 font-bold",
      ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-gray-100 font-bold",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs font-medium rounded-xl",
      md: "px-6 py-2.5 text-sm font-medium rounded-xl",
      lg: "px-8 py-3.5 text-base font-semibold rounded-2xl",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
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
