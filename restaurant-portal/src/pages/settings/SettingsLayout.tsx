import { Outlet, NavLink } from 'react-router-dom';
import { User, Shield, Bell, Lock, Globe, Database } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export default function SettingsLayout() {
  const tabs = [
    { name: 'Profile Settings', path: '/settings/profile', icon: User, desc: 'Manage your personal account details' },
    { name: 'Roles & Permissions', path: '/settings/roles', icon: Shield, desc: 'Configure access controls for staff' },
    { name: 'Notifications', path: '/settings/notifications', icon: Bell, desc: 'Manage alerts and email preferences' },
    { name: 'Security', path: '/settings/security', icon: Lock, desc: 'Update passwords and 2FA settings' },
    { name: 'Global Settings', path: '/settings/global', icon: Globe, desc: 'Organization-wide configurations' },
    { name: 'Data Management', path: '/settings/data', icon: Database, desc: 'Export data and manage storage' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">Settings</h1>
        <p className="text-text-secondary mt-1 text-base">Manage your organization preferences and platform configurations.</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <motion.div 
          className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-border p-2 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <NavLink
                key={tab.name}
                to={tab.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group whitespace-nowrap",
                    isActive
                      ? "bg-brand-orange-50 border border-brand-orange-500/20 shadow-sm"
                      : "hover:bg-gray-50 border border-transparent"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      isActive ? "bg-white text-brand-orange-600 shadow-sm" : "bg-gray-100 text-text-secondary group-hover:bg-white group-hover:shadow-sm"
                    )}>
                      <tab.icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className={cn(
                        "text-sm font-semibold transition-colors",
                        isActive ? "text-brand-orange-600" : "text-text-primary"
                      )}>{tab.name}</span>
                      <span className="text-[11px] text-text-secondary mt-0.5 hidden lg:block">{tab.desc}</span>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </motion.div>
        
        <motion.div 
          className="flex-1 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl border border-border shadow-soft p-8">
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
