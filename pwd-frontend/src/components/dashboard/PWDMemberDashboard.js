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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  Menu,
  VolumeUp,
  CardGiftcard,
  Close as CloseIcon
} from '@mui/icons-material';
import PWDMemberSidebar from '../shared/PWDMemberSidebar';
import AccessibilitySettings from '../shared/AccessibilitySettings';
import HelpGuide, { InfoCard } from '../shared/HelpGuide';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { useScreenReader } from '../../hooks/useScreenReader';
import { useReadAloud } from '../../hooks/useReadAloud';
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
  const { readAloud, isReading } = useReadAloud();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [announcements, setAnnouncements] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [claimedBenefits, setClaimedBenefits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memberSinceDate, setMemberSinceDate] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Handle announcement click
  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedAnnouncement(null);
  };

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
        
        // Get user's barangay from currentUser - try multiple possible locations
        let userBarangay = currentUser?.barangay || 
                          currentUser?.pwd_member?.barangay || 
                          currentUser?.user?.barangay ||
                          currentUser?.profile?.barangay;
        
        // Fetch PWD member profile to get approval date and barangay (fetch this first to get barangay)
        let profileData = null;
        try {
          const profileResponse = await api.get('/pwd-member/profile');
          profileData = profileResponse;
          
          // Get the approval date from created_at or pwd_id_generated_at
          const approvalDate = profileData?.created_at || profileData?.pwd_id_generated_at;
          setMemberSinceDate(approvalDate);
          
          // Use barangay from profile if not found earlier - check multiple possible locations
          if (!userBarangay) {
            userBarangay = profileData?.barangay || 
                          profileData?.data?.barangay ||
                          profileData?.pwd_member?.barangay ||
                          profileData?.user?.barangay;
          }
        } catch (profileError) {
          console.log('Could not fetch PWD member profile, using fallback date');
          // Fallback: use current user's created_at if available
          setMemberSinceDate(currentUser?.created_at);
        }
        
        console.log('Dashboard - Current User:', currentUser);
        console.log('Dashboard - User Barangay:', userBarangay);
        console.log('Dashboard - Profile Data:', profileData);
        console.log('Dashboard - Profile Data barangay:', profileData?.barangay);
        console.log('Dashboard - Profile Data structure:', Object.keys(profileData || {}));
        
        // Use announcementService to get filtered announcements
        // If barangay is not found, try fetching announcements for "Members" (all PWD members)
        let filteredAnnouncements = [];
        if (userBarangay) {
          filteredAnnouncements = await announcementService.getFilteredForPWDMember(userBarangay);
        } else {
          console.warn('User barangay not found, trying to fetch announcements for "Members"');
          // Fallback: fetch announcements targeted to "Members" (all PWD members)
          try {
            filteredAnnouncements = await announcementService.getByAudience('Members');
            console.log('Dashboard - Fetched announcements for "Members":', filteredAnnouncements.length);
          } catch (error) {
            console.error('Error fetching announcements for Members:', error);
            filteredAnnouncements = [];
          }
        }
        
        console.log('Dashboard - Filtered announcements count:', filteredAnnouncements.length);
        console.log('Dashboard - User Barangay for filtering:', userBarangay);
        console.log('Dashboard - Filtered announcements:', filteredAnnouncements.map(a => ({ 
          id: a.id || a.announcementID, 
          title: a.title, 
          status: a.status, 
          targetAudience: a.targetAudience 
        })));
        console.log('Dashboard - Full first announcement:', filteredAnnouncements[0]);
        
        // Fetch support tickets for this user
        const ticketsResponse = await api.get('/support-tickets');
        const ticketsData = ticketsResponse || [];
        const userTickets = ticketsData.filter(ticket => 
          ticket.pwd_member?.user?.id === currentUser?.id
        );
        
        // Fetch claimed benefits for this user
        try {
          const benefitClaimsResponse = await api.get('/benefit-claims');
          const benefitClaimsData = Array.isArray(benefitClaimsResponse) ? benefitClaimsResponse : (benefitClaimsResponse?.data || []);
          const userClaimedBenefits = benefitClaimsData.filter(claim => 
            claim.pwdID === currentUser?.pwd_member?.userID || 
            claim.pwdID === currentUser?.id ||
            (claim.pwd_member && claim.pwd_member.userID === currentUser?.pwd_member?.userID)
          ).filter(claim => claim.status === 'Claimed');
          setClaimedBenefits(userClaimedBenefits.length);
        } catch (benefitError) {
          console.error('Error fetching claimed benefits:', benefitError);
          setClaimedBenefits(0);
        }
        
        // Ensure announcements are sorted by publishDate (newest first)
        const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
          const dateA = a.publishDate ? new Date(a.publishDate).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
          const dateB = b.publishDate ? new Date(b.publishDate).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
          return dateB - dateA; // Descending order (newest first)
        });
        
        console.log('Dashboard - Setting announcements state with count:', sortedAnnouncements.length);
        console.log('Dashboard - Announcements sorted (newest first):', sortedAnnouncements.map(a => ({
          id: a.id || a.announcementID,
          title: a.title,
          publishDate: a.publishDate,
          created_at: a.created_at
        })));
        setAnnouncements(sortedAnnouncements);
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
        // Get user's barangay from currentUser - try multiple possible locations
        let userBarangay = currentUser?.barangay || 
                          currentUser?.pwd_member?.barangay || 
                          currentUser?.user?.barangay ||
                          currentUser?.profile?.barangay;
        
        // If barangay is still not found, try fetching from profile
        if (!userBarangay) {
          try {
            const profileResponse = await api.get('/pwd-member/profile');
            userBarangay = profileResponse?.barangay || profileResponse?.data?.barangay;
          } catch (profileError) {
            console.warn('Could not fetch barangay from profile:', profileError);
          }
        }
        
        // Use announcementService to get filtered announcements
        const filteredAnnouncements = userBarangay 
          ? await announcementService.getFilteredForPWDMember(userBarangay)
          : [];
        
        // Fetch support tickets for this user
        const ticketsResponse = await api.get('/support-tickets');
        const ticketsData = ticketsResponse || [];
        const userTickets = ticketsData.filter(ticket => 
          ticket.pwd_member?.user?.id === currentUser?.id
        );
        
        // Fetch claimed benefits for this user
        try {
          const benefitClaimsResponse = await api.get('/benefit-claims');
          const benefitClaimsData = Array.isArray(benefitClaimsResponse) ? benefitClaimsResponse : (benefitClaimsResponse?.data || []);
          const userClaimedBenefits = benefitClaimsData.filter(claim => 
            claim.pwdID === currentUser?.pwd_member?.userID || 
            claim.pwdID === currentUser?.id ||
            (claim.pwd_member && claim.pwd_member.userID === currentUser?.pwd_member?.userID)
          ).filter(claim => claim.status === 'Claimed');
          setClaimedBenefits(userClaimedBenefits.length);
        } catch (benefitError) {
          console.error('Error fetching claimed benefits:', benefitError);
          setClaimedBenefits(0);
        }
        
        console.log('Dashboard Refresh - Filtered announcements count:', filteredAnnouncements.length);
        setAnnouncements(filteredAnnouncements);
        setSupportTickets(userTickets);
        
        console.log('Dashboard data refreshed automatically');
      } catch (error) {
        console.error('Error refreshing dashboard data:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentUser]);

  // Debug: Log when announcements state changes
  useEffect(() => {
    console.log('Dashboard - Announcements state changed. Count:', announcements.length);
    console.log('Dashboard - Announcements:', announcements.map(a => ({ 
      id: a.id, 
      title: a.title, 
      status: a.status 
    })));
  }, [announcements]);

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

          {/* Help Guide for Dashboard */}
          <HelpGuide
            title={t('guide.dashboard.title')}
            type="info"
            steps={[
              {
                title: t('guide.dashboard.steps.understand.title'),
                description: t('guide.dashboard.steps.understand.description')
              },
              {
                title: t('guide.dashboard.steps.announcements.title'),
                description: t('guide.dashboard.steps.announcements.description')
              },
              {
                title: t('guide.dashboard.steps.tickets.title'),
                description: t('guide.dashboard.steps.tickets.description')
              },
              {
                title: t('guide.dashboard.steps.sections.title'),
                description: t('guide.dashboard.steps.sections.description')
              },
              {
                title: t('guide.dashboard.steps.help.title'),
                description: t('guide.dashboard.steps.help.description')
              }
            ]}
          />

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
                      <Button
                        variant="text"
                        size="small"
                        onClick={handleViewMyTickets}
                        sx={{ 
                          color: '#E74C3C',
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          p: 0,
                          mt: 0.5,
                          '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                        }}
                      >
                        {t('buttons.viewSupportTickets')}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ ...cardStyles, height: '100%', minHeight: 140 }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CardGiftcard sx={{ fontSize: 48, color: '#F39C12', mr: 2 }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F39C12', mb: 0.5 }}>
                        {claimedBenefits}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000' }}>
                        Claimed Benefits
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontSize: '0.75rem', mt: 0.5 }}>
                        Total benefits claimed
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>


          {/* Announcements Section - Full Width */}
          <Card sx={{ ...cardStyles, minHeight: 400, maxHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexShrink: 0 }}>
                <Campaign sx={{ color: '#F39C12', fontSize: 24 }} />
                <Typography sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '1.2rem' }}>
                  {t('dashboard.announcements')} ({announcements.length})
                </Typography>
              </Box>
          
              {announcements.length > 0 ? (
                <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                  <Table size="medium" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: '#F8F9FA', color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', borderBottom: '2px solid #E0E0E0' }}>Title</TableCell>
                        <TableCell sx={{ bgcolor: '#F8F9FA', color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', borderBottom: '2px solid #E0E0E0', width: 100 }}>Type</TableCell>
                        <TableCell sx={{ bgcolor: '#F8F9FA', color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', borderBottom: '2px solid #E0E0E0', width: 100 }}>Priority</TableCell>
                        <TableCell sx={{ bgcolor: '#F8F9FA', color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', borderBottom: '2px solid #E0E0E0', width: 130 }}>Published</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {announcements.map((announcement, index) => {
                        const uniqueKey = announcement.id || announcement.announcementID || `announcement-${index}`;
                        return (
                          <TableRow
                            key={uniqueKey}
                            sx={{
                              cursor: 'pointer',
                              bgcolor: index % 2 ? '#F7FBFF' : 'white',
                              '&:hover': {
                                bgcolor: '#E8F4F8',
                                transition: 'background-color 0.2s'
                              }
                            }}
                            onClick={() => handleViewAnnouncement(announcement)}
                          >
                            <TableCell sx={{ py: 2 }}>
                              <Typography sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.9rem' }}>
                                {announcement.title}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={announcement.type || 'Notice'}
                                size="small"
                                sx={{
                                  bgcolor: announcement.type === 'Urgent' ? '#E74C3C' : announcement.type === 'Event' ? '#27AE60' : '#3498DB',
                                  color: '#FFFFFF',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 24
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                label={announcement.priority || 'Medium'}
                                size="small"
                                sx={{
                                  bgcolor: announcement.priority === 'High' ? '#E74C3C' : announcement.priority === 'Medium' ? '#F39C12' : '#27AE60',
                                  color: '#FFFFFF',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 24
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2, color: '#666', fontSize: '0.8rem' }}>
                              {formatDate(announcement.publishDate || announcement.created_at)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <ErrorOutline sx={{ fontSize: 64, color: '#bdc3c7', mb: 3 }} />
                  <Typography variant="h5" sx={{ color: '#7f8c8d', mb: 2, fontWeight: 500 }}>
                    {t('dashboard.noAnnouncements')}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#95a5a6' }}>
                    {t('dashboard.checkBackLater')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Announcement Details Dialog */}
      <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: '#FFFFFF',
          color: '#2C3E50',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E0E0E0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Campaign sx={{ color: '#F39C12' }} />
            <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 700 }}>
              Announcement Details
            </Typography>
          </Box>
          <IconButton onClick={handleCloseViewDialog} sx={{ color: '#666' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#FFFFFF', p: 3 }}>
          {selectedAnnouncement && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C3E50', mb: 2 }}>
                {selectedAnnouncement.title}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                <Chip 
                  label={selectedAnnouncement.type || 'Notice'} 
                  size="small" 
                  sx={{ 
                    bgcolor: selectedAnnouncement.type === 'Urgent' ? '#E74C3C' : '#3498DB', 
                    color: '#FFF', 
                    fontWeight: 600 
                  }} 
                />
                <Chip 
                  label={selectedAnnouncement.priority || 'Medium'} 
                  size="small" 
                  sx={{ 
                    bgcolor: selectedAnnouncement.priority === 'High' ? '#E74C3C' : selectedAnnouncement.priority === 'Medium' ? '#F39C12' : '#27AE60', 
                    color: '#FFF', 
                    fontWeight: 600 
                  }} 
                />
              </Box>

              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ 
                bgcolor: '#F8F9FA', 
                p: 3, 
                borderRadius: 2,
                mb: 3,
                border: '1px solid #E0E0E0'
              }}>
                <Typography 
                  sx={{ 
                    color: '#2C3E50', 
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {selectedAnnouncement.content || 'No content available.'}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: '#7F8C8D', fontWeight: 600 }}>
                    Published
                  </Typography>
                  <Typography sx={{ color: '#27AE60', fontWeight: 500 }}>
                    {formatDate(selectedAnnouncement.publishDate || selectedAnnouncement.created_at)}
                  </Typography>
                </Grid>
                {selectedAnnouncement.expiryDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: '#7F8C8D', fontWeight: 600 }}>
                      Expires
                    </Typography>
                    <Typography sx={{ color: '#E67E22', fontWeight: 500 }}>
                      {formatDate(selectedAnnouncement.expiryDate)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid #E0E0E0', 
          p: 2,
          gap: 2,
          backgroundColor: '#FFFFFF'
        }}>
          {selectedAnnouncement && (
            <Button
              onClick={() => {
                const fullText = `${selectedAnnouncement.title}. ${selectedAnnouncement.content || 'No content available.'}`;
                readAloud(fullText);
              }}
              variant="outlined"
              disabled={isReading}
              startIcon={<VolumeUp />}
              sx={{
                borderColor: '#F39C12',
                color: '#F39C12',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#E67E22',
                  backgroundColor: '#F39C1215'
                }
              }}
            >
              {isReading ? t('buttons.reading') : t('buttons.readAloud')}
            </Button>
          )}
          <Button 
            onClick={handleCloseViewDialog} 
            variant="contained"
            sx={{ 
              bgcolor: '#0b87ac',
              textTransform: 'none',
              fontWeight: 600,
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#0a6b8a' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Accessibility Settings Floating Button */}
      <AccessibilitySettings />
    </Box>
  );
}

export default PWDMemberDashboard;