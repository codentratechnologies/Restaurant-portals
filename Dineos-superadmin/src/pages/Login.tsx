import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // error is shown from context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}>
      
      {/* Left – Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-16 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-brand-purple-500/20 border border-brand-purple-500/30 rounded-3xl mb-8 backdrop-blur-sm">
            <Shield className="w-12 h-12 text-brand-purple-400" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 leading-tight">
            DineOS<br />
            <span className="text-brand-purple-400">Super Admin</span>
          </h1>
          <p className="text-white/60 text-lg max-w-sm leading-relaxed">
            The command center for verifying restaurants, managing accounts, and overseeing the entire DineOS platform.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { label: 'Restaurants', value: '—' },
              { label: 'Pending Review', value: '—' },
              { label: 'Approved', value: '—' },
            ].map(stat => (
              <div key={stat.label} className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right – Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white/[0.02]">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-brand-purple-500/20 border border-brand-purple-500/30 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-purple-400" />
            </div>
            <span className="text-white font-bold text-lg">DineOS Super Admin</span>
          </div>

          <div className="bg-white rounded-3xl shadow-floating p-8 sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500">Sign in to your Super Admin account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="sa-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="superadmin@dineos.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="sa-password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="sa-login-btn"
                type="submit"
                disabled={submitting || loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-2"
                style={{ background: submitting ? undefined : 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Sign In to Admin Panel
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-8">
              This portal is restricted to authorized Super Admins only.<br />
              Unauthorized access attempts are logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
