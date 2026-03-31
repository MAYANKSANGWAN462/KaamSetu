// Purpose: Allows authenticated users to post new jobs.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import JobForm from '../components/hirer/JobForm'
import { jobService } from '../services'

const PostJob = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (jobData) => {
    setLoading(true)
    try {
      await jobService.createJob(jobData)
      toast.success('Job posted successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 pt-24">
      <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <JobForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  )
}

export default PostJob