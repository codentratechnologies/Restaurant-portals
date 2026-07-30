import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import DashboardHeader from './components/DashboardHeader';
import KPISection from './components/KPISection';
import RevenueOrdersChart from './components/RevenueOrdersChart';
import TopSellingItems from './components/TopSellingItems';
import LiveOrderStatus from './components/LiveOrderStatus';
import CustomerRating from './components/CustomerRating';
import Select from '../../components/common/Select';
import { Download } from 'lucide-react';
import { exportDashboardReport } from '../../utils/exportUtils';
import { useDashboardData } from './services/useDashboardData';
import { useRestaurantOrders } from '../../hooks/useRestaurantOrders';

export default function Dashboard() {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    isConnected,
    isManager, setIsManager
  } = useDashboardData();

  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | '90days' | 'custom'>('30days');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isExporting, setIsExporting] = useState(false);

  // Sync timeFilter with DashboardData dates
  import('react').then(({ useEffect }) => {
    useEffect(() => {
      const today = new Date();
      let newStart = '';
      const endStr = today.toISOString().split('T')[0];

      if (timeFilter === 'today') {
        newStart = endStr;
      } else if (timeFilter === '7days') {
        const d = new Date(); d.setDate(d.getDate() - 6);
        newStart = d.toISOString().split('T')[0];
      } else if (timeFilter === '30days') {
        const d = new Date(); d.setDate(d.getDate() - 29);
        newStart = d.toISOString().split('T')[0];
      } else if (timeFilter === '90days') {
        const d = new Date(); d.setDate(d.getDate() - 89);
        newStart = d.toISOString().split('T')[0];
      } else if (timeFilter === 'custom') {
        newStart = customStartDate;
        setEndDate(customEndDate);
      }

      if (timeFilter !== 'custom') {
        setStartDate(newStart);
        setEndDate(endStr);
      } else {
        setStartDate(newStart);
      }
    }, [timeFilter, customStartDate, customEndDate, setStartDate, setEndDate]);
  });

  const { orders, loading, masterMenu } = useRestaurantOrders();

  const dynamicStats = useMemo(() => {
    let totalRevenue = 0;
    const itemsMap: Record<string, { name: string; orders: number; revenue: number; category: string }> = {};

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const prevStart = new Date(start.getTime() - diffDays * 24 * 60 * 60 * 1000);
    const prevEnd = new Date(start.getTime() - 1);

    const prevFilteredOrders = orders.filter(o => {
      const orderDate = new Date(o.created_at || Date.now());
      return orderDate >= prevStart && orderDate <= prevEnd;
    });

    let prevTotalRevenue = 0;
    let prevTotalRejections = 0;
    let prevTotalCancellations = 0;
    prevFilteredOrders.forEach(order => {
      if (order.status !== 'Rejected' && order.status !== 'Cancelled') {
        prevTotalRevenue += order.billing?.total || 0;
      }
      if (order.status === 'Rejected') prevTotalRejections++;
      if (order.status === 'Cancelled') prevTotalCancellations++;
    });

    let chartData: { date: string, name: string, revenue: number, orders: number }[] = [];
    if (startDate === endDate) {
      chartData = Array.from({ length: 24 }, (_, i) => ({
        date: `${startDate} ${String(i).padStart(2, '0')}:00`,
        name: `${String(i).padStart(2, '0')}:00`,
        revenue: 0,
        orders: 0
      }));
    } else {
      chartData = Array.from({ length: diffDays }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return {
          date: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'),
          name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: 0,
          orders: 0
        };
      });
    }

    const filteredOrders = orders.filter(o => {
      const orderDate = new Date(o.created_at || Date.now());
      return orderDate >= start && orderDate <= end;
    });

    let pending = 0;
    let preparing = 0;
    let ready = 0;
    let delivered = 0;
    let totalRejections = 0;
    let totalCancellations = 0;

    filteredOrders.forEach(order => {
      if (order.status !== 'Rejected' && order.status !== 'Cancelled') {
        totalRevenue += order.billing?.total || 0;
      }
      
      if (order.status === 'Pending') pending++;
      else if (order.status === 'Accepted' || order.status === 'Preparing') preparing++;
      else if (order.status === 'Ready') ready++;
      else if (order.status === 'Delivered' || order.status === 'Completed') delivered++;
      else if (order.status === 'Rejected') totalRejections++;
      else if (order.status === 'Cancelled') totalCancellations++;

      const orderDate = new Date(order.created_at || Date.now());
      let dayIndex = -1;

      if (startDate === endDate) {
        const hourStr = `${startDate} ${String(orderDate.getHours()).padStart(2, '0')}:00`;
        dayIndex = chartData.findIndex(d => d.date === hourStr);
      } else {
        const dateStr = orderDate.getFullYear() + '-' + String(orderDate.getMonth() + 1).padStart(2, '0') + '-' + String(orderDate.getDate()).padStart(2, '0');
        dayIndex = chartData.findIndex(d => d.date === dateStr);
      }
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
          image: imageUrl,
          rawQty: item.orders // For export compatibility
        };
      });

    const getTrend = (current: number, prev: number, inverse = false) => {
      if (prev === 0) {
        if (current === 0) return { text: '0%', isUp: true, desc: 'vs prev period' };
        return { text: '100%', isUp: !inverse, desc: 'vs prev period' };
      }
      const diff = current - prev;
      const percent = Math.abs(diff / prev) * 100;
      const isPositive = diff >= 0;
      return {
        text: `${isPositive ? '+' : '-'}${percent.toFixed(1)}%`,
        isUp: inverse ? !isPositive : isPositive,
        desc: 'vs prev period'
      };
    };

    const reviews = filteredOrders
      .map(o => o.customer_review)
      .filter(r => r !== undefined);

    let averageRating = 0;
    const distribution = [0, 0, 0, 0, 0];
    if (reviews.length > 0) {
      let sum = 0;
      reviews.forEach(r => {
        if (r && r.rating >= 1 && r.rating <= 5) {
          sum += r.rating;
          distribution[r.rating - 1]++;
        }
      });
      averageRating = sum / reviews.length;
    }

    const pieData = [
      { name: 'Pending', value: pending, percentage: filteredOrders.length > 0 ? `${Math.round((pending/filteredOrders.length)*100)}%` : '0%' },
      { name: 'Preparing', value: preparing, percentage: filteredOrders.length > 0 ? `${Math.round((preparing/filteredOrders.length)*100)}%` : '0%' },
      { name: 'Ready', value: ready, percentage: filteredOrders.length > 0 ? `${Math.round((ready/filteredOrders.length)*100)}%` : '0%' },
      { name: 'Delivered', value: delivered, percentage: filteredOrders.length > 0 ? `${Math.round((delivered/filteredOrders.length)*100)}%` : '0%' },
      { name: 'Rejected', value: totalRejections, percentage: filteredOrders.length > 0 ? `${Math.round((totalRejections/filteredOrders.length)*100)}%` : '0%' },
    ].filter(d => d.value > 0);

    const recentOrders = filteredOrders
      .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
      .slice(0, 10)
      .map(o => ({
        id: o.id,
        customer: o.customer?.name || 'Unknown',
        restaurant: o.branch || 'Main Branch',
        amount: `₹${o.billing?.total || 0}`,
        status: o.status,
        time: new Date(o.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

    return {
      totalRevenue: totalRevenue,
      totalOrders: filteredOrders.length,
      totalRejections: totalRejections,
      totalCancellations: totalCancellations,
      avgOrderValue: filteredOrders.length > 0 ? (totalRevenue / filteredOrders.length).toFixed(2) : '0',
      activeBranches: 1, // hardcoded for restaurant
      topItems: topItemsData,
      chartData: chartData,
      revenueData: chartData.map(d => ({ name: d.name, value: d.revenue })),
      pieData: pieData,
      recentOrders: recentOrders,
      statusCounts: { pending, preparing, ready, delivered },
      ratingStats: { averageRating, distribution, totalReviews: reviews.length },
      trends: {
        revenue: getTrend(totalRevenue, prevTotalRevenue),
        orders: getTrend(filteredOrders.length, prevFilteredOrders.length),
        rejections: getTrend(totalRejections, prevTotalRejections, true),
        cancellations: getTrend(totalCancellations, prevTotalCancellations, true)
      }
    };
  }, [orders, masterMenu, startDate, endDate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      const getFilterLabel = () => {
        switch (timeFilter) {
          case 'today': return 'Today';
          case '7days': return 'Last 7 Days';
          case '30days': return 'Last 30 Days';
          case '90days': return 'Last 90 Days';
          default: return 'Custom Range';
        }
      };
      await exportDashboardReport(dynamicStats, getFilterLabel());
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full px-3 sm:px-6 lg:px-8 pb-10 pt-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 mt-1 sm:mt-2">
        <DashboardHeader
          isConnected={isConnected}
          isManager={isManager}
          setIsManager={setIsManager}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0 relative z-10">
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
            <div className="flex-1 sm:w-[200px] shrink-0 relative z-[60]">
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
            
            <button
              onClick={handleExportReport}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#E66000] text-white px-3 sm:px-4 py-[9px] sm:py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 shrink-0 shadow-sm relative z-50"
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <motion.div variants={itemVariants}>
          <KPISection
            isManager={isManager}
            totalRevenue={dynamicStats.totalRevenue}
            totalOrders={dynamicStats.totalOrders}
            totalRejections={dynamicStats.totalRejections}
            totalCancellations={dynamicStats.totalCancellations}
            trends={dynamicStats.trends}
            pendingOrdersCount={dynamicStats.statusCounts.pending}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueOrdersChart data={dynamicStats.chartData} isManager={isManager} />
          </div>
          <div className="lg:col-span-1">
            <LiveOrderStatus {...dynamicStats.statusCounts} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TopSellingItems items={dynamicStats.topItems} />
          </div>
          <div className="lg:col-span-1">
            <CustomerRating {...dynamicStats.ratingStats} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
