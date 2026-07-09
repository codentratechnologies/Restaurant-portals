import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, MapPin, Phone, CheckCircle2, Clock, Truck,
  Store, Receipt, Circle, Loader2, CreditCard, Hash, Package,
  ChevronRight,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { useRestaurantOrders } from '../../hooks/useRestaurantOrders';

// ─── Uniform Info Field ───────────────────────────────────────────────────────
function InfoField({
  label,
  value,
  icon: Icon,
  fullWidth = false,
  accent = false,
}: {
  label: string;
  value: string;
  icon?: any;
  fullWidth?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-text-secondary">
        {Icon && <Icon className="w-3 h-3 shrink-0" />}
        {label}
      </span>
      <div className="h-11 flex items-center px-4 bg-gray-50 border border-border/70 rounded-xl">
        <span className={`text-sm font-bold leading-snug truncate ${accent ? 'text-brand-orange-600' : 'text-brand-navy'}`}>
          {value || '—'}
        </span>
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-0 border border-border/50 shadow-sm overflow-hidden bg-white rounded-2xl">
      <div className="px-5 py-3.5 border-b border-border/50 bg-gray-50/60 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-white rounded-lg border border-border/50 shadow-sm flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-brand-navy" />
        </div>
        <h2 className="text-sm font-black text-brand-navy tracking-tight">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { cls: string; dot?: boolean }> = {
  Delivered:         { cls: 'bg-green-50 text-green-700 border-green-200' },
  Cancelled:         { cls: 'bg-red-50 text-red-700 border-red-200' },
  Rejected:          { cls: 'bg-red-50 text-red-700 border-red-200' },
  Preparing:         { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: true },
  'Out for Delivery':{ cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  'Ready For Pickup':{ cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  Accepted:          { cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  Pending:           { cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

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

  // ── Build Timeline ──────────────────────────────────────────────────────────
  const buildTimeline = (order: any) => {
    const defaultTimeStr = order.created_at
      ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A';
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
      Pending: 1, Accepted: 2, Preparing: 3,
      'Ready for Pickup': 4, 'Out for Delivery': 4,
      Delivered: 5, Completed: 5, Served: 5,
      Cancelled: -1, Rejected: -1,
    };
    const currentLevel = statusLevels[currentStatus] || 1;

    if (currentStatus === 'Cancelled' || currentStatus === 'Rejected') {
      return [
        { status: 'Order Placed', time: getTime(['Order Placed', 'Pending'], true), completed: true },
        { status: currentStatus === 'Rejected' ? 'Order Rejected' : 'Order Cancelled', time: getTime(['Order Rejected', 'Order Cancelled', 'Rejected', 'Cancelled'], true), completed: true },
      ];
    }

    const timeline = [
      { status: 'Order Placed',   time: getTime(['Order Placed', 'Pending'], currentLevel >= 1), completed: currentLevel >= 1 },
      { status: 'Order Accepted', time: getTime(['Order Accepted', 'Accepted'], currentLevel >= 2), completed: currentLevel >= 2 },
      { status: 'Preparing',      time: getTime(['Preparing'], currentLevel >= 3), completed: currentLevel >= 3 },
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

  // ── Derived Data ────────────────────────────────────────────────────────────
  const order = {
    id: rawOrder.id,
    status: rawOrder.status,
    type: rawOrder.type || 'Delivery',
    timestamp: rawOrder.created_at
      ? new Date(rawOrder.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
      : 'N/A',
    branch: rawOrder.branch || 'N/A',
    payment: rawOrder.payment?.method || 'Online',
    customer: {
      name:    rawOrder.customer?.name    || 'N/A',
      phone:   rawOrder.customer?.phone   || 'N/A',
      address: rawOrder.customer?.address || 'No address provided',
    },
    agent: {
      name:  rawOrder.deliveryAgent?.name    || rawOrder.agent?.name    || 'Not Assigned',
      phone: rawOrder.deliveryAgent?.contact || rawOrder.agent?.phone   || 'N/A',
    },
    items:   rawOrder.items || [],
    billing: {
      subtotal:    rawOrder.billing?.subtotal    || 0,
      tax:         rawOrder.billing?.tax         || 0,
      deliveryFee: rawOrder.billing?.deliveryFee || 0,
      discount:    rawOrder.billing?.discount    || 0,
      total:       rawOrder.billing?.total       || 0,
    },
    timeline: buildTimeline(rawOrder),
  };

  const statusCfg = STATUS_CFG[order.status] ?? { cls: 'bg-gray-100 text-gray-600 border-gray-200' };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-0 border border-border/50 shadow-md overflow-hidden bg-white rounded-2xl relative">
          {/* Subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/[0.03] to-brand-orange-500/[0.04] pointer-events-none" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-orange-500/[0.07] blur-[60px] rounded-full pointer-events-none" />

          <div className="relative px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: back + id + meta */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="shrink-0 w-9 h-9 flex items-center justify-center bg-white border border-border/60 rounded-xl shadow-sm hover:shadow hover:border-brand-orange-400/40 transition-all text-text-secondary hover:text-brand-orange-600"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 bg-gradient-to-br from-brand-orange-50 to-orange-100 border border-brand-orange-200/50 rounded-xl flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 text-brand-orange-600" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-black text-brand-navy tracking-tight">Order #{order.id}</h1>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${statusCfg.cls}`}>
                    {statusCfg.dot && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                      </span>
                    )}
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-text-secondary flex items-center gap-1">
                    <Clock className="w-3 h-3 text-brand-orange-400" /> {order.timestamp}
                  </span>
                  <span className="text-[11px] font-semibold text-text-secondary flex items-center gap-1">
                    <Store className="w-3 h-3 text-brand-orange-400" /> {order.branch}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: type + payment chips */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-8 bg-brand-navy text-white px-3 text-xs font-bold rounded-lg flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-brand-orange-400" /> {order.type}
              </div>
              <div className="h-8 bg-gray-100 text-brand-navy px-3 text-xs font-bold rounded-lg flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-text-secondary" /> {order.payment}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Main Grid ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-5"
      >
        {/* ── Left Column (2/3) ───────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Customer Details */}
          <SectionCard icon={User} title="Customer Details">
            <div className="grid grid-cols-2 gap-3">
              <InfoField label="Customer Name"  value={order.customer.name}  icon={User}  />
              <InfoField label="Phone Number"   value={order.customer.phone} icon={Phone} />
              {order.type === 'Delivery' && (
                <InfoField label="Delivery Address" value={order.customer.address} icon={MapPin} fullWidth />
              )}
            </div>
          </SectionCard>

          {/* Order Items */}
          <SectionCard icon={Package} title="Order Items">
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-left border-collapse min-w-[480px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-border/50">
                    <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest w-[50%]">Item</th>
                    <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Unit Price</th>
                    <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Qty</th>
                    <th className="px-4 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {order.items.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-brand-navy text-sm">{item.name}</p>
                        {item.category && (
                          <p className="text-[11px] font-medium text-text-secondary mt-0.5">{item.category}</p>
                        )}
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {item.customizations.map((c: any, ci: number) => (
                              <span key={ci} className="text-[10px] font-bold text-brand-orange-600 bg-brand-orange-50 px-2 py-0.5 rounded border border-brand-orange-100 uppercase tracking-wide">
                                +{typeof c === 'string' ? c : (c.name || c.title || 'Addon')}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-bold text-text-secondary text-right">₹{(item.price || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 text-sm font-black text-brand-navy text-center">×{item.qty || 1}</td>
                      <td className="px-4 py-3.5 text-sm font-black text-brand-navy text-right">₹{(item.subtotal || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Billing Summary */}
            <div className="mt-4 flex justify-end">
              <div className="w-full sm:w-72 bg-gray-50/70 border border-border/50 rounded-xl overflow-hidden">
                <div className="divide-y divide-border/40">
                  {[
                    { label: 'Subtotal',     value: order.billing.subtotal },
                    { label: 'Tax',          value: order.billing.tax },
                    ...(order.type === 'Delivery' ? [{ label: 'Delivery Fee', value: order.billing.deliveryFee }] : []),
                    ...(order.billing.discount > 0  ? [{ label: 'Discount',     value: -order.billing.discount }] : []),
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-xs font-bold text-text-secondary">{row.label}</span>
                      <span className={`text-xs font-black ${row.value < 0 ? 'text-green-600' : 'text-brand-navy'}`}>
                        {row.value < 0 ? '-' : ''}₹{Math.abs(row.value).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-brand-navy">
                  <span className="text-xs font-black text-white/70 uppercase tracking-wider">Grand Total</span>
                  <span className="text-lg font-black text-brand-orange-400">₹{order.billing.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Delivery Agent — left column, below items */}
          {order.type?.toLowerCase() === 'delivery' && order.agent.name !== 'Not Assigned' && (
            <SectionCard icon={Truck} title="Delivery Partner">
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="Agent Name" value={order.agent.name}  icon={User}  />
                <InfoField label="Phone"      value={order.agent.phone} icon={Phone} />
              </div>
            </SectionCard>
          )}

        </div>

        {/* ── Right Column (1/3) ──────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Order Info */}
          <SectionCard icon={Hash} title="Order Info">
            <div className="grid grid-cols-1 gap-3">
              <InfoField label="Order ID"     value={`#${order.id}`}  />
              <InfoField label="Order Type"   value={order.type}      icon={Truck}      />
              <InfoField label="Payment Mode" value={order.payment}   icon={CreditCard} />
              <InfoField label="Branch"       value={order.branch}    icon={Store}      />
            </div>
          </SectionCard>

          {/* Timeline */}
          <SectionCard icon={Clock} title="Order Timeline">
            <div className="relative">
              {order.timeline.map((step, i) => {
                const isLast = i === order.timeline.length - 1;
                return (
                  <div key={i} className="flex gap-3 relative">
                    {/* Connector line */}
                    {!isLast && (
                      <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-gray-200 z-0" />
                    )}
                    {/* Dot */}
                    <div className="shrink-0 z-10 mt-0.5">
                      {step.completed
                        ? <CheckCircle2 className="w-6 h-6 text-brand-orange-500 bg-white" />
                        : <Circle       className="w-6 h-6 text-gray-300 bg-white" />}
                    </div>
                    {/* Content */}
                    <div className={`pb-5 ${isLast ? 'pb-0' : ''}`}>
                      <p className={`text-sm font-black leading-tight ${step.completed ? 'text-brand-navy' : 'text-text-secondary'}`}>
                        {step.status}
                      </p>
                      <p className="text-[11px] font-semibold text-text-secondary mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {step.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

        </div>
      </motion.div>
    </div>
  );
}
