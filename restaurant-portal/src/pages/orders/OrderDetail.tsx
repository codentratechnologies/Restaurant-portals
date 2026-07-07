import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MapPin, Phone, CheckCircle2, Clock, Truck, Store, Receipt, Map, Circle, Loader2, CreditCard, Hash } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useRestaurantOrders } from '../../hooks/useRestaurantOrders';

// ─── Shared Info Field ────────────────────────────────────────────────────────
function InfoField({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </span>
      <div className="bg-gray-50 border border-border/60 rounded-xl px-4 py-3 min-h-[48px] flex items-center">
        <span className="font-bold text-brand-navy text-sm leading-snug">{value}</span>
      </div>
    </div>
  );
}

// ─── Billing Row ─────────────────────────────────────────────────────────────
function BillingRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${highlight ? 'border-t border-border mt-1 pt-3.5' : 'border-b border-border/40'}`}>
      <span className={`text-sm font-bold ${highlight ? 'text-brand-navy text-base' : 'text-text-secondary'}`}>{label}</span>
      <span className={`font-black ${highlight ? 'text-brand-orange-600 text-2xl' : 'text-brand-navy text-sm'}`}>{value}</span>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { orders, loading } = useRestaurantOrders();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange-500" />
      </div>
    );
  }

  const rawOrder = orders.find(o => o.id === id);

  if (!rawOrder) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <p className="text-text-secondary font-bold text-lg">Order not found.</p>
      </div>
    );
  }

  const buildTimeline = (order: any) => {
    const defaultTimeStr = order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const currentStatus = order.status || 'Pending';
    const type = order.type || 'Delivery';

    const dbTimeline: Record<string, string> = {};
    if (Array.isArray(order.timeline)) {
      order.timeline.forEach((item: any) => {
        const t = item.time || item.timestamp;
        if (item.status && t) {
          let timeFmt = t;
          try {
            const d = new Date(t);
            if (!isNaN(d.getTime())) timeFmt = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } catch (e) {}
          dbTimeline[item.status] = timeFmt;
        }
      });
    }

    const getTime = (statusKeys: string[], isCompleted: boolean) => {
      for (const k of statusKeys) if (dbTimeline[k]) return dbTimeline[k];
      return isCompleted ? defaultTimeStr : '--:--';
    };

    const statusLevels: Record<string, number> = {
      'Pending': 1, 'Accepted': 2, 'Preparing': 3,
      'Ready for Pickup': 4, 'Out for Delivery': 4,
      'Delivered': 5, 'Completed': 5, 'Served': 5,
      'Cancelled': -1, 'Rejected': -1
    };

    const currentLevel = statusLevels[currentStatus] || 1;

    if (currentStatus === 'Cancelled' || currentStatus === 'Rejected') {
      return [
        { status: 'Order Placed', time: getTime(['Order Placed', 'Pending'], true), completed: true },
        { status: currentStatus === 'Rejected' ? 'Order Rejected' : 'Order Cancelled', time: getTime(['Order Rejected', 'Order Cancelled', 'Rejected', 'Cancelled'], true), completed: true }
      ];
    }

    const timeline = [
      { status: 'Order Placed', time: getTime(['Order Placed', 'Pending'], currentLevel >= 1), completed: currentLevel >= 1 },
      { status: 'Order Accepted', time: getTime(['Order Accepted', 'Accepted'], currentLevel >= 2), completed: currentLevel >= 2 },
      { status: 'Preparing', time: getTime(['Preparing'], currentLevel >= 3), completed: currentLevel >= 3 },
    ];

    if (type === 'Delivery') {
      timeline.push({ status: 'Out for Delivery', time: getTime(['Out for Delivery'], currentLevel >= 4), completed: currentLevel >= 4 });
      timeline.push({ status: 'Delivered', time: getTime(['Delivered', 'Completed'], currentLevel >= 5), completed: currentLevel >= 5 });
    } else if (type === 'Takeaway') {
      timeline.push({ status: 'Ready for Pickup', time: getTime(['Ready for Pickup'], currentLevel >= 4), completed: currentLevel >= 4 });
      timeline.push({ status: 'Picked Up', time: getTime(['Picked Up', 'Delivered', 'Completed'], currentLevel >= 5), completed: currentLevel >= 5 });
    } else {
      timeline.push({ status: 'Served', time: getTime(['Served', 'Delivered', 'Completed'], currentLevel >= 5), completed: currentLevel >= 5 });
    }

    return timeline;
  };

  const orderDetail = {
    id: rawOrder.id,
    status: rawOrder.status,
    type: rawOrder.type || 'Delivery',
    timestamp: rawOrder.created_at
      ? new Date(rawOrder.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
      : 'N/A',
    branch: rawOrder.branch || 'Unknown',
    payment: rawOrder.payment?.method || 'Online',
    customer: {
      name: rawOrder.customer?.name || 'N/A',
      phone: rawOrder.customer?.phone || 'N/A',
      address: rawOrder.customer?.address || 'No Address Provided',
    },
    agent: {
      name: rawOrder.deliveryAgent?.name || rawOrder.agent?.name || 'Not Assigned',
      phone: rawOrder.deliveryAgent?.contact || rawOrder.agent?.phone || 'N/A',
    },
    items: rawOrder.items || [],
    billing: {
      subtotal: rawOrder.billing?.subtotal || 0,
      tax: rawOrder.billing?.tax || 0,
      deliveryFee: rawOrder.billing?.deliveryFee || 0,
      discount: rawOrder.billing?.discount || 0,
      total: rawOrder.billing?.total || 0,
    },
    timeline: buildTimeline(rawOrder),
  };

  const STATUS_CFG: Record<string, string> = {
    Delivered: 'bg-green-50 text-green-700 border-green-200',
    Cancelled: 'bg-red-50 text-red-700 border-red-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
    Preparing: 'bg-amber-50 text-amber-700 border-amber-200',
    'Out for Delivery': 'bg-purple-50 text-purple-700 border-purple-200',
    Accepted: 'bg-blue-50 text-blue-700 border-blue-200',
    Pending: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  const statusCls = STATUS_CFG[orderDetail.status] ?? 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <Card className="p-0 border border-border/50 shadow-lg overflow-hidden bg-white rounded-[2rem] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/5 to-brand-orange-500/5 opacity-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-navy/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative p-8 md:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Left */}
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => navigate(-1)} className="shrink-0 w-11 h-11 flex items-center justify-center bg-white border border-border/50 rounded-xl shadow-sm hover:shadow-md hover:border-brand-orange-400/40 transition-all text-text-secondary hover:text-brand-orange-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-gradient-to-br from-brand-orange-50 to-orange-100 border-2 border-brand-orange-500/20 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <Receipt className="w-8 h-8 text-brand-orange-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-brand-navy tracking-tight">Order #{orderDetail.id}</h1>
                <span className={`text-xs font-black px-3 py-1 rounded-full border uppercase tracking-wider ${statusCls}`}>
                  {orderDetail.status}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-lg border border-border/50">
                  <Clock className="w-3.5 h-3.5 text-brand-orange-500" /> {orderDetail.timestamp}
                </span>
                <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-lg border border-border/50">
                  <Store className="w-3.5 h-3.5 text-brand-orange-500" /> {orderDetail.branch}
                </span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-brand-navy text-white px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-orange-400" /> {orderDetail.type}
            </div>
            <div className="bg-gray-100 text-brand-navy px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-text-secondary" /> {orderDetail.payment}
            </div>
          </div>
        </div>
      </Card>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Customer Details */}
          <Card className="p-0 border border-border/50 shadow-sm overflow-hidden bg-white rounded-3xl">
            <div className="px-6 py-4 border-b border-border/50 bg-gray-50/50 flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-border/50">
                <User className="w-4 h-4 text-brand-navy" />
              </div>
              <h2 className="text-base font-black text-brand-navy">Customer Details</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoField label="Customer Name" value={orderDetail.customer.name} icon={User} />
              <InfoField label="Phone Number" value={orderDetail.customer.phone} icon={Phone} />
              {orderDetail.type === 'Delivery' && (
                <div className="md:col-span-2">
                  <InfoField label="Delivery Address" value={orderDetail.customer.address} icon={MapPin} />
                </div>
              )}
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-0 border border-border/50 shadow-sm overflow-hidden bg-white rounded-3xl">
            <div className="px-6 py-4 border-b border-border/50 bg-gray-50/50 flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-border/50">
                <Receipt className="w-4 h-4 text-brand-navy" />
              </div>
              <h2 className="text-base font-black text-brand-navy">Order Items</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-border/50">
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest w-[50%]">Item</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest w-[20%] text-right">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest w-[10%] text-center">Qty</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest w-[20%] text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {orderDetail.items.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-brand-navy text-sm">{item.name}</p>
                        {item.category && (
                          <p className="text-xs font-medium text-text-secondary mt-0.5">{item.category}</p>
                        )}
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {item.customizations.map((c: any, cIdx: number) => (
                              <span key={cIdx} className="text-[10px] font-bold text-brand-orange-600 bg-brand-orange-50 px-2 py-0.5 rounded-md border border-brand-orange-100 uppercase tracking-wide">
                                +{typeof c === 'string' ? c : (c.name || c.title || 'Addon')}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-text-secondary text-right">₹{(item.price || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-black text-brand-navy text-center">×{item.qty || 1}</td>
                      <td className="px-6 py-4 text-sm font-black text-brand-navy text-right">₹{(item.subtotal || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Billing Summary */}
            <div className="p-6 bg-gray-50/60 border-t border-border/50">
              <div className="ml-auto w-full md:w-72 space-y-0">
                <BillingRow label="Subtotal" value={`₹${orderDetail.billing.subtotal.toLocaleString()}`} />
                <BillingRow label="Tax" value={`₹${orderDetail.billing.tax.toLocaleString()}`} />
                {orderDetail.type === 'Delivery' && (
                  <BillingRow label="Delivery Fee" value={`₹${orderDetail.billing.deliveryFee.toLocaleString()}`} />
                )}
                {orderDetail.billing.discount > 0 && (
                  <BillingRow label="Discount" value={`-₹${orderDetail.billing.discount.toLocaleString()}`} />
                )}
                <BillingRow label="Grand Total" value={`₹${orderDetail.billing.total.toLocaleString()}`} highlight />
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right Column ────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Order Info Quick Summary */}
          <Card className="p-0 border border-border/50 shadow-sm overflow-hidden bg-white rounded-3xl">
            <div className="px-6 py-4 border-b border-border/50 bg-gray-50/50 flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-border/50">
                <Hash className="w-4 h-4 text-brand-navy" />
              </div>
              <h2 className="text-base font-black text-brand-navy">Order Info</h2>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4">
              <InfoField label="Order ID" value={`#${orderDetail.id}`} />
              <InfoField label="Order Type" value={orderDetail.type} icon={Truck} />
              <InfoField label="Payment Mode" value={orderDetail.payment} icon={CreditCard} />
              <InfoField label="Branch" value={orderDetail.branch} icon={Store} />
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-0 border border-border/50 shadow-sm overflow-hidden bg-white rounded-3xl">
            <div className="px-6 py-4 border-b border-border/50 bg-gray-50/50 flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-border/50">
                <Clock className="w-4 h-4 text-brand-navy" />
              </div>
              <h2 className="text-base font-black text-brand-navy">Order Timeline</h2>
            </div>

            <div className="p-6">
              <div className="relative pl-7 space-y-5">
                {orderDetail.timeline.map((step, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    {/* Connecting line */}
                    {i !== orderDetail.timeline.length - 1 && (
                      <div className="absolute left-[-16px] top-8 bottom-[-20px] w-0.5 bg-gray-200 rounded-full z-0" />
                    )}
                    {/* Icon */}
                    <div className="absolute -left-[34px] bg-white z-10 py-0.5">
                      {step.completed
                        ? <CheckCircle2 className="w-6 h-6 text-brand-orange-500" />
                        : <Circle className="w-6 h-6 text-gray-300" />}
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <p className={`font-black text-sm ${step.completed ? 'text-brand-navy' : 'text-text-secondary'}`}>
                        {step.status}
                      </p>
                      <p className="text-xs font-semibold text-text-secondary mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {step.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Delivery Agent */}
          {orderDetail.type?.toLowerCase() === 'delivery' && orderDetail.agent.name !== 'Not Assigned' && (
            <Card className="p-0 border border-border/50 shadow-sm overflow-hidden bg-white rounded-3xl">
              <div className="px-6 py-4 border-b border-border/50 bg-gray-50/50 flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-border/50">
                  <Truck className="w-4 h-4 text-brand-navy" />
                </div>
                <h2 className="text-base font-black text-brand-navy">Delivery Partner</h2>
              </div>
              <div className="p-5 space-y-4">
                <InfoField label="Agent Name" value={orderDetail.agent.name} icon={User} />
                <InfoField label="Phone" value={orderDetail.agent.phone} icon={Phone} />
              </div>
            </Card>
          )}

        </div>
      </motion.div>
    </div>
  );
}
