import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, Bar } from 'recharts';
import { Download, RefreshCw, BarChart2 } from 'lucide-react';
import { useState } from 'react';

interface RevenueOrdersChartProps {
 data: any[];
 isManager: boolean;
 onExportCSV: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #E8ECF4', borderRadius: 16, padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#8896AB', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1f36' }}>
            {p.name === 'Revenue' || p.name === 'revenue' ? `₹${(p.value / 1000).toFixed(1)}k` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RevenueOrdersChart({ data, isManager, onExportCSV }: RevenueOrdersChartProps) {
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
          <button 
            onClick={onExportCSV}
            className="flex items-center gap-2 bg-white border border-border/80 px-4 py-2 rounded-xl text-sm font-bold text-brand-navy hover:bg-gray-50 hover:shadow-sm transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="p-6 h-[400px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gBarRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity={1} />
                <stop offset="100%" stopColor="#FF9A4D" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F0F2F7" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8896AB', fontSize: 12, fontWeight: 600 }} dy={10} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#8896AB', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `₹${val/1000}k`} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#8896AB', fontSize: 12, fontWeight: 600 }} />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F6FA', radius: 8 }} />
            
            <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="url(#gBarRevenue)" radius={[8, 8, 0, 0]} maxBarSize={40} />
            <Bar yAxisId="right" dataKey="orders" name="Orders Volume" fill="#1a1f36" radius={[8, 8, 0, 0]} maxBarSize={40} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
