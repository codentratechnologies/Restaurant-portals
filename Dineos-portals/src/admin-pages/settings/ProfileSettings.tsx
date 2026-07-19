import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ref, get, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';
import {
  Edit3, X, LogOut, Check, Mail, Shield, Loader2, Save,
  Camera, Key
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileSettingsProps {
  editing?: boolean;
  onSetEditing?: (v: boolean) => void;
}

export default function ProfileSettings({ editing: editingProp, onSetEditing }: ProfileSettingsProps = {}) {
  const { user, logout } = useAuth();

  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [originalRestaurantName, setOriginalRestaurantName] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [_editing, _setEditing] = useState(false);
  const editing = editingProp !== undefined ? editingProp : _editing;
  const setEditing = onSetEditing ?? _setEditing;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const snap = await get(ref(rtdb, `admin_users/${user.uid}`));
        if (snap.exists()) {
          const d = snap.val();
          const n = d.authorized_person_name || d.name || '';
          const rn = d.restaurant_name || '';
          const e = d.email || user.email || '';
          setName(n);
          setRestaurantName(rn);
          setEmail(e);
          setRole(d.role || 'Admin');
          setOriginalName(n);
          setOriginalRestaurantName(rn);
        }
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await update(ref(rtdb, `admin_users/${user.uid}`), { name, authorized_person_name: name, restaurant_name: restaurantName });
      setOriginalName(name);
      setOriginalRestaurantName(restaurantName);
      toast.success('Profile updated');
      setEditing(false);
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };



  const handleCancel = () => {
    setName(originalName);
    setRestaurantName(originalRestaurantName);
    setEditing(false);
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      toast.success('Logged out');
    } catch (e) {
      toast.error('Failed to log out');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-brand-orange-500 animate-spin" />
    </div>
  );

  const initials = (originalName || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col lg:flex-row gap-6"
    >
      {/* ── LEFT SIDEBAR ── */}
      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.35 }}
        className="w-full lg:w-80 xl:w-96 shrink-0 space-y-4 self-start lg:sticky lg:top-6"
      >
        {/* Identity card */}
        <div
          className="rounded-2xl text-white p-6 sm:p-8 flex flex-col items-center gap-6 shadow-xl relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1e2340 0%, #2a3060 60%, #1a1f35 100%)' }}
        >
          <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/5 -translate-y-14 translate-x-14 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-brand-orange-500/10 translate-y-10 -translate-x-10 pointer-events-none" />

          {/* Avatar */}
          <div className="relative z-10">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-brand-orange-400 to-brand-orange-600 flex items-center justify-center text-white text-4xl font-black shadow-lg ring-4 ring-white/10">
              {initials}
            </div>
          </div>

          {/* Name / email / role */}
          <div className="text-center z-10 w-full">
            <p className="text-lg font-black leading-tight truncate">{originalName || 'Admin'}</p>
            <p className="text-sm text-white/70 font-medium mt-1 truncate max-w-full px-2">{originalRestaurantName || 'Restaurant'}</p>
            <p className="text-xs text-white/50 font-medium mt-1 truncate max-w-full px-2">{email}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full bg-brand-orange-500/20 border border-brand-orange-400/30 text-brand-orange-300 text-xs font-bold">
              <Shield className="w-2.5 h-2.5" />
              {role}
            </span>
          </div>

          {/* Info rows */}
          <div className="w-full z-10 space-y-2">
            <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Email</p>
                <p className="text-xs font-bold text-white truncate">{email || '—'}</p>
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 flex items-center gap-2.5">
              <Key className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Access Level</p>
                <p className="text-xs font-bold text-brand-orange-300 truncate">{role}</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full z-10 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-sm font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>

      </motion.aside>

      {/* ── RIGHT PANEL ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="flex-1 min-w-0 space-y-4"
      >
        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>

              <form onSubmit={handleSaveAccount}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-soft overflow-hidden">

                  <div className="px-4 sm:px-7 py-4 sm:py-6 border-b border-border/40">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Personal Information</p>
                    </div>
                    <div className="space-y-4 max-w-lg">

                      {/* Authorized Person Name */}
                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Authorized Person Name</label>
                        {editing ? (
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={saving}
                            autoFocus
                            className="w-full px-4 py-2.5 bg-white border-2 border-brand-orange-400 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/15 transition-all"
                          />
                        ) : (
                          <p className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-brand-navy">
                            {name || '—'}
                          </p>
                        )}
                      </div>

                      {/* Restaurant Name */}
                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Restaurant Name</label>
                        {editing ? (
                          <input
                            type="text"
                            value={restaurantName}
                            onChange={e => setRestaurantName(e.target.value)}
                            disabled={saving}
                            className="w-full px-4 py-2.5 bg-white border-2 border-brand-orange-400 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/15 transition-all"
                          />
                        ) : (
                          <p className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-brand-navy">
                            {restaurantName || '—'}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">
                          Email Address
                          <span className="ml-2 text-[10px] font-semibold text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded normal-case tracking-normal">read-only</span>
                        </label>
                        <p className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-text-secondary cursor-not-allowed truncate">
                          {email || '—'}
                        </p>
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Role</label>
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-orange-50 rounded-xl border border-brand-orange-200">
                          <Shield className="w-3.5 h-3.5 text-brand-orange-500 shrink-0" />
                          <span className="text-sm font-bold text-brand-orange-800">{role}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save bar */}
                  <AnimatePresence>
                    {editing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-7 py-4 bg-brand-orange-50 border-t border-brand-orange-100 flex flex-wrap sm:flex-nowrap items-center gap-3">
                          <Button type="submit" disabled={saving} className="gap-2">
                            {saving
                              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</>
                              : <><Check className="w-3.5 h-3.5" />Save Changes</>}
                          </Button>
                          <Button type="button" variant="secondary" size="sm" onClick={handleCancel} disabled={saving} className="gap-2">
                            <X className="w-3.5 h-3.5" />Cancel
                          </Button>
                          <span className="text-[11px] text-text-secondary font-medium ml-auto flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange-400 inline-block" />
                            Unsaved changes
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </motion.div>
      </motion.div>
      
      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        maxWidth="sm"
      >
        <div className="p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3">
            <LogOut className="w-8 h-8 text-red-500 -rotate-3" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black text-brand-navy mb-2 tracking-tight">Ready to leave?</h3>
          <p className="text-sm text-text-secondary mb-8 leading-relaxed px-2">
            Are you sure you want to log out? You will need to sign in again to access your account.
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
              className="w-full sm:flex-1 py-3"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleLogout}
              className="w-full sm:flex-1 py-3 bg-red-500 hover:bg-red-600 text-white border-transparent shadow-lg shadow-red-500/20"
            >
              Log Out
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
