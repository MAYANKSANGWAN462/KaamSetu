// Purpose: Renders login page and handles sign-in flow.
// Login page with email/password form
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import { config } from '../config'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleSubmit = async (email, password) => {
    setError('')
    const result = await login(email, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message || 'Invalid credentials')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-md text-gray-900 dark:text-gray-100"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Login to {config.appName}</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <LoginForm onSubmit={handleSubmit} />
        <p className="text-center mt-4 text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
      </motion.div>
    </motion.div>
  )
}

export default Login