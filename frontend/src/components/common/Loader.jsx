// Purpose: Premium animated loader with multiple variants.
import { motion } from 'framer-motion'

/**
 * Loader component
 * @param {string} variant - 'default' | 'fullscreen' | 'inline' | 'dots'
 * @param {string} text - Optional loading text
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const Loader = ({ variant = 'default', text = '', size = 'md' }) => {
  const sizeMap = {
    sm: { outer: 'w-6 h-6', inner: 'w-4 h-4', text: 'text-xs' },
    md: { outer: 'w-10 h-10', inner: 'w-6 h-6', text: 'text-sm' },
    lg: { outer: 'w-16 h-16', inner: 'w-10 h-10', text: 'text-base' },
  }
  const s = sizeMap[size] || sizeMap.md

  // Dots variant
  if (variant === 'dots') {
    return (
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-amber-500"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
        {text && <span className={`${s.text} text-gray-500 dark:text-gray-400 font-medium ml-1`}>{text}</span>}
      </div>
    )
  }

  // Fullscreen variant
  if (variant === 'fullscreen') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white/90 dark:bg-[#0d0d14]/90 backdrop-blur-xl"
      >
        <div className="flex flex-col items-center gap-6">
          {/* Animated bridge logo */}
          <div className="relative w-16 h-16">
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/30"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" d="M3 17 Q7 9 12 9 Q17 9 21 17" />
                <path strokeLinecap="round" d="M7 17 L7 12" />
                <path strokeLinecap="round" d="M12 17 L12 9" />
                <path strokeLinecap="round" d="M17 17 L17 12" />
                <path strokeLinecap="round" d="M3 17 L21 17" />
              </svg>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="rounded-full bg-amber-500"
                animate={{
                  width: ['8px', '24px', '8px'],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                style={{ height: '8px' }}
              />
            ))}
          </div>

          {text && (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
              {text || 'Loading...'}
            </p>
          )}
        </div>
      </motion.div>
    )
  }

  // Inline variant — just a small spinner for inline use
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-2">
        <svg className="animate-spin w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {text && <span className={`${s.text} text-gray-500 dark:text-gray-400`}>{text}</span>}
      </span>
    )
  }

  // Default variant — centered spinner with orbital ring
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className={`relative ${s.outer}`}>
        {/* Outer ring */}
        <div className={`absolute inset-0 rounded-full border-2 border-amber-100 dark:border-amber-500/20`} />
        {/* Spinning arc */}
        <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 border-r-amber-400 animate-spin`} />
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-2 h-2 rounded-full bg-amber-500"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>
      {text && (
        <p className={`${s.text} text-gray-400 dark:text-gray-500 font-medium`}>{text}</p>
      )}
    </div>
  )
}

export default Loader