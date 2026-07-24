import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Clock, CheckCircle2, Archive, Search, Filter, Eye, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminTickets, SupportTicket } from '../../hooks/useAdminTickets';
import SupportTicketDrawer from '../../restaurant-pages/support/components/SupportTicketDrawer';
import Select from '../../components/common/Select';

export default function CustomerSupportDashboard() {
  const { tickets, loading } = useAdminTickets();

  const [searchInput, setSearchInput] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Matching the design roughly

  // Drawer
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Analytics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
  const closedTickets = tickets.filter(t => t.status === 'Closed').length;

  // Filter & Search
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // Dropdown filter
      if (selectedFilter !== 'All' && t.status !== selectedFilter) return false;

      // Search
      if (searchInput) {
        const query = searchInput.toLowerCase();
        const matchesName = t.customerName?.toLowerCase().includes(query);
        const matchesId = (t.id || t._key || '').toLowerCase().includes(query);
        const matchesSubject = t.subject?.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesSubject) return false;
      }
      return true;
    });
  }, [tickets, selectedFilter, searchInput]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage));
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    if (!totalPages || !currentPage) return [];
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 4) {
            pages.push(1, 2, 3, 4, 5, '...', totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
    }
    return pages;
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { date: dateStr, time: '' };
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date, time };
  };

  // Badges
  const renderStatus = (status: string) => {
    switch (status) {
      case 'Open':
        return <span className="px-3 py-1 bg-[#FFF3E8] text-[#FF6B00] border border-[#FFD0B5] rounded-full text-xs font-bold whitespace-nowrap">Open</span>;
      case 'In Progress':
        return <span className="px-3 py-1 bg-[#F0F6FF] text-[#1A73E8] border border-[#B3D4FF] rounded-full text-xs font-bold whitespace-nowrap">In Progress</span>;
      case 'Resolved':
        return <span className="px-3 py-1 bg-[#E5F5ED] text-[#00A254] border border-[#A6E5C3] rounded-full text-xs font-bold whitespace-nowrap">Resolved</span>;
      case 'Closed':
        return <span className="px-3 py-1 bg-[#F4F6FA] text-[#8896AB] border border-[#E8ECF4] rounded-full text-xs font-bold whitespace-nowrap">Closed</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-bold whitespace-nowrap">{status}</span>;
    }
  };

  const renderPriority = (priority?: string) => {
    const p = priority || 'Medium';
    switch (p) {
      case 'High':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF0F2] text-[#FF3B5C] rounded-full text-xs font-bold w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B5C]"></div> High
          </div>
        );
      case 'Medium':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF3E8] text-[#FF6B00] rounded-full text-xs font-bold w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]"></div> Medium
          </div>
        );
      case 'Low':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E5F5ED] text-[#00A254] rounded-full text-xs font-bold w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00A254]"></div> Low
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto min-h-screen">
      <SupportTicketDrawer 
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket as any}
        onUpdateStatus={() => {}} // Readonly for root admin, or add update logic later if needed
      />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-black text-[#1a1f36] tracking-tight leading-none mb-1">Customer Support</h1>
          <p className="text-sm font-medium text-[#8896AB]">Manage and respond to customer support requests</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
        {/* Total Tickets */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8ECF4] shadow-sm flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F0F6FF] flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-[#1A73E8]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] sm:text-[13px] font-bold text-[#8896AB] mb-0.5">Total Tickets</p>
            <div className="text-[20px] sm:text-[26px] font-black text-[#1A73E8] leading-none mb-1 sm:mb-2">{totalTickets}</div>
            <p className="hidden sm:block text-[11px] font-bold text-[#8896AB]">All time tickets</p>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8ECF4] shadow-sm flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFF3E8] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF6B00]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] sm:text-[13px] font-bold text-[#8896AB] mb-0.5">Open Tickets</p>
            <div className="text-[20px] sm:text-[26px] font-black text-[#FF6B00] leading-none mb-1 sm:mb-2">{openTickets}</div>
            <p className="hidden sm:block text-[11px] font-bold text-[#8896AB]">Require attention</p>
          </div>
        </div>

        {/* Resolved Tickets */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8ECF4] shadow-sm flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#E5F5ED] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A254]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] sm:text-[13px] font-bold text-[#8896AB] mb-0.5">Resolved Tickets</p>
            <div className="text-[20px] sm:text-[26px] font-black text-[#00A254] leading-none mb-1 sm:mb-2">{resolvedTickets}</div>
            <p className="hidden sm:block text-[11px] font-bold text-[#8896AB]">Successfully resolved</p>
          </div>
        </div>

        {/* Closed Tickets */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8ECF4] shadow-sm flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FFF0F2] flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF3B5C]" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] sm:text-[13px] font-bold text-[#8896AB] mb-0.5">Closed Tickets</p>
            <div className="text-[20px] sm:text-[26px] font-black text-[#FF3B5C] leading-none mb-1 sm:mb-2">{closedTickets}</div>
            <p className="hidden sm:block text-[11px] font-bold text-[#8896AB]">Closed tickets</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-[#E8ECF4] shadow-sm overflow-hidden flex flex-col">
        
        {/* Filter Bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#E8ECF4] p-4 flex flex-col xl:flex-row xl:items-center justify-between shadow-sm gap-2">
          
          {/* Top Row: Search & Mobile Filter Toggle */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 w-full xl:w-auto">
            <div className="relative w-full md:w-[420px] group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896AB] group-focus-within:text-[#FF6B00] transition-colors" />
              <input
                type="text"
                placeholder="Search by customer name, email or ticket ID..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-[#E8ECF4] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all shadow-sm hover:bg-white focus:bg-white placeholder:text-[#8896AB]/60 text-[#1a1f36]"
              />
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className={`xl:hidden p-2.5 border rounded-xl transition-all shadow-sm shrink-0 ${isMobileFilterOpen ? 'bg-[#FFF3E8] border-[#FFD0B5] text-[#FF6B00]' : 'bg-gray-50 border-[#E8ECF4] text-[#8896AB] hover:text-[#FF6B00] hover:border-[#FF6B00]'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Filters Card */}
          <div className={`xl:flex ${isMobileFilterOpen ? 'flex' : 'hidden'} flex-col md:flex-row items-center gap-3 w-full xl:w-auto bg-gray-50 xl:bg-transparent p-4 xl:p-0 rounded-xl border border-[#E8ECF4] xl:border-none shadow-sm xl:shadow-none mt-2 xl:mt-0`}>
            <div className="w-full md:w-[150px]">
              <Select
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'All', label: 'All Statuses' },
                  { value: 'Open', label: 'Open' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Resolved', label: 'Resolved' },
                  { value: 'Closed', label: 'Closed' },
                ]}
                className="py-2 h-auto text-sm font-bold border-[#E8ECF4] shadow-sm bg-gray-50/50 hover:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#E8ECF4]">
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white w-[12%]">Ticket ID</th>
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white w-[18%]">Customer</th>
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white w-[25%]">Subject</th>
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white w-[12%]">Status</th>
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white w-[12%]">Priority</th>
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white w-[13%]">Last Updated</th>
                <th className="py-5 px-6 text-[12px] font-black text-[#8896AB] bg-white text-right w-[8%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF4]">
              <AnimatePresence>
                {paginatedTickets.length > 0 ? paginatedTickets.map((ticket) => {
                  const { date, time } = formatDateTime(ticket.created_at);
                  const displayId = ticket.id?.toString() || ticket._key?.substring(0,6) || 'TICKET';
                  
                  return (
                    <motion.tr 
                      key={ticket._key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-[#FAFBFC] transition-colors"
                    >
                      <td className="py-6 px-6">
                        <span className="text-[14px] font-black text-[#1a1f36]">
                          #SUP{displayId.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F4F6FA] flex items-center justify-center text-[#8896AB] font-bold text-sm shrink-0 border border-[#E8ECF4]">
                            {ticket.customerName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="text-[14px] font-bold text-[#1a1f36] truncate max-w-[150px] inline-block">
                            {ticket.customerName || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-[#1a1f36] truncate max-w-[250px]">{ticket.subject || ticket.issue_type || 'Support Request'}</span>
                          <span className="text-[12px] font-medium text-[#8896AB] truncate max-w-[250px] mt-0.5">{ticket.description || 'No description provided.'}</span>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        {renderStatus(ticket.status)}
                      </td>
                      <td className="py-6 px-6">
                        {renderPriority(ticket.priority)}
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-[#1a1f36]">{date}</span>
                          <span className="text-[12px] font-semibold text-[#8896AB]">{time}</span>
                        </div>
                      </td>
                      <td className="py-6 px-6 text-right">
                        <button 
                          onClick={() => setSelectedTicket(ticket)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E8ECF4] bg-white hover:bg-gray-50 text-[#8896AB] hover:text-[#1a1f36] transition-colors shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#8896AB] text-[14px] font-medium">
                      No support tickets found.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="mt-auto px-4 sm:px-6 py-4 border-t border-[#E8ECF4] flex flex-col items-center justify-center gap-4 bg-white rounded-b-2xl">
              <div className="flex items-center justify-center w-full gap-2 sm:gap-3">
                  <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-[#E8ECF4] hover:bg-[#F4F6FA] text-[#8896AB] hover:text-[#1a1f36] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                      <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                      {getPageNumbers().map((page, idx) => (
                          <button
                              key={idx}
                              onClick={() => typeof page === 'number' ? setCurrentPage(page) : undefined}
                              disabled={page === '...'}
                              className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                  page === currentPage
                                      ? 'border border-[#FF6B00] text-[#FF6B00] bg-white'
                                      : page === '...'
                                          ? 'text-[#8896AB] cursor-default border-none bg-transparent'
                                          : 'border border-[#E8ECF4] text-[#1a1f36] bg-white hover:bg-[#F4F6FA]'
                                  }`}
                          >
                              {page}
                          </button>
                      ))}
                  </div>

                  <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-[#E8ECF4] hover:bg-[#F4F6FA] text-[#8896AB] hover:text-[#1a1f36] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                      <ChevronRight className="w-4 h-4" />
                  </button>
              </div>
          </div>
        )}

      </div>
    </div>
  );
}
