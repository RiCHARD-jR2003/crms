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
  Campaign,
  Support,
  Person,
  CheckCircle,
  Schedule,
  Phone,
  Email,
  AccessTime,
  ErrorOutline,
  Menu
} from '@mui/icons-material';
import PWDMemberSidebar from '../shared/PWDMemberSidebar';
import AccessibilitySettings from '../shared/AccessibilitySettings';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { useScreenReader } from '../../hooks/useScreenReader';
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
  const { t } = useTranslation();
  const { announcePageChange } = useScreenReader();
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
      if (isNaN(date.getTime())) return 'N/A';
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${month}/${day}/${year}`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Navigation handlers
  const handleCreateSupportTicket = () => {
    announcePageChange(t('support.title'));
    navigate('/pwd-support');
  };

  const handleViewMyTickets = () => {
    announcePageChange(t('support.title'));
    navigate('/pwd-support');
  };



  useEffect(() => {
    // Announce page load
    announcePageChange(t('dashboard.title'));
    
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
          const profileResponse = await api.get('/pwd-member/profile');
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

  // Real-time updates - refresh data every 30 seconds
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(async () => {
      try {
        // Get user's barangay from currentUser
        const userBarangay = currentUser?.barangay || currentUser?.pwd_member?.barangay;
        
        // Use announcementService to get filtered announcements
        const filteredAnnouncements = await announcementService.getFilteredForPWDMember(userBarangay);
        
        // Fetch support tickets for this user
        const ticketsResponse = await api.get('/support-tickets');
        const ticketsData = ticketsResponse || [];
        const userTickets = ticketsData.filter(ticket => 
          ticket.pwd_member?.user?.id === currentUser?.id
        );
        
        
        setAnnouncements(filteredAnnouncements.slice(0, 3));
        setSupportTickets(userTickets);
        
        console.log('Dashboard data refreshed automatically');
      } catch (error) {
        console.error('Error refreshing dashboard data:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
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
                  borderColor: '#0b87ac',
                  background: '#F4F7FC',
                  color: '#0b87ac'
                }
              }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, color: '#000000', fontWeight: 600 }}>
              {t('common.dashboard')}
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
              {t('dashboard.title')}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#000000',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {t('dashboard.welcome', { 
                name: currentUser?.pwd_member?.firstName && currentUser?.pwd_member?.lastName 
                  ? `${currentUser.pwd_member.firstName} ${currentUser.pwd_member.lastName} ${currentUser.pwd_member.suffix || ''}`.trim()
                  : currentUser?.username || 'PWD Member'
              })}
            </Typography>
          </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} icon={<ErrorOutline />}>
            {error}
          </Alert>
        )}

          {/* Status Cards - Top Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ ...cardStyles, height: '100%', minHeight: 140 }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle sx={{ fontSize: 48, color: '#27AE60', mr: 2 }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#27AE60', mb: 0.5 }}>
                        {t('common.approved')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000' }}>
                        {t('dashboard.applicationStatus')}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ ...cardStyles, height: '100%', minHeight: 140 }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ fontSize: 48, color: '#3498DB', mr: 2 }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3498DB', mb: 0.5 }}>
                        PWD
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000', mb: 0.5 }}>
                        {t('dashboard.memberSince')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#3498DB', fontWeight: 'bold' }}>
                        {formatDate(memberSinceDate)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ ...cardStyles, height: '100%', minHeight: 140 }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Campaign sx={{ fontSize: 48, color: '#F39C12', mr: 2 }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F39C12', mb: 0.5 }}>
                        {announcements.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000' }}>
                        {t('common.announcements')}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ ...cardStyles, height: '100%', minHeight: 140 }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Support sx={{ fontSize: 48, color: '#E74C3C', mr: 2 }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#E74C3C', mb: 0.5 }}>
                        {supportTickets.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000' }}>
                        {t('support.myTickets')}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>


          {/* Dashboard Content */}
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Latest Announcements */}
            <Grid item xs={12} md={6}>
              <Card sx={{ ...cardStyles, height: '100%', minHeight: 400 }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Campaign sx={{ color: '#F39C12', fontSize: 24 }} />
                    <Typography sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '1.2rem' }}>
                      {t('dashboard.latestAnnouncements')}
                    </Typography>
                  </Box>
              
                  <Box sx={{ flex: 1 }}>
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
                            {index < announcements.length - 1 && <Divider key={`divider-${announcement.id}`} />}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <ErrorOutline sx={{ fontSize: 48, color: '#000000', mb: 2 }} />
                        <Typography variant="body1" sx={{ color: '#000000', mb: 1 }}>
                          {t('dashboard.noAnnouncements')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#000000' }}>
                          {t('dashboard.checkBackLater')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Support Desk */}
            <Grid item xs={12} md={6}>
              <Card sx={{ ...cardStyles, height: '100%', minHeight: 400 }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Support sx={{ color: '#E74C3C', fontSize: 24 }} />
                    <Typography sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '1.2rem' }}>
                      {t('dashboard.supportDesk')}
                    </Typography>
                  </Box>
              
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#000000', mb: 3 }}>
                      {t('dashboard.supportDescription')}
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
{t('dashboard.createSupportTicket')}
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
{t('dashboard.viewMyTickets')}
                      </Button>
                    </Box>
                    
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Phone sx={{ color: '#E74C3C', fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: '#000000' }}>
                          {t('common.phone')}: (049) 123-4567
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Email sx={{ color: '#E74C3C', fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: '#000000' }}>
                          {t('common.email')}: support@pdao.cabuyao.gov.ph
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ color: '#E74C3C', fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: '#000000' }}>
                          {t('dashboard.supportHours')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
      
      {/* Accessibility Settings Floating Button */}
      <AccessibilitySettings />
    </Box>
  );
}

export default PWDMemberDashboard;