// frontend/src/components/common/NotificationBell.jsx
// Bell icon in header — shows dropdown of recent notifications + socket-driven toasts
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import toast from 'react-hot-toast'

const MAX_STORED = 30

// Persist notifications in localStorage per user
const storageKey = (userId) => `kaamsetu_notifs_${userId}`

const loadNotifs = (userId) => {
  try { return JSON.parse(localStorage.getItem(storageKey(userId)) || '[]') } catch { return [] }
}

const saveNotifs = (userId, notifs) => {
  try { localStorage.setItem(storageKey(userId), JSON.stringify(notifs.slice(0, MAX_STORED))) } catch {}
}

const formatTime = (iso) => {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const ICONS = {
  newApplication:       { emoji: '📋', color: 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  applicationAccepted:  { emoji: '✅', color: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  applicationRejected:  { emoji: '❌', color: 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400' },
  hirerContact:         { emoji: '👋', color: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  newMessage:           { emoji: '💬', color: 'bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400' },
  jobCancelled:         { emoji: '🚫', color: 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400' },
  applicationStatus:    { emoji: '🔔', color: 'bg-[#faf7f2] dark:bg-white/[0.06] text-[#c8933a]' },
}

const NotificationBell = () => {
  const { user } = useAuth()
  const socket = useSocket()
  const navigate  = useNavigate()
  const [open, setOpen]             = useState(false)
  const [notifs, setNotifs]         = useState([])
  const [unread, setUnread]         = useState(0)
  const dropdownRef = useRef(null)

  // Load persisted notifications on mount
  useEffect(() => {
    if (!user?._id) return
    const stored = loadNotifs(user._id)
    setNotifs(stored)
    setUnread(stored.filter(n => !n.read).length)
  }, [user?._id])

  // Real-time events over the shared authenticated socket
  useEffect(() => {
    if (!socket || !user?._id) return

    const addNotif = (notif) => {
      setNotifs(prev => {
        const updated = [notif, ...prev].slice(0, MAX_STORED)
        saveNotifs(user._id, updated)
        return updated
      })
      setUnread(u => u + 1)
    }

    // New application received (hirer)
    const onNewApplication = (payload) => {
      const notif = {
        id: `${Date.now()}`, type: 'newApplication', read: false,
        title: 'New Application',
        body: `${payload.workerName || 'A worker'} applied for "${payload.jobTitle || 'your job'}"`,
        link: `/jobs/${payload.jobId}`,
        createdAt: new Date().toISOString(),
      }
      addNotif(notif)
      toast(notif.body, { icon: '📋', duration: 4000,
        style: { background: '#fffbf5', border: '1px solid #e8dfd0', color: '#333' } })
    }

    // Hirer contacts worker
    const onHirerContact = (payload) => {
      const notif = {
        id: `${Date.now()}`, type: 'hirerContact', read: false,
        title: 'Hirer wants to connect',
        body: payload.message || 'A hirer wants to connect with you',
        link: '/messages',
        createdAt: new Date().toISOString(),
      }
      addNotif(notif)
      toast(notif.body, { icon: '👋', duration: 4000,
        style: { background: '#fffbf5', border: '1px solid #e8dfd0', color: '#333' } })
    }

    // Application status update (worker)
    const onStatusUpdate = (payload) => {
      const accepted = payload.status === 'accepted'
      const notif = {
        id: `${Date.now()}`,
        type: accepted ? 'applicationAccepted' : 'applicationRejected',
        read: false,
        title: accepted ? 'Application Accepted! 🎉' : 'Application Update',
        body: accepted
          ? 'A hirer accepted your application. You can now chat!'
          : 'Your application was not selected this time.',
        link: payload.jobId ? `/jobs/${payload.jobId}` : null,
        createdAt: new Date().toISOString(),
      }
      addNotif(notif)
      toast(notif.body, {
        icon: accepted ? '✅' : '❌', duration: 5000,
        style: { background: accepted ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${accepted ? '#bbf7d0' : '#fecaca'}`,
          color: '#333' }
      })
    }

    // Job cancelled (worker who applied)
    const onJobCancelled = (payload) => {
      const notif = {
        id: `${Date.now()}`, type: 'jobCancelled', read: false,
        title: 'Job Cancelled',
        body: `"${payload.title || 'A job'}" has been cancelled by the hirer.`,
        link: '/my-applications',
        createdAt: new Date().toISOString(),
      }
      addNotif(notif)
      toast(notif.body, { icon: '🚫', duration: 4000,
        style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#333' } })
    }

    // New direct message (receiver not necessarily in the thread)
    const onNewMessage = (payload) => {
      const convId = payload.conversationId
      const notif = {
        id: `${Date.now()}`, type: 'newMessage', read: false,
        title: payload.senderName || 'New message',
        body: payload.preview || 'You have a new message',
        link: convId ? `/messages/${convId}` : '/messages',
        createdAt: payload.createdAt || new Date().toISOString(),
      }
      addNotif(notif)
      toast(notif.body, { icon: '💬', duration: 4000,
        style: { background: '#fffbf5', border: '1px solid #e8dfd0', color: '#333' } })
    }

    socket.on('newApplication', onNewApplication)
    socket.on('hirerContact', onHirerContact)
    socket.on('applicationStatusUpdate', onStatusUpdate)
    socket.on('jobCancelled', onJobCancelled)
    socket.on('newMessage', onNewMessage)

    return () => {
      socket.off('newApplication', onNewApplication)
      socket.off('hirerContact', onHirerContact)
      socket.off('applicationStatusUpdate', onStatusUpdate)
      socket.off('jobCancelled', onJobCancelled)
      socket.off('newMessage', onNewMessage)
    }
  }, [socket, user?._id])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const markAllRead = () => {
    const updated = notifs.map(n => ({ ...n, read: true }))
    setNotifs(updated)
    setUnread(0)
    if (user?._id) saveNotifs(user._id, updated)
  }

  const handleNotifClick = (notif) => {
    // Mark this one read
    const updated = notifs.map(n => n.id === notif.id ? { ...n, read: true } : n)
    setNotifs(updated)
    setUnread(updated.filter(n => !n.read).length)
    if (user?._id) saveNotifs(user._id, updated)
    setOpen(false)
    if (notif.link) navigate(notif.link)
  }

  const clearAll = () => {
    setNotifs([])
    setUnread(0)
    if (user?._id) saveNotifs(user._id, [])
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(p => !p); if (!open && unread > 0) {} }}
        className="relative w-9 h-9 rounded-xl border border-[#e8dfd0] dark:border-white/10 bg-white dark:bg-white/[0.04] flex items-center justify-center text-[#9c8a78] hover:text-[#c8933a] hover:border-[#c8933a]/40 transition-all duration-200"
        aria-label="Notifications"
      >
        <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread badge */}
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#c8933a] text-white text-[9px] font-black flex items-center justify-center px-1 shadow-sm"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-11 w-80 sm:w-96 bg-white dark:bg-[#1a1814] border border-[#e8dfd0] dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e8dfd0] dark:border-white/8">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-gray-900 dark:text-white">Notifications</h3>
                {unread > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#c8933a]/15 text-[#c8933a] text-[10px] font-black">
                    {unread} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead}
                    className="text-[10px] font-bold text-[#c8933a] hover:text-[#a8732a] transition-colors">
                    Mark all read
                  </button>
                )}
                {notifs.length > 0 && (
                  <button onClick={clearAll}
                    className="text-[10px] font-bold text-[#9c8a78] hover:text-red-500 transition-colors">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-[#e8dfd0] dark:divide-white/8">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <span className="text-3xl mb-2">🔔</span>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">All caught up!</p>
                  <p className="text-xs text-[#9c8a78]">Notifications will appear here when someone applies or messages you.</p>
                </div>
              ) : (
                notifs.map(notif => {
                  const icon = ICONS[notif.type] || ICONS.applicationStatus
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-[#faf7f2] dark:hover:bg-white/[0.03] transition-colors duration-150 ${
                        !notif.read ? 'bg-amber-50/50 dark:bg-amber-500/[0.04]' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${icon.color}`}>
                        {icon.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-[#9c8a78] mt-0.5 leading-relaxed line-clamp-2">
                          {notif.body}
                        </p>
                        <p className="text-[10px] text-[#b8a898] mt-1">{formatTime(notif.createdAt)}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-[#c8933a] flex-shrink-0 mt-1.5" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell