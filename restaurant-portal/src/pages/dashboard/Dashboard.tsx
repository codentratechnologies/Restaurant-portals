import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import DashboardHeader from './components/DashboardHeader';
import FilterToolbar from './components/FilterToolbar';
import KPISection from './components/KPISection';
import RevenueOrdersChart from './components/RevenueOrdersChart';
import TopSellingItems from './components/TopSellingItems';
import RecentOrdersTable from './components/RecentOrdersTable';
import { useDashboardData } from './services/useDashboardData';
import { useRestaurantOrders } from '../../hooks/useRestaurantOrders';

export default function Dashboard() {
  const {
    startDate, setStartDate,
    endDate, setEndDate,
    period, setPeriod,
    validationError,
    isConnected,
    isManager, setIsManager
  } = useDashboardData();

  const { orders, loading, masterMenu } = useRestaurantOrders();

  const dynamicStats = useMemo(() => {
    let totalRevenue = 0;
    let totalRejections = 0;
    let totalCancellations = 0;
    const itemsMap: Record<string, { name: string; orders: number; revenue: number; category: string }> = {};

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const chartData = Array.from({ length: diffDays }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return {
        date: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'),
        name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: 0,
        orders: 0
      };
    });

    const filteredOrders = orders.filter(o => {
      const orderDate = new Date(o.created_at || Date.now());
      return orderDate >= start && orderDate <= end;
    });

    filteredOrders.forEach(order => {
      if (order.status !== 'Rejected' && order.status !== 'Cancelled') {
        totalRevenue += order.billing?.total || 0;
      }
      if (order.status === 'Rejected') totalRejections++;
      if (order.status === 'Cancelled') totalCancellations++;

      const orderDate = new Date(order.created_at || Date.now());
      const dateStr = orderDate.getFullYear() + '-' + String(orderDate.getMonth() + 1).padStart(2, '0') + '-' + String(orderDate.getDate()).padStart(2, '0');

      const dayIndex = chartData.findIndex(d => d.date === dateStr);
      if (dayIndex !== -1 && order.status !== 'Rejected' && order.status !== 'Cancelled') {
        chartData[dayIndex].revenue += order.billing?.total || 0;
        chartData[dayIndex].orders += 1;
      }

      if (order.status !== 'Rejected' && order.status !== 'Cancelled') {
        order.items?.forEach(item => {
          if (!itemsMap[item.name]) {
            itemsMap[item.name] = { name: item.name, orders: 0, revenue: 0, category: 'Food' };
          }
          itemsMap[item.name].orders += item.qty || 1;
          itemsMap[item.name].revenue += item.subtotal || 0;
        });
      }
    });

    // Fix float precisions
    totalRevenue = parseFloat(totalRevenue.toFixed(2));
    chartData.forEach(day => {
      day.revenue = parseFloat(day.revenue.toFixed(2));
    });

    const topItemsData = Object.values(itemsMap)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 4)
      .map((item, index) => {
        const menuItem = masterMenu.find(m => m.name.toLowerCase() === item.name.toLowerCase());
        const imageUrl = menuItem?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop';

        return {
          rank: index + 1,
          name: item.name,
          orders: item.orders,
          revenue: `₹${parseFloat(item.revenue.toFixed(2)).toLocaleString()}`,
          trend: '+New',
          category: item.category,
          progress: 100 - (index * 20),
          image: imageUrl
        };
      });

    const recentOrdersData = filteredOrders.slice(0, 5).map(order => {
      const timeDiff = Math.floor((new Date().getTime() - new Date(order.created_at || Date.now()).getTime()) / 60000);
      let timeStr = `${timeDiff} min ago`;
      if (timeDiff > 60) timeStr = `${Math.floor(timeDiff / 60)} hr ago`;
      if (timeDiff > 1440) timeStr = `${Math.floor(timeDiff / 1440)} days ago`;

      return {
        id: `#${(order.id || '').toString().slice(-4)}`,
        items: order.items.map((i: any) => i.name).join(', '),
        amount: `₹${(order.billing?.total || 0).toLocaleString()}`,
        status: order.status,
        time: timeStr,
        method: order.payment?.method || 'Online'
      };
    });

    return {
      totalRevenue,
      totalOrders: filteredOrders.length,
      totalRejections,
      totalCancellations,
      topItems: topItemsData,
      recentOrders: recentOrdersData,
      chartData: chartData
    };
  }, [orders, masterMenu, startDate, endDate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-brand-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-6 z-40 relative">
        <DashboardHeader
          isConnected={isConnected}
          isManager={isManager}
          setIsManager={setIsManager}
        />

        <FilterToolbar
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
          validationError={validationError}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="pt-2">
          <h2 className="text-lg font-black text-brand-navy mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand-orange-500 rounded-full"></span>
            Key Performance Indicators
          </h2>
          <KPISection
            isManager={isManager}
            totalRevenue={dynamicStats.totalRevenue}
            totalOrders={dynamicStats.totalOrders}
            totalRejections={dynamicStats.totalRejections}
            totalCancellations={dynamicStats.totalCancellations}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="pt-6 border-t border-border/50">
          <h2 className="text-lg font-black text-brand-navy mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand-orange-500 rounded-full"></span>
            Sales & Menu Analytics
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <RevenueOrdersChart data={dynamicStats.chartData} isManager={isManager} />
            </div>

            <div className="xl:col-span-1">
              <TopSellingItems items={dynamicStats.topItems} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-6 border-t border-border/50">
          <h2 className="text-lg font-black text-brand-navy mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand-orange-500 rounded-full"></span>
            Order Management
          </h2>
          <RecentOrdersTable orders={dynamicStats.recentOrders} />
        </motion.div>
      </motion.div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden bg-gray-50/30">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-brand-orange-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
