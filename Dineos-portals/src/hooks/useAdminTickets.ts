import { useState, useEffect, useRef } from 'react';
import { ref, onValue, Unsubscribe } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface SupportTicket {
  id: string;
  _key: string;
  adminId: string;
  branch_id: string;
  branchName?: string;
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

export function useAdminTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const branchesRefData = useRef<Record<string, any>>({});
  const rawTicketsRefData = useRef<Record<string, Record<string, any>>>({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const branchesRefNode = ref(rtdb, `branch/${user.uid}`);
    let ticketsListener: Unsubscribe | undefined = undefined;

    const processTickets = () => {
      const currentRawTickets = rawTicketsRefData.current;
      const currentBranches = branchesRefData.current;

      const ticketsList: SupportTicket[] = [];

      Object.keys(currentRawTickets).forEach(branchId => {
        const branchTickets = currentRawTickets[branchId];
        if (typeof branchTickets === 'object' && branchTickets !== null) {
          Object.keys(branchTickets).forEach(ticketKey => {
            const rawTicket = branchTickets[ticketKey];
            
            const branchData = currentBranches[branchId] || {};
            const branchName = branchData.name || branchData.branchName || rawTicket.branch_id || branchId;

            const mappedTicket: SupportTicket = {
              ...rawTicket,
              id: rawTicket.id || ticketKey,
              _key: ticketKey,
              branchName,
              status: rawTicket.status || 'Open',
              priority: rawTicket.priority || 'Medium',
            };
            ticketsList.push(mappedTicket);
          });
        }
      });

      // Sort by created_at DESC
      ticketsList.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });

      setTickets(ticketsList);
      setLoading(false);
    };

    const branchesListener = onValue(branchesRefNode, (snapshot) => {
      branchesRefData.current = snapshot.exists() ? snapshot.val() : {};
      processTickets();
    }, (error) => {
      console.error("Error fetching branches:", error);
    });

    const ticketsRefNode = ref(rtdb, `customer_support/${user.uid}`);
    ticketsListener = onValue(ticketsRefNode, (snapshot) => {
      rawTicketsRefData.current = snapshot.exists() ? snapshot.val() : {};
      processTickets();
    }, (error) => {
      console.error("Error fetching tickets:", error);
    });

    return () => {
      branchesListener();
      if (ticketsListener) ticketsListener();
    };
  }, [user]);

  return { tickets, loading };
}
