import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';

interface FilterToolbarProps {
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  validationError: string;
}

export default function FilterToolbar({
  startDate, setStartDate,
  endDate, setEndDate,
  validationError
}: FilterToolbarProps) {
  const [activeChip, setActiveChip] = useState('Last 30 Days');

  const setRange = (days: number, chipName: string) => {
    setActiveChip(chipName);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const chips = [
    { label: 'Today', days: 0 },
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 }
  ];

  // Helper to format date as DD-MM-YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center self-end bg-white rounded-full p-1.5 shadow-sm border border-border/60">
        
        {/* Quick Range Chips */}
        <div className="flex items-center gap-2 px-2">
          {chips.map(chip => (
            <button
              key={chip.label}
              onClick={() => setRange(chip.days, chip.label)}
              className={`px-3.5 py-1.5 rounded-xl text-sm transition-colors ${
                activeChip === chip.label 
                  ? 'text-brand-navy font-bold' 
                  : 'bg-slate-100 text-slate-500 font-semibold hover:bg-slate-200 hover:text-brand-navy'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-border mx-2"></div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-gray-200 hover:border-brand-orange-500/50 transition-colors bg-white">
          <div className="flex items-center gap-2 text-sm font-bold text-brand-navy">
            {formatDate(startDate)}
            <div className="relative overflow-hidden w-4 h-4">
              <input 
                type="date" 
                value={startDate} 
                onChange={e => { setStartDate(e.target.value); setActiveChip(''); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Calendar className="w-4 h-4 text-brand-navy pointer-events-none" />
            </div>
          </div>
          <span className="text-slate-400 font-bold">-</span>
          <div className="flex items-center gap-2 text-sm font-bold text-brand-navy">
            {formatDate(endDate)}
            <div className="relative overflow-hidden w-4 h-4">
              <input 
                type="date" 
                value={endDate} 
                onChange={e => { setEndDate(e.target.value); setActiveChip(''); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Calendar className="w-4 h-4 text-brand-navy pointer-events-none" />
            </div>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {validationError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="self-end text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200 flex items-center gap-2 shadow-sm"
          >
            <AlertCircle className="w-4 h-4" /> 
            {validationError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
