// Purpose: Lists user conversations and routes into chat threads.
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/common/Loader'
import { messageService } from '../services'

const Messages = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await messageService.getConversations()
      setConversations(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      {conversations.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No messages yet</p>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {conversations.map(conv => (
            <Link 
              key={conv.userId} 
              to={`/chat/${conv.userId}`}
              className="flex items-center p-4 hover:bg-gray-50 transition"
            >
              <div className="flex-1">
                <p className="font-semibold">{conv.name}</p>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                  {conv.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Messages