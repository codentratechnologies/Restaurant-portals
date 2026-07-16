import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, MapPin, Calendar, User, Phone, Mail, ShieldCheck, Briefcase, Printer, Trash2, IdCard, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBranches } from '../../hooks/useBranches';
import { ref, get } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function EmployeeDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { branches } = useBranches();
  
  const [employeeInfo, setEmployeeInfo] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!user || !id) return;
      try {
        const snapshot = await get(ref(rtdb, `employee/${user.uid}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          let foundEmployee: any = null;

          for (const branchCode of Object.keys(data)) {
            if (data[branchCode][id]) {
              foundEmployee = data[branchCode][id];
              break;
            }
          }

          if (foundEmployee) {
            let role = foundEmployee.role;
            if (role === 'Manager') role = 'Branch Manager';
            if (role === 'Delivery Executive') role = 'Delivery Partner';
            setEmployeeInfo({ id, ...foundEmployee, role });
          } else {
            toast.error('Employee not found');
            navigate('/admin/employees');
          }
        } else {
          toast.error('Employee not found');
          navigate('/admin/employees');
        }
      } catch (err) {
        console.error('Error fetching employee details:', err);
        toast.error('Failed to load employee details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployee();
  }, [user, id, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (!employeeInfo) return null;

  const branch = branches.find(b => b.code === employeeInfo.branchCode || b.code === employeeInfo.branch);
  const branchName = branch?.name || employeeInfo.branch || 'None';
  const empCode = employeeInfo.empId || employeeInfo.employeeCode || `EMP-${employeeInfo.id.substring(1, 4).toUpperCase()}`;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-row items-start justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-white border border-[#E8ECF4] rounded-lg text-sm font-bold text-[#1a1f36] hover:bg-gray-50 transition-colors mb-4 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Employees</span>
            <span className="sm:hidden">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a1f36] tracking-tight">Employee Profile</h1>
          <p className="text-xs sm:text-sm font-semibold text-[#8896AB] mt-1">View employee details and information.</p>
        </div>
        
        <Link to={`/admin/employees/${id}/edit`} className="shrink-0 mt-1 sm:mt-0">
          <button className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 bg-white border border-[#FF6B00] rounded-xl text-sm font-bold text-[#FF6B00] hover:bg-[#FFF3E8] transition-colors shadow-sm">
            <Edit2 className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline sm:ml-2">Edit Employee</span>
          </button>
        </Link>
      </div>

      {/* Main Profile Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-[#FFF9F5] border border-[#FFD0B5] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img 
            src={`https://ui-avatars.com/api/?name=${employeeInfo.firstName}+${employeeInfo.lastName}&background=E5E7EB&color=4B5563&size=160&rounded=true`}
            alt={`${employeeInfo.firstName} ${employeeInfo.lastName}`}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-md object-cover"
          />
          {employeeInfo.status === 'Active' && (
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#00A254] border-4 border-[#FFF9F5] rounded-full"></div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 w-full space-y-6">
          <div className="text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h2 className="text-2xl md:text-3xl font-black text-[#1a1f36]">
                {employeeInfo.firstName} {employeeInfo.lastName}
              </h2>
              {employeeInfo.status === 'Active' ? (
                <span className="inline-flex px-2 py-1 rounded-md bg-[#E5F5ED] text-[#00A254] text-[11px] font-bold">
                  Active
                </span>
              ) : (
                <span className="inline-flex px-2 py-1 rounded-md bg-[#FFF3E8] text-[#FF6B00] text-[11px] font-bold">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-[#FF6B00] font-bold mt-1.5">{employeeInfo.role}</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-4 border-t border-[#FFD0B5]/50 mt-4 w-full">
            <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-[#FFD0B5]/50">
              <div className="p-2.5 bg-white rounded-lg border border-[#FFD0B5] shrink-0"><IdCard className="w-5 h-5 text-[#FF6B00]" /></div>
              <div>
                <p className="font-bold text-[#1a1f36] text-sm">{empCode}</p>
                <p className="text-[11px] font-semibold text-[#8896AB]">Employee ID</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-[#FFD0B5]/50">
              <div className="p-2.5 bg-white rounded-lg border border-[#FFD0B5] shrink-0"><MapPin className="w-5 h-5 text-[#FF6B00]" /></div>
              <div>
                <p className="font-bold text-[#1a1f36] text-sm line-clamp-1">{branchName}</p>
                <p className="text-[11px] font-semibold text-[#8896AB]">Branch</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-[#FFD0B5]/50">
              <div className="p-2.5 bg-white rounded-lg border border-[#FFD0B5] shrink-0"><Calendar className="w-5 h-5 text-[#FF6B00]" /></div>
              <div>
                <p className="font-bold text-[#1a1f36] text-sm">{employeeInfo.doj || 'N/A'}</p>
                <p className="text-[11px] font-semibold text-[#8896AB]">Joined Date</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Two Column Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Personal Information */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="bg-white border border-[#E8ECF4] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E8ECF4]/50">
            <div className="p-2 bg-[#FFF3E8] rounded-lg text-[#FF6B00]">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-[#1a1f36]">Personal Information</h3>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 sm:items-center">
              <div className="sm:col-span-1 flex items-center gap-2 text-xs sm:text-sm font-bold text-[#8896AB]">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Full Name
              </div>
              <div className="sm:col-span-2 font-bold text-[#1a1f36] text-sm sm:text-base">
                {employeeInfo.firstName} {employeeInfo.lastName}
              </div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 sm:items-center">
              <div className="sm:col-span-1 flex items-center gap-2 text-xs sm:text-sm font-bold text-[#8896AB]">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Phone Number
              </div>
              <div className="sm:col-span-2 font-bold text-[#1a1f36] text-sm sm:text-base">
                {employeeInfo.phone}
              </div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 sm:items-center">
              <div className="sm:col-span-1 flex items-center gap-2 text-xs sm:text-sm font-bold text-[#8896AB]">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Email Address
              </div>
              <div className="sm:col-span-2 font-bold text-[#1a1f36] text-sm sm:text-base break-all">
                {employeeInfo.email}
              </div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 sm:items-center">
              <div className="sm:col-span-1 flex items-center gap-2 text-xs sm:text-sm font-bold text-[#8896AB]">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Status
              </div>
              <div className="sm:col-span-2">
                {employeeInfo.status === 'Active' ? (
                  <span className="inline-flex px-2 py-1 rounded-md bg-[#E5F5ED] text-[#00A254] text-[11px] font-bold">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-1 rounded-md bg-[#FFF3E8] text-[#FF6B00] text-[11px] font-bold">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Employment Information */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} className="bg-white border border-[#E8ECF4] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E8ECF4]/50">
            <div className="p-2 bg-[#FFF3E8] rounded-lg text-[#FF6B00]">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-[#1a1f36]">Employment Information</h3>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 sm:items-center">
              <div className="sm:col-span-1 flex items-center gap-2 text-xs sm:text-sm font-bold text-[#8896AB]">
                <IdCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Employee ID
              </div>
              <div className="sm:col-span-2 font-bold text-[#1a1f36] text-sm sm:text-base">
                {empCode}
              </div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 sm:items-center">
              <div className="sm:col-span-1 flex items-center gap-2 text-xs sm:text-sm font-bold text-[#8896AB]">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Role
              </div>
              <div className="sm:col-span-2 font-bold text-[#1a1f36] text-sm sm:text-base">
                {employeeInfo.role}
              </div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 sm:items-center">
              <div className="sm:col-span-1 flex items-center gap-2 text-xs sm:text-sm font-bold text-[#8896AB]">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Branch
              </div>
              <div className="sm:col-span-2 font-bold text-[#1a1f36] text-sm sm:text-base">
                {branchName}
              </div>
            </div>

            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-4 sm:items-center">
              <div className="sm:col-span-1 flex items-center gap-2 text-xs sm:text-sm font-bold text-[#8896AB]">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Joining Date
              </div>
              <div className="sm:col-span-2 font-bold text-[#1a1f36] text-sm sm:text-base">
                {employeeInfo.doj || 'N/A'}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
