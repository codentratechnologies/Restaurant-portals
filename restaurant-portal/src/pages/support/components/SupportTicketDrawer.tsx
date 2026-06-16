import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, MessageSquare } from 'lucide-react';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';

export interface SupportTicket {
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

interface SupportTicketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
  onUpdateStatus: (ticket: SupportTicket, newStatus: string) => void;
}

export default function SupportTicketDrawer({ isOpen, onClose, ticket, onUpdateStatus }: SupportTicketDrawerProps) {
  if (!ticket) return null;

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-brand-navy/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
              <div>
                <h2 className="text-xl font-black text-brand-navy">Ticket Details</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Ticket #{ticket.id?.toString() || ticket._key || 'TICKET'}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-text-secondary hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
              
              {/* Customer Full Width Card */}
              <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="p-3 bg-brand-orange-50 rounded-xl">
                  <User className="w-5 h-5 text-brand-orange-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-0.5">Customer Name</span>
                  <p className="text-base font-black text-brand-navy">
                    {ticket.customerName || 'Unknown Customer'}
                  </p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-1">Date Created</span>
                  <p className="text-sm font-black text-brand-navy">{formatDate(ticket.created_at)}</p>
                </div>
                <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-2">Issue Type</span>
                  <Badge variant="default" className="bg-gray-100 text-gray-700 font-bold border-gray-200 uppercase text-[10px]">
                    {ticket.issue_type || 'General Support'}
                  </Badge>
                </div>

                <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-1">Order Number</span>
                  {ticket.order_id ? (
                    <p className="text-sm font-black text-brand-orange-600">{ticket.order_id}</p>
                  ) : (
                    <p className="text-sm font-medium text-text-secondary italic">None</p>
                  )}
                </div>
                <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-2">Priority Level</span>
                  <Badge variant={ticket.priority === 'High' ? 'error' : ticket.priority === 'Medium' ? 'warning' : 'default'} className="font-bold uppercase text-[10px]">
                    {ticket.priority || 'Normal'}
                  </Badge>
                </div>
              </div>

              {/* Status View */}
              <div className="bg-white border border-border/50 rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Current Status</span>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>
                {ticket.resolved_at && (
                   <div className="text-right">
                     <div className="flex items-center justify-end gap-2 mb-1">
                       <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Resolved At</span>
                     </div>
                     <p className="text-sm font-black text-brand-navy">{formatDate(new Date(ticket.resolved_at).toISOString())}</p>
                   </div>
                )}
              </div>

              {/* Issue Description */}
              <div className="bg-white border border-border/50 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-text-secondary" />
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Issue Details</span>
                  </div>
                  {ticket.subject && (
                    <h4 className="text-md font-black text-brand-navy mb-2">{ticket.subject}</h4>
                  )}
                  {ticket.description ? (
                    <p className="text-sm font-medium text-brand-navy leading-relaxed break-words whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-text-secondary italic">No description provided.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-white border-t border-border shrink-0 flex gap-3">
              <Button variant="outline" className="flex-1 font-bold rounded-xl" onClick={onClose}>
                Close
              </Button>
              {ticket.status === 'Open' && (
                <Button 
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm" 
                  onClick={() => { onUpdateStatus(ticket, 'In Progress'); onClose(); }}
                >
                  Start Progress
                </Button>
              )}
              {ticket.status !== 'Resolved' && (
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-sm" 
                  onClick={() => { onUpdateStatus(ticket, 'Resolved'); onClose(); }}
                >
                  Mark Resolved
                </Button>
              )}
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
