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
import toastService from '../../services/toastService';
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
  Lightbulb,
  Badge,
  Description,
  Report,
  CheckCircle,
  Warning,
  Close,
  Menu as MenuIcon,
  AutoFixHigh,
  Psychology
} from '@mui/icons-material';
import AdminSidebar from '../shared/AdminSidebar';
// Suggestions removed per requirement
import analyticsService from '../../services/analyticsService';
import { reportsService } from '../../services/reportsService';
import pwdMemberService from '../../services/pwdMemberService';
import { applicationService } from '../../services/applicationService';
import benefitService from '../../services/benefitService';
// import suggestionsService from '../../services/suggestionsService';
import {
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
  AreaChartComponent
} from '../shared/ChartComponents';
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

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState(null);
  const [cityStats, setCityStats] = useState({
    total_pwd_members: 0,
    total_applications: 0,
    pending_applications: 0,
    total_barangays: 0
  });
  const [barangayPerformance, setBarangayPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  // Format date as MM/DD/YYYY
  const formatDateMMDDYYYY = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  };
  const [pdfBlob, setPdfBlob] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [dataLoading, setDataLoading] = useState(false);
  // Suggestions disabled
  
  // PWD Registration Report Data
  const [pwdRegistrationData, setPwdRegistrationData] = useState({
    totalRegistrations: 0,
    monthlyTrends: [],
    barangayDistribution: [],
    disabilityTypeDistribution: [],
    ageGroupDistribution: [],
    recentRegistrations: []
  });

  // Card Distribution Report Data
  const [cardDistributionData, setCardDistributionData] = useState({
    totalCardsIssued: 0,
    totalCardsPending: 0,
    monthlyCardTrends: [],
    barangayCardDistribution: [],
    cardStatusDistribution: [],
    recentCardIssuances: [],
    averageProcessingTime: 0
  });

  // Benefits Distribution Report Data
  const [benefitsDistributionData, setBenefitsDistributionData] = useState({
    totalBenefitsDistributed: 0,
    totalBenefitsPending: 0,
    monthlyBenefitsTrends: [],
    benefitTypeDistribution: [],
    barangayBenefitsDistribution: [],
    recentBenefitsDistributed: [],
    averageBenefitAmount: 0,
    totalBenefitValue: 0
  });

  // Complaints Analysis Report Data
  const [complaintsAnalysisData, setComplaintsAnalysisData] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    monthlyComplaintsTrends: [],
    complaintTypeDistribution: [],
    barangayComplaintsDistribution: [],
    recentComplaints: [],
    averageResolutionTime: 0,
    resolutionRate: 0
  });

  // Barangay Performance Report Data
  const [barangayPerformanceData, setBarangayPerformanceData] = useState({
    totalBarangays: 0,
    topPerformingBarangays: [],
    barangayRankings: [],
    performanceMetrics: [],
    monthlyPerformanceTrends: [],
    barangayComparison: [],
    performanceScore: 0
  });

  // Annual Summary Report Data
  const [annualSummaryData, setAnnualSummaryData] = useState({
    year: new Date().getFullYear(),
    totalRegistrations: 0,
    totalCardsIssued: 0,
    totalBenefitsDistributed: 0,
    totalApplications: 0,
    totalComplaints: 0,
    monthlyTrends: [],
    quarterlySummary: [],
    topPerformingBarangays: [],
    serviceEfficiency: {},
    yearOverYearGrowth: {},
    achievements: [],
    challenges: [],
    recommendations: []
  });


  useEffect(() => {
    loadData();
  }, [selectedDateRange]);

  // Date range helper function
  const getDateRange = (range) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'week':
        const weekAgo = new Date(startOfDay);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start: weekAgo, end: now };
      
      case 'month':
        const monthAgo = new Date(startOfDay);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { start: monthAgo, end: now };
      
      case 'quarter':
        const quarterAgo = new Date(startOfDay);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        return { start: quarterAgo, end: now };
      
      case 'year':
        const yearAgo = new Date(startOfDay);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return { start: yearAgo, end: now };
      
      default:
        return null; // All time
    }
  };

  // Filter data by date range
  const filterDataByDateRange = (data, dateField = 'created_at') => {
    if (selectedDateRange === 'all') return data;
    
    const dateRange = getDateRange(selectedDateRange);
    if (!dateRange) return data;
    
    return data.filter(item => {
      // Try multiple date fields for PWD members
      const dateFields = [dateField, 'created_at', 'createdAt', 'registrationDate', 'submissionDate', 'date', 'approved_at', 'approvalDate'];
      let itemDate = null;
      
      for (const field of dateFields) {
        if (item[field]) {
          itemDate = new Date(item[field]);
          if (!isNaN(itemDate.getTime())) {
            break;
          }
        }
      }
      
      // If no date found, include the item to avoid filtering out all data
      if (!itemDate) {
        console.log('Item without date included:', item);
        return true;
      }
      
      const isInRange = itemDate >= dateRange.start && itemDate <= dateRange.end;
      if (!isInRange) {
        console.log('Item filtered out by date range:', item, 'Date:', itemDate, 'Range:', dateRange);
      }
      return isInRange;
    });
  };

  const fetchPWDRegistrationData = async () => {
    try {
      setDataLoading(true);
      // Fetch PWD members data
      const pwdResponse = await pwdMemberService.getAll();
      const pwdMembers = pwdResponse.data?.members || pwdResponse.members || [];
      console.log('PWD Members fetched:', pwdMembers.length, pwdMembers);
      
      // Fetch applications data
      const applicationsResponse = await applicationService.getAll();
      const applications = applicationsResponse.data || applicationsResponse || [];
      console.log('Applications fetched:', applications.length, applications);
      
      // Filter data by selected date range
      console.log('Selected date range:', selectedDateRange);
      const dateRange = getDateRange(selectedDateRange);
      console.log('Date range object:', dateRange);
      
      let filteredMembers = filterDataByDateRange(pwdMembers);
      let filteredApplications = filterDataByDateRange(applications);
      
      // If no data found with current filter, fallback to all data
      if (filteredMembers.length === 0 && pwdMembers.length > 0) {
        console.log('No members found with current date filter, using all data');
        filteredMembers = pwdMembers;
      }
      if (filteredApplications.length === 0 && applications.length > 0) {
        console.log('No applications found with current date filter, using all data');
        filteredApplications = applications;
      }
      
      console.log('Filtered members:', filteredMembers.length, filteredMembers);
      console.log('Filtered applications:', filteredApplications.length, filteredApplications);
      
      // Calculate statistics - use applications as primary source since they show actual registrations
      const totalRegistrations = Math.max(filteredApplications.length, filteredMembers.length);
      console.log('Total registrations calculation:', {
        filteredApplications: filteredApplications.length,
        filteredMembers: filteredMembers.length,
        totalRegistrations
      });
      
      // Monthly trends (last 12 months) - compute from applications first to ensure Sept/Oct are captured
      const monthlyTrends = [];
      const currentDate = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        // Prefer application creation/submission date as ground truth for registrations
        let monthRegistrations = filteredApplications.filter(app => {
          const dateStr = app.submissionDate || app.created_at || app.date || app.registrationDate;
          if (!dateStr) return false;
          const appDate = new Date(dateStr);
          return appDate.getFullYear() === date.getFullYear() && appDate.getMonth() === date.getMonth();
        }).length;
        // If zero, fallback to member created_at to avoid gaps
        if (monthRegistrations === 0) {
          monthRegistrations = filteredMembers.filter(member => {
            const dateStr = member.created_at || member.registrationDate || member.submissionDate;
            if (!dateStr) return false;
            const memberDate = new Date(dateStr);
            return memberDate.getFullYear() === date.getFullYear() && memberDate.getMonth() === date.getMonth();
          }).length;
        }
        
        const monthApplications = filteredApplications.filter(app => {
          const dateStr = app.submissionDate || app.created_at || app.date || app.registrationDate;
          if (!dateStr) return false;
          const appDate = new Date(dateStr);
          return appDate.getFullYear() === date.getFullYear() && appDate.getMonth() === date.getMonth();
        }).length;
        
        monthlyTrends.push({
          month: monthName,
          registrations: monthRegistrations,
          applications: monthApplications
        });
        
        console.log(`Month ${monthName}:`, {
          monthRegistrations,
          monthApplications,
          dateRange: { start: date, end: new Date(date.getFullYear(), date.getMonth() + 1, 0) }
        });
      }
      
      // Barangay distribution - include all barangays from both members and applications
      const barangayCounts = {};
      
      // Count from members
      filteredMembers.forEach(member => {
        const barangay = member.barangay || 'Unknown';
        barangayCounts[barangay] = (barangayCounts[barangay] || 0) + 1;
      });
      
      // Also count from applications to capture more data
      filteredApplications.forEach(app => {
        const barangay = app.barangay || app.Barangay || 'Unknown';
        barangayCounts[barangay] = (barangayCounts[barangay] || 0) + 1;
      });
      
      // Get all barangays and ensure they're all included
      const allBarangays = await analyticsService.getAllBarangays();
      allBarangays.forEach(barangay => {
        if (!barangayCounts[barangay]) {
          barangayCounts[barangay] = 0;
        }
      });
      
      console.log('Barangay counts:', barangayCounts);
      console.log('All barangays:', allBarangays);
      
      const barangayDistribution = Object.entries(barangayCounts)
        .map(([barangay, count]) => ({ barangay, count }))
        .sort((a, b) => b.count - a.count);
      
      console.log('Barangay distribution:', barangayDistribution);
      
      // Disability type distribution - use both members and applications
      const disabilityCounts = {};
      
      // Count from members
      filteredMembers.forEach(member => {
        const disability = member.disabilityType || 'Not Specified';
        disabilityCounts[disability] = (disabilityCounts[disability] || 0) + 1;
      });
      
      // Also count from applications to capture more data
      filteredApplications.forEach(app => {
        const disability = app.disabilityType || app.typeOfDisability || 'Not Specified';
        disabilityCounts[disability] = (disabilityCounts[disability] || 0) + 1;
      });
      
      const disabilityTypeDistribution = Object.entries(disabilityCounts)
        .map(([disability, count]) => ({ disability, count }))
        .sort((a, b) => b.count - a.count);
      
      console.log('Disability counts:', disabilityCounts);
      console.log('Disability type distribution:', disabilityTypeDistribution);
      
      // Age group distribution
      const ageGroups = {
        'Under 18': 0,
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56-65': 0,
        'Over 65': 0
      };
      
      filteredMembers.forEach(member => {
        if (member.birthDate) {
          const age = new Date().getFullYear() - new Date(member.birthDate).getFullYear();
          if (age < 18) ageGroups['Under 18']++;
          else if (age <= 25) ageGroups['18-25']++;
          else if (age <= 35) ageGroups['26-35']++;
          else if (age <= 45) ageGroups['36-45']++;
          else if (age <= 55) ageGroups['46-55']++;
          else if (age <= 65) ageGroups['56-65']++;
          else ageGroups['Over 65']++;
        }
      });
      
      const ageGroupDistribution = Object.entries(ageGroups)
        .map(([ageGroup, count]) => ({ ageGroup, count }))
        .filter(item => item.count > 0);
      
      // Recent registrations (last 10)
      const recentRegistrations = filteredMembers
        .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
        .slice(0, 10);
      
      // Calculate total registrations from monthly trends for consistency
      const totalFromMonthlyTrends = monthlyTrends.reduce((sum, month) => sum + month.registrations, 0);
      console.log('Total registrations from monthly trends:', totalFromMonthlyTrends);
      
      // Use the higher of the two calculations
      const finalTotalRegistrations = Math.max(totalRegistrations, totalFromMonthlyTrends);
      console.log('Final total registrations:', finalTotalRegistrations);
      
      const finalData = {
        totalRegistrations: finalTotalRegistrations,
        monthlyTrends,
        barangayDistribution,
        disabilityTypeDistribution,
        ageGroupDistribution,
        recentRegistrations
      };
      
      console.log('Final PWD registration data:', finalData);
      setPwdRegistrationData(finalData);
      
    } catch (error) {
      console.error('Error fetching PWD registration data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchCardDistributionData = async () => {
    try {
      // Fetch PWD members data to analyze card distribution
      const pwdResponse = await pwdMemberService.getAll();
      const pwdMembers = pwdResponse.data?.members || pwdResponse.members || [];
      
      // Fetch applications data to understand card processing
      const applicationsResponse = await applicationService.getAll();
      const applications = applicationsResponse.data || applicationsResponse || [];
      
      // Filter data by selected date range
      const filteredMembers = filterDataByDateRange(pwdMembers);
      const filteredApplications = filterDataByDateRange(applications);
      
      // Calculate card statistics
      const totalCardsIssued = filteredMembers.filter(member => member.pwd_id).length;
      const totalCardsPending = filteredApplications.filter(app => app.status === 'pending').length;
      
      // Monthly card trends (last 12 months)
      const monthlyCardTrends = [];
      const currentDate = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const monthCards = filteredMembers.filter(member => {
          if (!member.pwd_id || !member.created_at) return false;
          const memberDate = new Date(member.created_at);
          return memberDate.getFullYear() === date.getFullYear() && 
                 memberDate.getMonth() === date.getMonth();
        }).length;
        
        monthlyCardTrends.push({
          month: monthName,
          cardsIssued: monthCards
        });
      }
      
      // Barangay card distribution - include all barangays
      const barangayCardCounts = {};
      filteredMembers.forEach(member => {
        if (member.pwd_id) { // Only count members with cards
          const barangay = member.barangay || 'Unknown';
          barangayCardCounts[barangay] = (barangayCardCounts[barangay] || 0) + 1;
        }
      });
      
      // Get all barangays and ensure they're all included
      const allBarangays = await analyticsService.getAllBarangays();
      allBarangays.forEach(barangay => {
        if (!barangayCardCounts[barangay]) {
          barangayCardCounts[barangay] = 0;
        }
      });
      
      const barangayCardDistribution = Object.entries(barangayCardCounts)
        .map(([barangay, count]) => ({ barangay, count }))
        .sort((a, b) => b.count - a.count);
      
      // Card status distribution
      const cardStatusDistribution = [
        { status: 'Issued', count: totalCardsIssued },
        { status: 'Pending', count: totalCardsPending },
        { status: 'Not Applied', count: filteredMembers.length - totalCardsIssued - totalCardsPending }
      ];
      
      // Recent card issuances (last 10)
      const recentCardIssuances = filteredMembers
        .filter(member => member.pwd_id)
        .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
        .slice(0, 10);
      
      // Calculate average processing time based on actual data
      const processingTimes = applications
        .filter(app => app.status === 'approved' && app.approved_at && app.created_at)
        .map(app => {
          const created = new Date(app.created_at);
          const approved = new Date(app.approved_at);
          return Math.ceil((approved - created) / (1000 * 60 * 60 * 24)); // days
        });
      
      const averageProcessingTime = processingTimes.length > 0 
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
        : 0;
      
      setCardDistributionData({
        totalCardsIssued,
        totalCardsPending,
        monthlyCardTrends,
        barangayCardDistribution,
        cardStatusDistribution,
        recentCardIssuances,
        averageProcessingTime
      });
      
    } catch (error) {
      console.error('Error fetching card distribution data:', error);
    }
  };

  const fetchBenefitsDistributionData = async () => {
    try {
      setDataLoading(true);
      // Fetch benefits data
      const benefitsResponse = await benefitService.getAll();
      const benefits = benefitsResponse.data || benefitsResponse || [];
      console.log('Benefits fetched:', benefits.length, benefits);
      
      // Fetch PWD members data to analyze benefit distribution
      const pwdResponse = await pwdMemberService.getAll();
      const pwdMembers = pwdResponse.data?.members || pwdResponse.members || [];
      console.log('PWD Members for benefits:', pwdMembers.length, pwdMembers);
      
      // Filter data by selected date range
      let filteredBenefits = filterDataByDateRange(benefits);
      let filteredMembers = filterDataByDateRange(pwdMembers);
      
      // If no data found with current filter, fallback to all data
      if (filteredBenefits.length === 0 && benefits.length > 0) {
        console.log('No benefits found with current date filter, using all data');
        filteredBenefits = benefits;
      }
      if (filteredMembers.length === 0 && pwdMembers.length > 0) {
        console.log('No members found with current date filter, using all data');
        filteredMembers = pwdMembers;
      }
      
      console.log('Filtered benefits:', filteredBenefits.length, filteredBenefits);
      console.log('Filtered members for benefits:', filteredMembers.length, filteredMembers);
      
      // Calculate benefits statistics
      const totalBenefitsDistributed = filteredBenefits.filter(benefit => benefit.status === 'approved').length;
      const totalBenefitsPending = filteredBenefits.filter(benefit => benefit.status === 'pending').length;
      
      // Monthly benefits trends (last 12 months)
      const monthlyBenefitsTrends = [];
      const currentDate = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const monthBenefits = benefits.filter(benefit => {
          if (!benefit.created_at) return false;
          const benefitDate = new Date(benefit.created_at);
          return benefitDate.getFullYear() === date.getFullYear() && 
                 benefitDate.getMonth() === date.getMonth();
        }).length;
        
        monthlyBenefitsTrends.push({
          month: monthName,
          benefitsDistributed: monthBenefits
        });
      }
      
      // Benefit type distribution
      const benefitTypeCounts = {};
      benefits.forEach(benefit => {
        const type = benefit.type || 'Unknown';
        benefitTypeCounts[type] = (benefitTypeCounts[type] || 0) + 1;
      });
      
      const benefitTypeDistribution = Object.entries(benefitTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
      
      console.log('Benefit type counts:', benefitTypeCounts);
      console.log('Benefit type distribution:', benefitTypeDistribution);
      
      // Barangay benefits distribution - include all barangays
      const barangayBenefitsCounts = {};
      benefits.forEach(benefit => {
        if (benefit.status === 'approved') {
          // For Financial Assistance, use selectedBarangays
          if (benefit.type === 'Financial Assistance' && benefit.selectedBarangays) {
            benefit.selectedBarangays.forEach(barangay => {
              barangayBenefitsCounts[barangay] = (barangayBenefitsCounts[barangay] || 0) + 1;
            });
          } else if (benefit.barangay) {
            // For other benefit types, use single barangay
            barangayBenefitsCounts[benefit.barangay] = (barangayBenefitsCounts[benefit.barangay] || 0) + 1;
          }
        }
      });
      
      // Get all barangays and ensure they're all included
      const allBarangays = await analyticsService.getAllBarangays();
      allBarangays.forEach(barangay => {
        if (!barangayBenefitsCounts[barangay]) {
          barangayBenefitsCounts[barangay] = 0;
        }
      });
      
      const barangayBenefitsDistribution = Object.entries(barangayBenefitsCounts)
        .map(([barangay, count]) => ({ barangay, count }))
        .sort((a, b) => b.count - a.count);
      
      // Recent benefits distributed (last 10)
      const recentBenefitsDistributed = benefits
        .filter(benefit => benefit.status === 'approved')
        .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
        .slice(0, 10);
      
      // Calculate average benefit amount and total value based on actual data
      const approvedBenefits = benefits.filter(benefit => benefit.status === 'approved');
      const benefitAmounts = approvedBenefits
        .map(benefit => parseFloat(benefit.amount || benefit.value || 0))
        .filter(amount => amount > 0);
      
      const averageBenefitAmount = benefitAmounts.length > 0 
        ? benefitAmounts.reduce((sum, amount) => sum + amount, 0) / benefitAmounts.length 
        : 0;
      
      const totalBenefitValue = benefitAmounts.reduce((sum, amount) => sum + amount, 0);
      
      const finalBenefitsData = {
        totalBenefitsDistributed,
        totalBenefitsPending,
        monthlyBenefitsTrends,
        benefitTypeDistribution,
        barangayBenefitsDistribution,
        recentBenefitsDistributed,
        averageBenefitAmount,
        totalBenefitValue
      };
      
      console.log('Final benefits distribution data:', finalBenefitsData);
      setBenefitsDistributionData(finalBenefitsData);
      
    } catch (error) {
      console.error('Error fetching benefits distribution data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchComplaintsAnalysisData = async () => {
    try {
      // Fetch complaints data from API
      const complaints = await api.get('/complaints');
      
      // Calculate complaints statistics
      const totalComplaints = complaints.length;
      const resolvedComplaints = complaints.filter(complaint => complaint.status === 'resolved').length;
      const pendingComplaints = complaints.filter(complaint => complaint.status === 'pending').length;
      
      // Monthly complaints trends (last 12 months)
      const monthlyComplaintsTrends = [];
      const currentDate = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const monthComplaints = complaints.filter(complaint => {
          if (!complaint.created_at) return false;
          const complaintDate = new Date(complaint.created_at);
          return complaintDate.getFullYear() === date.getFullYear() && 
                 complaintDate.getMonth() === date.getMonth();
        }).length;
        
        monthlyComplaintsTrends.push({
          month: monthName,
          complaints: monthComplaints
        });
      }
      
      // Complaint type distribution
      const complaintTypeCounts = {};
      complaints.forEach(complaint => {
        const type = complaint.type || complaint.category || 'General';
        complaintTypeCounts[type] = (complaintTypeCounts[type] || 0) + 1;
      });
      
      const complaintTypeDistribution = Object.entries(complaintTypeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
      
      // Barangay complaints distribution - include all barangays
      const barangayComplaintsCounts = {};
      complaints.forEach(complaint => {
        const barangay = complaint.barangay || complaint.location || 'Unknown';
        barangayComplaintsCounts[barangay] = (barangayComplaintsCounts[barangay] || 0) + 1;
      });
      
      // Get all barangays and ensure they're all included
      const allBarangays = await analyticsService.getAllBarangays();
      allBarangays.forEach(barangay => {
        if (!barangayComplaintsCounts[barangay]) {
          barangayComplaintsCounts[barangay] = 0;
        }
      });
      
      const barangayComplaintsDistribution = Object.entries(barangayComplaintsCounts)
        .map(([barangay, count]) => ({ barangay, count }))
        .sort((a, b) => b.count - a.count);
      
      // Recent complaints (last 10)
      const recentComplaints = complaints
        .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
        .slice(0, 10);
      
      // Calculate average resolution time based on actual data
      const resolvedComplaintsWithDates = complaints.filter(complaint => 
        complaint.status === 'resolved' && complaint.resolved_at && complaint.created_at
      );
      
      const resolutionTimes = resolvedComplaintsWithDates.map(complaint => {
        const created = new Date(complaint.created_at);
        const resolved = new Date(complaint.resolved_at);
        return Math.ceil((resolved - created) / (1000 * 60 * 60 * 24)); // days
      });
      
      const averageResolutionTime = resolutionTimes.length > 0 
        ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length 
        : 0;
      
      const resolutionRate = totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100) : 0;
      
      setComplaintsAnalysisData({
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        monthlyComplaintsTrends,
        complaintTypeDistribution,
        barangayComplaintsDistribution,
        recentComplaints,
        averageResolutionTime,
        resolutionRate
      });
      
    } catch (error) {
      console.error('Error fetching complaints analysis data:', error);
    }
  };

  const fetchBarangayPerformanceData = async () => {
    try {
      // Fetch PWD members data to analyze barangay performance
      const pwdResponse = await pwdMemberService.getAll();
      const pwdMembers = pwdResponse.data?.members || pwdResponse.members || [];
      
      // Fetch benefits data
      const benefitsResponse = await benefitService.getAll();
      const benefits = benefitsResponse.data || benefitsResponse || [];
      
      // Fetch applications data
      const applicationsResponse = await applicationService.getAll();
      const applications = applicationsResponse.data || applicationsResponse || [];
      
      // Fetch complaints data
      const complaints = await api.get('/complaints');
      
      // Define barangays list - All 18 barangays
      const barangays = [
        'Bigaa', 'Butong', 'Marinig', 'Gulod', 'Pob. Uno', 'Pob. Dos', 'Pob. Tres',
        'Sala', 'Niugan', 'Banaybanay', 'Pulo', 'Diezmo', 'Pittland', 'San Isidro',
        'Mamatid', 'Baclaran', 'Casile', 'Banlic'
      ];
      
      // Calculate performance metrics for each barangay
      const barangayMetrics = barangays.map(barangay => {
        // PWD registrations
        const registrations = pwdMembers.filter(member => member.barangay === barangay).length;
        
        // Card issuances (members with PWD ID)
        const cardsIssued = pwdMembers.filter(member => 
          member.barangay === barangay && member.pwd_id
        ).length;
        
        // Benefits distributed
        const benefitsDistributed = benefits.filter(benefit => {
          if (benefit.status === 'approved') {
            if (benefit.type === 'Financial Assistance' && benefit.selectedBarangays) {
              return benefit.selectedBarangays.includes(barangay);
            } else if (benefit.barangay === barangay) {
              return true;
            }
          }
          return false;
        }).length;
        
        // Complaints received
        const complaintsReceived = complaints.filter(complaint => 
          complaint.barangay === barangay || complaint.location === barangay
        ).length;
        
        // Applications submitted
        const applicationsSubmitted = applications.filter(app => 
          app.barangay === barangay
        ).length;
        
        // Calculate performance score (weighted)
        const performanceScore = (
          (registrations * 0.3) +
          (cardsIssued * 0.25) +
          (benefitsDistributed * 0.25) +
          (applicationsSubmitted * 0.15) -
          (complaintsReceived * 0.05)
        );
        
        return {
          barangay,
          registrations,
          cardsIssued,
          benefitsDistributed,
          complaintsReceived,
          applicationsSubmitted,
          performanceScore: Math.max(0, performanceScore)
        };
      });
      
      // Sort by performance score
      const sortedBarangays = barangayMetrics.sort((a, b) => b.performanceScore - a.performanceScore);
      
      // Top performing barangays (top 5)
      const topPerformingBarangays = sortedBarangays.slice(0, 5);
      
      // Barangay rankings
      const barangayRankings = sortedBarangays.map((barangay, index) => ({
        ...barangay,
        rank: index + 1
      }));
      
      // Performance metrics summary
      const performanceMetrics = [
        { metric: 'Total Registrations', value: barangayMetrics.reduce((sum, b) => sum + b.registrations, 0) },
        { metric: 'Total Cards Issued', value: barangayMetrics.reduce((sum, b) => sum + b.cardsIssued, 0) },
        { metric: 'Total Benefits Distributed', value: barangayMetrics.reduce((sum, b) => sum + b.benefitsDistributed, 0) },
        { metric: 'Total Applications', value: barangayMetrics.reduce((sum, b) => sum + b.applicationsSubmitted, 0) },
        { metric: 'Total Complaints', value: barangayMetrics.reduce((sum, b) => sum + b.complaintsReceived, 0) }
      ];
      
      // Monthly performance trends (last 6 months)
      const monthlyPerformanceTrends = [];
      const currentDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const monthRegistrations = pwdMembers.filter(member => {
          if (!member.created_at) return false;
          const memberDate = new Date(member.created_at);
          return memberDate.getFullYear() === date.getFullYear() && 
                 memberDate.getMonth() === date.getMonth();
        }).length;
        
        const monthBenefits = benefits.filter(benefit => {
          if (!benefit.created_at) return false;
          const benefitDate = new Date(benefit.created_at);
          return benefitDate.getFullYear() === date.getFullYear() && 
                 benefitDate.getMonth() === date.getMonth();
        }).length;
        
        monthlyPerformanceTrends.push({
          month: monthName,
          registrations: monthRegistrations,
          benefits: monthBenefits,
          totalActivity: monthRegistrations + monthBenefits
        });
      }
      
      // Barangay comparison (top 10)
      const barangayComparison = sortedBarangays.slice(0, 10);
      
      // Overall performance score
      const overallPerformanceScore = barangayMetrics.reduce((sum, b) => sum + b.performanceScore, 0) / barangayMetrics.length;
      
      setBarangayPerformanceData({
        totalBarangays: barangays.length,
        topPerformingBarangays,
        barangayRankings,
        performanceMetrics,
        monthlyPerformanceTrends,
        barangayComparison,
        performanceScore: overallPerformanceScore
      });
      
      console.log('Barangay Performance Data Set:', {
        totalBarangays: barangays.length,
        barangayRankings,
        topPerformers: topPerformingBarangays
      });
      
    } catch (error) {
      console.error('Error fetching barangay performance data:', error);
    }
  };

  const fetchAnnualSummaryData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      
      // Fetch all data sources
      const pwdResponse = await pwdMemberService.getAll();
      const pwdMembers = pwdResponse.data?.members || pwdResponse.members || [];
      
      const benefitsResponse = await benefitService.getAll();
      const benefits = benefitsResponse.data || benefitsResponse || [];
      
      const applicationsResponse = await applicationService.getAll();
      const applications = applicationsResponse.data || applicationsResponse || [];
      
      const complaints = await api.get('/complaints');
      
      // Filter data for current year
      const currentYearMembers = pwdMembers.filter(member => {
        if (!member.created_at) return false;
        return new Date(member.created_at).getFullYear() === currentYear;
      });
      
      const currentYearBenefits = benefits.filter(benefit => {
        if (!benefit.created_at) return false;
        return new Date(benefit.created_at).getFullYear() === currentYear;
      });
      
      const currentYearApplications = applications.filter(app => {
        if (!app.created_at) return false;
        return new Date(app.created_at).getFullYear() === currentYear;
      });
      
      const currentYearComplaints = complaints.filter(complaint => {
        if (!complaint.created_at) return false;
        return new Date(complaint.created_at).getFullYear() === currentYear;
      });
      
      // Calculate totals for current year
      const totalRegistrations = currentYearMembers.length;
      const totalCardsIssued = currentYearMembers.filter(member => member.pwd_id).length;
      const totalBenefitsDistributed = currentYearBenefits.filter(benefit => benefit.status === 'approved').length;
      const totalApplications = currentYearApplications.length;
      const totalComplaints = currentYearComplaints.length;
      
      // Monthly trends for current year
      const monthlyTrends = [];
      for (let month = 0; month < 12; month++) {
        const monthName = new Date(currentYear, month).toLocaleDateString('en-US', { month: 'short' });
        
        const monthMembers = currentYearMembers.filter(member => {
          const memberDate = new Date(member.created_at);
          return memberDate.getMonth() === month;
        }).length;
        
        const monthBenefits = currentYearBenefits.filter(benefit => {
          const benefitDate = new Date(benefit.created_at);
          return benefitDate.getMonth() === month;
        }).length;
        
        const monthApplications = currentYearApplications.filter(app => {
          const appDate = new Date(app.created_at);
          return appDate.getMonth() === month;
        }).length;
        
        const monthComplaints = currentYearComplaints.filter(complaint => {
          const complaintDate = new Date(complaint.created_at);
          return complaintDate.getMonth() === month;
        }).length;
        
        monthlyTrends.push({
          month: monthName,
          registrations: monthMembers,
          benefits: monthBenefits,
          applications: monthApplications,
          complaints: monthComplaints,
          totalActivity: monthMembers + monthBenefits + monthApplications
        });
      }
      
      // Quarterly summary
      const quarterlySummary = [
        {
          quarter: 'Q1',
          months: ['Jan', 'Feb', 'Mar'],
          registrations: monthlyTrends.slice(0, 3).reduce((sum, m) => sum + m.registrations, 0),
          benefits: monthlyTrends.slice(0, 3).reduce((sum, m) => sum + m.benefits, 0),
          applications: monthlyTrends.slice(0, 3).reduce((sum, m) => sum + m.applications, 0),
          complaints: monthlyTrends.slice(0, 3).reduce((sum, m) => sum + m.complaints, 0)
        },
        {
          quarter: 'Q2',
          months: ['Apr', 'May', 'Jun'],
          registrations: monthlyTrends.slice(3, 6).reduce((sum, m) => sum + m.registrations, 0),
          benefits: monthlyTrends.slice(3, 6).reduce((sum, m) => sum + m.benefits, 0),
          applications: monthlyTrends.slice(3, 6).reduce((sum, m) => sum + m.applications, 0),
          complaints: monthlyTrends.slice(3, 6).reduce((sum, m) => sum + m.complaints, 0)
        },
        {
          quarter: 'Q3',
          months: ['Jul', 'Aug', 'Sep'],
          registrations: monthlyTrends.slice(6, 9).reduce((sum, m) => sum + m.registrations, 0),
          benefits: monthlyTrends.slice(6, 9).reduce((sum, m) => sum + m.benefits, 0),
          applications: monthlyTrends.slice(6, 9).reduce((sum, m) => sum + m.applications, 0),
          complaints: monthlyTrends.slice(6, 9).reduce((sum, m) => sum + m.complaints, 0)
        },
        {
          quarter: 'Q4',
          months: ['Oct', 'Nov', 'Dec'],
          registrations: monthlyTrends.slice(9, 12).reduce((sum, m) => sum + m.registrations, 0),
          benefits: monthlyTrends.slice(9, 12).reduce((sum, m) => sum + m.benefits, 0),
          applications: monthlyTrends.slice(9, 12).reduce((sum, m) => sum + m.applications, 0),
          complaints: monthlyTrends.slice(9, 12).reduce((sum, m) => sum + m.complaints, 0)
        }
      ];
      
      // Top performing barangays for the year
      const barangays = [
        'Bigaa', 'Butong', 'Marinig', 'Gulod', 'Pob. Uno', 'Pob. Dos', 'Pob. Tres',
        'Sala', 'Niugan', 'Banaybanay', 'Pulo', 'Diezmo', 'Pittland', 'San Isidro',
        'Mamatid', 'Baclaran', 'Casile', 'Banlic'
      ];
      
      const barangayPerformance = barangays.map(barangay => {
        const registrations = currentYearMembers.filter(member => member.barangay === barangay).length;
        const cardsIssued = currentYearMembers.filter(member => 
          member.barangay === barangay && member.pwd_id
        ).length;
        const benefitsDistributed = currentYearBenefits.filter(benefit => {
          if (benefit.status === 'approved') {
            if (benefit.type === 'Financial Assistance' && benefit.selectedBarangays) {
              return benefit.selectedBarangays.includes(barangay);
            } else if (benefit.barangay === barangay) {
              return true;
            }
          }
          return false;
        }).length;
        const complaints = currentYearComplaints.filter(complaint => 
          complaint.barangay === barangay || complaint.location === barangay
        ).length;
        
        const performanceScore = (
          (registrations * 0.3) +
          (cardsIssued * 0.25) +
          (benefitsDistributed * 0.25) +
          (registrations * 0.15) -
          (complaints * 0.05)
        );
        
        return {
          barangay,
          registrations,
          cardsIssued,
          benefitsDistributed,
          complaints,
          performanceScore: Math.max(0, performanceScore)
        };
      });
      
      const topPerformingBarangays = barangayPerformance
        .sort((a, b) => b.performanceScore - a.performanceScore)
        .slice(0, 5);
      
      // Service efficiency metrics
      const serviceEfficiency = {
        registrationRate: totalRegistrations / 12, // per month
        cardIssuanceRate: (totalCardsIssued / totalRegistrations) * 100, // percentage
        benefitDistributionRate: (totalBenefitsDistributed / totalRegistrations) * 100, // percentage
        applicationProcessingRate: (totalApplications / totalRegistrations) * 100, // percentage
        complaintResolutionRate: complaints.length > 0 ? 
          (complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100 : 100
      };
      
      // Calculate year-over-year growth based on actual data
      const currentYearData = {
        registrations: currentYearMembers.length,
        cardsIssued: currentYearMembers.filter(m => m.pwd_id).length,
        benefitsDistributed: currentYearBenefits.length,
        applications: currentYearApplications.length,
        complaints: currentYearComplaints.length
      };
      
      const previousYearData = {
        registrations: previousYearMembers.length,
        cardsIssued: previousYearMembers.filter(m => m.pwd_id).length,
        benefitsDistributed: previousYearBenefits.length,
        applications: previousYearApplications.length,
        complaints: previousYearComplaints.length
      };
      
      const yearOverYearGrowth = {
        registrations: previousYearData.registrations > 0 ? 
          ((currentYearData.registrations - previousYearData.registrations) / previousYearData.registrations) * 100 : 0,
        cardsIssued: previousYearData.cardsIssued > 0 ? 
          ((currentYearData.cardsIssued - previousYearData.cardsIssued) / previousYearData.cardsIssued) * 100 : 0,
        benefitsDistributed: previousYearData.benefitsDistributed > 0 ? 
          ((currentYearData.benefitsDistributed - previousYearData.benefitsDistributed) / previousYearData.benefitsDistributed) * 100 : 0,
        applications: previousYearData.applications > 0 ? 
          ((currentYearData.applications - previousYearData.applications) / previousYearData.applications) * 100 : 0,
        complaints: previousYearData.complaints > 0 ? 
          ((currentYearData.complaints - previousYearData.complaints) / previousYearData.complaints) * 100 : 0
      };
      
      // Generate achievements, challenges, and recommendations
      const achievements = [
        `Successfully registered ${totalRegistrations} PWD members`,
        `Issued ${totalCardsIssued} PWD identification cards`,
        `Distributed ${totalBenefitsDistributed} benefit programs`,
        `Processed ${totalApplications} applications`,
        `Maintained ${serviceEfficiency.complaintResolutionRate.toFixed(1)}% complaint resolution rate`
      ];
      
      const challenges = [
        'High volume of applications during peak months',
        'Limited resources for benefit distribution',
        'Need for improved complaint response time',
        'Barangay coordination challenges',
        'Documentation and record keeping efficiency'
      ];
      
      const recommendations = [
        'Implement automated application processing system',
        'Increase staff training on PWD services',
        'Enhance barangay coordination protocols',
        'Develop mobile application for easier access',
        'Establish regular performance review meetings'
      ];
      
      setAnnualSummaryData({
        year: currentYear,
        totalRegistrations,
        totalCardsIssued,
        totalBenefitsDistributed,
        totalApplications,
        totalComplaints,
        monthlyTrends,
        quarterlySummary,
        topPerformingBarangays,
        serviceEfficiency,
        yearOverYearGrowth,
        achievements,
        challenges,
        recommendations
      });
      
    } catch (error) {
      console.error('Error fetching annual summary data:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch PWD registration data
      await fetchPWDRegistrationData();
      
      // Fetch card distribution data
      await fetchCardDistributionData();
      
      // Fetch benefits distribution data
      await fetchBenefitsDistributionData();
      
      // Fetch complaints analysis data
      await fetchComplaintsAnalysisData();
      
      // Fetch barangay performance data
      await fetchBarangayPerformanceData();
      
      // Fetch annual summary data
      await fetchAnnualSummaryData();
      
      // Fetch city statistics from API
      try {
        const cityStatsResponse = await fetch('http://192.168.18.25:8000/api/city-stats');
        if (cityStatsResponse.ok) {
          const cityStatsData = await cityStatsResponse.json();
          setCityStats(cityStatsData);
        }
      } catch (error) {
        console.error('Error fetching city stats:', error);
        // Set default values if API fails
        setCityStats({
          total_pwd_members: 0,
          total_applications: 0,
          pending_applications: 0,
          total_barangays: 0
        });
      }
      
      // Fetch barangay performance from API (now includes all barangays)
      try {
        const barangayData = await api.get('/reports/barangay-performance');
        console.log('Barangay Performance API Response:', barangayData);
        setBarangayPerformance(barangayData.barangays || []);
      } catch (error) {
        console.error('Error fetching barangay performance:', error);
        // Use fallback data when API fails - All 18 barangays
        const fallbackData = [
          { barangay: 'Bigaa', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Butong', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Marinig', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Gulod', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Pob. Uno', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Pob. Dos', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Pob. Tres', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Sala', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Niugan', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Banaybanay', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Pulo', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Diezmo', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Pittland', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'San Isidro', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Mamatid', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Baclaran', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Casile', registered: 0, cards: 0, benefits: 0, complaints: 0 },
          { barangay: 'Banlic', registered: 0, cards: 0, benefits: 0, complaints: 0 }
        ];
        setBarangayPerformance(fallbackData);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportType) => {
    try {
      setGenerating(prev => ({ ...prev, [reportType]: true }));
      
      // Generate actual report data based on report type
      let reportData = {};
      
      switch (reportType) {
        case 'registration':
          reportData = {
            type: 'registration',
            generatedAt: new Date().toISOString(),
            data: pwdRegistrationData,
            summary: `PWD Registration Report generated with ${pwdRegistrationData.totalRegistrations} total registrations`
          };
          break;
        case 'cards':
          reportData = {
            type: 'cards',
            generatedAt: new Date().toISOString(),
            data: cardDistributionData,
            summary: `Card Distribution Report generated with ${cardDistributionData.totalCardsIssued} cards issued`
          };
          break;
        case 'benefits':
          reportData = {
            type: 'benefits',
            generatedAt: new Date().toISOString(),
            data: benefitsDistributionData,
            summary: `Benefits Distribution Report generated with ${benefitsDistributionData.totalBenefitsDistributed} benefits distributed`
          };
          break;
        case 'complaints':
          reportData = {
            type: 'complaints',
            generatedAt: new Date().toISOString(),
            data: complaintsAnalysisData,
            summary: `Complaints Analysis Report generated with ${complaintsAnalysisData.totalComplaints} total complaints`
          };
          break;
        case 'performance':
          reportData = {
            type: 'performance',
            generatedAt: new Date().toISOString(),
            data: barangayPerformanceData,
            summary: `Barangay Performance Report generated for ${barangayPerformanceData.totalBarangays} barangays`
          };
          break;
        case 'annual':
          reportData = {
            type: 'annual',
            generatedAt: new Date().toISOString(),
            data: annualSummaryData,
            summary: `Annual Summary Report generated for ${annualSummaryData.year}`
          };
          break;
        default:
          reportData = {
            type: reportType,
            generatedAt: new Date().toISOString(),
            data: {},
            summary: `${reportType} report generated successfully`
          };
      }
      
      setSnackbar({
        open: true,
        message: `${reportType} report generated successfully`,
        severity: 'success'
      });
      
      console.log('Generated report data:', reportData);
      
    } catch (error) {
      console.error('Error generating report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate report',
        severity: 'error'
      });
    } finally {
      setGenerating(prev => ({ ...prev, [reportType]: false }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };


  const getReportCategory = (reportType) => {
    const categoryMap = {
      'registration': 'registrations',
      'cards': 'applications',
      'benefits': 'benefits',
      'complaints': 'complaints',
      'performance': 'system',
      'annual': 'system'
    };
    return categoryMap[reportType] || 'system';
  };

  const reports = [
    {
      id: 1,
      title: 'PWD Registration Report',
      description: 'Monthly registration statistics and trends',
      icon: <People />,
      color: '#3498DB',
      lastUpdated: '2025-01-15',
      status: 'Available',
      reportType: 'registration'
    },
    {
      id: 2,
      title: 'Card Distribution Report',
      description: 'PWD card issuance and distribution data',
      icon: <CreditCard />,
      color: '#27AE60',
      lastUpdated: '2025-01-14',
      status: 'Available',
      reportType: 'cards'
    },
    {
      id: 3,
      title: 'Benefits Distribution Report',
      description: 'Ayuda and benefits distribution statistics',
      icon: <VolunteerActivism />,
      color: '#E74C3C',
      lastUpdated: '2025-01-13',
      status: 'Available',
      reportType: 'benefits'
    },
    {
      id: 4,
      title: 'Complaints Analysis Report',
      description: 'Feedback and complaints analysis',
      icon: <Assessment />,
      color: '#F39C12',
      lastUpdated: '2025-01-12',
      status: 'Available',
      reportType: 'complaints'
    },
    {
      id: 5,
      title: 'Barangay Performance Report',
      description: 'Performance metrics by barangay',
      icon: <TrendingUp />,
      color: '#9B59B6',
      lastUpdated: '2025-01-11',
      status: 'Available',
      reportType: 'performance'
    },
    {
      id: 6,
      title: 'Annual Summary Report',
      description: 'Comprehensive annual statistics',
      icon: <Assessment />,
      color: '#34495E',
      lastUpdated: '2024-12-31',
      status: 'Available',
      reportType: 'annual'
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

  // Filter reports based on selected report type
  const filteredReports = selectedReport 
    ? reports.filter(report => report.reportType === selectedReport)
    : reports;

  const renderPWDRegistrationReport = () => {
    const { totalRegistrations, monthlyTrends, barangayDistribution, disabilityTypeDistribution, ageGroupDistribution, recentRegistrations } = pwdRegistrationData;
    
    if (dataLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
                <People sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalRegistrations}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                <LocationOn sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {barangayDistribution.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Active Barangays
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3)',
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
                <Accessibility sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {disabilityTypeDistribution.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Disability Types
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
                <Timeline sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {monthlyTrends[monthlyTrends.length - 1]?.registrations || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  This Month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Monthly Trends Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <LineChartComponent
            data={monthlyTrends}
            title="Monthly Registration Trends"
            xKey="month"
            yKey="registrations"
            color="#3498DB"
            height={300}
          />
        </Paper>

        {/* Monthly Trends Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Monthly Registration Data
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'white', borderBottom: '2px solid #E0E0E0' }}>
                  <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Month</TableCell>
                  <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Registrations</TableCell>
                  <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyTrends.map((trend, index) => (
                  <TableRow key={index} sx={{ bgcolor: index % 2 ? '#F7FBFF' : 'white' }}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50', fontSize: '0.8rem', py: 2, px: 2 }}>{trend.month}</TableCell>
                    <TableCell sx={{ color: '#34495E', fontWeight: 600, fontSize: '0.8rem', py: 2, px: 2 }}>{trend.registrations}</TableCell>
                    <TableCell sx={{ color: '#34495E', fontWeight: 600, fontSize: '0.8rem', py: 2, px: 2 }}>
                      {totalRegistrations > 0 ? ((trend.registrations / totalRegistrations) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Barangay Distribution Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          {barangayDistribution.length > 0 ? (
            <BarChartComponent
              data={barangayDistribution}
              title="Registration by Barangay"
              xKey="barangay"
              yKey="count"
              color="#27AE60"
              height={400}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <Typography variant="h6" color="textSecondary">
                No barangay registration data available
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Barangay Distribution Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Registration by Barangay
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Barangay</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Registrations</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {barangayDistribution.length > 0 ? (
                  barangayDistribution.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{item.barangay}</TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>{item.count}</TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>
                        {totalRegistrations > 0 ? ((item.count / totalRegistrations) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center', color: '#7F8C8D', py: 4 }}>
                      No barangay registration data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Disability Type Distribution Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          {disabilityTypeDistribution.length > 0 ? (
            <PieChartComponent
              data={disabilityTypeDistribution}
              title="Disability Type Distribution"
              dataKey="count"
              nameKey="disability"
              height={300}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <Typography variant="h6" color="textSecondary">
                No disability type data available
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Disability Type Distribution Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Disability Type Distribution
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Disability Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Count</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {disabilityTypeDistribution.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{item.disability}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{item.count}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {totalRegistrations > 0 ? ((item.count / totalRegistrations) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Recent Registrations */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Recent Registrations
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>PWD ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Barangay</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Disability Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Registration Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentRegistrations.map((member, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                      {member.pwd_id || (member.userID ? `PWD-${member.userID}` : 'Not assigned')}
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {(() => {
                        const parts = [];
                        if (member.firstName) parts.push(member.firstName);
                        if (member.middleName && member.middleName.trim().toUpperCase() !== 'N/A') parts.push(member.middleName);
                        if (member.lastName) parts.push(member.lastName);
                        if (member.suffix) parts.push(member.suffix);
                        return parts.join(' ').trim() || 'Name not provided';
                      })()}
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{member.barangay || 'Not specified'}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{member.disabilityType || 'Not specified'}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {member.created_at ? formatDateMMDDYYYY(member.created_at) : 'Not available'}
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
      barangayCardDistribution, 
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
                <CreditCard sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalCardsIssued}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  {totalCardsPending}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  {averageProcessingTime}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                <LocationOn sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {barangayCardDistribution.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Active Barangays
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Card Status Distribution Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <PieChartComponent
            data={cardStatusDistribution}
            title="Card Status Distribution"
            dataKey="count"
            nameKey="status"
            height={300}
          />
        </Paper>

        {/* Card Status Distribution Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Card Status Distribution
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Count</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cardStatusDistribution.map((item, index) => {
                  const total = cardStatusDistribution.reduce((sum, status) => sum + status.count, 0);
                  return (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                        <Chip 
                          label={item.status} 
                          color={
                            item.status === 'Issued' ? 'success' : 
                            item.status === 'Pending' ? 'warning' : 'default'
                          } 
                          size="small" 
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>{item.count}</TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>
                        {total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Monthly Card Trends Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <LineChartComponent
            data={monthlyCardTrends}
            title="Monthly Card Issuance Trends"
            xKey="month"
            yKey="cardsIssued"
            color="#27AE60"
            height={300}
          />
        </Paper>

        {/* Monthly Card Trends Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Monthly Card Issuance Data
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Month</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Cards Issued</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyCardTrends.map((trend, index) => {
                  const totalCards = monthlyCardTrends.reduce((sum, month) => sum + month.cardsIssued, 0);
                  return (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{trend.month}</TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>{trend.cardsIssued}</TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>
                        {totalCards > 0 ? ((trend.cardsIssued / totalCards) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Barangay Card Distribution Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <BarChartComponent
            data={barangayCardDistribution.slice(0, 10)}
            title="Card Distribution by Barangay (Top 10)"
            xKey="barangay"
            yKey="count"
            color="#3498DB"
            height={300}
          />
        </Paper>

        {/* Barangay Card Distribution Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Card Distribution by Barangay
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Barangay</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Cards Issued</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {barangayCardDistribution.slice(0, 10).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{item.barangay}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{item.count}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {totalCardsIssued > 0 ? ((item.count / totalCardsIssued) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Recent Card Issuances */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Recent Card Issuances
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>PWD ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Barangay</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Disability Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Issue Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentCardIssuances.map((member, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                      {member.pwd_id || 'Not assigned'}
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {(() => {
                        const parts = [];
                        if (member.firstName) parts.push(member.firstName);
                        if (member.middleName && member.middleName.trim().toUpperCase() !== 'N/A') parts.push(member.middleName);
                        if (member.lastName) parts.push(member.lastName);
                        if (member.suffix) parts.push(member.suffix);
                        return parts.join(' ').trim() || 'Name not provided';
                      })()}
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{member.barangay || 'Not specified'}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{member.disabilityType || 'Not specified'}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {member.created_at ? formatDateMMDDYYYY(member.created_at) : 'Not available'}
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

  const renderBenefitsDistributionReport = () => {
    const { 
      totalBenefitsDistributed, 
      totalBenefitsPending, 
      monthlyBenefitsTrends, 
      benefitTypeDistribution, 
      barangayBenefitsDistribution, 
      recentBenefitsDistributed, 
      averageBenefitAmount, 
      totalBenefitValue 
    } = benefitsDistributionData;
    
    if (dataLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3)',
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
                <VolunteerActivism sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalBenefitsDistributed}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Benefits Distributed
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
                <Assessment sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalBenefitsPending}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Benefits Pending
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
                <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ₱{averageBenefitAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Avg. Benefit Amount
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
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
                  ₱{totalBenefitValue.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Total Value Distributed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Benefit Type Distribution Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          {benefitTypeDistribution.length > 0 ? (
            <PieChartComponent
              data={benefitTypeDistribution}
              title="Benefit Type Distribution"
              dataKey="count"
              nameKey="type"
              height={300}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <Typography variant="h6" color="textSecondary">
                No benefit type data available
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Benefit Type Distribution Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Benefit Type Distribution
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Benefit Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Count</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {benefitTypeDistribution.map((item, index) => {
                  const total = benefitTypeDistribution.reduce((sum, type) => sum + type.count, 0);
                  return (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                        <Chip 
                          label={item.type} 
                          color={
                            item.type === 'Financial Assistance' ? 'success' : 
                            item.type === 'Birthday Cash Gift' ? 'primary' : 'default'
                          } 
                          size="small" 
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>{item.count}</TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>
                        {total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Monthly Benefits Trends Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <AreaChartComponent
            data={monthlyBenefitsTrends}
            title="Monthly Benefits Distribution Trends"
            xKey="month"
            yKey="benefitsDistributed"
            color="#E74C3C"
            height={300}
          />
        </Paper>

        {/* Monthly Benefits Trends Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Monthly Benefits Distribution Data
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Month</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Benefits Distributed</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyBenefitsTrends.map((trend, index) => {
                  const totalBenefits = monthlyBenefitsTrends.reduce((sum, month) => sum + month.benefitsDistributed, 0);
                  return (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{trend.month}</TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>{trend.benefitsDistributed}</TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>
                        {totalBenefits > 0 ? ((trend.benefitsDistributed / totalBenefits) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Barangay Benefits Distribution Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <BarChartComponent
            data={barangayBenefitsDistribution.slice(0, 10)}
            title="Benefits Distribution by Barangay (Top 10)"
            xKey="barangay"
            yKey="count"
            color="#9B59B6"
            height={300}
          />
        </Paper>

        {/* Barangay Benefits Distribution Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Benefits Distribution by Barangay
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Barangay</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Benefits Distributed</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {barangayBenefitsDistribution.slice(0, 10).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{item.barangay}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{item.count}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {totalBenefitsDistributed > 0 ? ((item.count / totalBenefitsDistributed) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Recent Benefits Distributed */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Recent Benefits Distributed
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Benefit Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Barangay(s)</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Distribution Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentBenefitsDistributed.map((benefit, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                      <Chip 
                        label={benefit.type} 
                        color={
                          benefit.type === 'Financial Assistance' ? 'success' : 
                          benefit.type === 'Birthday Cash Gift' ? 'primary' : 'default'
                        } 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {benefit.title || benefit.name || 'No title'}
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {benefit.type === 'Financial Assistance' && benefit.selectedBarangays 
                        ? benefit.selectedBarangays.join(', ')
                        : benefit.barangay || 'Not specified'
                      }
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50', fontWeight: 500 }}>
                      ₱{averageBenefitAmount.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {benefit.created_at ? formatDateMMDDYYYY(benefit.created_at) : 'Not available'}
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

  const renderComplaintsAnalysisReport = () => {
    const { 
      totalComplaints, 
      resolvedComplaints, 
      pendingComplaints, 
      monthlyComplaintsTrends, 
      complaintTypeDistribution, 
      barangayComplaintsDistribution, 
      recentComplaints, 
      averageResolutionTime, 
      resolutionRate 
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
                  {totalComplaints}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Total Complaints
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
                <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {resolvedComplaints}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Resolved Complaints
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3)',
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
                  {pendingComplaints}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Pending Complaints
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
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
                <People sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {resolutionRate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, minHeight: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Resolution Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Complaint Status Distribution Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <PieChartComponent
            data={[
              { status: 'Resolved', count: resolvedComplaints },
              { status: 'Pending', count: pendingComplaints }
            ]}
            title="Complaint Status Distribution"
            dataKey="count"
            nameKey="status"
            height={300}
          />
        </Paper>

        {/* Complaint Status Distribution Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Complaint Status Distribution
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Count</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                    <Chip 
                      label="Resolved" 
                      color="success" 
                      size="small" 
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#2C3E50' }}>{resolvedComplaints}</TableCell>
                  <TableCell sx={{ color: '#2C3E50' }}>
                    {totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : 0}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                    <Chip 
                      label="Pending" 
                      color="warning" 
                      size="small" 
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#2C3E50' }}>{pendingComplaints}</TableCell>
                  <TableCell sx={{ color: '#2C3E50' }}>
                    {totalComplaints > 0 ? ((pendingComplaints / totalComplaints) * 100).toFixed(1) : 0}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Monthly Complaints Trends Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <LineChartComponent
            data={monthlyComplaintsTrends}
            title="Monthly Complaints Trends"
            xKey="month"
            yKey="complaints"
            color="#F39C12"
            height={300}
          />
        </Paper>

        {/* Monthly Complaints Trends Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Monthly Complaints Data
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Month</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Complaints</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyComplaintsTrends.map((trend, index) => {
                  const totalComplaintsInPeriod = monthlyComplaintsTrends.reduce((sum, month) => sum + month.complaints, 0);
                  return (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{trend.month}</TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>{trend.complaints}</TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>
                        {totalComplaintsInPeriod > 0 ? ((trend.complaints / totalComplaintsInPeriod) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Complaint Type Distribution Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <PieChartComponent
            data={complaintTypeDistribution}
            title="Complaint Type Distribution"
            dataKey="count"
            nameKey="type"
            height={300}
          />
        </Paper>

        {/* Complaint Type Distribution Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Complaint Type Distribution
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Complaint Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Count</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaintTypeDistribution.map((item, index) => {
                  const total = complaintTypeDistribution.reduce((sum, type) => sum + type.count, 0);
                  return (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                        <Chip 
                          label={item.type} 
                          color="primary" 
                          size="small" 
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>{item.count}</TableCell>
                      <TableCell sx={{ color: '#2C3E50' }}>
                        {total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Barangay Complaints Distribution Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <BarChartComponent
            data={barangayComplaintsDistribution.slice(0, 10)}
            title="Complaints by Barangay (Top 10)"
            xKey="barangay"
            yKey="count"
            color="#E74C3C"
            height={300}
          />
        </Paper>

        {/* Barangay Complaints Distribution Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Complaints by Barangay
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Barangay</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Complaints</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {barangayComplaintsDistribution.slice(0, 10).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{item.barangay}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{item.count}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {totalComplaints > 0 ? ((item.count / totalComplaints) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Recent Complaints */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Recent Complaints
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Complaint ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentComplaints.map((complaint, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                      {complaint.id || complaint.complaintID || `COMP-${index + 1}`}
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      <Chip 
                        label={complaint.type || complaint.category || 'General'} 
                        color="primary" 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {complaint.description || complaint.subject || 'No description'}
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      <Chip 
                        label={complaint.status || 'Unknown'} 
                        color={complaint.status === 'resolved' ? 'success' : 'warning'} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {complaint.created_at ? formatDateMMDDYYYY(complaint.created_at) : 'Not available'}
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

  const renderBarangayPerformanceReport = () => {
    const { 
      totalBarangays, 
      topPerformingBarangays, 
      barangayRankings, 
      performanceMetrics, 
      monthlyPerformanceTrends, 
      barangayComparison, 
      performanceScore 
    } = barangayPerformanceData;
    
    return (
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
                  {totalBarangays}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Barangays
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
                <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {performanceScore.toFixed(1)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Avg. Performance Score
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
                <People sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {performanceMetrics.find(m => m.metric === 'Total Registrations')?.value || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Registrations
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
                <VolunteerActivism sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {performanceMetrics.find(m => m.metric === 'Total Benefits Distributed')?.value || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Benefits Distributed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Performing Barangays Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <BarChartComponent
            data={topPerformingBarangays.slice(0, 10).map((barangay, index) => ({
              barangay: barangay.barangay,
              score: barangay.performanceScore
            }))}
            title="Top Performing Barangays (Performance Score)"
            xKey="barangay"
            yKey="score"
            color="#9B59B6"
            height={300}
          />
        </Paper>

        {/* Top Performing Barangays Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Top Performing Barangays
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Barangay</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Performance Score</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Registrations</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Cards Issued</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Benefits</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topPerformingBarangays.map((barangay, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                      <Chip 
                        label={`#${index + 1}`} 
                        color={index === 0 ? 'success' : index === 1 ? 'primary' : index === 2 ? 'warning' : 'default'} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{barangay.barangay}</TableCell>
                    <TableCell sx={{ color: '#2C3E50', fontWeight: 500 }}>
                      {barangay.performanceScore.toFixed(1)}
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{barangay.registrations}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{barangay.cardsIssued}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{barangay.benefitsDistributed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Performance Metrics Summary */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Performance Metrics Summary
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Metric</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Total Value</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Average per Barangay</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performanceMetrics.map((metric, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{metric.metric}</TableCell>
                    <TableCell sx={{ color: '#2C3E50', fontWeight: 500 }}>{metric.value}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      {(metric.value / totalBarangays).toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Monthly Performance Trends Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <LineChartComponent
            data={monthlyPerformanceTrends}
            title="Monthly Performance Trends"
            xKey="month"
            yKey="totalActivity"
            color="#27AE60"
            height={300}
          />
        </Paper>

        {/* Monthly Performance Trends Table */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Monthly Performance Data
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Month</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Registrations</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Benefits</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Total Activity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyPerformanceTrends.map((trend, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{trend.month}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{trend.registrations}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{trend.benefits}</TableCell>
                    <TableCell sx={{ color: '#2C3E50', fontWeight: 500 }}>{trend.totalActivity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Barangay Comparison */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Barangay Performance Comparison
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Barangay</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Registrations</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Cards</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Benefits</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Complaints</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {barangayComparison.map((barangay, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                      <Chip 
                        label={`#${index + 1}`} 
                        color={index < 3 ? 'success' : 'default'} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{barangay.barangay}</TableCell>
                    <TableCell sx={{ color: '#2C3E50', fontWeight: 500 }}>
                      {barangay.performanceScore.toFixed(1)}
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{barangay.registrations}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{barangay.cardsIssued}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{barangay.benefitsDistributed}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>
                      <Chip 
                        label={barangay.complaintsReceived} 
                        color={barangay.complaintsReceived > 5 ? 'error' : 'success'} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
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

  const renderAnnualSummaryReport = () => {
    const { 
      year,
      totalRegistrations, 
      totalCardsIssued, 
      totalBenefitsDistributed, 
      totalApplications, 
      totalComplaints,
      monthlyTrends,
      quarterlySummary,
      topPerformingBarangays,
      serviceEfficiency,
      yearOverYearGrowth,
      achievements,
      challenges,
      recommendations
    } = annualSummaryData;
    
    return (
      <Box>
        {/* Year Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2C3E50', mb: 1 }}>
            Annual Summary Report {year}
          </Typography>
          <Typography variant="h6" sx={{ color: '#7F8C8D' }}>
            Comprehensive Year-End Analysis of PWD Services
          </Typography>
        </Box>

        {/* Key Performance Indicators */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
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
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  +{yearOverYearGrowth.registrations || 0}% vs {year-1}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(39, 174, 96, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Badge sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {totalCardsIssued}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Cards Issued
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  +{yearOverYearGrowth.cardsIssued || 0}% vs {year-1}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
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
                  Benefits Distributed
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  +{yearOverYearGrowth.benefitsDistributed || 0}% vs {year-1}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(155, 89, 182, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Description sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {totalApplications}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Applications Processed
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  +{yearOverYearGrowth.applications || 0}% vs {year-1}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(243, 156, 18, 0.3)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Report sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {totalComplaints}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Complaints Received
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {yearOverYearGrowth.complaints || 0}% vs {year-1}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quarterly Summary */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Quarterly Performance Summary
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Quarter</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Months</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Registrations</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Benefits</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Applications</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Complaints</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Total Activity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quarterlySummary.map((quarter, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                      <Chip 
                        label={quarter.quarter} 
                        color={index === 0 ? 'primary' : index === 1 ? 'success' : index === 2 ? 'warning' : 'error'} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{quarter.months.join(', ')}</TableCell>
                    <TableCell sx={{ color: '#2C3E50', fontWeight: 500 }}>{quarter.registrations}</TableCell>
                    <TableCell sx={{ color: '#2C3E50', fontWeight: 500 }}>{quarter.benefits}</TableCell>
                    <TableCell sx={{ color: '#2C3E50', fontWeight: 500 }}>{quarter.applications}</TableCell>
                    <TableCell sx={{ color: '#2C3E50', fontWeight: 500 }}>{quarter.complaints}</TableCell>
                    <TableCell sx={{ color: '#2C3E50', fontWeight: 500 }}>
                      {quarter.registrations + quarter.benefits + quarter.applications}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Monthly Trends */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Monthly Activity Trends
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Month</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Registrations</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Benefits</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Applications</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Complaints</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Total Activity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyTrends.map((trend, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{trend.month}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{trend.registrations}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{trend.benefits}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{trend.applications}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{trend.complaints}</TableCell>
                    <TableCell sx={{ color: '#2C3E50', fontWeight: 500 }}>{trend.totalActivity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Service Efficiency Metrics */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Service Efficiency Metrics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3498DB', mb: 1 }}>
                  {(serviceEfficiency.registrationRate || 0).toFixed(1)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                  Avg. Registrations per Month
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#27AE60', mb: 1 }}>
                  {(serviceEfficiency.cardIssuanceRate || 0).toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                  Card Issuance Rate
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#E74C3C', mb: 1 }}>
                  {(serviceEfficiency.benefitDistributionRate || 0).toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                  Benefit Distribution Rate
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9B59B6', mb: 1 }}>
                  {(serviceEfficiency.complaintResolutionRate || 0).toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                  Complaint Resolution Rate
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Top Performing Barangays */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
            Top Performing Barangays ({year})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Barangay</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Performance Score</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Registrations</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Cards Issued</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>Benefits</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topPerformingBarangays.map((barangay, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>
                      <Chip 
                        label={`#${index + 1}`} 
                        color={index === 0 ? 'success' : index === 1 ? 'primary' : index === 2 ? 'warning' : 'default'} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#2C3E50' }}>{barangay.barangay}</TableCell>
                    <TableCell sx={{ color: '#2C3E50', fontWeight: 500 }}>
                      {barangay.performanceScore.toFixed(1)}
                    </TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{barangay.registrations}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{barangay.cardsIssued}</TableCell>
                    <TableCell sx={{ color: '#2C3E50' }}>{barangay.benefitsDistributed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Achievements, Challenges, and Recommendations */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'white', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#27AE60' }}>
                🏆 Key Achievements
              </Typography>
              {achievements.map((achievement, index) => (
                <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircle sx={{ color: '#27AE60', mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                    {achievement}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'white', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#E74C3C' }}>
                ⚠️ Challenges Faced
              </Typography>
              {challenges.map((challenge, index) => (
                <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                  <Warning sx={{ color: '#E74C3C', mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                    {challenge}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'white', height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#3498DB' }}>
                💡 Recommendations
              </Typography>
              {recommendations.map((recommendation, index) => (
                <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                  <Lightbulb sx={{ color: '#3498DB', mr: 1, mt: 0.5, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                    {recommendation}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // PDF Generation Functions
  const generatePDF = async (reportType) => {
    setGeneratingPdf(true);
    try {
      console.log('Generating PDF for report type:', reportType);
      console.log('Available data:', {
        pwdRegistrationData,
        cardDistributionData,
        benefitsDistributionData
      });
      
      const doc = new jsPDF();
      const currentDate = formatDateMMDDYYYY(new Date().toISOString());
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Add professional header with background
      doc.setFillColor(52, 152, 219); // Blue background
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      // Header text in white
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('PWD Management System', 20, 20);
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Reports & Analytics', 20, 35);
      
      // Generation date
      doc.setFontSize(10);
      doc.text(`Generated on: ${currentDate}`, pageWidth - 80, 35);
      
      // Reset text color for content
      doc.setTextColor(0, 0, 0);
      
      // Add report title with underline
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(getReportTitle(reportType), 20, 70);
      
      // Add underline
      doc.setDrawColor(52, 152, 219);
      doc.setLineWidth(2);
      doc.line(20, 75, pageWidth - 20, 75);
      
      let yPosition = 90;
      
      // Generate content based on report type
      switch (reportType) {
        case 'registration':
          await generatePWDRegistrationPDF(doc, yPosition, pageWidth);
          break;
        case 'cards':
          await generateCardDistributionPDF(doc, yPosition, pageWidth);
          break;
        case 'benefits':
          await generateBenefitsDistributionPDF(doc, yPosition, pageWidth);
          break;
        case 'complaints':
          await generateComplaintsAnalysisPDF(doc, yPosition, pageWidth);
          break;
        case 'performance':
          await generateBarangayPerformancePDF(doc, yPosition, pageWidth);
          break;
        case 'annual':
          await generateAnnualSummaryPDF(doc, yPosition, pageWidth);
          break;
        default:
          doc.text('Report content not available', 20, yPosition);
      }
      
      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('PWD Management System - Confidential Report', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      console.log('PDF generation completed successfully');
      
      // Convert to blob for preview
      const pdfBlob = doc.output('blob');
      console.log('PDF blob created:', pdfBlob);
      setPdfBlob(pdfBlob);
      setPdfPreviewOpen(true);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSnackbar({
        open: true,
        message: `Error generating PDF: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const getReportTitle = (reportType) => {
    const titles = {
      'registration': 'PWD Registration Report',
      'cards': 'Card Distribution Report',
      'benefits': 'Benefits Distribution Report',
      'complaints': 'Complaints Analysis Report',
      'performance': 'Barangay Performance Report',
      'annual': 'Annual Summary Report'
    };
    return titles[reportType] || 'Report';
  };

  const generatePWDRegistrationPDF = async (doc, startY, pageWidth) => {
    try {
      const { totalRegistrations, monthlyTrends, barangayDistribution, disabilityTypeDistribution } = pwdRegistrationData;
      
      // Summary Statistics Section
      doc.setFillColor(240, 248, 255); // Light blue background
      doc.rect(20, startY, pageWidth - 40, 40, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(52, 152, 219);
      doc.text('Summary Statistics', 30, startY + 15);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const statsY = startY + 25;
      doc.text(`Total Registrations: ${totalRegistrations || 0}`, 30, statsY);
      doc.text(`Active Barangays: ${barangayDistribution?.length || 0}`, 30, statsY + 10);
      doc.text(`Disability Types: ${disabilityTypeDistribution?.length || 0}`, 30, statsY + 20);
      
      let currentY = startY + 60;
      
      // Monthly trends table
      if (monthlyTrends && monthlyTrends.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        doc.text('Monthly Registration Trends', 20, currentY);
        currentY += 15;
        
        const tableData = monthlyTrends.map(trend => [
          trend.month || 'N/A',
          (trend.registrations || 0).toString(),
          (trend.applications || 0).toString()
        ]);
        
        doc.autoTable({
          startY: currentY,
          head: [['Month', 'Registrations', 'Applications']],
          body: tableData,
          theme: 'grid',
          headStyles: { 
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0]
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 10,
            cellPadding: 8
          }
        });
        
        currentY = doc.lastAutoTable.finalY + 20;
      } else {
        doc.setFontSize(12);
        doc.setTextColor(128, 128, 128);
        doc.text('No monthly trends data available', 20, currentY);
        currentY += 20;
      }
      
      // Barangay Distribution Section
      if (barangayDistribution && barangayDistribution.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        doc.text('Registration by Barangay', 20, currentY);
        currentY += 15;
        
        const barangayData = barangayDistribution.slice(0, 10).map(item => [
          item.barangay || 'N/A',
          (item.count || 0).toString(),
          `${((item.count || 0) / (totalRegistrations || 1) * 100).toFixed(1)}%`
        ]);
        
        doc.autoTable({
          startY: currentY,
          head: [['Barangay', 'Registrations', 'Percentage']],
          body: barangayData,
          theme: 'grid',
          headStyles: { 
            fillColor: [39, 174, 96],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0]
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 10,
            cellPadding: 8
          }
        });
      }
      
    } catch (error) {
      console.error('Error in generatePWDRegistrationPDF:', error);
      doc.setFontSize(12);
      doc.setTextColor(231, 76, 60);
      doc.text('Error generating registration data', 20, startY);
    }
  };

  const generateCardDistributionPDF = async (doc, startY, pageWidth) => {
    try {
      const { totalCardsIssued, totalCardsPending, monthlyCardTrends, cardStatusDistribution } = cardDistributionData;
      
      // Summary Statistics Section
      doc.setFillColor(240, 255, 240); // Light green background
      doc.rect(20, startY, pageWidth - 40, 40, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(39, 174, 96);
      doc.text('Card Distribution Summary', 30, startY + 15);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const statsY = startY + 25;
      doc.text(`Total Cards Issued: ${totalCardsIssued || 0}`, 30, statsY);
      doc.text(`Cards Pending: ${totalCardsPending || 0}`, 30, statsY + 10);
      doc.text(`Average Processing Time: ${cardDistributionData?.averageProcessingTime || 0} days`, 30, statsY + 20);
      
      let currentY = startY + 60;
      
      // Monthly trends table
      if (monthlyCardTrends && monthlyCardTrends.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(39, 174, 96);
        doc.text('Monthly Card Trends', 20, currentY);
        currentY += 15;
        
        const tableData = monthlyCardTrends.map(trend => [
          trend.month || 'N/A',
          (trend.cardsIssued || 0).toString(),
          (trend.cardsPending || 0).toString()
        ]);
        
        doc.autoTable({
          startY: currentY,
          head: [['Month', 'Cards Issued', 'Cards Pending']],
          body: tableData,
          theme: 'grid',
          headStyles: { 
            fillColor: [39, 174, 96],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0]
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 10,
            cellPadding: 8
          }
        });
        
        currentY = doc.lastAutoTable.finalY + 20;
      } else {
        doc.setFontSize(12);
        doc.setTextColor(128, 128, 128);
        doc.text('No monthly card trends data available', 20, currentY);
        currentY += 20;
      }
      
      // Card Status Distribution
      if (cardStatusDistribution && cardStatusDistribution.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(39, 174, 96);
        doc.text('Card Status Distribution', 20, currentY);
        currentY += 15;
        
        const statusData = cardStatusDistribution.map(status => [
          status.status || 'N/A',
          (status.count || 0).toString(),
          `${((status.count || 0) / ((totalCardsIssued || 0) + (totalCardsPending || 0)) * 100).toFixed(1)}%`
        ]);
        
        doc.autoTable({
          startY: currentY,
          head: [['Status', 'Count', 'Percentage']],
          body: statusData,
          theme: 'grid',
          headStyles: { 
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0]
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 10,
            cellPadding: 8
          }
        });
      }
      
    } catch (error) {
      console.error('Error in generateCardDistributionPDF:', error);
      doc.setFontSize(12);
      doc.setTextColor(231, 76, 60);
      doc.text('Error generating card distribution data', 20, startY);
    }
  };

  const generateBenefitsDistributionPDF = async (doc, startY, pageWidth) => {
    try {
      const { totalBenefitsDistributed, totalBenefitsPending, benefitTypeDistribution, barangayBenefitsDistribution } = benefitsDistributionData;
      
      // Summary Statistics Section
      doc.setFillColor(255, 240, 240); // Light red background
      doc.rect(20, startY, pageWidth - 40, 40, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(231, 76, 60);
      doc.text('Benefits Distribution Summary', 30, startY + 15);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const statsY = startY + 25;
      doc.text(`Total Benefits Distributed: ${totalBenefitsDistributed || 0}`, 30, statsY);
      doc.text(`Benefits Pending: ${totalBenefitsPending || 0}`, 30, statsY + 10);
      doc.text(`Average Benefit Amount: ₱${(benefitsDistributionData?.averageBenefitAmount || 0).toFixed(2)}`, 30, statsY + 20);
      
      let currentY = startY + 60;
      
      // Benefit Type Distribution
      if (benefitTypeDistribution && benefitTypeDistribution.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(231, 76, 60);
        doc.text('Benefit Type Distribution', 20, currentY);
        currentY += 15;
        
        const typeData = benefitTypeDistribution.map(type => [
          type.type || 'N/A',
          (type.count || 0).toString(),
          `₱${(type.totalAmount || 0).toFixed(2)}`
        ]);
        
        doc.autoTable({
          startY: currentY,
          head: [['Benefit Type', 'Count', 'Total Amount']],
          body: typeData,
          theme: 'grid',
          headStyles: { 
            fillColor: [231, 76, 60],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0]
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 10,
            cellPadding: 8
          }
        });
        
        currentY = doc.lastAutoTable.finalY + 20;
      } else {
        doc.setFontSize(12);
        doc.setTextColor(128, 128, 128);
        doc.text('No benefit type distribution data available', 20, currentY);
        currentY += 20;
      }
      
      // Barangay Benefits Distribution
      if (barangayBenefitsDistribution && barangayBenefitsDistribution.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(231, 76, 60);
        doc.text('Benefits by Barangay', 20, currentY);
        currentY += 15;
        
        const barangayData = barangayBenefitsDistribution.slice(0, 10).map(item => [
          item.barangay || 'N/A',
          (item.count || 0).toString(),
          `₱${(item.totalAmount || 0).toFixed(2)}`
        ]);
        
        doc.autoTable({
          startY: currentY,
          head: [['Barangay', 'Benefits Count', 'Total Amount']],
          body: barangayData,
          theme: 'grid',
          headStyles: { 
            fillColor: [155, 89, 182],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0]
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 10,
            cellPadding: 8
          }
        });
      }
      
    } catch (error) {
      console.error('Error in generateBenefitsDistributionPDF:', error);
      doc.setFontSize(12);
      doc.setTextColor(231, 76, 60);
      doc.text('Error generating benefits distribution data', 20, startY);
    }
  };

  const generateComplaintsAnalysisPDF = async (doc, startY, pageWidth) => {
    try {
      const { totalComplaints, resolvedComplaints, pendingComplaints, resolutionRate } = complaintsAnalysisData;
      
      // Summary Statistics Section
      doc.setFillColor(255, 248, 240); // Light orange background
      doc.rect(20, startY, pageWidth - 40, 40, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(243, 156, 18);
      doc.text('Complaints Analysis Summary', 30, startY + 15);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const statsY = startY + 25;
      doc.text(`Total Complaints: ${totalComplaints || 0}`, 30, statsY);
      doc.text(`Resolved Complaints: ${resolvedComplaints || 0}`, 30, statsY + 10);
      doc.text(`Pending Complaints: ${pendingComplaints || 0}`, 30, statsY + 20);
      
      let currentY = startY + 60;
      
      // Resolution Rate Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(243, 156, 18);
      doc.text('Resolution Performance', 20, currentY);
      currentY += 15;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`Resolution Rate: ${(resolutionRate || 0).toFixed(1)}%`, 20, currentY);
      doc.text(`Average Resolution Time: ${complaintsAnalysisData?.averageResolutionTime || 0} days`, 20, currentY + 10);
      
      // Visual indicator for resolution rate
      const resolutionRateValue = resolutionRate || 0;
      let rateColor = [231, 76, 60]; // Red for low rates
      if (resolutionRateValue >= 80) rateColor = [39, 174, 96]; // Green for high rates
      else if (resolutionRateValue >= 60) rateColor = [243, 156, 18]; // Orange for medium rates
      
      doc.setFillColor(...rateColor);
      doc.rect(20, currentY + 20, (resolutionRateValue / 100) * (pageWidth - 40), 8, 'F');
      
      // Rate indicator text
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('0%', 20, currentY + 35);
      doc.text('100%', pageWidth - 30, currentY + 35);
      
    } catch (error) {
      console.error('Error in generateComplaintsAnalysisPDF:', error);
      doc.setFontSize(12);
      doc.setTextColor(231, 76, 60);
      doc.text('Error generating complaints analysis data', 20, startY);
    }
  };

  const generateBarangayPerformancePDF = async (doc, startY, pageWidth) => {
    try {
      const { totalBarangays, topPerformingBarangays, performanceScore } = barangayPerformanceData;
      
      // Summary Statistics Section
      doc.setFillColor(248, 240, 255); // Light purple background
      doc.rect(20, startY, pageWidth - 40, 40, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(155, 89, 182);
      doc.text('Barangay Performance Summary', 30, startY + 15);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const statsY = startY + 25;
      doc.text(`Total Barangays: ${totalBarangays || 0}`, 30, statsY);
      doc.text(`Average Performance Score: ${(performanceScore || 0).toFixed(1)}`, 30, statsY + 10);
      
      let currentY = startY + 60;
      
      // Top Performing Barangays
      if (topPerformingBarangays && topPerformingBarangays.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(155, 89, 182);
        doc.text('Top Performing Barangays', 20, currentY);
        currentY += 15;
        
        const performanceData = topPerformingBarangays.map((barangay, index) => [
          `#${index + 1}`,
          barangay.barangay || 'N/A',
          (barangay.performanceScore || 0).toFixed(1),
          (barangay.registrations || 0).toString(),
          (barangay.cardsIssued || 0).toString(),
          (barangay.benefitsDistributed || 0).toString()
        ]);
        
        doc.autoTable({
          startY: currentY,
          head: [['Rank', 'Barangay', 'Score', 'Registrations', 'Cards', 'Benefits']],
          body: performanceData,
          theme: 'grid',
          headStyles: { 
            fillColor: [155, 89, 182],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0]
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 10,
            cellPadding: 8
          }
        });
        
        currentY = doc.lastAutoTable.finalY + 20;
        
        // Performance Score Visualization
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(155, 89, 182);
        doc.text('Performance Score Distribution', 20, currentY);
        currentY += 15;
        
        // Create a simple bar chart for top 5 barangays
        const maxScore = Math.max(...topPerformingBarangays.map(b => b.performanceScore || 0));
        const barWidth = (pageWidth - 80) / 5;
        
        topPerformingBarangays.slice(0, 5).forEach((barangay, index) => {
          const barHeight = ((barangay.performanceScore || 0) / maxScore) * 30;
          const x = 20 + (index * barWidth);
          const y = currentY + 30 - barHeight;
          
          // Bar
          doc.setFillColor(155, 89, 182);
          doc.rect(x, y, barWidth - 5, barHeight, 'F');
          
          // Label
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.text(barangay.barangay || 'N/A', x, currentY + 35, { 
            align: 'center',
            maxWidth: barWidth - 5
          });
          
          // Score
          doc.text((barangay.performanceScore || 0).toFixed(1), x, y - 5, { 
            align: 'center',
            maxWidth: barWidth - 5
          });
        });
      } else {
        doc.setFontSize(12);
        doc.setTextColor(128, 128, 128);
        doc.text('No barangay performance data available', 20, currentY);
      }
      
    } catch (error) {
      console.error('Error in generateBarangayPerformancePDF:', error);
      doc.setFontSize(12);
      doc.setTextColor(231, 76, 60);
      doc.text('Error generating barangay performance data', 20, startY);
    }
  };

  const generateAnnualSummaryPDF = async (doc, startY, pageWidth) => {
    try {
      const { year, totalRegistrations, totalCardsIssued, totalBenefitsDistributed, totalApplications, totalComplaints } = annualSummaryData;
      
      // Summary Statistics Section
      doc.setFillColor(240, 248, 255); // Light blue background
      doc.rect(20, startY, pageWidth - 40, 50, 'F');
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(52, 152, 219);
      doc.text(`Annual Summary Report ${year || new Date().getFullYear()}`, 30, startY + 15);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const statsY = startY + 30;
      doc.text(`Total Registrations: ${totalRegistrations || 0}`, 30, statsY);
      doc.text(`Total Cards Issued: ${totalCardsIssued || 0}`, 30, statsY + 10);
      doc.text(`Total Benefits Distributed: ${totalBenefitsDistributed || 0}`, 30, statsY + 20);
      doc.text(`Total Applications: ${totalApplications || 0}`, 30, statsY + 30);
      doc.text(`Total Complaints: ${totalComplaints || 0}`, 30, statsY + 40);
      
      let currentY = startY + 80;
      
      // Quarterly summary
      if (annualSummaryData?.quarterlySummary && annualSummaryData.quarterlySummary.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        doc.text('Quarterly Performance Summary', 20, currentY);
        currentY += 15;
        
        const quarterData = annualSummaryData.quarterlySummary.map(quarter => [
          quarter.quarter || 'N/A',
          (quarter.registrations || 0).toString(),
          (quarter.benefits || 0).toString(),
          (quarter.applications || 0).toString(),
          (quarter.complaints || 0).toString()
        ]);
        
        doc.autoTable({
          startY: currentY,
          head: [['Quarter', 'Registrations', 'Benefits', 'Applications', 'Complaints']],
          body: quarterData,
          theme: 'grid',
          headStyles: { 
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0]
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 10,
            cellPadding: 8
          }
        });
        
        currentY = doc.lastAutoTable.finalY + 20;
        
        // Year-over-year growth visualization
        if (annualSummaryData?.yearOverYearGrowth) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(52, 152, 219);
          doc.text('Year-over-Year Growth', 20, currentY);
          currentY += 15;
          
          const growthData = annualSummaryData.yearOverYearGrowth;
          const growthItems = [
            { label: 'Registrations', value: growthData.registrations || 0 },
            { label: 'Cards Issued', value: growthData.cardsIssued || 0 },
            { label: 'Benefits', value: growthData.benefitsDistributed || 0 },
            { label: 'Applications', value: growthData.applications || 0 }
          ];
          
          growthItems.forEach((item, index) => {
            const y = currentY + (index * 15);
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`${item.label}:`, 20, y);
            
            // Growth bar
            const barWidth = Math.abs(item.value) * 2; // Scale for visibility
            const barX = 80;
            const barColor = item.value >= 0 ? [39, 174, 96] : [231, 76, 60];
            
            doc.setFillColor(...barColor);
            doc.rect(barX, y - 3, barWidth, 6, 'F');
            
            // Growth percentage
            doc.text(`${item.value >= 0 ? '+' : ''}${item.value.toFixed(1)}%`, barX + barWidth + 5, y);
          });
        }
      } else {
        doc.setFontSize(12);
        doc.setTextColor(128, 128, 128);
        doc.text('No quarterly summary data available', 20, currentY);
      }
      
    } catch (error) {
      console.error('Error in generateAnnualSummaryPDF:', error);
      doc.setFontSize(12);
      doc.setTextColor(231, 76, 60);
      doc.text('Error generating annual summary data', 20, startY);
    }
  };

  const handleDownloadPDF = () => {
    if (pdfBlob) {
      try {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${getReportTitle(selectedReportData?.reportType)}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setPdfPreviewOpen(false);
        
        console.log('PDF download initiated successfully');
      } catch (error) {
        console.error('Error downloading PDF:', error);
        toastService.error('Failed to download PDF: ' + (error.message || 'Unknown error'));
      }
    } else {
      console.error('No PDF blob available for download');
      toastService.warning('No PDF available to download. Please generate the report first.');
    }
  };

  const handleClosePdfPreview = () => {
    setPdfPreviewOpen(false);
    setPdfBlob(null);
  };


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
      <AdminSidebar />
      
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        ml: '280px',
        width: 'calc(100% - 280px)',
        p: 3
      }}>


        <Paper sx={{ ...cardStyles, bgcolor: 'white', p: { xs: 2, md: 5 }, m: { xs: 1, md: 2 } }}>
          
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, md: 5 }, p: 2 }}>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 700, 
              color: '#2C3E50',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
            }}>
              Reports & Analytics
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel sx={{ color: '#7F8C8D' }}>Report Type</InputLabel>
                <Select
                  value={selectedReport}
                  label="Report Type"
                  onChange={(e) => setSelectedReport(e.target.value)}
                  sx={{
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#E0E0E0' },
                      '&:hover fieldset': { borderColor: '#BDC3C7' },
                      '&.Mui-focused fieldset': { borderColor: '#3498DB' },
                    },
                    '& .MuiSelect-select': { color: '#2C3E50' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: 'white',
                        border: '1px solid #E0E0E0',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '& .MuiMenuItem-root': {
                          color: '#2C3E50',
                          '&:hover': {
                            bgcolor: '#f5f5f5'
                          },
                          '&.Mui-selected': {
                            bgcolor: '#E8F4FD',
                            '&:hover': {
                              bgcolor: '#E8F4FD'
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="">All Reports</MenuItem>
                  <MenuItem value="registration">Registration</MenuItem>
                  <MenuItem value="cards">Card Distribution</MenuItem>
                  <MenuItem value="benefits">Benefits</MenuItem>
                  <MenuItem value="complaints">Complaints</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: '#7F8C8D' }}>Date Range</InputLabel>
                <Select
                  value={selectedDateRange}
                  label="Date Range"
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  sx={{
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#E0E0E0' },
                      '&:hover fieldset': { borderColor: '#BDC3C7' },
                      '&.Mui-focused fieldset': { borderColor: '#3498DB' },
                    },
                    '& .MuiSelect-select': { color: '#2C3E50' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: 'white',
                        border: '1px solid #E0E0E0',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        '& .MuiMenuItem-root': {
                          color: '#2C3E50',
                          '&:hover': {
                            bgcolor: '#f5f5f5'
                          },
                          '&.Mui-selected': {
                            bgcolor: '#E8F4FD',
                            '&:hover': {
                              bgcolor: '#E8F4FD'
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="quarter">This Quarter</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Grid container spacing={4} sx={{ mb: 5, mt: 2 }}>
            {filteredReports.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8, 
                  bgcolor: '#F8F9FA', 
                  borderRadius: 3, 
                  border: '1px solid #E0E0E0' 
                }}>
                  <Typography variant="h6" sx={{ color: '#7F8C8D', mb: 2 }}>
                    No reports found for the selected filter
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#95A5A6' }}>
                    Try selecting a different report type or "All Reports"
                  </Typography>
                </Box>
              </Grid>
            ) : (
              filteredReports.map((report) => (
                <Grid item xs={12} sm={6} md={4} key={report.id}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    border: '1px solid #E0E0E0',
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'white',
                    m: 2,
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: `${report.color}15`,
                        mr: 2
                      }}>
                        {React.cloneElement(report.icon, { sx: { color: report.color, fontSize: 24 } })}
                      </Box>
                      <Chip 
                        label={report.status} 
                        color={getStatusColor(report.status)} 
                        size="small" 
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1, color: '#2C3E50', fontSize: '1.1rem' }}>
                      {report.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7F8C8D', mb: 2, lineHeight: 1.5 }}>
                      {report.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#95A5A6', fontWeight: 500 }}>
                      Last updated: {report.lastUpdated}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0, borderTop: '1px solid #F0F0F0', mx: 2 }}>
                    <Button 
                      size="small" 
                      startIcon={<Visibility />}
                      onClick={() => handleReportClick(report)}
                      sx={{ 
                        color: report.color, 
                        fontWeight: 600,
                        '&:hover': { bgcolor: `${report.color}10` }
                      }}
                    >
                      View Report
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={generating[report.reportType] ? <CircularProgress size={16} /> : <Download />}
                      disabled={generating[report.reportType]}
                      onClick={() => handleGenerateReport(report.reportType)}
                      sx={{ 
                        color: report.color, 
                        fontWeight: 600,
                        '&:hover': { bgcolor: `${report.color}10` }
                      }}
                    >
                      {generating[report.reportType] ? 'Generating...' : 'Generate'}
                    </Button>
                    <IconButton 
                      size="small" 
                      sx={{ color: '#7F8C8D', '&:hover': { bgcolor: '#F0F0F0' } }}
                      onClick={() => generatePDF(report.reportType)}
                      disabled={generatingPdf}
                    >
                      <Print />
                    </IconButton>
                  </CardActions>
                </Card>
                </Grid>
              ))
            )}
          </Grid>


        {/* Report Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth sx={{ ...dialogStyles, '& .MuiDialog-paper': { bgcolor: 'white', borderRadius: 3, p: 3, m: 2 } }}>
          <DialogTitle sx={{ ...dialogTitleStyles, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {selectedReportData && React.cloneElement(selectedReportData.icon, { 
                sx: { color: selectedReportData.color, fontSize: 24 } 
              })}
              <Typography variant="h6">
                {selectedReportData?.title}
              </Typography>
            </Box>
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
                ) : selectedReportData.reportType === 'performance' ? (
                  renderBarangayPerformanceReport()
                ) : selectedReportData.reportType === 'annual' ? (
                  renderAnnualSummaryReport()
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
          <DialogActions sx={{ ...dialogActionsStyles, bgcolor: 'white', p: 5, m: 1 }}>
            <Button onClick={handleCloseDialog}>Close</Button>
            <Button 
              variant="contained" 
              startIcon={<Download />}
              sx={{ 
                bgcolor: '#27AE60',
                '&:hover': { 
                  bgcolor: '#229954' 
                }
              }}
            >
              Download Report
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
        
        {/* PDF Preview Dialog */}
        <Dialog
          open={pdfPreviewOpen}
          onClose={handleClosePdfPreview}
          maxWidth="xl"
          fullWidth
          fullScreen={false}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minHeight: '80vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #E8E8E8',
            pb: 2
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50' }}>
              PDF Preview - {selectedReportData?.title}
            </Typography>
            <IconButton onClick={handleClosePdfPreview} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            {pdfBlob && (
              <Box sx={{ 
                width: '100%', 
                height: '70vh', 
                border: '1px solid #E8E8E8',
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                <iframe
                  src={URL.createObjectURL(pdfBlob)}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="PDF Preview"
                />
              </Box>
            )}
            
            {generatingPdf && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '70vh',
                flexDirection: 'column',
                gap: 2
              }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ color: '#7F8C8D' }}>
                  Generating PDF...
                </Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            borderTop: '1px solid #E8E8E8', 
            pt: 2, 
            px: 3,
            justifyContent: 'space-between'
          }}>
            <Button 
              onClick={handleClosePdfPreview}
              variant="outlined"
              sx={{ 
                borderColor: '#7F8C8D', 
                color: '#7F8C8D',
                '&:hover': { 
                  borderColor: '#5A5A5A', 
                  bgcolor: '#F8F8F8' 
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDownloadPDF}
              variant="contained"
              disabled={!pdfBlob}
              sx={{ 
                bgcolor: '#3498DB',
                '&:hover': { bgcolor: '#2980B9' },
                px: 3
              }}
              startIcon={<Download />}
            >
              Download PDF
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Contextual Suggestions Dialog removed */}
      </Paper>
    </Box>
  </Box>
  );
};

export default Reports;
