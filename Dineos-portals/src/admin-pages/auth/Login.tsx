import { useState, FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Shield, User, ArrowLeft, ChevronRight } from 'lucide-react';

type LoginType = 'admin' | 'user';

export default function Login() {
  const { login, error } = useAuth();
  const location = useLocation();
  const locationState = location.state as { loginType?: LoginType; step?: 'select' | 'credentials' } | null;

  const [step, setStep] = useState<'select' | 'credentials'>(locationState?.step || 'select');
  const [loginType, setLoginType] = useState<LoginType>(locationState?.loginType || 'admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();

  const handleNext = () => setStep('credentials');
  const handleBack = () => { setStep('select'); setEmail(''); setPassword(''); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    let valid = true;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setEmailError('Please enter a valid email address.'); valid = false; }
    if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); valid = false; }
    if (!valid) return;
    setLoading(true);
    try {
      await login(email, password);
      // Navigate directly based on user's chosen portal type
      navigate(loginType === 'admin' ? '/admin/dashboard' : '/restaurant/dashboard', { replace: true });
    } catch { /* error handled in context */ } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative w-full">
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <img src="/restaurant_auth_bg_light.png" alt="Restaurant Atmosphere" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Logo header */}
          <div className="flex justify-center pt-8 pb-4 px-8">
            <img src="/logo_horizontal.png" alt="DineOS Logo" className="h-12 w-auto object-contain" />
          </div>

          <AnimatePresence mode="wait">
            {/* ── STEP 1: Role Selection ── */}
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="px-8 pb-8"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-text-primary">Log in to your account</h2>
                  <p className="mt-1.5 text-sm text-text-secondary">Welcome back! Please select your user type.</p>
                </div>

                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">User Type</p>

                <div className="space-y-3 mb-6">
                  {/* Root User card */}
                  <button
                    type="button"
                    onClick={() => setLoginType('admin')}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                      loginType === 'admin'
                        ? 'border-brand-orange-500 bg-brand-orange-50'
                        : 'border-border bg-white hover:border-brand-orange-300 hover:bg-orange-50/40'
                    }`}
                  >
                    {/* Radio circle */}
                    <span className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      loginType === 'admin' ? 'border-brand-orange-500' : 'border-gray-300'
                    }`}>
                      {loginType === 'admin' && <span className="w-2.5 h-2.5 rounded-full bg-brand-orange-500" />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-brand-orange-500" />
                        <p className="text-sm font-bold text-text-primary">Root user login</p>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Account owner that performs tasks requiring <span className="text-brand-orange-500 font-semibold">unrestricted access.</span>
                      </p>
                    </div>
                  </button>

                  {/* IAM User card */}
                  <button
                    type="button"
                    onClick={() => setLoginType('user')}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                      loginType === 'user'
                        ? 'border-brand-orange-500 bg-brand-orange-50'
                        : 'border-border bg-white hover:border-brand-orange-300 hover:bg-orange-50/40'
                    }`}
                  >
                    <span className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      loginType === 'user' ? 'border-brand-orange-500' : 'border-gray-300'
                    }`}>
                      {loginType === 'user' && <span className="w-2.5 h-2.5 rounded-full bg-brand-orange-500" />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-brand-orange-500" />
                        <p className="text-sm font-bold text-text-primary">IAM user</p>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        User within an account that performs <span className="text-brand-orange-500 font-semibold">daily tasks.</span>
                      </p>
                    </div>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-orange-500 hover:bg-brand-orange-600 text-white text-sm font-bold transition-all shadow-lg shadow-brand-orange-500/25"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>

              </motion.div>
            )}

            {/* ── STEP 2: Credentials ── */}
            {step === 'credentials' && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.25 }}
                className="px-8 pb-8"
              >
                {/* Back + title */}
                <div className="flex items-center gap-3 mb-5">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-brand-orange-400 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">
                      {loginType === 'admin' ? 'Root User Login' : 'IAM User Login'}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {loginType === 'admin' ? <Shield className="w-3 h-3 text-brand-orange-500" /> : <User className="w-3 h-3 text-brand-orange-500" />}
                      <p className="text-xs text-brand-orange-500 font-semibold">
                        {loginType === 'admin' ? 'Unrestricted Access' : 'IAM Access'}
                      </p>
                    </div>
                  </div>
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
                      autoFocus
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      className={`input-field ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                      placeholder={loginType === 'admin' ? 'admin@dineos.com' : 'user@dineos.com'}
                      disabled={loading}
                    />
                    {emailError && <p className="mt-1.5 text-xs text-red-600 font-medium">{emailError}</p>}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                        className={`input-field pr-10 ${passwordError ? 'border-red-500 focus:border-red-500' : ''}`}
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordError && <p className="mt-1.5 text-xs text-red-600 font-medium">{passwordError}</p>}
                    <div className="flex justify-end mt-2">
                      <Link to="/forgot-password" className="text-sm font-medium text-brand-orange-600 hover:text-brand-orange-500 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-orange-500 hover:bg-brand-orange-600 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-lg shadow-brand-orange-500/25 mt-2"
                  >
                    {loading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    ) : null}
                    {loading ? 'Signing in...' : `Sign in as ${loginType === 'admin' ? 'Root User' : 'IAM User'}`}
                  </button>
                </form>

                {loginType === 'admin' && (
                  <p className="mt-5 text-center text-sm text-text-secondary font-medium">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-brand-orange-600 hover:text-brand-orange-500 font-semibold transition-colors">
                      Sign up
                    </Link>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
