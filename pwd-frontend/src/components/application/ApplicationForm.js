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
  CircularProgress
} from '@mui/material';
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
        if (!formData.dateOfBirth) currentErrors.dateOfBirth = 'Date of Birth is required';
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
        birthDate: formData.dateOfBirth,
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
        contactNumber: formData.phoneNumber,
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
      
      if (data.messages) {
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
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              color: '#2C3E50',
              fontWeight: 'bold',
              fontSize: '1.25rem'
            }}>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: errors.firstName ? '#E74C3C' : '#34495E',
                      fontWeight: 500,
                      fontSize: '0.95rem'
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: errors.firstName ? '#E74C3C' : '#BDC3C7',
                        borderWidth: errors.firstName ? 2 : 2
                      },
                      '&:hover fieldset': {
                        borderColor: errors.firstName ? '#E74C3C' : '#3498DB'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: errors.firstName ? '#E74C3C' : '#3498DB',
                        borderWidth: 2
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#2C3E50',
                      fontSize: '1rem',
                      fontWeight: 500
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#E74C3C',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name *"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: errors.lastName ? '#E74C3C' : '#34495E',
                      fontWeight: 500,
                      fontSize: '0.95rem'
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: errors.lastName ? '#E74C3C' : '#BDC3C7',
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: errors.lastName ? '#E74C3C' : '#3498DB'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: errors.lastName ? '#E74C3C' : '#3498DB',
                        borderWidth: 2
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#2C3E50',
                      fontSize: '1rem',
                      fontWeight: 500
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#E74C3C',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>
                             <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Middle Name"
                   value={formData.middleName}
                   onChange={(e) => handleInputChange('middleName', e.target.value)}
                   sx={{
                     '& .MuiInputLabel-root': {
                       color: '#34495E',
                       fontWeight: 500,
                       fontSize: '0.95rem'
                     },
                     '& .MuiOutlinedInput-root': {
                       '& fieldset': {
                         borderColor: '#BDC3C7',
                         borderWidth: 2
                       },
                       '&:hover fieldset': {
                         borderColor: '#3498DB'
                       },
                       '&.Mui-focused fieldset': {
                         borderColor: '#3498DB',
                         borderWidth: 2
                       }
                     },
                     '& .MuiInputBase-input': {
                       color: '#2C3E50',
                       fontSize: '1rem',
                       fontWeight: 500
                     }
                   }}
                 />
               </Grid>
                             <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   type="date"
                   label="Date of Birth *"
                   value={formData.dateOfBirth}
                   onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                   InputLabelProps={{ shrink: true }}
                   error={!!errors.dateOfBirth}
                   helperText={errors.dateOfBirth}
                   required
                   sx={{
                     '& .MuiInputLabel-root': {
                       color: errors.dateOfBirth ? '#E74C3C' : '#34495E',
                       fontWeight: 500,
                       fontSize: '0.95rem'
                     },
                     '& .MuiOutlinedInput-root': {
                       '& fieldset': {
                         borderColor: errors.dateOfBirth ? '#E74C3C' : '#BDC3C7',
                         borderWidth: 2
                       },
                       '&:hover fieldset': {
                         borderColor: errors.dateOfBirth ? '#E74C3C' : '#3498DB'
                       },
                       '&.Mui-focused fieldset': {
                         borderColor: errors.dateOfBirth ? '#E74C3C' : '#3498DB',
                         borderWidth: 2
                       }
                     },
                     '& .MuiInputBase-input': {
                       color: '#2C3E50',
                       fontSize: '1rem',
                       fontWeight: 500
                     },
                     '& .MuiFormHelperText-root': {
                       color: '#E74C3C',
                       fontSize: '0.8rem',
                       fontWeight: 500
                     }
                   }}
                 />
               </Grid>
                             <Grid item xs={12} sm={6}>
                 <FormControl fullWidth required error={!!errors.gender}>
                   <InputLabel sx={{ 
                     color: errors.gender ? '#E74C3C' : '#34495E',
                     fontWeight: 500,
                     fontSize: '0.95rem'
                   }}>
                     Gender *
                   </InputLabel>
                   <Select
                     value={formData.gender}
                     onChange={(e) => handleInputChange('gender', e.target.value)}
                     sx={{
                       '& .MuiOutlinedInput-root': {
                         '& fieldset': {
                           borderColor: errors.gender ? '#E74C3C' : '#BDC3C7',
                           borderWidth: 2
                         },
                         '&:hover fieldset': {
                           borderColor: errors.gender ? '#E74C3C' : '#3498DB'
                         },
                         '&.Mui-focused fieldset': {
                           borderColor: errors.gender ? '#E74C3C' : '#3498DB',
                           borderWidth: 2
                         }
                       },
                       '& .MuiSelect-select': {
                         color: '#2C3E50',
                         fontSize: '1rem',
                         fontWeight: 500
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
                    <InputLabel sx={{ 
                      color: '#34495E',
                      fontWeight: 500,
                      fontSize: '0.95rem'
                    }}>
                      Civil Status
                    </InputLabel>
                    <Select
                      value={formData.civilStatus}
                      onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#BDC3C7',
                            borderWidth: 2
                          },
                          '&:hover fieldset': {
                            borderColor: '#3498DB'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#3498DB',
                            borderWidth: 2
                          }
                        },
                        '& .MuiSelect-select': {
                          color: '#2C3E50',
                          fontSize: '1rem',
                          fontWeight: 500
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
                    sx={{
                      '& .MuiInputLabel-root': {
                        color: '#34495E',
                        fontWeight: 500,
                        fontSize: '0.95rem'
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#BDC3C7',
                          borderWidth: 2
                        },
                        '&:hover fieldset': {
                          borderColor: '#3498DB'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3498DB',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputBase-input': {
                        color: '#2C3E50',
                        fontSize: '1rem',
                        fontWeight: 500
                      }
                    }}
                  />
                </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              color: '#2C3E50',
              fontWeight: 'bold',
              fontSize: '1.25rem'
            }}>
              Disability Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!errors.disabilityType}>
                  <InputLabel sx={{ 
                    color: errors.disabilityType ? '#E74C3C' : '#34495E',
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  }}>
                    Type of Disability *
                  </InputLabel>
                  <Select
                    value={formData.disabilityType}
                    onChange={(e) => handleInputChange('disabilityType', e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: errors.disabilityType ? '#E74C3C' : '#BDC3C7',
                          borderWidth: 2
                        },
                        '&:hover fieldset': {
                          borderColor: errors.disabilityType ? '#E74C3C' : '#3498DB'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: errors.disabilityType ? '#E74C3C' : '#3498DB',
                          borderWidth: 2
                        }
                      },
                      '& .MuiSelect-select': {
                        color: '#2C3E50',
                        fontSize: '1rem',
                        fontWeight: 500
                      }
                    }}
                  >
                    <MenuItem value="physical">Physical Disability</MenuItem>
                    <MenuItem value="visual">Visual Impairment</MenuItem>
                    <MenuItem value="hearing">Hearing Impairment</MenuItem>
                    <MenuItem value="intellectual">Intellectual Disability</MenuItem>
                    <MenuItem value="mental">Mental Health Condition</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
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
                   sx={{
                     '& .MuiInputLabel-root': {
                       color: '#34495E',
                       fontWeight: 500,
                       fontSize: '0.95rem'
                     },
                     '& .MuiOutlinedInput-root': {
                       '& fieldset': {
                         borderColor: '#BDC3C7',
                         borderWidth: 2
                       },
                       '&:hover fieldset': {
                         borderColor: '#3498DB'
                       },
                       '&.Mui-focused fieldset': {
                         borderColor: '#3498DB',
                         borderWidth: 2
                       }
                     },
                     '& .MuiInputBase-input': {
                       color: '#2C3E50',
                       fontSize: '1rem',
                       fontWeight: 500
                     }
                   }}
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
                   sx={{
                     '& .MuiInputLabel-root': {
                       color: '#34495E',
                       fontWeight: 500,
                       fontSize: '0.95rem'
                     },
                     '& .MuiOutlinedInput-root': {
                       '& fieldset': {
                         borderColor: '#BDC3C7',
                         borderWidth: 2
                       },
                       '&:hover fieldset': {
                         borderColor: '#3498DB'
                       },
                       '&.Mui-focused fieldset': {
                         borderColor: '#3498DB',
                         borderWidth: 2
                       }
                     },
                     '& .MuiInputBase-input': {
                       color: '#2C3E50',
                       fontSize: '1rem',
                       fontWeight: 500
                     }
                   }}
                 />
               </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              color: '#2C3E50',
              fontWeight: 'bold',
              fontSize: '1.25rem'
            }}>
              Contact Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Complete Address *"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  multiline
                  rows={3}
                  error={!!errors.address}
                  helperText={errors.address}
                  required
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: errors.address ? '#E74C3C' : '#34495E',
                      fontWeight: 500,
                      fontSize: '0.95rem'
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: errors.address ? '#E74C3C' : '#BDC3C7',
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: errors.address ? '#E74C3C' : '#3498DB'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: errors.address ? '#E74C3C' : '#3498DB',
                        borderWidth: 2
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#2C3E50',
                      fontSize: '1rem',
                      fontWeight: 500
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#E74C3C',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>
                             <Grid item xs={12} sm={6}>
                 <FormControl fullWidth>
                   <InputLabel sx={{ 
                     color: '#34495E',
                     fontWeight: 500,
                     fontSize: '0.95rem'
                   }}>
                     Barangay
                   </InputLabel>
                   <Select
                     value={formData.barangay}
                     onChange={(e) => handleInputChange('barangay', e.target.value)}
                     sx={{
                       '& .MuiOutlinedInput-root': {
                         '& fieldset': {
                           borderColor: '#BDC3C7',
                           borderWidth: 2
                         },
                         '&:hover fieldset': {
                           borderColor: '#3498DB'
                         },
                         '&.Mui-focused fieldset': {
                           borderColor: '#3498DB',
                           borderWidth: 2
                         }
                       },
                       '& .MuiSelect-select': {
                         color: '#2C3E50',
                         fontSize: '1rem',
                         fontWeight: 500
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
                   sx={{
                     '& .MuiInputLabel-root': {
                       color: '#34495E',
                       fontWeight: 500,
                       fontSize: '0.95rem'
                     },
                     '& .MuiOutlinedInput-root': {
                       '& fieldset': {
                         borderColor: '#BDC3C7',
                         borderWidth: 2
                       },
                       '&:hover fieldset': {
                         borderColor: '#3498DB'
                       },
                       '&.Mui-focused fieldset': {
                         borderColor: '#3498DB',
                         borderWidth: 2
                       }
                     },
                     '& .MuiInputBase-input': {
                       color: '#2C3E50',
                       fontSize: '1rem',
                       fontWeight: 500
                     }
                   }}
                 />
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Province"
                   value={formData.province}
                   onChange={(e) => handleInputChange('province', e.target.value)}
                   sx={{
                     '& .MuiInputLabel-root': {
                       color: '#34495E',
                       fontWeight: 500,
                       fontSize: '0.95rem'
                     },
                     '& .MuiOutlinedInput-root': {
                       '& fieldset': {
                         borderColor: '#BDC3C7',
                         borderWidth: 2
                       },
                       '&:hover fieldset': {
                         borderColor: '#3498DB'
                       },
                       '&.Mui-focused fieldset': {
                         borderColor: '#3498DB',
                         borderWidth: 2
                       }
                     },
                     '& .MuiInputBase-input': {
                       color: '#2C3E50',
                       fontSize: '1rem',
                       fontWeight: 500
                     }
                   }}
                 />
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Postal Code"
                   value={formData.postalCode}
                   onChange={(e) => handleInputChange('postalCode', e.target.value)}
                   sx={{
                     '& .MuiInputLabel-root': {
                       color: '#34495E',
                       fontWeight: 500,
                       fontSize: '0.95rem'
                     },
                     '& .MuiOutlinedInput-root': {
                       '& fieldset': {
                         borderColor: '#BDC3C7',
                         borderWidth: 2
                       },
                       '&:hover fieldset': {
                         borderColor: '#3498DB'
                       },
                       '&.Mui-focused fieldset': {
                         borderColor: '#3498DB',
                         borderWidth: 2
                       }
                     },
                     '& .MuiInputBase-input': {
                       color: '#2C3E50',
                       fontSize: '1rem',
                       fontWeight: 500
                     }
                   }}
                 />
               </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number *"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  required
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: errors.phoneNumber ? '#E74C3C' : '#34495E',
                      fontWeight: 500,
                      fontSize: '0.95rem'
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: errors.phoneNumber ? '#E74C3C' : '#BDC3C7',
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: errors.phoneNumber ? '#E74C3C' : '#3498DB'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: errors.phoneNumber ? '#E74C3C' : '#3498DB',
                        borderWidth: 2
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#2C3E50',
                      fontSize: '1rem',
                      fontWeight: 500
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#E74C3C',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: errors.email ? '#E74C3C' : '#34495E',
                      fontWeight: 500,
                      fontSize: '0.95rem'
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: errors.email ? '#E74C3C' : '#BDC3C7',
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: errors.email ? '#E74C3C' : '#3498DB'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: errors.email ? '#E74C3C' : '#3498DB',
                        borderWidth: 2
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: '#2C3E50',
                      fontSize: '1rem',
                      fontWeight: 500
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#E74C3C',
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>
                             <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Emergency Contact Name"
                   value={formData.emergencyContact}
                   onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                   sx={{
                     '& .MuiInputLabel-root': {
                       color: '#34495E',
                       fontWeight: 500,
                       fontSize: '0.95rem'
                     },
                     '& .MuiOutlinedInput-root': {
                       '& fieldset': {
                         borderColor: '#BDC3C7',
                         borderWidth: 2
                       },
                       '&:hover fieldset': {
                         borderColor: '#3498DB'
                       },
                       '&.Mui-focused fieldset': {
                         borderColor: '#3498DB',
                         borderWidth: 2
                       }
                     },
                     '& .MuiInputBase-input': {
                       color: '#2C3E50',
                       fontSize: '1rem',
                       fontWeight: 500
                     }
                   }}
                 />
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Emergency Contact Phone"
                   value={formData.emergencyPhone}
                   onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                   sx={{
                     '& .MuiInputLabel-root': {
                       color: '#34495E',
                       fontWeight: 500,
                       fontSize: '0.95rem'
                     },
                     '& .MuiOutlinedInput-root': {
                       '& fieldset': {
                         borderColor: '#BDC3C7',
                         borderWidth: 2
                       },
                       '&:hover fieldset': {
                         borderColor: '#3498DB'
                       },
                       '&.Mui-focused fieldset': {
                         borderColor: '#3498DB',
                         borderWidth: 2
                       }
                     },
                     '& .MuiInputBase-input': {
                       color: '#2C3E50',
                       fontSize: '1rem',
                       fontWeight: 500
                     }
                   }}
                 />
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Relationship to Emergency Contact"
                   value={formData.emergencyRelationship}
                   onChange={(e) => handleInputChange('emergencyRelationship', e.target.value)}
                   sx={{
                     '& .MuiInputLabel-root': {
                       color: '#34495E',
                       fontWeight: 500,
                       fontSize: '0.95rem'
                     },
                     '& .MuiOutlinedInput-root': {
                       '& fieldset': {
                         borderColor: '#BDC3C7',
                         borderWidth: 2
                       },
                       '&:hover fieldset': {
                         borderColor: '#3498DB'
                       },
                       '&.Mui-focused fieldset': {
                         borderColor: '#3498DB',
                         borderWidth: 2
                       }
                     },
                     '& .MuiInputBase-input': {
                       color: '#2C3E50',
                       fontSize: '1rem',
                       fontWeight: 500
                     }
                   }}
                 />
               </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              color: '#2C3E50',
              fontWeight: 'bold',
              fontSize: '1.25rem'
            }}>
              Required Documents
            </Typography>
            
            {/* Document Requirements Checklist */}
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              bgcolor: '#FFF5F5', 
              border: '2px solid #FFE0E0',
              borderRadius: 2
            }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                color: '#D32F2F',
                fontWeight: 'bold',
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

            <Alert severity="info" sx={{ mb: 3, bgcolor: '#E3F2FD', color: '#1565C0' }}>
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
              <Grid container spacing={3}>
                {requiredDocuments.map((document) => (
                  <Grid item xs={12} key={document.id}>
                    <Box sx={{ 
                      p: 2, 
                      border: '1px solid #E0E0E0', 
                      borderRadius: '8px', 
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
                        <Typography variant="caption" sx={{ 
                          mt: 1, 
                          display: 'block', 
                          color: '#4CAF50' 
                        }}>
                          ✓ File selected: {formData.documents[`doc_${document.id}`].name}
                        </Typography>
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
    <Box sx={{ bgcolor: 'white', minHeight: '600px' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: '#2C3E50', 
        color: 'white', 
        p: 3, 
        textAlign: 'center',
        borderBottom: '3px solid #3498DB'
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold',
          mb: 1,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          PWD Application Form
        </Typography>
        <Typography variant="subtitle1" sx={{ 
          opacity: 0.9,
          fontSize: '1.1rem'
        }}>
          Complete all required information to apply for PWD identification
        </Typography>
      </Box>

      {/* Stepper */}
      <Box sx={{ p: 3, bgcolor: '#F8F9FA' }}>
        <Stepper activeStep={activeStep} sx={{ 
          '& .MuiStepLabel-root .Mui-completed': {
            color: '#27AE60'
          },
          '& .MuiStepLabel-root .Mui-active': {
            color: '#3498DB'
          },
          '& .MuiStepLabel-label': {
            color: '#2C3E50',
            fontWeight: 600,
            fontSize: '0.95rem'
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
      <Paper elevation={0} sx={{ 
        m: 3, 
        borderRadius: 2,
        border: '1px solid #E0E0E0',
        bgcolor: 'white'
      }}>
        {renderStepContent(activeStep)}
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        p: 3,
        bgcolor: '#F8F9FA',
        borderTop: '1px solid #E0E0E0'
      }}>
        <Button
          onClick={handleBack}
          sx={{
            color: '#34495E',
            borderColor: '#34495E',
            borderWidth: 2,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            '&:hover': {
              borderColor: '#2C3E50',
              bgcolor: '#34495E',
              color: 'white'
            }
          }}
          variant="outlined"
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          sx={{
            bgcolor: '#3498DB',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            fontSize: '1rem',
            '&:hover': {
              bgcolor: '#2980B9'
            }
          }}
        >
          {activeStep === steps.length - 1 ? 'Submit Application' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}

export default ApplicationForm;