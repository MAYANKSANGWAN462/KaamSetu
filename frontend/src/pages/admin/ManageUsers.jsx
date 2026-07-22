// ManageUsers.jsx — admin view: list, filter, suspend/activate, delete users.
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

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'worker', label: 'Workers', key: 'mode' },
  { value: 'hirer', label: 'Hirers', key: 'mode' },
  { value: 'suspended', label: 'Suspended', key: 'status' },
  { value: 'admin', label: 'Admins', key: 'role' },
]

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      setError('')
      const params = {}
      const f = FILTERS.find((x) => x.value === filter)
      if (f?.key) params[f.key] = filter
      if (search.trim()) params.q = search.trim()
      const res = await adminService.getUsers(params)
      setUsers(res?.data || [])
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300)
    return () => clearTimeout(t)
  }, [fetchUsers])

  const handleToggle = async (u) => {
    setBusyId(u._id)
    try {
      await adminService.setUserStatus(u._id, !u.isActive)
      toast.success(u.isActive ? 'User suspended' : 'User activated')
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isActive: !u.isActive } : x)))
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to update status')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This permanently removes the account and cannot be undone.`)) return
    setBusyId(u._id)
    try {
      await adminService.deleteUser(u._id)
      toast.success('User deleted')
      setUsers((prev) => prev.filter((x) => x._id !== u._id))
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to delete user')
    } finally {
      setBusyId(null)
    }
  }

  const modeColor = (mode) => ({
    worker: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400',
    hirer: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400',
  }[mode] || 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400')

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
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Manage Users</h1>
        </motion.div>

        <motion.div {...stagger(1)} className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#b8a898]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full rounded-2xl bg-white dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/10 pl-11 pr-4 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder:text-[#b8a898] outline-none focus:border-[#c8933a]/60 transition-all duration-300" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  filter === f.value
                    ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white shadow-sm'
                    : 'bg-white dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/50 hover:text-[#c8933a]'
                }`}>{f.label}</button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-5">
              {error} <button onClick={fetchUsers} className="ml-auto underline">Retry</button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 px-5 py-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-[#e8dfd0] dark:bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
                <div className="h-3 w-1/2 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
              </div>
              <div className="h-8 w-20 bg-[#e8dfd0] dark:bg-white/10 rounded-xl" />
            </div>
          ))}</div>
        ) : users.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8">
            <span className="text-4xl block mb-2">👥</span>
            <p className="font-bold text-[#9c8a78]">No users found</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {users.map((u, i) => {
              const initial = (u.name || 'U')[0].toUpperCase()
              return (
                <motion.div key={u._id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.25), duration: 0.4 }}
                  className={`flex flex-wrap items-center gap-4 rounded-2xl border px-5 py-4 shadow-sm transition-all duration-200 ${
                    u.isActive
                      ? 'bg-white dark:bg-white/[0.04] border-[#e8dfd0] dark:border-white/8'
                      : 'bg-red-50/50 dark:bg-red-500/[0.05] border-red-200/50 dark:border-red-500/15'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{u.name}</p>
                      {u.role === 'admin' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c8933a]/15 text-[#c8933a]">Admin</span>
                      )}
                      {u.activeMode && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${modeColor(u.activeMode)}`}>
                          {u.activeMode}
                        </span>
                      )}
                      {!u.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400">Suspended</span>
                      )}
                    </div>
                    <p className="text-xs text-[#9c8a78] truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(u)}
                      disabled={busyId === u._id}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 disabled:opacity-50 ${
                        u.isActive
                          ? 'border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                          : 'border border-emerald-200/70 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                      }`}
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={busyId === u._id}
                      className="px-3 py-2 rounded-xl text-xs font-bold border border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:text-red-500 hover:border-red-300 transition-all disabled:opacity-50"
                    >
                      Delete
                    </button>
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

export default ManageUsers
