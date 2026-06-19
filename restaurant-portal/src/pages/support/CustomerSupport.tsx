import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Search, Filter, MessageSquare, Clock, CheckCircle2, AlertCircle, Play, Check, Eye, X } from 'lucide-react';
import { ref, onValue, update } from 'firebase/database';
import { rtdb } from '../../lib/firebase';
import toast from 'react-hot-toast';

import Table, { Column } from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import SupportTicketDrawer from './components/SupportTicketDrawer';

interface SupportTicket {
 id: string;
 _key: string;
 adminId: string;
 branch_id: string;
 created_at: string;
 customerName: string;
 customer_id: string;
 description: string;
 issue_type?: string;
 order_id?: string;
 priority?: string;
 subject?: string;
 status: string;
 resolved_at?: number;
}

export default function CustomerSupport() {
 const [currentUser, setCurrentUser] = useState<any>(null);
 const [tickets, setTickets] = useState<SupportTicket[]>([]);
 const [branchPushId, setBranchPushId] = useState<string>('');
 const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

 const [searchQuery, setSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState('All');
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;

 // Load User
 useEffect(() => {
 const userStr = localStorage.getItem('restaurant_user');
 if (userStr) {
 setCurrentUser(JSON.parse(userStr));
 }
 }, []);

 // 1. Fetch branch push ID
 useEffect(() => {
 if (!currentUser) return;
 const unsub = onValue(ref(rtdb, `branch/${currentUser.adminId}`), (branchSnap) => {
 if (branchSnap.exists()) {
 const branches = branchSnap.val();
 const matchedPushId = Object.keys(branches).find(key => 
 branches[key].code?.toLowerCase() === currentUser.branch?.toLowerCase()
 );
 if (matchedPushId) {
 setBranchPushId(matchedPushId);
 } else {
 setBranchPushId(currentUser.branch);
 }
 } else {
 setBranchPushId(currentUser.branch);
 }
 });
 return () => unsub();
 }, [currentUser]);

 // 2. Fetch Tickets
 useEffect(() => {
 if (!currentUser || !branchPushId) {
 console.log("Missing currentUser or branchPushId", { currentUser, branchPushId });
 return;
 }
 
 console.log(`Listening to tickets at: customer_support/${currentUser.adminId}/${branchPushId}`);
 const ticketsRef = ref(rtdb, `customer_support/${currentUser.adminId}/${branchPushId}`);
 const unsub = onValue(ticketsRef, (snapshot) => {
 console.log("Snapshot exists?", snapshot.exists());
 if (snapshot.exists()) {
 const data = snapshot.val();
 console.log("Ticket data fetched:", data);
 const loaded: SupportTicket[] = [];
 
 Object.keys(data).forEach(ticketId => {
 const raw = data[ticketId];
 loaded.push({
 ...raw,
 _key: ticketId,
 status: raw.status || 'Open' // Default missing status to Open
 });
 });
 
 // Sort by created_at desc
 loaded.sort((a, b) => {
 const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
 const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
 return timeB - timeA;
 });
 setTickets(loaded);
 } else {
 setTickets([]);
 }
 });
 return () => unsub();
 }, [currentUser, branchPushId]);

 // 3. Analytics
 const { openTickets, resolvedToday, avgResponseTimeStr } = useMemo(() => {
 let openCount = 0;
 let resolvedTodayCount = 0;
 
 let totalResponseTimeMs = 0;
 let resolvedCountWithTime = 0;
 
 const today = new Date();
 today.setHours(0, 0, 0, 0);

 tickets.forEach(t => {
 if (t.status === 'Open') openCount++;
 if (t.status === 'Resolved' && t.resolved_at) {
 if (t.resolved_at >= today.getTime()) {
 resolvedTodayCount++;
 }
 
 // Calculate response time
 const createdTime = new Date(t.created_at).getTime();
 const responseTime = t.resolved_at - createdTime;
 if (responseTime > 0) {
 totalResponseTimeMs += responseTime;
 resolvedCountWithTime++;
 }
 }
 });

 let avgStr = '--';
 if (resolvedCountWithTime > 0) {
 const avgMs = totalResponseTimeMs / resolvedCountWithTime;
 const avgMins = Math.floor(avgMs / 60000);
 if (avgMins < 60) {
 avgStr = `${avgMins}m`;
 } else {
 const hours = Math.floor(avgMins / 60);
 const mins = avgMins % 60;
 avgStr = `${hours}h ${mins}m`;
 }
 }

 return { openTickets: openCount, resolvedToday: resolvedTodayCount, avgResponseTimeStr: avgStr };
 }, [tickets]);

 // 4. Filtering
 const filteredTickets = useMemo(() => {
 return tickets.filter(t => {
 const searchLower = searchQuery.toLowerCase();
 const nameMatch = (t.customerName || '').toLowerCase().includes(searchLower);
 const descMatch = (t.description || '').toLowerCase().includes(searchLower);
 const idMatch = (t.id || t._key || '').toString().toLowerCase().includes(searchLower);
 
 const matchesSearch = nameMatch || descMatch || idMatch;
 const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
 
 return matchesSearch && matchesStatus;
 });
 }, [tickets, searchQuery, statusFilter]);

 const paginatedTickets = useMemo(() => {
 const start = (currentPage - 1) * itemsPerPage;
 return filteredTickets.slice(start, start + itemsPerPage);
 }, [filteredTickets, currentPage]);

 const handleUpdateStatus = async (ticket: SupportTicket, newStatus: string) => {
 if (!currentUser || !branchPushId) return;
 
 try {
 const updates: any = {
 status: newStatus
 };
 if (newStatus === 'Resolved') {
 updates.resolved_at = Date.now();
 }
 
 const ticketRef = ref(rtdb, `customer_support/${currentUser.adminId}/${branchPushId}/${ticket._key}`);
 await update(ticketRef, updates);
 toast.success(`Ticket marked as ${newStatus}`);
 } catch (error) {
 console.error("Error updating ticket status:", error);
 toast.error("Failed to update status");
 }
 };

 // Formatting helper
 const formatDate = (isoString: string) => {
 const date = new Date(isoString);
 return date.toLocaleString('en-US', { 
 month: 'short', day: 'numeric', 
 hour: 'numeric', minute: '2-digit'
 });
 };

 const getStatusBadge = (status: string) => {
 switch(status) {
 case 'Open': return <Badge variant="error" className="font-bold">Open</Badge>;
 case 'In Progress': return <Badge variant="warning" className="font-bold">In Progress</Badge>;
 case 'Resolved': return <Badge variant="success" className="font-bold">Resolved</Badge>;
 default: return <Badge variant="default">{status}</Badge>;
 }
 };

 const columns: Column<SupportTicket>[] = [
 {
 header: 'Ticket ID',
 cell: (item) => <span className="font-mono font-bold text-brand-navy bg-gray-50 px-2 py-1 rounded border border-border">#{item.id?.toString() || item._key || 'TICKET'}</span>
 },
 {
 header: 'Customer',
 cell: (item) => <span className="font-bold text-brand-navy">{item.customerName}</span>
 },
 {
 header: 'Issue Type',
 cell: (item) => (
 <Badge variant="default" className="bg-gray-100 text-gray-700 font-bold border-gray-200">
 {item.issue_type || 'General Support'}
 </Badge>
 )
 },
 {
 header: 'Created At',
 cell: (item) => <span className="text-sm font-semibold text-text-secondary">{formatDate(item.created_at)}</span>
 },
 {
 header: 'Status',
 cell: (item) => getStatusBadge(item.status)
 },
 {
 header: 'Action',
 cell: (item) => (
 <div className="flex items-center gap-2">
 <button 
 onClick={() => setSelectedTicket(item)}
 title="View Details"
 className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 shadow-sm"
 >
 <Eye className="w-4 h-4" />
 </button>
 {item.status === 'Open' && (
 <button 
 onClick={() => handleUpdateStatus(item, 'In Progress')}
 title="Start Progress"
 className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors border border-amber-100 shadow-sm"
 >
 <Play className="w-4 h-4 fill-current" />
 </button>
 )}
 {item.status !== 'Resolved' && (
 <button 
 onClick={() => handleUpdateStatus(item, 'Resolved')}
 title="Mark as Resolved"
 className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-100 shadow-sm"
 >
 <Check className="w-4 h-4 stroke-[3]" />
 </button>
 )}
 </div>
 )
 }
 ];

 return (
 <div className="space-y-8 max-w-[1400px] mx-auto">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div>
 <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">Customer Support</h1>
 <p className="text-text-secondary mt-1 text-sm font-medium">Manage and resolve customer tickets and complaints effectively.</p>
 </div>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
 <Card className="p-6 border border-border/60 shadow-soft bg-white hover:shadow-md transition-shadow relative overflow-hidden">
 <div className="absolute -right-4 -top-4 p-8 bg-red-50 rounded-full opacity-50"><AlertCircle className="w-12 h-12 text-red-500" /></div>
 <p className="text-sm font-black text-text-secondary uppercase tracking-widest mb-2 relative z-10">Open Tickets</p>
 <div className="flex items-end gap-3 relative z-10">
 <span className="text-5xl font-black text-brand-navy">{openTickets}</span>
 </div>
 </Card>
 </motion.div>

 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
 <Card className="p-6 border border-border/60 shadow-soft bg-white hover:shadow-md transition-shadow relative overflow-hidden">
 <div className="absolute -right-4 -top-4 p-8 bg-green-50 rounded-full opacity-50"><CheckCircle2 className="w-12 h-12 text-green-500" /></div>
 <p className="text-sm font-black text-text-secondary uppercase tracking-widest mb-2 relative z-10">Resolved Today</p>
 <div className="flex items-end gap-3 relative z-10">
 <span className="text-5xl font-black text-brand-navy">{resolvedToday}</span>
 </div>
 </Card>
 </motion.div>

 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
 <Card className="p-6 border border-border/60 shadow-soft bg-white hover:shadow-md transition-shadow relative overflow-hidden">
 <div className="absolute -right-4 -top-4 p-8 bg-blue-50 rounded-full opacity-50"><Clock className="w-12 h-12 text-blue-500" /></div>
 <p className="text-sm font-black text-text-secondary uppercase tracking-widest mb-2 relative z-10">Avg Response Time</p>
 <div className="flex items-end gap-3 relative z-10">
 <span className="text-4xl font-black text-brand-navy">{avgResponseTimeStr}</span>
 </div>
 </Card>
 </motion.div>
 </div>

 {/* Main Table Area */}
 <div className="bg-white border border-border/60 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
 
 {/* Toolbar */}
 <div className="p-5 border-b border-border bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-10">
 <div className="relative w-full sm:w-96">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
 <input 
 type="text" 
 placeholder="Search tickets or customers..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white border border-border rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-brand-navy focus:outline-none focus:ring-4 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 shadow-sm transition-all placeholder:font-medium"
 />
 </div>
 
 <div className="flex gap-3 w-full sm:w-auto">
 <select 
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-full sm:w-48 appearance-none bg-white border border-border rounded-xl px-4 py-3 text-sm font-bold text-brand-navy focus:outline-none focus:ring-4 focus:ring-brand-orange-500/20 focus:border-brand-orange-500 shadow-sm transition-all"
 >
 <option value="All">All Statuses</option>
 <option value="Open">Open</option>
 <option value="In Progress">In Progress</option>
 <option value="Resolved">Resolved</option>
 </select>
 </div>
 </div>

 {/* Table View */}
 <div className="min-h-[400px] flex flex-col">
 <AnimatePresence mode="wait">
 <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
 <Table
 columns={columns}
 data={paginatedTickets}
 currentPage={currentPage}
 totalPages={Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage))}
 onPageChange={setCurrentPage}
 />
 </motion.div>
 </AnimatePresence>
 </div>
 </div>

 {/* Support Ticket Drawer */}
 <SupportTicketDrawer 
 isOpen={!!selectedTicket} 
 onClose={() => setSelectedTicket(null)} 
 ticket={selectedTicket} 
 onUpdateStatus={handleUpdateStatus} 
 />
 </div>
 );
}
