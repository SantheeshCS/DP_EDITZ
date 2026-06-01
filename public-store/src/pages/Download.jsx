import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Download as DownloadIcon, ShieldCheck, Mail, AlertTriangle, Loader, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Download = () => {
  const { orderId } = useParams();
  const [status, setStatus] = useState('pending'); // 'pending' | 'paid' | 'expired'
  const [downloadUrl, setDownloadUrl] = useState('');
  const [templateTitle, setTemplateTitle] = useState('');
  const [message, setMessage] = useState('Checking transaction logs...');
  const [expiresIn, setExpiresIn] = useState(0);

  useEffect(() => {
    // Check order status initially
    checkStatus();

    // Set up polling every 5 seconds to automatically update the status
    const interval = setInterval(() => {
      if (status === 'pending') {
        checkStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, status]);

  // Countdown timer for signed URL expiration
  useEffect(() => {
    if (status === 'paid' && expiresIn > 0) {
      const timer = setInterval(() => {
        setExpiresIn((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStatus('expired');
            setMessage('Your download link has expired. Please contact support.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, expiresIn]);

  const checkStatus = async () => {
    try {
      const response = await api.get(`/download/${orderId}`);
      const data = response.data;

      setStatus(data.status);
      
      if (data.status === 'paid') {
        setDownloadUrl(data.signedDownloadUrl);
        setTemplateTitle(data.templateTitle);
        setExpiresIn(data.expiresInSeconds || 900);
        setMessage('');
      } else if (data.status === 'expired') {
        setMessage(data.message || 'Your download link has expired.');
      } else if (data.status === 'pending') {
        setMessage(data.message || 'Confirming payment... (auto-refresh every 5 seconds)');
      }
    } catch (error) {
      console.error('Download Page Fetch Error:', error);
      setStatus('expired');
      setMessage('Failed to verify order details. Ensure you have the correct order reference.');
    }
  };

  const handleDownloadClick = () => {
    if (downloadUrl) {
      // Expose and download file only on direct user interaction
      window.location.href = downloadUrl;
      toast.success('Your download has started.');
    } else {
      toast.error('Download link not active.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen bg-[#030712] px-6 py-16 flex items-center justify-center">
      {/* Decorative Glow */}
      <div className="absolute top-[30%] left-[-10%] w-[50%] h-[50%] bg-glow-purple rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-glow-blue rounded-full pointer-events-none z-0"></div>

      <div className="max-w-xl w-full relative z-10">
        <div className="glass-panel p-10 rounded-3xl text-center space-y-8 shadow-2xl">
          
          {/* Status Header */}
          <div className="flex flex-col items-center space-y-3">
            {status === 'pending' && (
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
                <Loader className="w-8 h-8 animate-spin" />
              </div>
            )}
            {status === 'paid' && (
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8 animate-pulse-subtle" />
              </div>
            )}
            {status === 'expired' && (
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
            )}
            
            <h2 className="text-2xl font-black text-slate-100">
              {status === 'pending' && 'Awaiting Payment Verify'}
              {status === 'paid' && 'Payment Completed!'}
              {status === 'expired' && 'Download Expired'}
            </h2>
          </div>

          {/* Core Body Container */}
          <div className="space-y-4">
            {status === 'pending' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full animate-[shimmer_2s_infinite] w-[40%] rounded-full"></div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Stripe completes processing usually within a few seconds. Do not close this browser page.
                </p>
              </div>
            )}

            {status === 'paid' && (
              <div className="space-y-6">
                <div className="bg-[#0b0f19] border border-white/5 p-5 rounded-2xl text-left space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Purchased Asset</span>
                  <p className="text-sm font-bold text-slate-200 line-clamp-2">{templateTitle}</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleDownloadClick}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl py-4 text-sm font-black flex items-center justify-center space-x-2 transition-all shadow-xl shadow-purple-600/20 active:scale-95 cursor-pointer"
                  >
                    <DownloadIcon className="w-5 h-5" />
                    <span>Download Your Template File</span>
                  </button>

                  <p className="text-xs text-purple-400 font-semibold">
                    Link expires in: <span className="font-mono">{formatTime(expiresIn)}</span> minutes
                  </p>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl text-left flex items-start space-x-2.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    This signed URL is valid for 15 minutes to secure and protect digital asset rights. If you face any issues, please check support options.
                  </p>
                </div>
              </div>
            )}

            {status === 'expired' && (
              <div className="space-y-6">
                <div className="bg-rose-500/5 border border-rose-500/10 p-5 rounded-2xl text-left space-y-2">
                  <h4 className="text-xs font-bold text-rose-400">Security Limit Exceeded</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Signed download tokens are valid for 15 minutes post successful purchase. If your download has expired, please request assistance from support.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="mailto:support@aesthetix.com"
                    className="w-full sm:w-auto bg-[#0b0f19] border border-white/5 text-slate-300 hover:text-slate-100 rounded-xl px-5 py-3 text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>support@aesthetix.com</span>
                  </a>
                  <Link
                    to="/browse"
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-5 py-3 text-xs font-bold flex items-center justify-center transition-colors shadow-lg"
                  >
                    Return to Catalog
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Download;
