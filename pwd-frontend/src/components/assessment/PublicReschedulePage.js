// src/components/assessment/PublicReschedulePage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
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
  Divider
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  EventAvailable as EventAvailableIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const steps = ['Verify Token', 'Select Date', 'Confirm'];

function PublicReschedulePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Assessment data
  const [assessmentData, setAssessmentData] = useState(null);
  const [canReschedule, setCanReschedule] = useState(false);
  
  // Scheduling state
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');

  // Verify token and fetch assessment data
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No reschedule token provided');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/public/disability-assessment/reschedule/${token}`);
        
        if (response.can_reschedule) {
          setAssessmentData(response.assessment);
          setCanReschedule(true);
          setActiveStep(1);
          
          // Fetch available dates - pass the application_id directly since state hasn't updated yet
          await fetchAvailableDates(response.assessment?.application_id);
        } else {
          setError(response.message || 'You cannot reschedule this appointment');
          setCanReschedule(false);
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        setError(err.message || 'Invalid or expired reschedule link. Please check your email or contact the PDAO office.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

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
    if (!selectedDate || !selectedSlot) {
      setError('Please select a date and time slot');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/public/disability-assessment/reschedule', {
        token: token,
        new_date: selectedDate,
        slot_number: parseInt(selectedSlot)
      });
      
      setSuccess(true);
      setActiveStep(3);
    } catch (err) {
      console.error('Error rescheduling:', err);
      setError(err.message || 'Failed to reschedule assessment. Please try again.');
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
            Verifying your reschedule link...
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
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
            Reschedule Disability Assessment
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cabuyao PDAO - PWD Registration System
          </Typography>
        </Box>

        {/* Error State */}
        {error && !canReschedule && (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <WarningIcon sx={{ fontSize: 60, color: '#E74C3C', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#E74C3C', mb: 2 }}>
              Cannot Reschedule
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
              Assessment Rescheduled Successfully!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Your new appointment has been confirmed.
            </Typography>
            
            <Card sx={{ bgcolor: '#E8F5E9', borderRadius: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  New Appointment Details:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatDate(selectedDate)}
                </Typography>
                <Typography variant="body1">
                  Time: {getTimeSlotLabel(parseInt(selectedSlot))}
                </Typography>
              </CardContent>
            </Card>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              A confirmation email has been sent to your registered email address. Please make sure to attend your new appointment.
            </Alert>
            
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ bgcolor: '#1a237e' }}
            >
              Return to Home
            </Button>
          </Paper>
        )}

        {/* Main Rescheduling Flow */}
        {canReschedule && !success && (
          <>
            {/* Stepper */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Stepper activeStep={activeStep - 1} alternativeLabel>
                {['Verified', 'Select New Date', 'Confirm'].map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>

            {/* Assessment Info */}
            {assessmentData && (
              <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: '#FFF8E1', border: '1px solid #F57F17' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F57F17', mb: 2 }}>
                  ⚠️ Previous Appointment Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Reference Number:
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
                      Missed Date:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#E74C3C' }}>
                      {formatDate(assessmentData.missed_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Reschedule Attempts:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {assessmentData.reschedule_count} / {assessmentData.max_reschedule_allowed}
                    </Typography>
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
                  Select a New Date and Time
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Please select a new date and time slot for your disability assessment. Only dates with available slots are shown.
                    <br /><br />
                    <strong>Note:</strong> The office can only handle 10 appointments per day. Make sure to select an available time slot.
                  </Typography>
                </Alert>

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
                  <FormControl fullWidth sx={{ mb: 3 }}>
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

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!selectedDate || !selectedSlot}
                    startIcon={<CalendarIcon />}
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
                  Confirm Your New Appointment
                </Typography>

                <Card sx={{ bgcolor: '#E3F2FD', borderRadius: 2, mb: 3 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <EventAvailableIcon sx={{ color: '#1565C0' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565C0' }}>
                            New Appointment Details
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
                    </Grid>
                  </CardContent>
                </Card>

                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Important:</strong> This is your rescheduled appointment. Please make sure to attend on the selected date and time. 
                    Further rescheduling may not be available.
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
                    startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                    sx={{ bgcolor: '#27AE60', '&:hover': { bgcolor: '#219A52' } }}
                  >
                    {submitting ? 'Processing...' : 'Confirm Reschedule'}
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
                Cabuyao PDAO Office<br />
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
                </ul>
              </Typography>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
}

export default PublicReschedulePage;

