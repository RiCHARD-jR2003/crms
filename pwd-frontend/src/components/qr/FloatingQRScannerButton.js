import React, { useState } from 'react';
import {
  Fab,
  Tooltip,
  Box
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon
} from '@mui/icons-material';
import QRScanner from './QRScanner';

const FloatingQRScannerButton = ({ onScanSuccess, onScanError }) => {
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleScanSuccess = (qrData) => {
    setScannerOpen(false);
    if (onScanSuccess) {
      onScanSuccess(qrData);
    }
  };

  const handleScanError = (error) => {
    if (onScanError) {
      onScanError(error);
    }
  };

  const handleOpenScanner = () => {
    setScannerOpen(true);
  };

  const handleCloseScanner = () => {
    setScannerOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          '& .MuiFab-root': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            '&:hover': {
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }
        }}
      >
        <Tooltip 
          title="Scan PWD Member QR Code for Benefit Claims" 
          placement="left"
          arrow
        >
          <Fab
            color="primary"
            onClick={handleOpenScanner}
            sx={{
              width: 64,
              height: 64,
              bgcolor: '#3498DB',
              '&:hover': {
                bgcolor: '#2980B9'
              },
              '& .MuiSvgIcon-root': {
                fontSize: '1.8rem'
              }
            }}
          >
            <ScannerIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/* QR Scanner Dialog */}
      <QRScanner
        open={scannerOpen}
        onClose={handleCloseScanner}
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
      />
    </>
  );
};

export default FloatingQRScannerButton;
