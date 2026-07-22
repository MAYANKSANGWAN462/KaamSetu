import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { jobService } from '../services'
import { motion, AnimatePresence } from 'framer-motion'
import JobCard from '../components/hirer/JobCard'
import WorkerAvailabilityForm from '../components/worker/WorkerAvailabilityForm'
import useGeolocation from '../hooks/useGeolocation'
import axios from 'axios'

const stagger = (i) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
})

const StatusBadge = ({ status }) => {
  const map = {
    accepted: { label: 'Accepted', cls: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400' },
    pending:  { label: 'Pending',  cls: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400' },
    completed:{ label: 'Completed',cls: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  }
  const { label, cls } = map[status] || map.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

const SkeletonCard = () => (
  <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-5 animate-pulse">
    <div className="space-y-3">
      <div className="h-5 w-2/3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
      <div className="h-3 w-1/3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
      <div className="flex gap-2 pt-2">
        <div className="h-7 w-20 bg-[#e8dfd0] dark:bg-white/10 rounded-xl" />
        <div className="h-7 w-16 bg-[#e8dfd0] dark:bg-white/10 rounded-xl" />
      </div>
    </div>
  </div>
)

const RatingStars = ({ rating = 0 }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <svg key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-[#c8933a]' : 'text-[#e8dfd0] dark:text-white/10'}`}
        fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="text-xs text-[#9c8a78] ml-1">{rating.toFixed(1)}</span>
  </div>
)

const WorkerDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const geo = useGeolocation()
  const [applications, setApplications] = useState([])
  const [nearbyJobs, setNearbyJobs] = useState([])
  const [workerProfile, setWorkerProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [error, setError] = useState('')
  const [showPostForm, setShowPostForm] = useState(false)

  const stats = {
    total:    applications.length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    pending:  applications.filter(a => a.status === 'pending').length,
    earnings: applications
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + (a.jobId?.wage?.amount || 0), 0),
  }

  useEffect(() => { fetchDashboardData() }, [])
  useEffect(() => {
    if (geo.latitude && geo.longitude) fetchNearbyJobs()
  }, [geo.latitude, geo.longitude])

  const fetchDashboardData = async () => {
    try {
      const [appsRes, profileRes] = await Promise.allSettled([
        jobService.getMyApplications(),
        axios.get(`${import.meta.env.VITE_API_URL}/api/workers/${user?._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => null)
      ])
      if (appsRes.status === 'fulfilled') {
        setApplications(appsRes.value?.data || [])
      }
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setWorkerProfile(profileRes.value?.data?.data || profileRes.value?.data || null)
      }
    } catch { setError('Failed to load dashboard data') }
    finally { setLoading(false) }
  }

  const fetchNearbyJobs = async () => {
    try {
      const res = await jobService.getJobs({ lat: geo.latitude, lng: geo.longitude, limit: 6 })
      setNearbyJobs(res?.jobs || res?.data?.jobs || [])
    } catch { /* silent */ }
    finally { setLoadingJobs(false) }
  }

  const handlePostSuccess = () => {
    setShowPostForm(false)
    fetchDashboardData()
  }

  const hasProfile = !!workerProfile

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 space-y-8">

        {/* ── GREETING ── */}
        <motion.div {...stagger(0)}>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-1">Worker Mode</p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                Hello, {user?.name?.split(' ')[0]} 👷
              </h1>
              <p className="text-sm text-[#9c8a78] mt-1">Find jobs near you and let hirers find you.</p>
            </div>
            {/* POST AVAILABILITY BUTTON */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowPostForm(v => !v)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25 hover:shadow-[#c8833a]/40 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d={showPostForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
              </svg>
              {showPostForm ? 'Cancel' : hasProfile ? 'Update Availability' : 'Post Availability'}
            </motion.button>
          </div>
        </motion.div>

        {/* ── POST AVAILABILITY FORM (inline toggle) ── */}
        <AnimatePresence>
          {showPostForm && (
            <motion.div
              key="post-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <WorkerAvailabilityForm
                existingProfile={workerProfile}
                onSuccess={handlePostSuccess}
                onCancel={() => setShowPostForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PROFILE BANNER ── */}
        <AnimatePresence>
          {!showPostForm && (
            <motion.div {...stagger(1)}>
              {!hasProfile ? (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-3xl border border-amber-200/70 dark:border-amber-500/20 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-0.5">
                          Post your availability to get hired
                        </p>
                        <p className="text-xs text-amber-700/70 dark:text-amber-400/70">
                          Hirers will be able to find and contact you directly.
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setShowPostForm(true)}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold text-sm shadow-md shadow-amber-500/25"
                    >
                      Post Now →
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* Profile card — shows current post status */
                <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#c8833a]/20 flex-shrink-0">
                        {(user?.name || 'W')[0]}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-[#9c8a78] mt-0.5">{workerProfile.category || 'Worker'}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          <RatingStars rating={workerProfile.rating?.avg || 0} />
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${
                            workerProfile.isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#9c8a78]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${workerProfile.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-[#b8a898]'}`} />
                            {workerProfile.isAvailable ? 'Available for work' : 'Not available'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Post summary pills */}
                    <div className="flex flex-wrap gap-2">
                      {workerProfile.wage?.amount > 0 && (
                        <span className="px-3 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-xs font-bold text-[#c8933a]">
                          ₹{workerProfile.wage.amount}/{workerProfile.wage.unit === 'daily' ? 'day' : workerProfile.wage.unit}
                        </span>
                      )}
                      {workerProfile.yearsOfExperience > 0 && (
                        <span className="px-3 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-xs font-semibold text-[#9c8a78]">
                          {workerProfile.yearsOfExperience} yrs exp
                        </span>
                      )}
                      {(workerProfile.availability?.days || []).length > 0 && (
                        <span className="px-3 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-xs font-semibold text-[#9c8a78]">
                          {workerProfile.availability.days.map(d => d.slice(0,3)).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills row */}
                  {(workerProfile.skills || []).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#e8dfd0] dark:border-white/8">
                      <div className="flex flex-wrap gap-1.5">
                        {workerProfile.skills.slice(0, 8).map(skill => (
                          <span key={skill}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-[#c8933a] border border-amber-200 dark:border-amber-500/30 text-[10px] font-bold">
                            {skill}
                          </span>
                        ))}
                        {workerProfile.skills.length > 8 && (
                          <span className="px-2.5 py-1 rounded-lg bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-[10px] font-semibold text-[#9c8a78]">
                            +{workerProfile.skills.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {workerProfile.bio && (
                    <p className="mt-3 text-xs text-[#9c8a78] leading-relaxed line-clamp-2">
                      {workerProfile.bio}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STATS ── */}
        <motion.div {...stagger(2)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Applications', value: stats.total,    icon: '📋', color: 'text-[#c8933a]' },
              { label: 'Accepted',     value: stats.accepted, icon: '✅', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Pending',      value: stats.pending,  icon: '⏳', color: 'text-amber-600 dark:text-amber-400' },
              { label: 'Earnings',     value: `₹${stats.earnings.toLocaleString()}`, icon: '💰', color: 'text-blue-600 dark:text-blue-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label}
                className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-5 shadow-sm">
                <p className="text-2xl mb-2">{icon}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-[#9c8a78] font-semibold mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── NEARBY JOBS ── */}
        <motion.div {...stagger(3)}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-0.5">Hirer Posts Near You</p>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Nearby Jobs</h2>
            </div>
            <Link to="/search" className="flex items-center gap-1 text-sm font-semibold text-[#c8933a] hover:text-[#a8732a] transition-colors duration-200">
              Browse All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {loadingJobs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : nearbyJobs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8">
              <span className="text-3xl block mb-2">📍</span>
              <p className="text-sm font-medium text-[#9c8a78] mb-1">No jobs near you yet</p>
              <p className="text-xs text-[#b8a898]">Enable location to see nearby job posts from hirers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyJobs.map((job, i) => (
                <motion.div key={job._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}>
                  <JobCard job={job} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── MY APPLICATIONS ── */}
        <motion.div {...stagger(4)}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-0.5">Your Activity</p>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">My Applications</h2>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-4">
                {error}
                <button onClick={fetchDashboardData} className="ml-auto underline">Retry</button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : applications.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-14 bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 border-dashed">
              <span className="text-4xl block mb-3">📋</span>
              <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">No applications yet</p>
              <p className="text-sm text-[#9c8a78] mb-5">Browse job posts from hirers and apply to get started.</p>
              <Link to="/search">
                <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25">
                  Browse Jobs
                </motion.span>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 8).map((app, i) => {
                const job = app.jobId || {}
                const hirerId = typeof app.hirerId === 'string' ? app.hirerId : app.hirerId?._id
                const convId = hirerId && user?._id ? [String(user._id), String(hirerId)].sort().join('_') : null
                return (
                  <motion.div key={app._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 px-5 py-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d4963e]/20 to-[#b86e2a]/20 border border-[#c8933a]/20 flex items-center justify-center text-[#c8933a] font-black text-sm flex-shrink-0">
                        💼
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {job.title || 'Job Application'}
                        </p>
                        <p className="text-xs text-[#9c8a78] mt-0.5">
                          Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={app.status} />
                      {(app.status === 'accepted' || app.status === 'pending') && convId && (
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/messages/${convId}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#c8933a]/50 text-[#c8933a] text-xs font-bold hover:bg-[#c8933a]/5 transition-all duration-200"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Message
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default WorkerDashboard