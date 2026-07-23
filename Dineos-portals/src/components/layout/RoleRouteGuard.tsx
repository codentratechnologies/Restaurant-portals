import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { Role } from '../../hooks/useRoleAccess';

interface RoleRouteGuardProps {
  allowedRoles: Role[];
}

export default function RoleRouteGuard({ allowedRoles }: RoleRouteGuardProps) {
  const { user, userData, loading } = useAuth();
  const { role, loadingRole } = useRoleAccess();

  if (loading || loadingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-brand-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is somehow null (e.g. activeAssignment not set yet), they need to go to selection screen
  if (!role) {
    return <Navigate to="/select-workplace" replace />;
  }

  // @ts-ignore - TS might complain about role being null but we checked above
  const currentRole = role as Role;
  
  if (userData?.isOnboardingComplete === false && (currentRole === 'Super Admin' || currentRole === 'Admin')) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!allowedRoles.includes(currentRole)) {
    // If not allowed, redirect to a safe place based on their role
    if (role === 'Super Admin' || role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/restaurant/dashboard" replace />;
    }
  }

  return <Outlet />;
}
