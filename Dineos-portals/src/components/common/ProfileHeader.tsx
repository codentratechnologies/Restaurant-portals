import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface ProfileHeaderProps {
  avatarUrl?: string;
  initials?: string;
  name: string;
  role: string;
  actions?: ReactNode;
}

export default function ProfileHeader({ avatarUrl, initials = 'U', name, role, actions }: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden border border-border/50 shadow-soft bg-white"
    >
      {/* Gradient banner */}
      <div className="h-36 w-full bg-gradient-to-br from-brand-orange-500 via-orange-400 to-amber-400 relative">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Avatar and info */}
      <div className="px-8 pb-6 -mt-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-end gap-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-navy to-slate-700 border-4 border-white shadow-xl flex items-center justify-center text-white text-2xl font-black shrink-0">
                {initials}
              </div>
            )}
            <div className="pb-1">
              <h2 className="text-xl font-black text-brand-navy leading-tight">{name}</h2>
              <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-brand-orange-100 text-brand-orange-700 text-xs font-bold border border-brand-orange-200">
                <User className="w-3 h-3" />
                {role}
              </span>
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 pb-1">
              {actions}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
