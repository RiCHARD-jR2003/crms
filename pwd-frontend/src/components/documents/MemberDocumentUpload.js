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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Notifications as NotificationsIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import PWDMemberSidebar from '../shared/PWDMemberSidebar';
import AccessibilitySettings from '../shared/AccessibilitySettings';
import MobileHeader from '../shared/MobileHeader';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { useScreenReader } from '../../hooks/useScreenReader';
import { 
  mainContainerStyles, 
  contentAreaStyles, 
  headerStyles, 
  titleStyles, 
  cardStyles,
  buttonStyles
} from '../../utils/themeStyles';

function MemberDocumentUpload() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const { announcePageChange } = useScreenReader();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMobileMenuToggle = (isOpen) => {
    setIsMobileMenuOpen(isOpen);
  };

  // Fetch data
  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/my-documents');
      if (response.success) {
        setDocuments(response.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to fetch documents');
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/documents/notifications');
      if (response.success) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    // Announce page load
    announcePageChange(t('documents.title'));
    
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDocuments(),
        fetchNotifications()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Dialog handlers
  const handleUploadDialogOpen = (document) => {
    setSelectedDocument(document);
    setSelectedFile(null);
    setUploadDialogOpen(true);
  };

  const handleDialogClose = () => {
    setUploadDialogOpen(false);
    setSelectedDocument(null);
    setSelectedFile(null);
  };

  // File upload handler
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocument) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('required_document_id', selectedDocument.id);
      formData.append('document', selectedFile);

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.success) {
        setSuccess('Document uploaded successfully!');
        await fetchDocuments();
        handleDialogClose();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      const response = await api.post(`/documents/notifications/${notificationId}/read`);
      if (response.success) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon />;
      case 'rejected': return <CancelIcon />;
      case 'pending': return <PendingIcon />;
      default: return <DescriptionIcon />;
    }
  };

  const getDocumentStatus = (document) => {
    const memberDoc = document.member_documents?.[0];
    if (!memberDoc) {
      return { status: 'missing', color: 'error', icon: <WarningIcon /> };
    }
    return {
      status: memberDoc.status,
      color: getStatusColor(memberDoc.status),
      icon: getStatusIcon(memberDoc.status)
    };
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);

  if (loading) {
    return (
      <Box sx={mainContainerStyles}>
        <MobileHeader 
          onMenuToggle={handleMobileMenuToggle}
          isMenuOpen={isMobileMenuOpen}
        />
        <PWDMemberSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
        <Box sx={{ ...contentAreaStyles, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={mainContainerStyles}>
      {/* Mobile Header */}
      <MobileHeader 
        onMenuToggle={handleMobileMenuToggle}
        isMenuOpen={isMobileMenuOpen}
      />
      
      {/* PWD Member Sidebar */}
      <PWDMemberSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          ...contentAreaStyles,
          flexGrow: 1,
          ml: { xs: 0, md: '280px' },
          width: { xs: '100%', md: 'calc(100% - 280px)' },
          transition: 'margin-left 0.3s ease-in-out',
          paddingTop: { xs: '56px', md: 0 },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#000000', 
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              {t('documents.title')}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#000000',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {t('documents.uploadDocument')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* Notifications */}
          {unreadNotifications.length > 0 && (
            <Card sx={{ mb: 3, bgcolor: '#fff3cd' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Badge badgeContent={unreadNotifications.length} color="error">
                    <NotificationsIcon color="warning" />
                  </Badge>
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    New Document Requirements
                  </Typography>
                </Box>
                <List>
                  {unreadNotifications.map((notification) => (
                    <ListItem key={notification.id}>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={notification.message}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          onClick={() => handleMarkNotificationAsRead(notification.id)}
                          size="small"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Documents List */}
          <Grid container spacing={3}>
            {documents.map((document) => {
              const docStatus = getDocumentStatus(document);
              const memberDoc = document.member_documents?.[0];
              
              return (
                <Grid item xs={12} md={6} lg={4} key={document.id}>
                  <Card sx={{ 
                    ...cardStyles, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column' 
                  }}>
                    <CardContent sx={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      minHeight: '280px'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {document.name}
                        </Typography>
                        <Chip
                          icon={docStatus.icon}
                          label={docStatus.status}
                          color={docStatus.color}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {document.description || 'No description provided'}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Required: {document.is_required ? 'Yes' : 'No'}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          File types: {document.file_types?.join(', ')}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Max size: {document.max_file_size} KB
                        </Typography>
                      </Box>

                      {/* Always show uploaded date section for consistency */}
                      <Box sx={{ mb: 2, minHeight: '40px' }}>
                        {memberDoc ? (
                          <>
                            <Typography variant="caption" color="text.secondary">
                              {t('documents.uploadDate')}: {new Date(memberDoc.uploaded_at).toLocaleDateString()}
                            </Typography>
                            {memberDoc.notes && (
                              <>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                  Notes: {memberDoc.notes}
                                </Typography>
                              </>
                            )}
                          </>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {t('common.status')}: {t('common.pending')}
                          </Typography>
                        )}
                      </Box>

                      {/* Button section with consistent height */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        flexWrap: 'wrap',
                        mt: 'auto',
                        minHeight: '40px',
                        alignItems: 'flex-end'
                      }}>
                        {memberDoc ? (
                          <>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => window.open(`http://127.0.0.1:8000/api/documents/file/${memberDoc.id}`, '_blank')}
                              variant="outlined"
                            >
                              {t('common.view')}
                            </Button>
                            <Button
                              size="small"
                              startIcon={<CloudUploadIcon />}
                              onClick={() => handleUploadDialogOpen(document)}
                              variant="outlined"
                            >
                              Replace
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="small"
                            startIcon={<CloudUploadIcon />}
                            onClick={() => handleUploadDialogOpen(document)}
                            variant="contained"
                            color={document.is_required ? 'error' : 'primary'}
                            fullWidth
                          >
{t('documents.uploadDocument')}
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {documents.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No documents required at this time
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={handleDialogClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#FFFFFF',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#FFFFFF', 
          color: '#2C3E50',
          fontWeight: 'bold',
          borderBottom: '1px solid #E0E0E0'
        }}>
          {t('documents.uploadDocument')}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#FFFFFF', color: '#2C3E50' }}>
          {selectedDocument && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, color: '#2C3E50', fontWeight: 'bold' }}>
                {selectedDocument.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#7F8C8D' }}>
                {selectedDocument.description}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                  Allowed file types: {selectedDocument.file_types?.join(', ')}
                </Typography>
                <br />
                <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                  Maximum file size: {selectedDocument.max_file_size} KB
                </Typography>
              </Box>
            </Box>
          )}
          
          <input
            accept={selectedDocument?.file_types?.map(type => `.${type}`).join(',')}
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ 
                mb: 2,
                borderColor: '#3498DB',
                color: '#3498DB',
                '&:hover': {
                  borderColor: '#2980B9',
                  bgcolor: '#E8F4FD'
                }
              }}
            >
              Select File
            </Button>
          </label>
          
          {selectedFile && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#F8F9FA', borderRadius: 2, border: '1px solid #E0E0E0' }}>
              <Typography variant="body2" sx={{ color: '#2C3E50', fontWeight: 500 }}>
                Selected: {selectedFile.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#7F8C8D' }}>
                Size: {(selectedFile.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
          )}
          
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress sx={{ 
                '& .MuiLinearProgress-bar': { 
                  bgcolor: '#3498DB' 
                } 
              }} />
              <Typography variant="caption" sx={{ mt: 1, color: '#7F8C8D' }}>
                {t('common.loading')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: '#FFFFFF', 
          borderTop: '1px solid #E0E0E0',
          p: 2
        }}>
          <Button 
            onClick={handleDialogClose} 
            disabled={uploading}
            sx={{ 
              color: '#7F8C8D',
              '&:hover': {
                bgcolor: '#F8F9FA'
              }
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={!selectedFile || uploading}
            sx={{
              bgcolor: '#3498DB',
              color: '#FFFFFF',
              '&:hover': {
                bgcolor: '#2980B9'
              },
              '&:disabled': {
                bgcolor: '#BDC3C7'
              }
            }}
          >
{t('common.upload')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Accessibility Settings Floating Button */}
      <AccessibilitySettings />
    </Box>
  );
}

export default MemberDocumentUpload;
