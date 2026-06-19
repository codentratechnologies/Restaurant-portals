import { useState, useEffect } from 'react';
import { ref, get, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { Loader2, Edit2, X, Save, Store, LogOut } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PhoneInput from '../../components/common/PhoneInput';
import { useNavigate } from 'react-router-dom';

export default function ProfileSettings() {
 const navigate = useNavigate();
 const [userStr, setUserStr] = useState<string | null>(localStorage.getItem('restaurant_user'));
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [isEditing, setIsEditing] = useState(false);
 const [assignedBranch, setAssignedBranch] = useState<{ name: string; city?: string; address?: string } | null>(null);
 const [profileData, setProfileData] = useState({
 fullName: '',
 email: '',
 phoneExt: '+91',
 phone: '',
 role: '',
 adminId: '',
 id: ''
 });

 useEffect(() => {
 const fetchProfileData = async () => {
 if (!userStr) {
 setIsLoading(false);
 return;
 }
 try {
 const userObj = JSON.parse(userStr);
 const userRef = ref(rtdb, `users/${userObj.adminId}/${userObj.id}`);
 const snapshot = await get(userRef);
 
 if (snapshot.exists()) {
 const data = snapshot.val();
 const phoneData = data.phone || '';
 let pExt = '+91';
 let pNum = phoneData;
 if (phoneData.includes(' ')) {
 const parts = phoneData.split(' ');
 pExt = parts[0];
 pNum = parts.slice(1).join(' ');
 }

 setProfileData({
 fullName: data.fullName || data.name || (data.firstName ? `${data.firstName} ${data.lastName}`.trim() : ''),
 email: data.email || '',
 phoneExt: pExt,
 phone: pNum,
 role: data.role || 'Employee',
 adminId: userObj.adminId,
 id: userObj.id
 });

 // Fetch assigned branch if branchId exists
 if (data.branch) {
 try {
 const branchRef = ref(rtdb, `branch/${userObj.adminId}/${data.branch}`);
 const branchSnap = await get(branchRef);
 if (branchSnap.exists()) {
 const bd = branchSnap.val();
 setAssignedBranch({ name: bd.name || 'Unknown Branch', city: bd.city, address: bd.address });
 } else {
 setAssignedBranch({ name: data.branch });
 }
 } catch {
 setAssignedBranch({ name: data.branch });
 }
 }
 } else {
 // Fallback to local storage data since DB record might have been cleared
 const phoneData = userObj.phone || '';
 let pExt = '+91';
 let pNum = phoneData;
 if (phoneData.includes(' ')) {
 const parts = phoneData.split(' ');
 pExt = parts[0];
 pNum = parts.slice(1).join(' ');
 }

 setProfileData({
 fullName: userObj.fullName || userObj.name || (userObj.firstName ? `${userObj.firstName} ${userObj.lastName}`.trim() : ''),
 email: userObj.email || '',
 phoneExt: pExt,
 phone: pNum,
 role: userObj.role || 'Employee',
 adminId: userObj.adminId,
 id: userObj.id
 });
 if (userObj.branch) {
 try {
 const branchRef = ref(rtdb, `branch/${userObj.adminId}/${userObj.branch}`);
 const branchSnap = await get(branchRef);
 if (branchSnap.exists()) {
 const bd = branchSnap.val();
 setAssignedBranch({ name: bd.name || 'Unknown Branch', city: bd.city, address: bd.address });
 } else {
 setAssignedBranch({ name: userObj.branch });
 }
 } catch {
 setAssignedBranch({ name: userObj.branch });
 }
 }
 }
 } catch (error) {
 console.error('Error fetching profile:', error);
 toast.error('Failed to load profile data');
 } finally {
 setIsLoading(false);
 }
 };

 fetchProfileData();
 }, [userStr]);

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { name, value } = e.target;
 setProfileData(prev => ({ ...prev, [name]: value }));
 };

 const handleLogout = () => {
 localStorage.removeItem('restaurant_user');
 toast.success('Logged out successfully');
 navigate('/login');
 };

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!profileData.fullName.trim()) {
 toast.error('Name cannot be empty');
 return;
 }

 if (!profileData.phone || !/^\d{10}$/.test(profileData.phone)) {
 toast.error('Phone number must be exactly 10 digits');
 return;
 }
 
 setIsSaving(true);
 try {
 const userRef = ref(rtdb, `users/${profileData.adminId}/${profileData.id}`);
 const nameParts = profileData.fullName.split(' ');
 const firstName = nameParts[0];
 const lastName = nameParts.slice(1).join(' ');
 
 await update(userRef, {
 firstName: firstName,
 lastName: lastName,
 fullName: profileData.fullName,
 phone: `${profileData.phoneExt} ${profileData.phone}`
 });
 
 // Update local storage representation just in case
 if (userStr) {
 const userObj = JSON.parse(userStr);
 const updatedUser = { ...userObj, fullName: profileData.fullName, phone: `${profileData.phoneExt} ${profileData.phone}` };
 localStorage.setItem('restaurant_user', JSON.stringify(updatedUser));
 setUserStr(JSON.stringify(updatedUser));
 }
 
 toast.success('Profile updated successfully!');
 setIsEditing(false);
 } catch (error) {
 console.error('Error updating profile:', error);
 toast.error('Failed to update profile');
 } finally {
 setIsSaving(false);
 }
 };

 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-12">
 <Loader2 className="w-8 h-8 text-brand-orange-500 animate-spin" />
 </div>
 );
 }

 // Generate dynamic avatar based on name or email
 const seed = profileData.fullName || profileData.email || 'Admin';
 const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-black text-brand-navy">Profile Information</h2>
 <div className="flex items-center gap-3">
 {!isEditing ? (
 <Button onClick={() => setIsEditing(true)} className="gap-2 px-5 py-2" variant="outline">
 <Edit2 className="w-4 h-4" />
 Edit Profile
 </Button>
 ) : (
 <Button onClick={() => setIsEditing(false)} className="gap-2 px-5 py-2 bg-gray-100 text-text-secondary hover:bg-gray-200 border-none" variant="outline">
 <X className="w-4 h-4" />
 Cancel
 </Button>
 )}
 <Button onClick={handleLogout} className="gap-2 px-5 py-2 bg-red-50 text-red-600 hover:bg-red-100 border-red-100" variant="outline">
 <LogOut className="w-4 h-4" />
 Logout
 </Button>
 </div>
 </div>
 
 <Card className="p-8 border border-border/50 shadow-soft">
 <div className="flex items-center gap-6 pb-8 border-b border-border/60 mb-8">
 <div className="relative group">
 <img 
 src={avatarUrl} 
 alt="Profile" 
 className="w-24 h-24 rounded-full bg-brand-orange-50 border-2 border-white shadow-md transition-transform group-hover:scale-105"
 />
 </div>
 <div>
 <h3 className="text-2xl font-black text-brand-navy tracking-tight">{profileData.fullName || 'User'}</h3>
 <p className="text-sm font-bold text-text-secondary mt-1">{profileData.role}</p>
 </div>
 </div>

 <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-2">
 <label className="block text-sm font-bold text-text-primary mb-2">Full Name</label>
 <input 
 type="text" 
 name="fullName"
 className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium transition-all ${!isEditing ? 'opacity-80 cursor-not-allowed border-transparent' : 'border-border focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 focus:bg-white hover:border-brand-orange-300'}`}
 value={profileData.fullName} 
 onChange={handleInputChange}
 disabled={!isEditing}
 />
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-bold text-text-primary mb-2">Email Address</label>
 <input 
 type="email" 
 name="email"
 className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium opacity-80 cursor-not-allowed"
 value={profileData.email} 
 disabled
 />
 <p className="text-[11px] font-semibold text-text-secondary mt-1.5">Email cannot be changed.</p>
 </div>

 <div className="mt-[-28px]">
 <PhoneInput
 name="phone"
 value={profileData.phone}
 extValue={profileData.phoneExt}
 onChange={handleInputChange as any}
 onExtChange={handleInputChange as any}
 disabled={!isEditing}
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-text-primary mb-2">Role</label>
 <input 
 type="text" 
 name="role"
 className="w-full px-4 py-3 bg-brand-orange-50/50 border border-transparent rounded-xl text-sm font-bold text-brand-orange-800 opacity-80 cursor-not-allowed"
 value={profileData.role} 
 disabled 
 />
 </div>

 {assignedBranch && (
 <div>
 <label className="block text-sm font-bold text-text-primary mb-2">Assigned Branch</label>
 <div className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl flex items-start gap-3 opacity-90">
 <div className="w-9 h-9 rounded-lg bg-brand-orange-100 flex items-center justify-center shrink-0 border border-brand-orange-200 mt-0.5">
 <Store className="w-4 h-4 text-brand-orange-600" />
 </div>
 <div>
 <p className="text-sm font-bold text-brand-navy">{assignedBranch.name}</p>
 {(assignedBranch.city || assignedBranch.address) && (
 <p className="text-xs text-text-secondary font-medium mt-0.5">
 {[assignedBranch.address, assignedBranch.city].filter(Boolean).join(', ')}
 </p>
 )}
 </div>
 </div>
 <p className="text-[11px] font-semibold text-text-secondary mt-1.5">Branch assignment is managed by your admin.</p>
 </div>
 )}

 {isEditing && (
 <div className="pt-6 border-t border-border mt-8 flex justify-end">
 <Button type="submit" disabled={isSaving} className="gap-2 px-8 py-2.5 shadow-sm">
 {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
 {isSaving ? 'Saving...' : 'Save Changes'}
 </Button>
 </div>
 )}
 </form>
 </Card>
 </div>
 );
}

