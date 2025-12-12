import QRCode from 'qrcode';
import toastService from './toastService';
import { API_CONFIG } from '../config/production';
import { api } from './api';

class QRCodeService {
  /**
   * Generate QR code for PWD member benefit claims
   * Uses stored encrypted qr_code_data from backend
   * @param {Object} member - PWD member data (should include qr_code_data if available)
   * @returns {Promise<string>} - Data URL of generated QR code
   */
  static async generateMemberQRCode(member) {
    try {
      if (!member) {
        toastService.error('Member data is required to generate QR code');
        throw new Error('Member data is required');
      }

      // Use stored QR code data from backend if available
      // Note: Backend now stores encrypted QR code data, so we use it directly
      let qrDataString;
      
      // Check multiple possible property names for QR code data
      if (member.qr_code_data) {
        qrDataString = member.qr_code_data;
      } else if (member.qrCodeData) {
        qrDataString = member.qrCodeData;
      } else if (member.qr_code_data_string) {
        qrDataString = member.qr_code_data_string;
      } else {
        // If no stored QR code data, try to fetch it from the API
        console.warn('No QR code data in member object, attempting to fetch from API...', {
          memberId: member.memberId || member.userID || member.id,
          hasQrCodeData: !!member.qr_code_data,
          memberKeys: Object.keys(member)
        });
        
        // Try to fetch member data with QR code from API using the proper api service
        try {
          const memberId = member.memberId || member.userID || member.id;
          console.log('Attempting to fetch QR code for member:', memberId);
          
          if (memberId) {
            const memberData = await api.get(`/pwd-members/${memberId}`);
            console.log('API response for member:', {
              hasData: !!memberData,
              hasQrCode: !!memberData?.qr_code_data,
              keys: memberData ? Object.keys(memberData) : [],
              nestedData: memberData?.data ? Object.keys(memberData.data) : []
            });
            
            // Try different response structures
            if (memberData && memberData.qr_code_data) {
              qrDataString = memberData.qr_code_data;
              console.log('Successfully fetched QR code data from API (direct)');
            } else if (memberData && memberData.data && memberData.data.qr_code_data) {
              qrDataString = memberData.data.qr_code_data;
              console.log('Successfully fetched QR code data from API (nested in data)');
            } else if (memberData && typeof memberData === 'object') {
              // Try to find qr_code_data anywhere in the response
              const findQrCode = (obj) => {
                if (obj && typeof obj === 'object') {
                  if (obj.qr_code_data) return obj.qr_code_data;
                  for (const key in obj) {
                    const result = findQrCode(obj[key]);
                    if (result) return result;
                  }
                }
                return null;
              };
              const found = findQrCode(memberData);
              if (found) {
                qrDataString = found;
                console.log('Successfully found QR code data in nested response');
              }
            }
          }
        } catch (fetchError) {
          console.error('Failed to fetch QR code data from API:', fetchError);
        }
      }
      
      if (!qrDataString) {
        // If still no QR code data, we can't generate a proper encrypted one from frontend
        console.error('No QR code data available for member:', {
          memberId: member.memberId || member.userID || member.id,
          memberName: member.name || `${member.firstName} ${member.lastName}`,
          availableKeys: Object.keys(member)
        });
        throw new Error('QR code data not available. Please regenerate QR code from backend.');
      }

      // Generate QR code with encrypted data directly
      // The encrypted string from backend is what gets encoded in the QR code
      const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M', // Medium error correction for balance of size and reliability
        type: 'image/png',
        quality: 0.92,
        rendererOpts: {
          quality: 0.92
        }
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      toastService.error('Failed to generate QR code: ' + (error.message || 'Unknown error'));
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate a simple checksum for data integrity
   * @param {Object} member - Member data
   * @returns {string} - Simple checksum
   */
  static generateChecksum(member) {
    const data = `${member.userID}${member.firstName}${member.lastName}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  /**
   * Validate QR code data
   * @param {Object} qrData - Parsed QR code data
   * @returns {Object} - Validation result
   */
  static validateQRCode(qrData) {
    try {
      if (!qrData || typeof qrData !== 'object') {
        return { valid: false, error: 'Invalid QR code format' };
      }

      // Support both PWD_BENEFIT_CLAIM and PWD_ID types
      if (qrData.type !== 'PWD_BENEFIT_CLAIM' && qrData.type !== 'PWD_ID') {
        return { valid: false, error: 'Invalid QR code type' };
      }

      if (!qrData.memberId || !qrData.pwdId) {
        // Try alternative field names
        if (!qrData.memberId && !qrData.userID) {
          return { valid: false, error: 'Missing member identification' };
        }
        if (!qrData.pwdId && !qrData.pwd_id) {
          return { valid: false, error: 'Missing PWD ID' };
        }
      }

      // QR codes for benefit claims do not expire - they are permanent and unique per member
      // Ignore validUntil field if present (old format) - QR codes never expire
      // Remove validUntil from data if it exists to prevent any expiration checks
      if (qrData.validUntil) {
        delete qrData.validUntil;
      }

      return { valid: true, data: qrData };
    } catch (error) {
      return { valid: false, error: 'Invalid QR code data' };
    }
  }

  /**
   * Parse QR code text data (handles both encrypted and unencrypted)
   * @param {string} qrText - Raw QR code text (may be encrypted)
   * @returns {Promise<Object>} - Parsed and validated data
   */
  static async parseQRCode(qrText) {
    try {
      // First, try to parse as JSON (unencrypted format - backward compatibility)
      try {
        const qrData = JSON.parse(qrText);
        const validation = this.validateQRCode(qrData);
        if (validation.valid) {
          return validation;
        }
      } catch (parseError) {
        // Not unencrypted JSON, might be encrypted
      }

      // If parsing as JSON fails, try to decrypt via API (encrypted format)
      // Note: This endpoint is public (no auth required) since QR codes can be scanned by anyone
      try {
        const response = await fetch(`${API_CONFIG?.API_BASE_URL || ''}/qr-code/decrypt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ encryptedData: qrText })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            return this.validateQRCode(result.data);
          }
        }
      } catch (decryptError) {
        console.warn('Failed to decrypt QR code via API:', decryptError);
      }

      // If both fail, return error
      return { valid: false, error: 'Failed to parse or decrypt QR code' };
    } catch (error) {
      return { valid: false, error: 'Failed to process QR code: ' + error.message };
    }
  }
}

export default QRCodeService;
