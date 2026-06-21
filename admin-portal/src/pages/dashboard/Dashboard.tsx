import { useState, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  XCircle, RefreshCw, Sparkles
} from 'lucide-react';

// ── Data ──────────────────────────────────────────────────────────────────────

const quickActions = [
  {
    name: 'Add Food Item',
    sub: 'Expand your menu',
    icon: Utensils,
    path: '/food/new',
    from: '#FF6B00',
    mid: '#FF8C38',
    to: '#FF9A4D',
    shadow: 'rgba(255,107,0,0.4)',
  },
  {
    name: 'New Branch',
    sub: 'Open a location',
    icon: Store,
    path: '/branches/new',
    from: '#6D28D9',
    mid: '#7C3AED',
    to: '#A78BFA',
    shadow: 'rgba(109,40,217,0.4)',
  },
  {
    name: 'Add Employee',
    sub: 'Grow your team',
    icon: Users,
    path: '/employees/new',
    from: '#0284C7',
    mid: '#0EA5E9',
    to: '#38BDF8',
    shadow: 'rgba(2,132,199,0.4)',
  },
  {
    name: 'View Orders',
    sub: 'Track live orders',
    icon: ShoppingBag,
    path: '/orders',
    from: '#047857',
    mid: '#059669',
    to: '#34D399',
    shadow: 'rgba(4,120,87,0.4)',
  },
];

function ActionCard({ action }: { action: typeof quickActions[0] }) {
  const [angle, setAngle] = useState(45); // default arrow direction (deg)
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const deg = Math.atan2(dy, dx) * (180 / Math.PI);
    setAngle(deg);
  }, []);

  return (
    <Link to={action.path}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => { setIsHovered(false); setAngle(45); }}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${action.from} 0%, ${action.mid} 50%, ${action.to} 100%)`,
          boxShadow: isHovered
            ? `0 16px 36px ${action.shadow}`
            : `0 6px 20px ${action.shadow}`,
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Subtle inner glow orb */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white opacity-[0.12] blur-xl pointer-events-none" />

        {/* Icon */}
        <div className="relative z-10 w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center ring-1 ring-white/30">
          <action.icon className="w-5 h-5 text-white" />
        </div>

        {/* Text */}
        <div className="relative z-10">
          <h3 className="text-base font-black text-white leading-tight">{action.name}</h3>
          <p className="text-xs text-white/70 font-medium mt-0.5">{action.sub}</p>
        </div>

        {/* Arrow that rotates to follow cursor */}
        <motion.div
          animate={{ rotate: angle }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="absolute bottom-4 right-4 z-10 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center ring-1 ring-white/30"
        >
          <ArrowUpRight className="w-4 h-4 text-white" />
        </motion.div>
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative bg-white rounded-2xl border border-border/60 p-6 flex flex-col gap-4 cursor-default overflow-hidden group shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      {/* Subtle glow background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div style={{ background: bg }} className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]">
          <Icon style={{ color }} className="w-6 h-6 drop-shadow-sm" />
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] ${up ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-red-50 text-red-500 border border-red-100/50'}`}>
          {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {trend}
        </div>
      </div>
      <div className="relative z-10 mt-1">
        <p className="text-[12px] font-bold text-text-secondary mb-1.5 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-brand-navy tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeRange, setActiveRange] = useState('This Week');
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
    let chartData: any[] = [];

    if (activeRange === 'Today') {
      startDate = todayStart;
      chartData = Array.from({ length: 24 }, (_, i) => ({
        name: `${i.toString().padStart(2, '0')}:00`,
        revenue: 0,
        count: 0,
        match: (d: Date) => d.getHours() === i && d >= todayStart
      }));
    } else if (activeRange === 'This Week') {
      startDate = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
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
    }

    const filteredOrders = orders.filter(o => new Date(o.created_at) >= startDate);

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

    const recentOrdersData = filteredOrders.slice(0, 5).map(order => {
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
      totalOrders: filteredOrders.length.toLocaleString(),
      activeBranches: activeBranches.toString(),
      rejectedOrders: rejectedCount.toString(),
      topItems: topItemsData,
      recentOrders: recentOrdersData,
      revenueData: chartData.map(d => ({ name: d.name, revenue: d.revenue, prev: 0 })),
      ordersBar: chartData.map(d => ({ name: d.name, count: d.count }))
    };
  }, [orders, branches, menuItems, activeRange]);

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
    <div ref={dashboardRef} className="-mt-8 space-y-6 relative" style={{ fontFamily: "'Inter', sans-serif" }}>

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
              👋
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

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F4F6FA] rounded-xl p-1 gap-1">
            {['Today', 'This Week', 'This Month'].map(r => (
              <button
                key={r}
                onClick={() => setActiveRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeRange === r ? 'bg-white text-[#1a1f36] shadow-sm' : 'text-[#8896AB] hover:text-[#1a1f36]'}`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white border border-[#E8ECF4] rounded-xl text-[#8896AB] hover:text-[#1a1f36] hover:border-[#C8D0DC] transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1f36] text-white text-sm font-bold rounded-xl hover:bg-[#2d3550] transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <div>
        <h3 className="text-lg font-bold text-[#1a1f36] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((a, i) => (
            <ActionCard key={i} action={a} />
          ))}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div>
        <h3 className="text-lg font-bold text-[#1a1f36] mb-4">KPIs</h3>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={dynamicStats.totalRevenue} icon={IndianRupee} trend="+12.5%" up color="#FF6B00" bg="#FFF3E8" delay={0.2} />
          <StatCard title="Total Orders" value={dynamicStats.totalOrders} icon={ShoppingBag} trend="+8.3%" up color="#7C3AED" bg="#F3EEFF" delay={0.25} />
          <StatCard title="Active Branches" value={dynamicStats.activeBranches} icon={Store} trend="Stable" up color="#0EA5E9" bg="#E6F6FD" delay={0.3} />
          <StatCard title="Rejected Orders" value={dynamicStats.rejectedOrders} icon={XCircle} trend="Requires Action" up={false} color="#EF4444" bg="#FFF0F0" delay={0.35} />
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
              <Link to="/orders" className="flex items-center gap-1 text-sm font-bold text-[#FF6B00] hover:text-[#e05e00] transition-colors bg-[#FFF3E8] px-3 py-1.5 rounded-xl">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto bg-white border-t border-border/50">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-border/50">
                    <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[25%]">Order Details</th>
                    <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[20%]">Customer</th>
                    <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[25%]">Location & Time</th>
                    <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[15%] text-right">Amount</th>
                    <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider w-[15%] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {dynamicStats.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-sm text-[#8896AB]">No recent orders</td>
                    </tr>
                  ) : dynamicStats.recentOrders.map((order, i) => {
                    const s = STATUS_MAP[order.status] || STATUS_MAP['Pending'];
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-orange-50 text-brand-orange-500 flex items-center justify-center shrink-0 border border-brand-orange-100/50">
                              <span className="font-black text-sm">#{order.id.replace('ORD-', '')}</span>
                            </div>
                            <span className="font-bold text-brand-navy text-base hover:text-brand-orange-600 transition-colors">
                              {order.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] + '20', color: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ring-1 ring-border/50 shadow-sm"
                            >
                              {order.avatar}
                            </div>
                            <Tooltip content={order.customer} position="top">
                              <span 
                                className="font-bold text-brand-navy text-sm group-hover:text-brand-orange-600 transition-colors truncate max-w-[150px]"
                              >
                                {order.customer}
                              </span>
                            </Tooltip>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-[12px] text-text-secondary font-medium">
                            <MapPin className="w-4 h-4" />{order.branch}
                          </div>
                          <div className="text-[11px] font-bold text-text-secondary mt-0.5 ml-5.5">{order.time}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <span className="text-base font-black text-brand-navy">{order.amount}</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <div
                            style={{ background: s.bg, color: s.color }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-white/20 shadow-sm"
                          >
                            <CircleDot className="w-2.5 h-2.5" />{order.status}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
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
  );
}
