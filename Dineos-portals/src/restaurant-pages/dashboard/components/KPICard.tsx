import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
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
  isLink?: boolean;
  linkText?: string;
}

export default function KPICard({ 
  title, amount, trend, isUp, icon: Icon, colorClass, bgClass, delay = 0, isManager = true, hiddenAmount = '***', isLink, linkText 
}: KPICardProps) {
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E8ECF4] flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 h-full hover:shadow-md transition-shadow">
        
        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${bgClass} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 sm:w-7 sm:h-7 ${colorClass}`} />
        </div>

        <div className="flex flex-col min-w-0 flex-1 w-full">
          <p className="text-[11px] sm:text-sm font-semibold text-[#8896AB] mb-0.5 sm:mb-1 truncate">{title}</p>
          <h3 className="text-xl sm:text-[28px] font-black text-[#1a1f36] leading-none tracking-tight mb-1 sm:mb-2 truncate">
            {isManager ? amount : hiddenAmount}
          </h3>
          
          {isLink ? (
            <button className="flex items-center gap-1 text-[11px] sm:text-sm font-bold text-[#FF6B00] hover:text-[#E66000] transition-colors mt-1">
              {linkText} <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          ) : trend ? (
            <div className={`flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-sm font-semibold ${isUp !== undefined ? (isUp ? 'text-emerald-600' : 'text-red-600') : 'text-blue-600'}`}>
              {isUp !== undefined && (
                isUp ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="truncate">{trend}</span>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
