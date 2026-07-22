// frontend/src/services/applicationService.js
import api from "./api";

class ApplicationService {
  async getJobApplications(jobId) {
    try {
      const response = await api.get(`/applications/job/${jobId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyApplications() {
    try {
      const response = await api.get("/applications/my");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async applyForJob(jobId, data = {}) {
    try {
      const response = await api.post(`/applications/job/${jobId}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateApplication(applicationId, status) {
    try {
      const response = await api.put(`/applications/${applicationId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async checkInteraction(params) {
    try {
      const response = await api.get("/applications/check", { params });
      return response.data;
    } catch {
      return { hasInteraction: false };
    }
  }

  async contactWorker(data) {
    try {
      const response = await api.post("/applications/contact", data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  handleError(error) {
    if (error.response) {
      return error.response.data?.message || "An error occurred";
    }
    return error.message || "Network error";
  }
}

export default new ApplicationService();
