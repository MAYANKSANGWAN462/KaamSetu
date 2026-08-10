import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import KaamSetuWordmark from '../components/common/KaamSetuWordmark'


const Login = () => {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  // Handle Google redirect callback — Google sends ?code= back to this page
  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) return

    setSearchParams({}, { replace: true }) // remove ?code= from URL immediately
    setGoogleLoading(true)

    googleLogin(code, window.location.origin + '/login')
      .then((result) => {
        if (result?.success) {
          navigate('/dashboard', { replace: true })
        } else {
          setError(result?.message || 'Google login failed')
        }
      })
      .catch(() => setError('Google login failed. Please try again.'))
      .finally(() => setGoogleLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div className="min-h-screen bg-[#f6f7f9] dark:bg-[#0b0e14] flex overflow-hidden">

      {/* ── LEFT PANEL (decorative, desktop only) ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12">
        {/* BG — 6b Indigo Sunset: city at dusk, delivery rider */}
        <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <defs>
            <linearGradient id="lg-sky6b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4B3B8F" />
              <stop offset="0.55" stopColor="#B85C8A" />
              <stop offset="1" stopColor="#F2A65A" />
            </linearGradient>
            <linearGradient id="lg-gr6b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3A2E58" />
              <stop offset="1" stopColor="#2A2340" />
            </linearGradient>
          </defs>
          <rect width="1600" height="700" fill="url(#lg-sky6b)" />
          <circle cx="820" cy="260" r="120" fill="#FFD8A0" opacity="0.55" />
          <circle cx="820" cy="260" r="78" fill="#FFE8C4" opacity="0.8" />
          <g fill="#3B2E5A">
            <rect x="120" y="300" width="150" height="270" />
            <rect x="290" y="360" width="110" height="210" />
            <rect x="1180" y="280" width="160" height="290" />
            <rect x="1360" y="350" width="120" height="220" />
          </g>
          <g fill="#F2A65A">
            <rect x="150" y="330" width="18" height="18" />
            <rect x="190" y="330" width="18" height="18" />
            <rect x="150" y="380" width="18" height="18" />
            <rect x="230" y="380" width="18" height="18" />
            <rect x="1210" y="320" width="20" height="20" />
            <rect x="1260" y="320" width="20" height="20" />
            <rect x="1210" y="380" width="20" height="20" />
            <rect x="1300" y="360" width="20" height="20" />
          </g>
          <path d="M 0 560 L 1600 560 L 1600 700 L 0 700 Z" fill="url(#lg-gr6b)" />
          <path d="M 0 590 L 1600 590" stroke="#F2A65A" strokeWidth="4" strokeDasharray="40 34" opacity="0.6" />
          <ellipse cx="820" cy="596" rx="150" ry="16" fill="#1E1830" opacity="0.5" />
        </svg>
        <div className="absolute inset-0 bg-[#2A1F50]/50 pointer-events-none" />


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
            <p className="text-slate-300 text-sm leading-relaxed">
              Connecting daily-wage workers and hirers across India — locally, quickly, reliably.
            </p>
          </motion.div>

          {/* Feature highlights */}
          {[
            { icon: '🔒', text: 'Verified accounts — no fake profiles' },
            { icon: '📍', text: 'Find work or hire workers near you' },
            { icon: '💬', text: 'In-app messaging after a connection' },
          ].map(({ icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="flex items-center gap-4 bg-white/[0.06] rounded-2xl border border-white/10 px-5 py-4"
            >
              <span className="text-xl flex-shrink-0">{icon}</span>
              <p className="text-slate-300 text-xs leading-snug">{text}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="relative">
          <p className="text-slate-500 text-xs">© 2025 KaamSetu. All rights reserved.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo above sign-in box (tablet / mobile) */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/">
              <KaamSetuWordmark size="md" />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1.5">Sign in</h1>
            <p className="text-sm text-[#6b7280] dark:text-gray-500">
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
          <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e6e8ec] dark:border-white/[0.08] p-7 shadow-sm">
            {googleLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <svg className="animate-spin w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">Signing you in with Google...</p>
              </div>
            ) : (
              <LoginForm onSubmit={handleSubmit} />
            )}
          </div>

          {/* Footer */}
          <p className="text-center mt-6 text-xs text-[#94a3b8] dark:text-gray-600">
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