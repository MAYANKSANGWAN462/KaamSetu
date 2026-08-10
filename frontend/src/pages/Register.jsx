import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import RegisterForm from '../components/auth/RegisterForm'
import KaamSetuWordmark from '../components/common/KaamSetuWordmark'

const Register = () => {
  const { register, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  // Handle Google OAuth redirect callback — Google sends ?code= back to this page
  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) return

    setSearchParams({}, { replace: true })
    setGoogleLoading(true)

    googleLogin(code, window.location.origin + '/register')
      .then((result) => {
        if (result?.success) {
          navigate('/dashboard', { replace: true })
        } else {
          setError(result?.message || 'Google sign-up failed')
        }
      })
      .catch(() => setError('Google sign-up failed. Please try again.'))
      .finally(() => setGoogleLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (userData) => {
    const result = await register(userData)
    if (result.success) {
      const redirect = searchParams.get('redirect')
      const safe =
        redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/dashboard'
      navigate(safe)
    } else {
      setError(result.message)
    }
    return result
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] dark:bg-[#0b0e14] flex overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12">
        {/* BG — 6c Green Fields: farmer planting, fresh growth */}
        <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <defs>
            <linearGradient id="rg-sky6c" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FCEFD0" />
              <stop offset="1" stopColor="#F6DCA6" />
            </linearGradient>
            <linearGradient id="rg-gr6c" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6FA84A" />
              <stop offset="1" stopColor="#4E8B3A" />
            </linearGradient>
          </defs>
          <rect width="1600" height="700" fill="url(#rg-sky6c)" />
          <circle cx="300" cy="170" r="86" fill="#FFF3D9" opacity="0.85" />
          <path d="M 0 470 Q 400 400 800 460 T 1600 450 L 1600 700 L 0 700 Z" fill="#8CC060" />
          <path d="M 0 540 Q 500 480 1050 540 T 1600 530 L 1600 700 L 0 700 Z" fill="url(#rg-gr6c)" />
          <g stroke="#3F7530" strokeWidth="6" opacity="0.5" fill="none">
            <path d="M 200 640 Q 800 600 1400 640" />
            <path d="M 150 680 Q 800 636 1450 680" />
          </g>
          <g fill="#3F7530">
            <path d="M 1120 596 q 0 -30 14 -30 q -6 16 0 30 z" />
            <path d="M 1134 596 q 0 -34 -14 -34 q 6 18 0 34 z" />
            <path d="M 1220 610 q 0 -28 12 -28 q -6 15 0 28 z" />
            <path d="M 1232 610 q 0 -30 -12 -30 q 6 16 0 30 z" />
          </g>
          <ellipse cx="700" cy="600" rx="120" ry="18" fill="#3F7530" opacity="0.35" />
          <path d="M 756 552 q 0 -22 12 -22 q -6 12 0 22 z" fill="#4E8B3A" />
          <path d="M 768 552 q 0 -24 -12 -24 q 6 13 0 24 z" fill="#4E8B3A" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-br from-[#204A16]/80 via-[#204A16]/65 to-[#204A16]/40 pointer-events-none" />


        <div className="relative space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Join India's<br />
              <span className="text-[#c8933a]">hyperlocal</span><br />
              work platform
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              One account for both sides. Switch between looking for work and hiring workers anytime you want.
            </p>
          </motion.div>

          {[
            { icon: '🔒', text: 'Verified users only — no spam or fake profiles' },
            { icon: '📍', text: 'Hyperlocal matching — find work near you' },
            { icon: '💬', text: 'In-app messaging after a job connection' },
          ].map(({ icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.45 }}
              className="flex items-center gap-3 bg-white/[0.05] rounded-2xl border border-white/10 px-4 py-3.5"
            >
              <span className="text-xl flex-shrink-0">{icon}</span>
              <p className="text-slate-300 text-xs leading-snug">{text}</p>
            </motion.div>
          ))}
        </div>

        <div className="relative">
          <p className="text-slate-500 text-xs">© 2025 KaamSetu. All rights reserved.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-start justify-center px-4 pt-20 pb-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo above sign-up box (tablet / mobile) */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/">
              <KaamSetuWordmark size="md" />
            </Link>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1.5">Create account</h1>
            <p className="text-sm text-[#6b7280] dark:text-gray-500">
              Already registered?{' '}
              <Link to="/login" className="text-[#c8933a] font-semibold hover:text-[#a8732a] transition-colors duration-200">
                Sign in
              </Link>
            </p>
          </div>

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

          <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e6e8ec] dark:border-white/[0.08] p-7 shadow-sm">
            {googleLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <svg className="animate-spin w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">Creating your account with Google...</p>
              </div>
            ) : (
              <RegisterForm onSubmit={handleSubmit} />
            )}
          </div>

          <p className="text-center mt-5 text-xs text-[#94a3b8] dark:text-gray-600">
            By signing up you agree to our{' '}
            <span className="text-[#c8933a] cursor-pointer hover:underline">Terms</span>
            {' '}and{' '}
            <span className="text-[#c8933a] cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Register