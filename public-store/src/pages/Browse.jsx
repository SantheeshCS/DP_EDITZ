import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, Download, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

  const categories = [
    { name: 'All', value: 'all' },
    { name: 'Alight Motion', value: 'alight-motion' },
    { name: 'Kinemaster', value: 'kinemaster' },
    { name: 'CapCut', value: 'capcut' },
    { name: 'Lightroom', value: 'lightroom' },
    { name: 'Other', value: 'other' },
  ];

  useEffect(() => {
    fetchTemplates();

    const socketUrl = (import.meta.env.VITE_API_URL || '/').replace(/\/api$/, '') || '/';
    const socket = io(socketUrl, { path: '/socket.io' });

    socket.on('template_added', (newTemplate) => {
      setTemplates((prev) => [newTemplate, ...prev]);
    });

    socket.on('template_updated', (updatedTemplate) => {
      setTemplates((prev) =>
        prev.map((t) => (t._id === updatedTemplate._id ? updatedTemplate : t))
      );
    });

    socket.on('template_deleted', ({ id }) => {
      setTemplates((prev) => prev.filter((t) => t._id !== id));
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load store templates.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryValue) => {
    setSelectedCategory(categoryValue);
    
    const params = new URLSearchParams(searchParams);
    if (categoryValue === 'all') {
      params.delete('category');
    } else {
      params.set('category', categoryValue);
    }
    setSearchParams(params);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    
    const params = new URLSearchParams(searchParams);
    if (!val) {
      params.delete('search');
    } else {
      params.set('search', val);
    }
    setSearchParams(params);
  };

  const filteredTemplates = templates.filter((template) => {
    const query = search.toLowerCase();
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesTitle = template.title.toLowerCase().includes(query);
    const matchesTags = template.tags?.some((t) => t.toLowerCase().includes(query));
    
    return matchesCategory && (matchesTitle || matchesTags);
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712] transition-colors pb-24">
      {/* Header */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#030712]">
        <div className="max-w-7xl mx-auto px-6 py-16 space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Directory Catalog
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
            Browse our verified inventory of digital mockups, design elements, and video assets.
          </p>

          <div className="max-w-xl pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search assets by name or tag..."
                value={search}
                onChange={handleSearchChange}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-slate-900 dark:focus:border-slate-100 rounded-lg py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100 mb-4">
              Categories
            </h3>
            <div className="flex flex-col space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategorySelect(cat.value)}
                  className={`text-left text-sm py-1 transition-colors ${
                    selectedCategory === cat.value
                      ? 'font-bold text-slate-900 dark:text-white'
                      : 'font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {filteredTemplates.length} results
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
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
            ) : filteredTemplates.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 dark:text-slate-400 text-sm">
                No assets match your filters. Try selecting another category or typing another word.
              </div>
            ) : (
              filteredTemplates.map((template) => (
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
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4">
                      {template.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {template.tags?.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs text-slate-500 dark:text-slate-400 capitalize"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
