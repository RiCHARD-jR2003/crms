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
  AttachFile,
  Download,
  Delete,
  Menu
} from '@mui/icons-material';
import AdminSidebar from '../shared/AdminSidebar';
import { supportService } from '../../services/supportService';
import FilePreview from '../shared/FilePreview';

const AdminSupportDesk = () => {

  const [viewDialog, setViewDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);


  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await supportService.getTickets();
        setTickets(response);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setError('Failed to load support tickets');
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedTicket(null);
    setReplyText(''); // Clear reply text when closing dialog
    setSelectedFile(null); // Clear selected file when closing dialog
  };

  const handleSubmitReply = async () => {
    if (replyText.trim()) {
      try {
        setLoading(true);
        await supportService.addMessage(selectedTicket.id, replyText, selectedFile);
        
        setSuccess('Reply sent successfully!');
        setReplyText(''); // Clear reply text after sending
        setSelectedFile(null); // Clear selected file after sending
        
        // Refresh tickets to get updated data
        const updatedTickets = await supportService.getTickets();
        setTickets(updatedTickets);
        
        // Update the selected ticket with the new message
        const updatedTicket = updatedTickets.find(t => t.id === selectedTicket.id);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
        
      } catch (error) {
        console.error('Error sending reply:', error);
        setError('Failed to send reply. Please try again.');
      } finally {
        setLoading(false);
      }
    }
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

  const handleRemoveFile = () => {
    setSelectedFile(null);
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

  const handlePreviewFile = (message) => {
    setPreviewFile({
      messageId: message.id,
      fileName: message.attachment_name,
      fileType: message.attachment_type,
      fileSize: message.attachment_size
    });
    setPreviewDialog(true);
  };

  const handleClosePreview = () => {
    setPreviewDialog(false);
    setPreviewFile(null);
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      setLoading(true);
      await supportService.admin.updateStatus(ticketId, status);
      setSuccess(`Ticket status updated to ${status}!`);
      
      // Refresh tickets
      const response = await supportService.getTickets();
      setTickets(response);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update ticket status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePriority = async (ticketId, priority) => {
    try {
      setLoading(true);
      await supportService.admin.updatePriority(ticketId, priority);
      setSuccess(`Ticket priority updated to ${priority}!`);
      
      // Refresh tickets
      const response = await supportService.getTickets();
      setTickets(response);
    } catch (error) {
      console.error('Error updating priority:', error);
      setError('Failed to update ticket priority');
    } finally {
      setLoading(false);
    }
  };

  const openTickets = tickets.filter(ticket => ticket.status === 'open').length;
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved').length;
  const totalTickets = tickets.length;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      <AdminSidebar />
      
      <Box sx={{ 
        flex: 1, 
        ml: '280px', 
        width: 'calc(100% - 280px)', 
        p: 3, 
        bgcolor: '#FFFFFF'
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: { xs: 2, sm: 3 },
          p: { xs: 1.5, sm: 2 },
          bgcolor: '#FFFFFF',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #E0E0E0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <SupportAgent sx={{ fontSize: { xs: 28, sm: 32 }, color: '#3498DB' }} />
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              color: '#2C3E50',
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
            }}>
              Support Desk
            </Typography>
          </Box>
        </Box>

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

        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                <Warning sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#E74C3C', mb: 1 }} />
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  color: '#2C3E50',
                  fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                }}>
                  {openTickets}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#7F8C8D',
                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                }}>
                  Open Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                <Schedule sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#F39C12', mb: 1 }} />
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  color: '#2C3E50',
                  fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                }}>
                  {inProgressTickets}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#7F8C8D',
                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                }}>
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                <CheckCircle sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#27AE60', mb: 1 }} />
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  color: '#2C3E50',
                  fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                }}>
                  {resolvedTickets}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#7F8C8D',
                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                }}>
                  Resolved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                <SupportAgent sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#3498DB', mb: 1 }} />
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold', 
                  color: '#2C3E50',
                  fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
                }}>
                  {totalTickets}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#7F8C8D',
                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                }}>
                  Total Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tickets Table */}
        <Paper elevation={0} sx={{
          p: { xs: 2, sm: 3 },
          border: '1px solid #E0E0E0',
          borderRadius: 4,
          bgcolor: '#FFFFFF',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography sx={{ 
            fontWeight: 700, 
            mb: { xs: 2, sm: 3 }, 
            color: '#2C3E50', 
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
          }}>
            Support Tickets
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#2C3E50',
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>Ticket #</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#2C3E50',
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>Subject</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#2C3E50',
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>Requester</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#2C3E50',
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>Category</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#2C3E50',
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>Priority</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#2C3E50',
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>Status</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#2C3E50',
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>Created</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#2C3E50',
                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                  }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell sx={{ 
                      fontWeight: 600, 
                      color: '#3498DB',
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                    }}>
                      {ticket.ticket_number}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        color: '#2C3E50',
                        fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                      }}>
                        {ticket.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ 
                          width: { xs: 20, sm: 24 }, 
                          height: { xs: 20, sm: 24 }, 
                          bgcolor: '#3498DB', 
                          fontSize: { xs: '0.7rem', sm: '0.8rem' }
                        }}>
                          {ticket.pwd_member?.firstName?.charAt(0) || 'P'}
                        </Avatar>
                        <Typography variant="body2" sx={{ 
                          color: '#2C3E50',
                          fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                        }}>
                          {ticket.pwd_member ? `${ticket.pwd_member.firstName} ${ticket.pwd_member.lastName}` : 'PWD Member'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.category || 'General'}
                        size="small"
                        sx={{
                          backgroundColor: '#E8F4FD',
                          color: '#3498DB',
                          fontWeight: 600,
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          height: { xs: '20px', sm: '24px' },
                          '& .MuiChip-label': {
                            color: '#3498DB'
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
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          height: { xs: '20px', sm: '24px' },
                          '& .MuiChip-label': {
                            color: '#F39C12'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status.replace('_', ' ').toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: '#E8F5E8',
                          color: '#27AE60',
                          fontWeight: 600,
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          height: { xs: '20px', sm: '24px' },
                          '& .MuiChip-label': {
                            color: '#27AE60'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      color: '#7F8C8D', 
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.9rem' }
                    }}>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewTicket(ticket)}
                          sx={{ 
                            color: '#3498DB',
                            '& .MuiSvgIcon-root': {
                              fontSize: { xs: '16px', sm: '18px' }
                            }
                          }}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleReplyTicket(ticket)}
                          sx={{ 
                            color: '#27AE60',
                            '& .MuiSvgIcon-root': {
                              fontSize: { xs: '16px', sm: '18px' }
                            }
                          }}
                        >
                          <Reply />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </Paper>

        {/* View Ticket Dialog */}
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
            color: '#000000 !important', 
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #E0E0E0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SupportAgent sx={{ color: '#0b87ac' }} />
              <Typography variant="h6" sx={{ color: '#000000 !important' }}>
                Ticket Details
              </Typography>
            </Box>
            <IconButton onClick={handleCloseViewDialog} sx={{ color: '#000000 !important' }}>
              ×
            </IconButton>
          </DialogTitle>
          <DialogContent 
            sx={{ 
              backgroundColor: '#FFFFFF !important',
              color: '#000000 !important',
              p: { xs: 2, sm: 3 },
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
              <Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
                {/* Ticket Header */}
                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      color: 'white !important', 
                      mb: { xs: 1, sm: 2 }, 
                      backgroundColor: '#3498DB', 
                      p: { xs: 0.8, sm: 1 }, 
                      borderRadius: 1,
                      fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                    }}
                    style={{ color: 'white' }}
                  >
                    {selectedTicket.subject}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 0.5, sm: 1 }, 
                    mb: { xs: 1, sm: 2 },
                    flexWrap: 'wrap'
                  }}>
                    <Chip
                      label={selectedTicket.category}
                      size="small"
                      sx={{
                        color: 'white',
                        backgroundColor: '#3498DB',
                        fontWeight: 600,
                        fontSize: { xs: '0.6rem', sm: '0.7rem' },
                        height: { xs: '20px', sm: '24px' },
                        '& .MuiChip-label': {
                          color: 'white'
                        }
                      }}
                    />
                    <Chip
                      label={selectedTicket.priority}
                      size="small"
                      sx={{
                        color: 'white',
                        backgroundColor: '#3498DB',
                        fontWeight: 600,
                        fontSize: { xs: '0.6rem', sm: '0.7rem' },
                        height: { xs: '20px', sm: '24px' },
                        '& .MuiChip-label': {
                          color: 'white'
                        }
                      }}
                    />
                    <Chip
                      label={selectedTicket.status}
                      size="small"
                      sx={{
                        color: 'white',
                        backgroundColor: '#3498DB',
                        fontWeight: 600,
                        fontSize: { xs: '0.6rem', sm: '0.7rem' },
                        height: { xs: '20px', sm: '24px' },
                        '& .MuiChip-label': {
                          color: 'white'
                        }
                      }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ mb: 3, borderColor: '#BDC3C7' }} />

                {/* Requester Info */}
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ fontWeight: 600, color: 'white !important', mb: 1, backgroundColor: '#3498DB', p: 1, borderRadius: 1 }}
                    style={{ color: 'white' }}
                  >
                    Requester Information
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, p: 2, backgroundColor: '#34495E', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ color: '#3498DB', fontSize: 20 }} />
                      <Typography 
                        variant="body2" 
                        sx={{ color: 'white !important' }}
                        style={{ color: 'white' }}
                      >
                        {selectedTicket.pwd_member ? `${selectedTicket.pwd_member.firstName} ${selectedTicket.pwd_member.lastName}` : 'PWD Member'}
                      </Typography>
                    </Box>
                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <Email sx={{ color: '#3498DB', fontSize: 20 }} />
                       <Typography 
                         variant="body2" 
                         sx={{ color: 'white !important' }}
                         style={{ color: 'white' }}
                       >
                         {selectedTicket.pwd_member?.user?.email || 'Not provided'}
                       </Typography>
                     </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ color: '#3498DB', fontSize: 20 }} />
                      <Typography 
                        variant="body2" 
                        sx={{ color: 'white !important' }}
                        style={{ color: 'white' }}
                      >
                        {selectedTicket.pwd_member?.contactNumber || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Description */}
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ fontWeight: 600, color: 'white !important', mb: 1, backgroundColor: '#3498DB', p: 1, borderRadius: 1 }}
                    style={{ color: 'white' }}
                  >
                    Description
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ color: 'white !important', lineHeight: 1.6, p: 2, backgroundColor: '#3498DB', borderRadius: 1 }}
                    style={{ color: 'white' }}
                  >
                    {selectedTicket.description}
                  </Typography>
                                 </Box>

                 {/* Messages */}
                 {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                   <Box>
                     <Typography 
                       variant="h6" 
                       sx={{ fontWeight: 600, color: 'white !important', mb: 2, backgroundColor: '#3498DB', p: 1, borderRadius: 1 }}
                       style={{ color: 'white' }}
                     >
                       Messages ({selectedTicket.messages.length})
                     </Typography>
                     {selectedTicket.messages.map((message, index) => (
                       <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: '#34495E', borderRadius: 2 }}>
                         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                           <Typography 
                             variant="body2" 
                             sx={{ fontWeight: 600, color: 'white !important' }}
                             style={{ color: 'white' }}
                           >
                             {message.sender_type === 'admin' ? 'Admin' : 'PWD Member'}
                           </Typography>
                           <Typography 
                             variant="body2" 
                             sx={{ color: '#BDC3C7 !important' }}
                             style={{ color: '#BDC3C7' }}
                           >
                             {new Date(message.created_at).toLocaleString()}
                           </Typography>
                         </Box>
                         <Typography 
                           variant="body2" 
                           sx={{ color: 'white !important' }}
                           style={{ color: 'white' }}
                         >
                           {message.message}
                         </Typography>
                         
                         {/* Attachment Display */}
                         {message.attachment_path && (
                           <Box sx={{ mt: 2, p: 1, backgroundColor: '#2C3E50', borderRadius: 1 }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                               <AttachFile sx={{ color: '#3498DB', fontSize: 16 }} />
                               <Typography 
                                 variant="body2" 
                                 sx={{ color: 'white !important', flex: 1 }}
                                 style={{ color: 'white' }}
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
                       </Box>
                     ))}
                   </Box>
                 )}

                <Divider sx={{ mb: 3, borderColor: '#BDC3C7' }} />

                {/* Reply Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ fontWeight: 600, color: 'white !important', mb: 2, backgroundColor: '#3498DB', p: 1, borderRadius: 1 }}
                    style={{ color: 'white' }}
                  >
                    Reply to Ticket
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white !important',
                        backgroundColor: '#34495E',
                        '& fieldset': {
                          borderColor: '#BDC3C7',
                        },
                        '&:hover fieldset': {
                          borderColor: '#3498DB',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3498DB',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#BDC3C7 !important',
                        '&.Mui-focused': {
                          color: '#3498DB !important',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        color: 'white !important',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: '#BDC3C7 !important',
                        opacity: 1,
                      },
                    }}
                    style={{ color: 'white' }}
                  />
                  
                  {/* File Upload Section */}
                  <Box sx={{ mt: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ color: '#BDC3C7 !important', mb: 1 }}
                      style={{ color: '#BDC3C7' }}
                    >
                      Attach File (Optional)
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                        sx={{ display: 'none' }}
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
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
                            sx={{ color: 'white !important' }}
                            style={{ color: 'white' }}
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
                      sx={{ color: '#BDC3C7 !important', mt: 1, display: 'block' }}
                      style={{ color: '#BDC3C7' }}
                    >
                      Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF (Max 10MB)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: { xs: 2, sm: 3 }, 
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E0E0E0',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 1, sm: 2 }
          }}>
            <Button 
              onClick={handleCloseViewDialog} 
              sx={{ 
                color: '#000000',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                py: { xs: 1.5, sm: 1 }
              }}
            >
              Close
            </Button>
            <Button 
              onClick={handleSubmitReply}
              variant="contained"
              disabled={!replyText.trim()}
              startIcon={<Reply />}
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                py: { xs: 1.5, sm: 1 }
              }}
            >
              Send Reply
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* File Preview Dialog */}
        {previewFile && (
          <FilePreview
            open={previewDialog}
            onClose={handleClosePreview}
            messageId={previewFile.messageId}
            fileName={previewFile.fileName}
            fileType={previewFile.fileType}
            fileSize={previewFile.fileSize}
          />
        )}
      </Box>
    </Box>
  );
};

export default AdminSupportDesk;
