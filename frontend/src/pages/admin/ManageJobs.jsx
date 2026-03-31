import { useState, useEffect } from 'react'
import axios from 'axios'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'

const ManageJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/jobs`)
      setJobs(response.data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/admin/jobs/${jobId}`)
        toast.success('Job deleted')
        fetchJobs()
      } catch (error) {
        toast.error('Failed to delete job')
      }
    }
  }

  const filteredJobs = jobs.filter(job => 
    filter === 'all' ? true : job.status === filter
  )

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Jobs</h1>
      
      <div className="flex gap-2 mb-6">
        {['all', 'open', 'in-progress', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredJobs.map(job => (
          <div key={job._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-gray-600 mt-1">{job.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Budget: ₹{job.budget} | Location: {job.location} | Status: {job.status}
                </p>
              </div>
              <button
                onClick={() => handleDeleteJob(job._id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ManageJobs