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
  'None',
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

const MOBILITY_STATUS_OPTIONS = [
  'Independent',
  'Requires minimal assistance',
  'Requires moderate assistance',
  'Requires maximum assistance',
  'Wheelchair-bound',
  'Bedridden',
  'Uses mobility aids'
];

const COMMUNICATION_ABILITY_OPTIONS = [
  'Independent',
  'Requires minimal assistance',
  'Requires moderate assistance',
  'Non-verbal',
  'Uses assistive communication devices',
  'Sign language user',
  'Requires interpreter'
];

const SELF_CARE_ABILITY_OPTIONS = [
  'Independent',
  'Requires minimal assistance',
  'Requires moderate assistance',
  'Requires maximum assistance',
  'Dependent',
  'Partial independence'
];

const LEARNING_ABILITY_OPTIONS = [
  'Independent',
  'Requires minimal support',
  'Requires moderate support',
  'Requires extensive support',
  'Special education needs',
  'Learning difficulties',
  'Intellectual disability'
];

function DisabilityAssessmentForm({ assessment, onSave, onClose }) {
  // Get localStorage key based on assessment reference number or ID
  const getStorageKey = () => {
    if (assessment?.reference_number) {
      return `disability_assessment_form_${assessment.reference_number}`;
    }
    if (assessment?.id) {
      return `disability_assessment_form_${assessment.id}`;
    }
    return null;
  };

  // Authenticated PDF download function
  const handleDownloadPDF = async () => {
    if (!assessment?.id) {
      alert('Assessment ID not found. Cannot download PDF.');
      return;
    }

    try {
      // Get auth token for the request
      async function getStoredToken() {
        try {
          const raw = localStorage.getItem('auth.token');
          if (!raw) return null;
          
          try {
            const parsed = JSON.parse(raw);
            if (typeof parsed === 'string') {
              return parsed;
            } else if (parsed && parsed.token) {
              return parsed.token;
            } else if (parsed && typeof parsed === 'object') {
              return parsed;
            }
            return parsed;
          } catch (e) {
            return raw;
          }
        } catch (_) {
          localStorage.removeItem('auth.token');
          return null;
        }
      }
      
      const token = await getStoredToken();
      
      // Ensure token is a string for Authorization header
      let tokenString = null;
      if (token) {
        if (typeof token === 'string') {
          tokenString = token;
        } else if (token && token.token) {
          tokenString = token.token;
        } else if (token && typeof token === 'object') {
          tokenString = JSON.stringify(token);
        }
      }
      
      const headers = {
        'Accept': 'application/pdf',
      };
      
      if (tokenString) {
        headers['Authorization'] = `Bearer ${tokenString}`;
      }
      
      // Use fetch directly for blob response
      const downloadUrl = `${api.getBaseUrl()}/disability-assessments/${assessment.id}/download-pdf`;
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: headers,
        redirect: 'manual'
      });
      
      // Check if response is ok
      if (!response.ok) {
        if (response.status === 401) {
          alert('Your session has expired. Please login again.');
          window.location.href = '/login';
          return;
        } else if (response.status === 404) {
          throw new Error('PDF not found. The assessment PDF may not have been generated yet.');
        } else if (response.status === 500) {
          try {
            const errorText = await response.clone().text();
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.message || errorData.error || 'Server error occurred while generating PDF.');
          } catch (parseErr) {
            throw new Error('Server error (500). The PDF may not be available. Please try again later.');
          }
        } else {
          throw new Error(`Failed to download PDF: ${response.statusText}`);
        }
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Check if response is HTML (likely a login page redirect)
      if (blob.type.includes('text/html')) {
        const text = await blob.text();
        if (text.includes('login') || text.includes('Please login')) {
          alert('Your session has expired. Please login again.');
          window.location.href = '/login';
          return;
        }
      }
      
      // Verify it's a PDF
      if (!blob.type.includes('pdf') && blob.size > 0) {
        const text = await blob.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Failed to download PDF');
        } catch (parseErr) {
          if (text.includes('login') || text.includes('Please login')) {
            alert('Your session has expired. Please login again.');
            window.location.href = '/login';
            return;
          }
          throw new Error('Received invalid response. Please try again.');
        }
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const applicantName = assessment.applicant_name || 
                           assessment.application?.firstName || 
                           'Assessment';
      const sanitizedName = applicantName.replace(/[^a-z0-9\s]/gi, '_').replace(/\s+/g, '_').toLowerCase();
      const filename = `disability_assessment_${sanitizedName}_${assessment.reference_number}.pdf`;
      
      link.setAttribute('download', filename);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert(`Failed to download PDF.\n\nError: ${err.message || 'Unknown error'}\n\nPlease try again or contact support if the problem persists.`);
    }
  };

  // Get initial form data from localStorage or defaults
  const getInitialFormData = () => {
    const defaultFormData = {
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
    };

    const storageKey = getStorageKey();
    if (storageKey) {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Merge with defaults to ensure all fields exist
          return {
            ...defaultFormData,
            ...parsedData,
            // Ensure arrays are arrays
            functional_limitations: Array.isArray(parsedData.functional_limitations) 
              ? parsedData.functional_limitations 
              : [],
            assistive_devices_current: Array.isArray(parsedData.assistive_devices_current) 
              ? parsedData.assistive_devices_current 
              : [],
            assistive_devices_needed: Array.isArray(parsedData.assistive_devices_needed) 
              ? parsedData.assistive_devices_needed 
              : []
          };
        } catch (error) {
          console.error('Error parsing saved assessment form data:', error);
        }
      }
    }
    return defaultFormData;
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [autoSaved, setAutoSaved] = useState(false);

  // Save form data to localStorage whenever it changes (with debounce)
  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey && formData) {
      // Debounce: wait 500ms after last change before saving
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(formData));
          setAutoSaved(true);
          // Hide auto-saved indicator after 2 seconds
          setTimeout(() => setAutoSaved(false), 2000);
        } catch (error) {
          console.error('Error saving assessment form data to localStorage:', error);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, assessment]);

  // Load and merge assessment data when assessment changes
  useEffect(() => {
    if (assessment) {
      // Load saved data from localStorage
      let savedData = null;
      const storageKey = getStorageKey();
      if (storageKey) {
        const savedDataStr = localStorage.getItem(storageKey);
        if (savedDataStr) {
          try {
            savedData = JSON.parse(savedDataStr);
            // Ensure arrays are arrays
            if (savedData.functional_limitations && !Array.isArray(savedData.functional_limitations)) {
              savedData.functional_limitations = [];
            }
            if (savedData.assistive_devices_current && !Array.isArray(savedData.assistive_devices_current)) {
              savedData.assistive_devices_current = [];
            }
            if (savedData.assistive_devices_needed && !Array.isArray(savedData.assistive_devices_needed)) {
              savedData.assistive_devices_needed = [];
            }
          } catch (error) {
            console.error('Error parsing saved assessment form data:', error);
            savedData = null;
          }
        }
      }
      
      // Get values from assessment (prioritize API data)
      const disabilityType = assessment.disability_type || assessment.application?.disabilityType || savedData?.disability_type || '';
      const disabilityCause = assessment.disability_cause || assessment.application?.disabilityCause || savedData?.disability_cause || '';
      const disabilityOnsetDate = assessment.disability_onset_date 
        ? new Date(assessment.disability_onset_date).toISOString().split('T')[0]
        : (assessment.application?.disabilityDate 
          ? new Date(assessment.application.disabilityDate).toISOString().split('T')[0]
          : savedData?.disability_onset_date || '');
      
      // Get last used medical information from localStorage (shared across all assessments)
      let lastUsedMedicalInfo = null;
      try {
        const lastUsedStr = localStorage.getItem('disability_assessment_last_medical_info');
        if (lastUsedStr) {
          lastUsedMedicalInfo = JSON.parse(lastUsedStr);
        }
      } catch (error) {
        console.error('Error parsing last used medical info:', error);
      }

      // Merge: Use assessment data if available, otherwise use saved data, then last used values
      setFormData({
        disability_type: assessment.disability_type || savedData?.disability_type || disabilityType,
        disability_description: assessment.disability_description || savedData?.disability_description || '',
        disability_cause: assessment.disability_cause || savedData?.disability_cause || disabilityCause,
        disability_onset_date: assessment.disability_onset_date 
          ? new Date(assessment.disability_onset_date).toISOString().split('T')[0] 
          : savedData?.disability_onset_date || disabilityOnsetDate,
        disability_severity: assessment.disability_severity || savedData?.disability_severity || '',
        functional_limitations: assessment.functional_limitations?.length > 0 
          ? assessment.functional_limitations 
          : (savedData?.functional_limitations || []),
        mobility_status: assessment.mobility_status || savedData?.mobility_status || '',
        communication_ability: assessment.communication_ability || savedData?.communication_ability || '',
        self_care_ability: assessment.self_care_ability || savedData?.self_care_ability || '',
        learning_ability: assessment.learning_ability || savedData?.learning_ability || '',
        // Pre-fill medical information: use assessment data first, then saved data, then last used values
        attending_physician: assessment.attending_physician || savedData?.attending_physician || lastUsedMedicalInfo?.attending_physician || '',
        physician_license_no: assessment.physician_license_no || savedData?.physician_license_no || lastUsedMedicalInfo?.physician_license_no || '',
        medical_facility: assessment.medical_facility || savedData?.medical_facility || lastUsedMedicalInfo?.medical_facility || '',
        medical_findings: assessment.medical_findings || savedData?.medical_findings || '',
        recommendations: assessment.recommendations || savedData?.recommendations || '',
        assistive_devices_current: assessment.assistive_devices_current?.length > 0 
          ? assessment.assistive_devices_current 
          : (savedData?.assistive_devices_current || []),
        assistive_devices_needed: assessment.assistive_devices_needed?.length > 0 
          ? assessment.assistive_devices_needed 
          : (savedData?.assistive_devices_needed || []),
        assessor_notes: assessment.assessor_notes || savedData?.assessor_notes || ''
      });
    }
  }, [assessment]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Save medical information fields to localStorage for future pre-filling
      if (['attending_physician', 'physician_license_no', 'medical_facility'].includes(field)) {
        try {
          const lastUsedMedicalInfo = {
            attending_physician: field === 'attending_physician' ? value : prev.attending_physician || '',
            physician_license_no: field === 'physician_license_no' ? value : prev.physician_license_no || '',
            medical_facility: field === 'medical_facility' ? value : prev.medical_facility || ''
          };
          // Only save if at least one field has a value
          if (lastUsedMedicalInfo.attending_physician || lastUsedMedicalInfo.physician_license_no || lastUsedMedicalInfo.medical_facility) {
            localStorage.setItem('disability_assessment_last_medical_info', JSON.stringify(lastUsedMedicalInfo));
          }
        } catch (error) {
          console.error('Error saving last used medical info:', error);
        }
      }
      
      return newData;
    });
    setError('');
    setSuccess('');
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      
      // Handle "None" option - if "None" is selected, clear all other selections
      if (value === 'None') {
        if (currentArray.includes('None')) {
          // If "None" is already selected, deselect it
          return { ...prev, [field]: [] };
        } else {
          // If "None" is selected, clear all and select only "None"
          return { ...prev, [field]: ['None'] };
        }
      } else {
        // If any other option is selected, remove "None" if it exists
        let newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
        
        // Remove "None" if any other option is selected
        newArray = newArray.filter(item => item !== 'None');
        
      return { ...prev, [field]: newArray };
      }
    });
  };

  // Clear saved form data from localStorage
  const clearSavedFormData = () => {
    const storageKey = getStorageKey();
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('Error clearing saved assessment form data:', error);
      }
    }
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
      
      // Don't clear localStorage on save - keep it for future edits
      // Only clear on finalize
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

      // Clear saved form data from localStorage after successful finalization
      clearSavedFormData();

      // Auto-download PDF - handle both response.data and direct response
      const pdfUrl = response.data?.pdf_url || response.pdf_url;
      if (pdfUrl) {
        // If pdfUrl is a full URL, try to download it with authentication
        if (pdfUrl.startsWith('http')) {
          // Use authenticated download function
          setTimeout(() => {
            handleDownloadPDF();
          }, 500);
        } else {
          // If it's a relative URL, construct full URL
          const fullUrl = pdfUrl.startsWith('/') 
            ? `${api.getBaseUrl().replace('/api', '')}${pdfUrl}`
            : `${api.getBaseUrl().replace('/api', '')}/${pdfUrl}`;
          // Use authenticated download function
          setTimeout(() => {
            handleDownloadPDF();
          }, 500);
        }
      } else {
        // Fallback: use authenticated download function
        setTimeout(() => {
          handleDownloadPDF();
        }, 500);
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
      {/* Auto-saved indicator */}
      {autoSaved && !isReadOnly && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          onClose={() => setAutoSaved(false)}
        >
          <Typography variant="body2">
            ✓ Form data auto-saved
          </Typography>
        </Alert>
      )}

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
          <FormControl fullWidth>
            <InputLabel>Mobility Status</InputLabel>
            <Select
              value={formData.mobility_status}
            label="Mobility Status"
            onChange={(e) => handleChange('mobility_status', e.target.value)}
            disabled={isReadOnly}
            >
              <MenuItem value="">Select mobility status</MenuItem>
              {MOBILITY_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Communication Ability</InputLabel>
            <Select
              value={formData.communication_ability}
            label="Communication Ability"
            onChange={(e) => handleChange('communication_ability', e.target.value)}
            disabled={isReadOnly}
            >
              <MenuItem value="">Select communication ability</MenuItem>
              {COMMUNICATION_ABILITY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Self-Care Ability</InputLabel>
            <Select
              value={formData.self_care_ability}
            label="Self-Care Ability"
            onChange={(e) => handleChange('self_care_ability', e.target.value)}
            disabled={isReadOnly}
            >
              <MenuItem value="">Select self-care ability</MenuItem>
              {SELF_CARE_ABILITY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Learning Ability</InputLabel>
            <Select
              value={formData.learning_ability}
            label="Learning Ability"
            onChange={(e) => handleChange('learning_ability', e.target.value)}
            disabled={isReadOnly}
            >
              <MenuItem value="">Select learning ability</MenuItem>
              {LEARNING_ABILITY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default DisabilityAssessmentForm;

