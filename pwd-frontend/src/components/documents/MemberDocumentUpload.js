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
import MobileHeader from '../shared/MobileHeader';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
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
              My Documents
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#000000',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Upload and manage your required documents
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
                  <Card sx={cardStyles}>
                    <CardContent>
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

                      {memberDoc && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Uploaded: {new Date(memberDoc.uploaded_at).toLocaleDateString()}
                          </Typography>
                          {memberDoc.notes && (
                            <>
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                Notes: {memberDoc.notes}
                              </Typography>
                            </>
                          )}
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {memberDoc ? (
                          <>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => window.open(`/api/documents/file/${memberDoc.id}`, '_blank')}
                            >
                              View
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
                            Upload Document
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
      <Dialog open={uploadDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedDocument.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedDocument.description}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Allowed file types: {selectedDocument.file_types?.join(', ')}
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
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
              sx={{ mb: 2 }}
            >
              Select File
            </Button>
          </label>
          
          {selectedFile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Selected: {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Size: {(selectedFile.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
          )}
          
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Uploading...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={!selectedFile || uploading}
            sx={buttonStyles}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MemberDocumentUpload;
