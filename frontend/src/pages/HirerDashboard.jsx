// Purpose: Displays hirer metrics and recently posted jobs.
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/common/Loader'
import JobCard from '../components/hirer/JobCard'
import { jobService } from '../services'

const HirerDashboard = () => {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hirer Dashboard</h1>
        <Link to="/post-job" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Post New Job
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">Total Jobs Posted</p>
          <p className="text-3xl font-bold">{jobs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">Active Jobs</p>
          <p className="text-3xl font-bold">{jobs.filter(j => j.status === 'open').length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">Completed Jobs</p>
          <p className="text-3xl font-bold">{jobs.filter(j => j.status === 'completed').length}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Your Jobs</h2>
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

export default HirerDashboard