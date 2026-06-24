import { Clock, MapPin } from 'lucide-react';
import Badge from '../../../components/common/Badge';
import { Link } from 'react-router-dom';

interface RecentOrdersTableProps {
 orders: any[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
 return (
 <div className="border border-border/60 bg-white/80 backdrop-blur-2xl rounded-2xl h-full flex flex-col overflow-hidden shadow-soft">
 <div className="p-5 border-b border-border/50 bg-gray-50/30 flex justify-between items-center">
 <div>
 <h3 className="text-xl font-black text-brand-navy flex items-center gap-2">
 <Clock className="w-5 h-5 text-brand-orange-500" />
 Recent Orders
 </h3>
 <p className="text-xs font-bold text-text-secondary mt-1 uppercase tracking-widest">Real-time Command Center</p>
 </div>
 <Link to="/orders/list" className="text-brand-orange-600 text-sm font-bold hover:text-brand-orange-700 bg-brand-orange-50 px-4 py-2 rounded-xl transition-colors">
 View All Orders
 </Link>
 </div>

 <div className="flex-1 overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[800px]">
 <thead>
 <tr className="border-b border-border/50 bg-white">
 <th className="py-4 px-6 text-xs font-black text-text-secondary uppercase tracking-widest bg-gray-50/50">Order ID & Time</th>
 <th className="py-4 px-6 text-xs font-black text-text-secondary uppercase tracking-widest bg-gray-50/50">Food Items Summary</th>
 <th className="py-4 px-6 text-xs font-black text-text-secondary uppercase tracking-widest bg-gray-50/50 text-right">Total Value</th>
 <th className="py-4 px-6 text-xs font-black text-text-secondary uppercase tracking-widest bg-gray-50/50 text-center">Payment</th>
 <th className="py-4 px-6 text-xs font-black text-text-secondary uppercase tracking-widest bg-gray-50/50 text-center">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/50">
 {orders.map((order, i) => (
 <tr key={i} className="hover:bg-gray-50 transition-colors cursor-pointer group">
 <td className="py-4 px-6 whitespace-nowrap">
 <span className="font-black text-brand-navy group-hover:text-brand-orange-600 transition-colors text-base">{order.id}</span>
 <div className="text-xs font-bold text-text-secondary mt-1">{order.time}</div>
 </td>
 <td className="py-4 px-6">
 <p className="font-bold text-brand-navy line-clamp-1">{order.items}</p>
 </td>
 <td className="py-4 px-6 font-black text-brand-navy whitespace-nowrap text-base text-right">
 {order.amount}
 </td>
 <td className="py-4 px-6 whitespace-nowrap text-center">
 <span className={`inline-flex items-center justify-center text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${
 order.method === 'Online' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-purple-50 text-purple-700 border border-purple-100'
 }`}>
 {order.method}
 </span>
 </td>
 <td className="py-4 px-6 whitespace-nowrap text-center">
 <Badge variant={
 order.status === 'Delivered' ? 'success' :
 order.status === 'Pending' ? 'warning' :
 order.status === 'Cancelled' ? 'error' : 
 order.status === 'Rejected' ? 'error' : 'default'
 } className="font-black shadow-sm px-3 py-1.5 uppercase tracking-wider text-[10px] inline-flex">
 {order.status}
 </Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}

