import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Calendar, Eye, Search, Filter } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Table, { Column } from '../../components/common/Table';
import Select from '../../components/common/Select';

import { useOrders, Order } from '../../hooks/useOrders';

export default function OrderTable() {
  const { orders, loading } = useOrders();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [paymentFilter, setPaymentFilter] = useState('All Payment Methods');
  const [branchFilter, setBranchFilter] = useState('All Branches');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (dateParam) {
      result = result.filter(o => {
        if (!o.created_at) return false;
        const d = new Date(o.created_at);
        const oDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return oDateStr === dateParam;
      });
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) ||
        (o.customer?.phone || '').includes(q) ||
        (o.customer?.name || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All Status') {
      result = result.filter(o => o.status === statusFilter);
    }

    if (paymentFilter !== 'All Payment Methods') {
      result = result.filter(o => ((o as any).payment?.method || 'Online') === paymentFilter);
    }

    if (branchFilter !== 'All Branches') {
      result = result.filter(o => o.branch === branchFilter);
    }

    // Sort by descending created_at
    result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return result;
  }, [dateParam, debouncedSearch, statusFilter, paymentFilter, branchFilter, orders]);

  // Pagination Logic
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const currentOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const handleExportCSV = async () => {
    setIsExporting(true);
    await new Promise(r => setTimeout(r, 1000));

    const csvContent ="data:text/csv;charset=utf-8," +
      "Order ID,Time,Branch,Customer,Phone,Amount,Status\n" +
      filteredOrders.map(o => {
        const timeStr = o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        return `${o.id},${timeStr},${o.branch},${o.customer?.name || 'N/A'},${o.customer?.phone || 'N/A'},${o.billing?.total || 0},${o.status}`;
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered': return <Badge className="bg-[#E5F5ED] text-[#00A254] border-none font-bold shadow-none rounded-[4px] px-2.5 py-1">Delivered</Badge>;
      case 'Confirmed': return <Badge className="bg-[#F3E8FF] text-[#9333EA] border-none font-bold shadow-none rounded-[4px] px-2.5 py-1">Confirmed</Badge>;
      case 'Cancelled': return <Badge className="bg-[#FFF0F2] text-[#FF3B5C] border-none font-bold shadow-none rounded-[4px] px-2.5 py-1">Cancelled</Badge>;
      case 'Preparing': return <Badge className="bg-[#FFF8E1] text-[#F59E0B] border-none font-bold shadow-none rounded-[4px] px-2.5 py-1">Preparing</Badge>;
      case 'Out for Delivery': return <Badge className="bg-[#E8F0FE] text-[#1A73E8] border-none font-bold shadow-none rounded-[4px] px-2.5 py-1">Out for Delivery</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700 border-none font-bold shadow-none rounded-[4px] px-2.5 py-1">{status}</Badge>;
    }
  };

  const columns: Column<Order>[] = [
    {
      header: 'ORDER ID',
      className: 'w-[15%]',
      cell: (item) => {
        const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-brand-navy text-sm">#{item.id}</span>
            <span className="text-[11px] font-medium text-text-secondary">{dateStr}</span>
          </div>
        );
      },
    },
    {
      header: 'CUSTOMER',
      className: 'w-[18%]',
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-brand-navy text-sm truncate max-w-[120px]">{item.customer?.name || 'N/A'}</span>
          <span className="text-[11px] font-medium text-text-secondary">{item.customer?.phone || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'BRANCH',
      className: 'w-[20%]',
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-brand-navy text-sm truncate max-w-[140px]">{item.branch || 'DineOS Main'}</span>
          <span className="text-[11px] font-medium text-text-secondary">BR-{item.branch?.substring(0,3)?.toUpperCase() || '001'}</span>
        </div>
      ),
    },
    {
      header: 'STATUS',
      className: 'w-[12%]',
      cell: (item) => getStatusBadge(item.status),
    },
    {
      header: 'PAYMENT',
      className: 'w-[12%]',
      cell: (item) => {
        const payment = (item as any).payment;
        const method = payment?.method || 'Online';
        const isOnline = method === 'Online';
        const pStatus = payment?.status || (isOnline ? 'Paid' : 'Pending');
        return (
          <div className="flex flex-col gap-0.5">
            <span className={`text-[11px] font-bold ${isOnline ? 'text-[#00A254]' : 'text-[#FF6B00]'}`}>{method}</span>
            <span className="text-[11px] font-medium text-text-secondary">{pStatus}</span>
          </div>
        );
      },
    },
    {
      header: 'ORDER TIME',
      className: 'w-[10%]',
      cell: (item) => {
        const timeStr = item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        return <span className="text-[13px] font-medium text-text-secondary">{timeStr}</span>;
      }
    },
    {
      header: 'AMOUNT',
      className: 'w-[10%]',
      cell: (item) => <span className="font-bold text-brand-navy text-[13px]">₹ {(item.billing?.total || 0).toFixed(2)}</span>,
    },
    {
      header: 'ACTION',
      className: 'w-[5%] text-right',
      cell: (item) => (
        <Link
          to={`/admin/orders/${item.id}`}
          className="w-8 h-8 inline-flex items-center justify-center text-text-secondary border border-[#E8ECF4] rounded-[8px] hover:bg-gray-50 transition-colors shadow-sm bg-white"
        >
          <Eye className="w-4 h-4" />
        </Link>
      ),
    }
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Page Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#8896AB] mb-1">
            <span>Dashboard</span>
            <span>›</span>
            <span className="text-[#FF6B00]">Orders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a1f36] tracking-tight">Orders</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <button 
            onClick={handleExportCSV} 
            disabled={isExporting}
            className="sm:hidden w-10 h-10 p-0 flex items-center justify-center shadow-sm font-bold bg-[#FF6B00] text-white border-0 hover:bg-[#E66000] rounded-lg disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={handleExportCSV} 
            disabled={isExporting}
            className="hidden sm:flex px-6 py-2.5 gap-2 items-center justify-center shadow-sm font-bold bg-[#FF6B00] text-white border-0 hover:bg-[#E66000] rounded-lg disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export Orders'}
          </button>
        </motion.div>
      </div>

      {/* Main Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="bg-white border border-[#E8ECF4] rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          
          {/* Filters Row */}
          <div className="bg-white border-b border-[#E8ECF4] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Top Row: Search & Mobile Filter Toggle */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 md:w-[400px] group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896AB] group-focus-within:text-[#FF6B00] transition-colors" />
                <input
                  type="text"
                  placeholder="Search by ID, Customer or Phone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E8ECF4] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all hover:bg-white focus:bg-white placeholder:text-[#8896AB]"
                />
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className={`md:hidden p-2 border rounded-xl transition-all shadow-sm shrink-0 ${isMobileFilterOpen ? 'bg-orange-50 border-orange-200 text-[#FF6B00]' : 'bg-[#F8FAFC] border-[#E8ECF4] text-[#8896AB] hover:text-[#FF6B00] hover:border-[#FF6B00]'}`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Filters Dropdowns */}
            <div className={`md:flex ${isMobileFilterOpen ? 'flex' : 'hidden'} flex-col md:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0`}>
              <button className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#F8FAFC] border border-[#E8ECF4] rounded-xl text-[13px] font-bold text-[#1a1f36] hover:bg-white hover:border-[#FF6B00] transition-all h-[38px] shrink-0">
                <Calendar className="w-4 h-4 text-[#8896AB]" />
                {dateParam ? new Date(dateParam).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'All Dates'}
                <span className="text-[#8896AB] ml-1">›</span>
              </button>

              <Select 
                value={branchFilter} 
                onChange={e => setBranchFilter(e.target.value)} 
                options={[
                  { value: 'All Branches', label: 'All Branches' },
                  { value: 'Koramangala', label: 'Koramangala' },
                  { value: 'Indiranagar', label: 'Indiranagar' },
                  { value: 'HSR Layout', label: 'HSR Layout' },
                  { value: 'Whitefield', label: 'Whitefield' },
                  { value: 'Marathahalli', label: 'Marathahalli' }
                ]}
                className="bg-[#F8FAFC] border-[#E8ECF4] h-[38px] text-sm font-bold w-full md:w-[150px] shrink-0 hover:bg-white hover:border-[#FF6B00] transition-all"
              />
              <Select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                options={[
                  { value: 'All Status', label: 'All Status' },
                  { value: 'Confirmed', label: 'Confirmed' },
                  { value: 'Preparing', label: 'Preparing' },
                  { value: 'Out for Delivery', label: 'Out for Delivery' },
                  { value: 'Delivered', label: 'Delivered' },
                  { value: 'Cancelled', label: 'Cancelled' }
                ]}
                className="bg-[#F8FAFC] border-[#E8ECF4] h-[38px] text-sm font-bold w-full md:w-[140px] shrink-0 hover:bg-white hover:border-[#FF6B00] transition-all"
              />
              <Select 
                value={paymentFilter} 
                onChange={e => setPaymentFilter(e.target.value)} 
                options={[
                  { value: 'All Payment Methods', label: 'All Payment Methods' },
                  { value: 'Online', label: 'Online' },
                  { value: 'COD', label: 'COD' }
                ]}
                className="bg-[#F8FAFC] border-[#E8ECF4] h-[38px] text-sm font-bold w-full md:w-[180px] shrink-0 hover:bg-white hover:border-[#FF6B00] transition-all"
              />
            </div>
          </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto min-h-[500px]">
          <Table
            columns={columns}
            data={currentOrders}
            isLoading={loading}
            emptyStateMessage="No orders found matching your filters."
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            itemsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>

        </div>
      </motion.div>
    </div>
  );
}
