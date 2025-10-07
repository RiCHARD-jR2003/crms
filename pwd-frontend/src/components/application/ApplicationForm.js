// src/components/application/ApplicationForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Container
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { api } from '../../services/api';
import applicationService from '../../services/applicationService';

const steps = [
  'Personal Information',
  'Disability Details',
  'Contact Information',
  'Documents'
];

function ApplicationForm() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewFileName, setPreviewFileName] = useState('');
  const [duplicateCheckLoading, setDuplicateCheckLoading] = useState(false);
  const [duplicateErrors, setDuplicateErrors] = useState({});

  // Reusable styling for form fields
  const getTextFieldStyles = (hasError = false) => ({
    '& .MuiInputLabel-root': {
      color: hasError ? '#E74C3C' : '#2C3E50',
      fontWeight: 500,
      fontSize: '0.9rem'
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: '#f8f9fa',
      '& fieldset': {
        borderColor: hasError ? '#E74C3C' : '#e9ecef',
      },
      '&:hover fieldset': {
        borderColor: hasError ? '#E74C3C' : '#0b87ac',
      },
      '&.Mui-focused fieldset': {
        borderColor: hasError ? '#E74C3C' : '#0b87ac',
        borderWidth: 2,
      },
    },
    '& .MuiInputBase-input': {
      color: '#2C3E50',
      py: 1.2,
      fontSize: '0.95rem'
    },
    '& .MuiFormHelperText-root': {
      color: '#E74C3C',
      fontSize: '0.8rem',
      fontWeight: 500
    }
  });

  // Reusable styling for select fields
  const getSelectStyles = (hasError = false) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      backgroundColor: '#f8f9fa',
      '& fieldset': {
        borderColor: hasError ? '#E74C3C' : '#e9ecef',
      },
      '&:hover fieldset': {
        borderColor: hasError ? '#E74C3C' : '#0b87ac',
      },
      '&.Mui-focused fieldset': {
        borderColor: hasError ? '#E74C3C' : '#0b87ac',
        borderWidth: 2,
      },
    },
    '& .MuiSelect-select': {
      color: '#2C3E50',
      py: 1.2,
      fontSize: '0.95rem'
    },
    '& .MuiPaper-root': {
      backgroundColor: '#FFFFFF',
      border: '1px solid #e9ecef',
      borderRadius: 3,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      '& .MuiMenuItem-root': {
        color: '#2C3E50',
        fontSize: '0.95rem',
        '&:hover': {
          backgroundColor: '#f8f9fa',
        },
        '&.Mui-selected': {
          backgroundColor: '#0b87ac',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0a6b8a',
          },
        },
      },
    }
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    civilStatus: '',
    nationality: '',
    disabilityType: '',
    disabilityCause: '',
    disabilityDate: '',
    address: '',
    barangay: '',
    city: '',
    province: '',
    postalCode: '',
    phoneNumber: '',
    email: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    // Document fields - will be populated dynamically
    documents: {}
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear existing error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear duplicate errors for this field
    if (duplicateErrors[field]) {
      setDuplicateErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation for date of birth
    if (field === 'dateOfBirth' && value) {
      const dateError = validateDateOfBirth(value);
      if (dateError) {
        setErrors(prev => ({ ...prev, [field]: dateError }));
      }
    }
    
    // Check for duplicates on key fields
    if (['email', 'phoneNumber'].includes(field) && value) {
      checkForDuplicates(field, value);
    }
  };

  // Function to check for duplicates
  const checkForDuplicates = async (field, value) => {
    if (!value || value.length < 3) return; // Don't check for very short values
    
    setDuplicateCheckLoading(true);
    try {
      const checkData = { [field]: value };
      
      // Add name and birth date if available for comprehensive checking
      if (formData.firstName && formData.lastName && formData.dateOfBirth) {
        checkData.firstName = formData.firstName;
        checkData.lastName = formData.lastName;
        checkData.dateOfBirth = formData.dateOfBirth;
      }
      
      const response = await api.post('/applications/check-duplicates', checkData, { auth: false });
      
      if (response.has_duplicates) {
        setDuplicateErrors(prev => ({
          ...prev,
          [field]: `This ${field} is already associated with an existing application. Please check your application status or contact support.`
        }));
      } else {
        setDuplicateErrors(prev => ({ ...prev, [field]: '' }));
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      // Don't show error to user for duplicate check failures
    } finally {
      setDuplicateCheckLoading(false);
    }
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({ 
      ...prev, 
      documents: { 
        ...prev.documents, 
        [field]: file 
      } 
    }));
  };

  // Helper function to get file type
  const getFileType = (file) => {
    if (!file) return 'unknown';
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf') return 'pdf';
    return 'document';
  };

  // Helper function to get file icon
  const getFileIcon = (file) => {
    const fileType = getFileType(file);
    switch (fileType) {
      case 'image':
        return <ImageIcon sx={{ color: '#4CAF50' }} />;
      case 'pdf':
        return <PdfIcon sx={{ color: '#F44336' }} />;
      default:
        return <DocumentIcon sx={{ color: '#2196F3' }} />;
    }
  };

  // Helper function to create preview URL
  const createPreviewUrl = (file) => {
    if (!file) return null;
    return URL.createObjectURL(file);
  };

  // Handle file preview
  const handlePreviewFile = (file, fileName) => {
    setPreviewFile(file);
    setPreviewFileName(fileName);
    setPreviewOpen(true);
  };

  // Close preview modal
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
    setPreviewFileName('');
    // Clean up object URL to prevent memory leaks
    if (previewFile) {
      URL.revokeObjectURL(createPreviewUrl(previewFile));
    }
  };

  // Fetch required documents on component mount
  useEffect(() => {
    const fetchRequiredDocuments = async () => {
      try {
        // Fetch documents from public endpoint (active documents only)
        const response = await api.get('/documents/public', { auth: false });
        if (response.success) {
          // Backend returns only active documents within effective date range for public access
          setRequiredDocuments(response.documents);
        }
      } catch (error) {
        console.error('Error fetching required documents:', error);
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchRequiredDocuments();
  }, []);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up any object URLs when component unmounts
      Object.values(formData.documents).forEach(file => {
        if (file && file.type) {
          URL.revokeObjectURL(createPreviewUrl(file));
        }
      });
    };
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Check if applicant is a minor (under 18)
  const isMinor = () => {
    const age = calculateAge(formData.dateOfBirth);
    return age !== null && age < 18;
  };

  // Validate date of birth
  const validateDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) return 'Date of Birth is required';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const currentYear = today.getFullYear();
    const birthYear = birthDate.getFullYear();
    
    // Check if date is in the future
    if (birthDate > today) {
      return 'Date of birth cannot be in the future';
    }
    
    // Check if date is within current year (not born this year)
    if (birthYear === currentYear) {
      return 'Date of birth cannot be within the current year';
    }
    
    // Check if person is too old (more than 120 years)
    const age = calculateAge(dateOfBirth);
    if (age > 120) {
      return 'Please enter a valid date of birth (maximum age is 120 years)';
    }
    
    // Check if person is too young (less than 1 year old)
    if (age < 1) {
      return 'Please enter a valid date of birth (minimum age is 1 year)';
    }
    
    return null; // No error
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }
    
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const validateCurrentStep = () => {
    const currentErrors = {};
    
    switch (activeStep) {
      case 0: // Personal Information
        if (!formData.firstName) currentErrors.firstName = 'First Name is required';
        if (!formData.lastName) currentErrors.lastName = 'Last Name is required';
        
        // Validate date of birth with comprehensive checks
        const dateOfBirthError = validateDateOfBirth(formData.dateOfBirth);
        if (dateOfBirthError) currentErrors.dateOfBirth = dateOfBirthError;
        
        if (!formData.gender) currentErrors.gender = 'Gender is required';
        break;
        
      case 1: // Disability Details
        if (!formData.disabilityType) currentErrors.disabilityType = 'Type of Disability is required';
        break;
        
      case 2: // Contact Information
        if (!formData.address) currentErrors.address = 'Complete Address is required';
        if (!formData.phoneNumber) currentErrors.phoneNumber = 'Phone Number is required';
        if (!formData.email) currentErrors.email = 'Email is required';
        break;
        
      case 3: // Documents
        // Validate required documents dynamically
        requiredDocuments.forEach(doc => {
          if (doc.is_required && !formData.documents[`doc_${doc.id}`]) {
            currentErrors[`doc_${doc.id}`] = `${doc.name} is required`;
          }
        });
        break;
    }
    
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return false;
    }
    
    // Clear errors if validation passes
    setErrors({});
    return true;
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/');
      return;
    }
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      
      // Map frontend fields to backend expected fields
      const fieldMapping = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        // Send both keys to satisfy different backend validators
        birthDate: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().slice(0,10) : '',
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().slice(0,10) : '',
        gender: formData.gender,
        civilStatus: formData.civilStatus,
        nationality: formData.nationality,
        disabilityType: formData.disabilityType,
        disabilityCause: formData.disabilityCause,
        disabilityDate: formData.disabilityDate,
        address: formData.address,
        barangay: formData.barangay,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        email: formData.email,
        // Ensure contact number is a trimmed string; send both keys used by backend
        contactNumber: (formData.phoneNumber ?? '').toString().trim(),
        phoneNumber: (formData.phoneNumber ?? '').toString().trim(),
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        emergencyRelationship: formData.emergencyRelationship,
        idType: 'PWD ID', // Default value
        idNumber: 'TEMP-' + Date.now(), // Temporary ID
        submissionDate: new Date().toISOString().split('T')[0], // Current date
      };

      // Check for required fields - only the fields that backend expects
      const requiredFields = [
        'firstName', 'lastName', 'birthDate', 'gender', 'disabilityType', 
        'address', 'email', 'contactNumber', 'idType', 'idNumber'
      ];
      const missingFields = requiredFields.filter(field => !fieldMapping[field]);
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Add all form fields to FormData
      Object.keys(fieldMapping).forEach(key => {
        if (fieldMapping[key] !== null && fieldMapping[key] !== '') {
          formDataToSend.append(key, fieldMapping[key]);
        }
      });

      // Add file uploads to FormData dynamically
      Object.keys(formData.documents).forEach(key => {
        const file = formData.documents[key];
        if (file) {
          // Extract document ID from key (doc_123 -> 123)
          const docId = key.replace('doc_', '');
          formDataToSend.append(`document_${docId}`, file);
        }
      });

      // Also map known document names to backend's expected fixed keys
      // so the API can process them even if it doesn't use dynamic document_{id} keys
      requiredDocuments.forEach((doc) => {
        const file = formData.documents[`doc_${doc.id}`];
        if (!file) return;
        const name = (doc.name || '').toString().toLowerCase();
        if (name.includes('medical')) {
          formDataToSend.append('medicalCertificate', file);
        } else if (name.includes('clinical') || name.includes('abstract') || name.includes('assessment')) {
          formDataToSend.append('clinicalAbstract', file);
        } else if (name.includes('voter')) {
          formDataToSend.append('voterCertificate', file);
        } else if ((name.includes('id') && name.includes('picture')) || name.includes('1"x1"') || name.includes('1\"x1\"')) {
          // Backend accepts idPicture_0 / idPicture_1; map at least one
          if (!formDataToSend.has('idPicture_0')) formDataToSend.append('idPicture_0', file);
        } else if (name.includes('birth')) {
          formDataToSend.append('birthCertificate', file);
        } else if (name.includes('whole') && name.includes('body')) {
          formDataToSend.append('wholeBodyPicture', file);
        } else if (name.includes('affidavit')) {
          formDataToSend.append('affidavit', file);
        } else if (name.includes('barangay') && (name.includes('certificate') || name.includes('residency'))) {
          formDataToSend.append('barangayCertificate', file);
        }
      });

      // Debug: Log what we're sending
      console.log('Sending FormData with fields:', Object.fromEntries(formDataToSend.entries()));

      const response = await applicationService.create(formDataToSend);

      if (response) {
        alert('Application submitted successfully!');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          dateOfBirth: '',
          gender: '',
          civilStatus: '',
          nationality: '',
          disabilityType: '',
          disabilityCause: '',
          disabilityDate: '',
          address: '',
          barangay: '',
          city: '',
          province: '',
          postalCode: '',
          phoneNumber: '',
          email: '',
          emergencyContact: '',
          emergencyPhone: '',
          emergencyRelationship: '',
          // Document fields
          medicalCertificate: null,
          clinicalAbstract: null,
          voterCertificate: null,
          idPictures: null,
          birthCertificate: null,
          wholeBodyPicture: null,
          affidavit: null,
          barangayCertificate: null
        });
        setActiveStep(0);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      const data = error.data || {};
      console.log('Error data:', data);
      
      if (data.duplicates) {
        const d = data.duplicates;
        const lines = [];
        if (d.email) {
          lines.push(`Email already used by ${d.email.existing_application?.name || d.email.existing_user?.email || ''}`);
        }
        if (d.phoneNumber) {
          lines.push(`Phone number already used by ${d.phoneNumber.existing_application?.name || ''}`);
        }
        if (d.name_birth) {
          lines.push(`Same name and date of birth as ${d.name_birth.existing_application?.name || ''}`);
        }
        if (d.idNumber) {
          lines.push(`ID number already used by ${d.idNumber.existing_application?.name || ''}`);
        }
        alert(`Duplicate application detected:\n${lines.join('\n') || 'See network response for details.'}`);
      } else if (data.messages) {
        const errorMessages = Object.values(data.messages).flat().join('\n');
        alert(`Validation errors:\n${errorMessages}`);
      } else if (data.errors) {
        const errorMessages = Object.values(data.errors).flat().join('\n');
        alert(`Validation errors:\n${errorMessages}`);
      } else if (data.message) {
        alert(`Error: ${data.message}`);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Error submitting application. Please try again.');
      }
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              color: '#2C3E50',
              fontWeight: 700,
              fontSize: '1.5rem'
            }}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={getTextFieldStyles(!!errors.firstName)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={getTextFieldStyles(!!errors.lastName)}
                />
              </Grid>
                             <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Middle Name"
                   value={formData.middleName}
                   onChange={(e) => handleInputChange('middleName', e.target.value)}
                   InputLabelProps={{
                     shrink: true,
                   }}
                   sx={getTextFieldStyles()}
                 />
               </Grid>
                             <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   type="date"
                   label="Date of Birth"
                   value={formData.dateOfBirth}
                   onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                   InputLabelProps={{ shrink: true }}
                   error={!!errors.dateOfBirth}
                   helperText={errors.dateOfBirth}
                   required
                   inputProps={{
                     max: new Date(new Date().getFullYear() - 1, 11, 31).toISOString().split('T')[0], // Last day of previous year
                     min: new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split('T')[0] // First day 120 years ago
                   }}
                   sx={getTextFieldStyles(!!errors.dateOfBirth)}
                 />
               </Grid>
                             <Grid item xs={12} sm={6}>
                 <FormControl fullWidth required error={!!errors.gender}>
                   <InputLabel 
                     shrink={true}
                     sx={{ 
                       color: errors.gender ? '#E74C3C' : '#2C3E50',
                       fontWeight: 500,
                       fontSize: '0.95rem',
                       backgroundColor: 'white',
                       px: 1,
                       transform: 'translate(14px, -9px) scale(0.75)',
                       '&.Mui-focused': {
                         color: errors.gender ? '#E74C3C' : '#0b87ac'
                       }
                     }}
                   >
                     Gender
                   </InputLabel>
                   <Select
                     value={formData.gender}
                     onChange={(e) => handleInputChange('gender', e.target.value)}
                     sx={getSelectStyles(!!errors.gender)}
                     MenuProps={{
                       PaperProps: {
                         sx: {
                           backgroundColor: '#FFFFFF',
                           border: '1px solid #e9ecef',
                           borderRadius: 3,
                           boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                           '& .MuiMenuItem-root': {
                             color: '#2C3E50',
                             fontSize: '0.95rem',
                             '&:hover': {
                               backgroundColor: '#f8f9fa',
                             },
                             '&.Mui-selected': {
                               backgroundColor: '#0b87ac',
                               color: '#FFFFFF',
                               '&:hover': {
                                 backgroundColor: '#0a6b8a',
                               },
                             },
                           },
                         }
                       }
                     }}
                   >
                     <MenuItem value="male">Male</MenuItem>
                     <MenuItem value="female">Female</MenuItem>
                   </Select>
                   {errors.gender && (
                     <FormHelperText sx={{ color: '#E74C3C', fontSize: '0.8rem', fontWeight: 500 }}>
                       {errors.gender}
                     </FormHelperText>
                   )}
                 </FormControl>
               </Grid>
                                                           <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel 
                      shrink={true}
                      sx={{ 
                        color: '#2C3E50',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        backgroundColor: 'white',
                        px: 1,
                        transform: 'translate(14px, -9px) scale(0.75)',
                        '&.Mui-focused': {
                          color: '#0b87ac'
                        }
                      }}
                    >
                      Civil Status
                    </InputLabel>
                    <Select
                      value={formData.civilStatus}
                      onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                      sx={getSelectStyles()}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #e9ecef',
                            borderRadius: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '& .MuiMenuItem-root': {
                              color: '#2C3E50',
                              fontSize: '0.95rem',
                              '&:hover': {
                                backgroundColor: '#f8f9fa',
                              },
                              '&.Mui-selected': {
                                backgroundColor: '#0b87ac',
                                color: '#FFFFFF',
                                '&:hover': {
                                  backgroundColor: '#0a6b8a',
                                },
                              },
                            },
                          }
                        }
                      }}
                    >
                      <MenuItem value="single">Single</MenuItem>
                      <MenuItem value="married">Married</MenuItem>
                      <MenuItem value="widowed">Widowed</MenuItem>
                      <MenuItem value="divorced">Divorced</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                              <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Nationality"
                   value={formData.nationality}
                   onChange={(e) => handleInputChange('nationality', e.target.value)}
                   InputLabelProps={{
                     shrink: true,
                   }}
                   sx={getTextFieldStyles()}
                 />
                </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              color: '#2C3E50',
              fontWeight: 700,
              fontSize: '1.5rem'
            }}>
              Disability Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!errors.disabilityType}>
                  <InputLabel 
                    shrink={true}
                    sx={{ 
                      color: errors.disabilityType ? '#E74C3C' : '#2C3E50',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      backgroundColor: 'white',
                      px: 1,
                      transform: 'translate(14px, -9px) scale(0.75)',
                      '&.Mui-focused': {
                        color: errors.disabilityType ? '#E74C3C' : '#0b87ac'
                      }
                    }}
                  >
                    Type of Disability
                  </InputLabel>
                  <Select
                    value={formData.disabilityType}
                    onChange={(e) => handleInputChange('disabilityType', e.target.value)}
                    sx={getSelectStyles(!!errors.disabilityType)}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #e9ecef',
                          borderRadius: 3,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          '& .MuiMenuItem-root': {
                            color: '#2C3E50',
                            fontSize: '0.95rem',
                            '&:hover': {
                              backgroundColor: '#f8f9fa',
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#0b87ac',
                              color: '#FFFFFF',
                              '&:hover': {
                                backgroundColor: '#0a6b8a',
                              },
                            },
                          },
                        }
                      }
                    }}
                  >
                    <MenuItem value="Visual Impairment">Visual Impairment</MenuItem>
                    <MenuItem value="Hearing Impairment">Hearing Impairment</MenuItem>
                    <MenuItem value="Speech and Language Impairment">Speech and Language Impairment</MenuItem>
                    <MenuItem value="Intellectual Disability">Intellectual Disability</MenuItem>
                    <MenuItem value="Mental Health Condition">Mental Health Condition</MenuItem>
                    <MenuItem value="Learning Disability">Learning Disability</MenuItem>
                    <MenuItem value="Psychosocial Disability">Psychosocial Disability</MenuItem>
                    <MenuItem value="Autism Spectrum Disorder">Autism Spectrum Disorder</MenuItem>
                    <MenuItem value="ADHD">ADHD</MenuItem>
                    <MenuItem value="Physical Disability">Physical Disability</MenuItem>
                    <MenuItem value="Orthopedic/Physical Disability">Orthopedic/Physical Disability</MenuItem>
                    <MenuItem value="Chronic Illness">Chronic Illness</MenuItem>
                    <MenuItem value="Multiple Disabilities">Multiple Disabilities</MenuItem>
                  </Select>
                  {errors.disabilityType && (
                    <FormHelperText sx={{ color: '#E74C3C', fontSize: '0.8rem', fontWeight: 500 }}>
                      {errors.disabilityType}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
                             <Grid item xs={12}>
                 <TextField
                   fullWidth
                   label="Cause of Disability"
                   value={formData.disabilityCause}
                   onChange={(e) => handleInputChange('disabilityCause', e.target.value)}
                   multiline
                   rows={3}
                   InputLabelProps={{
                     shrink: true,
                   }}
                   sx={getTextFieldStyles()}
                 />
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   type="date"
                   label="Date of Disability Onset"
                   value={formData.disabilityDate}
                   onChange={(e) => handleInputChange('disabilityDate', e.target.value)}
                   InputLabelProps={{ shrink: true }}
                   sx={getTextFieldStyles()}
                 />
               </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              color: '#2C3E50',
              fontWeight: 700,
              fontSize: '1.5rem'
            }}>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Complete Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  multiline
                  rows={3}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={getTextFieldStyles(!!errors.address)}
                />
              </Grid>
                             <Grid item xs={12} sm={6}>
                 <FormControl fullWidth>
                   <InputLabel 
                     shrink={true}
                     sx={{ 
                       color: '#2C3E50',
                       fontWeight: 500,
                       fontSize: '0.95rem',
                       backgroundColor: 'white',
                       px: 1,
                       transform: 'translate(14px, -9px) scale(0.75)',
                       '&.Mui-focused': {
                         color: '#0b87ac'
                       }
                     }}
                   >
                     Barangay
                   </InputLabel>
                   <Select
                     value={formData.barangay}
                     onChange={(e) => handleInputChange('barangay', e.target.value)}
                     sx={getSelectStyles()}
                     MenuProps={{
                       PaperProps: {
                         sx: {
                           backgroundColor: '#FFFFFF',
                           border: '1px solid #e9ecef',
                           borderRadius: 3,
                           boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                           '& .MuiMenuItem-root': {
                             color: '#2C3E50',
                             fontSize: '0.95rem',
                             '&:hover': {
                               backgroundColor: '#f8f9fa',
                             },
                             '&.Mui-selected': {
                               backgroundColor: '#0b87ac',
                               color: '#FFFFFF',
                               '&:hover': {
                                 backgroundColor: '#0a6b8a',
                               },
                             },
                           },
                         }
                       }
                     }}
                   >
                     <MenuItem value="Baclaran">Baclaran</MenuItem>
                     <MenuItem value="Banay-Banay">Banay-Banay</MenuItem>
                     <MenuItem value="Banlic">Banlic</MenuItem>
                     <MenuItem value="Bigaa">Bigaa</MenuItem>
                     <MenuItem value="Butong">Butong</MenuItem>
                     <MenuItem value="Casile">Casile</MenuItem>
                     <MenuItem value="Diezmo">Diezmo</MenuItem>
                     <MenuItem value="Gulod">Gulod</MenuItem>
                     <MenuItem value="Mamatid">Mamatid</MenuItem>
                     <MenuItem value="Marinig">Marinig</MenuItem>
                     <MenuItem value="Niugan">Niugan</MenuItem>
                     <MenuItem value="Pittland">Pittland</MenuItem>
                     <MenuItem value="Pulo">Pulo</MenuItem>
                     <MenuItem value="Sala">Sala</MenuItem>
                     <MenuItem value="San Isidro">San Isidro</MenuItem>
                     <MenuItem value="Barangay I Poblacion">Barangay I Poblacion</MenuItem>
                     <MenuItem value="Barangay II Poblacion">Barangay II Poblacion</MenuItem>
                     <MenuItem value="Barangay III Poblacion">Barangay III Poblacion</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="City"
                   value={formData.city}
                   onChange={(e) => handleInputChange('city', e.target.value)}
                   InputLabelProps={{
                     shrink: true,
                   }}
                   sx={getTextFieldStyles()}
                 />
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Province"
                   value={formData.province}
                   onChange={(e) => handleInputChange('province', e.target.value)}
                   InputLabelProps={{
                     shrink: true,
                   }}
                   sx={getTextFieldStyles()}
                 />
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Postal Code"
                   value={formData.postalCode}
                   onChange={(e) => handleInputChange('postalCode', e.target.value)}
                   InputLabelProps={{
                     shrink: true,
                   }}
                   sx={getTextFieldStyles()}
                 />
               </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  error={!!errors.phoneNumber || !!duplicateErrors.phoneNumber}
                  helperText={errors.phoneNumber || duplicateErrors.phoneNumber}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={getTextFieldStyles(!!errors.phoneNumber || !!duplicateErrors.phoneNumber)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!errors.email || !!duplicateErrors.email}
                  helperText={errors.email || duplicateErrors.email}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={getTextFieldStyles(!!errors.email || !!duplicateErrors.email)}
                />
              </Grid>
                             <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Emergency Contact Name"
                   value={formData.emergencyContact}
                   onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                   InputLabelProps={{
                     shrink: true,
                   }}
                   sx={getTextFieldStyles()}
                 />
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Emergency Contact Phone"
                   value={formData.emergencyPhone}
                   onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                   InputLabelProps={{
                     shrink: true,
                   }}
                   sx={getTextFieldStyles()}
                 />
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Relationship to Emergency Contact"
                   value={formData.emergencyRelationship}
                   onChange={(e) => handleInputChange('emergencyRelationship', e.target.value)}
                   InputLabelProps={{
                     shrink: true,
                   }}
                   sx={getTextFieldStyles()}
                 />
               </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              color: '#2C3E50',
              fontWeight: 700,
              fontSize: '1.5rem'
            }}>
              Required Documents
            </Typography>
            
            {/* Document Requirements Checklist */}
            <Paper sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: '#FFF5F5', 
              border: '1px solid #FFE0E0',
              borderRadius: 3
            }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                color: '#D32F2F',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}>
                📋 Document Requirements Checklist
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, color: '#2C3E50', fontWeight: 600 }}>
                  ✓ <strong>Medical Certificate</strong> stating the patient's <strong>Type of Disability</strong> & <strong>Doctor's qualification</strong> for <strong>PWD ID</strong> (Latest date and original copy)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: '#2C3E50', fontWeight: 600 }}>
                  ✓ <strong>Clinical Abstract/Protocol/ Behavioral Assessment/ Audiometry Test</strong> (photocopy)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: '#2C3E50', fontWeight: 600 }}>
                  ✓ <strong>Voter Certificate</strong> (Photocopy)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: '#2C3E50', fontWeight: 600 }}>
                  ✓ <strong>2pcs 1"x1" ID picture</strong>, white background (latest photo)
                </Typography>
                {isMinor() && (
                  <Typography variant="body2" sx={{ mb: 1, color: '#2C3E50', fontWeight: 600 }}>
                    ✓ <strong>Birth Certificate if minor</strong> (Photocopy) *
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mb: 1, color: '#2C3E50', fontWeight: 600 }}>
                  ✓ <strong>Whole body picture Only for Apparent Disability</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: '#2C3E50', fontWeight: 600 }}>
                  ✓ <strong>Affidavit of Guardianship/Loss</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, color: '#2C3E50', fontWeight: 600 }}>
                  ✓ <strong>Barangay Certificate of Residency</strong>
                </Typography>
              </Box>
            </Paper>

            <Alert severity="info" sx={{ 
              mb: 3, 
              bgcolor: '#E3F2FD', 
              color: '#1565C0',
              borderRadius: 3,
              border: '1px solid #BBDEFB'
            }}>
              Please upload the following documents in PDF, JPG, or PNG format (max 2MB each)
            </Alert>
            
            {documentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading required documents...
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {requiredDocuments.map((document) => (
                  <Grid item xs={12} key={document.id}>
                    <Box sx={{ 
                      p: 2, 
                      border: '1px solid #E0E0E0', 
                      borderRadius: 3, 
                      backgroundColor: '#FAFAFA' 
                    }}>
                      <Typography variant="subtitle1" sx={{ 
                        mb: 2, 
                        color: '#34495E', 
                        fontWeight: 600, 
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        {document.name}
                        {document.is_required && (
                          <Chip 
                            label="Required" 
                            size="small" 
                            color="error" 
                            sx={{ fontSize: '0.75rem' }}
                          />
                        )}
                      </Typography>
                      
                      {document.description && (
                        <Typography variant="body2" sx={{ 
                          mb: 2, 
                          color: '#666', 
                          fontStyle: 'italic' 
                        }}>
                          {document.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          Allowed file types: {document.file_types?.join(', ') || 'PDF, JPG, PNG'}
                        </Typography>
                        <br />
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          Maximum file size: {document.max_file_size} KB
                        </Typography>
                      </Box>
                      
                      <input
                        type="file"
                        accept={document.file_types?.map(type => `.${type}`).join(',') || '.pdf,image/*'}
                        onChange={(e) => handleFileChange(`doc_${document.id}`, e.target.files[0])}
                        required={document.is_required}
                        style={{ 
                          padding: '12px', 
                          border: '2px dashed #BDC3C7', 
                          borderRadius: '8px', 
                          width: '100%', 
                          backgroundColor: '#F8F9FA', 
                          color: '#2C3E50', 
                          fontSize: '0.95rem' 
                        }}
                      />
                      
                      {formData.documents[`doc_${document.id}`] && (
                        <Box sx={{ mt: 2 }}>
                          <Card sx={{ 
                            border: '1px solid #E0E0E0', 
                            borderRadius: 3,
                            backgroundColor: '#FAFAFA',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                mb: 1
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getFileIcon(formData.documents[`doc_${document.id}`])}
                                  <Typography variant="body2" sx={{ 
                                    color: '#4CAF50',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                  }}>
                                    ✓ {formData.documents[`doc_${document.id}`].name}
                                  </Typography>
                                </Box>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<VisibilityIcon />}
                                  onClick={() => handlePreviewFile(
                                    formData.documents[`doc_${document.id}`], 
                                    formData.documents[`doc_${document.id}`].name
                                  )}
                                  sx={{
                                    borderColor: '#0b87ac',
                                    color: '#0b87ac',
                                    fontSize: '0.75rem',
                                    py: 0.5,
                                    px: 1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    '&:hover': {
                                      borderColor: '#0a6b8a',
                                      backgroundColor: 'rgba(11, 135, 172, 0.1)'
                                    }
                                  }}
                                >
                                  Preview
                                </Button>
                              </Box>
                              <Typography variant="caption" sx={{ 
                                color: '#666',
                                fontSize: '0.8rem'
                              }}>
                                Size: {(formData.documents[`doc_${document.id}`].size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
                
                {requiredDocuments.length === 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ textAlign: 'center' }}>
                      No required documents are currently configured. Please contact the administrator.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      py: 4,
      px: 2
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4,
          color: '#2C3E50'
        }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700,
            mb: 2,
            color: '#2C3E50'
          }}>
            PWD Application Form
          </Typography>
          <Typography variant="h6" sx={{ 
            fontWeight: 500,
            color: '#0b87ac',
            mb: 1
          }}>
            Cabuyao City
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#7F8C8D',
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6
          }}>
            Complete all required information to apply for PWD identification
          </Typography>
        </Box>

        {/* Main Card */}
        <Card
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid #E0E0E0',
            mb: 3
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Stepper */}
            <Box sx={{ mb: 4 }}>
              <Stepper activeStep={activeStep} sx={{ 
                '& .MuiStepLabel-root .Mui-completed': {
                  color: '#0b87ac'
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: '#0b87ac'
                },
                '& .MuiStepLabel-label': {
                  color: '#2C3E50',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                },
                '& .MuiStepIcon-root.Mui-completed': {
                  color: '#0b87ac'
                },
                '& .MuiStepIcon-root.Mui-active': {
                  color: '#0b87ac'
                },
                '& .MuiStepIcon-root': {
                  color: '#BDC3C7'
                }
              }}>
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Step Content */}
            <Box sx={{ mb: 4 }}>
              {renderStepContent(activeStep)}
            </Box>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          gap: 2
        }}>
          <Button
            onClick={handleBack}
            variant="outlined"
            sx={{
              color: '#0b87ac',
              borderColor: '#0b87ac',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '16px',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#0a6b8a',
                backgroundColor: 'rgba(11, 135, 172, 0.1)',
              },
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{
              backgroundColor: '#0b87ac',
              color: 'white',
              py: 1.5,
              px: 4,
              borderRadius: 3,
              fontWeight: 600,
              fontSize: '16px',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(11, 135, 172, 0.3)',
              '&:hover': {
                backgroundColor: '#0a6b8a',
                boxShadow: '0 6px 16px rgba(11, 135, 172, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {activeStep === steps.length - 1 ? 'Submit Application' : 'Next'}
          </Button>
        </Box>
      </Container>

      {/* File Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#2C3E50',
          color: 'white',
          fontWeight: 'bold'
        }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
            File Preview: {previewFileName}
          </Typography>
          <IconButton
            onClick={handleClosePreview}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#F5F5F5' }}>
          {previewFile && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px',
              p: 2
            }}>
              {getFileType(previewFile) === 'image' ? (
                <img
                  src={createPreviewUrl(previewFile)}
                  alt={previewFileName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              ) : getFileType(previewFile) === 'pdf' ? (
                <Box sx={{ 
                  width: '100%',
                  height: '70vh',
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}>
                  <iframe
                    src={createPreviewUrl(previewFile)}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    title={previewFileName}
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  textAlign: 'center',
                  p: 4,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <DocumentIcon sx={{ fontSize: 80, color: '#2196F3', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, color: '#2C3E50' }}>
                    Document File
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                    {previewFileName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    Preview is not available for this file type.
                    <br />
                    Please download the file to view its contents.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F8F9FA' }}>
          <Button
            onClick={() => {
              if (previewFile) {
                const url = createPreviewUrl(previewFile);
                const a = document.createElement('a');
                a.href = url;
                a.download = previewFileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }
            }}
            variant="outlined"
            sx={{
              color: '#0b87ac',
              borderColor: '#0b87ac',
              borderRadius: 3,
              px: 3,
              py: 1,
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#0a6b8a',
                backgroundColor: 'rgba(11, 135, 172, 0.1)',
              },
            }}
          >
            Download
          </Button>
          <Button
            onClick={handleClosePreview}
            variant="contained"
            sx={{
              backgroundColor: '#0b87ac',
              color: 'white',
              py: 1,
              px: 3,
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(11, 135, 172, 0.3)',
              '&:hover': {
                backgroundColor: '#0a6b8a',
                boxShadow: '0 6px 16px rgba(11, 135, 172, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ApplicationForm;