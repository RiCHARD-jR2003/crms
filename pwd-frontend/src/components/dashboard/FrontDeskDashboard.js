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
  CreditCard,
  SupportAgent,
  Announcement,
  CheckCircle,
  Schedule,
  Phone,
  Email,
  AccessTime,
  ErrorOutline,
  Menu
} from '@mui/icons-material';
import FrontDeskSidebar from '../shared/FrontDeskSidebar';
import AccessibilitySettings from '../shared/AccessibilitySettings';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { useScreenReader } from '../../hooks/useScreenReader';
import { supportService } from '../../services/supportService';
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

function FrontDeskDashboard() {
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
    totalCards: 0,
    pendingCards: 0,
    supportTickets: 0,
    announcements: 0
  });

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Navigation handlers
  const handleViewCards = () => {
    announcePageChange('PWD Card Management');
    navigate('/frontdesk-pwd-card');
  };

  const handleViewSupport = () => {
    announcePageChange('Support Desk');
    navigate('/frontdesk-support');
  };

  const handleViewAnnouncements = () => {
    announcePageChange('Announcements');
    navigate('/frontdesk-announcement');
  };

  useEffect(() => {
    // Announce page load
    announcePageChange('Front Desk Dashboard');
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch PWD cards statistics - using applications as proxy for cards
        const applicationsResponse = await api.get('/applications');
        const applications = applicationsResponse || [];
        
        // Mock PWD cards data based on applications
        const cards = applications.map(app => ({
          id: app.applicationID,
          status: app.status === 'Approved' ? 'issued' : 'pending',
          memberName: `${app.firstName} ${app.lastName}`,
          createdAt: app.created_at
        }));
        
        // Fetch support tickets
        const tickets = await supportService.getTickets();
        
        // Fetch announcements
        const announcementsResponse = await api.get('/announcements');
        const announcements = announcementsResponse.data || [];
        
        // Calculate statistics
        const totalCards = cards.length;
        const pendingCards = cards.filter(card => card.status === 'pending').length;
        const supportTickets = tickets.filter(ticket => ticket.status === 'open').length;
        
        setStats({
          totalCards,
          pendingCards,
          supportTickets,
          announcements: announcements.length
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
      <FrontDeskSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      
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
                  borderColor: '#9C27B0',
                  background: '#F3E5F5',
                  color: '#9C27B0'
                }
              }}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, color: '#000000', fontWeight: 600 }}>
              Front Desk Dashboard
            </Typography>
          </Box>

          {/* Page Header */}
          <Box sx={{ mb: { xs: 2, md: 4 } }}>
            <Typography variant="h4" sx={{ ...titleStyles, mb: 1 }}>
              Front Desk Dashboard
            </Typography>
            <Typography variant="h6" sx={{ ...subtitleStyles }}>
              PWD Cards, Support & Announcements
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
                    <Avatar sx={{ bgcolor: '#9C27B0', mr: 2 }}>
                      <CreditCard />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#9C27B0' }}>
                        {stats.totalCards}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Total PWD Cards
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
                        {stats.pendingCards}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Pending Cards
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
                    <Avatar sx={{ bgcolor: '#F44336', mr: 2 }}>
                      <SupportAgent />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#F44336' }}>
                        {stats.supportTickets}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Open Support Tickets
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
                      <Announcement />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                        {stats.announcements}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                        Active Announcements
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
                      startIcon={<CreditCard />}
                      onClick={handleViewCards}
                      sx={{
                        bgcolor: '#9C27B0',
                        '&:hover': { bgcolor: '#7B1FA2' },
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Manage PWD Cards
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<SupportAgent />}
                      onClick={handleViewSupport}
                      sx={{
                        borderColor: '#9C27B0',
                        color: '#9C27B0',
                        '&:hover': { 
                          borderColor: '#7B1FA2',
                          backgroundColor: '#F3E5F5'
                        },
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Support Desk
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Announcement />}
                      onClick={handleViewAnnouncements}
                      sx={{
                        borderColor: '#9C27B0',
                        color: '#9C27B0',
                        '&:hover': { 
                          borderColor: '#7B1FA2',
                          backgroundColor: '#F3E5F5'
                        },
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Manage Announcements
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={cardStyles}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    System Status
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: stats.supportTickets > 0 ? '#F44336' : '#4CAF50', width: 32, height: 32 }}>
                          <SupportAgent fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary="Support Tickets"
                        secondary={`${stats.supportTickets} open tickets`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                        secondaryTypographyProps={{ color: '#7F8C8D' }}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: stats.pendingCards > 0 ? '#FF9800' : '#4CAF50', width: 32, height: 32 }}>
                          <CreditCard fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary="PWD Cards"
                        secondary={`${stats.pendingCards} pending cards`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                        secondaryTypographyProps={{ color: '#7F8C8D' }}
                      />
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: '#4CAF50', width: 32, height: 32 }}>
                          <Announcement fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary="Announcements"
                        secondary={`${stats.announcements} active announcements`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                        secondaryTypographyProps={{ color: '#7F8C8D' }}
                      />
                    </ListItem>
                  </List>
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

export default FrontDeskDashboard;
