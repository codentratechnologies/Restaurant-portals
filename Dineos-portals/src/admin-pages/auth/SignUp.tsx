import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Shield, User, ArrowRight, Lock, Mail, Store, ChevronLeft } from 'lucide-react';
import Background from './components/Background';

export default function SignUp() {
  const { signup, error } = useAuth();
  const navigate = useNavigate();

  const [restaurantName, setRestaurantName] = useState('');
  const [name, setAuthorizedPersonName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [restaurantNameError, setRestaurantNameError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRestaurantNameError('');
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let valid = true;
    if (!restaurantName || restaurantName.trim().length < 2) {
      setRestaurantNameError("Please enter a valid restaurant name.");
      valid = false;
    }

    if (!name || name.trim().length < 2) {
      setNameError("Please enter a valid authorized person name.");
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
      localStorage.setItem('isNewSignup', 'true');
      const signupData = { name, restaurantName, email };
      localStorage.setItem('signupData', JSON.stringify(signupData));
      
      await signup(email, password, name, restaurantName);
    } catch {
      // error is already set in useAuth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative flex font-sans overflow-y-auto overflow-x-hidden">
      
      {/* ── Background ──────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Background />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          LEFT SECTION — Branding & Image
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row max-w-[1600px] mx-auto">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center relative p-6 lg:p-10 xl:pl-20">
          <div className="w-full max-w-[550px] xl:max-w-[600px] z-20 flex flex-col justify-center mx-auto lg:mx-0 -translate-y-1 lg:-translate-y-2">
            
            {/* Header Text Area */}
            <div className="mb-6 xl:mb-8 translate-y-6 lg:translate-y-10 xl:translate-y-12">
              <div className="mb-6 xl:mb-8">
                <img src="/logo.png" alt="DineOS Logo" className="h-10 lg:h-12 xl:h-14 object-contain" />
              </div>

              <h2 className="text-[28px] lg:text-[32px] xl:text-[42px] font-black text-[#1e293b] leading-[1.2] mb-4 tracking-tight">
                Manage Your <span className="text-[#ea580c]">Restaurant</span> <br className="hidden lg:block"/>
                Smarter
              </h2>
              
              <p className="text-gray-600 text-[13px] lg:text-[14px] leading-[1.6] max-w-[400px]">
                DineOS helps you streamline orders, manage staff, track performance and grow your restaurant business with ease.
              </p>
            </div>

            {/* 3D Image - Beautiful large scale, no flex-shrink bugs */}
            <div className="w-full flex items-center justify-start">
              <img 
                src="/restro.png" 
                alt="DineOS Platform" 
                className="w-full max-w-[650px] max-h-[45vh] lg:max-h-[50vh] xl:max-h-[55vh] object-contain object-left pointer-events-none z-10 drop-shadow-2xl"
              />
            </div>

          </div>
        </div>

      {/* ══════════════════════════════════════════════════════════════
          RIGHT SECTION — Sign Up Card
      ══════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 flex-1 lg:flex-none flex items-center justify-center p-4 sm:p-6 lg:p-12 z-20">
          <div className="w-full max-w-[360px] sm:max-w-[400px]">
            <div
              className="rounded-[24px] p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.35) 100%)',
                backdropFilter: 'blur(35px)',
                WebkitBackdropFilter: 'blur(35px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 40px 80px -12px rgba(234, 88, 12, 0.12), 0 16px 32px -8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 1), inset 0 -1px 1px rgba(255, 255, 255, 0.4)',
              }}
            >
              <style>{`
                @keyframes slideInFade {
                  from { opacity: 0; transform: translateY(15px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-step {
                  animation: slideInFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
              `}</style>

              {/* Mobile Logo Inside Card */}
              <div className="flex justify-center mb-6 lg:hidden">
                <img src="/logo.png" alt="DineOS Logo" className="h-12 sm:h-14 object-contain drop-shadow-sm" />
              </div>

              <div className="animate-step">
                <div className="mb-6">
                  <h2 className="text-[24px] font-bold text-gray-900 tracking-tight flex items-center gap-2 mb-1">
                    Create an account
                  </h2>
                  <p className="text-gray-500 text-[13px]">Start managing your restaurant empire.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  
                  {/* Restaurant Name */}
                  <div>
                    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all backdrop-blur-md ${
                      restaurantNameError ? 'border-red-400 bg-red-50/50' : 'border-white/60 bg-white/40 focus-within:bg-white/80 focus-within:border-[#f97316] shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]'
                    }`}>
                      <Store className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={restaurantName}
                        onChange={(e) => { setRestaurantName(e.target.value); setRestaurantNameError(''); }}
                        placeholder="Restaurant Name"
                        disabled={loading}
                        className="flex-1 text-[13px] outline-none text-gray-900 placeholder:text-gray-500 bg-transparent"
                      />
                    </div>
                    {restaurantNameError && <p className="mt-1.5 text-xs text-red-600 font-medium pl-1">{restaurantNameError}</p>}
                  </div>

                  {/* Authorized Person Name */}
                  <div>
                    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all backdrop-blur-md ${
                      nameError ? 'border-red-400 bg-red-50/50' : 'border-white/60 bg-white/40 focus-within:bg-white/80 focus-within:border-[#f97316] shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]'
                    }`}>
                      <User className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => { setAuthorizedPersonName(e.target.value); setNameError(''); }}
                        placeholder="Authorized Person Name"
                        disabled={loading}
                        className="flex-1 text-[13px] outline-none text-gray-900 placeholder:text-gray-500 bg-transparent"
                      />
                    </div>
                    {nameError && <p className="mt-1.5 text-xs text-red-600 font-medium pl-1">{nameError}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all backdrop-blur-md ${
                      emailError ? 'border-red-400 bg-red-50/50' : 'border-white/60 bg-white/40 focus-within:bg-white/80 focus-within:border-[#f97316] shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]'
                    }`}>
                      <Mail className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={1.5} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                        placeholder="Email address"
                        disabled={loading}
                        className="flex-1 text-[13px] outline-none text-gray-900 placeholder:text-gray-500 bg-transparent"
                      />
                    </div>
                    {emailError && <p className="mt-1.5 text-xs text-red-600 font-medium pl-1">{emailError}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all backdrop-blur-md ${
                      passwordError ? 'border-red-400 bg-red-50/50' : 'border-white/60 bg-white/40 focus-within:bg-white/80 focus-within:border-[#f97316] shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]'
                    }`}>
                      <Lock className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={1.5} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                        placeholder="Password"
                        disabled={loading}
                        className="flex-1 text-[13px] outline-none text-gray-900 placeholder:text-gray-500 bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-gray-800 transition-colors shrink-0 p-1"
                      >
                        {showPassword ? <Eye className="w-4 h-4" strokeWidth={1.5} /> : <EyeOff className="w-4 h-4" strokeWidth={1.5} />}
                      </button>
                    </div>
                    {passwordError && <p className="mt-1.5 text-xs text-red-600 font-medium pl-1">{passwordError}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all backdrop-blur-md ${
                      confirmPasswordError ? 'border-red-400 bg-red-50/50' : 'border-white/60 bg-white/40 focus-within:bg-white/80 focus-within:border-[#f97316] shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]'
                    }`}>
                      <Lock className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={1.5} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(''); }}
                        placeholder="Confirm Password"
                        disabled={loading}
                        className="flex-1 text-[13px] outline-none text-gray-900 placeholder:text-gray-500 bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-500 hover:text-gray-800 transition-colors shrink-0 p-1"
                      >
                        {showConfirmPassword ? <Eye className="w-4 h-4" strokeWidth={1.5} /> : <EyeOff className="w-4 h-4" strokeWidth={1.5} />}
                      </button>
                    </div>
                    {confirmPasswordError && <p className="mt-1.5 text-xs text-red-600 font-medium pl-1">{confirmPasswordError}</p>}
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                      {error}
                    </div>
                  )}

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[20px] text-white font-bold text-[14px] transition-all bg-[#f97316] hover:bg-[#ea580c] shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.25)] disabled:opacity-70 mt-4 relative"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      <>
                        <span className="tracking-wide">Create Account</span>
                        <div className="absolute right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#f97316]">
                          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </div>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 text-center transition-all">
                  <p className="text-[13px] text-gray-700 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#f97316] font-bold hover:underline ml-1">
                      Log in
                    </Link>
                  </p>
                </div>
              </div>

              {/* Legal / Terms */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-start">
                <p className="text-[11px] text-gray-500 font-medium flex items-start gap-1.5 text-left leading-relaxed">
                  <Shield className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>
                    By continuing, you agree to our{' '}
                    <a href="#" className="text-[#f97316] hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-[#f97316] hover:underline">Privacy Policy</a>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
