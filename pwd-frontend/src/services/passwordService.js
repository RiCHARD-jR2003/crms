// src/services/passwordService.js
import api from './api';

const passwordService = {
  // Reset password without authentication (forgot password)
  async resetPassword(email, newPassword, confirmPassword) {
    try {
      const response = await api.post('/reset-password', {
        email,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to reset password' };
    }
  },

  // Change password (requires authentication)
  async changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      const response = await api.post('/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to change password' };
    }
  },

  // Admin reset user password
  async adminResetUserPassword(email, newPassword) {
    try {
      const response = await api.post('/admin/reset-user-password', {
        email,
        newPassword
      });
      // api already returns parsed JSON; return as-is
      return response;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to reset user password' };
    }
  }
};

export default passwordService;
