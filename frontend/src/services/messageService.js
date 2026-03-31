// frontend/src/services/messageService.js
// Message service with industry-standard patterns

import api from './api';

class MessageService {
  // Get all conversations
  async getConversations() {
    try {
      const response = await api.get('/messages/conversations');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get messages between users
  async getMessages(userId, page = 1, limit = 50) {
    try {
      const response = await api.get(`/messages/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send a message
  async sendMessage(receiverId, message) {
    try {
      const response = await api.post('/messages', { receiverId, message });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark messages as read
  async markAsRead(messageId) {
    try {
      const response = await api.put(`/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const response = await api.get('/messages/unread/count');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/messages/${messageId}`);
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
export default new MessageService();