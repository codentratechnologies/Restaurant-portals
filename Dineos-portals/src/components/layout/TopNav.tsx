import { NavLink, Link, useLocation } from 'react-router-dom';
import { Search, LogOut, ChevronDown, ChefHat, Bell, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import GlobalSearch from '../common/GlobalSearch';
import { useRoleAccess } from '../../hooks/useRoleAccess';

const baseNavItems = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Branches', path: '/branches' },
  { name: 'Employees', path: '/employees' },
  { name: 'Menu', path: '/food' },
  { name: 'Coupons & Promotions', path: '/coupons', adminOnly: true },
  { name: 'Orders', path: '/orders' },
  { name: 'Reviews', path: '/reviews', restaurantOnly: true },
  { name: 'Support', path: '/support', restaurantOnly: true },
];

export default function TopNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAdmin } = useRoleAccess();
  
  const prefix = isAdmin ? '/admin' : '/restaurant';
  
  // Filter nav items based on role
  const navItems = baseNavItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.restaurantOnly && isAdmin) return false;
    return true;
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled ? "bg-white shadow-sm" : "bg-white/70 backdrop-blur-2xl border-b border-border/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
    )}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* LEFT: Logo & Mobile Menu & Desktop Nav */}
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-10">
          <button
            className="md:hidden p-2 -ml-2 text-text-secondary hover:text-brand-navy focus:outline-none transition-colors rounded-lg hover:bg-gray-50"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="flex items-center shrink-0">
            <img src="/logo.png" alt="DineOS Logo" className="h-12 sm:h-16 w-auto object-contain sm:scale-125 origin-left" />
          </Link>

          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 overflow-visible">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={`${prefix}${item.path}`}
                className={({ isActive }) =>
                  cn(
                    "relative px-3 py-2 text-[15px] font-bold transition-all duration-300 whitespace-nowrap group",
                    isActive
                      ? "text-brand-orange-500"
                      : "text-text-secondary hover:text-brand-navy"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.name === 'Coupons & Promotions' ? 'Coupons' : item.name}
                    {isActive && (
                      <motion.div
                        layoutId="topnav-active"
                        className="absolute bottom-0 left-3 right-3 h-[3px] bg-brand-orange-500 rounded-t-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    {!isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-brand-navy/20 rounded-t-full transition-all duration-300 group-hover:w-[calc(100%-24px)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2 sm:gap-5">
          <div className="flex items-center">
            <div className="hidden md:block">
              <GlobalSearch variant="nav" />
            </div>
            <button
              className="md:hidden p-2 text-text-secondary hover:text-brand-navy rounded-lg hover:bg-gray-50 transition-colors mr-2"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          <div className="hidden sm:block h-8 w-px bg-border"></div>

          {/* Profile Link */}
          <Link to={isAdmin ? `${prefix}/settings/profile` : `${prefix}/profile`} className="flex items-center hover:bg-gray-50 p-1 sm:p-1.5 rounded-full transition-colors border border-transparent hover:border-border group shrink-0">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
              alt="Profile"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-transparent bg-background object-cover group-hover:border-brand-orange-300 transition-all duration-300 shadow-sm"
            />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {createPortal(
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
                    <NavLink
                      key={item.name}
                      to={`${prefix}${item.path}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "block px-4 py-3.5 rounded-xl text-sm font-bold transition-all",
                          isActive ? "bg-brand-orange-50 text-brand-orange-700 shadow-sm" : "text-text-secondary hover:bg-gray-50 hover:text-brand-navy"
                        )
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-b border-border/50 bg-gray-50/50"
          >
            <div className="p-4">
              <GlobalSearch variant="mobile" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
