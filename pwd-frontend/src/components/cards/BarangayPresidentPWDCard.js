import React, { useState, useEffect, useMemo } from 'react';
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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
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
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');

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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredData = useMemo(() => {
    const filtered = pwdData.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Apply sorting
    if (orderBy) {
      filtered.sort((a, b) => {
        let aValue = a[orderBy];
        let bValue = b[orderBy];
        
        // Handle nested properties
        if (orderBy === 'pwd_id') {
          aValue = a.pwd_id || `PWD-${a.userID}` || '';
          bValue = b.pwd_id || `PWD-${b.userID}` || '';
        } else if (orderBy === 'name') {
          const aName = [a.firstName, a.middleName, a.lastName, a.suffix].filter(Boolean).join(' ');
          const bName = [b.firstName, b.middleName, b.lastName, b.suffix].filter(Boolean).join(' ');
          aValue = aName;
          bValue = bName;
        } else if (orderBy === 'age') {
          aValue = a.birthDate ? getAgeFromBirthDate(a.birthDate) : 0;
          bValue = b.birthDate ? getAgeFromBirthDate(b.birthDate) : 0;
          // Convert to number if possible
          aValue = parseInt(aValue) || 0;
          bValue = parseInt(bValue) || 0;
        }
        
        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return order === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [pwdData, searchTerm, orderBy, order]);

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
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#F4F7FC', overflow: 'hidden', maxHeight: '100vh' }}>
      <BarangayPresidentSidebar />
      
      {/* --- Main Content --- */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        ml: '280px',
        width: 'calc(100% - 280px)',
        height: '100vh',
        overflow: 'hidden',
        maxHeight: '100vh'
      }}>
        {/* Top Bar */}
        <Box sx={{
          bgcolor: '#FFFFFF',
          p: 1.5,
          borderBottom: '1px solid #E0E0E0',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0,
          zIndex: 10,
          height: '64px',
          minHeight: '64px',
          maxHeight: '64px'
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
        <Box sx={{ flex: 1, p: 2, bgcolor: '#F4F7FC', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, maxHeight: 'calc(100vh - 80px)' }}>
          <Grid container spacing={2} sx={{ height: '100%', flex: 1, overflow: 'hidden', minHeight: 0, maxHeight: '100%' }}>
            {/* Left Section - PWD Masterlist (Full Height) */}
            <Grid item xs={12} lg={8} sx={{ height: '100%', maxHeight: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
              <Paper elevation={0} sx={{
                p: 2,
                border: '1px solid #E0E0E0',
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                height: '100%',
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <Typography sx={{ fontWeight: 700, mb: 1.5, color: '#193a52', fontSize: '1.1rem', flexShrink: 0 }}>
                  PWD MASTERLIST - {barangay}
                </Typography>

                <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0, maxHeight: '100%', display: 'flex', flexDirection: 'column' }}>
                  <TableContainer sx={{ 
                    flex: 1,
                    overflow: 'auto',
                    minHeight: 0,
                    maxHeight: '100%',
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#c1c1c1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#a8a8a8',
                    }
                  }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'white', borderBottom: '2px solid #E0E0E0' }}>
                          <TableCell padding="checkbox" sx={{ bgcolor: 'white' }}>
                            {/* Remove checkbox header since we're using radio buttons */}
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              color: '#0b87ac', 
                              fontWeight: 700, 
                              fontSize: '0.85rem', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.5px', 
                              py: 2, 
                              px: 2,
                              bgcolor: 'white',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': { bgcolor: '#F0F0F0' }
                            }}
                            onClick={() => handleRequestSort('pwd_id')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              PWD ID NO.
                              <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                                <ArrowUpwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'pwd_id' && order === 'asc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'pwd_id' && order === 'asc' ? 1 : 0.3 }} />
                                <ArrowDownwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'pwd_id' && order === 'desc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'pwd_id' && order === 'desc' ? 1 : 0.3, mt: '-4px' }} />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              color: '#0b87ac', 
                              fontWeight: 700, 
                              fontSize: '0.85rem', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.5px', 
                              py: 2, 
                              px: 2,
                              bgcolor: 'white',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': { bgcolor: '#F0F0F0' }
                            }}
                            onClick={() => handleRequestSort('name')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              NAME
                              <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                                <ArrowUpwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'name' && order === 'asc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'name' && order === 'asc' ? 1 : 0.3 }} />
                                <ArrowDownwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'name' && order === 'desc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'name' && order === 'desc' ? 1 : 0.3, mt: '-4px' }} />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              color: '#0b87ac', 
                              fontWeight: 700, 
                              fontSize: '0.85rem', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.5px', 
                              py: 2, 
                              px: 2,
                              bgcolor: 'white',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': { bgcolor: '#F0F0F0' }
                            }}
                            onClick={() => handleRequestSort('age')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              AGE
                              <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                                <ArrowUpwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'age' && order === 'asc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'age' && order === 'asc' ? 1 : 0.3 }} />
                                <ArrowDownwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'age' && order === 'desc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'age' && order === 'desc' ? 1 : 0.3, mt: '-4px' }} />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              color: '#0b87ac', 
                              fontWeight: 700, 
                              fontSize: '0.85rem', 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.5px', 
                              py: 2, 
                              px: 2,
                              bgcolor: 'white',
                              cursor: 'pointer',
                              userSelect: 'none',
                              '&:hover': { bgcolor: '#F0F0F0' }
                            }}
                            onClick={() => handleRequestSort('barangay')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              BARANGAY
                              <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                                <ArrowUpwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'barangay' && order === 'asc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'barangay' && order === 'asc' ? 1 : 0.3 }} />
                                <ArrowDownwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'barangay' && order === 'desc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'barangay' && order === 'desc' ? 1 : 0.3, mt: '-4px' }} />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ 
                            color: '#0b87ac', 
                            fontWeight: 700, 
                            fontSize: '0.85rem', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.5px', 
                            py: 2, 
                            px: 2,
                            bgcolor: 'white'
                          }}>
                            STATUS
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                         {filteredData.map((row, index) => (
                           <TableRow key={row.userID} sx={{
                             bgcolor: selectedRow === row.userID ? '#E8F4FD' : (index % 2 ? '#F7FBFF' : 'white'),
                             borderBottom: '1px solid #E0E0E0'
                           }}>
                            <TableCell padding="checkbox" sx={{ py: 2, px: 2 }}>
                              <Radio
                                color="primary"
                                size="small"
                                checked={selectedRow === row.userID}
                                onChange={() => handleRowSelect(row.userID)}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#1976D2', fontSize: '0.8rem', py: 2, px: 2 }}>{row.pwd_id || `PWD-${row.userID}` || 'Not assigned'}</TableCell>
                            <TableCell sx={{ color: '#0b87ac', fontWeight: 500, fontSize: '0.8rem', py: 2, px: 2 }}>
                              {(() => {
                                const parts = [];
                                if (row.firstName) parts.push(row.firstName);
                                if (row.middleName && row.middleName.trim().toUpperCase() !== 'N/A') parts.push(row.middleName);
                                if (row.lastName) parts.push(row.lastName);
                                if (row.suffix) parts.push(row.suffix);
                                return parts.join(' ').trim() || 'Name not provided';
                              })()}
                            </TableCell>
                            <TableCell sx={{ color: '#34495E', fontWeight: 600, fontSize: '0.8rem', py: 2, px: 2 }}>
                              {row.birthDate ? getAgeFromBirthDate(row.birthDate) : 'N/A'}
                            </TableCell>
                            <TableCell sx={{ color: '#0b87ac', fontWeight: 500, fontSize: '0.8rem', py: 2, px: 2 }}>{row.barangay || 'Not specified'}</TableCell>
                            <TableCell sx={{ py: 2, px: 2 }}>{getStatusChip(row.status || 'Active')}</TableCell>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflow: 'hidden', minHeight: 0 }}>
                {/* PWD Card Preview */}
                <Paper elevation={0} sx={{
                  p: 1.5,
                  border: '1px solid #E0E0E0',
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  flex: '0 1 auto',
                  minHeight: '280px',
                  maxHeight: '45%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    justifyContent: 'space-between',
                    color: '#000000',
                    position: 'relative',
                    borderRadius: 2,
                    border: '2px solid #E0E0E0',
                    p: 1.5,
                    flex: 1,
                    width: '100%',
                    minHeight: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    overflow: 'auto',
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
                    {/* Left Side - Header and Member Details */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      flex: 1,
                      pr: 2
                    }}>
                      {/* Card Header */}
                      <Box sx={{ textAlign: 'center', mb: 1, flexShrink: 0 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          mb: 0.2, 
                          fontSize: '9px', 
                          color: '#000000',
                          letterSpacing: '0.2px',
                          lineHeight: 1.2
                        }}>
                          REPUBLIC OF THE PHILIPPINES
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          mb: 0.2, 
                          fontSize: '9px', 
                          color: '#000000',
                          letterSpacing: '0.2px',
                          lineHeight: 1.2
                        }}>
                          PROVINCE OF LAGUNA
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          mb: 0.2, 
                          fontSize: '9px', 
                          color: '#000000',
                          letterSpacing: '0.2px',
                          lineHeight: 1.2
                        }}>
                          CITY OF CABUYAO
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '9px', 
                          color: '#000000',
                          letterSpacing: '0.2px',
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
                        mb: 1,
                        flexShrink: 0
                      }}>
                        <Box sx={{
                          backgroundColor: '#F8F9FA',
                          borderRadius: 0.5,
                          px: 1,
                          py: 0.4,
                          border: '1px solid #E0E0E0'
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: '#000000', 
                            fontSize: '8px', 
                            fontWeight: 'bold',
                            letterSpacing: '0.2px'
                          }}>
                            CABUYAO PDAO
                          </Typography>
                        </Box>
                      </Box>

                      {/* Member Details */}
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 0 }}>
                        <Box>
                          <Typography variant="body2" sx={{ 
                            mb: 0.3, 
                            fontSize: '8px', 
                            color: '#000000', 
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2px',
                            lineHeight: 1.3
                          }}>
                            NAME: {(() => {
                              const parts = [];
                              if (selectedPWD.firstName) parts.push(selectedPWD.firstName);
                              if (selectedPWD.middleName && selectedPWD.middleName.trim().toUpperCase() !== 'N/A') parts.push(selectedPWD.middleName);
                              if (selectedPWD.lastName) parts.push(selectedPWD.lastName);
                              if (selectedPWD.suffix) parts.push(selectedPWD.suffix);
                              return parts.join(' ');
                            })()}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            mb: 0.3, 
                            fontSize: '8px', 
                            color: '#000000', 
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2px',
                            lineHeight: 1.3
                          }}>
                            ID No.: {selectedPWD.pwd_id || `PWD-${selectedPWD.userID}` || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            mb: 0.3, 
                            fontSize: '8px', 
                            color: '#000000', 
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2px',
                            lineHeight: 1.3
                          }}>
                            TYPE OF DISABILITY: {selectedPWD.disabilityType || 'Not specified'}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            fontSize: '8px', 
                            color: '#000000', 
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2px',
                            lineHeight: 1.3
                          }}>
                            SIGNATURE: _________ 
                          </Typography>
                        </Box>

                        {/* Card Footer */}
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '7px', 
                          color: '#000000',
                          textAlign: 'center',
                          letterSpacing: '0.2px',
                          textTransform: 'uppercase',
                          mt: 0.5,
                          flexShrink: 0
                        }}>
                          VALID ANYWHERE IN THE PHILIPPINES
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right Side - Photo and QR Code */}
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      flexShrink: 0,
                      pl: 1
                    }}>
                      {/* ID Picture */}
                      <Box sx={{
                        width: 60,
                        height: 60,
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
                          fontSize: '7px',
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
                        p: 0.8,
                        border: '1px solid #E0E0E0'
                      }}>
                        <Box sx={{
                          width: '45px',
                          height: '45px',
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
                          fontSize: '6px',
                          fontWeight: 'bold',
                          mt: 0.3
                        }}>
                          PH
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* PWD Information */}
                <Paper elevation={0} sx={{
                  p: 2,
                  border: '1px solid #E0E0E0',
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  flex: '1 1 0',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1, flexShrink: 0 }}>
                     <Avatar sx={{ width: 40, height: 40, bgcolor: '#E8F0FE', mb: 0.5 }}>
                       <PersonIcon sx={{ fontSize: 24, color: '#1976D2' }} />
                     </Avatar>
                    <Typography sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.9rem' }}>
                      PWD Information - {barangay}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1.5, 
                    flex: 1, 
                    overflow: 'auto',
                    pr: 1,
                    minHeight: 0,
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
                    <Box sx={{ flexShrink: 0 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#7F8C8D', mb: 0.5, fontWeight: 600 }}>Name</Typography>
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
                    <Box sx={{ flexShrink: 0 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#7F8C8D', mb: 0.5, fontWeight: 600 }}>Address</Typography>
                      <TextField 
                        fullWidth 
                        size="small" 
                        value={selectedPWD.address || 'Not provided'} 
                        placeholder="Home Number/Street"
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
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#7F8C8D', mb: 0.5, fontWeight: 600 }}>Contact #</Typography>
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
                        <Typography sx={{ fontSize: '0.75rem', color: '#7F8C8D', mb: 0.5, fontWeight: 600 }}>Sex</Typography>
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
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#7F8C8D', mb: 0.5, fontWeight: 600 }}>Blood Type</Typography>
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
