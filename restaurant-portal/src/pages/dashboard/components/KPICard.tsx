import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import React from 'react';

interface KPICardProps {
  title: string;
  amount: string | number;
  trend?: string;
  isUp?: boolean;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  delay?: number;
  isManager?: boolean;
  hiddenAmount?: string;
}

export default function KPICard({ 
  title, amount, trend, isUp, icon: Icon, colorClass, bgClass, delay = 0, isManager = true, hiddenAmount = '***' 
}: KPICardProps) {
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="p-6 relative overflow-hidden group border border-border/60 shadow-soft bg-white/70 backdrop-blur-2xl rounded-2xl hover:shadow-2xl hover:-translate-y-1 hover:ring-1 hover:ring-brand-orange-500/30 transition-all duration-300 h-full flex flex-col justify-between">
        {/* Premium decorative gradient blob */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${bgClass} blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700`}></div>

        <div className="relative z-10 flex items-start justify-between mb-6">
          <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center shadow-inner ring-1 ring-white/50 backdrop-blur-sm`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider shadow-sm border ${isUp ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend}
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end">
          <p className="text-text-secondary text-xs font-bold mb-1 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-brand-navy tracking-tighter tabular-nums">
              {isManager ? amount : hiddenAmount}
            </h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
