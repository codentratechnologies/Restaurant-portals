import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrders } from '../../hooks/useOrders';
import { useBranches } from '../../hooks/useBranches';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ref, get, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign,
  Clock, Download, Store, Utensils, ArrowUpRight, ChevronRight,
  Flame, MapPin, CircleDot, Package, CheckCircle2, Activity,
  XCircle, RefreshCw, Sparkles
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const quickActions = [
  {
    name: 'Menu Catalog',
    sub: 'Browse & manage items',
    icon: Utensils,
    path: '/food',
    color: '#FF6B00',
    bg: '#FFF3E8',
  },
  {
    name: 'Manage Branches',
    sub: 'All restaurant locations',
    icon: Store,
    path: '/branches',
    color: '#7C3AED',
    bg: '#F3EEFF',
  },
  {
    name: 'Employees',
    sub: 'Staff roster & roles',
    icon: Users,
    path: '/employees',
    color: '#0EA5E9',
    bg: '#E6F6FD',
  },
  {
    name: 'Order List',
    sub: 'Track live orders',
    icon: ShoppingBag,
    path: '/orders',
    color: '#059669',
    bg: '#ECFDF5',
  },
];

function ActionCard({ action, idx }: { action: typeof quickActions[0]; idx: number }) {
  return (
    <Link to={action.path} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: (idx || 0) * 0.05 }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-4 border border-white/40 hover:bg-white hover:-translate-y-1 hover:shadow-floating transition-all duration-300 flex items-center gap-4 cursor-pointer"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}
      >
        {/* Hover Glow */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `0 12px 30px ${action.color}20` }}
        />
        
        {/* Icon */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: action.bg, color: action.color }}
        >
          <action.icon className="w-6 h-6" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-[#1a1f36] leading-tight truncate group-hover:text-brand-orange-500 transition-colors">{action.name}</h3>
          <p className="text-[11px] font-semibold text-[#8896AB] mt-0.5 truncate">{action.sub}</p>
        </div>

        {/* Arrow */}
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
          <ArrowUpRight className="w-4 h-4 text-[#8896AB] group-hover:text-brand-orange-500 transition-colors" />
        </div>
      </motion.div>
    </Link>
  );
}

const STATUS_MAP: Record<string, { color: string; bg: string; icon: any }> = {
  Delivered: { color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
  Preparing: { color: '#D97706', bg: '#FFFBEB', icon: Activity },
  Pending:   { color: '#0EA5E9', bg: '#EFF9FF', icon: Clock },
  Cancelled: { color: '#EF4444', bg: '#FFF0F0', icon: XCircle },
};

const AVATAR_COLORS = ['#FF6B00', '#7C3AED', '#0EA5E9', '#059669', '#D97706'];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 20) return 'Good evening';
  return 'Good night';
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

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, trend, up, color, bg, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
      className="bg-white/90 backdrop-blur border border-border p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none group-hover:opacity-20 transition-opacity" style={{ background: color }} />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div style={{ background: bg, color }} className="w-11 h-11 rounded-xl flex items-center justify-center border border-white shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${up ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
          {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {trend}
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-[1.75rem] leading-none font-black text-brand-navy">{value}</h3>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeRange, setActiveRange] = useState('This Week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const { orders, loading: ordersLoading } = useOrders();
  const { branches, loading: branchesLoading } = useBranches();


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
    let filteredOrders = orders;
    const now = new Date();
    
    if (activeRange === 'Today') {
       filteredOrders = orders.filter(o => {
          if (!o.created_at) return false;
          return new Date(o.created_at).toDateString() === now.toDateString();
       });
    } else if (activeRange === 'This Week') {
       const weekAgo = new Date();
       weekAgo.setDate(weekAgo.getDate() - 7);
       filteredOrders = orders.filter(o => {
          if (!o.created_at) return false;
          return new Date(o.created_at) >= weekAgo;
       });
    } else if (activeRange === 'This Month') {
       const monthAgo = new Date();
       monthAgo.setMonth(monthAgo.getMonth() - 1);
       filteredOrders = orders.filter(o => {
          if (!o.created_at) return false;
          return new Date(o.created_at) >= monthAgo;
       });
    } else if (activeRange === 'Custom') {
       filteredOrders = orders.filter(o => {
          if (!o.created_at) return false;
          const d = new Date(o.created_at);
          if (startDate && d < new Date(startDate)) return false;
          if (endDate && d > new Date(endDate + 'T23:59:59')) return false;
          return true;
       });
    }

    let totalRevenue = 0;
    let pendingCount = 0;
    const itemsMap: Record<string, { name: string; orders: number; revenue: number; image?: string }> = {};

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toISOString().split('T')[0],
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: 0,
        count: 0
      };
    });

    filteredOrders.forEach(order => {
      totalRevenue += order.billing?.total || 0;
      if (order.status === 'Pending') pendingCount++;

      const dateStr = new Date(order.created_at).toISOString().split('T')[0];
      const dayIndex = last7Days.findIndex(d => d.date === dateStr);
      if (dayIndex !== -1) {
        last7Days[dayIndex].revenue += order.billing?.total || 0;
        last7Days[dayIndex].count += 1;
      }

      order.items?.forEach(item => {
        if (!itemsMap[item.name]) {
          itemsMap[item.name] = { name: item.name, orders: 0, revenue: 0, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop' };
        }
        itemsMap[item.name].orders += item.qty || 1;
        itemsMap[item.name].revenue += item.subtotal || 0;
      });
    });

    const activeBranches = branches.filter(b => b.is_active).length;

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

    const recentOrdersData = orders.slice(0, 5).map(order => {
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

    return {
      totalRevenue: `₹${totalRevenue.toLocaleString()}`,
      totalOrders: orders.length.toLocaleString(),
      activeBranches: activeBranches.toString(),
      pendingOrders: pendingCount.toString(),
      topItems: topItemsData,
      recentOrders: recentOrdersData,
      revenueData: last7Days.map(d => ({ name: d.name, revenue: d.revenue, prev: 0 })),
      ordersBar: last7Days.map(d => ({ name: d.name, count: d.count }))
    };
  }, [orders, branches, activeRange, startDate, endDate]);

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (ordersLoading || branchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="-mt-8 pb-16 space-y-6 relative" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Decorative background blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div style={{ background: 'radial-gradient(circle at 10% 20%, rgba(255,107,0,0.06) 0%, transparent 60%)' }} className="absolute inset-0" />
        <div style={{ background: 'radial-gradient(circle at 90% 80%, rgba(124,58,237,0.05) 0%, transparent 55%)' }} className="absolute inset-0" />
        <div style={{ background: 'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.04) 0%, transparent 50%)' }} className="absolute inset-0" />
      </div>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <motion.span
              animate={{ rotate: [0, 15, -10, 15, 0] }}
              transition={{ duration: 1.2, delay: 0.5 }}
              className="text-3xl"
            >
              🍽️
            </motion.span>
            <h1 className="text-2xl font-black text-[#1a1f36] tracking-tight">{greeting}, Admin</h1>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
            >
              <Sparkles className="w-5 h-5 text-[#FF6B00]" />
            </motion.div>
          </div>
          <p className="text-sm font-medium text-[#8896AB]">{today} — Here's what's happening at your restaurants.</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 mt-4 sm:mt-0">
          <div className="flex flex-wrap items-center bg-[#F4F6FA] border border-[#E8ECF4] rounded-2xl p-1 shadow-sm gap-1">
            <div className="flex items-center gap-1">
              {['Today', 'This Week', 'This Month'].map(r => (
                <button
                  key={r}
                  onClick={() => { setActiveRange(r); setStartDate(''); setEndDate(''); }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${activeRange === r ? 'bg-white text-[#1a1f36] shadow-sm' : 'text-[#8896AB] hover:text-[#1a1f36]'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-[#E8ECF4] mx-1 hidden sm:block"></div>

            <div className="flex items-center gap-1 px-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setActiveRange('Custom'); }}
                className={`px-2 py-1.5 bg-transparent rounded-lg text-xs font-bold focus:outline-none focus:bg-white focus:shadow-sm transition-all text-[#1a1f36] cursor-pointer ${activeRange === 'Custom' && startDate ? 'bg-white shadow-sm text-brand-orange-600' : ''}`}
                title="Start Date"
                style={{ width: '115px' }}
              />
              <span className="text-[#8896AB] font-bold text-xs">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setActiveRange('Custom'); }}
                className={`px-2 py-1.5 bg-transparent rounded-lg text-xs font-bold focus:outline-none focus:bg-white focus:shadow-sm transition-all text-[#1a1f36] cursor-pointer ${activeRange === 'Custom' && endDate ? 'bg-white shadow-sm text-brand-orange-600' : ''}`}
                title="End Date"
                style={{ width: '115px' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-white border border-[#E8ECF4] rounded-2xl text-[#8896AB] hover:text-[#1a1f36] hover:border-[#C8D0DC] transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExportReport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1f36] text-white text-sm font-bold rounded-2xl hover:bg-[#2d3550] transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <div className="mt-8">
        <h2 className="text-lg font-black text-[#1a1f36] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#FF6B00] rounded-full"></span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
            <ActionCard key={i} action={a} idx={i} />
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="mt-8">
        <h2 className="text-lg font-black text-[#1a1f36] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#7C3AED] rounded-full"></span>
          Key Performance Indicators
        </h2>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={dynamicStats.totalRevenue} icon={DollarSign} trend="+12.5%" up color="#FF6B00" bg="#FFF3E8" delay={0.2} />
          <StatCard title="Total Orders" value={dynamicStats.totalOrders} icon={ShoppingBag} trend="+8.3%" up color="#7C3AED" bg="#F3EEFF" delay={0.25} />
          <StatCard title="Active Branches" value={dynamicStats.activeBranches} icon={Store} trend="Stable" up color="#0EA5E9" bg="#E6F6FD" delay={0.3} />
          <StatCard title="Pending Orders" value={dynamicStats.pendingOrders} icon={Package} trend="Live" up={false} color="#EF4444" bg="#FFF0F0" delay={0.35} />
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="mt-8">
        <h2 className="text-lg font-black text-[#1a1f36] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#0EA5E9] rounded-full"></span>
          Analytics & Trends
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 overflow-hidden h-full hover:shadow-floating hover:-translate-y-1 transition-all duration-300">
            <div className="p-5 sm:p-6 flex items-center justify-between border-b border-[#F0F2F7]">
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
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 overflow-hidden h-full hover:shadow-floating hover:-translate-y-1 transition-all duration-300">
            <div className="p-5 sm:p-6 border-b border-[#F0F2F7]">
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
      </div>

      {/* ── Bottom Row ── */}
      <div className="mt-8">
        <h2 className="text-lg font-black text-[#1a1f36] mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#059669] rounded-full"></span>
          Recent Activity & Top Items
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.52 }}
        >
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 overflow-hidden hover:shadow-floating hover:-translate-y-1 transition-all duration-300">
            <div className="p-5 sm:p-6 border-b border-[#F0F2F7] flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#1a1f36]">Recent Orders</h3>
                <p className="text-sm text-[#8896AB] font-medium mt-0.5">Latest transactions across all branches</p>
              </div>
              <Link to="/orders" className="flex items-center gap-1 text-sm font-bold text-[#FF6B00] hover:text-[#e05e00] transition-colors bg-[#FFF3E8] px-3 py-1.5 rounded-xl">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-[#F4F6FA]">
              {dynamicStats.recentOrders.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#8896AB]">No recent orders</div>
              ) : dynamicStats.recentOrders.map((order, i) => {
                const s = STATUS_MAP[order.status] || STATUS_MAP['Pending'];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.56 + i * 0.06 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#F8FAFC] transition-all duration-300 group cursor-pointer border-l-[3px] border-transparent hover:border-brand-orange-500"
                  >
                    <div
                      style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] + '20', color: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 ring-2 ring-white shadow-sm"
                    >
                      {order.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1a1f36] text-sm group-hover:text-[#FF6B00] transition-colors">{order.customer}</span>
                        <span className="text-xs font-mono font-bold text-[#C8D0DC] bg-[#F4F6FA] px-1.5 py-0.5 rounded">{order.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-[#8896AB] font-medium">
                        <MapPin className="w-3 h-3" />{order.branch} · {order.time}
                      </div>
                    </div>
                    <span className="text-base font-black text-[#1a1f36] shrink-0">{order.amount}</span>
                    <div
                      style={{ background: s.bg, color: s.color }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0"
                    >
                      <CircleDot className="w-2.5 h-2.5" />{order.status}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Top Sellers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.58 }}
        >
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 overflow-hidden h-full flex flex-col hover:shadow-floating hover:-translate-y-1 transition-all duration-300">
            <div className="p-5 sm:p-6 border-b border-[#F0F2F7] flex items-center gap-2">
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
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAFBFD] transition-all group cursor-pointer"
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
    </div>
  );
}
