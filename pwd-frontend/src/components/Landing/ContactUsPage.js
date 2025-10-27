import React from 'react';
import { Box, Container, Typography, Grid, IconButton, AppBar, Toolbar, Button, Avatar } from '@mui/material';
import { LocationOn, Phone, Email, Facebook, Twitter, Instagram, LinkedIn, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function ContactUsPage() {
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
            <Button sx={{ color: '#2C3E50', fontWeight: 400 }} onClick={() => navigate('/about')}>
              About Us
            </Button>
            <Button sx={{ color: '#0b87ac', fontWeight: 600 }}>Contact Us</Button>
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
        <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', color: '#2C3E50', fontWeight: 700 }}>
          Contact Us
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <LocationOn sx={{ fontSize: 40, color: '#0b87ac', mb: 1.5 }} />
              <Typography variant="h6" sx={{ mb: 1.5, color: '#2C3E50', fontWeight: 600 }}>
                Office Location
              </Typography>
              <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                City Hall Complex<br />
                Cabuyao City, Laguna
              </Typography>
            </Box>
          </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Phone sx={{ fontSize: 40, color: '#0b87ac', mb: 1.5 }} />
                <Typography variant="h6" sx={{ mb: 1.5, color: '#2C3E50', fontWeight: 600 }}>
                  Phone
                </Typography>
              <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                +63 (XXX) XXX-XXXX
              </Typography>
            </Box>
          </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Email sx={{ fontSize: 40, color: '#0b87ac', mb: 1.5 }} />
                <Typography variant="h6" sx={{ mb: 1.5, color: '#2C3E50', fontWeight: 600 }}>
                  Email
                </Typography>
              <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                pdao@cabuyaocity.gov.ph
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Social Media */}
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h6" sx={{ mb: 2.5, color: '#2C3E50', fontWeight: 600 }}>
            Connect With Us
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <IconButton sx={{ color: '#0b87ac', bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}>
              <Facebook />
            </IconButton>
            <IconButton sx={{ color: '#0b87ac', bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}>
              <Twitter />
            </IconButton>
            <IconButton sx={{ color: '#0b87ac', bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}>
              <Instagram />
            </IconButton>
            <IconButton sx={{ color: '#0b87ac', bgcolor: '#e3f2fd', '&:hover': { bgcolor: '#bbdefb' } }}>
              <LinkedIn />
            </IconButton>
          </Box>
        </Box>

        {/* Office Hours */}
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1.5 }}>
            <AccessTime sx={{ color: '#0b87ac', fontSize: 24 }} />
            <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 600 }}>
              Office Hours
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#7F8C8D' }}>
            Monday - Friday: 8:00 AM - 5:00 PM
          </Typography>
        </Box>
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

export default ContactUsPage;

