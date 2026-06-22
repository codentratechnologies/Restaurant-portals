import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Search, LogOut, ChevronDown, ChefHat, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Branches', path: '/branches' },
  { name: 'Employees', path: '/employees' },
  { name: 'Menu', path: '/food' },
  { name: 'Coupons & Promotions', path: '/coupons' },
  { name: 'Orders', path: '/orders' },
];

const searchRoutes = [
  { name: 'Dashboard', path: '/dashboard', type: 'Page' },
  { name: 'Branches List', path: '/branches', type: 'Page' },
  { name: 'Create Branch', path: '/branches/new', type: 'Action' },
  { name: 'Employees List', path: '/employees', type: 'Page' },
  { name: 'Create Employee', path: '/employees/new', type: 'Action' },
  { name: 'Menu Catalog', path: '/food', type: 'Page' },
  { name: 'Create Menu Item', path: '/food/new', type: 'Action' },
  { name: 'Coupons & Promotions', path: '/coupons', type: 'Page' },
  { name: 'Create Coupon', path: '/coupons/new', type: 'Action' },
  { name: 'Orders Calendar', path: '/orders', type: 'Page' },
  { name: 'Orders List', path: '/orders/list', type: 'Page' },
  { name: 'Profile Settings', path: '/settings/profile', type: 'Settings' },
];

export default function TopNav() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResults = searchRoutes.filter(route => 
    route.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResultClick = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-2xl border-b border-border/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">

        {/* LEFT: Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="DineOS Logo" className="h-16 w-auto object-contain scale-125 origin-left ml-4" />
          </Link>

          {/* CENTER: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "relative px-4 py-2 text-sm font-bold transition-colors z-10",
                    isActive ? "text-brand-orange-700" : "text-text-secondary hover:text-brand-navy"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-brand-orange-50 rounded-xl border border-brand-orange-100/50 shadow-sm"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-5">
          <div ref={searchContainerRef} className="hidden lg:flex items-center relative group">
            <Search className="w-4 h-4 absolute left-3 text-text-secondary group-focus-within:text-brand-orange-600 transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="pl-10 pr-4 py-2.5 w-72 bg-gray-50/50 border border-border/60 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 focus:bg-white transition-all shadow-sm placeholder:text-text-secondary/60 placeholder:font-medium"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border/60 bg-white/50 px-1.5 font-mono text-[10px] font-bold text-text-secondary shadow-sm">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

            {/* Dropdown Results */}
            <AnimatePresence>
              {isDropdownOpen && searchQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-border/60 overflow-hidden z-50 max-h-96 overflow-y-auto"
                >
                  {filteredResults.length > 0 ? (
                    <div className="py-2">
                      {filteredResults.map((result, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleResultClick(result.path)}
                          className="w-full text-left px-4 py-2.5 hover:bg-brand-orange-50 focus:bg-brand-orange-50 focus:outline-none transition-colors group flex flex-col"
                        >
                          <span className="text-sm font-semibold text-text-primary group-hover:text-brand-orange-700">
                            {result.name}
                          </span>
                          <span className="text-xs text-text-secondary group-hover:text-brand-orange-600/70">
                            {result.type} • {result.path}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-text-secondary">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>



          <div className="h-8 w-px bg-border"></div>

          {/* Notifications */}
          <button className="p-2.5 text-text-secondary hover:text-brand-navy hover:bg-gray-50 rounded-xl transition-all relative group" title="Notifications">
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-brand-orange-500 rounded-full border-2 border-white animate-pulse" />
          </button>

          {/* Profile Link */}
          <Link to="/settings/profile" className="flex items-center hover:bg-gray-50 p-1.5 rounded-full transition-colors border border-transparent hover:border-border group">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=f5f7fa"
              alt="Profile"
              className="w-8 h-8 rounded-full border border-border bg-background object-cover group-hover:border-brand-orange-300 transition-colors"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
