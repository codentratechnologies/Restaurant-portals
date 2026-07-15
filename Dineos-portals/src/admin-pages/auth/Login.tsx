import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Shield, User, ArrowRight, Lock, Mail, ChevronLeft } from 'lucide-react';
import Background from './components/Background';

type LoginType = 'admin' | 'user';

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState<LoginType>('admin');
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEmailError(''); setPasswordError('');
    let valid = true;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setEmailError('Please enter a valid email address.'); valid = false; }
    if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); valid = false; }
    if (!valid) return;
    setLoading(true);
    try {
      await login(email, password);
      // Let App.tsx and SelectWorkplace handle the role-based redirection automatically
    } catch { /* error handled in context */ } finally { setLoading(false); }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex font-sans">
      
      {/* ── Background ──────────────── */}
      <Background />


      {/* ══════════════════════════════════════════════════════════════
          LEFT SECTION — Branding & Image
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full h-full flex max-w-[1600px] mx-auto">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center relative p-8 lg:p-12 xl:pl-20">
          <div className="w-full max-w-[550px] xl:max-w-[600px] z-20 flex flex-col justify-center mx-auto lg:mx-0">
            
            {/* Header Text Area */}
            <div className="mt-4 lg:mt-8 xl:mt-12 mb-8 xl:mb-12">
              <div className="mb-6">
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

            {/* 3D Image */}
            <div className="w-full flex items-center justify-start -mt-4 lg:-mt-8 xl:-mt-12">
              <img 
                src="/restro.png" 
                alt="DineOS Platform" 
                className="w-full max-w-[650px] max-h-[45vh] lg:max-h-[50vh] object-contain object-left pointer-events-none z-10 drop-shadow-2xl"
              />
            </div>

          </div>
        </div>

      {/* ══════════════════════════════════════════════════════════════
          RIGHT SECTION — Login Card
      ══════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 z-20">
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

              {step === 1 ? (
                <div className="animate-step">
                  {/* Step 1: Role Selection */}
                  <div className="mb-6">
                    <h2 className="text-[24px] font-bold text-gray-900 tracking-tight flex items-center gap-2 mb-1">
                      Log in to your account
                    </h2>
                    <p className="text-gray-500 text-[13px]">Welcome back! Please enter your details.</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2">User Type</p>
                    
                    <div className="flex flex-col gap-3 mb-6">
                      {/* Root User Card */}
                      <label className={`relative flex items-start p-3.5 rounded-xl border cursor-pointer transition-all duration-300 ease-in-out backdrop-blur-md ${
                        loginType === 'admin' 
                          ? 'border-[#f97316]/60 bg-white/70 shadow-[0_8px_20px_rgba(249,115,22,0.08),inset_0_1px_1px_rgba(255,255,255,1)]' 
                          : 'border-white/50 bg-white/20 hover:bg-white/40 hover:border-white/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]'
                      }`}>
                        <input 
                          type="radio" 
                          name="userType"
                          checked={loginType === 'admin'} 
                          onChange={() => setLoginType('admin')} 
                          className="hidden" 
                        />
                        <div className={`flex items-center justify-center w-4 h-4 mt-0.5 rounded-full border shrink-0 transition-colors duration-300 ${loginType === 'admin' ? 'border-[#ea580c] bg-white' : 'border-gray-300 bg-white/50'}`}>
                          <div className={`w-2 h-2 rounded-full bg-[#ea580c] transition-all duration-300 ${loginType === 'admin' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                        </div>
                        <div className="ml-3">
                          <span className="block text-[14px] font-bold text-gray-900 mb-0.5">Root user login</span>
                          <span className="block text-[11px] text-gray-600 leading-relaxed">Account owner that performs tasks requiring unrestricted access.</span>
                        </div>
                      </label>

                      {/* IAM User Card */}
                      <label className={`relative flex items-start p-3.5 rounded-xl border cursor-pointer transition-all duration-300 ease-in-out backdrop-blur-md ${
                        loginType === 'user' 
                          ? 'border-[#f97316]/60 bg-white/70 shadow-[0_8px_20px_rgba(249,115,22,0.08),inset_0_1px_1px_rgba(255,255,255,1)]' 
                          : 'border-white/50 bg-white/20 hover:bg-white/40 hover:border-white/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]'
                      }`}>
                        <input 
                          type="radio" 
                          name="userType"
                          checked={loginType === 'user'} 
                          onChange={() => setLoginType('user')} 
                          className="hidden" 
                        />
                        <div className={`flex items-center justify-center w-4 h-4 mt-0.5 rounded-full border shrink-0 transition-colors duration-300 ${loginType === 'user' ? 'border-[#ea580c] bg-white' : 'border-gray-300 bg-white/50'}`}>
                          <div className={`w-2 h-2 rounded-full bg-[#ea580c] transition-all duration-300 ${loginType === 'user' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                        </div>
                        <div className="ml-3">
                          <span className="block text-[14px] font-bold text-gray-900 mb-0.5">IAM user</span>
                          <span className="block text-[11px] text-gray-600 leading-relaxed">User within an account that performs daily tasks.</span>
                        </div>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[20px] text-white font-bold text-[14px] transition-all bg-[#f97316] hover:bg-[#ea580c] shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.25)] relative mt-4"
                    >
                      <span className="tracking-wide">Next</span>
                      <div className="absolute right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#f97316]">
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-step">
                  {/* Step 2: Credentials Form */}
                  <div className="mb-6 relative">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="absolute -top-2 -left-2 p-2 text-gray-400 hover:text-gray-700 transition-colors bg-white/50 rounded-full hover:bg-white"
                      title="Back to role selection"
                    >
                      <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                    <div className="pt-8">
                      <h2 className="text-[24px] font-bold text-gray-900 tracking-tight flex items-center gap-2 mb-1">
                        {loginType === 'admin' ? 'Root Login' : 'IAM Login'} <span className="text-[20px]">👋</span>
                      </h2>
                      <p className="text-gray-500 text-[13px]">Enter your credentials to continue.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
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

                    {/* Forgot Password */}
                    <div className="flex items-center justify-end pt-1 pb-1">
                      <Link
                        to="/forgot-password"
                        className="text-[12px] font-semibold text-[#f97316] hover:text-[#ea580c] transition-colors"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    {error && (
                      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                        {error}
                      </div>
                    )}

                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[20px] text-white font-bold text-[14px] transition-all bg-[#f97316] hover:bg-[#ea580c] shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.25)] disabled:opacity-70 mt-2 relative"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Signing in...
                        </span>
                      ) : (
                        <>
                          <span className="tracking-wide">Login</span>
                          <div className="absolute right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#f97316]">
                            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </div>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Sign Up Link - Only for Root Users in Step 2 */}
                  {loginType === 'admin' && (
                    <div className="mt-5 text-center transition-all">
                      <p className="text-[13px] text-gray-700 font-medium">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[#f97316] font-bold hover:underline ml-1">
                          Sign up
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              )}

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
