// frontend/src/components/reviews/RatingStars.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

const RatingStars = ({ rating = 0, interactive = false, onChange, size = 'md' }) => {
  const [hovered, setHovered] = useState(null)
  const stars = [1, 2, 3, 4, 5]

  const active = hovered ?? rating

  const sizeClass = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  }[size] || 'w-7 h-7'

  const handleClick = (value) => {
    if (interactive && onChange) onChange(value)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1">
        {stars.map((star) => {
          const filled = star <= active
          const justHovered = star === hovered

          return (
            <motion.button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(star)}
              onMouseEnter={() => interactive && setHovered(star)}
              onMouseLeave={() => interactive && setHovered(null)}
              whileTap={interactive ? { scale: 0.8 } : {}}
              animate={{
                scale: justHovered ? 1.25 : filled ? 1.05 : 1,
                rotate: justHovered ? [-8, 8, 0] : 0,
              }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={`${sizeClass} flex items-center justify-center focus:outline-none ${
                interactive ? 'cursor-pointer' : 'cursor-default'
              }`}
              aria-label={`${star} star`}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full drop-shadow-sm"
                fill={filled ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={filled ? 0 : 1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  className={
                    filled
                      ? star <= (hovered ?? rating)
                        ? 'text-orange-400'
                        : 'text-orange-300'
                      : 'text-gray-300 dark:text-gray-600'
                  }
                />
              </svg>
            </motion.button>
          )
        })}

        {/* Numeric */}
        {rating > 0 && (
          <span className="ml-1.5 text-sm font-bold text-orange-500 dark:text-orange-400">
            {rating}.0
          </span>
        )}
      </div>

      {/* Label for interactive mode */}
      <AnimatePresence mode="wait">
        {interactive && active > 0 && (
          <motion.span
            key={active}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="text-xs font-semibold text-orange-500 dark:text-orange-400"
          >
            {LABELS[active]}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RatingStars