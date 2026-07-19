import { useState, useEffect, useMemo } from 'react';
import { Country, State, City } from 'country-state-city';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import { useAuth } from '../../hooks/useAuth';
import { ref, get, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';

const InputField = ({ label, name, type = 'text', placeholder = '', formData, handleChange, errors, disabled = false, required = true }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-bold text-[#1a1f36]">
      {label} {required && !disabled && <span className="text-[#FF6B00]">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={formData[name as keyof typeof formData] || ''}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium transition-all ${
        disabled ? 'opacity-70 cursor-not-allowed border-[#E8ECF4]' : `focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:bg-white ${
          errors[name] ? 'border-red-500 focus:border-red-500' : 'border-[#E8ECF4] focus:border-[#FF6B00] hover:border-[#FF6B00]/50'
        }`
      }`}
      disabled={disabled}
    />
    {errors[name] && <span className="text-xs font-bold text-red-500 mt-0.5">{errors[name]}</span>}
  </div>
);

export default function UpdateBranch() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    email: '',
    phoneExt: '+91',
    phone: '',
    address: '',
    country: 'IN',
    city: '',
    state: '',
    pincode: '',
    googleMapUrl: '',
    openTime: '',
    closeTime: '',
  });

  const [initialData, setInitialData] = useState(formData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const countries = useMemo(() => Country.getAllCountries(), []);
  const availableStates = useMemo(() => formData.country ? State.getStatesOfCountry(formData.country) : [], [formData.country]);
  const availableCities = useMemo(() => (formData.country && formData.state) ? City.getCitiesOfState(formData.country, formData.state) : [], [formData.country, formData.state]);

  // Fetch initial branch data
  useEffect(() => {
    const fetchBranch = async () => {
      if (!user || !id) return;
      try {
        const snapshot = await get(ref(rtdb, `branch/${user.uid}/${id}`));
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

          const loadedData = {
            code: data.code || '',
            name: data.name || '',
            email: data.email || '',
            phoneExt: pExt,
            phone: pNum,
            address: data.address || '',
            country: data.country || 'IN',
            city: data.city || '',
            state: data.state || '',
            pincode: data.pincode || '',
            googleMapUrl: data.googleMapUrl || '',
            openTime: data.openTime || '',
            closeTime: data.closeTime || '',
          };
          setFormData(loadedData);
          setInitialData(loadedData);
        } else {
          navigate('/admin/branches'); // Not found
        }
      } catch (err) {
        console.error('Error fetching branch:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranch();
  }, [user, id, navigate]);

  // Unsaved changes detection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const formChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
      if (formChanged) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Branch Name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.city) newErrors.city = 'City is required';
    
    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }
    
    if (!formData.googleMapUrl) {
      newErrors.googleMapUrl = 'Google Map URL is required';
    } else if (!formData.googleMapUrl.startsWith('http')) {
      newErrors.googleMapUrl = 'Please enter a valid URL starting with http:// or https://';
    }

    if (!formData.openTime) newErrors.openTime = 'Opening time is required';
    if (!formData.closeTime) newErrors.closeTime = 'Closing time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'country') {
        next.state = '';
        next.city = '';
      } else if (name === 'state') {
        next.city = '';
      }
      return next;
    });

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSaveAndFinish = async () => {
    if (!validateForm()) return;
    if (!user || !id) return;
    setErrors({});
    setIsSubmitting(true);
    
    try {
      const branchRef = ref(rtdb, `branch/${user.uid}/${id}`);
      
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: `${formData.phoneExt} ${formData.phone}`,
        address: formData.address,
        country: formData.country,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        googleMapUrl: formData.googleMapUrl,
        openTime: formData.openTime,
        closeTime: formData.closeTime,
        updated_at: new Date().toISOString()
      };
      
      await update(branchRef, payload);
      
      setInitialData(formData);
      toast.success('Branch updated successfully!');
      navigate('/admin/branches');
    } catch (error) {
      console.error('Failed to update branch:', error);
      toast.error('Failed to update branch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    const formChanged = JSON.stringify(formData) !== JSON.stringify(initialData);

    if (formChanged) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        e.preventDefault();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-black text-[#1a1f36] tracking-tight">Update Branch &mdash; {formData.name}</h1>
          <p className="text-sm font-medium text-[#8896AB] mt-1">Modify details and settings for this branch.</p>

        </motion.div>
      </div>

      <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-0 border border-[#E8ECF4] shadow-sm bg-white overflow-hidden rounded-2xl">
          <div className="p-8">
            <h2 className="text-lg font-black text-[#1a1f36] mb-6 pb-4 border-b border-[#E8ECF4]">1. Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Branch Code" name="code" placeholder="e.g. B001" disabled formData={formData} handleChange={handleChange} errors={errors} />
              <InputField label="Branch Name" name="name" placeholder="e.g. MG Road Branch" formData={formData} handleChange={handleChange} errors={errors} />
              <InputField label="Contact Email" name="email" type="email" placeholder="branch@example.com" formData={formData} handleChange={handleChange} errors={errors} />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#1a1f36]">Phone Number <span className="text-[#FF6B00]">*</span></label>
                <div className="flex gap-2">
                  <div className="w-32">
                    <Select
                      name="phoneExt"
                      value={formData.phoneExt}
                      onChange={(e) => handleChange(e as any)}
                      options={countries.map(c => ({ value: `+${c.phonecode.replace('+', '')}`, label: `+${c.phonecode.replace('+', '')} (${c.isoCode})` })).filter((v, i, a) => a.findIndex(t => (t.value === v.value)) === i)}
                      error={''}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:bg-white ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-[#E8ECF4] focus:border-[#FF6B00] hover:border-[#FF6B00]/50'}`}
                    />
                  </div>
                </div>
                {errors.phone && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.phone}</span>}
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-[#E8ECF4] bg-[#F8FAFC]/50">
            <h2 className="text-lg font-black text-[#1a1f36] mb-6 pb-4 border-b border-[#E8ECF4]">2. Location Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField label="Address" name="address" placeholder="Enter complete address" formData={formData} handleChange={handleChange} errors={errors} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#1a1f36]">Country <span className="text-[#FF6B00]">*</span></label>
                <Select
                  name="country"
                  value={formData.country}
                  onChange={(e) => handleChange(e as any)}
                  options={[{ value: '', label: 'Select Country' }, ...countries.map(c => ({ value: c.isoCode, label: c.name }))]}
                  error={errors.country}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#1a1f36]">State <span className="text-[#FF6B00]">*</span></label>
                <Select
                  name="state"
                  value={formData.state}
                  onChange={(e) => handleChange(e as any)}
                  disabled={!formData.country}
                  options={[{ value: '', label: 'Select State' }, ...availableStates.map(s => ({ value: s.isoCode, label: s.name }))]}
                  error={errors.state}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#1a1f36]">City <span className="text-[#FF6B00]">*</span></label>
                <Select
                  name="city"
                  value={formData.city}
                  onChange={(e) => handleChange(e as any)}
                  disabled={!formData.state}
                  options={[{ value: '', label: 'Select City' }, ...availableCities.map(c => ({ value: c.name, label: c.name }))]}
                  error={errors.city}
                />
              </div>

              <InputField label="Pincode" name="pincode" placeholder="6 digit pincode" formData={formData} handleChange={handleChange} errors={errors} />
              
              <div className="md:col-span-2">
                <InputField label="Google Map URL" name="googleMapUrl" type="url" placeholder="https://maps.google.com/..." formData={formData} handleChange={handleChange} errors={errors} />
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-[#E8ECF4]">
            <h2 className="text-lg font-black text-[#1a1f36] mb-6 pb-4 border-b border-[#E8ECF4]">3. Operational Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Opening Time" name="openTime" type="time" formData={formData} handleChange={handleChange} errors={errors} />
              <InputField label="Closing Time" name="closeTime" type="time" formData={formData} handleChange={handleChange} errors={errors} />
            </div>
          </div>

          <div className="p-8 border-t border-[#E8ECF4] flex items-center justify-end gap-3 bg-[#F8FAFC] rounded-b-2xl">
            <Link to={`/admin/branches`} onClick={handleCancelClick}>
              <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-[#1a1f36] bg-white border border-[#E8ECF4] hover:bg-[#F4F6FA] transition-all">
                Cancel
              </button>
            </Link>
            <Button className="gap-2 px-6 shadow-sm bg-[#FF6B00] text-white hover:bg-[#E66000] border-0" onClick={handleSaveAndFinish} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Update Branch
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
