// Purpose: Shows jobs posted by the logged-in user.
import { useState, useEffect } from 'react'
import Loader from '../components/common/Loader'
import JobCard from '../components/hirer/JobCard'
import { jobService } from '../services'

const MyJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await jobService.getMyJobs()
      setJobs(response.data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Jobs</h1>
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No jobs posted yet</p>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyJobs