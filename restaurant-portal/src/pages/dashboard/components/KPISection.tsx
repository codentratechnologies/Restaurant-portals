import { DollarSign, ShoppingBag, XCircle, AlertTriangle } from 'lucide-react';
import KPICard from './KPICard';

interface KPISectionProps {
  isManager: boolean;
  totalRevenue: number;
  totalOrders: number;
  totalRejections: number;
  totalCancellations: number;
}

export default function KPISection({ isManager, totalRevenue, totalOrders, totalRejections, totalCancellations }: KPISectionProps) {
  const kpis = [
    { title: 'Revenue', amount: `₹${totalRevenue.toLocaleString()}`, trend: '+12.5%', isUp: true, icon: DollarSign, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-100', hiddenAmount: 'Hidden' },
    { title: 'Orders', amount: totalOrders.toString(), trend: '+8.3%', isUp: true, icon: ShoppingBag, colorClass: 'text-blue-600', bgClass: 'bg-blue-100', hiddenAmount: totalOrders.toString() },
    { title: 'Rejections', amount: totalRejections.toString(), trend: '2.3%', isUp: false, icon: XCircle, colorClass: 'text-red-600', bgClass: 'bg-red-100', hiddenAmount: totalRejections.toString() },
    { title: 'Cancellations', amount: totalCancellations.toString(), trend: '0.6%', isUp: false, icon: AlertTriangle, colorClass: 'text-orange-600', bgClass: 'bg-orange-100', hiddenAmount: totalCancellations.toString() },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 mb-8">
      {kpis.map((kpi, index) => (
        <KPICard 
          key={kpi.title} 
          {...kpi} 
          delay={0.1 * index} 
          isManager={kpi.title === 'Revenue' ? isManager : true} 
        />
      ))}
    </div>
  );
}
