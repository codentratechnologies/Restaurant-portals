import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Shield, User, ArrowRight, Lock, Mail } from 'lucide-react';

type LoginType = 'admin' | 'user';

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState<LoginType>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      navigate(loginType === 'admin' ? '/admin/dashboard' : '/restaurant/dashboard', { replace: true });
    } catch { /* error handled in context */ } finally { setLoading(false); }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex font-sans bg-[#fffcf9]">
      
      {/* ── Background SVG matching reference exactly ──────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            <linearGradient id="mainOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="lightOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffedd6" />
              <stop offset="100%" stopColor="#ffdbb0" />
            </linearGradient>
          </defs>

          {/* Light beige curvy wave on the left side */}
          <path d="M 400 0 C 650 300 350 600 550 900 L 700 900 C 500 600 800 300 550 0 Z" fill="url(#lightOrange)" opacity="0.7" />
          
          {/* Main heavy orange curved band in the middle */}
          <path d="M 520 0 C 770 300 420 600 620 900 L 980 900 C 780 600 1130 300 880 0 Z" fill="url(#mainOrange)" />

          {/* Outline floating icons inside the orange band */}
          <g stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.15">
            {/* Chef Hat */}
            <path d="M680,200 C670,180 690,170 700,180 C710,160 730,160 740,180 C750,170 770,180 760,200 L760,220 L680,220 Z" />
            {/* Leaves */}
            <path d="M780,300 C800,280 820,300 800,320 C780,340 760,320 780,300 Z" />
            <path d="M770,320 C750,330 740,350 760,360 C780,370 790,350 770,320 Z" />
            {/* Fork & Spoon */}
            <path d="M500,240 L500,280 M495,240 L495,260 M505,240 L505,260 M490,260 C490,270 510,270 510,260" />
            <path d="M530,240 C520,240 520,260 530,270 L530,280" />
            {/* Dots */}
            <circle cx="650" cy="400" r="2" fill="#ffffff" />
            <circle cx="670" cy="410" r="2" fill="#ffffff" />
            <circle cx="690" cy="390" r="2" fill="#ffffff" />
            <circle cx="700" cy="430" r="2" fill="#ffffff" />
            <circle cx="660" cy="450" r="2" fill="#ffffff" />
            <circle cx="710" cy="460" r="2" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          LEFT SECTION (Typography + Hero Images)
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col w-full lg:w-[48%] px-8 lg:px-16 xl:px-24 py-10 lg:py-16 justify-between">
        
        <div className="mt-4">
          {/* Logo */}
          <div className="flex flex-col items-start mb-12">
            <img src="/logo_horizontal.png" alt="DineOS" className="h-[42px] w-auto object-contain" />
            <p className="text-gray-500 text-[13px] mt-2.5 font-medium tracking-wide">Smart Restaurant Management</p>
          </div>

          {/* Hero text */}
          <div>
            <h1 className="text-[44px] lg:text-[54px] font-bold leading-[1.15] text-gray-900 tracking-tight">
              Manage Your<br />
              <span className="text-[#f97316]">Restaurant</span><br />
              Smarter
            </h1>
            <div className="mt-5 w-10 h-1 bg-[#f97316]" />
            <p className="text-gray-600 text-[15px] mt-8 leading-relaxed max-w-[340px]">
              DineOS helps you streamline orders, manage staff, track performance and grow your restaurant business with ease.
            </p>
          </div>
        </div>

        {/* Hero image cluster (Storefront + Tablet + Food) */}
        <div className="relative mt-12 lg:mt-0 w-full max-w-[550px] -ml-4">
          <img
            src="/hero_cluster.png"
            alt="DineOS Setup"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          RIGHT SECTION — Login Card
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 hidden lg:flex flex-1 items-center justify-center px-8 lg:px-16 py-10">
        <div className="w-full max-w-[480px]">
          <div
            className="bg-white rounded-[24px] p-10 xl:p-12"
            style={{ boxShadow: '0 20px 60px -15px rgba(0,0,0,0.1)' }}
          >
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-[32px] font-bold text-gray-900 tracking-tight flex items-center gap-2 mb-2">
                Welcome Back! <span className="text-[28px]">👋</span>
              </h2>
              <p className="text-gray-500 text-[15px]">Login to continue managing your restaurant.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              
              {/* Role Selection (Small subtle tabs) */}
              <div className="flex gap-3 mb-2">
                <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  loginType === 'admin' ? 'border-[#f97316] bg-orange-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <input type="radio" checked={loginType === 'admin'} onChange={() => setLoginType('admin')} className="hidden" />
                  <Shield className={`w-4 h-4 ${loginType === 'admin' ? 'text-[#f97316]' : 'text-gray-400'}`} />
                  <span className={`text-[13px] font-bold ${loginType === 'admin' ? 'text-[#ea580c]' : 'text-gray-600'}`}>Root User</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  loginType === 'user' ? 'border-[#f97316] bg-orange-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <input type="radio" checked={loginType === 'user'} onChange={() => setLoginType('user')} className="hidden" />
                  <User className={`w-4 h-4 ${loginType === 'user' ? 'text-[#f97316]' : 'text-gray-400'}`} />
                  <span className={`text-[13px] font-bold ${loginType === 'user' ? 'text-[#ea580c]' : 'text-gray-600'}`}>IAM User</span>
                </label>
              </div>

              {/* Email */}
              <div>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all bg-white ${
                  emailError ? 'border-red-400' : 'border-gray-200 focus-within:border-[#f97316]'
                }`}>
                  <Mail className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    placeholder="Email address"
                    disabled={loading}
                    className="flex-1 text-[15px] outline-none text-gray-900 placeholder:text-gray-400 bg-transparent"
                  />
                </div>
                {emailError && <p className="mt-1.5 text-xs text-red-600 font-medium pl-1">{emailError}</p>}
              </div>

              {/* Password */}
              <div>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all bg-white ${
                  passwordError ? 'border-red-400' : 'border-gray-200 focus-within:border-[#f97316]'
                }`}>
                  <Lock className="w-5 h-5 text-gray-400 shrink-0" strokeWidth={1.5} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                    placeholder="Password"
                    disabled={loading}
                    className="flex-1 text-[15px] outline-none text-gray-900 placeholder:text-gray-400 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 p-1"
                  >
                    {showPassword ? <Eye className="w-5 h-5" strokeWidth={1.5} /> : <EyeOff className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
                {passwordError && <p className="mt-1.5 text-xs text-red-600 font-medium pl-1">{passwordError}</p>}
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 pb-2">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded-[6px] flex items-center justify-center border transition-all shrink-0 ${
                      rememberMe ? 'bg-[#f97316] border-[#f97316]' : 'border-gray-300 bg-gray-50 group-hover:border-[#f97316]'
                    }`}
                  >
                    {rememberMe && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[14px] text-gray-700 font-medium">Remember Me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[14px] font-semibold text-[#f97316] hover:text-[#ea580c] transition-colors"
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
                className="w-full flex items-center justify-center gap-2 py-4 rounded-[30px] text-white font-bold text-[16px] transition-all bg-[#f97316] hover:bg-[#ea580c] shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.25)] disabled:opacity-70 mt-4 relative"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span className="tracking-wide">Login</span>
                    <div className="absolute right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#f97316]">
                      <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-10 text-center">
              <p className="text-[15px] text-gray-700 font-medium">
                Don't have an account?{' '}
                <Link to="/signup" className="text-[#f97316] font-bold hover:underline ml-1">
                  Sign Up →
                </Link>
              </p>
            </div>

            {/* Legal / Terms */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center">
              <p className="text-[13px] text-gray-500 font-medium flex items-center gap-1.5 max-w-[280px] text-center leading-relaxed">
                <Shield className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
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
  );
}
