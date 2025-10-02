import React, { useState, useEffect } from 'react';
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
  Radio,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Menu from '@mui/icons-material/Menu';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import PersonIcon from '@mui/icons-material/Person';
import BarangayPresidentSidebar from '../shared/BarangayPresidentSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

// Real PWD data will be fetched from API based on barangay

// Main Component
function BarangayPresidentPWDCard() {
  const { currentUser } = useAuth();
  const barangay = currentUser?.barangay || 'Unknown Barangay';
  
  const [pwdData, setPwdData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch PWD members from API filtered by barangay
  useEffect(() => {
    const fetchPwdMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching PWD members for barangay:', barangay);
        const response = await api.get('/mock-pwd');
        console.log('API Response:', response);
        const members = response.data?.members || response.members || [];
        console.log('All members data:', members);
        
        // Filter members by barangay
        const filteredMembers = members.filter(member => {
          // Only show members from the barangay president's barangay
          return member.barangay === barangay;
        });
        
        console.log(`Filtered members for ${barangay}:`, filteredMembers);
        setPwdData(filteredMembers);
        if (filteredMembers.length > 0) {
          setSelectedRow(filteredMembers[0].userID);
        }
      } catch (err) {
        console.error('Error fetching PWD members:', err);
        setError(`Failed to fetch PWD members: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPwdMembers();
  }, [barangay]);

  const handleRowSelect = (id) => {
    setSelectedRow(id);
  };

  // Helper function to calculate age from birth date
  const getAgeFromBirthDate = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusChip = (status) => {
    let style = {
      bgcolor: '#3498DB',
      color: '#FFFFFF',
      fontWeight: 600,
      fontSize: '0.75rem',
      width: '100px',
      height: '24px'
    };
    if (status === 'ACTIVE') {
      style.bgcolor = '#27AE60'; // Green for ACTIVE
    }
    return <Chip label={status} size="small" sx={style} />;
  };

  const filteredData = pwdData.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Get the selected PWD data
  const selectedPWD = pwdData.find(pwd => pwd.userID === selectedRow) || pwdData[0];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F7FC' }}>
        <BarangayPresidentSidebar />
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: '#2C3E50', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading PWD members for {barangay}...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F7FC' }}>
        <BarangayPresidentSidebar />
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  if (pwdData.length === 0) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F7FC' }}>
        <BarangayPresidentSidebar />
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 80, color: '#BDC3C7', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
              No PWD Members Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              No PWD members with accounts found in {barangay}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F7FC' }}>
      <BarangayPresidentSidebar />
      
      {/* --- Main Content --- */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        ml: '280px',
        width: 'calc(100% - 280px)'
      }}>
        {/* Top Bar */}
        <Box sx={{
          bgcolor: '#FFFFFF',
          p: 2,
          borderBottom: '1px solid #E0E0E0',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#193a52',
              textTransform: 'none',
              fontWeight: 600,
              px: 4, py: 1,
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#153a5a' }
            }}
          >
            Masterlist - {barangay}
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <TextField
            placeholder="Search table"
            size="small"
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#F4F7FC',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: '#BDC3C7' },
                '&.Mui-focused fieldset': { borderColor: '#3498DB' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#7F8C8D' }} />
                </InputAdornment>
              ),
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton sx={{ color: '#7F8C8D', border: '1px solid #E0E0E0', borderRadius: 2 }}>
            <FilterListIcon />
          </IconButton>
          <IconButton sx={{ color: '#7F8C8D', border: '1px solid #E0E0E0', borderRadius: 2 }}>
            <Menu />
          </IconButton>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, p: 3, bgcolor: '#F4F7FC' }}>
          <Grid container spacing={3} sx={{ height: '100%' }}>
            {/* Left Section - PWD Masterlist (Full Height) */}
            <Grid item xs={12} lg={8}>
              <Paper elevation={0} sx={{
                p: 3,
                border: '1px solid #E0E0E0',
                borderRadius: 4,
                bgcolor: '#FFFFFF',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography sx={{ fontWeight: 700, mb: 2, color: '#193a52', fontSize: '1.2rem' }}>
                  PWD MASTERLIST - {barangay}
                </Typography>

                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <TableContainer sx={{ height: '100%', maxHeight: 'calc(100vh - 200px)' }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
                          <TableCell padding="checkbox" sx={{ bgcolor: '#F8FAFC' }}>
                            {/* Remove checkbox header since we're using radio buttons */}
                          </TableCell>
                          {['PWD ID NO.', 'NAME', 'AGE', 'BARANGAY', ''].map(headCell => (
                            <TableCell key={headCell} sx={{ 
                              fontWeight: 600, 
                              color: '#7F8C8D', 
                              fontSize: '0.8rem',
                              bgcolor: '#F8FAFC'
                            }}>
                              {headCell} {headCell && '↕'}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                         {filteredData.map((row) => (
                           <TableRow key={row.userID} sx={{
                             bgcolor: selectedRow === row.userID ? '#E8F4FD' : '#FFFFFF',
                             '&:hover': { bgcolor: '#F8FAFC' },
                             '& .MuiTableCell-root': { borderBottom: '1px solid #EAEDED', py: 1.5 }
                           }}>
                            <TableCell padding="checkbox">
                              <Radio
                                color="primary"
                                checked={selectedRow === row.userID}
                                onChange={() => handleRowSelect(row.userID)}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>{row.pwd_id || `PWD-${row.userID}` || 'Not assigned'}</TableCell>
                            <TableCell sx={{ color: '#34495E' }}>
                              {`${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Name not provided'}
                            </TableCell>
                            <TableCell sx={{ color: '#34495E' }}>
                              {row.birthDate ? getAgeFromBirthDate(row.birthDate) : 'N/A'}
                            </TableCell>
                            <TableCell sx={{ color: '#34495E' }}>{row.barangay || 'Not specified'}</TableCell>
                            <TableCell>{getStatusChip(row.status || 'Active')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Right Section - PWD Card Preview and Information */}
            <Grid item xs={12} lg={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                {/* PWD Card Preview */}
                <Paper elevation={0} sx={{
                  p: 2,
                  border: '1px solid #E0E0E0',
                  borderRadius: 4,
                  bgcolor: '#FFFFFF',
                  flex: 2, // Use flex instead of fixed height
                  minHeight: '400px' // Minimum height for content
                }}>
                   <Box sx={{
                    border: '1px solid #E0E0E0', borderRadius: 2, p: 2, bgcolor: '#FFFFFF',
                    height: '100%', // Take full height of parent
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}>
                      {/* Top Section with Headers and Logos */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        {/* Left side - Headers */}
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#000000', textAlign:'center', mb: 0.3 }}>REPUBLIC OF THE PHILIPPINES</Typography>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#000000', textAlign:'center', mb: 0.3 }}>PROVINCE OF LAGUNA</Typography>
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#000000', textAlign:'center', mb: 0.3 }}>CITY OF CABUYAO</Typography>
                          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#000000', textAlign:'center' }}>(P.D.A.O)</Typography>
                        </Box>
                        
                        {/* Right side - Logos */}
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                          {/* City Seal */}
                          <Box sx={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #FFFFFF',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            position: 'relative'
                          }}>
                            <Box sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '70%',
                              height: '70%',
                              background: 'radial-gradient(circle, #FFFFFF 0%, #FFFFFF 25%, transparent 25%)',
                              borderRadius: '50%'
                            }} />
                            <Typography sx={{ fontSize: '0.35rem', color: '#FFFFFF', fontWeight: 700, textAlign: 'center', lineHeight: 0.7, zIndex: 1 }}>
                              LUNGSOD<br/>NG<br/>CABUYAO<br/>LAGUNA<br/>2012
                            </Typography>
                          </Box>
                          
                          {/* PDAO Logo */}
                          <Box sx={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #FFFFFF',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Box sx={{
                                width: 12, height: 12,
                                background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23FFFFFF\' d=\'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9ZM19 9H14V4H5V21H19V9Z\'/%3E%3C/svg%3E")',
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                margin: '0 auto 1px'
                              }} />
                              <Typography sx={{ fontSize: '0.45rem', color: '#FFFFFF', fontWeight: 700 }}>PDAO</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      
                      {/* Main Content Area */}
                      <Box sx={{ display: 'flex', gap: 1.5, flex: 1 }}>
                        {/* Left side - Information Fields */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {/* Name Field */}
                          <Box>
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#000000', mb: 0.2 }}>NAME</Typography>
                            <Box sx={{ 
                              borderBottom: '1px solid #000000', 
                              height: 18, 
                              display: 'flex', 
                              alignItems: 'center', 
                              px: 0.5,
                              bgcolor: '#F8F9FA'
                            }}>
                              <Typography sx={{ fontSize: '0.65rem', color: '#000000', fontWeight: 500 }}>
                                {selectedPWD.firstName} {selectedPWD.lastName}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Disability Type Field */}
                          <Box>
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#000000', mb: 0.2 }}>TYPE OF DISABILITY</Typography>
                            <Box sx={{ 
                              borderBottom: '1px solid #000000', 
                              height: 18, 
                              display: 'flex', 
                              alignItems: 'center', 
                              px: 0.5,
                              bgcolor: '#F8F9FA'
                            }}>
                              <Typography sx={{ fontSize: '0.65rem', color: '#000000', fontWeight: 500 }}>
                                {selectedPWD.disabilityType || 'Not specified'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Signature Field */}
                          <Box>
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#000000', mb: 0.2 }}>SIGNATURE</Typography>
                            <Box sx={{ 
                              borderBottom: '1px solid #000000', 
                              height: 18, 
                              bgcolor: '#F8F9FA'
                            }} />
                          </Box>
                          
                          {/* Philippine Flag */}
                          <Box sx={{ mt: 0.3 }}>
                            <Box sx={{
                              width: 20, height: 12,
                              background: 'linear-gradient(to bottom, #0038A8 0%, #0038A8 33%, #FFFFFF 33%, #FFFFFF 66%, #CE1126 66%, #CE1126 100%)',
                              border: '0.5px solid #000000',
                              position: 'relative'
                            }}>
                              <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(45deg, transparent 40%, #FCD116 40%, #FCD116 60%, transparent 60%)',
                                backgroundSize: '4px 4px'
                              }} />
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Right side - ID Number and Photo */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {/* ID Number */}
                          <Box>
                            <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: '#000000', mb: 0.2 }}>ID No.</Typography>
                            <Box sx={{ 
                              borderBottom: '1px solid #000000', 
                              height: 16, 
                              display: 'flex', 
                              alignItems: 'center', 
                              px: 0.5,
                              bgcolor: '#F8F9FA'
                            }}>
                              <Typography sx={{ fontSize: '0.6rem', color: '#000000', fontWeight: 600 }}>
                                {selectedPWD.pwd_id || `PWD-${selectedPWD.userID}` || 'Not assigned'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Photo Placeholder */}
                          <Box sx={{
                            width: 60, height: 70,
                            border: '1px solid #000000',
                            bgcolor: '#E0E0E0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}>
                            {/* X pattern for photo placeholder */}
                            <Box sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '1px',
                                height: '70%',
                                background: '#999999',
                                transform: 'translate(-50%, -50%) rotate(45deg)'
                              },
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '1px',
                                height: '70%',
                                background: '#999999',
                                transform: 'translate(-50%, -50%) rotate(-45deg)'
                              }
                            }} />
                            <Typography sx={{ fontSize: '0.4rem', color: '#999999', fontWeight: 500, textAlign: 'center' }}>
                              PHOTO
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      {/* Bottom Section - Validity */}
                      <Box sx={{ mt: 1, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#000000' }}>
                          VALID ANYWHERE IN THE PHILIPPINES
                        </Typography>
                      </Box>
                   </Box>
                </Paper>

                {/* PWD Information */}
                <Paper elevation={0} sx={{
                  p: 3,
                  border: '1px solid #E0E0E0',
                  borderRadius: 4,
                  bgcolor: '#FFFFFF',
                  height: '500px', // Fixed height
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                     <Avatar sx={{ width: 56, height: 56, bgcolor: '#E8F0FE', mb: 1 }}>
                       <PersonIcon sx={{ fontSize: 32, color: '#1976D2' }} />
                     </Avatar>
                    <Typography sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '1.2rem' }}>
                      PWD Information - {barangay}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 2, 
                    flex: 1, 
                    overflow: 'auto',
                    pr: 1, // Add padding for scrollbar
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
                      <Typography sx={{ fontSize: '0.8rem', color: '#7F8C8D', mb: 0.5, fontWeight: 600 }}>Name</Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField 
                            fullWidth 
                            size="small" 
                            value={selectedPWD.lastName || ''} 
                            placeholder="Last Name"
                            InputProps={{ 
                              readOnly: true, 
                              sx: {
                                bgcolor: '#F8FAFC', 
                                color: '#000',
                                '& .MuiInputBase-input': {
                                  fontSize: '0.8rem'
                                }
                              } 
                            }} 
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField 
                            fullWidth 
                            size="small" 
                            value={selectedPWD.firstName || ''} 
                            placeholder="First Name"
                            InputProps={{ 
                              readOnly: true, 
                              sx: {
                                bgcolor: '#F8FAFC', 
                                color: '#000',
                                '& .MuiInputBase-input': {
                                  fontSize: '0.8rem'
                                }
                              } 
                            }} 
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField 
                            fullWidth 
                            size="small" 
                            value={selectedPWD.middleName || ''} 
                            placeholder="Middle Name"
                            InputProps={{ 
                              readOnly: true, 
                              sx: {
                                bgcolor: '#F8FAFC', 
                                color: '#000',
                                '& .MuiInputBase-input': {
                                  fontSize: '0.8rem'
                                }
                              } 
                            }} 
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField 
                            fullWidth 
                            size="small" 
                            value={selectedPWD.suffix || ''} 
                            placeholder="Suffix"
                            InputProps={{ 
                              readOnly: true, 
                              sx: {
                                bgcolor: '#F8FAFC', 
                                color: '#000',
                                '& .MuiInputBase-input': {
                                  fontSize: '0.8rem'
                                }
                              } 
                            }} 
                          />
                        </Grid>
                      </Grid>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.8rem', color: '#7F8C8D', mb: 0.5, fontWeight: 600 }}>Address</Typography>
                      <TextField 
                        fullWidth 
                        size="small" 
                        value={selectedPWD.address || 'Not provided'} 
                        placeholder="Complete Address"
                        InputProps={{ 
                          readOnly: true, 
                          sx: {
                            bgcolor: '#F8FAFC', 
                            color: '#000',
                            '& .MuiInputBase-input': {
                              fontSize: '0.8rem'
                            }
                          } 
                        }}
                      />
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#7F8C8D', mb: 0.5, fontWeight: 600 }}>Contact #</Typography>
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={selectedPWD.contactNumber || 'Not provided'} 
                          placeholder="Contact Number"
                          InputProps={{ 
                            readOnly: true, 
                            sx: {
                              bgcolor: '#F8FAFC', 
                              color: '#000',
                              '& .MuiInputBase-input': {
                                fontSize: '0.8rem'
                              }
                            } 
                          }} 
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#7F8C8D', mb: 0.5, fontWeight: 600 }}>Sex</Typography>
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={selectedPWD.gender || 'Not specified'} 
                          placeholder="Sex"
                          InputProps={{ 
                            readOnly: true, 
                            sx: {
                              bgcolor: '#F8FAFC', 
                              color: '#000',
                              '& .MuiInputBase-input': {
                                fontSize: '0.8rem'
                              }
                            } 
                          }} 
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#7F8C8D', mb: 0.5, fontWeight: 600 }}>Blood Type</Typography>
                        <TextField 
                          fullWidth 
                          size="small" 
                          value={selectedPWD.blood_type || 'Not specified'} 
                          placeholder="Blood Type"
                          InputProps={{ 
                            readOnly: true, 
                            sx: {
                              bgcolor: '#F8FAFC', 
                              color: '#000',
                              '& .MuiInputBase-input': {
                                fontSize: '0.8rem'
                              }
                            } 
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default BarangayPresidentPWDCard;
