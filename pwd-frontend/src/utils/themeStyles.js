// src/utils/themeStyles.js
// Shared styling utilities for consistent white background and black/white text theme

export const mainContainerStyles = {
  display: 'flex',
  minHeight: '100vh',
  bgcolor: '#FFFFFF'
};

export const contentAreaStyles = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  ml: '280px',
  width: 'calc(100% - 280px)',
  p: 1
};

export const headerStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 3,
  p: 2,
  bgcolor: '#FFFFFF',
  borderRadius: 2,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #E0E0E0'
};

export const titleStyles = {
  fontWeight: 'bold',
  color: '#000000'
};

export const subtitleStyles = {
  color: '#000000',
  fontWeight: 500
};

export const cardStyles = {
  bgcolor: '#FFFFFF',
  borderRadius: 2,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #E0E0E0'
};

export const dialogStyles = {
  '& .MuiDialog-paper': {
    backgroundColor: '#FFFFFF',
    color: '#000000',
    borderRadius: 2,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
  }
};

export const dialogTitleStyles = {
  backgroundColor: '#FFFFFF',
  color: '#000000 !important',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  p: 2,
  borderBottom: '1px solid #E0E0E0'
};

export const dialogContentStyles = {
  backgroundColor: '#FFFFFF !important',
  color: '#000000 !important',
  '& *': { 
    color: '#000000 !important'
  }
};

export const dialogActionsStyles = {
  p: 2,
  backgroundColor: '#FFFFFF',
  borderTop: '1px solid #E0E0E0',
  '& .MuiButton-root': {
    color: '#000000'
  }
};

export const buttonStyles = {
  bgcolor: '#3498DB',
  color: '#FFFFFF',
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 2,
  '&:hover': { 
    bgcolor: '#2980B9' 
  }
};

export const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#FFFFFF',
    color: '#000000',
    '& fieldset': {
      borderColor: '#E0E0E0'
    },
    '&:hover fieldset': {
      borderColor: '#3498DB'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3498DB'
    }
  },
  '& .MuiInputLabel-root': {
    color: '#000000'
  }
};

export const tableStyles = {
  backgroundColor: '#FFFFFF',
  '& .MuiTableHead-root': {
    backgroundColor: '#F8F9FA'
  },
  '& .MuiTableCell-root': {
    color: '#000000',
    borderColor: '#E0E0E0'
  }
};

export const chipStyles = {
  fontWeight: 600,
  fontSize: '0.7rem'
};

export const notificationBadgeStyles = {
  '& .MuiBadge-badge': {
    backgroundColor: '#E74C3C',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: '0.7rem'
  }
};
