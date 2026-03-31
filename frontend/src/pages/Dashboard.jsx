// Purpose: Provides one unified dashboard with role-aware feeds, quick actions, and marketplace insights.
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { jobService, workerService } from '../services';
import Loader from '../components/common/Loader';
import useGeolocation from '../hooks/useGeolocation';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const cardMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 }
};

const Dashboard = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingMode, setSavingMode] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [workers, setWorkers] = useState([]);
  const geo = useGeolocation();

  const selectedMode = user?.preferredMode || null;
  const isWorker = selectedMode === 'worker';

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [jobsResponse, myJobsResponse, myApplicationsResponse, workersResponse] = await Promise.all([
          jobService.getJobs({
            limit: 18,
            latitude: geo.latitude || undefined,
            longitude: geo.longitude || undefined,
            radiusKm: 20
          }),
          jobService.getMyJobs(),
          jobService.getMyApplications(),
          workerService.getWorkers({ limit: 8, sort: 'rating' })
        ]);

        setJobs(jobsResponse.jobs || []);
        setMyJobs(myJobsResponse.data || []);
        setApplications(myApplicationsResponse.data || []);
        setWorkers(workersResponse.workers || []);
      } catch (error) {
        console.error('Dashboard load failed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [geo.latitude, geo.longitude]);

  useEffect(() => {
    if (!user?._id) return;

    const socketBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    const socket = io(socketBaseUrl, { transports: ['websocket', 'polling'] });
    socket.emit('join', user._id);

    socket.on('jobApplicationNotification', (payload) => {
      toast.success(payload?.message || 'New worker applied for your job');
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  const nearbyJobs = useMemo(() => jobs.filter((job) => (job.distanceKm ?? 999) <= 20).slice(0, 6), [jobs]);
  const recommendedJobs = useMemo(() => jobs.filter((job) => (job.skillMatchScore ?? 0) > 0).slice(0, 6), [jobs]);
  const appliedJobIds = useMemo(() => new Set(applications.map((application) => application.jobId?._id)), [applications]);
  const appliedJobs = useMemo(() => jobs.filter((job) => appliedJobIds.has(job._id)).slice(0, 6), [jobs, appliedJobIds]);

  const applicationsReceived = useMemo(() => myJobs.reduce((total, job) => total + (job.applicationCount || 0), 0), [myJobs]);
  const suggestedWorkers = useMemo(() => workers.slice(0, 5), [workers]);

  if (loading) return <Loader />;

  const handleModeSelection = async (mode) => {
    setSavingMode(true);
    await updateProfile({ preferredMode: mode });
    setSavingMode(false);
  };

  return (
    <div className="w-full min-h-screen pt-24 pb-12">
      <main className="max-w-screen-xl mx-auto px-4">
        {!selectedMode && (
          <section className="mb-6 rounded-2xl border border-violet-300/30 bg-white/90 dark:bg-white/10 p-6 shadow-lg">
            <h2 className="text-2xl font-semibold">What do you want to do?</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Choose your current mode.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={savingMode}
                onClick={() => handleModeSelection('worker')}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-white active:scale-95 transition-transform disabled:opacity-60"
              >
                Find Work
              </button>
              <button
                type="button"
                disabled={savingMode}
                onClick={() => handleModeSelection('hirer')}
                className="rounded-lg border border-violet-400 px-4 py-2 text-violet-700 dark:text-violet-200 active:scale-95 transition-transform disabled:opacity-60"
              >
                Hire Worker
              </button>
            </div>
          </section>
        )}

        <motion.section {...cardMotion} className="rounded-2xl bg-gradient-to-r from-violet-700 via-purple-600 to-fuchsia-600 text-white p-6 md:p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.22em] text-white/70">Unified Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-semibold mt-2">Hello, {user?.name || 'User'}</h1>
          <p className="mt-2 text-white/85">Nearby work. Fast hiring.</p>
        </motion.section>

        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/search" className="rounded-xl bg-white/85 dark:bg-white/10 backdrop-blur-md p-5 shadow-md hover:-translate-y-1 transition-transform duration-200 active:scale-95 border border-violet-200/50 dark:border-violet-300/20">
            <h2 className="text-lg font-semibold">{isWorker ? 'Find Jobs' : 'Find Work'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Nearby Jobs</p>
          </Link>
          <Link to={isWorker ? '/my-applications' : '/post-job'} className="rounded-xl bg-white/85 dark:bg-white/10 backdrop-blur-md p-5 shadow-md hover:-translate-y-1 transition-transform duration-200 active:scale-95 border border-violet-200/50 dark:border-violet-300/20">
            <h2 className="text-lg font-semibold">{isWorker ? 'My Applications' : 'Post Job'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isWorker ? 'Track Status' : 'Hire Worker'}</p>
          </Link>
          <Link to={isWorker ? '/worker/dashboard' : '/my-jobs'} className="rounded-xl bg-white/85 dark:bg-white/10 backdrop-blur-md p-5 shadow-md hover:-translate-y-1 transition-transform duration-200 active:scale-95 border border-violet-200/50 dark:border-violet-300/20">
            <h2 className="text-lg font-semibold">{isWorker ? 'Worker Profile' : 'My Jobs'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isWorker ? 'Update Details' : 'Applicants'}</p>
          </Link>
        </section>

        {isWorker ? (
          <section className="mt-10 space-y-6">
            <h2 className="text-2xl font-semibold">Worker Feed</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="rounded-xl bg-white/85 dark:bg-white/10 backdrop-blur-md p-5 shadow-md border border-violet-200/50 dark:border-violet-300/20">
                <h3 className="font-semibold">Nearby Jobs</h3>
                <p className="text-3xl font-bold mt-2">{nearbyJobs.length}</p>
              </div>
              <div className="rounded-xl bg-white/85 dark:bg-white/10 backdrop-blur-md p-5 shadow-md border border-violet-200/50 dark:border-violet-300/20">
                <h3 className="font-semibold">Recommended Jobs</h3>
                <p className="text-3xl font-bold mt-2">{recommendedJobs.length}</p>
              </div>
              <div className="rounded-xl bg-white/85 dark:bg-white/10 backdrop-blur-md p-5 shadow-md border border-violet-200/50 dark:border-violet-300/20">
                <h3 className="font-semibold">Applied Jobs</h3>
                <p className="text-3xl font-bold mt-2">{applications.length}</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-10 space-y-6">
            <h2 className="text-2xl font-semibold">Hirer Feed</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="rounded-xl bg-white/85 dark:bg-white/10 backdrop-blur-md p-5 shadow-md border border-violet-200/50 dark:border-violet-300/20">
                <h3 className="font-semibold">Posted Jobs</h3>
                <p className="text-3xl font-bold mt-2">{myJobs.length}</p>
              </div>
              <div className="rounded-xl bg-white/85 dark:bg-white/10 backdrop-blur-md p-5 shadow-md border border-violet-200/50 dark:border-violet-300/20">
                <h3 className="font-semibold">Applications Received</h3>
                <p className="text-3xl font-bold mt-2">{applicationsReceived}</p>
              </div>
              <div className="rounded-xl bg-white/85 dark:bg-white/10 backdrop-blur-md p-5 shadow-md border border-violet-200/50 dark:border-violet-300/20">
                <h3 className="font-semibold">Suggested Workers</h3>
                <p className="text-3xl font-bold mt-2">{suggestedWorkers.length}</p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white/85 dark:bg-white/10 backdrop-blur-md p-5 shadow-md border border-violet-200/50 dark:border-violet-300/20">
            <h3 className="text-lg font-semibold">Insights</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>Best salary</li>
              <li>Nearby first</li>
              <li>Skill match</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white/85 dark:bg-white/10 backdrop-blur-md p-5 shadow-md border border-violet-200/50 dark:border-violet-300/20">
            <h3 className="text-lg font-semibold">Recent Applied Jobs</h3>
            <div className="mt-3 space-y-2 text-sm">
              {(appliedJobs.length ? appliedJobs : jobs.slice(0, 4)).map((job) => (
                <div key={job._id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                  <span>{job.title}</span>
                  <span className="text-blue-600 font-semibold">₹{job.salary?.fixed || job.salary?.recommended || job.budget}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
