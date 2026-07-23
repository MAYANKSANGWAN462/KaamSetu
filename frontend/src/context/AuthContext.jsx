// Purpose: Manages authentication state, token persistence, and current user hydration.
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { authService } from "../services";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

const normalizeUser = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const {
    preferredMode,
    password,
    passwordHash,
    verificationToken,
    verificationExpiry,
    ...rest
  } = raw;
  return {
    ...rest,
    activeMode: rest.activeMode ?? preferredMode ?? null,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const extractAuthData = (responseData) => {
    const token = responseData?.token || responseData?.data?.token;
    const userData =
      responseData?.data?.data ||
      responseData?.data ||
      responseData?.user ||
      null;
    return { token, userData: normalizeUser(userData) };
  };

  useEffect(() => {
    axios.defaults.withCredentials = true;
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      if (storedUser) {
        try {
          setUser(normalizeUser(JSON.parse(storedUser)));
        } catch {
          localStorage.removeItem("user");
        }
      }
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authService.getProfile();
      const inner = response?.data !== undefined ? response.data : response;
      const raw = inner?.data ?? inner;
      const profile = normalizeUser(raw);
      setUser(profile);
      if (profile) {
        localStorage.setItem("user", JSON.stringify(profile));
      }
    } catch (error) {
      console.error("Error loading user:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const switchActiveMode = async (mode) => {
    if (!["worker", "hirer"].includes(mode)) {
      return { success: false, message: "Invalid mode" };
    }
    const prevUser = user;
    const prevStored = localStorage.getItem("user");
    const optimistic = normalizeUser({ ...(prevUser || {}), activeMode: mode });
    setUser(optimistic);
    localStorage.setItem("user", JSON.stringify(optimistic));
    try {
      await authService.updateActiveMode(mode);
      await loadUser();
      return { success: true };
    } catch (error) {
      if (prevUser) {
        setUser(prevUser);
      } else {
        setUser(null);
      }
      if (prevStored !== null) {
        localStorage.setItem("user", prevStored);
      } else {
        localStorage.removeItem("user");
      }
      const message =
        error?.response?.data?.message ||
        (typeof error === "string" ? error : error?.message) ||
        "Could not update mode";
      toast.error(message);
      return { success: false, message };
    }
  };

  const login = async (email, password) => {
    try {
      const responseData = await authService.login({ email, password });
      const { token, userData } = extractAuthData({ data: responseData });
      if (!token || !userData) {
        throw new Error("Invalid login response from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      await loadUser();

      toast.success("Login successful!");
      return { success: true, role: userData.role };
    } catch (error) {
      const message = error?.response?.data?.message || error || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const googleLogin = async (code, redirectUri) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/google`,
        { code, redirect_uri: redirectUri },
        { withCredentials: true },
      );

      const { token, userData } = extractAuthData(response);

      if (!token || !userData) {
        throw new Error("Invalid Google login response");
      }

      // ✅ Store token + user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // ✅ Set axios header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);

      await loadUser();

      toast.success("Google login successful!");
      return { success: true, role: userData.role };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Google login failed";

      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userDataInput) => {
    try {
      const responseData = await authService.register(userDataInput);
      const { token, userData: newUser } = extractAuthData({
        data: responseData,
      });
      if (!token || !newUser) {
        throw new Error("Invalid registration response from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(newUser);

      await loadUser();

      toast.success("Registration successful!");
      return { success: true, role: newUser.role };
    } catch (error) {
      const message =
        error?.response?.data?.message || error || "Registration failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      authService.clearSession();
    }
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    toast.success("Logged out successfully");
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const updateProfile = async (profileData) => {
    try {
      await authService.updateProfile(profileData);
      await loadUser();
      toast.success("Profile updated");
      return { success: true };
    } catch (error) {
      const message =
        error?.response?.data?.message || error || "Profile update failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    switchActiveMode,
    googleLogin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
