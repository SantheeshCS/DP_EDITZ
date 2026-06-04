import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, ShieldCheck, Download, Sparkles, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const TemplateDetail = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const fetchTemplateDetails = async () => {
      try {
        const response = await api.get(`/templates/${id}`);
        setTemplate(response.data);
      } catch (error) {
        console.error(error);
        toast.error('Could not fetch template details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateDetails();
  }, [id]);

  const handleDownload = async () => {
    setDownloadLoading(true);
    const toastId = toast.loading('Preparing secure download link...');

    try {
      const response = await api.get(`/download/${id}`);
      const { downloadUrl } = response.data;
      
      toast.success('Opening template...', { id: toastId });
      // Trigger the app link or file download
      window.location.href = downloadUrl;
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'Failed to generate download link.';
      toast.error(msg, { id: toastId });
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Template Not Found</h2>
        <p className="text-slate-500 text-sm">The template file you are looking for does not exist or has been deleted by administration.</p>
        <Link to="/browse" className="inline-block bg-indigo-600 text-white rounded-xl px-5 py-3 text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors">
          Browse Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 px-6 py-12">
      {/* Decorative Glow */}
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full pointer-events-none z-0 blur-3xl"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Back Link */}
        <div>
          <Link
            to="/browse"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse Directory</span>
          </Link>
        </div>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Visual public image/video preview (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center">
              {template.previewMediaType === 'video' ? (
                <video
                  src={template.previewImageUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-contain max-h-[500px] bg-black"
                />
              ) : (
                <img
                  src={template.previewImageUrl}
                  alt={template.title}
                  className="w-full h-full object-contain max-h-[500px]"
                />
              )}
            </div>
            
            {/* Template specs card */}
            <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-800">What's included in this download?</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-500">
                <li className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Immediate High-Speed Download</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full Usage License</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Curated High-Resolution Files</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Verified Safe Content</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: details (5 cols) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6 shadow-sm flex-1">
              {/* Category Badge & title */}
              <div className="space-y-2">
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                  {template.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {template.title}
                </h1>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {template.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-50 text-slate-500 border border-slate-200 px-3 py-0.5 rounded-full capitalize font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price Tag */}
              <div className="flex items-baseline space-x-2 border-t border-b border-slate-100 py-4">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest self-center">Access:</span>
                <span className="text-3xl font-black text-emerald-600">
                  FREE
                </span>
                <span className="text-xs text-slate-500 font-medium">No account required</span>
              </div>

              {/* Description */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Description</span>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {template.description || 'Elevate your productions with professional curated digital files from DP_TEMPLATES. Fully customizable templates, clean layer structuring, premium elements, and immediate free download.'}
                </p>
              </div>

              {/* Checkout Action Button */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleDownload}
                  disabled={downloadLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl py-4 text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {downloadLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Preparing Link...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{template.templateUrl ? "Open in App (CapCut/Alight)" : "Download Free File"}</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-500 text-center flex items-center justify-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Secure direct download from encrypted storage.</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TemplateDetail;
