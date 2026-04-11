import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const ActionFAB = () => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [showTip, setShowTip] = useState(false)
  const [ripple, setRipple] = useState(false)

  if (!isAuthenticated) return null

  const mode = user?.activeMode ?? null

  const label = mode === 'hirer'  ? 'Post a Job'
              : mode === 'worker' ? 'Post a Gig'
              : 'Choose mode first'

  const sublabel = mode === 'hirer'  ? 'Find workers fast'
                 : mode === 'worker' ? 'Get hired nearby'
                 : null

  const icon = mode === 'hirer' ? (
    // briefcase
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round" />
      <line x1="10" y1="14" x2="14" y2="14" strokeLinecap="round" />
    </svg>
  ) : mode === 'worker' ? (
    // hard hat / person with plus
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 2a5 5 0 015 5v1H7V7a5 5 0 015-5z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M5 8h14M12 12v4m-2-2h4" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M5 8v1a7 7 0 0014 0V8" />
    </svg>
  ) : (
    // plus
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )

  const onClick = () => {
    // Ripple effect
    setRipple(true)
    setTimeout(() => setRipple(false), 500)

    if (mode === 'hirer')  { navigate('/hirer/post-job'); return }
    if (mode === 'worker') { navigate('/worker/post-gig'); return }
    setShowTip(v => !v)
  }

  return (
    <div className="fixed z-[1000]" style={{ bottom: 28, right: 28 }}>

      {/* Tooltip — no-mode state */}
      <AnimatePresence>
        {showTip && mode == null && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[72px] right-0 w-56"
          >
            <div className="bg-white dark:bg-[#1a1208] rounded-2xl border border-[#e8dfd0] dark:border-white/10 shadow-xl shadow-black/10 px-4 py-3.5">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-snug">
                  Select <span className="text-[#c8933a] font-bold">Worker</span> or <span className="text-[#c8933a] font-bold">Hirer</span> mode from the header first.
                </p>
              </div>
              {/* Arrow */}
              <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white dark:bg-[#1a1208] border-r border-b border-[#e8dfd0] dark:border-white/10 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover label pill */}
      <AnimatePresence>
        {!showTip && (
          <motion.div
            key="label-pill"
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 0, x: 10, scale: 0.9 }}
            className="absolute right-[68px] top-1/2 -translate-y-1/2 pointer-events-none"
            id="fab-label"
          />
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        type="button"
        onClick={onClick}
        onBlur={() => setTimeout(() => setShowTip(false), 180)}
        whileHover="hover"
        whileTap="tap"
        initial="idle"
        variants={{
          idle: { scale: 1 },
          hover: { scale: 1.08, y: -2 },
          tap: { scale: 0.93 },
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        aria-label={label}
        className="relative group flex items-center justify-center"
        style={{ width: 58, height: 58 }}
      >
        {/* Glow ring — animated on hover */}
        <motion.div
          variants={{
            idle: { opacity: 0, scale: 0.8 },
            hover: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.25 }}
          className="absolute inset-[-6px] rounded-full bg-gradient-to-br from-[#d4963e]/30 to-[#b86e2a]/20 blur-md pointer-events-none"
        />

        {/* Outer ring (always visible, subtle) */}
        <div className="absolute inset-[-3px] rounded-full border border-[#c8933a]/25 pointer-events-none" />

        {/* Main button body */}
        <div
          className="relative flex items-center justify-center rounded-full overflow-hidden"
          style={{ width: 58, height: 58 }}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#e8a040] via-[#d4863a] to-[#b86020]" />

          {/* Glossy top highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" style={{ borderRadius: 'inherit' }} />

          {/* Shimmer on hover */}
          <motion.div
            variants={{
              idle: { x: '-100%', opacity: 0 },
              hover: { x: '200%', opacity: 1 },
            }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"
          />

          {/* Ripple */}
          <AnimatePresence>
            {ripple && (
              <motion.div
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-white/40 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Icon */}
          <span className="relative z-10 text-white drop-shadow-sm">
            {icon}
          </span>
        </div>

        {/* Drop shadow (separate layer for depth) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: '0 8px 24px rgba(200,131,58,0.45), 0 2px 6px rgba(200,131,58,0.3)',
          }}
        />

        {/* Label tooltip on hover — appears to the left */}
        <motion.div
          variants={{
            idle: { opacity: 0, x: 6, pointerEvents: 'none' },
            hover: { opacity: 1, x: 0, pointerEvents: 'none' },
          }}
          transition={{ duration: 0.2 }}
          className="absolute right-[66px] top-1/2 -translate-y-1/2 whitespace-nowrap"
        >
          <div className="bg-[#1a1208]/90 dark:bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-white/10">
            <p className="text-xs font-bold text-white leading-none">{label}</p>
            {sublabel && (
              <p className="text-[10px] text-white/60 mt-0.5 leading-none">{sublabel}</p>
            )}
          </div>
          {/* Arrow right */}
          <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1a1208]/90 dark:bg-white/10 rotate-45 border-r border-t border-white/10" />
        </motion.div>
      </motion.button>
    </div>
  )
}

export default ActionFAB