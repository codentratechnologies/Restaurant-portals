import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MapPin, Phone, CheckCircle2, Clock, Truck, Store, Receipt, Map, Circle } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data representing a premium SaaS detail view response
  const orderDetail = {
    id: id || 'ORD101',
    status: 'Delivered', // 'Delivered' | 'Cancelled' | 'Preparing' | 'Out for Delivery' | 'Pending'
    type: 'Delivery', // 'Delivery' | 'Dine-in' | 'Takeaway'
    timestamp: 'May 5, 2026 at 2:30 PM',
    branch: 'Downtown Main',
    customer: {
      name: 'John Doe',
      phone: '9876543210',
      address: '42, Sunset Boulevard, 5th Floor, Silicon Valley, CA 94025'
    },
    agent: {
      name: 'Michael Scott',
      phone: '9998887776'
    },
    items: [
      { id: 1, name: 'Truffle Mushroom Risotto', category: 'Main Course', price: 850, qty: 1, subtotal: 850 },
      { id: 2, name: 'Crispy Calamari', category: 'Starters', price: 450, qty: 1, subtotal: 450 },
      { id: 3, name: 'Artisan Crafted Lemonade', category: 'Beverages', price: 180, qty: 2, subtotal: 360 },
    ],
    billing: {
      subtotal: 1660,
      tax: 83, // 5% flat tax example
      deliveryFee: 50,
      discount: 0,
      total: 1793
    },
    timeline: [
      { status: 'Order Placed', time: '2:30 PM', completed: true },
      { status: 'Kitchen Accepted', time: '2:35 PM', completed: true },
      { status: 'Out for Delivery', time: '2:50 PM', completed: true },
      { status: 'Delivered', time: '3:15 PM', completed: true },
    ]
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Delivered': return <Badge variant="success" className="font-bold shadow-sm px-3 py-1 text-sm">● Delivered</Badge>;
      case 'Cancelled': return <Badge variant="error" className="font-bold shadow-sm px-3 py-1 text-sm">● Cancelled</Badge>;
      case 'Preparing': return <Badge variant="warning" className="font-bold shadow-sm px-3 py-1 text-sm">● Preparing</Badge>;
      case 'Out for Delivery': return <Badge variant="info" className="font-bold shadow-sm px-3 py-1 text-sm">● Out for Delivery</Badge>;
      case 'Pending': return <Badge variant="default" className="font-bold shadow-sm px-3 py-1 text-sm">● Pending</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate(-1)}>
            <Button variant="outline" className="p-2.5 hover:bg-gray-50 rounded-xl transition-all shadow-sm bg-white border border-border">
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </Button>
          </button>
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-brand-navy tracking-tight">Order #{orderDetail.id}</h1>
              {getStatusBadge(orderDetail.status)}
            </div>
            <p className="text-text-secondary mt-1 text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" /> {orderDetail.timestamp}
              <span className="text-border">|</span>
              <Store className="w-4 h-4" /> {orderDetail.branch}
              <span className="text-border">|</span>
              <Badge variant="default" className="bg-gray-100 text-text-secondary">{orderDetail.type}</Badge>
            </p>
          </motion.div>
        </div>
      </div>

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
            <div className="p-6 border-b border-border/50 bg-gray-50/30 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-black text-brand-navy">Customer Details</h2>
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
            <div className="p-6 border-b border-border/50 bg-gray-50/30 flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Receipt className="w-5 h-5 text-brand-orange-600" />
              </div>
              <h2 className="text-lg font-black text-brand-navy">Order Summary</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-white">
                    <th className="py-4 px-6 text-xs font-black text-text-secondary uppercase tracking-widest">Item</th>
                    <th className="py-4 px-6 text-xs font-black text-text-secondary uppercase tracking-widest text-left">Price</th>
                    <th className="py-4 px-6 text-xs font-black text-text-secondary uppercase tracking-widest text-center">Qty</th>
                    <th className="py-4 px-6 text-xs font-black text-brand-navy uppercase tracking-widest text-left bg-gray-50/30">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {orderDetail.items.map((item) => (
                    <tr key={item.id} className="hover:bg-brand-orange-50/30 transition-colors group">
                      <td className="py-4 px-6">
                        <p className="font-bold text-brand-navy group-hover:text-brand-orange-600 transition-colors">{item.name}</p>
                        <p className="text-xs font-semibold text-text-secondary mt-0.5">{item.category}</p>
                      </td>
                      <td className="py-4 px-6 font-bold text-text-secondary text-left">₹{item.price.toLocaleString()}</td>
                      <td className="py-4 px-6 font-black text-brand-navy text-center">x{item.qty}</td>
                      <td className="py-4 px-6 font-black text-brand-navy text-left bg-gray-50/30">₹{item.subtotal.toLocaleString()}</td>
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
          <Card className="p-0 border border-border/50 shadow-lg overflow-hidden bg-white rounded-3xl sticky top-24">
            <div className="p-6 border-b border-border/50 bg-gray-50/30 flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-black text-brand-navy">Order Timeline</h2>
            </div>
            
            <div className="p-8">
              <div className="relative pl-6 space-y-8">
                {/* Vertical connecting line */}
                <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-gray-100 rounded-full" />
                
                {orderDetail.timeline.map((step, i) => (
                  <div key={i} className="relative flex items-start gap-5">
                    {/* Step Icon */}
                    <div className="absolute -left-[30px] bg-white z-10 py-1">
                      {step.completed ? (
                        <CheckCircle2 className="w-7 h-7 text-brand-orange-500 bg-white" />
                      ) : (
                        <Circle className="w-7 h-7 text-gray-200 bg-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 mt-0.5">
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
          {orderDetail.type === 'Delivery' && (
            <Card className="p-0 border border-border/50 shadow-lg overflow-hidden bg-white rounded-3xl">
              <div className="p-6 border-b border-border/50 bg-brand-navy flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-black text-white">Delivery Partner</h2>
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

