import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  Badge
} from '@mui/material';
import {
  Campaign,
  Add,
  Edit,
  Delete,
  Visibility,
  Schedule,
  CheckCircle,
  Warning,
  Notifications,
  Public,
  PriorityHigh,
  Close,
  Menu as MenuIcon
} from '@mui/icons-material';
import AdminSidebar from '../shared/AdminSidebar';
import FrontDeskSidebar from '../shared/FrontDeskSidebar';
import { useAuth } from '../../contexts/AuthContext';
import announcementService from '../../services/announcementService';

const Announcement = () => {
  const { currentUser } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: '',
    priority: '',
    targetAudience: '',
    status: 'Active',
    publishDate: '', // Will be set automatically by backend
    expiryDate: ''
  });

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

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Statistics state
  const [stats, setStats] = useState({
    activeAnnouncements: 0,
    totalViews: 0,
    highPriority: 0,
    eventAnnouncements: 0
  });


  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const calculateStats = (announcementsData) => {
    const activeAnnouncements = announcementsData.filter(ann => ann.status === 'Active').length;
    const totalViews = announcementsData.reduce((sum, ann) => sum + (ann.views || 0), 0);
    const highPriority = announcementsData.filter(ann => ann.priority === 'High').length;
    const eventAnnouncements = announcementsData.filter(ann => ann.type === 'Event').length;
    
    return {
      activeAnnouncements,
      totalViews,
      highPriority,
      eventAnnouncements
    };
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementService.getAll();
      setAnnouncements(data);
      
      // Calculate statistics from real data
      const calculatedStats = calculateStats(data);
      setStats(calculatedStats);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData(announcement);
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        type: '',
        priority: '',
        targetAudience: '',
        status: 'Active',
        publishDate: '', // Will be set automatically by backend
        expiryDate: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAnnouncement(null);
  };

  const handleDeleteClick = (announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (announcementToDelete) {
        await announcementService.delete(announcementToDelete.announcementID);
        await fetchAnnouncements(); // Refresh the list
        setDeleteDialog(false);
        setAnnouncementToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      // You could add a toast notification here for better UX
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
    setAnnouncementToDelete(null);
  };

  const handleViewDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedAnnouncement(null);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Validate expiry date
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const selectedExpiryDate = new Date(formData.expiryDate);
      
      if (selectedExpiryDate <= today) {
        setError('Expiry date must be at least tomorrow. Please select a future date.');
        setSubmitting(false);
        return;
      }
      
      if (editingAnnouncement) {
        // Update existing announcement
        await announcementService.update(editingAnnouncement.announcementID, formData);
        setSuccess('Announcement updated successfully!');
      } else {
        // Add new announcement - remove publishDate as it will be set automatically by backend
        const { publishDate, ...announcementData } = formData;
        await announcementService.create(announcementData);
        setSuccess('Announcement created successfully!');
      }
      
      // Refresh the announcements list
      await fetchAnnouncements();
      handleCloseDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving announcement:', error);
      setError(error.response?.data?.error || 'Failed to save announcement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    return priority === 'High' ? '#E74C3C' : priority === 'Medium' ? '#F39C12' : '#27AE60';
  };

  const getTypeColor = (type) => {
    const colors = {
      'Information': '#3498DB',
      'Event': '#27AE60',
      'Notice': '#F39C12',
      'Emergency': '#E74C3C'
    };
    return colors[type] || '#34495E';
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : status === 'Draft' ? 'warning' : 'error';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'white' }}>
      {currentUser?.role === 'FrontDesk' ? <FrontDeskSidebar /> : <AdminSidebar />}
      
      <Box sx={{ 
        flex: 1, 
        ml: '280px', 
        width: 'calc(100% - 280px)', 
        p: 3, 
        bgcolor: 'white'
      }}>
        {/* Top Bar */}
        <Box sx={{
          bgcolor: '#FFFFFF',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <Box sx={{ flexGrow: 1 }} />
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, p: 3, bgcolor: 'white' }}>
          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* Announcements Management Section */}
          <Paper elevation={0} sx={{
            p: 3,
            border: '1px solid #E0E0E0',
            borderRadius: 4,
            bgcolor: 'white',
            mb: 3
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ 
                fontWeight: 700, 
                color: '#2C3E50', 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
              }}>
                ANNOUNCEMENTS MANAGEMENT
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ 
                  bgcolor: '#3498DB', 
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  borderRadius: 2,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  '&:hover': { bgcolor: '#2980B9' } 
                }}
              >
                Create Announcement
              </Button>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ 
                  border: '1px solid #E0E0E0', 
                  bgcolor: 'white',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  '&:hover': { 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <Notifications sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#3498DB', mb: 1 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#2C3E50', 
                    mb: 1,
                    fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                  }}>
                    {stats.activeAnnouncements}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#2C3E50', 
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>
                    Active Announcements
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ 
                  border: '1px solid #E0E0E0', 
                  bgcolor: 'white',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  '&:hover': { 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <Public sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#27AE60', mb: 1 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#2C3E50', 
                    mb: 1,
                    fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                  }}>
                    {stats.totalViews.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#2C3E50', 
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>
                    Total Views
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ 
                  border: '1px solid #E0E0E0', 
                  bgcolor: 'white',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  '&:hover': { 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <PriorityHigh sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#E74C3C', mb: 1 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#2C3E50', 
                    mb: 1,
                    fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                  }}>
                    {stats.highPriority}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#2C3E50', 
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>
                    High Priority
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ 
                  border: '1px solid #E0E0E0', 
                  bgcolor: 'white',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  '&:hover': { 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <Campaign sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#9B59B6', mb: 1 }} />
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#2C3E50', 
                    mb: 1,
                    fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                  }}>
                    {stats.eventAnnouncements}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#2C3E50', 
                    fontWeight: 500,
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>
                    Event Announcements
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Current Announcements Section */}
          <Paper elevation={0} sx={{
            p: 3,
            border: '1px solid #E0E0E0',
            borderRadius: 4,
            bgcolor: 'white'
          }}>
            {/* Loading and Error States */}
            {loading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ color: '#2C3E50' }}>Loading announcements...</Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Announcements Grid */}
            {!loading && !error && (
              <>
                <Typography sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  color: '#2C3E50', 
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                }}>
                  CURRENT ANNOUNCEMENTS
                </Typography>
                <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
                  {announcements.map((announcement) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={announcement.announcementID}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          border: '1px solid #E0E0E0',
                          borderRadius: 2,
                          height: { xs: '320px', sm: '300px', md: '280px' }, // Responsive height
                          width: '100%', // Fixed width
                          display: 'flex',
                          flexDirection: 'column',
                          p: { xs: 1.5, sm: 2 },
                          bgcolor: 'white',
                          overflow: 'hidden', // Prevent content overflow
                          '&:hover': { 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transform: 'translateY(-2px)',
                            transition: 'all 0.3s ease'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Chip 
                              label={announcement.type} 
                              size="small" 
                              sx={{ 
                                bgcolor: '#3498DB', 
                                color: '#2C3E50',
                                fontWeight: 600,
                                fontSize: { xs: '0.5rem', sm: '0.6rem' },
                                height: { xs: '18px', sm: '20px' }
                              }}
                            />
                            <Chip 
                              label={announcement.priority} 
                              size="small" 
                              sx={{ 
                                bgcolor: getPriorityColor(announcement.priority) === 'success' ? '#27AE60' : 
                                       getPriorityColor(announcement.priority) === 'warning' ? '#F39C12' : '#E74C3C', 
                                color: '#2C3E50',
                                fontWeight: 600,
                                fontSize: { xs: '0.5rem', sm: '0.6rem' },
                                height: { xs: '18px', sm: '20px' }
                              }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewDetails(announcement)}
                              sx={{ color: '#3498DB', '&:hover': { bgcolor: 'rgba(52, 152, 219, 0.1)' } }}
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDialog(announcement)}
                              sx={{ color: '#FFFFFF', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteClick(announcement)}
                              sx={{ color: '#E74C3C', '&:hover': { bgcolor: 'rgba(231, 76, 60, 0.1)' } }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 1, 
                            color: '#2C3E50', 
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.2
                          }}
                        >
                          {announcement.title}
                        </Typography>
                        <Typography 
                          sx={{ 
                            color: '#2C3E50', 
                            mb: 1, 
                            lineHeight: 1.4, 
                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            flex: 1,
                            minHeight: '0'
                          }}
                        >
                          {announcement.content}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography sx={{ 
                            color: '#B0BEC5', 
                            fontWeight: 500, 
                            fontSize: { xs: '0.65rem', sm: '0.7rem' }
                          }}>
                            Target: {announcement.targetAudience}
                          </Typography>
                          <Typography sx={{ 
                            color: '#B0BEC5', 
                            fontWeight: 500, 
                            fontSize: { xs: '0.65rem', sm: '0.7rem' }
                          }}>
                            Views: {announcement.views}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                          <Typography sx={{ 
                            color: '#4CAF50', 
                            fontWeight: 600, 
                            fontSize: { xs: '0.65rem', sm: '0.7rem' }
                          }}>
                            Published: {announcement.publishDate}
                          </Typography>
                          <Typography sx={{ 
                            color: '#FF9800', 
                            fontWeight: 600, 
                            fontSize: { xs: '0.65rem', sm: '0.7rem' }
                          }}>
                            Expires: {announcement.expiryDate}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Paper>

          {/* Quick Actions Section */}
          <Paper elevation={0} sx={{
            p: 3,
            border: '1px solid #E0E0E0',
            borderRadius: 4,
            bgcolor: 'white'
          }}>
            {/* Quick Actions */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, sm: 2 },
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' }
            }}>
              <Button 
                variant="outlined" 
                startIcon={<Schedule />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#3498DB',
                  color: '#3498DB',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  py: { xs: 1.5, sm: 1 },
                  '&:hover': { 
                    bgcolor: '#3498DB', 
                    color: '#FFFFFF',
                    borderColor: '#3498DB'
                  }
                }}
              >
                Schedule Announcement
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Public />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#27AE60',
                  color: '#27AE60',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  py: { xs: 1.5, sm: 1 },
                  '&:hover': { 
                    bgcolor: '#27AE60', 
                    color: '#FFFFFF',
                    borderColor: '#27AE60'
                  }
                }}
              >
                Publish All Drafts
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Delete />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#E74C3C',
                  color: '#E74C3C',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  py: { xs: 1.5, sm: 1 },
                  '&:hover': { 
                    bgcolor: '#E74C3C', 
                    color: '#FFFFFF',
                    borderColor: '#E74C3C'
                  }
                }}
              >
                Archive Old
              </Button>
            </Box>
          </Paper>

          {/* Add/Edit Announcement Dialog */}
            <Dialog 
              open={openDialog} 
              onClose={handleCloseDialog} 
              maxWidth="md" 
              fullWidth
              PaperProps={{
                sx: {
                  bgcolor: '#FFFFFF',
                  color: '#2C3E50',
                  borderRadius: { xs: 0, sm: 2 },
                  m: { xs: 0, sm: 2 }
                }
              }}
            >
              <DialogTitle sx={{ 
                color: '#2C3E50', 
                fontWeight: 700, 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                borderBottom: '1px solid #E0E0E0'
              }}>
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </DialogTitle>
              <DialogContent sx={{ pt: { xs: 2, sm: 3 } }}>
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Announcement Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      margin="normal"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#FFFFFF',
                          color: '#2C3E50',
                          '& fieldset': {
                            borderColor: '#E0E0E0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#0b87ac',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0b87ac',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#2C3E50',
                          '&.Mui-focused': {
                            color: '#0b87ac',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: '#2C3E50',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      margin="normal"
                      multiline
                      rows={4}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#FFFFFF',
                          color: '#2C3E50',
                          '& fieldset': {
                            borderColor: '#E0E0E0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#0b87ac',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0b87ac',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#2C3E50',
                          '&.Mui-focused': {
                            color: '#0b87ac',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: '#2C3E50',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ color: '#2C3E50' }}>Type</InputLabel>
                      <Select
                        value={formData.type}
                        label="Type"
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        sx={{
                          bgcolor: '#FFFFFF',
                          color: '#2C3E50',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E0E0E0',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#0b87ac',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#0b87ac',
                          },
                          '& .MuiSelect-icon': {
                            color: '#2C3E50',
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: '#FFFFFF',
                              '& .MuiMenuItem-root': {
                                color: '#2C3E50',
                                '&:hover': {
                                  bgcolor: '#F8F9FA',
                                },
                                '&.Mui-selected': {
                                  bgcolor: '#0b87ac', color: '#FFFFFF'
                                },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="Information">Information</MenuItem>
                        <MenuItem value="Event">Event</MenuItem>
                        <MenuItem value="Notice">Notice</MenuItem>
                        <MenuItem value="Emergency">Emergency</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ color: '#2C3E50' }}>Priority</InputLabel>
                      <Select
                        value={formData.priority}
                        label="Priority"
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        sx={{
                          bgcolor: '#FFFFFF',
                          color: '#2C3E50',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E0E0E0',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#0b87ac',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#0b87ac',
                          },
                          '& .MuiSelect-icon': {
                            color: '#2C3E50',
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: '#FFFFFF',
                              '& .MuiMenuItem-root': {
                                color: '#2C3E50',
                                '&:hover': {
                                  bgcolor: '#F8F9FA',
                                },
                                '&.Mui-selected': {
                                  bgcolor: '#0b87ac', color: '#FFFFFF'
                                },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ color: '#2C3E50' }}>Target Audience (Barangay)</InputLabel>
                      <Select
                        value={formData.targetAudience}
                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#FFFFFF',
                            color: '#2C3E50',
                            '& fieldset': {
                              borderColor: '#E0E0E0',
                            },
                            '&:hover fieldset': {
                              borderColor: '#0b87ac',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#0b87ac',
                            },
                          },
                          '& .MuiSelect-select': {
                            color: '#2C3E50',
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: '#FFFFFF',
                              '& .MuiMenuItem-root': {
                                color: '#2C3E50',
                                '&:hover': {
                                  bgcolor: '#F8F9FA',
                                },
                                '&.Mui-selected': {
                                  bgcolor: '#0b87ac', color: '#FFFFFF'
                                },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="Baclaran">Baclaran</MenuItem>
                        <MenuItem value="Banay-Banay">Banay-Banay</MenuItem>
                        <MenuItem value="Banlic">Banlic</MenuItem>
                        <MenuItem value="Bigaa">Bigaa</MenuItem>
                        <MenuItem value="Butong">Butong</MenuItem>
                        <MenuItem value="Casile">Casile</MenuItem>
                        <MenuItem value="Diezmo">Diezmo</MenuItem>
                        <MenuItem value="Gulod">Gulod</MenuItem>
                        <MenuItem value="Mamatid">Mamatid</MenuItem>
                        <MenuItem value="Marinig">Marinig</MenuItem>
                        <MenuItem value="Niugan">Niugan</MenuItem>
                        <MenuItem value="Pittland">Pittland</MenuItem>
                        <MenuItem value="Pob. Uno">Pob. Uno</MenuItem>
                        <MenuItem value="Pob. Dos">Pob. Dos</MenuItem>
                        <MenuItem value="Pob. Tres">Pob. Tres</MenuItem>
                        <MenuItem value="Pulo">Pulo</MenuItem>
                        <MenuItem value="Sala">Sala</MenuItem>
                        <MenuItem value="San Isidro">San Isidro</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      required
                      inputProps={{
                        min: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow's date
                      }}
                      helperText="Expiry date must be at least tomorrow (cannot be today or previous dates)"
                      FormHelperTextProps={{
                        sx: {
                          color: '#B0BEC5',
                          fontSize: '0.75rem'
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#FFFFFF',
                          color: '#2C3E50',
                          '& fieldset': {
                            borderColor: '#E0E0E0',
                          },
                          '&:hover fieldset': {
                            borderColor: '#0b87ac',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#0b87ac',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#2C3E50',
                          '&.Mui-focused': {
                            color: '#0b87ac',
                          },
                        },
                        '& .MuiInputBase-input': {
                          color: '#2C3E50',
                        },
                        '& .MuiSvgIcon-root': {
                          color: '#2C3E50'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ color: '#2C3E50' }}>Status</InputLabel>
                      <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        sx={{
                          bgcolor: '#FFFFFF',
                          color: '#2C3E50',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E0E0E0',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#0b87ac',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#0b87ac',
                          },
                          '& .MuiSelect-icon': {
                            color: '#2C3E50',
                          },
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: '#FFFFFF',
                              '& .MuiMenuItem-root': {
                                color: '#2C3E50',
                                '&:hover': {
                                  bgcolor: '#F8F9FA',
                                },
                                '&.Mui-selected': {
                                  bgcolor: '#0b87ac', color: '#FFFFFF'
                                },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value="Draft">Draft</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Archived">Archived</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ 
                borderTop: '1px solid #E0E0E0',
                p: { xs: 1.5, sm: 2 },
                gap: { xs: 0.5, sm: 1 },
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' }
              }}>
                <Button 
                  onClick={handleCloseDialog}
                  sx={{ 
                    color: '#2C3E50',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    py: { xs: 1.5, sm: 1 },
                    '&:hover': { bgcolor: '#F8F9FA' }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={submitting}
                  sx={{ 
                    bgcolor: '#3498DB',
                    color: '#FFFFFF',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    py: { xs: 1.5, sm: 1 },
                    '&:hover': { bgcolor: '#2980B9' },
                    '&:disabled': { bgcolor: '#7F8C8D' }
                  }}
                >
                  {submitting ? 'Creating...' : (editingAnnouncement ? 'Update' : 'Create')}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog 
              open={deleteDialog} 
              onClose={handleDeleteCancel}
              PaperProps={{
                sx: {
                  bgcolor: '#FFFFFF',
                  color: '#2C3E50',
                  borderRadius: { xs: 0, sm: 2 },
                  m: { xs: 0, sm: 2 },
                  minWidth: { xs: '100%', sm: 400 }
                }
              }}
            >
              <DialogTitle sx={{ 
                color: '#2C3E50', 
                fontWeight: 700, 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                borderBottom: '1px solid #E0E0E0'
              }}>
                Delete Announcement
              </DialogTitle>
              <DialogContent sx={{ pt: { xs: 2, sm: 3 } }}>
                <Typography sx={{ 
                  color: '#2C3E50', 
                  mb: 2,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  Are you sure you want to delete "{announcementToDelete?.title}"?
                </Typography>
                <Typography sx={{ 
                  color: '#2C3E50', 
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }}>
                  This action cannot be undone.
                </Typography>
              </DialogContent>
              <DialogActions sx={{ 
                borderTop: '1px solid #E0E0E0',
                p: { xs: 1.5, sm: 2 },
                gap: { xs: 0.5, sm: 1 },
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' }
              }}>
                <Button 
                  onClick={handleDeleteCancel}
                  sx={{ 
                    color: '#2C3E50',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    py: { xs: 1.5, sm: 1 },
                    '&:hover': { bgcolor: '#F8F9FA' }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteConfirm}
                  variant="contained"
                  sx={{ 
                    bgcolor: '#E74C3C',
                    color: '#FFFFFF',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    py: { xs: 1.5, sm: 1 },
                    '&:hover': { bgcolor: '#C0392B' }
                  }}
                >
                  Delete
                </Button>
              </DialogActions>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog 
              open={viewDialog} 
              onClose={handleCloseViewDialog} 
              maxWidth="md" 
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: { xs: 0, sm: 2 },
                  m: { xs: 0, sm: 2 }
                }
              }}
            >
              <DialogTitle sx={{ 
                backgroundColor: '#FFFFFF',
                color: '#2C3E50 !important', 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #E0E0E0'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Campaign sx={{ color: '#0b87ac' }} />
                  <Typography variant="h6" sx={{ color: '#2C3E50 !important' }}>
                    Announcement Details
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseViewDialog} sx={{ color: '#2C3E50' }}>
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent 
                sx={{ 
                  backgroundColor: '#FFFFFF !important',
                  color: '#2C3E50 !important',
                  p: { xs: 2, sm: 3 },
                  '& *': { 
                    color: '#2C3E50 !important',
                    '& .MuiTypography-root': { color: '#2C3E50 !important' },
                    '& .MuiChip-root': { color: '#2C3E50 !important' },
                    '& .MuiChip-label': { color: '#2C3E50 !important' },
                    '& .MuiBox-root': { color: '#2C3E50 !important' },
                    '& .MuiGrid-root': { color: '#2C3E50 !important' },
                    '& p': { color: '#2C3E50 !important' },
                    '& span': { color: '#2C3E50 !important' },
                    '& div': { color: '#2C3E50 !important' }
                  }
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#2C3E50',
                  '--text-color': '#2C3E50'
                }}
              >
                {selectedAnnouncement && (
                  <Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
                    {/* Header with title and chips */}
                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700, 
                          color: '#2C3E50 !important', 
                          mb: { xs: 1, sm: 2 }, 
                          backgroundColor: '#E9F5FB', 
                          p: { xs: 0.8, sm: 1 }, 
                          borderRadius: 1,
                          fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                        }}
                        style={{ color: '#2C3E50' }}
                      >
                        {selectedAnnouncement.title}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: { xs: 0.5, sm: 1 }, 
                        mb: { xs: 1, sm: 2 },
                        flexWrap: 'wrap'
                      }}>
                        <Chip
                          label={selectedAnnouncement.type}
                          size="small"
                          sx={{
                            backgroundColor: '#E8F4FD',
                            color: '#3498DB',
                            fontWeight: 600,
                            fontSize: { xs: '0.6rem', sm: '0.7rem' },
                            height: { xs: '20px', sm: '24px' },
                            '& .MuiChip-label': { color: '#3498DB' }
                          }}
                          style={{ color: '#3498DB' }}
                        />
                        <Chip
                          label={selectedAnnouncement.priority}
                          size="small"
                          sx={{
                            backgroundColor: getPriorityColor(selectedAnnouncement.priority) === 'success' ? '#27AE60' : 
                                           getPriorityColor(selectedAnnouncement.priority) === 'warning' ? '#F39C12' : '#E74C3C',
                            color: '#FFFFFF',
                            fontWeight: 600,
                            fontSize: { xs: '0.6rem', sm: '0.7rem' },
                            height: { xs: '20px', sm: '24px' },
                            '& .MuiChip-label': { color: '#FFFFFF' }
                          }}
                          style={{ color: '#FFFFFF' }}
                        />
                        <Chip
                          label={selectedAnnouncement.status}
                          size="small"
                          sx={{
                            backgroundColor: selectedAnnouncement.status === 'Active' ? '#27AE60' : 
                                           selectedAnnouncement.status === 'Draft' ? '#F39C12' : '#E74C3C',
                            color: '#FFFFFF',
                            fontWeight: 600,
                            fontSize: { xs: '0.6rem', sm: '0.7rem' },
                            height: { xs: '20px', sm: '24px' },
                            '& .MuiChip-label': { color: '#FFFFFF' }
                          }}
                          style={{ color: '#FFFFFF' }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ borderTop: '1px solid #BDC3C7', mb: { xs: 2, sm: 3 } }} />

                    {/* Content */}
                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          color: '#2C3E50 !important', 
                          mb: { xs: 0.8, sm: 1 }, 
                          backgroundColor: '#E9F5FB', 
                          p: { xs: 0.8, sm: 1 }, 
                          borderRadius: 1,
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                        }}
                        style={{ color: '#2C3E50' }}
                      >
                        Content
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#2C3E50 !important', 
                          lineHeight: 1.8, 
                          backgroundColor: '#FAFAFA', 
                          p: { xs: 1.5, sm: 2 }, 
                          borderRadius: 1,
                          fontSize: { xs: '0.9rem', sm: '1rem' }
                        }}
                        style={{ color: '#2C3E50' }}
                      >
                        {selectedAnnouncement.content}
                      </Typography>
                    </Box>

                    <Box sx={{ borderTop: '1px solid #BDC3C7', mb: { xs: 2, sm: 3 } }} />

                    {/* Details Grid */}
                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      <Grid item xs={12} md={6}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#2C3E50 !important', 
                            mb: { xs: 1, sm: 2 }, 
                            backgroundColor: '#E9F5FB', 
                            p: { xs: 0.8, sm: 1 }, 
                            borderRadius: 1,
                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
                          }}
                          style={{ color: '#2C3E50' }}
                        >
                          Announcement Details
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                color: '#BDC3C7 !important', 
                                fontWeight: 600,
                                fontSize: { xs: '0.8rem', sm: '0.9rem' }
                              }}
                              style={{ color: '#BDC3C7' }}
                            >
                              Target Audience
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: 'white !important',
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                              }}
                              style={{ color: 'white' }}
                            >
                              {selectedAnnouncement.targetAudience}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ color: '#BDC3C7 !important', fontWeight: 600 }}
                              style={{ color: '#BDC3C7' }}
                            >
                              Publish Date
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ color: 'white !important' }}
                              style={{ color: 'white' }}
                            >
                              {formatDateMMDDYYYY(selectedAnnouncement.publishDate)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ color: '#BDC3C7 !important', fontWeight: 600 }}
                              style={{ color: '#BDC3C7' }}
                            >
                              Expiry Date
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ color: 'white !important' }}
                              style={{ color: 'white' }}
                            >
                              {formatDateMMDDYYYY(selectedAnnouncement.expiryDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      {/* Statistics column removed as requested */}
                    </Grid>
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ 
                p: { xs: 2, sm: 3 }, 
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid #E0E0E0',
                justifyContent: 'center'
              }}>
                <Button 
                  onClick={handleCloseViewDialog} 
                  variant="contained"
                  sx={{ 
                    bgcolor: '#0b87ac',
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    py: { xs: 1.5, sm: 1 },
                    px: { xs: 3, sm: 4 },
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
    </Box>
  );
};

export default Announcement;
