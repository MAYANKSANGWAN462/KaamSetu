import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { messageService, userService } from '../services'
import { makeConversationId } from '../utils/conversationId'

const formatTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const groupMessagesByDate = (messages) => {
  const groups = {}
  messages.forEach(msg => {
    const date = formatDate(msg.createdAt)
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
  })
  return Object.entries(groups)
}

const Chat = () => {
  const { userId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const socketRef = useRef(null)
  const typingTimerRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    fetchOtherUser()
  }, [userId])

  useEffect(() => {
    if (!user?._id || !userId) return
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const socketBase = apiBase.replace(/\/?api\/?$/i, '')
    const socket = io(socketBase, { transports: ['websocket', 'polling'] })
    socketRef.current = socket
    const cid = makeConversationId(user._id, userId)

    socket.emit('join', user._id)
    socket.emit('joinConversation', cid)

    socket.on('receiveMessage', (payload) => {
      if (!payload || payload.conversationId !== cid) return
      if (String(payload.senderId) === String(user._id)) return
      setMessages(prev => [...prev, {
        _id: payload.messageId || `${Date.now()}`,
        message: payload.message,
        senderId: payload.senderId,
        createdAt: payload.createdAt || new Date().toISOString(),
        read: payload.read
      }])
    })

    socket.on('userTyping', ({ senderId }) => {
      if (String(senderId) !== String(user._id)) {
        setIsTyping(true)
        clearTimeout(typingTimerRef.current)
        typingTimerRef.current = setTimeout(() => setIsTyping(false), 2000)
      }
    })

    return () => {
      socket.emit('leaveConversation', cid)
      socket.disconnect()
      socketRef.current = null
    }
  }, [user?._id, userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const fetchMessages = async () => {
    try {
      const res = await messageService.getMessages(userId)
      setMessages(res?.messages || [])
    } catch { /* silent */ } finally { setLoading(false) }
  }

  const fetchOtherUser = async () => {
    try {
      const res = await userService.getUserById(userId)
      setOtherUser(res?.data || res)
    } catch { /* silent */ }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setSending(true)
    // Optimistic
    const optimistic = { _id: `opt-${Date.now()}`, message: text, senderId: user._id, createdAt: new Date().toISOString(), optimistic: true }
    setMessages(prev => [...prev, optimistic])
    try {
      const res = await messageService.sendMessage(userId, text)
      const sent = res?.data || res
      setMessages(prev => prev.map(m => m._id === optimistic._id ? { ...sent } : m))
    } catch {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id))
    } finally { setSending(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (socketRef.current && user?._id) {
      const cid = makeConversationId(user._id, userId)
      socketRef.current.emit('typing', { conversationId: cid, senderId: user._id })
    }
  }

  const otherInitial = (otherUser?.name || 'U')[0].toUpperCase()
  const grouped = groupMessagesByDate(messages)

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] flex flex-col pt-16">

      {/* ── HEADER ── */}
      <div className="sticky top-16 z-20 bg-white/90 dark:bg-[#0e0d0b]/90 backdrop-blur-xl border-b border-[#e8dfd0] dark:border-white/8 px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center text-[#9c8a78] hover:text-[#c8933a] hover:border-[#c8933a]/40 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {loading ? (
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-[#e8dfd0] dark:bg-white/10 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-[#e8dfd0] dark:bg-white/10 rounded-lg animate-pulse" />
              <div className="h-3 w-20 bg-[#e8dfd0] dark:bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {otherUser?.profilePhoto ? (
              <img src={otherUser.profilePhoto} alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#e8dfd0] dark:border-white/10 flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {otherInitial}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{otherUser?.name || 'Chat'}</p>
              <p className="text-xs text-[#9c8a78] dark:text-gray-600">
                {isTyping ? (
                  <span className="text-[#c8933a] font-medium">typing…</span>
                ) : 'Online'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl w-full mx-auto space-y-1">

        {loading ? (
          <div className="space-y-4 pt-4">
            {[false, true, false, false, true].map((isMe, i) => (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`h-10 rounded-2xl animate-pulse ${isMe ? 'bg-[#c8933a]/20' : 'bg-[#e8dfd0] dark:bg-white/10'}`}
                  style={{ width: `${120 + Math.random() * 140}px` }} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#faf7f2] to-[#f0e8da] dark:from-white/[0.06] dark:to-white/[0.03] border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center text-3xl mb-4 shadow-sm">
              💬
            </div>
            <p className="font-bold text-gray-900 dark:text-white mb-1">Start the conversation</p>
            <p className="text-sm text-[#9c8a78]">Send a message to get started.</p>
          </motion.div>
        ) : (
          grouped.map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#e8dfd0] dark:bg-white/8" />
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#b8a898] dark:text-gray-600 px-3 py-1 rounded-full bg-[#faf7f2] dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/8">
                  {date}
                </span>
                <div className="flex-1 h-px bg-[#e8dfd0] dark:bg-white/8" />
              </div>

              <div className="space-y-1.5">
                {msgs.map((msg, idx) => {
                  const isMe = String(msg.senderId) === String(user?._id)
                  const showAvatar = !isMe && (idx === 0 || String(msgs[idx - 1]?.senderId) !== String(msg.senderId))

                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Other user avatar */}
                      {!isMe && (
                        <div className="flex-shrink-0 mb-0.5">
                          {showAvatar ? (
                            otherUser?.profilePhoto ? (
                              <img src={otherUser.profilePhoto} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white text-xs font-bold">
                                {otherInitial}
                              </div>
                            )
                          ) : <div className="w-7" />}
                        </div>
                      )}

                      <div className={`max-w-[72%] group`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white rounded-br-sm shadow-sm shadow-[#c8833a]/20'
                            : 'bg-white dark:bg-white/[0.07] border border-[#e8dfd0] dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'
                        } ${msg.optimistic ? 'opacity-70' : ''}`}>
                          {msg.message || msg.content}
                        </div>
                        <p className={`text-[10px] text-[#b8a898] dark:text-gray-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isMe ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.createdAt)}
                          {isMe && msg.read && ' · Read'}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-end gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {otherInitial}
              </div>
              <div className="px-4 py-3 bg-white dark:bg-white/[0.07] border border-[#e8dfd0] dark:border-white/10 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#c8933a] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT ── */}
      <div className="sticky bottom-0 bg-white/90 dark:bg-[#0e0d0b]/90 backdrop-blur-xl border-t border-[#e8dfd0] dark:border-white/8 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              className="w-full rounded-2xl bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder:text-[#b8a898] dark:placeholder:text-gray-600 outline-none focus:border-[#c8933a]/50 focus:bg-white dark:focus:bg-white/[0.09] transition-all duration-300 resize-none max-h-32"
              style={{ lineHeight: '1.5' }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white shadow-lg shadow-[#c8833a]/25 hover:shadow-[#c8833a]/40 transition-all duration-300 disabled:opacity-40 flex-shrink-0"
          >
            {sending ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </motion.button>
        </div>
        <p className="text-center text-[10px] text-[#b8a898] dark:text-gray-700 mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

export default Chat