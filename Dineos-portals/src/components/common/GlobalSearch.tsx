import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoleAccess } from '../../hooks/useRoleAccess';

const searchRoutes = [
  { name: 'Dashboard', path: '/dashboard', type: 'Page' },
  { name: 'Branches List', path: '/branches', type: 'Page' },
  { name: 'Create Branch', path: '/branches/new', type: 'Action' },
  { name: 'Employees List', path: '/employees', type: 'Page' },
  { name: 'Create Employee', path: '/employees/new', type: 'Action' },
  { name: 'Menu Catalog', path: '/food', type: 'Page' },
  { name: 'Create Menu Item', path: '/food/new', type: 'Action' },
  { name: 'Coupons & Promotions', path: '/coupons', type: 'Page', adminOnly: true },
  { name: 'Create Coupon', path: '/coupons/new', type: 'Action', adminOnly: true },
  { name: 'Orders Calendar', path: '/orders', type: 'Page' },
  { name: 'Orders List', path: '/orders/list', type: 'Page' },
  { name: 'Reviews', path: '/reviews', type: 'Page', restaurantOnly: true },
  { name: 'Support', path: '/support', type: 'Page', restaurantOnly: true },
  { name: 'Profile Settings', path: '/settings/profile', type: 'Settings' },
];

export default function GlobalSearch({ variant = 'nav', onSearchComplete }: { variant?: 'nav' | 'dashboard' | 'mobile', onSearchComplete?: () => void }) {
  const navigate = useNavigate();
  const { isAdmin } = useRoleAccess();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const prefix = isAdmin ? '/admin' : '/restaurant';

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

  const filteredResults = searchRoutes.filter(route => {
    if (route.adminOnly && !isAdmin) return false;
    if (route.restaurantOnly && isAdmin) return false;
    return route.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleResultClick = (path: string) => {
    navigate(`${prefix}${path}`);
    setIsDropdownOpen(false);
    setSearchQuery('');
    if (onSearchComplete) {
      onSearchComplete();
    }
  };

  if (variant === 'mobile') {
    return (
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="Search anything..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-border/60 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500"
        />
        {searchQuery.length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto">
            {filteredResults.length > 0 ? (
              filteredResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleResultClick(result.path)}
                  className="w-full text-left px-3 py-2 hover:bg-brand-orange-50 rounded-lg text-sm mb-1"
                >
                  <span className="font-semibold block">{result.name}</span>
                  <span className="text-xs text-text-secondary">{result.type}</span>
                </button>
              ))
            ) : (
              <div className="text-sm text-text-secondary text-center py-2">No results</div>
            )}
          </div>
        )}
      </div>
    );
  }

  const isDashboard = variant === 'dashboard';

  return (
    <div ref={searchContainerRef} className={isDashboard ? "flex-1 w-full relative" : "flex-1 sm:flex-none flex items-center relative group w-full sm:w-64 md:w-80 lg:w-[450px]"}>
      <Search className={`w-4 h-4 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 ${isDashboard ? 'text-gray-400' : 'text-text-secondary group-focus-within:text-brand-orange-600 transition-colors'}`} />
      <input
        ref={searchInputRef}
        type="text"
        placeholder={isDashboard ? "Search anything..." : "Search anything..."}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setIsDropdownOpen(true);
        }}
        onFocus={() => setIsDropdownOpen(true)}
        className={isDashboard 
          ? "w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 text-sm font-medium text-gray-700 placeholder:text-gray-400 transition-all shadow-sm"
          : "w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50/50 border border-border/60 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 focus:bg-white transition-all shadow-sm placeholder:text-text-secondary/60 placeholder:font-medium"}
      />
      
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
        <kbd className={`hidden lg:inline-flex items-center gap-1 rounded-md border border-border/60 px-1.5 font-mono text-[10px] font-bold text-text-secondary shadow-sm ${isDashboard ? 'bg-gray-100' : 'bg-white/50'}`}>
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

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
  );
}
