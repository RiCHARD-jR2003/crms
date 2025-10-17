import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import SuccessModal from '../shared/SuccessModal';
import { useModal } from '../../hooks/useModal';

const ApplicationStatusCheck = () => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // Success modal
  const { modalOpen, modalConfig, showModal, hideModal } = useModal();

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true);
    console.log('ApplicationStatusCheck component mounted');
  }, []);

  // Debug logging
  console.log('ApplicationStatusCheck component rendered, mounted:', mounted);

  const handleSearch = async () => {
    if (!referenceNumber.trim()) {
      setError('Please enter a reference number');
      return;
    }

    setLoading(true);
    setError('');
    setApplicationData(null);

    try {
      const response = await api.get(`/application-status/${referenceNumber.trim()}`);
      
      if (response && response.application) {
        setApplicationData(response.application);
      } else {
        setError('Application not found. Please check your reference number.');
      }
    } catch (err) {
      console.error('Error fetching application status:', err);
      if (err.response?.status === 404) {
        setError('Application not found. Please check your reference number.');
      } else {
        setError('Error checking application status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '#27AE60';
      case 'pending':
      case 'pending admin approval':
      case 'pending barangay approval':
        return '#F39C12';
      case 'rejected':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Don't render until component is properly mounted
  if (!mounted) {
    return (
      <Box sx={{ minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ 
        textAlign: 'center', 
        mb: 2, 
        color: '#7F8C8D',
        lineHeight: 1.4,
        fontSize: '0.85rem'
      }}>
        Enter your application reference number to check the current status of your PWD application.
      </Typography>

      <Box sx={{ mb: 2, mt: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 0,
          borderRadius: 2,
          overflow: 'visible',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #E0E0E0',
          position: 'relative'
        }}>
          <TextField
            fullWidth
            label="Reference Number"
            placeholder="e.g., PWD-2025-123456-789"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            size="small"
            InputLabelProps={{
              shrink: true,
              sx: {
                bgcolor: 'white',
                px: 0.5,
                color: '#2C3E50',
                fontWeight: 500,
                fontSize: '0.8rem',
                position: 'absolute',
                top: '-6px',
                left: '8px',
                zIndex: 1,
                '&.Mui-focused': {
                  color: '#0b87ac',
                },
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                bgcolor: '#f8f9fa',
                border: 'none',
                height: '40px',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
                '&.Mui-focused': {
                  bgcolor: '#ffffff',
                  boxShadow: 'inset 0 0 0 2px #0b87ac',
                },
              },
              '& .MuiInputBase-input': {
                color: '#2C3E50',
                fontWeight: 500,
                fontSize: '0.85rem',
                '&::placeholder': {
                  color: '#7F8C8D',
                  opacity: 1,
                },
              },
            }}
          />
          <Button
            onClick={handleSearch}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#0b87ac',
              color: 'white',
              borderRadius: 0,
              px: 2,
              py: 0.5,
              height: '40px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              minWidth: 120,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#0a6b8a',
                boxShadow: 'none',
              },
              '&:disabled': {
                bgcolor: '#95A5A6',
                boxShadow: 'none',
              },
            }}
          >
            {loading ? 'Checking...' : 'Check Status'}
          </Button>
        </Box>
      </Box>

        {error && (
          <Alert severity="error" sx={{ 
            mb: 2, 
            borderRadius: 2,
            bgcolor: '#FFF5F5',
            border: '1px solid #FFE0E0',
            fontSize: '0.85rem',
            '& .MuiAlert-icon': {
              color: '#E74C3C',
              fontSize: '1.2rem'
            },
            '& .MuiAlert-message': {
              color: '#C0392B',
              fontWeight: 500,
              fontSize: '0.85rem'
            }
          }}>
            {error}
          </Alert>
        )}

        {applicationData && (
          <Box sx={{ 
            mt: 2, 
            p: 2,
            bgcolor: '#f8f9fa',
            borderRadius: 2,
            border: '1px solid #E0E0E0'
          }}>
            <Typography variant="subtitle1" sx={{ 
              mb: 2, 
              color: '#2C3E50',
              fontWeight: 600,
              textAlign: 'center',
              fontSize: '0.95rem'
            }}>
              Application Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#7F8C8D', mb: 0.5, display: 'block' }}>
                  Reference Number:
                </Typography>
                <Typography variant="body2" sx={{ color: '#2C3E50', mb: 1, fontWeight: 'bold' }}>
                  {applicationData.referenceNumber || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#7F8C8D', mb: 0.5, display: 'block' }}>
                  Applicant Name:
                </Typography>
                <Typography variant="body2" sx={{ color: '#2C3E50', mb: 1, fontWeight: 500 }}>
                  {`${applicationData.firstName || ''} ${applicationData.middleName || ''} ${applicationData.lastName || ''} ${applicationData.suffix || ''}`.trim()}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#7F8C8D', mb: 0.5, display: 'block' }}>
                  Submission Date:
                </Typography>
                <Typography variant="body2" sx={{ color: '#2C3E50', mb: 1, fontWeight: 500 }}>
                  {formatDate(applicationData.submissionDate)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#7F8C8D', mb: 0.5, display: 'block' }}>
                  Current Status:
                </Typography>
                <Chip
                  label={applicationData.status || 'Pending'}
                  size="small"
                  sx={{
                    bgcolor: getStatusColor(applicationData.status),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    height: '24px'
                  }}
                />
              </Grid>
              
              {applicationData.remarks && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#7F8C8D', mb: 0.5, display: 'block' }}>
                    Remarks:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2C3E50', fontWeight: 500 }}>
                    {applicationData.remarks}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      
      {/* Success Modal */}
      <SuccessModal
        open={modalOpen}
        onClose={hideModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        buttonText={modalConfig.buttonText}
      />
    </Box>
  );
}

export default ApplicationStatusCheck;
