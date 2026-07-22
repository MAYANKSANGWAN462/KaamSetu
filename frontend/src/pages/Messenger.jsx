// Purpose: WhatsApp/Instagram-style two-pane messenger — conversation list (left)
// + chat window with a fixed input (right). One authenticated socket (SocketContext)
// drives real-time delivery, typing, and read state. No whole-page scrolling: the
// list and the message thread each scroll independently within the viewport.
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { messageService, userService } from '../services'
import { makeConversationId } from '../utils/conversationId'

/* ── helpers ────────────────────────────────────────────── */

const senderIdOf = (msg) => String(msg?.senderId?._id ?? msg?.senderId ?? '')

const contentOf = (msg) => msg?.content ?? msg?.message ?? ''

const formatTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const formatListTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const diffDays = Math.floor((Date.now() - d) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' })
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const formatDateLabel = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const groupByDate = (messages) => {
  const groups = {}
  messages.forEach((m) => {
    const key = formatDateLabel(m.createdAt)
    if (!groups[key]) groups[key] = []
    groups[key].push(m)
  })
  return Object.entries(groups)
}

const Avatar = ({ photo, name, size = 'md' }) => {
  const s = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-lg'
  const initial = (name || 'U')[0].toUpperCase()
  return photo ? (
    <img src={photo} alt={name} className={`${s} rounded-2xl object-cover border-2 border-[#e8dfd0] dark:border-white/10`} />
  ) : (
    <div className={`${s} rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-black shadow-sm shadow-[#c8833a]/20`}>
      {initial}
    </div>
  )
}

/* ── component ──────────────────────────────────────────── */

const Messenger = () => {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const socket = useSocket()
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [search, setSearch] = useState('')

  const [messages, setMessages] = useState([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [otherUser, setOtherUser] = useState(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)

  const endRef = useRef(null)
  const typingTimer = useRef(null)

  const myId = String(user?._id || '')
  const otherUserId = conversationId
    ? conversationId.split('_').find((id) => id !== myId)
    : null

  /* ── conversation list ── */
  const fetchConversations = useCallback(async () => {
    try {
      const res = await messageService.getConversations()
      setConversations(Array.isArray(res) ? res : res?.data || [])
    } catch {
      setConversations([])
    } finally {
      setLoadingConvs(false)
    }
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  /* ── active conversation: history + peer ── */
  useEffect(() => {
    if (!conversationId || !otherUserId) {
      setMessages([])
      setOtherUser(null)
      return
    }
    let cancelled = false
    setLoadingMsgs(true)
    setPeerTyping(false)

    ;(async () => {
      try {
        const [msgRes, userRes] = await Promise.all([
          messageService.getMessages(conversationId),
          userService.getUserById(otherUserId),
        ])
        if (cancelled) return
        setMessages(msgRes?.data?.messages || msgRes?.messages || [])
        setOtherUser(userRes?.data || userRes || null)
        // Opening a thread clears its unread badge in the list.
        setConversations((prev) =>
          prev.map((c) => (c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c)))
      } catch {
        if (!cancelled) { setMessages([]); }
      } finally {
        if (!cancelled) setLoadingMsgs(false)
      }
    })()

    return () => { cancelled = true }
  }, [conversationId, otherUserId])

  /* ── socket: join active room + live events ── */
  useEffect(() => {
    if (!socket) return

    const onReceive = (payload) => {
      if (payload?.conversationId !== conversationId) return
      if (senderIdOf(payload) === myId) return
      setMessages((prev) => [...prev, {
        _id: payload.messageId || `rx-${Date.now()}`,
        content: payload.content,
        senderId: payload.senderId,
        createdAt: payload.createdAt || new Date().toISOString(),
        isRead: false,
      }])
    }

    const onTyping = ({ userId, isTyping }) => {
      if (String(userId) === myId) return
      if (otherUserId && String(userId) !== String(otherUserId)) return
      setPeerTyping(Boolean(isTyping))
      clearTimeout(typingTimer.current)
      if (isTyping) typingTimer.current = setTimeout(() => setPeerTyping(false), 2500)
    }

    // A message in any conversation refreshes the list previews/unread counts.
    const onNewMessage = () => { fetchConversations() }

    socket.on('receiveMessage', onReceive)
    socket.on('userTyping', onTyping)
    socket.on('newMessage', onNewMessage)

    if (conversationId) socket.emit('joinConversation', conversationId)

    return () => {
      socket.off('receiveMessage', onReceive)
      socket.off('userTyping', onTyping)
      socket.off('newMessage', onNewMessage)
      if (conversationId) socket.emit('leaveConversation', conversationId)
    }
  }, [socket, conversationId, otherUserId, myId, fetchConversations])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, peerTyping, loadingMsgs])

  /* ── send ── */
  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending || !otherUserId) return
    setInput('')
    setSending(true)
    const optimistic = {
      _id: `opt-${Date.now()}`,
      content: text,
      senderId: myId,
      createdAt: new Date().toISOString(),
      optimistic: true,
    }
    setMessages((prev) => [...prev, optimistic])
    try {
      const res = await messageService.sendMessage(otherUserId, text)
      const sent = res?.data || res
      setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? sent : m)))
      fetchConversations()
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id))
      toast.error(typeof err === 'string' ? err : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (socket && otherUserId) {
      socket.emit('typing', { receiverId: otherUserId, isTyping: true })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const filteredConvs = conversations.filter(
    (c) => !search || c.name?.toLowerCase().includes(search.toLowerCase()))

  const otherName = otherUser?.name || 'Chat'
  const otherPhoto = otherUser?.profilePhoto
  const grouped = groupByDate(messages)

  /* ── render ── */
  return (
    <div className="h-[calc(100dvh-4rem)] bg-[#faf7f2] dark:bg-[#0e0d0b] flex overflow-hidden">

      {/* ── LEFT: conversation list ── */}
      <aside className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-[#e8dfd0] dark:border-white/8 bg-white dark:bg-white/[0.02] flex flex-col ${conversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-5 pt-5 pb-3 border-b border-[#e8dfd0] dark:border-white/8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Messages</h1>
            {conversations.some((c) => c.unreadCount > 0) && (
              <span className="px-3 py-1 rounded-full bg-[#c8933a]/10 border border-[#c8933a]/20 text-[#c8933a] text-xs font-bold">
                {conversations.filter((c) => c.unreadCount > 0).length} unread
              </span>
            )}
          </div>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b8a898] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full rounded-2xl bg-[#faf7f2] dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/10 pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder:text-[#b8a898] outline-none focus:border-[#c8933a]/60 transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-3 space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-3 animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-[#e8dfd0] dark:bg-white/10 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
                    <div className="h-3 w-2/3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#faf7f2] to-[#f0e8da] dark:from-white/[0.06] dark:to-white/[0.03] border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center text-2xl mb-3">💬</div>
              <p className="font-bold text-gray-900 dark:text-white mb-1">{search ? 'No results' : 'No messages yet'}</p>
              <p className="text-xs text-[#9c8a78] leading-relaxed">
                {search ? 'No conversations match your search.' : 'Conversations appear here after you apply to a job or contact a worker.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#e8dfd0] dark:divide-white/8">
              {filteredConvs.map((conv) => {
                const isActive = conv.conversationId === conversationId
                return (
                  <button
                    key={conv.conversationId}
                    onClick={() => navigate(`/messages/${conv.conversationId}`)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-[#c8933a]/[0.08] dark:bg-[#c8933a]/[0.10]'
                        : conv.unreadCount > 0
                          ? 'bg-[#faf7f2] dark:bg-white/[0.03]'
                          : 'hover:bg-[#faf7f2] dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    <Avatar photo={conv.profilePhoto} name={conv.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-black text-gray-900 dark:text-white' : 'font-bold text-gray-800 dark:text-gray-200'}`}>
                          {conv.name || 'Unknown'}
                        </p>
                        <span className="text-[10px] text-[#b8a898] flex-shrink-0 ml-2">{formatListTime(conv.lastMessageTime)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-700 dark:text-gray-300 font-semibold' : 'text-[#9c8a78]'}`}>
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="flex-shrink-0 min-w-[20px] h-5 rounded-full bg-[#c8933a] text-white text-[10px] font-black flex items-center justify-center px-1.5">
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ── RIGHT: chat window ── */}
      <section className={`flex-1 flex-col min-w-0 ${conversationId ? 'flex' : 'hidden md:flex'}`}>
        {!conversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#faf7f2] to-[#f0e8da] dark:from-white/[0.06] dark:to-white/[0.03] border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center text-4xl mb-5 shadow-sm">💬</div>
            <p className="font-black text-xl text-gray-900 dark:text-white mb-1">Your messages</p>
            <p className="text-sm text-[#9c8a78] max-w-xs">Select a conversation to start chatting.</p>
          </div>
        ) : (
          <>
            {/* chat header */}
            <div className="flex-shrink-0 bg-white/90 dark:bg-[#0e0d0b]/90 backdrop-blur-xl border-b border-[#e8dfd0] dark:border-white/8 px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => navigate('/messages')}
                className="md:hidden w-9 h-9 rounded-xl border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center text-[#9c8a78] hover:text-[#c8933a]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => otherUserId && navigate(`/worker/${otherUserId}`)}
                className="flex items-center gap-3 min-w-0"
              >
                <Avatar photo={otherPhoto} name={otherName} size="lg" />
                <div className="min-w-0 text-left">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{otherName}</p>
                  <p className="text-xs text-[#9c8a78]">
                    {peerTyping ? <span className="text-[#c8933a] font-medium">typing…</span> : 'View profile'}
                  </p>
                </div>
              </button>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
              {loadingMsgs ? (
                <div className="space-y-4">
                  {[false, true, false, true, false].map((me, i) => (
                    <div key={i} className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
                      <div className={`h-10 rounded-2xl animate-pulse ${me ? 'bg-[#c8933a]/20' : 'bg-[#e8dfd0] dark:bg-white/10'}`} style={{ width: `${120 + i * 26}px` }} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#faf7f2] to-[#f0e8da] dark:from-white/[0.06] dark:to-white/[0.03] border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center text-2xl mb-3">👋</div>
                  <p className="font-bold text-gray-900 dark:text-white mb-1">Say hello</p>
                  <p className="text-sm text-[#9c8a78]">Send a message to start the conversation.</p>
                </div>
              ) : (
                grouped.map(([date, msgs]) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-[#e8dfd0] dark:bg-white/8" />
                      <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#b8a898] px-3 py-1 rounded-full bg-[#faf7f2] dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/8">{date}</span>
                      <div className="flex-1 h-px bg-[#e8dfd0] dark:bg-white/8" />
                    </div>
                    <div className="space-y-1.5">
                      {msgs.map((msg) => {
                        const isMe = senderIdOf(msg) === myId
                        return (
                          <motion.div
                            key={msg._id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="max-w-[75%] group">
                              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                                isMe
                                  ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white rounded-br-sm shadow-sm'
                                  : 'bg-white dark:bg-white/[0.07] border border-[#e8dfd0] dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm'
                              } ${msg.optimistic ? 'opacity-70' : ''}`}>
                                {contentOf(msg)}
                              </div>
                              <p className={`text-[10px] text-[#b8a898] mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-right' : 'text-left'}`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}

              <AnimatePresence>
                {peerTyping && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                    <div className="px-4 py-3 bg-white dark:bg-white/[0.07] border border-[#e8dfd0] dark:border-white/10 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#c8933a] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={endRef} />
            </div>

            {/* fixed input */}
            <div className="flex-shrink-0 bg-white/95 dark:bg-[#0e0d0b]/95 backdrop-blur-xl border-t border-[#e8dfd0] dark:border-white/8 px-4 py-3">
              <div className="flex items-end gap-3">
                <textarea
                  rows={1}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  className="flex-1 rounded-2xl bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder:text-[#b8a898] outline-none focus:border-[#c8933a]/50 resize-none max-h-32"
                  style={{ lineHeight: '1.5' }}
                />
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white shadow-lg shadow-[#c8833a]/25 disabled:opacity-40 flex-shrink-0"
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
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default Messenger
