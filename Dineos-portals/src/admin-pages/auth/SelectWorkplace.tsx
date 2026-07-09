import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Store, ChevronRight } from 'lucide-react';

export default function SelectWorkplace() {
  const { user, userData, activeAssignment, setActiveAssignment } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not logged in, go to login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // If only one assignment, or already set, go to dashboard
    if (userData?.assignments) {
      if (userData.assignments.length === 1) {
        setActiveAssignment(userData.assignments[0]);
        const role = userData.assignments[0].role;
        if (role === 'Super Admin' || role === 'Admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/restaurant/dashboard', { replace: true });
        }
      }
    }
  }, [user, userData, navigate, setActiveAssignment]);

  if (!userData?.assignments || userData.assignments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>No assignments found. Please contact an admin.</p>
      </div>
    );
  }

  const handleSelect = (assignment: any) => {
    setActiveAssignment(assignment);
    const role = assignment.role;
    if (role === 'Super Admin' || role === 'Admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/restaurant/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/restaurant_auth_bg_light.png" 
          alt="Atmosphere" 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-[480px] bg-white rounded-3xl shadow-2xl p-6 sm:px-8 sm:py-6"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Select Workplace</h2>
          <p className="mt-1.5 text-sm text-text-secondary">You are assigned to multiple locations. Choose one to continue.</p>
        </div>

        <div className="space-y-3">
          {userData.assignments.map((assignment: any, idx: number) => (
            <button
              key={idx}
              onClick={() => handleSelect(assignment)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-brand-orange-500 hover:bg-brand-orange-50 transition-colors text-left group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-brand-orange-100 rounded-lg text-brand-orange-600 group-hover:bg-brand-orange-500 group-hover:text-white transition-colors">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary group-hover:text-brand-orange-700">{assignment.restaurantName || assignment.adminId}</h3>
                  <p className="text-sm text-text-secondary">{assignment.role}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-brand-orange-500" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
