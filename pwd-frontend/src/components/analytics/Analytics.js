import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  ListItemText
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import AdminSidebar from '../shared/AdminSidebar';
import pwdMemberService from '../../services/pwdMemberService';
import { applicationService } from '../../services/applicationService';
import benefitService from '../../services/benefitService';
import { supportService } from '../../services/supportService';

// All 18 Barangays in Cabuyao
const ALL_BARANGAYS = [
  'Baclaran',
  'Banay-Banay',
  'Banlic',
  'Bigaa',
  'Butong',
  'Casile',
  'Diezmo',
  'Gulod',
  'Mamatid',
  'Marinig',
  'Niugan',
  'Pittland',
  'Pulo',
  'Sala',
  'San Isidro',
  'Barangay I Poblacion',
  'Barangay II Poblacion',
  'Barangay III Poblacion'
];

// Disability types from application form (must match exactly)
const DISABILITY_TYPES = [
  'Visual Impairment',
  'Hearing Impairment',
  'Speech and Language Impairment',
  'Intellectual Disability',
  'Mental Health Condition',
  'Learning Disability',
  'Psychosocial Disability',
  'Autism Spectrum Disorder',
  'ADHD',
  'Physical Disability',
  'Orthopedic/Physical Disability',
  'Chronic Illness',
  'Multiple Disabilities'
];

// Gauge Chart Component
const GaugeChart = ({ value, min = 0, max = 100, title, color = '#3498DB' }) => {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const radius = 70;
  const centerX = 100;
  const centerY = 100;
  
  // Calculate angle for needle (0 to 180 degrees for semi-circle)
  const angle = (percentage / 100) * 180;
  const angleRad = (angle - 90) * (Math.PI / 180);
  const needleX = centerX + radius * Math.cos(angleRad);
  const needleY = centerY + radius * Math.sin(angleRad);
  
  // Arc path for semi-circle
  const pathDescription = `
    M ${centerX - radius} ${centerY}
    A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}
  `;
  
  // Calculate stroke-dasharray and offset for the colored arc
  const circumference = Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50', fontSize: '0.95rem' }}>
        {title}
      </Typography>
      <Box sx={{ position: 'relative', width: 200, height: 120 }}>
        <svg width="200" height="120" viewBox="0 0 200 120" style={{ overflow: 'visible' }}>
          {/* Background arc */}
          <path
            d={pathDescription}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={pathDescription}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
          {/* Needle */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="#2C3E50"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Center circle */}
          <circle cx={centerX} cy={centerY} r="6" fill="#2C3E50" />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            top: '75px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            width: '100%'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '2rem' }}>
            {value.toFixed(1)}%
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 1, px: 2 }}>
        <Typography variant="caption" sx={{ color: '#7F8C8D', fontSize: '0.7rem' }}>{min}</Typography>
        <Typography variant="caption" sx={{ color: '#7F8C8D', fontSize: '0.7rem' }}>{max}</Typography>
      </Box>
    </Box>
  );
};

const Analytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // KPI Cards Data - PWD System Metrics
  const [kpiData, setKpiData] = useState({
    totalRegistrations: 0, // Total PWD members registered
    pendingApplications: 0, // Pending applications
    approvedApplications: 0, // Approved applications
    cardsIssued: 0, // Total cards issued/renewed
    benefitsDistributed: 0, // Total benefits distributed
    ticketsResolved: 0 // Support tickets resolved
  });

  // Monthly Registration Trends
  const [monthlyRegistrations, setMonthlyRegistrations] = useState([]);
  
  // Gauge data
  const [approvalRate, setApprovalRate] = useState(0); // Approval rate percentage
  const [resolutionRate, setResolutionRate] = useState(0); // Support ticket resolution rate
  
  // Charts data
  const [topBarangays, setTopBarangays] = useState([]);
  const [monthlyCardIssuance, setMonthlyCardIssuance] = useState([]);
  const [benefitTypeDistribution, setBenefitTypeDistribution] = useState([]);
  const [disabilityDistribution, setDisabilityDistribution] = useState([]);

  // Filters
  const [dateRange, setDateRange] = useState('all'); // all | month | quarter | year
  const [selectedBarangays, setSelectedBarangays] = useState([]);
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [selectedBenefitTypes, setSelectedBenefitTypes] = useState([]);
  const [statusFilters, setStatusFilters] = useState({ pending: true, approved: true });
  const [ticketFilters, setTicketFilters] = useState({ open: true, resolved: true });

  // Filter modal and details modal
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailType, setDetailType] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Allowed benefit types (case-insensitive match)
  const ALLOWED_BENEFIT_TYPES = useMemo(() => ['Financial Assistance', 'Birthday Cash Gift'], []);
  const ALLOWED_BENEFIT_TYPES_LOWER = useMemo(() => ALLOWED_BENEFIT_TYPES.map(t => t.toLowerCase()), [ALLOWED_BENEFIT_TYPES]);

  // Use fixed lists for consistency
  const uniqueBarangays = useMemo(() => ALL_BARANGAYS, []);
  const uniqueDisabilities = useMemo(() => DISABILITY_TYPES, []);

  const uniqueBenefitTypes = useMemo(() => ALLOWED_BENEFIT_TYPES, [ALLOWED_BENEFIT_TYPES]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch PWD members data
      let members = [];
      let totalMembers = 0;
      try {
        const membersResp = await pwdMemberService.getAll();
        members = membersResp?.data?.members || membersResp?.data || (Array.isArray(membersResp) ? membersResp : []) || [];
        totalMembers = Array.isArray(members) ? members.length : 0;
      } catch (memberError) {
        console.warn('Error fetching PWD members, using defaults:', memberError);
        members = [];
        totalMembers = 0;
      }
      
      // Fetch applications data
      let applications = [];
      let totalApplications = 0;
      let pendingApplications = 0;
      let approvedApplications = 0;
      try {
        const appsResp = await applicationService.getAll();
        applications = appsResp?.data || (Array.isArray(appsResp) ? appsResp : []) || [];
        totalApplications = Array.isArray(applications) ? applications.length : 0;
        pendingApplications = applications.filter(app => app?.status === 'pending' || app?.status === 'Pending').length;
        approvedApplications = applications.filter(app => app?.status === 'approved' || app?.status === 'Approved').length;
      } catch (appError) {
        console.warn('Error fetching applications, using defaults:', appError);
        applications = [];
        totalApplications = 0;
        pendingApplications = 0;
        approvedApplications = 0;
      }
      
      // Fetch benefits data
      let benefits = [];
      let totalBenefits = 0;
      try {
        const benefitsResp = await benefitService.getAll();
        benefits = benefitsResp?.data || (Array.isArray(benefitsResp) ? benefitsResp : []) || [];
        // Keep only allowed benefit types
        benefits = Array.isArray(benefits)
          ? benefits.filter(b => {
              const t = (b?.benefit_type || b?.type || b?.category || '').toString().toLowerCase();
              return ALLOWED_BENEFIT_TYPES_LOWER.includes(t);
            })
          : [];
        totalBenefits = benefits.length;
      } catch (benefitError) {
        console.warn('Error fetching benefits, using defaults:', benefitError);
        benefits = [];
        totalBenefits = 0;
      }
      
      // Fetch support tickets data
      let tickets = [];
      let resolvedTickets = 0;
      try {
        const ticketsResp = await supportService.getTickets();
        tickets = ticketsResp?.data || (Array.isArray(ticketsResp) ? ticketsResp : []) || [];
        resolvedTickets = tickets.filter(ticket => ticket?.status === 'resolved' || ticket?.status === 'closed').length;
      } catch (ticketError) {
        console.warn('Error fetching support tickets, using defaults:', ticketError);
        tickets = [];
        resolvedTickets = 0;
      }
      
      // Calculate cards issued (assuming members with card numbers or card status)
      let cardsIssued = 0;
      if (Array.isArray(members)) {
        cardsIssued = members.filter(member => 
          member?.pwd_card_number || member?.card_number || member?.card_status === 'issued' || member?.card_status === 'active'
        ).length;
      }
      
      // Expose raw data for filtering
      window.__analytics_members = members;
      window.__analytics_applications = applications;
      window.__analytics_benefits = benefits;
      window.__analytics_tickets = tickets;

      // Initial KPI compute (unfiltered)
      setKpiData(prev => ({
        ...prev,
        totalRegistrations: totalMembers,
        pendingApplications: pendingApplications,
        approvedApplications: approvedApplications,
        cardsIssued: cardsIssued || totalMembers,
        benefitsDistributed: totalBenefits,
        ticketsResolved: resolvedTickets
      }));
      
      // Calculate approval rate
      const approvalRateCalc = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;
      setApprovalRate(approvalRateCalc);
      
      // Calculate resolution rate
      const totalTickets = tickets.length;
      const resolutionRateCalc = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;
      setResolutionRate(resolutionRateCalc);
      
      // Generate monthly registration trends (last 6 months)
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      }
      
      const monthlyRegData = months.map(month => {
        // Count registrations per month
        let count = 0;
        if (Array.isArray(members)) {
          members.forEach(member => {
            if (member && typeof member === 'object') {
              const regDate = member.created_at || member.createdAt || member.registration_date || member.date_registered;
              if (regDate) {
                const memberDate = new Date(regDate);
                const monthStr = memberDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                if (monthStr === month) {
                  count++;
                }
              }
            }
          });
        }
        return { month, registrations: count || 0 };
      });
      setMonthlyRegistrations(monthlyRegData);
      
      // Generate monthly card issuance trends
      const monthlyCardData = months.map(month => {
        let count = 0;
        if (Array.isArray(members)) {
          members.forEach(member => {
            if (member && typeof member === 'object' && (member.pwd_card_number || member.card_number)) {
              const cardDate = member.card_issued_date || member.card_date || member.created_at || member.createdAt;
              if (cardDate) {
                const cardDateObj = new Date(cardDate);
                const monthStr = cardDateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                if (monthStr === month) {
                  count++;
                }
              }
            }
          });
        }
        return { month, cards: count || 0 };
      });
      setMonthlyCardIssuance(monthlyCardData);
      
      // Top 5 Barangays by registrations
      const barangayCounts = {};
      if (Array.isArray(members)) {
        members.forEach(member => {
          if (member && typeof member === 'object') {
            const barangay = member.barangay || member.barangay_name || member.barangayName || 'Unknown';
            barangayCounts[barangay] = (barangayCounts[barangay] || 0) + 1;
          }
        });
      }
      const top5 = Object.entries(barangayCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({
          name: name.length > 25 ? name.substring(0, 22) + '...' : name,
          value: value
        }));
      
      if (top5.length === 0) {
        setTopBarangays([
          { name: 'No data available', value: 0 }
        ]);
      } else {
        setTopBarangays(top5);
      }
      
      // Benefit Type Distribution
      const benefitTypeCounts = {};
      if (Array.isArray(benefits)) {
        benefits.forEach(benefit => {
          if (benefit && typeof benefit === 'object') {
            const type = benefit.benefit_type || benefit.type || benefit.category || 'Other';
            benefitTypeCounts[type] = (benefitTypeCounts[type] || 0) + 1;
          }
        });
      }
      const benefitDist = Object.entries(benefitTypeCounts).map(([name, value]) => ({
        name,
        value: value
      }));
      
      if (benefitDist.length === 0) {
        setBenefitTypeDistribution([
          { name: 'No benefits data', value: 0 }
        ]);
      } else {
        setBenefitTypeDistribution(benefitDist);
      }
      
      // Disability Type Distribution
      const disabilityCounts = {};
      if (Array.isArray(members)) {
        members.forEach(member => {
          if (member && typeof member === 'object') {
            const disability = member.disability_type || member.type_of_disability || member.disability || 'Not Specified';
            disabilityCounts[disability] = (disabilityCounts[disability] || 0) + 1;
          }
        });
      }
      const disabilityDist = Object.entries(disabilityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([name, value]) => ({
          name: name.length > 20 ? name.substring(0, 17) + '...' : name,
          value: value
        }));
      
      if (disabilityDist.length === 0) {
        setDisabilityDistribution([
          { name: 'No data available', value: 0 }
        ]);
      } else {
        setDisabilityDistribution(disabilityDist);
      }
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helpers for date range filtering
  const getDateRange = (range) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (range) {
      case 'month': {
        const d = new Date(startOfDay);
        d.setMonth(d.getMonth() - 1);
        return { start: d, end: now };
      }
      case 'quarter': {
        const d = new Date(startOfDay);
        d.setMonth(d.getMonth() - 3);
        return { start: d, end: now };
      }
      case 'year': {
        const d = new Date(startOfDay);
        d.setFullYear(d.getFullYear() - 1);
        return { start: d, end: now };
      }
      default:
        return null;
    }
  };

  const isInRange = (isoDate) => {
    if (!dateRange || dateRange === 'all') return true;
    const range = getDateRange(dateRange);
    if (!range) return true;
    const dt = new Date(isoDate);
    return !isNaN(dt.getTime()) && dt >= range.start && dt <= range.end;
  };

  // Apply filters and recompute KPIs/charts
  const filtered = useMemo(() => {
    const members = window.__analytics_members || [];
    const apps = window.__analytics_applications || [];
    const benefits = window.__analytics_benefits || [];
    const tickets = window.__analytics_tickets || [];

    const filteredMembers = members.filter(m => {
      const b = m?.barangay || m?.barangay_name || m?.barangayName;
      const d = m?.disability_type || m?.type_of_disability || m?.disability;
      const regDate = m?.created_at || m?.createdAt || m?.registration_date || m?.date_registered;
      const barangayOk = selectedBarangays.length === 0 || (b && selectedBarangays.includes(b));
      const disabilityOk = selectedDisabilities.length === 0 || (d && selectedDisabilities.includes(d));
      const dateOk = !regDate || isInRange(regDate);
      return barangayOk && disabilityOk && dateOk;
    });

    const filteredApps = apps.filter(a => {
      const statusOk = (statusFilters.pending && (a?.status === 'pending' || a?.status === 'Pending')) ||
                       (statusFilters.approved && (a?.status === 'approved' || a?.status === 'Approved'));
      const dateOk = !a?.created_at || isInRange(a?.created_at);
      return statusOk && dateOk;
    });

    const filteredBenefits = benefits.filter(b => {
      const type = b?.benefit_type || b?.type || b?.category;
      const typeLower = (type || '').toString().toLowerCase();
      const allowedOk = ALLOWED_BENEFIT_TYPES_LOWER.includes(typeLower);
      const typeOk = (selectedBenefitTypes.length === 0 || (type && selectedBenefitTypes.includes(type))) && allowedOk;
      const dateOk = !b?.created_at || isInRange(b?.created_at);
      return typeOk && dateOk;
    });

    const filteredTickets = tickets.filter(t => {
      const status = (t?.status || '').toLowerCase();
      const statusOk = (ticketFilters.open && (status === 'open' || status === 'pending')) ||
                       (ticketFilters.resolved && (status === 'resolved' || status === 'closed'));
      const dateOk = !t?.created_at || isInRange(t?.created_at);
      return statusOk && dateOk;
    });

    return { filteredMembers, filteredApps, filteredBenefits, filteredTickets };
  }, [dateRange, selectedBarangays, selectedDisabilities, selectedBenefitTypes, statusFilters, ticketFilters]);

  // Recompute KPIs and charts based on filtered data
  useEffect(() => {
    const { filteredMembers, filteredApps, filteredBenefits, filteredTickets } = filtered;
    const totalMembers = filteredMembers.length;
    const pendingApps = filteredApps.filter(a => a?.status?.toLowerCase() === 'pending').length;
    const approvedApps = filteredApps.filter(a => a?.status?.toLowerCase() === 'approved').length;
    const cardsIssued = filteredMembers.filter(m => m?.pwd_card_number || m?.card_number || m?.card_status === 'issued' || m?.card_status === 'active').length;
    const resolvedTickets = filteredTickets.filter(t => ['resolved', 'closed'].includes((t?.status || '').toLowerCase())).length;

    setKpiData(prev => ({
      ...prev,
      totalRegistrations: totalMembers,
      pendingApplications: pendingApps,
      approvedApplications: approvedApps,
      cardsIssued: cardsIssued,
      benefitsDistributed: filteredBenefits.length,
      ticketsResolved: resolvedTickets
    }));

    // Update charts
    // Monthly registrations
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
    setMonthlyRegistrations(months.map(month => {
      const count = filteredMembers.reduce((acc, m) => {
        const d = m?.created_at || m?.createdAt || m?.registration_date || m?.date_registered;
        if (d) {
          const ds = new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          if (ds === month) return acc + 1;
        }
        return acc;
      }, 0);
      return { month, registrations: count };
    }));

    // Monthly card issuance
    setMonthlyCardIssuance(months.map(month => {
      const count = filteredMembers.reduce((acc, m) => {
        const d = m?.card_issued_date || m?.card_date || m?.created_at || m?.createdAt;
        if ((m?.pwd_card_number || m?.card_number) && d) {
          const ds = new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          if (ds === month) return acc + 1;
        }
        return acc;
      }, 0);
      return { month, cards: count };
    }));

    // Top barangays
    const counts = {};
    filteredMembers.forEach(m => {
      const b = m?.barangay || m?.barangay_name || m?.barangayName || 'Unknown';
      counts[b] = (counts[b] || 0) + 1;
    });
    const top5 = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,value])=>({name, value}));
    setTopBarangays(top5.length ? top5 : [{ name: 'No data', value: 0 }]);

    // Benefit type distribution
    const typeCounts = {};
    filteredBenefits.forEach(b => {
      const t = b?.benefit_type || b?.type || b?.category || 'Other';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    const bd = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    setBenefitTypeDistribution(bd.length ? bd : [{ name: 'No data', value: 0 }]);

    // Disability distribution
    const disCounts = {};
    filteredMembers.forEach(m => {
      const d = m?.disability_type || m?.type_of_disability || m?.disability || 'Not Specified';
      disCounts[d] = (disCounts[d] || 0) + 1;
    });
    const dd = Object.entries(disCounts).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,value])=>({name, value}));
    setDisabilityDistribution(dd.length ? dd : [{ name: 'No data', value: 0 }]);

    // Gauges
    const totalApps = filteredApps.length;
    setApprovalRate(totalApps > 0 ? (approvedApps / totalApps) * 100 : 0);
    const totalTickets = filteredTickets.length;
    setResolutionRate(totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0);
  }, [filtered]);

  const formatNumber = (value) => {
    return value.toLocaleString();
  };

  const KPICard = ({ title, value, icon, formatFn = formatNumber }) => (
    <Card sx={{ 
      height: '100%', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
      borderRadius: 2,
      bgcolor: '#FFFFFF',
      border: '1px solid #E0E0E0'
    }}>
      <CardContent sx={{ position: 'relative', pb: '16px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="body2" sx={{ color: '#7F8C8D', fontSize: '0.875rem' }}>
            {title}
          </Typography>
          <IconButton size="small" sx={{ p: 0.5, color: '#7F8C8D' }}>
            <InfoIcon sx={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50' }}>
          {formatFn(value)}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const COLORS = ['#3498DB', '#1ABC9C', '#9B59B6', '#E74C3C', '#F39C12', '#34495E', '#E67E22'];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <Box sx={{ 
        flexGrow: 1, 
        ml: { md: sidebarOpen ? '280px' : '0', xs: 0 },
        transition: 'margin-left 0.3s ease-in-out',
        p: 3
      }}>
        {/* Header & Filters */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50' }}>
            PDAO Analytics Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={fetchAnalyticsData} sx={{ color: '#7F8C8D' }}>
              <RefreshIcon />
            </IconButton>
            <IconButton sx={{ color: '#7F8C8D' }}>
              <FullscreenIcon />
            </IconButton>
            <IconButton sx={{ color: '#7F8C8D' }}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Filter Row */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Date Range</InputLabel>
            <Select label="Date Range" value={dateRange} onChange={(e)=>setDateRange(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last 90 Days</MenuItem>
              <MenuItem value="year">Last 12 Months</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Barangays</InputLabel>
            <Select
              multiple
              label="Barangays"
              value={selectedBarangays}
              onChange={(e) => {
                const value = e.target.value;
                // Filter out "All Barangays" if it was added
                const filteredValue = value.filter(v => v !== 'All Barangays');
                
                // If clicked on "All Barangays" toggle option
                if (value.includes('All Barangays') && !filteredValue.includes('All Barangays')) {
                  if (selectedBarangays.length === ALL_BARANGAYS.length) {
                    setSelectedBarangays([]);
                  } else {
                    setSelectedBarangays(ALL_BARANGAYS);
                  }
                } else {
                  // If all barangays are selected, keep all; otherwise use filtered selection
                  if (filteredValue.length === ALL_BARANGAYS.length) {
                    setSelectedBarangays(ALL_BARANGAYS);
                  } else {
                    setSelectedBarangays(filteredValue);
                  }
                }
              }}
              renderValue={(selected) => {
                if (selected.length === 0) return 'None selected';
                if (selected.length === ALL_BARANGAYS.length) return 'All Barangays';
                if (selected.length > 3) return `${selected.length} barangays selected`;
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                );
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 250,
                  },
                },
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
              }}
            >
              <MenuItem 
                value="All Barangays"
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedBarangays.length === ALL_BARANGAYS.length) {
                    setSelectedBarangays([]);
                  } else {
                    setSelectedBarangays(ALL_BARANGAYS);
                  }
                }}
              >
                <Checkbox checked={selectedBarangays.length === ALL_BARANGAYS.length} />
                <ListItemText primary="All Barangays" />
              </MenuItem>
              {(uniqueBarangays || []).map(b => (
                <MenuItem key={b} value={b}>
                  <Checkbox checked={selectedBarangays.includes(b)} />
                  <ListItemText primary={b} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Disability Types</InputLabel>
            <Select
              multiple
              label="Disability Types"
              value={selectedDisabilities}
              onChange={(e)=>setSelectedDisabilities(e.target.value)}
              renderValue={(selected) => {
                if (selected.length === 0) return 'None selected';
                if (selected.length > 3) return `${selected.length} types selected`;
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                );
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: 280,
                  },
                },
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
              }}
            >
              {(uniqueDisabilities || []).map(d => (
                <MenuItem key={d} value={d}>
                  <Checkbox checked={selectedDisabilities.includes(d)} />
                  <ListItemText primary={d} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={()=>setFiltersOpen(true)}>Advanced Filters</Button>
          <Button variant="text" onClick={()=>{
            setDateRange('all');
            setSelectedBarangays([]);
            setSelectedDisabilities([]);
            setSelectedBenefitTypes([]);
            setStatusFilters({ pending: true, approved: true });
            setTicketFilters({ open: true, resolved: true });
          }}>Reset Filters</Button>
        </Box>

        {/* Top Row - KPI Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <div onClick={()=>{ setDetailType('registrations'); setDetailsOpen(true); }}>
              <KPICard title="Total Registrations" value={kpiData.totalRegistrations} />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <div onClick={()=>{ setDetailType('pending'); setDetailsOpen(true); }}>
              <KPICard title="Pending Applications" value={kpiData.pendingApplications} />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <div onClick={()=>{ setDetailType('approved'); setDetailsOpen(true); }}>
              <KPICard title="Approved Applications" value={kpiData.approvedApplications} />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <div onClick={()=>{ setDetailType('cards'); setDetailsOpen(true); }}>
              <KPICard title="Cards Issued/Renewed" value={kpiData.cardsIssued} />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <div onClick={()=>{ setDetailType('benefits'); setDetailsOpen(true); }}>
              <KPICard title="Benefits Distributed" value={kpiData.benefitsDistributed} />
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <div onClick={()=>{ setDetailType('tickets'); setDetailsOpen(true); }}>
              <KPICard title="Tickets Resolved" value={kpiData.ticketsResolved} />
            </div>
          </Grid>
        </Grid>

        {/* Advanced Filters Modal */}
        <Dialog open={filtersOpen} onClose={()=>setFiltersOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel control={<Checkbox checked={statusFilters.pending} onChange={(e)=>setStatusFilters(s=>({ ...s, pending: e.target.checked }))} />} label="Include Pending Applications" />
              <FormControlLabel control={<Checkbox checked={statusFilters.approved} onChange={(e)=>setStatusFilters(s=>({ ...s, approved: e.target.checked }))} />} label="Include Approved Applications" />
              <FormControlLabel control={<Checkbox checked={ticketFilters.open} onChange={(e)=>setTicketFilters(s=>({ ...s, open: e.target.checked }))} />} label="Include Open Tickets" />
              <FormControlLabel control={<Checkbox checked={ticketFilters.resolved} onChange={(e)=>setTicketFilters(s=>({ ...s, resolved: e.target.checked }))} />} label="Include Resolved Tickets" />

              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Benefit Types</InputLabel>
                <Select
                  multiple
                  label="Benefit Types"
                  value={selectedBenefitTypes}
                  onChange={(e)=>setSelectedBenefitTypes(e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 250,
                        width: 250,
                      },
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                  }}
                >
                  {(uniqueBenefitTypes || []).map(t => (
                    <MenuItem key={t} value={t}>
                      <Checkbox checked={selectedBenefitTypes.includes(t)} />
                      <ListItemText primary={t} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setFiltersOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Details Modal */}
        <Dialog open={detailsOpen} onClose={()=>setDetailsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Details - {detailType && detailType.toUpperCase()}</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" sx={{ mb: 2 }}>
              The view reflects your current filters. Use the filter bar to refine or broaden the analysis.
            </Typography>
            {detailType === 'registrations' && (
              <Typography variant="body2">Total registrations across selected scope: {kpiData.totalRegistrations.toLocaleString()}.</Typography>
            )}
            {detailType === 'pending' && (
              <Typography variant="body2">Pending applications: {kpiData.pendingApplications.toLocaleString()}.</Typography>
            )}
            {detailType === 'approved' && (
              <Typography variant="body2">Approved applications: {kpiData.approvedApplications.toLocaleString()}.</Typography>
            )}
            {detailType === 'cards' && (
              <Typography variant="body2">Cards issued/renewed: {kpiData.cardsIssued.toLocaleString()}.</Typography>
            )}
            {detailType === 'benefits' && (
              <Typography variant="body2">Benefits distributed entries: {kpiData.benefitsDistributed.toLocaleString()}.</Typography>
            )}
            {detailType === 'tickets' && (
              <Typography variant="body2">Resolved tickets: {kpiData.ticketsResolved.toLocaleString()}.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Middle Row - Charts and Gauges */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Monthly Registrations Chart */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50', fontSize: '0.95rem' }}>
                Monthly Registrations
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyRegistrations} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="month" stroke="#7F8C8D" fontSize={12} />
                  <YAxis stroke="#7F8C8D" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="registrations" fill="#3498DB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Approval Rate Gauge */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GaugeChart value={approvalRate} title="Application Approval Rate" color="#1ABC9C" />
            </Paper>
          </Grid>

          {/* Resolution Rate Gauge */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GaugeChart value={resolutionRate} title="Support Ticket Resolution Rate" color="#3498DB" />
            </Paper>
          </Grid>
        </Grid>

        {/* Bottom Row - Charts */}
        <Grid container spacing={2}>
          {/* Top 5 Barangays by Registrations */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50', fontSize: '0.95rem' }}>
                Top 5 Barangays by Registrations
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={topBarangays} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis type="number" stroke="#7F8C8D" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#7F8C8D" fontSize={12} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3498DB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Monthly Card Issuance */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50', fontSize: '0.95rem' }}>
                Monthly Card Issuance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyCardIssuance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="month" stroke="#7F8C8D" fontSize={12} />
                  <YAxis stroke="#7F8C8D" fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="cards" 
                    stroke="#1ABC9C" 
                    strokeWidth={3}
                    dot={{ fill: '#1ABC9C', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Benefit Type Distribution */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50', fontSize: '0.95rem' }}>
                Benefit Type Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={benefitTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {benefitTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Row - Disability Distribution */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E0E0E0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50', fontSize: '0.95rem' }}>
                Disability Type Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={disabilityDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="name" stroke="#7F8C8D" fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#7F8C8D" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#9B59B6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Analytics;
