// Purpose: Provides job-related API methods with normalized response handling.
// import api from './api'

// export const jobService = {
//   createJob: async (data) => {
//     const response = await api.post('/jobs', data)
//     return response.data
//   },

//   getJobs: async (params) => {
//     const response = await api.get('/jobs', { params })
//     return response.data
//   },

//   getJobById: async (id) => {
//     const response = await api.get(`/jobs/${id}`)
//     return response.data
//   },

//   updateJob: async (id, data) => {
//     const response = await api.put(`/jobs/${id}`, data)
//     return response.data
//   },

//   deleteJob: async (id) => {
//     const response = await api.delete(`/jobs/${id}`)
//     return response.data
//   },

//   applyForJob: async (jobId, bidData) => {
//     const response = await api.post(`/jobs/${jobId}/apply`, bidData)
//     return response.data
//   }
// }

// export default jobService;

// frontend/src/services/jobService.js
// Job service with industry-standard patterns

import api from "./api";

class JobService {
  normalizeJobsPayload(responseData) {
    const root = responseData?.data || responseData || {}

    if (Array.isArray(root)) {
      return root
    }

    if (Array.isArray(root.jobs)) {
      return root.jobs
    }

    if (Array.isArray(responseData?.jobs)) {
      return responseData.jobs
    }

    return []
  }

  // Get all jobs with filters
  async getJobs(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const endpoint = `/jobs${queryString ? `?${queryString}` : ""}`;
      const response = await api.get(endpoint);
      const jobs = this.normalizeJobsPayload(response.data)

      return {
        success: true,
        data: response.data,
        jobs,
      };
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw error;
    }
  }

  async getAllJobs() {
    return this.getJobs()
  }

  // Get job by ID
  async getJobById(id) {
    try {
      const response = await api.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create new job
  async createJob(jobData) {
    try {
      const response = await api.post("/jobs", jobData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update job
  async updateJob(id, jobData) {
    try {
      const response = await api.put(`/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete job
  async deleteJob(id) {
    try {
      const response = await api.delete(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get hirer's jobs
  async getMyJobs() {
    try {
      const response = await api.get("/jobs/my-jobs");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Apply for job
  async applyForJob(jobId, applicationData) {
    try {
      const response = await api.post(`/jobs/${jobId}/apply`, applicationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get job applications
  async getJobApplications(jobId) {
    try {
      const response = await api.get(`/jobs/${jobId}/applications`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get applications submitted by current user
  async getMyApplications() {
    try {
      const response = await api.get('/jobs/applications/my');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Accept application
  async acceptApplication(jobId, applicationId) {
    try {
      const response = await api.put(`/jobs/${jobId}/applications/${applicationId}`, {
        status: 'accepted'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reject application
  async rejectApplication(jobId, applicationId) {
    try {
      const response = await api.put(`/jobs/${jobId}/applications/${applicationId}`, {
        status: 'rejected'
      });
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

export default new JobService();
