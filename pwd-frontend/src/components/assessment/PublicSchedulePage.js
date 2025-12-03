// src/components/assessment/PublicSchedulePage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Container,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  EventAvailable as EventAvailableIcon,
  Person as PersonIcon,
  AccessibilityNew as AccessibilityIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const steps = ['Verify', 'Select Date', 'Confirm'];

function PublicSchedulePage() {
  const { referenceNumber } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Assessment data
  const [assessmentData, setAssessmentData] = useState(null);
  const [canSchedule, setCanSchedule] = useState(false);
  
  // Scheduling state
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');

  // Verify reference number and fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!referenceNumber) {
        setError('No assessment reference number provided');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/public/disability-assessment/reference/${referenceNumber}`);
        
        if (response) {
          setAssessmentData(response);
          
          // Check if already scheduled
          if (response.status === 'scheduled' || response.status === 'completed' || response.status === 'finalized') {
            setError(`This assessment is already ${response.status}. Your scheduled date is ${response.assessment_date ? formatDate(response.assessment_date) : 'to be confirmed'}.`);
            setCanSchedule(false);
          } else if (response.status === 'pending') {
            setCanSchedule(true);
            setActiveStep(1);
            // Fetch available dates - pass the application_id directly since state hasn't updated yet
            await fetchAvailableDates(response.application_id);
          } else {
            setError(`Cannot schedule assessment. Current status: ${response.status}`);
            setCanSchedule(false);
          }
        }
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setError(err.message || 'Assessment not found. Please check the reference number or contact the PDAO office.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [referenceNumber]);

  const [applicationExpiresAt, setApplicationExpiresAt] = useState(null);

  const fetchAvailableDates = async (applicationId = null) => {
    try {
      // Include application_id to limit dates to holding period
      const appId = applicationId || assessmentData?.application_id;
      const queryParam = appId ? `?application_id=${appId}` : '';
      const response = await api.get(`/public/disability-assessment/available-dates${queryParam}`);
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
      setError('Failed to load available dates. Please try again.');
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const response = await api.get(`/public/disability-assessment/available-slots/${date}`);
      setAvailableSlots(response?.slots || []);
    } catch (err) {
      console.error('Error fetching available slots:', err);
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlot('');
    if (date) {
      await fetchAvailableSlots(date);
    }
  };

  const handleNext = () => {
    if (activeStep === 1 && selectedDate && selectedSlot) {
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot || !assessmentData) {
      setError('Please select a date and time slot');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/public/disability-assessment/schedule', {
        application_id: assessmentData.application_id,
        assessment_date: selectedDate,
        slot_number: parseInt(selectedSlot)
      });
      
      setSuccess(true);
      setActiveStep(3);
    } catch (err) {
      console.error('Error scheduling:', err);
      setError(err.message || 'Failed to schedule assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTimeSlotLabel = (slotNumber) => {
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
    return timeSlots[slotNumber] || 'Unknown';
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#F5F7FA'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading your assessment information...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7FA', py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <AccessibilityIcon sx={{ fontSize: 50, color: '#0b87ac' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
            Schedule Disability Assessment
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cabuyao PDAO - PWD Registration System
          </Typography>
        </Box>

        {/* Error State */}
        {error && !canSchedule && (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <WarningIcon sx={{ fontSize: 60, color: '#E74C3C', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#E74C3C', mb: 2 }}>
              Cannot Schedule Assessment
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ bgcolor: '#1a237e' }}
            >
              Return to Home
            </Button>
          </Paper>
        )}

        {/* Success State */}
        {success && (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: '#27AE60', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#27AE60', mb: 2 }}>
              Assessment Scheduled Successfully!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Your disability assessment appointment has been confirmed.
            </Typography>
            
            <Card sx={{ bgcolor: '#E8F5E9', borderRadius: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Appointment Details:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatDate(selectedDate)}
                </Typography>
                <Typography variant="body1">
                  Time: {getTimeSlotLabel(parseInt(selectedSlot))}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: '#2E7D32' }}>
                  Reference: {referenceNumber}
                </Typography>
              </CardContent>
            </Card>
            
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>A confirmation email has been sent to your registered email address.</strong>
                <br /><br />
                Please arrive 15 minutes before your scheduled time and bring the following:
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  <li>Valid Government ID</li>
                  <li>Medical Certificate (if available)</li>
                  <li>Any medical records related to your disability</li>
                </ul>
              </Typography>
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/check-status')}
              >
                Check Application Status
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{ bgcolor: '#1a237e' }}
              >
                Return to Home
              </Button>
            </Box>
          </Paper>
        )}

        {/* Main Scheduling Flow */}
        {canSchedule && !success && (
          <>
            {/* Stepper */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Stepper activeStep={activeStep - 1} alternativeLabel>
                {['Verified', 'Select Date & Time', 'Confirm'].map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>

            {/* Assessment Info */}
            {assessmentData && (
              <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: '#E3F2FD', border: '1px solid #1976D2' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon /> Your Assessment Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Assessment Reference:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {assessmentData.reference_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Applicant Name:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {assessmentData.applicant_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Email:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {assessmentData.applicant_email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Disability Type:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {assessmentData.disability_type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Status:
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip 
                        label="Pending Schedule" 
                        color="warning" 
                        size="small"
                        icon={<ScheduleIcon />}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Select Date Step */}
            {activeStep === 1 && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Select Your Preferred Date and Time
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Please select a date and time slot for your disability assessment. 
                    Only dates with available slots are shown. The office can handle up to <strong>10 appointments per day</strong>.
                  </Typography>
                </Alert>

                {applicationExpiresAt && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>Important:</strong> Your assessment must be scheduled before{' '}
                      <strong>{new Date(applicationExpiresAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                      {' '}(application holding period).
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span>{formatDate(dateOption.date)}</span>
                          <Chip 
                            label={`${dateOption.available_slots} slots`} 
                            size="small" 
                            color={dateOption.available_slots > 5 ? 'success' : 'warning'}
                            sx={{ ml: 2 }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedDate && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Time Slot</InputLabel>
                    <Select
                      value={selectedSlot}
                      label="Select Time Slot"
                      onChange={(e) => setSelectedSlot(e.target.value)}
                    >
                      {availableSlots.filter(s => s.is_available).map((slot) => (
                        <MenuItem key={slot.slot_number} value={slot.slot_number}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon sx={{ fontSize: 18, color: '#0b87ac' }} />
                            {slot.time_label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {selectedDate && availableSlots.filter(s => s.is_available).length === 0 && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    No available time slots for this date. Please select a different date.
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!selectedDate || !selectedSlot}
                    startIcon={<CalendarIcon />}
                    sx={{ bgcolor: '#0b87ac', '&:hover': { bgcolor: '#097a9c' } }}
                  >
                    Continue
                  </Button>
                </Box>
              </Paper>
            )}

            {/* Confirm Step */}
            {activeStep === 2 && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Confirm Your Appointment
                </Typography>

                <Card sx={{ bgcolor: '#E8F5E9', borderRadius: 2, mb: 3 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <EventAvailableIcon sx={{ color: '#2E7D32' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                            Appointment Details
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Date:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatDate(selectedDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Time Slot:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {getTimeSlotLabel(parseInt(selectedSlot))}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Reference Number:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {referenceNumber}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Important:</strong> Please make sure to attend your assessment on the scheduled date and time. 
                    Arrive 15 minutes early and bring all required documents. 
                    If you cannot attend, please contact the PDAO office as soon as possible.
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                    sx={{ bgcolor: '#27AE60', '&:hover': { bgcolor: '#219A52' } }}
                  >
                    {submitting ? 'Scheduling...' : 'Confirm Schedule'}
                  </Button>
                </Box>
              </Paper>
            )}

            {/* Location Info */}
            <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                📍 Assessment Location
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Cabuyao PDAO Office</strong><br />
                City Hall Complex, Cabuyao, Laguna<br />
                <strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                <strong>What to Bring:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>Valid Government ID</li>
                  <li>Medical Certificate (if available)</li>
                  <li>Previous medical records related to your disability</li>
                  <li>2x2 ID Picture (if not yet submitted)</li>
                </ul>
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                <strong>Contact Information:</strong><br />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <EmailIcon sx={{ fontSize: 16 }} />
                  pdao@cabuyao.gov.ph
                </Box>
              </Typography>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
}

export default PublicSchedulePage;

