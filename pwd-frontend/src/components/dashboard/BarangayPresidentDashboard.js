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
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  BarChart,
  Close as CloseIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import BarangayPresidentSidebar from '../shared/BarangayPresidentSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import dashboardService from '../../services/dashboardService';
import announcementService from '../../services/announcementService';
import toastService from '../../services/toastService';
import { formatDateTime } from '../../utils/dateTimeFormatter';
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
  const navigate = useNavigate();
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
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcingToMembers, setAnnouncingToMembers] = useState(false);
  const [announcedAnnouncements, setAnnouncedAnnouncements] = useState(new Set());

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

  // Format announcement content to properly display line breaks, bullets, and numbered lists
  const formatAnnouncementContent = (content) => {
    if (!content) return [];
    
    // Split by lines and process each line
    const lines = content.split('\n');
    const formattedLines = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines but keep them for spacing
      if (!trimmedLine) {
        formattedLines.push({ type: 'empty', content: '' });
        return;
      }
      
      // Check for section headers (all caps words followed by colon, or specific patterns)
      if (trimmedLine.match(/^[A-Z][A-Z\s:]+:$/) || 
          trimmedLine.match(/^[A-Z\s]{3,}:$/) ||
          trimmedLine.match(/^(PROGRAM|ELIGIBILITY|IMPORTANT|CLAIMING|VENUE|CONTACT|NOTE):$/i)) {
        formattedLines.push({ type: 'header', content: trimmedLine });
        return;
      }
      
      // Check for numbered lists (1., 2., 3., etc. or 1), 2), etc.)
      if (trimmedLine.match(/^\d+[\.\)]\s/)) {
        formattedLines.push({ type: 'numbered', content: trimmedLine });
        return;
      }
      
      // Check for bullet points (•, -, *, or lines starting with spaces and bullet)
      if (trimmedLine.match(/^[•\-\*]\s/) || 
          trimmedLine.match(/^[•\-\*]/) ||
          trimmedLine.match(/^\s+[•\-\*]/)) {
        formattedLines.push({ type: 'bullet', content: trimmedLine });
        return;
      }
      
      // Regular text
      formattedLines.push({ type: 'text', content: trimmedLine });
    });
    
    return formattedLines;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch PWD members statistics
      const pwdResponse = await api.get('/pwd-members');
      // Handle both response formats: {success: true, data: [...]} or direct array
      const pwdMembers = (pwdResponse?.data && Array.isArray(pwdResponse.data)) 
        ? pwdResponse.data 
        : (Array.isArray(pwdResponse) ? pwdResponse : []);
      
      // Fetch applications directly from API for recent applications
      const applicationsResponse = await api.get('/applications');
      const applications = (applicationsResponse || []).sort((a,b)=>{
        const aTime = a.submissionDate ? new Date(a.submissionDate).getTime() : 0;
        const bTime = b.submissionDate ? new Date(b.submissionDate).getTime() : 0;
        return bTime - aTime;
      });
      
      // Filter by barangay - use user's barangay or fallback
      const targetBarangay = currentUser?.barangay || 'Unknown Barangay';
      const barangayMembers = pwdMembers.filter(member => member.barangay === targetBarangay);
      const barangayApplications = applications.filter(app => app.barangay === targetBarangay);
      
      // Fetch announcements filtered by barangay using the proper API endpoint
      // This uses backend filtering for better performance and consistency
      const announcementsResponse = await announcementService.getByAudience(targetBarangay);
      
      // Handle response format - ensure we get an array
      const filteredAnnouncements = Array.isArray(announcementsResponse) 
        ? announcementsResponse 
        : (announcementsResponse?.data || []);
      
      console.log('Fetched announcements for barangay:', targetBarangay);
      console.log('Announcements response:', announcementsResponse);
      console.log('Filtered announcements array:', filteredAnnouncements);
      console.log('Number of announcements:', filteredAnnouncements.length);
      
      // Sort by latest first (backend should do this, but ensure on frontend too)
      filteredAnnouncements.sort((a, b) => {
        const dateA = new Date(a.publishDate || a.created_at || 0);
        const dateB = new Date(b.publishDate || b.created_at || 0);
        return dateB - dateA;
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

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const handleViewDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedAnnouncement(null);
    setAnnouncingToMembers(false);
  };

  const handleAnnounceToMembers = async () => {
    if (!selectedAnnouncement) return;

    try {
      setAnnouncingToMembers(true);
      const response = await announcementService.announceToMembers(selectedAnnouncement.announcementID);
      
      if (response.success) {
        toastService.success(
          `Announcement sent successfully! Notifications sent to ${response.notifications_sent} members. ${response.eligibility_notices_sent} eligibility notices sent.`
        );
        // Mark this announcement as announced
        setAnnouncedAnnouncements(prev => new Set([...prev, selectedAnnouncement.announcementID]));
        // Refresh announcements
        await fetchDashboardData();
        handleCloseViewDialog();
      } else {
        toastService.error(response.message || 'Failed to announce to members');
      }
    } catch (error) {
      console.error('Error announcing to members:', error);
      toastService.error('Failed to announce to members: ' + (error.message || 'Unknown error'));
    } finally {
      setAnnouncingToMembers(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return '#000000';
    const normalizedStatus = status.toLowerCase().trim();
    if (normalizedStatus === 'approved' || normalizedStatus === 'active') return '#27AE60';
    if (normalizedStatus === 'pending barangay approval' || normalizedStatus === 'pending admin approval' || normalizedStatus.includes('pending')) return '#F39C12';
    if (normalizedStatus === 'pending admin approval') return '#3498DB';
    if (normalizedStatus === 'rejected' || normalizedStatus === 'inactive') return '#E74C3C';
    if (normalizedStatus === 'expired') return '#E74C3C';
    if (normalizedStatus === 'for claiming') return '#3498DB';
    if (normalizedStatus === 'for renewal') return '#E74C3C';
    return '#000000';
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
                    onClick={() => navigate('/barangay-president-pwd-records')}
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
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'white', borderBottom: '2px solid #E0E0E0' }}>
                      <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Applicant</TableCell>
                      <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Status</TableCell>
                      <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Applied Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentApplications.map((application, index) => (
                      <TableRow 
                        key={`application-${index}`} 
                        sx={{ 
                          bgcolor: index % 2 ? '#F7FBFF' : 'white',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: index % 2 ? '#E8F4F8' : '#F5F5F5',
                            transition: 'background-color 0.2s'
                          }
                        }}
                        onClick={() => {
                          if (application.applicationID) {
                            navigate(`/barangay-president-pwd-records?applicationId=${application.applicationID}`);
                          }
                        }}
                      >
                        <TableCell sx={{ py: 2, px: 2, fontSize: '0.8rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#3498DB', fontSize: '0.75rem' }}>
                              {application.firstName?.charAt(0) || 'A'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#0b87ac', fontSize: '0.8rem' }}>
                                {application.firstName} {application.lastName} {application.suffix || ''}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#000000', fontSize: '0.7rem' }}>
                                {application.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2, px: 2 }}>
                          <Chip
                            label={application.status?.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(application.status)}15`,
                              color: getStatusColor(application.status),
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 24
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#000000', fontSize: '0.8rem', py: 2, px: 2 }}>
                          {formatDateMMDDYYYY(application.created_at)}
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
                  <TableContainer sx={{ flex: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'white', borderBottom: '2px solid #E0E0E0' }}>
                          <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', py: 1.5, px: 1 }}>Title</TableCell>
                          <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', py: 1.5, px: 1 }}>Type</TableCell>
                          <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', py: 1.5, px: 1 }}>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentAnnouncements.map((announcement, index) => (
                          <TableRow
                            key={`announcement-${index}`}
                            sx={{ 
                              cursor: 'pointer',
                              bgcolor: index % 2 ? '#F7FBFF' : 'white',
                              '&:hover': {
                                bgcolor: '#E8F4F8',
                                transition: 'background-color 0.2s'
                              }
                            }}
                            onClick={() => {
                              setSelectedAnnouncement(announcement);
                              setViewDialog(true);
                            }}
                          >
                            <TableCell sx={{ py: 1.5, px: 1 }}>
                              <Typography sx={{ fontWeight: 500, color: '#2C3E50', fontSize: '0.85rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {announcement.title}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.5, px: 1 }}>
                              <Chip
                                label={announcement.type || 'Notice'}
                                size="small"
                                sx={{
                                  bgcolor: announcement.type === 'Urgent' ? '#E74C3C' : announcement.type === 'Event' ? '#27AE60' : '#3498DB',
                                  color: '#FFFFFF',
                                  fontWeight: 600,
                                  fontSize: '0.65rem',
                                  height: 22
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1.5, px: 1, color: '#666', fontSize: '0.75rem' }}>
                              {formatDateMMDDYYYY(announcement.publishDate || announcement.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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

        {/* Announcement Details Dialog */}
        <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ 
            backgroundColor: '#FFFFFF',
            color: '#000000 !important', 
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Campaign sx={{ color: '#0b87ac' }} />
              <Typography variant="h6" sx={{ color: '#000000 !important' }}>
                Announcement Details
              </Typography>
            </Box>
            <IconButton onClick={handleCloseViewDialog} sx={{ color: '#000000' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#FFFFFF !important', color: '#000000 !important' }}>
            {selectedAnnouncement && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#000000 !important', mb: 2 }}>
                  {selectedAnnouncement.title}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ 
                  color: '#000000 !important', 
                  lineHeight: 1.8, 
                  backgroundColor: '#F5F5F5', 
                  p: 2, 
                  borderRadius: 1,
                  mb: 3
                }}>
                  {formatAnnouncementContent(selectedAnnouncement.content || '').map((item, idx) => {
                    if (item.type === 'empty') {
                      return <Box key={idx} sx={{ height: '0.5rem' }} />;
                    } else if (item.type === 'header') {
                      return (
                        <Typography key={idx} variant="h6" sx={{ color: '#0b87ac !important', mt: 2, mb: 1, fontWeight: 700 }}>
                          {item.content}
                        </Typography>
                      );
                    } else if (item.type === 'bullet') {
                      const text = item.content.replace(/^[•\-\*]\s*/, '');
                      return (
                        <Typography key={idx} variant="body2" sx={{ color: '#000000 !important', pl: 3, mb: 0.5 }}>
                          • {text}
                        </Typography>
                      );
                    } else if (item.type === 'numbered') {
                      return (
                        <Typography key={idx} variant="body2" sx={{ color: '#000000 !important', pl: 3, mb: 0.5 }}>
                          {item.content}
                        </Typography>
                      );
                    } else {
                      return (
                        <Typography key={idx} variant="body2" sx={{ color: '#000000 !important', mb: 0.5 }}>
                          {item.content}
                        </Typography>
                      );
                    }
                  })}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    <strong>Target Audience:</strong> {selectedAnnouncement.targetAudience}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    <strong>Published:</strong> {formatDateTime(selectedAnnouncement.publishDate)}
                  </Typography>
                  {selectedAnnouncement.expiryDate && (
                    <Typography variant="body2" sx={{ color: '#666666' }}>
                      <strong>Expires:</strong> {formatDateTime(selectedAnnouncement.expiryDate)}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, backgroundColor: '#FFFFFF', gap: 2 }}>
            {selectedAnnouncement && selectedAnnouncement.status === 'Active' && !announcedAnnouncements.has(selectedAnnouncement.announcementID) && (
              <Button 
                onClick={handleAnnounceToMembers}
                variant="contained"
                disabled={announcingToMembers}
                startIcon={announcingToMembers ? <CircularProgress size={16} /> : <Campaign />}
                sx={{ 
                  bgcolor: '#27AE60',
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'white',
                  '&:hover': { bgcolor: '#229954' },
                  '&:disabled': { bgcolor: '#BDC3C7' }
                }}
              >
                {announcingToMembers ? 'Announcing...' : 'Announce to All Registered Members'}
              </Button>
            )}
            {selectedAnnouncement && announcedAnnouncements.has(selectedAnnouncement.announcementID) && (
              <Chip 
                label="Already Announced" 
                color="success" 
                sx={{ fontWeight: 600 }}
              />
            )}
            <Button 
              onClick={handleCloseViewDialog} 
              variant="contained"
              sx={{ 
                bgcolor: '#0b87ac',
                textTransform: 'none',
                fontWeight: 600,
                color: 'white',
                '&:hover': { bgcolor: '#0a6b8a' }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default BarangayPresidentDashboard;