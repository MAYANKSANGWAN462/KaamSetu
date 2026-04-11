import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { jobService } from '../services'
import JobCard from '../components/hirer/JobCard'

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }
})

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

const MyJobs = () => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchJobs = async () => {
    try {
      setError('')
      const res = await jobService.getMyJobs()
      setJobs(res?.data || [])
    } catch { setError('Failed to load your jobs.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchJobs() }, [])

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    filled: jobs.filter(j => ['filled', 'completed'].includes(j.status)).length,
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div {...stagger(0)} className="flex flex-wrap items-start justify-between gap-4 mb-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-1">Hirer Mode</p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Jobs</h1>
            <p className="text-sm text-[#9c8a78] mt-1">All the job posts you've created.</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/hirer/post-job')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25 transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Post New Job
          </motion.button>
        </motion.div>

        <motion.div {...stagger(1)} className="grid grid-cols-3 gap-4 mb-7">
          {[
            { label: 'Total Posted', value: stats.total, icon: '📋' },
            { label: 'Active', value: stats.open, icon: '✅' },
            { label: 'Filled', value: stats.filled, icon: '🏆' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-4 shadow-sm text-center">
              <p className="text-xl mb-1">{icon}</p>
              <p className="text-2xl font-black text-[#c8933a]">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9c8a78] mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-5">
              {error}
              <button onClick={fetchJobs} className="ml-auto underline font-bold">Retry</button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : jobs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 border-dashed">
            <span className="text-5xl block mb-3">💼</span>
            <p className="font-black text-gray-700 dark:text-gray-300 text-lg mb-1">No jobs posted yet</p>
            <p className="text-sm text-[#9c8a78] mb-6">Post your first job to start receiving applications from workers.</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/hirer/post-job')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25">
              Post Your First Job
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <motion.div key={job._id} {...stagger(i)}>
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyJobs