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
  TablePagination,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import AdminSidebar from '../shared/AdminSidebar';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toastService from '../../services/toastService';

function RenewalDashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  const [stats, setStats] = useState({
    total_flagged: 0,
    expiring_this_week: 0,
    expiring_this_month: 0,
    reminders_sent: 0
  });
  const [settings, setSettings] = useState({
    renewal_days_before_expiry: 30,
    renewal_reminder_interval_days: 7
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortBy, setSortBy] = useState('latest_flagged');
  const [sortOrder, setSortOrder] = useState('desc');
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  useEffect(() => {
    fetchRenewalData();
    fetchSettings();
  }, [page, rowsPerPage, sortBy, sortOrder]);

  const fetchRenewalData = async () => {
    try {
      setLoading(true);
      const [membersResponse, statsResponse] = await Promise.all([
        api.get(`/renewals/members?page=${page + 1}&per_page=${rowsPerPage}&sort_by=${sortBy}&sort_order=${sortOrder}`),
        api.get('/renewals/stats')
      ]);

      if (membersResponse?.success) {
        setMembers(membersResponse.data || []);
        if (membersResponse.pagination) {
          setPagination(membersResponse.pagination);
        }
      }

      if (statsResponse?.success) {
        setStats(statsResponse.data || stats);
      }
    } catch (error) {
      console.error('Error fetching renewal data:', error);
      toastService.error('Failed to load renewal data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/renewals/settings');
      if (response?.success) {
        setSettings(response.data);
        setTempSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const response = await api.post('/renewals/settings', tempSettings);
      if (response?.success) {
        setSettings(tempSettings);
        setSettingsDialogOpen(false);
        toastService.success('Renewal settings updated successfully');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toastService.error('Failed to update settings');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysRemainingColor = (days) => {
    if (days < 0) return '#E74C3C'; // Expired
    if (days <= 7) return '#E74C3C'; // Urgent
    if (days <= 14) return '#F39C12'; // Warning
    return '#27AE60'; // OK
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      <AdminSidebar />
      
      <Box sx={{ 
        flexGrow: 1, 
        ml: { md: '280px', xs: 0 },
        p: 3
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50' }}>
            ID Renewal Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsDialogOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Settings
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchRenewalData}
              sx={{ textTransform: 'none' }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#7F8C8D', mb: 1 }}>
                  Total Flagged
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50' }}>
                  {stats.total_flagged}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#7F8C8D', mb: 1 }}>
                  Expiring This Week
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#E74C3C' }}>
                  {stats.expiring_this_week}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#7F8C8D', mb: 1 }}>
                  Expiring This Month
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#F39C12' }}>
                  {stats.expiring_this_month}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#7F8C8D', mb: 1 }}>
                  Reminders Sent
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#27AE60' }}>
                  {stats.reminders_sent}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Sorting */}
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#FFFFFF' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="latest_flagged">Latest Flagged</MenuItem>
                  <MenuItem value="soonest_expire">Soonest to Expire</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Order</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  label="Order"
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Members Table */}
        <Paper sx={{ bgcolor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : members.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: '#7F8C8D' }}>
                No members flagged for renewal
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#2C3E50' }}>PWD ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#2C3E50' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#2C3E50' }}>Barangay</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#2C3E50' }}>Expiration Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#2C3E50' }}>Days Remaining</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#2C3E50' }}>Flagged At</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#2C3E50' }}>Reminder Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id} hover>
                        <TableCell>{member.pwd_id || 'N/A'}</TableCell>
                        <TableCell>{member.fullName || `${member.firstName} ${member.lastName}`}</TableCell>
                        <TableCell>{member.barangay || 'N/A'}</TableCell>
                        <TableCell>{formatDate(member.cardExpirationDate)}</TableCell>
                        <TableCell>
                          <Chip
                            label={member.daysRemaining !== null ? `${member.daysRemaining} days` : 'N/A'}
                            size="small"
                            sx={{
                              bgcolor: getDaysRemainingColor(member.daysRemaining),
                              color: '#FFFFFF',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell>{formatDate(member.flagged_at)}</TableCell>
                        <TableCell>
                          {member.reminder_sent ? (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Sent"
                              size="small"
                              color="success"
                            />
                          ) : (
                            <Chip
                              icon={<WarningIcon />}
                              label="Pending"
                              size="small"
                              color="warning"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={pagination.total}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[10, 15, 25, 50]}
              />
            </>
          )}
        </Paper>

        {/* Settings Dialog */}
        <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Renewal Settings
            </Typography>
            <IconButton onClick={() => setSettingsDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <TextField
                label="Days Before Expiry to Flag"
                type="number"
                value={tempSettings.renewal_days_before_expiry}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  renewal_days_before_expiry: parseInt(e.target.value, 10)
                })}
                helperText="Number of days before card expiration to flag for renewal"
                fullWidth
                inputProps={{ min: 1, max: 365 }}
              />
              <TextField
                label="Reminder Interval (Days)"
                type="number"
                value={tempSettings.renewal_reminder_interval_days}
                onChange={(e) => setTempSettings({
                  ...tempSettings,
                  renewal_reminder_interval_days: parseInt(e.target.value, 10)
                })}
                helperText="Number of days between renewal reminder emails"
                fullWidth
                inputProps={{ min: 1, max: 30 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateSettings} variant="contained" sx={{ bgcolor: '#0b87ac' }}>
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default RenewalDashboard;

