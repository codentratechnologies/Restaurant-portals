import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface AvailabilityToggleProps {
 isAvailable: boolean;
 onToggle: () => void;
 disabled?: boolean;
}

export default function AvailabilityToggle({ isAvailable, onToggle, disabled = false }: AvailabilityToggleProps) {
 return (
 <button
 type="button"
 role="switch"
 aria-checked={isAvailable}
 onClick={onToggle}
 disabled={disabled}
 className={cn(
"relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange-500 focus-visible:ring-offset-2 shadow-sm border",
 isAvailable ?"bg-green-500 border-green-600" :"bg-gray-200 border-gray-300",
 disabled &&"opacity-50 cursor-not-allowed"
 )}
 >
 <span className="sr-only">Toggle availability</span>
 <span
 aria-hidden="true"
 className={cn(
"pointer-events-none absolute left-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out",
 isAvailable ?"translate-x-6" :"translate-x-0"
 )}
 />
 {/* Decorative inner indicators (optional) */}
 <span className={cn(
"absolute right-2 w-1.5 h-1.5 rounded-full bg-green-200 transition-opacity duration-300",
 isAvailable ?"opacity-100" :"opacity-0"
 )} />
 <span className={cn(
"absolute left-2 w-1.5 h-1.5 rounded-full bg-gray-400 transition-opacity duration-300",
 isAvailable ?"opacity-0" :"opacity-100"
 )} />
 </button>
 );
}
