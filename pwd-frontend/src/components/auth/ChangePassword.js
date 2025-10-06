// src/components/auth/ChangePassword.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import passwordService from '../../services/passwordService';

function ChangePassword({ open, onClose }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        setLoading(false);
        return;
      }

      // Validate password strength
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      // Validate current password is not empty
      if (!formData.currentPassword) {
        setError('Current password is required');
        setLoading(false);
        return;
      }

      const result = await passwordService.changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      setSuccess('Password changed successfully!');
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Close dialog after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);

    } catch (err) {
      setError(err.error || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setError('');
      setSuccess('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#FFFFFF'
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0' }}>
        <Typography variant="h5" sx={{ color: '#2C3E50' }}>
          Change Password
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#FFFFFF' }}>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="currentPassword"
              label="Current Password"
              type="password"
              id="currentPassword"
              autoComplete="current-password"
              value={formData.currentPassword}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newPassword"
              autoComplete="new-password"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={loading}
              helperText="Password must be at least 6 characters long"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E0E0E0' }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ color: '#7F8C8D' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ 
            backgroundColor: '#3498DB',
            '&:hover': {
              backgroundColor: '#2980B9',
            }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Change Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangePassword;
