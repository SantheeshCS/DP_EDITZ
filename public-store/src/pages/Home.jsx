import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, Download, Eye, Zap, Sparkles, PlayCircle } from 'lucide-react';
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
    <div className="relative min-h-screen bg-white overflow-hidden space-y-24">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full pointer-events-none z-0 blur-3xl"></div>
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] bg-purple-50 rounded-full pointer-events-none z-0 blur-3xl"></div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 text-center space-y-8">
        {/* Glow Tagline */}
        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Elite Visual Templates Directory</span>
        </div>

        {/* Catchy Header */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none">
          Elevate Your Productions with{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Free Templates
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Stunning video assets, cinematic color LUTs, and digital poster assets. Download instantly for your next creative project. No accounts, no subscriptions.
        </p>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-4 top-4.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search cinematic LUTs, poster templates, motion files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl py-4 pl-12 pr-32 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8 text-left">
          <div className="bg-white border border-slate-100 shadow-sm p-5 rounded-2xl flex items-start space-x-3.5">
            <Zap className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">100% Free Access</h4>
              <p className="text-xs text-slate-500 mt-1">Download any template from the directory at zero cost.</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm p-5 rounded-2xl flex items-start space-x-3.5">
            <Zap className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">No Signup Required</h4>
              <p className="text-xs text-slate-500 mt-1">Get immediate access to files without passwords or email signup forms.</p>
            </div>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm p-5 rounded-2xl flex items-start space-x-3.5">
            <Zap className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">Direct Secure Links</h4>
              <p className="text-xs text-slate-500 mt-1">Fast downloads served straight from our secure cloud storage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Templates Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Releases</h2>
            <p className="text-xs text-slate-500">Hand-curated digital creative layouts live on directory</p>
          </div>
          <Link
            to="/browse"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center space-x-1"
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
              <div key={i} className="bg-white border border-slate-100 rounded-3xl overflow-hidden p-4 space-y-4 shadow-sm">
                <div className="bg-slate-100 animate-pulse h-48 rounded-2xl"></div>
                <div className="space-y-2">
                  <div className="bg-slate-100 animate-pulse h-4 w-[60%] rounded"></div>
                  <div className="bg-slate-100 animate-pulse h-3 w-[40%] rounded"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="bg-slate-100 animate-pulse h-8 w-20 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))
          ) : templates.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
              <Download className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">No templates published on the directory yet.</p>
              <p className="text-slate-400 text-xs mt-1">Check back later or check admin settings.</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template._id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl overflow-hidden p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  {/* Thumbnail / Video */}
                  <div className="relative group rounded-2xl overflow-hidden bg-slate-100 aspect-[16/9] border border-slate-100">
                    {template.previewMediaType === 'video' ? (
                      <>
                        <video
                          src={template.previewImageUrl}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => e.target.play()}
                          onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                        />
                        <div className="absolute top-2 right-2 text-white/80 drop-shadow-md">
                          <PlayCircle className="w-5 h-5" />
                        </div>
                      </>
                    ) : (
                      <img
                        src={template.previewImageUrl}
                        alt={template.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
                       {/* Subtle overlay */}
                    </div>
                    {/* Category overlay */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[10px] text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {template.category}
                    </span>
                  </div>

                  {/* Title and details */}
                  <div className="mt-4 space-y-1.5">
                    <h3 className="text-base font-bold text-slate-800 line-clamp-1">
                      {template.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                      {template.description || 'Professional design assets curated for digital visual artists.'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between">
                  <div className="flex flex-col text-slate-500 text-xs">
                     <span>{template.downloadCount || 0} Downloads</span>
                  </div>
                  <Link
                    to={`/templates/${template._id}`}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
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
