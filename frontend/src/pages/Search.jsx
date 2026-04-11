import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { jobService } from '../services'
import JobCard from '../components/hirer/JobCard'
import WorkerCard from '../components/worker/WorkerCard'
import { motion, AnimatePresence } from 'framer-motion'
import debounce from 'lodash/debounce'
import toast from 'react-hot-toast'
import { JOB_CATEGORIES, SKILL_LIST, SORT_OPTIONS, DISTANCE_OPTIONS } from '../utils/constants'
import useGeolocation from '../hooks/useGeolocation'
import axios from 'axios'

// ── Platform-defined option sets (no freeform) ──
const WAGE_MAX = 5000
const RATING_OPTIONS = [1, 2, 3, 4, 5]

const SkeletonCard = () => (
  <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-5 animate-pulse">
    <div className="flex gap-3 mb-4">
      <div className="w-12 h-12 rounded-2xl bg-[#e8dfd0] dark:bg-white/10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#e8dfd0] dark:bg-white/10 rounded-lg w-3/4" />
        <div className="h-3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
      <div className="h-3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg w-4/5" />
    </div>
  </div>
)

const ChipGroup = ({ options, selected, onToggle, multi = false, label: groupLabel }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => {
      const val = typeof opt === 'string' ? opt : opt.value
      const lbl = typeof opt === 'string' ? opt : opt.label
      const active = multi ? (selected || []).includes(val) : selected === val
      return (
        <button key={val} type="button" onClick={() => onToggle(val)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
            active
              ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] border-transparent text-white shadow-sm'
              : 'bg-[#faf7f2] dark:bg-white/[0.04] border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/50 hover:text-[#c8933a]'
          }`}>
          {lbl}
        </button>
      )
    })}
  </div>
)

const RangeSlider = ({ min, max, value, onChange, prefix = '₹', label }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs font-semibold text-[#9c8a78]">{prefix}{min.toLocaleString()}</span>
      <span className="text-xs font-bold text-[#c8933a]">{prefix}{value.toLocaleString()}</span>
      <span className="text-xs font-semibold text-[#9c8a78]">{prefix}{max.toLocaleString()}</span>
    </div>
    <input type="range" min={min} max={max} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, #c8933a ${(value / max) * 100}%, #e8dfd0 ${(value / max) * 100}%)`
      }} />
  </div>
)

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1.5">
    {RATING_OPTIONS.map(star => (
      <button key={star} type="button" onClick={() => onChange(star === value ? 0 : star)}
        className="transition-all duration-200 hover:scale-110">
        <svg className={`w-6 h-6 ${star <= value ? 'text-[#c8933a]' : 'text-[#e8dfd0] dark:text-white/10'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ))}
    {value > 0 && (
      <span className="text-xs font-semibold text-[#9c8a78] self-center ml-1">{value}★ & above</span>
    )}
  </div>
)

const Search = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const geo = useGeolocation()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [skillSuggestions, setSkillSuggestions] = useState([])

  // Mode-aware search type
  const searchType = !user
    ? (searchParams.get('type') || 'jobs')
    : user.activeMode === 'worker' ? 'jobs' : 'workers'

  const modeLabel = !user
    ? null
    : user.activeMode === 'worker' ? 'Jobs near you' : 'Available workers'

  const [filters, setFilters] = useState({
    keyword: searchParams.get('q') || '',
    categories: searchParams.get('category') ? [searchParams.get('category')] : [],
    skills: [],
    distance: Number(searchParams.get('distance') || 25),
    maxWage: WAGE_MAX,
    minRating: 0,
    availability: 'all',
    sort: searchParams.get('sortBy') || 'distance',
  })

  const [tabType, setTabType] = useState(searchType) // only used when unauthenticated

  const activeType = user ? searchType : tabType

  useEffect(() => {
    if (geo.latitude && geo.longitude) fetchResults(filters)
  }, [geo.latitude, geo.longitude])

  useEffect(() => {
    debouncedFetch(filters)
    return () => debouncedFetch.cancel()
  }, [filters, activeType])

  useEffect(() => {
    if (skillInput.trim().length < 1) { setSkillSuggestions([]); return }
    const q = skillInput.toLowerCase()
    setSkillSuggestions(
      (SKILL_LIST || []).filter(s => s.toLowerCase().includes(q) && !filters.skills.includes(s)).slice(0, 6)
    )
  }, [skillInput, filters.skills])

  const fetchResults = useCallback(async (f, pg = 1) => {
    try {
      setLoading(true); setError(null)
      const params = {}
      if (f.keyword) params.q = f.keyword
      if (f.categories?.length) params.category = f.categories[0]
      if (f.distance) params.radiusKm = f.distance
      if (f.sort) params.sortBy = f.sort
      if (geo.latitude) params.latitude = String(geo.latitude)
      if (geo.longitude) params.longitude = String(geo.longitude)
      if (f.maxWage < WAGE_MAX) params.maxBudget = f.maxWage
      params.page = pg
      params.limit = 9

      let data = []
      if (activeType === 'jobs') {
        const res = await jobService.getJobs(params)
        data = res?.jobs || res?.data || []
      } else {
        if (f.skills?.length) params.skills = f.skills.join(',')
        if (f.minRating > 0) params.minRating = f.minRating
        if (f.availability === 'available') params.available = true
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/workers`, { params })
        const d = res.data
        data = d?.data?.workers || d?.workers || (Array.isArray(d) ? d : [])
      }

      if (pg === 1) setResults(data)
      else setResults(prev => [...prev, ...data])
      setHasMore(data.length === 9)

      // Sync URL
      const urlParams = {}
      if (f.keyword) urlParams.q = f.keyword
      if (f.categories?.[0]) urlParams.category = f.categories[0]
      if (f.sort) urlParams.sortBy = f.sort
      if (geo.latitude) urlParams.latitude = String(geo.latitude)
      if (geo.longitude) urlParams.longitude = String(geo.longitude)
      setSearchParams(urlParams)
    } catch (err) {
      setError(err?.message || 'Failed to load results')
      if (pg === 1) setResults([])
    } finally { setLoading(false) }
  }, [activeType, geo.latitude, geo.longitude, setSearchParams])

  const debouncedFetch = useCallback(debounce((f) => { setPage(1); fetchResults(f, 1) }, 350), [fetchResults])

  const set = (key, val) => setFilters(p => ({ ...p, [key]: val }))

  const toggleCategory = (val) => {
    setFilters(p => ({
      ...p,
      categories: p.categories.includes(val) ? p.categories.filter(c => c !== val) : [...p.categories, val]
    }))
  }

  const addSkill = (skill) => {
    if (!filters.skills.includes(skill)) set('skills', [...filters.skills, skill])
    setSkillInput(''); setSkillSuggestions([])
  }

  const removeSkill = (skill) => set('skills', filters.skills.filter(s => s !== skill))

  const clearFilters = () => {
    setFilters({ keyword: '', categories: [], skills: [], distance: 25, maxWage: WAGE_MAX, minRating: 0, availability: 'all', sort: 'distance' })
    setSkillInput('')
  }

  const handleApply = async (jobId) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }
    try {
      await jobService.applyForJob(jobId, {})
      toast.success('Applied successfully!')
      fetchResults(filters, 1)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to apply')
    }
  }

  const loadMore = () => {
    const next = page + 1; setPage(next); fetchResults(filters, next)
  }

  const activeFilterCount = [
    filters.categories.length > 0,
    filters.skills.length > 0,
    filters.distance !== 25,
    filters.maxWage < WAGE_MAX,
    filters.minRating > 0,
    filters.availability !== 'all',
  ].filter(Boolean).length

  // ── SIDEBAR ──
  const Sidebar = () => (
    <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-6 shadow-sm space-y-6">
      {/* Sort */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-3">Sort By</p>
        <ChipGroup
          options={[
            { value: 'distance', label: 'Nearest' },
            { value: 'wage', label: 'Highest Pay' },
            { value: 'rating', label: 'Best Rated' },
            { value: 'recent', label: 'Most Recent' },
          ]}
          selected={filters.sort}
          onToggle={val => set('sort', val)}
        />
      </div>

      <div className="h-px bg-[#e8dfd0] dark:bg-white/8" />

      {/* Category */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-3">Category</p>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          <button type="button" onClick={() => set('categories', [])}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
              filters.categories.length === 0
                ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] border-transparent text-white'
                : 'bg-[#faf7f2] dark:bg-white/[0.04] border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/50'
            }`}>All</button>
          {(JOB_CATEGORIES || []).map(cat => {
            const val = typeof cat === 'string' ? cat : cat.value
            const lbl = typeof cat === 'string' ? cat : cat.label
            const active = filters.categories.includes(val)
            return (
              <button key={val} type="button" onClick={() => toggleCategory(val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] border-transparent text-white shadow-sm'
                    : 'bg-[#faf7f2] dark:bg-white/[0.04] border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/50 hover:text-[#c8933a]'
                }`}>{lbl}</button>
            )
          })}
        </div>
      </div>

      <div className="h-px bg-[#e8dfd0] dark:bg-white/8" />

      {/* Distance */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-3">Distance</p>
        <div className="flex gap-2 flex-wrap">
          {[5, 10, 25, 50, 100].map(d => (
            <button key={d} type="button" onClick={() => set('distance', d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                filters.distance === d
                  ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] border-transparent text-white'
                  : 'bg-[#faf7f2] dark:bg-white/[0.04] border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/50'
              }`}>{d} km</button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#e8dfd0] dark:bg-white/8" />

      {/* Max Wage */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-3">Max Wage / Day</p>
        <RangeSlider min={0} max={WAGE_MAX} value={filters.maxWage} onChange={v => set('maxWage', v)} />
      </div>

      {/* Skills (workers search only) */}
      {activeType === 'workers' && (
        <>
          <div className="h-px bg-[#e8dfd0] dark:bg-white/8" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-3">Skills</p>
            <div className="relative">
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                placeholder="Type to search skills…"
                className="w-full rounded-xl px-3 py-2.5 text-xs font-medium bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-gray-800 dark:text-gray-200 placeholder:text-[#b8a898] outline-none focus:border-[#c8933a]/50 transition-all duration-200"
              />
              <AnimatePresence>
                {skillSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1208] border border-[#e8dfd0] dark:border-white/10 rounded-xl shadow-lg z-10 overflow-hidden"
                  >
                    {skillSuggestions.map(skill => (
                      <button key={skill} type="button" onClick={() => addSkill(skill)}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-[#faf7f2] dark:hover:bg-white/[0.06] transition-colors duration-150">
                        {skill}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {filters.skills.map(skill => (
                  <span key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-xs font-semibold text-[#9c8a78]">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-[#b8a898] hover:text-red-500 transition-colors duration-150">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-[#e8dfd0] dark:bg-white/8" />

          {/* Rating */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-3">Minimum Rating</p>
            <StarRating value={filters.minRating} onChange={v => set('minRating', v)} />
          </div>

          <div className="h-px bg-[#e8dfd0] dark:bg-white/8" />

          {/* Availability */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-3">Availability</p>
            <ChipGroup
              options={[{ value: 'all', label: 'All' }, { value: 'available', label: 'Available Now' }]}
              selected={filters.availability}
              onToggle={v => set('availability', v)}
            />
          </div>
        </>
      )}

      {activeFilterCount > 0 && (
        <button type="button" onClick={clearFilters}
          className="w-full py-2.5 rounded-2xl border border-[#e8dfd0] dark:border-white/10 text-xs font-bold text-[#9c8a78] hover:border-[#c8933a]/40 hover:text-[#c8933a] transition-all duration-200">
          Reset Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#c8933a]/15 text-[#c8933a] text-[10px]">{activeFilterCount}</span>
          )}
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              {modeLabel && (
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-1">{modeLabel}</p>
              )}
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                {activeType === 'jobs' ? 'Find Jobs' : 'Find Workers'}
              </h1>
              <p className="text-sm text-[#9c8a78] mt-0.5">
                {loading ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {/* Tab switcher — unauthenticated only */}
            {!user && (
              <div className="flex gap-1 p-1 bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/10">
                {[{ val: 'jobs', label: '💼 Jobs' }, { val: 'workers', label: '👷 Workers' }].map(({ val, label }) => (
                  <button key={val} onClick={() => setTabType(val)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                      tabType === val
                        ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white shadow-sm'
                        : 'text-[#9c8a78] hover:text-[#c8933a]'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(p => !p)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/10 text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#c8933a] text-white text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Keyword search */}
          <div className="relative max-w-xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#b8a898]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={filters.keyword}
              onChange={e => set('keyword', e.target.value)}
              placeholder={activeType === 'jobs' ? 'Search jobs by title or description…' : 'Search workers by name…'}
              className="w-full rounded-2xl bg-white dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/10 pl-11 pr-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 placeholder:text-[#b8a898] outline-none focus:border-[#c8933a]/60 focus:shadow-[0_0_0_3px_rgba(200,147,58,0.12)] transition-all duration-300"
            />
            {filters.keyword && (
              <button onClick={() => set('keyword', '')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b8a898] hover:text-[#c8933a] transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>

        <div className="flex gap-6">
          {/* ── SIDEBAR DESKTOP ── */}
          <div className="hidden lg:block w-72 flex-shrink-0 sticky top-24 self-start">
            <Sidebar />
          </div>

          {/* ── MOBILE SIDEBAR DRAWER ── */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                />
                <motion.div
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed right-0 top-0 bottom-0 w-80 bg-[#faf7f2] dark:bg-[#0e0d0b] z-50 overflow-y-auto p-5 lg:hidden"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-black text-gray-900 dark:text-white">Filters</h3>
                    <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-xl border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center text-[#9c8a78]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <Sidebar />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── RESULTS ── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                  <button onClick={() => fetchResults(filters, 1)} className="ml-auto underline">Retry</button>
                </motion.div>
              )}
            </AnimatePresence>

            {loading && page === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : results.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8"
              >
                <span className="text-5xl block mb-3">🔍</span>
                <p className="font-bold text-gray-700 dark:text-gray-300 text-lg mb-1">No results found</p>
                <p className="text-sm text-[#9c8a78] mb-5">Try adjusting your filters or broadening your search.</p>
                <button onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white text-sm font-bold shadow-sm hover:shadow-md transition-all duration-300">
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {results.map((item, i) => (
                    <motion.div
                      key={item._id || i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.4 }}
                    >
                      {activeType === 'jobs'
                        ? <JobCard job={item} onApply={handleApply} />
                        : <WorkerCard worker={item} />
                      }
                    </motion.div>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={loadMore}
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-[#e8dfd0] dark:border-white/10 bg-white dark:bg-white/[0.04] text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-[#c8933a]/50 hover:text-[#c8933a] transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <>Load more<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg></>
                      )}
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search