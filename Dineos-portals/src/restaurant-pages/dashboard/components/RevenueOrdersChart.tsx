import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { ChevronDown, BarChart2 } from 'lucide-react';

interface RevenueChartProps {
  data: any[];
  isManager: boolean;
  onExportCSV?: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8ECF4] rounded-xl p-3 shadow-lg">
      <p className="text-[11px] font-bold text-[#8896AB] uppercase tracking-wider mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[13px] font-black text-[#1a1f36]">
            {p.name === 'Revenue' || p.name === 'revenue' ? (p.value >= 1000 ? `₹${(p.value / 1000).toFixed(1)}k` : `₹${p.value}`) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RevenueOrdersChart({ data, isManager }: RevenueChartProps) {
  if (!isManager) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8ECF4] h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-[#F4F6FA] rounded-full flex items-center justify-center mb-4">
          <BarChart2 className="w-8 h-8 text-[#8896AB]" />
        </div>
        <h3 className="text-[17px] font-black text-[#1a1f36] mb-1">Analytics Restricted</h3>
        <p className="text-sm font-semibold text-[#8896AB] max-w-xs">You do not have permission to view revenue analytics.</p>
      </div>
    );
  }

  // Ensure data points match the image (12 AM to 12 AM) if we don't have enough data
  // For visual mockup matching, we will format XAxis ticks nicely.

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8ECF4] h-full overflow-hidden flex flex-col">
      <div className="p-6 pb-2 flex items-center justify-between">
        <h3 className="text-[17px] font-black text-[#1a1f36]">Revenue Overview</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-[#E8ECF4] rounded-xl text-sm font-bold text-[#1a1f36] hover:bg-gray-50 transition-colors">
          Today
          <ChevronDown className="w-4 h-4 text-[#8896AB]" />
        </button>
      </div>

      <div className="flex-1 p-6 pt-0 w-full relative min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gRevenueMock" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F7" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#8896AB', fontSize: 11, fontWeight: 700 }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#8896AB', fontSize: 11, fontWeight: 700 }} 
              tickFormatter={(val) => val >= 1000 ? `₹${(val/1000).toFixed(1)}K` : `₹${val}`} 
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FF6B00', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <Area 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue" 
              stroke="#FF6B00" 
              strokeWidth={3} 
              fill="url(#gRevenueMock)" 
              activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff', fill: '#FF6B00' }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
