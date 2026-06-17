import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, error } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,  setLoading]  = useState(false);
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
    <div className="min-h-screen flex lg:flex-row-reverse bg-background">
      {/* Right side: Premium Login Form */}
      <div className="flex-1 flex flex-col justify-center py-6 px-4 sm:px-6 lg:w-1/2 lg:flex-none lg:px-24 xl:px-32 relative z-10 bg-white shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="flex items-center mb-8">
            <img src="/logo_horizontal.png" alt="DineOS Logo" className="h-16 sm:h-20 w-auto object-contain" />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Sign in to DineOS</h2>
            <p className="mt-1 text-sm text-text-secondary">Welcome back. Enter your credentials to access the command center.</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
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
                    type={showPassword ? "text" : "password"}
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && <p className="mt-1.5 text-sm text-red-600 font-medium">{passwordError}</p>}
                <div className="flex justify-end mt-1.5">
                  <Link to="/forgot-password" className="text-sm font-medium text-brand-orange-600 hover:text-brand-orange-500 transition-colors">
                    Forgot password?
                  </Link>
                </div>
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

      {/* Left side: Elegant Visual Section */}
      <div className="hidden lg:block relative lg:w-1/2 overflow-hidden bg-brand-navy">
        <div className="absolute inset-0">
          <img 
            src="/restaurant_auth_bg_light.png" 
            alt="Restaurant Atmosphere" 
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-black/40 to-brand-navy/95"></div>
        </div>

        <div className="absolute inset-0 h-full w-full flex flex-col items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 w-full max-w-2xl p-12 text-center"
          >
            <div className="w-80 mx-auto -mb-10 relative z-20 transition-transform hover:scale-105 duration-300">
              <img src="/logo_horizontal_transparent.png" alt="DineOS Logo" className="w-full h-auto object-contain" />
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg relative z-30">
              The Enterprise Restaurant Operating System.
            </h2>
            <p className="text-xl text-white/90 leading-relaxed max-w-lg mx-auto drop-shadow-md font-medium">
              Unify your branches, staff, menus, and analytics into one seamless command center designed for modern dining businesses.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
