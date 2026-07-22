// WorkerProfile.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
})

const RatingStars = ({ rating = 0, size = 'sm' }) => {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`${sz} ${i <= Math.round(rating) ? 'text-[#c8933a]' : 'text-[#e8dfd0] dark:text-white/10'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-[#9c8a78] ml-1">{Number(rating).toFixed(1)}</span>
    </div>
  )
}

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-xl bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#c8933a]">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9c8a78] mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value || '—'}</p>
    </div>
  </div>
)

const WorkerProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [worker, setWorker] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasInteraction, setHasInteraction] = useState(false)
  const [contacting, setContacting] = useState(false)

  useEffect(() => { fetchData() }, [id])

  useEffect(() => {
    if (!user?._id || !id || user.activeMode !== 'hirer') return
    const check = async () => {
      try {
        const { applicationService } = await import('../services')
        const res = await applicationService.checkInteraction({ workerId: id })
        setHasInteraction(!!res?.hasInteraction)
      } catch { /* silent */ }
    }
    check()
  }, [user?._id, id])

  const fetchData = async () => {
    try {
      const [wRes, rRes] = await Promise.all([
        api.get(`/workers/${id}`),
        api.get(`/reviews/worker/${id}`)
      ])
      setWorker(wRes?.data?.data || wRes?.data || null)
      setReviews(rRes?.data?.data || rRes?.data || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const handleContact = async () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)
      return
    }
    setContacting(true)
    try {
      const { applicationService } = await import('../services')
      await applicationService.contactWorker({ workerId: id })
      setHasInteraction(true)
    } catch { /* silent */ } finally { setContacting(false) }
  }

  const convId = user?._id && id ? [user._id, id].sort().join('_') : null
  // Role rule: a user must never be able to contact/message their own profile.
  const isOwn = worker?.isOwn || (user?._id && String(user._id) === String(id))
  const workerName = worker?.userId?.name || worker?.name || 'Worker'
  const workerInitial = workerName[0].toUpperCase()
  const photo = worker?.userId?.profilePhoto || worker?.profilePhoto

  if (loading) return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center animate-pulse">
          <span className="text-white font-black text-xl">K</span>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#c8933a] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )

  if (!worker) return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 flex items-center justify-center">
      <div className="text-center">
        <span className="text-4xl block mb-3">🔍</span>
        <p className="font-bold text-gray-700 dark:text-gray-300">Worker not found</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div {...stagger(0)}>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#9c8a78] hover:text-[#c8933a] transition-colors duration-200 mb-6">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </motion.div>

        {/* ── HERO CARD ── */}
        <motion.div {...stagger(1)}
          className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm mb-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-black text-3xl flex-shrink-0 shadow-md shadow-[#c8833a]/20">
                {photo ? <img src={photo} alt={workerName} className="w-full h-full object-cover" /> : workerInitial}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">{workerName}</h1>
                  {worker.isAvailable && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Available
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#9c8a78] mb-2">{worker.category}</p>
                <RatingStars rating={worker.rating?.avg || 0} size="lg" />
                <p className="text-xs text-[#b8a898] mt-0.5">({worker.rating?.count || 0} reviews)</p>
              </div>
            </div>

            {/* Wage */}
            <div className="bg-gradient-to-br from-[#faf7f2] to-[#f0e8da] dark:from-white/[0.06] dark:to-white/[0.03] rounded-2xl border border-[#e8dfd0] dark:border-white/10 px-6 py-4 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9c8a78] mb-1">Wage</p>
              <p className="text-2xl font-black text-[#c8933a]">
                ₹{worker.wage?.amount || worker.dailyRate || worker.hourlyRate || 0}
              </p>
              <p className="text-xs text-[#9c8a78] capitalize">{worker.wage?.unit || 'per day'}</p>
            </div>
          </div>

          {/* Action buttons — hirers only, never on your own profile */}
          {user?.activeMode === 'hirer' && !isOwn && (
            <div className="flex flex-wrap gap-3 pt-5 mt-5 border-t border-[#e8dfd0] dark:border-white/8">
              {!hasInteraction ? (
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={handleContact}
                  disabled={contacting}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25 hover:shadow-[#c8833a]/40 transition-all duration-300 disabled:opacity-60"
                >
                  {contacting ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  )}
                  Contact Worker
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/messages/${convId}`)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25 hover:shadow-[#c8833a]/40 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message Worker
                </motion.button>
              )}
            </div>
          )}

          {!user && (
            <div className="pt-5 mt-5 border-t border-[#e8dfd0] dark:border-white/8">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25 transition-all duration-300"
              >
                Sign in to hire or message
              </motion.button>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Details */}
          <motion.div {...stagger(2)} className="lg:col-span-2 space-y-5">
            {/* About */}
            {worker.bio && (
              <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-3">About</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{worker.bio || worker.description}</p>
              </div>
            )}

            {/* Skills */}
            {(worker.skills || []).length > 0 && (
              <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map(skill => (
                    <span key={skill}
                      className="px-3 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-3xl block mb-2">⭐</span>
                  <p className="text-sm text-[#9c8a78]">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r._id} className="pb-4 border-b border-[#e8dfd0] dark:border-white/8 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <RatingStars rating={r.rating} />
                        <span className="text-xs text-[#b8a898]">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{r.comment}</p>
                      <p className="text-xs text-[#9c8a78] mt-1">— {r.hirerName || 'Anonymous'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar info */}
          <motion.div {...stagger(3)} className="space-y-4">
            <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-6 shadow-sm space-y-5">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78]">Details</h2>
              <InfoRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                label="Category" value={worker.category} />
              <InfoRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                label="Location" value={worker.location?.address || worker.location} />
              {worker.experience && (
                <InfoRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  label="Experience" value={`${worker.experience} years`} />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export { WorkerProfile as default }