import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import { hashPassword } from '../../lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
 const navigate = useNavigate();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false);

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!email || !password) {
 toast.error('Please enter email and password');
 return;
 }
 if (!/^\S+@\S+\.\S+$/.test(email)) {
 toast.error('Please enter a valid email address');
 return;
 }

 setIsLoading(true);
 try {
 const hashedPw = await hashPassword(password);
 
 const employeeRef = ref(rtdb, 'employee');
 const snapshot = await get(employeeRef);
 
 let matchedUser = null;
 let userFoundButWrongPassword = false;
 let userFoundButWrongRole = false;
 
 if (snapshot.exists()) {
 const data = snapshot.val();
 // data structure: employee/{adminUid}/{branchCode}/{empUid}
 for (const adminUid in data) {
 const branches = data[adminUid];
 if (typeof branches === 'object') {
 for (const branchCode in branches) {
 const employees = branches[branchCode];
 if (typeof employees === 'object') {
 for (const empUid in employees) {
 const emp = employees[empUid];
 if (emp && emp.email === email) {
 if (emp.password === hashedPw) {
 // Override branch with branchCode from the path in case of data entry typos like BROO3 vs BR003
 matchedUser = { ...emp, branch: branchCode, id: empUid, adminId: adminUid };
 } else {
 userFoundButWrongPassword = true;
 }
 }
 }
 }
 }
 }
 }
 }

 if (matchedUser) {
 if (matchedUser.status === 'Inactive') {
 toast.error('Your account is currently inactive. Please contact your administrator.');
 } else if (matchedUser.role === 'Delivery Partner') {
 toast.error('Delivery Partners are not authorized to log into the Restaurant Portal');
 } else if (matchedUser.role === 'Branch Manager') {
 toast.success('Login successful!');
 localStorage.setItem('restaurant_user', JSON.stringify(matchedUser));
 navigate('/dashboard');
 } else {
 toast.error('Unauthorized role');
 }
 } else {
 toast.error('Invalid credentials');
 }

 } catch (error: any) {
 console.error(error);
 toast.error('Failed to log in');
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex lg:flex-row-reverse bg-background">
 {/* Right side: Premium Login Form */}
 <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-24 xl:px-32 relative z-10 bg-white shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)]">
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="mx-auto w-full max-w-md"
 >
 <div className="flex items-center gap-3 mb-12">
 <img src="/logo.png" alt="DineOS Logo" className="h-10 object-contain" />
 </div>

 <div>
 <h2 className="text-3xl font-bold tracking-tight text-text-primary">Sign in to DineOS</h2>
 <p className="mt-2 text-text-secondary">Welcome back. Enter your credentials to access the command center.</p>
 </div>

 <form className="mt-8 space-y-6" onSubmit={handleLogin}>
 <div className="space-y-4">
 <div>
 <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-1.5">
 Email address
 </label>
 <input
 id="email"
 type="email"
 className="input-field"
 placeholder="admin@dineos.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 />
 </div>
 
 <div>
 <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-1.5">
 Password
 </label>
 <div className="relative">
 <input
 id="password"
 type={showPassword ?"text" :"password"}
 className="input-field pr-10"
 placeholder="••••••••"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
 aria-label={showPassword ?"Hide password" :"Show password"}
 >
 {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
 </button>
 </div>
 <div className="flex justify-end mt-1.5">
 <Link to="/forgot-password" className="text-sm font-medium text-brand-orange-600 hover:text-brand-orange-500 transition-colors">
 Forgot password?
 </Link>
 </div>
 </div>
 </div>

 <div className="flex items-center">
 <input
 id="remember-me"
 name="remember-me"
 type="checkbox"
 className="h-4 w-4 rounded border-gray-300 text-brand-orange-600 focus:ring-brand-orange-500 transition-colors"
 />
 <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-text-secondary">
 Keep me signed in
 </label>
 </div>

 <Button type="submit" className="w-full text-base py-3.5 mt-2" disabled={isLoading}>
 {isLoading ? 'Signing in...' : 'Sign in to Dashboard'}
 </Button>
 </form>
 
 <p className="mt-8 text-center text-sm text-text-secondary font-medium">
 Don't have an account?{' '}
 <a href="#" className="text-brand-orange-600 hover:text-brand-orange-500 transition-colors">
 Contact Sales
 </a>
 </p>
 </motion.div>
 </div>

 {/* Left side: Elegant Visual Section */}
 <div className="hidden lg:block relative w-0 flex-1 bg-background overflow-hidden">
 <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-brand-orange-50 to-background flex flex-col items-center justify-center p-12">
 
 <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-orange-500/5 rounded-full blur-3xl mix-blend-multiply"></div>
 <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-brand-green/5 rounded-full blur-3xl mix-blend-multiply"></div>

 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.8, delay: 0.2 }}
 className="relative z-10 w-full max-w-2xl bg-white/50 backdrop-blur-xl border border-white/20 shadow-premium rounded-[2.5rem] p-12 text-center"
 >
 <div className="w-20 h-20 mx-auto bg-white rounded-3xl shadow-soft flex items-center justify-center mb-8 border border-border">
 <img src="/logo.png" alt="DineOS Logo" className="w-12 h-12 object-contain" />
 </div>
 <h2 className="text-4xl font-extrabold text-brand-navy tracking-tight mb-6">
 The Enterprise Restaurant Operating System.
 </h2>
 <p className="text-xl text-text-secondary leading-relaxed max-w-lg mx-auto">
 Unify your branches, staff, menus, and analytics into one seamless command center designed for modern dining businesses.
 </p>
 </motion.div>
 
 </div>
 </div>
 </div>
 );
}
