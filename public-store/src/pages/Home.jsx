import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, ShoppingBag, Eye, Zap, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestTemplates = async () => {
      try {
        const response = await api.get('/templates');
        // slice the latest 6
        setTemplates(response.data.slice(0, 6));
      } catch (error) {
        console.error('Fetch Latest Templates Error:', error);
        toast.error('Could not load featured templates.');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTemplates();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030712] overflow-hidden space-y-24">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-glow-purple rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] bg-glow-blue rounded-full pointer-events-none z-0"></div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 text-center space-y-8">
        {/* Glow Tagline */}
        <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Elite Visual Templates Marketplace</span>
        </div>

        {/* Catchy Header */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight sm:leading-none">
          Elevate Your Productions with{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Premium Templates
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Stunning video assets, cinematic color LUTs, and digital poster assets. Pay instantly via Stripe Checkout, download immediately. No accounts, no subscriptions.
        </p>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-4 top-4.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search cinematic LUTs, poster templates, motion files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0f19] border border-white/5 focus:border-purple-500/50 rounded-2xl py-4.5 pl-12 pr-32 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-colors shadow-2xl"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8 text-left">
          <div className="glass-panel p-5 rounded-2xl flex items-start space-x-3.5">
            <Zap className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-200">No Signup Required</h4>
              <p className="text-xs text-slate-500 mt-1">Buy and download instantly without passwords or email signup forms.</p>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl flex items-start space-x-3.5">
            <Zap className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-200">Stripe Secure Checkout</h4>
              <p className="text-xs text-slate-500 mt-1">Encrypted cards or wallets processing directly through Stripe gates.</p>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl flex items-start space-x-3.5">
            <Zap className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-200">Private Signed Links</h4>
              <p className="text-xs text-slate-500 mt-1">15-minute download links sent instantly post-checkout to block piracy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Templates Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-200">Featured Releases</h2>
            <p className="text-xs text-slate-500">Hand-curated digital creative layouts live on storefront</p>
          </div>
          <Link
            to="/browse"
            className="text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
          >
            <span>View Catalog</span>
            <span>→</span>
          </Link>
        </div>

        {/* Shimmer loading list or Product list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Shimmer Cards
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-3xl overflow-hidden p-4 space-y-4">
                <div className="shimmer-bg h-48 rounded-2xl"></div>
                <div className="space-y-2">
                  <div className="shimmer-bg h-4 w-[60%] rounded"></div>
                  <div className="shimmer-bg h-3 w-[40%] rounded"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="shimmer-bg h-4 w-12 rounded"></div>
                    <div className="shimmer-bg h-8 w-20 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))
          ) : templates.length === 0 ? (
            <div className="col-span-full text-center py-20 glass-panel rounded-3xl border-dashed">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">No templates published on the market yet.</p>
              <p className="text-slate-600 text-xs mt-1">Check back later or check admin settings.</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template._id}
                className="glass-panel glass-panel-hover rounded-3xl overflow-hidden p-4 flex flex-col justify-between shadow-2xl"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative group rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] border border-white/5">
                    <img
                      src={template.previewImageUrl}
                      alt={template.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <Link
                        to={`/templates/${template._id}`}
                        className="bg-white text-slate-900 rounded-xl px-4 py-2 text-xs font-bold flex items-center space-x-1 hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </div>
                    {/* Category overlay */}
                    <span className="absolute top-3 left-3 bg-[#030712]/80 backdrop-blur-md text-[10px] text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {template.category}
                    </span>
                  </div>

                  {/* Title and details */}
                  <div className="mt-4 space-y-1.5">
                    <h3 className="text-base font-bold text-slate-200 line-clamp-1">
                      {template.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                      {template.description || 'Professional design assets curated for digital visual artists.'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/5 mt-4 pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Price</span>
                    <span className="text-lg font-black text-slate-200">
                      ₹{(template.price / 100).toFixed(0)}
                    </span>
                  </div>
                  <Link
                    to={`/templates/${template._id}`}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-600/10 active:scale-95"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
