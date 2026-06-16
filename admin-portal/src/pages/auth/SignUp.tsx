import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
  const { signup, error } = useAuth();

  const [name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name);
      // No navigate() needed — onAuthStateChanged updates user state,
      // which causes App.tsx ProtectedRoute to automatically render /dashboard
    } catch {
      // error is already set in useAuth context, or we can use it here
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side: Premium SignUp Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-24 xl:px-32 relative z-10 bg-white shadow-[20px_0_40px_-10px_rgba(0,0,0,0.05)] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md my-auto py-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="DineOS Logo" className="h-10 object-contain" />
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">Create an account</h2>
            <p className="mt-2 text-text-secondary">Start managing your restaurant empire today.</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-1.5">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>



              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="admin@dineos.com"
                  disabled={loading}
                />
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    disabled={loading}
                    minLength={6}
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
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-primary mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error message */}
            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium"
              >
                {displayError}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full text-base py-3.5 mt-2"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-orange-600 hover:text-brand-orange-500 transition-colors">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: Elegant Visual Section */}
      <div className="hidden lg:block relative w-0 flex-1 bg-background overflow-hidden">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-brand-orange-50 to-background flex flex-col items-center justify-center p-12">

          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-orange-500/5 rounded-full blur-3xl mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-brand-green/5 rounded-full blur-3xl mix-blend-multiply"></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 w-full max-w-2xl bg-white/50 backdrop-blur-xl border border-white/20 shadow-premium rounded-[2.5rem] p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto bg-white rounded-3xl shadow-soft flex items-center justify-center mb-8 border border-border">
              <img src="/logo.png" alt="DineOS Logo" className="w-12 h-12 object-contain" />
            </div>
            <h2 className="text-4xl font-extrabold text-brand-navy tracking-tight mb-6">
              The Enterprise Restaurant Operating System.
            </h2>
            <p className="text-xl text-text-secondary leading-relaxed max-w-lg mx-auto">
              Unify your branches, staff, menus, and analytics into one seamless command center designed for modern dining businesses.
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
