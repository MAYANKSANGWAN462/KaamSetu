// frontend/src/components/worker/WorkerCard.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'

const RatingStars = ({ rating = 0 }) => (
  <div className="flex gap-0.5 items-center">
    {[1,2,3,4,5].map(i => (
      <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-[#c8933a]' : 'text-[#e8dfd0] dark:text-white/10'}`}
        fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="text-[10px] text-[#9c8a78] ml-1">{rating > 0 ? rating.toFixed(1) : '—'}</span>
  </div>
)

const WorkerCard = ({ worker, compact = false }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [contacting, setContacting] = React.useState(false)

  if (!worker) return null

  // FIX: backend returns WorkerProfile populated with userId object
  // name/photo/id live on worker.userId, not on worker directly
  const userObj   = worker.userId || {}
  const userId    = typeof userObj === 'string' ? userObj : userObj._id
  const name      = userObj.name || worker.name || 'Worker'
  const photo     = userObj.profilePhoto || worker.profileImage || null
  const initial   = (name || 'W')[0].toUpperCase()

  // FIX: model uses yearsOfExperience not experience
  const experience     = worker.yearsOfExperience ?? worker.experience ?? 0
  const skills         = worker.skills || []
  const category       = worker.category || ''
  const isAvailable    = worker.isAvailable ?? true
  const ratingAvg      = worker.rating?.avg ?? (typeof worker.rating === 'number' ? worker.rating : 0)
  const ratingCount    = worker.rating?.count ?? worker.totalReviews ?? 0
  const wageAmount     = worker.wage?.amount ?? worker.hourlyRate ?? 0
  const wageUnit       = worker.wage?.unit ?? 'daily'
  const locationStr    = worker.location?.address || worker.location?.city ||
    (typeof worker.location === 'string' ? worker.location : '') || ''
  const availDays      = worker.availability?.days || []
  const bio            = worker.bio || ''
  const distanceKm     = worker.distanceKm != null ? Number(worker.distanceKm).toFixed(1) : null

  const handleContact = async () => {
    if (!user) { navigate('/login'); return }
    if (user.activeMode !== 'hirer') {
      toast.error('Switch to Hire Mode to contact workers')
      return
    }
    if (!userId) { toast.error('Worker profile incomplete'); return }
    setContacting(true)
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/applications/contact`,
        { workerId: userId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      const convId = [String(user._id), String(userId)].sort().join('_')
      toast.success('Connected! Opening chat…')
      navigate(`/messages/${convId}`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not contact worker')
    } finally {
      setContacting(false)
    }
  }

  // ── Compact variant ──────────────────────────────────────────────
  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-4 flex items-center gap-3"
      >
        <div className="relative flex-shrink-0">
          {photo
            ? <img src={photo} alt={name} className="w-11 h-11 rounded-xl object-cover border border-[#e8dfd0] dark:border-white/10" />
            : <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-bold text-base">{initial}</div>
          }
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0e0d0b] ${isAvailable ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{name}</p>
          <RatingStars rating={ratingAvg} />
        </div>
        <Link to={`/worker/${userId}`}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 dark:bg-amber-500/10 text-[#c8933a] border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 transition-colors duration-200">
          View
        </Link>
      </motion.div>
    )
  }

  // ── Full card ────────────────────────────────────────────────────
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="group bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 overflow-hidden shadow-sm transition-shadow duration-300 flex flex-col"
    >
      {/* Hero banner */}
      <div className="relative h-24 bg-gradient-to-br from-[#d4963e] via-[#c8833a] to-[#b86e2a] overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '18px 18px' }} />
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/15 blur-xl" />

        {/* Availability badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm border ${
            isAvailable
              ? 'bg-emerald-500/20 border-emerald-400/40 text-white'
              : 'bg-black/30 border-white/20 text-white/70'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-300 animate-pulse' : 'bg-gray-400'}`} />
            {isAvailable ? 'Available' : 'Busy'}
          </span>
        </div>

        {/* Category */}
        {category && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-black/25 backdrop-blur-sm text-white border border-white/20">
              {category}
            </span>
          </div>
        )}

        {/* Distance */}
        {distanceKm !== null && (
          <div className="absolute bottom-2.5 right-2.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/25 backdrop-blur-sm text-white border border-white/15">
              📍 {distanceKm} km
            </span>
          </div>
        )}
      </div>

      {/* Avatar overlapping banner */}
      <div className="px-4 -mt-5 flex items-end justify-between">
        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0e0d0b] p-0.5 shadow-lg ring-2 ring-white dark:ring-[#0e0d0b]">
          {photo
            ? <img src={photo} alt={name} className="w-full h-full rounded-xl object-cover" />
            : <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-black text-lg">{initial}</div>
          }
        </div>
        {wageAmount > 0 && (
          <div className="mb-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex-shrink-0">
            <span className="text-xs font-black text-[#c8933a]">
              ₹{wageAmount}
              <span className="font-normal text-[#c8933a]/70 text-[10px]">
                /{wageUnit === 'daily' ? 'day' : wageUnit === 'hourly' ? 'hr' : 'job'}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-2.5 pb-4 space-y-2.5 flex-1 flex flex-col">
        {/* Name + rating */}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={ratingAvg} />
            {ratingCount > 0 && (
              <span className="text-[10px] text-[#9c8a78]">({ratingCount} reviews)</span>
            )}
          </div>
        </div>

        {/* Experience + location row */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#9c8a78]">
          {experience > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-[#c8933a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {experience} yr{experience !== 1 ? 's' : ''} exp
            </span>
          )}
          {locationStr && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-[#c8933a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {locationStr}
            </span>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-[11px] text-[#9c8a78] leading-relaxed line-clamp-2">{bio}</p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill, i) => (
              <span key={i}
                className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-amber-50 dark:bg-amber-500/10 text-[#c8933a] border border-amber-200 dark:border-amber-500/25">
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-[#faf7f2] dark:bg-white/[0.06] text-[#9c8a78] border border-[#e8dfd0] dark:border-white/10">
                +{skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Available days */}
        {availDays.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {availDays.map(day => (
              <span key={day}
                className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#faf7f2] dark:bg-white/[0.04] text-[#9c8a78] border border-[#e8dfd0] dark:border-white/8 uppercase tracking-wide">
                {day.slice(0,3)}
              </span>
            ))}
          </div>
        )}

        {/* Actions — pushed to bottom */}
        <div className="mt-auto pt-3 border-t border-[#e8dfd0] dark:border-white/8 flex gap-2">
          <Link
            to={`/worker/${userId}`}
            className="flex-1 text-center py-2.5 text-xs font-bold rounded-xl border border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/50 hover:text-[#c8933a] hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-all duration-200"
          >
            View Profile
          </Link>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleContact}
            disabled={!isAvailable || contacting}
            className="flex-1 py-2.5 text-xs font-bold rounded-xl text-white bg-gradient-to-br from-[#d4963e] to-[#b86e2a] shadow-sm hover:shadow-md shadow-[#c8833a]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            {contacting ? 'Connecting…' : 'Contact'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default WorkerCard