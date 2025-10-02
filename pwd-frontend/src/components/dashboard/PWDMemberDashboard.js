// src/components/dashboard/PWDMemberDashboard.js
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Container
} from '@mui/material';
import {
  Dashboard,
  Campaign,
  Support,
  Person,
  CheckCircle,
  Schedule,
  Warning,
  Phone,
  Email,
  AccessTime,
  ErrorOutline,
  Menu
} from '@mui/icons-material';
import PWDMemberSidebar from '../shared/PWDMemberSidebar';
import { useAuth } from '../../contexts/AuthContext';
import announcementService from '../../services/announcementService';
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

function PWDMemberDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [announcements, setAnnouncements] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memberSinceDate, setMemberSinceDate] = useState(null);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Navigation handlers
  const handleCreateSupportTicket = () => {
    navigate('/pwd-support');
  };

  const handleViewMyTickets = () => {
    navigate('/pwd-support');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user's barangay from currentUser
        const userBarangay = currentUser?.barangay || currentUser?.pwd_member?.barangay;
        console.log('Dashboard - Current User:', currentUser);
        console.log('Dashboard - User Barangay:', userBarangay);
        
        // Use announcementService to get filtered announcements
        const filteredAnnouncements = await announcementService.getFilteredForPWDMember(userBarangay);
        
        // Fetch support tickets for this user
        const ticketsResponse = await api.get('/support-tickets');
        const ticketsData = ticketsResponse || [];
        const userTickets = ticketsData.filter(ticket => 
          ticket.pwd_member?.user?.id === currentUser?.id
        );
        
        // Fetch PWD member profile to get approval date
        try {
          const profileResponse = await api.get(`/pwd-members/${currentUser.userID}`);
          const profileData = profileResponse;
          
          // Get the approval date from created_at or pwd_id_generated_at
          const approvalDate = profileData?.created_at || profileData?.pwd_id_generated_at;
          setMemberSinceDate(approvalDate);
        } catch (profileError) {
          console.log('Could not fetch PWD member profile, using fallback date');
          // Fallback: use current user's created_at if available
          setMemberSinceDate(currentUser?.created_at);
        }
        
        setAnnouncements(filteredAnnouncements.slice(0, 3));
        setSupportTickets(userTickets);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={mainContainerStyles}>
      <PWDMemberSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      
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
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 1 } }}>
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
                  borderColor: '#0b87ac',
                  background: '#F4F7FC',
                  color: '#0b87ac'
                }
              }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, color: '#000000', fontWeight: 600 }}>
              PWD Dashboard
            </Typography>
          </Box>

          {/* Page Header */}
          <Box sx={{ mb: { xs: 2, md: 4 } }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#000000', 
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              Dashboard
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#000000',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Welcome back, {currentUser?.pwd_member?.firstName && currentUser?.pwd_member?.lastName 
                ? `${currentUser.pwd_member.firstName} ${currentUser.pwd_member.lastName}` 
                : currentUser?.username || 'PWD Member'}. Here's your personal dashboard.
            </Typography>
          </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} icon={<ErrorOutline />}>
            {error}
          </Alert>
        )}

          {/* Dashboard Content */}
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
            {/* Latest Announcements */}
            <Grid item xs={12} md={6}>
              <Card sx={cardStyles}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Campaign sx={{ color: '#F39C12', fontSize: 24 }} />
                    <Typography sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '1.2rem' }}>
                      Latest Announcements
                    </Typography>
                  </Box>
              
              {announcements.length > 0 ? (
                <List>
                  {announcements.map((announcement, index) => (
                    <React.Fragment key={announcement.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Campaign sx={{ color: '#F39C12', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#2C3E50' }}>
                                {announcement.title}
                              </Typography>
                              {/* Show barangay-specific badge */}
                              {announcement.targetAudience !== 'All' && 
                               announcement.targetAudience !== 'PWD Members' && 
                               announcement.targetAudience !== 'PWDMember' && (
                                <Box
                                  sx={{
                                    backgroundColor: '#3498DB',
                                    color: 'white',
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    fontSize: '0.6rem',
                                    fontWeight: 600
                                  }}
                                >
                                  {announcement.targetAudience}
                                </Box>
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: '#000000' }}>
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < announcements.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ErrorOutline sx={{ fontSize: 48, color: '#000000', mb: 2 }} />
                  <Typography variant="body1" sx={{ color: '#000000', mb: 1 }}>
                    No announcements at the moment
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#000000' }}>
                    Check back later for important updates
                  </Typography>
                </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Support Desk */}
            <Grid item xs={12} md={6}>
              <Card sx={cardStyles}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Support sx={{ color: '#E74C3C', fontSize: 24 }} />
                    <Typography sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '1.2rem' }}>
                      Support Desk
                    </Typography>
                  </Box>
              
              <Typography variant="body2" sx={{ color: '#000000', mb: 3 }}>
                Need help? Our support team is here to assist you with any questions or concerns.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleCreateSupportTicket}
                  sx={{ 
                    bgcolor: '#E74C3C', 
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': { bgcolor: '#C0392B' }
                  }}
                >
                  Create Support Ticket
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleViewMyTickets}
                  sx={{ 
                    borderColor: '#E74C3C', 
                    color: '#E74C3C',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': { borderColor: '#C0392B', backgroundColor: '#E74C3C15' }
                  }}
                >
                  View My Tickets
                </Button>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Phone sx={{ color: '#E74C3C', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ color: '#000000' }}>
                    Phone: (049) 123-4567
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Email sx={{ color: '#E74C3C', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ color: '#000000' }}>
                    Email: support@pdao.cabuyao.gov.ph
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ color: '#E74C3C', fontSize: 16 }} />
                  <Typography variant="body2" sx={{ color: '#000000' }}>
                    Hours: Mon-Fri, 8AM-5PM
                  </Typography>
                </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Summary Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={cardStyles}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <CheckCircle sx={{ fontSize: 40, color: '#27AE60', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27AE60' }}>
                    Approved
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#000000' }}>
                    Application Status
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={cardStyles}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Person sx={{ fontSize: 40, color: '#3498DB', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3498DB' }}>
                    PWD
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#000000' }}>
                    Member Since
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#3498DB', fontWeight: 'bold', mt: 0.5 }}>
                    {formatDate(memberSinceDate)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={cardStyles}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Campaign sx={{ fontSize: 40, color: '#F39C12', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#F39C12' }}>
                    {announcements.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#000000' }}>
                    Announcements
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={cardStyles}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Support sx={{ fontSize: 40, color: '#E74C3C', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#E74C3C' }}>
                    {supportTickets.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#000000' }}>
                    Support Tickets
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default PWDMemberDashboard;