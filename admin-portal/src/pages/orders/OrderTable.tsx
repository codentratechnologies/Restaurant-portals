import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Download, ArrowLeft, User, Store, Loader2, Calendar, FileText } from 'lucide-react';
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
      className: 'w-[25%]',
      cell: (item) => {
        const timeStr = item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-orange-50 text-brand-orange-500 flex items-center justify-center shrink-0 border border-brand-orange-100/50">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-brand-navy text-lg hover:text-brand-orange-600 transition-colors">
                #{item.id}
              </span>
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
      className: 'w-[25%]',
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
      className: 'w-[20%]',
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
      className: 'w-[15%]',
      cell: (item) => <span className="font-black text-brand-navy text-base">₹{(item.billing?.total || 0).toLocaleString()}</span>,
    },
    {
      header: 'Status',
      className: 'w-[15%]',
      cell: (item) => getStatusBadge(item.status),
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-start gap-4">
          <Link to="/orders" className="p-2.5 bg-white border border-border shadow-sm rounded-xl hover:bg-gray-50 transition-all text-text-secondary shrink-0 mt-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/orders" className="text-sm font-bold text-brand-orange-600 hover:underline flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Calendar View
              </Link>
              <span className="text-text-secondary">/</span>
              <span className="text-sm font-bold text-text-secondary">{displayDate}</span>
            </div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight">Orders for {displayDate}</h1>
            <p className="text-text-secondary mt-1 text-sm font-medium">View and manage all historical orders for the selected date.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Button onClick={handleExportCSV} disabled={isExporting} className="gap-2 shadow-md font-bold bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl py-2.5 px-6">
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isExporting ? 'Generating CSV...' : 'Export to CSV'}
          </Button>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="overflow-hidden p-0 border border-border/50 shadow-lg flex flex-col min-h-[600px] bg-white rounded-[2rem]">

          {/* Sticky Filter Bar */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-border p-5 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
            
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-brand-orange-600 transition-colors" />
              <input
                type="text"
                placeholder="Search Order ID or Phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 transition-all shadow-sm hover:bg-white focus:bg-white placeholder:text-text-secondary/60 placeholder:font-medium"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="w-full sm:w-[200px]">
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

              <div className="w-full sm:w-[200px]">
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
              onRowClick={(item) => navigate(`/orders/${item.id}`)}
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
