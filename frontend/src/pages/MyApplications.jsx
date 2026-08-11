import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { jobService, paymentService, applicationService } from '../services'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }
})

const StatusBadge = ({ status }) => {
  const map = {
    accepted:  { label: 'Accepted',  cls: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-500/20' },
    rejected:  { label: 'Rejected',  cls: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200/70 dark:border-red-500/20' },
    pending:   { label: 'Pending',   cls: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200/70 dark:border-amber-500/20' },
    withdrawn: { label: 'Withdrawn', cls: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200/70 dark:border-white/10' },
    abandoned: { label: 'Abandoned', cls: 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-200/70 dark:border-orange-500/20' },
  }
  const { label, cls } = map[status] || map.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />{label}
    </span>
  )
}

const JobStatusBadge = ({ status }) => {
  const map = {
    open:        { label: 'Open',        cls: 'text-emerald-600 dark:text-emerald-400' },
    filled:      { label: 'Filled',      cls: 'text-blue-600 dark:text-blue-400' },
    in_progress: { label: 'In Progress', cls: 'text-violet-600 dark:text-violet-400' },
    completed:   { label: 'Completed',   cls: 'text-[#c8933a]' },
    cancelled:   { label: 'Cancelled',   cls: 'text-red-500' },
  }
  const { label, cls } = map[status] || {}
  if (!label) return null
  return <span className={`text-[10px] font-bold uppercase tracking-wider ${cls}`}>{label}</span>
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

// Per-application payment section — fetches and displays payment, allows worker to confirm
const PaymentSection = ({ app }) => {
  const [payment, setPayment] = useState(undefined) // undefined = not fetched yet
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const jobStatus = app.jobId?.status

  // Only try to fetch payment when job is completed and application is accepted
  const shouldFetch = app.status === 'accepted' && jobStatus === 'completed'

  useEffect(() => {
    if (!shouldFetch) return
    let cancelled = false
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await paymentService.getApplicationPayment(app._id)
        if (!cancelled) setPayment(res.data)
      } catch {
        if (!cancelled) setPayment(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [app._id, shouldFetch])

  const handleConfirm = async () => {
    if (!payment) return
    setConfirming(true)
    try {
      const res = await paymentService.confirmPayment(payment._id)
      setPayment(res.data)
      toast.success('Payment confirmed! Thank you.')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to confirm payment')
    } finally {
      setConfirming(false)
    }
  }

  if (!shouldFetch) return null
  if (loading) return (
    <div className="mt-2 h-8 bg-[#e6e8ec] dark:bg-white/10 rounded-xl animate-pulse" />
  )

  if (!payment) return (
    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Job completed — waiting for hirer to log payment
    </div>
  )

  if (payment.status === 'confirmed_by_worker') return (
    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Payment confirmed — ₹{payment.amount} received
      {payment.note && <span className="text-emerald-600/70 dark:text-emerald-400/70 font-normal ml-1">· {payment.note}</span>}
    </div>
  )

  // Payment logged by hirer, not yet confirmed by worker
  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 bg-[#c8933a]/5 border border-[#c8933a]/20 rounded-xl">
      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
        <svg className="w-3.5 h-3.5 text-[#c8933a] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>
          Hirer logged <span className="font-bold text-[#c8933a]">₹{payment.amount}</span> cash payment
          {payment.note && <span className="text-[#6b7280] ml-1">· {payment.note}</span>}
        </span>
      </div>
      <button onClick={handleConfirm} disabled={confirming}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white text-xs font-bold disabled:opacity-50 transition-opacity whitespace-nowrap">
        {confirming ? (
          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        Confirm Receipt
      </button>
    </div>
  )
}

const MyApplications = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [withdrawingId, setWithdrawingId] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await jobService.getMyApplications()
        setApplications(res?.data || [])
      } catch { setError('Failed to load applications.') }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  const handleWithdraw = async (appId) => {
    const confirmed = window.confirm(
      'Are you sure you want to withdraw this application? The hirer will be notified.'
    )
    if (!confirmed) return
    setWithdrawingId(appId)
    try {
      await applicationService.withdrawApplication(appId)
      setApplications(prev =>
        prev.map(a => a._id === appId ? { ...a, status: 'withdrawn' } : a)
      )
      toast.success('Application withdrawn.')
    } catch (err) {
      toast.error(err?.response?.data?.message || err || 'Failed to withdraw application')
    } finally {
      setWithdrawingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] dark:bg-[#0b0e14] pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div {...stagger(0)} className="mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-1">Worker Mode</p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Applications</h1>
          <p className="text-sm text-[#6b7280] mt-1">Track all the jobs you've applied to.</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-5">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : applications.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e6e8ec] dark:border-white/8 border-dashed">
            <span className="text-5xl block mb-3">📋</span>
            <p className="font-black text-gray-700 dark:text-gray-300 text-lg mb-1">No applications yet</p>
            <p className="text-sm text-[#6b7280] mb-6">Browse job posts from hirers and apply to get started.</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/search')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25">
              Browse Jobs
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {applications.map((app, i) => {
              const job = app.jobId || {}
              const hirerId = typeof app.hirerId === 'string' ? app.hirerId : app.hirerId?._id
                || (typeof job.createdBy === 'string' ? job.createdBy : job.createdBy?._id)
              const convId = hirerId && user?._id ? [user._id, hirerId].sort().join('_') : null

              return (
                <motion.div key={app._id} {...stagger(i)}
                  className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e6e8ec] dark:border-white/8 px-5 py-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d4963e]/15 to-[#b86e2a]/15 border border-[#c8933a]/20 flex items-center justify-center text-[#c8933a] text-lg flex-shrink-0">
                        💼
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {job.title || 'Job Application'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <p className="text-xs text-[#6b7280] flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location?.city || job.location?.address || 'Location not specified'}
                          </p>
                          {job.status && (
                            <>
                              <span className="text-[#e6e8ec] dark:text-white/20">·</span>
                              <JobStatusBadge status={job.status} />
                            </>
                          )}
                          <span className="text-[#e6e8ec] dark:text-white/20">·</span>
                          <span className="text-xs text-[#6b7280]">
                            {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        {job.wage?.amount > 0 && (
                          <p className="text-xs font-bold text-[#c8933a] mt-0.5">₹{job.wage.amount} / {job.wage.unit || 'day'}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <StatusBadge status={app.status} />
                      {(app.status === 'accepted' || app.status === 'pending') && convId && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/messages/${convId}`)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#c8933a]/50 text-[#c8933a] text-xs font-bold hover:bg-[#c8933a]/5 transition-all duration-200">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Message
                        </motion.button>
                      )}
                      {(app.status === 'pending' || app.status === 'accepted') && (
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleWithdraw(app._id)}
                          disabled={withdrawingId === app._id}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50">
                          {withdrawingId === app._id ? (
                            <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {app.status === 'accepted' ? 'Leave Job' : 'Withdraw'}
                        </motion.button>
                      )}
                      {job._id && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          className="text-xs font-semibold text-[#6b7280] hover:text-[#c8933a] transition-colors duration-200 px-2">
                          View →
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Payment section — only renders when job is completed + app is accepted */}
                  <PaymentSection app={app} />
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyApplications
