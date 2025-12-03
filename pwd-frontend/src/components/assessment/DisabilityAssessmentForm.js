// src/components/assessment/DisabilityAssessmentForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper
} from '@mui/material';
import {
  Save as SaveIcon,
  CheckCircle as FinalizeIcon,
  Download as DownloadIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { api } from '../../services/api';

// Helper function to check if date is today
const isToday = (dateString) => {
  if (!dateString) return false;
  const assessmentDate = new Date(dateString);
  const today = new Date();
  return (
    assessmentDate.getFullYear() === today.getFullYear() &&
    assessmentDate.getMonth() === today.getMonth() &&
    assessmentDate.getDate() === today.getDate()
  );
};

// Helper function to format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'Not scheduled';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const FUNCTIONAL_LIMITATIONS = [
  'Mobility impairment',
  'Vision impairment',
  'Hearing impairment',
  'Speech impairment',
  'Cognitive impairment',
  'Mental health condition',
  'Learning disability',
  'Chronic fatigue',
  'Chronic pain',
  'Fine motor skills impairment',
  'Gross motor skills impairment',
  'Balance issues',
  'Coordination difficulties',
  'Memory issues',
  'Attention/concentration difficulties'
];

const ASSISTIVE_DEVICES = [
  'Wheelchair',
  'Crutches',
  'Walker',
  'Cane',
  'Prosthetic limb',
  'Hearing aid',
  'Cochlear implant',
  'Eyeglasses/Contact lenses',
  'Magnifier',
  'White cane',
  'Screen reader',
  'Communication board',
  'Speech generating device',
  'Orthotic device',
  'Braille display'
];

function DisabilityAssessmentForm({ assessment, onSave, onClose }) {
  const [formData, setFormData] = useState({
    disability_type: '',
    disability_description: '',
    disability_cause: '',
    disability_onset_date: '',
    disability_severity: '',
    functional_limitations: [],
    mobility_status: '',
    communication_ability: '',
    self_care_ability: '',
    learning_ability: '',
    attending_physician: '',
    physician_license_no: '',
    medical_facility: '',
    medical_findings: '',
    recommendations: '',
    assistive_devices_current: [],
    assistive_devices_needed: [],
    assessor_notes: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (assessment) {
      setFormData({
        disability_type: assessment.disability_type || assessment.application?.disabilityType || '',
        disability_description: assessment.disability_description || '',
        disability_cause: assessment.disability_cause || assessment.application?.disabilityCause || '',
        disability_onset_date: assessment.disability_onset_date 
          ? new Date(assessment.disability_onset_date).toISOString().split('T')[0] 
          : '',
        disability_severity: assessment.disability_severity || '',
        functional_limitations: assessment.functional_limitations || [],
        mobility_status: assessment.mobility_status || '',
        communication_ability: assessment.communication_ability || '',
        self_care_ability: assessment.self_care_ability || '',
        learning_ability: assessment.learning_ability || '',
        attending_physician: assessment.attending_physician || '',
        physician_license_no: assessment.physician_license_no || '',
        medical_facility: assessment.medical_facility || '',
        medical_findings: assessment.medical_findings || '',
        recommendations: assessment.recommendations || '',
        assistive_devices_current: assessment.assistive_devices_current || [],
        assistive_devices_needed: assessment.assistive_devices_needed || [],
        assessor_notes: assessment.assessor_notes || ''
      });
    }
  }, [assessment]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleSave = async (markCompleted = false) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const dataToSave = { ...formData };
      if (markCompleted) {
        dataToSave.status = 'completed';
      }

      await onSave(dataToSave);
      setSuccess(markCompleted ? 'Assessment completed successfully!' : 'Assessment saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!validateForm()) {
      setError('Please fill in all required fields before finalizing.');
      return;
    }

    setFinalizing(true);
    setError('');
    setSuccess('');

    try {
      // First save the form data with completed status
      const dataToSave = { ...formData, status: 'completed' };
      await api.put(`/disability-assessments/${assessment.id}`, dataToSave);

      // Then finalize to generate PDF
      const response = await api.post(`/disability-assessments/${assessment.id}/finalize`);
      
      setSuccess('Assessment finalized! PDF has been generated.');

      // Auto-download PDF
      if (response.pdf_url) {
        // Open PDF in new tab for download
        window.open(response.pdf_url, '_blank');
      } else {
        // Fallback: trigger download endpoint
        const downloadUrl = `${api.getBaseUrl()}/disability-assessments/${assessment.id}/download-pdf`;
        window.open(downloadUrl, '_blank');
      }

      // Refresh the page after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to finalize assessment');
    } finally {
      setFinalizing(false);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'disability_type',
      'disability_description',
      'disability_severity'
    ];
    return requiredFields.every(field => formData[field] && formData[field].toString().trim() !== '');
  };

  // Check if already finalized - always read-only
  const isFinalized = assessment?.status === 'finalized' || assessment?.status === 'uploaded';
  
  // Check if it's the day of the assessment
  const isAssessmentDay = isToday(assessment?.assessment_date);
  
  // Form is editable only if: not finalized AND it's the assessment day
  // Status must be 'scheduled' or 'completed' (for editing before finalize)
  const canEdit = !isFinalized && isAssessmentDay && ['scheduled', 'completed'].includes(assessment?.status);
  
  // Form is read-only if it's finalized OR if it's not the assessment day
  const isReadOnly = isFinalized || !canEdit;
  
  // Reason for being read-only (for display)
  const getReadOnlyReason = () => {
    if (isFinalized) {
      return 'This assessment has been finalized and cannot be edited.';
    }
    if (assessment?.status === 'pending') {
      return 'This assessment has not been scheduled yet. It can be edited once a schedule is set and on the day of the appointment.';
    }
    if (assessment?.status === 'missed') {
      return 'This assessment appointment was missed. Please reschedule the appointment first.';
    }
    if (!isAssessmentDay && assessment?.assessment_date) {
      const assessmentDate = new Date(assessment.assessment_date);
      const today = new Date();
      if (assessmentDate > today) {
        return `This form can only be edited on the day of the assessment: ${formatDate(assessment.assessment_date)}. Please return on that date to fill out the form.`;
      } else {
        return `The scheduled assessment date (${formatDate(assessment.assessment_date)}) has passed. Please reschedule the appointment if the applicant missed it.`;
      }
    }
    return 'This form is currently in view-only mode.';
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Read-only warning */}
      {isReadOnly && !isFinalized && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          icon={<LockIcon />}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            View Only Mode
          </Typography>
          <Typography variant="body2">
            {getReadOnlyReason()}
          </Typography>
        </Alert>
      )}
      
      {/* Editable indicator */}
      {canEdit && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          icon={<LockOpenIcon />}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            ✅ Today is the Assessment Day
          </Typography>
          <Typography variant="body2">
            You can now edit and complete this assessment form for {assessment?.applicant_name}.
          </Typography>
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Applicant Information */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#F5F5F5' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Applicant Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary">Name</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {assessment?.applicant_name}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary">Reference Number</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {assessment?.reference_number}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary">Assessment Date</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {assessment?.assessment_date 
                ? new Date(assessment.assessment_date).toLocaleDateString()
                : 'Not scheduled'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Disability Information */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a237e' }}>
        Disability Information
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Type of Disability</InputLabel>
            <Select
              value={formData.disability_type}
              label="Type of Disability"
              onChange={(e) => handleChange('disability_type', e.target.value)}
              disabled={isReadOnly}
            >
              <MenuItem value="Physical Disability">Physical Disability</MenuItem>
              <MenuItem value="Visual Disability">Visual Disability</MenuItem>
              <MenuItem value="Hearing Disability">Hearing Disability</MenuItem>
              <MenuItem value="Speech Disability">Speech Disability</MenuItem>
              <MenuItem value="Intellectual Disability">Intellectual Disability</MenuItem>
              <MenuItem value="Mental Disability">Mental Disability</MenuItem>
              <MenuItem value="Psychosocial Disability">Psychosocial Disability</MenuItem>
              <MenuItem value="Learning Disability">Learning Disability</MenuItem>
              <MenuItem value="Multiple Disabilities">Multiple Disabilities</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Severity</InputLabel>
            <Select
              value={formData.disability_severity}
              label="Severity"
              onChange={(e) => handleChange('disability_severity', e.target.value)}
              disabled={isReadOnly}
            >
              <MenuItem value="mild">Mild</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="severe">Severe</MenuItem>
              <MenuItem value="profound">Profound</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label="Description of Disability"
            value={formData.disability_description}
            onChange={(e) => handleChange('disability_description', e.target.value)}
            disabled={isReadOnly}
            placeholder="Provide a detailed description of the disability..."
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Cause of Disability"
            value={formData.disability_cause}
            onChange={(e) => handleChange('disability_cause', e.target.value)}
            disabled={isReadOnly}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="date"
            label="Onset Date"
            value={formData.disability_onset_date}
            onChange={(e) => handleChange('disability_onset_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={isReadOnly}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Functional Limitations */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a237e' }}>
        Functional Limitations
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormGroup>
          <Grid container>
            {FUNCTIONAL_LIMITATIONS.map((limitation) => (
              <Grid item xs={12} sm={6} md={4} key={limitation}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.functional_limitations.includes(limitation)}
                      onChange={() => handleArrayToggle('functional_limitations', limitation)}
                      disabled={isReadOnly}
                    />
                  }
                  label={limitation}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Mobility Status"
            value={formData.mobility_status}
            onChange={(e) => handleChange('mobility_status', e.target.value)}
            disabled={isReadOnly}
            placeholder="Describe mobility capabilities and limitations..."
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Communication Ability"
            value={formData.communication_ability}
            onChange={(e) => handleChange('communication_ability', e.target.value)}
            disabled={isReadOnly}
            placeholder="Describe communication capabilities..."
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Self-Care Ability"
            value={formData.self_care_ability}
            onChange={(e) => handleChange('self_care_ability', e.target.value)}
            disabled={isReadOnly}
            placeholder="Describe self-care capabilities..."
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Learning Ability"
            value={formData.learning_ability}
            onChange={(e) => handleChange('learning_ability', e.target.value)}
            disabled={isReadOnly}
            placeholder="Describe learning capabilities..."
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Medical Information */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a237e' }}>
        Medical Information
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Attending Physician"
            value={formData.attending_physician}
            onChange={(e) => handleChange('attending_physician', e.target.value)}
            disabled={isReadOnly}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="License Number"
            value={formData.physician_license_no}
            onChange={(e) => handleChange('physician_license_no', e.target.value)}
            disabled={isReadOnly}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Medical Facility"
            value={formData.medical_facility}
            onChange={(e) => handleChange('medical_facility', e.target.value)}
            disabled={isReadOnly}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Medical Findings"
            value={formData.medical_findings}
            onChange={(e) => handleChange('medical_findings', e.target.value)}
            disabled={isReadOnly}
            placeholder="Document medical findings and observations..."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Recommendations"
            value={formData.recommendations}
            onChange={(e) => handleChange('recommendations', e.target.value)}
            disabled={isReadOnly}
            placeholder="Provide recommendations for the applicant..."
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Assistive Devices */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a237e' }}>
        Assistive Devices
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Current Assistive Devices</Typography>
          <Paper sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
            <FormGroup>
              {ASSISTIVE_DEVICES.map((device) => (
                <FormControlLabel
                  key={`current-${device}`}
                  control={
                    <Checkbox
                      size="small"
                      checked={formData.assistive_devices_current.includes(device)}
                      onChange={() => handleArrayToggle('assistive_devices_current', device)}
                      disabled={isReadOnly}
                    />
                  }
                  label={<Typography variant="body2">{device}</Typography>}
                />
              ))}
            </FormGroup>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Recommended Assistive Devices</Typography>
          <Paper sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
            <FormGroup>
              {ASSISTIVE_DEVICES.map((device) => (
                <FormControlLabel
                  key={`needed-${device}`}
                  control={
                    <Checkbox
                      size="small"
                      checked={formData.assistive_devices_needed.includes(device)}
                      onChange={() => handleArrayToggle('assistive_devices_needed', device)}
                      disabled={isReadOnly}
                    />
                  }
                  label={<Typography variant="body2">{device}</Typography>}
                />
              ))}
            </FormGroup>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Assessor Notes */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a237e' }}>
        Assessor Notes
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Additional Notes"
        value={formData.assessor_notes}
        onChange={(e) => handleChange('assessor_notes', e.target.value)}
        disabled={isReadOnly}
        placeholder="Any additional notes or observations..."
        sx={{ mb: 4 }}
      />

      {/* Actions */}
      {!isReadOnly && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={() => handleSave(false)}
            disabled={saving || finalizing}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={() => handleSave(true)}
            disabled={saving || finalizing || !validateForm()}
          >
            Mark as Completed
          </Button>
          {assessment?.status === 'completed' && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={finalizing ? <CircularProgress size={20} /> : <FinalizeIcon />}
              onClick={handleFinalize}
              disabled={saving || finalizing}
            >
              Finalize & Generate PDF
            </Button>
          )}
        </Box>
      )}

      {isReadOnly && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={() => {
              window.open(`${api.getBaseUrl()}/disability-assessments/${assessment.id}/download-pdf`, '_blank');
            }}
          >
            Download PDF
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default DisabilityAssessmentForm;

