import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CloseIcon from '@mui/icons-material/Close';
import BarangayPresidentSidebar from '../shared/BarangayPresidentSidebar';
import { useAuth } from '../../contexts/AuthContext';
import announcementService from '../../services/announcementService';

function BarangayPresidentAnnouncement() {
  const { currentUser } = useAuth();
  const barangay = currentUser?.barangay || 'Barangay Poblacion';
  
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Fetch announcements from database
  useEffect(() => {
    fetchAnnouncements();
  }, [barangay]); // Re-fetch when barangay changes

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch announcements filtered by the barangay president's barangay
      const data = await announcementService.getByAudience(barangay);
      console.log(`Fetched announcements for ${barangay}:`, data);
      
      // Process the announcements to include author information
      const filteredAnnouncements = data.map(announcement => ({
        ...announcement,
        author: announcement.author?.username || 'Admin',
        authorRole: announcement.author?.role || 'Admin'
      }));
      
      setAnnouncements(filteredAnnouncements);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to fetch announcements');
      // Fallback to empty array if API fails
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedAnnouncement(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return '#E74C3C';
      case 'Medium':
        return '#F39C12';
      case 'Low':
        return '#27AE60';
      default:
        return '#7F8C8D';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Emergency':
        return '#E74C3C';
      case 'Notice':
        return '#F39C12';
      case 'Event':
        return '#3498DB';
      case 'Information':
        return '#27AE60';
      default:
        return '#7F8C8D';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#27AE60';
      case 'Draft':
        return '#7F8C8D';
      case 'Archived':
        return '#E74C3C';
      default:
        return '#7F8C8D';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
        <BarangayPresidentSidebar />
        <Box sx={{ flex: 1, ml: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      <BarangayPresidentSidebar />
      
      <Box sx={{ 
        flex: 1, 
        ml: { xs: 0, sm: '280px' }, 
        width: { xs: '100%', sm: 'calc(100% - 280px)' },
        p: { xs: 2, sm: 3 },
        minHeight: '100vh',
        overflow: 'auto',
        transition: 'all 0.3s ease',
        bgcolor: '#FFFFFF'
      }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '2rem', color: '#000000', mb: 1 }}>
            Announcements - {barangay}
          </Typography>
          <Typography sx={{ color: '#000000', fontSize: '1rem' }}>
            View announcements from Admin for {barangay}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Announcements Grid */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {announcements.map((announcement) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={announcement.announcementID}>
                             <Card sx={{ 
                 height: { xs: 'auto', sm: '280px' }, // Responsive height
                 width: '100%', // Fixed width
                 display: 'flex', 
                 flexDirection: 'column',
                 boxShadow: 2,
                 overflow: 'hidden', // Prevent content overflow
                 borderRadius: 2,
                 bgcolor: '#FFFFFF', // White background
                 border: '1px solid #E0E0E0',
                 '&:hover': {
                   boxShadow: 4,
                   transform: 'translateY(-2px)',
                   transition: 'all 0.3s ease'
                 }
               }}>
                 <CardContent sx={{ 
                   flexGrow: 1, 
                   display: 'flex', 
                   flexDirection: 'column',
                   p: { xs: 1.5, sm: 2 },
                   '&:last-child': { pb: { xs: 1.5, sm: 2 } } // Override default padding
                 }}>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                     <Typography 
                       variant="h6" 
                       sx={{ 
                         fontWeight: 600, 
                         color: '#000000', 
                         flex: 1,
                         overflow: 'hidden',
                         textOverflow: 'ellipsis',
                         whiteSpace: 'nowrap',
                         fontSize: '1rem',
                         lineHeight: 1.2
                       }}
                     >
                       {announcement.title}
                     </Typography>
                     <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                       <Chip
                         label={announcement.type}
                         size="small"
                         sx={{
                           backgroundColor: '#3498DB',
                           color: '#FFFFFF',
                           fontWeight: 600,
                           fontSize: '0.6rem',
                           height: '20px'
                         }}
                       />
                       <Chip
                         label={announcement.priority}
                         size="small"
                         sx={{
                           backgroundColor: getPriorityColor(announcement.priority) === 'success' ? '#27AE60' : 
                                          getPriorityColor(announcement.priority) === 'warning' ? '#F39C12' : '#E74C3C',
                           color: '#FFFFFF',
                           fontWeight: 600,
                           fontSize: '0.6rem',
                           height: '20px'
                         }}
                       />
                     </Box>
                   </Box>
                   
                   <Typography 
                     variant="body2" 
                     sx={{ 
                       color: '#000000', 
                       mb: 1, 
                       lineHeight: 1.4,
                       overflow: 'hidden',
                       display: '-webkit-box',
                       WebkitLineClamp: 3,
                       WebkitBoxOrient: 'vertical',
                       flex: 1,
                       fontSize: '0.8rem',
                       minHeight: '0'
                     }}
                   >
                     {announcement.content}
                   </Typography>
                   
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                     <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.7rem' }}>
                       Target: {announcement.targetAudience}
                     </Typography>
                     <Typography variant="caption" sx={{ color: '#666666', fontSize: '0.7rem' }}>
                       Views: {announcement.views || 0}
                     </Typography>
                   </Box>
                   
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                     <Typography variant="caption" sx={{ color: '#4CAF50', fontSize: '0.7rem' }}>
                       Published: {announcement.publishDate}
                     </Typography>
                     <Typography variant="caption" sx={{ color: '#FF9800', fontSize: '0.7rem' }}>
                       Expires: {announcement.expiryDate}
                     </Typography>
                   </Box>
                   
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 'auto' }}>
                     <AnnouncementIcon sx={{ color: '#0b87ac', fontSize: '0.8rem' }} />
                     <Typography variant="caption" sx={{ color: '#000000', fontWeight: 600, fontSize: '0.7rem' }}>
                       {announcement.author?.username || announcement.author?.name || 'Admin'} ({announcement.authorRole || 'Admin'})
                     </Typography>
                   </Box>
                 </CardContent>
                 
                 <CardActions sx={{ justifyContent: 'center', p: 1, pt: 0 }}>
                   <Button
                     variant="outlined"
                     startIcon={<VisibilityIcon />}
                     onClick={() => handleViewDetails(announcement)}
                     size="small"
                     sx={{ 
                       color: '#3498DB',
                       borderColor: '#3498DB',
                       textTransform: 'none',
                       fontWeight: 600,
                       fontSize: '0.7rem',
                       py: 0.5,
                       px: 1,
                       '&:hover': {
                         borderColor: '#2980B9',
                         backgroundColor: '#E3F2FD'
                       }
                     }}
                   >
                     View Details
                   </Button>
                 </CardActions>
               </Card>
            </Grid>
          ))}
        </Grid>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty State */}
        {!loading && announcements.length === 0 && (
          <Paper elevation={0} sx={{ 
            p: 4, 
            border: '1px solid #E0E0E0', 
            borderRadius: 2, 
            bgcolor: '#FFFFFF',
            textAlign: 'center'
          }}>
            <AnnouncementIcon sx={{ fontSize: 64, color: '#E0E0E0', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
              No announcements for {barangay}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              There are no announcements specifically targeted to {barangay} at the moment.
            </Typography>
          </Paper>
        )}

        {/* View Details Dialog */}
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
              <AnnouncementIcon sx={{ color: '#0b87ac' }} />
              <Typography variant="h6" sx={{ color: '#000000 !important' }}>
                Announcement Details
              </Typography>
            </Box>
            <IconButton onClick={handleCloseViewDialog} sx={{ color: '#000000' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent 
            sx={{ 
              backgroundColor: '#FFFFFF !important',
              color: '#000000 !important',
              '& *': { 
                color: '#000000 !important',
                '& .MuiTypography-root': { color: '#000000 !important' },
                '& .MuiChip-root': { color: '#000000 !important' },
                '& .MuiChip-label': { color: '#000000 !important' },
                '& .MuiBox-root': { color: '#000000 !important' },
                '& .MuiGrid-root': { color: '#000000 !important' },
                '& p': { color: '#000000 !important' },
                '& span': { color: '#000000 !important' },
                '& div': { color: '#000000 !important' }
              }
            }}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#000000',
              '--text-color': '#000000'
            }}
          >
            {selectedAnnouncement && (
              <Box sx={{ mt: 1 }}>
                {/* Header with title and chips */}
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ fontWeight: 700, color: '#000000 !important', mb: 2, backgroundColor: '#E8F0FE', p: 1, borderRadius: 1 }}
                    style={{ color: '#000000' }}
                  >
                    {selectedAnnouncement.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={selectedAnnouncement.type}
                      sx={{
                        backgroundColor: `${getTypeColor(selectedAnnouncement.type)}15`,
                        color: getTypeColor(selectedAnnouncement.type),
                        fontWeight: 600,
                        '& .MuiChip-label': { color: getTypeColor(selectedAnnouncement.type) }
                      }}
                      style={{ color: getTypeColor(selectedAnnouncement.type) }}
                    />
                    <Chip
                      label={selectedAnnouncement.priority}
                      sx={{
                        backgroundColor: `${getPriorityColor(selectedAnnouncement.priority)}15`,
                        color: getPriorityColor(selectedAnnouncement.priority),
                        fontWeight: 600,
                        '& .MuiChip-label': { color: getPriorityColor(selectedAnnouncement.priority) }
                      }}
                      style={{ color: getPriorityColor(selectedAnnouncement.priority) }}
                    />
                    <Chip
                      label={selectedAnnouncement.status}
                      sx={{
                        backgroundColor: `${getStatusColor(selectedAnnouncement.status)}15`,
                        color: getStatusColor(selectedAnnouncement.status),
                        fontWeight: 600,
                        '& .MuiChip-label': { color: getStatusColor(selectedAnnouncement.status) }
                      }}
                      style={{ color: getStatusColor(selectedAnnouncement.status) }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 3, borderColor: '#E0E0E0' }} />

                {/* Content */}
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ fontWeight: 600, color: '#000000 !important', mb: 1, backgroundColor: '#E8F0FE', p: 1, borderRadius: 1 }}
                    style={{ color: '#000000' }}
                  >
                    Content
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ color: '#000000 !important', lineHeight: 1.8, backgroundColor: '#F5F5F5', p: 2, borderRadius: 1 }}
                    style={{ color: '#000000' }}
                  >
                    {selectedAnnouncement.content}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3, borderColor: '#E0E0E0' }} />

                {/* Details Grid */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="h6" 
                      sx={{ fontWeight: 600, color: '#000000 !important', mb: 2, backgroundColor: '#E8F0FE', p: 1, borderRadius: 1 }}
                      style={{ color: '#000000' }}
                    >
                      Announcement Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ color: '#666666 !important', fontWeight: 600 }}
                          style={{ color: '#666666' }}
                        >
                          Target Audience
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ color: '#000000 !important' }}
                          style={{ color: '#000000' }}
                        >
                          {selectedAnnouncement.targetAudience}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ color: '#666666 !important', fontWeight: 600 }}
                          style={{ color: '#666666' }}
                        >
                          Publish Date
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ color: '#000000 !important' }}
                          style={{ color: '#000000' }}
                        >
                          {new Date(selectedAnnouncement.publishDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ color: '#666666 !important', fontWeight: 600 }}
                          style={{ color: '#666666' }}
                        >
                          Expiry Date
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ color: '#000000 !important' }}
                          style={{ color: '#000000' }}
                        >
                          {new Date(selectedAnnouncement.expiryDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="h6" 
                      sx={{ fontWeight: 600, color: '#000000 !important', mb: 2, backgroundColor: '#E8F0FE', p: 1, borderRadius: 1 }}
                      style={{ color: '#000000' }}
                    >
                      Author Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ color: '#666666 !important', fontWeight: 600 }}
                          style={{ color: '#666666' }}
                        >
                          Author
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ color: '#000000 !important' }}
                          style={{ color: '#000000' }}
                        >
                          {selectedAnnouncement.author?.username || selectedAnnouncement.author?.name || 'Admin'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ color: '#666666 !important', fontWeight: 600 }}
                          style={{ color: '#666666' }}
                        >
                          Role
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ color: '#000000 !important' }}
                          style={{ color: '#000000' }}
                        >
                          {selectedAnnouncement.authorRole}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ color: '#666666 !important', fontWeight: 600 }}
                          style={{ color: '#666666' }}
                        >
                          Views
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ color: '#000000 !important' }}
                          style={{ color: '#000000' }}
                        >
                          {selectedAnnouncement.views || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, backgroundColor: '#FFFFFF' }}>
            <Button 
              onClick={handleCloseViewDialog} 
              variant="contained"
              sx={{ 
                bgcolor: '#0b87ac',
                textTransform: 'none',
                fontWeight: 600,
                color: 'white',
                '&:hover': {
                  bgcolor: '#0a6b8a'
                }
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

export default BarangayPresidentAnnouncement;
