import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Grid,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Person as PersonIcon,
  Event as EventIcon,
  CheckCircle as CheckIcon,
  Assignment as AssignmentIcon,
  Camera as CameraIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import idClaimService from '../../services/idClaimService';
import toastService from '../../services/toastService';

const steps = ['Initiate Claim', 'Schedule Pickup', 'Claimant Info', 'Complete'];

const IDClaimModal = ({ 
  open, 
  onClose, 
  member, 
  claimType = 'new', // 'new' or 'renewal'
  onSuccess 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [claim, setClaim] = useState(null);
  
  // Schedule state
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [schedulingNotes, setSchedulingNotes] = useState('');
  const [skipScheduling, setSkipScheduling] = useState(false);
  
  // Claimant info state
  const [claimantType, setClaimantType] = useState('');
  const [claimantName, setClaimantName] = useState('');
  const [claimantRelationship, setClaimantRelationship] = useState('');
  const [claimantContact, setClaimantContact] = useState('');
  const [claimantIdType, setClaimantIdType] = useState('');
  const [claimantIdNumber, setClaimantIdNumber] = useState('');
  const [authorizationLetter, setAuthorizationLetter] = useState(null);
  const [authorizationLetterPreview, setAuthorizationLetterPreview] = useState(null);
  const [notes, setNotes] = useState('');
  
  const fileInputRef = useRef(null);

  const handleClose = () => {
    // Reset all state
    setActiveStep(0);
    setLoading(false);
    setError(null);
    setClaim(null);
    setPickupDate('');
    setPickupTime('');
    setSchedulingNotes('');
    setSkipScheduling(false);
    setClaimantType('');
    setClaimantName('');
    setClaimantRelationship('');
    setClaimantContact('');
    setClaimantIdType('');
    setClaimantIdNumber('');
    setAuthorizationLetter(null);
    setAuthorizationLetterPreview(null);
    setNotes('');
    onClose();
  };

  // Step 1: Initiate claim
  const handleInitiateClaim = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await idClaimService.initiateClaim(member.memberId || member.userID, claimType);
      
      if (response?.success) {
        setClaim(response.claim);
        toastService.success('Claim initiated successfully');
        setActiveStep(1);
      } else {
        throw new Error(response?.message || 'Failed to initiate claim');
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate claim');
      toastService.error(err.message || 'Failed to initiate claim');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Schedule pickup (optional)
  const handleSchedulePickup = async () => {
    if (skipScheduling) {
      // Skip scheduling, move to next step
      try {
        setLoading(true);
        await idClaimService.updateStatus(claim.id, 'ready_for_pickup');
        setActiveStep(2);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!pickupDate) {
      setError('Please select a pickup date');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const scheduleData = {
        scheduled_pickup_date: pickupDate,
        scheduled_pickup_time: pickupTime || null,
        scheduling_notes: schedulingNotes
      };

      const response = await idClaimService.schedulePickup(claim.id, scheduleData);
      
      if (response?.success) {
        setClaim(response.claim);
        toastService.success('Pickup scheduled successfully');
        setActiveStep(2);
      } else {
        throw new Error(response?.message || 'Failed to schedule pickup');
      }
    } catch (err) {
      setError(err.message || 'Failed to schedule pickup');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Record claimant info and complete
  const handleCompleteClaim = async () => {
    if (!claimantType) {
      setError('Please select who is claiming the card');
      return;
    }

    if (claimantType !== 'Member' && (!claimantName || !claimantRelationship)) {
      setError('Please fill in claimant name and relationship');
      return;
    }

    if (claimantType === 'Representative' && !authorizationLetter) {
      setError('Authorization letter is required for representatives');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const claimData = {
        claimant_type: claimantType,
        claimant_name: claimantType === 'Member' ? `${member.firstName} ${member.lastName}` : claimantName,
        claimant_relationship: claimantRelationship,
        claimant_contact: claimantContact,
        claimant_id_type: claimantIdType,
        claimant_id_number: claimantIdNumber,
        authorization_letter: authorizationLetter,
        notes: notes
      };

      const response = await idClaimService.completeClaim(claim.id, claimData);
      
      if (response?.success) {
        setClaim(response.claim);
        toastService.success(`Claim completed! Receipt #: ${response.receipt_number}`);
        setActiveStep(3);
        
        // Call success callback after a short delay
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(response);
          }
        }, 2000);
      } else {
        throw new Error(response?.message || 'Failed to complete claim');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete claim');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastService.error('File size must be less than 5MB');
        return;
      }
      setAuthorizationLetter(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAuthorizationLetterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setAuthorizationLetter(null);
    setAuthorizationLetterPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Initiate Claim
        return (
          <Box sx={{ p: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              You are about to {claimType === 'new' ? 'process a new ID card claim' : 'process an ID card renewal'} for this member.
            </Alert>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Member Information
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">{member?.firstName} {member?.lastName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">PWD ID</Typography>
                    <Typography variant="body1">{member?.pwd_id || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Barangay</Typography>
                    <Typography variant="body1">{member?.barangay || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Claim Type</Typography>
                    <Chip 
                      label={claimType === 'new' ? 'New Card' : 'Renewal'} 
                      color={claimType === 'new' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Click "Start Claim Process" to begin. The member will receive a notification.
            </Typography>
          </Box>
        );

      case 1: // Schedule Pickup
        return (
          <Box sx={{ p: 2 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Claim initiated successfully! Now you can schedule a pickup appointment.
            </Alert>

            <FormControlLabel
              control={
                <Radio
                  checked={skipScheduling}
                  onChange={() => setSkipScheduling(true)}
                />
              }
              label="Mark as Ready for Pickup (Walk-in)"
            />
            
            <FormControlLabel
              control={
                <Radio
                  checked={!skipScheduling}
                  onChange={() => setSkipScheduling(false)}
                />
              }
              label="Schedule a specific pickup date/time"
            />

            {!skipScheduling && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="date"
                      label="Pickup Date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Pickup Time (Optional)"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes for Member"
                      multiline
                      rows={2}
                      value={schedulingNotes}
                      onChange={(e) => setSchedulingNotes(e.target.value)}
                      placeholder="e.g., Please bring valid ID and 2x2 photo"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        );

      case 2: // Claimant Info
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Claimant Information
            </Typography>
            
            <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
              <FormLabel component="legend">Who is claiming the card?</FormLabel>
              <RadioGroup
                value={claimantType}
                onChange={(e) => setClaimantType(e.target.value)}
              >
                {idClaimService.CLAIMANT_TYPES.map((type) => (
                  <FormControlLabel
                    key={type.value}
                    value={type.value}
                    control={<Radio />}
                    label={type.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {claimantType && claimantType !== 'Member' && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Claimant's Full Name"
                      value={claimantName}
                      onChange={(e) => setClaimantName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      label="Relationship to Member"
                      value={claimantRelationship}
                      onChange={(e) => setClaimantRelationship(e.target.value)}
                      placeholder="e.g., Parent, Spouse, Sibling"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Number"
                      value={claimantContact}
                      onChange={(e) => setClaimantContact(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>ID Type Presented</InputLabel>
                      <Select
                        value={claimantIdType}
                        onChange={(e) => setClaimantIdType(e.target.value)}
                        label="ID Type Presented"
                      >
                        {idClaimService.ID_TYPES.map((idType) => (
                          <MenuItem key={idType} value={idType}>{idType}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="ID Number"
                      value={claimantIdNumber}
                      onChange={(e) => setClaimantIdNumber(e.target.value)}
                    />
                  </Grid>
                </Grid>

                {claimantType === 'Representative' && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Authorization Letter (Required for Representatives)
                    </Typography>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    
                    {!authorizationLetterPreview ? (
                      <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ mt: 1 }}
                      >
                        Upload Authorization Letter
                      </Button>
                    ) : (
                      <Paper sx={{ p: 2, mt: 1, position: 'relative' }}>
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 4, right: 4 }}
                          onClick={handleRemoveFile}
                        >
                          <DeleteIcon />
                        </IconButton>
                        {authorizationLetter?.type?.startsWith('image/') ? (
                          <img
                            src={authorizationLetterPreview}
                            alt="Authorization Letter"
                            style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AssignmentIcon />
                            <Typography>{authorizationLetter?.name}</Typography>
                          </Box>
                        )}
                      </Paper>
                    )}
                  </Box>
                )}
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this claim"
              />
            </Box>
          </Box>
        );

      case 3: // Complete
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Claim Completed Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              The PWD ID card has been successfully claimed.
            </Typography>
            
            {claim?.receipt_number && (
              <Paper sx={{ p: 2, mt: 3, backgroundColor: 'success.light' }}>
                <Typography variant="h6">
                  Receipt Number: {claim.receipt_number}
                </Typography>
              </Paper>
            )}

            <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                • A notification has been sent to the member<br />
                • Card expires on: {new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  const getStepButtonText = () => {
    switch (activeStep) {
      case 0: return 'Start Claim Process';
      case 1: return skipScheduling ? 'Mark Ready for Pickup' : 'Schedule Pickup';
      case 2: return 'Complete Claim';
      case 3: return 'Close';
      default: return 'Next';
    }
  };

  const handleStepAction = () => {
    switch (activeStep) {
      case 0: return handleInitiateClaim();
      case 1: return handleSchedulePickup();
      case 2: return handleCompleteClaim();
      case 3: return handleClose();
      default: return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {claimType === 'new' ? 'New ID Card Claim' : 'ID Card Renewal'}
        </Typography>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {activeStep > 0 && activeStep < 3 && (
          <Button 
            onClick={() => setActiveStep(prev => prev - 1)} 
            disabled={loading}
          >
            Back
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        {activeStep < 3 && (
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleStepAction}
          disabled={loading || (activeStep === 2 && !claimantType)}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processing...' : getStepButtonText()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IDClaimModal;

