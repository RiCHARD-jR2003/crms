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
  People,
  Assignment,
  CheckCircle,
  Schedule,
  Phone,
  Email,
  AccessTime,
  ErrorOutline,
  Menu
} from '@mui/icons-material';
import Staff1Sidebar from '../shared/Staff1Sidebar';
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

function Staff1Dashboard() {
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
    totalMembers: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    recentApplications: []
  });

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Navigation handlers
  const handleViewMasterlist = () => {
    announcePageChange('PWD Masterlist');
    navigate('/pwd-masterlist');
  };

  const handleViewRecords = () => {
    announcePageChange('PWD Records');
    navigate('/pwd-records');
  };

  useEffect(() => {
    // Announce page load
    announcePageChange('Staff 1 Dashboard');
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch PWD members statistics
        const pwdResponse = await api.get('/pwd-members');
        const pwdMembers = pwdResponse.data || [];
        
        // Fetch applications
        const applicationsResponse = await api.get('/applications');
        const applications = (applicationsResponse || []).sort((a,b)=>{
          const aTime = a.submissionDate ? new Date(a.submissionDate).getTime() : 0;
          const bTime = b.submissionDate ? new Date(b.submissionDate).getTime() : 0;
          return bTime - aTime;
        });
        
        // Calculate statistics
        const totalMembers = pwdMembers.length;
        const pendingApplications = applications.filter(app => app.status === 'Pending Admin Approval').length;
        const approvedApplications = applications.filter(app => app.status === 'Approved').length;
        const recentApplications = applications
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        
        setStats({
          totalMembers,
          pendingApplications,
          approvedApplications,
          recentApplications
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
      <Staff1Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      
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
                  borderColor: '#1976D2',
                  background: '#F4F7FC',
                  color: '#1976D2'
                }
              }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, color: '#000000', fontWeight: 600 }}>
              Staff 1 Dashboard
            </Typography>
          </Box>

          {/* Page Header */}
          <Box sx={{ mb: { xs: 2, md: 4 } }}>
            <Typography variant="h4" sx={{ ...titleStyles, mb: 1 }}>
              Staff 1 Dashboard
            </Typography>
            <Typography variant="h6" sx={{ ...subtitleStyles }}>
              PWD Records & Masterlist Management
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
                    <Avatar sx={{ bgcolor: '#1976D2', mr: 2 }}>
                      <People />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976D2' }}>
                        {stats.totalMembers}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Total PWD Members
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
                    <Avatar sx={{ bgcolor: '#FF9800', mr: 2 }}>
                      <Schedule />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#FF9800' }}>
                        {stats.pendingApplications}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Pending Applications
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
                        {stats.approvedApplications}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Approved Applications
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
                      <Assignment />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#9C27B0' }}>
                        {stats.recentApplications.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Recent Applications
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
                      startIcon={<People />}
                      onClick={handleViewMasterlist}
                      sx={{
                        bgcolor: '#1976D2',
                        '&:hover': { bgcolor: '#1565C0' },
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      View PWD Masterlist
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Assignment />}
                      onClick={handleViewRecords}
                      sx={{
                        borderColor: '#1976D2',
                        color: '#1976D2',
                        '&:hover': { 
                          borderColor: '#1565C0',
                          backgroundColor: '#E3F2FD'
                        },
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Manage PWD Records
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={cardStyles}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Recent Applications
                  </Typography>
                  {stats.recentApplications.length > 0 ? (
                    <List>
                      {stats.recentApplications.map((app, index) => (
                        <React.Fragment key={app.id || `app-${index}`}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon>
                              <Avatar sx={{ bgcolor: '#E3F2FD', color: '#1976D2', width: 32, height: 32 }}>
                                {app.firstName?.charAt(0) || 'A'}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={`${app.firstName} ${app.lastName}`}
                              secondary={`Status: ${app.status}`}
                              primaryTypographyProps={{ fontWeight: 600 }}
                              secondaryTypographyProps={{ color: '#7F8C8D' }}
                            />
                          </ListItem>
                          {index < stats.recentApplications.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#7F8C8D', textAlign: 'center', py: 2 }}>
                      No recent applications
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

export default Staff1Dashboard;
