// src/components/cards/PWDCard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import AdminSidebar from '../shared/AdminSidebar';
import FrontDeskSidebar from '../shared/FrontDeskSidebar';
import { useAuth } from '../../contexts/AuthContext';
import pwdMemberService from '../../services/pwdMemberService';
import QRCodeService from '../../services/qrCodeService';
import SuccessModal from '../shared/SuccessModal';
import { useModal } from '../../hooks/useModal';

function PWDCard() {
  const { currentUser } = useAuth();
  const [pwdMembers, setPwdMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  
  // Success modal
  const { modalOpen, modalConfig, showModal, hideModal } = useModal();
  
  const [filters, setFilters] = useState({
    search: '',
    barangay: '',
    disability: '',
    ageRange: '',
    status: ''
  });

  // Fetch PWD members from API
  const fetchPwdMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pwdMemberService.getAll();
      const members = response.data || response.members || [];
      
      // Debug: Log the raw API response
      console.log('=== API Response Debug ===');
      console.log('Raw API response:', response);
      console.log('Members from API:', members);
      console.log('First member with ID pictures:', members.find(m => m.idPictures));
      
      // Transform the data to match our expected format
      const transformedMembers = members.map((member, index) => ({
        id: member.pwd_id || `PWD-2025-${String(index + 1).padStart(6, '0')}`,
        name: `${member.firstName || ''} ${member.middleName || ''} ${member.lastName || ''} ${member.suffix || ''}`.trim() || 'Unknown Member',
        age: member.birthDate ? new Date().getFullYear() - new Date(member.birthDate).getFullYear() : 'N/A',
        barangay: member.barangay || 'N/A',
        status: 'Active',
        disabilityType: member.disabilityType || 'Not specified',
        birthDate: member.birthDate,
        firstName: member.firstName,
        lastName: member.lastName,
        middleName: member.middleName,
        suffix: member.suffix,
        address: member.address,
        contactNumber: member.contactNumber || member.phone,
        gender: member.gender || member.sex,
        bloodType: member.bloodType,
        idPictures: member.idPictures // Add ID pictures to the transformation
      }));
      
      // Set the members from API (no fallback to mock data)
      setPwdMembers(transformedMembers);
      
      // Set first member as selected if none selected and members exist
      if (!selectedMember && transformedMembers.length > 0) {
        setSelectedMember(transformedMembers[0].id);
      }
    } catch (err) {
      console.error('Error fetching PWD members:', err);
      
      // Check if it's an authentication error
      if (err.status === 401 || err.status === 403) {
        console.error('Authentication error in PWDCard:', err);
        setError('Authentication error. Please refresh the page and try again.');
        // Don't throw the error to prevent it from affecting the parent component
        return;
      }
      
      setError('Failed to fetch PWD members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load PWD members on component mount
  useEffect(() => {
    fetchPwdMembers();
  }, []);

  // Generate QR code for selected member
  useEffect(() => {
    if (!selectedMember || pwdMembers.length === 0) return;
    
    const generateQRCode = async () => {
      try {
        const member = pwdMembers.find(m => m.id === selectedMember);
        if (!member) return;
        
        const qrDataURL = await QRCodeService.generateMemberQRCode(member);
        setQrCodeDataURL(qrDataURL);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };
    
    generateQRCode();
  }, [selectedMember, pwdMembers]);


  const handleDownloadPDF = () => {
    console.log('Download PDF clicked');
  };

  const handlePrintCard = () => {
    if (!selectedMemberData) {
      showModal({
        type: 'warning',
        title: 'No Member Selected',
        message: 'Please select a PWD member to print their card.',
        buttonText: 'OK'
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>PWD ID Card - ${selectedMemberData.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .id-card {
              width: 2in;
              height: 3in;
              border: 2px solid #000;
              background: white;
              position: relative;
              margin: 0 auto;
              box-sizing: border-box;
            }
            .header {
              text-align: center;
              padding: 3px 0;
              border-bottom: 1px solid #000;
              font-size: 6px;
              font-weight: bold;
              line-height: 1.1;
            }
            .content {
              display: flex;
              height: calc(100% - 20px);
            }
            .left-section {
              flex: 1;
              padding: 4px;
              font-size: 5px;
              line-height: 1.1;
            }
            .right-section {
              width: 40px;
              padding: 3px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              border-left: 1px solid #000;
            }
            .photo-placeholder {
              width: 30px;
              height: 30px;
              border: 1px dashed #000;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 4px;
              margin-bottom: 3px;
            }
            .qr-code {
              width: 30px;
              height: 30px;
              border: 1px solid #000;
              margin-top: 3px;
            }
            }
            .footer {
              position: absolute;
              bottom: 3px;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 4px;
              font-weight: bold;
            }
            .pdao-button {
              background: #000;
              color: white;
              padding: 1px 4px;
              font-size: 5px;
              font-weight: bold;
              margin: 1px 0;
              border: none;
            }
            @media print {
              body { margin: 0; }
              .id-card { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">
              REPUBLIC OF THE PHILIPPINES<br>
              PROVINCE OF LAGUNA<br>
              CITY OF CABUYAO<br>
              (P.D.A.O)
            </div>
            
            <div class="content">
              <div class="left-section">
                <div class="pdao-button">CABUYAO PDAO</div>
                <br>
                <strong>NAME:</strong> ${selectedMemberData.name}<br>
                <strong>ID NO.:</strong> ${selectedMemberData.id}<br>
                <strong>TYPE OF DISABILITY:</strong> ${selectedMemberData.disabilityType}<br>
                <br>
                <strong>SIGNATURE:</strong> ________________
              </div>
              
              <div class="right-section">
                <div class="photo-placeholder">PHOTO</div>
                <div class="qr-code">
                  ${qrCodeDataURL ? `<img src="${qrCodeDataURL}" style="width: 100%; height: 100%;" />` : 'QR CODE'}
                </div>
              </div>
            </div>
            
            <div class="footer">
              VALID ANYWHERE IN THE PHILIPPINES
            </div>
          </div>
          <script>window.onload = function(){ window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handlePrint = () => {
    try {
      const table = document.getElementById('pwd-card-masterlist');
      if (!table) {
        console.error('Masterlist table not found');
        window.print();
        return;
      }
      const printWindow = window.open('', '_blank');
      const appliedFilters = `Barangay: ${filters.barangay || 'All'} | Disability: ${filters.disability || 'All'} | Age: ${filters.ageRange || 'All'} | Status: ${filters.status || 'All'}`;
      printWindow.document.write(`
        <html>
          <head>
            <title>PWD Members Master List</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 24px; }
              h1 { font-size: 18px; margin: 0 0 8px; }
              .meta { color: #555; font-size: 12px; margin-bottom: 12px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
              th { background: #f5f5f5; text-align: left; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>Cabuyao PDAO RMS - PWD Members Master List</h1>
            <div class="meta">${appliedFilters} | Total Records: ${filteredMembers.length} | Generated: ${new Date().toLocaleString()}</div>
            ${document.getElementById('pwd-card-table-wrapper')?.innerHTML || table.outerHTML}
            <script>window.onload = function(){ window.print(); window.close(); }<\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (e) {
      console.error('Print failed, fallback to window.print()', e);
      window.print();
    }
  };

  // Filter options
  const barangays = [
    'Bigaa', 'Butong', 'Marinig', 'Gulod', 'Pob. Uno', 'Pob. Dos', 'Pob. Tres',
    'Sala', 'Niugan', 'Banaybanay', 'Pulo', 'Diezmo', 'Pittland', 'San Isidro',
    'Mamatid', 'Baclaran', 'Casile', 'Banlic'
  ];

  const disabilityTypes = [
    'Visual Impairment',
    'Hearing Impairment',
    'Physical Disability',
    'Speech and Language Impairment',
    'Intellectual Disability',
    'Mental Health Condition',
    'Learning Disability',
    'Psychosocial Disability',
    'Autism Spectrum Disorder',
    'ADHD',
    'Orthopedic/Physical Disability',
    'Chronic Illness',
    'Multiple Disabilities'
  ];

  const ageRanges = [
    'Under 18', '18-25', '26-35', '36-45', '46-55', '56-65', 'Over 65'
  ];

  const statuses = [
    'Active', 'Inactive', 'Pending', 'Suspended'
  ];

  // Filter functions
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      barangay: '',
      disability: '',
      ageRange: '',
      status: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Filter the members based on current filters
  const filteredMembers = pwdMembers.filter(member => {
    // Search filter
    const matchesSearch = !filters.search || 
      (member.name && member.name.toLowerCase().includes(filters.search.toLowerCase())) ||
      (member.id && member.id.toLowerCase().includes(filters.search.toLowerCase()));

    // Barangay filter
    const matchesBarangay = !filters.barangay || 
      (member.barangay && member.barangay === filters.barangay);

    // Disability filter
    const matchesDisability = !filters.disability || 
      (member.disabilityType && member.disabilityType === filters.disability);

    // Status filter
    const matchesStatus = !filters.status || 
      (member.status && member.status === filters.status);

    // Age range filter
    let matchesAgeRange = true;
    if (filters.ageRange && member.age !== 'N/A') {
      const age = parseInt(member.age);
      if (filters.ageRange === 'Under 18') {
        matchesAgeRange = age < 18;
      } else if (filters.ageRange === 'Over 65') {
        matchesAgeRange = age > 65;
      } else {
        const [min, max] = filters.ageRange.split('-').map(Number);
        matchesAgeRange = age >= min && age <= max;
      }
    }

    return matchesSearch && matchesBarangay && matchesDisability && matchesAgeRange && matchesStatus;
  });

  const selectedMemberData = pwdMembers.find(member => member.id === selectedMember) || pwdMembers[0];
  
  // Debug member selection
  console.log('=== Member Selection Debug ===');
  console.log('Selected Member ID:', selectedMember);
  console.log('Available Members:', pwdMembers.map(m => ({ id: m.id, name: `${m.firstName} ${m.lastName}`, hasIdPictures: !!m.idPictures })));
  console.log('Selected Member Data:', selectedMemberData);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
        {currentUser?.role === 'FrontDesk' ? <FrontDeskSidebar /> : <AdminSidebar />}
        <Box sx={{ 
          flexGrow: 1, 
          p: 3, 
          ml: '280px',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: '#0b87ac', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading PWD members...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
        {currentUser?.role === 'FrontDesk' ? <FrontDeskSidebar /> : <AdminSidebar />}
        <Box sx={{ 
          flexGrow: 1, 
          p: 3, 
          ml: '280px'
        }}>
          <Alert 
            severity="error" 
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchPwdMembers}
                sx={{ fontWeight: 'bold' }}
              >
                Retry
              </Button>
            }
            sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
          >
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  // Show empty state
  if (!loading && pwdMembers.length === 0) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
        {currentUser?.role === 'FrontDesk' ? <FrontDeskSidebar /> : <AdminSidebar />}
        <Box sx={{ 
          flexGrow: 1, 
          p: 3, 
          ml: '280px',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CreditCardIcon sx={{ fontSize: 60, color: '#BDC3C7', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No PWD Members Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              No PWD members are available to generate cards for.
            </Typography>
            <Button
              variant="contained"
              onClick={fetchPwdMembers}
              sx={{ 
                bgcolor: '#0b87ac', 
                '&:hover': { bgcolor: '#0a6b8a' },
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      {currentUser?.role === 'FrontDesk' ? <FrontDeskSidebar /> : <AdminSidebar />}

      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1, 
        p: 3, 
        ml: '280px'
      }}>
        <Container maxWidth="xl">
          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              color: '#0b87ac', 
              mb: 1
            }}>
              PWD Card
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#7F8C8D'
            }}>
              View and manage PWD ID cards for members.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Left Panel - PWD Masterlist */}
            <Grid item xs={12} md={8}>
              <Card elevation={3} sx={{ height: '700px', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }} id="pwd-card-table-wrapper">
                <CardContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'white' }}>

                  {/* Header with tabs and controls */}
                  <Box sx={{ 
                    backgroundColor: '#0b87ac', 
                    color: 'white', 
                    p: 2, 
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        PWD MASTERLIST
                      </Typography>
                      <Box sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 1 
                      }}>
                        <Typography variant="body2">
                          PWD Members Master List ({filteredMembers.length} records)
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Search members..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        sx={{ 
                          width: { xs: 150, sm: 180, md: 200 },
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: 2,
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: 'white' },
                          },
                          '& .MuiInputBase-input': {
                            color: 'white',
                            fontSize: '0.9rem',
                            '&::placeholder': {
                              color: 'rgba(255,255,255,0.7)',
                              opacity: 1
                            }
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                            </InputAdornment>
                          )
                        }}
                      />
                      <IconButton 
                        sx={{ 
                          color: 'white',
                          backgroundColor: showFilters ? 'rgba(255,255,255,0.2)' : 'transparent',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                        }} 
                        onClick={() => setShowFilters(!showFilters)}
                      >
                        <FilterListIcon />
                      </IconButton>
                      <IconButton sx={{ color: 'white' }} onClick={fetchPwdMembers}>
                        <RefreshIcon />
                      </IconButton>
                      <Button
                        variant="contained"
                        startIcon={<PrintIcon />}
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                          color: 'white',
                          textTransform: 'none'
                        }}
                        onClick={handlePrint}
                      >
                        Print List
                      </Button>
                    </Box>
                  </Box>


                  {/* Filter Section */}
                  <Collapse in={showFilters}>
                    <Box sx={{ 
                      p: 3, 
                      backgroundColor: '#F8FAFC', 
                      borderBottom: '1px solid #E0E0E0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#0b87ac' }}>
                          Search Filters
                        </Typography>
                        {hasActiveFilters && (
                          <Button
                            startIcon={<ClearIcon />}
                            onClick={clearFilters}
                            size="small"
                            sx={{ 
                              textTransform: 'none', 
                              color: '#E74C3C',
                              '&:hover': {
                                backgroundColor: '#FDF2F2',
                                color: '#C0392B'
                              }
                            }}
                          >
                            Clear All
                          </Button>
                        )}
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#0b87ac', fontWeight: 600 }}>Barangay</InputLabel>
                            <Select
                              value={filters.barangay}
                              onChange={(e) => handleFilterChange('barangay', e.target.value)}
                              label="Barangay"
                              sx={{
                                backgroundColor: '#FFFFFF',
                                '& .MuiSelect-select': {
                                  color: '#0b87ac',
                                  fontWeight: 600,
                                  fontSize: '0.9rem'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#E0E0E0'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#0b87ac'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#0b87ac'
                                }
                              }}
                            >
                              <MenuItem value="" sx={{ color: '#95A5A6', fontWeight: 600 }}>All Barangays</MenuItem>
                              {barangays.map(barangay => (
                                <MenuItem key={barangay} value={barangay} sx={{ color: '#0b87ac', fontWeight: 600 }}>
                                  {barangay}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#0b87ac', fontWeight: 600 }}>Disability Type</InputLabel>
                            <Select
                              value={filters.disability}
                              onChange={(e) => handleFilterChange('disability', e.target.value)}
                              label="Disability Type"
                              sx={{
                                backgroundColor: '#FFFFFF',
                                '& .MuiSelect-select': {
                                  color: '#0b87ac',
                                  fontWeight: 600,
                                  fontSize: '0.9rem'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#E0E0E0'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#0b87ac'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#0b87ac'
                                }
                              }}
                            >
                              <MenuItem value="" sx={{ color: '#95A5A6', fontWeight: 600 }}>All Disabilities</MenuItem>
                              {disabilityTypes.map(disability => (
                                <MenuItem key={disability} value={disability} sx={{ color: '#0b87ac', fontWeight: 600 }}>
                                  {disability}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#0b87ac', fontWeight: 600 }}>Age Range</InputLabel>
                            <Select
                              value={filters.ageRange}
                              onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                              label="Age Range"
                              sx={{
                                backgroundColor: '#FFFFFF',
                                '& .MuiSelect-select': {
                                  color: '#0b87ac',
                                  fontWeight: 600,
                                  fontSize: '0.9rem'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#E0E0E0'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#0b87ac'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#0b87ac'
                                }
                              }}
                            >
                              <MenuItem value="" sx={{ color: '#95A5A6', fontWeight: 600 }}>All Ages</MenuItem>
                              {ageRanges.map(range => (
                                <MenuItem key={range} value={range} sx={{ color: '#0b87ac', fontWeight: 600 }}>
                                  {range}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#0b87ac', fontWeight: 600 }}>Status</InputLabel>
                            <Select
                              value={filters.status}
                              onChange={(e) => handleFilterChange('status', e.target.value)}
                              label="Status"
                              sx={{
                                backgroundColor: '#FFFFFF',
                                '& .MuiSelect-select': {
                                  color: '#0b87ac',
                                  fontWeight: 600,
                                  fontSize: '0.9rem'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#E0E0E0'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#0b87ac'
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#0b87ac'
                                }
                              }}
                            >
                              <MenuItem value="" sx={{ color: '#95A5A6', fontWeight: 600 }}>All Statuses</MenuItem>
                              {statuses.map(status => (
                                <MenuItem key={status} value={status} sx={{ color: '#0b87ac', fontWeight: 600 }}>
                                  {status}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>

                      {/* Active Filters Display */}
                      {hasActiveFilters && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ color: '#0b87ac', mb: 1, fontWeight: 600 }}>
                            Active Filters:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {Object.entries(filters).map(([key, value]) => {
                              if (value && key !== 'search') {
                                return (
                                  <Chip
                                    key={key}
                                    label={`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`}
                                    onDelete={() => handleFilterChange(key, '')}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: '#0b87ac', 
                                      color: '#FFFFFF',
                                      fontWeight: 600,
                                      '& .MuiChip-deleteIcon': {
                                        color: '#FFFFFF',
                                        '&:hover': {
                                          color: '#E8F4FD'
                                        }
                                      }
                                    }}
                                  />
                                );
                              }
                              return null;
                            })}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Collapse>

                  {/* Data Table */}
                  <TableContainer 
                    component={Paper} 
                    elevation={0} 
                    sx={{ 
                      border: 'none',
                      borderRadius: '0px',
                      flex: 1,
                      overflow: 'auto',
                      boxShadow: 'none',
                      minHeight: 0,
                      backgroundColor: 'white',
                      overflowX: 'auto'
                    }}
                  >
                    <Table stickyHeader id="pwd-card-masterlist">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#0b87ac' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>PWD ID NO.</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>NAME</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>AGE</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>BARANGAY</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>STATUS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredMembers.map((member, index) => (
                          <TableRow 
                            key={member.id}
                            sx={{ 
                              backgroundColor: selectedMember === member.id ? '#E8F4FD' : (index % 2 === 0 ? 'white' : '#F8FAFC'),
                              cursor: 'pointer',
                              borderLeft: selectedMember === member.id ? '4px solid #0b87ac' : 'none',
                              borderBottom: '1px solid #E0E0E0',
                              '&:hover': {
                                backgroundColor: selectedMember === member.id ? '#E8F4FD' : '#F0F8FF',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 4px rgba(11, 135, 172, 0.1)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                            onClick={() => setSelectedMember(member.id)}
                          >
                            <TableCell sx={{ 
                              fontSize: '13px', 
                              py: 2
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Radio
                                  checked={selectedMember === member.id}
                                  onChange={() => setSelectedMember(member.id)}
                                  sx={{ 
                                    color: '#0b87ac',
                                    '&.Mui-checked': {
                                      color: '#0b87ac'
                                    }
                                  }}
                                />
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 'bold',
                                  color: selectedMember === member.id ? '#0b87ac' : '#2C3E50'
                                }}>
                                {member.id}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 'bold', 
                              fontSize: '13px',
                              py: 2,
                              color: selectedMember === member.id ? '#0b87ac' : '#2C3E50'
                            }}>{member.name}</TableCell>
                            <TableCell sx={{ 
                              fontSize: '13px',
                              py: 2,
                              color: selectedMember === member.id ? '#0b87ac' : '#2C3E50'
                            }}>{member.age}</TableCell>
                            <TableCell sx={{ 
                              fontSize: '13px',
                              py: 2,
                              color: selectedMember === member.id ? '#0b87ac' : '#2C3E50'
                            }}>{member.barangay}</TableCell>
                            <TableCell sx={{ 
                              py: 2
                            }}>
                              <Chip 
                                label={member.status} 
                                color="success"
                                size="small"
                                sx={{ 
                                  fontWeight: 'bold',
                                  fontSize: '11px',
                                  height: '24px',
                                  backgroundColor: '#27AE60',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#229954'
                                  }
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Panel - PWD Card Preview */}
            <Grid item xs={12} md={4}>
              {/* Print Card Button */}
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintCard}
                  disabled={!selectedMemberData}
                  sx={{
                    bgcolor: '#0b87ac',
                    '&:hover': { bgcolor: '#0a6b8a' },
                    '&:disabled': { bgcolor: '#BDC3C7' },
                    textTransform: 'none',
                    fontWeight: 'bold',
                    px: 3,
                    py: 1
                  }}
                >
                  Print PWD Card (2x3)
                </Button>
              </Box>
              
              <Card elevation={0} sx={{ height: '50%', backgroundColor: 'transparent', mb: 2 }}>
                <CardContent sx={{ p: 0, height: '100%' }}>
                  <Box sx={{
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#2C3E50',
                    position: 'relative',
                    borderRadius: 2,
                    border: '2px solid #E0E0E0',
                    p: 2,
                    height: '100%',
                    width: '100%',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }}>
                    {/* Left Side - Header and Member Details */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      flex: 1,
                      pr: 2
                  }}>
                    {/* Card Header */}
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          mb: 0.2, 
                          fontSize: '10px', 
                          color: '#2C3E50',
                          letterSpacing: '0.3px',
                          lineHeight: 1.2
                        }}>
                        REPUBLIC OF THE PHILIPPINES
                      </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          mb: 0.2, 
                          fontSize: '10px', 
                          color: '#2C3E50',
                          letterSpacing: '0.3px',
                          lineHeight: 1.2
                        }}>
                        PROVINCE OF LAGUNA
                      </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          mb: 0.2, 
                          fontSize: '10px', 
                          color: '#2C3E50',
                          letterSpacing: '0.3px',
                          lineHeight: 1.2
                        }}>
                        CITY OF CABUYAO
                      </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '10px', 
                          color: '#2C3E50',
                          letterSpacing: '0.3px',
                          lineHeight: 1.2
                        }}>
                        (P.D.A.O)
                      </Typography>
                    </Box>

                      {/* Logo Section */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                      }}>
                        <Box sx={{
                          backgroundColor: '#000000',
                          borderRadius: 0.5,
                          px: 1.5,
                          py: 0.5,
                          border: '1px solid #E0E0E0'
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: '#FFFFFF !important', 
                            fontSize: '9px', 
                            fontWeight: 'bold',
                            letterSpacing: '0.3px',
                            textAlign: 'center',
                            display: 'block'
                          }}>
                            CABUYAO PDAO
                        </Typography>
                        </Box>
                      </Box>

                      {/* Member Details */}
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" sx={{ 
                            mb: 0.8, 
                            fontSize: '9px', 
                            color: '#2C3E50', 
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            lineHeight: 1.3
                          }}>
                            NAME: {selectedMemberData?.name || 'Unknown Member'}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            mb: 0.8, 
                            fontSize: '9px', 
                            color: '#2C3E50', 
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            lineHeight: 1.3
                          }}>
                            ID No.: {selectedMemberData?.id || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            mb: 0.8, 
                            fontSize: '9px', 
                            color: '#2C3E50', 
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            lineHeight: 1.3
                          }}>
                            TYPE OF DISABILITY: {selectedMemberData?.disabilityType || 'Not specified'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                          fontSize: '9px', 
                          color: '#2C3E50', 
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          lineHeight: 1.3,
                          mt: 1
                        }}>
                          SIGNATURE: _________
                        </Typography>
                    </Box>

                      {/* Card Footer */}
                      <Typography variant="body2" sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '8px', 
                        color: '#2C3E50',
                        textAlign: 'center',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                        mt: 2
                      }}>
                        VALID ANYWHERE IN THE PHILIPPINES
                      </Typography>
                    </Box>

                    {/* Right Side - Photo */}
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      flexShrink: 0,
                      height: '100%',
                      py: 1
                    }}>
                        {/* ID Picture */}
                        <Box sx={{
                          width: 70,
                          height: 70,
                          backgroundColor: '#F8F9FA',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #BDC3C7',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          {(() => {
                            // Debug logging
                            console.log('=== ID Picture Debug ===');
                            console.log('Selected Member:', selectedMemberData?.firstName, selectedMemberData?.lastName);
                            console.log('ID Pictures raw:', selectedMemberData?.idPictures);
                            
                            if (!selectedMemberData?.idPictures) {
                              console.log('No ID pictures found');
                              return null;
                            }
                            
                            let imagePath = null;
                            
                            // Handle different data formats
                            if (Array.isArray(selectedMemberData.idPictures)) {
                              imagePath = selectedMemberData.idPictures[0];
                              console.log('Array format - first image:', imagePath);
                            } else if (typeof selectedMemberData.idPictures === 'string') {
                              try {
                                const parsed = JSON.parse(selectedMemberData.idPictures);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                  imagePath = parsed[0];
                                  console.log('String format - parsed first image:', imagePath);
                                }
                              } catch (e) {
                                console.error('Failed to parse idPictures string:', e);
                                return null;
                              }
                            }
                            
                            if (imagePath) {
                              const fullUrl = `http://127.0.0.1:8000/storage/${imagePath}`;
                              console.log('Final image URL:', fullUrl);
                              
                              return (
                                <img
                                  src={fullUrl}
                                  alt="ID Picture"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0
                                  }}
                                  onError={(e) => {
                                    console.error('Image load error for:', fullUrl);
                                    e.target.style.display = 'none';
                                  }}
                                  onLoad={() => {
                                    console.log('Image loaded successfully:', fullUrl);
                                  }}
                                />
                              );
                            }
                            
                            console.log('No valid image path found');
                            return null;
                          })()}
                          
                          {/* Empty placeholder - no text */}
                        </Box>

                        {/* QR Code */}
                        {qrCodeDataURL && (
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 1,
                            p: 1,
                            border: '1px solid #E0E0E0'
                          }}>
                            <img 
                              src={qrCodeDataURL} 
                              alt="QR Code" 
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '2px'
                              }}
                            />
                          </Box>
                        )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* PWD Information Section */}
              <Card elevation={0} sx={{ backgroundColor: 'transparent' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    background: '#FFFFFF',
                    borderRadius: 2,
                    border: '2px solid #E0E0E0',
                    p: 1.5,
                    width: '100%',
                    aspectRatio: '85.6 / 54',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexShrink: 0 }}>
                      <Box sx={{ 
                        position: 'relative',
                        mr: 2
                      }}>
                        <Avatar sx={{ 
                          width: 28, 
                          height: 28, 
                          backgroundColor: '#0b87ac',
                          border: '2px solid white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                          <PersonIcon />
                        </Avatar>
                        <Box sx={{
                          position: 'absolute',
                          bottom: -1,
                          right: -1,
                          width: 12,
                          height: 12,
                          backgroundColor: '#27AE60',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid white'
                        }}>
                          <EditIcon sx={{ fontSize: 7, color: 'white' }} />
                        </Box>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
                        PWD Information
                      </Typography>
                    </Box>
                  
                  {selectedMemberData ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 1, 
                      flex: 1,
                      overflow: 'auto',
                      pr: 0.5, // Add padding for scrollbar
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#c1c1c1',
                        borderRadius: '3px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: '#a8a8a8',
                      }
                    }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FFFFFF', mb: 0.5, fontSize: '12px' }}>
                          Name:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 'bold' }}>
                            {selectedMemberData.lastName || ''},
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 'bold' }}>
                            {selectedMemberData.firstName || ''},
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 'bold' }}>
                            {selectedMemberData.middleName || ''},
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 'bold' }}>
                            {selectedMemberData.suffix || ''}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FFFFFF', mb: 0.5, fontSize: '12px' }}>
                          Address:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontSize: '14px' }}>
                          {(() => {
                            const addressParts = [];
                            
                            // Add complete address if available
                            if (selectedMemberData.address) {
                              addressParts.push(selectedMemberData.address);
                            }
                            
                            // Add barangay if available
                            if (selectedMemberData.barangay && selectedMemberData.barangay !== 'N/A') {
                              addressParts.push(selectedMemberData.barangay);
                            }
                            
                            // Add city (default to Cabuyao if not specified)
                            const city = selectedMemberData.city && selectedMemberData.city !== 'N/A' 
                              ? selectedMemberData.city 
                              : 'Cabuyao';
                            addressParts.push(city);
                            
                            // Add province (default to Laguna if not specified)
                            const province = selectedMemberData.province && selectedMemberData.province !== 'N/A' 
                              ? selectedMemberData.province 
                              : 'Laguna';
                            addressParts.push(province);
                            
                            // Join all parts with commas and return
                            return addressParts.length > 0 ? addressParts.join(', ') : 'No address provided';
                          })()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FFFFFF', mb: 0.5, fontSize: '12px' }}>
                            Contact #:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#FFFFFF', fontSize: '14px' }}>
                            {selectedMemberData.contactNumber || '+63 987 654 3210'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FFFFFF', mb: 0.5, fontSize: '12px' }}>
                            Sex:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#FFFFFF', fontSize: '14px' }}>
                            {selectedMemberData.gender || 'Male'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FFFFFF', mb: 0.5, fontSize: '12px' }}>
                            Blood Type:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#FFFFFF', fontSize: '14px' }}>
                            {selectedMemberData.bloodType || 'O+'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      py: 4,
                      flexDirection: 'column'
                    }}>
                      <PersonIcon sx={{ fontSize: 48, color: '#FFFFFF', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#FFFFFF', textAlign: 'center' }}>
                        Select a PWD member to view information
                      </Typography>
                    </Box>
                  )}
                  </Box>
                </CardContent>
              </Card>

            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Success Modal */}
      <SuccessModal
        open={modalOpen}
        onClose={hideModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        buttonText={modalConfig.buttonText}
      />
    </Box>
  );
}

export default PWDCard;