// src/components/shared/MobileQRScanner.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert,
  useMediaQuery,
  useTheme,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions
} from '@mui/material';
import { 
  QrCodeScanner, 
  Close, 
  FlashOn, 
  FlashOff,
  CameraAlt 
} from '@mui/icons-material';
import QrScanner from 'qr-scanner';

const MobileQRScanner = ({ 
  onScan, 
  onError,
  onClose,
  open = false,
  title = "Scan QR Code"
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    if (open && videoRef.current) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open]);

  const startScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error('No camera found');
      }

      // Check if flash is available
      const cameras = await QrScanner.listCameras();
      const backCamera = cameras.find(camera => camera.label.toLowerCase().includes('back'));
      if (backCamera) {
        setHasFlash(true);
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result);
          onScan?.(result);
          stopScanner();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
          maxScansPerSecond: 5,
        }
      );

      await qrScannerRef.current.start();
    } catch (err) {
      console.error('QR Scanner error:', err);
      setError(err.message);
      onError?.(err);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleFlash = async () => {
    if (qrScannerRef.current && hasFlash) {
      try {
        await qrScannerRef.current.toggleFlash();
        setFlashOn(!flashOn);
      } catch (err) {
        console.error('Flash toggle error:', err);
      }
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: isMobile ? 0 : 2,
          margin: isMobile ? 0 : '32px',
          maxHeight: isMobile ? '100vh' : 'calc(100vh - 64px)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <Box sx={{ 
          position: 'relative',
          width: '100%',
          height: isMobile ? 'calc(100vh - 120px)' : '400px',
          backgroundColor: '#000',
          borderRadius: isMobile ? 0 : 1,
          overflow: 'hidden'
        }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            playsInline
            muted
          />

          {/* QR Code Overlay */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '250px' : '200px',
            height: isMobile ? '250px' : '200px',
            border: '2px solid #4CAF50',
            borderRadius: 2,
            backgroundColor: 'transparent',
            pointerEvents: 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              border: '2px solid rgba(76, 175, 80, 0.3)',
              borderRadius: 2,
              animation: 'pulse 2s infinite',
            }
          }} />

          {/* Flash Toggle Button */}
          {hasFlash && (
            <IconButton
              onClick={toggleFlash}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                }
              }}
            >
              {flashOn ? <FlashOff /> : <FlashOn />}
            </IconButton>
          )}

          {/* Instructions */}
          <Box sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              Position QR code within the frame
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          startIcon={<Close />}
          sx={{ minWidth: 120 }}
        >
          Close
        </Button>
      </DialogActions>

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
  );
};

export default MobileQRScanner;
