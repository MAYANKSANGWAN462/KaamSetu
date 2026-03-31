// frontend/src/components/reviews/ReviewForm.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import RatingStars from './RatingStars'

const QUICK_PROMPTS = [
  'Great work ethic!',
  'Very punctual',
  'Skilled & professional',
  'Would hire again',
  'Good communication',
]

const ReviewForm = ({ onSubmit, loading }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (rating === 0) return
    onSubmit({ rating, comment })
  }

  const appendPrompt = (prompt) => {
    setComment(prev =>
      prev ? `${prev.trim()} ${prompt}` : prompt
    )
  }

  const ratingBg = [
    '',
    'from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10',
    'from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10',
    'from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10',
    'from-lime-50 to-green-50 dark:from-lime-900/10 dark:to-green-900/10',
    'from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10',
  ]

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-5"
    >
      {/* Rating section */}
      <motion.div
        animate={{
          background: rating > 0 ? undefined : undefined,
        }}
        className={`p-5 rounded-2xl border transition-all duration-500 bg-gradient-to-br ${
          rating > 0
            ? ratingBg[rating]
            : 'from-gray-50 to-gray-50 dark:from-gray-800/40 dark:to-gray-800/40'
        } border-gray-100 dark:border-gray-700`}
      >
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
          How would you rate this worker?
        </label>
        <RatingStars rating={rating} interactive onChange={setRating} size="lg" />
        {rating === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Tap a star to rate
          </p>
        )}
      </motion.div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Your Review
        </label>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {QUICK_PROMPTS.map((prompt) => (
            <motion.button
              key={prompt}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => appendPrompt(prompt)}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-orange-200 dark:border-orange-700/50 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all duration-150"
            >
              + {prompt}
            </motion.button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience working with this person…"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200 leading-relaxed"
          required
        />

        {/* Character count */}
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${comment.length > 400 ? 'text-orange-500' : 'text-gray-400'}`}>
            {comment.length} chars
          </span>
        </div>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading || rating === 0}
        whileHover={{ scale: loading || rating === 0 ? 1 : 1.01 }}
        whileTap={{ scale: loading || rating === 0 ? 1 : 0.98 }}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-base font-bold shadow-lg shadow-orange-200 dark:shadow-orange-900/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Submitting…
          </span>
        ) : rating === 0 ? (
          'Select a rating first'
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            Submit Review
          </span>
        )}
      </motion.button>
    </motion.form>
  )
}

export default ReviewForm