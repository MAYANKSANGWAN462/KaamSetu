// AdminDashboard.jsx — platform overview, analytics, system health, management links.
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import adminService from '../../services/adminService'
import { useAdminAuth } from '../../context/AdminAuthContext'

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
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await adminService.getStats()
        if (active) setStats(res?.data || res)
      } catch (err) {
        if (active) setError(typeof err === 'string' ? err : 'Failed to load stats.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  const statItems = [
    { label: 'Total Users',   value: stats?.totalUsers,       icon: '👥', color: 'text-[#c8933a]' },
    { label: 'Workers',       value: stats?.totalWorkers,     icon: '👷', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Hirers',        value: stats?.totalHirers,      icon: '🧑‍💼', color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Active Users',  value: stats?.activeUsers,      icon: '🟢', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Total Jobs',    value: stats?.totalJobs,        icon: '💼', color: 'text-violet-600 dark:text-violet-400' },
    { label: 'Open Jobs',     value: stats?.activeJobs,       icon: '✅', color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Worker Posts',  value: stats?.totalWorkerPosts, icon: '📋', color: 'text-[#c8933a]' },
    { label: 'New (7 days)',  value: stats?.recentRegistrations, icon: '🆕', color: 'text-blue-600 dark:text-blue-400' },
  ]

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">

        <motion.div {...stagger(0)} className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a]">Admin Panel</p>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-[#9c8a78] mt-1">Signed in as {admin?.name || admin?.email}.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-[#e8dfd0] dark:border-white/10 text-xs font-bold text-[#9c8a78] hover:text-red-500 hover:border-red-300 transition-colors"
          >
            Sign out
          </button>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-6">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(8)].map((_, i) => (
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
              <StatCard key={label} label={label} value={value} icon={icon} color={color} delay={i * 0.05} />
            ))}
          </div>
        )}

        {/* System health */}
        {stats?.health && (
          <motion.div {...stagger(1)} className="mb-8 bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9c8a78] mb-3">System Health</p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stats.health.db === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-gray-700 dark:text-gray-300">Database: <b>{stats.health.db}</b></span>
              </div>
              <div className="text-gray-700 dark:text-gray-300">Uptime: <b>{Math.floor((stats.health.uptimeSeconds || 0) / 60)}m</b></div>
              <div className="text-gray-700 dark:text-gray-300">Env: <b>{stats.health.nodeEnv}</b></div>
            </div>
          </motion.div>
        )}

        {/* Recent registrations */}
        {stats?.recentUsers?.length > 0 && (
          <motion.div {...stagger(2)} className="mb-8 bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9c8a78] mb-3">Recent Registrations</p>
            <div className="divide-y divide-[#e8dfd0] dark:divide-white/8">
              {stats.recentUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-[#9c8a78] truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] text-[#b8a898] flex-shrink-0 ml-3">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Management links */}
        <motion.div {...stagger(3)}>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9c8a78] mb-4">Management</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { to: '/admin/users', icon: '👥', title: 'Manage Users', desc: 'View, suspend, activate, and delete accounts', color: 'from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-500/20' },
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
