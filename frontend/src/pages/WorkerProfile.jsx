// Purpose: Shows worker details and reviews for a selected worker profile.
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import Loader from '../components/common/Loader'
import RatingStars from '../components/reviews/RatingStars'

const WorkerProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [worker, setWorker] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [workerRes, reviewsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/workers/${id}`),
        axios.get(`${import.meta.env.VITE_API_URL}/reviews/worker/${id}`)
      ])
      setWorker(workerRes?.data?.data || workerRes?.data || null)
      setReviews(reviewsRes?.data?.data || reviewsRes?.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />
  if (!worker) return <p className="text-center py-8">Worker not found</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{worker.name}</h1>
        <p className="text-gray-600 mb-4">{worker.category}</p>
        
        <div className="flex items-center gap-2 mb-4">
          <RatingStars rating={worker.rating} />
          <span>({worker.totalReviews} reviews)</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-500">Experience</p>
            <p className="font-semibold">{worker.experience} years</p>
          </div>
          <div>
            <p className="text-gray-500">Daily Rate</p>
            <p className="font-semibold">₹{worker.dailyRate}/day</p>
          </div>
          <div>
            <p className="text-gray-500">Hourly Rate</p>
            <p className="font-semibold">₹{worker.hourlyRate}/hour</p>
          </div>
          <div>
            <p className="text-gray-500">Location</p>
            <p className="font-semibold">{worker.location}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {worker.skills?.map(skill => (
              <span key={skill} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-gray-600">{worker.description}</p>
        </div>

        <button
          onClick={() => navigate('/messages')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Contact Worker
        </button>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <RatingStars rating={review.rating} />
                  <span className="text-sm text-gray-500">{review.createdAt}</span>
                </div>
                <p className="text-gray-600">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-1">- {review.hirerName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkerProfile