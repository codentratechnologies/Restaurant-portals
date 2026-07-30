import { Hourglass, UtensilsCrossed, ConciergeBell, Bike } from 'lucide-react';

interface LiveOrderStatusProps {
  pending: number;
  preparing: number;
  ready: number;
  delivered: number;
}

export default function LiveOrderStatus({ pending, preparing, ready, delivered }: LiveOrderStatusProps) {
  const statuses = [
    {
      label: 'Pending',
      count: pending,
      icon: Hourglass,
      color: 'text-[#FF6B00]',
      bg: 'bg-[#FFF3E8]',
      dot: 'bg-[#FF6B00]'
    },
    {
      label: 'Preparing',
      count: preparing,
      icon: UtensilsCrossed,
      color: 'text-[#F59E0B]',
      bg: 'bg-[#FEF3C7]',
      dot: 'bg-[#F59E0B]'
    },
    {
      label: 'Ready',
      count: ready,
      icon: ConciergeBell,
      color: 'text-[#10B981]',
      bg: 'bg-[#D1FAE5]',
      dot: 'bg-[#10B981]'
    },
    {
      label: 'Delivered',
      count: delivered,
      icon: Bike,
      color: 'text-[#3B82F6]',
      bg: 'bg-[#DBEAFE]',
      dot: 'bg-[#3B82F6]'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8ECF4] h-full overflow-hidden flex flex-col">
      <div className="p-6 pb-4">
        <h3 className="text-[17px] font-black text-[#1a1f36]">Live Order Status</h3>
      </div>
      <div className="px-6 pb-6 flex-1 flex flex-col justify-center gap-4">
        {statuses.map((status, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.bg}`}>
                <status.icon className={`w-5 h-5 ${status.color}`} />
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                <span className="text-[15px] font-bold text-[#1a1f36]">{status.label}</span>
              </div>
            </div>
            <span className={`text-[17px] font-black ${status.color}`}>
              {status.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
