// Purpose: Renders job search with filters, debounced querying, and apply actions.
// frontend/src/pages/Search.jsx
// Job search page with filters, debounced search, and results

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services';
import JobCard from '../components/hirer/JobCard';
import { motion } from 'framer-motion';
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';
import { JOB_CATEGORIES } from '../utils/constants';
import useGeolocation from '../hooks/useGeolocation';

const Search = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const geo = useGeolocation();
  const [filters, setFilters] = useState({
    keyword: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    radiusKm: searchParams.get('radiusKm') || '20',
    sortBy: searchParams.get('sortBy') || 'time',
    latitude: searchParams.get('latitude') || '',
    longitude: searchParams.get('longitude') || '',
    minBudget: searchParams.get('minBudget') || '',
    maxBudget: searchParams.get('maxBudget') || ''
  });

  useEffect(() => {
    if (geo.latitude && geo.longitude) {
      setFilters((prev) => ({
        ...prev,
        latitude: prev.latitude || String(geo.latitude),
        longitude: prev.longitude || String(geo.longitude),
        location: prev.location || geo.manualLocation || ''
      }));
    }
  }, [geo.latitude, geo.longitude, geo.manualLocation]);
  
  const categories = [{ value: '', label: t('common.all') }, ...JOB_CATEGORIES];
  
  // Fetch jobs function
  const fetchJobs = useCallback(async (searchFilters) => {
    const keyword = (searchFilters.keyword || '').trim();

    // Prevent noisy API calls for empty and very short user input.
    if (keyword.length > 0 && keyword.length < 2) {
      setJobs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Prepare filters for API
      const apiFilters = {};
      if (searchFilters.keyword) apiFilters.q = searchFilters.keyword;
      if (searchFilters.category) apiFilters.category = searchFilters.category;
      if (searchFilters.location) apiFilters.location = searchFilters.location;
      if (searchFilters.radiusKm) apiFilters.radiusKm = searchFilters.radiusKm;
      if (searchFilters.sortBy) apiFilters.sortBy = searchFilters.sortBy;
      if (searchFilters.latitude) apiFilters.latitude = searchFilters.latitude;
      if (searchFilters.longitude) apiFilters.longitude = searchFilters.longitude;
      if (searchFilters.minBudget) apiFilters.minBudget = searchFilters.minBudget;
      if (searchFilters.maxBudget) apiFilters.maxBudget = searchFilters.maxBudget;
      
      const response = await jobService.getJobs(apiFilters);
      setJobs(response.jobs || []);
      
      // Update URL params
      const params = {};
      if (searchFilters.keyword) params.q = searchFilters.keyword;
      if (searchFilters.category) params.category = searchFilters.category;
      if (searchFilters.location) params.location = searchFilters.location;
      if (searchFilters.radiusKm) params.radiusKm = searchFilters.radiusKm;
      if (searchFilters.sortBy) params.sortBy = searchFilters.sortBy;
      if (searchFilters.latitude) params.latitude = searchFilters.latitude;
      if (searchFilters.longitude) params.longitude = searchFilters.longitude;
      if (searchFilters.minBudget) params.minBudget = searchFilters.minBudget;
      if (searchFilters.maxBudget) params.maxBudget = searchFilters.maxBudget;
      setSearchParams(params);
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error.message || 'Failed to fetch jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [setSearchParams]);
  
  // Debounced fetch function
  const debouncedFetch = useCallback(
    debounce((searchFilters) => {
      fetchJobs(searchFilters);
    }, 300),
    [fetchJobs]
  );
  
  useEffect(() => {
    debouncedFetch(filters);
    return () => debouncedFetch.cancel();
  }, [filters.keyword, filters.category, filters.location, filters.radiusKm, filters.sortBy, filters.latitude, filters.longitude, filters.minBudget, filters.maxBudget]);

  const handleApply = async (jobId) => {
    try {
      if (!user) {
        toast.error('Please login to apply');
        return;
      }

      await jobService.applyForJob(jobId, {});
      toast.success(t('job.applySuccess'));
      fetchJobs(filters);
    } catch (applyError) {
      toast.error(applyError || 'Unable to apply for this job');
    }
  };
  
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      location: '',
      radiusKm: '20',
      sortBy: 'time',
      latitude: geo.latitude ? String(geo.latitude) : '',
      longitude: geo.longitude ? String(geo.longitude) : '',
      minBudget: '',
      maxBudget: ''
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">{t('common.filter')}</h2>
              
              {/* Search Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('common.search')}</label>
                <input
                  type="text"
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  placeholder="Job title or description..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
                />
              </div>
              
              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('job.category')}</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Location Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t('job.location')}</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="City or area..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Radius (km)</label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={filters.radiusKm}
                  onChange={(e) => handleFilterChange('radiusKm', e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">{filters.radiusKm} km</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Sort by</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                >
                  <option value="time">Time</option>
                  <option value="distance">Distance</option>
                  <option value="salary">Salary</option>
                </select>
              </div>
              
              {/* Budget Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">{t('job.budget')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minBudget}
                    onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                    placeholder="Min"
                    className="w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                  />
                  <input
                    type="number"
                    value={filters.maxBudget}
                    onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                    placeholder="Max"
                    className="w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
              
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                {t('common.clear')}
              </button>
            </div>
          </div>
          
          {/* Results */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">{t('nav.findJobs')}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Found {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} matching your criteria
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button 
                  onClick={() => fetchJobs(filters)}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">{t('common.loading')}</p>
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job._id || job.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <JobCard job={job} onApply={handleApply} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;