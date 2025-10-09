import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { api } from '../../services/api';

const PasswordChangeModal = ({ open, onClose, onPasswordChanged }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (serverError) setServerError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    
    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'Password must be at least 6 characters';
    }
    
    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Please confirm your new password';
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const response = await api.post('/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password,
        new_password_confirmation: formData.new_password_confirmation,
      });

      // Fetch updated user data with all relationships
      try {
        // Get current user to determine role
        const currentUser = JSON.parse(localStorage.getItem('auth.currentUser'));
        let userResponse;
        
        if (currentUser?.role === 'PWDMember') {
          userResponse = await api.get('/pwd-member/profile');
          const updatedUser = {
            ...currentUser,
            password_change_required: false,
            pwdMember: userResponse.data.profile
          };
          localStorage.setItem('auth.currentUser', JSON.stringify(updatedUser));
          
          if (onPasswordChanged) {
            onPasswordChanged(updatedUser);
          }
        } else {
          // For other roles, just update the password_change_required flag
          const updatedUser = {
            ...currentUser,
            password_change_required: false,
          };
          localStorage.setItem('auth.currentUser', JSON.stringify(updatedUser));
          
          if (onPasswordChanged) {
            onPasswordChanged(updatedUser);
          }
        }
      } catch (error) {
        console.error('Failed to fetch updated user data:', error);
        
        // Fallback: Update user data in localStorage with minimal info
        const currentUser = JSON.parse(localStorage.getItem('auth.currentUser'));
        const updatedUser = {
          ...currentUser,
          password_change_required: false,
        };
        localStorage.setItem('auth.currentUser', JSON.stringify(updatedUser));

        // Call the callback to update the parent component
        if (onPasswordChanged) {
          onPasswordChanged(updatedUser);
        }
      }

      // Close the modal
      onClose();
      
      // Reset form
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setErrors({});

    } catch (error) {
      console.error('Password change error:', error);
      if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('Failed to change password. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={submitting}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SecurityIcon color="warning" />
          <Typography variant="h6" component="div">
            Password Change Required
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          For security purposes, you must change your password before continuing.
        </Alert>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Current Password"
            type={showPasswords.current ? 'text' : 'password'}
            value={formData.current_password}
            onChange={handleInputChange('current_password')}
            error={!!errors.current_password}
            helperText={errors.current_password}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('current')}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="New Password"
            type={showPasswords.new ? 'text' : 'password'}
            value={formData.new_password}
            onChange={handleInputChange('new_password')}
            error={!!errors.new_password}
            helperText={errors.new_password || 'Minimum 6 characters'}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('new')}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm New Password"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={formData.new_password_confirmation}
            onChange={handleInputChange('new_password_confirmation')}
            error={!!errors.new_password_confirmation}
            helperText={errors.new_password_confirmation}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('confirm')}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {serverError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {serverError}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={submitting}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant="contained"
          color="primary"
          startIcon={submitting ? <CircularProgress size={20} /> : <SecurityIcon />}
        >
          {submitting ? 'Changing...' : 'Change Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordChangeModal;
