import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
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

// Order Pages
import OrderTable from './pages/orders/OrderTable';
import OrderCalendar from './pages/orders/OrderCalendar';
import OrderDetail from './pages/orders/OrderDetail';

// Review Pages
import ReviewsDashboard from './pages/reviews/ReviewsDashboard';

// Support Pages
import CustomerSupport from './pages/support/CustomerSupport';

// Settings Pages
import SettingsLayout from './pages/settings/SettingsLayout';
import ProfileSettings from './pages/settings/ProfileSettings';
import StandaloneProfile from './pages/settings/StandaloneProfile';

function App() {
  return (
    <>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          className: 'text-sm font-bold shadow-lg rounded-xl border border-border',
          duration: 4000,
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} 
      />
      <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

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
          <Route path="/food/:id/edit" element={<UpdateFoodItem />} />
          
          <Route path="/orders" element={<OrderCalendar />} />
          <Route path="/orders/list" element={<OrderTable />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          
          <Route path="/reviews" element={<ReviewsDashboard />} />
          <Route path="/support" element={<CustomerSupport />} />
          
          <Route path="/profile" element={<StandaloneProfile />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="roles" element={<div className="p-4 text-text-secondary">Roles settings coming soon.</div>} />
            <Route path="notifications" element={<div className="p-4 text-text-secondary">Notifications settings coming soon.</div>} />
            <Route path="security" element={<div className="p-4 text-text-secondary">Security settings coming soon.</div>} />
            <Route path="global" element={<div className="p-4 text-text-secondary">Global settings coming soon.</div>} />
            <Route path="data" element={<div className="p-4 text-text-secondary">Data management coming soon.</div>} />
          </Route>
        </Route>
      </Routes>
      </Router>
    </>
  );
}

export default App;
