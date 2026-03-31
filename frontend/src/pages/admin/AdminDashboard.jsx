import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Loader from '../../components/common/Loader'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">Total Users</p>
          <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">Total Workers</p>
          <p className="text-3xl font-bold">{stats?.totalWorkers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">Total Jobs</p>
          <p className="text-3xl font-bold">{stats?.totalJobs || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500">Active Jobs</p>
          <p className="text-3xl font-bold">{stats?.activeJobs || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/users" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
          <p className="text-gray-500">View, edit, and manage all users</p>
        </Link>
        <Link to="/admin/jobs" className="bg-white p-6 rounded-lg shadow hover:shadow-md">
          <h2 className="text-xl font-semibold mb-2">Manage Jobs</h2>
          <p className="text-gray-500">View and moderate job listings</p>
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard