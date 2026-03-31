// frontend/src/components/common/ThemeToggle.jsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

const ThemeToggle = () => {
  const { toggleTheme, isDark } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.90 }}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center
        bg-gray-100 dark:bg-white/8
        border border-gray-200 dark:border-white/10
        hover:border-amber-300 dark:hover:border-amber-500/40
        hover:bg-amber-50 dark:hover:bg-amber-500/10
        transition-all duration-200 group overflow-hidden"
    >
      {/* Ambient glow on hover */}
      <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
        bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.12),transparent_70%)]" />

      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          /* Sun — shown when dark mode is active */
          <motion.svg
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-4.5 h-4.5 text-amber-400"
            style={{ width: '18px', height: '18px' }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </motion.svg>
        ) : (
          /* Moon — shown when light mode is active */
          <motion.svg
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-gray-600 group-hover:text-amber-600 transition-colors duration-200"
            style={{ width: '17px', height: '17px' }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default ThemeToggle