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
        className="relative z-10 w-full max-w-[380px] bg-white rounded-3xl shadow-2xl p-6 sm:px-8 sm:py-6"
      >
        <div className="flex justify-center mb-2">
          <img src="/logo_horizontal.png" alt="DineOS Logo" className="h-16 sm:h-18 w-auto object-contain" />
        </div>

        <div className="text-center mb-4">
 <h2 className="text-2xl font-bold tracking-tight text-text-primary">Reset password</h2>
 <p className="mt-1.5 text-sm text-text-secondary">Enter your email and we'll send you a reset link.</p>
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
 <form className="space-y-4" onSubmit={handleSubmit}>
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
 );
}
