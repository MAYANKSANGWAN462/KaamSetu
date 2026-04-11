import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import WorkerCard from '../components/worker/WorkerCard'
import { JOB_CATEGORIES } from '../utils/constants'
import useGeolocation from '../hooks/useGeolocation'
import { motion, AnimatePresence } from 'framer-motion'

const stagger = (i, base = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: base + i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }
})

const CATEGORY_ICONS = {
  Construction: '🏗️', Plumbing: '🔧', Electrical: '⚡', Carpentry: '🪚',
  Painting: '🖌️', Cleaning: '🧹', Driving: '🚗', Delivery: '📦',
  Security: '🛡️', Cooking: '👨‍🍳', Farming: '🌾', 'Loading & Unloading': '📦',
  Tailoring: '🧵', Other: '💼',
}

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-[#e8dfd0] dark:border-white/8 p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-[#e8dfd0] dark:bg-white/10" />
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

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [featuredWorkers, setFeaturedWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const geo = useGeolocation()
  const [searchInput, setSearchInput] = useState({ category: '', location: '' })
  const [categoryFocused, setCategoryFocused] = useState(false)
  const [locationFocused, setLocationFocused] = useState(false)
  const categories = JOB_CATEGORIES

  useEffect(() => { fetchFeaturedWorkers() }, [])
  useEffect(() => {
    if (!searchInput.location && geo.manualLocation)
      setSearchInput(p => ({ ...p, location: geo.manualLocation }))
  }, [geo.manualLocation, searchInput.location])

  const fetchFeaturedWorkers = async () => {
    try {
      setLoading(true); setError('')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/workers?limit=6&sort=rating`)
      const d = res.data
      const workers = d?.data?.workers || d?.workers || (Array.isArray(d) ? d : d?.data) || []
      setFeaturedWorkers(Array.isArray(workers) ? workers : [])
    } catch {
      setError('Unable to load featured workers.')
      setFeaturedWorkers([])
    } finally { setLoading(false) }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchInput.category) params.set('category', searchInput.category)
    if (searchInput.location.trim()) {
      params.set('location', searchInput.location.trim())
      geo.updateManualLocation?.(searchInput.location.trim())
    }
    if (geo.latitude && geo.longitude) {
      params.set('latitude', String(geo.latitude))
      params.set('longitude', String(geo.longitude))
    }
    params.set('sortBy', 'distance')
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b]">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1208] via-[#2d1f0a] to-[#1a1208]" />
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />
        {/* Warm glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#c8833a]/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#d4963e]/15 blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 pt-28 pb-20 md:pt-36 md:pb-28">
          <motion.div {...stagger(0)} className="text-center mb-12">
            {/* Badge */}
            <motion.div {...stagger(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c8933a]/30 bg-[#c8933a]/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8933a] animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#d4a055]">Hyperlocal Job Marketplace</span>
            </motion.div>

            <motion.h1 {...stagger(1)} className="text-5xl md:text-7xl font-black text-white mb-5 leading-[1.05] tracking-tight">
              Kaam<span className="text-[#c8933a]">Setu</span>
            </motion.h1>
            <motion.p {...stagger(2)} className="text-xl md:text-2xl text-[#a89070] font-medium mb-2">
              Find Work. Hire Fast. Connect Locally.
            </motion.p>
            <motion.p {...stagger(3)} className="text-sm text-[#6e5c48] max-w-lg mx-auto">
              India's trusted platform for daily-wage workers and hirers — connecting people nearby, instantly.
            </motion.p>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <form onSubmit={handleSearch}
              className="mx-auto max-w-3xl rounded-3xl bg-white/[0.07] backdrop-blur-xl border border-white/10 p-2 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row gap-2">
                {/* Category */}
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className={`w-4 h-4 transition-colors duration-300 ${categoryFocused ? 'text-[#c8933a]' : 'text-[#6e5c48]'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <select
                    value={searchInput.category}
                    onChange={e => setSearchInput(p => ({ ...p, category: e.target.value }))}
                    onFocus={() => setCategoryFocused(true)}
                    onBlur={() => setCategoryFocused(false)}
                    className="w-full rounded-2xl bg-white/10 border border-white/10 pl-11 pr-4 py-4 text-sm font-medium text-white placeholder:text-[#6e5c48] appearance-none outline-none focus:border-[#c8933a]/50 focus:bg-white/15 transition-all duration-300"
                  >
                    <option value="" className="bg-[#1a1208] text-white">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value} className="bg-[#1a1208] text-white">
                        {CATEGORY_ICONS[cat.label] || '💼'} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className={`w-4 h-4 transition-colors duration-300 ${locationFocused ? 'text-[#c8933a]' : 'text-[#6e5c48]'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchInput.location}
                    onChange={e => setSearchInput(p => ({ ...p, location: e.target.value }))}
                    onFocus={() => setLocationFocused(true)}
                    onBlur={() => setLocationFocused(false)}
                    placeholder="City or area…"
                    className="w-full rounded-2xl bg-white/10 border border-white/10 pl-11 pr-4 py-4 text-sm font-medium text-white placeholder:text-[#6e5c48] outline-none focus:border-[#c8933a]/50 focus:bg-white/15 transition-all duration-300"
                  />
                </div>

                {/* Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#c8833a]/30 hover:shadow-[#c8833a]/50 transition-all duration-300 whitespace-nowrap"
                >
                  Search
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div {...stagger(5, 0.3)} className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            {!user ? (
              <>
                <Link to="/register">
                  <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="inline-block bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-[#c8833a]/25 hover:shadow-[#c8833a]/40 transition-all duration-300">
                    Get Started Free
                  </motion.span>
                </Link>
                <Link to="/login">
                  <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="inline-block border border-white/20 text-[#a89070] hover:text-white hover:border-white/40 px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300">
                    Sign In
                  </motion.span>
                </Link>
              </>
            ) : (
              <Link to="/dashboard">
                <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="inline-block bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-[#c8833a]/25 transition-all duration-300">
                  Go to Dashboard →
                </motion.span>
              </Link>
            )}
          </motion.div>

          {/* Stats row */}
          <motion.div {...stagger(6, 0.3)}
            className="flex flex-wrap justify-center gap-8 mt-12 text-center">
            {[['10k+', 'Workers'], ['5k+', 'Jobs Posted'], ['50+', 'Cities']].map(([n, l]) => (
              <div key={l}>
                <p className="text-2xl font-black text-[#c8933a]">{n}</p>
                <p className="text-xs text-[#6e5c48] font-semibold tracking-widest uppercase mt-0.5">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── GUEST MODE SECTION ── */}
      {!user && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-16 bg-white dark:bg-[#0e0d0b] border-y border-[#e8dfd0] dark:border-white/8"
        >
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">
              One account. Two ways to use it.
            </h2>
            <p className="text-sm text-[#9c8a78] dark:text-gray-500 mb-8 max-w-lg mx-auto">
              Sign in once, then switch between Worker and Hirer mode anytime from the header. No separate accounts needed.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {[
                { to: '/register', label: 'I Need Work', sub: 'Browse & apply to jobs', icon: '👷', filled: true },
                { to: '/register', label: 'I Need to Hire', sub: 'Post jobs, find workers', icon: '🏢', filled: false },
              ].map(({ to, label, sub, icon, filled }) => (
                <Link key={label} to={to}>
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-4 px-8 py-5 rounded-2xl border transition-all duration-300 text-left ${
                      filled
                        ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] border-transparent text-white shadow-lg shadow-[#c8833a]/25'
                        : 'border-[#e8dfd0] dark:border-white/10 hover:border-[#c8933a]/50 dark:hover:border-[#c8933a]/30 text-gray-800 dark:text-white'
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-bold text-sm">{label}</p>
                      <p className={`text-xs mt-0.5 ${filled ? 'text-white/70' : 'text-[#9c8a78]'}`}>{sub}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ── CATEGORIES ── */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-10"
        >
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c8933a] mb-2">Browse by Category</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">What are you looking for?</h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.slice(0, 14).map((cat, i) => (
            <motion.div
              key={cat.value}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            >
              <Link
                to={`/search?category=${cat.value}`}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/8 hover:border-[#c8933a]/50 dark:hover:border-[#c8933a]/30 hover:shadow-md hover:shadow-[#c8933a]/10 transition-all duration-300 text-center"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  {CATEGORY_ICONS[cat.label] || '💼'}
                </span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">{cat.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURED WORKERS ── */}
      <section className="py-16 bg-white dark:bg-[#0e0d0b]">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c8933a] mb-1">Top Rated</p>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Featured Workers</h2>
            </div>
            <Link to="/search"
              className="flex items-center gap-1.5 text-sm font-semibold text-[#c8933a] hover:text-[#a8732a] transition-colors duration-200">
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm mb-6"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
                <button onClick={fetchFeaturedWorkers} className="ml-auto text-xs font-semibold underline">Retry</button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : featuredWorkers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 rounded-2xl bg-[#faf7f2] dark:bg-white/[0.03] border border-[#e8dfd0] dark:border-white/8"
            >
              <span className="text-4xl mb-3 block">👷</span>
              <p className="text-gray-600 dark:text-gray-400 font-semibold">No workers yet</p>
              <p className="text-sm text-[#9c8a78] mt-1">Check back soon — workers are joining daily.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredWorkers.map((worker, i) => (
                <motion.div
                  key={worker._id || worker.userId?._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.45 }}
                >
                  <WorkerCard worker={worker} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
        >
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c8933a] mb-2">Simple Process</p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">How KaamSetu works</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-[#c8933a]/30 via-[#c8933a]/60 to-[#c8933a]/30" />

          {[
            { n: '01', icon: '👤', title: 'Create Account', desc: 'Sign up once. Use one account to both find work and hire workers.' },
            { n: '02', icon: '🔍', title: 'Find or Post Work', desc: 'Switch to Worker mode to browse jobs, or Hirer mode to post and find talent nearby.' },
            { n: '03', icon: '🤝', title: 'Connect & Complete', desc: 'Apply, get hired, chat in-app, and leave a review when the job is done.' },
          ].map(({ n, icon, title, desc }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative text-center group"
            >
              {/* Step indicator */}
              <div className="relative inline-flex">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#faf7f2] to-[#f0e8da] dark:from-white/[0.06] dark:to-white/[0.03] border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center text-3xl mb-5 shadow-sm group-hover:shadow-md group-hover:border-[#c8933a]/30 transition-all duration-300">
                  {icon}
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#c8933a] text-white text-[10px] font-black flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-[#9c8a78] leading-relaxed max-w-xs mx-auto">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      {!user && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-20 bg-gradient-to-br from-[#1a1208] via-[#2d1f0a] to-[#1a1208] relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#c8833a]/15 blur-[100px]" />
          <div className="relative text-center max-w-2xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to get started?</h2>
            <p className="text-[#a89070] mb-8">Join thousands of workers and hirers already on KaamSetu.</p>
            <Link to="/register">
              <motion.span
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="inline-block bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white px-10 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-[#c8833a]/30 hover:shadow-[#c8833a]/50 transition-all duration-300"
              >
                Create Free Account
              </motion.span>
            </Link>
          </div>
        </motion.section>
      )}
    </div>
  )
}

export default Home