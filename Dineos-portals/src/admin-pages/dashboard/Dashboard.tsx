import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrders } from '../../hooks/useOrders';
import { useBranches } from '../../hooks/useBranches';
import { useMenuItems } from '../../hooks/useMenuItems';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  ShoppingBag, Store, Calendar, TrendingUp, MoreVertical
} from 'lucide-react';
import { IndianRupee } from 'lucide-react';


// --- Types & Data ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const isPie = !label;
  const title = isPie ? payload[0].name : label;
  
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-[#E8ECF4] rounded-xl px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-w-[130px] relative z-50">
      <p className="text-xs font-bold text-[#8896AB] mb-2 uppercase tracking-wider">{title}</p>
      <div className="flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: payload[0].payload?.fill || '#FF6B00' }} />
        <span className="text-base font-black text-[#1a1f36]">
          {isPie ? `${payload[0].value} Orders` : `₹ ${payload[0].value?.toLocaleString()}`}
        </span>
      </div>
    </div>
  );
};

// --- Components ---

function StatCard({ title, value, icon: Icon, trend, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white border border-[#E8ECF4] p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#FFF3E8] text-[#FF6B00] flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-right">
           <p className="text-xs font-bold text-[#8896AB]">{title}</p>
           <h3 className="text-2xl font-black text-[#1a1f36] mt-1">{value}</h3>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 text-xs font-bold mt-2">
        <TrendingUp className="w-4 h-4 text-[#059669]" />
        <span className="text-[#059669]">{trend}</span>
        <span className="text-[#8896AB] font-medium ml-1">vs last week</span>
      </div>
    </motion.div>
  );
}

const PIE_COLORS = ['#EF4444', '#7C3AED', '#EAB308', '#22C55E', '#8896AB']; // Red, Purple, Yellow, Green, Gray

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered': return { bg: '#DCFCE7', text: '#166534' }; // Green
    case 'Out for Delivery': return { bg: '#FEF3C7', text: '#92400E' }; // Yellow
    case 'Preparing': return { bg: '#F3E8FF', text: '#6B21A8' }; // Purple
    case 'Accepted': return { bg: '#DBEAFE', text: '#1E40AF' }; // Blue
    case 'Pending': return { bg: '#FEE2E2', text: '#991B1B' }; // Red
    case 'Cancelled': return { bg: '#F3F4F6', text: '#374151' }; // Gray
    default: return { bg: '#F3F4F6', text: '#374151' };
  }
};

export default function Dashboard() {
  const { orders, loading: ordersLoading } = useOrders();
  const { branches, loading: branchesLoading } = useBranches();
  const { menuItems } = useMenuItems();

  // --- Real Data Calculations ---
  const dynamicStats = useMemo(() => {
    // KPI Cards
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.billing?.total || 0), 0);
    const activeBranchesCount = branches.filter(b => b.is_active !== false).length; // Default to true if missing
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Line Chart Data (Last 7 Days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const revenueMap: Record<string, number> = {};
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      revenueMap[label] = 0;
    }
    
    orders.forEach(order => {
      const oDate = new Date(order.created_at);
      oDate.setHours(0, 0, 0, 0);
      const label = oDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      if (revenueMap[label] !== undefined) {
        revenueMap[label] += (order.billing?.total || 0);
      }
    });
    
    const revenueData = Object.keys(revenueMap).map(k => ({ name: k, value: revenueMap[k] }));

    // Pie Chart Data
    const statusCounts: Record<string, number> = { Pending: 0, Preparing: 0, 'Out for Delivery': 0, Delivered: 0 };
    orders.forEach(order => {
      const st = order.status || 'Pending';
      if (statusCounts[st] !== undefined) {
        statusCounts[st]++;
      } else {
        statusCounts[st] = 1;
      }
    });

    const pieData = Object.keys(statusCounts)
      .filter(k => statusCounts[k] > 0 || ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'].includes(k)) // keep main ones even if 0
      .map(k => ({
        name: k,
        value: statusCounts[k],
        percentage: totalOrders > 0 ? `${Math.round((statusCounts[k] / totalOrders) * 100)}%` : '0%'
      }));

    // Recent Orders (Top 5)
    const recentOrders = orders.slice(0, 5).map(order => {
      const colors = getStatusColor(order.status);
      return {
        id: `#${order.id.toString().substring(0, 8)}`,
        rawId: order.id,
        customer: order.customer?.name || 'Unknown',
        restaurant: order.branch || 'N/A',
        amount: `₹ ${order.billing?.total?.toLocaleString() || 0}`,
        status: order.status,
        time: new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        color: colors.bg,
        text: colors.text
      };
    });

    // Top Selling Items
    const itemMap: Record<string, { qty: number, revenue: number }> = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!itemMap[item.name]) itemMap[item.name] = { qty: 0, revenue: 0 };
        itemMap[item.name].qty += item.qty;
        itemMap[item.name].revenue += item.subtotal;
      });
    });

    const topItems = Object.keys(itemMap)
      .map(k => {
        const matchingMenuItem = menuItems.find(m => m.name === k);
        return {
          name: k,
          rawQty: itemMap[k].qty,
          orders: `${itemMap[k].qty} Orders`,
          revenue: `₹ ${itemMap[k].revenue.toLocaleString()}`,
          image: matchingMenuItem?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop' // Placeholder fallback
        };
      })
      .sort((a, b) => b.rawQty - a.rawQty)
      .slice(0, 5);

    return {
      totalRevenue: `₹ ${totalRevenue.toLocaleString()}`,
      totalOrders: totalOrders.toLocaleString(),
      activeBranches: activeBranchesCount.toString(),
      avgOrderValue: `₹ ${avgOrderValue.toLocaleString()}`,
      revenueData,
      pieData,
      recentOrders,
      topItems,
      rawTotalOrders: totalOrders
    };
  }, [orders, branches, menuItems]);

  if (ordersLoading || branchesLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF6B00] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div>
          <h1 className="text-2xl font-black text-[#1a1f36] tracking-tight flex items-center gap-2">
            Welcome back, Admin 👋
          </h1>
          <p className="text-sm font-medium text-[#8896AB] mt-1">
            Here's what's happening with your business today.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-[#E8ECF4] rounded-xl px-4 py-2.5 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
          <Calendar className="w-5 h-5 text-[#8896AB]" />
          <span className="text-sm font-bold text-[#1a1f36]">
            {new Date(new Date().setDate(new Date().getDate() - 6)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-2">
            <path d="M1 1L5 5L9 1" stroke="#8896AB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Orders" value={dynamicStats.totalOrders} icon={ShoppingBag} trend="↑ 18.2%" delay={0.1} />
        <StatCard title="Total Revenue" value={dynamicStats.totalRevenue} icon={IndianRupee} trend="↑ 22.5%" delay={0.2} />
        <StatCard title="Active Restaurants" value={dynamicStats.activeBranches} icon={Store} trend="↑ 8.1%" delay={0.3} />
        <StatCard title="Average Order Value" value={dynamicStats.avgOrderValue} icon={ShoppingBag} trend="↑ 10.3%" delay={0.4} />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E8ECF4] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between">
            <h3 className="text-lg font-black text-[#1a1f36]">Orders Overview</h3>
            <div className="flex items-center gap-2 bg-white border border-[#E8ECF4] rounded-lg px-3 py-1.5 cursor-pointer">
              <span className="text-sm font-bold text-[#1a1f36]">Last 7 Days</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                <path d="M1 1L5 5L9 1" stroke="#8896AB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="p-5 flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicStats.revenueData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8896AB', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8896AB', fontSize: 12, fontWeight: 600 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#FF6B00" strokeWidth={3} fill="url(#colorRevenue)" dot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#FF6B00' }} activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#FF6B00' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white border border-[#E8ECF4] rounded-2xl shadow-sm p-5 flex flex-col">
          <h3 className="text-lg font-black text-[#1a1f36]">Order Status</h3>
          <div className="flex-1 flex items-center justify-center mt-4">
            <div className="relative w-56 h-56 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicStats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {dynamicStats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

            </div>
          </div>
        </div>
      </div>

      {/* ── Tables Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border border-[#E8ECF4] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-[#F0F2F7]">
            <h3 className="text-lg font-black text-[#1a1f36]">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm font-bold text-[#1a1f36] border border-[#E8ECF4] rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
              View All Orders
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#F0F2F7]">
                  <th className="px-5 py-3 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Order ID</th>
                  <th className="px-5 py-3 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Restaurant</th>
                  <th className="px-5 py-3 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Time</th>
                  <th className="px-5 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F7]">
                {dynamicStats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm font-medium text-[#8896AB]">
                      No recent orders found.
                    </td>
                  </tr>
                ) : (
                  dynamicStats.recentOrders.map((order, i) => (
                    <tr key={i} className="hover:bg-[#F8FAFC] transition-colors group">
                      <td className="px-5 py-3.5 text-sm font-bold text-[#1a1f36] whitespace-nowrap">{order.id}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-[#1a1f36]">
                        {order.customer}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-[#1a1f36]">{order.restaurant}</td>
                      <td className="px-5 py-3.5 text-sm font-black text-[#1a1f36]">{order.amount}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap" style={{ backgroundColor: order.color, color: order.text }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-[#1a1f36] whitespace-nowrap">{order.time}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to={`/admin/orders/${order.rawId}`} className="text-[#8896AB] hover:text-[#1a1f36] transition-colors p-1 rounded-lg hover:bg-[#E8ECF4] inline-block">
                          <MoreVertical className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white border border-[#E8ECF4] rounded-2xl shadow-sm flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-[#F0F2F7]">
            <h3 className="text-lg font-black text-[#1a1f36]">Top Selling Items</h3>
            <button className="text-sm font-bold text-[#1a1f36] border border-[#E8ECF4] rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
              View All
            </button>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto max-h-[350px]">
            {dynamicStats.topItems.length === 0 ? (
              <div className="p-5 text-center text-sm font-medium text-[#8896AB]">
                No items sold yet.
              </div>
            ) : (
              dynamicStats.topItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-[#F8FAFC] rounded-xl transition-colors cursor-pointer group">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1a1f36] truncate group-hover:text-[#FF6B00] transition-colors">{item.name}</p>
                    <p className="text-xs font-medium text-[#8896AB] mt-0.5">{item.orders}</p>
                  </div>
                  <div className="text-sm font-black text-[#1a1f36]">
                    {item.revenue}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
