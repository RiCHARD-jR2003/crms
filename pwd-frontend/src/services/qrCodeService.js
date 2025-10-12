import QRCode from 'qrcode';

class QRCodeService {
  /**
   * Generate QR code for PWD member benefit claims
   * @param {Object} member - PWD member data
   * @returns {Promise<string>} - Data URL of generated QR code
   */
  static async generateMemberQRCode(member) {
    try {
      if (!member) {
        throw new Error('Member data is required');
      }

      // Create structured data for QR code
      const qrData = {
        type: 'PWD_BENEFIT_CLAIM',
        version: '1.0',
        memberId: member.userID || member.id,
        pwdId: member.pwd_id || `PWD-${member.userID?.toString().padStart(6, '0')}`,
        firstName: member.firstName,
        lastName: member.lastName,
        disabilityType: member.disabilityType,
        barangay: member.barangay,
        generatedAt: new Date().toISOString(),
        // Security features
        checksum: this.generateChecksum(member),
        // Alternative formats for better scanner compatibility
        simpleId: `PWD-${member.userID}`,
        fullId: member.pwd_id
      };

      // Generate QR code with optimal settings for mobile scanning
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
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

      if (qrData.type !== 'PWD_BENEFIT_CLAIM') {
        return { valid: false, error: 'Invalid QR code type' };
      }

      if (!qrData.memberId || !qrData.pwdId) {
        return { valid: false, error: 'Missing member identification' };
      }

      // Check if QR code is not too old (optional security feature)
      const generatedAt = new Date(qrData.generatedAt);
      const now = new Date();
      const daysDiff = (now - generatedAt) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 365) { // QR codes expire after 1 year
        return { valid: false, error: 'QR code has expired' };
      }

      return { valid: true, data: qrData };
    } catch (error) {
      return { valid: false, error: 'Invalid QR code data' };
    }
  }

  /**
   * Parse QR code text data
   * @param {string} qrText - Raw QR code text
   * @returns {Object} - Parsed and validated data
   */
  static parseQRCode(qrText) {
    try {
      const qrData = JSON.parse(qrText);
      return this.validateQRCode(qrData);
    } catch (error) {
      return { valid: false, error: 'Failed to parse QR code' };
    }
  }
}

export default QRCodeService;
