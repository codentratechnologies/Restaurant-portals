import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Store, Clock, CheckCircle, XCircle, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RestaurantEntry {
  uid: string;
  restaurant_name: string;
  email?: string;
  restaurant_details?: {
    status?: string;
    businessDetails?: { restaurantName?: string; address?: { city?: string; country?: string } };
    contactInfo?: { primaryEmail?: string; primaryPhone?: string };
    legal_documents?: Record<string, { status: string }>;
  };
}

type StatusFilter = 'all' | 'In Review' | 'Approved' | 'Rejected';

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Review', value: 'In Review' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
];

export default function Restaurants() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<RestaurantEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = onValue(ref(rtdb, 'admin_users'), (snap) => {
      const data = snap.val();
      if (!data) { setRestaurants([]); setLoading(false); return; }
      const list: RestaurantEntry[] = Object.entries(data).map(([uid, val]: [string, any]) => ({ uid, ...val }));
      setRestaurants(list.filter(r => r.restaurant_details));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filtered = restaurants.filter(r => {
    const matchStatus = filter === 'all' || r.restaurant_details?.status === filter;
    const name = (r.restaurant_details?.businessDetails?.restaurantName || r.restaurant_name || '').toLowerCase();
    const email = (r.restaurant_details?.contactInfo?.primaryEmail || r.email || '').toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status?: string) => {
    if (status === 'Approved') return <span className="status-badge-approved"><CheckCircle className="w-3 h-3" /> Approved</span>;
    if (status === 'Rejected') return <span className="status-badge-rejected"><XCircle className="w-3 h-3" /> Rejected</span>;
    return <span className="status-badge-review"><Clock className="w-3 h-3" /> In Review</span>;
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and verify all registered restaurants.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-soft border border-border p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          {/* Status tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl shrink-0">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f.value ? 'bg-white text-brand-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-border overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading restaurants…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No restaurants found</p>
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 px-6 py-3 bg-gray-50 border-b border-border text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-5">Restaurant</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            <div className="divide-y divide-border">
              {filtered.map(r => {
                const name = r.restaurant_details?.businessDetails?.restaurantName || r.restaurant_name || 'Unnamed';
                const city = r.restaurant_details?.businessDetails?.address?.city || '';
                const email = r.restaurant_details?.contactInfo?.primaryEmail || r.email || '—';
                const phone = r.restaurant_details?.contactInfo?.primaryPhone || '—';
                const status = r.restaurant_details?.status;

                return (
                  <button
                    key={r.uid}
                    onClick={() => navigate(`/restaurants/${r.uid}`)}
                    className="w-full grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-purple-50 border border-brand-purple-100 flex items-center justify-center text-sm font-bold text-brand-purple-600 shrink-0">
                        {name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{name}</p>
                        <p className="text-xs text-gray-400 truncate">{city}</p>
                      </div>
                    </div>
                    <div className="col-span-3 min-w-0 hidden sm:block">
                      <p className="text-sm text-gray-700 truncate">{email}</p>
                      <p className="text-xs text-gray-400">{phone}</p>
                    </div>
                    <div className="col-span-2 hidden sm:block">
                      {getStatusBadge(status)}
                    </div>
                    <div className="col-span-7 sm:col-span-2 flex items-center justify-end gap-2">
                      {/* Mobile status */}
                      <span className="sm:hidden">{getStatusBadge(status)}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
