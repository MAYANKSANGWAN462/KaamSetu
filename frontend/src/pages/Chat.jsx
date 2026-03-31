// Purpose: Provides thread view for one-to-one messaging with send and auto-scroll behavior.
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChatWindow from '../components/chat/ChatWindow'
import ChatInput from '../components/chat/ChatInput'
import Loader from '../components/common/Loader'
import { messageService, userService } from '../services'

const Chat = () => {
  const { userId } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    fetchOtherUser()
  }, [userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      const response = await messageService.getMessages(userId)
      setMessages(response?.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOtherUser = async () => {
    try {
      const response = await userService.getUserById(userId)
      setOtherUser(response?.data || response)
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const handleSendMessage = async (text) => {
    if (!text.trim()) return
    setSending(true)
    try {
      const response = await messageService.sendMessage(userId, text)
      const sent = response?.data || response
      setMessages((prev) => [...prev, sent])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col pt-16">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{otherUser?.name || 'Chat'}</h2>
      </div>
      
      {/* Messages */}
      <ChatWindow messages={messages} currentUser={user} />
      <div ref={messagesEndRef} />
      
      {/* Input */}
      <ChatInput onSend={handleSendMessage} sending={sending} />
    </div>
  )
}

export default Chat