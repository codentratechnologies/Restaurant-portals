import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MapPin, Phone, CheckCircle2, Clock, Truck, Store, Receipt, Map, Circle, Loader2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useRestaurantOrders } from '../../hooks/useRestaurantOrders';

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
            if (!isNaN(d.getTime())) {
              timeFmt = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
          } catch (e) { }
          dbTimeline[item.status] = timeFmt;
        }
      });
    }

    const getTime = (statusKeys: string[], isCompleted: boolean) => {
      for (const k of statusKeys) {
        if (dbTimeline[k]) return dbTimeline[k];
      }
      return isCompleted ? defaultTimeStr : '--:--';
    };

    const statusLevels: Record<string, number> = {
      'Pending': 1,
      'Accepted': 2,
      'Preparing': 3,
      'Ready for Pickup': 4,
      'Out for Delivery': 4,
      'Delivered': 5,
      'Completed': 5,
      'Served': 5,
      'Cancelled': -1,
      'Rejected': -1
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

  // Gracefully fallback complex structures if not present
  const orderDetail = {
    id: rawOrder.id,
    status: rawOrder.status,
    type: rawOrder.type || 'Delivery',
    timestamp: rawOrder.created_at ? new Date(rawOrder.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A',
    branch: rawOrder.branch || 'Unknown',
    customer: {
      name: rawOrder.customer?.name || 'N/A',
      phone: rawOrder.customer?.phone || 'N/A',
      address: rawOrder.customer?.address || 'No Address Provided'
    },
    agent: {
      name: rawOrder.deliveryAgent?.name || rawOrder.agent?.name || 'Not Assigned',
      phone: rawOrder.deliveryAgent?.contact || rawOrder.agent?.phone || 'N/A'
    },
    items: rawOrder.items || [],
    billing: {
      subtotal: rawOrder.billing?.subtotal || 0,
      tax: rawOrder.billing?.tax || 0,
      deliveryFee: rawOrder.billing?.deliveryFee || 0,
      discount: rawOrder.billing?.discount || 0,
      total: rawOrder.billing?.total || 0
    },
    timeline: buildTimeline(rawOrder)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered': return <Badge variant="success" className="font-bold shadow-sm px-3 py-1 text-sm">● Delivered</Badge>;
      case 'Cancelled': return <Badge variant="error" className="font-bold shadow-sm px-3 py-1 text-sm">● Cancelled</Badge>;
      case 'Preparing': return <Badge variant="warning" className="font-bold shadow-sm px-3 py-1 text-sm">● Preparing</Badge>;
      case 'Out for Delivery': return <Badge variant="info" className="font-bold shadow-sm px-3 py-1 text-sm">● Out for Delivery</Badge>;
      case 'Pending': return <Badge variant="default" className="font-bold shadow-sm px-3 py-1 text-sm">● Pending</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Top Navigation & Status (Unified Premium Hero Header) */}
      <Card className="p-0 border border-border/50 shadow-lg overflow-hidden bg-white rounded-[2rem] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/5 to-brand-orange-500/5 opacity-50" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-navy/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative p-8 md:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button type="button" onClick={() => navigate(-1)} className="shrink-0">
                <div className="w-12 h-12 flex items-center justify-center bg-white border border-border/50 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-orange-500/30 transition-all text-text-secondary hover:text-brand-orange-600 cursor-pointer">
                  <ArrowLeft className="w-5 h-5" />
                </div>
              </button>

              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-orange-50 to-orange-100 border-2 border-brand-orange-500/20 rounded-[1.5rem] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(255,165,0,0.2)] shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
                  <Receipt className="w-10 h-10 text-brand-orange-600 relative z-10 drop-shadow-sm" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-brand-navy tracking-tight mb-2 flex items-center gap-3">
                    Order #{orderDetail.id}
                    {getStatusBadge(orderDetail.status)}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-text-secondary flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] border border-border/50">
                      <Clock className="w-4 h-4 text-brand-orange-500" /> {orderDetail.timestamp}
                    </span>
                    <span className="text-sm font-bold text-text-secondary flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] border border-border/50">
                      <Store className="w-4 h-4 text-brand-orange-500" /> {orderDetail.branch}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-brand-navy text-white px-5 py-2.5 text-sm font-bold shadow-premium rounded-xl flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-orange-500" /> {orderDetail.type} Order
              </div>
            </div>
          </div>
        </div>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-6"
      >
        {/* Left Column (Customer + Items + Billing) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Customer Details Card */}
          <Card className="p-0 border border-border/50 shadow-lg overflow-hidden bg-white rounded-3xl">
            <div className="p-6 border-b border-border/50 bg-gray-50/50 flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] border border-border/50">
                <User className="w-5 h-5 text-brand-navy" />
              </div>
              <h2 className="text-lg font-black text-brand-navy tracking-tight">Customer Details</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Name & Contact
                </span>
                <div className="bg-gray-50/50 border border-border/50 p-4 rounded-2xl">
                  <p className="font-black text-brand-navy text-lg">{orderDetail.customer.name}</p>
                  <p className="text-text-secondary font-bold flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-brand-orange-500" /> {orderDetail.customer.phone}
                  </p>
                </div>
              </div>

              {/* Only show address if Delivery */}
              {orderDetail.type === 'Delivery' && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Delivery Address
                  </span>
                  <div className="bg-gray-50/50 border border-border/50 p-4 rounded-2xl flex items-start gap-3 h-full">
                    <Map className="w-5 h-5 text-brand-orange-500 shrink-0 mt-0.5" />
                    <p className="font-bold text-brand-navy text-sm leading-relaxed">
                      {orderDetail.customer.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Order Items Table */}
          <Card className="p-0 border border-border/50 shadow-lg overflow-hidden bg-white rounded-3xl">
            <div className="p-6 border-b border-border/50 bg-gray-50/50 flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] border border-border/50">
                <Receipt className="w-5 h-5 text-brand-navy" />
              </div>
              <h2 className="text-lg font-black text-brand-navy tracking-tight">Order Summary</h2>
            </div>

            <div className="overflow-x-auto bg-white border-t border-border/50">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-border/50">
                    <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider">Item</th>
                    <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider text-left">Price</th>
                    <th className="px-6 py-5 text-xs font-bold text-text-secondary uppercase tracking-wider text-center">Qty</th>
                    <th className="px-6 py-5 text-xs font-bold text-brand-navy uppercase tracking-wider text-left">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {orderDetail.items.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                      <td className="px-6 py-5">
                        <p className="font-bold text-brand-navy group-hover:text-brand-orange-600 transition-colors">{item.name}</p>
                        <p className="text-xs font-semibold text-text-secondary mt-0.5">{item.category}</p>
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.customizations.map((c: any, cIdx: number) => (
                              <span key={cIdx} className="text-[10px] font-bold text-brand-orange-600 bg-brand-orange-50 px-2 py-0.5 rounded-md border border-brand-orange-100 uppercase tracking-wide">
                                + {typeof c === 'string' ? c : (c.name || c.title || 'Addon')}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 font-bold text-text-secondary text-left">₹{(item.price || 0).toLocaleString()}</td>
                      <td className="px-6 py-5 font-black text-brand-navy text-center">x{item.qty || 1}</td>
                      <td className="px-6 py-5 font-black text-brand-navy text-left bg-gray-50/30">₹{(item.subtotal || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Billing Summary */}
            <div className="p-6 bg-gray-50/80 border-t border-border/50 flex flex-col md:flex-row justify-end items-end gap-6">
              <div className="w-full md:w-80 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-text-secondary">
                  <span>Subtotal</span>
                  <span className="text-brand-navy">₹{orderDetail.billing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-text-secondary">
                  <span>Tax Amount</span>
                  <span className="text-brand-navy">₹{orderDetail.billing.tax.toLocaleString()}</span>
                </div>
                {orderDetail.type === 'Delivery' && (
                  <div className="flex justify-between items-center text-sm font-bold text-text-secondary">
                    <span>Delivery Fee</span>
                    <span className="text-brand-navy">₹{orderDetail.billing.deliveryFee.toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-lg font-black text-brand-navy uppercase tracking-tight">Grand Total</span>
                  <span className="text-3xl font-black text-brand-orange-600 tracking-tight">₹{orderDetail.billing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Column (Timeline + Agent) */}
        <div className="space-y-6">

          {/* Timeline Stepper */}
          <Card className="p-0 border border-border/50 shadow-lg overflow-hidden bg-white rounded-3xl">
            <div className="p-6 border-b border-border/50 bg-gray-50/50 flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] border border-border/50">
                <Clock className="w-5 h-5 text-brand-navy" />
              </div>
              <h2 className="text-lg font-black text-brand-navy tracking-tight">Order Timeline</h2>
            </div>

            <div className="p-6">
              <div className="relative pl-6 space-y-6">

                {orderDetail.timeline.map((step, i) => (
                  <div key={i} className="relative flex items-start gap-5">
                    {/* Vertical connecting line for this step */}
                    {i !== orderDetail.timeline.length - 1 && (
                      <div className="absolute left-[-13px] top-8 -bottom-6 w-0.5 bg-gray-200 rounded-full z-0" />
                    )}

                    {/* Step Icon */}
                    <div className="absolute -left-[30px] bg-white z-10 py-1">
                      {step.completed ? (
                        <CheckCircle2 className="w-7 h-7 text-brand-orange-500 bg-white relative z-10" />
                      ) : (
                        <Circle className="w-7 h-7 text-gray-200 bg-white relative z-10" />
                      )}
                    </div>

                    <div className="flex-1 mt-0.5 ml-3">
                      <p className={`font-black text-base tracking-tight ${step.completed ? 'text-brand-navy' : 'text-text-secondary'}`}>
                        {step.status}
                      </p>
                      <p className="text-sm font-bold text-text-secondary mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {step.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Delivery Agent Card */}
          {orderDetail.type?.toLowerCase() === 'delivery' && orderDetail.agent.name !== 'Not Assigned' && (
            <Card className="p-0 border border-border/50 shadow-lg overflow-hidden bg-white rounded-3xl">
              <div className="p-6 border-b border-border/50 bg-gray-50/50 flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] border border-border/50">
                  <Truck className="w-5 h-5 text-brand-navy" />
                </div>
                <h2 className="text-lg font-black text-brand-navy tracking-tight">Delivery Partner</h2>
              </div>

              <div className="p-6 flex items-center gap-5">
                <div className="w-16 h-16 bg-gray-50 border-2 border-brand-orange-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-8 h-8 text-brand-orange-500" />
                </div>
                <div>
                  <p className="font-black text-brand-navy text-lg">{orderDetail.agent.name}</p>
                  <p className="font-bold text-text-secondary text-sm flex items-center gap-2 mt-1 bg-gray-50 px-2 py-1 rounded-lg border border-border/50">
                    <Phone className="w-4 h-4 text-brand-orange-500" /> {orderDetail.agent.phone}
                  </p>
                </div>
              </div>
            </Card>
          )}

        </div>
      </motion.div>
    </div>
  );
}
