// Purpose: Wraps worker profile API operations with normalized payload handling.
// frontend/src/services/workerService.js
// Worker service with industry-standard patterns

import api from "./api";

class WorkerService {
  // Get all workers with filters
  async getWorkers(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const endpoint = `/worker${queryString ? `?${queryString}` : ""}`;
      const response = await api.get(endpoint);

      // Return the full response structure
      return {
        success: true,
        data: response.data,
        workers: response.data?.data?.workers || response.data?.workers || response.data?.data || [],
      };
    } catch (error) {
      console.error("Error fetching workers:", error);
      throw error;
    }
  }

  // Get worker by ID
  async getWorkerById(id) {
    try {
      const response = await api.get(`/worker/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create or update worker profile
  async createWorkerProfile(profileData) {
    try {
      const response = await api.post("/worker/profile", profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update worker profile
  async updateWorkerProfile(id, profileData) {
    try {
      const response = await api.put('/worker/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload portfolio image
  async uploadPortfolio(file) {
    try {
      const formData = new FormData();
      formData.append('images', file);
      const response = await api.post("/worker/portfolio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update availability
  async updateAvailability(availability) {
    try {
      const response = await api.put("/worker/availability", { availability });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      return error.response.data.message || "An error occurred";
    }
    return error.message || "Network error";
  }
}

export default new WorkerService();
