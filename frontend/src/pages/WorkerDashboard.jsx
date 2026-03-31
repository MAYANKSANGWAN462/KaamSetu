// Purpose: Displays worker stats, applications, and recommended jobs.
// frontend/src/pages/WorkerDashboard.jsx
// Worker dashboard with stats, applications, and earnings

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { jobService } from '../services';
import { motion } from 'framer-motion';
import JobCard from '../components/hirer/JobCard';
import RatingStars from '../components/reviews/RatingStars';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    accepted: 0,
    completed: 0,
    totalEarnings: 0,
    rating: 0
  });
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appsRes, jobsRes] = await Promise.all([
        jobService.getMyApplications(),
        jobService.getJobs({ limit: 5 })
      ]);

      const applications = appsRes.data || [];
      setApplications(applications);
      setRecommendedJobs(jobsRes.jobs || []);
      
      // Calculate stats
      const accepted = applications.filter(app => app.status === 'accepted').length;
      const completed = applications.filter(app => app.status === 'completed').length;
      const totalEarnings = applications
        .filter(app => app.status === 'completed')
        .reduce((sum, app) => sum + (app.jobId?.budget || 0), 0);
      
      setStats({
        totalApplications: applications.length,
        accepted,
        completed,
        totalEarnings,
        rating: user?.rating || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const statCards = [
    { label: 'Total Applications', value: stats.totalApplications, icon: '📋', color: 'from-blue-500 to-cyan-500' },
    { label: 'Accepted Jobs', value: stats.accepted, icon: '✓', color: 'from-green-500 to-emerald-500' },
    { label: 'Rejected', value: applications.filter((app) => app.status === 'rejected').length, icon: '⚑', color: 'from-purple-500 to-pink-500' },
    { label: 'Total Earnings', value: `₹${stats.totalEarnings}`, icon: '💰', color: 'from-yellow-500 to-orange-500' }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || 'Worker' })}
          </h1>
          <p className="text-white/90">Find jobs, build your career, and earn money</p>
          
          {/* Rating */}
          <div className="mt-4 flex items-center">
            <RatingStars rating={stats.rating} size="large" />
            <span className="ml-2 text-white/90">({stats.rating.toFixed(1)} average rating)</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r ${stat.color} rounded-xl p-6 text-white shadow-lg`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recent Applications</h2>
              <Link to="/jobs" className="text-blue-600 hover:text-blue-700">Browse Jobs →</Link>
            </div>
            
            {loading ? (
              <div className="text-center py-8">{t('common.loading')}</div>
            ) : applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app, index) => (
                  <motion.div
                    key={app._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{app.jobId?.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {t(`application.status.${app.status}`)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Bid Amount: ₹{app.bidAmount}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-600">No applications yet</p>
                <Link to="/jobs" className="mt-2 inline-block text-blue-600 hover:underline">
                  Browse Jobs →
                </Link>
              </div>
            )}
          </div>
          
          {/* Recommended Jobs */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recommended Jobs</h2>
              <Link to="/jobs" className="text-blue-600 hover:text-blue-700">
                Browse All →
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-8">{t('common.loading')}</div>
            ) : recommendedJobs.length > 0 ? (
              <div className="space-y-4">
                {recommendedJobs.map((job) => (
                  <JobCard key={job._id} job={job} compact />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-600">No recommended jobs at the moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;