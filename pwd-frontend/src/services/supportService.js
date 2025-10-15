// src/services/supportService.js
import { api } from './api';

const API_BASE_URL = 'http://192.168.18.25:8000/api';

async function getStoredToken() {
  try {
    const raw = localStorage.getItem('auth.token');
    console.log('Raw token from localStorage:', raw);
    const token = raw ? JSON.parse(raw) : null;
    console.log('Parsed token:', token ? 'Token exists' : 'No token');
    return token;
  } catch (error) {
    console.error('Error parsing token:', error);
    localStorage.removeItem('auth.token');
    return null;
  }
}

export const supportService = {
  // Get all support tickets (role-based)
  getTickets: () => api.get('/support-tickets'),
  
  // Get archived support tickets (role-based)
  getArchivedTickets: () => api.get('/support-tickets/archived'),
  
  // Get a specific ticket by ID
  getTicket: (id) => api.get(`/support-tickets/${id}`),
  
  // Create a new support ticket (PWD members only)
  createTicket: (ticketData, file = null) => {
    const formData = new FormData();
    formData.append('subject', ticketData.subject);
    formData.append('description', ticketData.description);
    formData.append('priority', ticketData.priority || 'medium');
    formData.append('category', ticketData.category || 'General');
    
    if (file) {
      formData.append('attachment', file);
    }
    
    return api.post('/support-tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update a support ticket
  updateTicket: (id, updateData) => api.put(`/support-tickets/${id}`, updateData),
  
  // Patch a support ticket (for status updates)
  patchTicket: (id, updateData) => api.patch(`/support-tickets/${id}`, updateData),
  
  // Delete a support ticket (admin only)
  deleteTicket: (id) => api.delete(`/support-tickets/${id}`),
  
  // Download attachment from a message
  downloadAttachment: async (messageId) => {
    try {
      console.log('Starting downloadAttachment for messageId:', messageId);
      
      // Use the main API service for consistent token handling
      const token = await getStoredToken();
      console.log('Token retrieved:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Making request to:', `${API_BASE_URL}/support-tickets/messages/${messageId}/download`);
      
      const response = await fetch(`${API_BASE_URL}/support-tickets/messages/${messageId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      // Return the blob for file preview with MIME type
      const blob = await response.blob();
      console.log('Blob created:', blob.type, blob.size);
      
      // Create a new blob with the correct MIME type from response headers
      const contentType = response.headers.get('Content-Type') || blob.type;
      const newBlob = new Blob([blob], { type: contentType });
      console.log('New blob with MIME type:', newBlob.type);
      
      return newBlob;
    } catch (error) {
      console.error('Error in downloadAttachment:', error);
      throw error;
    }
  },

  // Force download attachment from a message
  forceDownloadAttachment: async (messageId) => {
    const token = await getStoredToken();
    const response = await fetch(`${API_BASE_URL}/support-tickets/messages/${messageId}/force-download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  },

  // Add a message to a support ticket
  addMessage: (id, message, file = null) => {
    const formData = new FormData();
    formData.append('message', message);
    
    if (file) {
      formData.append('attachment', file);
    }
    
    return api.post(`/support-tickets/${id}/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Admin-specific methods
  admin: {
    // Update ticket status
    updateStatus: (id, status) => api.patch(`/support-tickets/${id}`, { status }),
    
    // Update ticket priority
    updatePriority: (id, priority) => api.patch(`/support-tickets/${id}`, { priority }),
    
    // Mark ticket as resolved
    markResolved: (id) => api.patch(`/support-tickets/${id}`, { status: 'resolved' }),
    
    // Mark ticket as closed
    markClosed: (id) => api.patch(`/support-tickets/${id}`, { status: 'closed' }),
    
    // Mark ticket as in progress
    markInProgress: (id) => api.patch(`/support-tickets/${id}`, { status: 'in_progress' }),
  },
  
  // PWD Member-specific methods
  pwdMember: {
    // Mark own ticket as resolved
    markResolved: (id) => api.patch(`/support-tickets/${id}`, { status: 'resolved' }),
    
    // Mark own ticket as closed
    markClosed: (id) => api.patch(`/support-tickets/${id}`, { status: 'closed' }),
  },
  
  // Utility methods
  utils: {
    // Get ticket statistics
    getStats: (tickets) => {
      const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        closed: tickets.filter(t => t.status === 'closed').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length,
        high: tickets.filter(t => t.priority === 'high').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        low: tickets.filter(t => t.priority === 'low').length,
      };
      return stats;
    },
    
    // Get status color
    getStatusColor: (status) => {
      const colors = {
        'open': '#E74C3C',
        'in_progress': '#F39C12',
        'resolved': '#27AE60',
        'closed': '#7F8C8D'
      };
      return colors[status] || '#7F8C8D';
    },
    
    // Get priority color
    getPriorityColor: (priority) => {
      const colors = {
        'urgent': '#E74C3C',
        'high': '#E67E22',
        'medium': '#F39C12',
        'low': '#27AE60'
      };
      return colors[priority] || '#7F8C8D';
    },
    
    // Get category color
    getCategoryColor: (category) => {
      const colors = {
        'PWD Card': '#3498DB',
        'Benefits': '#9B59B6',
        'Technical': '#E67E22',
        'General': '#1ABC9C',
        'Account': '#E74C3C',
        'Other': '#95A5A6'
      };
      return colors[category] || '#7F8C8D';
    },
    
    // Format ticket number
    formatTicketNumber: (ticketNumber) => {
      return ticketNumber ? `#${ticketNumber}` : 'N/A';
    },
    
    // Format date
    formatDate: (date) => {
      return new Date(date).toLocaleDateString();
    },
    
    // Format datetime
    formatDateTime: (date) => {
      return new Date(date).toLocaleString();
    }
  }
};

export default supportService;
