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
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search templates by title or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <Link
          to="/templates/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 px-5 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-indigo-600/10 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Upload Template</span>
        </Link>
      </div>

      {/* Templates Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Downloads</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-slate-500 py-12">
                    No templates found in stock.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template) => (
                  <tr key={template._id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Preview Image */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={template.previewImageUrl}
                        alt={template.title}
                        className="w-14 h-14 object-cover rounded-lg border border-slate-800"
                      />
                    </td>

                    {/* Title and Tags */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-200 truncate">{template.title}</div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {template.tags?.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags?.length > 3 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{template.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {template.category}
                      </span>
                    </td>

                    {/* Price in Rs */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-200">
                      ₹{(template.price / 100).toFixed(2)}
                    </td>

                    {/* Downloads count */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-semibold">
                      {template.downloadCount || 0}
                    </td>

                    {/* Actions buttons */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/templates/${template._id}/edit`}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/10 rounded-lg transition-all"
                          title="Edit Metadata"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(template._id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 rounded-lg transition-all"
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
