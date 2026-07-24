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
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col border-r border-[#E8ECF4] font-sans bg-white"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[#E8ECF4]">
        <img src="/logo.png" alt="DineOS Logo" className="h-8 w-auto object-contain" />
        <div className="mt-1">
          <div className="text-brand-orange-500 text-[10px] font-bold uppercase tracking-wider">Super Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-brand-orange-500 text-white shadow-md shadow-brand-orange-500/20'
                  : 'text-gray-500 hover:bg-orange-50 hover:text-brand-orange-600'
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
      <div className="px-4 py-4 border-t border-[#E8ECF4]">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-brand-orange-500/10 text-brand-orange-600 flex items-center justify-center text-xs font-bold">
            {user?.email?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{user?.email}</p>
            <p className="text-[10px] text-gray-500">Super Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
