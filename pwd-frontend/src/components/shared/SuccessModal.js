import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button
} from '@mui/material';

const SuccessModal = ({ 
  open, 
  onClose, 
  title = "Success!", 
  message, 
  buttonText = "Continue",
  type = "success", // success, error, warning, info
  onButtonClick
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bgcolor: '#E74C3C',
          icon: '✗',
          buttonColor: '#E74C3C',
          buttonHover: '#C0392B'
        };
      case 'warning':
        return {
          bgcolor: '#F39C12',
          icon: '⚠',
          buttonColor: '#F39C12',
          buttonHover: '#E67E22'
        };
      case 'info':
        return {
          bgcolor: '#3498DB',
          icon: 'ℹ',
          buttonColor: '#3498DB',
          buttonHover: '#2980B9'
        };
      default: // success
        return {
          bgcolor: '#27AE60',
          icon: '✓',
          buttonColor: '#27AE60',
          buttonHover: '#229954'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent sx={{ 
        p: 0, 
        textAlign: 'center',
        bgcolor: '#f8f9fa'
      }}>
        <Box sx={{ 
          p: 4,
          bgcolor: styles.bgcolor,
          color: 'white'
        }}>
          <Box sx={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            bgcolor: 'rgba(255,255,255,0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mx: 'auto', 
            mb: 2 
          }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {styles.icon}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            mb: 1,
            color: 'white'
          }}>
            {title}
          </Typography>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ 
            color: '#2c3e50', 
            mb: 3,
            lineHeight: 1.6
          }}>
            {typeof message === 'string' ? message : message}
          </Typography>
          
          <Button
            onClick={() => {
              if (onButtonClick) {
                onButtonClick();
              }
              onClose();
            }}
            variant="contained"
            sx={{
              bgcolor: styles.buttonColor,
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              '&:hover': {
                bgcolor: styles.buttonHover
              }
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
