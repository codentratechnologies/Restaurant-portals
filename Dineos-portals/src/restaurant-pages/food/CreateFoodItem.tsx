import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ImageUploadZone from './components/ImageUploadZone';

export default function CreateFoodItem() {
 const navigate = useNavigate();
 
 const [formData, setFormData] = useState({
 name: '',
 category: '',
 dietaryType: '',
 price: '',
 description: '',
 });
 
 const [image, setImage] = useState<string | undefined>(undefined);
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);

 const errorRefs = useRef<Record<string, HTMLDivElement | null>>({});

 const validate = () => {
 const newErrors: Record<string, string> = {};

 if (!formData.name) newErrors.name = 'Item Name is required';
 else if (formData.name.length < 3 || formData.name.length > 100) newErrors.name = 'Must be between 3 and 100 characters';

 if (!formData.category) newErrors.category = 'Category is required';
 if (!formData.dietaryType) newErrors.dietaryType = 'Dietary Type is required';
 if (!formData.price) newErrors.price = 'Base Price is required';
 else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) newErrors.price = 'Must be a valid positive number';

 if (!formData.description) newErrors.description = 'Description is required';
 else if (formData.description.length > 500) newErrors.description = 'Cannot exceed 500 characters';
 if (!image) newErrors.image = 'Food image is required';

 setErrors(newErrors);

 if (Object.keys(newErrors).length > 0) {
 const firstError = Object.keys(newErrors)[0];
 errorRefs.current[firstError]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
 return false;
 }
 return true;
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
 };

 const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
 if (e) e.preventDefault();
 if (!validate()) return;
 
 setIsSubmitting(true);
 await new Promise(r => setTimeout(r, 1500));
 setIsSubmitting(false);
 navigate('/food');
 };

 const InputField = ({ label, name, type = 'text', placeholder = '', required = false, children }: { label: string, name: string, type?: string, placeholder?: string, required?: boolean, children?: React.ReactNode }) => (
 <div ref={el => { errorRefs.current[name] = el; }} className="flex flex-col gap-1.5">
 <label className="text-sm font-bold text-brand-navy">
 {label} {required && <span className="text-red-500">*</span>}
 </label>
 {children ? children : (
 <input
 type={type}
 name={name}
 value={formData[name as keyof typeof formData]}
 onChange={handleChange}
 placeholder={placeholder}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white ${
 errors[name] ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 )}
 {errors[name] && <span className="text-xs font-bold text-red-500 mt-0.5">{errors[name]}</span>}
 </div>
 );

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
 <div className="flex items-center gap-4">
 <button onClick={() => navigate(-1)} type="button" className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-gray-50 border border-border">
 <ArrowLeft className="w-5 h-5 text-text-secondary" />
 </button>
 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
 <h1 className="text-2xl font-black text-brand-navy tracking-tight">Create Food Item</h1>
 <p className="text-text-secondary mt-0.5 text-sm font-medium">Add a new item to your menu catalog.</p>
 </motion.div>
 </div>
 
 </div>

 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
 <Card className="p-0 border border-border/50 shadow-soft bg-white overflow-hidden">
 <form id="create-food-form" onSubmit={handleSubmit} className="flex flex-col">
 
 {/* SECTION 1: Item Details */}
 <div className="p-8">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border">1. Item Details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-2">
 <InputField label="Item Name" name="name" placeholder="e.g. Margherita Pizza" required />
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:col-span-2">
 <InputField label="Category" name="category" required>
 <select
 name="category"
 value={formData.category}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white appearance-none cursor-pointer ${
 errors.category ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 >
 <option value="" disabled>Select Category</option>
 <option value="Starters">Starters</option>
 <option value="Main Course">Main Course</option>
 <option value="Desserts">Desserts</option>
 <option value="Beverages">Beverages</option>
 </select>
 </InputField>

 <InputField label="Dietary Type" name="dietaryType" required>
 <select
 name="dietaryType"
 value={formData.dietaryType}
 onChange={handleChange}
 className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white appearance-none cursor-pointer ${
 errors.dietaryType ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 >
 <option value="" disabled>Select Dietary Type</option>
 <option value="Veg">Vegetarian</option>
 <option value="Non-Veg">Non-Vegetarian</option>
 <option value="Egg">Contains Egg</option>
 <option value="Vegan">Vegan</option>
 </select>
 </InputField>
 </div>

 <InputField label="Base Price (₹)" name="price" type="number" placeholder="0.00" required />

 <div className="md:col-span-2">
 <InputField label="Description" name="description" required>
 <textarea
 name="description"
 value={formData.description}
 onChange={handleChange}
 rows={4}
 placeholder="Enter a mouth-watering description..."
 className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium transition-all resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:bg-white ${
 errors.description ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-brand-orange-500 hover:border-brand-orange-300'
 }`}
 />
 </InputField>
 </div>
 </div>
 </div>

 {/* SECTION 2: Item Image */}
 <div className="p-8 border-t border-border bg-gray-50/30">
 <h2 className="text-lg font-black text-brand-navy mb-6 pb-4 border-b border-border flex items-center justify-between">
 <span>2. Item Image <span className="text-red-500 text-sm">*</span></span>
 <span className="text-xs text-text-secondary font-medium font-normal">Max 2MB. JPG or PNG only.</span>
 </h2>
 <div ref={el => { errorRefs.current['image'] = el; }} className="max-w-sm">
 <ImageUploadZone 
 currentImage={image} 
 onUploadSuccess={(url) => { setImage(url); setErrors(prev => ({ ...prev, image: '' })); }} 
 onRemove={() => setImage(undefined)}
 error={errors.image}
 />
 </div>
 </div>

   <div className="p-8 border-t border-border bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
 <Link to="/food">
 <button type="button" className="px-6 py-2.5 rounded-xl font-bold text-text-secondary hover:text-brand-navy hover:bg-white border border-transparent hover:border-border transition-all">
 Cancel
 </button>
 </Link>
 <Button form="create-food-form" type="submit" disabled={isSubmitting} className="gap-2 px-8 shadow-sm">
 {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 {isSubmitting ? 'Saving...' : 'Save Food Item'}
 </Button>
 </div>
        </form>
 </Card>
 </motion.div>
 </div>
 );
}
