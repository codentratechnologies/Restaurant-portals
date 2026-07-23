import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff, Shield, ArrowRight, Lock, Mail } from 'lucide-react';
import Background from '../../components/auth/Background';

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [emailError, setEmailError]     = useState('');
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
      navigate('/dashboard');
    } catch { /* error handled in context */ } finally { setLoading(false); }
  };

  return (
    <div className="h-screen w-full relative flex font-sans overflow-y-auto overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Background />
      </div>

      <div className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row max-w-[1600px] mx-auto">

        {/* ══ LEFT — Branding ══ */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center relative p-6 lg:p-10 xl:pl-20">
          <div className="w-full max-w-[550px] xl:max-w-[600px] z-20 flex flex-col justify-center mx-auto lg:mx-0 -translate-y-1 lg:-translate-y-2">

            <div className="mb-6 xl:mb-8 translate-y-6 lg:translate-y-10 xl:translate-y-12">
              <div className="mb-6 xl:mb-8 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-gray-900">DineOS</span>
              </div>

              <h2 className="text-[28px] lg:text-[32px] xl:text-[42px] font-black text-[#1e293b] leading-[1.2] mb-4 tracking-tight">
                The Control Center<br />
                <span className="text-[#7c3aed]">Super Admin</span>
              </h2>

              <p className="text-gray-600 text-[13px] lg:text-[14px] leading-[1.6] max-w-[400px]">
                Verify restaurant registrations, manage documents, approve accounts, and oversee the entire DineOS platform from one powerful dashboard.
              </p>
            </div>

            {/* Illustration area — 3 stat cards */}
            <div className="translate-y-8 lg:translate-y-14 xl:translate-y-18 grid grid-cols-3 gap-4 max-w-[420px]">
              {[
                { label: 'Restaurants', icon: '🏪' },
                { label: 'Pending', icon: '⏳' },
                { label: 'Approved', icon: '✅' },
              ].map(item => (
                <div key={item.label}
                  className="rounded-2xl p-4 text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.80) 0%, rgba(245,243,255,0.60) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1.5px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 8px 24px rgba(124,58,237,0.06), inset 0 1px 1px rgba(255,255,255,1)',
                  }}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-[11px] font-semibold text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT — Login Card ══ */}
        <div className="w-full lg:w-1/2 flex-1 lg:flex-none flex items-center justify-center p-4 sm:p-6 lg:p-12 z-20">
          <div className="w-full max-w-[360px] sm:max-w-[400px]">
            <div
              className="rounded-[24px] p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.35) 100%)',
                backdropFilter: 'blur(35px)',
                WebkitBackdropFilter: 'blur(35px)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 40px 80px -12px rgba(124,58,237,0.12), 0 16px 32px -8px rgba(0,0,0,0.08), inset 0 1px 1px rgba(255,255,255,1), inset 0 -1px 1px rgba(255,255,255,0.4)',
              }}
            >
              <style>{`
                @keyframes slideInFade {
                  from { opacity: 0; transform: translateY(15px); }
                  to   { opacity: 1; transform: translateY(0); }
                }
                .animate-step { animation: slideInFade 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
              `}</style>

              {/* Mobile Logo */}
              <div className="flex justify-center mb-6 lg:hidden">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-black text-gray-900">DineOS</span>
                </div>
              </div>

              <div className="animate-step">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full mb-3">
                    <Shield className="w-3.5 h-3.5 text-violet-600" strokeWidth={2} />
                    <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wide">Super Admin Portal</span>
                  </div>
                  <h2 className="text-[24px] font-bold text-gray-900 tracking-tight mb-1">
                    Sign in to your account
                  </h2>
                  <p className="text-gray-500 text-[13px]">Restricted access. Authorized personnel only.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Email */}
                  <div>
                    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all backdrop-blur-md ${
                      emailError ? 'border-red-400 bg-red-50/50' : 'border-white/60 bg-white/40 focus-within:bg-white/80 focus-within:border-[#7c3aed] shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]'
                    }`}>
                      <Mail className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={1.5} />
                      <input
                        id="sa-email"
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
                      passwordError ? 'border-red-400 bg-red-50/50' : 'border-white/60 bg-white/40 focus-within:bg-white/80 focus-within:border-[#7c3aed] shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]'
                    }`}>
                      <Lock className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={1.5} />
                      <input
                        id="sa-password"
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

                  {/* Forgot */}
                  <div className="flex items-center justify-end pt-1 pb-1">
                    <a
                      href="#"
                      className="text-[12px] font-semibold text-[#7c3aed] hover:text-[#6d28d9] transition-colors"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  {/* Auth Context Error */}
                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    id="sa-login-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[20px] text-white font-bold text-[14px] transition-all disabled:opacity-70 mt-2 relative"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}
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
                        <span className="tracking-wide">Sign In</span>
                        <div className="absolute right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#7c3aed]">
                          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </div>
                      </>
                    )}
                  </button>
                </form>

              </div>

              {/* Legal */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-start">
                <p className="text-[11px] text-gray-500 font-medium flex items-start gap-1.5 text-left leading-relaxed">
                  <Shield className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>
                    Restricted to authorized Super Admins only. All access attempts are logged and monitored.
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
