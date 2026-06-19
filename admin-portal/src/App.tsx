import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';

// Branch Pages
import BranchList from './pages/branches/BranchList';
import CreateBranch from './pages/branches/CreateBranch';
import BranchDetails from './pages/branches/BranchDetails';
import UpdateBranch from './pages/branches/UpdateBranch';

// Employee Pages
import EmployeeList from './pages/employees/EmployeeList';
import CreateEmployee from './pages/employees/CreateEmployee';
import EmployeeDetails from './pages/employees/EmployeeDetails';
import UpdateEmployee from './pages/employees/UpdateEmployee';

// Food Pages
import FoodCatalog from './pages/food/FoodCatalog';
import CreateFoodItem from './pages/food/CreateFoodItem';
import UpdateFoodItem from './pages/food/UpdateFoodItem';
import FoodDetails from './pages/food/FoodDetails';

// Order Pages
import OrderTable from './pages/orders/OrderTable';
import OrderCalendar from './pages/orders/OrderCalendar';
import OrderDetail from './pages/orders/OrderDetail';

// Coupon Pages
import CouponsDashboard from './pages/coupons/CouponsDashboard';
import CreateCoupon from './pages/coupons/CreateCoupon';
import UpdateCoupon from './pages/coupons/UpdateCoupon';
import CouponDetails from './pages/coupons/CouponDetails';

// Settings Pages
import SettingsLayout from './pages/settings/SettingsLayout';
import ProfileSettings from './pages/settings/ProfileSettings';
import StandaloneProfile from './pages/settings/StandaloneProfile';

// ── Protected Route ────────────────────────────────────────────────
// Uses React Router v6 Outlet pattern.
// Any unauthenticated access to protected routes → redirect to /login.
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-brand-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → go to login page
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// ── App Routes ─────────────────────────────────────────────────────
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-brand-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Root redirect — login if not authenticated, dashboard if authenticated */}
      <Route
        path="/"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />

      {/* Auth routes — redirect to dashboard if already logged in */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" replace /> : <SignUp />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected routes — ProtectedRoute guards all children via Outlet */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/branches" element={<BranchList />} />
          <Route path="/branches/new" element={<CreateBranch />} />
          <Route path="/branches/:id" element={<BranchDetails />} />
          <Route path="/branches/:id/edit" element={<UpdateBranch />} />

          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/new" element={<CreateEmployee />} />
          <Route path="/employees/:id" element={<EmployeeDetails />} />
          <Route path="/employees/:id/edit" element={<UpdateEmployee />} />

          <Route path="/food" element={<FoodCatalog />} />
          <Route path="/food/new" element={<CreateFoodItem />} />
          <Route path="/food/:id" element={<FoodDetails />} />
          <Route path="/food/:id/edit" element={<UpdateFoodItem />} />

          <Route path="/orders" element={<OrderCalendar />} />
          <Route path="/orders/list" element={<OrderTable />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          <Route path="/coupons" element={<CouponsDashboard />} />
          <Route path="/coupons/new" element={<CreateCoupon />} />
          <Route path="/coupons/:id" element={<CouponDetails />} />
          <Route path="/coupons/:id/edit" element={<UpdateCoupon />} />

          <Route path="/profile" element={<StandaloneProfile />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="roles" element={<div className="p-4 text-text-secondary">Roles settings coming soon.</div>} />
            <Route path="notifications" element={<div className="p-4 text-text-secondary">Notifications settings coming soon.</div>} />
            <Route path="security" element={<div className="p-4 text-text-secondary">Security settings coming soon.</div>} />
            <Route path="data" element={<div className="p-4 text-text-secondary">Data management coming soon.</div>} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// ── Root App ───────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
