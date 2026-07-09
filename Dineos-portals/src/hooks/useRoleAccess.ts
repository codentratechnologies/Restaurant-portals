import { useAuth } from './useAuth';

export type Role = 'Super Admin' | 'Admin' | 'Branch Manager' | 'Delivery Partner';

export function useRoleAccess() {
  const { user, loading, activeAssignment } = useAuth();
  
  // Default to Admin if not fully loaded yet to prevent flickering kicks,
  // but we mostly rely on activeAssignment.
  let role: Role = 'Admin';
  
  if (activeAssignment && activeAssignment.role) {
    const rawRole = (activeAssignment.role || '').toLowerCase();
    if (rawRole === 'admin') role = 'Admin';
    else if (rawRole === 'super admin' || rawRole === 'super_admin' || rawRole === 'superadmin') role = 'Super Admin';
    else if (rawRole === 'branch manager' || rawRole === 'branch_manager') role = 'Branch Manager';
    else if (rawRole === 'delivery partner' || rawRole === 'delivery_partner') role = 'Delivery Partner';
    else role = activeAssignment.role as Role; // fallback
  }

  const isSuperAdmin = role === 'Super Admin';
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
