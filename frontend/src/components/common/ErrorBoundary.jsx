// Purpose: Catches and gracefully displays React render errors with premium UI.
import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center">

            {/* Illustration */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-500/10 dark:to-orange-500/10 rotate-6" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/5 dark:to-orange-500/5 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              We ran into an unexpected issue. Don't worry — your data is safe. Try refreshing the page or going back to continue.
            </p>

            {/* Error details (dev-friendly) */}
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div className="mb-6 text-left p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300
                  bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15
                  border border-gray-200 dark:border-white/10
                  transition-all duration-200"
              >
                ← Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white
                  bg-gradient-to-r from-amber-500 to-orange-500
                  hover:from-amber-400 hover:to-orange-400
                  shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35
                  transition-all duration-200"
              >
                Refresh Page
              </button>
            </div>

            {/* Support link */}
            <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
              Problem persists?{' '}
              <a
                href="mailto:support@kaamsetu.com"
                className="text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary