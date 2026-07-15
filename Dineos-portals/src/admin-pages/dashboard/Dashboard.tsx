import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrders } from '../../hooks/useOrders';
import { useBranches } from '../../hooks/useBranches';
import { useMenuItems } from '../../hooks/useMenuItems';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList, Legend
} from 'recharts';
import {
  ShoppingBag, Store, Calendar, TrendingUp, TrendingDown, MoreVertical, Download
} from 'lucide-react';
import { IndianRupee } from 'lucide-react';
import Select from '../../components/common/Select';


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
  
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | '90days' | 'custom'>('7days');
  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isExporting, setIsExporting] = useState(false);

  // --- Real Data Calculations ---
  const dynamicStats = useMemo(() => {
    const now = new Date();
    let filterStartDate = new Date();
    let filterEndDate = new Date();
    let daysToShow = 7;
    
    if (timeFilter === 'today') {
      daysToShow = 1;
    } else if (timeFilter === '30days') {
      filterStartDate.setDate(now.getDate() - 29);
      daysToShow = 30;
    } else if (timeFilter === '90days') {
      filterStartDate.setDate(now.getDate() - 89);
      daysToShow = 90;
    } else if (timeFilter === 'custom') {
      filterStartDate = new Date(customStartDate || now);
      filterEndDate = new Date(customEndDate || now);
      // Ensure start is before end
      if (filterStartDate > filterEndDate) {
        const temp = filterStartDate;
        filterStartDate = filterEndDate;
        filterEndDate = temp;
      }
      daysToShow = Math.max(1, Math.ceil((filterEndDate.getTime() - filterStartDate.getTime()) / (1000 * 3600 * 24)) + 1);
    } else {
      filterStartDate.setDate(now.getDate() - 6);
      daysToShow = 7;
    }
    
    filterStartDate.setHours(0, 0, 0, 0);
    filterEndDate.setHours(23, 59, 59, 999);

    // Calculate previous period for trends
    const diffTime = filterEndDate.getTime() - filterStartDate.getTime();
    const previousEndDate = new Date(filterStartDate.getTime() - 1);
    const previousStartDate = new Date(previousEndDate.getTime() - diffTime);
    previousStartDate.setHours(0, 0, 0, 0);

    let trendLabel = 'vs previous period';
    if (timeFilter === 'today') trendLabel = 'vs yesterday';
    else if (timeFilter === '7days') trendLabel = 'vs last week';
    else if (timeFilter === '30days') trendLabel = 'vs last month';
    else if (timeFilter === '90days') trendLabel = 'vs last quarter';

    const filteredOrders = orders.filter(o => {
      const oDate = new Date(o.created_at);
      if (timeFilter === 'custom') {
        return oDate >= filterStartDate && oDate <= filterEndDate;
      }
      return oDate >= filterStartDate && oDate <= filterEndDate;
    });

    const previousOrders = orders.filter(o => {
      const oDate = new Date(o.created_at);
      return oDate >= previousStartDate && oDate <= previousEndDate;
    });

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    // KPI Cards - Current
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.billing?.total || 0), 0);
    const activeBranchesCount = branches.filter(b => b.is_active !== false && (!b.created_at || new Date(b.created_at) <= filterEndDate)).length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // KPI Cards - Previous
    const prevTotalOrders = previousOrders.length;
    const prevTotalRevenue = previousOrders.reduce((sum, order) => sum + (order.billing?.total || 0), 0);
    const prevActiveBranchesCount = branches.filter(b => b.is_active !== false && (!b.created_at || new Date(b.created_at) <= previousEndDate)).length;
    const prevAvgOrderValue = prevTotalOrders > 0 ? Math.round(prevTotalRevenue / prevTotalOrders) : 0;

    const trends = {
      orders: calculateTrend(totalOrders, prevTotalOrders),
      revenue: calculateTrend(totalRevenue, prevTotalRevenue),
      branches: calculateTrend(activeBranchesCount, prevActiveBranchesCount),
      avgOrderValue: calculateTrend(avgOrderValue, prevAvgOrderValue)
    };

    // Line Chart Data
    const revenueMap: Record<string, number> = {};
    const endAnchor = timeFilter === 'custom' ? filterEndDate : now;
    endAnchor.setHours(0, 0, 0, 0);
    
    // Generate buckets depending on range
    if (daysToShow > 60) {
      // Group by weeks to avoid too many points
      const weeksCount = Math.ceil(daysToShow / 7);
      for (let i = weeksCount - 1; i >= 0; i--) {
        const d = new Date(endAnchor);
        d.setDate(d.getDate() - (i * 7));
        const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        revenueMap[label] = 0;
      }
      filteredOrders.forEach(order => {
        const oDate = new Date(order.created_at);
        oDate.setHours(0, 0, 0, 0);
        // Find closest week bucket
        const daysDiff = Math.floor((endAnchor.getTime() - oDate.getTime()) / (1000 * 3600 * 24));
        const weekIndex = Math.floor(daysDiff / 7);
        if (weekIndex < weeksCount && weekIndex >= 0) {
          const bucketDate = new Date(endAnchor);
          bucketDate.setDate(endAnchor.getDate() - (weekIndex * 7));
          const label = bucketDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          if (revenueMap[label] !== undefined) {
            revenueMap[label] += (order.billing?.total || 0);
          }
        }
      });
    } else {
      // Group by days
      for (let i = daysToShow - 1; i >= 0; i--) {
        const d = new Date(endAnchor);
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        revenueMap[label] = 0;
      }
      filteredOrders.forEach(order => {
        const oDate = new Date(order.created_at);
        oDate.setHours(0, 0, 0, 0);
        const label = oDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        if (revenueMap[label] !== undefined) {
          revenueMap[label] += (order.billing?.total || 0);
        }
      });
    }
    
    const revenueData = Object.keys(revenueMap).map(k => ({ name: k, value: revenueMap[k] }));

    // Pie Chart Data
    const statusCounts: Record<string, number> = { Pending: 0, Preparing: 0, 'Out for Delivery': 0, Delivered: 0 };
    filteredOrders.forEach(order => {
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
    const recentOrders = filteredOrders.slice(0, 5).map(order => {
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
    filteredOrders.forEach(order => {
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
          image: matchingMenuItem?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'
        };
      })
      .sort((a, b) => b.rawQty - a.rawQty)
      .slice(0, 5);

    const formatCompactNumber = (num: number) => {
      return new Intl.NumberFormat('en-IN', {
        notation: 'compact',
        maximumFractionDigits: 2
      }).format(num);
    };

    return {
      totalRevenue: `₹ ${formatCompactNumber(totalRevenue)}`,
      totalOrders: formatCompactNumber(totalOrders),
      activeBranches: activeBranchesCount.toString(),
      avgOrderValue: `₹ ${formatCompactNumber(avgOrderValue)}`,
      trends,
      trendLabel,
      revenueData,
      pieData,
      recentOrders,
      topItems,
      rawTotalOrders: totalOrders
    };
  }, [orders, branches, menuItems, timeFilter, customStartDate, customEndDate]);

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
      
      // 1. Export Excel Data with styling using exceljs
      import('exceljs').then(async (ExcelJS) => {
        const workbook = new ExcelJS.Workbook();
        
        // --- Orders Sheet ---
        const wsOrders = workbook.addWorksheet('Recent Orders');
        wsOrders.columns = [
          { header: 'Order ID', key: 'id', width: 15 },
          { header: 'Customer', key: 'customer', width: 25 },
          { header: 'Restaurant', key: 'restaurant', width: 30 },
          { header: 'Amount', key: 'amount', width: 15 },
          { header: 'Status', key: 'status', width: 20 },
          { header: 'Time', key: 'time', width: 15 },
        ];

        // Style the header row
        const headerRow = wsOrders.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B00' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        
        dynamicStats.recentOrders.forEach(o => {
          wsOrders.addRow({
            id: o.id,
            customer: o.customer,
            restaurant: o.restaurant,
            amount: o.amount,
            status: o.status,
            time: o.time
          });
        });

        wsOrders.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            row.alignment = { vertical: 'middle', horizontal: 'left' };
          }
        });

        // --- Top Items Sheet ---
        const wsItems = workbook.addWorksheet('Top Selling Items');
        wsItems.columns = [
          { header: 'Item Name', key: 'name', width: 35 },
          { header: 'Total Orders', key: 'orders', width: 20 },
          { header: 'Total Revenue', key: 'revenue', width: 25 },
        ];

        const headerRowItems = wsItems.getRow(1);
        headerRowItems.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRowItems.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B00' } };
        headerRowItems.alignment = { vertical: 'middle', horizontal: 'left' };
        
        dynamicStats.topItems.forEach(i => {
          wsItems.addRow({
            name: i.name,
            orders: i.rawQty,
            revenue: i.revenue
          });
        });

        // Save using FileSaver
        const buffer = await workbook.xlsx.writeBuffer();
        import('file-saver').then(({ saveAs }) => {
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          saveAs(blob, `DineOS_Dashboard_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
        });
      });

      // 2. Export Professional Native PDF with Vector Charts
      import('jspdf').then(module => {
        const jsPDF = module.default ? module.default : module.jsPDF;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        
        // --- Orange Header Banner ---
        pdf.setFillColor(255, 107, 0); // Brand Orange
        pdf.rect(0, 0, pdfWidth, 45, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(26);
        pdf.setFont("helvetica", "bold");
        pdf.text("DineOS Analytics Report", 15, 24);
        
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Date Range: ${getFilterLabel()}`, 15, 34);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, pdfWidth - 75, 34);

        // --- KPI Summary Section ---
        pdf.setTextColor(26, 31, 54);
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("Executive Summary", 15, 55);

        const cleanCurrency = (val: string) => val.replace('₹', 'Rs.');
        
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Total Revenue: ${cleanCurrency(dynamicStats.totalRevenue)}`, 15, 66);
        pdf.text(`Total Orders: ${dynamicStats.totalOrders}`, 15, 74);
        
        pdf.text(`Active Restaurants: ${dynamicStats.activeBranches}`, 105, 66);
        pdf.text(`Avg Order Value: ${cleanCurrency(dynamicStats.avgOrderValue)}`, 105, 74);
        
        pdf.setDrawColor(232, 236, 244);
        pdf.line(15, 85, pdfWidth - 15, 85);

        // --- Native Vector Charts ---
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("Performance Charts (Data Values)", 15, 100);

        // 1. Draw Native Line Chart (Revenue)
        const lineChartY = 110;
        const lineChartH = 70;
        const lineChartW = pdfWidth - 30;
        
        pdf.setDrawColor(232, 236, 244);
        pdf.setFillColor(250, 251, 253);
        pdf.roundedRect(15, lineChartY, lineChartW, lineChartH, 3, 3, 'FD');
        
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(26, 31, 54);
        pdf.text("Daily Revenue Overview", 20, lineChartY + 8);
        
        const revData = dynamicStats.revenueData;
        if (revData.length > 0) {
          const maxVal = Math.max(...revData.map(d => d.value), 100);
          const chartLeft = 25;
          const chartRight = 10;
          const chartTop = 15;
          const chartBottom = 15;
          const drawW = lineChartW - chartLeft - chartRight;
          const drawH = lineChartH - chartTop - chartBottom;
          
          pdf.setDrawColor(240, 242, 247);
          pdf.line(15 + chartLeft, lineChartY + lineChartH - chartBottom, 15 + lineChartW - chartRight, lineChartY + lineChartH - chartBottom);
          
          const stepX = drawW / Math.max((revData.length - 1), 1);
          
          pdf.setDrawColor(255, 107, 0);
          pdf.setLineWidth(0.8);
          
          let prevPx: number | null = null;
          let prevPy: number | null = null;
          
          revData.forEach((d, i) => {
            const px = 15 + chartLeft + (i * stepX);
            const py = (lineChartY + chartTop + drawH) - ((d.value / maxVal) * drawH);
            
            if (prevPx !== null && prevPy !== null) {
              pdf.line(prevPx, prevPy, px, py);
            }
            
            pdf.setFillColor(255, 107, 0);
            pdf.circle(px, py, 1.5, 'F');
            
            // Value Label
            if (d.value > 0) {
              pdf.setFontSize(7);
              pdf.setTextColor(26, 31, 54);
              pdf.text(`Rs.${d.value}`, px, py - 2.5, { align: 'center' });
            }
            
            // X Axis Label
            if (revData.length <= 14 || i % Math.ceil(revData.length/10) === 0) {
              pdf.setFontSize(7);
              pdf.setTextColor(136, 150, 171);
              pdf.text(d.name, px, lineChartY + lineChartH - chartBottom + 5, { align: 'center' });
            }
            
            prevPx = px;
            prevPy = py;
          });
        }

        // 2. Draw Native Donut Chart (Orders by Status)
        const donutChartY = 190;
        const donutChartH = Math.max(70, dynamicStats.pieData.length * 10 + 20);
        const donutChartW = pdfWidth - 30;
        
        pdf.setDrawColor(232, 236, 244);
        pdf.setFillColor(250, 251, 253);
        pdf.roundedRect(15, donutChartY, donutChartW, donutChartH, 3, 3, 'FD');
        
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(26, 31, 54);
        pdf.text("Orders by Status", 20, donutChartY + 8);
        
        const pieData = dynamicStats.pieData;
        if (pieData.length > 0) {
          const cx = 65;
          const cy = donutChartY + (donutChartH / 2) + 2;
          const radius = 25;
          
          const total = pieData.reduce((sum, d) => sum + d.value, 0) || 1;
          let currentAngle = -Math.PI / 2; // Start at top (12 o'clock)
          
          pieData.forEach((d, idx) => {
            const sliceAngle = (d.value / total) * (Math.PI * 2);
            if (sliceAngle <= 0) return;
            
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;
            
            // Set Color
            const colorHex = PIE_COLORS[idx % PIE_COLORS.length];
            const r = parseInt(colorHex.slice(1,3), 16);
            const g = parseInt(colorHex.slice(3,5), 16);
            const b = parseInt(colorHex.slice(5,7), 16);
            pdf.setFillColor(r, g, b);
            pdf.setDrawColor(255, 255, 255); // White border between slices
            pdf.setLineWidth(0.5);
            
            // Draw Pie Slice using polygon lines
            const lines = [];
            let prevX = cx;
            let prevY = cy;
            const step = 0.05; // radians
            
            for (let a = startAngle; a <= endAngle; a += step) {
              const px = cx + radius * Math.cos(a);
              const py = cy + radius * Math.sin(a);
              lines.push([px - prevX, py - prevY]);
              prevX = px;
              prevY = py;
            }
            
            const endX = cx + radius * Math.cos(endAngle);
            const endY = cy + radius * Math.sin(endAngle);
            lines.push([endX - prevX, endY - prevY]);
            lines.push([cx - endX, cy - endY]); // Back to center
            
            pdf.lines(lines, cx, cy, [1, 1], 'FD', true);
            
            currentAngle = endAngle;
          });
          
          // Cut out the center for Donut effect
          pdf.setFillColor(250, 251, 253); // Same as background
          pdf.circle(cx, cy, radius * 0.65, 'F');
          
          // Draw Legend
          const legendX = cx + 45;
          let legendY = donutChartY + 20;
          
          pieData.forEach((d, idx) => {
            const colorHex = PIE_COLORS[idx % PIE_COLORS.length];
            const r = parseInt(colorHex.slice(1,3), 16);
            const g = parseInt(colorHex.slice(3,5), 16);
            const b = parseInt(colorHex.slice(5,7), 16);
            
            pdf.setFillColor(r, g, b);
            pdf.circle(legendX, legendY, 2.5, 'F');
            
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(26, 31, 54);
            pdf.text(d.name, legendX + 5, legendY + 1.2);
            
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(136, 150, 171);
            pdf.text(`- ${d.value} orders (${d.percentage})`, legendX + 35, legendY + 1.2);
            
            legendY += 8;
          });
        }
        
        pdf.save(`DineOS_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      });

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
              className="flex items-center justify-center gap-2 bg-[#1a1f36] hover:bg-[#2d334a] text-white px-3 sm:px-4 py-[9px] sm:py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50 shrink-0 shadow-sm"
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

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-2">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E8ECF4] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#F0F2F7]">
            <h3 className="text-base sm:text-lg font-black text-[#1a1f36]">Orders Overview</h3>
          </div>
          <div className="p-3 sm:p-5 flex-1 min-h-[250px] sm:min-h-[300px]">
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

        {/* Order Status Pie */}
        <div className="bg-white border border-[#E8ECF4] rounded-2xl shadow-sm overflow-hidden p-4 sm:p-5 flex flex-col relative min-h-[350px] sm:min-h-[380px]">
          <h3 className="text-base sm:text-lg font-black text-[#1a1f36] border-b border-[#F0F2F7] pb-3 sm:pb-0 sm:border-none">Orders by Status</h3>
          <div className="flex-1 flex flex-col items-center justify-center mt-4 sm:mt-2">
            <div className="w-full h-[220px] sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicStats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="85%"
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

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-2">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-[#E8ECF4] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#F0F2F7]">
            <h3 className="text-base sm:text-lg font-black text-[#1a1f36]">Recent Orders</h3>
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
        <div className="bg-white border border-[#E8ECF4] rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#F0F2F7]">
            <h3 className="text-base sm:text-lg font-black text-[#1a1f36]">Top Selling Items</h3>
            <button className="text-[13px] font-bold text-brand-orange-500 hover:text-brand-orange-600 transition-colors bg-brand-orange-50 px-3 py-1.5 rounded-lg">
              View All
            </button>
          </div>
          <div className="p-2 sm:p-3 space-y-1 overflow-y-auto max-h-[350px]">
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
