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
import PendingCountdown from '../application/PendingCountdown';

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
    // Check if at least one document is uploaded
    const hasAnyDocument = Object.values(documents).some(file => file !== null);
    if (!hasAnyDocument) {
      setUploadError('Please upload at least one document before submitting.');
      return;
    }

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

      // Don't set Content-Type manually - browser will set it with boundary automatically
      // This endpoint does NOT require OTP verification - it uses reference number only
      const response = await api.post(`/application-status/${referenceNumber}/reupload-documents`, formData);

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
      <Typography variant="caption" sx={{ mb: 2, color: '#E74C3C', display: 'block', fontStyle: 'italic' }}>
        * Required fields - Please upload all required documents before submitting.
      </Typography>
      
      <Grid container spacing={2}>
        {documentFields.map(({ key, label }) => (
          <Grid item xs={12} sm={6} key={key}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#2C3E50', display: 'block', mb: 1 }}>
              {label} <span style={{ color: '#E74C3C' }}>*</span>
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
  
  // Disability Assessment Check state
  const [assessmentRefNumber, setAssessmentRefNumber] = useState('');
  const [assessmentData, setAssessmentData] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState('');
  
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

  // Disability Assessment Check function
  const handleAssessmentSearch = async () => {
    if (!assessmentRefNumber.trim()) {
      setAssessmentError('Please enter an assessment reference number');
      return;
    }

    setAssessmentLoading(true);
    setAssessmentError('');
    setAssessmentData(null);

    try {
      const response = await api.get(`/public/disability-assessment/reference/${assessmentRefNumber.trim()}`);
      
      if (response) {
        setAssessmentData(response);
      } else {
        setAssessmentError('Assessment not found. Please check your reference number.');
      }
    } catch (err) {
      console.error('Error fetching assessment:', err);
      if (err.response?.status === 404 || err.message?.includes('not found')) {
        setAssessmentError('Assessment not found. Please check your reference number (e.g., DA-XXXXXXXX-XXXX).');
      } else {
        setAssessmentError('Error checking assessment schedule. Please try again.');
      }
    } finally {
      setAssessmentLoading(false);
    }
  };

  const getTimeSlotLabel = (slotNumber) => {
    const timeSlots = {
      1: '8:00 AM - 8:30 AM',
      2: '8:30 AM - 9:00 AM',
      3: '9:00 AM - 9:30 AM',
      4: '9:30 AM - 10:00 AM',
      5: '10:00 AM - 10:30 AM',
      6: '10:30 AM - 11:00 AM',
      7: '1:00 PM - 1:30 PM',
      8: '1:30 PM - 2:00 PM',
      9: '2:00 PM - 2:30 PM',
      10: '2:30 PM - 3:00 PM'
    };
    return timeSlots[slotNumber] || 'TBD';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '#27AE60';
      case 'pending':
      case 'pending admin approval':
      case 'pending barangay approval':
        return '#F39C12';
      case 'for assessment':
        return '#1976D2';
      case 'rejected':
        return '#E74C3C';
      case 'expired':
        return '#E74C3C';
      case 'for claiming':
        return '#3498DB';
      case 'for renewal':
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
    <Box sx={{ bgcolor: '#f8f9fa', margin: 0, padding: 0 }}>
      {/* Header/Navigation */}
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          bgcolor: 'white', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          zIndex: 1000,
          top: 0,
          left: 0,
          right: 0,
          margin: 0,
          padding: 0
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1, minHeight: '64px !important' }}>
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
          <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
            {/* Left Side - Image (Sticky) */}
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ 
                position: 'sticky',
                top: 80, // Below the AppBar
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'flex-start',
                pt: 2
              }}>
                <img 
                  src="/images/diversity-unity.svg" 
                  alt="Diversity and Unity" 
                  style={{ 
                    width: '100%',
                    maxWidth: '500px',
                    height: 'auto'
                  }}
                />
              </Box>
            </Grid>

            {/* Right Side - All Text Content */}
            <Grid item xs={12} md={6}>
              {/* Mobile Image - Shows only on mobile */}
              <Box sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                justifyContent: 'center', 
                mb: 3 
              }}>
                <img 
                  src="/images/diversity-unity.svg" 
                  alt="Diversity and Unity" 
                  style={{ 
                    width: '80%',
                    maxWidth: '300px',
                    height: 'auto'
                  }}
                />
              </Box>
              
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
                    <Box sx={{ mt: 3 }}>
                      {/* Claiming Notification Banner */}
                      {applicationData.status === 'For Claiming' && (
                        <Alert 
                          severity="info" 
                          sx={{ 
                            mb: 2, 
                            bgcolor: '#EBF5FB', 
                            borderLeft: '4px solid #3498DB',
                            '& .MuiAlert-icon': {
                              color: '#3498DB'
                            }
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#2874A6' }}>
                            🎉 Your PWD ID Card is Ready for Claiming!
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2C3E50', mb: 1 }}>
                            Your PWD ID card has been processed and is ready for claiming at the PDAO office.
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2874A6', mb: 0.5 }}>
                            Claiming Schedule:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2C3E50', mb: 1 }}>
                            Monday to Friday, 8:00 AM - 5:00 PM
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2874A6', mb: 0.5 }}>
                            What to Bring:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                            Please bring a valid government-issued ID when claiming your PWD ID card.
                          </Typography>
                        </Alert>
                      )}
                      
                      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
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
                        <Grid item xs={12}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#7F8C8D', display: 'block', mb: 0.5 }}>
                            Submission Date:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                            {formatDate(applicationData.submissionDate)}
                          </Typography>
                        </Grid>
                        {applicationData.expiresAt && (
                          <Grid item xs={12}>
                            <PendingCountdown
                              expiresAt={applicationData.expiresAt}
                              status={applicationData.status}
                              referenceNumber={applicationData.referenceNumber}
                            />
                          </Grid>
                        )}
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
                        
                        {/* Disability Assessment Section */}
                        {(applicationData.status === 'For Assessment' || applicationData.disabilityAssessment) && (
                          <Grid item xs={12}>
                            <Box sx={{ 
                              mt: 2, 
                              p: 2, 
                              bgcolor: '#E8F4FD', 
                              borderRadius: 2,
                              border: '1px solid #1976D2'
                            }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                📋 Disability Assessment Status
                              </Typography>
                              
                              {applicationData.disabilityAssessment ? (
                                <Box>
                                  <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                                        Assessment Reference:
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {applicationData.disabilityAssessment.reference_number}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                                        Status:
                                      </Typography>
                                      <Chip
                                        label={
                                          applicationData.disabilityAssessment.status === 'pending' ? 'Awaiting Schedule' :
                                          applicationData.disabilityAssessment.status === 'scheduled' ? 'Scheduled' :
                                          applicationData.disabilityAssessment.status === 'completed' ? 'Completed' :
                                          applicationData.disabilityAssessment.status === 'finalized' ? 'Finalized' :
                                          applicationData.disabilityAssessment.status === 'uploaded' ? 'Ready for Approval' :
                                          applicationData.disabilityAssessment.status === 'missed' ? 'Missed Appointment' :
                                          applicationData.disabilityAssessment.status === 'rescheduled' ? 'Rescheduled' :
                                          applicationData.disabilityAssessment.status
                                        }
                                        size="small"
                                        sx={{
                                          bgcolor: 
                                            applicationData.disabilityAssessment.status === 'pending' ? '#FFF3E0' :
                                            applicationData.disabilityAssessment.status === 'scheduled' ? '#E3F2FD' :
                                            applicationData.disabilityAssessment.status === 'completed' ? '#E8F5E9' :
                                            applicationData.disabilityAssessment.status === 'finalized' ? '#F3E5F5' :
                                            applicationData.disabilityAssessment.status === 'uploaded' ? '#E0F2F1' :
                                            applicationData.disabilityAssessment.status === 'missed' ? '#FFEBEE' :
                                            applicationData.disabilityAssessment.status === 'rescheduled' ? '#FFF8E1' : '#E0E0E0',
                                          color:
                                            applicationData.disabilityAssessment.status === 'pending' ? '#E65100' :
                                            applicationData.disabilityAssessment.status === 'scheduled' ? '#1565C0' :
                                            applicationData.disabilityAssessment.status === 'completed' ? '#2E7D32' :
                                            applicationData.disabilityAssessment.status === 'finalized' ? '#7B1FA2' :
                                            applicationData.disabilityAssessment.status === 'uploaded' ? '#00695C' :
                                            applicationData.disabilityAssessment.status === 'missed' ? '#C62828' :
                                            applicationData.disabilityAssessment.status === 'rescheduled' ? '#F57F17' : '#616161',
                                          fontWeight: 600
                                        }}
                                      />
                                    </Grid>
                                    {applicationData.disabilityAssessment.assessment_date && (
                                      <>
                                        <Grid item xs={6}>
                                          <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                                            Scheduled Date:
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {new Date(applicationData.disabilityAssessment.assessment_date).toLocaleDateString()}
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                          <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                                            Scheduled Time:
                                          </Typography>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {applicationData.disabilityAssessment.assessment_time || 'TBD'}
                                          </Typography>
                                        </Grid>
                                      </>
                                    )}
                                  </Grid>
                                  
                                  {applicationData.disabilityAssessment.status === 'pending' && (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                      <Typography variant="body2">
                                        Your application requires a disability assessment. You will receive an email with instructions to schedule your appointment.
                                      </Typography>
                                    </Alert>
                                  )}
                                  
                                  {applicationData.disabilityAssessment.status === 'scheduled' && (
                                    <Alert severity="warning" sx={{ mt: 2 }}>
                                      <Typography variant="body2">
                                        Please attend your scheduled disability assessment. Bring a valid government ID and any relevant medical documents.
                                      </Typography>
                                    </Alert>
                                  )}
                                  
                                  {applicationData.disabilityAssessment.status === 'missed' && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        ⚠️ You missed your scheduled assessment appointment.
                                      </Typography>
                                      <Typography variant="body2" sx={{ mt: 1 }}>
                                        {applicationData.disabilityAssessment.can_reschedule 
                                          ? 'You have been sent an email with a link to reschedule your appointment. Please check your email and reschedule as soon as possible.'
                                          : 'You have already used your rescheduling opportunity. Please contact the PDAO office directly for assistance.'}
                                      </Typography>
                                      {applicationData.disabilityAssessment.reschedule_count > 0 && (
                                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#F57F17' }}>
                                          Rescheduling opportunities used: {applicationData.disabilityAssessment.reschedule_count} / {applicationData.disabilityAssessment.max_reschedule_allowed || 1}
                                        </Typography>
                                      )}
                                    </Alert>
                                  )}
                                  
                                  {applicationData.disabilityAssessment.status === 'rescheduled' && (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                      <Typography variant="body2">
                                        Your assessment has been rescheduled. Please make sure to attend your new appointment date. This is a rescheduled appointment.
                                      </Typography>
                                      {applicationData.disabilityAssessment.reschedule_count > 0 && (
                                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                          Note: You have rescheduled {applicationData.disabilityAssessment.reschedule_count} time(s). Further rescheduling may not be available.
                                        </Typography>
                                      )}
                                    </Alert>
                                  )}
                                  
                                  {applicationData.disabilityAssessment.status === 'completed' && (
                                    <Alert severity="info" sx={{ mt: 2 }}>
                                      <Typography variant="body2">
                                        Your assessment has been completed. The staff is now processing your results.
                                      </Typography>
                                    </Alert>
                                  )}
                                  
                                  {applicationData.disabilityAssessment.status === 'finalized' && (
                                    <Alert severity="success" sx={{ mt: 2 }}>
                                      <Typography variant="body2">
                                        Your disability assessment has been completed. Your application is now pending final admin approval.
                                      </Typography>
                                    </Alert>
                                  )}
                                  
                                  {applicationData.disabilityAssessment.status === 'uploaded' && (
                                    <Alert severity="success" sx={{ mt: 2 }}>
                                      <Typography variant="body2">
                                        Your disability assessment is complete and all documents have been submitted. Your application is awaiting final approval.
                                      </Typography>
                                    </Alert>
                                  )}
                                </Box>
                              ) : (
                                <Alert severity="info">
                                  <Typography variant="body2">
                                    Your application is now awaiting disability assessment. You will receive an email with instructions to schedule your assessment appointment.
                                  </Typography>
                                </Alert>
                              )}
                            </Box>
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
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Disability Assessment Schedule Check Card */}
              <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', mt: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ mb: 1, color: '#2C3E50', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    📋 Check Disability Assessment Schedule
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: '#7F8C8D' }}>
                    If your application has been endorsed by your barangay, you can check your assessment schedule here.
                  </Typography>

                  <TextField
                    fullWidth
                    label="Assessment Reference Number"
                    placeholder="Enter your assessment reference (e.g., DA-20251203-XXXX)"
                    value={assessmentRefNumber}
                    onChange={(e) => setAssessmentRefNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAssessmentSearch()}
                    sx={{ mb: 2 }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAssessmentSearch}
                    disabled={assessmentLoading}
                    startIcon={assessmentLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                    sx={{
                      bgcolor: '#1565C0',
                      py: 1.5,
                      '&:hover': { bgcolor: '#0D47A1' }
                    }}
                  >
                    {assessmentLoading ? 'Checking...' : 'Check Schedule'}
                  </Button>

                  {assessmentError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {assessmentError}
                    </Alert>
                  )}

                  {assessmentData && (
                    <Box sx={{ mt: 3 }}>
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: '#E3F2FD', 
                        borderRadius: 2,
                        border: '1px solid #1976D2'
                      }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565C0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          📋 Assessment Details
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                              Reference Number:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {assessmentData.reference_number}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                              Applicant Name:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {assessmentData.applicant_name}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                              Status:
                            </Typography>
                            <Chip
                              label={
                                assessmentData.status === 'pending' ? 'Awaiting Schedule' :
                                assessmentData.status === 'scheduled' ? 'Scheduled' :
                                assessmentData.status === 'completed' ? 'Assessment Completed' :
                                assessmentData.status === 'finalized' ? 'Finalized' :
                                assessmentData.status === 'uploaded' ? 'Ready for Approval' :
                                assessmentData.status === 'missed' ? 'Missed Appointment' :
                                assessmentData.status
                              }
                              size="small"
                              sx={{
                                bgcolor: 
                                  assessmentData.status === 'pending' ? '#FFF3E0' :
                                  assessmentData.status === 'scheduled' ? '#E3F2FD' :
                                  assessmentData.status === 'completed' ? '#E8F5E9' :
                                  assessmentData.status === 'finalized' ? '#F3E5F5' :
                                  assessmentData.status === 'uploaded' ? '#E0F2F1' :
                                  assessmentData.status === 'missed' ? '#FFEBEE' : '#E0E0E0',
                                color:
                                  assessmentData.status === 'pending' ? '#E65100' :
                                  assessmentData.status === 'scheduled' ? '#1565C0' :
                                  assessmentData.status === 'completed' ? '#2E7D32' :
                                  assessmentData.status === 'finalized' ? '#7B1FA2' :
                                  assessmentData.status === 'uploaded' ? '#00695C' :
                                  assessmentData.status === 'missed' ? '#C62828' : '#616161',
                                fontWeight: 600
                              }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                              Disability Type:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {assessmentData.disability_type || 'N/A'}
                            </Typography>
                          </Grid>
                          
                          {assessmentData.assessment_date && (
                            <>
                              <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                                  Scheduled Date:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1565C0' }}>
                                  {new Date(assessmentData.assessment_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                                  Scheduled Time:
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1565C0' }}>
                                  {getTimeSlotLabel(assessmentData.slot_number)}
                                </Typography>
                              </Grid>
                            </>
                          )}
                        </Grid>

                        {assessmentData.status === 'pending' && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              <strong>Schedule Your Assessment:</strong> You can schedule your disability assessment appointment using the link sent to your email, or click the button below.
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => navigate(`/disability-assessment/schedule/${assessmentData.reference_number}`)}
                              sx={{ mt: 1, bgcolor: '#1565C0', '&:hover': { bgcolor: '#0D47A1' } }}
                            >
                              Schedule Now
                            </Button>
                          </Alert>
                        )}
                        
                        {assessmentData.status === 'scheduled' && (
                          <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              <strong>Your appointment is confirmed!</strong> Please arrive 15 minutes before your scheduled time.
                              <br /><br />
                              <strong>What to bring:</strong>
                              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                                <li>Valid Government ID</li>
                                <li>Medical Certificate (if available)</li>
                                <li>Previous medical records</li>
                              </ul>
                            </Typography>
                          </Alert>
                        )}
                        
                        {assessmentData.status === 'missed' && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              <strong>⚠️ Missed Appointment:</strong> You missed your scheduled assessment. 
                              {assessmentData.reschedule_count < (assessmentData.max_reschedule_allowed || 1) 
                                ? ' Please check your email for a rescheduling link or contact the PDAO office.'
                                : ' Please contact the PDAO office directly for assistance.'}
                            </Typography>
                          </Alert>
                        )}
                        
                        {(assessmentData.status === 'completed' || assessmentData.status === 'finalized' || assessmentData.status === 'uploaded') && (
                          <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                              <strong>✅ Assessment Complete!</strong> Your disability assessment has been completed. 
                              Your application is now being processed for final approval.
                            </Typography>
                          </Alert>
                        )}
                        
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #BBDEFB' }}>
                          <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                            📍 <strong>Location:</strong> Cabuyao PDAO Office, City Hall Complex
                            <br />
                            📞 <strong>Contact:</strong> pdao@cabuyao.gov.ph
                          </Typography>
                        </Box>
                      </Box>
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