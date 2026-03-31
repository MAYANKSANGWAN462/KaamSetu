// Purpose: Renders a premium global header with smart scroll behaviour, nav, and profile actions.
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsMobileOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: '⌂' },
    { path: '/search', label: 'Find Work', icon: '⊙' },
    { path: '/post-job', label: 'Hire Workers', requiresAuth: true, icon: '✦' },
    { path: '/messages', label: 'Messages', requiresAuth: true, icon: '✉' },
  ];

  const shouldShowLink = (link) => !link.requiresAuth || isAuthenticated;
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/80 dark:bg-[#0d0d14]/85 backdrop-blur-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.4)]'
            : 'bg-white/60 dark:bg-[#0d0d14]/60 backdrop-blur-xl'
        }`}
      >
        {/* Scroll progress bar */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />

        <nav className="max-w-screen-xl mx-auto px-4 sm:px-6">
          {/* Single row — logo | desktop-nav | right-actions */}
          <div className="flex items-center h-16 gap-2 sm:gap-4">

            {/* ── Logo ──────────────────────────────────────────── */}
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" d="M3 17 Q7 9 12 9 Q17 9 21 17" />
                    <path strokeLinecap="round" d="M7 17 L7 12" />
                    <path strokeLinecap="round" d="M12 17 L12 9" />
                    <path strokeLinecap="round" d="M17 17 L17 12" />
                    <path strokeLinecap="round" d="M3 17 L21 17" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm sm:text-base font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
                  {config.appName}
                </span>
                <span className="text-[8px] sm:text-[9px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400 opacity-80">
                  काम सेतु
                </span>
              </div>
            </Link>

            {/* ── Desktop nav links (md+) ────────────────────────── */}
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1 ml-4 lg:ml-6">
              {navLinks.map((link) =>
                shouldShowLink(link) ? (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-2.5 lg:px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                      isActive(link.path)
                        ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500"
                      />
                    )}
                  </Link>
                ) : null
              )}
            </div>

            {/* ── Right side actions ─────────────────────────────── */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">

              {/* Theme toggle — always */}
              <ThemeToggle />

              {/* ── Authenticated state (desktop md+) ── */}
              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={menuRef}>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className={`flex items-center gap-1.5 lg:gap-2 rounded-xl border px-2 lg:px-2.5 py-1.5 transition-all duration-200 ${
                      isMenuOpen
                        ? 'border-amber-300 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-500/10'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-white/50 dark:bg-white/5'
                    }`}
                  >
                    <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-[#0d0d14]" />
                    </div>
                    <span className="hidden lg:inline text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[90px] truncate">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0 ${isMenuOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-52 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#16161f] shadow-xl shadow-black/10 dark:shadow-black/40 py-2 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email || ''}</p>
                        </div>
                        <div className="py-1">
                          {[
                            { to: '/profile', label: 'My Profile', icon: (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            )},
                            { to: '/dashboard', label: 'Dashboard', icon: (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            )},
                          ].map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-150"
                            >
                              <span className="text-gray-400 dark:text-gray-500">{item.icon}</span>
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 dark:border-white/10 py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* ── Guest buttons (desktop md+) ── */
                <div className="hidden md:flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                      hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200
                      rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/5 whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Link
                      to="/register"
                      className="px-3 lg:px-4 py-2 text-sm font-semibold text-white rounded-xl whitespace-nowrap
                        bg-gradient-to-r from-amber-500 to-orange-500
                        hover:from-amber-400 hover:to-orange-400
                        shadow-md shadow-amber-500/25 hover:shadow-amber-500/40
                        transition-all duration-200"
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* ── Hamburger (mobile only, below md) ── */}
              <button
                onClick={() => setIsMobileOpen((p) => !p)}
                className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl gap-1.5
                  hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200 shrink-0"
                aria-label="Toggle menu"
              >
                <span className={`block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all duration-300
                  ${isMobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all duration-300
                  ${isMobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block w-5 h-0.5 bg-gray-700 dark:bg-gray-300 rounded-full transition-all duration-300
                  ${isMobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </button>
            </div>
          </div>

          {/* ── Mobile drawer (below md only) ──────────────────── */}
          <AnimatePresence>
            {isMobileOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="md:hidden overflow-hidden border-t border-gray-100 dark:border-white/10"
              >
                <div className="py-3 space-y-1">

                  {/* Nav links */}
                  {navLinks.map((link, i) =>
                    shouldShowLink(link) ? (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          to={link.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive(link.path)
                              ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-sm shrink-0">
                            {link.icon}
                          </span>
                          {link.label}
                        </Link>
                      </motion.div>
                    ) : null
                  )}

                  {/* Authenticated mobile section */}
                  {isAuthenticated ? (
                    <motion.div
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.05 + 0.05 }}
                      className="pt-2 mt-1 border-t border-gray-100 dark:border-white/10 space-y-1"
                    >
                      {/* User info row */}
                      <div className="flex items-center gap-3 px-4 py-2.5">
                        <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shrink-0">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white dark:border-[#0d0d14]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email || ''}</p>
                        </div>
                      </div>

                      {[
                        { to: '/profile', label: 'My Profile', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
                        { to: '/dashboard', label: 'Dashboard', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
                        >
                          <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400">
                            {item.icon}
                          </span>
                          {item.label}
                        </Link>
                      ))}

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                      >
                        <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </span>
                        Sign Out
                      </button>
                    </motion.div>
                  ) : (
                    /* Guest mobile auth */
                    <motion.div
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.05 + 0.05 }}
                      className="pt-2 mt-1 border-t border-gray-100 dark:border-white/10 flex flex-col gap-2.5 px-4 pb-2"
                    >
                      <Link
                        to="/login"
                        className="w-full text-center py-3 rounded-xl text-sm font-semibold
                          text-gray-700 dark:text-gray-300
                          border-2 border-gray-200 dark:border-white/10
                          hover:border-amber-300 dark:hover:border-amber-500/40
                          hover:text-amber-600 dark:hover:text-amber-400
                          transition-all duration-200"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="w-full text-center py-3 rounded-xl text-sm font-semibold text-white
                          bg-gradient-to-r from-amber-500 to-orange-500
                          hover:from-amber-400 hover:to-orange-400
                          shadow-md shadow-amber-500/25
                          transition-all duration-200"
                      >
                        Get Started — It's Free
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
};

export default Header;