// ──────────────────────────────────────────────
// MyApplications.jsx
// ──────────────────────────────────────────────
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { jobService } from '../services'
import { useAuth } from '../context/AuthContext'

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }
})

const StatusBadge = ({ status }) => {
  const map = {
    accepted: { label: 'Accepted', cls: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-500/20' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200/70 dark:border-red-500/20' },
    pending:  { label: 'Pending',  cls: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200/70 dark:border-amber-500/20' },
    completed:{ label: 'Completed',cls: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200/70 dark:border-blue-500/20' },
  }
  const { label, cls } = map[status] || map.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />{label}
    </span>
  )
}

const SkeletonRow = () => (
  <div className="flex items-center gap-4 bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-5 animate-pulse">
    <div className="w-10 h-10 rounded-2xl bg-[#e8dfd0] dark:bg-white/10 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/2 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
      <div className="h-3 w-1/3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
    </div>
    <div className="h-7 w-20 bg-[#e8dfd0] dark:bg-white/10 rounded-xl" />
  </div>
)

const MyApplications = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await jobService.getMyApplications()
        setApplications(res?.data || [])
      } catch { setError('Failed to load applications.') }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div {...stagger(0)} className="mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-1">Worker Mode</p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Applications</h1>
          <p className="text-sm text-[#9c8a78] mt-1">Track all the jobs you've applied to.</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-5">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : applications.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 border-dashed">
            <span className="text-5xl block mb-3">📋</span>
            <p className="font-black text-gray-700 dark:text-gray-300 text-lg mb-1">No applications yet</p>
            <p className="text-sm text-[#9c8a78] mb-6">Browse job posts from hirers and apply to get started.</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/search')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25">
              Browse Jobs
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {applications.map((app, i) => {
              const job = app.jobId || {}
              const hirerId = typeof app.hirerId === 'string' ? app.hirerId : app.hirerId?._id
                || (typeof job.createdBy === 'string' ? job.createdBy : job.createdBy?._id)
              const convId = hirerId && user?._id ? [user._id, hirerId].sort().join('_') : null

              return (
                <motion.div key={app._id} {...stagger(i)}
                  className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d4963e]/15 to-[#b86e2a]/15 border border-[#c8933a]/20 flex items-center justify-center text-[#c8933a] text-lg flex-shrink-0">
                      💼
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {job.title || 'Job Application'}
                      </p>
                      <p className="text-xs text-[#9c8a78] mt-0.5 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location?.city || job.location || 'Location not specified'}
                        <span className="text-[#e8dfd0] dark:text-white/20">·</span>
                        {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <StatusBadge status={app.status} />
                    {(app.status === 'accepted' || app.status === 'pending') && convId && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/messages/${convId}`)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#c8933a]/50 text-[#c8933a] text-xs font-bold hover:bg-[#c8933a]/5 transition-all duration-200">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Message
                      </motion.button>
                    )}
                    {job._id && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="text-xs font-semibold text-[#9c8a78] hover:text-[#c8933a] transition-colors duration-200 px-2">
                        View →
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyApplications

