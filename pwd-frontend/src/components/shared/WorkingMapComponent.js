import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { LocationOn, OpenInNew } from '@mui/icons-material';

// PWD Office Location
const PWD_OFFICE_LOCATION = {
  name: 'PWD Office - Poblacion Uno',
  address: '74JF+3F6, P. Burgos, Poblacion Uno, Cabuyao City, 4026 Laguna',
  lat: 14.2488,
  lng: 121.1248
};


const WorkingMapComponent = ({ height = '400px' }) => {

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PWD_OFFICE_LOCATION.address)}`;
    window.open(url, '_blank');
  };

  console.log('🗺️ WorkingMapComponent is rendering with height:', height);

  return (
    <Box sx={{ width: '100%', height: height, backgroundColor: '#f0f0f0', border: '2px solid #ff0000' }}>
      {/* Debug info */}
      <Box sx={{ 
        backgroundColor: '#e3f2fd', 
        padding: 1, 
        marginBottom: 1, 
        borderRadius: 1,
        fontSize: '0.8rem',
        color: '#1976d2',
        textAlign: 'center'
      }}>
        🗺️ WorkingMapComponent is rendering! Height: {height}
      </Box>

      {/* Map Container */}
      <Box sx={{ 
        height: '70%', 
        position: 'relative', 
        mb: 2,
        backgroundColor: '#e3f2fd',
        borderRadius: 2,
        overflow: 'hidden',
        border: '2px solid #1976d2'
      }}>
        {/* Map Placeholder with PWD Office Info */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: { xs: 1.5, sm: 2, md: 3 },
            borderRadius: 2,
            boxShadow: 2,
            maxWidth: { xs: '90%', sm: '350px', md: '400px' },
            width: { xs: '90%', sm: 'auto' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
            <LocationOn sx={{ color: '#FF6B35', fontSize: { xs: 24, sm: 28, md: 30 } }} />
            <Typography variant="h5" sx={{ color: '#FF6B35', fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' } }}>
              PWD Office Location
            </Typography>
          </Box>
          
          <Typography variant="h6" sx={{ color: '#333', mb: 1, fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}>
            {PWD_OFFICE_LOCATION.name}
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#666', mb: 2, lineHeight: 1.4, fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }}>
            {PWD_OFFICE_LOCATION.address}
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#888', mb: 2, fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' } }}>
            Coordinates: {PWD_OFFICE_LOCATION.lat}, {PWD_OFFICE_LOCATION.lng}
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<OpenInNew />}
            onClick={openInGoogleMaps}
            sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
              padding: { xs: '6px 12px', sm: '7px 14px', md: '8px 16px' },
              fontWeight: 'bold'
            }}
          >
            Open in Google Maps
          </Button>
        </Box>

        {/* Map Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(45deg, #e3f2fd 25%, transparent 25%),
              linear-gradient(-45deg, #e3f2fd 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #e3f2fd 75%),
              linear-gradient(-45deg, transparent 75%, #e3f2fd 75%)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            opacity: 0.3
          }}
        />
      </Box>

      {/* Action Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        p: 2
      }}>
        <Button
          variant="contained"
          startIcon={<OpenInNew />}
          onClick={openInGoogleMaps}
          sx={{ 
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            padding: { xs: '8px 16px', sm: '10px 20px' }
          }}
        >
          Open in Google Maps
        </Button>
      </Box>
    </Box>
  );
};

export default WorkingMapComponent;
