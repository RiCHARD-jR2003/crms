// ID Claim Service - Enhanced ID claiming and renewal with full tracking
import api from './api';

const idClaimService = {
  // Get all claims with optional filters
  async getClaims(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.claimType && filters.claimType !== 'all') params.append('claim_type', filters.claimType);
    if (filters.date) params.append('date', filters.date);
    
    const queryString = params.toString();
    const response = await api.get(`/id-claims${queryString ? '?' + queryString : ''}`);
    return response;
  },

  // Get single claim details
  async getClaim(id) {
    const response = await api.get(`/id-claims/${id}`);
    return response;
  },

  // Get claims for a specific member
  async getMemberClaims(memberId) {
    const response = await api.get(`/id-claims/member/${memberId}`);
    return response;
  },

  // Get today's scheduled pickups
  async getTodayScheduled() {
    const response = await api.get('/id-claims/today-scheduled');
    return response;
  },

  // Initiate a new claim (Step 1)
  async initiateClaim(memberId, claimType = 'new') {
    const response = await api.post('/id-claims/initiate', {
      member_id: memberId,
      claim_type: claimType
    });
    return response;
  },

  // Update claim status
  async updateStatus(claimId, status, notes = null) {
    const response = await api.patch(`/id-claims/${claimId}/status`, {
      status,
      notes
    });
    return response;
  },

  // Schedule pickup appointment
  async schedulePickup(claimId, scheduleData) {
    const response = await api.post(`/id-claims/${claimId}/schedule`, scheduleData);
    return response;
  },

  // Complete claim with claimant information (Final step)
  async completeClaim(claimId, claimData) {
    // If there's an authorization letter file, use FormData
    if (claimData.authorization_letter instanceof File) {
      const formData = new FormData();
      Object.keys(claimData).forEach(key => {
        if (claimData[key] !== null && claimData[key] !== undefined) {
          formData.append(key, claimData[key]);
        }
      });
      const response = await api.post(`/id-claims/${claimId}/complete`, formData);
      return response;
    }
    
    const response = await api.post(`/id-claims/${claimId}/complete`, claimData);
    return response;
  },

  // Cancel a claim
  async cancelClaim(claimId, reason) {
    const response = await api.post(`/id-claims/${claimId}/cancel`, { reason });
    return response;
  },

  // Get receipt data
  async getReceipt(claimId) {
    const response = await api.get(`/id-claims/${claimId}/receipt`);
    return response;
  },

  // Status constants for UI
  STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    READY_FOR_PICKUP: 'ready_for_pickup',
    SCHEDULED: 'scheduled',
    CLAIMED: 'claimed',
    CANCELLED: 'cancelled'
  },

  // Get status display info
  getStatusInfo(status) {
    const statusMap = {
      pending: { label: 'Pending', color: 'warning', icon: 'Schedule' },
      processing: { label: 'Processing', color: 'info', icon: 'Autorenew' },
      ready_for_pickup: { label: 'Ready for Pickup', color: 'success', icon: 'CheckCircle' },
      scheduled: { label: 'Pickup Scheduled', color: 'primary', icon: 'Event' },
      claimed: { label: 'Claimed', color: 'success', icon: 'Done' },
      cancelled: { label: 'Cancelled', color: 'error', icon: 'Cancel' }
    };
    return statusMap[status] || { label: status, color: 'default', icon: 'Help' };
  },

  // Claimant types
  CLAIMANT_TYPES: [
    { value: 'Member', label: 'PWD Member (Self)' },
    { value: 'Guardian', label: 'Guardian' },
    { value: 'Representative', label: 'Authorized Representative' }
  ],

  // ID types for verification
  ID_TYPES: [
    'Driver\'s License',
    'Passport',
    'PhilID',
    'SSS ID',
    'UMID',
    'Voter\'s ID',
    'Postal ID',
    'PRC ID',
    'Senior Citizen ID',
    'Company ID',
    'School ID',
    'Barangay ID',
    'Other Government ID'
  ]
};

export default idClaimService;

