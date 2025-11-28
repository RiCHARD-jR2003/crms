// Import theme colors for consistency and accessibility
import { themeColors } from './themeColors';

/**
 * Utility function to get status color for application/member statuses
 * Uses WCAG AA compliant colors from theme system
 * @param {string} status - The status string
 * @returns {string} - Hex color code
 */
export const getStatusColor = (status) => {
  if (!status) return themeColors.base.gray500;
  
  const normalizedStatus = status.toLowerCase().trim();
  
  switch (normalizedStatus) {
    case 'approved':
      return themeColors.status.approved; // #2E7D32 - WCAG AA compliant green
    case 'pending':
    case 'pending admin approval':
    case 'pending barangay approval':
      return themeColors.status.pending; // #F57C00 - High contrast orange
    case 'rejected':
      return themeColors.status.rejected; // #C62828 - High contrast red
    case 'expired':
      return themeColors.status.expired; // #616161 - Gray
    case 'for claiming':
      return themeColors.status['for claiming']; // #0277BD - Blue
    case 'for renewal':
      return themeColors.status['for renewal']; // #E65100 - Orange
    case 'claimed':
      return themeColors.status.approved; // #2E7D32 - Green
    default:
      return themeColors.base.gray500; // #6B6B6B - Neutral gray
  }
};

/**
 * Get status badge configuration
 * @param {string} status - The status string
 * @returns {object} - Badge configuration with label, color, bgColor, textColor
 */
export const getStatusBadgeConfig = (status) => {
  if (!status) {
    return {
      label: 'Unknown',
      color: themeColors.base.gray500,
      bgColor: themeColors.base.gray100,
      textColor: themeColors.base.gray700
    };
  }
  
  const normalizedStatus = status.toLowerCase().trim();
  
  const configs = {
    'approved': {
      label: 'Approved',
      color: themeColors.semantic.success.main,
      bgColor: themeColors.semantic.success.bg,
      textColor: themeColors.semantic.success.dark
    },
    'pending': {
      label: 'Pending',
      color: themeColors.semantic.warning.main,
      bgColor: themeColors.semantic.warning.bg,
      textColor: themeColors.semantic.warning.dark
    },
    'pending admin approval': {
      label: 'Pending Admin Approval',
      color: themeColors.semantic.warning.main,
      bgColor: themeColors.semantic.warning.bg,
      textColor: themeColors.semantic.warning.dark
    },
    'pending barangay approval': {
      label: 'Pending Barangay Approval',
      color: themeColors.semantic.warning.main,
      bgColor: themeColors.semantic.warning.bg,
      textColor: themeColors.semantic.warning.dark
    },
    'rejected': {
      label: 'Rejected',
      color: themeColors.semantic.error.main,
      bgColor: themeColors.semantic.error.bg,
      textColor: themeColors.semantic.error.dark
    },
    'expired': {
      label: 'Expired',
      color: themeColors.status.expired,
      bgColor: themeColors.base.gray100,
      textColor: themeColors.base.gray700
    },
    'for claiming': {
      label: 'For Claiming',
      color: themeColors.semantic.info.main,
      bgColor: themeColors.semantic.info.bg,
      textColor: themeColors.semantic.info.dark
    },
    'for renewal': {
      label: 'For Renewal',
      color: themeColors.semantic.warning.main,
      bgColor: themeColors.semantic.warning.bg,
      textColor: themeColors.semantic.warning.dark
    },
    'claimed': {
      label: 'Claimed',
      color: themeColors.semantic.success.main,
      bgColor: themeColors.semantic.success.bg,
      textColor: themeColors.semantic.success.dark
    }
  };
  
  return configs[normalizedStatus] || {
    label: status,
    color: themeColors.base.gray500,
    bgColor: themeColors.base.gray100,
    textColor: themeColors.base.gray700
  };
};

