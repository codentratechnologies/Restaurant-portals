import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
const revenueData = [
  { name: 'Mon', revenue: 14000, prev: 11000 },
  { name: 'Tue', revenue: 13000, prev: 12500 },
  { name: 'Wed', revenue: 15000, prev: 14000 },
  { name: 'Thu', revenue: 18500, prev: 16000 },
  { name: 'Fri', revenue: 26000, prev: 21000 },
  { name: 'Sat', revenue: 38000, prev: 31000 },
  { name: 'Sun', revenue: 27500, prev: 24000 },
];

const ordersBar = [
  { name: 'Mon', count: 42 },
  { name: 'Tue', count: 38 },
  { name: 'Wed', count: 55 },
  { name: 'Thu', count: 61 },
  { name: 'Fri', count: 87 },
  { name: 'Sat', count: 112 },
  { name: 'Sun', count: 79 },
];

const recentOrders = [
  { id: '#4021', customer: 'Alexander Wolfe', amount: '₹450', status: 'Delivered', time: '2 min ago', branch: 'Downtown', avatar: 'AW' },
  { id: '#4020', customer: 'Sarah Jenkins', amount: '₹820', status: 'Preparing', time: '12 min ago', branch: 'Westside', avatar: 'SJ' },
  { id: '#4019', customer: 'Michael Chang', amount: '₹320', status: 'Pending', time: '25 min ago', branch: 'Downtown', avatar: 'MC' },
  { id: '#4018', customer: 'Emma Thompson', amount: '₹1,215', status: 'Cancelled', time: '1 hr ago', branch: 'North Mall', avatar: 'ET' },
  { id: '#4017', customer: 'David Garcia', amount: '₹850', status: 'Delivered', time: '2 hr ago', branch: 'Downtown', avatar: 'DG' },
];

const topItems = [
  { rank: 1, name: 'Chicken Biryani', orders: 124, revenue: '₹43,400', change: '+12%', up: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=80&h=80&fit=crop' },
  { rank: 2, name: 'Margherita Pizza', orders: 98, revenue: '₹29,400', change: '+8%', up: true, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=80&h=80&fit=crop' },
  { rank: 3, name: 'Garlic Bread', orders: 85, revenue: '₹12,750', change: '-2%', up: false, image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=80&h=80&fit=crop' },
  { rank: 4, name: 'Paneer Tikka', orders: 76, revenue: '₹19,000', change: '+15%', up: true, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=80&h=80&fit=crop' },
];

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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-2xl border border-[#E8ECF4] p-5 flex flex-col gap-4 cursor-default transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div style={{ background: bg }} className="w-11 h-11 rounded-xl flex items-center justify-center">
          <Icon style={{ color }} className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[13px] font-semibold text-[#8896AB] mb-1">{title}</p>
        <h3 className="text-2xl font-black text-[#1a1f36]">{value}</h3>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeRange, setActiveRange] = useState('This Week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="-mt-8 pb-16 space-y-6 relative" style={{ fontFamily: "'Inter', sans-serif" }}>

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
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1f36] text-white text-sm font-bold rounded-xl hover:bg-[#2d3550] transition-all shadow-sm hover:shadow-md">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </motion.div>

      {/* ── Quick Actions (TOP, full-color with effects) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((a, i) => (
          <ActionCard key={i} action={a} />
        ))}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="₹12,45,600" icon={DollarSign} trend="+12.5%" up color="#FF6B00" bg="#FFF3E8" delay={0.2} />
        <StatCard title="Total Orders" value="3,842" icon={ShoppingBag} trend="+8.3%" up color="#7C3AED" bg="#F3EEFF" delay={0.25} />
        <StatCard title="Active Branches" value="12" icon={Store} trend="Stable" up color="#0EA5E9" bg="#E6F6FD" delay={0.3} />
        <StatCard title="Pending Orders" value="48" icon={Package} trend="-4 today" up={false} color="#EF4444" bg="#FFF0F0" delay={0.35} />
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
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
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
                <BarChart data={ordersBar} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barSize={20}>
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
            <div className="divide-y divide-[#F4F6FA]">
              {recentOrders.map((order, i) => {
                const s = STATUS_MAP[order.status] || STATUS_MAP['Pending'];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.56 + i * 0.06 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAFBFD] transition-colors group cursor-pointer"
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
              {topItems.map((item, i) => (
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

            <div className="p-4 border-t border-[#F0F2F7]">
              <Link to="/food">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A4D)', boxShadow: '0 4px 16px rgba(255,107,0,0.25)' }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                >
                  View Full Menu <ChevronRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
