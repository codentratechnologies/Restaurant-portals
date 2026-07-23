import { useAuth } from './useAuth';

export type Role = 'Super Admin' | 'Root Admin' | 'Admin' | 'Branch Manager' | 'Delivery Partner';

export function useRoleAccess() {
  const { user, loading, activeAssignment } = useAuth();
  
  // Safely determine role without dangerous defaults
  let role: Role | null = null;
  
  let currentAssignment = activeAssignment;
  if (!currentAssignment) {
    try {
      const stored = localStorage.getItem('dineos_active_assignment');
      if (stored) currentAssignment = JSON.parse(stored);
    } catch(e) {}
  }
  
  if (currentAssignment && currentAssignment.role) {
    const rawRole = (currentAssignment.role || '').toLowerCase();
    if (rawRole === 'admin') role = 'Admin';
    else if (rawRole === 'root_admin' || rawRole === 'root admin') role = 'Root Admin';
    else if (rawRole === 'super admin' || rawRole === 'super_admin' || rawRole === 'superadmin') role = 'Super Admin';
    else if (rawRole === 'branch manager' || rawRole === 'branch_manager') role = 'Branch Manager';
    else if (rawRole === 'delivery partner' || rawRole === 'delivery_partner') role = 'Delivery Partner';
    else role = currentAssignment.role as Role; // fallback
  }

  const isSuperAdmin = role === 'Super Admin' || role === 'Root Admin';
  const isAdmin = role === 'Admin' || isSuperAdmin;
  const isManager = role === 'Branch Manager';

  return {
    role,
    loadingRole: loading,
    isSuperAdmin,
    isAdmin,
    isManager,

    // Coupon specific permissions
    canCreateCoupon: !isManager,
    canEditCoupon: !isManager,
    canDeleteCoupon: !isManager,
  };
}
