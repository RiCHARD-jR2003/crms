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
        const response = await api.get('/pwd-members');
        console.log('API Response:', response);
        const members = response.data || response.members || [];
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
            variant="outlined"
            sx={{
              bgcolor: '#FFFFFF',
              color: '#193a52',
              borderColor: '#193a52',
              textTransform: 'none',
              fontWeight: 600,
              px: 4, py: 1,
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': { 
                bgcolor: '#F8F9FA',
                borderColor: '#193a52',
                color: '#193a52'
              }
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
                              {`${row.firstName || ''} ${row.middleName || ''} ${row.lastName || ''} ${row.suffix || ''}`.trim() || 'Name not provided'}
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
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#000000',
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
                      <Box sx={{ textAlign: 'center', mb: 1.5 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          mb: 0.3, 
                          fontSize: '10px', 
                          color: '#000000',
                          letterSpacing: '0.3px'
                        }}>
                          REPUBLIC OF THE PHILIPPINES
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          mb: 0.3, 
                          fontSize: '10px', 
                          color: '#000000',
                          letterSpacing: '0.3px'
                        }}>
                          PROVINCE OF LAGUNA
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          mb: 0.3, 
                          fontSize: '10px', 
                          color: '#000000',
                          letterSpacing: '0.3px'
                        }}>
                          CITY OF CABUYAO
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '10px', 
                          color: '#000000',
                          letterSpacing: '0.3px'
                        }}>
                          (P.D.A.O)
                        </Typography>
                      </Box>

                      {/* Logo Section */}
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1.5
                      }}>
                        <Box sx={{
                          backgroundColor: '#F8F9FA',
                          borderRadius: 0.5,
                          px: 1.5,
                          py: 0.5,
                          border: '1px solid #E0E0E0'
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: '#000000', 
                            fontSize: '9px', 
                            fontWeight: 'bold',
                            letterSpacing: '0.3px'
                          }}>
                            CABUYAO PDAO
                          </Typography>
                        </Box>
                      </Box>

                      {/* Member Details */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ 
                          mb: 0.5, 
                          fontSize: '9px', 
                          color: '#000000', 
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px'
                        }}>
                          NAME: {selectedPWD.firstName} {selectedPWD.middleName || ''} {selectedPWD.lastName} {selectedPWD.suffix || ''}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          mb: 0.5, 
                          fontSize: '9px', 
                          color: '#000000', 
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px'
                        }}>
                          ID No.: {selectedPWD.pwd_id || `PWD-${selectedPWD.userID}` || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          mb: 0.5, 
                          fontSize: '9px', 
                          color: '#000000', 
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px'
                        }}>
                          TYPE OF DISABILITY: {selectedPWD.disabilityType || 'Not specified'}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontSize: '9px', 
                          color: '#000000', 
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px'
                        }}>
                          SIGNATURE: _________
                        </Typography>
                      </Box>

                      {/* Card Footer */}
                      <Typography variant="body2" sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '8px', 
                        color: '#000000',
                        textAlign: 'center',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                        mt: 1
                      }}>
                        VALID ANYWHERE IN THE PHILIPPINES
                      </Typography>
                    </Box>

                    {/* Right Side - Photo and QR Code */}
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      flexShrink: 0
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
                        <Typography variant="caption" sx={{ 
                          color: '#BDC3C7', 
                          fontSize: '8px',
                          fontWeight: 'bold'
                        }}>
                          PHOTO
                        </Typography>
                      </Box>

                      {/* QR Code Placeholder */}
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 1,
                        p: 1,
                        border: '1px solid #E0E0E0'
                      }}>
                        <Box sx={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#F8F9FA',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #E0E0E0'
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: '#BDC3C7', 
                            fontSize: '6px',
                            fontWeight: 'bold'
                          }}>
                            QR
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ 
                          color: '#000000', 
                          fontSize: '7px',
                          fontWeight: 'bold',
                          mt: 0.5
                        }}>
                          PH
                        </Typography>
                      </Box>
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
