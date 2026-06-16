import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import BranchStepper from './components/BranchStepper';
import AssignMenuStep from './components/AssignMenuStep';
import PhoneInput from '../../components/common/PhoneInput';

const STEPS = [
  { id: 1, label: 'Branch Creation' },
  { id: 2, label: 'Assign Menu' }
];

export default function CreateBranch() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    email: '',
    phoneExt: '+91',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    openTime: '',
    closeTime: '',
  });

  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branchCreated, setBranchCreated] = useState(false);

  const validateStep1 = () => {
    setErrors({});
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (branchCreated) return; // Prevent edits if branch is already created in this session
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNextStep1 = async () => {
    if (!validateStep1()) return;

    if (!branchCreated) {
      setIsSubmitting(true);
      await new Promise(r => setTimeout(r, 1000)); // API call
      setIsSubmitting(false);
      setBranchCreated(true);
    }

    setCurrentStep(2);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  const handleSaveAndFinish = async () => {
    setErrors({});
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500)); // API call
    setIsSubmitting(false);

    alert('Branch created and menu assigned successfully!');
    navigate('/branches');
  };

  const InputField = ({ label, name, type = 'text', placeholder = '' }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-brand-navy">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name as keyof typeof formData]}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={branchCreated}
        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium transition-all ${branchCreated ? 'opacity-70 cursor-not-allowed border-border' : `focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white ${errors[name] ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
          }`
          }`}
      />
      {errors[name] && <span className="text-xs font-bold text-red-500 mt-0.5">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} type="button" className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-gray-50 border border-border">
                <ArrowLeft className="w-5 h-5 text-text-secondary" />
              </button>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">
            {branchCreated && formData.name ? `Create New Branch — ${formData.name}` : 'Create New Branch'}
          </h1>
          <p className="text-text-secondary mt-0.5 text-sm font-medium">Add a new operational location to your network.</p>
        </motion.div>
      </div>

      <BranchStepper steps={STEPS} currentStep={currentStep} />

      <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-0 border border-border/50 shadow-soft bg-white overflow-hidden">

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {branchCreated && (
                  <div className="bg-brand-orange-50 p-4 border-b border-brand-orange-200 text-sm font-medium text-brand-orange-800 text-center">
                    Branch has been created. Details are now in read-only summary mode.
                  </div>
                )}
                <div className="p-8">
                  <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">1. Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Branch Code" name="code" placeholder="e.g. B001" />
                    <InputField label="Branch Name" name="name" placeholder="e.g. MG Road Branch" />
                    <InputField label="Contact Email" name="email" type="email" placeholder="branch@example.com" />
                    <PhoneInput
                      name="phone"
                      value={formData.phone}
                      extValue={formData.phoneExt}
                      onChange={handleChange}
                      onExtChange={handleChange}
                      error={errors.phone}
                      disabled={branchCreated}
                    />
                  </div>
                </div>

                <div className="p-8 border-t border-border bg-gray-50/30">
                  <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">2. Location Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <InputField label="Address Line 1" name="address" placeholder="123 Street Name" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-brand-navy">City</label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={branchCreated}
                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium transition-all appearance-none cursor-pointer ${branchCreated ? 'opacity-70 cursor-not-allowed border-border' : `focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white ${errors.city ? 'border-red-500' : 'border-border hover:border-brand-orange-300'
                          }`
                          }`}
                      >
                        <option value="">Select City</option>
                        <option value="New York">New York</option>
                        <option value="Chicago">Chicago</option>
                        <option value="Los Angeles">Los Angeles</option>
                      </select>
                      {errors.city && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.city}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold text-brand-navy">State</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={branchCreated}
                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium transition-all appearance-none cursor-pointer ${branchCreated ? 'opacity-70 cursor-not-allowed border-border' : `focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white ${errors.state ? 'border-red-500' : 'border-border hover:border-brand-orange-300'
                          }`
                          }`}
                      >
                        <option value="">Select State</option>
                        <option value="NY">New York (NY)</option>
                        <option value="IL">Illinois (IL)</option>
                        <option value="CA">California (CA)</option>
                      </select>
                      {errors.state && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.state}</span>}
                    </div>

                    <InputField label="Pincode" name="pincode" placeholder="6 digit pincode" />
                  </div>
                </div>

                <div className="p-8 border-t border-border">
                  <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">3. Operational Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Opening Time" name="openTime" type="time" />
                    <InputField label="Closing Time" name="closeTime" type="time" />
                  </div>
                </div>

                <div className="p-6 border-t border-border bg-gray-50 flex items-center justify-end gap-4">
                  {!branchCreated && (
                    <Link to="/branches">
                      <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-white border border-transparent hover:border-border transition-all">
                        Cancel
                      </button>
                    </Link>
                  )}
                  <Button onClick={handleNextStep1} disabled={isSubmitting} className="gap-2 px-8">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Next
                    {!isSubmitting && <ChevronRight className="w-5 h-5" />}
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-black text-brand-navy">Assign Menu Items</h2>
                  <p className="text-sm font-medium text-text-secondary mt-1">Select the food items available at this branch.</p>
                  {errors.menu && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-lg">
                      {errors.menu}
                    </div>
                  )}
                </div>

                <AssignMenuStep
                  selectedIds={selectedMenuIds}
                  onChange={setSelectedMenuIds}
                />

                <div className="p-6 border-t border-border bg-gray-50 flex items-center justify-between sticky bottom-0 z-10">
                  <button
                    onClick={handleBackToStep1}
                    className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-white border border-transparent hover:border-border transition-all flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-brand-navy">
                      {selectedMenuIds.size} items selected
                    </span>
                    <Button onClick={handleSaveAndFinish} disabled={isSubmitting} className="gap-2 px-8 shadow-sm">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      {isSubmitting ? 'Saving...' : 'Save & Finish'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
