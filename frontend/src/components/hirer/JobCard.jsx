// Purpose: Displays a job summary card with contextual actions for workers and hirers.
// frontend/src/components/hirer/JobCard.jsx

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import { useAuth } from "../../context/AuthContext";

const STATUS_CONFIG = {
  open: {
    label: "Open",
    dot: "bg-emerald-400",
    bar: "from-emerald-400 to-teal-500",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  },
  filled: {
    label: "Filled",
    dot: "bg-sky-400",
    bar: "from-sky-400 to-blue-500",
    badge:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-amber-400 animate-pulse",
    bar: "from-amber-400 to-orange-500",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  },
  completed: {
    label: "Completed",
    dot: "bg-sky-400",
    bar: "from-sky-400 to-blue-500",
    badge:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-rose-400",
    bar: "from-rose-400 to-pink-500",
    badge:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
  },
};

const CATEGORY_ICONS = {
  construction: "🏗️",
  agriculture: "🌾",
  cleaning: "🧹",
  electrical: "⚡",
  plumbing: "🔧",
  painting: "🎨",
  driving: "🚗",
  cooking: "👨‍🍳",
  security: "🛡️",
  tailoring: "✂️",
  default: "💼",
};

const JobCard = ({ job, onApply, onView }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  if (!job) return null;

  const {
    _id,
    title,
    description,
    budget,
    location,
    salary,
    wage,
    category,
    status,
    workersRequired,
    applications = [],
    createdAt,
    hirer,
  } = job;

  const wageAmount =
    wage?.amount ?? salary?.fixed ?? salary?.recommended ?? budget ?? 0;
  const wageUnit = wage?.unit || "daily";
  const salaryLabel = job.wage
    ? `₹${Number(wageAmount).toLocaleString("en-IN")}${
        wageUnit === "hourly" ? "/hr" : wageUnit === "job" ? " (job)" : "/day"
      }`
    : salary?.mode === "range"
      ? `₹${(salary.min || 0).toLocaleString("en-IN")} – ₹${(salary.max || 0).toLocaleString("en-IN")}`
      : `₹${(salary?.fixed || salary?.recommended || budget || 0).toLocaleString("en-IN")}`;

  const locationLabel =
    typeof location === "string"
      ? location
      : location?.address || location?.city || job.locationText || "";

  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;

  const getStatusText = () => statusCfg.label;

  const hasApplied =
    Boolean(user?.activeMode === "worker") &&
    applications.some((app) => {
      const workerId =
        typeof app.workerId === "string" ? app.workerId : app.workerId?._id;
      return workerId === user._id;
    });

  const categoryKey = (category || "").toLowerCase();
  const categoryIcon = CATEGORY_ICONS[categoryKey] || CATEGORY_ICONS.default;

  const daysAgo = createdAt
    ? Math.floor((Date.now() - new Date(createdAt)) / 86400000)
    : null;

  const postedLabel =
    daysAgo === 0
      ? "Today"
      : daysAgo === 1
        ? "Yesterday"
        : daysAgo != null
          ? `${daysAgo}d ago`
          : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="relative bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 shadow-sm overflow-hidden flex flex-col group h-full"
    >
      {/* Gradient accent bar */}
      <div
        className={`h-1 w-full bg-gradient-to-r ${statusCfg.bar} transition-all duration-300 group-hover:h-1.5`}
      />

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Category icon + title */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center text-xl">
              {categoryIcon}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight line-clamp-2">
                {title}
              </h3>
              {category && (
                <span className="text-xs text-[#9c8a78] capitalize mt-0.5 block truncate">
                  {category}
                </span>
              )}
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {getStatusText()}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-[#9c8a78] dark:text-gray-400 leading-relaxed line-clamp-2 mb-4 min-h-[2.5rem]">
          {description}
        </p>

        {/* Meta row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Salary — brand wage highlight */}
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl px-3 py-2 min-w-0">
            <span className="text-base flex-shrink-0">💰</span>
            <div className="min-w-0">
              <p className="text-xs text-[#c8933a]/80 font-medium leading-none mb-0.5">
                Pay
              </p>
              <p className="text-sm font-bold text-[#c8933a] leading-none truncate">
                {salaryLabel}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 bg-[#faf7f2] dark:bg-white/[0.04] rounded-xl px-3 py-2 min-w-0">
            <span className="text-base flex-shrink-0">📍</span>
            <div className="min-w-0">
              <p className="text-xs text-[#9c8a78] font-medium leading-none mb-0.5">
                Location
              </p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-none truncate">
                {locationLabel || "—"}
              </p>
            </div>
          </div>

          {/* Workers */}
          <div className="flex items-center gap-2 bg-[#faf7f2] dark:bg-white/[0.04] rounded-xl px-3 py-2 min-w-0">
            <span className="text-base flex-shrink-0">👥</span>
            <div className="min-w-0">
              <p className="text-xs text-[#9c8a78] font-medium leading-none mb-0.5">
                Workers needed
              </p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-none">
                {workersRequired ?? applications.length}
              </p>
            </div>
          </div>

          {/* Posted */}
          {postedLabel && (
            <div className="flex items-center gap-2 bg-[#faf7f2] dark:bg-white/[0.04] rounded-xl px-3 py-2 min-w-0">
              <span className="text-base flex-shrink-0">🕐</span>
              <div className="min-w-0">
                <p className="text-xs text-[#9c8a78] font-medium leading-none mb-0.5">
                  Posted
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-none truncate">
                  {postedLabel}
                </p>
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
            onClick={() => {
              onView?.(_id);
              navigate(`/jobs/${_id}`);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:text-[#c8933a] hover:border-[#c8933a]/50 hover:bg-amber-50 dark:hover:bg-amber-500/5 text-sm font-semibold transition-all duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View
          </motion.button>

          {status === "open" && !hasApplied && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (!user) {
                  const target = `${loc.pathname}${loc.search || ""}`;
                  navigate(`/login?redirect=${encodeURIComponent(target)}`);
                  return;
                }
                if (user?.activeMode !== "worker") {
                  toast.error("Switch to Worker mode to apply");
                  return;
                }
                onApply?.(_id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white text-sm font-semibold shadow-md shadow-[#c8833a]/25 hover:shadow-lg hover:shadow-[#c8833a]/40 transition-all duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Apply
            </motion.button>
          )}

          {hasApplied && (
            <div className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 text-sm font-semibold cursor-not-allowed">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Applied
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;
