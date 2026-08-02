// Purpose: Composes global providers and defines all application routes.
// frontend/src/App.jsx
// Main app component with all providers and route configuration

import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import MobileTabBar from "./components/common/MobileTabBar";
import Loader from "./components/common/Loader";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Search = lazy(() => import("./pages/Search"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WorkerSetup = lazy(() => import("./pages/WorkerSetup"));
const WorkerProfile = lazy(() => import("./pages/WorkerProfile"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const MyApplications = lazy(() => import("./pages/MyApplications"));
const PostJob = lazy(() => import("./pages/PostJob"));
const MyJobs = lazy(() => import("./pages/MyJobs"));
const Messenger = lazy(() => import("./pages/Messenger"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const ManageJobs = lazy(() => import("./pages/admin/ManageJobs"));

const Layout = ({ children }) => {
  const location = useLocation();
  const isMessenger = location.pathname.startsWith('/messages');
  return (
    <div className="w-full min-h-screen bg-[#f6f7f9] dark:bg-[#0b0e14] transition-colors duration-300">
      <Header />
      {/* Bottom padding on mobile so content clears the fixed tab bar.
          Messenger manages its own height — no extra padding needed there. */}
      <main className={isMessenger ? '' : 'pb-20 md:pb-0'}>
        <Suspense fallback={<Loader />}>
          <AnimatedRoutes />
        </Suspense>
      </main>
      {/* Footer is desktop-only — on mobile the bottom tab bar replaces it. Never on messenger. */}
      {!isMessenger && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
      {/* Native-app-style bottom navigation — mobile only. */}
      <MobileTabBar />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--toast-bg)",
            color: "var(--toast-text)",
          },
        }}
      />
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/search" element={<Search />} />
          <Route path="/jobs" element={<Search />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/worker/:id" element={<WorkerProfile />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker-dashboard"
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/dashboard"
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker-profile"
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hirer-dashboard"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hirer/dashboard"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-job"
              element={
                <ProtectedRoute allowedRoles={['hirer']}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hirer/post-job"
              element={
                <ProtectedRoute allowedRoles={['hirer']}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['hirer']}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/worker/setup"
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-jobs"
              element={
                <ProtectedRoute allowedRoles={['hirer']}>
                  <MyJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messenger />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages/:conversationId"
              element={
                <ProtectedRoute>
                  <Messenger />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin — separate auth (AdminAuthContext), not the marketplace guard */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <ManageUsers />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <AdminProtectedRoute>
                <ManageJobs />
              </AdminProtectedRoute>
            }
          />

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
            <SocketProvider>
              <AdminAuthProvider>
                <Layout />
              </AdminAuthProvider>
            </SocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
