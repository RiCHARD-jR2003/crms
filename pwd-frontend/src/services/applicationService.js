import api from './api';
import toastService from './toastService';

export const applicationService = {
  // Get all applications
  getAll: async () => {
    try {
      const response = await api.get('/applications');
      return response;
    } catch (error) {
      console.error('Error fetching applications:', error);
      toastService.error('Failed to fetch applications: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Create new application
  create: async (applicationData) => {
    try {
      const response = await api.post('/applications', applicationData);
      return response;
    } catch (error) {
      console.error('Error creating application:', error);
      toastService.error('Failed to create application: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Update application
  update: async (id, applicationData) => {
    try {
      const response = await api.put(`/applications/${id}`, applicationData);
      return response;
    } catch (error) {
      console.error('Error updating application:', error);
      toastService.error('Failed to update application: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Delete application
  delete: async (id) => {
    try {
      const response = await api.delete(`/applications/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting application:', error);
      toastService.error('Failed to delete application: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Get application by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/applications/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching application:', error);
      toastService.error('Failed to fetch application: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Update application status
  updateStatus: async (id, statusData) => {
    try {
      const response = await api.patch(`/applications/${id}/status`, statusData);
      return response;
    } catch (error) {
      console.error('Error updating application status:', error);
      toastService.error('Failed to update application status: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Get applications by status
  getByStatus: async (status) => {
    try {
      const response = await api.get(`/applications/status/${encodeURIComponent(status)}`);
      // Ensure we always return an array
      if (Array.isArray(response)) {
        return response;
      } else if (response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected response format from getByStatus:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching applications by status:', error);
      // Don't show toast for every error, just log it
      // toastService.error('Failed to fetch applications by status: ' + (error.message || 'Unknown error'));
      // Return empty array instead of throwing to prevent crashes
      return [];
    }
  }
};

export default applicationService;
