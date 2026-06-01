import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ShoppingBag, Search, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve customer orders.');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by template name, customer email, or stripe session ID
  const filteredOrders = orders.filter((order) => {
    const query = search.toLowerCase();
    const matchesEmail = order.customerEmail?.toLowerCase().includes(query);
    const matchesTemplate = order.templateId?.title?.toLowerCase().includes(query);
    const matchesSession = order.stripeSessionId?.toLowerCase().includes(query);
    return matchesEmail || matchesTemplate || matchesSession;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search orders by customer email or template name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="text-sm text-slate-400 font-semibold bg-slate-900 border border-slate-850 px-4 py-3 rounded-xl">
          Total Sales logged: {orders.filter(o => o.status === 'paid').length} / {orders.length} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Transaction ID / Date</th>
                <th className="px-6 py-4">Template Title</th>
                <th className="px-6 py-4">Customer Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-slate-500 py-12">
                    No orders matching search filter found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Date and Mongo ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {order._id}
                      </div>
                    </td>

                    {/* Template name */}
                    <td className="px-6 py-4 max-w-xs font-medium text-slate-300">
                      {order.templateId ? (
                        <div className="truncate" title={order.templateId.title}>
                          {order.templateId.title}
                        </div>
                      ) : (
                        <span className="text-rose-500 font-semibold italic">Deleted Template</span>
                      )}
                    </td>

                    {/* Customer email */}
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-400">
                      {order.customerEmail || (
                        <span className="text-slate-600 italic">Not collected yet</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        order.status === 'paid'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : order.status === 'pending'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Revenue in Rs */}
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-slate-200">
                      {order.templateId ? (
                        <span>₹{(order.templateId.price / 100).toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;
