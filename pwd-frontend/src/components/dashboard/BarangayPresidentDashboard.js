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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch PWD members statistics
        const pwdResponse = await api.get('/mock-pwd');
        const pwdMembers = pwdResponse.members || [];
        
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
        
        // Filter announcements for this barangay:
        // 1. Public announcements (targetAudience = 'All')
        // 2. Barangay-specific announcements (targetAudience matches user's barangay)
        const filteredAnnouncements = allAnnouncements.filter(announcement => {
          const targetAudience = announcement.targetAudience;
          
          // Show public announcements
          if (targetAudience === 'All') return true;
          
          // Show barangay-specific announcements
          if (targetBarangay && targetAudience === targetBarangay) return true;
          
          return false;
        });
        
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
              {new Date().toLocaleDateString()}
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
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <People sx={{ fontSize: 40, color: '#3498DB', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>
                  {stats.totalPWDMembers}
                </Typography>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  Total PWD Members
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Schedule sx={{ fontSize: 40, color: '#F39C12', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>
                  {stats.pendingApplications}
                </Typography>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  Pending Applications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <CheckCircle sx={{ fontSize: 40, color: '#27AE60', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>
                  {stats.approvedApplications}
                </Typography>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  Approved Applications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <TrendingUp sx={{ fontSize: 40, color: '#9B59B6', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>
                  {stats.activeMembers}
                </Typography>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  Active Members
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Applications */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{
              p: 3,
              border: '1px solid #E0E0E0',
              borderRadius: 4,
              bgcolor: '#FFFFFF',
              height: '100%'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '1.2rem' }}>
                  Recent Applications
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ 
                    borderColor: '#3498DB', 
                    color: '#3498DB',
                    textTransform: 'none',
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
                    {recentApplications.map((application) => (
                      <TableRow key={application.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#3498DB', fontSize: '0.9rem' }}>
                              {application.firstName?.charAt(0) || 'A'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#2C3E50' }}>
                                {application.firstName} {application.lastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#000000' }}>
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
                              fontSize: '0.7rem'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#000000', fontSize: '0.9rem' }}>
                          {new Date(application.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderColor: '#3498DB', 
                              color: '#3498DB',
                              textTransform: 'none',
                              fontSize: '0.8rem',
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
            </Paper>
          </Grid>

          {/* Recent Announcements */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{
              p: 3,
              border: '1px solid #E0E0E0',
              borderRadius: 4,
              bgcolor: '#FFFFFF',
              height: '100%'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Campaign sx={{ color: '#3498DB', fontSize: 24 }} />
                <Typography sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '1.2rem' }}>
                  Recent Announcements
                </Typography>
              </Box>
              
              <List>
                {recentAnnouncements.map((announcement, index) => (
                  <React.Fragment key={announcement.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Notifications sx={{ color: '#3498DB', fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#2C3E50' }}>
                            {announcement.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#000000' }}>
                            {new Date(announcement.created_at).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < recentAnnouncements.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default BarangayPresidentDashboard;