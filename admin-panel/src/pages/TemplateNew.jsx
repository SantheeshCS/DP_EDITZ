import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Upload, Loader, FileVideo, FileArchive } from 'lucide-react';
import toast from 'react-hot-toast';

const TemplateNew = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('alight-motion');
  const [tags, setTags] = useState('');
  
  const [previewMedia, setPreviewMedia] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [previewName, setPreviewName] = useState('');
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePreviewChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewMedia(file);
      setPreviewName(file.name);
      
      const isVid = file.type.startsWith('video/');
      setIsVideo(isVid);
      
      // Create local URL for preview
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
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

    if (!title || !category) {
      return toast.error('Please enter Title and Category.');
    }
    if (!previewMedia) {
      return toast.error('Please upload a Preview Media (Video or Image).');
    }
    if (!templateFile) {
      return toast.error('Please upload a Template File.');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('previewMedia', previewMedia);
    if (templateFile) formData.append('templateFile', templateFile);

    setLoading(true);
    const toastId = toast.loading('Uploading files to storage and saving metadata...');

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
          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Upload New Template</h2>
          <p className="text-xs text-slate-500">Publish a new free template to the directory</p>
        </div>
      </div>

      {/* Main Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 shadow-sm max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Metadata */}
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

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Description & Inclusion
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what is included in this template and how to use it..."
                rows="5"
                className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Right Column: Files & Description */}
          <div className="space-y-4">
            {/* Preview Media File Drop */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Public Preview Media * (Video or Image)
              </label>
              <div className="relative border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors py-6 px-4 flex flex-col items-center justify-center text-center space-y-3">
                {previewUrl ? (
                  <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-200 bg-black flex items-center justify-center">
                    {isVideo ? (
                      <video src={previewUrl} controls className="max-h-full max-w-full" />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="object-contain h-full w-full" />
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-indigo-50 rounded-full text-indigo-500">
                    <FileVideo className="w-6 h-6" />
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-slate-700 truncate px-4">
                    {previewName || 'Select video or image preview'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Supports MP4, WebM, JPG, PNG up to 100MB</p>
                </div>
                <label className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">
                  Browse Files
                  <input
                    type="file"
                    accept="video/*,image/*"
                    onChange={handlePreviewChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Template File Drop */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Downloadable Template File * (ZIP, PSD, etc.)
              </label>
              <div className="relative border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors py-4 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600">
                    <FileArchive className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-slate-700 truncate max-w-[200px]">
                      {fileName || 'Select downloadable package'}
                    </p>
                    <p className="text-[10px] text-slate-500">Private Bucket, supports up to 500MB</p>
                  </div>
                </div>
                <label className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">
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
        <div className="border-t border-slate-200 pt-6 flex items-center justify-end space-x-4">
          <Link
            to="/templates"
            className="px-5 py-3 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm font-semibold cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 px-6 text-sm font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
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
