// src/components/Landing/LandingPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Alert,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search as SearchIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactMail as ContactIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useReadAloud } from '../../hooks/useReadAloud';

// Maximum file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

// Reupload Documents Section Component for Rejected Applications
function ReuploadDocumentsSection({ referenceNumber, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [fileErrors, setFileErrors] = useState({});
  const [documents, setDocuments] = useState({
    medicalCertificate: null,
    clinicalAbstract: null,
    voterCertificate: null,
    idPicture_0: null,
    idPicture_1: null,
    birthCertificate: null,
    wholeBodyPicture: null,
    affidavit: null,
    barangayCertificate: null
  });

  const handleFileChange = (field, file) => {
    // Clear previous error for this field
    setFileErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    if (!file) {
      setDocuments(prev => ({ ...prev, [field]: null }));
      setUploadError('');
      setUploadMessage('');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFileErrors(prev => ({
        ...prev,
        [field]: `File size (${fileSizeMB}MB) exceeds the maximum limit of 2MB. Please select a smaller file.`
      }));
      setUploadError(`File "${file.name}" is too large. Maximum file size is 2MB.`);
      return;
    }

    setDocuments(prev => ({ ...prev, [field]: file }));
    setUploadError('');
    setUploadMessage('');
  };

  const handleReupload = async () => {
    // Validate all files before upload
    const fileSizeErrors = {};
    Object.keys(documents).forEach(key => {
      const file = documents[key];
      if (file && file.size > MAX_FILE_SIZE) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileSizeErrors[key] = `File size (${fileSizeMB}MB) exceeds the maximum limit of 2MB.`;
      }
    });

    if (Object.keys(fileSizeErrors).length > 0) {
      setFileErrors(fileSizeErrors);
      setUploadError('One or more files exceed the 2MB size limit. Please compress or select smaller files.');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      setUploadMessage('');

      const formData = new FormData();
      formData.append('referenceNumber', referenceNumber);

      // Add all files to FormData
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          if (key.startsWith('idPicture_')) {
            formData.append(key, documents[key]);
          } else {
            formData.append(key, documents[key]);
          }
        }
      });

      const response = await api.post(`/application-status/${referenceNumber}/reupload-documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.success || response.data?.success) {
        setUploadMessage(response.data?.message || 'Documents uploaded successfully! Your application has been resubmitted for review.');
        setDocuments({
          medicalCertificate: null,
          clinicalAbstract: null,
          voterCertificate: null,
          idPicture_0: null,
          idPicture_1: null,
          birthCertificate: null,
          wholeBodyPicture: null,
          affidavit: null,
          barangayCertificate: null
        });
        if (onUploadSuccess) {
          setTimeout(() => {
            onUploadSuccess();
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Error uploading documents:', err);
      setUploadError(err.response?.data?.message || 'Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const documentFields = [
    { key: 'medicalCertificate', label: 'Medical Certificate' },
    { key: 'clinicalAbstract', label: 'Clinical Abstract' },
    { key: 'voterCertificate', label: 'Voter Certificate' },
    { key: 'idPicture_0', label: 'ID Picture 1 (1"x1")' },
    { key: 'idPicture_1', label: 'ID Picture 2 (1"x1")' },
    { key: 'birthCertificate', label: 'Birth Certificate' },
    { key: 'wholeBodyPicture', label: 'Whole Body Picture' },
    { key: 'affidavit', label: 'Affidavit' },
    { key: 'barangayCertificate', label: 'Barangay Certificate' }
  ];

  return (
    <Box sx={{ mt: 3, p: 3, bgcolor: 'white', borderRadius: 2, border: '2px solid #E74C3C' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#E74C3C' }}>
        📄 Re-upload Documents
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: '#7F8C8D' }}>
        Your application was rejected. You can re-upload the documents that need correction. After uploading, your application will be resubmitted for review.
      </Typography>
      
      <Grid container spacing={2}>
        {documentFields.map(({ key, label }) => (
          <Grid item xs={12} sm={6} key={key}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#2C3E50', display: 'block', mb: 1 }}>
              {label}
            </Typography>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(key, e.target.files[0])}
              disabled={uploading}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: fileErrors[key] ? '1px solid #E74C3C' : '1px solid #ddd', 
                borderRadius: '4px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.6 : 1
              }}
            />
            {fileErrors[key] && (
              <Alert severity="error" sx={{ mt: 0.5, py: 0.5 }}>
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  {fileErrors[key]}
                </Typography>
              </Alert>
            )}
            {documents[key] && !fileErrors[key] && (
              <Typography variant="caption" sx={{ color: '#27AE60', display: 'block', mt: 0.5 }}>
                ✓ {documents[key].name}
              </Typography>
            )}
          </Grid>
        ))}
      </Grid>

      {uploadMessage && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {uploadMessage}
        </Alert>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uploadError}
        </Alert>
      )}

      <Button
        fullWidth
        variant="contained"
        onClick={handleReupload}
        disabled={uploading || !Object.values(documents).some(file => file !== null)}
        startIcon={uploading ? <CircularProgress size={20} /> : null}
        sx={{
          mt: 3,
          bgcolor: '#27AE60',
          py: 1.5,
          '&:hover': { bgcolor: '#229954' },
          '&:disabled': { bgcolor: '#BDC3C7' }
        }}
      >
        {uploading ? 'Uploading...' : 'Upload Documents & Resubmit Application'}
      </Button>
    </Box>
  );
}

function LandingPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { readElement, isReading } = useReadAloud();
  const { referenceNumber: urlReferenceNumber } = useParams();

  // Application Status Check state
  const [referenceNumber, setReferenceNumber] = useState(urlReferenceNumber || '');
  const [applicationData, setApplicationData] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  
  // Navigation state
  const [activeSection, setActiveSection] = useState('home'); // 'home', 'about', 'contact'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Auto-search if reference number is in URL
  useEffect(() => {
    if (urlReferenceNumber && urlReferenceNumber.trim()) {
      setReferenceNumber(urlReferenceNumber.trim());
      // Auto-search after a short delay to ensure component is mounted
      const timer = setTimeout(async () => {
        const refNum = urlReferenceNumber.trim();
        if (!refNum) {
          setStatusError('Please enter a reference number');
          return;
        }

        setStatusLoading(true);
        setStatusError('');
        setApplicationData(null);

        try {
          const response = await api.get(`/application-status/${refNum}`);
          
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
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [urlReferenceNumber]);

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

  const handleNavigateToSection = (section) => {
    if (section === 'home') {
      navigate('/');
    } else if (section === 'about') {
      navigate('/about');
    } else if (section === 'contact') {
      navigate('/contact');
    }
    setMobileMenuOpen(false);
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
    <Box sx={{ bgcolor: '#f8f9fa' }}>
      {/* Header/Navigation */}
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 1000 }}>
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#0b87ac', width: 40, height: 40 }}>
              <img src="/images/cropped_image.png" alt="PDAO Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Avatar>
            <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 700 }}>
              PDAO RMS
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <Button sx={{ color: '#2C3E50', fontWeight: 400 }} onClick={() => navigate('/')}>
              Home
            </Button>
            <Button sx={{ color: '#2C3E50', fontWeight: 400 }} onClick={() => navigate('/about')}>
              About Us
            </Button>
            <Button sx={{ color: '#2C3E50', fontWeight: 400 }} onClick={() => navigate('/contact')}>
              Contact Us
            </Button>
            <Button 
              variant="contained" 
              sx={{ bgcolor: '#0b87ac', '&:hover': { bgcolor: '#0a6b8a' } }}
              onClick={handleLoginClick}
            >
              Login
            </Button>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#2C3E50' }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Box sx={{ width: 250, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 700 }}>Menu</Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigateToSection('home')}>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigateToSection('about')}>
                <ListItemText primary="About Us" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigateToSection('contact')}>
                <ListItemText primary="Contact Us" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLoginClick}>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Toolbar /> {/* Spacer for fixed AppBar */}

      {/* Home Section */}
      <Box id="home" sx={{ pt: 4, pb: 10 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            {/* Left Side - Image */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center'
              }}>
                <img 
                  src="/images/diversity-unity.svg" 
                  alt="Diversity and Unity" 
                  style={{ 
                    width: '100%',
                    maxWidth: '600px',
                    height: 'auto'
                  }}
                />
              </Box>
            </Grid>

            {/* Right Side - All Text Content */}
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  color: '#2C3E50',
                  fontSize: { xs: '1.5rem', md: '2rem' }
                }}
              >
                Persons with Disabilities Affairs Office
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#7F8C8D',
                  mb: 3,
                  lineHeight: 1.6,
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                Empowering lives through inclusive services and support. We provide comprehensive assistance to persons with disabilities in Cabuyao City.
              </Typography>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleApplyClick}
                  sx={{
                    bgcolor: '#0b87ac',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#0a6b8a' }
                  }}
                >
                  Apply for PWD ID
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/contact')}
                  sx={{
                    color: '#0b87ac',
                    borderColor: '#0b87ac',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    '&:hover': { borderColor: '#0a6b8a', bgcolor: 'rgba(11, 135, 172, 0.1)' }
                  }}
                >
                  Learn More
                </Button>
              </Box>
              
              {/* Feature Cards */}
              <Grid container spacing={2} sx={{ mt: 2, mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <PersonIcon sx={{ color: '#0b87ac', fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 600, mb: 1 }}>
                        Member Management
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Secure and comprehensive member records management system.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <CheckCircleIcon sx={{ color: '#0b87ac', fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 600, mb: 1 }}>
                        Digital Services
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Access digital ID cards and online services anytime, anywhere.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Application Status Card */}
              <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 3, color: '#2C3E50', fontWeight: 700 }}>
                    Check Application Status
                  </Typography>

                  <TextField
                    fullWidth
                    label="Reference Number"
                    placeholder="Enter your reference number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleStatusSearch()}
                    sx={{ mb: 2 }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleStatusSearch}
                    disabled={statusLoading}
                    startIcon={statusLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                    sx={{
                      bgcolor: '#0b87ac',
                      py: 1.5,
                      '&:hover': { bgcolor: '#0a6b8a' }
                    }}
                  >
                    {statusLoading ? 'Checking...' : 'Check Status'}
                  </Button>

                  {statusError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {statusError}
                    </Alert>
                  )}

                  {applicationData && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Application Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#7F8C8D', display: 'block' }}>
                            Reference Number:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>
                            {applicationData.referenceNumber || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#7F8C8D', display: 'block' }}>
                            Status:
                          </Typography>
                          <Chip
                            label={applicationData.status || 'Pending'}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(applicationData.status),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </Grid>
                        {applicationData.status === 'Rejected' && applicationData.remarks && (
                          <Grid item xs={12}>
                            <Alert severity="error" sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Rejection Reason:
                              </Typography>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {applicationData.remarks}
                              </Typography>
                            </Alert>
                          </Grid>
                        )}
                      </Grid>
                      
                      {/* Document Re-upload Section for Rejected Applications */}
                      {applicationData.status === 'Rejected' && applicationData.canReuploadDocuments && (
                        <ReuploadDocumentsSection 
                          referenceNumber={applicationData.referenceNumber}
                          onUploadSuccess={() => {
                            // Refresh application status after successful upload
                            handleStatusSearch();
                          }}
                        />
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#e0e0e0', py: 3, textAlign: 'center', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 900 }}>
        <Container>
          <Typography variant="body2" sx={{ color: '#333333' }}>
            © {new Date().getFullYear()} Persons with Disabilities Affairs Office - Cabuyao City. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;