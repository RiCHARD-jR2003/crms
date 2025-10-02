import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Assessment,
  Download,
  Print,
  FilterList,
  Visibility,
  TrendingUp,
  People,
  CreditCard,
  VolunteerActivism,
  CalendarToday,
  LocationOn,
  Accessibility,
  Timeline,
  Badge,
  Description,
  Report,
  CheckCircle,
  Warning,
  Lightbulb,
  Close,
  Menu as MenuIcon,
  AutoFixHigh,
  Psychology
} from '@mui/icons-material';
import BarangayPresidentSidebar from '../shared/BarangayPresidentSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { reportsService } from '../../services/reportsService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  mainContainerStyles, 
  contentAreaStyles, 
  headerStyles, 
  titleStyles, 
  cardStyles,
  dialogStyles,
  dialogTitleStyles,
  dialogContentStyles,
  dialogActionsStyles,
  buttonStyles,
  textFieldStyles,
  tableStyles
} from '../../utils/themeStyles';

function BarangayPresidentReports() {
  const { currentUser } = useAuth();
  const barangay = currentUser?.barangay || 'Barangay Poblacion';
  
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState(null);
  const [barangayStats, setBarangayStats] = useState({
    total_pwd_members: 0,
    total_applications: 0,
    pending_applications: 0,
    approved_applications: 0
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  
  // PWD Registration Report Data
  const [pwdRegistrationData, setPwdRegistrationData] = useState({
    totalRegistrations: 0,
    monthlyTrends: [],
    disabilityTypeDistribution: [],
    ageGroupDistribution: [],
    recentRegistrations: []
  });

  // Card Distribution Report Data
  const [cardDistributionData, setCardDistributionData] = useState({
    totalCardsIssued: 0,
    totalCardsPending: 0,
    monthlyCardTrends: [],
    cardStatusDistribution: [],
    recentCardIssuances: [],
    averageProcessingTime: 0
  });

  // Benefits Distribution Report Data
  const [benefitsDistributionData, setBenefitsDistributionData] = useState({
    totalBenefitsDistributed: 0,
    monthlyBenefitTrends: [],
    benefitTypeDistribution: [],
    recentBenefitDistributions: []
  });

  // Complaints Analysis Report Data
  const [complaintsAnalysisData, setComplaintsAnalysisData] = useState({
    totalComplaints: 0,
    monthlyComplaintTrends: [],
    complaintTypeDistribution: [],
    resolutionTimeDistribution: [],
    recentComplaints: []
  });

  useEffect(() => {
    loadStats();
    loadReportData();
  }, [barangay]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getBarangayStats(barangay);
      setBarangayStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load statistics',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = async () => {
    try {
      // Load PWD Registration Data
      const pwdData = await reportsService.getPWDMasterlist(barangay);
      setPwdRegistrationData({
        totalRegistrations: pwdData.length,
        monthlyTrends: [], // Will be populated from API
        disabilityTypeDistribution: [], // Will be populated from API
        ageGroupDistribution: [], // Will be populated from API
        recentRegistrations: pwdData.slice(0, 10)
      });

      // Load Application Status Data
      const appData = await reportsService.getApplicationStatusReport(barangay);
      setBarangayStats(prev => ({
        ...prev,
        total_applications: appData.total || 0,
        pending_applications: appData.pending || 0,
        approved_applications: appData.approved || 0
      }));

      // Load Disability Distribution Data
      const disabilityData = await reportsService.getDisabilityDistribution(barangay);
      setPwdRegistrationData(prev => ({
        ...prev,
        disabilityTypeDistribution: disabilityData
      }));

      // Load Age Group Analysis Data
      const ageData = await reportsService.getAgeGroupAnalysis(barangay);
      setPwdRegistrationData(prev => ({
        ...prev,
        ageGroupDistribution: ageData
      }));

      // Load Benefits Distribution Data
      const benefitsData = await reportsService.getBenefitDistribution(barangay);
      setBenefitsDistributionData({
        totalBenefitsDistributed: benefitsData.total || 0,
        monthlyBenefitTrends: benefitsData.monthlyTrends || [],
        benefitTypeDistribution: benefitsData.types || [],
        recentBenefitDistributions: benefitsData.recent || []
      });

      // Load Monthly Activity Data
      const activityData = await reportsService.getMonthlyActivitySummary(barangay);
      setCardDistributionData(prev => ({
        ...prev,
        monthlyCardTrends: activityData.cardTrends || [],
        recentCardIssuances: activityData.recentCards || []
      }));

    } catch (error) {
      console.error('Error loading report data:', error);
    }
  };

  const reports = [
    {
      id: 1,
      title: 'PWD Registration Report',
      description: `Monthly registration statistics and trends for ${barangay}`,
      icon: <People />,
      color: '#3498DB',
      lastUpdated: '2025-01-15',
      status: 'Available',
      reportType: 'registration'
    },
    {
      id: 2,
      title: 'Card Distribution Report',
      description: `PWD card issuance and distribution data for ${barangay}`,
      icon: <CreditCard />,
      color: '#27AE60',
      lastUpdated: '2025-01-14',
      status: 'Available',
      reportType: 'cards'
    },
    {
      id: 3,
      title: 'Benefits Distribution Report',
      description: `Ayuda and benefits distribution statistics for ${barangay}`,
      icon: <VolunteerActivism />,
      color: '#E74C3C',
      lastUpdated: '2025-01-13',
      status: 'Available',
      reportType: 'benefits'
    },
    {
      id: 4,
      title: 'Complaints Analysis Report',
      description: `Feedback and complaints analysis for ${barangay}`,
      icon: <Assessment />,
      color: '#F39C12',
      lastUpdated: '2025-01-12',
      status: 'Available',
      reportType: 'complaints'
    },
    {
      id: 5,
      title: 'Monthly Activity Summary',
      description: `Monthly summary of activities and updates for ${barangay}`,
      icon: <Timeline />,
      color: '#9B59B6',
      lastUpdated: '2025-01-11',
      status: 'Available',
      reportType: 'activity'
    }
  ];

  const handleReportClick = (report) => {
    setSelectedReportData(report);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReportData(null);
  };

  const getStatusColor = (status) => {
    return status === 'Available' ? 'success' : 'warning';
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const renderPWDRegistrationReport = () => {
    const { totalRegistrations, monthlyTrends, disabilityTypeDistribution, ageGroupDistribution, recentRegistrations } = pwdRegistrationData;
    
    return (
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(52, 152, 219, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <People sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {totalRegistrations}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Registrations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(39, 174, 96, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <LocationOn sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {barangay}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Barangay
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Accessibility sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {disabilityTypeDistribution.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Disability Types
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(155, 89, 182, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Timeline sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {ageGroupDistribution.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Age Groups
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Registrations Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2C3E50' }}>
            Recent Registrations - {barangay}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Disability Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Age</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Registration Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentRegistrations.map((member, index) => (
                  <TableRow key={index}>
                    <TableCell>{member.firstName} {member.lastName}</TableCell>
                    <TableCell>
                      <Chip 
                        label={member.disabilityType} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{member.age || 'N/A'}</TableCell>
                    <TableCell>{member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={member.status || 'Active'} 
                        size="small" 
                        color={member.status === 'Active' ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    );
  };

  const renderCardDistributionReport = () => {
    const { 
      totalCardsIssued, 
      totalCardsPending, 
      monthlyCardTrends, 
      cardStatusDistribution, 
      recentCardIssuances, 
      averageProcessingTime 
    } = cardDistributionData;
    
    return (
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(39, 174, 96, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <CreditCard sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {totalCardsIssued}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Cards Issued
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(243, 156, 18, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Assessment sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {totalCardsPending}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Cards Pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(52, 152, 219, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Timeline sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {averageProcessingTime}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Avg. Processing Days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(155, 89, 182, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <LocationOn sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {barangay}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Barangay
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Card Status Distribution */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2C3E50' }}>
            Card Status Distribution - {barangay}
          </Typography>
          <Grid container spacing={2}>
            {cardStatusDistribution.map((status, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid #E0E0E0', 
                  borderRadius: 2, 
                  textAlign: 'center',
                  bgcolor: '#F8F9FA'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C3E50' }}>
                    {status.count || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                    {status.status || 'Unknown'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  };

  const renderBenefitsDistributionReport = () => {
    const { 
      totalBenefitsDistributed, 
      monthlyBenefitTrends, 
      benefitTypeDistribution, 
      recentBenefitDistributions 
    } = benefitsDistributionData;
    
    return (
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <VolunteerActivism sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {totalBenefitsDistributed}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Benefits
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(243, 156, 18, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <LocationOn sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {barangay}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Barangay
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(52, 152, 219, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Assessment sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {benefitTypeDistribution.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Benefit Types
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(39, 174, 96, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Timeline sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {monthlyBenefitTrends.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Monthly Trends
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Benefit Type Distribution */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2C3E50' }}>
            Benefit Type Distribution - {barangay}
          </Typography>
          <Grid container spacing={2}>
            {benefitTypeDistribution.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid #E0E0E0', 
                  borderRadius: 2, 
                  textAlign: 'center',
                  bgcolor: '#F8F9FA'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C3E50' }}>
                    {benefit.count || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                    {benefit.type || 'Unknown'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  };

  const renderComplaintsAnalysisReport = () => {
    const { 
      totalComplaints, 
      monthlyComplaintTrends, 
      complaintTypeDistribution, 
      resolutionTimeDistribution, 
      recentComplaints 
    } = complaintsAnalysisData;
    
    return (
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(243, 156, 18, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Assessment sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {totalComplaints}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Complaints
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <LocationOn sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {barangay}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Barangay
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(52, 152, 219, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Warning sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {complaintTypeDistribution.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Complaint Types
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(39, 174, 96, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {resolutionTimeDistribution.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Resolution Times
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Complaint Type Distribution */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2C3E50' }}>
            Complaint Type Distribution - {barangay}
          </Typography>
          <Grid container spacing={2}>
            {complaintTypeDistribution.map((complaint, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid #E0E0E0', 
                  borderRadius: 2, 
                  textAlign: 'center',
                  bgcolor: '#F8F9FA'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C3E50' }}>
                    {complaint.count || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                    {complaint.type || 'Unknown'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  };

  const renderMonthlyActivityReport = () => {
    return (
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(155, 89, 182, 0.3)',
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3, 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Timeline sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {barangayStats.total_pwd_members}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Total PWD Members
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(52, 152, 219, 0.3)',
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3, 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Assessment sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {barangayStats.total_applications}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Total Applications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(243, 156, 18, 0.3)',
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3, 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Warning sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {barangayStats.pending_applications}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Pending Applications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(39, 174, 96, 0.3)',
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: 3, 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {barangayStats.approved_applications}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Approved Applications
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Monthly Activity Summary */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2C3E50' }}>
            Monthly Activity Summary - {barangay}
          </Typography>
          <Box sx={{ 
            p: 3, 
            border: '1px solid #E0E0E0', 
            borderRadius: 2, 
            textAlign: 'center',
            bgcolor: '#F8F9FA'
          }}>
            <Typography variant="body1" sx={{ color: '#7F8C8D' }}>
              Monthly activity data will be displayed here once available from the API.
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };

  const ReportCard = ({ title, description, icon, color = '#3498DB', reportType }) => (
    <Paper elevation={0} sx={{
      p: 3,
      border: '1px solid #E0E0E0',
      borderRadius: 2,
      bgcolor: '#FFFFFF',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderColor: color
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}15`
        }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 24 } })}
        </Box>
        <Typography sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '1.1rem' }}>
          {title}
        </Typography>
      </Box>
      <Typography sx={{ color: '#7F8C8D', fontSize: '0.9rem', mb: 2, flex: 1 }}>
        {description}
      </Typography>
      <Button
        variant="outlined"
        startIcon={<Visibility />}
        onClick={() => handleReportClick({ title, description, icon, color, reportType })}
        sx={{
          color: color,
          borderColor: color,
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            borderColor: color,
            backgroundColor: `${color}08`
          }
        }}
      >
        View Report
      </Button>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F7FC' }}>
      <BarangayPresidentSidebar />
      
      {/* Main content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        ml: '280px',
        width: 'calc(100% - 280px)',
        p: 3
      }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '2rem', color: '#2C3E50', mb: 1 }}>
            Reports - {barangay}
          </Typography>
          <Typography sx={{ color: '#7F8C8D', fontSize: '1rem' }}>
            Generate and view reports for {barangay}
          </Typography>
        </Box>

        {/* Reports Grid */}
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} md={6} lg={4} key={report.id}>
              <ReportCard
                title={report.title}
                description={report.description}
                icon={report.icon}
                color={report.color}
                reportType={report.reportType}
              />
            </Grid>
          ))}
        </Grid>

        {/* Quick Stats */}
        <Box sx={{ mt: 4 }}>
          <Typography sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '1.3rem', mb: 2 }}>
            Quick Statistics - {barangay}
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{
                  p: 2,
                  border: '1px solid #E0E0E0',
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  textAlign: 'center'
                }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#27AE60' }}>
                    {barangayStats.total_pwd_members}
                  </Typography>
                  <Typography sx={{ color: '#7F8C8D', fontSize: '0.9rem' }}>Total PWD Members</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{
                  p: 2,
                  border: '1px solid #E0E0E0',
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  textAlign: 'center'
                }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#F39C12' }}>
                    {barangayStats.pending_applications}
                  </Typography>
                  <Typography sx={{ color: '#7F8C8D', fontSize: '0.9rem' }}>Pending Applications</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{
                  p: 2,
                  border: '1px solid #E0E0E0',
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  textAlign: 'center'
                }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#3498DB' }}>
                    {barangayStats.approved_applications}
                  </Typography>
                  <Typography sx={{ color: '#7F8C8D', fontSize: '0.9rem' }}>Approved Applications</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{
                  p: 2,
                  border: '1px solid #E0E0E0',
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  textAlign: 'center'
                }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#E74C3C' }}>
                    {barangayStats.total_applications}
                  </Typography>
                  <Typography sx={{ color: '#7F8C8D', fontSize: '0.9rem' }}>Total Applications</Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Report Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="lg"
          fullWidth
          sx={dialogStyles}
        >
          <DialogTitle sx={dialogTitleStyles}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {selectedReportData?.icon}
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedReportData?.title}
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseDialog}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ ...dialogContentStyles, bgcolor: 'white', p: 5, m: 1 }}>
            {selectedReportData && (
              <Box>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  {selectedReportData.description}
                </Typography>
                {selectedReportData.reportType === 'registration' ? (
                  renderPWDRegistrationReport()
                ) : selectedReportData.reportType === 'cards' ? (
                  renderCardDistributionReport()
                ) : selectedReportData.reportType === 'benefits' ? (
                  renderBenefitsDistributionReport()
                ) : selectedReportData.reportType === 'complaints' ? (
                  renderComplaintsAnalysisReport()
                ) : selectedReportData.reportType === 'activity' ? (
                  renderMonthlyActivityReport()
                ) : (
                  <Box sx={{ 
                    bgcolor: '#F8FAFC', 
                    border: '1px solid #E8E8E8', 
                    borderRadius: 1, 
                    p: 3,
                    textAlign: 'center',
                    minHeight: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography sx={{ color: '#7F8C8D' }}>
                      {selectedReportData.title} report content will be implemented soon
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={dialogActionsStyles}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={buttonStyles}
            >
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              sx={{
                ...buttonStyles,
                bgcolor: selectedReportData?.color || '#3498DB',
                '&:hover': {
                  bgcolor: selectedReportData?.color || '#2980B9',
                }
              }}
            >
              Download PDF
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default BarangayPresidentReports;
