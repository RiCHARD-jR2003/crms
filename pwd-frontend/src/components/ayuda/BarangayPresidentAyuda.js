import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  VolunteerActivism,
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Schedule,
  Warning,
  AttachMoney,
  People,
  LocalShipping,
  Print,
  PendingActions,
  Upload,
  Description,
  Approval,
  PictureAsPdf,
  Menu as MenuIcon
} from '@mui/icons-material';
import BarangayPresidentSidebar from '../shared/BarangayPresidentSidebar';
import { useAuth } from '../../contexts/AuthContext';
import benefitService from '../../services/benefitService';
import { reportsService } from '../../services/reportsService';

function BarangayPresidentAyuda() {
  const { currentUser } = useAuth();
  const barangay = currentUser?.barangay || 'Barangay Poblacion';
  
  const [benefits, setBenefits] = useState([]);
  const [benefitClaims, setBenefitClaims] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDistributed: 0,
    totalRecipients: 0,
    pendingDistribution: 0,
    activePrograms: 0
  });

  useEffect(() => {
    loadBenefitsData();
  }, [barangay]);

  const loadBenefitsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load benefits data
      const benefitsData = await benefitService.getAll();
      
      // Filter benefits for this barangay
      const filteredBenefits = benefitsData.filter(benefit => {
        // Check if benefit is for this barangay or all barangays
        if (benefit.barangay === 'All' || benefit.barangay === barangay) {
          return true;
        }
        // Check if benefit has selectedBarangays array and includes this barangay
        if (benefit.selectedBarangays && Array.isArray(benefit.selectedBarangays)) {
          return benefit.selectedBarangays.includes(barangay);
        }
        return false;
      });
      
      setBenefits(filteredBenefits);
      
      // Load benefit distribution data for this barangay
      const distributionData = await reportsService.getBenefitDistribution(barangay);
      
      // Calculate statistics
      const totalDistributed = filteredBenefits.reduce((sum, benefit) => {
        const amount = benefit.amount ? benefit.amount.replace(/[₱,]/g, '') : '0';
        return sum + (parseInt(amount) || 0);
      }, 0);
      
      const totalRecipients = filteredBenefits.reduce((sum, benefit) => sum + (benefit.distributed || 0), 0);
      const pendingDistribution = filteredBenefits.reduce((sum, benefit) => sum + (benefit.pending || 0), 0);
      const activePrograms = filteredBenefits.filter(benefit => benefit.status === 'Active').length;
      
      setStats({
        totalDistributed,
        totalRecipients,
        pendingDistribution,
        activePrograms
      });
      
      // Load benefit claims for this barangay
      const claimsData = distributionData.recent || [];
      setBenefitClaims(claimsData);
      
    } catch (error) {
      console.error('Error loading benefits data:', error);
      setError('Failed to load benefits data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
      case 'Inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
      case 'Active':
        return <CheckCircle />;
      case 'Pending':
        return <Schedule />;
      case 'Cancelled':
      case 'Inactive':
        return <Warning />;
      default:
        return <Schedule />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F7FC' }}>
        <BarangayPresidentSidebar />
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ml: '280px',
          width: 'calc(100% - 280px)'
        }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F7FC' }}>
        <BarangayPresidentSidebar />
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ml: '280px',
          width: 'calc(100% - 280px)',
          p: 3
        }}>
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'white' }}>
      <BarangayPresidentSidebar />
      
      <Box sx={{ 
        flex: 1, 
        ml: '280px', 
        width: 'calc(100% - 280px)', 
        p: 3, 
        bgcolor: 'white'
      }}>

        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: '1px solid #E0E0E0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 700, 
              color: '#2C3E50',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
            }}>
              Ayuda & Benefits Management - {barangay}
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: '#2C3E50',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem'
                },
                '& .Mui-selected': {
                  color: '#27AE60'
                },
                '& .MuiTabs-indicator': {
                  bgcolor: '#27AE60'
                }
              }}
            >
              <Tab 
                label={`Active Benefits (${benefits.length})`} 
                icon={<VolunteerActivism />}
                iconPosition="start"
              />
              <Tab 
                label={`Distribution History (${benefitClaims.length})`} 
                icon={<LocalShipping />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {activeTab === 0 ? (
            /* Active Benefits Tab */
            <>
              {/* Summary Cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ 
                    border: '1px solid #E0E0E0', 
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <AttachMoney sx={{ fontSize: 40, color: '#27AE60', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                        ₱{stats.totalDistributed.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500 }}>
                        Total Distributed
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ 
                    border: '1px solid #E0E0E0', 
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <People sx={{ fontSize: 40, color: '#3498DB', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                        {stats.totalRecipients}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500 }}>
                        Total Recipients
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ 
                    border: '1px solid #E0E0E0', 
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <LocalShipping sx={{ fontSize: 40, color: '#F39C12', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                        {stats.pendingDistribution}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500 }}>
                        Pending Distribution
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ 
                    border: '1px solid #E0E0E0', 
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <VolunteerActivism sx={{ fontSize: 40, color: '#9B59B6', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                        {stats.activePrograms}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500 }}>
                        Active Programs
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Benefits Cards */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50', fontSize: '1.2rem' }}>
                Available Benefits Programs - {barangay}
              </Typography>
              {benefits.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6, 
                  bgcolor: '#F8F9FA', 
                  borderRadius: 2, 
                  border: '2px dashed #E0E0E0' 
                }}>
                  <VolunteerActivism sx={{ fontSize: 60, color: '#BDC3C7', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#7F8C8D', mb: 1, fontWeight: 600 }}>
                    No Benefits Programs Available
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#95A5A6', mb: 3 }}>
                    No benefits programs are currently available for {barangay}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {benefits.map((benefit) => (
                    <Grid item xs={12} sm={6} md={4} key={benefit.id}>
                      <Card 
                        elevation={0} 
                        sx={{ 
                          border: '1px solid #E0E0E0',
                          borderRadius: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          bgcolor: 'white',
                          '&:hover': { 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transform: 'translateY(-2px)',
                            transition: 'all 0.3s ease'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Chip 
                              label={benefit.type} 
                              size="small" 
                              sx={{ 
                                bgcolor: `${benefit.color || '#3498DB'}15`, 
                                color: benefit.color || '#3498DB',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1, color: '#2C3E50', fontSize: '1rem' }}>
                            {benefit.title || benefit.benefitType || benefit.type}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                            {benefit.amount}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2C3E50', mb: 2, lineHeight: 1.5 }}>
                            {benefit.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#2C3E50', display: 'block', mb: 1, fontWeight: 500 }}>
                            Barangay: {benefit.barangay || 'All Barangays'}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#27AE60', fontWeight: 600 }}>
                                Distributed: {benefit.distributed || 0}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#F39C12', fontWeight: 600 }}>
                                Pending: {benefit.pending || 0}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Status */}
                          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                            <Typography variant="caption" sx={{ color: '#2C3E50', fontWeight: 600, mb: 1, display: 'block' }}>
                              Status:
                            </Typography>
                            <Chip 
                              label={benefit.status || 'Active'} 
                              size="small" 
                              color={benefit.status === 'Active' ? 'success' : 'default'}
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          ) : (
            /* Distribution History Tab */
            <>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50', fontSize: '1.2rem' }}>
                Recent Distribution History - {barangay}
              </Typography>
              {benefitClaims.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  bgcolor: '#F8F9FA', 
                  borderRadius: 2, 
                  border: '2px dashed #E0E0E0' 
                }}>
                  <LocalShipping sx={{ fontSize: 40, color: '#BDC3C7', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#7F8C8D', mb: 1, fontWeight: 600 }}>
                    No Distribution History
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#95A5A6' }}>
                    Distribution records will appear here once benefits are distributed in {barangay}
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E0E0E0', borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.9rem' }}>Benefit</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.9rem' }}>Recipient</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.9rem' }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.9rem' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.9rem' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.9rem' }}>Barangay</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {benefitClaims.map((claim, index) => (
                        <TableRow key={claim.id || index} sx={{ bgcolor: index % 2 ? '#F8FAFC' : '#FFFFFF' }}>
                          <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{claim.benefitName || claim.benefit}</TableCell>
                          <TableCell sx={{ color: '#2C3E50' }}>{claim.recipient || claim.memberName}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#27AE60' }}>{claim.amount}</TableCell>
                          <TableCell sx={{ color: '#2C3E50' }}>{claim.date || claim.created_at}</TableCell>
                          <TableCell>
                            <Chip 
                              icon={getStatusIcon(claim.status)}
                              label={claim.status} 
                              color={getStatusColor(claim.status)} 
                              size="small" 
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#2C3E50' }}>{claim.barangay || barangay}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default BarangayPresidentAyuda;
