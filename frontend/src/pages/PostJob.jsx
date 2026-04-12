import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { jobService } from '../services'
import JobForm from '../components/hirer/JobForm'

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
})

const PostJob = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState(null)
  const [fetching, setFetching] = useState(isEditing)

  useEffect(() => {
    if (!isEditing) return
    const fetchJob = async () => {
      try {
        const res = await jobService.getJobById(id)
        setInitialData(res?.data || res)
      } catch {
        toast.error('Failed to load job')
        navigate('/dashboard')
      } finally { setFetching(false) }
    }
    fetchJob()
  }, [id, isEditing, navigate])

  const handleSubmit = async (jobData) => {
    setLoading(true)
    try {
      if (isEditing) {
        await jobService.updateJob(id, jobData)
        toast.success('Job updated successfully!')
      } else {
        await jobService.createJob(jobData)
        toast.success('Job posted successfully!')
      }
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'post'} job`)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div {...stagger(0)} className="mb-7">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#9c8a78] hover:text-[#c8933a] transition-colors duration-200 mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-1">Hirer Mode</p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            {isEditing ? 'Edit Job' : 'Post a New Job'}
          </h1>
          <p className="text-sm text-[#9c8a78] mt-1">
            {isEditing ? 'Update your job details.' : 'Fill in the details and workers near you will apply.'}
          </p>
        </motion.div>

        <motion.div {...stagger(1)}
          className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm">
          {fetching ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-[#e8dfd0] dark:bg-white/10 rounded-2xl" />
              ))}
            </div>
          ) : (
            <JobForm onSubmit={handleSubmit} loading={loading} initialData={initialData} />
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default PostJob