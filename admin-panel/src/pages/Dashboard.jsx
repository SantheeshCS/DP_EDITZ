import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  FileStack, 
  ArrowUpRight, 
  TrendingUp, 
  Loader,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    templatesCount: 0,
    totalDownloads: 0,
  });
  const [popularTemplates, setPopularTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const templatesRes = await api.get('/templates');
        const templates = templatesRes.data;

        const totalDownloads = templates.reduce((sum, t) => sum + (t.downloadCount || 0), 0);

        setStats({
          templatesCount: templates.length,
          totalDownloads,
        });

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Templates Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Total Templates</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.templatesCount}</h3>
            <p className="text-xs text-indigo-500">Assets live in catalog</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <FileStack className="w-6 h-6" />
          </div>
        </div>

        {/* Total Downloads Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Total Downloads</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.totalDownloads}</h3>
            <p className="text-xs text-emerald-500">Free template downloads</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Stats Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        
        {/* Popular Templates list */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-800">Top Performing Templates</h3>
            </div>
            <Link to="/templates" className="text-xs text-indigo-600 hover:underline flex items-center space-x-0.5">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {popularTemplates.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No template records found.</p>
            ) : (
              popularTemplates.map((template) => (
                <div key={template._id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    {template.previewMediaType === 'video' ? (
                      <video 
                        src={template.previewImageUrl} 
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        muted
                        playsInline
                      />
                    ) : (
                      <img 
                        src={template.previewImageUrl} 
                        alt={template.title} 
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                      />
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{template.title}</h4>
                      <p className="text-xs text-slate-500 capitalize">{template.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-indigo-600">{template.downloadCount || 0} downloads</span>
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
