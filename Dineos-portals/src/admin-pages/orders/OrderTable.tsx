import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Download, ArrowLeft, User, Store, Loader2, Calendar, FileText, Filter, Eye } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table, { Column } from '../../components/common/Table';
import Select from '../../components/common/Select';
import Tooltip from '../../components/common/Tooltip';
import toast from 'react-hot-toast';

import { useOrders, Order } from '../../hooks/useOrders';

export default function OrderTable() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const { orders, loading } = useOrders();

  const displayDate = dateParam
    ? new Date(dateParam).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'All Time';

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const [branchFilter, setBranchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const filteredOrders = useMemo(() => {
    let result = orders;

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

    if (branchFilter !== 'All') {
      result = result.filter(o => o.branch === branchFilter);
    }

    if (statusFilter !== 'All') {
      result = result.filter(o => o.status === statusFilter);
    }

    return result;
  }, [debouncedSearch, branchFilter, statusFilter, orders, dateParam]);

  const handleExportCSV = async () => {
    if (!dateParam && filteredOrders.length > 31 * 50) {
      toast.error("Cannot export more than 31 days of data. Please apply a date filter.");
      return;
    }

    setIsExporting(true);
    await new Promise(r => setTimeout(r, 1500));

    const csvContent ="data:text/csv;charset=utf-8," +
      "Order ID,Time,Branch,Customer,Phone,Amount,Status\n" +
      filteredOrders.map(o => {
        const timeStr = o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        return `${o.id},${timeStr},${o.branch},${o.customer?.name || 'N/A'},${o.customer?.phone || 'N/A'},${o.billing?.total || 0},${o.status}`;
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_${dateParam || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered': return <Badge variant="success" className="font-bold shadow-sm backdrop-blur-md">● Delivered</Badge>;
      case 'Cancelled': return <Badge variant="error" className="font-bold shadow-sm backdrop-blur-md">● Cancelled</Badge>;
      case 'Preparing': return <Badge variant="warning" className="font-bold shadow-sm backdrop-blur-md">● Preparing</Badge>;
      case 'Out for Delivery': return <Badge variant="info" className="font-bold shadow-sm backdrop-blur-md">● Out for Delivery</Badge>;
      case 'Pending': return <Badge variant="default" className="font-bold shadow-sm backdrop-blur-md">● Pending</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns: Column<Order>[] = [
    {
      header: 'Order Details',
      className: '',
      cell: (item) => {
        const timeStr = item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-orange-50 text-brand-orange-500 flex items-center justify-center shrink-0 border border-brand-orange-100/50">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <Link to={`/admin/orders/${item.id}`} className="font-bold text-brand-navy text-lg hover:text-brand-orange-600 transition-colors">
                #{item.id}
              </Link>
              <div className="text-xs font-medium text-text-secondary mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {timeStr}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Branch',
      className: '',
      cell: (item) => (
        <Tooltip content={item.branch} position="top">
          <span 
            className="text-sm font-semibold text-text-secondary flex items-center gap-1.5 truncate max-w-[200px]"
          >
            <Store className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.branch}</span>
          </span>
        </Tooltip>
      ),
    },
    {
      header: 'Customer',
      className: '',
      cell: (item) => (
        <div>
          <Tooltip content={item.customer?.name} position="top">
            <div 
              className="flex items-center gap-1.5 font-bold text-brand-navy text-sm truncate max-w-[150px]"
            >
              <User className="w-4 h-4 text-text-secondary shrink-0" />
              <span className="truncate">{item.customer?.name || 'N/A'}</span>
            </div>
          </Tooltip>
          <div className="text-xs font-medium text-text-secondary mt-0.5 ml-5.5">
            {item.customer?.phone || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      className: '',
      cell: (item) => <span className="font-black text-brand-navy text-base">₹{(item.billing?.total || 0).toLocaleString()}</span>,
    },
    {
      header: 'Status',
      className: '',
      cell: (item) => getStatusBadge(item.status),
    },
    {
      header: 'Action',
      className: '',
      cell: (item) => (
        <Link
          to={`/admin/orders/${item.id}`}
          title="View Order"
          className="p-2 inline-flex items-center justify-center text-brand-navy bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shadow-sm"
        >
          <Eye className="w-4 h-4" />
        </Link>
      ),
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="text-3xl font-black text-brand-navy tracking-tight">Orders List</h1>
              <p className="text-text-secondary mt-1 text-sm font-medium">Detailed view of all past orders.</p>
          </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="overflow-hidden p-0 border border-border/50 shadow-lg flex flex-col min-h-[600px] bg-white rounded-[2rem]">

          <div className="flex items-center gap-4 p-4 border-b border-border bg-gray-50/50">
            <Link to="/admin/orders" className="p-2 bg-white border border-border shadow-sm rounded-lg hover:bg-gray-50 transition-all text-text-secondary shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/admin/orders" className="text-sm font-bold text-brand-orange-600 hover:underline flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Calendar View
              </Link>
              <span className="text-text-secondary">/</span>
              <span className="text-sm font-bold text-text-secondary">{displayDate}</span>
            </div>
          </div>

          {/* Sticky Filter Bar */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-border p-4 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-2">
            
            {/* Top Row: Search & Mobile Filter Toggle */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-brand-orange-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search Order ID or Phone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 transition-all shadow-sm hover:bg-white focus:bg-white placeholder:text-text-secondary/60 placeholder:font-medium"
                />
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className={`md:hidden p-2.5 border rounded-xl transition-all shadow-sm shrink-0 ${isMobileFilterOpen ? 'bg-brand-orange-50 border-brand-orange-200 text-brand-orange-600' : 'bg-gray-50 border-border text-text-secondary hover:text-brand-orange-600 hover:border-brand-orange-500'}`}
              >
                <Filter className="w-5 h-5" />
              </button>

              <Button onClick={handleExportCSV} disabled={isExporting} className="hidden md:flex gap-2 shadow-sm font-bold bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl">
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export
              </Button>
            </div>

            {/* Filters Card */}
            <div className={`md:flex ${isMobileFilterOpen ? 'flex' : 'hidden'} flex-col md:flex-row items-center gap-3 w-full md:w-auto bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-xl border border-border md:border-none shadow-sm md:shadow-none mt-2 md:mt-0`}>
              <div className="w-full md:w-[200px]">
                <Select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'Branch: All' },
                    { value: 'Downtown Main', label: 'Downtown Main' },
                    { value: 'Westside Plaza', label: 'Westside Plaza' },
                    { value: 'North Mall Kiosk', label: 'North Mall Kiosk' }
                  ]}
                />
              </div>

              <div className="w-full md:w-[200px]">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'Status: All' },
                    { value: 'Delivered', label: 'Delivered' },
                    { value: 'Cancelled', label: 'Cancelled' },
                    { value: 'Preparing', label: 'Preparing' },
                    { value: 'Out for Delivery', label: 'Out for Delivery' },
                    { value: 'Pending', label: 'Pending' }
                  ]}
                />
              </div>
              <Button onClick={handleExportCSV} disabled={isExporting} className="w-full md:hidden flex justify-center gap-2 shadow-sm font-bold bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl">
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 flex flex-col relative bg-white">
            <Table
              columns={columns}
              data={filteredOrders}
              emptyStateMessage={loading ? "Loading orders..." : "No orders found for the selected filters."}
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(filteredOrders.length / 10))}
              onPageChange={setCurrentPage}
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
