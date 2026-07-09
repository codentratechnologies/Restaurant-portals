import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail, MapPin, Briefcase, Store, User } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function EmployeeDetails() {
 const navigate = useNavigate();
 const { id } = useParams();

 // Mock Data
 const employeeInfo = {
 empId: 'E101',
 name: 'John Doe',
 status: 'Active',
 email: 'john.doe@example.com',
 phone: '+1 (555) 123-4567',
 role: 'Branch Manager',
 branch: 'Downtown Main (B001)',
 address: '456 Elm St, New York, NY 100002',
 dateOfJoining: '2023-01-15',
 shift: 'Morning (09:00 AM - 05:00 PM)',
 emergencyContact: '+1 (555) 987-6543'
 };

 return (
 <div className="space-y-6">
 
 {/* Persistent Header Card */}
 <div className="sticky top-0 z-20 -mx-4 px-4 sm:mx-0 sm:px-0">
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
 <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <button onClick={() => navigate(-1)} type="button" className="p-2 hover:bg-white rounded-full transition-colors shrink-0 shadow-sm border border-border bg-gray-50">
 <ArrowLeft className="w-5 h-5 text-text-secondary" />
 </button>
 <div className="flex items-center gap-4">
 <div className="hidden sm:flex w-12 h-12 rounded-full bg-orange-100 items-center justify-center border border-brand-orange-200 shadow-sm text-brand-orange-600">
 <User className="w-6 h-6" />
 </div>
 <div>
 <div className="flex items-center gap-3 mb-1">
 <h1 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">{employeeInfo.name}</h1>
 <Badge variant={employeeInfo.status === 'Active' ? 'success' : 'error'} className="font-bold">
 {employeeInfo.status}
 </Badge>
 </div>
 <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
 <span className="font-mono bg-gray-100 border border-border px-1.5 py-0.5 rounded text-brand-navy font-bold">{employeeInfo.empId}</span>
 <span>•</span>
 <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {employeeInfo.role}</span>
 </div>
 </div>
 </div>
 </div>


 </Card>
 </motion.div>
 </div>

 {/* Employee Information */}
 <motion.div 
 initial={{ opacity: 0, y: 10 }} 
 animate={{ opacity: 1, y: 0 }} 
 transition={{ duration: 0.3, delay: 0.1 }}
 className="space-y-6"
 >
 <Card className="p-8 border border-border/50 shadow-soft">
 <h3 className="text-lg font-black text-brand-navy mb-6">Personal Details</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Employee ID</p>
 <p className="font-mono font-bold text-brand-navy">{employeeInfo.empId}</p>
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Contact Phone</p>
 <p className="font-medium text-brand-navy flex items-center gap-2"><Phone className="w-4 h-4 text-brand-orange-500" /> {employeeInfo.phone}</p>
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Email Address</p>
 <p className="font-medium text-brand-navy flex items-center gap-2"><Mail className="w-4 h-4 text-brand-orange-500" /> {employeeInfo.email}</p>
 </div>
 <div className="space-y-1 lg:col-span-2">
 <p className="text-sm font-bold text-text-secondary">Residential Address</p>
 <p className="font-medium text-brand-navy flex items-start gap-2"><MapPin className="w-4 h-4 text-brand-orange-500 mt-0.5 shrink-0" /> {employeeInfo.address}</p>
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Emergency Contact</p>
 <p className="font-medium text-brand-navy flex items-center gap-2"><Phone className="w-4 h-4 text-red-500" /> {employeeInfo.emergencyContact}</p>
 </div>
 </div>
 </Card>

 <Card className="p-8 border border-border/50 shadow-soft bg-orange-50/30">
 <h3 className="text-lg font-black text-brand-navy mb-6">Employment Details</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Assigned Role</p>
 <p className="font-medium text-brand-navy flex items-center gap-2"><Briefcase className="w-4 h-4 text-brand-orange-500" /> {employeeInfo.role}</p>
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Assigned Branch</p>
 <p className="font-medium text-brand-navy flex items-center gap-2"><Store className="w-4 h-4 text-brand-orange-500" /> {employeeInfo.branch}</p>
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Shift Timing</p>
 <p className="font-medium text-brand-navy">{employeeInfo.shift}</p>
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-text-secondary">Date of Joining</p>
 <p className="font-medium text-brand-navy">{employeeInfo.dateOfJoining}</p>
 </div>
 </div>
 </Card>
 </motion.div>
 </div>
 );
}
