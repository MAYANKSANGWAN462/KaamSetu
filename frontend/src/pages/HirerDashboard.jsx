import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { jobService, applicationService } from "../services";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import useGeolocation from "../hooks/useGeolocation";
import WorkerCard from "../components/worker/WorkerCard";
import { makeConversationId } from "../utils/conversationId";

const stagger = (i) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
});

const StatusBadge = ({ status }) => {
  const map = {
    open: {
      label: "Open",
      cls: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    },
    filled: {
      label: "Filled",
      cls: "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400",
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400",
    },
  };
  const { label, cls } = map[status] || map.open;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-5 animate-pulse">
    <div className="space-y-3">
      <div className="h-5 w-2/3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
      <div className="h-3 w-1/3 bg-[#e8dfd0] dark:bg-white/10 rounded-lg" />
      <div className="h-px bg-[#e8dfd0] dark:bg-white/10 my-3" />
      <div className="flex gap-2">
        <div className="h-7 w-16 bg-[#e8dfd0] dark:bg-white/10 rounded-xl" />
        <div className="h-7 w-20 bg-[#e8dfd0] dark:bg-white/10 rounded-xl" />
      </div>
    </div>
  </div>
);

const JobRow = ({ job }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const loadApplicants = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (applicants.length > 0) return;
    setLoadingApplicants(true);
    try {
      const { applicationService } = await import("../services");
      const res = await applicationService.getJobApplications(job._id);
      setApplicants(res?.data || res?.applications || []);
    } catch {
      /* silent */
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleAccept = async (appId, workerId) => {
    try {
      const { applicationService } = await import("../services");
      await applicationService.updateApplication(appId, "accepted");
      setApplicants((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: "accepted" } : a)),
      );
    } catch {
      /* silent */
    }
  };

  const handleReject = async (appId) => {
    try {
      const { applicationService } = await import("../services");
      await applicationService.updateApplication(appId, "rejected");
      setApplicants((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: "rejected" } : a)),
      );
    } catch {
      /* silent */
    }
  };

  return (
    <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status={job.status} />
              {job.category && (
                <span className="text-[10px] font-semibold text-[#9c8a78] bg-[#faf7f2] dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
                  {job.category}
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">
              {job.title}
            </h3>
            <p className="flex items-center gap-1 text-xs text-[#9c8a78] mt-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {job.location?.address || job.location?.city || "—"}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-black text-[#c8933a] text-lg leading-none">
              ₹{job.wage?.amount || 0}
            </p>
            <p className="text-xs text-[#9c8a78] capitalize mt-0.5">
              {job.wage?.unit || "per day"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={loadApplicants}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#c8933a] hover:text-[#a8732a] transition-colors duration-200"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            View Applicants
          </button>
          <button
            onClick={() => navigate(`/jobs/${job._id}/edit`)}
            className="text-xs font-semibold text-[#9c8a78] hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Applicants expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-[#e8dfd0] dark:border-white/8"
          >
            <div className="p-5 bg-[#faf7f2] dark:bg-white/[0.02]">
              {loadingApplicants ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 bg-[#e8dfd0] dark:bg-white/10 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : applicants.length === 0 ? (
                <div className="text-center py-6 text-[#9c8a78]">
                  <span className="text-2xl block mb-1">📭</span>
                  <p className="text-xs font-medium">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {applicants.map((app) => {
                    const worker = app.workerId || {};
                    const wId =
                      typeof worker === "string" ? worker : worker._id;
                    const convId =
                      user?._id && wId
                        ? [user._id, wId].sort().join("_")
                        : null;
                    return (
                      <div
                        key={app._id}
                        className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-white/[0.04] rounded-xl border border-[#e8dfd0] dark:border-white/8 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {(worker.name || "W")[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">
                              {worker.name || "Worker"}
                            </p>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                                app.status === "accepted"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                                  : app.status === "rejected"
                                    ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAccept(app._id, wId)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors duration-200"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleReject(app._id)}
                                className="px-3 py-1.5 rounded-xl border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {app.status === "accepted" && convId && (
                            <button
                              onClick={() => navigate(`/messages/${convId}`)}
                              className="px-3 py-1.5 rounded-xl border border-[#c8933a]/50 text-[#c8933a] text-xs font-bold hover:bg-[#c8933a]/5 transition-colors duration-200"
                            >
                              Message
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HirerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const geo = useGeolocation();
  const [jobs, setJobs] = useState([]);
  const [suggestedWorkers, setSuggestedWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);
  useEffect(() => {
    if (geo.latitude && geo.longitude) fetchSuggestedWorkers();
  }, [geo.latitude, geo.longitude]);

  const fetchJobs = async () => {
    try {
      const res = await jobService.getMyJobs();
      setJobs(res?.data || []);
    } catch {
      setError("Failed to load your jobs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedWorkers = async () => {
    try {
      const res = await api.get("/workers", {
        params: { lat: geo.latitude, lng: geo.longitude, limit: 6 },
      });
      const d = res.data;
      const workers =
        d?.data?.workers || d?.workers || (Array.isArray(d) ? d : []);
      setSuggestedWorkers(Array.isArray(workers) ? workers : []);
    } catch {
      /* silent */
    } finally {
      setLoadingWorkers(false);
    }
  };

  // Contact affordance must actually start a conversation, not just open a profile.
  const handleContactWorker = async (workerUserId) => {
    if (!workerUserId) return;
    try {
      await applicationService.contactWorker({ workerId: workerUserId });
      navigate(`/messages/${makeConversationId(user?._id, workerUserId)}`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Could not start conversation");
    }
  };

  const stats = [
    {
      label: "Total Posted",
      value: jobs.length,
      icon: "💼",
      color: "text-[#c8933a]",
    },
    {
      label: "Active Jobs",
      value: jobs.filter((j) => j.status === "open").length,
      icon: "✅",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Filled",
      value: jobs.filter((j) => ["filled", "completed"].includes(j.status))
        .length,
      icon: "🏆",
      color: "text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* ── GREETING ── */}
        <motion.div {...stagger(0)}>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-1">
            Hirer Mode
          </p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Hello, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-[#9c8a78] mt-1">
            Manage your job posts and find the right workers.
          </p>
        </motion.div>

        {/* ── STATS ── */}
        <motion.div {...stagger(1)} className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-5 shadow-sm"
            >
              <p className="text-2xl mb-2">{icon}</p>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-[#9c8a78] font-semibold mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── MY JOBS ── */}
        <motion.div {...stagger(2)}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-0.5">
                Your Posts
              </p>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                My Jobs
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/hirer/post-job")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-sm hover:shadow-md shadow-[#c8833a]/20 transition-all duration-300"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Post Job
            </motion.button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200/70 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold mb-4"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
                <button onClick={fetchJobs} className="ml-auto underline">
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-14 bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 border-dashed"
            >
              <span className="text-4xl block mb-3">📋</span>
              <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">
                No jobs posted yet
              </p>
              <p className="text-sm text-[#9c8a78] mb-5">
                Post your first job to start receiving applications.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/hirer/post-job")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white font-bold text-sm shadow-lg shadow-[#c8833a]/25 transition-all duration-300"
              >
                Post Your First Job
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobRow key={job._id} job={job} />
              ))}
            </div>
          )}
        </motion.div>

        {/* ── WORKER POSTS (Available Workers) ── */}
        <motion.div {...stagger(3)}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-0.5">
                Worker Posts
              </p>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Workers Looking for Work
              </h2>
              <p className="text-xs text-[#9c8a78] mt-0.5">
                These workers have posted their availability — contact them
                directly.
              </p>
            </div>
            <button
              onClick={() => navigate("/search")}
              className="flex items-center gap-1 text-sm font-semibold text-[#c8933a] hover:text-[#a8732a] transition-colors duration-200"
            >
              View All
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>

          {loadingWorkers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : suggestedWorkers.length === 0 ? (
            <div className="text-center py-10 bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8">
              <span className="text-3xl block mb-2">📍</span>
              <p className="text-sm font-medium text-[#9c8a78]">
                No worker posts near you yet
              </p>
              <p className="text-xs text-[#b8a898] mt-1">
                Enable location or check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedWorkers.map((worker, i) => (
                <motion.div
                  key={worker._id || worker.userId?._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  {/* Enhanced worker post card */}
                  <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-[#e8dfd0] dark:border-white/8 p-5 shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white font-black text-base shadow-sm flex-shrink-0">
                        {(worker.userId?.name || "W")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {worker.userId?.name || "Worker"}
                        </p>
                        <p className="text-xs text-[#9c8a78]">
                          {worker.category || "General Labour"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Available
                          </span>
                          {worker.yearsOfExperience > 0 && (
                            <span className="text-[10px] text-[#9c8a78] font-semibold">
                              · {worker.yearsOfExperience} yr
                              {worker.yearsOfExperience !== 1 ? "s" : ""} exp
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-[#c8933a] text-base leading-none">
                          ₹{worker.wage?.amount || 0}
                        </p>
                        <p className="text-[10px] text-[#9c8a78] capitalize">
                          /
                          {worker.wage?.unit === "daily"
                            ? "day"
                            : worker.wage?.unit || "day"}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    {worker.bio && (
                      <p className="text-xs text-[#9c8a78] leading-relaxed line-clamp-2 mb-3">
                        {worker.bio}
                      </p>
                    )}

                    {/* Skills */}
                    {(worker.skills || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {worker.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-[#c8933a] border border-amber-200 dark:border-amber-500/30 text-[10px] font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                        {worker.skills.length > 4 && (
                          <span className="px-2 py-0.5 rounded-lg bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-[10px] font-semibold text-[#9c8a78]">
                            +{worker.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Available days */}
                    {(worker.availability?.days || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {worker.availability.days.map((day) => (
                          <span
                            key={day}
                            className="px-2 py-0.5 rounded-md bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/8 text-[10px] font-semibold text-[#9c8a78]"
                          >
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Location + Contact button */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#e8dfd0] dark:border-white/8">
                      {worker.location?.address ? (
                        <p className="flex items-center gap-1 text-[10px] text-[#9c8a78] truncate max-w-[55%]">
                          <svg
                            className="w-3 h-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {worker.location.address}
                        </p>
                      ) : (
                        <span />
                      )}

                      <button
                        onClick={() =>
                          handleContactWorker(
                            worker.userId?._id || worker.userId,
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white text-[10px] font-bold shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Contact
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HirerDashboard;
