import React from 'react';
import { Box, Typography } from '@mui/material';

const ApplicationStatusCheck = () => {
  // This component is now embedded directly in LandingPage.js
  // This file is kept for reference but no longer used
  return (
    <Box sx={{ p: 2, border: '2px solid red', bgcolor: 'yellow' }}>
      <Typography variant="h6" sx={{ color: 'red' }}>
        This component has been moved to LandingPage.js
      </Typography>
    </Box>
  );
};

export default ApplicationStatusCheck;
