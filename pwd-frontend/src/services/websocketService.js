// WebSocket service for real-time messaging
import { API_CONFIG } from '../config/production';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnecting = false;
    this.connectionStatus = 'disconnected';
  }

  // Get WebSocket URL based on environment
  getWebSocketUrl() {
    const baseUrl = API_CONFIG.API_BASE_URL.replace('/api', '');
    return baseUrl.replace('http', 'ws') + '/ws';
  }

  // Get authentication token
  async getAuthToken() {
    try {
      const raw = localStorage.getItem('auth.token');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Error parsing auth token:', error);
      return null;
    }
  }

  // Connect to WebSocket
  async connect() {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    this.connectionStatus = 'connecting';

    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const wsUrl = `${this.getWebSocketUrl()}?token=${token}`;
      console.log('Attempting to connect to WebSocket:', wsUrl);

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.emit('connection', { status: 'connected' });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.connectionStatus = 'disconnected';
        this.isConnecting = false;
        this.emit('connection', { status: 'disconnected', code: event.code, reason: event.reason });
        
        // Only attempt to reconnect if not manually closed and server exists
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.warn('WebSocket connection failed - backend WebSocket server not available');
        console.log('This is expected if the backend doesn\'t support WebSocket yet');
        this.connectionStatus = 'disconnected';
        this.isConnecting = false;
        this.emit('connection', { status: 'disconnected', error: 'WebSocket server not available' });
      };

    } catch (error) {
      console.warn('WebSocket initialization failed:', error.message);
      console.log('Falling back to regular API mode');
      this.connectionStatus = 'disconnected';
      this.isConnecting = false;
      this.emit('connection', { status: 'disconnected', error: error.message });
    }
  }

  // Schedule reconnection attempt
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.connectionStatus === 'disconnected') {
        this.connect();
      }
    }, delay);
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, payload } = data;
    
    switch (type) {
      case 'new_message':
        this.emit('new_message', payload);
        break;
      case 'message_status_update':
        this.emit('message_status_update', payload);
        break;
      case 'ticket_status_update':
        this.emit('ticket_status_update', payload);
        break;
      case 'typing_indicator':
        this.emit('typing_indicator', payload);
        break;
      case 'user_online':
        this.emit('user_online', payload);
        break;
      case 'user_offline':
        this.emit('user_offline', payload);
        break;
      default:
        console.log('Unknown message type:', type);
    }
  }

  // Send message through WebSocket
  sendMessage(type, payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type,
        payload,
        timestamp: new Date().toISOString()
      };
      
      this.socket.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Unsubscribe from events
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit events to listeners
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  // Send typing indicator
  sendTypingIndicator(ticketId, isTyping) {
    return this.sendMessage('typing_indicator', {
      ticket_id: ticketId,
      is_typing: isTyping
    });
  }

  // Mark message as seen
  markMessageAsSeen(messageId) {
    return this.sendMessage('message_seen', {
      message_id: messageId
    });
  }

  // Join ticket room
  joinTicketRoom(ticketId) {
    return this.sendMessage('join_ticket', {
      ticket_id: ticketId
    });
  }

  // Leave ticket room
  leaveTicketRoom(ticketId) {
    return this.sendMessage('leave_ticket', {
      ticket_id: ticketId
    });
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }
    this.connectionStatus = 'disconnected';
    this.reconnectAttempts = 0;
  }

  // Get connection status
  getConnectionStatus() {
    return this.connectionStatus;
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
