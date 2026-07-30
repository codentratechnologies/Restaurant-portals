import React from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';

export default function DashboardRecentOrders({ recentOrders, topItems }: { recentOrders: any[], topItems: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-2">
      {/* Recent Orders */}
      <div className="lg:col-span-2 bg-white border border-[#E8ECF4] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#F0F2F7]">
          <h3 className="text-base sm:text-lg font-black text-[#1a1f36]">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#F0F2F7]">
                <th className="px-5 py-3 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Order ID</th>
                <th className="px-5 py-3 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Restaurant</th>
                <th className="px-5 py-3 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-bold text-[#8896AB] uppercase tracking-wider">Time</th>
                <th className="px-5 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F7]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm font-medium text-[#8896AB]">
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="px-5 py-3.5 text-sm font-bold text-[#1a1f36] whitespace-nowrap">{order.id}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-[#1a1f36]">{order.customer}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-[#1a1f36]">{order.restaurant}</td>
                    <td className="px-5 py-3.5 text-sm font-black text-[#1a1f36]">{order.amount}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap" style={{ backgroundColor: order.color, color: order.text }}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-[#1a1f36] whitespace-nowrap">{order.time}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to={`/admin/orders/${order.rawId}`} className="text-[#8896AB] hover:text-[#1a1f36] transition-colors p-1 rounded-lg hover:bg-[#E8ECF4] inline-block">
                        <MoreVertical className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white border border-[#E8ECF4] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#F0F2F7]">
          <h3 className="text-base sm:text-lg font-black text-[#1a1f36]">Top Selling Items</h3>
        </div>
        <div className="p-2 sm:p-3 space-y-1 overflow-y-auto max-h-[350px]">
          {topItems.length === 0 ? (
            <div className="p-5 text-center text-sm font-medium text-[#8896AB]">
              No items sold yet.
            </div>
          ) : (
            topItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-[#F8FAFC] rounded-xl transition-colors cursor-pointer group">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1a1f36] truncate group-hover:text-[#FF6B00] transition-colors">{item.name}</p>
                  <p className="text-xs font-medium text-[#8896AB] mt-0.5">{item.orders}</p>
                </div>
                <div className="text-sm font-black text-[#1a1f36]">
                  {item.revenue}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
