import { NavLink, Link } from 'react-router-dom';
import { Search, LogOut, ChevronDown, ChefHat } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

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
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">

        {/* LEFT: Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="DineOS Logo" className="h-16 w-auto object-contain scale-125 origin-left ml-4" />
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
        <div className="flex items-center gap-5">
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
