import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminTopNav from './AdminTopNav';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1a1f36] flex">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'font-bold text-sm shadow-sm',
          duration: 4000,
          style: {
            borderRadius: '16px',
            background: '#ffffff',
            color: '#1a1f36',
            border: '1px solid #E8ECF4',
          },
          success: {
            iconTheme: { primary: '#059669', secondary: '#ffffff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#ffffff' },
          }
        }}
      />
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block z-50 shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        <AdminTopNav onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto relative z-10 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={window.location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex-1"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {createPortal(
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 z-[60] lg:hidden backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 w-64 bg-white z-[70] shadow-2xl flex flex-col lg:hidden"
              >
                <div className="absolute top-4 right-4 z-[80]">
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/50 text-[#8896AB] hover:text-[#1a1f36] rounded-xl hover:bg-[#F4F6FA] transition-colors backdrop-blur">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <Sidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
