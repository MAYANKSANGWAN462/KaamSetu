import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { messageService } from '../services'
import { useAuth } from '../context/AuthContext'

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }
})

const formatTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' })
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
    <div className="w-12 h-12 rounded-2xl bg-[#e8dfd0] dark:bg-white/10 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
      <div className="h-3 w-2/3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
    </div>
    <div className="h-3 w-12 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
  </div>
)

const Messages = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchConversations() }, [])

  const fetchConversations = async () => {
    try {
      setError('')
      const response = await messageService.getConversations()
      setConversations(Array.isArray(response) ? response : response?.data || [])
    } catch {
      setError('Failed to load conversations.')
      setConversations([])
    } finally { setLoading(false) }
  }

  const filtered = conversations.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <motion.div {...stagger(0)} className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-1">Inbox</p>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Messages</h1>
            {conversations.length > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#c8933a]/10 border border-[#c8933a]/20 text-[#c8933a] text-xs font-bold">
                {conversations.filter(c => c.unreadCount > 0).length} unread
              </span>
            )}
          </div>
        </motion.div>

        {/* Search */}
        {conversations.length > 3 && (
          <motion.div {...stagger(1)} className="mb-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-[#b8a898]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full rounded-2xl bg-white dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/10 pl-11 pr-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 placeholder:text-[#b8a898] outline-none focus:border-[#c8933a]/60 transition-all duration-300" />
            </div>
          </motion.div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-4">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
              <button onClick={fetchConversations} className="ml-auto underline font-bold">Retry</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List card */}
        <motion.div {...stagger(2)}
          className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="divide-y divide-[#e8dfd0] dark:divide-white/8">
              {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center px-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#faf7f2] to-[#f0e8da] dark:from-white/[0.06] dark:to-white/[0.03] border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center text-3xl mb-4 shadow-sm">
                💬
              </div>
              <p className="font-black text-gray-900 dark:text-white text-lg mb-1">
                {search ? 'No results' : 'No messages yet'}
              </p>
              <p className="text-sm text-[#9c8a78] leading-relaxed max-w-xs">
                {search
                  ? 'No conversations match your search.'
                  : 'Messages appear here after you apply to a job or contact a worker.'}
              </p>
            </motion.div>
          ) : (
            <div className="divide-y divide-[#e8dfd0] dark:divide-white/8">
              {filtered.map((conv, i) => {
                const initial = (conv.name || 'U')[0].toUpperCase()
                const convId = user?._id && conv.userId
                  ? [user._id, conv.userId].sort().join('_')
                  : conv.conversationId || conv.userId

                return (
                  <motion.div
                    key={conv.userId || conv.conversationId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                  >
                    <Link
                      to={`/messages/${convId}`}
                      className={`flex items-center gap-4 px-5 py-4 transition-all duration-200 group ${
                        conv.unreadCount > 0
                          ? 'bg-[#faf7f2] dark:bg-[#c8933a]/[0.04]'
                          : 'hover:bg-[#faf7f2] dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {conv.profilePhoto ? (
                          <img src={conv.profilePhoto} alt={conv.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-[#e8dfd0] dark:border-white/10" />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-black text-lg shadow-sm shadow-[#c8833a]/20">
                            {initial}
                          </div>
                        )}
                        {/* Online dot */}
                        {conv.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0e0d0b]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-sm font-bold truncate transition-colors duration-200 ${
                            conv.unreadCount > 0
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'
                          }`}>
                            {conv.name || 'Unknown'}
                          </p>
                          <span className="text-[10px] text-[#b8a898] dark:text-gray-600 flex-shrink-0 ml-2">
                            {formatTime(conv.lastMessageTime || conv.updatedAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate max-w-[85%] ${
                            conv.unreadCount > 0
                              ? 'text-gray-700 dark:text-gray-300 font-semibold'
                              : 'text-[#9c8a78]'
                          }`}>
                            {conv.lastMessage || 'No messages yet'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className="flex-shrink-0 ml-2 min-w-[20px] h-5 rounded-full bg-[#c8933a] text-white text-[10px] font-black flex items-center justify-center px-1.5"
                            >
                              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                            </motion.span>
                          )}
                        </div>
                      </div>

                      {/* Chevron */}
                      <svg className="w-4 h-4 text-[#e8dfd0] dark:text-white/20 group-hover:text-[#c8933a] transition-colors duration-200 flex-shrink-0"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
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

export default Messages