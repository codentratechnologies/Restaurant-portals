import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Store, Users, Utensils, Ticket, ShoppingBag, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useRoleAccess } from '../../hooks/useRoleAccess';

const sidebarItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Branch', path: '/admin/branches', icon: Store },
  { name: 'Employee', path: '/admin/employees', icon: Users },
  { name: 'Menu', path: '/admin/food', icon: Utensils },
  { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
];

export default function Sidebar() {
  const { user } = useAuth();
  const { role } = useRoleAccess();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "bg-white border-r border-[#E8ECF4] flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 overflow-x-hidden",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header: Logo & Toggle */}
      <div className={cn("h-16 flex items-center shrink-0 pt-2", isCollapsed ? "justify-center px-0" : "justify-between px-4")}>
        {!isCollapsed ? (
          <>
            <Link to="/admin/dashboard" className="flex items-center overflow-hidden">
              <img src="/logo.png" alt="DineOS Logo" className="h-9 w-auto object-contain origin-left" />
            </Link>
            <button 
              onClick={() => setIsCollapsed(true)} 
              className="p-1.5 text-[#8896AB] hover:text-[#1a1f36] rounded-xl hover:bg-[#F4F6FA] transition-colors shrink-0"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="relative flex items-center justify-center w-12 h-12 group cursor-pointer">
            <Link to="/admin/dashboard" className="flex items-center justify-center w-full h-full group-hover:opacity-0 transition-opacity duration-200">
              <img src="/logo_square.png" alt="DineOS Logo" className="h-9 w-9 object-contain" />
            </Link>
            <button 
              onClick={() => setIsCollapsed(false)} 
              className="absolute inset-0 m-auto flex items-center justify-center text-[#8896AB] hover:text-[#1a1f36] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl hover:bg-[#F4F6FA] w-10 h-10"
              title="Expand Sidebar"
            >
              <PanelLeft className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={cn("flex-1 overflow-y-auto py-6 space-y-1", isCollapsed ? "px-2" : "px-4")}>
        {!isCollapsed && <div className="text-xs font-bold text-[#8896AB] uppercase tracking-wider mb-4 px-2">Main Menu</div>}
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.name : undefined}
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-xl font-bold transition-all duration-200 group relative",
                isCollapsed ? "justify-center p-3 text-sm" : "gap-3 px-3 py-2.5 text-[15px]",
                isActive
                  ? "bg-[#FFF3E8] text-[#FF6B00]"
                  : "text-[#8896AB] hover:bg-[#F4F6FA] hover:text-[#1a1f36]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "transition-colors shrink-0",
                    isCollapsed ? "w-6 h-6" : "w-5 h-5",
                    isActive ? "text-[#FF6B00]" : "text-[#8896AB] group-hover:text-[#1a1f36]"
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
                

              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile Section at Bottom */}
      <div className={cn("border-t border-[#E8ECF4] shrink-0 transition-all", isCollapsed ? "p-3" : "p-4")}>
        <Link to="/admin/profile" className={cn("flex items-center rounded-xl hover:bg-[#F4F6FA] transition-colors", isCollapsed ? "justify-center p-1.5" : "gap-3 p-2")}>
          <div className={cn("rounded-full bg-[#FFF3E8] text-[#FF6B00] border border-[#FF6B00]/20 flex items-center justify-center font-black shrink-0", isCollapsed ? "w-10 h-10 text-lg" : "w-10 h-10 text-lg")}>
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#1a1f36] truncate leading-tight">
                {role ? role.replace(/_/g, ' ') : 'Admin'}
              </span>
              <span className="text-[11px] font-semibold text-[#8896AB] truncate">{role || 'Super Admin'}</span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
