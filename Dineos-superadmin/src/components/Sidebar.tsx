import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Store, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/restaurants', icon: Store, label: 'Restaurants' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col border-r border-white/10 font-sans"
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-brand-purple-500/30 border border-brand-purple-400/30 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-brand-purple-400" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">DineOS</div>
          <div className="text-brand-purple-400 text-xs font-medium">Super Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-brand-purple-500/20 text-white border border-brand-purple-500/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-lg bg-brand-purple-500/30 border border-brand-purple-400/20 flex items-center justify-center text-xs font-bold text-brand-purple-300">
            {user?.email?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.email}</p>
            <p className="text-[10px] text-white/40">Super Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
