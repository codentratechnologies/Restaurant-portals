import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import AuthLayout from './components/layout/AuthLayout';
import RoleRouteGuard from './components/layout/RoleRouteGuard';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';

// -- Auth Pages --
import Login from './admin-pages/auth/Login';
import SignUp from './admin-pages/auth/SignUp';
import ForgotPassword from './admin-pages/auth/ForgotPassword';
import SelectWorkplace from './admin-pages/auth/SelectWorkplace';
import Onboarding from './admin-pages/auth/Onboarding';

// -- Admin Pages --
import AdminDashboard from './admin-pages/dashboard/Dashboard';
import AdminBranchList from './admin-pages/branches/BranchList';
import AdminCreateBranch from './admin-pages/branches/CreateBranch';
import AdminBranchDetails from './admin-pages/branches/BranchDetails';
import AdminUpdateBranch from './admin-pages/branches/UpdateBranch';
import AdminEmployeeList from './admin-pages/employees/EmployeeList';
import AdminCreateEmployee from './admin-pages/employees/CreateEmployee';
import AdminEmployeeDetails from './admin-pages/employees/EmployeeDetails';
import AdminUpdateEmployee from './admin-pages/employees/UpdateEmployee';
import AdminFoodCatalog from './admin-pages/food/FoodCatalog';
import AdminCreateFoodItem from './admin-pages/food/CreateFoodItem';
import AdminUpdateFoodItem from './admin-pages/food/UpdateFoodItem';
import AdminFoodDetails from './admin-pages/food/FoodDetails';
import AdminOrderTable from './admin-pages/orders/OrderTable';
import AdminOrderCalendar from './admin-pages/orders/OrderCalendar';
import AdminOrderDetail from './admin-pages/orders/OrderDetail';
import AdminCouponsDashboard from './admin-pages/coupons/CouponsDashboard';
import AdminCreateCoupon from './admin-pages/coupons/CreateCoupon';
import AdminUpdateCoupon from './admin-pages/coupons/UpdateCoupon';
import AdminCouponDetails from './admin-pages/coupons/CouponDetails';
import AdminSettingsLayout from './admin-pages/settings/SettingsLayout';
import AdminProfileSettings from './admin-pages/settings/ProfileSettings';
import AdminStandaloneProfile from './admin-pages/settings/StandaloneProfile';

// -- Restaurant Pages --
import RestaurantDashboard from './restaurant-pages/dashboard/Dashboard';
import RestaurantOrderCalendar from './restaurant-pages/orders/OrderCalendar';
import RestaurantOrderTable from './restaurant-pages/orders/OrderTable';
import RestaurantOrderDetail from './restaurant-pages/orders/OrderDetail';
import RestaurantFoodCatalog from './restaurant-pages/food/FoodCatalog';
import RestaurantFoodDetails from './restaurant-pages/food/FoodDetails';
import RestaurantCreateFoodItem from './restaurant-pages/food/CreateFoodItem';
import RestaurantUpdateFoodItem from './restaurant-pages/food/UpdateFoodItem';
import RestaurantBranchList from './restaurant-pages/branches/BranchList';
import RestaurantCreateBranch from './restaurant-pages/branches/CreateBranch';
import RestaurantBranchDetails from './restaurant-pages/branches/BranchDetails';
import RestaurantUpdateBranch from './restaurant-pages/branches/UpdateBranch';
import RestaurantEmployeeList from './restaurant-pages/employees/EmployeeList';
import RestaurantCreateEmployee from './restaurant-pages/employees/CreateEmployee';
import RestaurantEmployeeDetails from './restaurant-pages/employees/EmployeeDetails';
import RestaurantUpdateEmployee from './restaurant-pages/employees/UpdateEmployee';
import RestaurantReviewsDashboard from './restaurant-pages/reviews/ReviewsDashboard';
import RestaurantCustomerSupport from './restaurant-pages/support/CustomerSupport';
import RestaurantSettingsLayout from './restaurant-pages/settings/SettingsLayout';
import RestaurantProfileSettings from './restaurant-pages/settings/ProfileSettings';
import RestaurantStandaloneProfile from './restaurant-pages/settings/StandaloneProfile';

function AppRoutes() {
  const { user, loading, userData } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-brand-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const targetRoute = () => {
    if (!user) return '/login';
    if (userData?.isOnboardingComplete) return '/admin/dashboard';
    if (userData?.isUnderReview || localStorage.getItem('isNewSignup') === 'true') return '/onboarding';
    return '/select-workplace';
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={targetRoute()} replace />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={user ? <Navigate to={targetRoute()} replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={targetRoute()} replace /> : <SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route path="/select-workplace" element={user && userData?.isOnboardingComplete ? <Navigate to="/admin/dashboard" replace /> : <SelectWorkplace />} />
      <Route path="/onboarding" element={user && userData?.isOnboardingComplete ? <Navigate to="/admin/dashboard" replace /> : <Onboarding />} />

      {/* Admin Routes */}
      <Route element={<RoleRouteGuard allowedRoles={['Super Admin', 'Root Admin', 'Admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/branches" element={<AdminBranchList />} />
          <Route path="/admin/branches/new" element={<AdminCreateBranch />} />
          <Route path="/admin/branches/:id" element={<AdminBranchDetails />} />
          <Route path="/admin/branches/:id/edit" element={<AdminUpdateBranch />} />
          <Route path="/admin/employees" element={<AdminEmployeeList />} />
          <Route path="/admin/employees/new" element={<AdminCreateEmployee />} />
          <Route path="/admin/employees/:id" element={<AdminEmployeeDetails />} />
          <Route path="/admin/employees/:id/edit" element={<AdminUpdateEmployee />} />
          <Route path="/admin/food" element={<AdminFoodCatalog />} />
          <Route path="/admin/food/new" element={<AdminCreateFoodItem />} />
          <Route path="/admin/food/:id" element={<AdminFoodDetails />} />
          <Route path="/admin/food/:id/edit" element={<AdminUpdateFoodItem />} />
          <Route path="/admin/orders" element={<AdminOrderCalendar />} />
          <Route path="/admin/orders/list" element={<AdminOrderTable />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/coupons" element={<AdminCouponsDashboard />} />
          <Route path="/admin/coupons/new" element={<AdminCreateCoupon />} />
          <Route path="/admin/coupons/:id" element={<AdminCouponDetails />} />
          <Route path="/admin/coupons/:id/edit" element={<AdminUpdateCoupon />} />
          <Route path="/admin/profile" element={<AdminStandaloneProfile />} />
          <Route path="/admin/settings" element={<AdminSettingsLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<AdminProfileSettings />} />
          </Route>
        </Route>
      </Route>

      {/* Restaurant Routes */}
      <Route element={<RoleRouteGuard allowedRoles={['Branch Manager', 'Delivery Partner']} />}>
        <Route element={<AppLayout />}>
          <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
          <Route path="/restaurant/orders" element={<RestaurantOrderCalendar />} />
          <Route path="/restaurant/orders/list" element={<RestaurantOrderTable />} />
          <Route path="/restaurant/orders/:id" element={<RestaurantOrderDetail />} />
          <Route path="/restaurant/food" element={<RestaurantFoodCatalog />} />
          <Route path="/restaurant/food/:id" element={<RestaurantFoodDetails />} />
          <Route path="/restaurant/food/new" element={<RestaurantCreateFoodItem />} />
          <Route path="/restaurant/food/:id/edit" element={<RestaurantUpdateFoodItem />} />
          <Route path="/restaurant/branches" element={<RestaurantBranchList />} />
          <Route path="/restaurant/branches/new" element={<RestaurantCreateBranch />} />
          <Route path="/restaurant/branches/:id" element={<RestaurantBranchDetails />} />
          <Route path="/restaurant/branches/:id/edit" element={<RestaurantUpdateBranch />} />
          <Route path="/restaurant/employees" element={<RestaurantEmployeeList />} />
          <Route path="/restaurant/employees/new" element={<RestaurantCreateEmployee />} />
          <Route path="/restaurant/employees/:id" element={<RestaurantEmployeeDetails />} />
          <Route path="/restaurant/employees/:id/edit" element={<RestaurantUpdateEmployee />} />
          <Route path="/restaurant/reviews" element={<RestaurantReviewsDashboard />} />
          <Route path="/restaurant/support" element={<RestaurantCustomerSupport />} />
          <Route path="/restaurant/profile" element={<RestaurantStandaloneProfile />} />
          <Route path="/restaurant/settings" element={<RestaurantSettingsLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<RestaurantProfileSettings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  useEffect(() => {
    if (window.location.search.includes('logout=true')) {
      signOut(auth).then(() => {
        localStorage.clear();
        window.location.href = '/login';
      });
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
