// Purpose: Lets a worker set their current availability status with premium visual feedback.
import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  available: {
    label: 'Available',
    sublabel: 'Ready for work',
    color: 'from-emerald-500 to-green-500',
    glow: 'shadow-emerald-500/30',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-300 dark:border-emerald-500/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    pulse: true,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  busy: {
    label: 'Busy',
    sublabel: 'Currently occupied',
    color: 'from-red-500 to-rose-500',
    glow: 'shadow-red-500/30',
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-300 dark:border-red-500/40',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    pulse: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  tomorrow: {
    label: 'Tomorrow',
    sublabel: 'Available from tomorrow',
    color: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/30',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-300 dark:border-amber-500/40',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    pulse: false,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
}

const AvailabilityToggle = ({ status, onToggle }) => {
  const options = ['available', 'busy', 'tomorrow']
  const current = STATUS_CONFIG[status] || STATUS_CONFIG.available

  return (
    <div className="space-y-3">
      {/* Current status pill */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${current.bg} ${current.border} ${current.text}`}>
        <span className="relative flex w-2 h-2">
          <span className={`absolute inline-flex h-full w-full rounded-full ${current.dot} opacity-60 ${current.pulse ? 'animate-ping' : ''}`} />
          <span className={`relative inline-flex w-2 h-2 rounded-full ${current.dot}`} />
        </span>
        {current.label} · {current.sublabel}
      </div>

      {/* Toggle buttons */}
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => {
          const cfg = STATUS_CONFIG[opt]
          const isActive = status === opt

          return (
            <motion.button
              key={opt}
              onClick={() => onToggle(opt)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -1 }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-r ${cfg.color} text-white border-transparent shadow-lg ${cfg.glow}`
                  : `${cfg.bg} ${cfg.text} ${cfg.border} hover:shadow-md`
              }`}
            >
              <span className={isActive ? 'text-white' : cfg.text}>
                {cfg.icon}
              </span>
              <span className="capitalize">{cfg.label}</span>

              {isActive && (
                <motion.div
                  layoutId="availability-active"
                  className="absolute inset-0 rounded-xl ring-2 ring-white/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default AvailabilityToggle