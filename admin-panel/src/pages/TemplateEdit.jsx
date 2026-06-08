import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const TemplateEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('alight-motion');
  const [tags, setTags] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewMediaType, setPreviewMediaType] = useState('image');

  useEffect(() => {
    const fetchTemplateDetails = async () => {
      try {
        const response = await api.get(`/templates/${id}`);
        const template = response.data;
        
        setTitle(template.title);
        setDescription(template.description || '');
        setCategory(template.category);
        setTags(template.tags?.join(', ') || '');
        setPreviewImageUrl(template.previewImageUrl);
        setPreviewMediaType(template.previewMediaType || 'image');
      } catch (error) {
        console.error(error);
        toast.error('Failed to load template details for editing.');
        navigate('/templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateDetails();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !category) {
      return toast.error('Please enter Title and Category.');
    }

    setSaving(true);
    try {
      await api.put(`/admin/templates/${id}`, {
        title,
        description,
        category,
        tags,
      });
      toast.success('Template details updated successfully!');
      navigate('/templates');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'Failed to save updates.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/templates"
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Edit Template Metadata</h2>
          <p className="text-xs text-slate-500">Modify information for the creative asset</p>
        </div>
      </div>

      {/* Main Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 shadow-sm max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Editable inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Template Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Vintage Cinematic Video LUTs"
                className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                <option value="alight-motion">Alight Motion</option>
                <option value="kinemaster">Kinemaster</option>
                <option value="capcut">CapCut</option>
                <option value="lightroom">Lightroom</option>
                <option value="other">Other App / Asset</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Tags (comma-separated list)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="luts, cinematic, adobe premiere, color grade"
                className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Right Column: Files & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Description & Inclusion
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what is included in this template and how to use it..."
                rows="4"
                className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Readonly Display of Active Image/Video Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Active Preview Media
              </label>
              <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                {previewMediaType === 'video' ? (
                  <video
                    src={previewImageUrl}
                    className="w-16 h-16 object-cover rounded-lg border border-slate-300 bg-black"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={previewImageUrl}
                    alt={title}
                    className="w-16 h-16 object-cover rounded-lg border border-slate-300"
                  />
                )}
                <div className="text-left">
                  <p className="text-xs font-medium text-slate-700">File is live in public directory</p>
                  <p className="text-[10px] text-slate-500">Media replacement requires deleting and re-uploading.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-200 pt-6 flex items-center justify-end space-x-4">
          <Link
            to="/templates"
            className="px-5 py-3 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm font-semibold cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 px-6 text-sm font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateEdit;
