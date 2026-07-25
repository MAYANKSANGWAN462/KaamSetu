// Purpose: Native-app-style bottom tab bar for mobile. Auth-aware, animated
// active indicator, safe-area aware. Hidden on md+ (desktop uses the Header).
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

/* Shared stroke icon set — matches the app's existing line-icon style. */
const Icon = {
  home: (
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 001 1h3v-5a1 1 0 011-1h4a1 1 0 011 1v5h3a1 1 0 001-1v-9" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
    </>
  ),
  message: (
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  ),
  user: (
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0" />
  ),
  login: (
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
  ),
};

const MobileTabBar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (matchers) =>
    matchers.some((m) => (m === '/' ? path === '/' : path.startsWith(m)));

  // /post-job is the valid, routed posting page (mirrors the header action).
  const postTo = '/post-job';

  // Left / right groups flank the raised center action.
  const authTabs = {
    left: [
      { to: '/', label: 'Home', icon: Icon.home, active: isActive(['/']) },
      { to: '/search', label: 'Search', icon: Icon.search, active: isActive(['/search', '/jobs']) },
    ],
    right: [
      { to: '/messages', label: 'Messages', icon: Icon.message, active: isActive(['/messages']) },
      { to: '/profile', label: 'Profile', icon: Icon.user, active: isActive(['/profile', '/dashboard']) },
    ],
  };

  const guestTabs = [
    { to: '/', label: 'Home', icon: Icon.home, active: isActive(['/']) },
    { to: '/search', label: 'Search', icon: Icon.search, active: isActive(['/search', '/jobs']) },
    { to: '/login', label: 'Sign In', icon: Icon.login, active: isActive(['/login', '/register']) },
  ];

  const Tab = ({ to, label, icon, active }) => (
    <Link
      to={to}
      className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 no-select"
    >
      {active && (
        <motion.span
          layoutId="tab-indicator"
          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
          className="absolute -top-px h-0.5 w-8 rounded-full bg-amber-500"
        />
      )}
      <motion.svg
        whileTap={{ scale: 0.82 }}
        className={`w-6 h-6 transition-colors duration-200 ${
          active ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        viewBox="0 0 24 24"
      >
        {icon}
      </motion.svg>
      <span
        className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${
          active ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        {label}
      </span>
    </Link>
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <nav
        className="flex items-stretch pb-safe
          border-t border-gray-200/80 dark:border-white/10
          bg-white/85 dark:bg-[#0b0e14]/90 backdrop-blur-2xl
          shadow-[0_-4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
      >
        {isAuthenticated ? (
          <>
            {authTabs.left.map((t) => <Tab key={t.to} {...t} />)}

            {/* Raised center action — mode-aware post button */}
            <div className="relative flex flex-1 items-center justify-center no-select">
              <motion.div whileTap={{ scale: 0.9 }} className="-mt-6">
                <Link
                  to={postTo}
                  aria-label="Post"
                  className="flex h-14 w-14 items-center justify-center rounded-2xl
                    bg-gradient-to-br from-amber-400 to-orange-500
                    text-white shadow-lg shadow-amber-500/30
                    ring-4 ring-white dark:ring-[#0b0e14]"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                </Link>
              </motion.div>
            </div>

            {authTabs.right.map((t) => <Tab key={t.to} {...t} />)}
          </>
        ) : (
          guestTabs.map((t) => <Tab key={t.to} {...t} />)
        )}
      </nav>
    </div>
  );
};

export default MobileTabBar;
