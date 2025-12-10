// src/services/benefitService.js

import { api } from './api';
import toastService from './toastService';

const benefitService = {
  // Get all benefits (with optional barangay filter and status filter)
  getAll: async (barangay = null, status = 'all') => {
    try {
      let url = '/benefits';
      const params = [];
      if (barangay) {
        params.push(`barangay=${encodeURIComponent(barangay)}`);
      }
      if (status && status !== 'all') {
        params.push(`status=${encodeURIComponent(status)}`);
      } else {
        // Fetch all benefits regardless of status
        params.push('status=all');
      }
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      const response = await api.get(url);
      // Sort by most recent first (created_at or distributionDate)
      const sorted = Array.isArray(response) ? response.sort((a, b) => {
        const dateA = new Date(a.created_at || a.distributionDate || 0);
        const dateB = new Date(b.created_at || b.distributionDate || 0);
        return dateB - dateA; // Most recent first
      }) : response;
      return sorted;
    } catch (error) {
      console.error('Error fetching benefits:', error);
      toastService.error('Failed to fetch benefits: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Get a specific benefit by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/benefits/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching benefit:', error);
      toastService.error('Failed to fetch benefit: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Create a new benefit
  create: async (benefitData) => {
    try {
      const response = await api.post('/benefits-simple', benefitData);
      return response;
    } catch (error) {
      console.error('Error creating benefit:', error);
      toastService.error('Failed to create benefit: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Update a benefit
  update: async (id, benefitData) => {
    try {
      const response = await api.put(`/benefits-simple/${id}`, benefitData);
      return response;
    } catch (error) {
      console.error('Error updating benefit:', error);
      toastService.error('Failed to update benefit: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Delete a benefit
  delete: async (id) => {
    try {
      const response = await api.delete(`/benefits-simple/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting benefit:', error);
      toastService.error('Failed to delete benefit: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Get benefit claims for a specific benefit
  getClaims: async (id) => {
    try {
      const response = await api.get(`/benefits/${id}/claims`);
      return response;
    } catch (error) {
      console.error('Error fetching benefit claims:', error);
      toastService.error('Failed to fetch benefit claims: ' + (error.message || 'Unknown error'));
      throw error;
    }
  },

  // Announce benefit (Barangay President feature)
  announceBenefit: async (id) => {
    try {
      const response = await api.post(`/benefits/${id}/announce`);
      return response;
    } catch (error) {
      console.error('Error announcing benefit:', error);
      toastService.error('Failed to announce benefit: ' + (error.message || 'Unknown error'));
      throw error;
    }
  }
};

export default benefitService;
