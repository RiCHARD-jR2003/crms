import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { AccessTime, Warning } from '@mui/icons-material';

/**
 * Component to display countdown timer for pending applications
 */
export function PendingCountdown({ expiresAt, status, referenceNumber }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
      setIsExpired(false);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Only show for pending applications
  if (!expiresAt || !['Pending', 'Pending Barangay Approval', 'Pending Admin Approval'].includes(status)) {
    return null;
  }

  if (isExpired || status === 'Expired' || status === 'Rejected') {
    return (
      <Alert severity="error" icon={<Warning />} sx={{ mt: 2 }}>
        <Typography variant="body2" fontWeight="bold">
          This application has expired.
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Reference Number: {referenceNumber}
        </Typography>
      </Alert>
    );
  }

  // Don't render if timeRemaining is null (still calculating or expired)
  if (!timeRemaining) {
    return null;
  }

  const isUrgent = timeRemaining.days === 0 && timeRemaining.hours < 24;

  return (
    <Box sx={{ mt: 2 }}>
      <Alert 
        severity={isUrgent ? "warning" : "info"} 
        icon={<AccessTime />}
        sx={{ 
          backgroundColor: isUrgent ? '#FFF3CD' : '#D1ECF1',
          borderLeft: `4px solid ${isUrgent ? '#F39C12' : '#1976D2'}`,
        }}
      >
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          {isUrgent 
            ? `⚠️ This application will expire in ${timeRemaining.hours} hours and ${timeRemaining.minutes} minutes`
            : `This application will expire in ${timeRemaining.days} days, ${timeRemaining.hours} hours`
          }
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" color={isUrgent ? '#F39C12' : '#1976D2'}>
              {String(timeRemaining.days).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" color="text.secondary">Days</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" color={isUrgent ? '#F39C12' : '#1976D2'}>
              {String(timeRemaining.hours).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" color="text.secondary">Hours</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" color={isUrgent ? '#F39C12' : '#1976D2'}>
              {String(timeRemaining.minutes).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" color="text.secondary">Minutes</Typography>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
          Expires on: {new Date(expiresAt).toLocaleString()}
        </Typography>
      </Alert>
    </Box>
  );
}

export default PendingCountdown;

