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

const AdminSupportDesk = () => {

  const [viewDialog, setViewDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedReplyFile, setSelectedReplyFile] = useState(null);


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

  const handleReplyTicket = (ticket) => {
    setSelectedTicket(ticket);
    setViewDialog(true);
    setReplyText(''); // Clear any existing reply text
    setSelectedFile(null); // Clear any existing file selection
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedTicket(null);
    setReplyText(''); // Clear reply text when closing dialog
    setSelectedFile(null); // Clear selected file when closing dialog
    setSelectedReplyFile(null); // Clear reply file when closing dialog
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

  const handlePreviewFile = async (message) => {
    try {
      console.log('Starting file preview for message:', message.id);
      setError(null); // Clear any previous errors
      
      // Use the same approach as document management - direct API endpoint
      const url = `http://127.0.0.1:8000/api/support-tickets/messages/${message.id}/download`;
      console.log('Opening URL:', url);
      
      // Use window.open directly like document management does
      window.open(url, '_blank', 'noopener');
      
      console.log('File preview initiated');
      
    } catch (error) {
      console.error('Error previewing file:', error);
      setError(`Failed to preview file: ${error.message}`);
    }
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
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              border: '1px solid #E9ECEF',
              bgcolor: '#FFFFFF',
              height: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
              }
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                p: { xs: 2, sm: 2.5 },
                bgcolor: '#FFFFFF',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Warning sx={{ 
                  fontSize: { xs: 36, sm: 40, md: 44 }, 
                  color: '#E53E3E', 
                  mb: 1.5 
                }} />
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: '#2D3748',
                  fontSize: { xs: '1.8rem', sm: '2.1rem', md: '2.3rem' },
                  mb: 0.5
                }}>
                  {openTickets}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#718096',
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                  fontWeight: 500
                }}>
                  Open Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              border: '1px solid #E9ECEF',
              bgcolor: '#FFFFFF',
              height: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
              }
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                p: { xs: 2, sm: 2.5 },
                bgcolor: '#FFFFFF',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Schedule sx={{ 
                  fontSize: { xs: 36, sm: 40, md: 44 }, 
                  color: '#F59E0B', 
                  mb: 1.5 
                }} />
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: '#2D3748',
                  fontSize: { xs: '1.8rem', sm: '2.1rem', md: '2.3rem' },
                  mb: 0.5
                }}>
                  {inProgressTickets}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#718096',
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
                  fontWeight: 500
                }}>
                  In Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              border: '1px solid #E9ECEF',
              bgcolor: '#FFFFFF',
              height: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
              }
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                p: { xs: 2, sm: 2.5 }, 
                bgcolor: '#FFFFFF',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center' 
              }}>
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
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              border: '1px solid #E9ECEF',
              bgcolor: '#FFFFFF',
              height: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
              }
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                p: { xs: 2, sm: 2.5 }, 
                bgcolor: '#FFFFFF',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center' 
              }}>
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
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            py: 0.5,
                            px: 1,
                            '&:hover': {
                              backgroundColor: '#3498DB',
                              color: '#FFFFFF',
                              borderColor: '#3498DB'
                            }
                          }}
                        >
                          View
                        </Button>
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
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              m: { xs: 1, sm: 2 },
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              bgcolor: '#FFFFFF',
              color: '#2C3E50'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#FFFFFF',
            color: '#2C3E50',
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.3rem' },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2.5,
            px: 3,
            borderBottom: '1px solid #E0E0E0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SupportAgent sx={{ 
                color: '#0b87ac',
                fontSize: { xs: 24, sm: 28 }
              }} />
              <Typography variant="h6" sx={{ 
                color: '#2C3E50',
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }
              }}>
                Ticket Details
              </Typography>
            </Box>
            <IconButton 
              onClick={handleCloseViewDialog} 
              sx={{ 
                color: '#2C3E50',
                backgroundColor: '#F2F4F6',
                '&:hover': {
                  backgroundColor: '#E9EDF1'
                },
                borderRadius: 2,
                p: 1
              }}
            >
              ×
            </IconButton>
          </DialogTitle>
          <DialogContent 
            sx={{ 
              backgroundColor: '#FFFFFF',
              p: { xs: 3, sm: 4 }
            }}
          >
            {selectedTicket && (
              <Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
                {/* Ticket Header */}
                <Card sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  <Box sx={{ 
                    background: '#FFFFFF',
                    p: 3,
                    color: '#2C3E50',
                    borderBottom: '1px solid #E0E0E0'
                  }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        mb: 2,
                        fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                        lineHeight: 1.2
                      }}
                    >
                      {selectedTicket.subject}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1.5, 
                      flexWrap: 'wrap'
                    }}>
                      <Chip label={selectedTicket.category || 'General'} sx={{ backgroundColor: '#F2F4F6', color: '#2C3E50', fontWeight: 600, px: 1, py: 0.25 }} />
                      <Chip label={(selectedTicket.priority || 'medium').toUpperCase()} sx={{ backgroundColor: '#F2F4F6', color: '#2C3E50', fontWeight: 600, px: 1, py: 0.25 }} />
                      <Chip label={(selectedTicket.status || 'open').toUpperCase()} sx={{ backgroundColor: '#FFECEC', color: '#C0392B', fontWeight: 600, px: 1, py: 0.25 }} />
                    </Box>
                  </Box>
                </Card>

                <Divider sx={{ mb: 3, borderColor: '#BDC3C7' }} />

                {/* Requester Info */}
                <Card sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E9ECEF'
                }}>
                  <Box sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2C3E50',
                        mb: 2,
                        fontSize: '1.1rem'
                      }}
                    >
                      Requester Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          p: 2,
                          backgroundColor: '#F8F9FA',
                          borderRadius: 2,
                          border: '1px solid #E9ECEF'
                        }}>
                          <Person sx={{ 
                            color: '#667eea', 
                            fontSize: 22 
                          }} />
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#6C757D',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            >
                              Name
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: '#2C3E50',
                                fontWeight: 600
                              }}
                            >
                              {selectedTicket.pwd_member ? `${selectedTicket.pwd_member.firstName} ${selectedTicket.pwd_member.lastName}` : 'PWD Member'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          p: 2,
                          backgroundColor: '#F8F9FA',
                          borderRadius: 2,
                          border: '1px solid #E9ECEF'
                        }}>
                          <Email sx={{ 
                            color: '#667eea', 
                            fontSize: 22 
                          }} />
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#6C757D',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            >
                              Email
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: '#2C3E50',
                                fontWeight: 600,
                                fontSize: '0.85rem'
                              }}
                            >
                              {selectedTicket.pwd_member?.user?.email || 'Not provided'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          p: 2,
                          backgroundColor: '#F8F9FA',
                          borderRadius: 2,
                          border: '1px solid #E9ECEF'
                        }}>
                          <Phone sx={{ 
                            color: '#667eea', 
                            fontSize: 22 
                          }} />
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#6C757D',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}
                            >
                              Phone
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: '#2C3E50',
                                fontWeight: 600
                              }}
                            >
                              {selectedTicket.pwd_member?.contactNumber || 'Not provided'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>


                 {/* Messages */}
                 {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                  <Card sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E9ECEF'
                  }}>
                     <Box sx={{ p: 3 }}>
                       <Typography 
                         variant="h6" 
                         sx={{ 
                           fontWeight: 600, 
                           color: '#2C3E50',
                           mb: 3,
                           fontSize: '1.1rem'
                         }}
                       >
                         Messages ({selectedTicket.messages.length})
                       </Typography>
                       {selectedTicket.messages.map((message, index) => (
                         <Card key={index} sx={{ 
                           mb: 2, 
                           border: '1px solid #E9ECEF',
                           borderRadius: 2,
                           backgroundColor: message.sender_type === 'admin' ? '#F0F8FF' : '#F8F9FA'
                         }}>
                           <Box sx={{ p: 3 }}>
                             <Box sx={{ 
                               display: 'flex', 
                               justifyContent: 'space-between', 
                               alignItems: 'center',
                               mb: 2,
                               pb: 2,
                               borderBottom: '1px solid #E9ECEF'
                             }}>
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 <Avatar sx={{
                                   width: 32,
                                   height: 32,
                                   backgroundColor: message.sender_type === 'admin' ? '#667eea' : '#6C757D',
                                   fontSize: '0.8rem'
                                 }}>
                                   {message.sender_type === 'admin' ? 'A' : 'M'}
                                 </Avatar>
                                 <Box>
                                   <Typography 
                                     variant="body2" 
                                     sx={{ 
                                       fontWeight: 600, 
                                       color: '#2C3E50',
                                       fontSize: '0.95rem'
                                     }}
                                   >
                                     {message.sender_type === 'admin' ? 'Admin' : 'PWD Member'}
                                   </Typography>
                                   <Typography 
                                     variant="caption" 
                                     sx={{ color: '#6C757D' }}
                                   >
                                     {new Date(message.created_at).toLocaleString()}
                                   </Typography>
                                 </Box>
                               </Box>
                             </Box>
                             <Typography 
                               variant="body2" 
                               sx={{ 
                                 color: '#495057',
                                 lineHeight: 1.6,
                                 whiteSpace: 'pre-wrap'
                               }}
                             >
                               {message.message}
                             </Typography>
                             
                             {/* Attachment Display */}
                             {message.attachment_path && (
                               <Box sx={{ 
                                 mt: 2, 
                                 p: 2, 
                                 backgroundColor: '#FFFFFF',
                                 borderRadius: 2,
                                 border: '1px solid #E9ECEF'
                               }}>
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                   <AttachFile sx={{ color: '#667eea', fontSize: 20 }} />
                                   <Typography 
                                     variant="body2" 
                                     sx={{ 
                                       color: '#2C3E50',
                                       flex: 1,
                                       fontWeight: 500
                                     }}
                                   >
                                     {message.attachment_name}
                                   </Typography>
                                   <Button
                                     size="small"
                                     startIcon={<Visibility />}
                                     onClick={() => handlePreviewFile(message)}
                                     sx={{
                                       color: '#667eea',
                                       textTransform: 'none',
                                       fontSize: '0.75rem',
                                       mr: 1,
                                       border: '1px solid #667eea',
                                       '&:hover': {
                                         backgroundColor: '#667eea',
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
                                       color: '#28a745',
                                       textTransform: 'none',
                                       fontSize: '0.75rem',
                                       border: '1px solid #28a745',
                                       '&:hover': {
                                         backgroundColor: '#28a745',
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
                         </Card>
                       ))}
                     </Box>
                   </Card>
                 )}

                <Divider sx={{ mb: 3, borderColor: '#BDC3C7' }} />

                {/* Reply Section */}
               <Card sx={{ 
                 mb: 3,
                 borderRadius: 2,
                 boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                 bgcolor: '#FFFFFF',
                 border: '1px solid #E9ECEF'
               }}>
                  <Box sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#2C3E50',
                        mb: 3,
                        fontSize: '1.1rem'
                      }}
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
                          backgroundColor: '#FFFFFF',
                          '& fieldset': {
                            borderColor: '#DDE0E1',
                            borderWidth: 2
                          },
                          '&:hover fieldset': {
                            borderColor: '#667eea',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#667eea',
                          },
                        },
                        '& .MuiOutlinedInput-input': {
                          color: '#2C3E50',
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: '#6C757D',
                          opacity: 0.8,
                        },
                      }}
                    />
                    
                    {/* File Upload Section */}
                    <Box sx={{ mt: 3 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#6C757D', 
                          mb: 2,
                          fontWeight: 500
                        }}
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
                              color: '#667eea',
                              borderColor: '#667eea',
                              fontWeight: 500,
                              textTransform: 'none',
                              '&:hover': {
                                backgroundColor: '#667eea',
                                color: '#FFFFFF',
                                borderColor: '#667eea'
                              }
                            }}
                          >
                            Choose File
                          </Button>
                        </label>
                        
                        {selectedFile && (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            p: 1,
                            backgroundColor: '#F8F9FA',
                            borderRadius: 1,
                            border: '1px solid #E9ECEF'
                          }}>
                            <AttachFile sx={{ color: '#667eea', fontSize: 16 }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#2C3E50',
                                fontWeight: 500
                              }}
                            >
                              {selectedFile.name}
                            </Typography>
                            <IconButton
                              onClick={handleRemoveFile}
                              size="small"
                              sx={{ 
                                color: '#DC3545',
                                '&:hover': {
                                  backgroundColor: '#DC3545',
                                  color: '#FFFFFF'
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#6C757D', 
                          mt: 2, 
                          display: 'block',
                          fontSize: '0.75rem'
                        }}
                      >
                        Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF (Max 10MB)
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: { xs: 2, sm: 3 }, 
            backgroundColor: '#FAFBFC',
            borderTop: '1px solid #E9ECEF',
            borderRadius: '0 0 12px 12px',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 1, sm: 2 },
            justifyContent: 'flex-end'
          }}>
            <Button 
              onClick={handleCloseViewDialog} 
              sx={{ 
                color: '#6C757D',
                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                py: { xs: 1.5, sm: 1.25 },
                px: { xs: 2, sm: 3 },
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 2,
                border: '1px solid #E9ECEF',
                backgroundColor: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#F8F9FA',
                  borderColor: '#DDE0E1'
                }
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
                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                py: { xs: 1.5, sm: 1.25 },
                px: { xs: 2, sm: 3 },
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: '#0b87ac',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(11, 135, 172, 0.3)',
                '&:hover': {
                  backgroundColor: '#0a6b8a',
                  boxShadow: '0 4px 12px rgba(11, 135, 172, 0.4)'
                },
                '&:disabled': {
                  background: '#E9ECEF',
                  color: '#6C757D',
                  boxShadow: 'none'
                }
              }}
            >
              Send Reply
            </Button>
          </DialogActions>
        </Dialog>
        
      </Box>
    </Box>
  );
};

export default AdminSupportDesk;
