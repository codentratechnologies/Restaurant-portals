import { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import LogoutModal from '../common/LogoutModal';
import { LayoutDashboard, Store, Users, Utensils, Ticket, ShoppingBag, PanelLeftClose, PanelLeft, Star, Headphones, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useRoleAccess } from '../../hooks/useRoleAccess';

const adminSidebarItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Branch', path: '/admin/branches', icon: Store },
  { name: 'Employee', path: '/admin/employees', icon: Users },
  { name: 'Menu', path: '/admin/food', icon: Utensils },
  { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Support', path: '/admin/support', icon: Headphones },
];

const restaurantSidebarItems = [
  { name: 'Dashboard', path: '/restaurant/dashboard', icon: LayoutDashboard },
  { name: 'Menu', path: '/restaurant/food', icon: Utensils },
  { name: 'Orders', path: '/restaurant/orders', icon: ShoppingBag },
  { name: 'Reviews', path: '/restaurant/reviews', icon: Star },
  { name: 'Support', path: '/restaurant/support', icon: Headphones },
];

interface SidebarProps {
  onMobileClose?: () => void;
}

export default function Sidebar({ onMobileClose }: SidebarProps = {}) {
  const { user, activeAssignment, userData } = useAuth();
  const { role } = useRoleAccess();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  
  // Use location to determine the correct prefix and items
  const location = window.location.pathname;
  const isRestaurant = location.startsWith('/restaurant');
  const sidebarItems = isRestaurant ? restaurantSidebarItems : adminSidebarItems;
  const prefix = isRestaurant ? '/restaurant' : '/admin';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isCollapsed) return;
      
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        // Check if it's a mobile click on a hamburger menu that might also trigger this
        // but typically the hamburger is outside the sidebar. Let's just collapse it.
        setIsCollapsed(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCollapsed]);

  return (
    <aside ref={sidebarRef} className={cn(
      "bg-white border-r border-[#E8ECF4] flex flex-col h-[100dvh] sticky top-0 shrink-0 transition-all duration-300 overflow-x-hidden",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header: Logo & Toggle */}
      <div className={cn("h-16 flex items-center shrink-0 pt-2", isCollapsed ? "justify-center px-0" : "justify-between px-4")}>
        {!isCollapsed ? (
          <>
            <Link to={`${prefix}/dashboard`} onClick={onMobileClose} className="flex items-center overflow-hidden">
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
          <div className="relative flex items-center justify-center w-16 h-16 group cursor-pointer">
            <Link to={`${prefix}/dashboard`} onClick={onMobileClose} className="flex items-center justify-center w-full h-full group-hover:opacity-0 transition-opacity duration-200">
              <img src="/logo_square.png" alt="DineOS Logo" className="h-14 w-14 object-contain" />
            </Link>
            <button 
              onClick={() => setIsCollapsed(false)} 
              className="absolute inset-0 m-auto flex items-center justify-center text-[#8896AB] hover:text-[#1a1f36] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl hover:bg-[#F4F6FA] w-12 h-12"
              title="Expand Sidebar"
            >
              <PanelLeft className="w-7 h-7" />
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
            onClick={() => {
              if (onMobileClose) onMobileClose();
              if (isCollapsed) setIsCollapsed(false);
            }}
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
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between gap-1")}>
          <Link to={`${prefix}/profile`} onClick={onMobileClose} className={cn("flex items-center rounded-xl hover:bg-[#F4F6FA] transition-colors flex-1 min-w-0", isCollapsed ? "justify-center p-1.5" : "gap-3 p-2")}>
            <div className={cn("rounded-full bg-[#FFF3E8] text-[#FF6B00] border border-[#FF6B00]/20 flex items-center justify-center font-black shrink-0 overflow-hidden", isCollapsed ? "w-10 h-10 text-lg" : "w-10 h-10 text-lg")}>
              {activeAssignment?.logoUrl ? (
                <img src={activeAssignment.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                (activeAssignment?.restaurantName || userData?.name || user?.displayName || 'A').charAt(0).toUpperCase()
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-[13px] font-bold text-[#1a1f36] truncate leading-tight">
                  {activeAssignment?.restaurantName || userData?.name || user?.displayName || 'User Name'}
                </span>
                <span className="text-[11px] font-semibold text-[#8896AB] truncate">
                  {role ? role.replace(/_/g, ' ') : 'Admin'}
                </span>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <button 
              onClick={() => setIsLogoutOpen(true)}
              className="p-2 text-[#8896AB] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
    </aside>
  );
}
