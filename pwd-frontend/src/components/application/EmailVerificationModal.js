// src/components/application/EmailVerificationModal.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { api } from '../../services/api';

function EmailVerificationModal({ 
  open, 
  onClose, 
  email, 
  onVerified, 
  onCancel 
}) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  // Timer countdown
  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Send verification code
  const sendVerificationCode = async () => {
    setSendingCode(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/send-verification-code', {
        email: email,
        purpose: 'application_submission'
      });

      if (response.success) {
        setSuccess('Verification code sent to your email!');
        setCodeSent(true);
        setTimeLeft(600); // 10 minutes
      } else {
        setError(response.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setError(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setSendingCode(false);
    }
  };

  // Verify code
  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/verify-code', {
        email: email,
        code: verificationCode,
        purpose: 'application_submission'
      });

      if (response.success) {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          onVerified(verificationCode);
        }, 1000);
      } else {
        setError(response.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setError(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setVerificationCode(value);
      setError('');
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && verificationCode.length === 6) {
      verifyCode();
    }
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setVerificationCode('');
      setError('');
      setSuccess('');
      setCodeSent(false);
      setTimeLeft(0);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon sx={{ color: '#1976D2' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Email Verification
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
          We need to verify your email address <strong>{email}</strong> before submitting your application.
        </Typography>

        {!codeSent ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
              Click the button below to send a verification code to your email.
            </Typography>
            <Button
              variant="contained"
              onClick={sendVerificationCode}
              disabled={sendingCode}
              startIcon={sendingCode ? <CircularProgress size={20} /> : <EmailIcon />}
              sx={{
                backgroundColor: '#1976D2',
                '&:hover': { backgroundColor: '#1565C0' }
              }}
            >
              {sendingCode ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
              Enter the 6-digit verification code sent to your email:
            </Typography>
            
            <TextField
              fullWidth
              value={verificationCode}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              inputProps={{
                maxLength: 6,
                style: { 
                  textAlign: 'center', 
                  fontSize: '1.5rem', 
                  letterSpacing: '0.5rem',
                  fontWeight: 'bold'
                }
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.5rem'
                }
              }}
            />

            {timeLeft > 0 && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 1,
                mb: 2,
                color: timeLeft < 60 ? '#f44336' : '#666'
              }}>
                <TimerIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2">
                  Code expires in {formatTime(timeLeft)}
                </Typography>
              </Box>
            )}

            {timeLeft === 0 && codeSent && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#f44336', mb: 1 }}>
                  Verification code has expired
                </Typography>
                <Button
                  variant="outlined"
                  onClick={sendVerificationCode}
                  disabled={sendingCode}
                  size="small"
                >
                  Send New Code
                </Button>
              </Box>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        {codeSent && (
          <Button
            onClick={verifyCode}
            variant="contained"
            disabled={loading || verificationCode.length !== 6 || timeLeft === 0}
            sx={{
              backgroundColor: '#1976D2',
              '&:hover': { backgroundColor: '#1565C0' }
            }}
          >
            {loading ? 'Verifying...' : 'Verify & Submit'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default EmailVerificationModal;
