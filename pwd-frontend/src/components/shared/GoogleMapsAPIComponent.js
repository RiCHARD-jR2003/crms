import React, { useState, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { LocationOn, OpenInNew } from '@mui/icons-material';

// PWD Office Location
const PWD_OFFICE_LOCATION = {
  name: 'PWD Office - Poblacion Uno',
  address: '74JF+3F6, P. Burgos, Poblacion Uno, Cabuyao City, 4026 Laguna',
  lat: 14.2488,
  lng: 121.1248
};


// Google Maps API Key - You need to replace this with your actual API key
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

const render = (status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          gap: 2
        }}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ color: '#666' }}>
            Loading Google Maps...
          </Typography>
        </Box>
      );
    case Status.FAILURE:
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          gap: 2,
          p: 2
        }}>
          <Alert severity="error" sx={{ width: '100%', maxWidth: '400px' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Google Maps Failed to Load
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Please check your API key and internet connection.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{ mt: 1 }}
            >
              Retry
            </Button>
          </Alert>
        </Box>
      );
    default:
      return null;
  }
};

const MapComponent = ({ height = '400px' }) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const onLoad = useCallback((map) => {
    setMap(map);
    
    // Add PWD Office marker
    const pwdOfficeMarker = new google.maps.Marker({
      position: { lat: PWD_OFFICE_LOCATION.lat, lng: PWD_OFFICE_LOCATION.lng },
      map: map,
      title: PWD_OFFICE_LOCATION.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#FF6B35" stroke="#fff" stroke-width="2"/>
            <path d="M20 8 L28 20 L20 32 L12 20 Z" fill="#fff"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20)
      }
    });

    // Add info window for PWD Office
    const pwdInfoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; color: #FF6B35; font-size: 16px;">${PWD_OFFICE_LOCATION.name}</h3>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${PWD_OFFICE_LOCATION.address}</p>
          <p style="margin: 0; color: #888; font-size: 12px;">Coordinates: ${PWD_OFFICE_LOCATION.lat}, ${PWD_OFFICE_LOCATION.lng}</p>
        </div>
      `
    });

    pwdOfficeMarker.addListener('click', () => {
      pwdInfoWindow.open(map, pwdOfficeMarker);
    });

    setMarkers([pwdOfficeMarker]);
  }, []);


  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PWD_OFFICE_LOCATION.address)}`;
    window.open(url, '_blank');
  };

  return (
    <Box sx={{ width: '100%', height: height }}>
      {/* Map Container */}
      <Box sx={{ 
        height: '70%', 
        mb: 2,
        borderRadius: 2,
        overflow: 'hidden',
        border: '2px solid #1976d2'
      }}>
        <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={render}>
          <Map
            center={{ lat: PWD_OFFICE_LOCATION.lat, lng: PWD_OFFICE_LOCATION.lng }}
            zoom={13}
            onLoad={onLoad}
            mapContainerStyle={{ width: '100%', height: '100%' }}
            options={{
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: true,
              zoomControl: true,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'off' }]
                }
              ]
            }}
          />
        </Wrapper>
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

// Map component that will be rendered by the Wrapper
const Map = ({ onLoad, ...options }) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current && !window.map) {
      window.map = new window.google.maps.Map(ref.current, options);
      onLoad(window.map);
    }
  }, [ref, onLoad, options]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const GoogleMapsAPIComponent = ({ height = '400px' }) => {
  return (
    <Box sx={{ width: '100%', height: height }}>
      {GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          gap: 2,
          p: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 2
        }}>
          <Alert severity="warning" sx={{ width: '100%', maxWidth: '500px' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Google Maps API Key Required
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              To display the interactive map, you need to:
            </Typography>
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Get a Google Maps API key from Google Cloud Console
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Replace 'YOUR_GOOGLE_MAPS_API_KEY_HERE' in the code
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 2 }}>
                Enable Maps JavaScript API in your Google Cloud project
              </Typography>
            </Box>
            <Button
              variant="contained"
              href="https://console.cloud.google.com/"
              target="_blank"
              sx={{ mt: 1 }}
            >
              Get API Key
            </Button>
          </Alert>
        </Box>
      ) : (
        <MapComponent height={height} />
      )}
    </Box>
  );
};

export default GoogleMapsAPIComponent;
