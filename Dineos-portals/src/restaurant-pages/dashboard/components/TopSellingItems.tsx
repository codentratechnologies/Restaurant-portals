import { Award } from 'lucide-react';

interface TopSellingItemsProps {
 items: any[];
}

export default function TopSellingItems({ items }: TopSellingItemsProps) {
 return (
 <div className="border border-border/60 bg-white/80 backdrop-blur-2xl rounded-2xl h-full flex flex-col overflow-hidden shadow-soft">
 <div className="p-5 border-b border-border/50 bg-gray-50/30">
 <h3 className="text-xl font-black text-brand-navy flex items-center gap-2">
 <Award className="w-5 h-5 text-brand-orange-500" />
 Top Selling Items
 </h3>
 <p className="text-xs font-bold text-text-secondary mt-1 uppercase tracking-widest">Ranked by Sales Volume</p>
 </div>

 <div className="flex-1 p-5 space-y-5 overflow-y-auto max-h-[400px]">
 {items.map((item) => (
 <div key={item.rank} className="group relative flex items-center gap-4">
 <div className="relative">
 <img src={item.image} alt={item.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-1 ring-border" />
 <div className="absolute -top-2 -left-2 w-6 h-6 bg-brand-navy text-white rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-white">
 {item.rank}
 </div>
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-start mb-1">
 <h4 className="font-bold text-brand-navy truncate">{item.name}</h4>
 <span className="font-black text-brand-navy ml-2">{item.revenue}</span>
 </div>

 <div className="flex justify-between items-center mb-2">
 <div className="flex items-center gap-2">
 <span className="bg-gray-100 text-text-secondary text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">{item.category}</span>
 <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">{item.orders} Units</span>
 </div>
 <span className={`text-[11px] font-black ${item.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{item.trend}</span>
 </div>

 <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
 <div
 className="h-full bg-brand-orange-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
 style={{ width: `${item.progress}%` }}
 >
 <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
