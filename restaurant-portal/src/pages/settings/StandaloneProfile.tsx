import ProfileSettings from './ProfileSettings';

export default function StandaloneProfile() {
 return (
 <div className="max-w-[800px] mx-auto">
 <div className="bg-white rounded-2xl border border-border shadow-soft p-8">
 <h1 className="text-2xl font-bold text-brand-navy mb-1">My Profile</h1>
 <p className="text-text-secondary mb-8">Manage your personal account details and preferences.</p>
 
 <ProfileSettings />
 </div>
 </div>
 );
}
