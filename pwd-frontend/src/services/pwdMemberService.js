// src/services/pwdMemberService.js
import { api } from './api';

const pwdMemberService = {
  // Get all PWD members
  async getAll() {
    // Use fallback endpoint that doesn't require authentication
    try {
      const fallbackResponse = await api.get('/pwd-members-fallback');
      return fallbackResponse;
    } catch (fallbackError) {
      console.warn('Fallback /pwd-members-fallback failed, trying mock endpoint:', fallbackError?.message || fallbackError);
      try {
        const mockResponse = await api.get('/mock-pwd');
        return mockResponse;
      } catch (mockError) {
        console.error('Error fetching PWD members (both endpoints failed):', mockError);
        throw mockError;
      }
    }
  },

  // Get all PWD members (alias for getAll)
  async getAllMembers() {
    return this.getAll();
  },

  // Get PWD member by ID
  async getById(id) {
    try {
      const response = await api.get(`/pwd-members/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching PWD member:', error);
      throw error;
    }
  },

  // Create new PWD member
  async create(memberData) {
    try {
      const response = await api.post('/pwd-members', memberData);
      return response;
    } catch (error) {
      console.error('Error creating PWD member:', error);
      throw error;
    }
  },

  // Update PWD member
  async update(id, memberData) {
    try {
      const response = await api.put(`/pwd-members/${id}`, memberData);
      return response;
    } catch (error) {
      console.error('Error updating PWD member:', error);
      throw error;
    }
  },

  // Delete PWD member
  async delete(id) {
    try {
      const response = await api.delete(`/pwd-members/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting PWD member:', error);
      throw error;
    }
  },

  // Get PWD member applications
  async getApplications(id) {
    try {
      const response = await api.get(`/pwd-members/${id}/applications`);
      return response;
    } catch (error) {
      console.error('Error fetching PWD member applications:', error);
      throw error;
    }
  },

  // Get PWD member complaints
  async getComplaints(id) {
    try {
      const response = await api.get(`/pwd-members/${id}/complaints`);
      return response;
    } catch (error) {
      console.error('Error fetching PWD member complaints:', error);
      throw error;
    }
  },

  // Get PWD member benefit claims
  async getBenefitClaims(id) {
    try {
      const response = await api.get(`/pwd-members/${id}/benefit-claims`);
      return response;
    } catch (error) {
      console.error('Error fetching PWD member benefit claims:', error);
      throw error;
    }
  },

  // Get PWD members with filters
  async getFiltered(filters = {}) {
    try {
      // For now, use the mock endpoint and apply filters on the frontend
      const response = await api.get('/mock-pwd');
      return response;
    } catch (error) {
      console.error('Error fetching filtered PWD members:', error);
      throw error;
    }
  }
};

export default pwdMemberService;
