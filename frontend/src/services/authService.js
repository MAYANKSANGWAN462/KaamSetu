// Purpose: Provides authentication API helpers and session persistence utilities.
// frontend/src/services/authService.js
// Authentication service with industry-standard patterns

import api from "./api";

class AuthService {
  parseAuthResponse(responseData) {
    const token = responseData?.token || responseData?.data?.token;
    const user = responseData?.data ?? responseData?.user ?? null;
    return { token, user };
  }

  // Register new user
  async register(userData) {
    try {
      console.log("[AUTH_SERVICE][REGISTER] Request", {
        email: userData?.email,
        phone: userData?.phone,
      });
      // const { language, ...cleanData } = userData;
      // const response = await api.post("/auth/register", cleanData);
      const response = await api.post('/auth/register', userData);
      console.log("[AUTH_SERVICE][REGISTER] Response", response.data);
      const { token, user } = this.parseAuthResponse(response.data);
      if (token && user) {
        this.setSession(token, user);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Login user
  async login(credentials) {
    try {
      console.log("[AUTH_SERVICE][LOGIN] Request", {
        email: credentials?.email,
      });
      const response = await api.post("/auth/login", credentials);
      console.log("[AUTH_SERVICE][LOGIN] Response", response.data);
      const { token, user } = this.parseAuthResponse(response.data);
      if (token && user) {
        this.setSession(token, user);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Logout user (clears httpOnly cookie on server + local session)
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      /* still clear client state */
    }
    this.clearSession();
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await api.put("/auth/profile", profileData);
      const payload = response.data?.data || response.data?.user;
      if (payload) {
        localStorage.setItem("user", JSON.stringify(payload));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateActiveMode(mode) {
    try {
      const response = await api.patch("/auth/mode", { mode });
      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404 || status === 405) {
        const fallback = await api.put("/auth/profile", { activeMode: mode });
        return fallback.data;
      }
      throw this.handleError(error);
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put("/auth/change-password", passwordData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Set session data
  setSession(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }

  // Clear session data
  clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Check if authenticated
  isAuthenticated() {
    return !!localStorage.getItem("token");
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      return error.response.data.message || "An error occurred";
    }
    return error.message || "Network error";
  }
}

export default new AuthService();
