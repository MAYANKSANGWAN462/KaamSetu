// Purpose: Compact, minimal footer. Neutral surface + amber accent.
// Kept short on purpose — the old tall footer forced extra scroll on every page.
import { Link } from 'react-router-dom'
import { config } from '../../config'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const links = [
    { label: 'Find Work', href: '/search' },
    { label: 'Hire Workers', href: '/post-job' },
    { label: 'Messages', href: '/messages' },
    { label: 'About', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ]

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b0e14]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-500/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" d="M3 17 Q7 9 12 9 Q17 9 21 17" />
                  <path strokeLinecap="round" d="M7 17 L7 12" />
                  <path strokeLinecap="round" d="M12 17 L12 9" />
                  <path strokeLinecap="round" d="M17 17 L17 12" />
                  <path strokeLinecap="round" d="M3 17 L21 17" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">{config.appName}</span>
              <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-amber-500/90">काम सेतु</span>
            </div>
          </Link>

          {/* Links — wrap on mobile, inline on desktop */}
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {currentYear} {config.appName}. Made with ❤️ for India's workforce.
          </p>
          <a
            href="mailto:support@kaamsetu.com"
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200"
          >
            support@kaamsetu.com
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
