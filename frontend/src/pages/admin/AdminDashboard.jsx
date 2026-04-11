// ──────────────────────────────────────────────
// AdminDashboard.jsx
// ──────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }
})

const StatCard = ({ label, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-6 shadow-sm"
  >
    <p className="text-2xl mb-3">{icon}</p>
    <p className={`text-3xl font-black ${color}`}>{value ?? '—'}</p>
    <p className="text-xs font-bold uppercase tracking-wider text-[#9c8a78] mt-1">{label}</p>
  </motion.div>
)

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`)
        setStats(res.data)
      } catch { setError('Failed to load stats.') }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const statItems = [
    { label: 'Total Users',   value: stats?.totalUsers,   icon: '👥', color: 'text-[#c8933a]' },
    { label: 'Total Workers', value: stats?.totalWorkers, icon: '👷', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Total Jobs',    value: stats?.totalJobs,    icon: '💼', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Active Jobs',   value: stats?.activeJobs,   icon: '✅', color: 'text-violet-600 dark:text-violet-400' },
  ]

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <motion.div {...stagger(0)} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a]">Admin Panel</p>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-[#9c8a78] mt-1">Platform overview and management tools.</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-6">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-6 animate-pulse">
                <div className="h-6 w-6 bg-[#e8dfd0] dark:bg-white/10 rounded-lg mb-3" />
                <div className="h-8 w-16 bg-[#e8dfd0] dark:bg-white/10 rounded-lg mb-2" />
                <div className="h-3 w-20 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statItems.map(({ label, value, icon, color }, i) => (
              <StatCard key={label} label={label} value={value} icon={icon} color={color} delay={i * 0.07} />
            ))}
          </div>
        )}

        {/* Quick links */}
        <motion.div {...stagger(2)}>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9c8a78] mb-4">Management</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { to: '/admin/users', icon: '👥', title: 'Manage Users', desc: 'View, activate, and deactivate user accounts', color: 'from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-500/20' },
              { to: '/admin/jobs',  icon: '💼', title: 'Manage Jobs',  desc: 'View and moderate all job listings', color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-500/20' },
            ].map(({ to, icon, title, desc, color }) => (
              <Link key={to} to={to}>
                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                  className={`bg-gradient-to-br ${color} rounded-2xl border p-6 transition-all duration-300 hover:shadow-md group`}>
                  <div className="flex items-start gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
                    <div>
                      <h2 className="font-black text-gray-900 dark:text-white mb-1">{title}</h2>
                      <p className="text-xs text-[#9c8a78] leading-relaxed">{desc}</p>
                    </div>
                    <svg className="w-5 h-5 text-[#e8dfd0] dark:text-white/20 group-hover:text-[#c8933a] transition-colors duration-300 ml-auto flex-shrink-0 mt-0.5"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard