// frontend/src/components/worker/WorkerCard.jsx
// Premium worker card with rating, skills, availability, and hire action.
import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import RatingStars from '../reviews/RatingStars'

const WorkerCard = ({ worker, compact = false }) => {
  const { t } = useLanguage()

  if (!worker) return null

  const {
    _id,
    name,
    profileImage,
    category,
    skills = [],
    rating = 0,
    totalReviews = 0,
    experience,
    hourlyRate,
    location,
    isAvailable = true,
  } = worker

  // ── Compact variant ───────────────────────────────────────────────
  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-white/8 p-4 flex items-center gap-3"
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-amber-500/25">
            {profileImage
              ? <img src={profileImage} alt={name} className="w-full h-full rounded-xl object-cover" />
              : name?.charAt(0)?.toUpperCase()
            }
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#16161f] ${isAvailable ? 'bg-emerald-500' : 'bg-gray-400'}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <RatingStars rating={rating} size="small" />
            <span className="text-xs text-gray-400 dark:text-gray-500">({totalReviews})</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/worker/${_id}`}
          className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg
            bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400
            border border-amber-200 dark:border-amber-500/30
            hover:bg-amber-100 dark:hover:bg-amber-500/20
            transition-colors duration-200"
        >
          {t('worker.viewProfile') || 'View'}
        </Link>
      </motion.div>
    )
  }

  // ── Full card variant ─────────────────────────────────────────────
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-white/8 overflow-hidden
        shadow-sm hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]
        transition-shadow duration-300"
    >
      {/* Hero banner */}
      <div className="relative h-28 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-600 overflow-hidden">
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />
        {/* Soft orb */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/15 blur-2xl" />

        {profileImage && (
          <img src={profileImage} alt={name} className="w-full h-full object-cover opacity-30" />
        )}

        {/* Availability badge */}
        <div className="absolute top-3 right-3">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm border ${
            isAvailable
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
              : 'bg-gray-900/30 border-gray-500/40 text-gray-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
            {isAvailable ? (t('worker.available') || 'Available') : (t('worker.busy') || 'Busy')}
          </span>
        </div>

        {/* Category tag */}
        {category && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/25 backdrop-blur-sm text-white border border-white/20">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Avatar — floats over the banner */}
      <div className="px-4 pb-0 -mt-6 flex items-end justify-between">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#16161f] p-1 shadow-lg ring-2 ring-white dark:ring-[#16161f]">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
              {profileImage
                ? <img src={profileImage} alt={name} className="w-full h-full object-cover rounded-xl" />
                : name?.charAt(0)?.toUpperCase()
              }
            </div>
          </div>
        </div>

        {/* Hourly rate chip */}
        <div className="mb-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25">
          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
            ₹{hourlyRate}<span className="font-normal text-amber-500/70">/hr</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4 space-y-3">
        {/* Name + rating */}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={rating} />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {rating > 0 ? rating.toFixed(1) : '—'} · {totalReviews} {t('worker.reviews', { count: totalReviews }) || 'reviews'}
            </span>
          </div>
        </div>

        {/* Experience + location */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {experience && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {experience}y exp
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg
                  bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400
                  border border-gray-200 dark:border-white/10"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-100 dark:via-white/8 to-transparent" />

        {/* Actions */}
        <div className="flex gap-2 pt-0.5">
          <Link
            to={`/worker/${_id}`}
            className="flex-1 text-center py-2.5 text-sm font-semibold rounded-xl
              border-2 border-gray-200 dark:border-white/10
              text-gray-700 dark:text-gray-300
              hover:border-amber-300 dark:hover:border-amber-500/40
              hover:text-amber-600 dark:hover:text-amber-400
              hover:bg-amber-50 dark:hover:bg-amber-500/5
              transition-all duration-200"
          >
            {t('worker.viewProfile') || 'View Profile'}
          </Link>
          <motion.button
            whileTap={{ scale: 0.96 }}
            disabled={!isAvailable}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white
              bg-gradient-to-r from-amber-500 to-orange-500
              hover:from-amber-400 hover:to-orange-400
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-md shadow-amber-500/20 hover:shadow-amber-500/35
              transition-all duration-200"
          >
            {t('worker.hireNow') || 'Hire Now'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default WorkerCard