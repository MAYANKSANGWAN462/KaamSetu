import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import ThemeToggle from '../common/ThemeToggle';

const NAV = [
  {
    path: '/admin',
    exact: true,
    label: 'Dashboard',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    path: '/admin/users',
    exact: false,
    label: 'Users',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    path: '/admin/jobs',
    exact: false,
    label: 'Jobs',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const AdminHeader = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const isActive = (link) =>
    link.exact
      ? location.pathname === link.path
      : location.pathname.startsWith(link.path);

  const initial = (admin?.name || admin?.email || 'A').charAt(0).toUpperCase();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0b0e14]/98 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.07] shadow-sm shadow-gray-100 dark:shadow-black/20 transition-colors duration-300">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">

            {/* Logo */}
            <Link to="/admin" className="flex items-center gap-2.5 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center shadow-md shadow-[#c8933a]/30">
                <svg className="w-[14px] h-[14px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">KaamSetu</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#c8933a] bg-[#c8933a]/15 border border-[#c8933a]/25 px-1.5 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5 ml-2">
              {NAV.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    isActive(link)
                      ? 'bg-[#c8933a]/15 text-[#c8933a] border border-[#c8933a]/20'
                      : 'text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">
              <ThemeToggle />

              {/* Admin info chip — desktop */}
              {admin && (
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08]">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                    {initial}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight max-w-[110px] truncate">
                      {admin.name || 'Admin'}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight max-w-[110px] truncate">
                      {admin.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Sign out */}
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-gray-200 dark:border-white/[0.08] hover:border-red-300 dark:hover:border-red-500/20 transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile sub-nav */}
        <div className="md:hidden flex border-t border-gray-200 dark:border-white/[0.06]">
          {NAV.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition-colors duration-200 ${
                isActive(link)
                  ? 'text-[#c8933a] border-t-2 border-[#c8933a] -mt-px'
                  : 'text-gray-500 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Spacer: header 56px + mobile subnav ~36px */}
      <div className="h-[92px] md:h-14" />
    </>
  );
};

export default AdminHeader;
