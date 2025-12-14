import { api } from './api';

const notificationService = {
  /**
   * Fetch all notifications for the current user
   * @returns {Promise<Array>}
   */
  async getNotifications() {
    try {
      // Force skip cache to get fresh notifications
      const response = await api.get('/notifications', { skipCache: true });
      console.log('Notification API response:', response);
      
      // Handle different response structures
      if (response && typeof response === 'object') {
        // Check if response has data wrapper
        if (response.data) {
          if (response.data.success) {
            const notifications = response.data.notifications || response.data.data || [];
            console.log('Notifications fetched:', notifications.length, 'notifications');
            if (response.data.debug) {
              console.log('Debug info:', response.data.debug);
            }
            // Log notification types for debugging
            if (notifications.length > 0) {
              console.log('Notification types:', notifications.map(n => n.type));
            }
            return notifications;
          }
          // If no success field, check for direct notifications array
          if (Array.isArray(response.data.notifications)) {
            console.log('Notifications fetched (direct array):', response.data.notifications.length);
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
      console.warn('No notifications found in response');
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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
   * Get date/time string in Philippine Time (Asia/Manila, UTC+8)
   * @param {string|Date} timestamp - ISO 8601 timestamp or Date object
   * @returns {string} Formatted date/time string in Philippine Time
   */
  getPhilippineTimeString(timestamp) {
    if (!timestamp) return null;
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return null;
      
      // Use Intl.DateTimeFormat to get Philippine Time
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      return formatter.format(date);
    } catch (error) {
      console.error('Error getting Philippine Time string:', error);
      return null;
    }
  },

  /**
   * Get current Philippine Time as Date object
   * @returns {Date} Current date/time in Philippine Time
   */
  getCurrentPhilippineTime() {
    try {
      const now = new Date();
      const phTimeString = this.getPhilippineTimeString(now);
      if (!phTimeString) return now;
      
      // Parse the PH time string to create a Date object
      // Format: MM/DD/YYYY, HH:mm:ss
      const [datePart, timePart] = phTimeString.split(', ');
      const [month, day, year] = datePart.split('/');
      const [hours, minutes, seconds] = timePart.split(':');
      
      // Create date representing Philippine Time
      // Note: This creates a date in local timezone but represents PH time
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds)
      );
    } catch (error) {
      console.error('Error getting current Philippine Time:', error);
      return new Date();
    }
  },

  /**
   * Format notification timestamp for display in Philippine Time
   * @param {string} timestamp - ISO 8601 timestamp
   * @param {Date} currentTime - Optional current time for reactive updates (defaults to new Date())
   * @returns {string}
   */
  formatTimestamp(timestamp, currentTime = null) {
    if (!timestamp) return 'Just now';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Just now';
      
      // Use provided currentTime or default to new Date() for reactive updates
      const now = currentTime || new Date();
      
      // Calculate difference in milliseconds
      const diffMs = now.getTime() - date.getTime();
      
      // Handle negative differences (future dates) - shouldn't happen but handle gracefully
      if (diffMs < 0) {
        return 'Just now';
      }
      
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
        // Format as date with Philippine Time
        const formatted = date.toLocaleString('en-US', {
          timeZone: 'Asia/Manila',
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        return formatted + ' (PH Time)';
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown time';
    }
  },

  /**
   * Format full date and time in Philippine Time
   * @param {string} timestamp - ISO 8601 timestamp
   * @returns {string} Formatted as MM/DD/YYYY HH:mm AM/PM (PH Time)
   */
  formatDateTimePH(timestamp) {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'N/A';
      
      // Format using Philippine Time zone
      const formatted = date.toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      // Convert to MM/DD/YYYY HH:mm AM/PM format
      const [datePart, timePart] = formatted.split(', ');
      return `${datePart} ${timePart} (PH Time)`;
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'Invalid Date';
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
      'renewal_required': 'refresh',
      'default': 'notifications'
    };
    return iconMap[type] || iconMap.default;
  }
};

export default notificationService;

