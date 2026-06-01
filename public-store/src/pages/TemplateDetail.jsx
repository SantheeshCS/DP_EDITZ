import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, CreditCard, ShieldCheck, Download, Sparkles, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const TemplateDetail = () => {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    const toastId = toast.loading('Initiating Stripe Checkout Session...');

    try {
      const response = await api.post(`/checkout/${id}`);
      const { url } = response.data;
      
      toast.success('Redirecting to Stripe payment page...', { id: toastId });
      // Redirect to Stripe's secure payment gate
      window.location.href = url;
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'Failed to initialize payment session.';
      toast.error(msg, { id: toastId });
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
        <h2 className="text-2xl font-bold text-slate-300">Template Not Found</h2>
        <p className="text-slate-500 text-sm">The template file you are looking for does not exist or has been deleted by administration.</p>
        <Link to="/browse" className="inline-block bg-purple-600 text-white rounded-xl px-5 py-3 text-xs font-bold shadow-lg">
          Browse Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030712] px-6 py-12">
      {/* Decorative Glow */}
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-glow-purple rounded-full pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Back Link */}
        <div>
          <Link
            to="/browse"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Browse Catalog</span>
          </Link>
        </div>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Visual public image preview (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel rounded-3xl overflow-hidden bg-slate-950 border border-white/5 shadow-2xl">
              <img
                src={template.previewImageUrl}
                alt={template.title}
                className="w-full h-full object-contain aspect-video"
              />
            </div>
            
            {/* Template specs card */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-300">What's included in this purchase?</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Immediate High-Speed Download</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Full Commercial Usage License</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Curated High-Resolution Files</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Secure One-Time Stripe Checkout</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: checkout form & description (5 cols) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-2xl flex-1">
              {/* Category Badge & title */}
              <div className="space-y-2">
                <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                  {template.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-100 leading-tight">
                  {template.title}
                </h1>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {template.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-slate-900 text-slate-400 border border-white/5 px-3 py-0.5 rounded-full capitalize font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price Tag */}
              <div className="flex items-baseline space-x-2 border-t border-b border-white/5 py-4">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest self-center">Total Price:</span>
                <span className="text-3xl font-black text-slate-200">
                  ₹{(template.price / 100).toFixed(0)}
                </span>
                <span className="text-xs text-slate-500 font-medium">One-time payment</span>
              </div>

              {/* Description */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Description</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {template.description || 'Elevate your productions with professional curated digital files from Aesthetix. Fully customizable templates, clean layer structuring, premium elements, and immediate verification link post checkout.'}
                </p>
              </div>

              {/* Checkout Action Button */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-4 text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-xl shadow-purple-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Creating Secure Session...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Buy for ₹{(template.price / 100).toFixed(0)}</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-500 text-center flex items-center justify-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>No account needed. Instant download link ready after payment.</span>
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
