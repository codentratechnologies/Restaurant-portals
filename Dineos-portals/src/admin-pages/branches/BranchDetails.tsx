import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit2, Phone, Mail, MapPin, Search, Loader2, MoreVertical, Building2, Calendar, Map, CheckCircle2, Clock, Globe, CreditCard, Wifi, Car, Bike, ShoppingBag, Utensils, Plus } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';

import DeactivateBranchModal from './components/DeactivateBranchModal';
import { useAuth } from '../../hooks/useAuth';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';

const TABS: { id: string; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'employees', label: 'Employees' },
];

export default function BranchDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const { user } = useAuth();
  const [isDeactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [branchInfo, setBranchInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !id) return;
    const branchRef = ref(rtdb, `branch/${user.uid}/${id}`);
    const unsubscribe = onValue(branchRef, (snapshot) => {
      if (snapshot.exists()) {
        setBranchInfo(snapshot.val());
      } else {
        navigate('/admin/branches');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user, id, navigate]);

  useEffect(() => {
    if (!user || !branchInfo?.code) return;
    
    const employeesRef = ref(rtdb, `employee/${user.uid}/${branchInfo.code}`);
    const unsubscribeEmployees = onValue(employeesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const branchEmployees = Object.keys(data).map(empId => {
          const emp = data[empId];
          return {
            id: empId,
            empId: emp.employeeId || emp.empId || empId.substring(0, 8).toUpperCase(),
            name: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown',
            role: emp.role || 'Unknown',
            phone: emp.phone || 'N/A',
            email: emp.email || 'N/A',
            status: emp.status || 'Active',
            joinedOn: emp.created_at || new Date().toISOString()
          };
        });
        setEmployees(branchEmployees);
      } else {
        setEmployees([]);
      }
    });

    return () => unsubscribeEmployees();
  }, [user, branchInfo?.code]);

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const [empCurrentPage, setEmpCurrentPage] = useState(1);
  const EMP_ITEMS_PER_PAGE = 5;

  const filteredEmployees = useMemo(() => {
    if (empSearchQuery.length >= 2) {
      const q = empSearchQuery.toLowerCase();
      return employees.filter(e => e.name.toLowerCase().includes(q) || e.empId.toLowerCase().includes(q));
    }
    return employees;
  }, [employees, empSearchQuery]);

  const empTotalPages = Math.max(1, Math.ceil(filteredEmployees.length / EMP_ITEMS_PER_PAGE));
  const paginatedEmployees = useMemo(() => {
    const start = (empCurrentPage - 1) * EMP_ITEMS_PER_PAGE;
    return filteredEmployees.slice(start, start + EMP_ITEMS_PER_PAGE);
  }, [filteredEmployees, empCurrentPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (!branchInfo) return null;

  return (
    <div className="space-y-6 pb-12 max-w-[1200px] mx-auto">
      {/* Breadcrumbs & Back */}
      <div className="flex items-center gap-4">
        <Link to="/admin/branches">
          <Button variant="secondary" className="px-4 py-2 bg-white border border-[#E8ECF4] rounded-xl flex items-center gap-2 text-sm font-bold text-[#1a1f36] hover:bg-[#F8FAFC]">
            <ArrowLeft className="w-4 h-4" /> Back to Branches
          </Button>
        </Link>
      </div>

      {/* Header Section */}
      <Card className="p-6 sm:p-8 border border-[#FF6B00]/20 shadow-sm bg-gradient-to-br from-[#FF6B00]/10 via-[#FF6B00]/5 to-white rounded-3xl flex flex-col md:flex-row gap-6 items-center md:items-center justify-between relative overflow-hidden text-center md:text-left mt-2">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 w-full">
          <div className="w-24 h-24 sm:w-20 sm:h-20 bg-white border-4 border-white rounded-full sm:rounded-2xl shadow-md flex items-center justify-center shrink-0 relative overflow-hidden mx-auto md:mx-0">
            <div className="absolute inset-0 bg-[#FF6B00]/10"></div>
            <Building2 className="w-10 h-10 sm:w-10 sm:h-10 text-[#FF6B00] relative z-10" />
          </div>
          <div className="space-y-4 flex-1 flex flex-col items-center md:items-start w-full">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <h1 className="text-3xl sm:text-2xl font-black text-[#1a1f36] tracking-tight">{branchInfo.name}</h1>
              <Badge variant={branchInfo.is_active ? 'success' : 'error'} className="font-bold uppercase tracking-wider text-[11px] px-3 py-1 sm:text-[10px] sm:px-2.5 sm:py-1 shadow-sm shrink-0">
                {branchInfo.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 text-[15px] sm:text-sm font-bold text-[#8896AB] w-full sm:w-auto bg-white/50 sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none border border-white/40 sm:border-0 shadow-sm sm:shadow-none">
              <div className="flex items-center gap-2"><Building2 className="w-4 h-4 sm:w-4 sm:h-4 text-[#8896AB]" /> {branchInfo.code}</div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 sm:w-4 sm:h-4 text-[#FF6B00]" /> {branchInfo.phone}</div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-2 break-all"><Mail className="w-4 h-4 sm:w-4 sm:h-4 text-[#FF6B00] shrink-0" /> {branchInfo.email}</div>
            </div>
          </div>
        
          <div className="flex flex-col w-full md:w-auto shrink-0 mt-4 md:mt-0">
            <Link to={`/admin/branches/${id}/edit`} className="w-full">
              <Button variant="secondary" className="w-full px-6 py-3.5 sm:py-2.5 bg-white border border-[#FF6B00]/20 hover:border-[#FF6B00]/50 hover:bg-[#FFF3E8] rounded-xl flex items-center justify-center gap-2 text-sm font-black text-[#FF6B00] shadow-sm transition-all">
                <Edit2 className="w-4 h-4" /> Edit Branch
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-[#E8ECF4]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`relative pb-4 text-sm font-black transition-colors ${
              activeTab === tab.id ? 'text-[#FF6B00]' : 'text-[#8896AB] hover:text-[#1a1f36]'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="branchTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Branch Information */}
              <Card className="p-6 border border-[#E8ECF4] shadow-sm bg-white rounded-3xl space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF3E8] flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <h3 className="text-lg font-black text-[#1a1f36]">Branch Info</h3>
                </div>
                <div className="space-y-5 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-gray-50 sm:border-0 sm:pb-0">
                    <span className="text-[13px] sm:text-sm font-bold text-[#8896AB] uppercase tracking-wider sm:tracking-normal sm:normal-case">Branch Code</span>
                    <span className="text-[15px] sm:text-sm font-black text-[#1a1f36]">{branchInfo.code}</span>
                  </div>
                  {branchInfo.restaurant && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-gray-50 sm:border-0 sm:pb-0">
                      <span className="text-[13px] sm:text-sm font-bold text-[#8896AB] uppercase tracking-wider sm:tracking-normal sm:normal-case">Restaurant</span>
                      <span className="text-[15px] sm:text-sm font-black text-[#1a1f36]">{branchInfo.restaurant}</span>
                    </div>
                  )}
                  {branchInfo.branchType && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-gray-50 sm:border-0 sm:pb-0">
                      <span className="text-[13px] sm:text-sm font-bold text-[#8896AB] uppercase tracking-wider sm:tracking-normal sm:normal-case">Branch Type</span>
                      <span className="text-[15px] sm:text-sm font-black text-[#1a1f36]">{branchInfo.branchType}</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-gray-50 sm:border-0 sm:pb-0">
                    <span className="text-[13px] sm:text-sm font-bold text-[#8896AB] uppercase tracking-wider sm:tracking-normal sm:normal-case">Email</span>
                    <span className="text-[15px] sm:text-sm font-black text-[#1a1f36] break-all">{branchInfo.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-gray-50 sm:border-0 sm:pb-0">
                    <span className="text-[13px] sm:text-sm font-bold text-[#8896AB] uppercase tracking-wider sm:tracking-normal sm:normal-case">Phone Number</span>
                    <span className="text-[15px] sm:text-sm font-black text-[#1a1f36]">{branchInfo.phone}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-[13px] sm:text-sm font-bold text-[#8896AB] uppercase tracking-wider sm:tracking-normal sm:normal-case">Status</span>
                    <Badge variant={branchInfo.is_active ? 'success' : 'error'} className="font-bold px-3 py-1 text-[11px] uppercase w-fit">
                      {branchInfo.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Address */}
              <Card className="p-6 border border-[#E8ECF4] shadow-sm bg-white rounded-3xl flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF3E8] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <h3 className="text-lg font-black text-[#1a1f36]">Location</h3>
                </div>
                <div className="text-[15px] sm:text-sm font-bold text-[#1a1f36] leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#E8ECF4]/50 mb-6 flex-1">
                  {branchInfo.address}<br />
                  {branchInfo.city}, {branchInfo.state} - {branchInfo.pincode}<br />
                  {branchInfo.country || 'India'}
                </div>
              </Card>

              {/* Branch Timings */}
              <Card className="p-6 border border-[#E8ECF4] shadow-sm bg-white rounded-3xl space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF3E8] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <h3 className="text-lg font-black text-[#1a1f36]">Timings</h3>
                </div>
                <div className="space-y-5 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-gray-50 sm:border-0 sm:pb-0">
                    <span className="text-[13px] sm:text-sm font-bold text-[#8896AB] uppercase tracking-wider sm:tracking-normal sm:normal-case">Opening Time</span>
                    <span className="text-[15px] sm:text-sm font-black text-[#1a1f36]">{branchInfo.openTime}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-gray-50 sm:border-0 sm:pb-0">
                    <span className="text-[13px] sm:text-sm font-bold text-[#8896AB] uppercase tracking-wider sm:tracking-normal sm:normal-case">Closing Time</span>
                    <span className="text-[15px] sm:text-sm font-black text-[#1a1f36]">{branchInfo.closeTime}</span>
                  </div>
                  {branchInfo.timeZone && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#E8ECF4] sm:border-b sm:pb-4">
                      <span className="text-[13px] sm:text-sm font-bold text-[#8896AB] uppercase tracking-wider sm:tracking-normal sm:normal-case">Time Zone</span>
                      <span className="text-[15px] sm:text-sm font-black text-[#1a1f36]">{branchInfo.timeZone}</span>
                    </div>
                  )}
                  {branchInfo.deliveryAvailable !== undefined && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[14px] sm:text-sm font-black text-[#1a1f36]">Delivery Available</span>
                      <span className="text-[14px] sm:text-sm font-black text-[#00A254] bg-[#E5F5ED] px-3 py-1 rounded-md flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Yes</span>
                    </div>
                  )}
                  {branchInfo.takeawayAvailable !== undefined && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[14px] sm:text-sm font-black text-[#1a1f36]">Takeaway Available</span>
                      <span className="text-[14px] sm:text-sm font-black text-[#00A254] bg-[#E5F5ED] px-3 py-1 rounded-md flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Yes</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border border-[#E8ECF4] shadow-sm bg-white rounded-2xl space-y-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFF3E8] flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-[#FF6B00]" />
                  </div>
                  <h3 className="text-base font-black text-[#1a1f36]">Branch Description</h3>
                </div>
                <p className="text-sm font-semibold text-[#8896AB] leading-relaxed">
                  {branchInfo.description || "No description provided."}
                </p>
              </Card>

              <Card className="p-6 border border-[#E8ECF4] shadow-sm bg-white rounded-2xl flex flex-col justify-center space-y-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#F8FAFC] rounded-xl"><Calendar className="w-5 h-5 text-[#8896AB]" /></div>
                  <div>
                    <p className="text-xs font-bold text-[#1a1f36] mb-1">Created At</p>
                    <p className="text-sm font-semibold text-[#8896AB]">
                      {new Date(branchInfo.created_at || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })},{' '}
                      {new Date(branchInfo.created_at || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#F8FAFC] rounded-xl"><Calendar className="w-5 h-5 text-[#8896AB]" /></div>
                  <div>
                    <p className="text-xs font-bold text-[#1a1f36] mb-1">Last Updated</p>
                    <p className="text-sm font-semibold text-[#8896AB]">
                      {new Date(branchInfo.updated_at || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })},{' '}
                      {new Date(branchInfo.updated_at || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </Card>
            </div>


          </motion.div>
        )}

        {activeTab === 'employees' && (
          <motion.div key="employees" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <Card className="p-0 border border-[#E8ECF4] shadow-sm bg-white rounded-2xl overflow-hidden min-h-[400px]">
              {/* Table Header */}
              <div className="p-6 border-b border-[#E8ECF4] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#1a1f36]">Employees</h2>
                  <p className="text-sm font-semibold text-[#8896AB] mt-1">Manage employees working in this branch</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8896AB]" />
                    <input
                      type="text"
                      placeholder="Search employee by name or role..."
                      value={empSearchQuery}
                      onChange={e => setEmpSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[#E8ECF4] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <Table
                columns={[
                  {
                    header: 'EMPLOYEE',
                    cell: (item) => (
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 rounded-full bg-gray-200 border border-[#E8ECF4] flex items-center justify-center shrink-0 overflow-hidden">
                          {item.profileImage ? (
                            <img src={item.profileImage} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-[#8896AB] text-sm">
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-[#1a1f36] text-sm">{item.name}</span>
                          <span className="text-[11px] font-bold text-[#8896AB] mt-0.5">{item.empId}</span>
                        </div>
                      </div>
                    )
                  },
                  {
                    header: 'ROLE',
                    cell: (item) => (
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[11px] font-black ${
                        item.role === 'Branch Manager' ? 'bg-[#FFF3E8] text-[#FF6B00]' :
                        item.role === 'Cashier' ? 'bg-purple-100 text-purple-700' :
                        item.role === 'Chef' ? 'bg-yellow-100 text-yellow-700' :
                        item.role === 'Kitchen Staff' ? 'bg-blue-100 text-blue-700' :
                        item.role === 'Delivery Executive' || item.role === 'Delivery Partner' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.role}
                      </span>
                    )
                  },
                  {
                    header: 'PHONE',
                    cell: (item) => <span className="text-sm font-bold text-[#1a1f36]">{item.phone}</span>
                  },
                  {
                    header: 'EMAIL',
                    cell: (item) => <span className="text-sm font-bold text-[#1a1f36]">{item.email}</span>
                  },
                  {
                    header: 'STATUS',
                    cell: (item) => (
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status}
                      </span>
                    )
                  },
                  {
                    header: 'JOINED ON',
                    cell: (item) => <span className="text-sm font-bold text-[#1a1f36]">{new Date(item.joinedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ')}</span>
                  },
                  {
                    header: 'ACTIONS',
                    cell: (item) => (
                      <div className="flex items-center gap-2 justify-end pr-4">
                        <button className="p-2 border border-[#E8ECF4] rounded-lg hover:bg-gray-50 transition-colors text-[#8896AB]">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    ),
                    className: 'w-24 text-right',
                  }
                ]}
                data={paginatedEmployees}
                currentPage={empCurrentPage}
                totalPages={empTotalPages}
                onPageChange={setEmpCurrentPage}
                renderMobileItem={(item) => (
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 border border-[#E8ECF4] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                          {item.profileImage ? (
                            <img src={item.profileImage} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-[#8896AB] text-lg">
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-[#1a1f36] text-base">{item.name}</span>
                          <span className="text-[12px] font-bold text-[#8896AB]">{item.empId}</span>
                        </div>
                      </div>
                      <Badge variant={item.status === 'Active' ? 'success' : 'error'} className="font-bold px-2 py-0.5 text-[10px] uppercase shrink-0">
                        {item.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 bg-gray-50/50 p-3 rounded-xl border border-border/50">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-[#8896AB] uppercase tracking-wider">Role</span>
                        <span className="text-sm font-black text-[#1a1f36]">{item.role}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-[#8896AB] uppercase tracking-wider">Joined On</span>
                        <span className="text-sm font-black text-[#1a1f36]">{new Date(item.joinedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 px-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-[#FF6B00]" />
                        <span className="font-bold text-[#1a1f36]">{item.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-[#FF6B00]" />
                        <span className="font-bold text-[#1a1f36] truncate">{item.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border mt-1 justify-end">
                      <button className="p-2 border border-[#E8ECF4] rounded-xl hover:bg-gray-50 transition-colors text-[#8896AB]">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <DeactivateBranchModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        branchName={branchInfo.name}
      />
    </div>
  );
}
