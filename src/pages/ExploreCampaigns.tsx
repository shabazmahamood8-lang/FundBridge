import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Compass, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api.js';
import { Campaign } from '../types/index.js';
import CampaignCard from '../components/common/CampaignCard.js';

export default function ExploreCampaigns() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const categories = ['all', 'Technology', 'Health', 'Education', 'Community', 'Environment', 'Art'];

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns', {
        params: {
          category: category !== 'all' ? category : undefined,
          search: search.trim() ? search.trim() : undefined,
          sort,
          page,
          limit: 9,
          onlyActive: 'true',
        },
      });

      if (res.data.success) {
        setCampaigns(res.data.campaigns || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, page]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCampaigns();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Innovations</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Explore Active Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Support verified high-impact projects. Filter by domain or search creator names and mission statements.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, creator, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span>Sort By:</span>
            </div>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:border-teal-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="top-funded">Top Funded</option>
              <option value="deadline">Ending Soonest</option>
              <option value="goal">Highest Goal</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full capitalize whitespace-nowrap transition-all cursor-pointer ${
                category.toLowerCase() === cat.toLowerCase()
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign Grid or Loading / Empty */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
              <div className="w-full aspect-video bg-slate-200 rounded-xl" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No campaigns match your filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or select another category to view more ongoing campaigns.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('all');
              setPage(1);
            }}
            className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal-700 underline cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing {campaigns.length} of {totalCount} active campaigns</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <CampaignCard key={camp._id} campaign={camp} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-100">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="text-xs font-semibold text-slate-600">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
