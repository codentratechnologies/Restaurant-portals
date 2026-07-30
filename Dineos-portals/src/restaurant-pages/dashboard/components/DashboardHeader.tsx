import { useAuth } from '../../../hooks/useAuth';
import { Bell, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardHeader({ isConnected, isManager, setIsManager }: { isConnected: boolean, isManager: boolean, setIsManager: (v: boolean) => void }) {
  const { user, activeAssignment } = useAuth();
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedDay = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  const firstName = (user?.displayName || activeAssignment?.restaurantName || 'User').split(' ')[0];
  const hour = date.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-black text-[#1a1f36] tracking-tight mb-1">
          {greeting}, <span className="text-[#FF6B00]">{firstName}</span>! 👋
        </h1>
        <p className="text-sm font-medium text-[#8896AB]">
          Here's what's happening in your restaurant today.
        </p>
      </div>

    </div>
  );
}
