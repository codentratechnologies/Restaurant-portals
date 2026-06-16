import { Link } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange-500 to-brand-orange-600 flex items-center justify-center shadow-soft">
          <UtensilsCrossed className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-brand-navy">DineOS</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-text-primary">Reset password</h2>
        <p className="text-sm text-text-secondary mt-2">Enter your email and we'll send you a reset link.</p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="admin@dineos.com"
          />
        </div>

        <button type="submit" className="w-full btn-primary">
          Send reset link
        </button>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to log in
          </Link>
        </div>
      </form>
    </div>
  );
}
