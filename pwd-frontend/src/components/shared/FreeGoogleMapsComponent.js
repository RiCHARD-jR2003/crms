import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { LocationOn, OpenInNew } from '@mui/icons-material';

// PWD Office Location
const PWD_OFFICE_LOCATION = {
  name: 'PWD Office - Poblacion Uno',
  address: '74JF+3F6, P. Burgos, Poblacion Uno, Cabuyao City, 4026 Laguna',
  lat: 14.2488,
  lng: 121.1248
};

const FreeGoogleMapsComponent = ({ height = '400px' }) => {
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PWD_OFFICE_LOCATION.address)}`;
    window.open(url, '_blank');
  };

  // OpenStreetMap URL
  const openStreetMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${PWD_OFFICE_LOCATION.lng - 0.01},${PWD_OFFICE_LOCATION.lat - 0.01},${PWD_OFFICE_LOCATION.lng + 0.01},${PWD_OFFICE_LOCATION.lat + 0.01}&layer=mapnik&marker=${PWD_OFFICE_LOCATION.lat},${PWD_OFFICE_LOCATION.lng}`;

  return (
    <Box sx={{ width: '100%', height: height }}>
      {/* Map Container */}
      <Box sx={{ 
        height: '100%', 
        borderRadius: 2,
        overflow: 'hidden',
        border: '2px solid #1976d2',
        position: 'relative'
      }}>
        <Box sx={{ position: 'relative', height: '100%' }}>
          {/* OpenStreetMap Embed */}
          <iframe
            src={openStreetMapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            title="OpenStreetMap - PWD Office Location"
          />
          
          {/* Overlay with PWD Office Info */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: { xs: 1, sm: 1.5 },
              borderRadius: 1,
              boxShadow: 2,
              maxWidth: { xs: '200px', sm: '250px' },
              zIndex: 1000
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <LocationOn sx={{ color: '#FF6B35', fontSize: { xs: 16, sm: 20 } }} />
              <Typography variant="subtitle2" sx={{ color: '#FF6B35', fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                PWD Office
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#333', fontSize: { xs: '0.7rem', sm: '0.8rem' }, lineHeight: 1.2 }}>
              {PWD_OFFICE_LOCATION.name}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            display: 'flex',
            gap: 1,
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<OpenInNew />}
            onClick={openInGoogleMaps}
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.8rem' },
              padding: { xs: '4px 8px', sm: '6px 12px' }
            }}
          >
            Open in Maps
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default FreeGoogleMapsComponent;
