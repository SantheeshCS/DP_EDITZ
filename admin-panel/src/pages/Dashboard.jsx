import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  FileStack, 
  ShoppingBag, 
  IndianRupee, 
  ArrowUpRight, 
  TrendingUp, 
  Clock,
  Loader 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    templatesCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularTemplates, setPopularTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [templatesRes, ordersRes] = await Promise.all([
          api.get('/templates'),
          api.get('/admin/orders'),
        ]);

        const templates = templatesRes.data;
        const orders = ordersRes.data;

        // Calculate statistics
        const paidOrders = orders.filter((o) => o.status === 'paid');
        const revenue = paidOrders.reduce((sum, order) => {
          return sum + (order.templateId ? order.templateId.price : 0);
        }, 0);

        setStats({
          templatesCount: templates.length,
          ordersCount: paidOrders.length,
          totalRevenue: revenue / 100, // paise to rupees
        });

        // 5 most recent orders
        setRecentOrders(orders.slice(0, 5));

        // Popular templates (sorted by download count descending)
        const popular = [...templates]
          .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
          .slice(0, 5);
        setPopularTemplates(popular);

      } catch (error) {
        console.error('Dashboard Fetch Error:', error);
        toast.error('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Templates Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400">Total Templates</p>
            <h3 className="text-3xl font-bold text-slate-100">{stats.templatesCount}</h3>
            <p className="text-xs text-indigo-400">Assets live in catalog</p>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
            <FileStack className="w-6 h-6" />
          </div>
        </div>

        {/* Total Paid Orders Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400">Paid Sales</p>
            <h3 className="text-3xl font-bold text-slate-100">{stats.ordersCount}</h3>
            <p className="text-xs text-emerald-400">Completed purchases</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400">Total Revenue</p>
            <h3 className="text-3xl font-bold text-slate-100">₹{stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-xs text-purple-400">Net earned income</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Stats Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Popular Templates list */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-200">Top Performing Templates</h3>
            </div>
            <Link to="/templates" className="text-xs text-indigo-400 hover:underline flex items-center space-x-0.5">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {popularTemplates.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No template download records found.</p>
            ) : (
              popularTemplates.map((template) => (
                <div key={template._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={template.previewImageUrl} 
                      alt={template.title} 
                      className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{template.title}</h4>
                      <p className="text-xs text-slate-500 capitalize">{template.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-indigo-400">{template.downloadCount || 0} downloads</span>
                    <p className="text-xs text-slate-500">₹{(template.price / 100).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders log */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-200">Recent Purchase Logs</h3>
            </div>
            <Link to="/orders" className="text-xs text-indigo-400 hover:underline flex items-center space-x-0.5">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {recentOrders.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No orders logged in database.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">
                      {order.templateId ? order.templateId.title : 'Deleted Template'}
                    </h4>
                    <p className="text-xs text-slate-500 truncate max-w-xs">{order.customerEmail || 'No email collected'}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      order.status === 'paid'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : order.status === 'pending'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {order.status}
                    </span>
                    <p className="text-slate-500 text-[10px]">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
