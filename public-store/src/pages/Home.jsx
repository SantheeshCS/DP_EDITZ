import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, Download, ArrowRight, PlayCircle } from 'lucide-react';
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
      toast.error('Please enter a search term first.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712] transition-colors">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-10">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Curated digital assets for visual artists.
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
            Stunning video assets, cinematic color LUTs, and digital poster templates. Download instantly. No subscriptions required.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search cinematic LUTs, poster templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-slate-900 dark:focus:border-slate-100 rounded-lg py-4 pl-12 pr-32 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-md px-5 py-2 text-sm font-semibold transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-slate-200 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">100% Free Access</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Download any template from the directory at zero cost.</p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Signup Required</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Get immediate access without passwords or forms.</p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Direct Secure Links</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Fast downloads straight from secure cloud storage.</p>
          </div>
        </div>
      </section>

      {/* Featured Templates Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Latest Additions</h2>
          <Link
            to="/browse"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="bg-slate-100 dark:bg-slate-900 animate-pulse aspect-[16/10] rounded-lg"></div>
                <div className="space-y-2">
                  <div className="bg-slate-100 dark:bg-slate-900 animate-pulse h-5 w-3/4 rounded"></div>
                  <div className="bg-slate-100 dark:bg-slate-900 animate-pulse h-4 w-1/2 rounded"></div>
                </div>
              </div>
            ))
          ) : templates.length === 0 ? (
            <div className="col-span-full py-12 text-slate-500 dark:text-slate-400 text-sm">
              No templates published on the directory yet.
            </div>
          ) : (
            templates.map((template) => (
              <Link
                key={template._id}
                to={`/templates/${template._id}`}
                className="group flex flex-col space-y-4"
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-900 aspect-[16/10] rounded-lg border border-slate-200 dark:border-slate-800">
                  {template.previewMediaType === 'video' ? (
                    <>
                      <video
                        src={template.previewImageUrl}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.target.play()}
                        onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                      />
                      <div className="absolute top-3 right-3 text-white/90 drop-shadow-md">
                        <PlayCircle className="w-5 h-5" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={template.previewImageUrl}
                      alt={template.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-[10px] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-mono uppercase tracking-wide">
                    {template.category}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4">
                    {template.title}
                  </h3>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 space-x-2">
                    <span>{template.downloadCount || 0} Downloads</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
