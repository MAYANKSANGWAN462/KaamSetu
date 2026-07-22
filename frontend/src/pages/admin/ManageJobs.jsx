// ManageJobs.jsx — admin view: list, filter, and moderate (reopen/cancel) job posts.
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import adminService from '../../services/adminService'

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }
})

const JOB_STATUSES = ['all', 'open', 'filled', 'cancelled']

const ManageJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      setError('')
      const params = {}
      if (filter !== 'all') params.status = filter
      if (search.trim()) params.q = search.trim()
      const res = await adminService.getJobs(params)
      setJobs(res?.data || [])
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to load jobs.')
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    const t = setTimeout(fetchJobs, 300)
    return () => clearTimeout(t)
  }, [fetchJobs])

  const handleModerate = async (job, status) => {
    if (status === 'cancelled' && !window.confirm('Cancel this job post?')) return
    setBusyId(job._id)
    try {
      await adminService.moderateJob(job._id, status)
      toast.success(`Job ${status}`)
      setJobs((prev) => prev.map((j) => (j._id === job._id ? { ...j, status } : j)))
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to moderate job')
    } finally {
      setBusyId(null)
    }
  }

  const statusColor = (s) => ({
    open: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    filled: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400',
    cancelled: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400',
  }[s] || 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400')

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div {...stagger(0)} className="mb-7">
          <Link to="/admin" className="flex items-center gap-1.5 text-xs font-semibold text-[#9c8a78] hover:text-[#c8933a] transition-colors duration-200 mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Admin Dashboard
          </Link>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-1">Admin</p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Manage Jobs</h1>
        </motion.div>

        <motion.div {...stagger(1)} className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#b8a898]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs…"
              className="w-full rounded-2xl bg-white dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/10 pl-11 pr-4 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder:text-[#b8a898] outline-none focus:border-[#c8933a]/60 transition-all duration-300" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {JOB_STATUSES.map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${
                  filter === s
                    ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white shadow-sm'
                    : 'bg-white dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/50 hover:text-[#c8933a]'
                }`}>{s}</button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-5">
              {error} <button onClick={fetchJobs} className="ml-auto underline">Retry</button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-5 animate-pulse">
              <div className="space-y-2">
                <div className="h-5 w-1/2 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
                <div className="h-3 w-3/4 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
              </div>
            </div>
          ))}</div>
        ) : jobs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8">
            <span className="text-4xl block mb-2">💼</span>
            <p className="font-bold text-[#9c8a78]">No jobs found</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job, i) => (
              <motion.div key={job._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.4 }}
                className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 px-5 py-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor(job.status)}`}>
                        {job.status}
                      </span>
                      {job.category && (
                        <span className="text-[10px] text-[#9c8a78] font-semibold">{job.category}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">{job.title}</h3>
                    {job.description && (
                      <p className="text-xs text-[#9c8a78] mt-0.5 line-clamp-1">{job.description}</p>
                    )}
                    <p className="text-xs text-[#b8a898] mt-1 flex flex-wrap items-center gap-2">
                      {job.hirerId?.name && <span>by {job.hirerId.name}</span>}
                      {job.wage?.amount != null && <><span className="text-[#e8dfd0] dark:text-white/20">·</span><span>₹{job.wage.amount} {job.wage.unit}</span></>}
                      {job.location?.address && <><span className="text-[#e8dfd0] dark:text-white/20">·</span><span>{job.location.address}</span></>}
                      {job.createdAt && <><span className="text-[#e8dfd0] dark:text-white/20">·</span><span>{new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status !== 'cancelled' ? (
                      <button
                        onClick={() => handleModerate(job, 'cancelled')}
                        disabled={busyId === job._id}
                        className="px-3 py-2 rounded-xl border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModerate(job, 'open')}
                        disabled={busyId === job._id}
                        className="px-3 py-2 rounded-xl border border-emerald-200/70 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageJobs
