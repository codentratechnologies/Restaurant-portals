import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const PIE_COLORS = ['#EF4444', '#7C3AED', '#EAB308', '#22C55E', '#8896AB'];

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

export default function DashboardCharts({ revenueData, pieData }: { revenueData: any[], pieData: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-2">
      {/* Revenue Chart */}
      <div className="lg:col-span-2 bg-white border border-[#E8ECF4] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#F0F2F7]">
          <h3 className="text-base sm:text-lg font-black text-[#1a1f36]">Orders Overview</h3>
        </div>
        <div className="p-3 sm:p-5 flex-1 min-h-[250px] sm:min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
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
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="85%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
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
  );
}
