// Purpose: Displays landing content, categories, and featured workers.
// Landing page showing platform overview, categories, and featured workers
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { config } from '../config'
import axios from 'axios'
import WorkerCard from '../components/worker/WorkerCard'
import Loader from '../components/common/Loader'
import { JOB_CATEGORIES } from '../utils/constants'
import useGeolocation from '../hooks/useGeolocation'

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [featuredWorkers, setFeaturedWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const geo = useGeolocation()
  const [searchInput, setSearchInput] = useState({
    category: '',
    location: ''
  })

  const categories = JOB_CATEGORIES

  useEffect(() => {
    fetchFeaturedWorkers()
  }, [])

  useEffect(() => {
    if (!searchInput.location && geo.manualLocation) {
      setSearchInput((prev) => ({ ...prev, location: geo.manualLocation }))
    }
  }, [geo.manualLocation, searchInput.location])

  const fetchFeaturedWorkers = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/workers?limit=6&sort=rating`)
      
      // Handle different response formats
      let workers = []
      if (response.data && response.data.success && response.data.data) {
        // New response format: { success: true, data: { workers: [] } }
        workers = response.data.data.workers || []
      } else if (response.data && response.data.workers) {
        // Old response format: { workers: [] }
        workers = response.data.workers
      } else if (Array.isArray(response.data)) {
        // Direct array response
        workers = response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Alternative format
        workers = response.data.data
      }
      
      setFeaturedWorkers(workers)
    } catch (error) {
      console.error('Error fetching featured workers:', error)
      setError('Unable to load featured workers. Please try again later.')
      setFeaturedWorkers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (searchInput.category) params.set('category', searchInput.category)
    if (searchInput.location.trim()) {
      params.set('location', searchInput.location.trim())
      geo.updateManualLocation(searchInput.location.trim())
    }
    if (geo.latitude && geo.longitude) {
      params.set('latitude', String(geo.latitude))
      params.set('longitude', String(geo.longitude))
    }
    params.set('sortBy', 'distance')
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{config.appName}</h1>
            <p className="text-xl md:text-2xl mb-6">Find Work. Hire Fast.</p>

            <form onSubmit={handleSearch} className="mx-auto max-w-3xl rounded-2xl bg-white/95 p-4 md:p-5 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={searchInput.category}
                  onChange={(event) => setSearchInput((prev) => ({ ...prev, category: event.target.value }))}
                  className="rounded-lg border border-violet-200 px-4 py-3 text-gray-900 bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={searchInput.location}
                  onChange={(event) => setSearchInput((prev) => ({ ...prev, location: event.target.value }))}
                  placeholder="Location"
                  className="rounded-lg border border-violet-200 px-4 py-3 text-gray-900 bg-white"
                />
                <button type="submit" className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-white font-semibold active:scale-95 transition-transform">
                  Search Jobs
                </button>
              </div>
            </form>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              {!user ? (
                <>
                  <Link 
                    to="/register" 
                    className="bg-white text-violet-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    Get Started
                  </Link>
                  <Link 
                    to="/login" 
                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-violet-700 transition"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <Link 
                  to="/dashboard" 
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={`/search?category=${cat.value}`}
              className="bg-white p-6 text-center rounded-xl shadow-md hover:shadow-lg transition border border-gray-100"
            >
              <span className="text-gray-700 font-medium">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Workers Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Workers</h2>
            <Link to="/search" className="text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : featuredWorkers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No workers found yet. Check back soon!</p>
              <p className="text-sm text-gray-400 mt-2">Workers will appear here once they create their profiles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWorkers.map((worker) => (
                <WorkerCard key={worker._id || worker.userId?._id} worker={worker} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Create Account</h3>
            <p className="text-gray-600">Sign up once and use one account for both working and hiring.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Find or Post Work</h3>
            <p className="text-gray-600">Search by category and location.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Connect & Complete</h3>
            <p className="text-gray-600">Book worker and chat.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home