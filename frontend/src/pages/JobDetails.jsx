import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { jobService } from '../services'
import { useAuth } from '../context/AuthContext'

const StatusBadge = ({ status }) => {
  const map = {
    open: { label: 'Open', cls: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-500/20' },
    filled: { label: 'Filled', cls: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200/70 dark:border-blue-500/20' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200/70 dark:border-red-500/20' },
  }
  const { label, cls } = map[status] || map.open
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-xl bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9c8a78] dark:text-gray-600 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value || '—'}</p>
    </div>
  </div>
)

const SkeletonBlock = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 w-2/3 bg-[#e8dfd0] dark:bg-white/10 rounded-xl" />
    <div className="h-4 w-1/3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
    <div className="h-px bg-[#e8dfd0] dark:bg-white/10 my-6" />
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-4 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" style={{ width: `${75 + (i * 6)}%` }} />
      ))}
    </div>
  </div>
)

const JobDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [bookingId, setBookingId] = useState('')
  const [hasInteraction, setHasInteraction] = useState(false)

  const fetchJob = async () => {
    try {
      setLoading(true)
      const response = await jobService.getJobById(id)
      // FIX: backend wraps in { success, data: job } so actual job is response.data
      const jobData = response?.data?.data || response?.data || null
      setJob(jobData)
    } catch {
      toast.error('Failed to load job details')
      navigate('/jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJob()
  }, [id])

  // Check if worker has already applied
  useEffect(() => {
    if (!user || !id || user.activeMode !== 'worker') return
    const checkInteraction = async () => {
      try {
        const { applicationService } = await import('../services')
        const res = await applicationService.checkInteraction({ jobId: id })
        setHasInteraction(res?.data?.hasInteraction || res?.hasInteraction || false)
      } catch { /* silent */ }
    }
    checkInteraction()
  }, [user, id])

  const handleApply = async () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }
    if (user.activeMode !== 'worker') {
      toast.error('Switch to Worker mode to apply')
      return
    }
    try {
      setApplying(true)
      await jobService.applyForJob(job._id, {})
      toast.success('Applied successfully!')
      setHasInteraction(true)
      await fetchJob()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to apply')
    } finally {
      setApplying(false)
    }
  }

  const handleBookWorker = async (applicationId) => {
    try {
      setBookingId(applicationId)
      // FIX: acceptApplication only needs applicationId (not jobId)
      await jobService.acceptApplication(null, applicationId)
      toast.success('Worker booked!')
      await fetchJob()
    } catch {
      toast.error('Unable to book worker')
    } finally {
      setBookingId('')
    }
  }

  const isOpen = job?.status === 'open'

  // FIX: model uses hirerId not createdBy
  const hirerId = typeof job?.hirerId === 'string'
    ? job?.hirerId
    : job?.hirerId?._id

  const isOwner = user?._id && hirerId && (hirerId === user._id || hirerId === user._id?.toString())

  const myAcceptedApp = (job?.applications || []).find(a => {
    const wId = typeof a.workerId === 'string' ? a.workerId : a.workerId?._id
    return wId === user?._id && a.status === 'accepted'
  })

  // FIX: conversationId for chat navigation
  const conversationId = user?._id && hirerId
    ? [String(user._id), String(hirerId)].sort().join('_')
    : null

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">

        {loading ? (
          <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-8 shadow-sm">
            <SkeletonBlock />
          </div>
        ) : !job ? null : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ── HEADER CARD ── */}
            <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm mb-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#9c8a78] hover:text-[#c8933a] transition-colors duration-200 mb-3"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <div className="flex items-center gap-3 mb-2">
                    <StatusBadge status={job.status} />
                    {job.category && (
                      <span className="px-3 py-1 rounded-full bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-xs font-semibold text-[#9c8a78]">
                        {job.category}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                    {job.title}
                  </h1>
                  <p className="flex items-center gap-1.5 mt-2 text-sm text-[#9c8a78]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {/* FIX: model stores location.address not location.city */}
                    {job.location?.address || job.location?.city || 'Location not specified'}
                  </p>
                </div>

                {/* Wage */}
                <div className="bg-gradient-to-br from-[#faf7f2] to-[#f0e8da] dark:from-white/[0.06] dark:to-white/[0.03] rounded-2xl border border-[#e8dfd0] dark:border-white/10 px-6 py-4 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9c8a78] mb-1">Wage</p>
                  <p className="text-2xl font-black text-[#c8933a]">
                    ₹{job.wage?.amount || 0}
                  </p>
                  <p className="text-xs text-[#9c8a78] capitalize">{job.wage?.unit || 'per day'}</p>
                </div>
              </div>

              {/* Action buttons — workers only, not owner */}
              {!isOwner && user?.activeMode === 'worker' && (
                <div className="flex flex-wrap gap-3 pt-5 border-t border-[#e8dfd0] dark:border-white/8">
                  {isOpen && !hasInteraction && (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleApply}
                      disabled={applying}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25 hover:shadow-[#c8833a]/40 transition-all duration-300 disabled:opacity-60"
                    >
                      {applying ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Applying…
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Apply Now
                        </>
                      )}
                    </motion.button>
                  )}
                  {hasInteraction && conversationId && (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/messages/${conversationId}`)}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-[#c8933a]/50 text-[#c8933a] font-bold text-sm hover:bg-[#c8933a]/5 transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message Hirer
                    </motion.button>
                  )}
                  {hasInteraction && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Application submitted
                    </div>
                  )}
                </div>
              )}

              {/* Hirer owns this job — show edit button */}
              {isOwner && (
                <div className="flex gap-3 pt-5 border-t border-[#e8dfd0] dark:border-white/8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(`/jobs/${job._id}/edit`)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-[#c8933a]/50 text-[#c8933a] font-bold text-sm hover:bg-[#c8933a]/5 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Job
                  </motion.button>
                </div>
              )}
            </div>

            {/* ── MAIN GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Description */}
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-3">Description</h2>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {job.description || 'No description provided.'}
                  </p>
                </div>

                {/* Skills */}
                {(job.requiredSkills || []).length > 0 && (
                  <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-4">Required Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map(skill => (
                        <span key={skill}
                          className="px-3 py-1.5 rounded-xl bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applicants — owner only */}
                {isOwner && (
                  <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-4">
                      Applicants ({job.applicationCount || 0})
                    </h2>
                    {(job.applications || []).length === 0 ? (
                      <div className="text-center py-8 text-[#9c8a78]">
                        <span className="text-3xl block mb-2">📭</span>
                        <p className="text-sm font-medium">No applications yet</p>
                        <p className="text-xs mt-1 opacity-70">Applications will appear here once workers apply</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {job.applications.map(app => {
                          const worker = app.workerId || {}
                          const wId = typeof worker === 'string' ? worker : worker._id
                          const workerConvId = user?._id && wId
                            ? [String(user._id), String(wId)].sort().join('_')
                            : null
                          return (
                            <motion.div
                              key={app._id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-wrap items-center justify-between gap-3 bg-[#faf7f2] dark:bg-white/[0.03] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {(worker.name || 'W')[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-gray-900 dark:text-white">{worker.name || 'Worker'}</p>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' :
                                    app.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' :
                                    'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                                  }`}>
                                    {app.status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {app.status === 'pending' && (
                                  <motion.button
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => handleBookWorker(app._id)}
                                    disabled={bookingId === app._id}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-60"
                                  >
                                    {bookingId === app._id ? 'Booking…' : 'Book'}
                                  </motion.button>
                                )}
                                {workerConvId && (
                                  <motion.button
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => navigate(`/messages/${workerConvId}`)}
                                    className="px-4 py-2 rounded-xl border border-[#c8933a]/50 text-[#c8933a] text-xs font-bold hover:bg-[#c8933a]/5 transition-all duration-300"
                                  >
                                    Message
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-6 shadow-sm space-y-5">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78]">Job Details</h2>

                  <InfoRow
                    icon={<svg className="w-4 h-4 text-[#c8933a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                    label="Category" value={job.category}
                  />
                  <InfoRow
                    icon={<svg className="w-4 h-4 text-[#c8933a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    label="Location" value={job.location?.address || job.location?.city || '—'}
                  />
                  <InfoRow
                    icon={<svg className="w-4 h-4 text-[#c8933a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    label="Workers Needed" value={job.workersRequired || '1'}
                  />
                  {job.startDate && (
                    <InfoRow
                      icon={<svg className="w-4 h-4 text-[#c8933a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                      label="Start Date" value={new Date(job.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    />
                  )}
                  {job.duration && (
                    <InfoRow
                      icon={<svg className="w-4 h-4 text-[#c8933a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      label="Duration" value={job.duration}
                    />
                  )}

                  {!user && (
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25 hover:shadow-[#c8833a]/40 transition-all duration-300"
                    >
                      Sign in to Apply
                    </motion.button>
                  )}
                </div>

                {job.createdAt && (
                  <div className="bg-[#faf7f2] dark:bg-white/[0.03] rounded-2xl border border-[#e8dfd0] dark:border-white/8 px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9c8a78] mb-1">Posted</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default JobDetails