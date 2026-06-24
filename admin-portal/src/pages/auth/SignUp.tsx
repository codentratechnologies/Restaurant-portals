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
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setLocalError(null);

    let valid = true;
    if (!name || name.trim().length < 2) {
      setNameError("Please enter a valid full name.");
      valid = false;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    try {
      await signup(email, password, name);
    } catch {
      // error is already set in useAuth context
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Full Screen Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/restaurant_auth_bg_light.png" 
          alt="Restaurant Atmosphere" 
          className="h-full w-full object-cover"
        />
        {/* Dark overlay to create the dark theme effect */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      {/* Centered Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[380px] bg-white rounded-3xl shadow-2xl p-6 sm:px-8 sm:py-6 flex flex-col max-h-[85vh]"
      >
        <div className="flex justify-center mb-2 shrink-0">
          <img src="/logo_horizontal.png" alt="DineOS Logo" className="h-16 sm:h-18 w-auto object-contain" />
        </div>

        <div className="text-center mb-4 shrink-0">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Create an account</h2>
          <p className="mt-1.5 text-sm text-text-secondary">Start managing your restaurant empire.</p>
        </div>

        <form className="flex flex-col overflow-hidden" onSubmit={handleSubmit} noValidate>
          <div className="overflow-y-auto px-1 -mx-1 space-y-4 pb-2 custom-scrollbar max-h-[290px]">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => { setFullName(e.target.value); setNameError(''); }}
                className={`input-field ${nameError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="John Doe"
                disabled={loading}
              />
              {nameError && <p className="mt-1.5 text-sm text-red-600 font-medium">{nameError}</p>}
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
                  minLength={6}
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
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-primary mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ?"text" :"password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(''); }}
                  className={`input-field pr-10 ${confirmPasswordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ?"Hide password" :"Show password"}
                >
                  {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              {confirmPasswordError && <p className="mt-1.5 text-sm text-red-600 font-medium">{confirmPasswordError}</p>}
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
          </div>

          <div className="pt-2 shrink-0">
            <Button
              type="submit"
              className="w-full text-base py-3 mt-2"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary font-medium shrink-0">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-orange-600 hover:text-brand-orange-500 transition-colors">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
