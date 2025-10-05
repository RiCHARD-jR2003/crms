// src/components/dashboard/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Announcement as AnnouncementIcon,
  Support as SupportIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationIcon,
  Map as MapIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PersonAdd as PersonAddIcon,
  CreditCard as CreditCardIcon,
  Report as ReportIcon,
  Menu as MenuIcon,
  Campaign as CampaignIcon,
  History as HistoryIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  OpenInNew,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../shared/AdminSidebar';
import MobileHeader from '../shared/MobileHeader';
import FreeGoogleMapsComponent from '../shared/FreeGoogleMapsComponent';
import dashboardService from '../../services/dashboardService';
import { api } from '../../services/api';
import { 
  mainContainerStyles, 
  contentAreaStyles, 
  headerStyles, 
  titleStyles,
  subtitleStyles,
  cardStyles,
  dialogStyles,
  dialogTitleStyles,
  dialogContentStyles,
  dialogActionsStyles,
  buttonStyles,
  textFieldStyles,
  tableStyles,
  notificationBadgeStyles
} from '../../utils/themeStyles';

function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPWDMembers: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    activeMembers: 0,
    complaintsFeedback: 0 // User mentioned there's already 1 complaint
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [barangayContacts, setBarangayContacts] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMobileMenuToggle = (isOpen) => {
    setIsMobileMenuOpen(isOpen);
  };


  const getActivityIcon = (iconType) => {
    switch (iconType) {
      case 'person_add':
        return <PersonAddIcon sx={{ fontSize: 20 }} />;
      case 'campaign':
        return <CampaignIcon sx={{ fontSize: 20 }} />;
      case 'support':
        return <SupportIcon sx={{ fontSize: 20 }} />;
      case 'history':
        return <HistoryIcon sx={{ fontSize: 20 }} />;
      default:
        return <ScheduleIcon sx={{ fontSize: 20 }} />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats from our working endpoint
        const statsResponse = await api.get('/dashboard-stats');
        console.log('Dashboard stats response:', statsResponse);
        const statsData = statsResponse.data || {
          totalPWDMembers: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          activeMembers: 0,
          complaintsFeedback: 1
        };
        console.log('Dashboard stats data:', statsData);
        
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Keep default values if API fails
        setStats({
          totalPWDMembers: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          activeMembers: 0,
          complaintsFeedback: 1
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        setActivitiesLoading(true);
        
        // Fetch recent activities from our working endpoint
        const activitiesResponse = await api.get('/dashboard-activities');
        const activities = activitiesResponse.data || [];
        
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        setRecentActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };

    const fetchBarangayContacts = async () => {
      try {
        setContactsLoading(true);
        
        // Fetch barangay coordination from our working endpoint
        const coordinationResponse = await api.get('/dashboard-coordination');
        const coordination = coordinationResponse.data || [];
        
        setBarangayContacts(coordination);
      } catch (error) {
        console.error('Error fetching barangay coordination:', error);
        setBarangayContacts([]);
      } finally {
        setContactsLoading(false);
      }
    };

    const fetchMonthlyStats = async () => {
      try {
        setMonthlyLoading(true);
        
        // Fetch monthly stats from our working endpoint
        const monthlyResponse = await api.get('/dashboard-monthly');
        const monthly = monthlyResponse.data || [];
        
        setMonthlyStats(monthly);
      } catch (error) {
        console.error('Error fetching monthly stats:', error);
        setMonthlyStats([]);
      } finally {
        setMonthlyLoading(false);
      }
    };

    fetchDashboardData();
    fetchRecentActivities();
    fetchBarangayContacts();
    fetchMonthlyStats();
  }, []);

  const renderMapSection = () => {
    console.log('🗺️ AdminDashboard renderMapSection called');
    return (
      <Card sx={{ ...cardStyles, height: { xs: '300px', sm: '400px' }, mb: 3 }}>
        <CardContent sx={{ height: '100%', p: { xs: 1, sm: 2 } }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              color: '#2C3E50'
            }}
          >
            MAP OF CABUYAO
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              color: '#7F8C8D'
            }}
          >
            Laguna, Philippines
          </Typography>
          
          {/* Free Google Maps Component (No API Key Required) */}
          <FreeGoogleMapsComponent 
            height="calc(100% - 80px)"
          />
        </CardContent>
      </Card>
    );
  };

  const renderLineChart = () => {
    // Use fetched monthly data or fallback to empty data
    const monthlyData = monthlyStats.length > 0 ? monthlyStats.map(item => ({
      month: item.month,
      registered: item.registered || 0,
      pending: 0 // We don't have pending data in our endpoint yet
    })) : [
      { month: 'JAN', registered: 0, pending: 0 },
      { month: 'FEB', registered: 0, pending: 0 },
      { month: 'MAR', registered: 0, pending: 0 },
      { month: 'APR', registered: 0, pending: 0 },
      { month: 'MAY', registered: 0, pending: 0 },
      { month: 'JUN', registered: 0, pending: 0 },
      { month: 'JUL', registered: 0, pending: 0 },
      { month: 'AUG', registered: 0, pending: 0 },
      { month: 'SEP', registered: 0, pending: 0 },
      { month: 'OCT', registered: 0, pending: 0 },
      { month: 'NOV', registered: 0, pending: 0 },
      { month: 'DEC', registered: 0, pending: 0 }
    ];

    const maxValue = Math.max(...monthlyData.map(d => (d.registered || 0) + (d.pending || 0)), 1);
    const chartHeight = 180;
    const chartWidth = 400;

    return (
      <Card sx={{ ...cardStyles, height: { xs: '250px', sm: '300px' }, mb: 3 }}>
        <CardContent sx={{ height: '100%', p: { xs: 1, sm: 2 } }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              color: '#FFFFFF',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
              mb: { xs: 1, sm: 2 }
            }}
          >
            TOTAL NEWLY REGISTERED PWD MEMBERS (2025) - Line Chart
          </Typography>
          <Box sx={{ 
            height: { xs: '150px', sm: '180px', md: '200px' }, 
            position: 'relative',
            px: { xs: 1, sm: 2 },
            border: '1px solid #E0E0E0',
            borderRadius: 1,
            background: 'linear-gradient(to top, #f8f9fa 0%, #ffffff 100%)',
            overflow: 'hidden'
          }}>
            {/* SVG Line Chart */}
            <svg 
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <line
                  key={index}
                  x1="40"
                  y1={chartHeight * ratio}
                  x2={chartWidth - 20}
                  y2={chartHeight * ratio}
                  stroke="#E0E0E0"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              ))}

              {/* Registered line */}
              <polyline
                points={monthlyData.map((data, index) => {
                  const x = 40 + (index * (chartWidth - 60) / 11);
                  const registeredValue = data.registered || 0;
                  const y = chartHeight - 20 - ((registeredValue / maxValue) * (chartHeight - 40));
                  return `${x},${isNaN(y) ? chartHeight - 20 : y}`;
                }).join(' ')}
                fill="none"
                stroke="#3498DB"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Pending line */}
              <polyline
                points={monthlyData.map((data, index) => {
                  const x = 40 + (index * (chartWidth - 60) / 11);
                  const pendingValue = data.pending || 0;
                  const y = chartHeight - 20 - ((pendingValue / maxValue) * (chartHeight - 40));
                  return `${x},${isNaN(y) ? chartHeight - 20 : y}`;
                }).join(' ')}
                fill="none"
                stroke="#E74C3C"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points for Registered */}
              {monthlyData.map((data, index) => {
                const x = 40 + (index * (chartWidth - 60) / 11);
                const registeredValue = data.registered || 0;
                const y = chartHeight - 20 - ((registeredValue / maxValue) * (chartHeight - 40));
                return (
                  <circle
                    key={`registered-${index}`}
                    cx={x}
                    cy={isNaN(y) ? chartHeight - 20 : y}
                    r="4"
                    fill="#3498DB"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Data points for Pending */}
              {monthlyData.map((data, index) => {
                const x = 40 + (index * (chartWidth - 60) / 11);
                const pendingValue = data.pending || 0;
                const y = chartHeight - 20 - ((pendingValue / maxValue) * (chartHeight - 40));
                return (
                  <circle
                    key={`pending-${index}`}
                    cx={x}
                    cy={isNaN(y) ? chartHeight - 20 : y}
                    r="4"
                    fill="#E74C3C"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Month labels */}
              {monthlyData.map((data, index) => {
                const x = 40 + (index * (chartWidth - 60) / 11);
                return (
                  <text
                    key={`label-${index}`}
                    x={x}
                    y={chartHeight - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#666"
                    fontFamily="Arial, sans-serif"
                  >
                    {data.month}
                  </text>
                );
              })}
            </svg>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 2, sm: 3 }, 
            mt: { xs: 1, sm: 2 },
            flexWrap: 'wrap'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: { xs: 8, sm: 10, md: 12 }, height: 2, backgroundColor: '#3498DB' }} />
              <Typography variant="caption" sx={{ color: '#FFFFFF', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Registered
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: { xs: 8, sm: 10, md: 12 }, height: 2, backgroundColor: '#E74C3C' }} />
              <Typography variant="caption" sx={{ color: '#FFFFFF', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Pending
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderOverview = () => (
    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
      {/* Summary Cards Row */}
      <Grid item xs={12}>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ ...cardStyles, height: { xs: '120px', sm: '140px', md: '160px' } }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: { xs: 1.5, sm: 2, md: 3 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <CheckCircleIcon sx={{ 
                  fontSize: { xs: 24, sm: 32, md: 40 }, 
                  color: '#27AE60', 
                  mb: { xs: 0.5, sm: 1 } 
                }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#000000', 
                    mb: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}
                >
                  {stats.totalPWDMembers}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#000000', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                    lineHeight: 1.2
                  }}
                >
                  Total Registered PWDs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ ...cardStyles, height: { xs: '120px', sm: '140px', md: '160px' } }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: { xs: 1.5, sm: 2, md: 3 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <ScheduleIcon sx={{ 
                  fontSize: { xs: 24, sm: 32, md: 40 }, 
                  color: '#F39C12', 
                  mb: { xs: 0.5, sm: 1 } 
                }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#2C3E50', 
                    mb: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}
                >
                  {stats.pendingApplications}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#000000', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                    lineHeight: 1.2
                  }}
                >
                  Pending Admin Approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ ...cardStyles, height: { xs: '120px', sm: '140px', md: '160px' } }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: { xs: 1.5, sm: 2, md: 3 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <PersonAddIcon sx={{ 
                  fontSize: { xs: 24, sm: 32, md: 40 }, 
                  color: '#3498DB', 
                  mb: { xs: 0.5, sm: 1 } 
                }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#2C3E50', 
                    mb: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}
                >
                  0
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#000000', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                    lineHeight: 1.2
                  }}
                >
                  Newly Registered PWD
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ ...cardStyles, height: { xs: '120px', sm: '140px', md: '160px' } }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: { xs: 1.5, sm: 2, md: 3 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <CreditCardIcon sx={{ 
                  fontSize: { xs: 24, sm: 32, md: 40 }, 
                  color: '#9B59B6', 
                  mb: { xs: 0.5, sm: 1 } 
                }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#2C3E50', 
                    mb: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}
                >
                  {stats.totalPWDMembers}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#000000', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                    lineHeight: 1.2
                  }}
                >
                  Unclaimed PWD Card
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ ...cardStyles, height: { xs: '120px', sm: '140px', md: '160px' } }}>
              <CardContent sx={{ 
                textAlign: 'center', 
                py: { xs: 1.5, sm: 2, md: 3 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <ReportIcon sx={{ 
                  fontSize: { xs: 24, sm: 32, md: 40 }, 
                  color: '#E74C3C', 
                  mb: { xs: 0.5, sm: 1 } 
                }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#2C3E50', 
                    mb: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}
                >
                  {stats.complaintsFeedback}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#000000', 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                    lineHeight: 1.2
                  }}
                >
                  Complaints/Feedback
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>


      {/* Chart and Map Row */}
      <Grid item xs={12} lg={8}>
        {renderLineChart()}
      </Grid>
      
      <Grid item xs={12} lg={4}>
        {renderMapSection()}
      </Grid>

      {/* Recent Activity Panel */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ ...cardStyles, height: { xs: '400px', sm: '450px' } }}>
          <CardContent sx={{ height: '100%', p: { xs: 1, sm: 2 } }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',   
                color: '#000000',
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                mb: { xs: 1, sm: 2 }
              }}
            >
              RECENT ACTIVITY PANEL
            </Typography>
            <Box sx={{ 
              height: { xs: '320px', sm: '370px' }, 
              overflow: 'auto',
              border: '1px solid #E0E0E0',
              borderRadius: 1,
              backgroundColor: '#FFFFFF'
            }}>
              {activitiesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={40} />
                </Box>
              ) : recentActivities.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem sx={{ px: 2, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            backgroundColor: activity.color,
                            color: '#FFFFFF'
                          }}>
                            {getActivityIcon(activity.icon)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>
                              {activity.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" sx={{ color: '#000000', display: 'block' }}>
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#7F8C8D', display: 'block' }}>
                                {activity.barangay} • {formatTimeAgo(activity.created_at)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip 
                          label={activity.status} 
                          size="small"
                          sx={{
                            backgroundColor: activity.color,
                            color: '#FFFFFF',
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                      </ListItem>
                      {index < recentActivities.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  flexDirection: 'column'
                }}>
                  <ScheduleIcon sx={{ fontSize: 48, color: '#BDC3C7', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: '#7F8C8D', textAlign: 'center' }}>
                    No recent activities
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Barangay Coordination Table */}
      <Grid item xs={12} lg={6}>
        <Card sx={{ ...cardStyles, height: { xs: '400px', sm: '450px' } }}>
          <CardContent sx={{ height: '100%', p: { xs: 1, sm: 2 } }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                color: '#000000',
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                mb: { xs: 1, sm: 2 }
              }}
            >
              BARANGAY COORDINATION TABLE
            </Typography>
            <Box sx={{ 
              height: { xs: '320px', sm: '370px' }, 
              overflow: 'auto',
              border: '1px solid #E0E0E0',
              borderRadius: 1,
              backgroundColor: '#FFFFFF'
            }}>
              {contactsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={40} />
                </Box>
              ) : barangayContacts.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#000000', fontSize: '0.75rem' }}>Barangay</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#000000', fontSize: '0.75rem' }}>President</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#000000', fontSize: '0.75rem' }}>Contact</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#000000', fontSize: '0.75rem' }}>PWD Count</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#000000', fontSize: '0.75rem' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {barangayContacts.map((contact) => (
                        <TableRow key={contact.barangay} hover>
                          <TableCell sx={{ fontSize: '0.75rem', color: '#000000' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <HomeIcon sx={{ fontSize: 16, color: '#3498DB' }} />
                              {contact.barangay}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: '#000000' }}>
                            {contact.president_name}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PhoneIcon sx={{ fontSize: 12, color: '#27AE60' }} />
                                <Typography variant="caption" sx={{ color: '#000000' }}>
                                  {contact.phone}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EmailIcon sx={{ fontSize: 12, color: '#3498DB' }} />
                                <Typography variant="caption" sx={{ color: '#000000' }}>
                                  {contact.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: '#000000' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography variant="caption" sx={{ color: '#000000' }}>
                                {contact.pwd_count} PWDs
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#F39C12' }}>
                                {contact.pending_applications} pending
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={contact.status} 
                              size="small"
                              sx={{
                                backgroundColor: contact.status === 'active' ? '#27AE60' : '#E74C3C',
                                color: '#FFFFFF',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  flexDirection: 'column'
                }}>
                  <LocationIcon sx={{ fontSize: 48, color: '#BDC3C7', mb: 1 }} />
                  <Typography variant="body2" sx={{ color: '#7F8C8D', textAlign: 'center' }}>
                    No barangay contacts available
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Debug logging
  console.log('Current stats state:', stats);
  
  return (
    <Box sx={mainContainerStyles}>
      {/* Mobile Header */}
      <MobileHeader 
        onMenuToggle={handleMobileMenuToggle}
        isMenuOpen={isMobileMenuOpen}
      />
      
      {/* Admin Sidebar with Toggle */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          ...contentAreaStyles,
          flexGrow: 1,
          ml: { xs: 0, md: '280px' }, // Hide sidebar margin on mobile
          width: { xs: '100%', md: 'calc(100% - 280px)' },
          transition: 'margin-left 0.3s ease-in-out',
          // Adjust for mobile header
          paddingTop: { xs: '56px', md: 0 }, // Mobile header height
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 1 } }}>

          {/* Page Header */}
          <Box sx={{ mb: { xs: 2, md: 4 } }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#000000', 
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              Dashboard
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#000000',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Welcome back, {currentUser?.username || 'Admin'}. Here's what's happening with your PWD management system.
            </Typography>
          </Box>

          {/* Dashboard Content */}
          {renderOverview()}
        </Container>
      </Box>
    </Box>
  );
}

export default AdminDashboard;