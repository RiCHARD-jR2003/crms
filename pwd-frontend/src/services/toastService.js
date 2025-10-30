// src/services/toastService.js
import { createRoot } from 'react-dom/client';
import React from 'react';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';

class ToastService {
  constructor() {
    this.snackbarContainer = null;
    this.dialogContainer = null;
    this.snackbarRoot = null;
    this.dialogRoot = null;
    this.initialized = false;
  }

  ensureInitialized() {
    if (this.initialized) return;
    
    // Wait for DOM to be ready
    if (typeof document === 'undefined' || !document.body) {
      setTimeout(() => this.ensureInitialized(), 100);
      return;
    }

    // Check if containers already exist (prevent duplicates on refresh)
    if (document.getElementById('toast-snackbar-container') || 
        document.getElementById('toast-dialog-container')) {
      this.cleanup();
    }

    this.init();
    this.initialized = true;
  }

  init() {
    // Create snackbar container
    this.snackbarContainer = document.createElement('div');
    this.snackbarContainer.id = 'toast-snackbar-container';
    this.snackbarContainer.style.position = 'fixed';
    this.snackbarContainer.style.top = '0';
    this.snackbarContainer.style.left = '0';
    this.snackbarContainer.style.width = '100%';
    this.snackbarContainer.style.height = '100%';
    this.snackbarContainer.style.pointerEvents = 'none';
    this.snackbarContainer.style.zIndex = '9999';
    document.body.appendChild(this.snackbarContainer);

    // Create dialog container
    this.dialogContainer = document.createElement('div');
    this.dialogContainer.id = 'toast-dialog-container';
    this.dialogContainer.style.position = 'fixed';
    this.dialogContainer.style.top = '0';
    this.dialogContainer.style.left = '0';
    this.dialogContainer.style.width = '100%';
    this.dialogContainer.style.height = '100%';
    this.dialogContainer.style.zIndex = '10000';
    this.dialogContainer.style.pointerEvents = 'none';
    document.body.appendChild(this.dialogContainer);

    this.snackbarRoot = createRoot(this.snackbarContainer);
    this.dialogRoot = createRoot(this.dialogContainer);
  }

  // Toast notification methods
  success(message, duration = 4000) {
    this.ensureInitialized();
    this.showSnackbar(message, 'success', duration);
  }

  error(message, duration = 6000) {
    this.ensureInitialized();
    this.showSnackbar(message, 'error', duration);
  }

  warning(message, duration = 5000) {
    this.ensureInitialized();
    this.showSnackbar(message, 'warning', duration);
  }

  info(message, duration = 4000) {
    this.ensureInitialized();
    this.showSnackbar(message, 'info', duration);
  }

  showSnackbar(message, severity = 'success', duration = 4000) {
    if (!this.initialized) {
      console.warn('Toast service not initialized, falling back to console');
      console.log(`[${severity.toUpperCase()}] ${message}`);
      return;
    }

    try {
      const SnackbarComponent = () => {
        const [open, setOpen] = React.useState(true);

        const handleClose = () => {
          setOpen(false);
          setTimeout(() => {
            if (this.snackbarRoot) {
              this.snackbarRoot.render(null);
            }
          }, 300);
        };

        return (
          <Snackbar
            open={open}
            autoHideDuration={duration}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{ pointerEvents: 'auto' }}
          >
            <Alert 
              onClose={handleClose} 
              severity={severity} 
              sx={{ width: '100%', pointerEvents: 'auto' }}
            >
              {message}
            </Alert>
          </Snackbar>
        );
      };

      this.snackbarRoot.render(<SnackbarComponent />);
    } catch (error) {
      console.error('Error showing snackbar:', error);
      console.log(`[${severity.toUpperCase()}] ${message}`);
    }
  }

  // Confirmation dialog method
  confirm(title, message, onConfirm, onCancel = null) {
    this.ensureInitialized();
    
    if (!this.initialized) {
      console.warn('Toast service not initialized, falling back to window.confirm');
      const result = window.confirm(`${title}\n\n${message}`);
      if (result && onConfirm) onConfirm();
      if (!result && onCancel) onCancel();
      return;
    }

    try {
      const ConfirmDialog = () => {
        const [open, setOpen] = React.useState(true);

        const handleConfirm = () => {
          setOpen(false);
          setTimeout(() => {
            if (this.dialogRoot) {
              this.dialogRoot.render(null);
            }
            if (onConfirm) onConfirm();
          }, 300);
        };

        const handleCancel = () => {
          setOpen(false);
          setTimeout(() => {
            if (this.dialogRoot) {
              this.dialogRoot.render(null);
            }
            if (onCancel) onCancel();
          }, 300);
        };

        return (
          <Dialog
            open={open}
            onClose={handleCancel}
            maxWidth="sm"
            fullWidth
            sx={{ pointerEvents: 'auto' }}
          >
            <DialogTitle sx={{ 
              bgcolor: '#f5f5f5', 
              borderBottom: '1px solid #e0e0e0',
              fontWeight: 'bold'
            }}>
              {title}
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.6 }}>
                {message}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button 
                onClick={handleCancel}
                variant="outlined"
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                variant="contained"
                sx={{ 
                  bgcolor: '#e74c3c',
                  '&:hover': { bgcolor: '#c0392b' },
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        );
      };

      this.dialogRoot.render(<ConfirmDialog />);
    } catch (error) {
      console.error('Error showing confirmation dialog:', error);
      const result = window.confirm(`${title}\n\n${message}`);
      if (result && onConfirm) onConfirm();
      if (!result && onCancel) onCancel();
    }
  }

  // Promise-based confirmation
  confirmAsync(title, message) {
    return new Promise((resolve) => {
      this.confirm(
        title,
        message,
        () => resolve(true),
        () => resolve(false)
      );
    });
  }

  // Cleanup method
  cleanup() {
    // Clean up existing containers
    const existingSnackbar = document.getElementById('toast-snackbar-container');
    const existingDialog = document.getElementById('toast-dialog-container');
    
    if (existingSnackbar && existingSnackbar.parentNode) {
      existingSnackbar.parentNode.removeChild(existingSnackbar);
    }
    if (existingDialog && existingDialog.parentNode) {
      existingDialog.parentNode.removeChild(existingDialog);
    }
    
    // Reset state
    this.snackbarContainer = null;
    this.dialogContainer = null;
    this.snackbarRoot = null;
    this.dialogRoot = null;
    this.initialized = false;
  }

  destroy() {
    this.cleanup();
  }
}

// Create singleton instance
const toastService = new ToastService();

export default toastService;
