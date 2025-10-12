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
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  QrCodeScanner as ScannerIcon,
  CameraAlt as CameraIcon
} from '@mui/icons-material';
import { BrowserMultiFormatReader } from '@zxing/browser';
import QRCodeService from '../../services/qrCodeService';

const QRScanner = ({ open, onClose, onScanSuccess, onScanError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannerReady, setScannerReady] = useState(false);
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  useEffect(() => {
    if (open) {
      initializeScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open]);

  const initializeScanner = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize ZXing reader
      readerRef.current = new BrowserMultiFormatReader();
      
      // Get available video devices
      const videoInputDevices = await readerRef.current.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Use the first available camera (usually the back camera on mobile)
      const selectedDeviceId = videoInputDevices[0].deviceId;

      // Start scanning
      await readerRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            handleScanSuccess(result.getText());
          } else if (error && !error.message.includes('No MultiFormat Readers')) {
            // Ignore continuous scanning errors, only show actual problems
            console.log('Scanning...', error.message);
          }
        }
      );

      setScannerReady(true);
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError(err.message || 'Failed to initialize camera');
    } finally {
      setLoading(false);
    }
  };

  const stopScanner = () => {
    if (readerRef.current) {
      // ZXing doesn't have a reset method, just set to null
      readerRef.current = null;
    }
    setScannerReady(false);
  };

  const handleScanSuccess = (qrText) => {
    try {
      // Parse and validate QR code
      const validation = QRCodeService.parseQRCode(qrText);
      
      if (validation.valid) {
        stopScanner();
        onScanSuccess(validation.data);
      } else {
        setError(validation.error);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('QR code processing error:', err);
      setError('Invalid QR code format');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleClose = () => {
    stopScanner();
    setError(null);
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    initializeScanner();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          {/* Video element for camera feed */}
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#000',
              objectFit: 'cover'
            }}
            autoPlay
            playsInline
            muted
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
              bgcolor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}>
              <Alert 
                severity="error" 
                sx={{ 
                  maxWidth: '300px',
                  '& .MuiAlert-message': {
                    textAlign: 'center'
                  }
                }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={handleRetry}
                    sx={{ ml: 1 }}
                  >
                    Retry
                  </Button>
                }
              >
                {error}
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

      <DialogActions sx={{ bgcolor: '#2C3E50', p: 2 }}>
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
      </DialogActions>

      {/* CSS Animation */}
      <style jsx>{`
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
  );
};

export default QRScanner;
