import { motion } from 'framer-motion';
import DashboardHeader from './components/DashboardHeader';
import FilterToolbar from './components/FilterToolbar';
import KPISection from './components/KPISection';
import RevenueOrdersChart from './components/RevenueOrdersChart';
import TopSellingItems from './components/TopSellingItems';
import RecentOrdersTable from './components/RecentOrdersTable';
import { useDashboardData } from './services/useDashboardData';
import { mockChartData, mockTopItems, mockRecentOrders } from './services/mockData';

export default function Dashboard() {
  const {
    startDate, setStartDate,
    endDate, setEndDate,
    period, setPeriod,
    validationError,
    isConnected,
    isManager, setIsManager
  } = useDashboardData();

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

  return (
    <div className="space-y-6 pb-16 relative">
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
        <motion.div variants={itemVariants}>
          <KPISection isManager={isManager} />
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="xl:col-span-2">
            <RevenueOrdersChart data={mockChartData} isManager={isManager} />
          </motion.div>

          <motion.div variants={itemVariants} className="xl:col-span-1">
            <TopSellingItems items={mockTopItems} />
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <RecentOrdersTable orders={mockRecentOrders} />
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
