// frontend/src/services/userService.js
// User service with industry-standard patterns

import api from './api';

class UserService {
  // Get all users (admin only)
  async getAllUsers(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const queryString = params.toString();
      const response = await api.get(`/users${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update user (admin only)
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete user (admin only)
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
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

export default new UserService();