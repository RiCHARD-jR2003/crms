import { api } from './api';
import toastService from './toastService';

export const announcementService = {
  // Get all announcements
  getAll: async () => {
    try {
      const response = await api.get('/announcements');
      return response;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toastService.error('Failed to fetch announcements: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Get Admin announcements only (using client-side filtering)
  getAdminAnnouncements: async () => {
    try {
      const response = await api.get('/announcements');
      const announcementsData = response || [];
      
      // Filter announcements created by Admin users on the client side
      const adminAnnouncements = announcementsData.filter(announcement => 
        announcement.author?.role === 'Admin'
      );
      
      return adminAnnouncements;
    } catch (error) {
      console.error('Error fetching admin announcements:', error);
      toastService.error('Failed to fetch admin announcements: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Create new announcement
  create: async (announcementData) => {
    try {
      const response = await api.post('/announcements', announcementData);
      return response;
    } catch (error) {
      console.error('Error creating announcement:', error);
      toastService.error('Failed to create announcement: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Update announcement
  update: async (id, announcementData) => {
    try {
      const response = await api.put(`/announcements/${id}`, announcementData);
      return response;
    } catch (error) {
      console.error('Error updating announcement:', error);
      toastService.error('Failed to update announcement: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Delete announcement
  delete: async (id) => {
    try {
      const response = await api.delete(`/announcements/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toastService.error('Failed to delete announcement: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Get announcement by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/announcements/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching announcement:', error);
      toastService.error('Failed to fetch announcement: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Get announcements by audience
  getByAudience: async (audience) => {
    try {
      const response = await api.get(`/announcements/audience/${encodeURIComponent(audience)}`);
      return response;
    } catch (error) {
      console.error('Error fetching announcements by audience:', error);
      toastService.error('Failed to fetch announcements by audience: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Get filtered announcements for PWD members - only show announcements for their barangay
  getFilteredForPWDMember: async (userBarangay) => {
    try {
      if (!userBarangay) {
        console.warn('User barangay not found, returning empty array');
        return [];
      }
      
      // Use the same getByAudience endpoint to get barangay-specific announcements
      const response = await api.get(`/announcements/audience/${encodeURIComponent(userBarangay)}`);
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response && response.data) {
        if (Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching filtered announcements for PWD member:', error);
      // Don't show error toast for empty announcements - it's normal
      return [];
    }
  },

  // Post a draft announcement (change status from Draft to Active)
  postAnnouncement: async (id) => {
    try {
      const response = await api.post(`/announcements/${id}/post`);
      return response;
    } catch (error) {
      console.error('Error posting announcement:', error);
      toastService.error('Failed to post announcement: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Barangay President: Announce to all registered members
  announceToMembers: async (id) => {
    try {
      const response = await api.post(`/announcements/${id}/announce-to-members`);
      return response;
    } catch (error) {
      console.error('Error announcing to members:', error);
      toastService.error('Failed to announce to members: ' + (error.message || 'Unknown error'));
      throw error;
    }
  }
};

export default announcementService;