import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Search, LogOut, ChevronDown, ChefHat, Bell, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const navItems = [
  { name: 'Home & Analytics', path: '/dashboard' },
  { name: 'Menu', path: '/food' },
  { 
    name: 'Orders Management', 
    path: '/orders',
    subItems: [
      { name: 'Live Orders', path: '/orders' },
      { name: 'Order List', path: '/orders/list' }
    ]
  },
  { name: 'Order Review', path: '/reviews' },
  { name: 'Customer Support', path: '/support' },
];

export default function TopNav() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* LEFT: Logo & Mobile Menu */}
        <div className="flex items-center gap-3 sm:gap-8">
          <button 
            className="md:hidden p-2 -ml-2 text-text-secondary hover:text-brand-navy focus:outline-none transition-colors rounded-lg hover:bg-gray-50"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="DineOS Logo" className="h-12 sm:h-16 w-auto object-contain sm:scale-125 origin-left" />
          </Link>

          {/* CENTER: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.name} className="relative group h-16 flex items-center">
                <NavLink
                  to={item.path}
                  end={item.path === '/orders' || item.path === '/dashboard'}
                  className={({ isActive }) =>
                    cn(
                      "relative px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 rounded-lg hover:bg-gray-50",
                      isActive ? "text-brand-orange-600" : "text-text-secondary hover:text-text-primary"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.name}
                      {item.subItems && <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />}
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

                {item.subItems && (
                  <div className="absolute top-full left-0 w-48 bg-white rounded-xl shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="p-2 flex flex-col gap-1">
                      {item.subItems.map(sub => (
                        <Link 
                          key={sub.name}
                          to={sub.path}
                          className="px-3 py-2.5 text-sm font-bold text-text-secondary hover:text-brand-orange-600 hover:bg-brand-orange-50 rounded-lg transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2 sm:gap-5">
          <div className="hidden lg:flex items-center relative group">
            <Search className="w-4 h-4 absolute left-3 text-text-secondary group-focus-within:text-brand-orange-600 transition-colors" />
            <input
              type="text"
              placeholder="Search anything..."
              className="pl-9 pr-4 py-2 w-64 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 focus:bg-white transition-all placeholder:text-text-secondary/60"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-white px-1.5 font-mono text-[10px] font-medium text-text-secondary opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-border"></div>

          {/* Profile Link */}
          <Link to="/profile" className="flex items-center hover:bg-gray-50 p-1 sm:p-1.5 rounded-full transition-colors border border-transparent hover:border-border">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
              alt="Profile"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border bg-background object-cover"
            />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] bg-white z-[70] shadow-2xl flex flex-col md:hidden"
            >
              <div className="p-5 border-b border-border flex justify-between items-center bg-gray-50/50">
                <img src="/logo_horizontal.png" alt="DineOS Logo" className="h-8 w-auto object-contain" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-text-secondary hover:text-brand-navy rounded-lg hover:bg-white transition-colors border border-transparent hover:border-border">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 bg-white">
                {navItems.map((item) => (
                  <div key={item.name}>
                    <NavLink
                      to={item.subItems ? '#' : item.path}
                      onClick={(e) => {
                        if (item.subItems) {
                          e.preventDefault();
                          toggleSubmenu(item.name);
                        } else {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all",
                          isActive && !item.subItems ? "bg-brand-orange-50 text-brand-orange-700 shadow-sm" : "text-text-secondary hover:bg-gray-50 hover:text-brand-navy"
                        )
                      }
                    >
                      <span>{item.name}</span>
                      {item.subItems && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${openSubmenus[item.name] ? 'rotate-180' : ''}`} />
                      )}
                    </NavLink>
                    
                    <AnimatePresence>
                      {item.subItems && openSubmenus[item.name] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden ml-4 pl-4 border-l-2 border-border mt-1"
                        >
                          <div className="flex flex-col gap-1 py-2">
                            {item.subItems.map(sub => (
                              <Link 
                                key={sub.name}
                                to={sub.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="px-3 py-2 text-sm font-semibold text-text-secondary hover:text-brand-orange-600 rounded-lg transition-colors"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
