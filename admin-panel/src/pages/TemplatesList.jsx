import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Edit2, Trash2, Plus, Search, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const TemplatesList = () => {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load templates list.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this template? This will permanently remove all storage files and database records.')) {
      return;
    }

    try {
      await api.delete(`/admin/templates/${id}`);
      toast.success('Template deleted successfully');
      setTemplates(templates.filter((t) => t._id !== id));
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to delete template.');
    }
  };

  // Filter templates on client side by title or tags
  const filteredTemplates = templates.filter((template) => {
    const query = search.toLowerCase();
    const matchesTitle = template.title.toLowerCase().includes(query);
    const matchesTags = template.tags?.some((t) => t.toLowerCase().includes(query));
    return matchesTitle || matchesTags;
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
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates by title or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
          />
        </div>

        <Link
          to="/templates/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 px-5 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Upload Template</span>
        </Link>
      </div>

      {/* Templates Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Downloads</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-slate-500 py-12">
                    No templates found in stock.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template) => (
                  <tr key={template._id} className="hover:bg-slate-50 transition-colors">
                    {/* Preview Image / Video */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.previewMediaType === 'video' ? (
                        <video
                          src={template.previewImageUrl}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={template.previewImageUrl}
                          alt={template.title}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                        />
                      )}
                    </td>

                    {/* Title and Tags */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate">{template.title}</div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {template.tags?.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags?.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{template.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {template.category}
                      </span>
                    </td>

                    {/* Downloads count */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-semibold">
                      {template.downloadCount || 0}
                    </td>

                    {/* Actions buttons */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/templates/${template._id}/edit`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all cursor-pointer"
                          title="Edit Metadata"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(template._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

export default TemplatesList;
