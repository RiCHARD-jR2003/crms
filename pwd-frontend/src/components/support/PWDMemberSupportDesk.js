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
  Badge,
  Avatar,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Input
} from '@mui/material';
import {
  SupportAgent,
  Add,
  Reply,
  Visibility,
  CheckCircle,
  Schedule,
  Warning,
  Person,
  Email,
  Phone,
  Message,
  Close,
  Send,
  AttachFile,
  Download,
  Delete,
  Headset
} from '@mui/icons-material';
import PWDMemberSidebar from '../shared/PWDMemberSidebar';
import AccessibilitySettings from '../shared/AccessibilitySettings';
import { supportService } from '../../services/supportService';
import { useTranslation } from '../../contexts/TranslationContext';
import { useScreenReader } from '../../hooks/useScreenReader';

const PWDMemberSupportDesk = () => {
  console.log('PWDMemberSupportDesk component is rendering');
  
  const { t } = useTranslation();
  const { announcePageChange } = useScreenReader();
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedReplyFile, setSelectedReplyFile] = useState(null);
  
  // Form states for creating new ticket
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: ''
  });

  useEffect(() => {
    console.log('PWDMemberSupportDesk useEffect running');
    // Announce page load
    announcePageChange(t('support.title'));
    
    fetchTickets();
  }, [announcePageChange, t]);

  const fetchTickets = async () => {
    try {
      console.log('fetchTickets: Starting to fetch tickets');
      setLoading(true);
      const response = await supportService.getTickets();
      console.log('fetchTickets: Response received:', response);
      setTickets(response);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      subject: '',
      description: '',
      priority: 'medium',
      category: ''
    });
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedTicket(null);
    setReplyText('');
    setSelectedReplyFile(null);
  };

  const handleReplyTicket = (ticket) => {
    setSelectedTicket(ticket);
    setViewDialog(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('File type not supported. Allowed types: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleReplyFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('File type not supported. Allowed types: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF');
        return;
      }
      
      setSelectedReplyFile(file);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleRemoveReplyFile = () => {
    setSelectedReplyFile(null);
  };

  const handleDownloadAttachment = async (messageId, fileName) => {
    try {
      const response = await supportService.forceDownloadAttachment(messageId);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      setError('Failed to download attachment');
    }
  };

  const handlePreviewFile = async (message) => {
    try {
      console.log('Starting file preview for message:', message.id);
      setError(null); // Clear any previous errors
      
      // Use the same approach as document management - direct API endpoint
      const url = `http://192.168.1.6:8000/api/support-tickets/messages/${message.id}/download`;
      console.log('Opening URL:', url);
      
      // Use window.open directly like document management does
      window.open(url, '_blank', 'noopener');
      
      console.log('File preview initiated');
      
    } catch (error) {
      console.error('Error previewing file:', error);
      setError(`Failed to preview file: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitTicket = async () => {
    try {
      setLoading(true);
      const response = await supportService.createTicket(formData, selectedFile);
      setSuccess('Support ticket created successfully!');
      setOpenDialog(false);
      setFormData({
        subject: '',
        description: '',
        priority: 'medium',
        category: ''
      });
      setSelectedFile(null);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Failed to create support ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    try {
      setLoading(true);
      await supportService.addMessage(selectedTicket.id, replyText, selectedReplyFile);
      setSuccess('Reply sent successfully!');
      setReplyText('');
      setSelectedReplyFile(null);
      fetchTickets();
      // Refresh the selected ticket
      const updatedTicket = await supportService.getTicket(selectedTicket.id);
      setSelectedTicket(updatedTicket);
    } catch (error) {
      console.error('Error sending reply:', error);
      setError('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async (ticketId) => {
    try {
      setLoading(true);
      await supportService.pwdMember.markResolved(ticketId);
      setSuccess('Ticket marked as resolved!');
      fetchTickets();
    } catch (error) {
      console.error('Error marking ticket as resolved:', error);
      setError('Failed to mark ticket as resolved');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkClosed = async (ticketId) => {
    try {
      setLoading(true);
      await supportService.pwdMember.markClosed(ticketId);
      setSuccess('Ticket marked as closed!');
      fetchTickets();
    } catch (error) {
      console.error('Error marking ticket as closed:', error);
      setError('Failed to mark ticket as closed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Schedule />;
      case 'in_progress': return <Warning />;
      case 'resolved': return <CheckCircle />;
      case 'closed': return <Close />;
      default: return <Schedule />;
    }
  };

  console.log('PWDMemberSupportDesk: About to render, loading:', loading, 'tickets:', tickets.length);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <PWDMemberSidebar />
      
      <Box sx={{ 
        flex: 1, 
        marginLeft: '280px', // Account for fixed sidebar width
        p: 3,
        minHeight: '100vh',
        backgroundColor: '#FFFFFF'
      }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#000000', fontWeight: 600, mb: 1 }}>
            {t('support.title')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#000000' }}>
            Create and manage your support tickets
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Schedule sx={{ color: '#E74C3C', mr: 1 }} />
                  <Typography variant="h4" sx={{ color: '#000000', fontWeight: 600 }}>
                    {tickets.filter(ticket => ticket.status === 'open').length}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  {t('support.open')} {t('support.myTickets')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Warning sx={{ color: '#F39C12', mr: 1 }} />
                  <Typography variant="h4" sx={{ color: '#000000', fontWeight: 600 }}>
                    {tickets.filter(ticket => ticket.status === 'in_progress').length}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  {t('support.inProgress')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <CheckCircle sx={{ color: '#27AE60', mr: 1 }} />
                  <Typography variant="h4" sx={{ color: '#000000', fontWeight: 600 }}>
                    {tickets.filter(ticket => ticket.status === 'resolved').length}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  {t('support.resolved')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <SupportAgent sx={{ color: '#3498DB', mr: 1 }} />
                  <Typography variant="h4" sx={{ color: '#000000', fontWeight: 600 }}>
                    {tickets.length}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#000000' }}>
                  Total Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            sx={{
              backgroundColor: '#3498DB',
              '&:hover': { backgroundColor: '#2980B9' },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5
            }}
          >
{t('support.createTicket')}
          </Button>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Tickets Table */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', bgcolor: '#FFFFFF' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#FFFFFF' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#000000' }}>{t('support.ticketNumber')}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#000000' }}>{t('support.subject')}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#000000' }}>{t('support.status')}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#000000' }}>{t('support.priority')}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#000000' }}>{t('support.category')}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#000000' }}>{t('support.createdAt')}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#000000' }}>{t('documents.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#000000' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <SupportAgent sx={{ fontSize: 48, color: '#BDC3C7', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#000000', mb: 1 }}>
                          No support tickets found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          Create your first ticket to get started!
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id} hover>
                      <TableCell sx={{ fontWeight: 600, color: '#3498DB' }}>
                        {ticket.ticket_number}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#000000' }}>
                          {ticket.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status.replace('_', ' ').toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: '#E8F5E8',
                            color: '#27AE60',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            '& .MuiChip-label': {
                              color: '#27AE60'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.priority.toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: '#FFF3E0',
                            color: '#F39C12',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            '& .MuiChip-label': {
                              color: '#F39C12'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.category || 'General'}
                          size="small"
                          sx={{
                            backgroundColor: '#E8F4FD',
                            color: '#3498DB',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            '& .MuiChip-label': {
                              color: '#3498DB'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#000000', fontSize: '0.9rem' }}>
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewTicket(ticket)}
                            sx={{ 
                              color: '#3498DB',
                              borderColor: '#3498DB',
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              py: 0.5,
                              px: 1,
                              '&:hover': {
                                backgroundColor: '#3498DB',
                                color: '#FFFFFF',
                                borderColor: '#3498DB'
                              }
                            }}
                          >
{t('common.view')}
                          </Button>
                          {ticket.status === 'resolved' && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Close />}
                              onClick={() => handleMarkClosed(ticket.id)}
                              sx={{ 
                                color: '#E74C3C',
                                borderColor: '#E74C3C',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 1,
                                '&:hover': {
                                  backgroundColor: '#E74C3C',
                                  color: '#FFFFFF',
                                  borderColor: '#E74C3C'
                                }
                              }}
                            >
{t('support.closed')}
                            </Button>
                          )}
                          {ticket.status === 'in_progress' && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CheckCircle />}
                              onClick={() => handleMarkResolved(ticket.id)}
                              sx={{ 
                                color: '#27AE60',
                                borderColor: '#27AE60',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 1,
                                '&:hover': {
                                  backgroundColor: '#27AE60',
                                  color: '#FFFFFF',
                                  borderColor: '#27AE60'
                                }
                              }}
                            >
                              Resolve
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Create Ticket Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ color: '#000000', fontWeight: 600, backgroundColor: '#FFFFFF' }}>
{t('support.createTicket')}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}>
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#000000', fontWeight: 500 }}>
{t('support.subject')} *
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#000000',
                        '& fieldset': {
                          borderColor: '#E0E0E0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#3498DB',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3498DB',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#000000', fontWeight: 500 }}>
                      Priority
                    </Typography>
                  </Box>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    sx={{
                      color: '#000000',
                      width: '100%',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E0E0E0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3498DB',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3498DB',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#666666',
                      },
                    }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#000000', fontWeight: 500 }}>
                      Category
                    </Typography>
                  </Box>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    sx={{
                      color: '#000000',
                      width: '100%',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E0E0E0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3498DB',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3498DB',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#666666',
                      },
                    }}
                  >
                    <MenuItem value="Technical">Technical</MenuItem>
                    <MenuItem value="Benefits">Benefits</MenuItem>
                    <MenuItem value="PWD Card">PWD Card</MenuItem>
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Account">Account</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#000000', fontWeight: 500 }}>
                      Description *
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Please describe your issue or question in detail..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#000000',
                        '& fieldset': {
                          borderColor: '#E0E0E0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#3498DB',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3498DB',
                        },
                      },
                    }}
                  />
                </Grid>
                
                {/* File Upload Section */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#000000', fontWeight: 500 }}>
                      Attach File (Optional)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                      sx={{ display: 'none' }}
                      id="create-file-upload"
                    />
                    <label htmlFor="create-file-upload">
                      <Button
                        component="span"
                        variant="outlined"
                        startIcon={<AttachFile />}
                        sx={{
                          color: '#3498DB',
                          borderColor: '#3498DB',
                          '&:hover': {
                            backgroundColor: '#3498DB',
                            color: '#FFFFFF',
                            borderColor: '#3498DB'
                          }
                        }}
                      >
                        Choose File
                      </Button>
                    </label>
                    
                    {selectedFile && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ color: '#000000' }}
                        >
                          {selectedFile.name}
                        </Typography>
                        <IconButton
                          onClick={handleRemoveFile}
                          size="small"
                          sx={{ color: '#E74C3C' }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  
                  <Typography 
                    variant="caption" 
                    sx={{ color: '#666666', mt: 1, display: 'block' }}
                  >
                    Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF (Max 10MB)
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, backgroundColor: '#FFFFFF' }}>
            <Button 
              onClick={handleCloseDialog}
              sx={{ color: '#000000' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitTicket}
              variant="contained"
              disabled={!formData.subject.trim() || !formData.description.trim()}
              sx={{
                backgroundColor: '#3498DB',
                '&:hover': { backgroundColor: '#2980B9' },
                '&:disabled': { backgroundColor: '#7F8C8D' }
              }}
            >
{t('support.createTicket')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Ticket Dialog */}
        <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#FFFFFF', color: '#000000', fontWeight: 600 }}>
            Ticket Details - {selectedTicket?.ticket_number}
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
                '& .MuiAvatar-root': { color: '#000000 !important' },
                '& .MuiListItem-root': { color: '#000000 !important' },
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
            {selectedTicket && (
              <Box sx={{ pt: 1, color: '#000000' }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ color: '#666666 !important', fontWeight: 500 }}
                      style={{ color: '#666666' }}
                    >
                      Subject
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ fontWeight: 500, color: '#000000 !important', backgroundColor: '#E8F0FE', p: 1, borderRadius: 1 }}
                      style={{ color: '#000000' }}
                    >
                      {selectedTicket.subject}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ color: '#666666 !important', fontWeight: 500 }}
                      style={{ color: '#666666' }}
                    >
                      Status
                    </Typography>
                    <Chip
                      icon={getStatusIcon(selectedTicket.status)}
                      label={selectedTicket.status.replace('_', ' ').toUpperCase()}
                      size="small"
                      sx={{ 
                        backgroundColor: '#E8F0FE',
                        color: '#0b87ac',
                        fontWeight: 600,
                        '& .MuiChip-label': { 
                          color: '#0b87ac' 
                        },
                        '& .MuiChip-icon': {
                          color: '#0b87ac'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ color: '#666666 !important', fontWeight: 500 }}
                      style={{ color: '#666666' }}
                    >
                      Priority
                    </Typography>
                    <Chip
                      label={selectedTicket.priority.toUpperCase()}
                      size="small"
                      sx={{ 
                        backgroundColor: '#E8F0FE',
                        color: '#0b87ac',
                        fontWeight: 600,
                        '& .MuiChip-label': { 
                          color: '#0b87ac' 
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2, borderColor: '#E0E0E0' }} />

                <Typography 
                  variant="subtitle2" 
                  sx={{ color: '#000000 !important', backgroundColor: '#E8F0FE', p: 1, borderRadius: 1, mb: 1, fontWeight: 500 }}
                  style={{ color: '#000000' }}
                >
                  Requester Information
                </Typography>
                <Box sx={{ mb: 2, p: 2, backgroundColor: '#F5F5F5', borderRadius: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ color: '#000000 !important', mb: 1 }}
                    style={{ color: '#000000' }}
                  >
                    <strong>Name:</strong> {selectedTicket.pwd_member?.firstName} {selectedTicket.pwd_member?.lastName}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ color: '#000000 !important', mb: 1 }}
                    style={{ color: '#000000' }}
                  >
                    <strong>Email:</strong> {selectedTicket.pwd_member?.email || 'Not provided'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ color: '#000000 !important' }}
                    style={{ color: '#000000' }}
                  >
                    <strong>Phone:</strong> {selectedTicket.pwd_member?.contactNumber || 'Not provided'}
                  </Typography>
                </Box>


                <Typography 
                  variant="subtitle2" 
                  sx={{ color: '#000000 !important', backgroundColor: '#E8F0FE', p: 1, borderRadius: 1, mb: 1, fontWeight: 500 }}
                  style={{ color: '#000000' }}
                >
                  Messages ({selectedTicket.messages?.length || 0})
                </Typography>
                <List sx={{ maxHeight: 300, overflow: 'auto', color: '#000000 !important' }} style={{ color: '#000000' }}>
                  {selectedTicket.messages?.map((message, index) => (
                    <ListItem 
                      key={index} 
                      sx={{ flexDirection: 'column', alignItems: 'flex-start', color: '#000000 !important' }}
                      style={{ color: '#000000' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar 
                          sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem', backgroundColor: '#0b87ac', color: 'white !important' }}
                          style={{ color: 'white' }}
                        >
                          {message.sender_type === 'admin' ? 'A' : 'P'}
                        </Avatar>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ fontWeight: 500, color: '#000000 !important' }}
                          style={{ color: '#000000' }}
                        >
                          {message.sender_type === 'admin' ? 'Admin' : 'You'}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ ml: 2, color: '#666666 !important' }}
                          style={{ color: '#666666' }}
                        >
                          {new Date(message.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ ml: 4, backgroundColor: '#F5F5F5', p: 1, borderRadius: 1, color: '#000000 !important' }}
                        style={{ color: '#000000' }}
                      >
                        {message.message}
                      </Typography>
                      
                      {/* Attachment Display */}
                      {message.attachment_path && (
                        <Box sx={{ ml: 4, mt: 1, p: 1, backgroundColor: '#F5F5F5', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachFile sx={{ color: '#0b87ac', fontSize: 16 }} />
                            <Typography 
                              variant="body2" 
                              sx={{ color: '#000000', flex: 1 }}
                            >
                              {message.attachment_name}
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handlePreviewFile(message)}
                              sx={{
                                color: '#3498DB',
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                mr: 1,
                                '&:hover': {
                                  backgroundColor: '#3498DB',
                                  color: '#FFFFFF'
                                }
                              }}
                            >
                              Preview
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Download />}
                              onClick={() => handleDownloadAttachment(message.id, message.attachment_name)}
                              sx={{
                                color: '#3498DB',
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                '&:hover': {
                                  backgroundColor: '#3498DB',
                                  color: '#FFFFFF'
                                }
                              }}
                            >
                              Download
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </DialogContent>
          {/* Reply Section */}
          {selectedTicket?.status !== 'closed' && (
            <Box sx={{ p: 3, backgroundColor: '#F8F9FA', borderTop: '1px solid #E0E0E0' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#2C3E50', fontWeight: 600 }}>
                Reply to Ticket
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Input
                  type="file"
                  onChange={handleReplyFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  sx={{ display: 'none' }}
                  id="reply-file-upload"
                />
                <label htmlFor="reply-file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachFile />}
                    sx={{ textTransform: 'none' }}
                  >
                    Attach File (Optional)
                  </Button>
                </label>
                {selectedReplyFile && (
                  <Typography variant="body2" sx={{ color: '#27AE60' }}>
                    {selectedReplyFile.name}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  onClick={handleCloseViewDialog}
                  sx={{ color: '#000000' }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitReply}
                  variant="contained"
                  disabled={!replyText.trim()}
                  startIcon={<Send />}
                  sx={{ 
                    backgroundColor: '#27AE60',
                    '&:hover': { backgroundColor: '#219A52' }
                  }}
                >
                  Send Reply
                </Button>
              </Box>
            </Box>
          )}
          
          <DialogActions sx={{ p: 2, backgroundColor: '#FFFFFF' }}>
            <Button onClick={handleCloseViewDialog} sx={{ color: '#000000' }}>Close</Button>
          </DialogActions>
        </Dialog>

        
      </Box>
      
      {/* Accessibility Settings Floating Button */}
      <AccessibilitySettings />
    </Box>
  );
};

export default PWDMemberSupportDesk;
