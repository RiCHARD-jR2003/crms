// Comprehensive Accessible Color System for PWD CRMS
// WCAG AA Compliant (4.5:1 contrast ratio for normal text, 3:1 for large text)
// Color-blind friendly palette

export const themeColors = {
  // Base colors - High contrast, accessible
  base: {
    white: '#FFFFFF',
    black: '#1A1A1A', // Softer than pure black for better readability
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#E8E8E8',
    gray300: '#D1D1D1',
    gray400: '#9E9E9E',
    gray500: '#6B6B6B',
    gray600: '#4A4A4A',
    gray700: '#333333',
    gray800: '#2A2A2A',
    gray900: '#1A1A1A',
  },

  // Semantic colors - Professional and accessible
  semantic: {
    success: {
      main: '#2E7D32', // Green - WCAG AA compliant
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
      bg: '#E8F5E9',
    },
    warning: {
      main: '#F57C00', // Orange - High contrast
      light: '#FF9800',
      dark: '#E65100',
      contrastText: '#FFFFFF',
      bg: '#FFF3E0',
    },
    error: {
      main: '#C62828', // Red - High contrast
      light: '#E53935',
      dark: '#B71C1C',
      contrastText: '#FFFFFF',
      bg: '#FFEBEE',
    },
    info: {
      main: '#0277BD', // Blue - High contrast
      light: '#0288D1',
      dark: '#01579B',
      contrastText: '#FFFFFF',
      bg: '#E1F5FE',
    },
  },

  // Role-specific color palettes - Distinct, professional, accessible
  roles: {
    superadmin: {
      primary: '#5E35B1', // Deep Purple - Professional, distinct
      primaryLight: '#7E57C2',
      primaryDark: '#4527A0',
      primaryContrast: '#FFFFFF',
      accent: '#9C27B0',
      bg: '#F3E5F5',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#4A4A4A',
    },
    admin: {
      primary: '#1565C0', // Professional Blue
      primaryLight: '#1976D2',
      primaryDark: '#0D47A1',
      primaryContrast: '#FFFFFF',
      accent: '#42A5F5',
      bg: '#E3F2FD',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#4A4A4A',
    },
    staff1: {
      primary: '#00695C', // Teal - Distinct from admin
      primaryLight: '#00897B',
      primaryDark: '#004D40',
      primaryContrast: '#FFFFFF',
      accent: '#26A69A',
      bg: '#E0F2F1',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#4A4A4A',
    },
    staff2: {
      primary: '#E65100', // Deep Orange - Warm, friendly
      primaryLight: '#FF6F00',
      primaryDark: '#BF360C',
      primaryContrast: '#FFFFFF',
      accent: '#FF9800',
      bg: '#FFF3E0',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#4A4A4A',
    },
    frontdesk: {
      primary: '#6A1B9A', // Purple - Distinct, professional
      primaryLight: '#8E24AA',
      primaryDark: '#4A148C',
      primaryContrast: '#FFFFFF',
      accent: '#AB47BC',
      bg: '#F3E5F5',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#4A4A4A',
    },
    pwdmember: {
      primary: '#00796B', // Teal Green - Calming, accessible
      primaryLight: '#009688',
      primaryDark: '#004D40',
      primaryContrast: '#FFFFFF',
      accent: '#26A69A',
      bg: '#E0F2F1',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#4A4A4A',
    },
    barangaypresident: {
      primary: '#2E7D32', // Green - Trustworthy, professional
      primaryLight: '#388E3C',
      primaryDark: '#1B5E20',
      primaryContrast: '#FFFFFF',
      accent: '#66BB6A',
      bg: '#E8F5E9',
      surface: '#FFFFFF',
      text: '#1A1A1A',
      textSecondary: '#4A4A4A',
    },
  },

  // Status colors - High contrast, color-blind friendly
  status: {
    approved: '#2E7D32', // Green
    pending: '#F57C00', // Orange (not yellow for better contrast)
    rejected: '#C62828', // Red
    expired: '#616161', // Gray
    'for claiming': '#0277BD', // Blue
    'for renewal': '#E65100', // Orange
    active: '#2E7D32',
    inactive: '#757575',
  },

  // Interactive states - Clear, accessible
  interactive: {
    hover: {
      light: 'rgba(0, 0, 0, 0.04)',
      medium: 'rgba(0, 0, 0, 0.08)',
      dark: 'rgba(0, 0, 0, 0.12)',
    },
    focus: {
      ring: '0 0 0 3px rgba(21, 101, 192, 0.4)', // Blue focus ring
      ringOffset: '2px',
    },
    active: {
      light: 'rgba(0, 0, 0, 0.12)',
      medium: 'rgba(0, 0, 0, 0.16)',
    },
    disabled: {
      bg: '#F5F5F5',
      text: '#9E9E9E',
      border: '#E0E0E0',
    },
  },

  // Shadows - Subtle, professional
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0 4px 12px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.15)',
  },

  // Borders - Subtle, accessible
  borders: {
    light: '1px solid rgba(0, 0, 0, 0.08)',
    medium: '1px solid rgba(0, 0, 0, 0.12)',
    dark: '1px solid rgba(0, 0, 0, 0.2)',
  },
};

// Get role-specific colors
export const getRoleColors = (role) => {
  const roleKey = role?.toLowerCase() || 'admin';
  return themeColors.roles[roleKey] || themeColors.roles.admin;
};

// Get status color
export const getStatusColor = (status) => {
  const statusKey = status?.toLowerCase() || 'pending';
  return themeColors.status[statusKey] || themeColors.status.pending;
};

// Accessibility utilities
export const accessibility = {
  // Minimum touch target size (WCAG 2.5.5)
  minTouchTarget: '44px',
  
  // Focus styles
  focusVisible: {
    outline: 'none',
    boxShadow: themeColors.interactive.focus.ring,
    borderRadius: '4px',
  },
  
  // High contrast mode support
  highContrast: {
    border: '2px solid',
    text: themeColors.base.black,
    bg: themeColors.base.white,
  },
};

export default themeColors;

