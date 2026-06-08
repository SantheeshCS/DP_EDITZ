import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, ShieldCheck, Download, Loader, PlayCircle } from 'lucide-react';
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Asset Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">The file you are looking for does not exist or has been removed.</p>
        <Link to="/browse" className="inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md px-5 py-3 text-sm font-semibold transition-colors">
          Browse Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712] transition-colors pb-24">
      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-8">
        
        {/* Back Link */}
        <div>
          <Link
            to="/browse"
            className="inline-flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Directory</span>
          </Link>
        </div>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Visual preview (7 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              {template.previewMediaType === 'video' ? (
                <video
                  src={template.previewImageUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-auto object-contain max-h-[600px] bg-slate-950"
                />
              ) : (
                <img
                  src={template.previewImageUrl}
                  alt={template.title}
                  className="w-full h-auto object-contain max-h-[600px]"
                />
              )}
            </div>
            
            {/* Specs */}
            <div className="border border-slate-200 dark:border-slate-800 p-6 rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Technical Details</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Immediate High-Speed Download</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Full Commercial Usage License</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>Verified Safe Source Files</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Details (5 cols) */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="sticky top-24 border border-slate-200 dark:border-slate-800 p-8 rounded-lg space-y-8">
              
              {/* Header Info */}
              <div className="space-y-4">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded font-mono text-[10px] uppercase tracking-wide">
                  {template.category}
                </span>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {template.title}
                </h1>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {template.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md capitalize bg-slate-50 dark:bg-slate-900"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  Free
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">/ Unlimited Use</span>
              </div>

              {/* Action */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={downloadLoading}
                  className="w-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-md py-4 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {downloadLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Generating link...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{template.templateUrl ? "Open in Editor" : "Download File"}</span>
                    </>
                  )}
                </button>
                <div className="flex justify-center text-xs text-slate-500 dark:text-slate-400 pt-2">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Secure download</span>
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Overview</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {template.description || 'Professional design asset curated for digital visual artists. Clean layer structure and high resolution source files.'}
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
