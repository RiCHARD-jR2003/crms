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
import HelpGuide from '../shared/HelpGuide';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { useScreenReader } from '../../hooks/useScreenReader';
import { documentService } from '../../services/documentService';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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
  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewName, setPreviewName] = useState('');

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
  
  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [reflecting, setReflecting] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMobileMenuToggle = (isOpen) => {
    setIsMobileMenuOpen(isOpen);
  };

  // Reflection cache for faster reloads
  const getCacheKey = () => {
    const uid = currentUser?.id || 'anon';
    return `memberDocReflections:${uid}`;
  };

  const loadReflectionCache = () => {
    try {
      const raw = localStorage.getItem(getCacheKey());
      return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
  };

  const saveReflectionCache = (mapping) => {
    try { localStorage.setItem(getCacheKey(), JSON.stringify(mapping || {})); } catch (_) {}
  };

  // Merge active document types with member's current documents so new types appear
  const mergeActiveTypes = (memberDocs, activeTypes) => {
    const byName = new Map();
    (memberDocs || []).forEach(d => byName.set((d.name || '').toLowerCase(), d));
    const merged = [...(memberDocs || [])];
    (activeTypes || []).forEach(t => {
      const key = (t.name || '').toLowerCase();
      if (!byName.has(key)) {
        merged.push({
          id: t.id,
          name: t.name,
          description: t.description,
          is_required: t.is_required,
          file_types: t.file_types,
          max_file_size: t.max_file_size,
          member_documents: [] // none uploaded yet
        });
      }
    });
    return merged;
  };

  // Fetch data
  const fetchDocuments = async () => {
    try {
      const [memberResp, activeTypes] = await Promise.all([
        api.get('/documents/my-documents'),
        documentService.getActiveDocumentTypes()
      ]);

      let initial;
      if (memberResp && memberResp.success) {
        initial = mergeActiveTypes(memberResp.documents || [], activeTypes);
      } else {
        // Fallback: show all active types even if member endpoint fails
        initial = (activeTypes || []).map(t => ({ ...t, member_documents: [] }));
      }

      // Apply cached reflections for instant thumbnails on reload
      const cached = loadReflectionCache();
      if (cached && Object.keys(cached).length > 0) {
        initial = initial.map(doc => {
          if (!doc.member_documents || doc.member_documents.length === 0) {
            const cachedPath = cached[doc.name];
            if (cachedPath) {
              return {
                ...doc,
                member_documents: [{
                  id: null,
                  status: 'pending',
                  uploaded_at: cached.__uploaded_at || null,
                  notes: 'Reflected from your application upload (cached)',
                  filePath: cachedPath
                }]
              };
            }
          }
          return doc;
        });
      }
      setDocuments(initial);
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

      // After loading member documents, attempt to reflect any files from the
      // most recent application submission as a fallback baseline
      try {
        setReflecting(true);
        const allApplications = await api.get('/applications');
        const id = currentUser?.id;
        const email = currentUser?.pwd_member?.email || currentUser?.email || null;
        const username = currentUser?.username || null;
        if (Array.isArray(allApplications)) {
          // Pick most recent application for this user by multiple identifiers
          const userApps = allApplications.filter(a => {
            return (
              (id && (a.userID === id || a.userId === id)) ||
              (email && a.email === email) ||
              (username && (a.username === username || a.userName === username))
            );
          });
          const latestApp = userApps.sort((a,b)=>{
            const at = a.submissionDate ? new Date(a.submissionDate).getTime() : 0;
            const bt = b.submissionDate ? new Date(b.submissionDate).getTime() : 0;
            return bt - at;
          })[0];

          if (latestApp) {
            const docTypes = await documentService.getActiveDocumentTypes();
            // Enhance each required document with an application file if member copy is missing
            const reflectionMap = {};
            setDocuments(prevDocs => prevDocs.map(doc => {
              const fieldName = documentService.getFieldNameFromDocumentName(doc.name);
              const fieldValue = latestApp ? latestApp[fieldName] : null;
              const hasMemberDoc = doc.member_documents && doc.member_documents.length > 0;

              if (!hasMemberDoc && fieldValue) {
                // Normalize to a single file path string
                let filePath = null;
                if (Array.isArray(fieldValue)) {
                  filePath = fieldValue[0] || null;
                } else if (typeof fieldValue === 'string') {
                  try {
                    const parsed = JSON.parse(fieldValue);
                    filePath = Array.isArray(parsed) ? (parsed[0] || null) : fieldValue;
                  } catch (_) {
                    filePath = fieldValue;
                  }
                }

                if (filePath) {
                  reflectionMap[doc.name] = filePath;
                  // Attach a pseudo member_document with filePath so it can be viewed
                  return {
                    ...doc,
                    member_documents: [
                      {
                        id: null,
                        status: 'pending',
                        uploaded_at: latestApp.submissionDate || latestApp.created_at,
                        notes: 'Reflected from your application upload',
                        filePath
                      }
                    ]
                  };
                }
              }
              return doc;
            }));
            if (Object.keys(reflectionMap).length > 0) {
              reflectionMap.__uploaded_at = latestApp.submissionDate || latestApp.created_at;
              saveReflectionCache(reflectionMap);
            }
          }
        }
      } catch (e) {
        console.log('Skipping application file reflection:', e?.message || e);
      } finally { setReflecting(false); }
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

  const isImageFile = (fileNameOrUrl) => {
    if (!fileNameOrUrl) return false;
    const name = String(fileNameOrUrl).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].some(ext => name.includes(ext));
  };

  // Normalize storage path and build full URL safely
  const buildStorageUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path; // already absolute
    // Remove any leading '/'
    let normalized = path.startsWith('/') ? path.substring(1) : path;
    // If the string doesn't contain a folder, assume applications/
    if (!normalized.includes('/')) normalized = `applications/${normalized}`;
    // Encode each segment to handle spaces/special chars
    const encoded = normalized.split('/').map(seg => encodeURIComponent(seg)).join('/');
    return api.getStorageUrl(encoded);
  };

  const buildFileUrl = (memberDoc) => {
    if (!memberDoc) return null;
    if (memberDoc.id) return `http://192.168.18.25:8000/api/documents/file/${memberDoc.id}`;
    if (memberDoc.filePath) return buildStorageUrl(memberDoc.filePath);
    return null;
  };

  const openPreview = (memberDoc, documentName) => {
    const url = buildFileUrl(memberDoc);
    if (!url) return;
    setPreviewUrl(url);
    setPreviewName(documentName || 'Preview');
    setPreviewOpen(true);
  };

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

          {/* Help Guide for Documents */}
          <HelpGuide
            title="How to Upload Documents"
            type="info"
            steps={[
              {
                title: "Understanding Document Requirements",
                description: "Each document card shows the document name, whether it's required or optional, accepted file types (PDF, JPG, PNG), and maximum file size. Required documents must be uploaded for your application to be processed."
              },
              {
                title: "Uploading a Document",
                description: "Click the 'Upload Document' button on a document card. Select the file from your device. Make sure the file matches the required format and size. Wait for the upload to complete - you'll see a success message."
              },
              {
                title: "Checking Document Status",
                description: "After uploading, documents will show status: 'Pending' (waiting for review), 'Approved' (accepted), or 'Rejected' (needs correction). You'll receive notifications about document status changes."
              },
              {
                title: "Viewing or Replacing Documents",
                description: "Click 'View' to see your uploaded document. Click 'Replace' to upload a new version if needed. You can also check upload date and any notes from reviewers."
              },
              {
                title: "If Your Document is Rejected",
                description: "If a document is rejected, check the notes section for details about what needs to be corrected. Upload a corrected version by clicking 'Replace'. You can also contact support for help."
              }
            ]}
          />

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
                              {t('documents.uploadDate')}: {formatDateMMDDYYYY(memberDoc.uploaded_at)}
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
                            {/* A4-aspect thumbnail */}
                            <Box
                              onClick={() => openPreview(memberDoc, document.name)}
                              sx={{
                                width: 120,
                                height: 170,
                                border: '1px solid #dee2e6',
                                borderRadius: 1,
                                bgcolor: '#fafafa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                                '&:hover': { boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }
                              }}
                              title={`Preview ${document.name}`}
                            >
                              {isImageFile(buildFileUrl(memberDoc)) ? (
                                <img
                                  src={buildFileUrl(memberDoc)}
                                  alt={document.name}
                                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <PictureAsPdfIcon sx={{ fontSize: 36, color: '#7f8c8d' }} />
                              )}
                            </Box>
                            <Button
                              size="small"
                              startIcon={<CloudUploadIcon />}
                              onClick={() => handleUploadDialogOpen(document)}
                              variant="outlined"
                            >
                              Replace
                            </Button>
                          </>
                        ) : reflecting ? (
                        // Skeleton placeholder while reflecting
                            <Box
                              sx={{
                                width: 120,
                                height: 170,
                                borderRadius: 1,
                                bgcolor: '#F0F3F5',
                                border: '1px dashed #d0d7de'
                              }}
                              title="Loading preview..."
                            />
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
      {/* A4-style Document Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            bgcolor: '#FFFFFF',
            aspectRatio: '1/1.414',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#2C3E50', 
          color: '#FFFFFF', 
          textAlign: 'center',
          py: 1.5,
          position: 'relative',
          flexShrink: 0
        }}>
          <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            {previewName}
          </Typography>
          <IconButton
            onClick={() => setPreviewOpen(false)}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#FFFFFF'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          p: 0, 
          bgcolor: '#FFFFFF',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {previewUrl && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f5f5f5',
                position: 'relative'
              }}
            >
              {isImageFile(previewUrl) ? (
                <img
                  src={previewUrl}
                  alt={previewName}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <iframe
                  title="preview"
                  src={previewUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Accessibility Settings Floating Button */}
      <AccessibilitySettings />
    </Box>
  );
}

export default MemberDocumentUpload;
