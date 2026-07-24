import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrders } from '../../hooks/useOrders';
import { useBranches } from '../../hooks/useBranches';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useDashboardStats } from './hooks/useDashboardStats';
import { exportDashboardReport } from '../../utils/exportUtils';
import DashboardCharts from './components/DashboardCharts';
import DashboardRecentOrders from './components/DashboardRecentOrders';
import {
  ShoppingBag, Store, TrendingUp, TrendingDown, Download, IndianRupee
} from 'lucide-react';
import Select from '../../components/common/Select';


// --- Types & Data ---



// --- Components ---

function StatCard({ title, value, icon: Icon, trendValue, trendLabel, delay }: any) {
  const isPositive = trendValue >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? 'text-[#059669]' : 'text-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white border border-[#E8ECF4] p-3.5 sm:p-5 lg:p-6 rounded-2xl flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden h-full"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-1.5 sm:gap-2">
        <p className="text-[10px] sm:text-xs xl:text-[13px] font-bold text-[#8896AB] leading-tight line-clamp-2 pr-1">{title}</p>
        <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-xl bg-[#FFF3E8] text-[#FF6B00] flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </div>
      </div>
      
      <div className="mb-3 sm:mb-4">
         <h3 className="text-[22px] sm:text-2xl xl:text-[26px] font-black text-[#1a1f36] leading-none truncate">{value}</h3>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 text-[10px] xl:text-xs font-bold mt-auto pt-3 sm:pt-4 border-t border-[#F4F6FA]">
        <div className="flex items-center gap-1">
          <TrendIcon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${trendColor}`} />
          <span className={trendColor}>{Math.abs(trendValue)}%</span>
        </div>
        <span className="text-[#8896AB] font-medium opacity-80 sm:opacity-100">{trendLabel}</span>
      </div>
    </motion.div>
  );
}



export default function Dashboard() {
  const { orders, loading: ordersLoading } = useOrders();
  const { branches, loading: branchesLoading } = useBranches();
  const { menuItems } = useMenuItems();
  
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | '90days' | 'custom'>('7days');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isExporting, setIsExporting] = useState(false);

  // --- Real Data Calculations ---
  const dynamicStats = useDashboardStats(
    orders,
    branches,
    menuItems,
    timeFilter,
    customStartDate,
    customEndDate
  );

  if (ordersLoading || branchesLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF6B00] border-t-transparent"></div>
      </div>
    );
  }

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      await exportDashboardReport(dynamicStats, getFilterLabel());
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFilterLabel = () => {
    switch (timeFilter) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case '90days': return 'Last 90 Days';
      default: return 'Last 7 Days';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full px-3 sm:px-6 lg:px-8 pb-10 pt-4">
      
      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mt-1 sm:mt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1a1f36] tracking-tight flex items-center gap-2">
            Welcome back, Admin 👋
          </h1>
          <p className="text-[13px] sm:text-sm font-medium text-[#8896AB] mt-1">
            Here's what's happening with your business today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          
          {timeFilter === 'custom' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white border border-[#E8ECF4] rounded-xl p-3 sm:px-3 sm:py-2.5 shadow-sm w-full sm:w-auto"
            >
              <div className="flex items-center justify-between bg-[#F8FAFC] sm:bg-transparent p-2 sm:p-0 rounded-lg border border-[#E8ECF4] sm:border-none">
                <span className="text-[11px] font-black text-[#8896AB] uppercase tracking-wider sm:hidden mr-2">From</span>
                <input 
                  type="date" 
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="text-sm font-bold text-[#1a1f36] bg-transparent outline-none cursor-pointer w-full sm:w-auto text-right sm:text-left"
                />
              </div>
              <span className="hidden sm:inline text-[#8896AB] font-bold px-1">to</span>
              <div className="flex items-center justify-between bg-[#F8FAFC] sm:bg-transparent p-2 sm:p-0 rounded-lg border border-[#E8ECF4] sm:border-none">
                <span className="text-[11px] font-black text-[#8896AB] uppercase tracking-wider sm:hidden mr-2">To</span>
                <input 
                  type="date" 
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="text-sm font-bold text-[#1a1f36] bg-transparent outline-none cursor-pointer w-full sm:w-auto text-right sm:text-left"
                />
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:w-[200px] shrink-0">
              <Select
                options={[
                  { value: 'today', label: 'Today' },
                  { value: '7days', label: 'Last 7 Days' },
                  { value: '30days', label: 'Last 30 Days' },
                  { value: '90days', label: 'Last 90 Days' },
                  { value: 'custom', label: 'Custom Range' },
                ]}
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="shadow-sm"
              />
            </div>
            
            {/* Export Button */}
            <button
              onClick={handleExportReport}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E66000] text-white px-3 sm:px-4 py-[9px] sm:py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 shrink-0 shadow-sm"
              title="Export Report"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="text-sm hidden sm:inline-block">Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Total Orders" value={dynamicStats.totalOrders} icon={ShoppingBag} trendValue={dynamicStats.trends.orders} trendLabel={dynamicStats.trendLabel} delay={0.1} />
        <StatCard title="Total Revenue" value={dynamicStats.totalRevenue} icon={IndianRupee} trendValue={dynamicStats.trends.revenue} trendLabel={dynamicStats.trendLabel} delay={0.2} />
        <StatCard title="Active Restaurants" value={dynamicStats.activeBranches} icon={Store} trendValue={dynamicStats.trends.branches} trendLabel={dynamicStats.trendLabel} delay={0.3} />
        <StatCard title="Avg Order Value" value={dynamicStats.avgOrderValue} icon={ShoppingBag} trendValue={dynamicStats.trends.avgOrderValue} trendLabel={dynamicStats.trendLabel} delay={0.4} />
      </div>

      <DashboardCharts revenueData={dynamicStats.revenueData} pieData={dynamicStats.pieData} />
      <DashboardRecentOrders recentOrders={dynamicStats.recentOrders} topItems={dynamicStats.topItems} />
    </div>
  );
}
