import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { Store, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RestaurantEntry {
  uid: string;
  restaurant_name: string;
  email?: string;
  restaurant_details?: {
    status?: string;
    businessDetails?: { restaurantName?: string; address?: { city?: string; country?: string } };
    contactInfo?: { primaryEmail?: string };
    legal_documents?: Record<string, { status: string }>;
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<RestaurantEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onValue(ref(rtdb, 'admin_users'), (snap) => {
      const data = snap.val();
      if (!data) { setRestaurants([]); setLoading(false); return; }

      const list: RestaurantEntry[] = Object.entries(data).map(([uid, val]: [string, any]) => ({
        uid,
        ...val,
      }));
      // Only show users who have started the onboarding (have restaurant_details)
      setRestaurants(list.filter(r => r.restaurant_details));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const stats = {
    total:    restaurants.length,
    review:   restaurants.filter(r => r.restaurant_details?.status === 'In Review').length,
    approved: restaurants.filter(r => r.restaurant_details?.status === 'Approved').length,
    rejected: restaurants.filter(r => r.restaurant_details?.status === 'Rejected').length,
  };

  const STAT_CARDS = [
    { label: 'Total Restaurants',  value: stats.total,    icon: Store,         color: 'from-brand-purple-500 to-violet-600',  bg: 'bg-brand-purple-50',  iconColor: 'text-brand-purple-600' },
    { label: 'Pending Review',      value: stats.review,   icon: Clock,         color: 'from-orange-500 to-amber-500',          bg: 'bg-orange-50',        iconColor: 'text-orange-600' },
    { label: 'Approved',           value: stats.approved, icon: CheckCircle,   color: 'from-green-500 to-emerald-600',         bg: 'bg-green-50',         iconColor: 'text-green-600' },
    { label: 'Rejected',           value: stats.rejected, icon: XCircle,       color: 'from-red-500 to-rose-600',              bg: 'bg-red-50',           iconColor: 'text-red-600' },
  ];

  const pendingRestaurants = restaurants.filter(r => r.restaurant_details?.status === 'In Review');

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of all restaurant registrations.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="bg-white rounded-2xl shadow-soft border border-border p-6 flex items-center gap-5">
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : card.value}</p>
              <p className="text-xs text-gray-500 font-medium">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Pending */}
      <div className="bg-white rounded-2xl shadow-soft border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-purple-500" />
            <h2 className="font-semibold text-gray-900">Restaurants Pending Review</h2>
            {stats.review > 0 && (
              <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">{stats.review}</span>
            )}
          </div>
          <button
            onClick={() => navigate('/restaurants')}
            className="text-xs text-brand-purple-600 font-semibold hover:text-brand-purple-700 transition-colors"
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : pendingRestaurants.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No restaurants are pending review.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingRestaurants.slice(0, 5).map(r => (
              <button
                key={r.uid}
                onClick={() => navigate(`/restaurants/${r.uid}`)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-purple-50 border border-brand-purple-100 flex items-center justify-center text-sm font-bold text-brand-purple-600 shrink-0">
                  {(r.restaurant_details?.businessDetails?.restaurantName || r.restaurant_name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {r.restaurant_details?.businessDetails?.restaurantName || r.restaurant_name || 'Unnamed Restaurant'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {r.restaurant_details?.contactInfo?.primaryEmail || r.email || '—'} · {r.restaurant_details?.businessDetails?.address?.city || ''}
                  </p>
                </div>
                <span className="status-badge-review shrink-0">
                  <Clock className="w-3 h-3" /> In Review
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
