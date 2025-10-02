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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  RateReview as ReviewIcon
} from '@mui/icons-material';
import AdminSidebar from '../shared/AdminSidebar';
import MobileHeader from '../shared/MobileHeader';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  mainContainerStyles, 
  contentAreaStyles, 
  headerStyles, 
  titleStyles, 
  cardStyles,
  dialogStyles,
  dialogTitleStyles,
  dialogContentStyles,
  dialogActionsStyles,
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
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_required: true,
    file_types: ['pdf', 'jpg', 'jpeg', 'png'],
    max_file_size: 2048,
    effective_date: '',
    expiry_date: ''
  });
  
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    notes: ''
  });

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

  const fetchPendingReviews = async () => {
    try {
      const response = await api.get('/documents/pending-reviews');
      if (response.success) {
        setPendingReviews(response.documents);
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDocuments(),
        fetchPendingReviews()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Dialog handlers
  const handleAddDialogOpen = () => {
    setFormData({
      name: '',
      description: '',
      is_required: true,
      file_types: ['pdf', 'jpg', 'jpeg', 'png'],
      max_file_size: 2048,
      effective_date: '',
      expiry_date: ''
    });
    setAddDialogOpen(true);
  };

  const handleEditDialogOpen = (document) => {
    setSelectedDocument(document);
    setFormData({
      name: document.name,
      description: document.description || '',
      is_required: document.is_required,
      file_types: document.file_types || ['pdf', 'jpg', 'jpeg', 'png'],
      max_file_size: document.max_file_size || 2048,
      effective_date: document.effective_date || '',
      expiry_date: document.expiry_date || ''
    });
    setEditDialogOpen(true);
  };

  const handleReviewDialogOpen = (review) => {
    setSelectedReview(review);
    setReviewData({
      status: 'approved',
      notes: ''
    });
    setReviewDialogOpen(true);
  };

  const handleDialogClose = () => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setReviewDialogOpen(false);
    setSelectedDocument(null);
    setSelectedReview(null);
  };

  // Form handlers
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const endpoint = editDialogOpen ? `/documents/${selectedDocument.id}` : '/documents/';
      const method = editDialogOpen ? 'put' : 'post';
      
      const response = await api[method](endpoint, formData);
      
      if (response.success) {
        await fetchDocuments();
        handleDialogClose();
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setError('Failed to save document');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post(`/documents/${selectedReview.id}/review`, reviewData);
      
      if (response.success) {
        await fetchPendingReviews();
        handleDialogClose();
      }
    } catch (error) {
      console.error('Error reviewing document:', error);
      setError('Failed to review document');
    }
  };

  const handleDeleteDocument = async (document) => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      try {
        const response = await api.delete(`/documents/${document.id}`);
        
        if (response.success) {
          await fetchDocuments();
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        setError('Failed to delete document');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      default: return 'default';
    }
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

  const renderDocumentsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={titleStyles}>
          Required Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
          sx={buttonStyles}
        >
          Add Document
        </Button>
      </Box>

      <TableContainer component={Paper} sx={tableStyles}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Required</TableCell>
              <TableCell>File Types</TableCell>
              <TableCell>Max Size</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell>{document.name}</TableCell>
                <TableCell>{document.description || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={document.is_required ? 'Yes' : 'No'} 
                    color={document.is_required ? 'error' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{document.file_types?.join(', ') || 'N/A'}</TableCell>
                <TableCell>{document.max_file_size} KB</TableCell>
                <TableCell>
                  <Chip 
                    label={document.status} 
                    color={getStatusColor(document.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{document.creator?.username || 'N/A'}</TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditDialogOpen(document)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteDocument(document)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderReviewsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={titleStyles}>
          Pending Reviews
        </Typography>
        <Badge badgeContent={pendingReviews.length} color="error">
          <ReviewIcon />
        </Badge>
      </Box>

      <TableContainer component={Paper} sx={tableStyles}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Member</TableCell>
              <TableCell>Document</TableCell>
              <TableCell>File Name</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  {review.member?.firstName} {review.member?.lastName}
                </TableCell>
                <TableCell>{review.requiredDocument?.name}</TableCell>
                <TableCell>{review.file_name}</TableCell>
                <TableCell>
                  {new Date(review.uploaded_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip 
                    icon={getReviewStatusIcon(review.status)}
                    label={review.status} 
                    color={getReviewStatusColor(review.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => window.open(`/api/documents/file/${review.id}`, '_blank')}
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleReviewDialogOpen(review)}
                    color="secondary"
                  >
                    <ReviewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
    <Box sx={mainContainerStyles}>
      {/* Mobile Header */}
      <MobileHeader 
        onMenuToggle={handleMobileMenuToggle}
        isMenuOpen={isMobileMenuOpen}
      />
      
      {/* Admin Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

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
              Document Management
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#000000',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Manage required documents and review member uploads
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Required Documents" />
              <Tab 
                label={
                  <Badge badgeContent={pendingReviews.length} color="error">
                    Pending Reviews
                  </Badge>
                } 
              />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {tabValue === 0 && renderDocumentsTab()}
          {tabValue === 1 && renderReviewsTab()}
        </Box>
      </Box>

      {/* Add Document Dialog */}
      <Dialog open={addDialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle sx={dialogTitleStyles}>Add Required Document</DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={dialogContentStyles}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Document Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  multiline
                  rows={3}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth sx={textFieldStyles}>
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
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max File Size (KB)"
                  type="number"
                  value={formData.max_file_size}
                  onChange={(e) => setFormData({...formData, max_file_size: parseInt(e.target.value)})}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Effective Date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={dialogActionsStyles}>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained" sx={buttonStyles}>
              Add Document
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={editDialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle sx={dialogTitleStyles}>Edit Required Document</DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={dialogContentStyles}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Document Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  multiline
                  rows={3}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth sx={textFieldStyles}>
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
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth sx={textFieldStyles}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedDocument?.status || 'active'}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max File Size (KB)"
                  type="number"
                  value={formData.max_file_size}
                  onChange={(e) => setFormData({...formData, max_file_size: parseInt(e.target.value)})}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Effective Date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={dialogActionsStyles}>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained" sx={buttonStyles}>
              Update Document
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Review Document Dialog */}
      <Dialog open={reviewDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={dialogTitleStyles}>Review Document</DialogTitle>
        <form onSubmit={handleReviewSubmit}>
          <DialogContent sx={dialogContentStyles}>
            {selectedReview && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Member: {selectedReview.member?.firstName} {selectedReview.member?.lastName}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Document: {selectedReview.requiredDocument?.name}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  File: {selectedReview.file_name}
                </Typography>
              </Box>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth sx={textFieldStyles}>
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
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={reviewData.notes}
                  onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                  multiline
                  rows={3}
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={dialogActionsStyles}>
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
