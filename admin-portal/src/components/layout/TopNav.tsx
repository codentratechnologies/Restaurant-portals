import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Search, LogOut, ChevronDown, ChefHat } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">

        {/* LEFT: Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/DineOS.png" alt="DineOS Logo" className="h-14 w-auto object-contain mix-blend-multiply ml-3" />
          </Link>

          {/* CENTER: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors",
                    isActive ? "text-brand-orange-600" : "text-text-secondary hover:text-text-primary"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-underline"
                        className="absolute bottom-[-16px] left-0 right-0 h-[2px] bg-brand-orange-600"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
              className="pl-9 pr-4 py-2 w-64 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 focus:bg-white transition-all placeholder:text-text-secondary/60"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-white px-1.5 font-mono text-[10px] font-medium text-text-secondary opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

            {/* Dropdown Results */}
            <AnimatePresence>
              {isDropdownOpen && searchQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50 max-h-96 overflow-y-auto"
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

          {/* Profile Link */}
          <Link to="/profile" className="flex items-center hover:bg-gray-50 p-1 rounded-full transition-colors border border-transparent hover:border-border">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=f5f7fa"
              alt="Profile"
              className="w-8 h-8 rounded-full border border-border bg-background object-cover"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
