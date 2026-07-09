import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Save, Info, AlertTriangle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ImageUploadZone from './components/ImageUploadZone';

export default function UpdateFoodItem() {
 const navigate = useNavigate();
 const { id } = useParams();
 
 // Mock initial data
 const initialData = {
 name: 'Paneer Tikka Masala',
 category: 'Main Course',
 dietaryType: 'Veg',
 price: '349.00',
 description: 'A classic rich and creamy curry made with grilled paneer blocks, cooked in a spiced tomato gravy.',
 };
 
 const initialImage = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600&h=400';

 const [formData, setFormData] = useState(initialData);
 const [image, setImage] = useState<string | undefined>(initialImage);
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
 const [showExitWarning, setShowExitWarning] = useState(false);
 const [pendingPath, setPendingPath] = useState<string | null>(null);

 // For auto-scrolling
 const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

 useEffect(() => {
 const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData) || image !== initialImage;
 setHasUnsavedChanges(isDirty);
 }, [formData, image]);

 const validate = () => {
 const newErrors: Record<string, string> = {};

 if (!formData.name) newErrors.name = 'Item Name is required';
 else if (formData.name.length < 3 || formData.name.length > 100) newErrors.name = 'Item Name must be between 3 and 100 characters';
 if (!formData.category) newErrors.category = 'Category is required';
 if (!formData.dietaryType) newErrors.dietaryType = 'Dietary Type is required';
 if (!formData.price) newErrors.price = 'Base Price is required';
 else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) newErrors.price = 'Base Price must be a valid number greater than zero';
 if (!formData.description) newErrors.description = 'Description is required';
 else if (formData.description.length > 500) newErrors.description = 'Description cannot exceed 500 characters';

 setErrors(newErrors);

 if (Object.keys(newErrors).length > 0) {
 const firstError = Object.keys(newErrors)[0];
 if (errorRefs.current[firstError]) {
 errorRefs.current[firstError]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
 }
 return false;
 }

 return true;
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!validate()) return;
 
 setIsSubmitting(true);
 // Simulate API save
 await new Promise(r => setTimeout(r, 1500));
 setIsSubmitting(false);
 setHasUnsavedChanges(false);
 navigate('/food');
 };

 const handleNavigation = (path: string, e: React.MouseEvent) => {
 if (hasUnsavedChanges) {
 e.preventDefault();
 setPendingPath(path);
 setShowExitWarning(true);
 }
 };

 const confirmExit = () => {
 if (pendingPath) {
 setHasUnsavedChanges(false);
 navigate(pendingPath);
 }
 };

 const InputWrapper = ({ name, children }: any) => (
 <div ref={el => errorRefs.current[name] = el} className="flex flex-col gap-1.5">
 {children}
 </div>
 );

 return (
 <div className="max-w-4xl mx-auto space-y-6 relative">
 
 {/* Unsaved Changes Warning Modal */}
 <AnimatePresence>
 {showExitWarning && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm" onClick={() => setShowExitWarning(false)} />
 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 relative">
 <div className="p-6">
 <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
 <AlertTriangle className="w-6 h-6 text-brand-orange-500" />
 </div>
 <h3 className="text-xl font-black text-brand-navy mb-2">Discard Changes?</h3>
 <p className="text-sm font-medium text-text-secondary mb-6">You have unsaved changes to this food item. If you leave now, your edits will be lost.</p>
 <div className="flex items-center justify-end gap-3">
 <button onClick={() => setShowExitWarning(false)} className="px-4 py-2 text-sm font-bold text-text-secondary hover:bg-gray-100 rounded-lg transition-colors">Keep Editing</button>
 <button onClick={confirmExit} className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm">Discard & Leave</button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
 <div className="flex items-center gap-4">
 <button onClick={() => navigate(-1)} type="button" className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-gray-50 border border-border">
 <ArrowLeft className="w-5 h-5 text-text-secondary" />
 </button>
 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
 <h1 className="text-2xl font-black text-brand-navy tracking-tight">Update Food Item — {initialData.name}</h1>
 <p className="text-text-secondary mt-0.5 text-sm font-medium">Edit master details for this menu item.</p>
 </motion.div>
 </div>
 
 </div>

 <AnimatePresence>
 {hasUnsavedChanges && (
 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
 <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
 <AlertTriangle className="w-5 h-5 text-brand-orange-500 shrink-0 mt-0.5" />
 <div>
 <h4 className="text-sm font-bold text-orange-800">Unsaved Changes</h4>
 <p className="text-xs font-medium text-orange-700 mt-0.5">You have modified the item details. Don't forget to save your changes.</p>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
 <Card className="p-0 border border-border/50 shadow-soft bg-white overflow-hidden">
 <form id="update-food-form" onSubmit={handleSubmit} className="flex flex-col">
 
 {/* SECTION 1: Item Details */}
 <div className="p-8">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">1. Item Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 
 <div className="md:col-span-2">
 <InputWrapper name="name">
 <label className="text-sm font-bold text-brand-navy">Item Name <span className="text-brand-orange-500">*</span></label>
 <input
 name="name"
 value={formData.name}
 onChange={handleChange}
 placeholder="e.g. Paneer Tikka Masala"
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.name ? 'border-red-500' : 'border-border hover:border-brand-orange-300'
 }`}
 />
 {errors.name && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.name}</span>}
 </InputWrapper>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:col-span-2">
 <InputWrapper name="category">
 <label className="text-sm font-bold text-brand-navy">Category <span className="text-brand-orange-500">*</span></label>
 <select
 name="category"
 value={formData.category}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all appearance-none cursor-pointer ${
 errors.category ? 'border-red-500' : 'border-border hover:border-brand-orange-300'
 }`}
 >
 <option value="">Select Category</option>
 <option value="Starters">Starters</option>
 <option value="Main Course">Main Course</option>
 <option value="Desserts">Desserts</option>
 <option value="Beverages">Beverages</option>
 </select>
 {errors.category && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.category}</span>}
 </InputWrapper>

 <InputWrapper name="dietaryType">
 <label className="text-sm font-bold text-brand-navy">Dietary Type <span className="text-brand-orange-500">*</span></label>
 <select
 name="dietaryType"
 value={formData.dietaryType}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all appearance-none cursor-pointer ${
 errors.dietaryType ? 'border-red-500' : 'border-border hover:border-brand-orange-300'
 }`}
 >
 <option value="">Select Dietary Type</option>
 <option value="Veg">Veg</option>
 <option value="Non-Veg">Non-Veg</option>
 <option value="Egg">Egg</option>
 <option value="Vegan">Vegan</option>
 </select>
 {errors.dietaryType && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.dietaryType}</span>}
 </InputWrapper>
 </div>

 <div className="md:col-span-2">
 <InputWrapper name="price">
 <label className="text-sm font-bold text-brand-navy flex items-center gap-2">
 Base Price <span className="text-brand-orange-500">*</span>
 </label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-secondary">₹</span>
 <input
 name="price"
 type="number"
 min="0"
 step="0.01"
 value={formData.price}
 onChange={handleChange}
 placeholder="0.00"
 className={`w-full pl-8 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all ${
 errors.price ? 'border-red-500' : 'border-border hover:border-brand-orange-300'
 }`}
 />
 </div>
 {errors.price && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.price}</span>}
 
 <div className="mt-2 bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex gap-2">
 <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
 <p className="text-[11px] font-medium text-blue-800 leading-relaxed">
 Price changes will only affect <strong>future orders</strong>. Historical order pricing and analytical reports will remain unchanged.
 </p>
 </div>
 </InputWrapper>
 </div>

 <div className="md:col-span-2">
 <InputWrapper name="description">
 <div className="flex items-center justify-between">
 <label className="text-sm font-bold text-brand-navy">Description <span className="text-brand-orange-500">*</span></label>
 <span className="text-xs font-medium text-text-secondary">{formData.description.length}/500</span>
 </div>
 <textarea
 name="description"
 value={formData.description}
 onChange={handleChange}
 rows={4}
 className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white transition-all resize-none ${
 errors.description ? 'border-red-500' : 'border-border hover:border-brand-orange-300'
 }`}
 />
 {errors.description && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.description}</span>}
 </InputWrapper>
 </div>

 </div>
 </div>

 {/* SECTION 2: Item Image */}
 <div className="p-8 border-t border-border bg-gray-50/30">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border flex items-center justify-between">
 <span>2. Item Image <span className="text-red-500 text-sm">*</span></span>
 <span className="text-xs text-text-secondary font-medium font-normal">Max 2MB. JPG or PNG only. Existing image retained.</span>
 </h2>
 <div ref={el => errorRefs.current['image'] = el} className="max-w-sm">
 <ImageUploadZone 
 currentImage={image} 
 onUploadSuccess={(url) => { setImage(url); setErrors(prev => ({ ...prev, image: '' })); }} 
 onRemove={() => setImage(undefined)}
 error={errors.image}
 />
 </div>
 </div>

   <div className="p-8 border-t border-border bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
 <Link to="/food" onClick={(e) => handleNavigation('/food', e)}>
 <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-white border border-transparent hover:border-border transition-all">
 Cancel
 </button>
 </Link>
 <Button form="update-food-form" type="submit" disabled={isSubmitting || !hasUnsavedChanges} className="gap-2 px-8 shadow-sm">
 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 {isSubmitting ? 'Updating...' : 'Save Changes'}
 </Button>
 </div>
        </form>
 </Card>
 </motion.div>
 </div>
 );
}
