import { useState, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChartCard from './components/ChartCard';
import MetricCard from './components/MetricCard';
import Tooltip from '../../components/common/Tooltip';
import { useOrders } from '../../hooks/useOrders';
import { useBranches } from '../../hooks/useBranches';
import { useBranchStats, BranchStat } from '../../hooks/useBranchStats';
import { useMenuItems } from '../../hooks/useMenuItems';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, ShoppingBag, IndianRupee,
  Clock, Download, Store, Utensils, ArrowUpRight, ChevronRight,
  Flame, MapPin, CircleDot, Package, CheckCircle2, Activity,
  XCircle, RefreshCw, Sparkles, LayoutDashboard, Tag
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Branches', path: '/branches', icon: Store },
  { name: 'Employees', path: '/employees', icon: Users },
  { name: 'Menu', path: '/food', icon: Utensils },
  { name: 'Coupons & Promotions', path: '/coupons', icon: Tag },
  { name: 'Orders', path: '/orders', icon: ShoppingBag },
];

const quickActions = [
  {
    name: 'Menu Catalog',
    sub: 'Explore now',
    icon: Utensils,
    path: '/food',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Manage Branches',
    sub: 'Explore now',
    icon: Store,
    path: '/branches',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Manage Employee',
    sub: 'Explore now',
    icon: Users,
    path: '/employees',
    image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Order List',
    sub: 'Explore now',
    icon: ShoppingBag,
    path: '/orders',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=600&auto=format&fit=crop',
  },
];

function ActionCard({ action }: { action: typeof quickActions[0] }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={action.path}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative overflow-hidden rounded-[1.5rem] h-48 cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300"
      >
        {/* Background Image */}
        <img
          src={action.image}
          alt={action.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Bottom Dark Gradient for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 w-full p-5 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight leading-tight group-hover:-translate-y-1 transition-transform duration-300">
              {action.name}
            </h3>
            <p className="text-sm text-white/80 font-bold mt-1 group-hover:-translate-y-1 transition-transform duration-300 delay-75">
              {action.sub}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

const STATUS_MAP: Record<string, { color: string; bg: string; icon: any }> = {
  Delivered: { color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
  Preparing: { color: '#D97706', bg: '#FFFBEB', icon: Activity },
  Pending: { color: '#0EA5E9', bg: '#EFF9FF', icon: Clock },
  Cancelled: { color: '#EF4444', bg: '#FFF0F0', icon: XCircle },
};

const AVATAR_COLORS = ['#FF6B00', '#7C3AED', '#0EA5E9', '#059669', '#D97706'];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #E8ECF4', borderRadius: 16, padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#8896AB', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1f36' }}>
            {p.name === 'revenue' || p.name === 'prev' ? `₹${(p.value / 1000).toFixed(1)}k` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

function StatCard({ title, value, icon: Icon, trend, up, color, bg, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative bg-white rounded-3xl border border-gray-100 p-6 flex flex-col gap-6 cursor-default overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-brand-orange-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Top section: Icon and Trend Ribbon */}
      <div className="relative z-10 flex items-start justify-between">
        <div style={{ background: bg }} className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] border border-white">
          <Icon style={{ color }} className="w-7 h-7 drop-shadow-sm" />
        </div>

        {/* Reelty Style Ribbon Badge */}
        <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-l-full rounded-r-md uppercase tracking-wider text-white shadow-md -mr-6 mt-1 ${up ? 'bg-brand-orange-500' : 'bg-red-500'}`}>
          {up ? '★ TRENDING ' : 'ACTION REQ '}
          {trend}
        </div>
      </div>

      {/* Bottom section: Value Box (Reelty Price Box style) */}
      <div className="relative z-10">
        <div className="border border-brand-orange-100 bg-brand-orange-50/40 rounded-2xl p-4 w-full relative overflow-hidden group-hover:bg-brand-orange-50/80 transition-colors">
          <p className="text-[10px] font-black text-brand-orange-600 mb-0.5 uppercase tracking-[0.15em]">{title}</p>
          <h3 className="text-[28px] font-black text-brand-navy tracking-tight">{value}</h3>

          {/* Circular action button at the bottom right */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-brand-orange-200 flex items-center justify-center shadow-sm text-brand-orange-500 group-hover:scale-110 transition-transform">
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeRange, setActiveRange] = useState('This Week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const { orders, loading: ordersLoading } = useOrders();
  const { branches, loading: branchesLoading } = useBranches();
  const { menuItems } = useMenuItems();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleExportReport = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DineOS_Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const dynamicStats = useMemo(() => {
    let totalRevenue = 0;
    let rejectedCount = 0;
    const itemsMap: Record<string, { name: string; orders: number; revenue: number; image?: string }> = {};

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate = new Date(0);
    let endDate = now;
    let chartData: any[] = [];
    let diffDays = 1;

    if (activeRange === 'Today') {
      startDate = todayStart;
      diffDays = 1;
      chartData = Array.from({ length: 24 }, (_, i) => ({
        name: `${i.toString().padStart(2, '0')}:00`,
        revenue: 0,
        count: 0,
        match: (d: Date) => d.getHours() === i && d >= todayStart
      }));
    } else if (activeRange === 'This Week') {
      startDate = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
      diffDays = 7;
      chartData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: 0,
          count: 0,
          match: (date: Date) => date.getDate() === d.getDate() && date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear()
        };
      });
    } else if (activeRange === 'This Month') {
      startDate = new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000);
      diffDays = 30;
      chartData = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
          name: `${d.getDate()}/${d.getMonth() + 1}`,
          revenue: 0,
          count: 0,
          match: (date: Date) => date.getDate() === d.getDate() && date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear()
        };
      });
    } else if (activeRange === 'Custom') {
      if (customStartDate) startDate = new Date(customStartDate);
      if (customEndDate) {
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
      }
      diffDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      chartData = Array.from({ length: Math.min(diffDays + 1, 60) }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return {
          name: `${d.getDate()}/${d.getMonth() + 1}`,
          revenue: 0,
          count: 0,
          match: (date: Date) => date.getDate() === d.getDate() && date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear()
        };
      });
    }

    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(startDate.getTime() - diffDays * 24 * 60 * 60 * 1000);

    const filteredOrders = orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= startDate && d <= endDate;
    });

    const prevOrders = orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= prevStartDate && d <= prevEndDate;
    });

    let prevTotalRevenue = 0;
    let prevRejectedCount = 0;

    prevOrders.forEach(order => {
      const isRejectedOrCancelled = order.status === 'Rejected' || order.status === 'Cancelled';
      if (!isRejectedOrCancelled) {
        prevTotalRevenue += order.billing?.total || 0;
      }
      if (order.status === 'Rejected') prevRejectedCount++;
    });

    filteredOrders.forEach(order => {
      const isRejectedOrCancelled = order.status === 'Rejected' || order.status === 'Cancelled';

      if (!isRejectedOrCancelled) {
        totalRevenue += order.billing?.total || 0;
      }
      if (order.status === 'Rejected') rejectedCount++;

      const orderDate = new Date(order.created_at);
      const chartSlot = chartData.find(slot => slot.match(orderDate));
      if (chartSlot) {
        if (!isRejectedOrCancelled) {
          chartSlot.revenue += order.billing?.total || 0;
        }
        chartSlot.count += 1;
      }

      if (!isRejectedOrCancelled) {
        order.items?.forEach(item => {
          if (!itemsMap[item.name]) {
            const menuItem = menuItems.find(m => m.name === item.name);
            const imageUrl = menuItem?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop';
            itemsMap[item.name] = { name: item.name, orders: 0, revenue: 0, image: imageUrl };
          }
          itemsMap[item.name].orders += item.qty || 1;
          itemsMap[item.name].revenue += item.subtotal || 0;
        });
      }
    });

    const currentBranches = branches.filter(b => b.is_active && new Date(b.created_at || 0) <= endDate).length;
    const prevBranches = branches.filter(b => b.is_active && new Date(b.created_at || 0) <= prevEndDate).length;

    const topItemsData = Object.values(itemsMap)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 4)
      .map((item, index) => ({
        rank: index + 1,
        name: item.name,
        orders: item.orders,
        revenue: `₹${item.revenue.toLocaleString()}`,
        change: 'New',
        up: true,
        image: item.image
      }));

    const recentOrdersData = filteredOrders.slice(0, 4).map(order => {
      const custName = order.customer?.name || 'Unknown';
      const initials = custName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const timeDiff = Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000);
      let timeStr = `${timeDiff} min ago`;
      if (timeDiff > 60) timeStr = `${Math.floor(timeDiff / 60)} hr ago`;
      if (timeDiff > 1440) timeStr = `${Math.floor(timeDiff / 1440)} days ago`;

      return {
        id: `#${(order.id || '').toString().slice(-4)}`,
        customer: custName,
        amount: `₹${(order.billing?.total || 0).toLocaleString()}`,
        status: order.status,
        time: timeStr,
        branch: order.branch,
        avatar: initials
      };
    });

    const getTrend = (current: number, prev: number, inverse = false) => {
      if (prev === 0) {
        if (current === 0) return { text: '0%', up: true };
        return { text: '+100%', up: !inverse };
      }
      const diff = current - prev;
      const percent = (diff / prev) * 100;
      const isPositive = percent >= 0;
      return {
        text: `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`,
        up: inverse ? !isPositive : isPositive
      };
    };

    const revTrend = getTrend(totalRevenue, prevTotalRevenue);
    const ordTrend = getTrend(filteredOrders.length, prevOrders.length);
    const branchTrend = getTrend(currentBranches, prevBranches);
    const rejTrend = getTrend(rejectedCount, prevRejectedCount, true);

    return {
      totalRevenue: `₹${totalRevenue.toLocaleString()}`,
      totalOrders: filteredOrders.length.toLocaleString(),
      activeBranches: currentBranches.toString(),
      rejectedOrders: rejectedCount.toString(),
      topItems: topItemsData,
      recentOrders: recentOrdersData,
      revenueData: chartData.map(d => ({ name: d.name, revenue: d.revenue, prev: 0 })),
      ordersBar: chartData.map(d => ({ name: d.name, count: d.count })),
      trends: {
        revenue: revTrend,
        orders: ordTrend,
        branches: branchTrend,
        rejected: rejTrend
      }
    };
  }, [orders, branches, menuItems, activeRange, customStartDate, customEndDate]);

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (ordersLoading || branchesLoading) {
    return (
      <div className="-mt-8 space-y-12 animate-pulse" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Skeleton Hero Banner */}
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 h-56" />

        {/* Skeleton Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-[1.5rem] bg-gray-100 h-48" />
          ))}
        </div>

        {/* Skeleton Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl bg-white border border-border/50 h-32 p-6">
              <div className="h-3 bg-gray-100 rounded-full w-24 mb-4" />
              <div className="h-8 bg-gray-100 rounded-full w-32" />
            </div>
          ))}
        </div>

        {/* Skeleton Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-border/50 h-80 p-6">
            <div className="h-4 bg-gray-100 rounded-full w-40 mb-8" />
            <div className="h-48 bg-gray-50 rounded-xl" />
          </div>
          <div className="rounded-2xl bg-white border border-border/50 h-80 p-6">
            <div className="h-4 bg-gray-100 rounded-full w-40 mb-8" />
            <div className="h-48 bg-gray-50 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="-mt-8 space-y-12 relative" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Decorative background blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div style={{ background: 'radial-gradient(circle at 10% 20%, rgba(255,107,0,0.06) 0%, transparent 60%)' }} className="absolute inset-0" />
        <div style={{ background: 'radial-gradient(circle at 90% 80%, rgba(124,58,237,0.05) 0%, transparent 55%)' }} className="absolute inset-0" />
        <div style={{ background: 'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.04) 0%, transparent 50%)' }} className="absolute inset-0" />
      </div>

      {/* ── Hero Banner & Floating Command Bar ── */}
      <div className="relative w-full pt-2">
        {/* Banner Image & Gradient */}
        <div className="relative w-full h-[180px] sm:h-[220px] md:h-[280px] rounded-[2rem] overflow-hidden shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop"
            alt="Restaurant Dashboard"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f36]/95 via-[#1a1f36]/50 to-transparent" />
        </div>

        {/* Floating Command Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative -mt-10 mx-2 sm:mx-6 md:mx-12 z-20 mb-10 sm:mb-16"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-white/50 p-4 sm:p-5 flex flex-col gap-4 sm:gap-5">
            {/* Nav Links Bar (Top Row) */}
            <div className="flex items-center overflow-x-auto custom-scrollbar w-full pb-2 sm:pb-0">
              <div className="flex items-center divide-x divide-border/60 min-w-max">
                {navLinks.map((link, i) => {
                  const Icon = link.icon;
                  const isActive = link.name === 'Dashboard';
                  return (
                    <Link 
                      key={i} 
                      to={link.path}
                      className={`flex items-center gap-2 px-4 sm:px-6 py-1 group hover:text-brand-orange-500 transition-colors ${i === 0 ? 'pl-2' : ''}`}
                    >
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isActive ? 'text-brand-navy' : 'text-text-secondary group-hover:text-brand-orange-500'}`} />
                      <span className={`text-sm sm:text-base font-bold transition-colors ${isActive ? 'text-brand-navy' : 'text-text-secondary group-hover:text-brand-orange-500'}`}>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* Filters & Actions (Bottom Row) */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 w-full">
              {/* Range Selectors */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center bg-gray-100/80 p-1.5 rounded-[1.25rem] w-full sm:w-auto overflow-x-auto custom-scrollbar">
                  {['Today', 'This Week', 'This Month', 'Custom'].map(r => (
                    <button
                      key={r}
                      onClick={() => setActiveRange(r)}
                      className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 min-w-max ${activeRange === r ? 'bg-white text-brand-navy shadow-sm' : 'text-text-secondary hover:text-brand-navy hover:bg-white hover:shadow-md hover:-translate-y-0.5'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {activeRange === 'Custom' && (
                    <motion.div
                      initial={{ opacity: 0, width: 0, scale: 0.9 }}
                      animate={{ opacity: 1, width: 'auto', scale: 1 }}
                      exit={{ opacity: 0, width: 0, scale: 0.9 }}
                      className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0"
                    >
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={e => setCustomStartDate(e.target.value)}
                        className="px-3 sm:px-4 py-2 bg-gray-50 border border-border/60 rounded-xl text-xs sm:text-sm font-bold text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 shadow-sm w-full"
                      />
                      <span className="text-text-secondary font-bold text-xs sm:text-sm shrink-0">to</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={e => setCustomEndDate(e.target.value)}
                        className="px-3 sm:px-4 py-2 bg-gray-50 border border-border/60 rounded-xl text-xs sm:text-sm font-bold text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 shadow-sm w-full"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                <button
                  onClick={handleRefresh}
                  className="p-3 sm:p-3.5 bg-gray-50 border border-border rounded-xl text-text-secondary hover:text-brand-navy hover:bg-white hover:shadow-md hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleExportReport}
                  disabled={isExporting}
                  className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-brand-orange-500 text-white text-sm sm:text-base font-black rounded-xl hover:bg-brand-orange-600 hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-brand-orange-500/40 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:translate-y-0"
                >
                  {isExporting ? <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Download className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {isExporting ? 'Exporting...' : 'Export Report'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>



      {/* ── Quick Actions ── */}
      <div>
        <h3 className="text-lg font-bold text-[#1a1f36] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
            <ActionCard key={i} action={a} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#1a1f36] mb-4">KPIs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={dynamicStats.totalRevenue} icon={IndianRupee} trend={dynamicStats.trends.revenue.text} up={dynamicStats.trends.revenue.up} color="#FF6B00" bg="#FFF3E8" delay={0.2} />
          <StatCard title="Total Orders" value={dynamicStats.totalOrders} icon={ShoppingBag} trend={dynamicStats.trends.orders.text} up={dynamicStats.trends.orders.up} color="#7C3AED" bg="#F3EEFF" delay={0.25} />
          <StatCard title="Active Branches" value={dynamicStats.activeBranches} icon={Store} trend={dynamicStats.trends.branches.text} up={dynamicStats.trends.branches.up} color="#0EA5E9" bg="#E6F6FD" delay={0.3} />
          <StatCard title="Rejected Orders" value={dynamicStats.rejectedOrders} icon={XCircle} trend={dynamicStats.trends.rejected.text} up={dynamicStats.trends.rejected.up} color="#EF4444" bg="#FFF0F0" delay={0.35} />
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white rounded-2xl border border-[#E8ECF4] overflow-hidden h-full">
            <div className="p-6 flex items-center justify-between border-b border-[#F0F2F7]">
              <div>
                <h3 className="text-base font-black text-[#1a1f36]">Revenue Performance</h3>
                <p className="text-sm text-[#8896AB] font-medium mt-0.5">This week vs last week</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                  <span className="text-xs font-bold text-[#8896AB]">This Week</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E8ECF4] border border-dashed border-[#C8D0DC]" />
                  <span className="text-xs font-bold text-[#8896AB]">Last Week</span>
                </div>
              </div>
            </div>
            <div className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicStats.revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gPrev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CBD5E1" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#CBD5E1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F0F2F7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8896AB', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8896AB', fontSize: 12, fontWeight: 600 }} tickFormatter={v => `₹${v / 1000}k`} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="prev" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="5 5" fill="url(#gPrev)" dot={false} />
                  <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={3} fill="url(#gRevenue)" dot={false} activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff', fill: '#FF6B00' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Orders Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.48 }}
        >
          <div className="bg-white rounded-2xl border border-[#E8ECF4] overflow-hidden h-full">
            <div className="p-6 border-b border-[#F0F2F7]">
              <h3 className="text-base font-black text-[#1a1f36]">Orders Volume</h3>
              <p className="text-sm text-[#8896AB] font-medium mt-0.5">Daily count this week</p>
            </div>
            <div className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicStats.ordersBar} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barSize={20}>
                  <defs>
                    <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B00" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FF9A4D" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F0F2F7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8896AB', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8896AB', fontSize: 12, fontWeight: 600 }} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#F4F6FA', radius: 8 }} />
                  <Bar dataKey="count" fill="url(#gBar)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.52 }}
        >
          <div className="bg-white rounded-2xl border border-[#E8ECF4] overflow-hidden">
            <div className="p-6 border-b border-[#F0F2F7] flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#1a1f36]">Recent Orders</h3>
                <p className="text-sm text-[#8896AB] font-medium mt-0.5">Latest transactions across all branches</p>
              </div>
              <Link to="/orders" className="flex items-center gap-1 text-sm font-bold text-[#FF6B00] hover:text-white transition-all duration-300 bg-[#FFF3E8] hover:bg-[#FF6B00] hover:-translate-y-0.5 hover:shadow-md px-4 py-2 rounded-xl">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-6 bg-gray-50/30 border-t border-border/50">
              {dynamicStats.recentOrders.length === 0 ? (
                <div className="text-center text-sm text-[#8896AB] py-10">No recent orders</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dynamicStats.recentOrders.map((order, i) => {
                    const s = STATUS_MAP[order.status] || STATUS_MAP['Pending'];
                    const isLive = order.status === 'Preparing' || order.status === 'Pending';

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className="bg-white border border-border/60 rounded-[1.5rem] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-orange-200 transition-all duration-300 cursor-pointer group flex flex-col gap-4 relative overflow-hidden"
                      >
                        {/* Status Ribbon (Top Right) */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <div
                            style={{ background: s.bg, color: s.color, borderColor: `${s.color}30` }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-black shadow-sm border"
                          >
                            {isLive && (
                              <span className="relative flex h-2 w-2">
                                <span style={{ backgroundColor: s.color }} className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"></span>
                                <span style={{ backgroundColor: s.color }} className="relative inline-flex rounded-full h-2 w-2"></span>
                              </span>
                            )}
                            {!isLive && <CircleDot className="w-2.5 h-2.5" />}
                            {order.status}
                          </div>
                        </div>

                        {/* Top: Customer & Avatar */}
                        <div className="flex items-center gap-3 pr-24">
                          <div
                            style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] + '20', color: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                            className="w-12 h-12 rounded-[1rem] flex items-center justify-center text-sm font-black shrink-0 ring-1 ring-border/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]"
                          >
                            {order.avatar}
                          </div>
                          <div>
                            <h4 className="font-black text-brand-navy text-base truncate max-w-[150px]">{order.customer}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium mt-0.5">
                              <MapPin className="w-3.5 h-3.5" />{order.branch}
                            </div>
                          </div>
                        </div>

                        {/* Middle: Order Details */}
                        <div className="flex flex-wrap items-center justify-between border-t border-border/40 pt-4 mt-2 gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-border flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-text-secondary" />
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Order ID</div>
                              <div className="text-sm font-black text-brand-navy">#{order.id.replace('ORD-', '')}</div>
                            </div>
                          </div>

                          {/* Bottom: Price Range Style Box */}
                          <div className="border border-brand-orange-100 bg-brand-orange-50/40 rounded-xl px-5 py-2 flex items-center group-hover:bg-brand-orange-50/80 transition-colors">
                            <div>
                              <div className="text-[9px] font-black text-brand-orange-600 uppercase tracking-widest mb-0.5">Amount</div>
                              <div className="text-lg font-black text-brand-navy leading-none">{order.amount}</div>
                            </div>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Top Sellers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.58 }}
        >
          <div className="bg-white rounded-2xl border border-[#E8ECF4] overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-[#F0F2F7] flex items-center gap-2">
              <div
                style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A4D)', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' }}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              >
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1a1f36]">Top Sellers</h3>
                <p className="text-xs text-[#8896AB] font-medium">Best by volume this week</p>
              </div>
            </div>

            <div className="p-4 space-y-1 flex-1">
              {dynamicStats.topItems.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#8896AB]">No order data available yet</div>
              ) : dynamicStats.topItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.62 + i * 0.07 }}
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer border border-transparent hover:border-gray-100"
                >
                  <div className="relative shrink-0">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover ring-1 ring-[#E8ECF4] group-hover:ring-2 group-hover:ring-[#FF6B00]/30 transition-all" />
                    <div
                      style={{ background: i === 0 ? '#FF6B00' : i === 1 ? '#8896AB' : '#C8A96E' }}
                      className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow"
                    >
                      {item.rank}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1a1f36] truncate group-hover:text-[#FF6B00] transition-colors">{item.name}</p>
                    <p className="text-[11px] font-semibold text-[#8896AB]">{item.orders} orders</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-[#1a1f36]">{item.revenue}</p>
                    <span className={`text-[11px] font-bold ${item.up ? 'text-emerald-500' : 'text-red-500'}`}>{item.change}</span>
                  </div>
                </motion.div>
              ))}
            </div>


          </div>
        </motion.div>

      </div>
    </div>
  );
}
