import { useState, useEffect } from 'react';
import { ref, get, update, onValue } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';
import {
  Loader2, X, Save, Store, LogOut, Phone, Shield,
  MapPin, Users, Building2, CheckCircle2, Camera
} from 'lucide-react';
import Button from '../../components/common/Button';
import PhoneInput from '../../components/common/PhoneInput';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

type Tab = 'profile' | 'employees';

interface ProfileSettingsProps {
  editing?: boolean;
  onSetEditing?: (v: boolean) => void;
}

export default function ProfileSettings({ editing: editingProp, onSetEditing }: ProfileSettingsProps = {}) {
  const { logout, user, userData, activeAssignment } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [_editing, _setEditing] = useState(false);
  const editing = editingProp !== undefined ? editingProp : _editing;
  const setEditing = onSetEditing ?? _setEditing;
  const [branch, setBranch] = useState<{ name: string; city?: string; address?: string; code?: string } | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [empFilter, setEmpFilter] = useState('');
  const [profile, setProfile] = useState({
    fullName: '', email: '', phoneExt: '+91', phone: '', role: '', adminId: '', id: '', branchId: ''
  });
  const [original, setOriginal] = useState({ fullName: '', phone: '', phoneExt: '+91' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user || !userData || !activeAssignment) return;
      try {
        const { adminId, branchId, role } = activeAssignment;
        
        let src: any = { ...userData };
        let empId = user.uid;

        if (branchId) {
          const empSnap = await get(ref(rtdb, `employee/${adminId}/${branchId}`));
          if (empSnap.exists()) {
            const allEmps = empSnap.val();
            const matchingEmpEntry = Object.entries(allEmps).find(([_id, e]: [string, any]) => e.email === user.email);
            if (matchingEmpEntry) {
              empId = matchingEmpEntry[0];
              src = { ...src, ...matchingEmpEntry[1] as any };
            }
          }
        }

        const rawPhone = src.phone || src.mobileNumber || '';
        let pExt = '+91', pNum = rawPhone;
        if (rawPhone.includes(' ')) {
          const p = rawPhone.split(' ');
          pExt = p[0];
          pNum = p.slice(1).join(' ');
        }

        const fullName = src.fullName || src.name || (src.firstName ? `${src.firstName} ${src.lastName || ''}`.trim() : '');
        
        const data = {
          fullName,
          email: src.email || '',
          phoneExt: pExt,
          phone: pNum,
          role: role || 'Employee',
          adminId: adminId,
          id: empId,
          branchId: branchId || ''
        };
        
        setProfile(data);
        setOriginal({ fullName: data.fullName, phone: data.phone, phoneExt: data.phoneExt });

        if (branchId) {
          try {
            const bSnap = await get(ref(rtdb, `branch/${adminId}`));
            if (bSnap.exists()) {
              const all = bSnap.val();
              const bd = all[branchId] || (Object.values(all) as any[]).find((b: any) => b.code === branchId);
              setBranch(bd
                ? { name: bd.name || 'Branch', city: bd.city, address: bd.address, code: bd.code || branchId }
                : { name: branchId, code: branchId });
            }
          } catch {
            setBranch({ name: branchId, code: branchId });
          }
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, userData, activeAssignment]);

  useEffect(() => {
    if (!activeAssignment?.adminId || !activeAssignment?.branchId) return;
    return onValue(ref(rtdb, `employee/${activeAssignment.adminId}/${activeAssignment.branchId}`), snap => {
      setEmployees(snap.exists()
        ? Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] }))
        : []);
    });
  }, [activeAssignment]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleCancel = () => {
    setProfile(p => ({ ...p, fullName: original.fullName, phone: original.phone, phoneExt: original.phoneExt }));
    setEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.fullName.trim()) { toast.error('Name required'); return; }
    if (!/^\d{10}$/.test(profile.phone)) { toast.error('10-digit phone required'); return; }
    setSaving(true);
    try {
      const parts = profile.fullName.split(' ');
      const updates: any = {
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
        fullName: profile.fullName,
        phone: `${profile.phoneExt} ${profile.phone}`
      };
      
      if (profile.branchId) {
        // Update employee profile
        await update(ref(rtdb, `employee/${profile.adminId}/${profile.branchId}/${profile.id}`), updates);
      }

      setOriginal({ fullName: profile.fullName, phone: profile.phone, phoneExt: profile.phoneExt });
      toast.success('Profile saved');
      setEditing(false);
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
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

  const initials = (profile.fullName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const activeCount = employees.filter(e => (e.status || 'Active') === 'Active').length;
  const filteredEmps = empFilter
    ? employees.filter(e =>
        (e.firstName + ' ' + e.lastName).toLowerCase().includes(empFilter.toLowerCase()) ||
        (e.role || '').toLowerCase().includes(empFilter.toLowerCase())
      )
    : employees;

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
          {/* Background decorations */}
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
            <p className="text-lg font-black leading-tight truncate">{profile.fullName || 'User'}</p>
            <p className="text-sm text-white/50 font-medium mt-1 truncate max-w-full px-2">{profile.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full bg-brand-orange-500/20 border border-brand-orange-400/30 text-brand-orange-300 text-xs font-bold">
              <Shield className="w-2.5 h-2.5" />
              {profile.role}
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2 w-full z-10">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
              <p className="text-2xl font-black">{employees.length}</p>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-1">Team</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
              <p className="text-2xl font-black text-brand-orange-400">{activeCount}</p>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mt-1">Active</p>
            </div>
          </div>

          {/* Branch pill */}
          {branch && (
            <div className="w-full z-10 rounded-xl bg-white/5 border border-white/10 p-3 flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-4 h-4 text-brand-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider mb-0.5">Branch</p>
                <p className="text-sm font-bold text-white truncate">{branch.name}</p>
                {(branch.city || branch.address) && (
                  <p className="text-[11px] text-white/40 mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    {[branch.address, branch.city].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

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

        {/* Contact card */}
        <div className="rounded-2xl bg-white border border-border/50 shadow-soft p-5 space-y-3">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Quick Info</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-orange-50 border border-brand-orange-100 flex items-center justify-center shrink-0">
              <Phone className="w-3.5 h-3.5 text-brand-orange-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wide">Phone</p>
              <p className="text-sm font-bold text-brand-navy truncate">
                {profile.phone ? `${profile.phoneExt} ${profile.phone}` : '—'}
              </p>
            </div>
          </div>
          {branch && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-orange-50 border border-brand-orange-100 flex items-center justify-center shrink-0">
                <Store className="w-3.5 h-3.5 text-brand-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wide">Branch Code</p>
                <p className="text-sm font-bold text-brand-navy font-mono truncate">{branch.code || '—'}</p>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ── RIGHT PANEL ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="flex-1 min-w-0 space-y-4"
      >
        {/* Tab bar — SEPARATE from actions */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-soft px-3 sm:px-5 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-shrink-0 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setTab('profile')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                tab === 'profile' ? 'bg-white text-brand-navy shadow-sm' : 'text-text-secondary hover:text-brand-navy'
              }`}
            >
              <Shield className="w-3 h-3" />
              Profile Details
            </button>
            <button
              onClick={() => setTab('employees')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                tab === 'employees' ? 'bg-white text-brand-navy shadow-sm' : 'text-text-secondary hover:text-brand-navy'
              }`}
            >
              <Users className="w-3 h-3" />
              Branch Employees
              {employees.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand-orange-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                  {employees.length}
                </span>
              )}
            </button>
          </div>


          {tab === 'employees' && (
            <input
              type="text"
              placeholder="Search…"
              value={empFilter}
              onChange={e => setEmpFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 w-full sm:w-48 transition-all"
            />
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {tab === 'profile' ? (
            <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              <form onSubmit={handleSave}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-soft overflow-hidden">

                  {/* Section: Personal */}
                  <div className="px-4 sm:px-7 py-4 sm:py-6 border-b border-border/40">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-5">Personal Information</p>
                    <div className="space-y-4 max-w-lg">

                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Full Name</label>
                        {editing ? (
                          <input
                            type="text"
                            name="fullName"
                            value={profile.fullName}
                            onChange={handleInput}
                            disabled={saving}
                            autoFocus
                            className="w-full px-4 py-2.5 bg-white border-2 border-brand-orange-400 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/15 transition-all"
                          />
                        ) : (
                          <p className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-brand-navy border border-transparent">
                            {profile.fullName || '—'}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">
                          Email Address
                          <span className="ml-2 text-[10px] font-semibold text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded normal-case tracking-normal">read-only</span>
                        </label>
                        <p className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-text-secondary border border-transparent cursor-not-allowed truncate">
                          {profile.email || '—'}
                        </p>
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1.5">Role</label>
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-orange-50 rounded-xl border border-brand-orange-200">
                          <Shield className="w-3.5 h-3.5 text-brand-orange-500 shrink-0" />
                          <span className="text-sm font-bold text-brand-orange-800">{profile.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Contact */}
                  <div className="px-4 sm:px-7 py-4 sm:py-6 border-b border-border/40">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-5">Contact Information</p>
                    <div className="max-w-sm">
                      <PhoneInput
                        name="phone"
                        value={profile.phone}
                        extValue={profile.phoneExt}
                        onChange={handleInput as any}
                        onExtChange={(e: any) => setProfile(p => ({ ...p, phoneExt: e.target.value }))}
                        disabled={!editing || saving}
                      />
                    </div>
                  </div>

                  {/* Section: Branch */}
                  {branch && (
                    <div className="px-4 sm:px-7 py-4 sm:py-6 border-b border-border/40">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-5">Branch Assignment</p>
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-border/50 max-w-lg">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange-400 to-brand-orange-600 flex items-center justify-center shadow-sm shrink-0">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-brand-navy text-sm">{branch.name}</p>
                            {branch.code && branch.code !== branch.name && (
                              <code className="text-[10px] bg-gray-200 text-text-secondary px-1.5 py-0.5 rounded font-mono">
                                {branch.code}
                              </code>
                            )}
                          </div>
                          {(branch.city || branch.address) && (
                            <p className="text-xs text-text-secondary font-medium mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {[branch.address, branch.city].filter(Boolean).join(', ')}
                            </p>
                          )}
                          <p className="text-[11px] text-text-secondary/70 mt-1.5">Assigned by your admin</p>
                        </div>
                      </div>
                    </div>
                  )}

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
                              : <><Save className="w-3.5 h-3.5" />Save Changes</>}
                          </Button>
                          <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving} size="sm" className="gap-2">
                            <X className="w-3.5 h-3.5" />Cancel
                          </Button>
                          <span className="text-[11px] text-text-secondary font-medium ml-auto flex items-center gap-1">
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
          ) : (
            <motion.div key="employees" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              <div className="bg-white rounded-2xl border border-border/50 shadow-soft overflow-hidden">
                {/* Header */}
                <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Team Members</p>
                    <p className="text-base font-black text-brand-navy mt-0.5">{branch?.name || 'Branch'}</p>
                  </div>
                  <span className="text-xs font-bold text-text-secondary">
                    {filteredEmps.length} {empFilter ? `of ${employees.length}` : ''} members
                  </span>
                </div>

                {filteredEmps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                      <Users className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="font-bold text-text-secondary text-sm">
                      {empFilter ? 'No results found' : 'No employees assigned'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {filteredEmps.map((emp, i) => {
                      const empName = [emp.firstName, emp.lastName].filter(Boolean).join(' ') || emp.fullName || emp.name || 'Employee';
                      const initial = empName.charAt(0).toUpperCase();
                      const isActive = (emp.status || 'Active') === 'Active';
                      return (
                        <motion.div
                          key={emp.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-3 sm:gap-4 px-4 sm:px-7 py-4 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ${
                            isActive ? 'bg-gradient-to-br from-brand-orange-400 to-brand-orange-600' : 'bg-gray-300'
                          }`}>
                            {initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-brand-navy truncate">{empName}</p>
                            <p className="text-xs text-text-secondary font-medium mt-0.5 truncate">
                              {emp.role || 'Employee'}
                              {(emp.phone || emp.mobileNumber) && <> · {emp.phone || emp.mobileNumber}</>}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              <Badge variant="error">{emp.status || 'Inactive'}</Badge>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Log Out"
      >
        <div className="space-y-6">
          <p className="text-text-secondary text-sm">
            Are you sure you want to log out? You will need to sign in again to access your account.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white border-transparent"
            >
              Log Out
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
