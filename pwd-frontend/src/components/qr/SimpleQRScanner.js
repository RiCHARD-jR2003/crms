import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Chip,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import QrScanner from 'qr-scanner';
import pwdMemberService from '../../services/pwdMemberService';
import benefitService from '../../services/benefitService';
import api from '../../services/api';

const SimpleQRScanner = ({ open, onClose, onScan }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [memberInfo, setMemberInfo] = useState(null);
  const [currentBenefits, setCurrentBenefits] = useState([]);
  const [scanner, setScanner] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (open) {
      loadBirthdayBenefits();
      initializeCamera();
    } else {
      stopCamera();
      resetScanner();
    }

    return () => {
      stopCamera();
    };
  }, [open]);

  // Load birthday benefits from database
  const loadBirthdayBenefits = async () => {
    try {
      const benefitsData = await benefitService.getAll();
      if (benefitsData && Array.isArray(benefitsData)) {
        const birthdayBenefits = benefitsData.filter(benefit => benefit.type === 'Birthday Cash Gift');
        setCurrentBenefits(birthdayBenefits);
      } else {
        setCurrentBenefits([]);
      }
    } catch (error) {
      console.error('Error loading birthday benefits:', error);
      // Fallback to localStorage if database fails
      try {
        const savedBenefits = localStorage.getItem('benefits');
        if (savedBenefits) {
          const benefits = JSON.parse(savedBenefits);
          const birthdayBenefits = benefits.filter(benefit => benefit.type === 'Birthday Cash Gift');
          setCurrentBenefits(birthdayBenefits);
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        setCurrentBenefits([]);
      }
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setMemberInfo(null);
    setError(null);
    setLoading(false);
    setManualInput('');
    setShowManualInput(false);
  };

  // Handle manual QR code input
  const handleManualInput = () => {
    if (!manualInput.trim()) {
      setError('Please enter a QR code or PWD ID');
      return;
    }

    try {
      // Try to parse as JSON first (if it's a QR code)
      let qrData;
      try {
        qrData = JSON.parse(manualInput);
      } catch {
        // If not JSON, treat as PWD ID
        qrData = { pwd_id: manualInput.trim() };
      }

      // Process the manual input as if it was scanned
      const mockResult = { data: JSON.stringify(qrData) };
      handleQRScan(mockResult);
      setManualInput('');
      setShowManualInput(false);
    } catch (error) {
      console.error('Error processing manual input:', error);
      setError('Invalid QR code format. Please check and try again.');
    }
  };

  // Helper function to get the appropriate getUserMedia method
  const getUserMedia = (constraints) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(constraints);
    }
    
    // Legacy support
    const legacyGetUserMedia = navigator.getUserMedia || 
                              navigator.webkitGetUserMedia || 
                              navigator.mozGetUserMedia || 
                              navigator.msGetUserMedia;
    
    if (legacyGetUserMedia) {
      return new Promise((resolve, reject) => {
        legacyGetUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
    
    throw new Error('getUserMedia not supported');
  };

  const initializeCamera = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if MediaDevices API is available
      console.log('📱 Attempting to access camera directly...');
      console.log('📱 User Agent:', navigator.userAgent);
      console.log('📱 MediaDevices available:', !!navigator.mediaDevices);
      console.log('📱 getUserMedia available:', !!navigator.mediaDevices?.getUserMedia);
      console.log('📱 HTTPS:', location.protocol === 'https:');
      console.log('📱 Localhost:', location.hostname === 'localhost' || location.hostname === '127.0.0.1');
      console.log('📱 Current URL:', location.href);

      // Check HTTPS requirement for camera access
      const isHTTPS = location.protocol === 'https:';
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      
      if (!isHTTPS && !isLocalhost) {
        setError('📱 Camera access requires HTTPS or localhost. Please access the app via HTTPS or use localhost.');
        setLoading(false);
        return;
      }

      // Check if MediaDevices API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Check for legacy getUserMedia support
        const legacyGetUserMedia = navigator.getUserMedia || 
                                  navigator.webkitGetUserMedia || 
                                  navigator.mozGetUserMedia || 
                                  navigator.msGetUserMedia;
        
        if (!legacyGetUserMedia) {
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          if (isMobile) {
            setError('📱 Your mobile browser does not support camera access. Please use Chrome, Safari, or Firefox browser.');
          } else {
            setError('📱 Camera access not supported. Please use a modern browser like Chrome, Firefox, or Edge.');
          }
          setLoading(false);
          return;
        }
      }

      // Get camera stream - optimized for both mobile and PC
      let stream;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      try {
        if (isMobile) {
          // For mobile devices, try back camera first
          stream = await getUserMedia({
            video: {
              facingMode: 'environment', // Use back camera for QR scanning
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
        } else {
          // For PC/desktop, use any available camera with better settings
          stream = await getUserMedia({
            video: {
              width: { ideal: 1920, min: 640 },
              height: { ideal: 1080, min: 480 },
              frameRate: { ideal: 30, min: 15 }
            }
          });
        }
      } catch (primaryCameraError) {
        console.log('Primary camera failed, trying fallback...');
        console.log('Primary camera error:', primaryCameraError);
        try {
          // Fallback: try with basic constraints
          stream = await getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
        } catch (fallbackError) {
          console.log('Fallback camera failed, trying any available camera...');
          console.log('Fallback camera error:', fallbackError);
          try {
            // Last resort: try any available camera
            stream = await getUserMedia({
              video: true
            });
          } catch (anyCameraError) {
            console.log('All camera attempts failed:', anyCameraError);
            throw anyCameraError;
          }
        }
      }

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready before starting QR scanner
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
            setCameraActive(true);

            // Initialize QR scanner after video is ready
            let qrScanner;
            try {
              qrScanner = new QrScanner(
                videoRef.current,
                (result) => {
                  // Process scan immediately without delay
                  handleQRScan(result);
                },
                {
                  onDecodeError: (error) => {
                    // Only log decode errors occasionally to avoid spam
                    if (Math.random() < 0.01) { // Log only 1% of decode errors
                      console.log('Decode error (normal):', error.message);
                    }
                  },
                  highlightScanRegion: true,
                  highlightCodeOutline: true,
                  preferredCamera: isMobile ? 'environment' : undefined, // Only prefer back camera on mobile
                  maxScansPerSecond: isMobile ? 30 : 20, // Slightly lower frequency for PC
                  returnDetailedScanResult: true,
                  preferredEnvironment: isMobile ? 'environment' : undefined,
                  // Disable web worker to avoid chunk loading issues
                  worker: false,
                  // Add additional scanning options for better detection
                  calculateScanRegion: (video) => {
                    const smallerDimension = Math.min(video.videoWidth, video.videoHeight);
                    // Use larger scan region for PC (better for webcams)
                    const scanRegionSize = Math.round(isMobile ? 0.7 : 0.8 * smallerDimension);
                    return {
                      x: Math.round((video.videoWidth - scanRegionSize) / 2),
                      y: Math.round((video.videoHeight - scanRegionSize) / 2),
                      width: scanRegionSize,
                      height: scanRegionSize,
                    };
                  }
                }
              );
            } catch (scannerError) {
              console.error('Failed to create QR scanner:', scannerError);
              throw new Error('QR Scanner initialization failed. Please try refreshing the page.');
            }

            setScanner(qrScanner);
            await qrScanner.start();
          } catch (qrError) {
            console.error('QR Scanner initialization error:', qrError);
            setError('Failed to initialize QR scanner. Please try refreshing the page.');
            setLoading(false);
          }
        };
      }

      setLoading(false);
    } catch (err) {
      console.error('Camera initialization error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      setLoading(false);
      
      switch (err.name) {
        case 'NotAllowedError':
          setError('📱 Camera access denied. Please allow camera permissions in your browser settings and refresh the page.');
          break;
        case 'NotFoundError':
          setError('📱 No camera found. Please ensure your device has a camera and try again.');
          break;
        case 'NotSupportedError':
          setError('📱 Camera not supported. Please use Chrome, Firefox, or Safari browser on your mobile device.');
          break;
        case 'OverconstrainedError':
          setError('📱 Camera constraints not met. Please try refreshing the page or use a different device.');
          break;
        case 'SecurityError':
          setError('📱 Camera access blocked for security reasons. Please ensure you are using HTTPS or localhost.');
          break;
        default:
          setError(`📱 Camera error: ${err.message}. Please try refreshing the page or use a different browser.`);
      }
    }
  };

  const stopCamera = () => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      setScanner(null);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleQRScan = async (result) => {
    try {
      setLoading(true);
      setIsProcessing(true);
      setError(null);
      
      console.log('🎯 QR Code scanned:', result);
      console.log('📄 QR Code data:', result.data);
      console.log('🔍 QR Code format:', typeof result.data);
      console.log('📏 QR Code length:', result.data.length);
      console.log('🔍 QR Code first 100 chars:', result.data.substring(0, 100));
      
      // Try to parse QR code data
      let qrData;
      try {
        qrData = JSON.parse(result.data);
        console.log('✅ Successfully parsed QR data as JSON:', qrData);
      } catch (parseError) {
        console.error('❌ Failed to parse QR code as JSON:', parseError);
        console.log('📄 Raw QR data:', result.data);
        
        // Try to handle non-JSON QR codes (like URLs or plain text)
        if (result.data.includes('pwd') || result.data.includes('PWD')) {
          // Try to extract PWD ID from text
          const pwdIdMatch = result.data.match(/PWD-?\d+/i);
          if (pwdIdMatch) {
            const pwdId = pwdIdMatch[0];
            console.log('🔍 Extracted PWD ID:', pwdId);
            
            // Create a simple QR data object
            qrData = {
              pwd_id: pwdId,
              userID: pwdId.replace(/PWD-?/i, ''),
              name: 'Unknown Member',
              firstName: 'Unknown',
              lastName: 'Member'
            };
            console.log('✅ Created QR data object:', qrData);
          } else {
            console.error('❌ No PWD ID found in text');
            setError(`Invalid QR code format. Content: ${result.data.substring(0, 50)}...`);
            return;
          }
        } else {
          console.error('❌ QR code does not contain PWD information');
          setError(`Invalid QR code format. Content: ${result.data.substring(0, 50)}...`);
          return;
        }
      }
      
      setScannedData(qrData);
      
      // Find member in PWD data
      const pwdMembers = await pwdMemberService.getAll();
      const members = pwdMembers.members || [];
      
      // Try multiple ways to find the member
      const member = members.find(m => 
        m.id === qrData.pwdId || 
        m.userID === qrData.pwdId ||
        m.pwd_id === qrData.pwd_id ||
        m.id === qrData.userID ||
        m.userID === qrData.userID ||
        m.pwd_id === qrData.pwdId ||
        (qrData.pwd_id && m.pwd_id && m.pwd_id.includes(qrData.pwd_id)) ||
        (qrData.userID && m.userID && m.userID.toString() === qrData.userID.toString())
      );
      
      
      if (member) {
        setMemberInfo(member);
        
        // Check eligibility for current birthday benefits
        const eligibleBenefits = checkEligibility(member);
        
        console.log('🔍 Eligible benefits found:', eligibleBenefits);
        console.log('🔍 Benefit structure:', eligibleBenefits.length > 0 ? eligibleBenefits[0] : 'No benefits');
        
        setMemberInfo(prev => ({
          ...prev,
          eligibleBenefits
        }));
        
        // Process benefit claims for eligible benefits
        if (eligibleBenefits.length > 0) {
          await processBenefitClaims(member, eligibleBenefits);
        }
        
        // Show success message
        alert(`Successfully scanned QR code for: ${member.firstName} ${member.lastName} ${member.suffix || ''}`.trim());
        
      } else {
        setError(`PWD member not found in database. Searched for: ${JSON.stringify({
          pwdId: qrData.pwdId,
          userID: qrData.userID,
          pwd_id: qrData.pwd_id
        })}`);
      }
    } catch (error) {
      console.error('Error processing QR scan:', error);
      setError(`Error processing QR scan: ${error.message}`);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  // Check eligibility for birthday benefits
  const checkEligibility = (member) => {
    if (!member.birthDate) return [];
    
    const birthMonth = new Date(member.birthDate).getMonth() + 1;
    
    return currentBenefits.filter(benefit => {
      const quarterMonths = {
        'Q1': [1, 2, 3], // January, February, March
        'Q2': [4, 5, 6], // April, May, June
        'Q3': [7, 8, 9], // July, August, September
        'Q4': [10, 11, 12] // October, November, December
      };
      
      const eligibleMonths = quarterMonths[benefit.birthdayMonth] || [];
      return eligibleMonths.includes(birthMonth);
    });
  };

  // Process benefit claims for eligible benefits
  const processBenefitClaims = async (member, eligibleBenefits) => {
    try {
      
      for (const benefit of eligibleBenefits) {
        try {
          // Check if claim already exists by getting all claims and filtering
          const allClaims = await api.get('/benefit-claims');
          const existingClaims = allClaims.filter(claim => 
            claim.pwdID === member.userID && claim.benefitID === benefit.id
          );
          
          if (existingClaims && existingClaims.length > 0) {
            // Update existing claim to "Claimed" status
            const claim = existingClaims[0];
            
            await api.patch(`/benefit-claims/${claim.claimID}/status`, {
              status: 'Claimed'
            });
            
          } else {
            // Create new claim
            
            await api.post('/benefit-claims', {
              pwdID: member.userID,
              benefitID: benefit.id,
              claimDate: new Date().toISOString(),
              status: 'Claimed'
            });
            
          }
        } catch (claimError) {
          console.error(`Error processing claim for benefit:`, benefit);
          console.error(`Benefit name:`, benefit.title || benefit.benefitType || benefit.type || 'No name property');
          console.error(`Claim error:`, claimError);
        }
      }
      
      // Notify parent component about successful claims
      if (onScan) {
        onScan({
          member: member,
          benefit: eligibleBenefits[0], // Use first eligible benefit for notification
          status: 'claimed'
        });
      }
      
      // Show success message
      const benefitNames = eligibleBenefits.map(b => b.title || b.benefitType || b.type || 'Unknown Benefit').join(', ');
      alert(`Successfully processed ${eligibleBenefits.length} benefit claims for ${member.firstName} ${member.lastName} ${member.suffix || ''}: ${benefitNames}`);
      
    } catch (error) {
      console.error('Error processing benefit claims:', error);
      setError(`Error processing benefit claims: ${error.message}`);
    }
  };

  const handleClaimBenefit = async (benefit) => {
    try {
      setLoading(true);
      
      // Create benefit claim
      const claimData = {
        pwdID: memberInfo.userID,
        benefitID: benefit.id,
        claimDate: new Date().toISOString().split('T')[0],
        status: 'Claimed'
      };
      
      // Here you would make an API call to create the claim
      // For now, we'll just show success
      
      // Show success message
      setError(null);
      alert(`Benefit "${benefit.name}" claimed successfully for ${memberInfo.firstName} ${memberInfo.lastName} ${memberInfo.suffix || ''}!`);
      
      // Call the onScan callback if provided
      if (onScan) {
        onScan({
          member: memberInfo,
          benefit: benefit,
          status: 'claimed'
        });
      }
      
      // Close scanner
      handleClose();
      
    } catch (error) {
      console.error('Error claiming benefit:', error);
      setError('Failed to claim benefit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: '#2C3E50',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <QrCodeScannerIcon sx={{ mr: 1 }} />
          QR Code Scanner
        </Box>
        <IconButton 
          onClick={handleClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
              <Button
                variant="contained"
                onClick={initializeCamera}
                sx={{
                  bgcolor: '#E67E22',
                  '&:hover': { bgcolor: '#D35400' }
                }}
              >
                Retry Camera
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowManualInput(!showManualInput)}
                sx={{
                  borderColor: '#2C3E50',
                  color: '#2C3E50',
                  '&:hover': {
                    borderColor: '#34495E',
                    backgroundColor: 'rgba(44, 62, 80, 0.1)'
                  }
                }}
              >
                Manual Input
              </Button>
            </Box>
            
            {showManualInput && (
              <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                  Enter QR code data or PWD ID manually:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Enter QR code data or PWD ID..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleManualInput();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleManualInput}
                    sx={{
                      bgcolor: '#2C3E50',
                      '&:hover': { bgcolor: '#34495E' },
                      px: 2
                    }}
                  >
                    Process
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        ) : memberInfo ? (
          /* Scanned Member Information */
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              QR Code scanned successfully!
            </Alert>

            {/* Member Info */}
            <Card sx={{ mb: 3, border: '1px solid #E0E0E0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ color: '#2C3E50', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50' }}>
                    PWD Member Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      PWD ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {memberInfo.pwd_id || `PWD-${memberInfo.userID}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {`${memberInfo.firstName} ${memberInfo.middleName || ''} ${memberInfo.lastName} ${memberInfo.suffix || ''}`.trim()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Birth Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {memberInfo.birthDate ? new Date(memberInfo.birthDate).toLocaleDateString() : 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Disability Type
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {memberInfo.disabilityType || 'Not specified'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Eligible Benefits */}
            {memberInfo.eligibleBenefits && memberInfo.eligibleBenefits.length > 0 ? (
              <Card sx={{ border: '1px solid #E0E0E0' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50', mb: 2 }}>
                    Eligible Birthday Benefits
                  </Typography>
                  <Grid container spacing={2}>
                    {memberInfo.eligibleBenefits.map((benefit, index) => (
                      <Grid item xs={12} key={index}>
                        <Card sx={{ 
                          border: '1px solid #E67E22',
                          bgcolor: '#FFF8F0'
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#E67E22' }}>
                                  {benefit.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                                  {benefit.description}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#E67E22', mt: 1 }}>
                                  {benefit.amount}
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                onClick={() => handleClaimBenefit(benefit)}
                                disabled={loading}
                                sx={{
                                  bgcolor: '#E67E22',
                                  '&:hover': { bgcolor: '#D35400' },
                                  px: 3,
                                  py: 1.5,
                                  borderRadius: 2,
                                  fontWeight: 600,
                                  textTransform: 'none'
                                }}
                              >
                                {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Claim Benefit'}
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ border: '1px solid #E0E0E0' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CancelIcon sx={{ fontSize: 60, color: '#BDC3C7', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#7F8C8D', mb: 1 }}>
                    No Eligible Birthday Benefits
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#95A5A6' }}>
                    This member is not eligible for any current birthday cash gift benefits.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        ) : (
          /* Camera View */
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{
              position: 'relative',
              width: '100%',
              maxWidth: '500px',
              margin: '0 auto',
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid #E0E0E0',
              aspectRatio: '4/3',
              bgcolor: '#000'
            }}>
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                playsInline
                muted
              />
              
              {loading && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white'
                }}>
                  <CircularProgress sx={{ color: 'white' }} />
                </Box>
              )}

              {isProcessing && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  p: 3
                }}>
                  <CircularProgress sx={{ color: 'white', mb: 2 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Processing QR Code...
                  </Typography>
                  <Typography variant="caption" sx={{ textAlign: 'center' }}>
                    Verifying PWD member and processing benefits
                  </Typography>
                </Box>
              )}

              {cameraActive && (
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '200px',
                  height: '200px',
                  border: '2px solid #E67E22',
                  borderRadius: 2,
                  pointerEvents: 'none'
                }} />
              )}
            </Box>

            <Typography variant="body2" sx={{ mt: 2, color: '#BDC3C7' }}>
              Position the QR code within the camera view to scan
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, color: '#95A5A6', display: 'block' }}>
              💡 Tip: Hold your phone steady and ensure good lighting for best results
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, color: '#95A5A6', display: 'block' }}>
              📱 Mobile users: Make sure to allow camera permissions when prompted. Use Chrome or Safari for best results.
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, color: '#95A5A6', display: 'block' }}>
              🔄 If camera doesn't work, try refreshing the page or use the manual input below.
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, color: '#E67E22', display: 'block', fontWeight: 'bold' }}>
              ⚠️ If you see camera errors, please use Chrome, Safari, or Firefox browser and allow camera permissions.
            </Typography>
            
            {/* Manual Input Option */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #E0E0E0' }}>
              <Typography variant="body2" sx={{ mb: 2, color: '#666', textAlign: 'center' }}>
                Having trouble with the camera? Try manual input:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, maxWidth: 400, mx: 'auto' }}>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter QR code data or PWD ID..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualInput();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleManualInput}
                  sx={{
                    borderColor: '#2C3E50',
                    color: '#2C3E50',
                    '&:hover': {
                      borderColor: '#34495E',
                      backgroundColor: 'rgba(44, 62, 80, 0.1)'
                    },
                    px: 2
                  }}
                >
                  Process
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        {memberInfo ? (
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Button
              onClick={() => {
                resetScanner();
                initializeCamera();
              }}
              variant="outlined"
              sx={{
                borderColor: '#E67E22',
                color: '#E67E22',
                '&:hover': {
                  borderColor: '#D35400',
                  backgroundColor: 'rgba(230, 126, 34, 0.1)'
                }
              }}
            >
              Scan Another
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: '#BDC3C7',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Close
            </Button>
          </Box>
        ) : (
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: '#BDC3C7',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SimpleQRScanner;
