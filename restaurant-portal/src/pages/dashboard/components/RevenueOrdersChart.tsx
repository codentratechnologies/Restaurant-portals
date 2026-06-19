import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from 'recharts';
import { Download, RefreshCw, BarChart2 } from 'lucide-react';
import { useState } from 'react';

interface RevenueOrdersChartProps {
 data: any[];
 isManager: boolean;
}

export default function RevenueOrdersChart({ data, isManager }: RevenueOrdersChartProps) {
 const [isRefreshing, setIsRefreshing] = useState(false);

 const handleRefresh = () => {
 setIsRefreshing(true);
 setTimeout(() => setIsRefreshing(false), 800);
 };

 if (!isManager) {
 return (
 <div className="p-8 border border-border/60 bg-white/50 backdrop-blur-xl rounded-2xl h-full flex flex-col items-center justify-center text-center">
 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
 <BarChart2 className="w-8 h-8 text-gray-400" />
 </div>
 <h3 className="text-lg font-black text-brand-navy mb-1">Analytics Restricted</h3>
 <p className="text-sm font-bold text-text-secondary max-w-xs">You do not have permission to view revenue and volume analytics.</p>
 </div>
 );
 }

 return (
 <div className="border border-border/60 bg-white/80 backdrop-blur-2xl rounded-2xl h-full flex flex-col overflow-hidden shadow-soft">
 <div className="p-5 border-b border-border/50 bg-gray-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
 <div>
 <h3 className="text-xl font-black text-brand-navy">Revenue & Order Volume Trends</h3>
 <p className="text-xs font-bold text-text-secondary mt-1 uppercase tracking-widest">Dual Axis Analysis</p>
 </div>
 <div className="flex items-center gap-2">
 <button 
 onClick={handleRefresh}
 className={`p-2 rounded-xl text-text-secondary hover:bg-gray-200 hover:text-brand-navy transition-all ${isRefreshing ? 'animate-spin text-brand-orange-500' : ''}`}
 >
 <RefreshCw className="w-4 h-4" />
 </button>
 <button className="flex items-center gap-2 bg-white border border-border/80 px-4 py-2 rounded-xl text-sm font-bold text-brand-navy hover:bg-gray-50 hover:shadow-sm transition-all shadow-sm">
 <Download className="w-4 h-4" />
 Export CSV
 </button>
 </div>
 </div>

 <div className="p-6 h-[400px] w-full relative">
 <ResponsiveContainer width="100%" height="100%">
 <ComposedChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
 <defs>
 <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
 <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }} dy={10} />
 <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#10B981', fontSize: 12, fontWeight: 700 }} tickFormatter={(val) => `₹${val/1000}k`} />
 <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#3B82F6', fontSize: 12, fontWeight: 700 }} />
 
 <Tooltip
 contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px', backgroundColor: '#ffffff' }}
 itemStyle={{ fontWeight: 900, fontSize: '14px' }}
 labelStyle={{ color: '#64748B', fontSize: '12px', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
 />
 
 <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 3 }} />
 <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders Volume" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 3 }} />
 </ComposedChart>
 </ResponsiveContainer>
 </div>
 </div>
 );
}
