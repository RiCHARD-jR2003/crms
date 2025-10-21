// src/components/auth/login.js
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Container,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    captcha: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (requiresCaptcha && !formData.captcha) newErrors.captcha = 'Captcha is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      console.log('Login form submitted with:', formData);
      const user = await login(formData);
      console.log('Login successful, navigating to dashboard');
      
      // Reset security states on successful login
      setRequiresCaptcha(false);
      setAccountLocked(false);
      setLockoutUntil(null);
      setFailedAttempts(0);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors - check both error.response.data and error.data
      const errorData = error.response?.data || error.data;
      const errorStatus = error.response?.status || error.status;
      
      if (errorData) {
        // Check for captcha requirement in multiple ways
        if (errorData.account_locked) {
          setAccountLocked(true);
          setLockoutUntil(errorData.lockout_until);
          setServerError(errorData.message);
        } else if (errorData.requires_captcha || errorData.message?.includes('captcha')) {
          setRequiresCaptcha(true);
          setFailedAttempts(errorData.failed_attempts || 0);
          setServerError(errorData.message);
        } else {
          setServerError(errorData.message || 'Login failed. Please try again.');
          if (errorData.failed_attempts) {
            setFailedAttempts(errorData.failed_attempts);
          }
          if (errorData.requires_captcha) {
            setRequiresCaptcha(true);
          }
        }
      } else if (error.message?.includes('captcha')) {
        // Fallback: if error message contains captcha, show captcha field
        setRequiresCaptcha(true);
        setServerError(error.message);
      } else {
        setServerError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

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

          {/* Right Side - Login Form */}
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
                {/* Back Button */}
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackClick}
                    sx={{
                      color: '#7F8C8D',
                      fontSize: '14px',
                      fontWeight: 500,
                      textTransform: 'none',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(127, 140, 141, 0.1)',
                        color: '#2C3E50',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Back to Home
                  </Button>
                </Box>

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
                    Welcome Back
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#7F8C8D',
                      mb: 3
                    }}
                  >
                    Sign in to your account
                  </Typography>
                </Box>

                {/* Login Form */}
                <Box component="form" onSubmit={handleSubmit}>
                  {serverError && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        backgroundColor: '#ffebee',
                        color: '#c62828'
                      }}
                    >
                      {serverError}
                    </Alert>
                  )}

                  {/* Username Field */}
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleInputChange('username')}
                      error={!!errors.username}
                      helperText={errors.username}
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#7F8C8D' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: '#f8f9fa',
                          '& fieldset': {
                            borderColor: '#e9ecef',
                          },
                          '&:hover fieldset': {
                            borderColor: '#0b87ac',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0b87ac',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: '#2C3E50',
                          py: 1.5,
                        },
                      }}
                    />
                  </Box>

                  {/* Password Field */}
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      error={!!errors.password}
                      helperText={errors.password}
                      autoComplete="current-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: '#7F8C8D' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              onClick={() => setShowPassword(!showPassword)}
                              sx={{ 
                                minWidth: 'auto', 
                                p: 1,
                                color: '#7F8C8D',
                                '&:hover': {
                                  backgroundColor: 'transparent'
                                }
                              }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: '#f8f9fa',
                          '& fieldset': {
                            borderColor: '#e9ecef',
                          },
                          '&:hover fieldset': {
                            borderColor: '#0b87ac',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0b87ac',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: '#2C3E50',
                          py: 1.5,
                        },
                      }}
                    />
                  </Box>

                  {/* Captcha Field - Only show when required */}
                  {requiresCaptcha && (
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        placeholder="Enter captcha: PWD123"
                        value={formData.captcha}
                        onChange={handleInputChange('captcha')}
                        error={!!errors.captcha}
                        helperText={errors.captcha || `Failed attempts: ${failedAttempts}/5`}
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect="off"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: '#fff3cd',
                            '& fieldset': {
                              borderColor: '#ffc107',
                            },
                            '&:hover fieldset': {
                              borderColor: '#ff8c00',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#ff8c00',
                              borderWidth: 2,
                            },
                          },
                          '& .MuiInputBase-input': {
                            color: '#2C3E50',
                            py: 1.5,
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ 
                        color: '#856404', 
                        fontSize: '12px',
                        mt: 1,
                        display: 'block'
                      }}>
                        Please enter "PWD123" to verify you are not a robot
                      </Typography>
                    </Box>
                  )}

                  {/* Account Locked Message */}
                  {accountLocked && (
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        backgroundColor: '#fff3cd',
                        color: '#856404',
                        border: '1px solid #ffc107'
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Account Locked
                      </Typography>
                      <Typography variant="body2">
                        {lockoutUntil && `Account will be unlocked at ${new Date(lockoutUntil).toLocaleString()}`}
                      </Typography>
                    </Alert>
                  )}

                  {/* Forgot Password */}
                  <Box sx={{ textAlign: 'right', mb: 3 }}>
                    <Button
                      variant="text"
                      onClick={() => navigate('/password-reset')}
                      sx={{ 
                        color: '#0b87ac', 
                        fontSize: '14px',
                        fontWeight: 500,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(11, 135, 172, 0.1)'
                        }
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </Box>

                  {/* Security Status Indicator */}
                  {requiresCaptcha && (
                    <Box sx={{ 
                      mb: 2, 
                      p: 2, 
                      backgroundColor: '#fff3cd', 
                      border: '1px solid #ffc107',
                      borderRadius: 2,
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: '#856404', 
                        fontWeight: 600,
                        mb: 1
                      }}>
                        🔒 Security Verification Required
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: '#856404',
                        display: 'block'
                      }}>
                        Please complete the captcha below to continue
                      </Typography>
                    </Box>
                  )}

                  {/* Login Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
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
                      '&:disabled': {
                        backgroundColor: '#95A5A6',
                        boxShadow: 'none',
                        transform: 'none',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {submitting ? 'Signing In...' : 'Sign In'}
                  </Button>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" sx={{ color: '#7F8C8D', px: 2 }}>
                      or
                    </Typography>
                  </Divider>

                  {/* Register Link */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#7F8C8D', mb: 1 }}>
                      Don't have an account?
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/register')}
                      sx={{
                        color: '#0b87ac',
                        borderColor: '#0b87ac',
                        borderRadius: 3,
                        px: 3,
                        py: 1,
                        fontWeight: 500,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#0a6b8a',
                          backgroundColor: 'rgba(11, 135, 172, 0.1)',
                        },
                      }}
                    >
                      Create Account
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Login;