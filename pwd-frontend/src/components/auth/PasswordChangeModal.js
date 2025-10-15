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
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#0b87ac', 
        color: '#FFFFFF',
        textAlign: 'center',
        py: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            bgcolor: 'rgba(255,255,255,0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <SecurityIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
          </Box>
          <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
            Password Change Required
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ bgcolor: '#f8f9fa', p: 4 }}>
        <Alert severity="warning" sx={{ 
          mb: 3, 
          borderRadius: 2,
          bgcolor: '#FFF8E1',
          border: '1px solid #FFE082',
          '& .MuiAlert-icon': {
            color: '#F57C00'
          },
          '& .MuiAlert-message': {
            color: '#E65100',
            fontWeight: 500
          }
        }}>
          For security purposes, you must change your password before continuing.
        </Alert>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': {
                  borderColor: errors.current_password ? '#E74C3C' : '#E0E0E0',
                },
                '&:hover fieldset': {
                  borderColor: errors.current_password ? '#E74C3C' : '#0b87ac',
                },
                '&.Mui-focused fieldset': {
                  borderColor: errors.current_password ? '#E74C3C' : '#0b87ac',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root': {
                color: '#2C3E50',
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#0b87ac',
                },
              },
              '& .MuiFormHelperText-root': {
                color: errors.current_password ? '#E74C3C' : '#7F8C8D',
                fontSize: '0.8rem'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#7F8C8D' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('current')}
                    edge="end"
                    sx={{ color: '#7F8C8D' }}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': {
                  borderColor: errors.new_password ? '#E74C3C' : '#E0E0E0',
                },
                '&:hover fieldset': {
                  borderColor: errors.new_password ? '#E74C3C' : '#0b87ac',
                },
                '&.Mui-focused fieldset': {
                  borderColor: errors.new_password ? '#E74C3C' : '#0b87ac',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root': {
                color: '#2C3E50',
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#0b87ac',
                },
              },
              '& .MuiFormHelperText-root': {
                color: errors.new_password ? '#E74C3C' : '#7F8C8D',
                fontSize: '0.8rem'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#7F8C8D' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('new')}
                    edge="end"
                    sx={{ color: '#7F8C8D' }}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': {
                  borderColor: errors.new_password_confirmation ? '#E74C3C' : '#E0E0E0',
                },
                '&:hover fieldset': {
                  borderColor: errors.new_password_confirmation ? '#E74C3C' : '#0b87ac',
                },
                '&.Mui-focused fieldset': {
                  borderColor: errors.new_password_confirmation ? '#E74C3C' : '#0b87ac',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root': {
                color: '#2C3E50',
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#0b87ac',
                },
              },
              '& .MuiFormHelperText-root': {
                color: errors.new_password_confirmation ? '#E74C3C' : '#7F8C8D',
                fontSize: '0.8rem'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#7F8C8D' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('confirm')}
                    edge="end"
                    sx={{ color: '#7F8C8D' }}
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {serverError && (
            <Alert severity="error" sx={{ 
              mt: 3, 
              borderRadius: 2,
              bgcolor: '#FFF5F5',
              border: '1px solid #FFE0E0',
              '& .MuiAlert-icon': {
                color: '#E74C3C'
              },
              '& .MuiAlert-message': {
                color: '#C0392B',
                fontWeight: 500
              }
            }}>
              {serverError}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        bgcolor: '#f8f9fa', 
        borderTop: '1px solid #E0E0E0',
        justifyContent: 'space-between'
      }}>
        <Button 
          onClick={handleClose} 
          disabled={submitting}
          sx={{ 
            color: '#7F8C8D',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              bgcolor: 'rgba(127, 140, 141, 0.1)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant="contained"
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SecurityIcon />}
          sx={{ 
            bgcolor: '#0b87ac',
            color: '#FFFFFF',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(11, 135, 172, 0.3)',
            '&:hover': {
              bgcolor: '#0a6b8a',
              boxShadow: '0 6px 16px rgba(11, 135, 172, 0.4)',
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              bgcolor: '#95A5A6',
              boxShadow: 'none',
              transform: 'none',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {submitting ? 'Changing...' : 'Change Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordChangeModal;
