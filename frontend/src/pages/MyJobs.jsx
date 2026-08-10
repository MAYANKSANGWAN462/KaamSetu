import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { jobService, paymentService } from '../services'
import axios from 'axios'
import toast from 'react-hot-toast'

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }
})

const STATUS_MAP = {
  open:        { label: 'Open',        cls: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  filled:      { label: 'Filled',      cls: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  in_progress: { label: 'In Progress', cls: 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400' },
  completed:   { label: 'Completed',   cls: 'bg-[#c8933a]/15 text-[#c8933a]' },
  cancelled:   { label: 'Cancelled',   cls: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400' },
}

const StatusBadge = ({ status }) => {
  const { label, cls } = STATUS_MAP[status] || STATUS_MAP.open
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

const SkeletonRow = () => (
  <div className="flex items-center gap-4 bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e6e8ec] dark:border-white/8 p-5 animate-pulse">
    <div className="w-10 h-10 rounded-2xl bg-[#e6e8ec] dark:bg-white/10 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/2 bg-[#e6e8ec] dark:bg-white/10 rounded-lg" />
      <div className="h-3 w-1/3 bg-[#e6e8ec] dark:bg-white/10 rounded-lg" />
    </div>
    <div className="h-7 w-20 bg-[#e6e8ec] dark:bg-white/10 rounded-xl" />
  </div>
)

// Inline payment log form shown per accepted applicant
const LogPaymentForm = ({ app, jobWage, onLogged, onCancel }) => {
  const [amount, setAmount] = useState(jobWage || '')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const val = Number(amount)
    if (!Number.isFinite(val) || val < 0) {
      toast.error('Enter a valid amount')
      return
    }
    setLoading(true)
    try {
      const res = await paymentService.logPayment(app._id, val, note)
      toast.success(`Payment of ₹${val} logged!`)
      onLogged(app._id, res.data)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to log payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 p-3 bg-[#c8933a]/5 border border-[#c8933a]/20 rounded-xl space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#c8933a]">Log Cash Payment</p>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] text-[#6b7280] font-semibold block mb-1">Amount (₹)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm border border-[#e6e8ec] dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c8933a]/40"
            placeholder="e.g. 800"
            required
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-[#6b7280] font-semibold block mb-1">Note (optional)</label>
          <input
            type="text"
            maxLength={100}
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm border border-[#e6e8ec] dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c8933a]/40"
            placeholder="Paid for full day"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#6b7280] border border-[#e6e8ec] dark:border-white/10 hover:bg-[#f6f7f9] dark:hover:bg-white/5 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white text-xs font-bold disabled:opacity-50 transition-opacity">
          {loading && (
            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          Confirm Payment
        </button>
      </div>
    </form>
  )
}

// Payment status badge shown in applicant row
const PaymentBadge = ({ payment }) => {
  if (!payment) return null
  const isConfirmed = payment.status === 'confirmed_by_worker'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
      isConfirmed
        ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
        : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'
    }`}>
      {isConfirmed ? '✓ Payment confirmed' : `₹${payment.amount} logged`}
    </span>
  )
}

const JobRow = ({ job, onStatusChange, onDelete }) => {
  const navigate = useNavigate()
  const [toggling, setToggling] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [applicants, setApplicants] = useState([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  // paymentMap: applicationId → payment object (or null)
  const [paymentMap, setPaymentMap] = useState({})
  // which applicant's log-payment form is open
  const [paymentFormAppId, setPaymentFormAppId] = useState(null)

  const isOpen        = job.status === 'open'
  const isFilled      = job.status === 'filled'
  const isInProgress  = job.status === 'in_progress'
  const isCompleted   = job.status === 'completed'
  const isCancelled   = job.status === 'cancelled'
  const isActive      = isOpen || isFilled || isInProgress

  const patchStatus = async (newStatus, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setToggling(true)
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/jobs/${job._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      toast.success(`Job marked as ${newStatus.replace('_', ' ')}.`)
      onStatusChange(job._id, newStatus)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update job status')
    } finally {
      setToggling(false)
    }
  }

  const loadApplicants = async () => {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (applicants.length > 0) return
    setLoadingApps(true)
    try {
      const { applicationService } = await import('../services')
      const res = await applicationService.getJobApplications(job._id)
      const apps = res?.data || []
      setApplicants(apps)

      // For completed jobs, fetch payment status for each accepted application
      if (isCompleted || isInProgress) {
        const accepted = apps.filter(a => a.status === 'accepted')
        const paymentEntries = await Promise.all(
          accepted.map(async (a) => {
            try {
              const pRes = await paymentService.getApplicationPayment(a._id)
              return [a._id, pRes.data]
            } catch {
              return [a._id, null]
            }
          })
        )
        setPaymentMap(Object.fromEntries(paymentEntries))
      }
    } catch (err) {
      console.error('[MyJobs] Failed to load applicants:', err)
      toast.error('Could not load applicants. Please try again.')
    } finally {
      setLoadingApps(false)
    }
  }

  const handleAccept = async (appId) => {
    try {
      const { applicationService } = await import('../services')
      await applicationService.updateApplication(appId, 'accepted')
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: 'accepted' } : a))
      toast.success('Worker booked!')
    } catch { toast.error('Failed to accept') }
  }

  const handleReject = async (appId) => {
    try {
      const { applicationService } = await import('../services')
      await applicationService.updateApplication(appId, 'rejected')
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: 'rejected' } : a))
      toast.success('Application rejected')
    } catch { toast.error('Failed to reject') }
  }

  const handlePaymentLogged = (appId, payment) => {
    setPaymentMap(prev => ({ ...prev, [appId]: payment }))
    setPaymentFormAppId(null)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await jobService.deleteJob(job._id)
      toast.success('Job deleted.')
      onDelete(job._id)
    } catch (err) {
      const msg = err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to delete job')
      toast.error(msg)
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e6e8ec] dark:border-white/8 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">

          {/* Left — title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <StatusBadge status={job.status} />
              {job.category && (
                <span className="text-[10px] font-semibold text-[#6b7280] bg-[#f6f7f9] dark:bg-white/[0.06] px-2 py-0.5 rounded-full border border-[#e6e8ec] dark:border-white/10">
                  {job.category}
                </span>
              )}
              {job.applicationCount > 0 && (
                <span className="text-[10px] font-bold text-[#c8933a] bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                  {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug truncate">
              {job.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#6b7280]">
              {(job.location?.address || job.location?.city) && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location?.address || job.location?.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>

          {/* Right — wage */}
          <div className="text-right flex-shrink-0">
            <p className="font-black text-[#c8933a] text-lg leading-none">₹{job.wage?.amount || 0}</p>
            <p className="text-[10px] text-[#6b7280] capitalize mt-0.5">{job.wage?.unit || 'per day'}</p>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3.5 border-t border-[#e6e8ec] dark:border-white/8">
          <AnimatePresence mode="wait" initial={false}>
            {showDeleteConfirm ? (
              <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }} className="flex flex-wrap items-center gap-2 w-full">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1 min-w-0">
                  Permanently delete this job post?
                </p>
                <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#6b7280] border border-[#e6e8ec] dark:border-white/10 hover:bg-[#f6f7f9] dark:hover:bg-white/5 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50">
                  {deleting ? (
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  Delete
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }} className="flex flex-wrap items-center gap-2 w-full">

                {/* View applicants */}
                <button onClick={loadApplicants}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#6b7280] hover:text-[#c8933a] transition-colors duration-200">
                  <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                  Applicants {job.applicationCount > 0 ? `(${job.applicationCount})` : ''}
                </button>

                {/* Edit — only if open */}
                {isOpen && (
                  <button onClick={() => navigate(`/jobs/${job._id}/edit`)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#6b7280] hover:text-[#c8933a] transition-colors duration-200">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                )}

                {/* Delete — always visible */}
                {!isCompleted && (
                  <button onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                )}

                <div className="flex-1" />

                {/* ── LIFECYCLE BUTTONS ── */}
                {toggling ? (
                  <span className="flex items-center gap-1.5 text-xs text-[#6b7280]">
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Updating…
                  </span>
                ) : (
                  <>
                    {/* filled → in_progress */}
                    {isFilled && (
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => patchStatus('in_progress', 'Mark this job as In Progress? This means work has started.')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-violet-300 dark:border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all duration-200">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start Work
                      </motion.button>
                    )}

                    {/* in_progress → completed */}
                    {isInProgress && (
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => patchStatus('completed', 'Mark this job as Completed? This will unlock payment logging.')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-[#c8933a]/40 text-[#c8933a] hover:bg-[#c8933a]/5 transition-all duration-200">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mark Complete
                      </motion.button>
                    )}

                    {/* open/cancelled ↔ toggle */}
                    {(isOpen || isCancelled) && (
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => patchStatus(
                          isOpen ? 'cancelled' : 'open',
                          isOpen ? 'Close this job? Workers will no longer be able to apply.' : null
                        )}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                          isOpen
                            ? 'border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                            : 'border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                        }`}>
                        {isOpen ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Close Job
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reopen
                          </>
                        )}
                      </motion.button>
                    )}
                  </>
                )}

                {/* View full details */}
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all duration-200">
                  View
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── APPLICANTS PANEL ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-[#e6e8ec] dark:border-white/8">
            <div className="p-5 bg-[#f6f7f9] dark:bg-white/[0.02] space-y-2">
              {loadingApps ? (
                [...Array(2)].map((_, i) => (
                  <div key={i} className="h-14 bg-[#e6e8ec] dark:bg-white/10 rounded-2xl animate-pulse" />
                ))
              ) : applicants.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-2xl block mb-1">📭</span>
                  <p className="text-xs font-semibold text-[#6b7280]">No applications yet</p>
                </div>
              ) : (
                applicants.map(app => {
                  const worker = app.workerId || {}
                  const wId = typeof worker === 'string' ? worker : worker._id
                  const payment = paymentMap[app._id]
                  const showLogForm = paymentFormAppId === app._id
                  const canLogPayment = isCompleted && app.status === 'accepted' && !payment

                  return (
                    <div key={app._id}
                      className="bg-white dark:bg-white/[0.04] rounded-xl border border-[#e6e8ec] dark:border-white/8 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {(worker.name || 'W')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">
                              {worker.name || 'Worker'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' :
                                app.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' :
                                'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                              }`}>
                                {app.status}
                              </span>
                              <PaymentBadge payment={payment} />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.status === 'pending' && (
                            <>
                              <button onClick={() => handleAccept(app._id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors">
                                Accept
                              </button>
                              <button onClick={() => handleReject(app._id)}
                                className="px-3 py-1.5 rounded-xl border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                Reject
                              </button>
                            </>
                          )}

                          {/* Log Payment button — only for completed jobs, accepted apps, no payment yet */}
                          {canLogPayment && !showLogForm && (
                            <button onClick={() => setPaymentFormAppId(app._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c8933a]/10 border border-[#c8933a]/30 text-[#c8933a] text-xs font-bold hover:bg-[#c8933a]/20 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Log Payment
                            </button>
                          )}

                          {wId && (
                            <button onClick={() => {
                              const user = JSON.parse(localStorage.getItem('user') || '{}')
                              const cId = user?._id ? [String(user._id), String(wId)].sort().join('_') : null
                              if (cId) navigate(`/messages/${cId}`)
                            }}
                              className="px-3 py-1.5 rounded-xl border border-[#c8933a]/50 text-[#c8933a] text-xs font-bold hover:bg-[#c8933a]/5 transition-colors">
                              Message
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline log-payment form */}
                      {showLogForm && (
                        <LogPaymentForm
                          app={app}
                          jobWage={job.wage?.amount}
                          onLogged={handlePaymentLogged}
                          onCancel={() => setPaymentFormAppId(null)}
                        />
                      )}

                      {/* Show logged payment details */}
                      {payment && (
                        <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-[#c8933a]/5 border border-[#c8933a]/15 rounded-xl text-xs text-[#6b7280]">
                          <svg className="w-3.5 h-3.5 text-[#c8933a] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>
                            <span className="font-bold text-gray-900 dark:text-white">₹{payment.amount}</span> cash logged
                            {payment.note && ` · ${payment.note}`}
                            {payment.status === 'confirmed_by_worker' && (
                              <span className="ml-1.5 font-bold text-emerald-600 dark:text-emerald-400">· Worker confirmed receipt</span>
                            )}
                            {payment.status === 'logged_by_hirer' && (
                              <span className="ml-1.5 text-amber-600 dark:text-amber-400">· Waiting for worker confirmation</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MyJobs = () => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchJobs = async () => {
    try {
      setError('')
      const res = await jobService.getMyJobs()
      setJobs(res?.data || [])
    } catch { setError('Failed to load your jobs.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchJobs() }, [])

  const handleStatusChange = (jobId, newStatus) => {
    setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus } : j))
  }

  const handleJobDelete = (jobId) => {
    setJobs(prev => prev.filter(j => j._id !== jobId))
  }

  const stats = {
    total:       jobs.length,
    open:        jobs.filter(j => j.status === 'open').length,
    inProgress:  jobs.filter(j => ['filled', 'in_progress'].includes(j.status)).length,
    completed:   jobs.filter(j => j.status === 'completed').length,
    closed:      jobs.filter(j => j.status === 'cancelled').length,
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] dark:bg-[#0b0e14] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <motion.div {...stagger(0)} className="flex flex-wrap items-start justify-between gap-4 mb-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-1">Hirer Mode</p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Jobs</h1>
            <p className="text-sm text-[#6b7280] mt-1">Manage all your job posts from here.</p>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/hirer/post-job')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25 transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Post New Job
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div {...stagger(1)} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {[
            { label: 'Total',      value: stats.total,      icon: '📋', color: 'text-[#c8933a]' },
            { label: 'Open',       value: stats.open,       icon: '✅', color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Active',     value: stats.inProgress, icon: '⚡', color: 'text-violet-600 dark:text-violet-400' },
            { label: 'Completed',  value: stats.completed,  icon: '🏆', color: 'text-[#c8933a]' },
          ].map(({ label, value, icon, color }) => (
            <div key={label}
              className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e6e8ec] dark:border-white/8 p-4 shadow-sm text-center">
              <p className="text-xl mb-1">{icon}</p>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-5">
              {error}
              <button onClick={fetchJobs} className="ml-auto underline font-bold">Retry</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jobs list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e6e8ec] dark:border-white/8 border-dashed">
            <span className="text-5xl block mb-3">💼</span>
            <p className="font-black text-gray-700 dark:text-gray-300 text-lg mb-1">No jobs posted yet</p>
            <p className="text-sm text-[#6b7280] mb-6">Post your first job to start receiving applications from workers.</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/hirer/post-job')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25">
              Post Your First Job
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <motion.div key={job._id} {...stagger(i + 2)}>
                <JobRow job={job} onStatusChange={handleStatusChange} onDelete={handleJobDelete} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyJobs
