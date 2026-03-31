// Purpose: Shows applications submitted by the current worker with quick status visibility.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { jobService } from '../services';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await jobService.getMyApplications();
        setApplications(response.data || []);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="w-full min-h-screen pt-24 pb-10">
      <main className="max-w-screen-xl mx-auto px-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">My Applications</h1>

        {applications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((application) => (
              <div key={application._id} className="rounded-xl bg-white/85 dark:bg-white/10 backdrop-blur-md border border-violet-200/50 dark:border-violet-300/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{application.jobId?.title || 'Job'}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{application.jobId?.location?.city || application.jobId?.location || 'Unknown location'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                      {application.status}
                    </span>
                    {application.status === 'accepted' && application.jobId?.createdBy && (
                      <button
                        onClick={() => navigate(`/chat/${typeof application.jobId.createdBy === 'string' ? application.jobId.createdBy : application.jobId.createdBy._id}`)}
                        className="px-3 py-1 rounded-lg border border-violet-400 text-sm text-violet-700 dark:text-violet-200"
                      >
                        Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyApplications;
