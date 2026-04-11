
// ──────────────────────────────────────────────
// ManageUsers.jsx
// ──────────────────────────────────────────────
export const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState(null)

  const fetchUsers = async () => {
    try {
      setError('')
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`)
      setUsers(Array.isArray(res.data) ? res.data : res.data?.data || [])
    } catch { setError('Failed to load users.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleToggle = async (userId, currentStatus) => {
    setTogglingId(userId)
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/status`, { isActive: !currentStatus })
      toast.success('User status updated')
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u))
    } catch { toast.error('Failed to update status') }
    finally { setTogglingId(null) }
  }

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const modeColor = (mode) => ({
    worker: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400',
    hirer:  'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400',
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
          <p className="text-sm text-[#9c8a78] mt-1">{users.length} total users registered.</p>
        </motion.div>

        {/* Search */}
        <motion.div {...stagger(1)} className="mb-5">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#b8a898]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full rounded-2xl bg-white dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/10 pl-11 pr-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 placeholder:text-[#b8a898] outline-none focus:border-[#c8933a]/60 transition-all duration-300" />
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
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8">
            <span className="text-4xl block mb-2">👥</span>
            <p className="font-bold text-[#9c8a78]">No users found</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filtered.map((u, i) => {
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
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {initial}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{u.name}</p>
                      {u.activeMode && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${modeColor(u.activeMode)}`}>
                          {u.activeMode}
                        </span>
                      )}
                      {u.isVerified && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9c8a78] truncate">{u.email}</p>
                    <p className="text-[10px] text-[#b8a898] mt-0.5">
                      Joined {new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Toggle */}
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleToggle(u._id, u.isActive)}
                    disabled={togglingId === u._id}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 disabled:opacity-50 ${
                      u.isActive
                        ? 'border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                        : 'border border-emerald-200/70 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                    }`}
                  >
                    {togglingId === u._id ? (
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : u.isActive ? 'Deactivate' : 'Activate'}
                  </motion.button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard