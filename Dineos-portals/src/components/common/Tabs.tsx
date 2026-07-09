import { motion } from 'framer-motion';

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex items-center gap-6 border-b border-border overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative py-4 px-1 text-sm font-bold transition-colors whitespace-nowrap outline-none flex items-center gap-2 ${
            activeTab === tab.id ? 'text-brand-navy' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
          
          {tab.count !== undefined && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === tab.id ? 'bg-brand-orange-100 text-brand-orange-700' : 'bg-gray-100 text-text-secondary'
            }`}>
              {tab.count}
            </span>
          )}

          {activeTab === tab.id && (
            <motion.div
              layoutId="active-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange-500 rounded-t-full"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
