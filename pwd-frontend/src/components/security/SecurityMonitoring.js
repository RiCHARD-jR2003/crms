import React, { useEffect, useState, useMemo } from 'react';
import { 
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, 
  TableHead, TableRow, TableContainer, TextField, InputAdornment, CircularProgress,
  Chip, Select, MenuItem, FormControl, InputLabel, Grid, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper,
  IconButton, Tooltip, Alert, Checkbox, Divider, Tab, Tabs
} from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer, Brush
} from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AdminSidebar from '../shared/AdminSidebar';
import MobileHeader from '../shared/MobileHeader';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { contentAreaStyles, mainContainerStyles } from '../../utils/themeStyles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Gauge Chart Component for Security Rating
const SecurityRatingGauge = ({ value, min = 0, max = 100, title = 'Security Rating' }) => {
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
  
  // Color based on rating
  let color = '#27AE60'; // Green
  if (percentage < 30) color = '#E74C3C'; // Red
  else if (percentage < 60) color = '#F39C12'; // Orange
  else if (percentage < 80) color = '#F1C40F'; // Yellow
  
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
            top: '85px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            width: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: color, fontSize: '2rem' }}>
            {value.toFixed(1)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 1, px: 2 }}>
        <Typography variant="caption" sx={{ color: '#7F8C8D', fontSize: '0.7rem' }}>{min}</Typography>
        <Typography variant="caption" sx={{ color: '#7F8C8D', fontSize: '0.7rem' }}>{max}</Typography>
      </Box>
      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: color }}>
        {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : percentage >= 30 ? 'Fair' : 'Critical'}
      </Typography>
    </Box>
  );
};

const COLORS = ['#E74C3C', '#E67E22', '#F39C12', '#3498DB', '#9B59B6', '#1ABC9C', '#27AE60'];

function SecurityMonitoring() {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    event_type: '',
    severity: '',
    status: ''
  });
  const [orderBy, setOrderBy] = useState('detected_at');
  const [order, setOrder] = useState('desc');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0
  });
  
  // New states for visualization
  const [selectedChart, setSelectedChart] = useState(null);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [chartTab, setChartTab] = useState(0);
  const [comparisonDateRange, setComparisonDateRange] = useState({ start: null, end: null });
  const [mainTab, setMainTab] = useState(0); // 0 = Visualizations, 1 = Threats Table
  
  // Zoom state for each chart type
  const [zoomState, setZoomState] = useState({
    monthlyEvents: { startIndex: 0, endIndex: null },
    eventsByType: { startIndex: 0, endIndex: null },
    topIPs: { startIndex: 0, endIndex: null }
  });

  useEffect(() => {
    loadEvents();
    loadStatistics();
    
    // Refresh statistics every 5 minutes
    const statsInterval = setInterval(loadStatistics, 300000);
    return () => clearInterval(statsInterval);
  }, [filters, query, orderBy, order, pagination.current_page]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...filters,
        search: query,
        sort_by: orderBy,
        sort_order: order
      };
      
      const data = await api.get('/security-monitoring', { params });
      if (data.success) {
        setEvents(data.events || []);
        setPagination(data.pagination || pagination);
      }
    } catch (e) {
      console.error('Error loading security events:', e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    setStatsLoading(true);
    try {
      const data = await api.get('/security-monitoring/statistics');
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (e) {
      console.error('Error loading statistics:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
    setSelectedEvents([]);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleChartClick = (chartType) => {
    setSelectedChart(chartType);
    setChartDialogOpen(true);
    setChartTab(0);
    // Reset zoom when opening chart
    setZoomState({
      monthlyEvents: { startIndex: 0, endIndex: null },
      eventsByType: { startIndex: 0, endIndex: null },
      topIPs: { startIndex: 0, endIndex: null }
    });
  };

  const handleZoomChange = (chartType, { startIndex, endIndex }) => {
    setZoomState(prev => ({
      ...prev,
      [chartType]: { startIndex, endIndex }
    }));
  };

  const handleResetZoom = (chartType) => {
    setZoomState(prev => ({
      ...prev,
      [chartType]: { startIndex: 0, endIndex: null }
    }));
  };

  const handleZoomIn = (chartType, dataLength) => {
    const currentZoom = zoomState[chartType];
    const startIndex = currentZoom.startIndex || 0;
    const endIndex = currentZoom.endIndex !== null ? currentZoom.endIndex : dataLength - 1;
    const range = endIndex - startIndex;
    const newRange = Math.max(1, Math.floor(range * 0.7)); // Zoom in by 30%
    const center = Math.floor((startIndex + endIndex) / 2);
    const newStartIndex = Math.max(0, center - Math.floor(newRange / 2));
    const newEndIndex = Math.min(dataLength - 1, newStartIndex + newRange - 1);
    
    setZoomState(prev => ({
      ...prev,
      [chartType]: { startIndex: newStartIndex, endIndex: newEndIndex }
    }));
  };

  const handleZoomOut = (chartType, dataLength) => {
    const currentZoom = zoomState[chartType];
    const startIndex = currentZoom.startIndex || 0;
    const endIndex = currentZoom.endIndex !== null ? currentZoom.endIndex : dataLength - 1;
    const range = endIndex - startIndex;
    const newRange = Math.min(dataLength, Math.floor(range * 1.5)); // Zoom out by 50%
    const center = Math.floor((startIndex + endIndex) / 2);
    const newStartIndex = Math.max(0, center - Math.floor(newRange / 2));
    const newEndIndex = Math.min(dataLength - 1, newStartIndex + newRange - 1);
    
    setZoomState(prev => ({
      ...prev,
      [chartType]: { startIndex: newStartIndex, endIndex: newEndIndex }
    }));
  };

  const isZoomed = (chartType, dataLength) => {
    const zoom = zoomState[chartType];
    if (!zoom) return false;
    const startIndex = zoom.startIndex || 0;
    const endIndex = zoom.endIndex !== null ? zoom.endIndex : dataLength - 1;
    return startIndex > 0 || endIndex < dataLength - 1;
  };

  const canZoomIn = (chartType, dataLength) => {
    const currentZoom = zoomState[chartType];
    const startIndex = currentZoom.startIndex || 0;
    const endIndex = currentZoom.endIndex !== null ? currentZoom.endIndex : dataLength - 1;
    return (endIndex - startIndex) > 1; // Can zoom in if more than 1 data point visible
  };

  const canZoomOut = (chartType, dataLength) => {
    const currentZoom = zoomState[chartType];
    const startIndex = currentZoom.startIndex || 0;
    const endIndex = currentZoom.endIndex !== null ? currentZoom.endIndex : dataLength - 1;
    return (endIndex - startIndex) < dataLength - 1; // Can zoom out if not showing all data
  };

  const handleStatusUpdate = async (eventId, status) => {
    try {
      await api.put(`/security-monitoring/${eventId}/status`, { status });
      await loadEvents();
      await loadStatistics();
      if (selectedEvent && selectedEvent.eventID === eventId) {
        setSelectedEvent({ ...selectedEvent, status });
      }
    } catch (e) {
      console.error('Error updating event status:', e);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedEvents.length === 0) return;
    
    try {
      await api.post('/security-monitoring/bulk-update-status', {
        event_ids: selectedEvents,
        status
      });
      await loadEvents();
      await loadStatistics();
      setSelectedEvents([]);
    } catch (e) {
      console.error('Error updating events status:', e);
    }
  };

  const generateTextAnalysis = (chartType, data, comparisonData = null) => {
    const analysis = [];
    const insights = [];
    const trends = [];
    const recommendations = [];

    if (!data || data.length === 0) {
      return { analysis: ['No data available for analysis'], insights: [], trends: [], recommendations: [] };
    }

    switch (chartType) {
      case 'monthlyEvents':
        const totalEvents = data.reduce((sum, d) => sum + (d.events || 0), 0);
        const avgEvents = totalEvents / data.length;
        const maxEvents = Math.max(...data.map(d => d.events || 0));
        const minEvents = Math.min(...data.map(d => d.events || 0));
        const maxMonth = data.find(d => d.events === maxEvents)?.month;
        const minMonth = data.find(d => d.events === minEvents)?.month;
        const variance = data.reduce((sum, d) => sum + Math.pow((d.events || 0) - avgEvents, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance).toFixed(1);
        
        analysis.push(`Total security events over ${data.length} months: ${totalEvents.toLocaleString()}`);
        analysis.push(`Average monthly events: ${avgEvents.toFixed(1)}`);
        analysis.push(`Peak month: ${maxMonth} with ${maxEvents} events`);
        analysis.push(`Lowest month: ${minMonth} with ${minEvents} events`);
        analysis.push(`Standard deviation: ${stdDev} events (indicates ${stdDev > avgEvents * 0.5 ? 'high' : 'moderate'} variability)`);
        analysis.push(`Range: ${maxEvents - minEvents} events difference between peak and lowest months`);
        
        if (data.length > 1) {
          const recent = data.slice(-2);
          const change = recent[1].events - recent[0].events;
          const percentChange = recent[0].events > 0 ? ((change / recent[0].events) * 100).toFixed(1) : 0;
          
          // Calculate 3-month trend
          if (data.length >= 3) {
            const last3Months = data.slice(-3);
            const threeMonthTrend = last3Months[2].events - last3Months[0].events;
            const threeMonthPercent = last3Months[0].events > 0 ? ((threeMonthTrend / last3Months[0].events) * 100).toFixed(1) : 0;
            trends.push(`3-month trend: ${threeMonthTrend > 0 ? '+' : ''}${threeMonthTrend} events (${threeMonthPercent > 0 ? '+' : ''}${threeMonthPercent}%)`);
          }
          
          if (change > 0) {
            trends.push(`Month-over-month change: Increased by ${change} events (${percentChange}%) from ${recent[0].month} to ${recent[1].month}`);
            insights.push(`Security events increased ${percentChange > 20 ? 'significantly' : 'moderately'} in the most recent month.`);
            if (percentChange > 20) {
              recommendations.push('Review recent security incidents and consider enhancing monitoring and protection measures.');
            }
          } else if (change < 0) {
            trends.push(`Month-over-month change: Decreased by ${Math.abs(change)} events (${Math.abs(percentChange)}%) from ${recent[0].month} to ${recent[1].month}`);
            insights.push(`Security events decreased ${Math.abs(percentChange) > 20 ? 'significantly' : 'moderately'} in the most recent month.`);
            if (Math.abs(percentChange) > 20) {
              recommendations.push('Current security measures are effective. Continue monitoring and maintain current security protocols.');
            }
          } else {
            trends.push(`Month-over-month change: Stable (no change from ${recent[0].month} to ${recent[1].month})`);
            insights.push('Security events have remained stable. Continue current monitoring practices.');
          }
          
          // Identify patterns
          const increases = data.filter((d, i) => i > 0 && d.events > data[i-1].events).length;
          const decreases = data.filter((d, i) => i > 0 && d.events < data[i-1].events).length;
          const stability = data.length - increases - decreases - 1;
          
          if (increases > decreases) {
            insights.push(`Overall trend shows more months with increases (${increases}) than decreases (${decreases}).`);
          } else if (decreases > increases) {
            insights.push(`Overall trend shows more months with decreases (${decreases}) than increases (${increases}).`);
          } else {
            insights.push(`Overall trend shows balanced increases and decreases, indicating stable security event patterns.`);
          }
        }
        
        if (avgEvents > 100) {
          recommendations.push('Consider implementing automated threat response systems to handle high event volumes.');
        }
        if (stdDev > avgEvents * 0.5) {
          recommendations.push('High variability in monthly events suggests irregular threat patterns. Review security policies during peak months.');
        }
        break;

      case 'eventsByType':
        const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
        const sortedData = [...data].sort((a, b) => (b.value || 0) - (a.value || 0));
        const topType = sortedData[0];
        const top3Types = sortedData.slice(0, 3);
        const topPercentage = total > 0 ? ((topType.value / total) * 100).toFixed(1) : 0;
        const top3Percentage = total > 0 ? top3Types.reduce((sum, d) => sum + (d.value || 0), 0) / total * 100 : 0;
        const uniqueTypes = data.filter(d => (d.value || 0) > 0).length;
        const expectedPercentPerType = uniqueTypes > 0 ? (100 / uniqueTypes).toFixed(1) : 0;
        
        analysis.push(`Total security events: ${total.toLocaleString()}`);
        analysis.push(`Top event type: ${topType.name} with ${topType.value} events (${topPercentage}% of total)`);
        analysis.push(`Top 3 event types account for ${top3Percentage.toFixed(1)}% of all events`);
        analysis.push(`Active threat types detected: ${uniqueTypes} out of ${data.length} monitored types`);
        analysis.push(`Distribution: Randomly distributed across threat types`);
        
        top3Types.forEach((type, idx) => {
          const percent = total > 0 ? ((type.value / total) * 100).toFixed(1) : 0;
          analysis.push(`  ${idx + 1}. ${type.name}: ${type.value} events (${percent}%)`);
        });
        
        // Check distribution variance (for random distribution, variance is expected)
        const distributionVariance = sortedData.reduce((sum, d) => {
          const percent = total > 0 ? ((d.value || 0) / total) * 100 : 0;
          const mean = parseFloat(expectedPercentPerType);
          const deviation = Math.abs(percent - mean);
          return sum + Math.pow(deviation, 2);
        }, 0) / uniqueTypes;
        const distributionStdDev = Math.sqrt(distributionVariance).toFixed(1);
        
        // Analyze distribution patterns for random distribution
        if (distributionStdDev < 5) {
          insights.push(`Relatively balanced distribution: Events are spread across threat types (std dev: ${distributionStdDev}%).`);
        } else if (distributionStdDev < 10) {
          insights.push(`Moderate variance: Some threat types appear more frequently than others (std dev: ${distributionStdDev}%).`);
        } else {
          insights.push(`High variance: Significant concentration in specific threat types (std dev: ${distributionStdDev}%).`);
        }
        
        if (topPercentage > 25) {
          insights.push(`High concentration of ${topType.name} events (${topPercentage}%) - this threat type is particularly active.`);
          recommendations.push(`Focus security resources on preventing and detecting ${topType.name} attacks. Consider targeted security training.`);
        } else if (topPercentage > 15) {
          insights.push(`Moderate concentration of ${topType.name} events (${topPercentage}%) - monitor this threat type closely.`);
        } else {
          insights.push(`Threat types show diverse distribution patterns. Comprehensive security coverage is important.`);
        }
        
        if (top3Percentage > 60) {
          insights.push(`Top 3 threat types represent ${top3Percentage.toFixed(1)}% of all events - significant concentration.`);
          recommendations.push('Focus security efforts on top 3 threat types while maintaining coverage for all threat vectors.');
        } else if (top3Percentage > 40) {
          insights.push(`Top 3 threat types represent ${top3Percentage.toFixed(1)}% of all events - moderate concentration.`);
        }
        
        // Check for specific high-risk types
        const highRiskTypes = ['SQL_INJECTION', 'COMMAND_INJECTION', 'XSS', 'SSRF', 'UNAUTHORIZED_ACCESS'];
        const highRiskCount = data.filter(d => highRiskTypes.includes(d.name) && (d.value || 0) > 0).reduce((sum, d) => sum + (d.value || 0), 0);
        const highRiskPercent = total > 0 ? ((highRiskCount / total) * 100).toFixed(1) : 0;
        const expectedHighRiskPercent = ((highRiskTypes.length / uniqueTypes) * 100).toFixed(1);
        
        if (highRiskPercent > parseFloat(expectedHighRiskPercent) + 10) {
          insights.push(`High-risk attack types (SQL Injection, Command Injection, XSS, SSRF, Unauthorized Access) represent ${highRiskPercent}% of events - above expected (~${expectedHighRiskPercent}%).`);
          recommendations.push('Prioritize security hardening against high-risk attack vectors. Review input validation and access controls.');
        } else {
          insights.push(`High-risk attack types represent ${highRiskPercent}% of events - within expected range (~${expectedHighRiskPercent}%).`);
        }
        
        // Identify rare but dangerous types
        const rareTypes = sortedData.filter(d => (d.value || 0) > 0 && (d.value || 0) < total * 0.02);
        if (rareTypes.length > 0) {
          insights.push(`Detected ${rareTypes.length} low-frequency threat types. These may indicate targeted or sophisticated attacks.`);
        }
        break;

      case 'eventsBySeverity':
        const totalSeverity = data.reduce((sum, d) => sum + (d.value || 0), 0);
        const criticalCount = data.find(d => d.name === 'Critical')?.value || 0;
        const highCount = data.find(d => d.name === 'High')?.value || 0;
        const mediumCount = data.find(d => d.name === 'Medium')?.value || 0;
        const lowCount = data.find(d => d.name === 'Low')?.value || 0;
        const criticalPercent = totalSeverity > 0 ? ((criticalCount / totalSeverity) * 100).toFixed(1) : 0;
        const highPercent = totalSeverity > 0 ? ((highCount / totalSeverity) * 100).toFixed(1) : 0;
        const mediumPercent = totalSeverity > 0 ? ((mediumCount / totalSeverity) * 100).toFixed(1) : 0;
        const lowPercent = totalSeverity > 0 ? ((lowCount / totalSeverity) * 100).toFixed(1) : 0;
        const highSeverityCount = criticalCount + highCount;
        const highSeverityPercent = totalSeverity > 0 ? ((highSeverityCount / totalSeverity) * 100).toFixed(1) : 0;
        
        analysis.push(`Total security events: ${totalSeverity.toLocaleString()}`);
        analysis.push(`Critical severity: ${criticalCount} events (${criticalPercent}%)`);
        analysis.push(`High severity: ${highCount} events (${highPercent}%)`);
        analysis.push(`Medium severity: ${mediumCount} events (${mediumPercent}%)`);
        analysis.push(`Low severity: ${lowCount} events (${lowPercent}%)`);
        analysis.push(`High & Critical combined: ${highSeverityCount} events (${highSeverityPercent}% of total)`);
        analysis.push(`Expected distribution: ~40% Low, ~30% Medium, ~20% High, ~10% Critical`);
        
        if (criticalPercent > 15) {
          insights.push(`Critical events represent ${criticalPercent}% of all events - this is above expected thresholds (expected ~10%).`);
          recommendations.push('Immediate action required: Review all critical events and implement enhanced security controls.');
        } else if (criticalPercent > 12) {
          insights.push(`Critical events represent ${criticalPercent}% of all events - slightly elevated but manageable (expected ~10%).`);
          recommendations.push('Monitor critical events closely and review security policies.');
        } else if (criticalPercent === 0) {
          insights.push('No critical events detected - excellent security posture.');
          recommendations.push('Continue current security practices. No critical issues require immediate attention.');
        } else {
          insights.push(`Critical events represent ${criticalPercent}% of all events - within expected range (~10%).`);
        }
        
        if (highSeverityPercent > 40) {
          insights.push(`High and critical severity events combined represent ${highSeverityPercent}% of all events - above expected (~30%).`);
          recommendations.push('High concentration of serious threats. Consider implementing stricter security measures and automated response systems.');
        } else if (highSeverityPercent > 30) {
          insights.push(`Moderate concentration of high-severity events (${highSeverityPercent}%) - within expected range (~30%).`);
          recommendations.push('Continue monitoring high-severity events and maintain current security protocols.');
        } else {
          insights.push(`Low concentration of high-severity events (${highSeverityPercent}%) - below expected (~30%).`);
        }
        
        if (lowPercent > 50) {
          insights.push(`Low severity events dominate (${lowPercent}%), indicating most detected threats are minor - above expected (~40%).`);
        } else if (lowPercent >= 35) {
          insights.push(`Low severity events represent ${lowPercent}% - within expected range (~40%).`);
        } else {
          insights.push(`Low severity events represent ${lowPercent}% - below expected (~40%).`);
        }
        
        if (mediumPercent >= 25 && mediumPercent <= 35) {
          insights.push(`Medium severity events represent ${mediumPercent}% - within expected range (~30%).`);
        } else if (mediumPercent > 35) {
          insights.push(`Medium severity events represent ${mediumPercent}% - above expected (~30%).`);
        } else {
          insights.push(`Medium severity events represent ${mediumPercent}% - below expected (~30%).`);
        }
        
        // Severity distribution health - with new distribution, ratio should be higher
        const severityRatio = criticalCount > 0 ? (highCount + mediumCount + lowCount) / criticalCount : 0;
        if (severityRatio > 7 && criticalCount > 0) {
          insights.push(`Healthy severity distribution: For every critical event, there are ${severityRatio.toFixed(1)} lower-severity events (expected ~7:1 ratio).`);
        } else if (severityRatio > 5 && criticalCount > 0) {
          insights.push(`Acceptable severity distribution: For every critical event, there are ${severityRatio.toFixed(1)} lower-severity events.`);
        }
        
        // Calculate severity score
        const severityScore = (criticalCount * 4 + highCount * 3 + mediumCount * 2 + lowCount * 1) / totalSeverity;
        const expectedScore = (0.1 * 4 + 0.2 * 3 + 0.3 * 2 + 0.4 * 1); // Expected score: 0.4 + 0.6 + 0.6 + 0.4 = 2.0
        analysis.push(`Weighted severity score: ${severityScore.toFixed(2)} (scale: 1=Low, 4=Critical, expected: ~${expectedScore.toFixed(2)})`);
        
        if (severityScore > 3.0) {
          recommendations.push('Very high severity score indicates system is under significant threat. Emergency security review recommended.');
        } else if (severityScore > 2.5) {
          recommendations.push('Elevated severity score requires attention. Review security policies and incident response procedures.');
        } else if (severityScore > 2.0) {
          recommendations.push('Moderate severity score - slightly above expected (~2.0). Continue standard security monitoring and response protocols.');
        } else if (severityScore >= 1.5) {
          recommendations.push('Good severity score - within expected range (~2.0). Maintain current security practices.');
        } else {
          recommendations.push('Low severity score indicates excellent security posture. Maintain current security practices.');
        }
        break;

      case 'eventsByStatus':
        const totalStatus = data.reduce((sum, d) => sum + (d.value || 0), 0);
        const pendingCount = data.find(d => d.name === 'Pending')?.value || 0;
        const investigatedCount = data.find(d => d.name === 'Investigated')?.value || 0;
        const resolvedCount = data.find(d => d.name === 'Resolved')?.value || 0;
        const falsePositiveCount = data.find(d => d.name === 'False Positive')?.value || 0;
        const pendingPercent = totalStatus > 0 ? ((pendingCount / totalStatus) * 100).toFixed(1) : 0;
        const investigatedPercent = totalStatus > 0 ? ((investigatedCount / totalStatus) * 100).toFixed(1) : 0;
        const resolvedPercent = totalStatus > 0 ? ((resolvedCount / totalStatus) * 100).toFixed(1) : 0;
        const falsePositivePercent = totalStatus > 0 ? ((falsePositiveCount / totalStatus) * 100).toFixed(1) : 0;
        const resolvedTotal = resolvedCount + falsePositiveCount;
        const resolvedTotalPercent = totalStatus > 0 ? ((resolvedTotal / totalStatus) * 100).toFixed(1) : 0;
        const activeCases = pendingCount + investigatedCount;
        const activePercent = totalStatus > 0 ? ((activeCases / totalStatus) * 100).toFixed(1) : 0;
        
        analysis.push(`Total security events: ${totalStatus.toLocaleString()}`);
        analysis.push(`Pending review: ${pendingCount} events (${pendingPercent}%)`);
        analysis.push(`Under investigation: ${investigatedCount} events (${investigatedPercent}%)`);
        analysis.push(`Resolved: ${resolvedCount} events (${resolvedPercent}%)`);
        analysis.push(`False positives: ${falsePositiveCount} events (${falsePositivePercent}%)`);
        analysis.push(`Total resolved (including false positives): ${resolvedTotal} events (${resolvedTotalPercent}%)`);
        analysis.push(`Active cases: ${activeCases} events (${activePercent}%) require attention`);
        analysis.push(`Expected distribution: ~25% Pending, ~25% Investigated, ~30% Resolved, ~20% False Positive`);
        
        if (pendingPercent > 35) {
          insights.push(`High percentage of pending events (${pendingPercent}%) indicates backlog in security review - above expected (~25%).`);
          recommendations.push('Consider increasing security team capacity or implementing automated triage systems.');
          recommendations.push('Prioritize critical and high-severity pending events for immediate review.');
        } else if (pendingPercent > 30) {
          insights.push(`Moderate percentage of pending events (${pendingPercent}%) - slightly above expected (~25%).`);
          recommendations.push('Review workflow efficiency and consider additional resources for security operations.');
        } else if (pendingPercent >= 20 && pendingPercent <= 30) {
          insights.push(`Pending events represent ${pendingPercent}% - within expected range (~25%).`);
        } else if (pendingPercent < 10) {
          insights.push(`Low percentage of pending events (${pendingPercent}%) - excellent response time, below expected (~25%).`);
        }
        
        if (investigatedPercent >= 20 && investigatedPercent <= 30) {
          insights.push(`Investigated events represent ${investigatedPercent}% - within expected range (~25%).`);
        } else if (investigatedPercent > 30) {
          insights.push(`Investigated events represent ${investigatedPercent}% - above expected (~25%).`);
        } else {
          insights.push(`Investigated events represent ${investigatedPercent}% - below expected (~25%).`);
        }
        
        if (resolvedTotalPercent > 60) {
          insights.push(`Excellent resolution rate (${resolvedTotalPercent}%) - above expected (~50%). Security team is handling events efficiently.`);
          recommendations.push('Maintain current resolution practices. Consider sharing best practices with other teams.');
        } else if (resolvedTotalPercent >= 45 && resolvedTotalPercent <= 55) {
          insights.push(`Good resolution rate (${resolvedTotalPercent}%) - within expected range (~50%).`);
          recommendations.push('Continue current resolution practices. Focus on reducing pending event backlog.');
        } else if (resolvedTotalPercent < 40) {
          insights.push(`Low resolution rate (${resolvedTotalPercent}%) - below expected (~50%). Indicates need for improved response processes.`);
          recommendations.push('Review incident response procedures and increase team capacity.');
          recommendations.push('Consider implementing automated resolution for common false positive patterns.');
        }
        
        if (falsePositivePercent > 25) {
          insights.push(`High false positive rate (${falsePositivePercent}%) - above expected (~20%). Security rules may need tuning.`);
          recommendations.push('Review security detection rules to reduce false positives and improve signal-to-noise ratio.');
          recommendations.push('Consider implementing machine learning-based threat detection to reduce false positives.');
        } else if (falsePositivePercent >= 15 && falsePositivePercent <= 25) {
          insights.push(`False positive rate (${falsePositivePercent}%) - within expected range (~20%).`);
          recommendations.push('Review detection rules periodically to optimize false positive rates.');
        } else if (falsePositivePercent < 10) {
          insights.push(`Low false positive rate (${falsePositivePercent}%) - below expected (~20%). Indicates well-tuned detection systems.`);
        }
        
        // Calculate average resolution time estimate
        const resolutionRate = resolvedTotal / totalStatus;
        if (resolutionRate > 0.8) {
          insights.push('High resolution rate suggests efficient security operations and good incident response procedures.');
        }
        
        // Active case analysis - expected is 50% (pending + investigated)
        if (activePercent > 60) {
          insights.push(`High percentage of active cases (${activePercent}%) - above expected (~50%). Requires ongoing attention.`);
        } else if (activePercent >= 40 && activePercent <= 60) {
          insights.push(`Active cases represent ${activePercent}% - within expected range (~50%).`);
        } else if (activePercent < 30) {
          insights.push(`Low percentage of active cases (${activePercent}%) - below expected (~50%). Indicates timely resolution.`);
        }
        break;

      case 'topIPs':
        const topIP = data[0];
        const totalIPs = data.reduce((sum, d) => sum + (d.value || 0), 0);
        const topIPPercent = totalIPs > 0 ? ((topIP.value / totalIPs) * 100).toFixed(1) : 0;
        const top3IPs = data.slice(0, 3);
        const top3IPsTotal = top3IPs.reduce((sum, d) => sum + (d.value || 0), 0);
        const top3IPsPercent = totalIPs > 0 ? ((top3IPsTotal / totalIPs) * 100).toFixed(1) : 0;
        const uniqueIPs = data.length;
        const avgEventsPerIP = (totalIPs / uniqueIPs).toFixed(1);
        
        analysis.push(`Total security events from all IPs: ${totalIPs.toLocaleString()}`);
        analysis.push(`Unique IP addresses detected: ${uniqueIPs}`);
        analysis.push(`Average events per IP: ${avgEventsPerIP}`);
        analysis.push(`Top source IP: ${topIP.name} with ${topIP.value} events (${topIPPercent}% of total)`);
        analysis.push(`Top 3 IPs account for ${top3IPsTotal} events (${top3IPsPercent}% of total)`);
        
        top3IPs.forEach((ip, idx) => {
          const percent = totalIPs > 0 ? ((ip.value / totalIPs) * 100).toFixed(1) : 0;
          analysis.push(`  ${idx + 1}. ${ip.name}: ${ip.value} events (${percent}%)`);
        });
        
        if (topIPPercent > 30) {
          insights.push(`High concentration from ${topIP.name} (${topIPPercent}%) suggests potential targeted attack or misconfigured system.`);
          recommendations.push(`Investigate ${topIP.name} thoroughly. Consider implementing IP-based blocking or rate limiting.`);
          recommendations.push('Review logs from this IP to identify attack patterns and vectors.');
        } else if (topIPPercent > 15) {
          insights.push(`Moderate concentration from ${topIP.name} (${topIPPercent}%).`);
          recommendations.push(`Monitor ${topIP.name} closely and consider implementing targeted security rules.`);
        } else {
          insights.push(`Well-distributed events across IPs indicates diverse attack sources.`);
        }
        
        if (top3IPsPercent > 60) {
          insights.push(`Top 3 IPs represent ${top3IPsPercent}% of events - significant concentration.`);
          recommendations.push('Focus investigation and security measures on top 3 source IPs.');
        }
        
        // Check for localhost/internal IPs
        const internalIPs = data.filter(d => 
          d.name === '127.0.0.1' || 
          d.name === 'localhost' || 
          d.name.startsWith('192.168.') || 
          d.name.startsWith('10.') ||
          d.name.startsWith('172.16.')
        );
        if (internalIPs.length > 0) {
          const internalTotal = internalIPs.reduce((sum, d) => sum + (d.value || 0), 0);
          const internalPercent = totalIPs > 0 ? ((internalTotal / totalIPs) * 100).toFixed(1) : 0;
          insights.push(`Detected ${internalTotal} events (${internalPercent}%) from internal/localhost IPs.`);
          if (internalPercent > 10) {
            recommendations.push('High percentage of internal IP events may indicate insider threats or misconfigured systems. Review internal security policies.');
          }
        }
        
        // Check for suspicious patterns
        if (topIP.value > avgEventsPerIP * 5) {
          insights.push(`Top IP generates ${(topIP.value / avgEventsPerIP).toFixed(1)}x more events than average - highly suspicious.`);
          recommendations.push('Immediate investigation required for top IP address. Consider blocking or restricting access.');
        }
        
        if (uniqueIPs > 100) {
          insights.push(`Large number of unique IPs (${uniqueIPs}) indicates distributed attack or scanning activity.`);
          recommendations.push('Consider implementing geo-blocking or IP reputation-based filtering for distributed attacks.');
        }
        break;

      case 'securityRating':
        const rating = data;
        const ratingCategory = rating >= 80 ? 'Excellent' : rating >= 60 ? 'Good' : rating >= 30 ? 'Fair' : 'Critical';
        const ratingColor = rating >= 80 ? '#27AE60' : rating >= 60 ? '#3498DB' : rating >= 30 ? '#F39C12' : '#E74C3C';
        const pointsFromExcellent = 80 - rating;
        const pointsFromGood = 60 - rating;
        
        analysis.push(`Current security rating: ${rating.toFixed(1)}/100`);
        analysis.push(`Rating category: ${ratingCategory}`);
        analysis.push(`Rating interpretation: ${rating >= 80 ? 'System is well protected with minimal security concerns' : rating >= 60 ? 'System has good security posture with minor areas for improvement' : rating >= 30 ? 'System requires security review and improvements' : 'System has critical security issues requiring immediate attention'}`);
        
        if (rating >= 80) {
          analysis.push(`Points above excellent threshold: ${pointsFromExcellent >= 0 ? pointsFromExcellent.toFixed(1) : 'N/A'}`);
          insights.push('Excellent security rating indicates strong security posture and effective threat management.');
          insights.push('Maintain current security practices and continue monitoring for emerging threats.');
          recommendations.push('Continue current security protocols. Consider implementing advanced threat detection systems.');
          recommendations.push('Regular security audits and penetration testing recommended to maintain high rating.');
        } else if (rating >= 60) {
          analysis.push(`Points needed to reach excellent: ${pointsFromExcellent.toFixed(1)}`);
          insights.push('Good security rating with room for improvement.');
          insights.push('Focus on resolving high-severity events and reducing pending cases to improve rating.');
          recommendations.push('Address high and critical severity events promptly to improve security rating.');
          recommendations.push('Consider implementing automated security response systems to handle threats faster.');
        } else if (rating >= 30) {
          analysis.push(`Points needed to reach good rating: ${pointsFromGood.toFixed(1)}`);
          insights.push('Fair security rating indicates need for security improvements.');
          insights.push('High number of critical/high severity events or unresolved cases are impacting rating.');
          recommendations.push('Immediate action required: Review and resolve all critical security events.');
          recommendations.push('Implement enhanced security controls and monitoring systems.');
          recommendations.push('Consider conducting security assessment and threat modeling.');
        } else {
          analysis.push(`Points needed to reach fair rating: ${(30 - rating).toFixed(1)}`);
          insights.push('Critical security rating - system is at high risk.');
          insights.push('Large number of unresolved critical events or ongoing security incidents.');
          recommendations.push('EMERGENCY: Immediate security review and incident response required.');
          recommendations.push('Allocate maximum resources to resolve critical security issues.');
          recommendations.push('Consider engaging external security experts for immediate assistance.');
          recommendations.push('Implement emergency security measures and enhanced monitoring.');
        }
        
        // Rating trend analysis (if comparison data available)
        if (comparisonData && comparisonData.previousRating) {
          const ratingChange = rating - comparisonData.previousRating;
          const percentChange = comparisonData.previousRating > 0 ? ((ratingChange / comparisonData.previousRating) * 100).toFixed(1) : 0;
          
          if (ratingChange > 0) {
            trends.push(`Security rating improved by ${ratingChange.toFixed(1)} points (${percentChange > 0 ? '+' : ''}${percentChange}%)`);
            insights.push('Security rating is improving, indicating effective security measures.');
          } else if (ratingChange < 0) {
            trends.push(`Security rating decreased by ${Math.abs(ratingChange).toFixed(1)} points (${percentChange}%)`);
            insights.push('Security rating has declined. Review recent security incidents and response procedures.');
            recommendations.push('Investigate causes of rating decline and implement corrective measures.');
          } else {
            trends.push('Security rating remained stable.');
          }
        }
        
        // Component breakdown (if available)
        if (statistics) {
          const criticalEvents = statistics.critical_events || 0;
          const highEvents = statistics.high_events || 0;
          const pendingEvents = statistics.pending_events || 0;
          const totalEvents = statistics.total_events || 0;
          
          analysis.push(`Rating factors:`);
          analysis.push(`  • Critical events: ${criticalEvents}`);
          analysis.push(`  • High severity events: ${highEvents}`);
          analysis.push(`  • Pending events: ${pendingEvents}`);
          analysis.push(`  • Total events: ${totalEvents}`);
          
          if (criticalEvents > 0) {
            const criticalImpact = Math.min((criticalEvents / Math.max(totalEvents, 1)) * 50, 50);
            analysis.push(`  • Critical events penalty: ~${criticalImpact.toFixed(1)} points`);
          }
          if (highEvents > 0) {
            const highImpact = Math.min((highEvents / Math.max(totalEvents, 1)) * 30, 30);
            analysis.push(`  • High severity events penalty: ~${highImpact.toFixed(1)} points`);
          }
          if (pendingEvents > 0) {
            const pendingImpact = Math.min((pendingEvents / Math.max(totalEvents, 1)) * 20, 20);
            analysis.push(`  • Pending events penalty: ~${pendingImpact.toFixed(1)} points`);
          }
        }
        break;

      default:
        analysis.push('Analysis data not available for this visualization type.');
    }

    return { analysis, insights, trends, recommendations };
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <ErrorIcon />;
      case 'high': return <ErrorIcon />;
      case 'medium': return <WarningIcon />;
      case 'low': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'SQL_INJECTION': return 'error';
      case 'XSS': return 'error';
      case 'COMMAND_INJECTION': return 'error';
      case 'PATH_TRAVERSAL': return 'warning';
      case 'FILE_UPLOAD_THREAT': return 'warning';
      case 'BRUTE_FORCE': return 'warning';
      case 'UNAUTHORIZED_ACCESS': return 'error';
      case 'SUSPICIOUS_PATTERN': return 'info';
      case 'CSRF_FAILURE': return 'warning';
      case 'SSRF': return 'error';
      case 'LDAP_INJECTION': return 'error';
      case 'XML_INJECTION': return 'error';
      case 'TEMPLATE_INJECTION': return 'error';
      case 'RATE_LIMIT_VIOLATION': return 'warning';
      case 'API_ABUSE': return 'warning';
      case 'MALICIOUS_BOT': return 'error';
      case 'SENSITIVE_DATA_EXPOSURE': return 'error';
      case 'DIRECTORY_LISTING_ATTEMPT': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'investigated': return 'info';
      case 'resolved': return 'success';
      case 'false_positive': return 'default';
      default: return 'default';
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEvents(events.map(e => e.eventID));
    } else {
      setSelectedEvents([]);
    }
  };

  const handleSelectEvent = (eventId, checked) => {
    if (checked) {
      setSelectedEvents(prev => [...prev, eventId]);
    } else {
      setSelectedEvents(prev => prev.filter(id => id !== eventId));
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current_page: newPage }));
    setSelectedEvents([]);
  };

  // Custom label renderer for donut charts with connector lines and circular heads
  const renderDonutLabels = (data, colors) => {
    // Use viewBox coordinates (0 0 500 500) - matches ResponsiveContainer
    const cx = 250;
    const cy = 250;
    const outerRadius = 140;
    const labelRadius = outerRadius + 70; // Distance from center for labels
    
    // Calculate total value
    const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
    if (total === 0) return null;
    
    // Calculate angles for each slice
    let currentAngle = -90; // Start from top
    const slices = data.map((entry, index) => {
      const value = entry.value || 0;
      const percent = value / total;
      const angle = percent * 360;
      const midAngle = currentAngle + angle / 2; // Midpoint angle of slice
      currentAngle += angle;
      
      let color = colors[index % colors.length];
      
      // Swap colors for Low and Medium
      if (entry.name === 'Low') {
        // Find Medium's color
        const mediumIndex = data.findIndex(e => e.name === 'Medium');
        if (mediumIndex !== -1) {
          color = colors[mediumIndex % colors.length];
        }
      } else if (entry.name === 'Medium') {
        // Find Low's color
        const lowIndex = data.findIndex(e => e.name === 'Low');
        if (lowIndex !== -1) {
          color = colors[lowIndex % colors.length];
        }
      }
      
      return {
        ...entry,
        midAngle,
        percent,
        color: color
      };
    });
    
    return (
      <g>
        {slices.map((slice, index) => {
          const midAngleRad = (slice.midAngle * Math.PI) / 180;
          
          // Calculate point on outer edge of donut
          const outerX = cx + outerRadius * Math.cos(midAngleRad);
          const outerY = cy + outerRadius * Math.sin(midAngleRad);
          
          // Calculate label position (further out)
          const labelX = cx + labelRadius * Math.cos(midAngleRad);
          const labelY = cy + labelRadius * Math.sin(midAngleRad);
          
          // Determine text anchor based on position
          const textAnchor = labelX > cx ? 'start' : 'end';
          const labelOffsetX = labelX > cx ? 15 : -15;
          
          const percentText = (slice.percent * 100).toFixed(1);
          
          return (
            <g key={`label-${index}`}>
              {/* Connector line */}
              <line
                x1={outerX}
                y1={outerY}
                x2={labelX}
                y2={labelY}
                stroke={slice.color}
                strokeWidth={2}
                strokeDasharray="5,5"
              />
              {/* Circular head at slice edge */}
              <circle
                cx={outerX}
                cy={outerY}
                r={6}
                fill={slice.color}
                stroke="#fff"
                strokeWidth={2}
              />
              {/* Label text */}
              <text
                x={labelX + labelOffsetX}
                y={labelY - 8}
                textAnchor={textAnchor}
                fill="#2C3E50"
                fontSize="14"
                fontWeight="700"
              >
                {slice.name}
              </text>
              <text
                x={labelX + labelOffsetX}
                y={labelY + 10}
                textAnchor={textAnchor}
                fill="#7F8C8D"
                fontSize="12"
              >
                {slice.value} events ({percentText}%)
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  const chartData = useMemo(() => {
    if (!statistics) {
      return {
        monthlyEvents: [],
        eventsByType: [],
        eventsBySeverity: [],
        eventsByStatus: [],
        topIPs: [],
        securityRating: 100,
        resolutionRate: 0
      };
    }
    
    // Ensure arrays are properly formatted
    const monthlyEvents = Array.isArray(statistics.monthly_events) ? statistics.monthly_events : [];
    const eventsByTypeRaw = Array.isArray(statistics.events_by_type) ? statistics.events_by_type : [];
    // Sort eventsByType alphabetically by name
    const eventsByType = eventsByTypeRaw.length > 0 
      ? [...eventsByTypeRaw].sort((a, b) => {
          const nameA = (a.name || '').toUpperCase();
          const nameB = (b.name || '').toUpperCase();
          return nameA.localeCompare(nameB);
        })
      : [];
    const eventsBySeverity = Array.isArray(statistics.events_by_severity) ? statistics.events_by_severity : [];
    const eventsByStatus = Array.isArray(statistics.events_by_status) ? statistics.events_by_status : [];
    const topIPs = Array.isArray(statistics.top_ips) ? statistics.top_ips : [];
    
    return {
      monthlyEvents: monthlyEvents.length > 0 ? monthlyEvents : [],
      eventsByType: eventsByType.length > 0 ? eventsByType : [],
      eventsBySeverity: eventsBySeverity.length > 0 ? eventsBySeverity : [],
      eventsByStatus: eventsByStatus.length > 0 ? eventsByStatus : [],
      topIPs: topIPs.length > 0 ? topIPs : [],
      securityRating: statistics.security_rating || 100,
      resolutionRate: statistics.resolution_rate || 0
    };
  }, [statistics]);

  return (
    <Box sx={mainContainerStyles}>
      <MobileHeader onMenuToggle={setIsMobileMenuOpen} isMenuOpen={isMobileMenuOpen} />
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Box component="main" sx={{ ...contentAreaStyles, ml: { xs: 0, md: '280px' }, width: { xs: '100%', md: 'calc(100% - 280px)' } }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <SecurityIcon sx={{ fontSize: 40, color: '#E74C3C' }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Security Monitoring</Typography>
          </Box>

          {/* Tabs for Visualizations and Threats Table */}
          <Card sx={{ mb: 3 }}>
            <Tabs 
              value={mainTab} 
              onChange={(e, newValue) => setMainTab(newValue)}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                px: 2,
                pt: 2
              }}
            >
              <Tab label="Visualizations" />
              <Tab label="Threats Detected" />
            </Tabs>
          </Card>

          {/* Statistics Cards */}
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {statistics && mainTab === 0 && (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#E74C3C', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ mb: 1 }}>Critical Events</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {statistics.critical_events || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#E67E22', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ mb: 1 }}>High Severity</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {statistics.high_events || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#F39C12', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ mb: 1 }}>Pending Review</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {statistics.pending_events || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ bgcolor: '#3498DB', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ mb: 1 }}>Last 24 Hours</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {statistics.events_last_24h || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Security Rating and Visualizations - Only show on Visualizations tab */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Security Rating Gauge */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        boxShadow: 6,
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => handleChartClick('securityRating')}
                  >
                    <SecurityRatingGauge 
                      value={statistics.security_rating || 0} 
                      title="Security Rating"
                    />
                  </Paper>
                </Grid>

                {/* Monthly Events Trend */}
                <Grid item xs={12} md={8}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        boxShadow: 6,
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => handleChartClick('monthlyEvents')}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2C3E50', fontSize: '0.95rem' }}>
                      Monthly Security Events Trend
                    </Typography>
                    {chartData && chartData.monthlyEvents.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={chartData.monthlyEvents}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="events" stroke="#E74C3C" strokeWidth={2} name="Events" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 180 }}>
                        <Typography color="textSecondary">No data available</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Events by Type */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        boxShadow: 6,
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => handleChartClick('eventsByType')}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2C3E50', fontSize: '0.95rem' }}>
                      Events by Type
                    </Typography>
                    {chartData && chartData.eventsByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData.eventsByType}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#E74C3C" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <Typography color="textSecondary">No data available</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Events by Severity */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        boxShadow: 6,
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => handleChartClick('eventsBySeverity')}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2C3E50', fontSize: '0.95rem' }}>
                      Events by Severity
                    </Typography>
                    {chartData && chartData.eventsBySeverity.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={chartData.eventsBySeverity}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.eventsBySeverity.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <Typography color="textSecondary">No data available</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Events by Status */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        boxShadow: 6,
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => handleChartClick('eventsByStatus')}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2C3E50', fontSize: '0.95rem' }}>
                      Events by Status
                    </Typography>
                    {chartData && chartData.eventsByStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={chartData.eventsByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.eventsByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <Typography color="textSecondary">No data available</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Top IPs */}
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        boxShadow: 6,
                        transform: 'translateY(-4px)'
                      }
                    }}
                    onClick={() => handleChartClick('topIPs')}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#2C3E50', fontSize: '0.95rem' }}>
                      Top Source IPs
                    </Typography>
                    {chartData && chartData.topIPs.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={chartData.topIPs}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#3498DB" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <Typography color="textSecondary">No data available</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
                </>
              )}
              {/* Filters and Search - Only show on Threats Detected tab */}
              {mainTab === 1 && (
                <>
                  <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      placeholder="Search events..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        )
                      }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Event Type</InputLabel>
                      <Select
                        value={filters.event_type}
                        onChange={(e) => handleFilterChange('event_type', e.target.value)}
                        label="Event Type"
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="SQL_INJECTION">SQL Injection</MenuItem>
                        <MenuItem value="XSS">Cross-Site Scripting (XSS)</MenuItem>
                        <MenuItem value="COMMAND_INJECTION">Command Injection</MenuItem>
                        <MenuItem value="PATH_TRAVERSAL">Path Traversal</MenuItem>
                        <MenuItem value="LDAP_INJECTION">LDAP Injection</MenuItem>
                        <MenuItem value="XML_INJECTION">XML Injection</MenuItem>
                        <MenuItem value="TEMPLATE_INJECTION">Template Injection</MenuItem>
                        <MenuItem value="SSRF">Server-Side Request Forgery (SSRF)</MenuItem>
                        <MenuItem value="FILE_UPLOAD_THREAT">File Upload Threat</MenuItem>
                        <MenuItem value="BRUTE_FORCE">Brute Force Attack</MenuItem>
                        <MenuItem value="UNAUTHORIZED_ACCESS">Unauthorized Access</MenuItem>
                        <MenuItem value="RATE_LIMIT_VIOLATION">Rate Limit Violation</MenuItem>
                        <MenuItem value="API_ABUSE">API Abuse</MenuItem>
                        <MenuItem value="MALICIOUS_BOT">Malicious Bot/Scanner</MenuItem>
                        <MenuItem value="SENSITIVE_DATA_EXPOSURE">Sensitive Data Exposure</MenuItem>
                        <MenuItem value="DIRECTORY_LISTING_ATTEMPT">Directory Listing Attempt</MenuItem>
                        <MenuItem value="SUSPICIOUS_PATTERN">Suspicious Pattern</MenuItem>
                        <MenuItem value="CSRF_FAILURE">CSRF Failure</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Severity</InputLabel>
                      <Select
                        value={filters.severity}
                        onChange={(e) => handleFilterChange('severity', e.target.value)}
                        label="Severity"
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="investigated">Investigated</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                        <MenuItem value="false_positive">False Positive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    {selectedEvents.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleBulkStatusUpdate('investigated')}
                        >
                          Mark Investigated
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          onClick={() => handleBulkStatusUpdate('resolved')}
                        >
                          Mark Resolved
                        </Button>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

              {/* Events Table */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  height: 'calc(100vh - 350px)',
                  maxHeight: 'calc(100vh - 350px)',
                  overflow: 'hidden'
                }}>
                  {/* Left Column - Events Table */}
                  <Card sx={{
                    flex: selectedEvent ? '0 0 35%' : '1',
                    transition: 'flex 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 2 }}>
                      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                        <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'white', borderBottom: '2px solid #E0E0E0' }}>
                          <TableCell padding="checkbox" sx={{ py: 1.5 }}>
                            <Checkbox
                              checked={selectedEvents.length === events.length && events.length > 0}
                              indeterminate={selectedEvents.length > 0 && selectedEvents.length < events.length}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell 
                            sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2, cursor: 'pointer' }}
                            onClick={() => handleRequestSort('event_type')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              Type
                              <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                                <ArrowUpwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'event_type' && order === 'asc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'event_type' && order === 'asc' ? 1 : 0.3 }} />
                                <ArrowDownwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'event_type' && order === 'desc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'event_type' && order === 'desc' ? 1 : 0.3, mt: '-4px' }} />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell 
                            sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2, cursor: 'pointer' }}
                            onClick={() => handleRequestSort('severity')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              Severity
                              <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                                <ArrowUpwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'severity' && order === 'asc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'severity' && order === 'asc' ? 1 : 0.3 }} />
                                <ArrowDownwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'severity' && order === 'desc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'severity' && order === 'desc' ? 1 : 0.3, mt: '-4px' }} />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Description</TableCell>
                          <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>IP Address</TableCell>
                          <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>User</TableCell>
                          <TableCell 
                            sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2, cursor: 'pointer' }}
                            onClick={() => handleRequestSort('detected_at')}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              Detected At
                              <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                                <ArrowUpwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'detected_at' && order === 'asc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'detected_at' && order === 'asc' ? 1 : 0.3 }} />
                                <ArrowDownwardIcon sx={{ fontSize: '0.7rem', color: orderBy === 'detected_at' && order === 'desc' ? '#0b87ac' : '#BDC3C7', opacity: orderBy === 'detected_at' && order === 'desc' ? 1 : 0.3, mt: '-4px' }} />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Status</TableCell>
                          <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {events.map((event, idx) => (
                          <TableRow 
                            key={event.eventID} 
                            sx={{ 
                              bgcolor: selectedEvent?.eventID === event.eventID 
                                ? '#E3F2FD' 
                                : idx % 2 
                                  ? '#F7FBFF' 
                                  : 'white',
                              '&:hover': { bgcolor: selectedEvent?.eventID === event.eventID ? '#E3F2FD' : '#E8F4F8', cursor: 'pointer' }
                            }}
                            onClick={() => handleEventClick(event)}
                          >
                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedEvents.includes(event.eventID)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSelectEvent(event.eventID, e.target.checked);
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '0.8rem', borderBottom: '1px solid #E0E0E0', py: 2, px: 2 }}>
                              <Chip 
                                label={event.event_type.replace(/_/g, ' ')} 
                                size="small" 
                                color={getEventTypeColor(event.event_type)}
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '0.8rem', borderBottom: '1px solid #E0E0E0', py: 2, px: 2 }}>
                              <Chip 
                                icon={getSeverityIcon(event.severity)}
                                label={event.severity.toUpperCase()} 
                                size="small" 
                                color={getSeverityColor(event.severity)}
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '0.8rem', borderBottom: '1px solid #E0E0E0', py: 2, px: 2, maxWidth: 300 }}>
                              <Tooltip title={event.description}>
                                <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {event.description}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '0.8rem', borderBottom: '1px solid #E0E0E0', py: 2, px: 2 }}>
                              {event.ip_address || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '0.8rem', borderBottom: '1px solid #E0E0E0', py: 2, px: 2 }}>
                              {event.user?.username || event.user?.email || 'Anonymous'}
                            </TableCell>
                            <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '0.8rem', borderBottom: '1px solid #E0E0E0', py: 2, px: 2 }}>
                              {new Date(event.detected_at || event.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '0.8rem', borderBottom: '1px solid #E0E0E0', py: 2, px: 2 }}>
                              <Chip 
                                label={event.status.replace(/_/g, ' ')} 
                                size="small" 
                                color={getStatusColor(event.status)}
                                sx={{ fontWeight: 500, textTransform: 'capitalize' }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#000000', fontWeight: 500, fontSize: '0.8rem', borderBottom: '1px solid #E0E0E0', py: 2, px: 2 }} onClick={(e) => e.stopPropagation()}>
                              <Select
                                value={event.status}
                                onChange={(e) => handleStatusUpdate(event.eventID, e.target.value)}
                                size="small"
                                sx={{ minWidth: 120 }}
                              >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="investigated">Investigated</MenuItem>
                                <MenuItem value="resolved">Resolved</MenuItem>
                                <MenuItem value="false_positive">False Positive</MenuItem>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                        {events.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                              <Typography color="textSecondary">No security events found</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 2, borderTop: '1px solid #E0E0E0', pt: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} events
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            size="small" 
                            disabled={pagination.current_page === 1}
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                          >
                            Previous
                          </Button>
                          <Button 
                            size="small" 
                            disabled={pagination.current_page === pagination.last_page}
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                          >
                            Next
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Right Column - Event Details */}
                {selectedEvent && (
                  <Paper elevation={0} sx={{
                    flex: '0 0 65%',
                    p: { xs: 2, sm: 3 },
                    border: '1px solid #E0E0E0',
                    borderRadius: 4,
                    bgcolor: '#FFFFFF',
                    height: '100%',
                    maxHeight: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'flex 0.3s ease',
                    overflow: 'hidden'
                  }}>
                    {/* Details Header */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: 2,
                      pb: 2,
                      borderBottom: '1px solid #E0E0E0'
                    }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50' }}>
                          Security Event Details
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#7F8C8D', mt: 0.5 }}>
                          Event ID: {selectedEvent.eventID}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => setSelectedEvent(null)}
                        sx={{ color: '#7F8C8D', '&:hover': { bgcolor: '#E0E0E0' } }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>

                    {/* Details Content */}
                    <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>Event Type</Typography>
                          <Chip 
                            label={selectedEvent.event_type.replace(/_/g, ' ')} 
                            color={getEventTypeColor(selectedEvent.event_type)}
                            sx={{ fontWeight: 600 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>Severity</Typography>
                          <Chip 
                            icon={getSeverityIcon(selectedEvent.severity)}
                            label={selectedEvent.severity.toUpperCase()} 
                            color={getSeverityColor(selectedEvent.severity)}
                            sx={{ fontWeight: 600 }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>Description</Typography>
                          <Typography variant="body1">{selectedEvent.description}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>IP Address</Typography>
                          <Typography variant="body1">{selectedEvent.ip_address || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>User Agent</Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word', fontSize: '0.85rem' }}>
                            {selectedEvent.user_agent || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>User</Typography>
                          <Typography variant="body1">
                            {selectedEvent.user?.username || selectedEvent.user?.email || 'Anonymous'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>Method</Typography>
                          <Typography variant="body1">{selectedEvent.method}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>URL</Typography>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word', fontSize: '0.85rem' }}>
                            {selectedEvent.url}
                          </Typography>
                        </Grid>
                        {selectedEvent.detected_pattern && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>Detected Pattern</Typography>
                            <Paper sx={{ p: 1.5, bgcolor: '#FFF3CD', fontFamily: 'monospace', fontSize: '0.85rem', maxHeight: 200, overflow: 'auto' }}>
                              {selectedEvent.detected_pattern}
                            </Paper>
                          </Grid>
                        )}
                        {selectedEvent.request_data && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>Request Data</Typography>
                            <Paper sx={{ p: 1.5, bgcolor: '#F8F9FA', fontFamily: 'monospace', fontSize: '0.85rem', maxHeight: 200, overflow: 'auto' }}>
                              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {JSON.stringify(selectedEvent.request_data, null, 2)}
                              </pre>
                            </Paper>
                          </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>Detected At</Typography>
                          <Typography variant="body1">
                            {new Date(selectedEvent.detected_at || selectedEvent.created_at).toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>Status</Typography>
                          <Select
                            value={selectedEvent.status}
                            onChange={(e) => handleStatusUpdate(selectedEvent.eventID, e.target.value)}
                            size="small"
                            sx={{ minWidth: 150 }}
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="investigated">Investigated</MenuItem>
                            <MenuItem value="resolved">Resolved</MenuItem>
                            <MenuItem value="false_positive">False Positive</MenuItem>
                          </Select>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                )}
              </Box>
              )}
                </>
              )}
            </>
      )}
        </Box>
      </Box>

      {/* Detailed Visualization Dialog */}
      {chartDialogOpen && selectedChart && chartData && (
        <Dialog 
          open={chartDialogOpen} 
          onClose={() => {
            setChartDialogOpen(false);
            setSelectedChart(null);
            setChartTab(0);
          }}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              bgcolor: '#FFFFFF'
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: '#F8F9FA',
            borderBottom: '2px solid #E0E0E0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssessmentIcon sx={{ color: '#E74C3C', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C3E50' }}>
                {selectedChart === 'monthlyEvents' && 'Monthly Security Events Trend'}
                {selectedChart === 'eventsByType' && 'Security Events by Type'}
                {selectedChart === 'eventsBySeverity' && 'Security Events by Severity'}
                {selectedChart === 'eventsByStatus' && 'Security Events by Status'}
                {selectedChart === 'topIPs' && 'Top Source IP Addresses'}
                {selectedChart === 'securityRating' && 'Security Rating Analysis'}
              </Typography>
            </Box>
            <IconButton
              onClick={() => {
                setChartDialogOpen(false);
                setSelectedChart(null);
                setChartTab(0);
              }}
              sx={{ color: '#7F8C8D', '&:hover': { bgcolor: '#E0E0E0' } }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Tabs value={chartTab} onChange={(e, newValue) => setChartTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="Visualization" />
              <Tab label="Text Analysis" />
            </Tabs>

            {chartTab === 0 && (
              <Box>
                {selectedChart === 'monthlyEvents' && chartData.monthlyEvents.length > 0 && (
                  <Box>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                          Total Events: {chartData.monthlyEvents.reduce((sum, d) => sum + (d.events || 0), 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                          Average: {(chartData.monthlyEvents.reduce((sum, d) => sum + (d.events || 0), 0) / chartData.monthlyEvents.length).toFixed(1)} events/month
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                          Peak: {Math.max(...chartData.monthlyEvents.map(d => d.events || 0))} events
                        </Typography>
                      </Box>
                      {isZoomed('monthlyEvents', chartData.monthlyEvents.length) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: '#E74C3C', fontWeight: 500 }}>
                            Showing {zoomState.monthlyEvents.startIndex + 1}-{zoomState.monthlyEvents.endIndex !== null ? zoomState.monthlyEvents.endIndex + 1 : chartData.monthlyEvents.length} of {chartData.monthlyEvents.length} months
                          </Typography>
                          <Tooltip title="Zoom Out">
                            <IconButton 
                              size="small" 
                              onClick={() => handleZoomOut('monthlyEvents', chartData.monthlyEvents.length)}
                              disabled={!canZoomOut('monthlyEvents', chartData.monthlyEvents.length)}
                              sx={{ 
                                color: '#E74C3C',
                                '&:hover': { bgcolor: '#FFEBEE' },
                                '&.Mui-disabled': { color: '#BDBDBD' }
                              }}
                            >
                              <ZoomOutIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Zoom In">
                            <IconButton 
                              size="small" 
                              onClick={() => handleZoomIn('monthlyEvents', chartData.monthlyEvents.length)}
                              disabled={!canZoomIn('monthlyEvents', chartData.monthlyEvents.length)}
                              sx={{ 
                                color: '#E74C3C',
                                '&:hover': { bgcolor: '#FFEBEE' },
                                '&.Mui-disabled': { color: '#BDBDBD' }
                              }}
                            >
                              <ZoomInIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reset Zoom">
                            <IconButton 
                              size="small" 
                              onClick={() => handleResetZoom('monthlyEvents')}
                              sx={{ 
                                color: '#E74C3C',
                                '&:hover': { bgcolor: '#FFEBEE' }
                              }}
                            >
                              <RestartAltIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                      {!isZoomed('monthlyEvents', chartData.monthlyEvents.length) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Tooltip title="Zoom In">
                            <IconButton 
                              size="small" 
                              onClick={() => handleZoomIn('monthlyEvents', chartData.monthlyEvents.length)}
                              disabled={!canZoomIn('monthlyEvents', chartData.monthlyEvents.length)}
                              sx={{ 
                                color: '#E74C3C',
                                '&:hover': { bgcolor: '#FFEBEE' },
                                '&.Mui-disabled': { color: '#BDBDBD' }
                              }}
                            >
                              <ZoomInIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Use brush below chart or zoom buttons to navigate">
                            <Typography variant="caption" sx={{ color: '#7F8C8D', fontStyle: 'italic', ml: 0.5 }}>
                              Zoom available
                            </Typography>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart 
                        data={chartData.monthlyEvents}
                        margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value) => [`${value} events`, 'Security Events']}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="events" stroke="#E74C3C" strokeWidth={3} name="Security Events" dot={{ r: 5 }} activeDot={{ r: 8 }} />
                        <Brush 
                          dataKey="month"
                          height={30}
                          stroke="#E74C3C"
                          startIndex={zoomState.monthlyEvents.startIndex}
                          endIndex={zoomState.monthlyEvents.endIndex}
                          onChange={(e) => {
                            if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
                              handleZoomChange('monthlyEvents', { startIndex: e.startIndex, endIndex: e.endIndex });
                            }
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
                
                {selectedChart === 'eventsByType' && chartData.eventsByType.length > 0 && (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                            Total Events: {chartData.eventsByType.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                            Threat Types: {chartData.eventsByType.filter(d => (d.value || 0) > 0).length}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                            Top Type: {chartData.eventsByType[0]?.name} ({chartData.eventsByType[0]?.value || 0} events)
                          </Typography>
                        </Box>
                        {isZoomed('eventsByType', chartData.eventsByType.length) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: '#E74C3C', fontWeight: 500 }}>
                              Showing {zoomState.eventsByType.startIndex + 1}-{zoomState.eventsByType.endIndex !== null ? zoomState.eventsByType.endIndex + 1 : chartData.eventsByType.length} of {chartData.eventsByType.length} types
                            </Typography>
                            <Tooltip title="Zoom Out">
                              <IconButton 
                                size="small" 
                                onClick={() => handleZoomOut('eventsByType', chartData.eventsByType.length)}
                                disabled={!canZoomOut('eventsByType', chartData.eventsByType.length)}
                                sx={{ 
                                  color: '#E74C3C',
                                  '&:hover': { bgcolor: '#FFEBEE' },
                                  '&.Mui-disabled': { color: '#BDBDBD' }
                                }}
                              >
                                <ZoomOutIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Zoom In">
                              <IconButton 
                                size="small" 
                                onClick={() => handleZoomIn('eventsByType', chartData.eventsByType.length)}
                                disabled={!canZoomIn('eventsByType', chartData.eventsByType.length)}
                                sx={{ 
                                  color: '#E74C3C',
                                  '&:hover': { bgcolor: '#FFEBEE' },
                                  '&.Mui-disabled': { color: '#BDBDBD' }
                                }}
                              >
                                <ZoomInIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reset Zoom">
                              <IconButton 
                                size="small" 
                                onClick={() => handleResetZoom('eventsByType')}
                                sx={{ 
                                  color: '#E74C3C',
                                  '&:hover': { bgcolor: '#FFEBEE' }
                                }}
                              >
                                <RestartAltIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                        {!isZoomed('eventsByType', chartData.eventsByType.length) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title="Zoom In">
                              <IconButton 
                                size="small" 
                                onClick={() => handleZoomIn('eventsByType', chartData.eventsByType.length)}
                                disabled={!canZoomIn('eventsByType', chartData.eventsByType.length)}
                                sx={{ 
                                  color: '#E74C3C',
                                  '&:hover': { bgcolor: '#FFEBEE' },
                                  '&.Mui-disabled': { color: '#BDBDBD' }
                                }}
                              >
                                <ZoomInIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Use brush below chart or zoom buttons to navigate">
                              <Typography variant="caption" sx={{ color: '#7F8C8D', fontStyle: 'italic', ml: 0.5 }}>
                                Zoom available
                              </Typography>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                    </Box>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart 
                        data={chartData.eventsByType}
                        margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          tick={{ fontSize: 10 }}
                          interval={0}
                        />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value, name) => [`${value} events`, 'Event Count']}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Bar dataKey="value" fill="#E74C3C" />
                        <Brush 
                          dataKey="name"
                          height={30}
                          stroke="#E74C3C"
                          startIndex={zoomState.eventsByType.startIndex}
                          endIndex={zoomState.eventsByType.endIndex}
                          onChange={(e) => {
                            if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
                              handleZoomChange('eventsByType', { startIndex: e.startIndex, endIndex: e.endIndex });
                            }
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
                
                {selectedChart === 'eventsBySeverity' && chartData.eventsBySeverity.length > 0 && (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="caption" sx={{ color: '#7F8C8D', fontStyle: 'italic', bgcolor: '#F5F5F5', px: 2, py: 0.5, borderRadius: 1 }}>
                          Expected Distribution: ~40% Low | ~30% Medium | ~20% High | ~10% Critical
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                        {chartData.eventsBySeverity.map((entry, index) => {
                          const percent = chartData.eventsBySeverity.reduce((sum, d) => sum + (d.value || 0), 0) > 0 
                            ? ((entry.value / chartData.eventsBySeverity.reduce((sum, d) => sum + (d.value || 0), 0)) * 100).toFixed(1) 
                            : 0;
                          const expectedPercent = entry.name === 'Low' ? '40%' : entry.name === 'Medium' ? '30%' : entry.name === 'High' ? '20%' : '10%';
                          return (
                            <Box key={index} sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS[index % COLORS.length] }}>
                                {entry.value}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                                {entry.name} ({percent}%)
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.7rem' }}>
                                Expected: {expectedPercent}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                    <Box sx={{ position: 'relative', width: '100%', height: 500 }}>
                      <ResponsiveContainer width="100%" height={500}>
                        <PieChart>
                          <Pie
                            data={chartData.eventsBySeverity}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={false}
                            outerRadius={140}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.eventsBySeverity.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value, name) => [`${value} events`, name]}
                            labelStyle={{ fontWeight: 600 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Custom Labels with Connector Lines */}
                      <svg
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          pointerEvents: 'none'
                        }}
                        viewBox="0 0 500 500"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        {renderDonutLabels(chartData.eventsBySeverity, COLORS)}
                      </svg>
                      
                      {/* Central Icon */}
                      <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        bgcolor: '#F5F5F5',
                        border: '2px solid #E0E0E0',
                        zIndex: 1
                      }}>
                        <SecurityIcon sx={{ fontSize: 48, color: '#2C3E50', mb: 0.5 }} />
                        <Typography variant="caption" sx={{ color: '#7F8C8D', fontSize: '0.7rem', fontWeight: 600 }}>
                          Severity
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                
                {selectedChart === 'eventsByStatus' && chartData.eventsByStatus.length > 0 && (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="caption" sx={{ color: '#7F8C8D', fontStyle: 'italic', bgcolor: '#F5F5F5', px: 2, py: 0.5, borderRadius: 1 }}>
                          Expected Distribution: ~25% Pending | ~25% Investigated | ~30% Resolved | ~20% False Positive
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                        {chartData.eventsByStatus.map((entry, index) => {
                          const percent = chartData.eventsByStatus.reduce((sum, d) => sum + (d.value || 0), 0) > 0 
                            ? ((entry.value / chartData.eventsByStatus.reduce((sum, d) => sum + (d.value || 0), 0)) * 100).toFixed(1) 
                            : 0;
                          const expectedPercent = entry.name === 'Pending' ? '25%' : entry.name === 'Investigated' ? '25%' : entry.name === 'Resolved' ? '30%' : '20%';
                          return (
                            <Box key={index} sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS[index % COLORS.length] }}>
                                {entry.value}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                                {entry.name} ({percent}%)
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#9E9E9E', fontSize: '0.7rem' }}>
                                Expected: {expectedPercent}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                    <Box sx={{ position: 'relative', width: '100%', height: 500 }}>
                      <ResponsiveContainer width="100%" height={500}>
                        <PieChart>
                          <Pie
                            data={chartData.eventsByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={false}
                            outerRadius={140}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.eventsByStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value, name) => [`${value} events`, name]}
                            labelStyle={{ fontWeight: 600 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Custom Labels with Connector Lines */}
                      <svg
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          pointerEvents: 'none'
                        }}
                        viewBox="0 0 500 500"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        {renderDonutLabels(chartData.eventsByStatus, COLORS)}
                      </svg>
                      
                      {/* Central Icon */}
                      <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        bgcolor: '#F5F5F5',
                        border: '2px solid #E0E0E0',
                        zIndex: 1
                      }}>
                        <AssessmentIcon sx={{ fontSize: 48, color: '#2C3E50', mb: 0.5 }} />
                        <Typography variant="caption" sx={{ color: '#7F8C8D', fontSize: '0.7rem', fontWeight: 600 }}>
                          Status
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                
                {selectedChart === 'topIPs' && chartData.topIPs.length > 0 && (
                  <Box>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                          Total Events: {chartData.topIPs.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                          Unique IPs: {chartData.topIPs.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#7F8C8D' }}>
                          Top IP: {chartData.topIPs[0]?.name} ({chartData.topIPs[0]?.value || 0} events)
                        </Typography>
                      </Box>
                      {isZoomed('topIPs', chartData.topIPs.length) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: '#3498DB', fontWeight: 500 }}>
                            Showing {zoomState.topIPs.startIndex + 1}-{zoomState.topIPs.endIndex !== null ? zoomState.topIPs.endIndex + 1 : chartData.topIPs.length} of {chartData.topIPs.length} IPs
                          </Typography>
                          <Tooltip title="Zoom Out">
                            <IconButton 
                              size="small" 
                              onClick={() => handleZoomOut('topIPs', chartData.topIPs.length)}
                              disabled={!canZoomOut('topIPs', chartData.topIPs.length)}
                              sx={{ 
                                color: '#3498DB',
                                '&:hover': { bgcolor: '#EBF5FB' },
                                '&.Mui-disabled': { color: '#BDBDBD' }
                              }}
                            >
                              <ZoomOutIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Zoom In">
                            <IconButton 
                              size="small" 
                              onClick={() => handleZoomIn('topIPs', chartData.topIPs.length)}
                              disabled={!canZoomIn('topIPs', chartData.topIPs.length)}
                              sx={{ 
                                color: '#3498DB',
                                '&:hover': { bgcolor: '#EBF5FB' },
                                '&.Mui-disabled': { color: '#BDBDBD' }
                              }}
                            >
                              <ZoomInIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reset Zoom">
                            <IconButton 
                              size="small" 
                              onClick={() => handleResetZoom('topIPs')}
                              sx={{ 
                                color: '#3498DB',
                                '&:hover': { bgcolor: '#EBF5FB' }
                              }}
                            >
                              <RestartAltIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                      {!isZoomed('topIPs', chartData.topIPs.length) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Tooltip title="Zoom In">
                            <IconButton 
                              size="small" 
                              onClick={() => handleZoomIn('topIPs', chartData.topIPs.length)}
                              disabled={!canZoomIn('topIPs', chartData.topIPs.length)}
                              sx={{ 
                                color: '#3498DB',
                                '&:hover': { bgcolor: '#EBF5FB' },
                                '&.Mui-disabled': { color: '#BDBDBD' }
                              }}
                            >
                              <ZoomInIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Use brush below chart or zoom buttons to navigate">
                            <Typography variant="caption" sx={{ color: '#7F8C8D', fontStyle: 'italic', ml: 0.5 }}>
                              Zoom available
                            </Typography>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart 
                        data={chartData.topIPs}
                        margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <RechartsTooltip 
                          formatter={(value, name) => [`${value} events`, 'Event Count']}
                          labelStyle={{ fontWeight: 600 }}
                        />
                        <Bar dataKey="value" fill="#3498DB" />
                        <Brush 
                          dataKey="name"
                          height={30}
                          stroke="#3498DB"
                          startIndex={zoomState.topIPs.startIndex}
                          endIndex={zoomState.topIPs.endIndex}
                          onChange={(e) => {
                            if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
                              handleZoomChange('topIPs', { startIndex: e.startIndex, endIndex: e.endIndex });
                            }
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
                
                {selectedChart === 'securityRating' && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <SecurityRatingGauge 
                      value={chartData.securityRating} 
                      title="Security Rating"
                    />
                  </Box>
                )}
              </Box>
            )}

            {chartTab === 1 && (
              <Box>
                {(() => {
                  let dataForAnalysis = null;
                  if (selectedChart === 'monthlyEvents') dataForAnalysis = chartData.monthlyEvents;
                  else if (selectedChart === 'eventsByType') dataForAnalysis = chartData.eventsByType;
                  else if (selectedChart === 'eventsBySeverity') dataForAnalysis = chartData.eventsBySeverity;
                  else if (selectedChart === 'eventsByStatus') dataForAnalysis = chartData.eventsByStatus;
                  else if (selectedChart === 'topIPs') dataForAnalysis = chartData.topIPs;
                  else if (selectedChart === 'securityRating') dataForAnalysis = chartData.securityRating;
                  
                  const analysis = generateTextAnalysis(selectedChart, dataForAnalysis);
                  
                  return (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50', mb: 2 }}>
                        Key Metrics
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                        {analysis.analysis.map((item, idx) => (
                          <Typography key={idx} variant="body1" sx={{ color: '#34495E', pl: 2, borderLeft: '3px solid #3498DB' }}>
                            • {item}
                          </Typography>
                        ))}
                      </Box>
                      
                      {analysis.insights.length > 0 && (
                        <>
                          <Divider sx={{ my: 3 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50', mb: 2 }}>
                            Insights
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                            {analysis.insights.map((item, idx) => (
                              <Typography key={idx} variant="body1" sx={{ color: '#34495E', pl: 2, borderLeft: '3px solid #F39C12' }}>
                                • {item}
                              </Typography>
                            ))}
                          </Box>
                        </>
                      )}
                      
                      {analysis.trends.length > 0 && (
                        <>
                          <Divider sx={{ my: 3 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50', mb: 2 }}>
                            Trends
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {analysis.trends.map((item, idx) => (
                              <Typography key={idx} variant="body1" sx={{ color: '#34495E', pl: 2, borderLeft: '3px solid #27AE60' }}>
                                • {item}
                              </Typography>
                            ))}
                          </Box>
                        </>
                      )}
                      
                      {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <>
                          <Divider sx={{ my: 3 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50', mb: 2 }}>
                            Recommendations
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {analysis.recommendations.map((item, idx) => (
                              <Typography key={idx} variant="body1" sx={{ color: '#34495E', pl: 2, borderLeft: '3px solid #E74C3C' }}>
                                • {item}
                              </Typography>
                            ))}
                          </Box>
                        </>
                      )}
                    </Box>
                  );
                })()}
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 2, bgcolor: '#F8F9FA', borderTop: '1px solid #E0E0E0' }}>
            <Button 
              onClick={() => {
                setChartDialogOpen(false);
                setSelectedChart(null);
                setChartTab(0);
              }}
              variant="contained"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

    </Box>
  );
}

export default SecurityMonitoring;
