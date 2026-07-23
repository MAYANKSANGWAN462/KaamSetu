import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from '../../context/AuthContext';

const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const { googleLogin } = useAuth();

  const googleLoginRedirect = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'redirect',
    redirect_uri: window.location.origin + '/login',
  });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setLoading(true);
    try {
      const result = await onSubmit(email, password);
      if (result && result.success === false) {
        setSubmitError(result.message || "Login failed. Please try again.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  };


  const inputClass = (field) => `
    w-full rounded-xl px-4 py-3.5 text-sm font-medium
    bg-white/60 dark:bg-white/5
    border-2 transition-all duration-300 outline-none
    text-gray-900 dark:text-gray-100
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    ${
      focusedField === field
        ? "border-amber-400 dark:border-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.12)]"
        : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
    }
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Google Login Button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02, duration: 0.4 }}
      >
        <button
          type="button"
          onClick={() => googleLoginRedirect()}
          className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/10 transition-all duration-300"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
      </div>

      {/* Email Field */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass("email")}
          placeholder="you@example.com"
          required
        />
      </motion.div>

      {/* Password Field */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass("password")}
          placeholder="Enter your password"
          required
        />
      </motion.div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-3 text-white bg-amber-500 hover:bg-amber-400"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {submitError && (
        <div className="text-red-500 text-sm text-center">{submitError}</div>
      )}
    </form>
  );
};

export default LoginForm;
