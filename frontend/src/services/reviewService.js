// frontend/src/services/reviewService.js
// Review service with industry-standard patterns

import api from './api';

class ReviewService {
  // Get reviews for a worker
  async getWorkerReviews(workerId, filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const queryString = params.toString();
      const endpoint = `/reviews/worker/${workerId}${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create a review
  async createReview(reviewData) {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update review
  async updateReview(id, reviewData) {
    try {
      const response = await api.put(`/reviews/${id}`, reviewData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete review
  async deleteReview(id) {
    try {
      const response = await api.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get review statistics
  async getReviewStats(workerId) {
    try {
      const response = await api.get(`/reviews/worker/${workerId}/stats`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      return error.response.data.message || 'An error occurred';
    }
    return error.message || 'Network error';
  }
}

// IMPORTANT: Default export
export default new ReviewService();