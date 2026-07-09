import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import Breadcrumbs from '../common/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background font-sans text-text-primary relative">
      {/* Decorative ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div style={{ background: 'radial-gradient(circle at 10% 20%, rgba(255,107,0,0.04) 0%, transparent 60%)' }} className="absolute inset-0" />
        <div style={{ background: 'radial-gradient(circle at 90% 80%, rgba(124,58,237,0.03) 0%, transparent 55%)' }} className="absolute inset-0" />
        <div style={{ background: 'radial-gradient(circle at 50% 50%, rgba(14,165,233,0.02) 0%, transparent 50%)' }} className="absolute inset-0" />
      </div>
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
      <main className="max-w-[1600px] mx-auto px-4 py-4 sm:px-6 sm:py-8 relative z-10 flex flex-col">
        <Breadcrumbs />
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
