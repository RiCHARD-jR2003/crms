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
  FormControlLabel,
  Checkbox,
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmCreateDialog, setConfirmCreateDialog] = useState(false); // Confirmation before creating
  const [publishAllDialog, setPublishAllDialog] = useState(false); // Publish all drafts confirmation
  const [archiveOldDialog, setArchiveOldDialog] = useState(false); // Archive old confirmation
  const [processingBulk, setProcessingBulk] = useState(false); // Processing bulk operations
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: '',
    priority: '',
    targetAudience: [], // Array for multiple checkbox selection
    status: 'Active',
    publishDate: '', // Will be set automatically by backend
    expiryDate: ''
  });

  // Barangay list for target audience checkboxes
  const barangayList = [
    'All', // All barangays
    'Members', // All PWD members
    'Baclaran', 'Banay-Banay', 'Banlic', 'Bigaa', 'Butong', 'Casile',
    'Diezmo', 'Gulod', 'Mamatid', 'Marinig', 'Niugan', 'Pittland',
    'Pob. Uno', 'Pob. Dos', 'Pob. Tres', 'Pulo', 'Sala', 'San Isidro'
  ];

  // Handle checkbox change for target audience
  const handleTargetAudienceChange = (option) => {
    setFormData(prev => {
      let newAudience = [...prev.targetAudience];
      
      if (option === 'All') {
        // If "All" is selected, clear everything else and just select "All"
        if (newAudience.includes('All')) {
          newAudience = [];
        } else {
          newAudience = ['All'];
        }
      } else {
        // Remove "All" if any other option is selected
        newAudience = newAudience.filter(a => a !== 'All');
        
        if (newAudience.includes(option)) {
          newAudience = newAudience.filter(a => a !== option);
        } else {
          newAudience.push(option);
        }
      }
      
      return { ...prev, targetAudience: newAudience };
    });
  };

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

  // Format date and time as MM/DD/YYYY HH:MM AM/PM
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    // Format date as MM/DD/YYYY
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    // Format time as HH:MM AM/PM
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');
    
    return `${month}/${day}/${year} ${formattedHours}:${minutes} ${ampm}`;
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

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [postingAnnouncement, setPostingAnnouncement] = useState(null);
  const [modalError, setModalError] = useState(null); // Error shown inside modal
  
  // Statistics state
  const [stats, setStats] = useState({
    activeAnnouncements: 0,
    totalViews: 0,
    highPriority: 0,
    eventAnnouncements: 0
  });

  // Auto-determine priority based on type and content keywords
  const determinePriority = (type, content) => {
    const contentLower = (content || '').toLowerCase();
    
    // High priority keywords
    const highPriorityKeywords = [
      'urgent', 'emergency', 'immediate', 'critical', 'important', 'deadline',
      'asap', 'required', 'mandatory', 'alert', 'warning', 'danger',
      'last day', 'final notice', 'do not miss', 'action required'
    ];
    
    // Medium priority keywords  
    const mediumPriorityKeywords = [
      'reminder', 'notice', 'update', 'schedule', 'upcoming', 'soon',
      'please note', 'attention', 'inform', 'advisory'
    ];
    
    // Type-based priority
    if (type === 'Emergency') return 'High';
    if (type === 'Deadline') return 'High';
    if (type === 'Advisory') return 'Medium';
    if (type === 'Reminder') return 'Medium';
    
    // Content-based priority
    if (highPriorityKeywords.some(keyword => contentLower.includes(keyword))) {
      return 'High';
    }
    if (mediumPriorityKeywords.some(keyword => contentLower.includes(keyword))) {
      return 'Medium';
    }
    
    // Default based on type
    if (type === 'Event' || type === 'Notice') return 'Medium';
    if (type === 'Information' || type === 'System Update') return 'Low';
    
    return 'Low';
  };

  // Validate expiry date - must be at least tomorrow
  const validateExpiryDate = (dateStr) => {
    if (!dateStr) return { valid: false, message: 'Expiry date is required' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const expiryDate = new Date(dateStr);
    expiryDate.setHours(0, 0, 0, 0);
    
    if (expiryDate < tomorrow) {
      return { valid: false, message: 'Expiry date must be at least tomorrow' };
    }
    
    return { valid: true, message: '' };
  };

  // Get minimum date for expiry (tomorrow)
  const getMinExpiryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

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
      
      // Ensure latest-first sorting (backend should do this, but sort as fallback)
      const sortedData = [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.publishDate || a.created_at || 0);
        const dateB = new Date(b.publishDate || b.created_at || 0);
        return dateB - dateA; // Latest first
      });
      
      setAnnouncements(sortedData);
      
      // Calculate statistics from real data
      const calculatedStats = calculateStats(sortedData);
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
    setModalError(null); // Clear any previous modal errors
    if (announcement) {
      setEditingAnnouncement(announcement);
      // Convert targetAudience string to array if needed
      const targetAudienceArray = typeof announcement.targetAudience === 'string'
        ? announcement.targetAudience.split(',').map(a => a.trim()).filter(a => a)
        : (announcement.targetAudience || []);
      setFormData({
        ...announcement,
        targetAudience: targetAudienceArray
      });
    } else {
      setEditingAnnouncement(null);
      // Set default publish date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        content: '',
        type: '',
        priority: '',
        targetAudience: [], // Empty array for new announcements
        status: 'Active',
        publishDate: today,
        expiryDate: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAnnouncement(null);
    setModalError(null); // Clear modal errors on close
  };

  // Handle type change - auto-set priority
  const handleTypeChange = (newType) => {
    const newPriority = determinePriority(newType, formData.content);
    setFormData({ ...formData, type: newType, priority: newPriority });
  };

  // Handle content change - auto-set priority
  const handleContentChange = (newContent) => {
    const newPriority = determinePriority(formData.type, newContent);
    setFormData({ ...formData, content: newContent, priority: newPriority });
  };

  const handleDeleteClick = (announcement) => {
    setAnnouncementToDelete(announcement);
    setDeleteDialog(true);
  };

  const handlePostAnnouncement = async (announcement) => {
    if (!announcement || announcement.status !== 'Draft') {
      return;
    }

    // Comprehensive validation for required fields
    const requiredFields = {
      'title': 'Title',
      'content': 'Full Description/Details',
      'type': 'Announcement Type',
      'priority': 'Priority Level',
      'targetAudience': 'Targeted Barangays',
      'publishDate': 'Date & Time of Announcement'
    };
    
    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!announcement[field] || (typeof announcement[field] === 'string' && announcement[field].trim() === '')) {
        missingFields.push(label);
      }
    }
    
    // Check content length
    if (announcement.content && announcement.content.trim().length < 100) {
      missingFields.push('Content must be at least 100 characters');
    }
    
    // Check if content contains placeholder text
    if (announcement.content && announcement.content.includes('[TO BE SPECIFIED]')) {
      missingFields.push('Complete all announcement details (remove all [TO BE SPECIFIED] placeholders)');
    }
    
    if (missingFields.length > 0) {
      setError(`Cannot post announcement. Missing or incomplete fields: ${missingFields.join(', ')}. Please edit the announcement first.`);
      return;
    }

    try {
      setPostingAnnouncement(announcement.announcementID);
      const response = await announcementService.postAnnouncement(announcement.announcementID);
      
      if (response.success) {
        setSuccess('Announcement posted successfully!');
        // Refresh announcements
        await fetchAnnouncements();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to post announcement');
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
      setError('Failed to post announcement: ' + (error.message || 'Unknown error'));
    } finally {
      setPostingAnnouncement(null);
    }
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

  // Comprehensive validation function to check if all required fields are filled
  const isFormValid = () => {
    // Check all required fields
    if (!formData.title || formData.title.trim().length < 10) {
      return false;
    }
    
    if (!formData.content || formData.content.trim().length < 100) {
      return false;
    }
    
    if (!formData.type) {
      return false;
    }
    
    if (!formData.priority) {
      return false;
    }
    
    if (!formData.targetAudience || formData.targetAudience.trim() === '') {
      return false;
    }
    
    if (!formData.publishDate) {
      return false;
    }
    
    // Check if content contains placeholder text (for Active status)
    if (formData.status === 'Active' && formData.content.includes('[TO BE SPECIFIED]')) {
      return false;
    }
    
    // Validate expiry date if provided
    if (formData.expiryDate) {
      const publishDate = new Date(formData.publishDate);
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate < publishDate) {
        return false;
      }
    }
    
    return true;
  };

  // Validate form and show confirmation for new announcements
  const handleSubmit = () => {
    setModalError(null);
    
    // Comprehensive frontend validation - show errors inside modal
    if (!formData.title || formData.title.trim().length < 10) {
      setModalError('Title must be at least 10 characters long.');
      return;
    }
    
    if (!formData.content || formData.content.trim().length < 100) {
      setModalError('Content must be at least 100 characters long. Please provide detailed information.');
      return;
    }
    
    if (!formData.type) {
      setModalError('Please select an announcement type.');
      return;
    }
    
    if (!formData.priority) {
      setModalError('Please select a priority level.');
      return;
    }
    
    if (!formData.targetAudience || (Array.isArray(formData.targetAudience) && formData.targetAudience.length === 0)) {
      setModalError('Please select at least one target audience.');
      return;
    }
    
    // Validate publish date
    if (!formData.publishDate) {
      setModalError('Publish date is required.');
      return;
    }
    
    // Validate expiry date
    if (!formData.expiryDate) {
      setModalError('Expiry date is required.');
      return;
    }
    
    const expiryValidation = validateExpiryDate(formData.expiryDate);
    if (!expiryValidation.valid) {
      setModalError(expiryValidation.message);
      return;
    }
    
    // Check if content contains placeholder text (for Active status)
    if (formData.status === 'Active' && formData.content.includes('[TO BE SPECIFIED]')) {
      setModalError('Cannot post announcement with incomplete details. Please remove all [TO BE SPECIFIED] placeholders.');
      return;
    }
    
    // If editing, submit directly; if creating new, show confirmation
    if (editingAnnouncement) {
      performSubmit();
    } else {
      setConfirmCreateDialog(true);
    }
  };

  // Perform the actual submission
  const performSubmit = async () => {
    try {
      setSubmitting(true);
      setConfirmCreateDialog(false);
      setSuccess(null);
      
      // Convert targetAudience array to comma-separated string for backend
      const submitData = {
        ...formData,
        targetAudience: Array.isArray(formData.targetAudience) 
          ? formData.targetAudience.join(', ') 
          : formData.targetAudience
      };
      
      if (editingAnnouncement) {
        // Update existing announcement
        await announcementService.update(editingAnnouncement.announcementID, submitData);
        setSuccess('Announcement updated successfully!');
      } else {
        // Add new announcement - publishDate is now required
        await announcementService.create(submitData);
        setSuccess('Announcement created successfully!');
      }
      
      // Refresh the announcements list
      await fetchAnnouncements();
      handleCloseDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving announcement:', error);
      
      // Handle duplicate error - show in modal
      if (error.response?.status === 409) {
        setModalError(
          error.response?.data?.message || 
          'A similar announcement was posted recently. Please review existing announcements or modify the title/type.'
        );
      } else if (error.response?.data?.messages) {
        // Validation errors from backend
        const messages = error.response.data.messages;
        const firstError = Object.values(messages)[0]?.[0] || 'Validation failed';
        setModalError(firstError);
      } else {
        setModalError(error.response?.data?.error || error.response?.data?.message || 'Failed to save announcement. Please try again.');
      }
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

  // Handle Schedule Announcement - Opens create dialog with Draft status
  const handleScheduleAnnouncement = () => {
    setModalError(null);
    setEditingAnnouncement(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      title: '',
      content: '',
      type: '',
      priority: '',
      targetAudience: '',
      status: 'Draft', // Set to Draft for scheduled
      publishDate: today,
      expiryDate: ''
    });
    setOpenDialog(true);
  };

  // Get draft announcements
  const getDraftAnnouncements = () => {
    return announcements.filter(ann => ann.status === 'Draft');
  };

  // Get old/expired announcements (expired more than 30 days ago)
  const getOldAnnouncements = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return announcements.filter(ann => {
      if (!ann.expiryDate) return false;
      const expiryDate = new Date(ann.expiryDate);
      return expiryDate < thirtyDaysAgo;
    });
  };

  // Publish all draft announcements
  const handlePublishAllDrafts = async () => {
    const drafts = getDraftAnnouncements();
    if (drafts.length === 0) {
      setError('No draft announcements to publish.');
      setPublishAllDialog(false);
      return;
    }

    setProcessingBulk(true);
    let successCount = 0;
    let failCount = 0;

    for (const draft of drafts) {
      // Check if draft is complete
      if (!draft.title || !draft.content || draft.content.length < 100 || 
          !draft.type || !draft.priority || !draft.targetAudience || 
          !draft.publishDate || draft.content.includes('[TO BE SPECIFIED]')) {
        failCount++;
        continue;
      }

      try {
        await announcementService.postAnnouncement(draft.announcementID);
        successCount++;
      } catch (error) {
        console.error('Error publishing draft:', error);
        failCount++;
      }
    }

    setProcessingBulk(false);
    setPublishAllDialog(false);
    
    if (successCount > 0) {
      setSuccess(`Successfully published ${successCount} announcement(s).${failCount > 0 ? ` ${failCount} failed (incomplete fields).` : ''}`);
      await fetchAnnouncements();
    } else {
      setError(`Failed to publish announcements. ${failCount} announcement(s) have incomplete fields.`);
    }
    
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
  };

  // Archive old announcements (set status to Archived)
  const handleArchiveOld = async () => {
    const oldAnnouncements = getOldAnnouncements();
    if (oldAnnouncements.length === 0) {
      setError('No old announcements to archive (expired more than 30 days ago).');
      setArchiveOldDialog(false);
      return;
    }

    setProcessingBulk(true);
    let successCount = 0;
    let failCount = 0;

    for (const announcement of oldAnnouncements) {
      try {
        await announcementService.update(announcement.announcementID, {
          ...announcement,
          status: 'Archived'
        });
        successCount++;
      } catch (error) {
        console.error('Error archiving announcement:', error);
        failCount++;
      }
    }

    setProcessingBulk(false);
    setArchiveOldDialog(false);
    
    if (successCount > 0) {
      setSuccess(`Successfully archived ${successCount} old announcement(s).${failCount > 0 ? ` ${failCount} failed.` : ''}`);
      await fetchAnnouncements();
    } else {
      setError('Failed to archive announcements.');
    }
    
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
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
        <Box sx={{ flex: 1, p: 3, bgcolor: 'white', maxWidth: '100%' }}>
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
            mb: 3,
            width: '100%'
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
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ justifyContent: 'flex-start' }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ 
                  border: '1px solid #E0E0E0', 
                  bgcolor: 'white',
                  borderRadius: 2,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  width: '100%',
                  height: '100%',
                  minHeight: '140px',
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
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  width: '100%',
                  height: '100%',
                  minHeight: '140px',
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
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  width: '100%',
                  height: '100%',
                  minHeight: '140px',
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
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  width: '100%',
                  height: '100%',
                  minHeight: '140px',
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
            bgcolor: 'white',
            width: '100%'
          }}>
            {/* Loading and Error States */}
            {loading && (
              <Box sx={{ py: 4 }}>
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
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.8rem' }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.8rem' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.8rem' }}>Priority</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.8rem' }}>Target</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.8rem' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.8rem' }}>Published</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.8rem' }}>Expires</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {announcements.map((announcement) => (
                        <TableRow 
                          key={announcement.announcementID}
                          onClick={() => handleViewDetails(announcement)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { 
                              bgcolor: '#E8F4FD',
                            },
                            '&:nth-of-type(even)': {
                              bgcolor: '#FAFAFA',
                              '&:hover': { bgcolor: '#E8F4FD' }
                            }
                          }}
                        >
                          <TableCell sx={{ 
                            color: '#2C3E50', 
                            fontWeight: 600, 
                            fontSize: '0.85rem',
                            maxWidth: 250,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {announcement.title}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={announcement.type} 
                              size="small" 
                              sx={{ 
                                bgcolor: '#3498DB', 
                                color: '#FFFFFF',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: '24px'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={announcement.priority} 
                              size="small" 
                              sx={{ 
                                bgcolor: announcement.priority === 'High' ? '#E74C3C' : 
                                       announcement.priority === 'Medium' ? '#F39C12' : '#27AE60', 
                                color: '#FFFFFF',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: '24px'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#2C3E50', fontSize: '0.8rem' }}>
                            {announcement.targetAudience}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={announcement.status} 
                              size="small" 
                              sx={{ 
                                bgcolor: announcement.status === 'Active' ? '#27AE60' : 
                                       announcement.status === 'Draft' ? '#F39C12' : '#95A5A6', 
                                color: '#FFFFFF',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: '24px'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#27AE60', fontSize: '0.8rem', fontWeight: 500 }}>
                            {formatDateTime(announcement.publishDate)}
                          </TableCell>
                          <TableCell sx={{ color: '#E67E22', fontSize: '0.8rem', fontWeight: 500 }}>
                            {announcement.expiryDate ? formatDateTime(announcement.expiryDate) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
                onClick={handleScheduleAnnouncement}
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
                onClick={() => setPublishAllDialog(true)}
                disabled={getDraftAnnouncements().length === 0}
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
                  },
                  '&:disabled': {
                    borderColor: '#BDC3C7',
                    color: '#BDC3C7'
                  }
                }}
              >
                Publish All Drafts ({getDraftAnnouncements().length})
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Delete />}
                onClick={() => setArchiveOldDialog(true)}
                disabled={getOldAnnouncements().length === 0}
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
                  },
                  '&:disabled': {
                    borderColor: '#BDC3C7',
                    color: '#BDC3C7'
                  }
                }}
              >
                Archive Old ({getOldAnnouncements().length})
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
                {/* Error Alert Inside Modal */}
                {modalError && (
                  <Alert 
                    severity="error" 
                    sx={{ mb: 2 }}
                    onClose={() => setModalError(null)}
                  >
                    {modalError}
                  </Alert>
                )}
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Announcement Title (Minimum 10 characters)"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      margin="normal"
                      helperText={`${formData.title.length} characters (minimum 10 required)`}
                      error={formData.title.length > 0 && formData.title.length < 10}
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
                      label="Content (Minimum 100 characters)"
                      value={formData.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      margin="normal"
                      multiline
                      rows={6}
                      helperText={`${formData.content.length} characters (minimum 100 required). Priority auto-adjusts based on keywords.`}
                      error={formData.content.length > 0 && formData.content.length < 100}
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
                        onChange={(e) => handleTypeChange(e.target.value)}
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
                        <MenuItem value="System Update">System Update</MenuItem>
                        <MenuItem value="Reminder">Reminder</MenuItem>
                        <MenuItem value="Deadline">Deadline</MenuItem>
                        <MenuItem value="Advisory">Advisory</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ color: '#2C3E50' }}>Priority (Auto-set)</InputLabel>
                      <Select
                        value={formData.priority}
                        label="Priority (Auto-set)"
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
                    <Box sx={{ mt: 2, p: 2, border: '1px solid #E0E0E0', borderRadius: 1, bgcolor: '#FFFFFF' }}>
                      <Typography sx={{ color: '#2C3E50', fontWeight: 600, mb: 2, fontSize: '0.9rem' }}>
                        Target Audience *
                      </Typography>
                      <Typography sx={{ color: '#666', fontSize: '0.75rem', mb: 2 }}>
                        Select one or more target audiences. "All" will broadcast to everyone.
                      </Typography>
                      <Grid container spacing={1}>
                        {barangayList.map((option) => (
                          <Grid item xs={6} sm={4} md={3} key={option}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formData.targetAudience.includes(option)}
                                  onChange={() => handleTargetAudienceChange(option)}
                                  sx={{
                                    color: option === 'All' ? '#27AE60' : option === 'Members' ? '#F39C12' : '#0b87ac',
                                    '&.Mui-checked': {
                                      color: option === 'All' ? '#27AE60' : option === 'Members' ? '#F39C12' : '#0b87ac',
                                    },
                                  }}
                                  disabled={option !== 'All' && formData.targetAudience.includes('All')}
                                />
                              }
                              label={
                                <Typography sx={{ 
                                  fontSize: '0.8rem', 
                                  color: option === 'All' ? '#27AE60' : option === 'Members' ? '#F39C12' : '#2C3E50',
                                  fontWeight: option === 'All' || option === 'Members' ? 600 : 400
                                }}>
                                  {option}
                                </Typography>
                              }
                              sx={{ 
                                m: 0,
                                bgcolor: formData.targetAudience.includes(option) 
                                  ? option === 'All' ? '#E8F5E9' : option === 'Members' ? '#FFF3E0' : '#E3F2FD' 
                                  : 'transparent',
                                borderRadius: 1,
                                px: 1,
                                transition: 'background-color 0.2s'
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                      {formData.targetAudience.length > 0 && (
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                          <Typography sx={{ color: '#666', fontSize: '0.75rem', mb: 1 }}>
                            Selected: 
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {formData.targetAudience.map(audience => (
                              <Chip
                                key={audience}
                                label={audience}
                                size="small"
                                onDelete={() => handleTargetAudienceChange(audience)}
                                sx={{
                                  bgcolor: audience === 'All' ? '#27AE60' : audience === 'Members' ? '#F39C12' : '#0b87ac',
                                  color: '#FFFFFF',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  '& .MuiChip-deleteIcon': {
                                    color: '#FFFFFF',
                                    '&:hover': { color: '#FFD700' }
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Publish Date *"
                      type="date"
                      value={formData.publishDate}
                      onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      required
                      helperText="Date when the announcement will be published"
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
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date *"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => {
                        const validation = validateExpiryDate(e.target.value);
                        if (!validation.valid && e.target.value) {
                          setModalError(validation.message);
                        } else {
                          setModalError(null);
                        }
                        setFormData({ ...formData, expiryDate: e.target.value });
                      }}
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      required
                      error={!!(formData.expiryDate && !validateExpiryDate(formData.expiryDate).valid)}
                      inputProps={{
                        min: getMinExpiryDate()
                      }}
                      helperText={
                        formData.expiryDate && !validateExpiryDate(formData.expiryDate).valid
                          ? validateExpiryDate(formData.expiryDate).message
                          : "Expiry date must be at least tomorrow"
                      }
                      FormHelperTextProps={{
                        sx: {
                          color: formData.expiryDate && !validateExpiryDate(formData.expiryDate).valid ? '#E74C3C' : '#B0BEC5',
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
                  onClick={() => {
                    setSelectedAnnouncement({
                      ...formData,
                      publishDate: formData.publishDate || new Date().toISOString().split('T')[0],
                      author: currentUser
                    });
                    setPreviewOpen(true);
                  }}
                  variant="outlined"
                  disabled={!isFormValid()}
                  startIcon={<Visibility />}
                  sx={{ 
                    borderColor: '#F39C12',
                    color: '#F39C12',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    py: { xs: 1.5, sm: 1 },
                    '&:hover': { borderColor: '#E67E22', bgcolor: '#F39C1215' },
                    '&:disabled': { borderColor: '#BDC3C7', color: '#BDC3C7' }
                  }}
                >
                  Preview
                </Button>
                <Button 
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={submitting || !formData.title || !formData.content || formData.title.length < 10 || formData.content.length < 100 || !formData.publishDate}
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

            {/* Create Confirmation Dialog */}
            <Dialog 
              open={confirmCreateDialog} 
              onClose={() => setConfirmCreateDialog(false)}
              PaperProps={{
                sx: {
                  bgcolor: '#FFFFFF',
                  color: '#2C3E50',
                  borderRadius: { xs: 0, sm: 2 },
                  m: { xs: 0, sm: 2 },
                  minWidth: { xs: '100%', sm: 450 }
                }
              }}
            >
              <DialogTitle sx={{ 
                color: '#2C3E50', 
                fontWeight: 700, 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                borderBottom: '1px solid #E0E0E0',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Warning sx={{ color: '#F39C12' }} />
                Confirm Create Announcement
              </DialogTitle>
              <DialogContent sx={{ pt: { xs: 2, sm: 3 } }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>
                    Important: Announcements cannot be edited once posted!
                  </Typography>
                  <Typography variant="body2">
                    Please review all details carefully before confirming. If you need to make changes later, you will need to delete this announcement and create a new one.
                  </Typography>
                </Alert>
                <Box sx={{ bgcolor: '#F8F9FA', p: 2, borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#7F8C8D', mb: 1 }}>
                    Announcement Summary:
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: '#2C3E50', mb: 0.5 }}>
                    {formData.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip label={formData.type} size="small" sx={{ bgcolor: '#3498DB', color: '#FFF' }} />
                    <Chip label={formData.priority} size="small" sx={{ 
                      bgcolor: formData.priority === 'High' ? '#E74C3C' : 
                               formData.priority === 'Medium' ? '#F39C12' : '#27AE60', 
                      color: '#FFF' 
                    }} />
                    {Array.isArray(formData.targetAudience) ? (
                      formData.targetAudience.map((audience) => (
                        <Chip 
                          key={audience}
                          label={audience} 
                          size="small" 
                          sx={{ 
                            bgcolor: audience === 'All' ? '#27AE60' : audience === 'Members' ? '#F39C12' : '#9B59B6', 
                            color: '#FFF' 
                          }} 
                        />
                      ))
                    ) : (
                      <Chip label={formData.targetAudience} size="small" sx={{ bgcolor: '#9B59B6', color: '#FFF' }} />
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                    Expires: {formData.expiryDate}
                  </Typography>
                </Box>
                <Typography sx={{ 
                  color: '#2C3E50', 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 500
                }}>
                  Are you sure you want to create this announcement?
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
                  onClick={() => setConfirmCreateDialog(false)}
                  sx={{ 
                    color: '#2C3E50',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    py: { xs: 1.5, sm: 1 },
                    '&:hover': { bgcolor: '#F8F9FA' }
                  }}
                >
                  Go Back & Review
                </Button>
                <Button 
                  onClick={performSubmit}
                  variant="contained"
                  disabled={submitting}
                  sx={{ 
                    bgcolor: '#27AE60',
                    color: '#FFFFFF',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    py: { xs: 1.5, sm: 1 },
                    '&:hover': { bgcolor: '#219A52' },
                    '&:disabled': { bgcolor: '#95A5A6' }
                  }}
                >
                  {submitting ? 'Creating...' : 'Yes, Create Announcement'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Publish All Drafts Confirmation Dialog */}
            <Dialog 
              open={publishAllDialog} 
              onClose={() => setPublishAllDialog(false)}
              PaperProps={{
                sx: {
                  bgcolor: '#FFFFFF',
                  color: '#2C3E50',
                  borderRadius: { xs: 0, sm: 2 },
                  m: { xs: 0, sm: 2 },
                  minWidth: { xs: '100%', sm: 450 }
                }
              }}
            >
              <DialogTitle sx={{ 
                color: '#2C3E50', 
                fontWeight: 700, 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                borderBottom: '1px solid #E0E0E0',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Public sx={{ color: '#27AE60' }} />
                Publish All Draft Announcements
              </DialogTitle>
              <DialogContent sx={{ pt: { xs: 2, sm: 3 } }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>
                    You are about to publish {getDraftAnnouncements().length} draft announcement(s).
                  </Typography>
                  <Typography variant="body2">
                    Only announcements with complete information will be published. Incomplete drafts will be skipped.
                  </Typography>
                </Alert>
                <Typography sx={{ 
                  color: '#2C3E50', 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 500
                }}>
                  Are you sure you want to publish all draft announcements?
                </Typography>
              </DialogContent>
              <DialogActions sx={{ 
                borderTop: '1px solid #E0E0E0',
                p: { xs: 1.5, sm: 2 },
                gap: { xs: 0.5, sm: 1 }
              }}>
                <Button 
                  onClick={() => setPublishAllDialog(false)}
                  disabled={processingBulk}
                  sx={{ 
                    color: '#2C3E50',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    '&:hover': { bgcolor: '#F8F9FA' }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePublishAllDrafts}
                  variant="contained"
                  disabled={processingBulk}
                  sx={{ 
                    bgcolor: '#27AE60',
                    color: '#FFFFFF',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    '&:hover': { bgcolor: '#219A52' },
                    '&:disabled': { bgcolor: '#95A5A6' }
                  }}
                >
                  {processingBulk ? 'Publishing...' : 'Yes, Publish All'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Archive Old Announcements Confirmation Dialog */}
            <Dialog 
              open={archiveOldDialog} 
              onClose={() => setArchiveOldDialog(false)}
              PaperProps={{
                sx: {
                  bgcolor: '#FFFFFF',
                  color: '#2C3E50',
                  borderRadius: { xs: 0, sm: 2 },
                  m: { xs: 0, sm: 2 },
                  minWidth: { xs: '100%', sm: 450 }
                }
              }}
            >
              <DialogTitle sx={{ 
                color: '#2C3E50', 
                fontWeight: 700, 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                borderBottom: '1px solid #E0E0E0',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Delete sx={{ color: '#E74C3C' }} />
                Archive Old Announcements
              </DialogTitle>
              <DialogContent sx={{ pt: { xs: 2, sm: 3 } }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>
                    You are about to archive {getOldAnnouncements().length} old announcement(s).
                  </Typography>
                  <Typography variant="body2">
                    This will archive announcements that expired more than 30 days ago. Archived announcements won't be visible to users.
                  </Typography>
                </Alert>
                <Typography sx={{ 
                  color: '#2C3E50', 
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 500
                }}>
                  Are you sure you want to archive these old announcements?
                </Typography>
              </DialogContent>
              <DialogActions sx={{ 
                borderTop: '1px solid #E0E0E0',
                p: { xs: 1.5, sm: 2 },
                gap: { xs: 0.5, sm: 1 }
              }}>
                <Button 
                  onClick={() => setArchiveOldDialog(false)}
                  disabled={processingBulk}
                  sx={{ 
                    color: '#2C3E50',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    '&:hover': { bgcolor: '#F8F9FA' }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleArchiveOld}
                  variant="contained"
                  disabled={processingBulk}
                  sx={{ 
                    bgcolor: '#E74C3C',
                    color: '#FFFFFF',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    '&:hover': { bgcolor: '#C0392B' },
                    '&:disabled': { bgcolor: '#95A5A6' }
                  }}
                >
                  {processingBulk ? 'Archiving...' : 'Yes, Archive All'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog 
              open={previewOpen} 
              onClose={() => setPreviewOpen(false)} 
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
                backgroundColor: '#F39C12',
                color: '#FFFFFF !important', 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #E0E0E0'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Visibility sx={{ color: '#FFFFFF' }} />
                  <Typography variant="h6" sx={{ color: '#FFFFFF !important' }}>
                    Preview Announcement
                  </Typography>
                </Box>
                <IconButton onClick={() => setPreviewOpen(false)} sx={{ color: '#FFFFFF' }}>
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ 
                backgroundColor: '#FFFFFF !important',
                color: '#2C3E50 !important',
                p: { xs: 2, sm: 3 }
              }}>
                {selectedAnnouncement && (
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C3E50', mb: 2 }}>
                      {selectedAnnouncement.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip label={selectedAnnouncement.type} size="small" sx={{ bgcolor: getTypeColor(selectedAnnouncement.type), color: '#FFFFFF' }} />
                      <Chip label={selectedAnnouncement.priority} size="small" sx={{ bgcolor: getPriorityColor(selectedAnnouncement.priority), color: '#FFFFFF' }} />
                      <Chip label={selectedAnnouncement.targetAudience} size="small" sx={{ bgcolor: '#3498DB', color: '#FFFFFF' }} />
                    </Box>
                    <Box sx={{ 
                      color: '#2C3E50', 
                      lineHeight: 1.8, 
                      mb: 2,
                      fontFamily: 'inherit',
                      '& .content-header': {
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: '#0b87ac',
                        mt: 2,
                        mb: 1,
                        display: 'block'
                      },
                      '& .content-bullet': {
                        display: 'block',
                        pl: 3,
                        mb: 0.5,
                        position: 'relative',
                        '&::before': {
                          content: '"•"',
                          position: 'absolute',
                          left: '8px',
                          fontWeight: 700,
                          color: '#2C3E50'
                        }
                      },
                      '& .content-numbered': {
                        display: 'block',
                        pl: 3,
                        mb: 0.5
                      },
                      '& .content-text': {
                        display: 'block',
                        mb: 0.5
                      },
                      '& .content-empty': {
                        display: 'block',
                        height: '0.5rem'
                      }
                    }}>
                      {formatAnnouncementContent(selectedAnnouncement.content).map((item, idx) => {
                        if (item.type === 'empty') {
                          return <Box key={idx} className="content-empty" />;
                        } else if (item.type === 'header') {
                          return (
                            <Typography key={idx} className="content-header" component="div" variant="h6">
                              {item.content}
                            </Typography>
                          );
                        } else if (item.type === 'bullet') {
                          const text = item.content.replace(/^[•\-\*]\s*/, '');
                          return (
                            <Typography key={idx} className="content-bullet" component="div" variant="body2">
                              {text}
                            </Typography>
                          );
                        } else if (item.type === 'numbered') {
                          return (
                            <Typography key={idx} className="content-numbered" component="div" variant="body2">
                              {item.content}
                            </Typography>
                          );
                        } else {
                          return (
                            <Typography key={idx} className="content-text" component="div" variant="body2">
                              {item.content}
                            </Typography>
                          );
                        }
                      })}
                    </Box>
                    <Box sx={{ borderTop: '1px solid #E0E0E0', pt: 2 }}>
                      <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                        Publish Date: {formatDateTime(selectedAnnouncement.publishDate || new Date().toISOString())}
                        {selectedAnnouncement.expiryDate && ` | Expiry Date: ${formatDateTime(selectedAnnouncement.expiryDate)}`}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ borderTop: '1px solid #E0E0E0', p: 2 }}>
                <Button onClick={() => setPreviewOpen(false)} sx={{ color: '#2C3E50' }}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setPreviewOpen(false);
                    handleSubmit();
                  }}
                  variant="contained"
                  disabled={submitting || !formData.title || !formData.content || formData.title.length < 10 || formData.content.length < 100 || !formData.publishDate}
                  sx={{ bgcolor: '#3498DB', color: '#FFFFFF', '&:hover': { bgcolor: '#2980B9' } }}
                >
                  {submitting ? 'Publishing...' : 'Publish'}
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
                      <Box 
                        sx={{ 
                          color: '#2C3E50 !important', 
                          lineHeight: 1.8, 
                          backgroundColor: '#FAFAFA', 
                          p: { xs: 1.5, sm: 2 }, 
                          borderRadius: 1,
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          '& .content-header': {
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            color: '#0b87ac',
                            mt: 2,
                            mb: 1,
                            display: 'block'
                          },
                          '& .content-bullet': {
                            display: 'block',
                            pl: 3,
                            mb: 0.5,
                            position: 'relative',
                            '&::before': {
                              content: '"•"',
                              position: 'absolute',
                              left: '8px',
                              fontWeight: 700,
                              color: '#2C3E50'
                            }
                          },
                          '& .content-numbered': {
                            display: 'block',
                            pl: 3,
                            mb: 0.5
                          },
                          '& .content-text': {
                            display: 'block',
                            mb: 0.5
                          },
                          '& .content-empty': {
                            display: 'block',
                            height: '0.5rem'
                          }
                        }}
                        style={{ color: '#2C3E50' }}
                      >
                        {formatAnnouncementContent(selectedAnnouncement.content).map((item, idx) => {
                          if (item.type === 'empty') {
                            return <Box key={idx} className="content-empty" />;
                          } else if (item.type === 'header') {
                            return (
                              <Typography key={idx} className="content-header" component="div" variant="h6" sx={{ color: '#0b87ac !important' }}>
                                {item.content}
                              </Typography>
                            );
                          } else if (item.type === 'bullet') {
                            const text = item.content.replace(/^[•\-\*]\s*/, '');
                            return (
                              <Typography key={idx} className="content-bullet" component="div" variant="body2" sx={{ color: '#2C3E50 !important' }}>
                                {text}
                              </Typography>
                            );
                          } else if (item.type === 'numbered') {
                            return (
                              <Typography key={idx} className="content-numbered" component="div" variant="body2" sx={{ color: '#2C3E50 !important' }}>
                                {item.content}
                              </Typography>
                            );
                          } else {
                            return (
                              <Typography key={idx} className="content-text" component="div" variant="body2" sx={{ color: '#2C3E50 !important' }}>
                                {item.content}
                              </Typography>
                            );
                          }
                        })}
                      </Box>
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
                              {selectedAnnouncement.expiryDate ? formatDateTime(selectedAnnouncement.expiryDate) : 'N/A'}
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
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    onClick={() => {
                      handleCloseViewDialog();
                      handleOpenDialog(selectedAnnouncement);
                    }} 
                    variant="outlined"
                    startIcon={<Edit />}
                    sx={{ 
                      borderColor: '#F39C12',
                      color: '#F39C12',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      py: { xs: 1, sm: 0.8 },
                      '&:hover': {
                        borderColor: '#E67E22',
                        bgcolor: 'rgba(243, 156, 18, 0.1)'
                      }
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    onClick={() => {
                      handleCloseViewDialog();
                      handleDeleteClick(selectedAnnouncement);
                    }} 
                    variant="outlined"
                    startIcon={<Delete />}
                    sx={{ 
                      borderColor: '#E74C3C',
                      color: '#E74C3C',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      py: { xs: 1, sm: 0.8 },
                      '&:hover': {
                        borderColor: '#C0392B',
                        bgcolor: 'rgba(231, 76, 60, 0.1)'
                      }
                    }}
                  >
                    Delete
                  </Button>
                </Box>
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
