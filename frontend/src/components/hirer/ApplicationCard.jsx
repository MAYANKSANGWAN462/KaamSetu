// frontend/src/components/hirer/ApplicationCard.jsx
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const ApplicationCard = ({ application, onStatusChange }) => {
  const [isProcessing, setIsProcessing] = useState(null)
  const [showConfirm, setShowConfirm] = useState(null)

  const handleStatus = async (status) => {
    setIsProcessing(status)
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/applications/${application._id}`, { status })
      toast.success(
        <div className="flex items-center gap-2">
          <span>{status === 'accepted' ? '✅' : '❌'}</span>
          <span>Application {status}</span>
        </div>
      )
      onStatusChange()
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsProcessing(null)
      setShowConfirm(null)
    }
  }

  const statusConfig = {
    accepted: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-700',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      icon: '✓'
    },
    rejected: {
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-200 dark:border-rose-700',
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
      dot: 'bg-rose-500',
      icon: '✕'
    },
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-700',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      dot: 'bg-amber-400',
      icon: '◷'
    }
  }

  const cfg = statusConfig[application.status] || statusConfig.pending
  const initials = (application.workerName || 'W')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // gradient based on name for avatar
  const gradients = [
    'from-violet-500 to-indigo-600',
    'from-orange-400 to-rose-500',
    'from-emerald-400 to-teal-600',
    'from-sky-400 to-blue-600',
    'from-amber-400 to-orange-600',
  ]
  const gradientIndex = (application.workerName || '').charCodeAt(0) % gradients.length
  const avatarGradient = gradients[gradientIndex]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`relative rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-colors duration-300`}
    >
      {/* Top accent line */}
      <div className={`h-0.5 w-full bg-gradient-to-r ${
        application.status === 'accepted' ? 'from-emerald-400 to-teal-500' :
        application.status === 'rejected' ? 'from-rose-400 to-pink-500' :
        'from-amber-400 to-orange-400'
      }`} />

      <div className="p-5">
        <div className="flex gap-4 items-start">
          {/* Avatar */}
          <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
            {initials}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                {application.workerName}
              </h3>

              {/* Status badge */}
              <span className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${application.status === 'pending' ? 'animate-pulse' : ''}`} />
                <span className="capitalize">{application.status}</span>
              </span>
            </div>

            {/* Bid */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">Bid:</span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                ₹{application.bidAmount?.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Message */}
            {application.message && (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 bg-white/50 dark:bg-black/20 rounded-lg px-3 py-2">
                "{application.message}"
              </p>
            )}
          </div>
        </div>

        {/* Actions for pending */}
        <AnimatePresence mode="wait">
          {application.status === 'pending' && !showConfirm && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex gap-2.5 mt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowConfirm('accepted')}
                disabled={!!isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30 transition-all duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Accept
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowConfirm('rejected')}
                disabled={!!isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-rose-200 dark:border-rose-700 text-rose-600 dark:text-rose-400 text-sm font-semibold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Decline
              </motion.button>
            </motion.div>
          )}

          {/* Confirm dialog */}
          {showConfirm && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`mt-4 p-3 rounded-xl border text-sm ${
                showConfirm === 'accepted'
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'
                  : 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700'
              }`}
            >
              <p className="text-center font-medium text-gray-700 dark:text-gray-200 mb-3">
                {showConfirm === 'accepted'
                  ? '✅ Accept this application?'
                  : '❌ Decline this application?'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatus(showConfirm)}
                  disabled={!!isProcessing}
                  className={`flex-1 py-2 rounded-lg text-white font-semibold text-sm transition-all ${
                    showConfirm === 'accepted'
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-rose-500 hover:bg-rose-600'
                  } disabled:opacity-60`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Processing…
                    </span>
                  ) : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowConfirm(null)}
                  className="flex-1 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default ApplicationCard