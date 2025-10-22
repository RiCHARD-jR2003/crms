// src/components/dashboard/BarangayPresidentDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Dashboard,
  People,
  Assignment,
  Campaign,
  Support,
  TrendingUp,
  CheckCircle,
  Warning,
  Schedule,
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Notifications,
  BarChart
} from '@mui/icons-material';
import BarangayPresidentSidebar from '../shared/BarangayPresidentSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import dashboardService from '../../services/dashboardService';
import { 
  mainContainerStyles, 
  contentAreaStyles, 
  headerStyles, 
  titleStyles,
  subtitleStyles,
  cardStyles,
  dialogStyles,
  dialogTitleStyles,
  dialogContentStyles,
  dialogActionsStyles,
  buttonStyles,
  textFieldStyles,
  tableStyles
} from '../../utils/themeStyles';

function BarangayPresidentDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalPWDMembers: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    activeMembers: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format date as MM/DD/YYYY
  const formatDateMMDDYYYY = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch PWD members statistics
        const pwdResponse = await api.get('/pwd-members');
        const pwdMembers = pwdResponse.data || [];
        
        // Fetch applications directly from API for recent applications
        const applicationsResponse = await api.get('/applications');
        const applications = applicationsResponse || [];
        
        // Filter by barangay - use user's barangay or fallback
        const targetBarangay = currentUser?.barangay || 'Unknown Barangay';
        const barangayMembers = pwdMembers.filter(member => member.barangay === targetBarangay);
        const barangayApplications = applications.filter(app => app.barangay === targetBarangay);
        
        // Fetch announcements filtered by barangay
        const announcementsResponse = await api.get('/announcements');
        const allAnnouncements = announcementsResponse.data || [];
        
        console.log('All announcements:', allAnnouncements);
        console.log('Target barangay:', targetBarangay);
        
        // Filter announcements for this barangay:
        // 1. Public announcements (targetAudience = 'All')
        // 2. Barangay-specific announcements (targetAudience matches user's barangay)
        const filteredAnnouncements = allAnnouncements.filter(announcement => {
          const targetAudience = announcement.targetAudience;
          
          console.log('Announcement:', announcement.title, 'Target:', targetAudience);
          
          // Show public announcements
          if (targetAudience === 'All') return true;
          
          // Show barangay-specific announcements
          if (targetBarangay && targetAudience === targetBarangay) return true;
          
          return false;
        });
        
        console.log('Filtered announcements:', filteredAnnouncements);
        
        setStats({
          totalPWDMembers: barangayMembers.length,
          pendingApplications: barangayApplications.filter(app => app.status === 'Pending Barangay Approval').length,
          approvedApplications: barangayApplications.filter(app => app.status === 'Approved').length,
          activeMembers: barangayMembers.filter(member => member.status === 'active').length
        });
        
        setRecentApplications(barangayApplications.slice(0, 5));
        setRecentAnnouncements(filteredAnnouncements.slice(0, 3));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#27AE60';
      case 'Pending Barangay Approval': return '#F39C12';
      case 'Pending Admin Approval': return '#3498DB';
      case 'Rejected': return '#E74C3C';
      case 'active': return '#27AE60';
      case 'inactive': return '#000000';
      default: return '#000000';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={mainContainerStyles}>
      <BarangayPresidentSidebar />
      
      {/* Main content */}
      <Box sx={contentAreaStyles}>
        {/* Header */}
        <Box sx={headerStyles}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Dashboard sx={{ fontSize: 32, color: '#3498DB' }} />
            <Box>
              <Typography variant="h4" sx={titleStyles}>
                Barangay President Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: '#000000' }}>
                Welcome, {currentUser?.username || 'Barangay President'} • {currentUser?.barangay || 'Mamatid'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday sx={{ color: '#000000', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#000000' }}>
              {formatDateMMDDYYYY(new Date().toISOString())}
            </Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={3}>
            <Card sx={{ ...cardStyles, height: { xs: '120px', sm: '140px', md: '160px' } }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: { xs: 1.5, sm: 2, md: 3 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <People sx={{ 
                  fontSize: { xs: 28, sm: 36, md: 44 }, 
                  color: '#3498DB', 
                  mb: { xs: 0.75, sm: 1 } 
                }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#000000', 
                    mb: { xs: 0.75, sm: 1 },
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' }
                  }}
                >
                  {stats.totalPWDMembers}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#000000', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    lineHeight: 1.2
                  }}
                >
                  Total PWD Members
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Card sx={{ ...cardStyles, height: { xs: '120px', sm: '140px', md: '160px' } }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: { xs: 1.5, sm: 2, md: 3 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Schedule sx={{ 
                  fontSize: { xs: 28, sm: 36, md: 44 }, 
                  color: '#F39C12', 
                  mb: { xs: 0.75, sm: 1 } 
                }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#000000', 
                    mb: { xs: 0.75, sm: 1 },
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' }
                  }}
                >
                  {stats.pendingApplications}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#000000', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    lineHeight: 1.2
                  }}
                >
                  Pending Applications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Card sx={{ ...cardStyles, height: { xs: '120px', sm: '140px', md: '160px' } }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: { xs: 1.5, sm: 2, md: 3 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <CheckCircle sx={{ 
                  fontSize: { xs: 28, sm: 36, md: 44 }, 
                  color: '#27AE60', 
                  mb: { xs: 0.75, sm: 1 } 
                }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#000000', 
                    mb: { xs: 0.75, sm: 1 },
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' }
                  }}
                >
                  {stats.approvedApplications}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#000000', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    lineHeight: 1.2
                  }}
                >
                  Approved Applications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Card sx={{ ...cardStyles, height: { xs: '120px', sm: '140px', md: '160px' } }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: { xs: 1.5, sm: 2, md: 3 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <TrendingUp sx={{ 
                  fontSize: { xs: 28, sm: 36, md: 44 }, 
                  color: '#E74C3C', 
                  mb: { xs: 0.75, sm: 1 } 
                }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#000000', 
                    mb: { xs: 0.75, sm: 1 },
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' }
                  }}
                >
                  {stats.activeMembers}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#000000', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    lineHeight: 1.2
                  }}
                >
                  Active Members
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Recent Applications */}
          <Grid item xs={12} md={8}>
            <Card sx={{ ...cardStyles, height: '100%' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Assignment sx={{ color: '#3498DB', fontSize: 28 }} />
                    <Typography sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '1.3rem' }}>
                      Recent Applications
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="medium"
                    sx={{ 
                      borderColor: '#3498DB', 
                      color: '#3498DB',
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      py: 0.75,
                      px: 2.5,
                      '&:hover': { borderColor: '#2980B9', backgroundColor: '#3498DB15' }
                    }}
                  >
                    View All
                  </Button>
                </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Applicant</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Applied Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentApplications.map((application, index) => (
                      <TableRow key={`application-${index}`} hover sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 40, height: 40, bgcolor: '#3498DB', fontSize: '1rem' }}>
                              {application.firstName?.charAt(0) || 'A'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#2C3E50', fontSize: '1rem' }}>
                                {application.firstName} {application.lastName} {application.suffix || ''}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#000000', fontSize: '0.9rem' }}>
                                {application.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={application.status?.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(application.status)}15`,
                              color: getStatusColor(application.status),
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              height: 28
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#000000', fontSize: '1rem' }}>
                          {formatDateMMDDYYYY(application.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderColor: '#3498DB', 
                              color: '#3498DB',
                              textTransform: 'none',
                              fontSize: '0.9rem',
                              py: 0.75,
                              px: 1.5,
                              '&:hover': { borderColor: '#2980B9', backgroundColor: '#3498DB15' }
                            }}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Announcements */}
          <Grid item xs={12} md={4}>
            <Card sx={{ ...cardStyles, height: '100%' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Campaign sx={{ color: '#3498DB', fontSize: 28 }} />
                  <Typography sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '1.3rem' }}>
                    Recent Announcements
                  </Typography>
                </Box>
                
                {recentAnnouncements.length > 0 ? (
                  <List sx={{ flex: 1 }}>
                    {recentAnnouncements.map((announcement, index) => (
                      <React.Fragment key={`announcement-${index}`}>
                        <ListItem sx={{ px: 0, py: 1.5 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Notifications sx={{ color: '#3498DB', fontSize: 24 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#2C3E50', fontSize: '1rem' }}>
                                {announcement.title}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: '#000000', fontSize: '0.9rem' }}>
                                {formatDateMMDDYYYY(announcement.created_at)}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < recentAnnouncements.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center',
                    py: 4
                  }}>
                    <Box>
                      <Campaign sx={{ fontSize: 48, color: '#BDC3C7', mb: 2 }} />
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontSize: '1rem' }}>
                        No announcements available
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#95A5A6', fontSize: '0.9rem' }}>
                        Check back later for updates
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default BarangayPresidentDashboard;