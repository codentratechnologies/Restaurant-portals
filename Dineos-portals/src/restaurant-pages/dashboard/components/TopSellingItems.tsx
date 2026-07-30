interface TopSellingItemsProps {
  items: any[];
}

export default function TopSellingItems({ items }: TopSellingItemsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8ECF4] h-full flex flex-col p-6">
      <h3 className="text-[17px] font-black text-[#1a1f36] mb-6">Top Selling Items</h3>

      <div className="flex-1 flex flex-col gap-5 justify-center">
        {items.map((item) => (
          <div key={item.rank} className="flex items-center gap-4">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-[42px] h-[42px] rounded-full object-cover shadow-sm ring-1 ring-border" 
            />
            
            <span className="text-[13px] font-bold text-[#1a1f36] w-[110px] truncate leading-tight">
              {item.name}
            </span>
            
            <div className="flex-1 h-2 bg-[#F4F6FA] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6B00] rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            
            <span className="text-[13px] font-bold text-[#8896AB] w-16 text-right">
              <strong className="text-[#1a1f36]">{item.orders}</strong> plates
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
