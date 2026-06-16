import { motion } from 'framer-motion';
import { Bell, ChevronDown, MapPin, Activity, User, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardHeader({ isConnected, isManager, setIsManager }: { isConnected: boolean, isManager: boolean, setIsManager: (v: boolean) => void }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-black text-brand-navy tracking-tight mb-1">Branch Operations Analytics</h1>

      </div>

    </div>
  );
}
