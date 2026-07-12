import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import Card from '../../components/common/Card';

import { useOrders } from '../../hooks/useOrders';
import toast from 'react-hot-toast';

export default function OrderCalendar() {
 const navigate = useNavigate();
 const { orders } = useOrders();
 const [currentDate, setCurrentDate] = useState(new Date());

 const currentYear = currentDate.getFullYear();
 const currentMonth = currentDate.getMonth();

 const metrics = useMemo(() => {
 const calculatedMetrics: Record<number, { count: number; revenue: number }> = {};
 
 // Initialize current month's days with 0
 const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
 for (let i = 1; i <= daysInMonth; i++) {
 calculatedMetrics[i] = { count: 0, revenue: 0 };
 }

 orders.forEach(order => {
 const orderDate = new Date(order.created_at || new Date().toISOString());
 if (orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth) {
 const day = orderDate.getDate();
 if (!calculatedMetrics[day]) {
 calculatedMetrics[day] = { count: 0, revenue: 0 };
 }
 calculatedMetrics[day].count += 1;
 calculatedMetrics[day].revenue += (order.billing?.total || 0);
 }
 });

 return calculatedMetrics;
 }, [currentYear, currentMonth, orders]);

 // Calculate max revenue for heatmap calculation
 const maxRevenue = useMemo(() => {
 let max = 0;
 Object.values(metrics).forEach(m => {
 if (m.revenue > max) max = m.revenue;
 });
 return max || 1;
 }, [metrics]);

 const getHeatmapColor = (revenue: number) => {
 const intensity = revenue / maxRevenue;
 if (intensity > 0.8) return 'bg-brand-orange-500/10 border-brand-orange-500/20';
 if (intensity > 0.5) return 'bg-brand-orange-500/5 border-brand-orange-500/10';
 if (intensity > 0.2) return 'bg-gray-50/80 border-gray-100';
 return 'bg-white border-transparent';
 };

 const handlePrevMonth = () => {
 setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
 };

 const handleNextMonth = () => {
 setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
 };

 const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
 const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

 const realToday = new Date();

 const isFutureDate = (day: number) => {
 const checkDate = new Date(currentYear, currentMonth, day);
 checkDate.setHours(0, 0, 0, 0);
 const today = new Date();
 today.setHours(0, 0, 0, 0);
 return checkDate > today;
 };

 const handleDayClick = (day: number) => {
 if (isFutureDate(day)) return;
 
 const dayMetrics = metrics[day];
 if (!dayMetrics || dayMetrics.count === 0) {
 toast.error('No orders found for this date', {
 icon: '📭',
 style: {
 borderRadius: '10px',
 background: '#333',
 color: '#fff',
 },
 });
 return;
 }

 const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
 navigate(`/admin/orders/list?date=${formattedDate}`);
 };

 return (
 <div className="space-y-0 max-w-7xl mx-auto">

 {/* Calendar Grid */}
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
 <Card className="p-0 border border-border/60 shadow-lg overflow-hidden bg-white/50 backdrop-blur-xl rounded-3xl">

 <div className="flex justify-end p-4 bg-white/80 backdrop-blur-xl border-b border-border">
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex items-center gap-2 bg-white border border-border rounded-2xl shadow-sm p-1">
 <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-text-secondary hover:text-brand-navy active:scale-95">
 <ChevronLeft className="w-5 h-5" />
 </button>
 <div className="font-black text-brand-navy min-w-[140px] text-center text-lg tracking-tight">
 <AnimatePresence mode="wait">
 <motion.span
 key={currentDate.toString()}
 initial={{ y: 10, opacity: 0 }}
 animate={{ y: 0, opacity: 1 }}
 exit={{ y: -10, opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="block"
 >
 {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
 </motion.span>
 </AnimatePresence>
 </div>
 <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-text-secondary hover:text-brand-navy active:scale-95">
 <ChevronRight className="w-5 h-5" />
 </button>
 </motion.div>
 </div>

 <div className="grid grid-cols-7 border-b border-border bg-white">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
 <div key={day} className="py-4 text-center text-xs font-black text-text-secondary uppercase tracking-widest">
 {day}
 </div>
 ))}
 </div>

 <AnimatePresence mode="wait">
 <motion.div
 key={currentDate.toString()}
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.3 }}
 className="grid grid-cols-7 auto-rows-fr bg-gray-50/30"
 >
 {/* Empty cells for start of month */}
 {Array.from({ length: firstDayOfMonth }).map((_, i) => (
 <div key={`empty-${i}`} className="min-h-[140px] p-2 border-b border-r border-border/50 bg-gray-50/50" />
 ))}

 {/* Day cells */}
 {Array.from({ length: daysInMonth }).map((_, i) => {
 const day = i + 1;
 const isFuture = isFutureDate(day);
 const dayMetrics = metrics[day];
 const heatClass = !isFuture && dayMetrics ? getHeatmapColor(dayMetrics.revenue) : 'bg-transparent border-transparent';

 return (
 <button
 key={day}
 onClick={() => handleDayClick(day)}
 disabled={isFuture}
 className={`min-h-[140px] p-3 border-b border-r border-border/50 flex flex-col items-start transition-all duration-300 relative group overflow-hidden ${isFuture
 ? 'bg-gray-50/80 cursor-not-allowed'
 : `cursor-pointer hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:z-20 hover:scale-[1.02] hover:rounded-xl hover:border-transparent ${heatClass}`
 }`}
 >
 <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full mb-2 transition-colors ${isFuture
 ? 'text-gray-400'
 : 'text-brand-navy group-hover:bg-brand-orange-500 group-hover:text-white group-hover:shadow-md'
 }`}>
 {day}
 </span>

 {dayMetrics && dayMetrics.count > 0 && !isFuture && (
 <div className="mt-auto space-y-2 w-full">
 <div className="flex items-center justify-between text-xs font-bold text-text-secondary group-hover:text-brand-navy transition-colors">
 <span>Ord: {dayMetrics.count}</span>
 </div>
 <div className="flex items-center gap-1 text-sm font-black text-brand-navy bg-white/50 group-hover:bg-gray-50 p-1.5 rounded-lg border border-border/50 transition-colors">
 <TrendingUp className="w-3.5 h-3.5 text-brand-orange-500" />
 ₹{dayMetrics.revenue.toLocaleString()}
 </div>
 </div>
 )}
 </button>
 );
 })}

 {/* Empty cells for end of month */}
 {Array.from({ length: (42 - (daysInMonth + firstDayOfMonth)) % 7 }).map((_, i) => (
 <div key={`empty-end-${i}`} className="min-h-[140px] p-2 border-b border-r border-border/50 bg-gray-50/50" />
 ))}
 </motion.div>
 </AnimatePresence>
 </Card>
 </motion.div>
 </div>
 );
}
