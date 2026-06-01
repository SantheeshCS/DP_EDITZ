import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Upload, Loader, Image as ImageIcon, FileArchive } from 'lucide-react';
import toast from 'react-hot-toast';

const TemplateNew = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('editing');
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState('');
  
  const [previewImage, setPreviewImage] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [previewName, setPreviewName] = useState('');
  const [fileName, setFileName] = useState('');

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePreviewChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewImage(file);
      setPreviewName(file.name);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTemplateFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !category || !price) {
      return toast.error('Please enter Title, Category, and Price.');
    }
    if (!previewImage) {
      return toast.error('Please upload a watermarked Preview Image.');
    }
    if (!templateFile) {
      return toast.error('Please upload the actual digital Template File.');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price); // decimal Rupees (e.g. 99.50)
    formData.append('tags', tags);
    formData.append('previewImage', previewImage);
    formData.append('templateFile', templateFile);

    setLoading(true);
    // Create toast ID to manage uploading text
    const toastId = toast.loading('Uploading files to Supabase Storage and saving metadata...');

    try {
      await api.post('/admin/templates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Template published successfully!', { id: toastId });
      navigate('/templates');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'Failed to publish template files.';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/templates"
          className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Upload New Template</h2>
          <p className="text-xs text-slate-400">Publish a new creative asset to the marketplace catalog</p>
        </div>
      </div>

      {/* Main Upload Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Template Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Vintage Cinematic Video LUTs"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="editing">Editing Template</option>
                <option value="poster">Poster Design</option>
                <option value="social-media">Social Media Asset</option>
                <option value="other">Other Creative File</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Price (in ₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 199.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tags (comma-separated list)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="luts, cinematic, adobe premiere, color grade"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Right Column: Files & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Description & Inclusion
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what is included in this template and how to use it..."
                rows="4"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Preview Image File Drop */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Public Preview Image * (watermarked JPG/PNG)
              </label>
              <div className="relative border border-dashed border-slate-800 rounded-xl bg-slate-950 hover:bg-slate-950/50 transition-colors py-4 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-slate-300 truncate max-w-[200px]">
                      {previewName || 'Select watermarked preview'}
                    </p>
                    <p className="text-[10px] text-slate-500">Supports JPG, PNG up to 10MB</p>
                  </div>
                </div>
                <label className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-colors">
                  Browse
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePreviewChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Template Zip File Drop */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Purchasable Template File * (ZIP, PSD, PDF, etc.)
              </label>
              <div className="relative border border-dashed border-slate-800 rounded-xl bg-slate-950 hover:bg-slate-950/50 transition-colors py-4 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400">
                    <FileArchive className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-slate-300 truncate max-w-[200px]">
                      {fileName || 'Select downloadable package'}
                    </p>
                    <p className="text-[10px] text-slate-500">Private Bucket, supports up to 100MB</p>
                  </div>
                </div>
                <label className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-colors">
                  Browse
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="border-t border-slate-800 pt-6 flex items-center justify-end space-x-4">
          <Link
            to="/templates"
            className="px-5 py-3 border border-slate-800 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors text-sm font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 px-6 text-sm font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/10"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Publish Template</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateNew;
