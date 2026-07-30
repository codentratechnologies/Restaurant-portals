import { IndianRupee, ShoppingBag, XCircle, AlertTriangle } from 'lucide-react';
import KPICard from './KPICard';

interface KPISectionProps {
  isManager: boolean;
  totalRevenue: number;
  totalOrders: number;
  totalRejections: number;
  totalCancellations: number;
  trends?: any;
  pendingOrdersCount?: number;
}

export default function KPISection({ isManager, totalRevenue, totalOrders, totalRejections, totalCancellations }: KPISectionProps) {
  const kpis = [
    { 
      title: "Total Revenue", 
      amount: `₹${totalRevenue.toLocaleString()}`, 
      icon: IndianRupee, 
      colorClass: 'text-emerald-600', 
      bgClass: 'bg-emerald-50', 
      hiddenAmount: 'Hidden' 
    },
    { 
      title: "Total Orders", 
      amount: totalOrders.toString(), 
      icon: ShoppingBag, 
      colorClass: 'text-[#FF6B00]', 
      bgClass: 'bg-[#FFF3E8]', 
      hiddenAmount: totalOrders.toString() 
    },
    { 
      title: 'Rejected Orders', 
      amount: totalRejections.toString(), 
      icon: XCircle, 
      colorClass: 'text-red-500', 
      bgClass: 'bg-red-50', 
      hiddenAmount: totalRejections.toString() 
    },
    { 
      title: 'Canceled Orders', 
      amount: totalCancellations.toString(), 
      icon: AlertTriangle, 
      colorClass: 'text-[#F59E0B]', 
      bgClass: 'bg-[#FEF3C7]', 
      hiddenAmount: totalCancellations.toString() 
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 xl:gap-6">
      {kpis.map((kpi, index) => (
        <KPICard 
          key={kpi.title} 
          {...kpi} 
          delay={0.1 * index} 
          isManager={kpi.title === "Total Revenue" ? isManager : true} 
        />
      ))}
    </div>
  );
}
