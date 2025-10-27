import React from 'react';
import { Box, Container, Typography, Grid, AppBar, Toolbar, Button, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function AboutUsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLoginClick = async () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      {/* Header/Navigation */}
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 1000 }}>
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#0b87ac', width: 40, height: 40 }}>
              <img src="/images/cropped_image.png" alt="PDAO Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Avatar>
            <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 700 }}>
              PDAO RMS
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Button sx={{ color: '#2C3E50', fontWeight: 400 }} onClick={() => navigate('/')}>
              Home
            </Button>
            <Button sx={{ color: '#0b87ac', fontWeight: 600 }}>About Us</Button>
            <Button sx={{ color: '#2C3E50', fontWeight: 400 }} onClick={() => navigate('/contact')}>
              Contact Us
            </Button>
            <Button 
              variant="contained" 
              sx={{ bgcolor: '#0b87ac', '&:hover': { bgcolor: '#0a6b8a' } }}
              onClick={handleLoginClick}
            >
              {currentUser ? 'Dashboard' : 'Login'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar /> {/* Spacer for fixed AppBar */}
      
      <Box sx={{ flex: 1, pt: 4, pb: 10 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" sx={{ mb: 3, textAlign: 'center', color: '#2C3E50', fontWeight: 700 }}>
          About Us
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ mb: 2, color: '#2C3E50', fontWeight: 600 }}>
              Our Mission
            </Typography>
            <Typography variant="body1" sx={{ color: '#7F8C8D', mb: 3, lineHeight: 1.7, fontSize: '1rem' }}>
              The Persons with Disabilities Affairs Office (PDAO) of Cabuyao City is dedicated to promoting the welfare and rights of persons with disabilities. We work tirelessly to ensure that PWDs have equal access to opportunities, services, and benefits.
            </Typography>
            <Typography variant="h5" sx={{ mb: 2, color: '#2C3E50', fontWeight: 600 }}>
              Our Vision
            </Typography>
            <Typography variant="body1" sx={{ color: '#7F8C8D', lineHeight: 1.7, fontSize: '1rem' }}>
              To create an inclusive society where persons with disabilities can fully participate and contribute to community development.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ mb: 2, color: '#2C3E50', fontWeight: 600 }}>
              Our Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                <CheckCircleIcon sx={{ color: '#0b87ac', fontSize: 24 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#2C3E50', fontWeight: 600 }}>
                    PWD ID Issuance
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                    Official identification for persons with disabilities
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                <CheckCircleIcon sx={{ color: '#0b87ac', fontSize: 24 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#2C3E50', fontWeight: 600 }}>
                    Assistance & Support
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                    Various assistance programs for PWD members
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                <CheckCircleIcon sx={{ color: '#0b87ac', fontSize: 24 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#2C3E50', fontWeight: 600 }}>
                    Benefits Management
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                    Track and manage PWD benefits and entitlements
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#e0e0e0', py: 3, textAlign: 'center', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 900 }}>
        <Container>
          <Typography variant="body2" sx={{ color: '#333333' }}>
            © {new Date().getFullYear()} Persons with Disabilities Affairs Office - Cabuyao City. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default AboutUsPage;

