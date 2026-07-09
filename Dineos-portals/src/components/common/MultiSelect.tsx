import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
}

export default function MultiSelect({ options, value, onChange, placeholder = 'Select options...', error }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`min-h-[46px] w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-2 ${
          isOpen ? 'ring-2 ring-brand-orange-500/20 bg-white border-brand-orange-500' : ''
        } ${error ? 'border-red-500 focus:border-red-500' : 'border-border hover:border-brand-orange-300'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {value.length === 0 && <span className="text-gray-400">{placeholder}</span>}
          {value.map((val) => {
            const option = options.find((o) => o.value === val);
            if (!option) return null;
            return (
              <span
                key={val}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-navy/5 text-brand-navy text-xs font-bold border border-border/50"
              >
                {option.label}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-brand-orange-600 transition-colors"
                  onClick={(e) => handleRemove(e, val)}
                />
              </span>
            );
          })}
        </div>
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-xl shadow-premium overflow-hidden max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => handleToggle(option.value)}
                className={`px-4 py-2.5 text-sm font-medium cursor-pointer flex items-center justify-between transition-colors ${
                  isSelected ? 'bg-brand-orange-50 text-brand-orange-700' : 'text-text-primary hover:bg-gray-50'
                }`}
              >
                {option.label}
                {isSelected && <Check className="w-4 h-4 text-brand-orange-500" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
