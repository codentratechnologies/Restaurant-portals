import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { hashPassword } from '../../lib/utils';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(''); setPasswordError(''); setError(null);
    let valid = true;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) { setEmailError('Please enter a valid email.'); valid = false; }
    if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); valid = false; }
    if (!valid) return;
    setLoading(true);
    try {
      const hashedPw = await hashPassword(password);
      const snap = await get(ref(rtdb, 'employee'));
      let matchedUser: any = null;
      if (snap.exists()) {
        const data = snap.val();
        for (const adminUid in data) {
          for (const branchCode in data[adminUid]) {
            const emps = data[adminUid][branchCode];
            if (typeof emps === 'object') {
              for (const empUid in emps) {
                const emp = emps[empUid];
                if (emp?.email === email && emp?.password === hashedPw)
                  matchedUser = { ...emp, branch: branchCode, id: empUid, adminId: adminUid };
              }
            }
          }
        }
      }
      if (matchedUser) {
        if (matchedUser.status === 'Inactive') setError('Your account is inactive. Contact your administrator.');
        else if (matchedUser.role === 'Delivery Partner') setError('Delivery Partners cannot access the Restaurant Portal.');
        else if (matchedUser.role === 'Branch Manager') {
          toast.success('Login successful!');
          localStorage.setItem('restaurant_user', JSON.stringify(matchedUser));
          navigate('/dashboard');
        } else setError('Unauthorized role');
      } else setError('Invalid credentials');
    } catch { setError('Failed to log in'); }
    finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex items-stretch"
      style={{ background: '#faf6f1' }}
    >
      {/* ── Orange wavy blob ────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M480,0 C560,60 600,160 580,280 C560,400 480,460 500,560 C520,660 640,700 660,800 C680,880 620,900 580,900 L380,900 C340,900 280,860 260,800 C240,740 300,680 280,580 C260,480 180,440 160,340 C140,240 200,120 240,60 C280,0 360,-20 480,0 Z"
            fill="#f97316"
            opacity="0.12"
          />
          <path
            d="M560,0 C640,80 680,180 650,300 C620,420 530,470 550,580 C570,690 680,720 690,820 C700,900 640,920 600,900 L420,900 C380,880 320,840 310,780 C300,720 360,660 340,560 C320,460 240,420 220,320 C200,220 260,100 310,40 C360,-20 480,-80 560,0 Z"
            fill="#f97316"
            opacity="0.18"
          />
        </svg>

        {/* Scattered food icon dots */}
        {[
          { x: '72%', y: '8%', r: 28, o: 0.08 },
          { x: '78%', y: '25%', r: 18, o: 0.06 },
          { x: '68%', y: '40%', r: 22, o: 0.07 },
          { x: '85%', y: '55%', r: 14, o: 0.05 },
          { x: '25%', y: '80%', r: 20, o: 0.06 },
          { x: '10%', y: '60%', r: 16, o: 0.05 },
        ].map((dot, i) => (
          <circle key={i} cx={dot.x} cy={dot.y} r={dot.r} fill="#f97316" opacity={dot.o} />
        ))}

        {/* Subtle fork/spoon SVG icons on bg */}
        <text x="74%" y="12%" fontSize="36" fill="#f97316" opacity="0.10" fontFamily="serif">🍴</text>
        <text x="82%" y="30%" fontSize="28" fill="#f97316" opacity="0.10" fontFamily="serif">🍽️</text>
        <text x="70%" y="50%" fontSize="24" fill="#f97316" opacity="0.08" fontFamily="serif">🥄</text>
        <text x="88%" y="70%" fontSize="20" fill="#f97316" opacity="0.08" fontFamily="serif">🍴</text>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          LEFT SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col justify-between w-full lg:w-[52%] px-10 xl:px-16 py-10">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/logo_horizontal.png" alt="DineOS" className="h-12 w-auto object-contain" />
          <p className="text-gray-500 text-sm mt-1 font-medium">Smart Restaurant Management</p>
        </motion.div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-10 lg:mt-0"
        >
          <h1 className="text-[42px] xl:text-5xl font-black leading-tight text-gray-900 tracking-tight">
            Manage Your<br />
            <span style={{ color: '#f97316' }}>Restaurant</span><br />
            Smarter
          </h1>
          {/* Orange underline */}
          <div className="mt-2 w-10 h-1 rounded-full" style={{ background: '#f97316' }} />
          <p className="text-gray-500 text-sm mt-4 leading-relaxed max-w-xs">
            DineOS helps you streamline orders, manage staff, track performance and grow your restaurant business with ease.
          </p>
        </motion.div>

        {/* Hero images — restaurant + tablet */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="relative mt-8 lg:mt-0 flex items-end"
          style={{ minHeight: 280 }}
        >
          {/* Restaurant storefront */}
          <img
            src="/dineos_restaurant_storefront.png"
            alt="DineOS Restaurant"
            className="w-[220px] xl:w-[260px] object-contain drop-shadow-xl relative z-10"
          />

          {/* Dashboard tablet — overlapping */}
          <img
            src="/dineos_dashboard_tablet.png"
            alt="DineOS Dashboard"
            className="w-[220px] xl:w-[260px] object-contain drop-shadow-xl absolute left-32 xl:left-40 bottom-0 z-20"
          />

          {/* Food bowl — peeking from bottom right */}
          <img
            src="/floating_food_3d.png"
            alt=""
            className="w-[100px] xl:w-[120px] object-contain absolute -bottom-2 left-52 xl:left-64 z-30 drop-shadow-lg"
          />
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RIGHT SECTION — Login Card
      ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 hidden lg:flex flex-1 items-center justify-center px-8 xl:px-16 py-10">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
          style={{ maxWidth: 420 }}
        >
          <div
            className="bg-white rounded-3xl p-8 xl:p-10"
            style={{
              boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
            }}
          >
            {/* Card heading */}
            <div className="mb-7">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Welcome Back! <span>👋</span>
              </h2>
              <p className="text-gray-500 text-sm mt-1">Login to continue managing your restaurant.</p>
            </div>

            <form onSubmit={handleLogin} noValidate className="space-y-4">

              {/* Email */}
              <div>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all bg-white ${
                  emailError
                    ? 'border-red-400'
                    : 'border-gray-200 focus-within:border-orange-400 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.10)]'
                }`}>
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    placeholder="Email address"
                    disabled={loading}
                    className="flex-1 text-sm outline-none text-gray-800 placeholder:text-gray-400 bg-transparent"
                  />
                </div>
                {emailError && <p className="mt-1.5 text-xs text-red-600 font-medium">{emailError}</p>}
              </div>

              {/* Password */}
              <div>
                <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all bg-white ${
                  passwordError
                    ? 'border-red-400'
                    : 'border-gray-200 focus-within:border-orange-400 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.10)]'
                }`}>
                  <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                    placeholder="Password"
                    disabled={loading}
                    className="flex-1 text-sm outline-none text-gray-800 placeholder:text-gray-400 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && <p className="mt-1.5 text-xs text-red-600 font-medium">{passwordError}</p>}
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center border-2 transition-all shrink-0 ${
                      rememberMe
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-gray-300 bg-white group-hover:border-orange-400'
                    }`}
                  >
                    {rememberMe && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className="text-sm text-gray-700 font-medium">Remember Me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold transition-colors"
                  style={{ color: '#f97316' }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium"
                >
                  {error}
                </motion.div>
              )}

              {/* Login button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.015 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="relative w-full flex items-center justify-center py-4 rounded-2xl text-white font-bold text-base overflow-hidden disabled:opacity-60 transition-opacity"
                style={{
                  background: loading ? '#fbbf94' : 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                  boxShadow: loading ? 'none' : '0 6px 24px rgba(249,115,22,0.38)',
                }}
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
                    {/* Arrow badge */}
                    <span className="absolute right-3 w-9 h-9 rounded-full bg-white/25 flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-500 mt-6 font-medium">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold transition-colors"
                style={{ color: '#f97316' }}
              >
                Sign Up →
              </Link>
            </p>

            {/* Legal */}
            <p className="text-center text-[11.5px] text-gray-400 mt-5 leading-relaxed">
              <svg className="inline w-3.5 h-3.5 mr-1 mb-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              By continuing, you agree to our{' '}
              <a href="#" className="transition-colors" style={{ color: '#f97316' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="transition-colors" style={{ color: '#f97316' }}>Privacy Policy</a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Mobile: show card below hero */}
      <div className="lg:hidden relative z-10 w-full px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div
            className="bg-white rounded-3xl p-6"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}
          >
            <div className="mb-6">
              <h2 className="text-xl font-black text-gray-900">Welcome Back! 👋</h2>
              <p className="text-gray-500 text-sm mt-1">Login to continue managing your restaurant.</p>
            </div>
            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                emailError ? 'border-red-400' : 'border-gray-200 focus-within:border-orange-400'
              }`}>
                <Mail className="w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" disabled={loading} className="flex-1 text-sm outline-none text-gray-800 placeholder:text-gray-400 bg-transparent" />
              </div>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                passwordError ? 'border-red-400' : 'border-gray-200 focus-within:border-orange-400'
              }`}>
                <Lock className="w-4 h-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" disabled={loading} className="flex-1 text-sm outline-none text-gray-800 placeholder:text-gray-400 bg-transparent" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400">{showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)' }}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">Don't have an account? <Link to="/signup" className="font-bold" style={{ color: '#f97316' }}>Sign Up</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
