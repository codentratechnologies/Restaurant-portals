import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MapPin, Store, Eye, Edit2, AlertOctagon, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table, { Column } from '../../components/common/Table';
import DeactivateBranchModal from './components/DeactivateBranchModal';

interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  status: 'Active' | 'Inactive';
}

const initialMockBranches: Branch[] = [
  { id: '1', code: 'B001', name: 'Downtown Main', city: 'New York', address: '123 Main St', status: 'Active' },
  { id: '2', code: 'B002', name: 'Westside Plaza', city: 'New York', address: '456 West Blvd', status: 'Active' },
  { id: '3', code: 'B003', name: 'North Mall Kiosk', city: 'Chicago', address: '789 North Ave', status: 'Inactive' },
  { id: '4', code: 'B004', name: 'Southpark Center', city: 'Los Angeles', address: '101 South St', status: 'Active' },
  { id: '5', code: 'B005', name: 'Eastside Hub', city: 'Chicago', address: '202 East Blvd', status: 'Active' },
  { id: '6', code: 'B006', name: 'Uptown Grill', city: 'New York', address: '334 North St', status: 'Active' },
  { id: '7', code: 'B007', name: 'Sunset Diner', city: 'Los Angeles', address: '556 Sunset Blvd', status: 'Active' },
  { id: '8', code: 'B008', name: 'Lakeview Cafe', city: 'Chicago', address: '778 Lake Rd', status: 'Inactive' },
  { id: '9', code: 'B009', name: 'Midtown Express', city: 'New York', address: '990 Broadway', status: 'Active' },
  { id: '10', code: 'B010', name: 'Valley View', city: 'Los Angeles', address: '112 Valley Rd', status: 'Active' },
  { id: '11', code: 'B011', name: 'Airport Lounge', city: 'Chicago', address: 'Terminal 1', status: 'Active' },
  { id: '12', code: 'B012', name: 'Central Station', city: 'New York', address: 'Grand Central', status: 'Active' },
];

export default function BranchList() {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>(initialMockBranches);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Computed filtered data
  const filteredData = useMemo(() => {
    let result = branches;
    
    // Search validation: min 2 chars for query execution
    if (searchQuery.length >= 2) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (b) => b.name.toLowerCase().includes(lowerQuery) || b.code.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (statusFilter !== 'All') {
      result = result.filter((b) => b.status === statusFilter);
    }
    
    if (cityFilter !== 'All') {
      result = result.filter((b) => b.city === cityFilter);
    }
    
    return result;
  }, [branches, searchQuery, statusFilter, cityFilter]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, cityFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const handleActivate = async (id: string) => {
    // Optimistic UI update
    setBranches(prev => prev.map(b => b.id === id ? { ...b, status: 'Active' } : b));
  };

  const handleDeactivateClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (selectedBranch) {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      setBranches(prev => prev.map(b => b.id === selectedBranch.id ? { ...b, status: 'Inactive' } : b));
    }
  };

  const columns: Column<Branch>[] = [
    {
      header: 'Branch Code',
      accessor: 'code',
      className: 'font-mono text-brand-navy font-bold',
    },
    {
      header: 'Branch Name',
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-border shadow-sm">
            <Store className="w-5 h-5 text-text-secondary" />
          </div>
          <div>
            <p className="font-bold text-brand-navy">{item.name}</p>
            <p className="text-xs text-text-secondary mt-0.5 truncate max-w-[200px]">{item.address}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'City',
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-text-secondary font-medium">
          <MapPin className="w-4 h-4" />
          {item.city}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (item) => (
        <Badge variant={item.status === 'Active' ? 'success' : 'error'} className="font-bold px-3 py-1 shadow-sm">
          {item.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className="flex items-center justify-start gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link to={`/branches/${item.id}`} className="p-2 text-text-secondary hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </Link>
          <Link to={`/branches/${item.id}/edit`} className="p-2 text-text-secondary hover:text-brand-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </Link>
          {item.status === 'Active' ? (
            <button 
              onClick={() => handleDeactivateClick(item)}
              className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Deactivate Branch"
            >
              <AlertOctagon className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={() => handleActivate(item.id)}
              className="p-2 text-text-secondary hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Activate Branch"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      
    }
  ];

  const handleRowClick = (branch: Branch) => {
    navigate(`/branches/${branch.id}`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-black text-brand-navy tracking-tight">Branches</h1>
          <p className="text-text-secondary mt-1 text-sm font-medium">Manage all restaurant branches and operational locations.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Link to="/branches/new">
            <Button className="gap-2 shadow-sm font-bold">
              <Plus className="w-5 h-5" />
              Add Branch
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="p-0 overflow-hidden border border-border/50 shadow-soft bg-white flex flex-col min-h-[600px]">
          
          {/* Filter Bar (Sticky) */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-border p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand-orange-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by Name/Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 transition-all shadow-sm hover:bg-white focus:bg-white placeholder:text-text-secondary/60"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 md:flex-none appearance-none bg-gray-50/50 hover:bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 cursor-pointer shadow-sm transition-all"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <select 
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="flex-1 md:flex-none appearance-none bg-gray-50/50 hover:bg-white border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 cursor-pointer shadow-sm transition-all"
              >
                <option value="All">All Cities</option>
                <option value="New York">New York</option>
                <option value="Chicago">Chicago</option>
                <option value="Los Angeles">Los Angeles</option>
              </select>
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 flex flex-col relative bg-white">
            <Table
              columns={columns}
              data={paginatedData}
              isLoading={isLoading}
              onRowClick={handleRowClick}
              emptyStateMessage={
                searchQuery.length > 0 
                  ? `No branches found matching "${searchQuery}"` 
                  : 'No branches found.'
              }
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </Card>
      </motion.div>

      {/* Modals */}
      <DeactivateBranchModal 
        isOpen={deactivateModalOpen} 
        onClose={() => setDeactivateModalOpen(false)} 
        onConfirm={handleConfirmDeactivate}
        branchName={selectedBranch?.name || ''} 
      />
    </div>
  );
}


