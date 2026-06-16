import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background font-sans text-text-primary">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'font-bold text-sm shadow-premium',
          duration: 4000,
          style: {
            borderRadius: '16px',
            background: '#ffffff',
            color: '#1a1f36', // brand-navy
            border: '1px solid #e2e8f0',
          },
          success: {
            iconTheme: { primary: '#f97316', secondary: '#ffffff' }, // brand-orange-500
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' }, // red-500
          }
        }}
      />
      <TopNav />
      <main className="max-w-[1600px] mx-auto px-6 py-8">
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
