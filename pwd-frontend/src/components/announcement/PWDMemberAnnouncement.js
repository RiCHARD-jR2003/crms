// src/components/announcement/PWDMemberAnnouncement.js
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import {
  Campaign,
  Schedule,
  Person,
  PriorityHigh,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import PWDMemberSidebar from '../shared/PWDMemberSidebar';
import AccessibilitySettings from '../shared/AccessibilitySettings';
import HelpGuide from '../shared/HelpGuide';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { useScreenReader } from '../../hooks/useScreenReader';
import announcementService from '../../services/announcementService';

function PWDMemberAnnouncement() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const { announcePageChange } = useScreenReader();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Announce page load
    announcePageChange(t('announcements.title'));
    
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user's barangay from currentUser
        const userBarangay = currentUser?.barangay || currentUser?.pwd_member?.barangay;
        console.log('Current User:', currentUser);
        console.log('User Barangay:', userBarangay);
        
        // Use announcementService to get filtered announcements
        const filteredAnnouncements = await announcementService.getFilteredForPWDMember(userBarangay);
        setAnnouncements(filteredAnnouncements);
        
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setError('Failed to load announcements. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAnnouncements();
    }
  }, [currentUser]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#E74C3C';
      case 'high': return '#E67E22';
      case 'medium': return '#F39C12';
      case 'low': return '#27AE60';
      default: return '#3498DB';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <PriorityHigh />;
      case 'high': return <Warning />;
      case 'medium': return <Info />;
      case 'low': return <CheckCircle />;
      default: return <Info />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
        <PWDMemberSidebar />
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          ml: '280px',
          width: 'calc(100% - 280px)'
        }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      <PWDMemberSidebar />
      
      {/* Main content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        ml: '280px',
        width: 'calc(100% - 280px)',
        p: 3,
        bgcolor: '#FFFFFF'
      }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#000000', mb: 1 }}>
            {t('announcements.title')}
          </Typography>
          <Typography variant="h6" sx={{ color: '#000000' }}>
            Stay updated with the latest news and important information from PDAO.
          </Typography>
        </Box>

        {/* Help Guide for Announcements */}
        <HelpGuide
          title="How to Read Announcements"
          type="info"
          steps={[
            {
              title: "Understanding Announcements",
              description: "Announcements show important news, updates, and information from PDAO that are relevant to your barangay. They appear in order from newest to oldest, with the most recent at the top."
            },
            {
              title: "Reading an Announcement",
              description: "Click on any announcement card to see the full details. Each announcement shows the title, date posted, priority level, and full message. Urgent announcements are shown in red, while regular ones are in blue."
            },
            {
              title: "Priority Levels",
              description: "Announcements have different priority levels: URGENT (red - immediate attention needed), HIGH (orange - important), MEDIUM (yellow - general info), and LOW (green - informational). Pay special attention to urgent announcements."
            },
            {
              title: "Barangay-Specific Announcements",
              description: "You will only see announcements that are relevant to your barangay or general announcements for all members. This ensures you only see information that applies to you."
            },
            {
              title: "Staying Updated",
              description: "Check announcements regularly for updates about benefits, events, deadlines, or changes to services. Important information like application deadlines or benefit distributions will be posted here."
            }
          ]}
        />

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Card */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Campaign sx={{ fontSize: 40, color: '#3498DB', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#000000' }}>
                  {announcements.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  {t('common.announcements')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <PriorityHigh sx={{ fontSize: 40, color: '#E74C3C', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#000000' }}>
                  {announcements.filter(a => a.priority === 'urgent').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  {t('announcements.urgent')} {t('common.announcements')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Schedule sx={{ fontSize: 40, color: '#F39C12', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#000000' }}>
                  {announcements.filter(a => {
                    const announcementDate = new Date(a.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return announcementDate > weekAgo;
                  }).length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  This Week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <CheckCircle sx={{ fontSize: 40, color: '#27AE60', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#000000' }}>
                  {announcements.filter(a => a.status === 'published').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  Published
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Announcements List */}
        <Paper elevation={0} sx={{
          p: 3,
          border: '1px solid #E0E0E0',
          borderRadius: 4,
          bgcolor: '#FFFFFF',
          height: '100%'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Campaign sx={{ color: '#F39C12', fontSize: 24 }} />
            <Typography sx={{ fontWeight: 700, color: '#000000', fontSize: '1.2rem' }}>
              {t('dashboard.latestAnnouncements')}
            </Typography>
          </Box>
          
          {announcements.length > 0 ? (
            <List>
              {announcements.map((announcement, index) => (
                <React.Fragment key={announcement.id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <Avatar sx={{ 
                        bgcolor: `${getPriorityColor(announcement.priority)}15`,
                        color: getPriorityColor(announcement.priority),
                        width: 40,
                        height: 40
                      }}>
                        {getPriorityIcon(announcement.priority)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
                            {announcement.title}
                          </Typography>
                          <Chip
                            label={announcement.priority?.toUpperCase() || 'MEDIUM'}
                            size="small"
                            sx={{
                              backgroundColor: getPriorityColor(announcement.priority) === 'success' ? '#27AE60' : 
                                             getPriorityColor(announcement.priority) === 'warning' ? '#F39C12' : '#E74C3C',
                              color: '#FFFFFF',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                          {/* Show barangay-specific badge */}
                          {announcement.targetAudience !== 'All' && 
                           announcement.targetAudience !== 'PWD Members' && 
                           announcement.targetAudience !== 'PWDMember' && (
                            <Chip
                              label={`${announcement.targetAudience} Barangay`}
                              size="small"
                              sx={{
                                backgroundColor: '#3498DB',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#000000', mb: 1 }}>
                            {announcement.content || announcement.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Person sx={{ fontSize: 16, color: '#666666' }} />
                              <Typography variant="caption" sx={{ color: '#666666' }}>
                                {announcement.author?.username || announcement.author?.name || 'PDAO Admin'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Schedule sx={{ fontSize: 16, color: '#666666' }} />
                              <Typography variant="caption" sx={{ color: '#666666' }}>
                                {formatDate(announcement.created_at)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < announcements.length - 1 && <Divider sx={{ borderColor: '#E0E0E0' }} />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Campaign sx={{ fontSize: 64, color: '#BDC3C7', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#000000', mb: 1 }}>
                {t('announcements.noAnnouncements')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                {t('announcements.noAnnouncementsDescription')}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Accessibility Settings Floating Button */}
      <AccessibilitySettings />
    </Box>
  );
}

export default PWDMemberAnnouncement;
