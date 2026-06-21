import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean | string;
  className?: string;
}

export default function Select({
  options,
  value,
  onChange,
  name = '',
  placeholder = 'Select an option',
  disabled = false,
  error,
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={selectRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-gray-50/80 border rounded-xl text-sm font-bold transition-all shadow-sm
          ${disabled ? 'opacity-70 cursor-not-allowed border-border' : 'hover:border-brand-orange-300 focus:outline-none focus:ring-4 focus:ring-brand-orange-500/20 focus:bg-white'}
          ${error ? 'border-red-500' : 'border-border/60'}
          ${isOpen && !disabled ? 'border-brand-orange-500 ring-4 ring-brand-orange-500/20 bg-white' : ''}
        `}
      >
        <span className={selectedOption ? 'text-text-primary' : 'text-text-secondary'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
              {options.length === 0 ? (
                <div className="px-4 py-2 text-sm text-text-secondary text-center">
                  No options available
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-4 py-3 text-sm font-bold rounded-lg transition-colors
                      ${value === option.value 
                        ? 'bg-brand-orange-50/80 text-brand-orange-600' 
                        : 'text-text-primary hover:bg-gray-50/80 hover:text-brand-navy'}
                    `}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
