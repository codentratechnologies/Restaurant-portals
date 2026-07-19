import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import Background from './components/Background';

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
    
    if (!email || !/^\\S+@\\S+\\.\\S+$/.test(email)) {
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
          RIGHT SECTION — Forgot Password Card
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
                    Reset Password
                  </h2>
                  <p className="text-gray-500 text-[13px]">Enter your email and we'll send you a reset link.</p>
                </div>

                {success ? (
                  <div className="bg-white/60 border border-green-200/50 rounded-xl p-6 text-center backdrop-blur-sm mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-[16px] font-bold text-gray-900 mb-2">Check your email</h3>
                    <p className="text-[13px] text-gray-600">
                      We've sent a password reset link to <br/><span className="font-semibold text-gray-900">{email}</span>.
                    </p>
                    <div className="mt-6">
                      <Link to="/login" className="text-[13px] font-bold text-[#f97316] hover:text-[#ea580c] transition-colors">
                        Return to log in
                      </Link>
                    </div>
                  </div>
                ) : (
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

                    {displayError && (
                      <div className="rounded-xl bg-red-50/80 border border-red-200/50 px-4 py-3 text-sm text-red-700 font-medium backdrop-blur-sm">
                        {displayError}
                      </div>
                    )}

                    {/* Submit Button */}
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
                          Sending link...
                        </span>
                      ) : (
                        <>
                          <span className="tracking-wide">Send reset link</span>
                          <div className="absolute right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#f97316]">
                            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </div>
                        </>
                      )}
                    </button>

                    <div className="text-center mt-6">
                      <Link to="/login" className="inline-flex items-center justify-center gap-2 text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to log in
                      </Link>
                    </div>
                  </form>
                )}
              </div>

              {/* Legal / Terms */}
              <div className="mt-4 pt-4 border-t border-gray-100/50 flex justify-start">
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
