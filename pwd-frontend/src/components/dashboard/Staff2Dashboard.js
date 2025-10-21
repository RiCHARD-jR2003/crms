import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Dashboard,
  Favorite,
  TrackChanges,
  CheckCircle,
  Schedule,
  Phone,
  Email,
  AccessTime,
  ErrorOutline,
  Menu
} from '@mui/icons-material';
import Staff2Sidebar from '../shared/Staff2Sidebar';
import AccessibilitySettings from '../shared/AccessibilitySettings';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { useScreenReader } from '../../hooks/useScreenReader';
import { api } from '../../services/api';
import { 
  mainContainerStyles, 
  contentAreaStyles, 
  headerStyles, 
  titleStyles,
  subtitleStyles,
  cardStyles
} from '../../utils/themeStyles';
import { useNavigate } from 'react-router-dom';

function Staff2Dashboard() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const { announcePageChange } = useScreenReader();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalBenefits: 0,
    activeBenefits: 0,
    distributedBenefits: 0,
    recentBenefits: []
  });

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Navigation handlers
  const handleViewAyuda = () => {
    announcePageChange('Ayuda Management');
    navigate('/staff2-ayuda');
  };

  const handleViewBenefitTracking = () => {
    announcePageChange('Benefit Tracking');
    navigate('/staff2-benefit-tracking');
  };

  useEffect(() => {
    // Announce page load
    announcePageChange('Staff 2 Dashboard');
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch benefits statistics
        const benefitsResponse = await api.get('/benefits');
        const benefits = benefitsResponse || [];
        
        // Calculate statistics
        const totalBenefits = benefits.length;
        const activeBenefits = benefits.filter(benefit => benefit.status === 'active').length;
        const distributedBenefits = benefits.filter(benefit => benefit.status === 'distributed').length;
        const recentBenefits = benefits
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        
        setStats({
          totalBenefits,
          activeBenefits,
          distributedBenefits,
          recentBenefits
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [announcePageChange]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={mainContainerStyles}>
      <Staff2Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          ...contentAreaStyles,
          flexGrow: 1,
          ml: { xs: 0, md: '280px' },
          width: { xs: '100%', md: 'calc(100% - 280px)' },
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Mobile Menu Button */}
          <Box sx={{ 
            display: { xs: 'flex', md: 'none' }, 
            alignItems: 'center', 
            mb: 2,
            p: 1
          }}>
            <IconButton
              onClick={handleSidebarToggle}
              sx={{
                color: '#566573',
                border: '1px solid #D5DBDB',
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#FF9800',
                  background: '#FFF3E0',
                  color: '#FF9800'
                }
              }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, color: '#000000', fontWeight: 600 }}>
              Staff 2 Dashboard
            </Typography>
          </Box>

          {/* Page Header */}
          <Box sx={{ mb: { xs: 2, md: 4 } }}>
            <Typography variant="h4" sx={{ ...titleStyles, mb: 1 }}>
              Staff 2 Dashboard
            </Typography>
            <Typography variant="h6" sx={{ ...subtitleStyles }}>
              Ayuda & Benefits Management
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={cardStyles}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#FF9800', mr: 2 }}>
                      <Favorite />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#FF9800' }}>
                        {stats.totalBenefits}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Total Benefits
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={cardStyles}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#4CAF50', mr: 2 }}>
                      <CheckCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                        {stats.activeBenefits}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Active Benefits
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={cardStyles}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#1976D2', mr: 2 }}>
                      <TrackChanges />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976D2' }}>
                        {stats.distributedBenefits}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Distributed Benefits
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={cardStyles}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#9C27B0', mr: 2 }}>
                      <Schedule />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#9C27B0' }}>
                        {stats.recentBenefits.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Recent Benefits
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={cardStyles}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Favorite />}
                      onClick={handleViewAyuda}
                      sx={{
                        bgcolor: '#FF9800',
                        '&:hover': { bgcolor: '#F57C00' },
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Manage Ayuda
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<TrackChanges />}
                      onClick={handleViewBenefitTracking}
                      sx={{
                        borderColor: '#FF9800',
                        color: '#FF9800',
                        '&:hover': { 
                          borderColor: '#F57C00',
                          backgroundColor: '#FFF3E0'
                        },
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Track Benefits
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={cardStyles}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Recent Benefits
                  </Typography>
                  {stats.recentBenefits.length > 0 ? (
                    <List>
                      {stats.recentBenefits.map((benefit, index) => (
                        <React.Fragment key={benefit.id || `benefit-${index}`}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <Avatar sx={{ bgcolor: '#FFF3E0', color: '#FF9800', width: 32, height: 32 }}>
                                <Favorite fontSize="small" />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={benefit.name || 'Benefit'}
                              secondary={`Status: ${benefit.status}`}
                              primaryTypographyProps={{ fontWeight: 600 }}
                              secondaryTypographyProps={{ color: '#7F8C8D' }}
                            />
                          </ListItem>
                          {index < stats.recentBenefits.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#7F8C8D', textAlign: 'center', py: 2 }}>
                      No recent benefits
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Accessibility Settings */}
      <AccessibilitySettings />
    </Box>
  );
}

export default Staff2Dashboard;
