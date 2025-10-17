// src/components/Landing/LandingPage.js
import React, { useState, useEffect, Suspense } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Lazy load the ApplicationStatusCheck component
const ApplicationStatusCheck = React.lazy(() => import('../application/ApplicationStatusCheck'));

function LandingPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
                <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                  <Suspense fallback={
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  }>
                    <ApplicationStatusCheck key="status-check-component" />
                  </Suspense>
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