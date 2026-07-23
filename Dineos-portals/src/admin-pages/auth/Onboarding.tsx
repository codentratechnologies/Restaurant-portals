import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Store, CheckCircle, ChevronRight, ChevronLeft, 
  Upload, FileText, Image as ImageIcon, MapPin, 
  Phone, Mail, User, Clock, Check
} from 'lucide-react';
import Button from '../../components/common/Button';
import { ref as dbRef, update, onValue } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import DocumentTrackingDashboard from './components/DocumentTrackingDashboard';
import toast from 'react-hot-toast';

// Dummy file upload component
const FileUpload = ({ label, description, accept, onFileSelect, error }: { label: string, description: string, accept?: string, onFileSelect?: (file: File | null) => void, error?: string }) => {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div>
      <div className={`border-2 border-dashed ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'} rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-brand-orange-500 hover:bg-brand-orange-50 transition-colors cursor-pointer relative group`}>
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          accept={accept}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setFile(e.target.files[0]);
              if (onFileSelect) onFileSelect(e.target.files[0]);
            }
          }}
        />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Check className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-gray-900">{file.name}</span>
            <span className="text-xs text-gray-500">Click to change</span>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-brand-orange-500 group-hover:bg-white transition-colors mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium text-center">{error}</p>}
    </div>
  );
};

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to get data from location state first, then fallback to localStorage
  const stateData = location.state as { name?: string, restaurantName?: string, email?: string } || {};
  const localDataStr = localStorage.getItem('signupData');
  const localData = localDataStr ? JSON.parse(localDataStr) : {};
  
  const prefilledData = { ...localData, ...stateData };

  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { user, userData, logout } = useAuth();
  
  useEffect(() => {
    // If the user already has restaurant_details submitted but isOnboardingComplete is false (in review)
    // they should automatically see the success screen.
    if (userData?.isUnderReview) {
      setIsSubmitted(true);
    }
  }, [userData]);

  const [serverDocuments, setServerDocuments] = useState<any>(null);

  useEffect(() => {
    if (isSubmitted && user) {
      const docsRef = dbRef(rtdb, `admin_users/${user.uid}/restaurant_details/legal_documents`);
      const unsubscribe = onValue(docsRef, (snapshot) => {
        if (snapshot.exists()) {
          setServerDocuments(snapshot.val());
        }
      });
      return () => unsubscribe();
    }
  }, [isSubmitted, user]);

  // Form State
  const [businessDetails, setBusinessDetails] = useState({
    restaurantName: prefilledData.restaurantName || '',
    dateOfEstablishment: '',
    gstVatNumber: '',
    street: '',
    city: '',
    state: '',
    pin: '',
    country: ''
  });

  const [contactInfo, setContactInfo] = useState({
    primaryName: prefilledData.name || '',
    primaryPhone: '',
    primaryEmail: prefilledData.email || '',
    secondaryDetails: ''
  });

  const [operationalDetails, setOperationalDetails] = useState({
    openingTime: '09:00',
    closingTime: '22:00',
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [legalDocs, setLegalDocs] = useState({
    businessRegistration: null as File | null,
    taxRegistration: null as File | null,
    foodSafety: null as File | null,
    authIdProof: null as File | null,
    liquorLicense: null as File | null
  });

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    if (currentStep === 1) {
      if (!businessDetails.restaurantName.trim()) newErrors.restaurantName = 'Restaurant name is required';
      if (!businessDetails.dateOfEstablishment) newErrors.dateOfEstablishment = 'Date of establishment is required';
      if (!businessDetails.street.trim()) newErrors.street = 'Street address is required';
      if (!businessDetails.city.trim()) newErrors.city = 'City is required';
      if (!businessDetails.state.trim()) newErrors.state = 'State is required';
      if (!businessDetails.pin.trim()) newErrors.pin = 'ZIP Code is required';
      if (!businessDetails.country) newErrors.country = 'Country is required';
    } else if (currentStep === 2) {
      if (!contactInfo.primaryName.trim()) newErrors.primaryName = 'Contact name is required';
      if (!contactInfo.primaryEmail.trim() || !/^\S+@\S+\.\S+$/.test(contactInfo.primaryEmail)) newErrors.primaryEmail = 'Valid email is required';
      if (!contactInfo.primaryPhone.trim()) newErrors.primaryPhone = 'Phone number is required';
    } else if (currentStep === 3) {
      if (!logoFile) newErrors.logo = 'Restaurant logo is required';
      if (operationalDetails.operatingDays.length === 0) newErrors.operatingDays = 'Select at least one operating day';
    } else if (currentStep === 4) {
      if (!legalDocs.businessRegistration) newErrors.businessRegistration = 'Required';
      if (!legalDocs.taxRegistration) newErrors.taxRegistration = 'Required';
      if (!legalDocs.foodSafety) newErrors.foodSafety = 'Required';
      if (!legalDocs.authIdProof) newErrors.authIdProof = 'Required';
    }

    if (Object.keys(newErrors).length > 0) {
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setErrors({});
      setStep(step - 1);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (validateStep(step)) {
      if (!user) return;
      
      setSubmitting(true);
      try {
        const adminRef = dbRef(rtdb, `admin_users/${user.uid}`);
        
        // Helper to upload any file to Cloudinary (auto detects image vs document)
        const uploadToCloudinary = async (file: File | null) => {
          if (!file) return null;
          const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
          const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
          if (!cloudName || !uploadPreset) throw new Error('Cloudinary config missing');
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', uploadPreset);

          // 'auto' allows Cloudinary to handle PDFs, docs, and images under one endpoint
          const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) {
            const errText = await response.text();
            console.error('Cloudinary error response:', errText);
            throw new Error(`Cloudinary upload failed: ${errText}`);
          }
          const data = await response.json();
          return data.secure_url;
        };

        const logoUrl = await uploadToCloudinary(logoFile);
        const bizRegUrl = await uploadToCloudinary(legalDocs.businessRegistration);
        const taxRegUrl = await uploadToCloudinary(legalDocs.taxRegistration);
        const foodSafetyUrl = await uploadToCloudinary(legalDocs.foodSafety);
        const authIdUrl = await uploadToCloudinary(legalDocs.authIdProof);
        const liquorUrl = await uploadToCloudinary(legalDocs.liquorLicense);
        
        // Prepare data to save
        const restaurantDetails = {
          status: 'In Review',
          businessDetails: {
            restaurantName: businessDetails.restaurantName,
            dateOfEstablishment: businessDetails.dateOfEstablishment,
            gstVatNumber: businessDetails.gstVatNumber,
            address: {
              street: businessDetails.street,
              city: businessDetails.city,
              state: businessDetails.state,
              pin: businessDetails.pin,
              country: businessDetails.country
            }
          },
          contactInfo: {
            primaryName: contactInfo.primaryName,
            primaryEmail: contactInfo.primaryEmail,
            primaryPhone: contactInfo.primaryPhone,
            secondaryDetails: contactInfo.secondaryDetails
          },
          operationalDetails: {
            openingTime: operationalDetails.openingTime,
            closingTime: operationalDetails.closingTime,
            operatingDays: operationalDetails.operatingDays,
            logoFileName: logoFile ? logoFile.name : null,
            logoUrl: logoUrl
          },
          legal_documents: {
            businessRegistration: legalDocs.businessRegistration ? {
              fileName: legalDocs.businessRegistration.name,
              fileUrl: bizRegUrl,
              status: 'In Review',
              uploadedAt: new Date().toISOString()
            } : null,
            taxRegistration: legalDocs.taxRegistration ? {
              fileName: legalDocs.taxRegistration.name,
              fileUrl: taxRegUrl,
              status: 'In Review',
              uploadedAt: new Date().toISOString()
            } : null,
            foodSafety: legalDocs.foodSafety ? {
              fileName: legalDocs.foodSafety.name,
              fileUrl: foodSafetyUrl,
              status: 'In Review',
              uploadedAt: new Date().toISOString()
            } : null,
            authIdProof: legalDocs.authIdProof ? {
              fileName: legalDocs.authIdProof.name,
              fileUrl: authIdUrl,
              status: 'In Review',
              uploadedAt: new Date().toISOString()
            } : null,
            liquorLicense: legalDocs.liquorLicense ? {
              fileName: legalDocs.liquorLicense.name,
              fileUrl: liquorUrl,
              status: 'In Review',
              uploadedAt: new Date().toISOString()
            } : null
          }
        };

        await update(adminRef, {
          restaurant_name: businessDetails.restaurantName, // update the root level restaurant_name
          restaurant_details: restaurantDetails
        });

        // Clear signup flags
        localStorage.removeItem('isNewSignup');
        localStorage.removeItem('signupData');
        
        // Show success screen instead of immediate redirect
        setIsSubmitted(true);
        toast.success("Documents submitted successfully!");
      } catch (error: any) {
        console.error("Error saving onboarding details:", error);
        toast.error(`Submission failed: ${error.message || "Please check your network and try again"}`);
      } finally {
        setSubmitting(false);
      }
    } else {
      toast.error('Please fill in all required fields (highlighted in red) before submitting.');
    }
  };

  const steps = [
    { id: 1, title: 'Business Details', icon: Store },
    { id: 2, title: 'Contact Info', icon: User },
    { id: 3, title: 'Operations', icon: Clock },
    { id: 4, title: 'Legal Docs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DineOS" className="h-8 object-contain" />
          <span className="text-sm font-bold text-gray-400 pl-3 border-l border-gray-200">Setup</span>
        </div>
        <div className="flex items-center gap-4">
          {!isSubmitted && (
            <div className="text-sm text-gray-500 font-medium">
              Step {step} of {totalSteps}
            </div>
          )}
          <button onClick={() => logout()} className="text-sm font-medium text-brand-orange-600 hover:text-brand-orange-700">
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full py-10 px-4 sm:px-6 lg:px-8 gap-10">
        
        {/* Horizontal Progress Bar */}
        {!isSubmitted && (
          <div className="w-full max-w-3xl mx-auto mb-4 mt-2">
            <div className="flex items-center justify-between relative px-2">
              {/* Connecting line */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full z-0"></div>
              <div 
                className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-brand-orange-500 rounded-full z-0 transition-all duration-500"
                style={{ width: `calc(${((step - 1) / (totalSteps - 1)) * 100}% - 3rem)` }}
              ></div>

              {steps.map((s) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isCompleted = step > s.id;
                
                return (
                  <div key={s.id} className="relative z-10 flex flex-col items-center">
                    <button
                      onClick={() => {
                        if (s.id < step) {
                          setErrors({});
                          setStep(s.id);
                        }
                      }}
                      disabled={s.id > step}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-[4px] border-gray-50 transition-all duration-300 ${
                        isActive 
                          ? 'bg-brand-orange-500 text-white shadow-lg shadow-brand-orange-500/40 scale-110'
                          : isCompleted
                            ? 'bg-brand-orange-500 text-white cursor-pointer hover:bg-brand-orange-600'
                            : 'bg-white text-gray-300 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                    </button>
                    <span className={`absolute -bottom-7 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${
                      isActive ? 'text-brand-orange-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isSubmitted ? (
          <div className="w-full">
            <DocumentTrackingDashboard serverDocuments={serverDocuments} />
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto relative z-10">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-60"></div>
              
              <div className="relative z-10">
            
            {/* Step 1: Business Details */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Company & Business Details</h2>
                  <p className="text-gray-500 text-sm">Tell us about your restaurant entity and registered location.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Restaurant Name</label>
                      <input 
                        type="text" 
                        value={businessDetails.restaurantName}
                        onChange={(e) => { setBusinessDetails({...businessDetails, restaurantName: e.target.value}); setErrors({...errors, restaurantName: ''}); }}
                        className={`input-field w-full ${errors.restaurantName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="e.g. The Gourmet Kitchen"
                      />
                      {errors.restaurantName && <p className="mt-1 text-xs text-red-600">{errors.restaurantName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Establishment</label>
                      <input 
                        type="date" 
                        value={businessDetails.dateOfEstablishment}
                        onChange={(e) => { setBusinessDetails({...businessDetails, dateOfEstablishment: e.target.value}); setErrors({...errors, dateOfEstablishment: ''}); }}
                        className={`input-field w-full ${errors.dateOfEstablishment ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      />
                      {errors.dateOfEstablishment && <p className="mt-1 text-xs text-red-600">{errors.dateOfEstablishment}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">GST / VAT Number</label>
                    <input 
                      type="text" 
                      value={businessDetails.gstVatNumber}
                      onChange={(e) => setBusinessDetails({...businessDetails, gstVatNumber: e.target.value})}
                      className="input-field w-full" 
                      placeholder="e.g. 22AAAAA0000A1Z5"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-brand-orange-500" />
                      Registered Business Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Street Address</label>
                        <input 
                          type="text" 
                          value={businessDetails.street}
                          onChange={(e) => { setBusinessDetails({...businessDetails, street: e.target.value}); setErrors({...errors, street: ''}); }}
                          className={`input-field w-full ${errors.street ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                          placeholder="123 Business Avenue, Suite 100"
                        />
                        {errors.street && <p className="mt-1 text-xs text-red-600">{errors.street}</p>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">City</label>
                          <input type="text" value={businessDetails.city} onChange={e => { setBusinessDetails({...businessDetails, city: e.target.value}); setErrors({...errors, city: ''}); }} className={`input-field w-full ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="New York" />
                          {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">State / Province</label>
                          <input type="text" value={businessDetails.state} onChange={e => { setBusinessDetails({...businessDetails, state: e.target.value}); setErrors({...errors, state: ''}); }} className={`input-field w-full ${errors.state ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="NY" />
                          {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">ZIP / Postal Code</label>
                          <input type="text" value={businessDetails.pin} onChange={e => { setBusinessDetails({...businessDetails, pin: e.target.value}); setErrors({...errors, pin: ''}); }} className={`input-field w-full ${errors.pin ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} placeholder="10001" />
                          {errors.pin && <p className="mt-1 text-xs text-red-600">{errors.pin}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Country</label>
                          <select value={businessDetails.country} onChange={e => { setBusinessDetails({...businessDetails, country: e.target.value}); setErrors({...errors, country: ''}); }} className={`input-field w-full bg-white ${errors.country ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                            <option value="">Select Country</option>
                            <option value="US">United States</option>
                            <option value="UK">United Kingdom</option>
                            <option value="IN">India</option>
                            <option value="CA">Canada</option>
                            <option value="AU">Australia</option>
                          </select>
                          {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
                  <p className="text-gray-500 text-sm">How can we reach the authorized signatory of the business?</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" /> Primary Contact Person (Authorized Signatory)
                    </label>
                    <input 
                      type="text" 
                      value={contactInfo.primaryName}
                      onChange={(e) => { setContactInfo({...contactInfo, primaryName: e.target.value}); setErrors({...errors, primaryName: ''}); }}
                      className={`input-field w-full ${errors.primaryName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="John Doe"
                    />
                    {errors.primaryName && <p className="mt-1 text-xs text-red-600">{errors.primaryName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" /> Primary Email Address
                      </label>
                      <input 
                        type="email" 
                        value={contactInfo.primaryEmail}
                        onChange={(e) => { setContactInfo({...contactInfo, primaryEmail: e.target.value}); setErrors({...errors, primaryEmail: ''}); }}
                        className={`input-field w-full ${errors.primaryEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="john@restaurant.com"
                      />
                      {errors.primaryEmail && <p className="mt-1 text-xs text-red-600">{errors.primaryEmail}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" /> Primary Phone Number
                      </label>
                      <input 
                        type="tel" 
                        value={contactInfo.primaryPhone}
                        onChange={(e) => { setContactInfo({...contactInfo, primaryPhone: e.target.value}); setErrors({...errors, primaryPhone: ''}); }}
                        className={`input-field w-full ${errors.primaryPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="+1 (555) 000-0000"
                      />
                      {errors.primaryPhone && <p className="mt-1 text-xs text-red-600">{errors.primaryPhone}</p>}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Secondary Contact Details (Optional)</label>
                    <textarea 
                      value={contactInfo.secondaryDetails}
                      onChange={(e) => setContactInfo({...contactInfo, secondaryDetails: e.target.value})}
                      className="input-field w-full min-h-[100px] resize-none" 
                      placeholder="Add any additional phone numbers, emails, or points of contact..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Operational Details */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Operational Details</h2>
                  <p className="text-gray-500 text-sm">Set your general operating hours and upload your brand logo.</p>
                </div>
                
                <div className="space-y-8">
                  
                  {/* Logo Upload */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                      <ImageIcon className="w-4 h-4 text-brand-orange-500" />
                      Restaurant Logo
                    </h3>
                    <FileUpload 
                      label="Upload Logo" 
                      description="PNG, JPG, or SVG up to 2MB. Square ratio recommended." 
                      accept="image/*" 
                      onFileSelect={(file) => { setLogoFile(file); setErrors({...errors, logo: ''}); }}
                      error={errors.logo}
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-brand-orange-500" />
                      Operating Hours
                    </h3>
                    
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-4 pb-4 border-b border-gray-200">
                        <span className="text-sm font-semibold text-gray-700">Standard Timings</span>
                        <div className="flex items-center gap-2">
                          <input type="time" value={operationalDetails.openingTime} onChange={e => setOperationalDetails({...operationalDetails, openingTime: e.target.value})} className="input-field py-1.5 px-3 text-sm bg-white" />
                          <span className="text-gray-400 text-sm">to</span>
                          <input type="time" value={operationalDetails.closingTime} onChange={e => setOperationalDetails({...operationalDetails, closingTime: e.target.value})} className="input-field py-1.5 px-3 text-sm bg-white" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-700">Operating Days</span>
                          {errors.operatingDays && <span className="text-xs text-red-600 font-medium">{errors.operatingDays}</span>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                            const isActive = operationalDetails.operatingDays.includes(day);
                            return (
                              <button
                                key={day}
                                onClick={() => {
                                  setOperationalDetails(prev => {
                                    const nextDays = isActive ? prev.operatingDays.filter(d => d !== day) : [...prev.operatingDays, day];
                                    if (nextDays.length > 0) setErrors({...errors, operatingDays: ''});
                                    return { ...prev, operatingDays: nextDays };
                                  })
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                  isActive 
                                    ? 'bg-brand-orange-500 text-white shadow-sm' 
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-orange-200 hover:text-brand-orange-500'
                                }`}
                              >
                                {day.slice(0, 3)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Step 4: Legal Documents */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Required Legal Documents</h2>
                  <p className="text-gray-500 text-sm">Upload clear, legible copies of your business documents for verification.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileUpload 
                    label="Business Registration" 
                    description="Certificate of Incorporation, LLC docs, or Shop & Est. Cert." 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onFileSelect={(f) => { setLegalDocs({...legalDocs, businessRegistration: f}); setErrors({...errors, businessRegistration: ''}); }}
                    error={errors.businessRegistration}
                  />
                  <FileUpload 
                    label="Tax Registration" 
                    description="GST / VAT / TIN Certificate" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onFileSelect={(f) => { setLegalDocs({...legalDocs, taxRegistration: f}); setErrors({...errors, taxRegistration: ''}); }}
                    error={errors.taxRegistration}
                  />
                  <FileUpload 
                    label="Food Safety License" 
                    description="FSSAI, FDA, or Local Health Dept permit" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onFileSelect={(f) => { setLegalDocs({...legalDocs, foodSafety: f}); setErrors({...errors, foodSafety: ''}); }}
                    error={errors.foodSafety}
                  />
                  <FileUpload 
                    label="Authorized Person ID" 
                    description="Passport, Driver's License, or National ID" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onFileSelect={(f) => { setLegalDocs({...legalDocs, authIdProof: f}); setErrors({...errors, authIdProof: ''}); }}
                    error={errors.authIdProof}
                  />
                  <div className="sm:col-span-2">
                    <FileUpload 
                      label="Liquor License (Optional)" 
                      description="If your restaurant serves alcohol" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onFileSelect={(f) => setLegalDocs({...legalDocs, liquorLicense: f})}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              
              {step < totalSteps ? (
                <Button onClick={handleNext} className="gap-2 px-6">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting} className="gap-2 px-8 bg-green-600 hover:bg-green-700">
                  {submitting ? 'Saving...' : 'Submit & Finish'} <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>

              </div>
            </div>
          </div>
        )}


      </main>
    </div>
  );
}
