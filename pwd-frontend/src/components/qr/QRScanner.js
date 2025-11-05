import React, { useState, useRef, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Close as CloseIcon,
  QrCodeScanner as ScannerIcon,
  CameraAlt as CameraIcon,
  FlipCameraAndroid as FlipCameraIcon
} from '@mui/icons-material';
import { Html5Qrcode } from 'html5-qrcode';
import QRCodeService from '../../services/qrCodeService';
import benefitService from '../../services/benefitService';
import toastService from '../../services/toastService';
import api from '../../services/api';
import pwdMemberService from '../../services/pwdMemberService';

// Set up global error handler immediately to catch camera errors
if (typeof window !== 'undefined') {
  const originalErrorHandler = window.onerror;
  const originalUnhandledRejection = window.onunhandledrejection;
  
  // More aggressive error suppression for camera-related errors
  window.onerror = (message, source, lineno, colno, error) => {
    // Suppress camera-related errors, especially common on mobile
    const errorMessage = message?.toString() || error?.message || error?.toString() || '';
    const errorString = errorMessage.toLowerCase();
    
    if (errorString.includes('setphotooptions') || 
        errorString.includes('setphotoptions') || // Typo variations
        errorString.includes('invalid state') ||
        errorString.includes('operation was aborted') ||
        errorString.includes('track is not in the correct state') ||
        errorString.includes('setphotooptions failed') ||
        errorString.includes('failed to execute') ||
        errorString.includes('mediastreamtrack') ||
        errorString.includes('getusermedia') ||
        errorString.includes('photo options') ||
        errorString.includes('camera') && errorString.includes('failed') ||
        errorString.includes('torch') ||
        errorString.includes('constraints') && errorString.includes('failed')) {
      // Completely suppress the error
      return true;
    }
    // Let other errors through
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }
    return false;
  };

  window.onunhandledrejection = (event) => {
    // Suppress camera-related promise rejections
    if (event && event.reason) {
      const reasonStr = (event.reason.toString() || event.reason.message || JSON.stringify(event.reason) || '').toLowerCase();
      if (reasonStr.includes('setphotooptions') || 
          reasonStr.includes('setphotoptions') || // Typo variations
          reasonStr.includes('invalid state') ||
          reasonStr.includes('aborted') ||
          reasonStr.includes('setphotooptions failed') ||
          reasonStr.includes('failed to execute') ||
          reasonStr.includes('torch') ||
          reasonStr.includes('photo options') ||
          reasonStr.includes('constraints') && reasonStr.includes('failed') ||
          reasonStr.includes('mediastreamtrack')) {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    }
    // Let other rejections through
    if (originalUnhandledRejection) {
      return originalUnhandledRejection(event);
    }
    return false;
  };

  // Also catch errors that might bubble up to React's error overlay
  if (window.addEventListener) {
    window.addEventListener('error', (event) => {
      const errorMessage = (event.message || event.error?.message || '').toLowerCase();
      if (errorMessage.includes('setphotooptions') || 
          errorMessage.includes('setphotoptions') ||
          errorMessage.includes('photo options') ||
          errorMessage.includes('camera') && errorMessage.includes('failed') ||
          errorMessage.includes('torch') ||
          errorMessage.includes('mediastreamtrack')) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    }, true); // Use capture phase
    
    window.addEventListener('unhandledrejection', (event) => {
      const reasonStr = (event.reason?.toString() || event.reason?.message || '').toLowerCase();
      if (reasonStr.includes('setphotooptions') || 
          reasonStr.includes('setphotoptions') ||
          reasonStr.includes('photo options') ||
          reasonStr.includes('torch') ||
          reasonStr.includes('mediastreamtrack')) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    }, true); // Use capture phase
  }

  // Suppress console errors for setPhotoOptions (if error still appears)
  if (console && console.error) {
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const errorMsg = args.join(' ').toLowerCase();
      if (errorMsg.includes('setphotooptions') || 
          errorMsg.includes('setphotoptions') ||
          errorMsg.includes('photo options') ||
          errorMsg.includes('camera') && errorMsg.includes('failed')) {
        // Suppress this specific error
        return;
      }
      // Call original console.error for other errors
      originalConsoleError.apply(console, args);
    };
  }
}

// Helper function to detect mobile devices
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768);
};

const QRScanner = ({ open, onClose, onScanSuccess, onScanError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannerReady, setScannerReady] = useState(false);
  const [showBenefitSelection, setShowBenefitSelection] = useState(true);
  const [allActiveBenefits, setAllActiveBenefits] = useState([]);
  const [selectedBenefitId, setSelectedBenefitId] = useState('');
  const [benefitsLoaded, setBenefitsLoaded] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isUsingBackCamera, setIsUsingBackCamera] = useState(true);
  const scannerContainerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);
  const isMobile = isMobileDevice(); // Detect mobile device

  useEffect(() => {
    if (open) {
      loadAllActiveBenefits();
    } else {
      stopScanner();
      setShowBenefitSelection(true);
      setSelectedBenefitId('');
    }

    // Set up global error handler to suppress camera-related errors
    const originalErrorHandler = window.onerror;
    const originalUnhandledRejection = window.onunhandledrejection;
    
    window.onerror = (message, source, lineno, colno, error) => {
      // More aggressive suppression for camera-related errors
      const errorMessage = (message?.toString() || error?.message || error?.toString() || '').toLowerCase();
      if (errorMessage.includes('setphotooptions') || 
          errorMessage.includes('setphotoptions') ||
          errorMessage.includes('photo options') ||
          errorMessage.includes('invalid state') ||
          errorMessage.includes('operation was aborted') ||
          errorMessage.includes('track is not in the correct state') ||
          errorMessage.includes('failed to execute') ||
          errorMessage.includes('mediastreamtrack') ||
          errorMessage.includes('getusermedia') ||
          (errorMessage.includes('camera') && errorMessage.includes('failed')) ||
          errorMessage.includes('torch')) {
        return true; // Suppress the error
      }
      // Let other errors through
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error);
      }
      return false;
    };

    window.onunhandledrejection = (event) => {
      // More aggressive suppression for camera-related promise rejections
      if (event && event.reason) {
        const reasonStr = (event.reason.toString() || event.reason.message || JSON.stringify(event.reason) || '').toLowerCase();
        if (reasonStr.includes('setphotooptions') || 
            reasonStr.includes('setphotoptions') ||
            reasonStr.includes('photo options') ||
            reasonStr.includes('invalid state') ||
            reasonStr.includes('aborted') ||
            reasonStr.includes('setphotooptions failed') ||
            reasonStr.includes('failed to execute') ||
            reasonStr.includes('torch') ||
            reasonStr.includes('mediastreamtrack')) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
      // Let other rejections through
      if (originalUnhandledRejection) {
        return originalUnhandledRejection(event);
      }
    };

    return () => {
      // Safely stop scanner without letting errors propagate to React
      try {
        stopScanner();
      } catch (e) {
        // Suppress all errors during cleanup
      }
      // Restore original handlers
      try {
        window.onerror = originalErrorHandler;
        window.onunhandledrejection = originalUnhandledRejection;
      } catch (e) {
        // Ignore errors when restoring handlers
      }
    };
  }, [open]);

  // Load ALL active benefits from database
  const loadAllActiveBenefits = async () => {
    try {
      setBenefitsLoaded(false);
      const benefitsData = await benefitService.getAll();
      if (benefitsData && Array.isArray(benefitsData)) {
        const activeBenefits = benefitsData.filter(benefit => 
          benefit.status === 'Active' || benefit.status === 'active'
        );
        setAllActiveBenefits(activeBenefits);
        setBenefitsLoaded(true);
      } else {
        setAllActiveBenefits([]);
        setBenefitsLoaded(true);
      }
    } catch (error) {
      console.error('Error loading active benefits:', error);
      setAllActiveBenefits([]);
      setBenefitsLoaded(true);
    }
  };

  const handleStartScanning = () => {
    if (!benefitsLoaded) {
      toastService.error('Please wait for benefits to load');
      return;
    }
    setShowBenefitSelection(false);
    setTimeout(() => {
      initializeScanner();
    }, 300);
  };

  const initializeScanner = async (deviceId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Stop current scanner completely before switching
      stopScanner();
      
      // Wait longer on mobile for tracks to fully stop
      await new Promise(resolve => setTimeout(resolve, isMobile ? 200 : 100));

      // Wait for container to be ready
      if (!scannerContainerRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!scannerContainerRef.current) {
        throw new Error('Scanner container not found');
      }

      // Initialize html5-qrcode scanner directly with container element ID
      const containerId = scannerContainerRef.current.id;
      html5QrcodeScannerRef.current = new Html5Qrcode(containerId);

      // Get available cameras
      let videoInputDevices = [];
      try {
        videoInputDevices = await Html5Qrcode.getCameras();
        setAvailableCameras(videoInputDevices);
      } catch (e) {
        console.warn('getCameras failed:', e?.message);
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          videoInputDevices = devices
            .filter(device => device.kind === 'videoinput')
            .map(device => ({ id: device.deviceId, label: device.label }));
          setAvailableCameras(videoInputDevices);
        } catch (enumError) {
          console.warn('Manual enumeration failed:', enumError?.message);
        }
      }
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Select camera
      let selectedDeviceId = deviceId;
      if (!selectedDeviceId && videoInputDevices.length > 0) {
        if (isMobile) {
          const backCamera = videoInputDevices.find(device => {
            const label = (device.label || '').toLowerCase();
            return /back|rear|environment/i.test(label);
          });
          selectedDeviceId = backCamera ? backCamera.id : videoInputDevices[0].id;
        } else {
          selectedDeviceId = videoInputDevices[0].id;
        }
      }

      // Update camera index
      const currentIndex = videoInputDevices.findIndex(cam => cam.id === selectedDeviceId);
      if (currentIndex !== -1) {
        setCurrentCameraIndex(currentIndex);
        const isBack = /back|environment|rear/i.test(videoInputDevices[currentIndex].label || '');
        setIsUsingBackCamera(isBack);
      }

      // Simple, direct configuration
      const config = {
        fps: isMobile ? 10 : 20,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      };

      // Start scanning - use deviceId string directly
      await html5QrcodeScannerRef.current.start(
        selectedDeviceId,
        config,
        (decodedText) => {
          console.log('QR code detected:', decodedText);
          handleScanSuccess(decodedText);
        },
        () => {
          // Ignore scanning errors
        }
      );

      setScannerReady(true);
    } catch (err) {
      console.error('Scanner initialization error:', err);
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        setError('Camera blocked on HTTP. Please use HTTPS.');
      } else {
        setError(err.message || 'Failed to initialize camera');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchCamera = async () => {
    if (availableCameras.length <= 1) {
      toastService.warning('Only one camera available');
      return;
    }

    // Stop current scanner completely
    stopScanner();
    
    // Wait longer on mobile for tracks to fully stop and prevent setPhotoOptions errors
    await new Promise(resolve => setTimeout(resolve, isMobile ? 300 : 200));

    // Toggle to next camera
    const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];
    
    setCurrentCameraIndex(nextIndex);
    const isBack = /back|environment|rear/i.test(nextCamera.label || '');
    setIsUsingBackCamera(isBack);
    
    // Reinitialize scanner with new camera
    setLoading(true);
    try {
      await initializeScanner(nextCamera.id);
    } catch (error) {
      console.error('Error switching camera:', error);
      setError('Failed to switch camera. Please try again.');
      setLoading(false);
    }
  };

  const stopScanner = () => {
    // Create a completely isolated cleanup function that can't throw errors to React
    const safeStop = async () => {
      try {
        // Stop html5-qrcode scanner
        if (html5QrcodeScannerRef.current) {
          try {
            // html5-qrcode handles camera cleanup internally
            await html5QrcodeScannerRef.current.stop();
          } catch (e) {
            // Ignore stop errors - scanner might already be stopped
          }
          try {
            // Clear the scanner instance
            html5QrcodeScannerRef.current.clear();
          } catch (e) {
            // Ignore clear errors
          }
          html5QrcodeScannerRef.current = null;
        }
        
        // Use setTimeout to avoid synchronous state updates during cleanup
        setTimeout(() => {
          try {
            setScannerReady(false);
          } catch (e) {
            // Ignore state errors
          }
        }, 0);
      } catch (e) {
        // Ultimate safety net - ignore everything
        try {
          setTimeout(() => {
            try {
              setScannerReady(false);
            } catch (e2) {
              // Ignore
            }
          }, 0);
        } catch (e3) {
          // Ignore
        }
      }
    };

    // Execute cleanup in a way that completely isolates errors
    // Use requestAnimationFrame or setTimeout to ensure async execution
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            safeStop();
          } catch (e) {
            // Errors are completely swallowed here
          }
        }, 10);
      });
    } else {
      setTimeout(() => {
        try {
          safeStop();
        } catch (e) {
          // Errors are completely swallowed here
        }
      }, 50);
    }
  };

  const handleScanSuccess = async (qrText) => {
    try {
      console.log('QR code scanned, raw text:', qrText);
      
      // Show scanning status
      setError(null); // Clear any previous errors
      setLoading(true);
      
      // Parse and validate QR code
      const validation = QRCodeService.parseQRCode(qrText);
      console.log('QR code validation result:', validation);
      
      if (validation.valid) {
        // Stop scanner with a delay to allow current frame processing to complete
        // Longer delay on mobile to prevent setPhotoOptions errors
        setTimeout(() => {
          stopScanner();
        }, isMobile ? 200 : 100);
        
        // Process benefit claim
        try {
          const requestData = {
            memberId: validation.data.memberId || validation.data.userID,
            pwdId: validation.data.pwdId || validation.data.pwd_id,
            // Include QR code hash for verification (if available)
            qrCodeHash: validation.data.qrCodeHash || validation.data.qr_code_hash
          };
          
          console.log('Sending claim request:', requestData);
          
          // If a benefit is selected, only claim that specific benefit
          if (selectedBenefitId) {
            requestData.benefitID = selectedBenefitId;
          }
          
          const response = await api.post('/qr-scan/claim-benefits', requestData);
          console.log('Claim response:', response);
          
          if (response.success) {
            // Enhanced success message with more details
            const benefitsClaimed = response.benefitsClaimed || 0;
            const memberName = response.member ? `${response.member.firstName} ${response.member.lastName}` : 'Member';
            const benefitNames = response.benefits && response.benefits.length > 0
              ? response.benefits.map(b => b.title || b.type || 'Benefit').join(', ')
              : '';
            
            let successMessage = `✅ Success! ${benefitsClaimed} benefit(s) claimed for ${memberName}`;
            if (benefitNames && benefitsClaimed > 0) {
              successMessage += `\n\nBenefits: ${benefitNames}`;
            }
            
            // Show green success toast
            toastService.success(successMessage, 5000);
            
            if (onScanSuccess) {
              onScanSuccess({
                ...validation.data,
                member: response.member,
                benefits: response.benefits || [],
                benefitsClaimed: benefitsClaimed
              });
            }
            // Close scanner after successful claim
            setTimeout(() => {
              handleClose();
            }, 2500);
          } else if (response.error) {
            const errorMsg = response.error || 'Failed to claim benefits';
            
            // Build user-friendly error message
            let userFriendlyMsg = errorMsg;
            if (response.debug) {
              // Provide specific guidance based on debug info
              if (response.debug.dateEligible === false) {
                if (response.debug.distributionDate && response.debug.distributionDate !== 'N/A') {
                  const distDate = new Date(response.debug.distributionDate);
                  const today = new Date();
                  if (distDate > today) {
                    userFriendlyMsg = `This benefit is not yet available. Distribution starts on ${distDate.toLocaleDateString()}.`;
                  }
                }
                if (response.debug.expiryDate && response.debug.expiryDate !== 'N/A') {
                  const expDate = new Date(response.debug.expiryDate);
                  const today = new Date();
                  if (expDate < today) {
                    userFriendlyMsg = `This benefit has expired. Expiry date was ${expDate.toLocaleDateString()}.`;
                  }
                }
              }
              if (response.debug.barangayEligible === false && !userFriendlyMsg.includes('not yet available') && !userFriendlyMsg.includes('expired')) {
                userFriendlyMsg = 'Member is not eligible for this benefit due to barangay restrictions.';
              }
            }
            
            // Build debug info if available (for developers)
            const debugInfo = response.debug ? `\n\nDebug Info:\n${JSON.stringify(response.debug, null, 2)}` : '';
            console.error('Claim error:', errorMsg, response.debug);
            setError(`${userFriendlyMsg}${debugInfo}`);
            toastService.error(userFriendlyMsg);
            if (onScanError) {
              onScanError(new Error(userFriendlyMsg));
            }
          } else {
            // Response doesn't have success or error - might be a different format
            console.warn('Unexpected response format:', response);
            const errorMsg = 'Unexpected response from server. Please check console for details.';
            setError(errorMsg);
            toastService.error(errorMsg);
            if (onScanError) {
              onScanError(new Error('Unexpected response format'));
            }
          }
        } catch (apiError) {
          console.error('Error claiming benefits:', apiError);
          
          // Handle different error formats from API service
          let errorMsg = 'Failed to claim benefits. Please try again.';
          let errorData = null;
          
          // API service throws errors with error.data or error.message
          if (apiError.data) {
            errorData = apiError.data;
            // Check for validation errors
            if (errorData.errors) {
              const validationErrors = Object.values(errorData.errors).flat();
              errorMsg = validationErrors.join(', ') || 'Validation error';
            } else if (errorData.error) {
              errorMsg = errorData.error;
            } else if (errorData.message) {
              errorMsg = errorData.message;
            }
          } else if (apiError.message) {
            errorMsg = apiError.message;
          }
          
          // Check for specific error status codes
          if (apiError.status === 404) {
            errorMsg = 'Member not found. Please ensure the QR code is valid.';
          } else if (apiError.status === 403) {
            errorMsg = errorData?.error || 'Invalid QR code or unauthorized access.';
          } else if (apiError.status === 400) {
            errorMsg = errorData?.error || errorMsg;
          }
          
          const fullError = `${errorMsg}\n\nRaw Error: ${JSON.stringify(errorData || apiError, null, 2)}`;
          setError(fullError);
          toastService.error(errorMsg);
          if (onScanError) {
            onScanError(new Error(errorMsg));
          }
        } finally {
          setLoading(false);
        }
      } else {
        const errorMsg = validation.error || 'Invalid QR code format';
        console.error('QR code validation failed:', errorMsg);
        setError(`QR Code Validation Failed:\n${errorMsg}\n\nScanned Text: ${qrText.substring(0, 100)}${qrText.length > 100 ? '...' : ''}`);
        toastService.error(errorMsg);
        setTimeout(() => {
          setError(null);
          setLoading(false);
        }, 5000);
      }
    } catch (err) {
      console.error('QR code processing error:', err);
      const errorMsg = err.message || 'Invalid QR code format';
      setError(`Processing Error:\n${errorMsg}\n\nFull Error: ${JSON.stringify(err, null, 2)}`);
      toastService.error(errorMsg);
      setTimeout(() => {
        setError(null);
        setLoading(false);
      }, 5000);
    }
  };

  const handleClose = () => {
    // Stop scanner with error suppression
    try {
      stopScanner();
    } catch (e) {
      // Ignore any errors during cleanup
    }
    setError(null);
    setShowBenefitSelection(true);
    setSelectedBenefitId('');
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    initializeScanner();
  };

  return (
    <>
      {/* Benefit Selection Modal - Shows First */}
      <Dialog
        open={open && showBenefitSelection}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#E67E22',
          color: 'white',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              🎁 Select Benefit to Claim
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, color: '#2C3E50' }}>
            Please select a benefit to claim before scanning the QR code. You can choose "All Eligible Benefits" to claim all available benefits for the member.
          </Typography>

          {!benefitsLoaded ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                Loading benefits...
              </Typography>
            </Box>
          ) : (
            <FormControl fullWidth sx={{ 
              bgcolor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                color: '#2C3E50',
                bgcolor: 'white',
                fontSize: '1rem',
                '& fieldset': {
                  borderColor: '#E67E22',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: '#D35400',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#E67E22',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#7F8C8D',
                fontSize: '1rem',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#E67E22',
              },
            }}>
              <InputLabel id="benefit-select-label">Choose Benefit</InputLabel>
              <Select
                labelId="benefit-select-label"
                id="benefit-select"
                value={selectedBenefitId}
                label="Choose Benefit"
                onChange={(e) => setSelectedBenefitId(e.target.value)}
                disabled={loading}
                sx={{
                  bgcolor: 'white',
                  fontSize: '1rem',
                  '& .MuiSelect-select': {
                    bgcolor: 'white',
                    py: 1.5,
                  }
                }}
              >
                <MenuItem value="">
                  <em>All Eligible Benefits (Default)</em>
                </MenuItem>
                {allActiveBenefits.length > 0 ? (
                  allActiveBenefits.map((benefit) => (
                    <MenuItem key={benefit.id} value={benefit.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                        <Typography variant="body1" sx={{ color: '#2C3E50', fontWeight: 600 }}>
                          {benefit.title || benefit.type || benefit.benefitType || 'Benefit'}
                        </Typography>
                        {benefit.amount && (
                          <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                            Amount: ₱{benefit.amount.toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <Typography variant="body2" sx={{ color: '#7F8C8D', fontStyle: 'italic' }}>
                      No active benefits available
                    </Typography>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          )}

          {selectedBenefitId && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#FFF8F0', borderRadius: 1, border: '1px solid #E67E22' }}>
              <Typography variant="body2" sx={{ color: '#E67E22', fontWeight: 600, mb: 0.5 }}>
                ⚠️ Selected Benefit:
              </Typography>
              <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                {allActiveBenefits.find(b => b.id === selectedBenefitId)?.title || 
                 allActiveBenefits.find(b => b.id === selectedBenefitId)?.type || 
                 'Selected Benefit'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#7F8C8D', display: 'block', mt: 1 }}>
                Only this benefit will be claimed when the QR code is scanned.
              </Typography>
            </Box>
          )}

          {!selectedBenefitId && benefitsLoaded && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#F0F8FF', borderRadius: 1, border: '1px solid #3498DB' }}>
              <Typography variant="body2" sx={{ color: '#3498DB', fontWeight: 600, mb: 0.5 }}>
                ℹ️ Default Selection:
              </Typography>
              <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                All eligible benefits will be claimed for the member when the QR code is scanned.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: '#7F8C8D',
              color: '#7F8C8D',
              '&:hover': {
                borderColor: '#5D6D7E',
                backgroundColor: 'rgba(127, 140, 141, 0.1)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartScanning}
            variant="contained"
            disabled={!benefitsLoaded}
            sx={{
              bgcolor: '#E67E22',
              '&:hover': { bgcolor: '#D35400' },
              px: 4
            }}
          >
            Start Scanning QR Code
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Scanner Modal - Shows After Benefit Selection */}
      <Dialog
        open={open && !showBenefitSelection}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#1a1a1a'
          }
        }}
      >
      <DialogTitle sx={{ 
        bgcolor: '#2C3E50', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ScannerIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Scan PWD Member QR Code
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#1a1a1a' }}>
        <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
          {/* Container for html5-qrcode scanner - it creates its own video element */}
          <div
            ref={scannerContainerRef}
            id="qr-scanner-container"
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#000'
            }}
          />
          
          {/* Loading overlay */}
          {loading && (
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 2
            }}>
              <CircularProgress sx={{ color: '#3498DB' }} />
              <Typography variant="body2" sx={{ color: 'white', mt: 2, textAlign: 'center' }}>
                Initializing camera...
              </Typography>
            </Box>
          )}

          {/* Camera not ready overlay */}
          {!loading && !scannerReady && (
            <Box sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center', 
              color: 'white',
              zIndex: 2
            }}>
              <CameraIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="body1" sx={{ opacity: 0.7 }}>
                Camera not ready
              </Typography>
            </Box>
          )}

          {/* Scanning overlay */}
          {scannerReady && (
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              border: '2px solid #3498DB',
              borderRadius: 2,
              zIndex: 1,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                border: '2px solid rgba(52, 152, 219, 0.3)',
                borderRadius: 2,
                animation: 'pulse 2s infinite'
              }
            }} />
          )}

          {/* Error overlay */}
          {error && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
              p: 2
            }}>
              <Alert 
                severity="error" 
                sx={{ 
                  maxWidth: '90%',
                  maxHeight: '80%',
                  overflow: 'auto',
                  '& .MuiAlert-message': {
                    width: '100%',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '0.875rem'
                  }
                }}
                action={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={handleRetry}
                      sx={{ mb: 1 }}
                    >
                      Retry
                    </Button>
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={() => setError(null)}
                    >
                      Dismiss
                    </Button>
                  </Box>
                }
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Error Details:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.75rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {error}
                </Typography>
              </Alert>
            </Box>
          )}
        </Box>

        {/* Instructions */}
        <Box sx={{ p: 2, bgcolor: '#2C3E50', color: 'white' }}>
          <Typography variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
            <strong>Instructions:</strong>
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '0.85rem' }}>
            Point your camera at the PWD member's QR code to scan for benefit claims
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ bgcolor: '#2C3E50', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Switch Camera Button */}
          {scannerReady && availableCameras.length > 1 && (
            <IconButton
              onClick={switchCamera}
              disabled={loading}
              sx={{
                bgcolor: '#3498DB',
                color: 'white',
                '&:hover': { bgcolor: '#2980B9' },
                '&:disabled': { bgcolor: '#7F8C8D', opacity: 0.6 },
                mr: 1
              }}
              title={isUsingBackCamera ? 'Switch to Front Camera' : 'Switch to Back Camera'}
            >
              <FlipCameraIcon />
            </IconButton>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              color: '#BDC3C7',
              '&:hover': { bgcolor: 'rgba(189, 195, 199, 0.1)' }
            }}
          >
            Cancel
          </Button>
          {error && (
            <Button 
              onClick={handleRetry}
              variant="contained"
              sx={{ 
                bgcolor: '#3498DB',
                '&:hover': { bgcolor: '#2980B9' }
              }}
            >
              Retry Scan
            </Button>
          )}
        </Box>
      </DialogActions>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </Dialog>
    </>
  );
};

export default QRScanner;
