// Purpose: Composes global providers and defines all application routes.
// frontend/src/App.jsx
// Main app component with all providers and route configuration

import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Loader from './components/common/Loader';
import CustomCursor from './components/common/CustomCursor';
import ChatFloatButton from './components/chat/ChatFloatButton';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Search = lazy(() => import('./pages/Search'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WorkerSetup = lazy(() => import('./pages/WorkerSetup'));
const WorkerProfile = lazy(() => import('./pages/WorkerProfile'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const MyApplications = lazy(() => import('./pages/MyApplications'));
const PostJob = lazy(() => import('./pages/PostJob'));
const MyJobs = lazy(() => import('./pages/MyJobs'));
const Messages = lazy(() => import('./pages/Messages'));
const Chat = lazy(() => import('./pages/Chat'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/jobs" element={<Search />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/worker/:id" element={<WorkerProfile />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/worker-dashboard" element={
              <ProtectedRoute>
                <WorkerSetup />
              </ProtectedRoute>
            } />
            <Route path="/worker/dashboard" element={
              <ProtectedRoute>
                <WorkerSetup />
              </ProtectedRoute>
            } />
            <Route path="/worker-profile" element={
              <ProtectedRoute>
                <WorkerSetup />
              </ProtectedRoute>
            } />
            <Route path="/hirer-dashboard" element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="/hirer/dashboard" element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } />
            <Route path="/post-job" element={
              <ProtectedRoute>
                <PostJob />
              </ProtectedRoute>
            } />
            <Route path="/my-jobs" element={
              <ProtectedRoute>
                <MyJobs />
              </ProtectedRoute>
            } />
            <Route path="/my-applications" element={
              <ProtectedRoute>
                <MyApplications />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/chat/:userId" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <div className="w-full min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 dark:from-[#0f0b1c] dark:via-[#120f24] dark:to-[#1a1433] transition-colors duration-300">
              <CustomCursor />
              <Header />
              <Suspense fallback={<Loader />}>
                <AnimatedRoutes />
              </Suspense>
              <ChatFloatButton />
              <Footer />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-text)',
                  },
                }}
              />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;