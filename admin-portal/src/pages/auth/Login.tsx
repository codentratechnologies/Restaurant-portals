import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
 const { login, error } = useAuth();

 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const [localError, setLocalError] = useState<string | null>(null);
 const [emailError, setEmailError] = useState('');
 const [passwordError, setPasswordError] = useState('');

 const handleSubmit = async (e: FormEvent) => {
 e.preventDefault();
 setEmailError('');
 setPasswordError('');
 setLocalError(null);

 let valid = true;
 if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
 setEmailError("Please enter a valid email address.");
 valid = false;
 }
 if (password.length < 6) {
 setPasswordError("Password must be at least 6 characters.");
 valid = false;
 }
 if (!valid) return;

 setLoading(true);
 try {
 await login(email, password);
 // No navigate() needed — onAuthStateChanged updates user state,
 // which causes App.tsx ProtectedRoute to automatically render /dashboard
 } catch {
 // error is already set in useAuth context
 } finally {
 setLoading(false);
 }
 };

 const displayError = localError || error;

  return (
    <div className="min-h-screen relative w-full">
      {/* Full Screen Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img 
          src="/restaurant_auth_bg_light.png" 
          alt="Restaurant Atmosphere" 
          className="h-full w-full object-cover"
        />
        {/* Dark overlay to create the dark theme effect */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 min-h-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 py-12">
        {/* Centered Card */}
 <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[380px] bg-white rounded-3xl shadow-2xl p-6 sm:px-8 sm:py-6"
      >
        <div className="flex justify-center mb-2">
          <img src="/logo_horizontal.png" alt="DineOS Logo" className="h-16 sm:h-18 w-auto object-contain" />
        </div>

        <div className="text-center mb-4">
 <h2 className="text-2xl font-bold tracking-tight text-text-primary">Sign in to DineOS</h2>
 <p className="mt-1.5 text-sm text-text-secondary">Welcome back. Enter your credentials.</p>
 </div>

 <form className="space-y-4" onSubmit={handleSubmit} noValidate>
 <div>
 <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-1.5">
 Email address
 </label>
 <input
 id="email"
 type="email"
 required
 value={email}
 onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
 className={`input-field ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
 placeholder="admin@dineos.com"
 disabled={loading}
 />
 {emailError && <p className="mt-1.5 text-sm text-red-600 font-medium">{emailError}</p>}
 </div>

 <div>
 <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-1.5">
 Password
 </label>
 <div className="relative">
 <input
 id="password"
 type={showPassword ?"text" :"password"}
 required
 value={password}
 onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
 className={`input-field pr-10 ${passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
 placeholder="••••••••"
 disabled={loading}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
 aria-label={showPassword ?"Hide password" :"Show password"}
 >
 {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
 </button>
 </div>
 {passwordError && <p className="mt-1.5 text-sm text-red-600 font-medium">{passwordError}</p>}
 <div className="flex justify-end mt-2">
 <Link to="/forgot-password" className="text-sm font-medium text-brand-orange-600 hover:text-brand-orange-500 transition-colors">
 Forgot password?
 </Link>
 </div>
 </div>

 {/* Error message */}
 {error && (
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium"
 >
 {error}
 </motion.div>
 )}

 <Button
 type="submit"
 className="w-full text-base py-3 mt-4"
 disabled={loading}
 >
 {loading ? 'Signing in...' : 'Sign in to Dashboard'}
 </Button>
 </form>

 <p className="mt-6 text-center text-sm text-text-secondary font-medium">
 Don't have an account?{' '}
 <Link to="/signup" className="text-brand-orange-600 hover:text-brand-orange-500 transition-colors">
 Sign up
 </Link>
 </p>
 </motion.div>
      </div>
    </div>
  );
}
