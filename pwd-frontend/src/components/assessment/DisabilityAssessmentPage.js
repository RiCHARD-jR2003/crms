// src/components/assessment/DisabilityAssessmentPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Today as TodayIcon,
  Upcoming as UpcomingIcon,
  EventBusy as MissedIcon,
  PersonOff as AbsentIcon,
  Person as PresentIcon,
  Restore as RescheduleIcon,
  Upload as UploadIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../shared/AdminSidebar';
import Staff1Sidebar from '../shared/Staff1Sidebar';
import MobileHeader from '../shared/MobileHeader';
import DisabilityAssessmentForm from './DisabilityAssessmentForm';

const STATUS_COLORS = {
  pending: { bg: '#FFF3E0', color: '#E65100', label: 'Pending Schedule' },
  scheduled: { bg: '#E3F2FD', color: '#1565C0', label: 'Scheduled' },
  completed: { bg: '#E8F5E9', color: '#2E7D32', label: 'Completed' },
  finalized: { bg: '#F3E5F5', color: '#7B1FA2', label: 'Finalized' },
  uploaded: { bg: '#E0F2F1', color: '#00695C', label: 'PDF Uploaded' },
  missed: { bg: '#FFEBEE', color: '#C62828', label: 'Missed' },
  rescheduled: { bg: '#FFF8E1', color: '#F57F17', label: 'Rescheduled' },
  cancelled: { bg: '#ECEFF1', color: '#546E7A', label: 'Cancelled' }
};

function DisabilityAssessmentPage() {
  const { currentUser } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Dialog states
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  
  // Schedule dialog state
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [scheduling, setScheduling] = useState(false);
  
  // Reschedule dialog state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');
  
  // Upload PDF dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Statistics
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    pending: 0,
    completed: 0,
    missed: 0
  });

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('page', page + 1);
      params.append('per_page', rowsPerPage);
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (dateFilter) {
        params.append('date', dateFilter);
      }

      const response = await api.get(`/disability-assessments?${params.toString()}`);
      
      if (response.data) {
        setAssessments(response.data);
        setTotalCount(response.total || response.data.length);
      } else {
        setAssessments(response.data || []);
        setTotalCount(response.total || 0);
      }
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError('Failed to load assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter, dateFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const statsRes = await api.get('/disability-assessments/statistics');
      
      setStats({
        today: statsRes?.today_scheduled || 0,
        upcoming: statsRes?.scheduled || 0,
        pending: statsRes?.pending || 0,
        completed: (statsRes?.completed || 0) + (statsRes?.finalized || 0),
        missed: statsRes?.missed || 0,
        todaySlotsRemaining: statsRes?.today_slots_remaining || 10
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Fallback to local calculation
      setStats({
        today: assessments.filter(a => {
          const today = new Date().toISOString().split('T')[0];
          return a.assessment_date === today && a.status === 'scheduled';
        }).length,
        upcoming: assessments.filter(a => a.status === 'scheduled').length,
        pending: assessments.filter(a => a.status === 'pending').length,
        completed: assessments.filter(a => a.status === 'completed' || a.status === 'finalized').length,
        missed: assessments.filter(a => a.status === 'missed').length
      });
    }
  }, [assessments]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  useEffect(() => {
    if (assessments.length > 0) {
      fetchStats();
    }
  }, [assessments, fetchStats]);

  const [applicationExpiresAt, setApplicationExpiresAt] = useState(null);

  const fetchAvailableDates = async (applicationId = null) => {
    try {
      const params = applicationId ? `?application_id=${applicationId}` : '';
      const response = await api.get(`/disability-assessments/available-dates${params}`);
      // Handle both old (array) and new (object with dates) response formats
      if (response?.dates) {
        setAvailableDates(response.dates);
        setApplicationExpiresAt(response.application_expires_at);
      } else {
        setAvailableDates(response || []);
        setApplicationExpiresAt(null);
      }
    } catch (err) {
      console.error('Error fetching available dates:', err);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const response = await api.get(`/disability-assessments/available-slots/${date}`);
      setAvailableSlots(response?.slots || []);
    } catch (err) {
      console.error('Error fetching available slots:', err);
    }
  };

  const handleScheduleClick = async (assessment) => {
    setSelectedAssessment(assessment);
    setSelectedDate('');
    setSelectedSlot('');
    setAvailableSlots([]);
    await fetchAvailableDates(assessment.application_id);
    setScheduleDialogOpen(true);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlot('');
    if (date) {
      await fetchAvailableSlots(date);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!selectedDate || !selectedSlot) {
      return;
    }

    setScheduling(true);
    try {
      await api.post('/disability-assessments/schedule', {
        application_id: selectedAssessment.application_id,
        assessment_date: selectedDate,
        slot_number: parseInt(selectedSlot)
      });
      
      setScheduleDialogOpen(false);
      fetchAssessments();
    } catch (err) {
      console.error('Error scheduling assessment:', err);
      setError(err.message || 'Failed to schedule assessment');
    } finally {
      setScheduling(false);
    }
  };

  const handleViewForm = (assessment) => {
    setSelectedAssessment(assessment);
    setFormDialogOpen(true);
  };

  const handleFormSave = async (formData) => {
    try {
      await api.put(`/disability-assessments/${selectedAssessment.id}`, formData);
      setFormDialogOpen(false);
      fetchAssessments();
    } catch (err) {
      console.error('Error saving assessment:', err);
      throw err;
    }
  };

  const handleFinalize = async (assessment) => {
    try {
      const response = await api.post(`/disability-assessments/${assessment.id}/finalize`);
      
      // Trigger PDF download
      if (response.pdf_url) {
        window.open(response.pdf_url, '_blank');
      }
      
      fetchAssessments();
    } catch (err) {
      console.error('Error finalizing assessment:', err);
      setError(err.message || 'Failed to finalize assessment');
    }
  };

  const handleDownloadPDF = async (assessment) => {
    try {
      const response = await api.get(`/disability-assessments/${assessment.id}/download-pdf`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assessment_${assessment.reference_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading PDF:', err);
      // Try opening in new tab as fallback
      window.open(`${api.getBaseUrl()}/disability-assessments/${assessment.id}/download-pdf`, '_blank');
    }
  };

  // Mark as missed appointment
  const handleMarkAsMissed = async (assessment) => {
    setSelectedAssessment(assessment);
    setConfirmMessage(`Are you sure you want to mark ${assessment.applicant_name}'s appointment as MISSED? This will send them an email notification with a reschedule link (if they haven't already used their reschedule opportunity).`);
    setConfirmAction('missed');
    setConfirmDialogOpen(true);
  };

  const confirmMarkAsMissed = async () => {
    try {
      await api.post(`/disability-assessments/${selectedAssessment.id}/mark-missed`);
      setConfirmDialogOpen(false);
      fetchAssessments();
    } catch (err) {
      console.error('Error marking as missed:', err);
      setError(err.message || 'Failed to mark appointment as missed');
    }
  };

  // Mark as present
  const handleMarkAsPresent = async (assessment) => {
    try {
      await api.post(`/disability-assessments/${assessment.id}/mark-present`);
      fetchAssessments();
    } catch (err) {
      console.error('Error marking as present:', err);
      setError(err.message || 'Failed to mark attendance');
    }
  };

  // Admin reschedule
  const handleRescheduleClick = async (assessment) => {
    setSelectedAssessment(assessment);
    setSelectedDate('');
    setSelectedSlot('');
    setRescheduleReason('');
    setAvailableSlots([]);
    await fetchAvailableDates(assessment.application_id);
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedDate || !selectedSlot) {
      return;
    }

    setScheduling(true);
    try {
      await api.post(`/disability-assessments/${selectedAssessment.id}/reschedule`, {
        new_date: selectedDate,
        slot_number: parseInt(selectedSlot),
        reason: rescheduleReason
      });
      
      setRescheduleDialogOpen(false);
      fetchAssessments();
    } catch (err) {
      console.error('Error rescheduling assessment:', err);
      setError(err.message || 'Failed to reschedule assessment');
    } finally {
      setScheduling(false);
    }
  };

  // Upload PDF
  const handleUploadClick = (assessment) => {
    setSelectedAssessment(assessment);
    setUploadFile(null);
    setUploadDialogOpen(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadFile(file);
    } else {
      setError('Please select a PDF file');
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', uploadFile);
      
      await api.post(`/disability-assessments/${selectedAssessment.id}/upload-pdf`, formData);
      
      setUploadDialogOpen(false);
      fetchAssessments();
    } catch (err) {
      console.error('Error uploading PDF:', err);
      setError(err.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'missed') {
      confirmMarkAsMissed();
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const searchLower = searchTerm.toLowerCase();
    const disabilityType = assessment.disability_type || assessment.application?.disabilityType || '';
    return (
      assessment.reference_number?.toLowerCase().includes(searchLower) ||
      assessment.applicant_name?.toLowerCase().includes(searchLower) ||
      assessment.application?.barangay?.toLowerCase().includes(searchLower) ||
      disabilityType.toLowerCase().includes(searchLower)
    );
  });

  const getStatusChip = (status) => {
    const statusConfig = STATUS_COLORS[status] || { bg: '#E0E0E0', color: '#616161', label: status };
    return (
      <Chip
        label={statusConfig.label}
        size="small"
        sx={{
          bgcolor: statusConfig.bg,
          color: statusConfig.color,
          fontWeight: 600,
          fontSize: '0.75rem'
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (slotNumber) => {
    const timeSlots = {
      1: '8:00 AM - 8:30 AM',
      2: '8:30 AM - 9:00 AM',
      3: '9:00 AM - 9:30 AM',
      4: '9:30 AM - 10:00 AM',
      5: '10:00 AM - 10:30 AM',
      6: '10:30 AM - 11:00 AM',
      7: '1:00 PM - 1:30 PM',
      8: '1:30 PM - 2:00 PM',
      9: '2:00 PM - 2:30 PM',
      10: '2:30 PM - 3:00 PM'
    };
    return timeSlots[slotNumber] || 'Not assigned';
  };

  // Render the appropriate sidebar based on user role
  const renderSidebar = () => {
    if (currentUser?.role === 'Staff1') {
      return <Staff1Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />;
    }
    return <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      {renderSidebar()}
      <MobileHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} title="Disability Assessment" />
      
      <Box sx={{ flexGrow: 1, p: 3, ml: { xs: 0, md: '280px' }, mt: { xs: '56px', md: 0 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
            Disability Assessment Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Schedule and manage disability assessments for PWD applicants
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#E3F2FD', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TodayIcon sx={{ fontSize: 40, color: '#1565C0' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1565C0' }}>
                      {stats.today}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Today's Appointments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#FFF3E0', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 40, color: '#E65100' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#E65100' }}>
                      {stats.pending}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Schedule
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#E8F5E9', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <UpcomingIcon sx={{ fontSize: 40, color: '#2E7D32' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                      {stats.upcoming}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#F3E5F5', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: '#7B1FA2' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#7B1FA2' }}>
                      {stats.completed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {stats.missed > 0 && (
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#FFEBEE', borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <MissedIcon sx={{ fontSize: 40, color: '#C62828' }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#C62828' }}>
                        {stats.missed}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Missed
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by reference number, name, or barangay..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending Schedule</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="finalized">Finalized</MenuItem>
                  <MenuItem value="uploaded">PDF Uploaded</MenuItem>
                  <MenuItem value="missed">Missed</MenuItem>
                  <MenuItem value="rescheduled">Rescheduled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Filter by Date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchAssessments}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Assessments Table */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Reference Number</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Applicant Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Disability Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Barangay</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Scheduled Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Scheduled Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredAssessments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        No assessments found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssessments.map((assessment) => {
                    // Check if assessment is for today
                    const isToday = assessment.assessment_date && 
                      new Date(assessment.assessment_date).toDateString() === new Date().toDateString();
                    
                    return (
                    <TableRow 
                      key={assessment.id} 
                      hover
                      sx={{
                        bgcolor: isToday && assessment.status === 'scheduled' ? '#E8F5E9' : 'inherit',
                        '&:hover': { bgcolor: isToday ? '#C8E6C9' : undefined }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                          {assessment.reference_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          App: {assessment.application?.referenceNumber}
                        </Typography>
                        {assessment.reschedule_count > 0 && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#F57F17' }}>
                            Rescheduled: {assessment.reschedule_count}x
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {assessment.applicant_name}
                        {assessment.attendance_status === 'present' && (
                          <Chip label="Present" size="small" sx={{ ml: 1, bgcolor: '#E8F5E9', color: '#2E7D32', fontSize: '0.65rem' }} />
                        )}
                        {assessment.attendance_status === 'absent' && (
                          <Chip label="Absent" size="small" sx={{ ml: 1, bgcolor: '#FFEBEE', color: '#C62828', fontSize: '0.65rem' }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={assessment.disability_type || assessment.application?.disabilityType || 'N/A'} 
                          size="small" 
                          sx={{ 
                            bgcolor: '#E3F2FD', 
                            color: '#1565C0',
                            fontSize: '0.7rem',
                            fontWeight: 500
                          }} 
                        />
                      </TableCell>
                      <TableCell>{assessment.application?.barangay || 'N/A'}</TableCell>
                      <TableCell>
                        {formatDate(assessment.assessment_date)}
                        {isToday && assessment.status === 'scheduled' && (
                          <Chip label="TODAY" size="small" sx={{ ml: 1, bgcolor: '#27AE60', color: 'white', fontSize: '0.65rem' }} />
                        )}
                      </TableCell>
                      <TableCell>{formatTime(assessment.slot_number)}</TableCell>
                      <TableCell>{getStatusChip(assessment.status)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                          {/* Schedule - for pending assessments */}
                          {assessment.status === 'pending' && (
                            <Tooltip title="Schedule Assessment">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleScheduleClick(assessment)}
                              >
                                <CalendarIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {/* Mark Attendance - for scheduled assessments on or after their date */}
                          {assessment.status === 'scheduled' && (
                            <>
                              <Tooltip title="Mark as Present">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#2E7D32' }}
                                  onClick={() => handleMarkAsPresent(assessment)}
                                >
                                  <PresentIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Mark as Missed">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#C62828' }}
                                  onClick={() => handleMarkAsMissed(assessment)}
                                >
                                  <AbsentIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reschedule">
                                <IconButton
                                  size="small"
                                  sx={{ color: '#F57F17' }}
                                  onClick={() => handleRescheduleClick(assessment)}
                                >
                                  <RescheduleIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {/* Open Assessment Form - for scheduled or completed */}
                          {['scheduled', 'completed'].includes(assessment.status) && (
                            <Tooltip title="Open Assessment Form">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleViewForm(assessment)}
                              >
                                <AssignmentIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {/* Finalize - for completed assessments */}
                          {assessment.status === 'completed' && (
                            <Tooltip title="Finalize & Generate PDF">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleFinalize(assessment)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {/* Upload PDF - for finalized assessments */}
                          {assessment.status === 'finalized' && (
                            <Tooltip title="Upload PDF">
                              <IconButton
                                size="small"
                                sx={{ color: '#00695C' }}
                                onClick={() => handleUploadClick(assessment)}
                              >
                                <UploadIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {/* Download PDF - for finalized or uploaded */}
                          {['finalized', 'uploaded'].includes(assessment.status) && (
                            <Tooltip title="Download PDF">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleDownloadPDF(assessment)}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {/* Reschedule - for missed assessments that can still be rescheduled */}
                          {assessment.status === 'missed' && assessment.reschedule_count < (assessment.max_reschedule_allowed || 1) && (
                            <Tooltip title="Reschedule (Admin)">
                              <IconButton
                                size="small"
                                sx={{ color: '#F57F17' }}
                                onClick={() => handleRescheduleClick(assessment)}
                              >
                                <RescheduleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {/* Warning for missed with no reschedule */}
                          {assessment.status === 'missed' && assessment.reschedule_count >= (assessment.max_reschedule_allowed || 1) && (
                            <Tooltip title="Reschedule limit reached - contact applicant">
                              <IconButton size="small" sx={{ color: '#C62828' }}>
                                <WarningIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {/* View Details - always available */}
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewForm(assessment)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )})
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Paper>

        {/* Schedule Dialog */}
        <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Schedule Disability Assessment
          </DialogTitle>
          <DialogContent>
            {selectedAssessment && (
              <Box sx={{ pt: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2">
                    Applicant: {selectedAssessment.applicant_name}
                  </Typography>
                  <Typography variant="caption">
                    Reference: {selectedAssessment.reference_number}
                  </Typography>
                </Alert>
                
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Maximum 10 appointments per day. Dates with no available slots will show 0 slots remaining.
                </Alert>
                
                {applicationExpiresAt && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Application Holding Period:</strong> Assessment must be scheduled before{' '}
                      <strong>{new Date(applicationExpiresAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                    </Typography>
                  </Alert>
                )}

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Date</InputLabel>
                  <Select
                    value={selectedDate}
                    label="Select Date"
                    onChange={(e) => handleDateChange(e.target.value)}
                  >
                    {availableDates.filter(d => d.is_available).map((dateOption) => (
                      <MenuItem key={dateOption.date} value={dateOption.date}>
                        {formatDate(dateOption.date)} ({dateOption.available_slots} slots available)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedDate && (
                  <FormControl fullWidth>
                    <InputLabel>Select Time Slot</InputLabel>
                    <Select
                      value={selectedSlot}
                      label="Select Time Slot"
                      onChange={(e) => setSelectedSlot(e.target.value)}
                    >
                      {availableSlots.filter(s => s.is_available).map((slot) => (
                        <MenuItem key={slot.slot_number} value={slot.slot_number}>
                          {slot.time_label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleScheduleSubmit}
              disabled={!selectedDate || !selectedSlot || scheduling}
            >
              {scheduling ? <CircularProgress size={20} /> : 'Schedule'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assessment Form Dialog */}
        <Dialog 
          open={formDialogOpen} 
          onClose={() => setFormDialogOpen(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{ sx: { minHeight: '80vh' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Disability Assessment Form</Typography>
              {selectedAssessment && (
                <Typography variant="caption" color="text.secondary">
                  Reference: {selectedAssessment.reference_number}
                </Typography>
              )}
            </Box>
            {selectedAssessment && getStatusChip(selectedAssessment.status)}
          </DialogTitle>
          <DialogContent dividers>
            {selectedAssessment && (
              <DisabilityAssessmentForm
                assessment={selectedAssessment}
                onSave={handleFormSave}
                onClose={() => setFormDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleDialogOpen} onClose={() => setRescheduleDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Reschedule Disability Assessment
          </DialogTitle>
          <DialogContent>
            {selectedAssessment && (
              <Box sx={{ pt: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2">
                    Applicant: {selectedAssessment.applicant_name}
                  </Typography>
                  <Typography variant="caption">
                    Original Date: {formatDate(selectedAssessment.assessment_date)}
                  </Typography>
                  {selectedAssessment.reschedule_count > 0 && (
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: '#F57F17' }}>
                      ⚠️ This appointment has been rescheduled {selectedAssessment.reschedule_count} time(s)
                    </Typography>
                  )}
                </Alert>
                
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Admin reschedule does not count against the applicant's reschedule limit.
                </Alert>
                
                {applicationExpiresAt && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Application Holding Period:</strong> Assessment must be scheduled before{' '}
                      <strong>{new Date(applicationExpiresAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                    </Typography>
                  </Alert>
                )}

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Reason for Rescheduling (Optional)"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  sx={{ mb: 3 }}
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select New Date</InputLabel>
                  <Select
                    value={selectedDate}
                    label="Select New Date"
                    onChange={(e) => handleDateChange(e.target.value)}
                  >
                    {availableDates.filter(d => d.is_available).map((dateOption) => (
                      <MenuItem key={dateOption.date} value={dateOption.date}>
                        {formatDate(dateOption.date)} ({dateOption.available_slots} slots available)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedDate && (
                  <FormControl fullWidth>
                    <InputLabel>Select Time Slot</InputLabel>
                    <Select
                      value={selectedSlot}
                      label="Select Time Slot"
                      onChange={(e) => setSelectedSlot(e.target.value)}
                    >
                      {availableSlots.filter(s => s.is_available).map((slot) => (
                        <MenuItem key={slot.slot_number} value={slot.slot_number}>
                          {slot.time_label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleRescheduleSubmit}
              disabled={!selectedDate || !selectedSlot || scheduling}
            >
              {scheduling ? <CircularProgress size={20} /> : 'Reschedule'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Upload PDF Dialog */}
        <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Upload Assessment PDF
          </DialogTitle>
          <DialogContent>
            {selectedAssessment && (
              <Box sx={{ pt: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2">
                    Applicant: {selectedAssessment.applicant_name}
                  </Typography>
                  <Typography variant="caption">
                    Reference: {selectedAssessment.reference_number}
                  </Typography>
                </Alert>
                
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Please upload the signed/finalized PDF version of the assessment form. This is required before the application can receive final approval.
                </Alert>

                <Box
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: uploadFile ? '#E8F5E9' : '#FAFAFA',
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#1976D2', bgcolor: '#E3F2FD' }
                  }}
                  onClick={() => document.getElementById('pdf-upload-input').click()}
                >
                  <input
                    id="pdf-upload-input"
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  {uploadFile ? (
                    <>
                      <CheckCircleIcon sx={{ fontSize: 48, color: '#2E7D32', mb: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#2E7D32' }}>
                        {uploadFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Click to choose a different file
                      </Typography>
                    </>
                  ) : (
                    <>
                      <UploadIcon sx={{ fontSize: 48, color: '#9E9E9E', mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        Click to select PDF file
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Only PDF files are accepted (max 10MB)
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUploadSubmit}
              disabled={!uploadFile || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
            >
              {uploading ? 'Uploading...' : 'Upload PDF'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm">
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: '#F57F17' }} />
            Confirm Action
          </DialogTitle>
          <DialogContent>
            <Typography>{confirmMessage}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleConfirmAction}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default DisabilityAssessmentPage;

