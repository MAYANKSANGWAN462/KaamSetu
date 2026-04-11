import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import LoginForm from '../components/auth/LoginForm'


const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')

  const handleSubmit = async (email, password) => {
    setError('')
    const result = await login(email, password)
    if (result.success) {
      const redirect = searchParams.get('redirect')
      const safe =
        redirect && redirect.startsWith('/') && !redirect.startsWith('//')
          ? redirect : '/dashboard'
      navigate(safe)
    } else {
      setError(result.message || 'Invalid credentials')
    }
    return result
  }

  // const handleGoogleLogin = async (credential) => {
  //   setError('')
  //   const result = await googleLogin(credential)
  //   if (result.success) {
  //     const redirect = searchParams.get('redirect')
  //     const safe =
  //       redirect && redirect.startsWith('/') && !redirect.startsWith('//')
  //         ? redirect : '/dashboard'
  //     navigate(safe)
  //   } else {
  //     setError(result.message || 'Google login failed')
  //   }
  // }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] flex">

      {/* ── LEFT PANEL (decorative, desktop only) ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12">
        {/* BG */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1208] via-[#2d1f0a] to-[#1a1208]" />
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />
        <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-[#c8833a]/20 blur-[80px]" />
        <div className="absolute bottom-1/4 -left-10 w-56 h-56 rounded-full bg-[#d4963e]/15 blur-[60px]" />

        {/* Logo */}
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center">
              <span className="text-white font-black text-sm">K</span>
            </div>
            <span className="text-white font-black text-xl tracking-tight">
              Kaam<span className="text-[#c8933a]">Setu</span>
            </span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Welcome back to<br />
              <span className="text-[#c8933a]">India's trusted</span><br />
              job marketplace
            </h2>
            <p className="text-[#a89070] text-sm leading-relaxed">
              Connecting daily-wage workers and hirers across India — locally, quickly, reliably.
            </p>
          </motion.div>

          {/* Testimonial-style stat cards */}
          {[
            { icon: '👷', stat: '10,000+', label: 'Workers registered' },
            { icon: '💼', stat: '5,000+', label: 'Jobs filled' },
          ].map(({ icon, stat, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="flex items-center gap-4 bg-white/[0.06] rounded-2xl border border-white/10 px-5 py-4"
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-[#c8933a] font-black text-lg leading-none">{stat}</p>
                <p className="text-[#6e5c48] text-xs mt-0.5">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="relative">
          <p className="text-[#4a3c2e] text-xs">© 2025 KaamSetu. All rights reserved.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center">
                <span className="text-white font-black text-sm">K</span>
              </div>
              <span className="text-gray-900 dark:text-white font-black text-xl tracking-tight">
                Kaam<span className="text-[#c8933a]">Setu</span>
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1.5">Sign in</h1>
            <p className="text-sm text-[#9c8a78] dark:text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#c8933a] font-semibold hover:text-[#a8732a] transition-colors duration-200">
                Create one free
              </Link>
            </p>
          </div>

          {/* Global error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-6"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form card */}
          <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/[0.08] p-7 shadow-sm">
            <LoginForm onSubmit={handleSubmit} />
          </div>

          {/* Footer */}
          <p className="text-center mt-6 text-xs text-[#b8a898] dark:text-gray-600">
            By signing in you agree to our{' '}
            <span className="text-[#c8933a] cursor-pointer hover:underline">Terms</span>
            {' '}and{' '}
            <span className="text-[#c8933a] cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login