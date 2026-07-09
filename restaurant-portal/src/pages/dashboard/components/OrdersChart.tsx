import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { BarChart2 } from 'lucide-react';

interface OrdersChartProps {
  data: any[];
  isManager: boolean;
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
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function OrdersChart({ data, isManager }: OrdersChartProps) {
  if (!isManager) {
    return (
      <div className="p-8 border border-border/60 bg-white/50 backdrop-blur-xl rounded-2xl h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <BarChart2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-black text-brand-navy mb-1">Analytics Restricted</h3>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 overflow-hidden h-full hover:shadow-floating hover:-translate-y-1 transition-all duration-300">
      <div className="p-5 sm:p-6 border-b border-[#F0F2F7]">
        <h3 className="text-base font-black text-[#1a1f36]">Orders Volume</h3>
        <p className="text-sm text-[#8896AB] font-medium mt-0.5">Daily count this period</p>
      </div>
      <div className="p-6 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barSize={20}>
            <defs>
              <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity={1} />
                <stop offset="100%" stopColor="#FF9A4D" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F0F2F7" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8896AB', fontSize: 12, fontWeight: 600 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8896AB', fontSize: 12, fontWeight: 600 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F6FA', radius: 8 }} />
            <Bar dataKey="orders" fill="url(#gBar)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
