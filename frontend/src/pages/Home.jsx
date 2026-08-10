import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import WorkerCard from '../components/worker/WorkerCard'
import LocationAutocomplete from '../components/common/LocationAutocomplete'
import { JOB_CATEGORIES } from '../utils/constants'
import useGeolocation from '../hooks/useGeolocation'
import { motion, AnimatePresence } from 'framer-motion'

const stagger = (i, base = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: base + i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }
})

// Keyed by category label (see JOB_CATEGORY_GROUPS). Falls back to 💼.
const CATEGORY_ICONS = {
  Mason: '🧱', Helper: '🦺', Plumber: '🔧', Electrician: '⚡',
  Painter: '🖌️', Carpenter: '🪚', Welder: '🔥',
  'Field Worker': '🌾', Irrigation: '💧', Harvester: '🌱',
  'Livestock Handler': '🐄', 'Pesticide Sprayer': '🧴',
  'House Help': '🧹', Cook: '👨‍🍳', Nanny: '🍼', Driver: '🚗',
  'Security Guard': '🛡️', Gardener: '🌳',
  Mechanic: '🔩', 'AC Repair': '❄️', 'IT Support': '💻',
  'Appliance Repair': '🛠️', 'CCTV Installer': '📹',
  'General Labour': '💪', Loader: '📦', Other: '💼',
}

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-[#e6e8ec] dark:border-white/8 p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-full bg-[#e6e8ec] dark:bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#e6e8ec] dark:bg-white/10 rounded-lg w-3/4" />
        <div className="h-3 bg-[#e6e8ec] dark:bg-white/10 rounded-lg w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-[#e6e8ec] dark:bg-white/10 rounded-lg" />
      <div className="h-3 bg-[#e6e8ec] dark:bg-white/10 rounded-lg w-4/5" />
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
    <div className="min-h-screen bg-[#f6f7f9] dark:bg-[#0b0e14]">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)]">

        {/* ── Background: illustrated scene (all sizes, light mode) ── */}
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMax slice"
          className="dark:hidden absolute inset-0 w-full h-full pointer-events-none"
          aria-label="Two workers meeting on the KaamSetu platform"
          role="img"
        >
          <defs>
            <linearGradient id="ks-hero-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFE7C2" />
              <stop offset="0.55" stopColor="#FDD39A" />
              <stop offset="1" stopColor="#F9C078" />
            </linearGradient>
            <linearGradient id="ks-hero-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E8A54B" />
              <stop offset="1" stopColor="#D98A2B" />
            </linearGradient>
          </defs>
          {/* sky */}
          <rect x="0" y="0" width="1600" height="900" fill="url(#ks-hero-sky)" />
          {/* sun */}
          <circle cx="800" cy="300" r="150" fill="#FFF1D8" opacity="0.85" />
          <circle cx="800" cy="300" r="98" fill="#FFE1A8" />
          {/* far skyline */}
          <g fill="#EBB56B">
            <rect x="120" y="470" width="120" height="200" />
            <rect x="255" y="520" width="90" height="150" />
            <rect x="1280" y="450" width="140" height="220" />
            <rect x="1435" y="510" width="90" height="160" />
          </g>
          {/* mid buildings */}
          <rect x="360" y="430" width="150" height="250" fill="#E29A47" />
          <g fill="#D98A2B">
            <rect x="382" y="460" width="26" height="26" /><rect x="424" y="460" width="26" height="26" /><rect x="466" y="460" width="26" height="26" />
            <rect x="382" y="510" width="26" height="26" /><rect x="424" y="510" width="26" height="26" /><rect x="466" y="510" width="26" height="26" />
            <rect x="382" y="560" width="26" height="26" /><rect x="424" y="560" width="26" height="26" /><rect x="466" y="560" width="26" height="26" />
          </g>
          <rect x="1090" y="410" width="160" height="270" fill="#E29A47" />
          <g fill="#D98A2B">
            <rect x="1114" y="440" width="28" height="28" /><rect x="1160" y="440" width="28" height="28" /><rect x="1206" y="440" width="28" height="28" />
            <rect x="1114" y="494" width="28" height="28" /><rect x="1160" y="494" width="28" height="28" /><rect x="1206" y="494" width="28" height="28" />
            <rect x="1114" y="548" width="28" height="28" /><rect x="1160" y="548" width="28" height="28" /><rect x="1206" y="548" width="28" height="28" />
          </g>
          {/* tower crane */}
          <g stroke="#B4701E" strokeWidth="8" fill="none">
            <path d="M 560 680 L 560 300" />
            <path d="M 430 330 L 700 330" />
            <path d="M 560 300 L 460 330 M 560 300 L 660 330" />
          </g>
          <path d="M 650 330 L 650 380" stroke="#B4701E" strokeWidth="6" />
          <rect x="632" y="380" width="36" height="26" fill="#E9731A" />
          {/* ground */}
          <path d="M 0 680 Q 800 640 1600 680 L 1600 900 L 0 900 Z" fill="url(#ks-hero-ground)" />
          <path d="M 0 690 Q 800 652 1600 690" fill="none" stroke="#C87C22" strokeWidth="4" opacity="0.5" />
        </svg>

        {/* ── Dark mode background ── */}
        <div className="hidden dark:block absolute inset-0 bg-[#0b0e14] pointer-events-none">
          <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-amber-400/15 blur-[120px]" />
          <div className="absolute top-10 right-1/4 w-80 h-80 rounded-full bg-orange-400/10 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.05] text-slate-400"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        </div>

        {/* ── Bottom gradient: fade into page background ── */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[1]"
          style={{ background: 'linear-gradient(to bottom, transparent, #f6f7f9)' }}
        />
        <div
          className="hidden dark:block absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[1]"
          style={{ background: 'linear-gradient(to bottom, transparent, #0b0e14)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-10 md:pt-20 md:pb-16">
          <motion.div {...stagger(0)} className="text-center mb-12">
            {/* Badge */}
            <motion.div {...stagger(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/60 dark:border-amber-500/30 bg-white/55 dark:bg-amber-500/10 backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E9731A] dark:bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#7a3d0e] dark:text-amber-400">Hyperlocal Job Marketplace</span>
            </motion.div>

            <motion.h1 {...stagger(1)} className="text-5xl md:text-7xl font-black text-[#2B2119] dark:text-white mb-5 leading-[1.05] tracking-tight">
              Kaam<span style={{ color: '#E9731A' }}>Setu</span>
            </motion.h1>
            <motion.p {...stagger(2)} className="text-xl md:text-2xl text-[#5b4a38] dark:text-gray-300 font-medium mb-2">
              Find Work. Hire Fast. Connect Locally.
            </motion.p>
            <motion.p {...stagger(3)} className="text-sm text-[#6b5840] dark:text-gray-400 max-w-lg mx-auto">
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
              className="mx-auto max-w-3xl rounded-3xl bg-white/95 dark:bg-white/[0.04] border border-white/80 dark:border-white/10 p-2 shadow-xl shadow-[#c8822a]/15 dark:shadow-black/30 backdrop-blur-sm"
            >
              <div className="flex flex-col md:flex-row gap-2">
                {/* Category */}
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className={`w-4 h-4 transition-colors duration-300 ${categoryFocused ? 'text-amber-500' : 'text-gray-400'}`}
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
                    className="w-full rounded-2xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 pl-11 pr-4 py-4 text-sm font-medium text-gray-900 dark:text-white appearance-none outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all duration-300"
                  >
                    <option value="" className="bg-white text-gray-900 dark:bg-[#141824] dark:text-white">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value} className="bg-white text-gray-900 dark:bg-[#141824] dark:text-white">
                        {CATEGORY_ICONS[cat.label] || '💼'} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className={`w-4 h-4 transition-colors duration-300 ${locationFocused ? 'text-amber-500' : 'text-gray-400'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <LocationAutocomplete
                    value={searchInput.location}
                    onChange={val => setSearchInput(p => ({ ...p, location: val }))}
                    placeholder="City or area…"
                    icon={false}
                    inputClassName="w-full rounded-2xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 pl-11 pr-4 py-4 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all duration-300"
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
                    className="inline-block border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-400 dark:hover:border-amber-500/40 px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300">
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

          {/* Platform badges */}
          <motion.div {...stagger(6, 0.3)}
            className="flex flex-wrap justify-center gap-3 mt-10">
            {[
              { icon: '🆓', label: 'Free to Join' },
              { icon: '📍', label: 'Hyperlocal' },
              { icon: '🔒', label: 'Verified Users' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/[0.05] backdrop-blur-sm border border-white/60 dark:border-white/10 text-xs font-semibold text-[#5b4a38] dark:text-gray-400 shadow-sm">
                <span>{icon}</span>
                <span>{label}</span>
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
          className="py-16 bg-white dark:bg-[#0b0e14] border-y border-[#e6e8ec] dark:border-white/8"
        >
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">
              One account. Two ways to use it.
            </h2>
            <p className="text-sm text-[#6b7280] dark:text-gray-500 mb-8 max-w-lg mx-auto">
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
                        : 'border-[#e6e8ec] dark:border-white/10 hover:border-[#c8933a]/50 dark:hover:border-[#c8933a]/30 text-gray-800 dark:text-white'
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-bold text-sm">{label}</p>
                      <p className={`text-xs mt-0.5 ${filled ? 'text-white/70' : 'text-[#6b7280]'}`}>{sub}</p>
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
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-white/[0.04] border border-[#e6e8ec] dark:border-white/8 hover:border-[#c8933a]/50 dark:hover:border-[#c8933a]/30 hover:shadow-md hover:shadow-[#c8933a]/10 transition-all duration-300 text-center"
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
      <section className="py-16 bg-white dark:bg-[#0b0e14]">
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
              className="text-center py-16 rounded-2xl bg-[#f6f7f9] dark:bg-white/[0.03] border border-[#e6e8ec] dark:border-white/8"
            >
              <span className="text-4xl mb-3 block">👷</span>
              <p className="text-gray-600 dark:text-gray-400 font-semibold">No workers yet</p>
              <p className="text-sm text-[#6b7280] mt-1">Check back soon — workers are joining daily.</p>
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
          {/* Connector line (desktop) — sits behind the step icons (z-0) so it
              reads as a link between them and never crosses the numbers or text. */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-[#c8933a]/30 via-[#c8933a]/60 to-[#c8933a]/30 z-0 pointer-events-none" />

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
              className="relative z-10 text-center group"
            >
              {/* Step indicator */}
              <div className="relative inline-flex">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#f6f7f9] to-[#eef0f3] dark:from-white/[0.06] dark:to-white/[0.03] border border-[#e6e8ec] dark:border-white/10 flex items-center justify-center text-3xl mb-5 shadow-sm group-hover:shadow-md group-hover:border-[#c8933a]/30 transition-all duration-300">
                  {icon}
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#c8933a] text-white text-[10px] font-black flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed max-w-xs mx-auto">{desc}</p>
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
          className="py-16 px-4"
        >
          <div className="relative max-w-5xl mx-auto overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 px-6 py-14 text-center shadow-xl shadow-amber-500/20">
            {/* Soft light orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/10 blur-[90px] pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to get started?</h2>
              <p className="text-white/85 mb-8">Join thousands of workers and hirers already on KaamSetu.</p>
              <Link to="/register">
                <motion.span
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="inline-block bg-white text-amber-600 px-10 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-black/10 hover:shadow-black/20 transition-all duration-300"
                >
                  Create Free Account
                </motion.span>
              </Link>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  )
}

export default Home