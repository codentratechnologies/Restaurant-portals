export type Role = 'Super Admin' | 'Admin' | 'Branch Manager' | 'Delivery Partner';

export function useRoleAccess() {
  // TODO: Replace with actual auth hook role
  let MOCK_CURRENT_ROLE: Role = 'Super Admin'; // Change to 'Branch Manager' to test restrictions
  const role = MOCK_CURRENT_ROLE as string;

  const isSuperAdmin = role === 'Super Admin';
  const isAdmin = role === 'Admin' || isSuperAdmin;
  const isManager = role === 'Branch Manager';


  return {
    role,
    isSuperAdmin,
    isAdmin,
    isManager,
    
    // Coupon specific permissions
    canCreateCoupon: !isManager,
    canEditCoupon: !isManager,
    canDeleteCoupon: !isManager,
  };
}
