// Purpose: Renders a rich, premium footer with branding, links, and contact information.
import { Link } from 'react-router-dom'
import { config } from '../../config'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const links = {
    platform: [
      { label: 'Find Work', href: '/search' },
      { label: 'Hire Workers', href: '/post-job' },
      { label: 'Browse Categories', href: '/search' },
      { label: 'Messages', href: '/messages' },
    ],
    company: [
      { label: 'About Us', href: '#' },
      { label: 'How It Works', href: '#' },
      { label: 'Safety & Trust', href: '#' },
      { label: 'Blog', href: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  }

  const languages = ['English', 'हिन्दी', 'ਪੰਜਾਬੀ', 'தமிழ்', 'বাংলা']

  return (
    <footer className="relative bg-[#0d0d14] text-white overflow-hidden mt-auto">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-screen-xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-white/10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5 group w-fit">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" d="M3 17 Q7 9 12 9 Q17 9 21 17" />
                    <path strokeLinecap="round" d="M7 17 L7 12" />
                    <path strokeLinecap="round" d="M12 17 L12 9" />
                    <path strokeLinecap="round" d="M17 17 L17 12" />
                    <path strokeLinecap="round" d="M3 17 L21 17" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-white">{config.appName}</span>
                <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-amber-400 opacity-80">काम सेतु</span>
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
              Bridging the gap between skilled workers and opportunities across India. Find trusted work, hire reliable talent — all in your language, near you.
            </p>

            {/* Language badges */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 text-gray-400 border border-white/10 hover:border-amber-500/30 hover:text-amber-400 transition-colors duration-200 cursor-pointer"
                >
                  {lang}
                </span>
              ))}
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <a
                href="mailto:support@kaamsetu.com"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-amber-400 transition-colors duration-200 group"
              >
                <svg className="w-4 h-4 text-amber-500/60 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@kaamsetu.com
              </a>
            </div>
          </div>

          {/* Links columns */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-500/80 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {links.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-500/80 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {links.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-500/80 mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Trust badge */}
            <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-green-400">Verified Platform</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">All workers are background-checked. Your data is protected.</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {currentYear} <span className="text-amber-500/70">{config.appName}</span>. All rights reserved. Made with ❤️ for India's workforce.
          </p>

          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span>Built for</span>
            <span className="text-amber-500 font-medium">भारत</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer