import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Avatar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import toastService from '../../services/toastService';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  RateReview as ReviewIcon
} from '@mui/icons-material';
import AdminSidebar from '../shared/AdminSidebar';
import MobileHeader from '../shared/MobileHeader';
import { api } from '../../services/api';
import { filePreviewService } from '../../services/filePreviewService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  mainContainerStyles, 
  contentAreaStyles, 
  titleStyles,
  buttonStyles,
  textFieldStyles,
  tableStyles
} from '../../utils/themeStyles';

function DocumentManagement() {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file_types: [],
    max_file_size: 2048,
    is_required: true
  });
  
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    notes: ''
  });

  const availableFileTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

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

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMobileMenuToggle = (isOpen) => {
    setIsMobileMenuOpen(isOpen);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch data
  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/');
      if (response.success) {
        setDocuments(response.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to fetch documents');
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('/documents/all-members');
      if (response.success) {
        setMembers(response.members);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Failed to fetch members');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDocuments(),
        fetchMembers()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Dialog handlers
  const handleEditFromTable = (document) => {
    setSelectedDocument(document);
    setFormData({
      name: document.name,
      description: document.description || '',
      file_types: document.file_types || [],
      max_file_size: document.max_file_size || 2048,
      is_required: document.is_required !== undefined ? document.is_required : true
    });
    // Ensure the Add Document tab is active so the form is visible
    setTabValue(0);
  };

  const handleReviewDialogOpen = (memberDoc) => {
    setSelectedReview(memberDoc);
    setReviewData({
      status: 'approved',
      notes: ''
    });
    setReviewDialogOpen(true);
  };

  const handleDialogClose = () => {
    // Close only review dialog; editing happens inline in the form
    setReviewDialogOpen(false);
    setSelectedReview(null);
  };

  const cancelEdit = () => {
    setSelectedDocument(null);
    setFormData({
      name: '',
      description: '',
      file_types: [],
      max_file_size: 2048,
      is_required: true
    });
  };

  // Form handlers
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      if (selectedDocument) {
        // Update existing document
        response = await api.put(`/documents/${selectedDocument.id}`, formData);
        if (response.success) {
          toastService.success('Document requirement updated successfully!');
          cancelEdit();
        }
      } else {
        // Create new document
        response = await api.post('/documents/', formData);
        if (response.success) {
          toastService.success('Document requirement added successfully!');
          setFormData({
            name: '',
            description: '',
            file_types: [],
            max_file_size: 2048,
            is_required: true
          });
        }
      }
      
      if (response.success) {
        await fetchDocuments();
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toastService.error('Failed to save document: ' + (error.message || 'Unknown error'));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post(`/documents/${selectedReview.id}/review`, reviewData);
      
      if (response.success) {
        toastService.success('Document review completed!');
        await fetchMembers();
        handleDialogClose();
      }
    } catch (error) {
      console.error('Error reviewing document:', error);
      toastService.error('Failed to review document: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteDocument = async (document) => {
    toastService.confirm(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"?`,
      async () => {
        try {
          const response = await api.delete(`/documents/${document.id}`);
          
          if (response.success) {
            toastService.success('Document deleted successfully!');
            await fetchDocuments();
          } else {
            toastService.error('Failed to delete document: ' + response.message);
          }
        } catch (error) {
          console.error('Error deleting document:', error);
          toastService.error('Failed to delete document: ' + (error.message || 'Unknown error'));
        }
      }
    );
  };

  const handleFileTypeChange = (fileType) => {
    setFormData(prev => ({
      ...prev,
      file_types: prev.file_types.includes(fileType)
        ? prev.file_types.filter(t => t !== fileType)
        : [...prev.file_types, fileType]
    }));
  };

  const getReviewStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getReviewStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon />;
      case 'rejected': return <CancelIcon />;
      case 'pending': return <PendingIcon />;
      default: return <PendingIcon />;
    }
  };

  // Render Tab 1: Add Document Requirement
  const renderAddDocumentTab = () => (
    <Grid container spacing={2} sx={{ height: '100%', flex: 1, minHeight: 0 }}>
      {/* Left Side: Document Requirements Table */}
      <Grid item xs={12} md={7} sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Paper sx={{ 
          p: 1.5, 
          border: '1px solid #E0E0E0', 
          borderRadius: 2, 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: '#2C3E50', fontSize: '1rem', flexShrink: 0 }}>
            Current Document Requirements
          </Typography>
          <TableContainer sx={{ 
            flex: 1, 
            overflow: 'auto',
            minHeight: 0,
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '3px' },
            '&::-webkit-scrollbar-thumb': { background: '#c1c1c1', borderRadius: '3px' },
            '&::-webkit-scrollbar-thumb:hover': { background: '#a8a8a8' }
          }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'white', borderBottom: '2px solid #E0E0E0' }}>
                  <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', py: 1.5, px: 1.5 }}>Document Title</TableCell>
                  <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', py: 1.5, px: 1.5 }}>File Types</TableCell>
                  <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', py: 1.5, px: 1.5 }}>Max Size (KB)</TableCell>
                  <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', py: 1.5, px: 1.5 }}>Status</TableCell>
                  <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', py: 1.5, px: 1.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((document, idx) => (
                  <TableRow key={document.id} sx={{ bgcolor: idx % 2 ? '#F7FBFF' : 'white' }}>
                    <TableCell sx={{ fontSize: '0.8rem', py: 1.5, px: 1.5, fontWeight: 500 }}>{document.name}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 1.5, px: 1.5 }}>{document.file_types?.join(', ') || 'N/A'}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', py: 1.5, px: 1.5 }}>{document.max_file_size}</TableCell>
                    <TableCell sx={{ py: 1.5, px: 1.5 }}>
                      <Chip
                        label={document.status || 'active'}
                        size="small"
                        sx={{
                          backgroundColor: (document.status || 'active') === 'active' ? '#E8F5E8' : '#F3F4F6',
                          color: (document.status || 'active') === 'active' ? '#27AE60' : '#5D6D7E',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, px: 1.5 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditFromTable(document)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteDocument(document)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* Right Side: Add Document Form */}
      <Grid item xs={12} md={5} sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Paper sx={{ 
          p: 1.5, 
          border: '1px solid #E0E0E0', 
          borderRadius: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: '#2C3E50', fontSize: '1rem', flexShrink: 0 }}>
            {selectedDocument ? 'Edit Document Requirement' : 'Add New Document Requirement'}
          </Typography>
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, mb: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {selectedDocument && (
                  <Box sx={{
                    p: 1.5,
                    bgcolor: '#F8F9FA',
                    border: '1px solid #E0E0E0',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Typography variant="body2" sx={{ color: '#2C3E50', fontSize: '0.8rem' }}>
                      Editing: <strong>{selectedDocument.name}</strong>
                    </Typography>
                    <Button size="small" onClick={cancelEdit} sx={{ fontSize: '0.75rem', py: 0.5, px: 1.5 }}>
                      Cancel Edit
                    </Button>
                  </Box>
                )}
                <TextField
                  fullWidth
                  label="Document Title"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  size="small"
                  sx={textFieldStyles}
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  multiline
                  rows={2}
                  size="small"
                  sx={textFieldStyles}
                />
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#2C3E50', fontSize: '0.8rem' }}>
                    Allowed File Type(s)
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {availableFileTypes.map(type => (
                      <FormControlLabel
                        key={type}
                        control={
                          <Checkbox
                            checked={formData.file_types.includes(type)}
                            onChange={() => handleFileTypeChange(type)}
                            size="small"
                          />
                        }
                        label={type.toUpperCase()}
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                      />
                    ))}
                  </Box>
                </Box>
                <TextField
                  fullWidth
                  label="Maximum File Size (KB)"
                  type="number"
                  value={formData.max_file_size}
                  onChange={(e) => setFormData({...formData, max_file_size: parseInt(e.target.value) || 2048})}
                  required
                  size="small"
                  inputProps={{ min: 512, max: 51200 }}
                  sx={textFieldStyles}
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Required</InputLabel>
                  <Select
                    value={formData.is_required}
                    onChange={(e) => setFormData({...formData, is_required: e.target.value})}
                    label="Required"
                  >
                    <MenuItem value={true}>Yes</MenuItem>
                    <MenuItem value={false}>No</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Box sx={{ flexShrink: 0, pt: 1.5, borderTop: '1px solid #E0E0E0' }}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                startIcon={<AddIcon />}
                sx={buttonStyles}
              >
                {selectedDocument ? 'Update Document' : 'Add Document Requirement'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );

  // Render Tab 2: Member Document Management
  const renderMemberDocumentTab = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: '#2C3E50', fontSize: '1rem', flexShrink: 0 }}>
        Member Document Management
      </Typography>
      {members.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid #E0E0E0', borderRadius: 2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <DescriptionIcon sx={{ fontSize: 48, color: '#BDC3C7', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#7F8C8D' }}>
            No members have submitted documents yet.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1.5,
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          pr: 1,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '3px' },
          '&::-webkit-scrollbar-thumb': { background: '#c1c1c1', borderRadius: '3px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#a8a8a8' }
        }}>
          {members.map((member) => (
            <Accordion key={member.id} sx={{ border: '1px solid #E0E0E0', borderRadius: 2, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#F8F9FA' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Avatar sx={{ bgcolor: '#0b87ac', width: 36, height: 36 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.875rem' }}>
                      {[member.firstName, member.middleName, member.lastName, member.suffix].filter(Boolean).join(' ')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7F8C8D', fontSize: '0.7rem' }}>
                      {member.barangay} • {member.memberDocuments?.length || 0} document(s)
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 1.5 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem', py: 1 }}>Document</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem', py: 1 }}>File Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem', py: 1 }}>Uploaded</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem', py: 1 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem', py: 1 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {member.memberDocuments?.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>{doc.requiredDocument?.name || 'N/A'}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>{doc.file_name}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', py: 1 }}>{formatDateMMDDYYYY(doc.uploaded_at)}</TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <Chip 
                              icon={getReviewStatusIcon(doc.status)} 
                              label={doc.status} 
                              color={getReviewStatusColor(doc.status)}
                              size="small"
                              sx={{ fontSize: '0.7rem', height: 22 }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <Tooltip title="View Document">
                              <IconButton 
                                size="small" 
                                onClick={() => filePreviewService.openPreview('document-file', doc.id)}
                                color="primary"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {doc.status === 'pending' && (
                              <Tooltip title="Review Document">
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleReviewDialogOpen(doc)}
                                  color="secondary"
                                >
                                  <ReviewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box sx={mainContainerStyles}>
        <MobileHeader 
          onMenuToggle={handleMobileMenuToggle}
          isMenuOpen={isMobileMenuOpen}
        />
        <AdminSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
        <Box sx={{ ...contentAreaStyles, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ ...mainContainerStyles, height: '100vh', overflow: 'hidden', maxHeight: '100vh' }}>
      <MobileHeader 
        onMenuToggle={handleMobileMenuToggle}
        isMenuOpen={isMobileMenuOpen}
      />
      
      <AdminSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

      <Box
        component="main"
        sx={{
          ...contentAreaStyles,
          flexGrow: 1,
          ml: { xs: 0, md: '280px' },
          width: { xs: '100%', md: 'calc(100% - 280px)' },
          transition: 'margin-left 0.3s ease-in-out',
          paddingTop: { xs: '56px', md: 0 },
          height: '100vh',
          overflow: 'hidden',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ 
          p: 2.5, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          minHeight: 0,
          maxHeight: '100vh'
        }}>
          <Box sx={{ flexShrink: 0, mb: 2 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#000000', 
                mb: 0.5,
                fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' }
              }}
            >
              Document Management
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#000000',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Manage document requirements and review member submissions
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Paper sx={{ mb: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: 2, flexShrink: 0 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiTab-root': { color: '#000000', fontWeight: 600 },
                '& .MuiTab-root.Mui-selected': { color: '#0b87ac' },
                '& .MuiTabs-indicator': { backgroundColor: '#0b87ac', height: 3 }
              }}
            >
              <Tab label="Add Document Requirement" />
              <Tab label="Member Document Management" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <Box sx={{ 
            bgcolor: '#FFFFFF', 
            borderRadius: 2, 
            border: '1px solid #E0E0E0', 
            p: { xs: 1.5, sm: 2 }, 
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            {tabValue === 0 && renderAddDocumentTab()}
            {tabValue === 1 && renderMemberDocumentTab()}
          </Box>
        </Box>
      </Box>

      {/* Edit Document Dialog removed - editing happens inline in the right-side form */}

      {/* Review Document Dialog */}
      <Dialog open={reviewDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2C3E50' }}>Review Document</DialogTitle>
        <form onSubmit={handleReviewSubmit}>
          <DialogContent>
            {selectedReview && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#F8F9FA', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: '#7F8C8D', mb: 0.5 }}>
                  <strong>Member:</strong> {selectedReview.member?.firstName} {selectedReview.member?.lastName} {selectedReview.member?.suffix || ''}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7F8C8D', mb: 0.5 }}>
                  <strong>Document:</strong> {selectedReview.requiredDocument?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                  <strong>File:</strong> {selectedReview.file_name}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth size="small" sx={textFieldStyles}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={reviewData.status}
                  onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                  label="Status"
                >
                  <MenuItem value="approved">Approve</MenuItem>
                  <MenuItem value="rejected">Reject</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Notes"
                value={reviewData.notes}
                onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                multiline
                rows={3}
                size="small"
                sx={textFieldStyles}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #E0E0E0' }}>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained" sx={buttonStyles}>
              Submit Review
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default DocumentManagement;
