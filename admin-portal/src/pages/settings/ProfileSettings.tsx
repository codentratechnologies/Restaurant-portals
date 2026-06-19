import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ref, get, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { Edit2, X, LogOut, Check } from 'lucide-react';
import Button from '../../components/common/Button';

export default function ProfileSettings() {
 const { user, logout } = useAuth();
 
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [role, setRole] = useState('');
 const [originalData, setOriginalData] = useState({ name: '', email: '' });
 
 const [loadingData, setLoadingData] = useState(true);
 const [saving, setSaving] = useState(false);
 const [isEditing, setIsEditing] = useState(false);

 useEffect(() => {
 async function fetchProfile() {
 if (!user) return;
 try {
 const userRef = ref(rtdb, `admin_users/${user.uid}`);
 const snapshot = await get(userRef);
 if (snapshot.exists()) {
 const data = snapshot.val();
 const loadedName = data.name || '';
 const loadedEmail = data.email || user.email || '';
 
 setName(loadedName);
 setEmail(loadedEmail);
 setRole(data.role || 'Admin');
 setOriginalData({ name: loadedName, email: loadedEmail });
 }
 } catch (err) {
 console.error('Error fetching profile:', err);
 toast.error('Failed to load profile data');
 } finally {
 setLoadingData(false);
 }
 }
 fetchProfile();
 }, [user]);

 const handleSave = async (e: FormEvent) => {
 e.preventDefault();
 if (!user) return;
 
 setSaving(true);
 try {
 const userRef = ref(rtdb, `admin_users/${user.uid}`);
 await update(userRef, {
 name,
 email,
 });
 setOriginalData({ name, email });
 toast.success('Profile updated successfully');
 setIsEditing(false);
 } catch (err) {
 console.error('Error saving profile:', err);
 toast.error('Failed to save changes');
 } finally {
 setSaving(false);
 }
 };

 const handleCancel = () => {
 setName(originalData.name);
 setEmail(originalData.email);
 setIsEditing(false);
 };

 if (loadingData) {
 return (
 <div className="flex items-center justify-center p-12">
 <div className="w-8 h-8 border-4 border-brand-orange-500 border-t-transparent rounded-full animate-spin" />
 </div>
 );
 }

 const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=f5f7fa`;

 return (
 <div className="space-y-6 relative">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-lg font-bold text-text-primary">Profile Information</h2>
 {!isEditing && (
 <button 
 onClick={() => setIsEditing(true)}
 className="flex items-center gap-2 text-sm font-medium text-brand-orange-600 hover:text-brand-orange-700 bg-brand-orange-50 hover:bg-brand-orange-100 px-4 py-2 rounded-lg transition-colors"
 >
 <Edit2 className="w-4 h-4" />
 Edit Profile
 </button>
 )}
 </div>
 
 <div className="flex items-center gap-6 pb-6 border-b border-border">
 <div className="relative">
 <img 
 src={avatarUrl}
 alt="Profile" 
 className="w-20 h-20 rounded-full bg-gray-100 border border-border object-cover"
 />
 </div>
 <div>
 <h3 className="text-sm font-bold text-text-primary">{originalData.name || 'Admin User'}</h3>
 <p className="text-xs text-text-secondary">{role}</p>
 </div>
 </div>

 <form className="space-y-6" onSubmit={handleSave}>
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
 {isEditing ? (
 <input 
 type="text" 
 className="input-field" 
 value={name}
 onChange={(e) => setName(e.target.value)}
 required
 disabled={saving}
 autoFocus
 />
 ) : (
 <p className="text-base font-semibold text-text-primary">{name || '-'}</p>
 )}
 </div>
 
 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1.5">Email Address</label>
 {isEditing ? (
 <input 
 type="email" 
 className="input-field" 
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 disabled={saving}
 />
 ) : (
 <p className="text-base font-semibold text-text-primary">{email || '-'}</p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-text-secondary mb-1.5">Role</label>
 <p className="text-base font-semibold text-text-primary">{role}</p>
 </div>

 {isEditing && (
 <div className="pt-4 flex items-center gap-3">
 <Button type="submit" variant="primary" disabled={saving} className="flex items-center gap-2">
 {saving ? 'Saving...' : (
 <>
 <Check className="w-4 h-4" />
 Save Changes
 </>
 )}
 </Button>
 <Button 
 type="button" 
 variant="secondary"
 onClick={handleCancel}
 disabled={saving}
 className="flex items-center gap-2"
 >
 <X className="w-4 h-4" />
 Cancel
 </Button>
 </div>
 )}
 </form>

 {!isEditing && (
 <div className="pt-6 mt-6 border-t border-border">
 <button
 type="button"
 onClick={logout}
 className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
 >
 <LogOut className="w-4 h-4" />
 Log Out
 </button>
 </div>
 )}
 </div>
 );
}
