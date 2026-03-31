// Purpose: Manages authentication state, token persistence, and current user hydration.
import React, { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { authService } from '../services'

// Create context
export const AuthContext = createContext()

// Custom hook for using auth
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const extractAuthData = (responseData) => {
    const token = responseData?.token || responseData?.data?.token
    const userData = responseData?.data?.data || responseData?.data || responseData?.user || null
    return { token, userData }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const response = await authService.getProfile()
      const profile = response?.data || response
      setUser(profile)
      localStorage.setItem('user', JSON.stringify(profile))
    } catch (error) {
      console.error('Error loading user:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('[AUTH][LOGIN] Request', { email })
      const responseData = await authService.login({ email, password })
      const { token, userData } = extractAuthData({ data: responseData })
      if (!token || !userData) {
        throw new Error('Invalid login response from server')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)

      // Hydrate complete profile so navbar and role capabilities are always up to date
      await loadUser()

      console.log('[AUTH][LOGIN] Response', { success: true, userId: userData?._id })
      toast.success('Login successful!')
      return { success: true, role: userData.role }
    } catch (error) {
      const message = error?.response?.data?.message || error || 'Login failed'
      console.error('[AUTH][LOGIN] Error', { message, status: error.response?.status })
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      console.log('[AUTH][REGISTER] Request', {
        email: userData?.email,
        phone: userData?.phone
      })
      const responseData = await authService.register(userData)
      const { token, userData: newUser } = extractAuthData({ data: responseData })
      if (!token || !newUser) {
        throw new Error('Invalid registration response from server')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(newUser)

      await loadUser()

      console.log('[AUTH][REGISTER] Response', { success: true, userId: newUser?._id })
      toast.success('Registration successful!')
      return { success: true, role: newUser.role }
    } catch (error) {
      const message = error?.response?.data?.message || error || 'Registration failed'
      console.error('[AUTH][REGISTER] Error', { message, status: error.response?.status })
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Logged out successfully')
  }

  const refreshUser = async () => {
    await loadUser()
  }

  const updateProfile = async (profileData) => {
    try {
      await authService.updateProfile(profileData)
      await loadUser()
      toast.success('Profile updated')
      return { success: true }
    } catch (error) {
      const message = error?.response?.data?.message || error || 'Profile update failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}