// src/components/Landing/LandingPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search as SearchIcon } from '@mui/icons-material';
import { api } from '../../services/api';
import { useReadAloud } from '../../hooks/useReadAloud';

function LandingPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { readElement, isReading } = useReadAloud();

  // Application Status Check state
  const [referenceNumber, setReferenceNumber] = useState('');
  const [applicationData, setApplicationData] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Handle navigation in useEffect to avoid render-time navigation
  useEffect(() => {
    if (currentUser && currentUser.role === 'PWDMember') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Debug logging
  useEffect(() => {
    console.log('LandingPage render - currentUser:', currentUser);
  }, [currentUser]);

  const handleApplyClick = () => {
    navigate('/register');
  };

  const handleLoginClick = async () => {
    // Clear any existing authentication data to ensure clean login
    if (currentUser) {
      await logout();
    }
    navigate('/login');
  };

  // Application Status Check functions
  const handleStatusSearch = async () => {
    if (!referenceNumber.trim()) {
      setStatusError('Please enter a reference number');
      return;
    }

    setStatusLoading(true);
    setStatusError('');
    setApplicationData(null);

    try {
      const response = await api.get(`/application-status/${referenceNumber.trim()}`);
      
      if (response && response.application) {
        setApplicationData(response.application);
      } else {
        setStatusError('Application not found. Please check your reference number.');
      }
    } catch (err) {
      console.error('Error fetching application status:', err);
      if (err.response?.status === 404) {
        setStatusError('Application not found. Please check your reference number.');
      } else {
        setStatusError('Error checking application status. Please try again.');
      }
    } finally {
      setStatusLoading(false);
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
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  };

  // Function to mask applicant name for privacy
  const maskApplicantName = (firstName, middleName, lastName, suffix) => {
    const maskName = (name) => {
      if (!name || name.length <= 2) {
        return name || '';
      }
      // Show first 2 characters, mask the rest with asterisks
      return name.substring(0, 2) + '*'.repeat(name.length - 2);
    };

    const maskedFirstName = maskName(firstName);
    const maskedMiddleName = maskName(middleName);
    const maskedLastName = maskName(lastName);
    const maskedSuffix = suffix || ''; // Keep suffix as is (usually short like Jr., Sr.)

    return `${maskedFirstName} ${maskedMiddleName} ${maskedLastName} ${maskedSuffix}`.trim();
  };

  // If user is logged in as PWD Member, show loading while redirecting
  if (currentUser && currentUser.role === 'PWDMember') {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#FFFFFF'
      }}>
        <Typography variant="h6" sx={{ color: '#253D90' }}>
          Redirecting to dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Grid container spacing={4} sx={{ alignItems: 'center' }}>
          {/* Left Side - Branding */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', color: '#2C3E50' }}>
              {/* Logo */}
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '3px solid #0b87ac',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <img 
                  src="/images/cropped_image.png" 
                  alt="PDAO Logo" 
                  style={{ 
                    width: '70%', 
                    height: '70%', 
                    objectFit: 'contain' 
                  }}
                />
              </Box>

              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  color: '#2C3E50'
                }}
              >
                PDAO RMS
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 500, 
                  mb: 3,
                  color: '#0b87ac'
                }}
              >
                Cabuyao City
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#7F8C8D',
                  maxWidth: 400,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Persons with Disabilities Affairs Office - Cabuyao City
                <br />
                Empowering lives through inclusive services and support.
              </Typography>

              {/* Features */}
              <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, backgroundColor: '#0b87ac', borderRadius: '50%' }} />
                  <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                    Secure Member Management
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, backgroundColor: '#0b87ac', borderRadius: '50%' }} />
                  <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                    Digital ID Card System
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, backgroundColor: '#0b87ac', borderRadius: '50%' }} />
                  <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                    Comprehensive Reporting
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Action Card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid #E0E0E0',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }} className="welcome-content">
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#2C3E50',
                      mb: 1
                    }}
                  >
                    Welcome
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#7F8C8D',
                      mb: 3
                    }}
                  >
                    Access your PWD services and benefits
                  </Typography>
                  
                  {/* Read Aloud Button */}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => readElement(document.querySelector('.welcome-content'))}
                    disabled={isReading}
                    sx={{
                      borderColor: '#0b87ac',
                      color: '#0b87ac',
                      mb: 2,
                      '&:hover': {
                        borderColor: '#0a6b8a',
                        backgroundColor: '#0b87ac15'
                      }
                    }}
                  >
                    {isReading ? 'Reading...' : 'Read Welcome Text'}
                  </Button>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleApplyClick}
                    sx={{
                      backgroundColor: '#0b87ac',
                      color: 'white',
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '16px',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(11, 135, 172, 0.3)',
                      '&:hover': {
                        backgroundColor: '#0a6b8a',
                        boxShadow: '0 6px 16px rgba(11, 135, 172, 0.4)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Apply for PWD ID
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleLoginClick}
                    sx={{
                      color: '#0b87ac',
                      borderColor: '#0b87ac',
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 500,
                      fontSize: '16px',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#0a6b8a',
                        backgroundColor: 'rgba(11, 135, 172, 0.1)',
                      },
                    }}
                  >
                    Login to Account
                  </Button>
                </Box>

                {/* Divider */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  my: 3,
                  '&::before, &::after': {
                    content: '""',
                    flex: 1,
                    height: 1,
                    backgroundColor: '#e9ecef'
                  }
                }}>
                  <Typography variant="body2" sx={{ 
                    px: 2, 
                    color: '#7F8C8D',
                    fontWeight: 500
                  }}>
                    OR
                  </Typography>
                </Box>

                {/* Application Status Check */}
                <Box key="application-status-check">
                  <Typography variant="h6" sx={{ 
                    textAlign: 'center', 
                    mb: 2, 
                    color: '#2C3E50',
                    fontWeight: 600
                  }}>
                    Check Application Status
                  </Typography>
                  
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
                        onKeyPress={(e) => e.key === 'Enter' && handleStatusSearch()}
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
                        onClick={handleStatusSearch}
                        disabled={statusLoading}
                        startIcon={statusLoading ? <CircularProgress size={16} /> : <SearchIcon />}
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
                        {statusLoading ? 'Checking...' : 'Check Status'}
                      </Button>
                    </Box>
                  </Box>

                  {statusError && (
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
                      {statusError}
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
                            {maskApplicantName(applicationData.firstName, applicationData.middleName, applicationData.lastName, applicationData.suffix)}
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
                </Box>

              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default LandingPage;