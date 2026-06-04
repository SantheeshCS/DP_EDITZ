import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, Download, Eye, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Read search string from query URL if present
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

  const categories = [
    { name: 'All Templates', value: 'all' },
    { name: 'Editing Templates', value: 'editing' },
    { name: 'Poster Designs', value: 'poster' },
    { name: 'Social Media', value: 'social-media' },
    { name: 'Other Files', value: 'other' },
  ];

  useEffect(() => {
    fetchTemplates();
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
    
    // Update search query parameters
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

  // Client-side search and category filtering
  const filteredTemplates = templates.filter((template) => {
    const query = search.toLowerCase();
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesTitle = template.title.toLowerCase().includes(query);
    const matchesTags = template.tags?.some((t) => t.toLowerCase().includes(query));
    
    return matchesCategory && (matchesTitle || matchesTags);
  });

  return (
    <div className="relative min-h-screen bg-slate-50 px-6 py-12">
      {/* Decorative Glow */}
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full pointer-events-none z-0 blur-3xl"></div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Header Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Directory Catalog
          </h1>
          <p className="text-sm text-slate-500">
            Browse our verified inventory of digital mockups, design elements, and assets.
          </p>
        </div>

        {/* Search input and categories wrapper */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 order-2 lg:order-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:max-w-xs order-1 lg:order-2">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Templates Grid catalog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Shimmer cards
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
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
              <Download className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">No assets match your search terms.</p>
              <p className="text-slate-400 text-xs mt-1">Try selecting another category or typing another word.</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template._id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl overflow-hidden p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all animate-fade-in"
              >
                <div>
                  {/* Thumbnail */}
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
                    <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
                      {/* Subtle overlay */}
                    </div>
                    {/* Category Overlay */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[10px] text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {template.category}
                    </span>
                  </div>

                  {/* Title and tags */}
                  <div className="mt-4 space-y-2">
                    <h3 className="text-base font-bold text-slate-800 line-clamp-1">
                      {template.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                      {template.description || 'Professional design assets curated for digital visual artists.'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {template.tags?.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[9px] bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full capitalize font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-between">
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
      </div>
    </div>
  );
};

export default Browse;
