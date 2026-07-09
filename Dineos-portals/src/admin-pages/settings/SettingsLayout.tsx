import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Lock, Globe, Database } from 'lucide-react';

export default function SettingsLayout() {
  const tabs = [
    { name: 'Profile Settings', path: 'profile', icon: User, desc: 'Manage your personal account details' },
    { name: 'Roles & Permissions', path: 'roles', icon: Shield, desc: 'Configure access controls for staff' },
    { name: 'Notifications', path: 'notifications', icon: Bell, desc: 'Manage alerts and email preferences' },
    { name: 'Security', path: 'security', icon: Lock, desc: 'Update passwords and 2FA settings' },
    { name: 'Global Settings', path: 'global', icon: Globe, desc: 'Organization-wide configurations' },
    { name: 'Data Management', path: 'data', icon: Database, desc: 'Export data and manage storage' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">Settings</h1>
        <p className="text-text-secondary mt-1 text-base">Manage your personal account details.</p>
      </motion.div>

      <motion.div 
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="bg-white rounded-2xl border border-border shadow-soft p-8">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}
