import { api } from './api';

const notificationService = {
  /**
   * Fetch all notifications for the current user
   * @returns {Promise<Array>}
   */
  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      // Handle different response structures
      if (response && typeof response === 'object') {
        // Check if response has data wrapper
        if (response.data) {
          if (response.data.success) {
            return response.data.notifications || response.data.data || [];
          }
          // If no success field, check for direct notifications array
          if (Array.isArray(response.data.notifications)) {
            return response.data.notifications;
          }
          if (Array.isArray(response.data.data)) {
            return response.data.data;
          }
          if (Array.isArray(response.data)) {
            return response.data;
          }
        }
        // Check if response is direct (no data wrapper)
        if (response.success) {
          return response.notifications || response.data || [];
        }
        // Check if response is directly an array
        if (Array.isArray(response)) {
          return response;
        }
        // Check for notifications field directly
        if (Array.isArray(response.notifications)) {
          return response.notifications;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise<number>}
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread');
      // Handle different response structures
      if (response && typeof response === 'object') {
        // Check if response has data wrapper
        if (response.data) {
          if (response.data.success) {
            return response.data.unread_count || 0;
          }
          // If no success field, check for direct unread_count
          if (response.data.unread_count !== undefined) {
            return response.data.unread_count || 0;
          }
        }
        // Check if response is direct (no data wrapper)
        if (response.success) {
          return response.unread_count || 0;
        }
        // Check for direct unread_count field
        if (response.unread_count !== undefined) {
          return response.unread_count || 0;
        }
        // Check for count field
        if (response.count !== undefined) {
          return response.count || 0;
        }
      }
      return 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  /**
   * Mark a notification as read
   * @param {number} notificationId
   * @returns {Promise<boolean>}
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.post(`/notifications/${notificationId}/mark-read`);
      // Handle different response structures
      if (response && typeof response === 'object') {
        if (response.data) {
          if (response.data.success !== undefined) {
            return response.data.success;
          }
          // If no success field, check if response.data is truthy (successful response)
          return true;
        }
        if (response.success !== undefined) {
          return response.success;
        }
        // If no success field but response exists, assume success
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<boolean>}
   */
  async markAllAsRead() {
    try {
      const response = await api.post('/notifications/mark-all-read');
      // Handle different response structures
      if (response && typeof response === 'object') {
        if (response.data) {
          if (response.data.success !== undefined) {
            return response.data.success;
          }
          // If no success field, check if response.data is truthy (successful response)
          return true;
        }
        if (response.success !== undefined) {
          return response.success;
        }
        // If no success field but response exists, assume success
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  /**
   * Format notification timestamp for display
   * @param {string} timestamp - ISO 8601 timestamp
   * @returns {string}
   */
  formatTimestamp(timestamp) {
    if (!timestamp) return 'Just now';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) {
        return 'Just now';
      } else if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        // Format as date
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
          hour: 'numeric',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown time';
    }
  },

  /**
   * Get notification icon based on type
   * @param {string} type
   * @returns {string}
   */
  getNotificationIcon(type) {
    const iconMap = {
      'application_status_change': 'info',
      'id_claiming': 'card_membership',
      'support_ticket_reply': 'support_agent',
      'document_upload': 'description',
      'renewal_reminder': 'refresh',
      'default': 'notifications'
    };
    return iconMap[type] || iconMap.default;
  }
};

export default notificationService;

