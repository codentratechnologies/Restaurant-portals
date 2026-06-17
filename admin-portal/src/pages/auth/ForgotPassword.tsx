import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { UtensilsCrossed, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const { resetPassword, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setLocalError(null);
    setSuccess(false);
    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch {
      // error is already set in useAuth context
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex lg:flex-row-reverse bg-background">
      {/* Right side: Form */}
      <div className="flex-1 flex flex-col justify-center py-6 px-4 sm:px-6 lg:flex-none lg:px-24 xl:px-32 relative z-10 bg-white shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md space-y-6"
        >
          <div className="flex items-center mb-8">
            <img src="/logo_horizontal.png" alt="DineOS Logo" className="h-16 sm:h-20 w-auto object-contain" />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Reset password</h2>
            <p className="mt-1 text-sm text-text-secondary">Enter your email and we'll send you a reset link.</p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-green-900 mb-2">Check your email</h3>
              <p className="text-sm text-green-800">
                We've sent a password reset link to <span className="font-semibold">{email}</span>.
              </p>
              <div className="mt-6">
                <Link to="/login" className="text-sm font-bold text-green-700 hover:text-green-800 transition-colors">
                  Return to log in
                </Link>
              </div>
            </motion.div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-1.5">
                  Email Address
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
                className="w-full text-base py-3 mt-4"
                disabled={loading}
              >
                {loading ? 'Sending link...' : 'Send reset link'}
              </Button>

              <div className="text-center mt-6">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-brand-navy transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to log in
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>

      {/* Left side: Elegant Visual Section */}
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
            <div className="w-28 h-28 mx-auto bg-white rounded-2xl shadow-soft flex items-center justify-center mb-6 border border-border p-3">
              <img src="/logo_square.png" alt="DineOS Logo" className="w-full h-full object-contain" />
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
