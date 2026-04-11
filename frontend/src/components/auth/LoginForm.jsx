import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from '../../context/AuthContext';

const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const { googleLogin } = useAuth(); // ✅ GET googleLogin FROM CONTEXT
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

  // ✅ GOOGLE LOGIN HANDLER
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        console.error("No credential received");
        return;
      }

      const result = await googleLogin(credentialResponse.credential);
      if (!result?.success) {
        setSubmitError(result?.message || "Google login failed");
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Google login error:", err);
      setSubmitError("Google login failed");
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
      {/* 🔥 GOOGLE LOGIN BUTTON (ADDED HERE) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02, duration: 0.4 }}
        className="flex justify-center"
      >
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => console.log("Google Login Failed")}
        />
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
