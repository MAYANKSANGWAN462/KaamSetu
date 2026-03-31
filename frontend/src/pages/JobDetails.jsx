// Purpose: Displays full job information and allows eligible workers to apply from a dedicated details page.
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jobService } from '../services';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await jobService.getJobById(id);
        setJob(response.data || null);
      } catch (error) {
        toast.error(error || 'Failed to load job details');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  const handleApply = async () => {
    if (!user?.actsAsWorker) {
      toast.error('Create worker profile to apply');
      return;
    }

    try {
      setApplying(true);
      await jobService.applyForJob(job._id, {});
      toast.success('Applied successfully');
      const refreshed = await jobService.getJobById(id);
      setJob(refreshed.data || null);
    } catch (error) {
      toast.error(error || 'Unable to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleBookWorker = async (applicationId) => {
    try {
      setBookingId(applicationId);
      await jobService.acceptApplication(job._id, applicationId);
      toast.success('Worker booked');
      const refreshed = await jobService.getJobById(id);
      setJob(refreshed.data || null);
    } catch (error) {
      toast.error(error || 'Unable to book worker');
    } finally {
      setBookingId('');
    }
  };

  if (loading) return <Loader />;
  if (!job) return null;

  const isOpen = job.status === 'open';
  const isOwner = user?._id && (job.createdBy?._id === user._id || job.createdBy === user._id);
  const myAcceptedApplication = (job.applications || []).find((application) => {
    const workerId = typeof application.workerId === 'string' ? application.workerId : application.workerId?._id;
    return workerId === user?._id && application.status === 'accepted';
  });
  const hirerId = typeof job.createdBy === 'string' ? job.createdBy : job.createdBy?._id;

  return (
    <div className="w-full min-h-screen pt-24 pb-10">
      <main className="max-w-screen-xl mx-auto px-4">
        <div className="rounded-2xl bg-white/85 dark:bg-white/10 backdrop-blur-md border border-violet-200/50 dark:border-violet-300/20 p-6 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{job.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">{job.location?.city || job.locationText || 'Unknown location'}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-violet-700 dark:text-violet-300">
                ₹{job.salary?.fixed || job.salary?.recommended || job.budget || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-300">Workers needed: {job.workersRequired || 1}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <section className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Description</h2>
              <p className="mt-2 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{job.description}</p>

              <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {(job.requiredSkills || []).length ? (job.requiredSkills || []).map((skill) => (
                  <span key={skill} className="px-2.5 py-1 rounded-full text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                    {skill}
                  </span>
                )) : <span className="text-sm text-gray-500 dark:text-gray-300">No specific skills listed</span>}
              </div>
            </section>

            <aside className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">Category</p>
              <p className="font-semibold text-gray-900 dark:text-white">{job.category}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">Status</p>
              <p className="font-semibold text-gray-900 dark:text-white">{job.status}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">Duration</p>
              <p className="font-semibold text-gray-900 dark:text-white">{job.duration}</p>

              {isOpen && (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="mt-6 w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white active:scale-95 transition-transform disabled:opacity-50"
                >
                  {applying ? 'Applying...' : 'Apply'}
                </button>
              )}

              {!!myAcceptedApplication && !!hirerId && (
                <button
                  onClick={() => navigate(`/chat/${hirerId}`)}
                  className="mt-3 w-full py-2 rounded-lg border border-violet-400 text-violet-700 dark:text-violet-200 active:scale-95 transition-transform"
                >
                  Chat
                </button>
              )}
            </aside>
          </div>

          {isOwner && (
            <section className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Applicants</h3>
              <div className="mt-3 space-y-3">
                {(job.applications || []).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-300">No applications yet.</p>
                )}
                {(job.applications || []).map((application) => {
                  const worker = application.workerId || {};
                  const workerId = typeof worker === 'string' ? worker : worker._id;
                  return (
                    <div key={application._id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{worker.name || 'Worker'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-300">Status: {application.status}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {application.status !== 'accepted' && (
                            <button
                              onClick={() => handleBookWorker(application._id)}
                              disabled={bookingId === application._id}
                              className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 text-white text-sm active:scale-95 transition-transform disabled:opacity-60"
                            >
                              {bookingId === application._id ? 'Booking...' : 'Book Worker'}
                            </button>
                          )}
                          {!!workerId && (
                            <button
                              onClick={() => navigate(`/chat/${workerId}`)}
                              className="rounded-lg border border-violet-400 px-3 py-1.5 text-sm text-violet-700 dark:text-violet-200 active:scale-95 transition-transform"
                            >
                              Chat
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobDetails;
