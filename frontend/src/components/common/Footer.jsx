// Purpose: Compact, minimal footer. Neutral surface + amber accent.
// Kept short on purpose — the old tall footer forced extra scroll on every page.
import { Link } from 'react-router-dom'
import { config } from '../../config'
import KaamSetuWordmark from './KaamSetuWordmark'

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

          {/* Brand (5a font + 5b bridge) */}
          <Link to="/" className="w-fit">
            <KaamSetuWordmark size="sm" />
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
