import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ref, get, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';
import { Mail, Phone, Calendar, User, Camera, Store, Clock, FileText, CheckCircle, Clock3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileSettingsProps {
  isEditing?: boolean;
  setIsEditing?: (val: boolean) => void;
}

export default function ProfileSettings({ isEditing = false, setIsEditing }: ProfileSettingsProps) {
  const { user, activeAssignment } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [joinedDate, setJoinedDate] = useState('');
  const [role, setRole] = useState('Super Admin');
  const [restaurantDetails, setRestaurantDetails] = useState<any>(null);

  // Editable Operational Details
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [operatingDays, setOperatingDays] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const snap = await get(ref(rtdb, `admin_users/${user.uid}`));
        if (snap.exists()) {
          const d = snap.val();
          setName(d.name || d.authorized_person_name || 'Admin User');
          setEmail(d.email || user.email || 'admin@dineos.com');
          setPhone(d.phone || d.mobile || d.restaurant_details?.contactInfo?.primaryPhone || '');
          if (d.createdAt) {
            const date = new Date(d.createdAt);
            if (!isNaN(date.getTime())) {
              setJoinedDate(`Joined on ${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`);
            }
          }
          const dbRole = d.role || 'Super Admin';
          setRole(dbRole.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()));
          
          if (d.restaurant_details) {
            setRestaurantDetails(d.restaurant_details);
            if (d.restaurant_details.operationalDetails) {
              setOpeningTime(d.restaurant_details.operationalDetails.openingTime || '09:00');
              setClosingTime(d.restaurant_details.operationalDetails.closingTime || '22:00');
              setOperatingDays(d.restaurant_details.operationalDetails.operatingDays || []);
            }
          }
        } else {
           setName('Admin User');
           setEmail(user.email || 'admin@dineos.com');
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
      const updateData: any = { name };
      
      if (phone) {
        updateData.phone = phone;
        if (restaurantDetails?.contactInfo) {
          updateData['restaurant_details/contactInfo/primaryPhone'] = phone;
        }
      }

      if (restaurantDetails?.operationalDetails) {
         updateData['restaurant_details/operationalDetails/openingTime'] = openingTime;
         updateData['restaurant_details/operationalDetails/closingTime'] = closingTime;
         updateData['restaurant_details/operationalDetails/operatingDays'] = operatingDays;
      }

      await update(ref(rtdb, `admin_users/${user.uid}`), updateData);
      toast.success('Profile updated successfully');
      if (setIsEditing) setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col gap-6">
      
      {/* ── TOP SECTION: 2 COLUMNS ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* ── LEFT SIDEBAR ── */}
        <div className="w-full lg:w-[320px] xl:w-[350px] shrink-0 flex flex-col gap-6">
        
        {/* Card 1: Profile Summary */}
        <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-6 sm:p-8 flex flex-col items-center">
          
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-sm">
              {activeAssignment?.logoUrl ? (
                <img src={activeAssignment.logoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" alt="Profile" className="w-full h-full object-cover" />
              )}
            </div>
            <button className="absolute bottom-1 right-1 w-8 h-8 bg-white border border-[#E8ECF4] rounded-full shadow-sm flex items-center justify-center text-[#8896AB] hover:text-[#FF6B00] transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl font-black text-[#1a1f36] mb-2">{name}</h2>
          <span className="px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-md text-xs font-bold mb-8">
            {role}
          </span>

          <div className="w-full space-y-4 text-sm font-bold text-[#1a1f36]">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#8896AB] shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            {phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#8896AB] shrink-0" />
                <span className="truncate">{phone}</span>
              </div>
            )}
            {joinedDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#8896AB] shrink-0" />
                <span className="truncate">{joinedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Operational Details */}
        {restaurantDetails?.operationalDetails && (
          <div className="flex-1 bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="text-lg font-bold text-[#1a1f36]">Operational Details</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#1a1f36] mb-2">Operating Hours</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="time" 
                    value={openingTime} 
                    onChange={e => setOpeningTime(e.target.value)} 
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 rounded-xl text-[13px] font-medium text-[#1a1f36] shadow-sm transition-colors ${
                      isEditing 
                        ? 'bg-white border border-[#E8ECF4] focus:outline-none focus:border-[#FF6B00]' 
                        : 'bg-[#F4F6FA] border border-[#E8ECF4] text-[#8896AB] cursor-not-allowed'
                    }`}
                    form="profile-form" 
                  />
                  <span className="text-sm font-bold text-[#8896AB]">to</span>
                  <input 
                    type="time" 
                    value={closingTime} 
                    onChange={e => setClosingTime(e.target.value)} 
                    disabled={!isEditing}
                    className={`w-full px-4 py-2.5 rounded-xl text-[13px] font-medium text-[#1a1f36] shadow-sm transition-colors ${
                      isEditing 
                        ? 'bg-white border border-[#E8ECF4] focus:outline-none focus:border-[#FF6B00]' 
                        : 'bg-[#F4F6FA] border border-[#E8ECF4] text-[#8896AB] cursor-not-allowed'
                    }`}
                    form="profile-form" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1a1f36] mb-2">Operating Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                    const isActive = operatingDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        disabled={!isEditing}
                        onClick={() => {
                          setOperatingDays(prev => 
                            isActive ? prev.filter(d => d !== day) : [...prev, day]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[13px] font-medium shadow-sm transition-colors ${
                          !isEditing 
                            ? (isActive ? 'bg-[#F4F6FA] text-[#1a1f36] border border-[#E8ECF4] cursor-not-allowed' : 'bg-white border border-[#E8ECF4] text-[#8896AB] opacity-50 cursor-not-allowed')
                            : (isActive ? 'bg-[#FF6B00] text-white border border-[#FF6B00]' : 'bg-white border border-[#E8ECF4] text-[#8896AB] hover:border-[#FF6B00] hover:text-[#FF6B00]')
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Card 1: Personal Information */}
        <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-6 sm:p-8">
          <form id="profile-form" onSubmit={handleSaveAccount}>
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="text-lg font-bold text-[#1a1f36]">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-[#1a1f36] mb-2">Full Name <span className="text-[#FF6B00]">*</span></label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 rounded-xl text-[13px] font-medium text-[#1a1f36] shadow-sm transition-colors ${
                  isEditing 
                    ? 'bg-white border border-[#E8ECF4] focus:outline-none focus:border-[#FF6B00]' 
                    : 'bg-[#F4F6FA] border border-[#E8ECF4] text-[#8896AB] cursor-not-allowed'
                }`}
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-bold text-[#1a1f36] mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 bg-[#F4F6FA] border border-[#E8ECF4] rounded-xl text-[13px] font-medium text-[#8896AB] cursor-not-allowed shadow-sm"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-bold text-[#1a1f36] mb-2">Role</label>
              <input
                type="text"
                value={role}
                disabled
                className="w-full px-4 py-2.5 bg-[#F4F6FA] border border-[#E8ECF4] rounded-xl text-[13px] font-medium text-[#8896AB] cursor-not-allowed shadow-sm"
              />
            </div>

            {/* Primary Phone Number */}
            {phone && (
              <div>
                <label className="block text-sm font-bold text-[#1a1f36] mb-2">Primary Phone Number <span className="text-[#FF6B00]">*</span></label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 rounded-xl text-[13px] font-medium text-[#1a1f36] shadow-sm transition-colors ${
                    isEditing 
                      ? 'bg-white border border-[#E8ECF4] focus:outline-none focus:border-[#FF6B00]' 
                      : 'bg-[#F4F6FA] border border-[#E8ECF4] text-[#8896AB] cursor-not-allowed'
                  }`}
                />
              </div>
            )}
          </div>
        </form>
        </div>

        {restaurantDetails && (
          <>
            {/* Card 2: Business Details */}
            {restaurantDetails.businessDetails && (
              <div className="flex-1 bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-6 sm:p-8 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <Store className="w-5 h-5 text-[#FF6B00]" />
                  <h3 className="text-lg font-bold text-[#1a1f36]">Business Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#1a1f36] mb-2">Restaurant Name</label>
                    <input type="text" value={restaurantDetails.businessDetails.restaurantName || ''} disabled className="w-full px-4 py-2.5 bg-[#F4F6FA] border border-[#E8ECF4] rounded-xl text-[13px] font-medium text-[#8896AB] cursor-not-allowed shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1a1f36] mb-2">Establishment Date</label>
                    <input type="text" value={restaurantDetails.businessDetails.dateOfEstablishment || ''} disabled className="w-full px-4 py-2.5 bg-[#F4F6FA] border border-[#E8ECF4] rounded-xl text-[13px] font-medium text-[#8896AB] cursor-not-allowed shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1a1f36] mb-2">GST / VAT Number</label>
                    <input type="text" value={restaurantDetails.businessDetails.gstVatNumber || ''} disabled className="w-full px-4 py-2.5 bg-[#F4F6FA] border border-[#E8ECF4] rounded-xl text-[13px] font-medium text-[#8896AB] cursor-not-allowed shadow-sm" />
                  </div>
                  {restaurantDetails.businessDetails.address && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-[#1a1f36] mb-2">Registered Address</label>
                      <textarea 
                        value={`${restaurantDetails.businessDetails.address.street}, ${restaurantDetails.businessDetails.address.city}, ${restaurantDetails.businessDetails.address.state} ${restaurantDetails.businessDetails.address.pin}, ${restaurantDetails.businessDetails.address.country}`}
                        disabled 
                        rows={2}
                        className="w-full px-4 py-2.5 bg-[#F4F6FA] border border-[#E8ECF4] rounded-xl text-[13px] font-medium text-[#8896AB] cursor-not-allowed shadow-sm resize-none" 
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>

      {/* ── BOTTOM SECTION: FULL WIDTH ── */}
      {restaurantDetails?.legal_documents && (
        /* Card 4: Legal Documents */
        <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="text-lg font-bold text-[#1a1f36]">Legal Documents</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(restaurantDetails.legal_documents).map(([key, doc]: [string, any]) => {
                      if (!doc) return null;
                      const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      return (
                        <div key={key} className="flex items-center justify-between p-4 bg-white border border-[#E8ECF4] rounded-xl shadow-sm">
                          <div className="min-w-0 flex-1 pr-4">
                            <p className="text-[13px] font-bold text-[#1a1f36] truncate">{title}</p>
                            <p className="text-[11px] font-medium text-[#8896AB] truncate mt-0.5">{doc.fileName}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-3">
                            {doc.fileUrl && (
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold text-[#FF6B00] hover:text-[#E66000] hover:underline transition-colors">
                                View File
                              </a>
                            )}
                            {doc.status === 'In Review' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-bold uppercase tracking-wider border border-yellow-200">
                                <Clock3 className="w-3 h-3" /> Review
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-bold uppercase tracking-wider border border-[#A5D6A7]">
                                <CheckCircle className="w-3 h-3" /> Approved
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
          </div>
        </div>
      )}
    </div>
  );
}
