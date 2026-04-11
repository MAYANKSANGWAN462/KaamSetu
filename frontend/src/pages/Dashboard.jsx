// Dashboard.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ModeSelectionModal from '../components/common/ModeSelectionModal'
import WorkerDashboard from './WorkerDashboard'
import HirerDashboard from './HirerDashboard'
import { motion } from 'framer-motion'

const PageLoader = () => (
  <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center shadow-lg shadow-[#c8833a]/25">
        <span className="text-white font-black text-xl">K</span>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-[#c8933a] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </motion.div>
  </div>
)

const Dashboard = () => {
  const { user, loading: isLoading } = useAuth()

  if (isLoading) return <PageLoader />
  if (!user || !user._id) return <Navigate to="/login" replace />

  const activeMode = user?.activeMode ?? null

  if (activeMode === null) return <ModeSelectionModal />
  if (activeMode === 'worker') return <WorkerDashboard key="worker" />
  if (activeMode === 'hirer') return <HirerDashboard key="hirer" />

  return null
}

export { Dashboard as default }