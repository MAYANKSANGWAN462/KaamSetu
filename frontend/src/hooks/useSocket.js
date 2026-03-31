import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import { useAuth } from './useAuth'

const useSocket = () => {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')
      newSocket.emit('join', user._id)
      setSocket(newSocket)

      return () => newSocket.close()
    }
  }, [user])

  return socket
}

export default useSocket