import QRCode from 'qrcode';
import toastService from './toastService';
import { API_CONFIG } from '../config/production';
import { api } from './api';

class QRCodeService {
  /**
   * Generate QR code for PWD member benefit claims
   * Creates a simple, scannable QR code with member's basic information
   * @param {Object} member - PWD member data
   * @returns {Promise<string>} - Data URL of generated QR code
   */
  static async generateMemberQRCode(member) {
    try {
      if (!member) {
        toastService.error('Member data is required to generate QR code');
        throw new Error('Member data is required');
      }

      // Generate a simple, scannable QR code with member's basic information
      // This creates a JSON string that can be scanned and read by any QR scanner
      const memberInfo = {
        type: 'PWD_MEMBER',
        pwdId: member.pwd_id || member.id || `PWD-${member.memberId || member.userID || member.id}`,
        memberId: member.memberId || member.userID || member.id,
        name: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim(),
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        barangay: member.barangay || 'Unknown',
        disabilityType: member.disabilityType || 'Not specified',
        birthDate: member.birthDate || null,
        contactNumber: member.contactNumber || ''
      };

      // Create a simple JSON string that can be scanned
      const qrDataString = JSON.stringify(memberInfo);
      
      console.log('Generating simple scannable QR code with member info:', {
        pwdId: memberInfo.pwdId,
        name: memberInfo.name,
        dataLength: qrDataString.length
      });

      // Generate QR code image from the JSON string
      console.log('Generating QR code image from data string, length:', qrDataString.length);
      
      if (!qrDataString || qrDataString.length === 0) {
        throw new Error('QR code data string is empty');
      }
      
      // Check if QRCode library is available
      if (!QRCode || typeof QRCode.toDataURL !== 'function') {
        console.error('QRCode library not available:', {
          QRCode: typeof QRCode,
          hasToDataURL: QRCode && typeof QRCode.toDataURL
        });
        throw new Error('QRCode library not properly loaded');
      }
      
      try {
        console.log('Calling QRCode.toDataURL...');
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
        
        console.log('QR code generated successfully!', {
          hasDataURL: !!qrCodeDataURL,
          dataURLLength: qrCodeDataURL ? qrCodeDataURL.length : 0,
          startsWithDataURL: qrCodeDataURL ? qrCodeDataURL.startsWith('data:image') : false,
          preview: qrCodeDataURL ? qrCodeDataURL.substring(0, 50) + '...' : 'null'
        });
        
        if (!qrCodeDataURL || qrCodeDataURL.length === 0) {
          throw new Error('QR code generation returned empty data URL');
        }
        
        if (!qrCodeDataURL.startsWith('data:image')) {
          console.warn('QR code data URL does not start with data:image, might be invalid');
        }
        
        return qrCodeDataURL;
      } catch (qrGenError) {
        console.error('Error in QRCode.toDataURL:', {
          error: qrGenError.message,
          stack: qrGenError.stack,
          name: qrGenError.name,
          dataLength: qrDataString ? qrDataString.length : 0,
          dataPreview: qrDataString ? qrDataString.substring(0, 100) : 'null',
          dataType: typeof qrDataString
        });
        throw new Error('Failed to generate QR code image: ' + qrGenError.message);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toastService.error('Failed to generate QR code: ' + (error.message || 'Unknown error'));
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Parse and validate QR code text
   * Handles both simple JSON format and encrypted backend format
   * @param {string} qrText - The scanned QR code text
   * @returns {Promise<Object>} - Validation result with { valid: boolean, data: Object }
   */
  static async parseQRCode(qrText) {
    try {
      if (!qrText || typeof qrText !== 'string') {
        return {
          valid: false,
          error: 'Invalid QR code: Empty or invalid text'
        };
      }

      console.log('Parsing QR code text:', {
        length: qrText.length,
        preview: qrText.substring(0, 100)
      });

      // Try to parse as JSON (for simple format)
      try {
        const parsedData = JSON.parse(qrText);
        
        // Validate it has the expected structure
        if (parsedData && typeof parsedData === 'object') {
          // Check if it's our simple format
          if (parsedData.type === 'PWD_MEMBER' || parsedData.type === 'PWD_BENEFIT_CLAIM') {
            console.log('QR code parsed successfully (simple format):', parsedData);
            return {
              valid: true,
              data: parsedData
            };
          }
          
          // Check if it has required fields even without type
          if (parsedData.pwdId || parsedData.memberId || parsedData.userID) {
            console.log('QR code parsed successfully (has member ID):', parsedData);
            return {
              valid: true,
              data: parsedData
            };
          }
        }
      } catch (jsonError) {
        // Not JSON, might be encrypted or other format
        console.log('QR code is not JSON, might be encrypted or other format');
      }

      // If we get here, the QR code format is not recognized
      console.warn('QR code format not recognized:', qrText.substring(0, 200));
      return {
        valid: false,
        error: 'QR code format not recognized. Please use a valid PWD member QR code.'
      };
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return {
        valid: false,
        error: `Error parsing QR code: ${error.message}`
      };
    }
  }

  /**
   * Generate a simple checksum for data integrity
   * @param {Object} member - Member data
   * @returns {string} - Simple checksum string
   */
  static generateChecksum(member) {
    const data = `${member.pwd_id || member.id}-${member.firstName}-${member.lastName}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

export default QRCodeService;
