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
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  QrCodeScanner as ScannerIcon,
  CameraAlt as CameraIcon,
  FlipCameraAndroid as FlipCameraIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { Html5Qrcode } from 'html5-qrcode';
import QRCodeService from '../../services/qrCodeService';
import benefitService from '../../services/benefitService';
import toastService from '../../services/toastService';
import api from '../../services/api';
import pwdMemberService from '../../services/pwdMemberService';
import MobileCamera from '../shared/MobileCamera';

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
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isUsingBackCamera, setIsUsingBackCamera] = useState(true);
  const scannerContainerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);
  const isMobile = isMobileDevice(); // Detect mobile device
  
  // Claim modal states
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [scannedMemberData, setScannedMemberData] = useState(null);
  const [claimantType, setClaimantType] = useState('');
  const [claimantName, setClaimantName] = useState('');
  const [claimantRelation, setClaimantRelation] = useState('');
  const [authorizationLetter, setAuthorizationLetter] = useState(null);
  const [authorizationLetterPreview, setAuthorizationLetterPreview] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);

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

  // Fetch beneficiaries for selected benefit
  const fetchBeneficiaries = async (benefitId) => {
    if (!benefitId) {
      setBeneficiaries([]);
      return;
    }

    try {
      setLoadingBeneficiaries(true);
      const benefit = allActiveBenefits.find(b => b.id === benefitId);
      if (!benefit) {
        setBeneficiaries([]);
        return;
      }

      // Get all PWD members
      const response = await pwdMemberService.getAll();
      const candidates = [
        response?.data?.members,
        response?.members,
        response?.data,
        response
      ];
      const members = candidates.find((v) => Array.isArray(v)) || [];

      let filteredMembers = [];

      if (benefit.type === 'Financial Assistance') {
        // Filter by selected barangays
        const selectedBarangays = benefit.selectedBarangays || [];
        if (selectedBarangays.length > 0) {
          filteredMembers = members.filter(member => {
            const memberBarangay = (member.barangay || member.Barangay || '').toString().trim().toLowerCase();
            return selectedBarangays.some(b => 
              (b || '').toString().trim().toLowerCase() === memberBarangay
            );
          });
        } else {
          filteredMembers = members; // All members if no specific barangays
        }
      } else if (benefit.type === 'Birthday Cash Gift') {
        // Filter by quarter/month and barangay
        const quarterMonths = {
          'Q1': [1, 2, 3],
          'Q2': [4, 5, 6],
          'Q3': [7, 8, 9],
          'Q4': [10, 11, 12]
        };
        
        const eligibleMonths = benefit.birthdayMonth ? quarterMonths[benefit.birthdayMonth] : [];
        
        filteredMembers = members.filter(member => {
          if (!member.birthDate) return false;
          const birthMonth = new Date(member.birthDate).getMonth() + 1;
          const quarterMatch = eligibleMonths.length === 0 || eligibleMonths.includes(birthMonth);

          // Check barangay if specified
          if (benefit.barangay && benefit.barangay !== 'All Barangays') {
            const memberBarangay = (member.barangay || member.Barangay || '').toString().trim().toLowerCase();
            return quarterMatch && memberBarangay === benefit.barangay.toString().trim().toLowerCase();
          }

          return quarterMatch;
        });
      } else {
        // For other types, show all members or filter by barangay
        if (benefit.barangay && benefit.barangay !== 'All Barangays') {
          filteredMembers = members.filter(member => {
            const memberBarangay = (member.barangay || member.Barangay || '').toString().trim().toLowerCase();
            return memberBarangay === benefit.barangay.toString().trim().toLowerCase();
          });
        } else {
          filteredMembers = members;
        }
      }

      setBeneficiaries(filteredMembers);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      setBeneficiaries([]);
      toastService.error('Failed to load beneficiaries');
    } finally {
      setLoadingBeneficiaries(false);
    }
  };

  // Fetch beneficiaries when benefit is selected
  useEffect(() => {
    if (selectedBenefitId && allActiveBenefits.length > 0) {
      fetchBeneficiaries(selectedBenefitId);
    } else {
      setBeneficiaries([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBenefitId]);

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
        qrbox: { width: 350, height: 350 },
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
      
      // Parse and validate QR code (handles encrypted QR codes)
      const validation = await QRCodeService.parseQRCode(qrText);
      console.log('QR code validation result:', validation);
      
      if (validation.valid) {
        // Stop scanner with a delay to allow current frame processing to complete
        // Longer delay on mobile to prevent setPhotoOptions errors
        setTimeout(() => {
          stopScanner();
        }, isMobile ? 200 : 100);
        
        // Store scanned member data and show claim modal
        // Extract memberId (should be userID)
        const memberId = validation.data.memberId || validation.data.userID;
        // Extract pwdId (should be database id, fallback to pwd_id if needed)
        let pwdId = validation.data.pwdId || validation.data.pwd_id;
        // If pwdId is still undefined, try to get it from pwd_id
        if (!pwdId && validation.data.pwd_id) {
          pwdId = validation.data.pwd_id;
        }
        // If still undefined, use memberId as fallback (but this shouldn't happen)
        if (!pwdId) {
          pwdId = memberId;
        }
        
        console.log('QR Code scanned data:', {
          validationData: validation.data,
          extractedMemberId: memberId,
          extractedPwdId: pwdId
        });
        
        // Check if this is an ID QR code (not a benefit claim QR code)
        const isIDQRCode = validation.data.type === 'PWD_ID';
        
        setScannedMemberData({
          memberId: memberId,
          pwdId: pwdId,
          qrCodeHash: validation.data.qrCodeHash || validation.data.qr_code_hash || validation.data.checksum || '',
          qrCodeType: validation.data.type || 'PWD_BENEFIT_CLAIM',
          isIDQRCode: isIDQRCode
        });
        
        // For ID QR codes, don't show claim modal - just display ID number
        if (isIDQRCode) {
          const idNumber = pwdId || validation.data.pwdId || validation.data.pwd_id || memberId;
          toastService.success(`ID Number: ${idNumber}`);
          setLoading(false);
          // Close scanner after showing ID
          setTimeout(() => {
            handleClose();
          }, 2000);
        } else {
          // For benefit claim QR codes, show claim modal
          setShowClaimModal(true);
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
    setShowClaimModal(false);
    setScannedMemberData(null);
    setClaimantType('');
    setClaimantName('');
    setClaimantRelation('');
    setAuthorizationLetter(null);
    setAuthorizationLetterPreview(null);
    onClose();
  };

  const handleClaimSubmit = async () => {
    // Don't process ID QR codes as benefit claims
    if (scannedMemberData?.isIDQRCode) {
      setShowClaimModal(false);
      return;
    }
    
    if (!claimantType) {
      toastService.error('Please select who will be claiming the card');
      return;
    }

    if (claimantType === 'Others' && (!claimantName || !claimantRelation || !authorizationLetter)) {
      toastService.error('Please fill in all fields and take a picture of the authorization letter');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare request data
      const requestData = {
        memberId: scannedMemberData.memberId,
        pwdId: scannedMemberData.pwdId,
        qrCodeHash: scannedMemberData.qrCodeHash || scannedMemberData.checksum || '',
        claimantType: claimantType,
        claimantName: claimantType === 'Others' ? claimantName : null,
        claimantRelation: claimantType === 'Others' ? claimantRelation : null
      };

      // If a benefit is selected, only claim that specific benefit
      if (selectedBenefitId) {
        requestData.benefitID = selectedBenefitId;
      }

      // Create FormData if authorization letter exists
      let formData = null;
      if (authorizationLetter) {
        formData = new FormData();
        Object.keys(requestData).forEach(key => {
          const value = requestData[key];
          // Always append, even if null or empty string
          formData.append(key, value !== null && value !== undefined ? value : '');
        });
        formData.append('authorizationLetter', authorizationLetter);
      }

      console.log('Sending claim request:', {
        ...requestData,
        scannedMemberData: scannedMemberData
      });
      
      const response = formData 
        ? await api.post('/qr-scan/claim-benefits', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        : await api.post('/qr-scan/claim-benefits', requestData);
      
      console.log('Claim response:', response);

      if (response.success) {
        // Check for duplicate errors first
        if (response.duplicate_errors && response.duplicate_errors.length > 0) {
          // Show warning about duplicates
          const duplicateMessages = response.duplicate_errors.map(err => 
            `${err.benefit_title}: ${err.message}`
          ).join('\n');
          
          toastService.warning(
            response.warning || 'Some benefits could not be claimed due to duplicates.\n' + duplicateMessages,
            8000
          );
        }
        
        // Enhanced success message with more details
        const benefitsClaimed = response.benefitsClaimed || 0;
        // For ID QR codes, don't show personal details
        let successMessage;
        if (scannedMemberData.isIDQRCode) {
          const idNumber = scannedMemberData.pwdId || scannedMemberData.memberId;
          successMessage = `✅ ID Number: ${idNumber}`;
        } else {
          const memberName = response.member ? `${response.member.firstName} ${response.member.lastName}` : 'Member';
          const benefitNames = response.benefits && response.benefits.length > 0
            ? response.benefits.map(b => b.title || b.type || 'Benefit').join(', ')
            : '';
          
          if (benefitsClaimed > 0) {
            successMessage = `✅ Success! ${benefitsClaimed} benefit(s) claimed for ${memberName}`;
            if (benefitNames) {
              successMessage += `\n\nBenefits: ${benefitNames}`;
            }
          } else {
            // No benefits were claimed (all were duplicates)
            successMessage = `⚠️ No new benefits were claimed. All selected benefits have already been claimed.`;
          }
        }
        
        // Show success/warning toast
        if (benefitsClaimed > 0) {
          toastService.success(successMessage, 5000);
        } else {
          toastService.warning(successMessage, 5000);
        }
        
        if (onScanSuccess && benefitsClaimed > 0) {
          onScanSuccess({
            ...scannedMemberData,
            member: response.member,
            benefits: response.benefits || [],
            benefitsClaimed: benefitsClaimed
          });
        }
        
        // Close modal and scanner after claim attempt
        setShowClaimModal(false);
        setTimeout(() => {
          handleClose();
        }, 2500);
      } else if (response.error) {
        // Handle different error types
        let errorMsg = response.error || 'Failed to claim benefits';
        
        // Handle date validation errors
        if (response.error_type === 'not_scheduled' || response.error_type === 'expired' || response.error_type === 'date_validation_failed') {
          // Show user-friendly date validation error
          if (response.date_errors && response.date_errors.length > 0) {
            const dateErrorDetails = response.date_errors.map(err => 
              `• ${err.benefit_title}: ${err.error}`
            ).join('\n');
            errorMsg = `${errorMsg}\n\n${dateErrorDetails}`;
          } else if (response.distribution_date || response.expiry_date) {
            // Single benefit date error
            errorMsg = response.error;
          }
          
          toastService.error(errorMsg, 10000); // Show longer for date errors
          setError(errorMsg);
        } else if (response.duplicate_errors && response.duplicate_errors.length > 0) {
          // Handle duplicate error (409 Conflict)
          const duplicateDetails = response.duplicate_errors.map(err => 
            `• ${err.benefit_title}: Already claimed on ${err.previous_claim_date || 'Unknown date'}`
          ).join('\n');
          
          errorMsg = `${errorMsg}\n\n${duplicateDetails}`;
          toastService.error(errorMsg, 8000);
          setError(errorMsg);
        } else {
          // Generic error
          toastService.error(errorMsg, 8000);
          setError(errorMsg);
        }
      } else {
        const errorMsg = 'Unexpected response from server. Please check console for details.';
        setError(errorMsg);
        toastService.error(errorMsg);
      }
    } catch (apiError) {
      console.error('Error claiming benefits:', apiError);
      let errorMsg = 'Failed to claim benefits. Please try again.';
      if (apiError.data?.error) {
        errorMsg = apiError.data.error;
      } else if (apiError.message) {
        errorMsg = apiError.message;
      }
      setError(errorMsg);
      toastService.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraCapture = (file) => {
    setAuthorizationLetter(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAuthorizationLetterPreview(reader.result);
    };
    reader.readAsDataURL(file);
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
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            bgcolor: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#FFFFFF',
          color: '#2C3E50',
          fontWeight: 600,
          borderBottom: '1px solid #E0E0E0',
          pb: 2,
          pt: 3,
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50' }}>
              🎁 Select Benefit to Claim
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{ 
              color: '#7F8C8D',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                color: '#2C3E50'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: '#FFFFFF' }}>
          <Typography variant="body1" sx={{ mb: 3, color: '#2C3E50', lineHeight: 1.6 }}>
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
                  borderColor: '#E0E0E0',
                  borderWidth: 1,
                },
                '&:hover fieldset': {
                  borderColor: '#0b87ac',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#0b87ac',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root': {
                color: '#7F8C8D',
                fontSize: '1rem',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#0b87ac',
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
            <>
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: '#F8F9FA', 
                borderRadius: 1, 
                border: '1px solid #E0E0E0',
                borderLeft: '4px solid #0b87ac'
              }}>
                <Typography variant="body2" sx={{ color: '#0b87ac', fontWeight: 600, mb: 0.5 }}>
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

              {/* Beneficiaries Table */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50', fontSize: '1.1rem' }}>
                  Eligible Beneficiaries
                </Typography>
                {loadingBeneficiaries ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={40} sx={{ color: '#0b87ac' }} />
                  </Box>
                ) : beneficiaries.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4, 
                    bgcolor: '#F8F9FA', 
                    borderRadius: 2, 
                    border: '2px dashed #E0E0E0' 
                  }}>
                    <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                      No eligible beneficiaries found for this benefit.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ 
                    border: '1px solid #E0E0E0', 
                    borderRadius: 2,
                    maxHeight: 400,
                    overflow: 'auto'
                  }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                          <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.875rem' }}>
                            #
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.875rem' }}>
                            PWD ID
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.875rem' }}>
                            Full Name
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.875rem' }}>
                            Barangay
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.875rem' }}>
                            Disability Type
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {beneficiaries.map((member, index) => (
                          <TableRow 
                            key={member.id || member.userID || index}
                            sx={{ 
                              '&:hover': { bgcolor: '#F8F9FA' },
                              '&:nth-of-type(even)': { bgcolor: '#FAFAFA' }
                            }}
                          >
                            <TableCell sx={{ color: '#2C3E50', fontSize: '0.875rem' }}>
                              {index + 1}
                            </TableCell>
                            <TableCell sx={{ color: '#2C3E50', fontSize: '0.875rem', fontWeight: 500 }}>
                              {member.pwd_id || (member.userID ? `PWD-${member.userID}` : 'Not assigned')}
                            </TableCell>
                            <TableCell sx={{ color: '#2C3E50', fontSize: '0.875rem' }}>
                              {(() => {
                                const parts = [];
                                if (member.firstName) parts.push(member.firstName);
                                if (member.middleName && member.middleName.trim().toUpperCase() !== 'N/A') parts.push(member.middleName);
                                if (member.lastName) parts.push(member.lastName);
                                if (member.suffix) parts.push(member.suffix);
                                return parts.join(' ').trim() || 'Name not provided';
                              })()}
                            </TableCell>
                            <TableCell sx={{ color: '#2C3E50', fontSize: '0.875rem' }}>
                              {member.barangay || member.Barangay || 'Not specified'}
                            </TableCell>
                            <TableCell sx={{ color: '#2C3E50', fontSize: '0.875rem' }}>
                              {member.disabilityType || 'Not specified'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                {beneficiaries.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#E8F4FD', borderRadius: 2, border: '1px solid #0b87ac' }}>
                    <Typography variant="body2" sx={{ color: '#0b87ac', fontWeight: 600, textAlign: 'center' }}>
                      📊 Total Eligible Beneficiaries: {beneficiaries.length}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}

          {!selectedBenefitId && benefitsLoaded && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: '#F8F9FA', 
              borderRadius: 1, 
              border: '1px solid #E0E0E0',
              borderLeft: '4px solid #0b87ac'
            }}>
              <Typography variant="body2" sx={{ color: '#0b87ac', fontWeight: 600, mb: 0.5 }}>
                ℹ️ Default Selection:
              </Typography>
              <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                All eligible benefits will be claimed for the member when the QR code is scanned.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E0E0E0',
          gap: 1
        }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: '#E0E0E0',
              color: '#2C3E50',
              textTransform: 'none',
              fontWeight: 500,
              px: 3,
              '&:hover': {
                borderColor: '#7F8C8D',
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
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
              bgcolor: '#0b87ac',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              '&:hover': { 
                bgcolor: '#0a7699'
              },
              '&:disabled': {
                bgcolor: '#E0E0E0',
                color: '#7F8C8D'
              }
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
              width: '350px',
              height: '350px',
              maxWidth: '90%',
              maxHeight: '90%',
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

      {/* Claim Modal - Shows After QR Scan */}
      <Dialog
        open={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            bgcolor: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#FFFFFF',
          color: '#2C3E50',
          fontWeight: 600,
          borderBottom: '1px solid #E0E0E0',
          pb: 2,
          pt: 3,
          px: 3
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50' }}>
            {scannedMemberData?.isIDQRCode ? 'ID Number' : 'Who Will Be Claiming the Card?'}
          </Typography>
          <IconButton 
            onClick={() => setShowClaimModal(false)}
            size="small"
            sx={{ 
              color: '#7F8C8D',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                color: '#2C3E50'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: '#FFFFFF' }}>
          {scannedMemberData?.isIDQRCode ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              px: 2
            }}>
              <Typography variant="h4" sx={{ 
                color: '#0b87ac', 
                fontWeight: 700, 
                mb: 2,
                fontFamily: 'monospace',
                letterSpacing: '2px'
              }}>
                {scannedMemberData.pwdId || scannedMemberData.memberId || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#7F8C8D', mt: 2 }}>
                This is the PWD ID Number from the scanned QR code.
              </Typography>
            </Box>
          ) : (
            <>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="claimant-type-label">Claimant Type</InputLabel>
            <Select
              labelId="claimant-type-label"
              id="claimant-type"
              value={claimantType}
              label="Claimant Type"
              onChange={(e) => setClaimantType(e.target.value)}
              sx={{
                bgcolor: 'white',
                fontSize: '1rem',
                '& .MuiSelect-select': {
                  bgcolor: 'white',
                  py: 1.5,
                }
              }}
            >
              <MenuItem value="Member">Member</MenuItem>
              <MenuItem value="Guardian">Guardian</MenuItem>
              <MenuItem value="Others">Others</MenuItem>
            </Select>
          </FormControl>

          {claimantType === 'Others' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Relation"
                value={claimantRelation}
                onChange={(e) => setClaimantRelation(e.target.value)}
                sx={{ mb: 2 }}
                required
                placeholder="e.g., Brother, Sister, Friend"
              />
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  onClick={() => setCameraOpen(true)}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderColor: authorizationLetter ? '#4CAF50' : '#E0E0E0',
                    color: authorizationLetter ? '#4CAF50' : '#2C3E50',
                    '&:hover': {
                      borderColor: '#0b87ac',
                      bgcolor: 'rgba(11, 135, 172, 0.04)'
                    }
                  }}
                >
                  {authorizationLetter ? 'Authorization Letter Captured' : 'Take Picture of Authorization Letter'}
                </Button>
              </Box>

              {authorizationLetterPreview && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  border: '1px solid #E0E0E0', 
                  borderRadius: 1,
                  textAlign: 'center'
                }}>
                  <img 
                    src={authorizationLetterPreview} 
                    alt="Authorization Letter Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px',
                      borderRadius: '4px'
                    }} 
                  />
                  <Button
                    size="small"
                    onClick={() => {
                      setAuthorizationLetter(null);
                      setAuthorizationLetterPreview(null);
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
          )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E0E0E0',
          gap: 1
        }}>
          {scannedMemberData?.isIDQRCode ? (
            <Button
              onClick={() => setShowClaimModal(false)}
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#0b87ac',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                '&:hover': { 
                  bgcolor: '#0a7699'
                }
              }}
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setShowClaimModal(false)}
                variant="outlined"
                sx={{
                  borderColor: '#E0E0E0',
                  color: '#2C3E50',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  '&:hover': {
                    borderColor: '#7F8C8D',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleClaimSubmit}
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: '#0b87ac',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  '&:hover': { 
                    bgcolor: '#0a7699'
                  },
                  '&:disabled': {
                    bgcolor: '#E0E0E0',
                    color: '#7F8C8D'
                  }
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit Claim'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Camera Dialog for Authorization Letter */}
      <MobileCamera
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
        onError={(err) => {
          console.error('Camera error:', err);
          toastService.error('Failed to access camera. Please try again.');
        }}
        title="Take Picture of Authorization Letter"
      />
    </>
  );
};

export default QRScanner;
