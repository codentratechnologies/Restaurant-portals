import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import TopNav from './TopNav';
import OrderNotificationListener from './OrderNotificationListener';
import { useBranchStatusMonitor } from '../../hooks/useBranchStatusMonitor';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useBranchStatusMonitor();

  useEffect(() => {
    const userStr = localStorage.getItem('restaurant_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!user.adminId || user.adminId === 'global') {
          localStorage.removeItem('restaurant_user');
          navigate('/login');
        }
      } catch (e) {
        localStorage.removeItem('restaurant_user');
        navigate('/login');
      }
    }
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary">
      <OrderNotificationListener />
      <TopNav />
      <main className="max-w-[1600px] mx-auto px-4 py-4 sm:px-6 sm:py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
