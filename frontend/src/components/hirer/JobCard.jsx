// Purpose: Displays a job summary card with contextual actions for workers and hirers.
// frontend/src/components/hirer/JobCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  open:        { label: 'Open',        dot: 'bg-emerald-400', bar: 'from-emerald-400 to-teal-500',   badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700' },
  'in-progress':{ label: 'In Progress', dot: 'bg-amber-400 animate-pulse', bar: 'from-amber-400 to-orange-500',   badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700' },
  completed:   { label: 'Completed',   dot: 'bg-sky-400',     bar: 'from-sky-400 to-blue-500',      badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700' },
  cancelled:   { label: 'Cancelled',   dot: 'bg-rose-400',    bar: 'from-rose-400 to-pink-500',     badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700' },
}

const CATEGORY_ICONS = {
  construction: '🏗️', agriculture: '🌾', cleaning: '🧹', electrical: '⚡',
  plumbing: '🔧', painting: '🎨', driving: '🚗', cooking: '👨‍🍳',
  security: '🛡️', tailoring: '✂️', default: '💼'
}

const JobCard = ({ job, onApply, onView }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!job) return null;

  const {
    _id, title, description, budget, location, salary,
    category, status, workersRequired, applications = [], createdAt, hirer
  } = job;

  const salaryLabel = salary?.mode === 'range'
    ? `₹${(salary.min || 0).toLocaleString('en-IN')} – ₹${(salary.max || 0).toLocaleString('en-IN')}`
    : `₹${(salary?.fixed || salary?.recommended || budget || 0).toLocaleString('en-IN')}`;

  const locationLabel = typeof location === 'string'
    ? location
    : (location?.city || job.locationText || '');

  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;

  const getStatusText = () => {
    if (t(`job.status.${status}`)) return t(`job.status.${status}`);
    return statusCfg.label;
  };

  const hasApplied = Boolean(user?.actsAsWorker) && applications.some((app) => {
    const workerId = typeof app.workerId === 'string' ? app.workerId : app.workerId?._id;
    return workerId === user._id;
  });

  const categoryKey = (category || '').toLowerCase();
  const categoryIcon = CATEGORY_ICONS[categoryKey] || CATEGORY_ICONS.default;

  const daysAgo = createdAt
    ? Math.floor((Date.now() - new Date(createdAt)) / 86400000)
    : null;

  const postedLabel = daysAgo === 0
    ? 'Today'
    : daysAgo === 1
    ? 'Yesterday'
    : daysAgo != null
    ? `${daysAgo}d ago`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 20px 48px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col group"
    >
      {/* Gradient accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${statusCfg.bar} transition-all duration-300 group-hover:h-1.5`} />

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Category icon + title */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-xl">
              {categoryIcon}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight line-clamp-2">
                {title}
              </h3>
              {category && (
                <span className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-0.5 block">
                  {category}
                </span>
              )}
            </div>
          </div>

          {/* Status badge */}
          <span className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {getStatusText()}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>

        {/* Meta row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Salary */}
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-3 py-2">
            <span className="text-base">💰</span>
            <div>
              <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium leading-none mb-0.5">Pay</p>
              <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 leading-none">{salaryLabel}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
            <span className="text-base">📍</span>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">Location</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-none truncate">
                {locationLabel || '—'}
              </p>
            </div>
          </div>

          {/* Workers */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
            <span className="text-base">👥</span>
            <div>
              <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">Workers needed</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-none">
                {workersRequired ?? applications.length}
              </p>
            </div>
          </div>

          {/* Posted */}
          {postedLabel && (
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
              <span className="text-base">🕐</span>
              <div>
                <p className="text-xs text-gray-400 font-medium leading-none mb-0.5">Posted</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-none">{postedLabel}</p>
              </div>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex gap-2.5 pt-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { onView?.(_id); navigate(`/jobs/${_id}`); }}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            {t('common.view') || 'View'}
          </motion.button>

          {user?.actsAsWorker && status === 'open' && !hasApplied && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onApply?.(_id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              {t('common.apply') || 'Apply'}
            </motion.button>
          )}

          {hasApplied && (
            <div className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-sm font-semibold cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              {t('job.alreadyApplied') || 'Applied'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;