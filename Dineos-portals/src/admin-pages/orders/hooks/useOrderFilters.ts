import { useMemo } from 'react';
import { Order } from '../../../hooks/useOrders';

export const useOrderFilters = (
  orders: Order[],
  dateParam: string | null,
  debouncedSearch: string,
  statusFilter: string,
  paymentFilter: string,
  branchFilter: string
) => {
  return useMemo(() => {
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
        o.id.toString().toLowerCase().includes(q) ||
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
  }, [orders, dateParam, debouncedSearch, statusFilter, paymentFilter, branchFilter]);
};
