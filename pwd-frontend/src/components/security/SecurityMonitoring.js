import React, { useEffect, useState, useMemo } from 'react';
import { 
  Box, Card, CardContent, Typography, Table, TableBody, TableCell, 
  TableHead, TableRow, TextField, InputAdornment, CircularProgress,
  Chip, Select, MenuItem, FormControl, InputLabel, Grid, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Paper,
  IconButton, Tooltip, Alert, Checkbox
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import AdminSidebar from '../shared/AdminSidebar';
import MobileHeader from '../shared/MobileHeader';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { contentAreaStyles, mainContainerStyles } from '../../utils/themeStyles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

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
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0
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
    setEventDialogOpen(true);
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

          {/* Statistics Cards */}
          {statistics && (
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
          )}

          {/* Filters and Search */}
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
                      <MenuItem value="XSS">XSS</MenuItem>
                      <MenuItem value="PATH_TRAVERSAL">Path Traversal</MenuItem>
                      <MenuItem value="COMMAND_INJECTION">Command Injection</MenuItem>
                      <MenuItem value="FILE_UPLOAD_THREAT">File Upload Threat</MenuItem>
                      <MenuItem value="BRUTE_FORCE">Brute Force</MenuItem>
                      <MenuItem value="UNAUTHORIZED_ACCESS">Unauthorized Access</MenuItem>
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
            <Card>
              <CardContent>
                <Table size="small">
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
                          bgcolor: idx % 2 ? '#F7FBFF' : 'white',
                          '&:hover': { bgcolor: '#E8F4F8', cursor: 'pointer' }
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

                {/* Pagination */}
                {pagination.last_page > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 2 }}>
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
          )}
        </Box>
      </Box>

      {/* Event Detail Dialog */}
      <Dialog 
        open={eventDialogOpen} 
        onClose={() => setEventDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Security Event Details</Typography>
            <IconButton onClick={() => setEventDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Event Type</Typography>
                  <Chip 
                    label={selectedEvent.event_type.replace(/_/g, ' ')} 
                    color={getEventTypeColor(selectedEvent.event_type)}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Severity</Typography>
                  <Chip 
                    icon={getSeverityIcon(selectedEvent.severity)}
                    label={selectedEvent.severity.toUpperCase()} 
                    color={getSeverityColor(selectedEvent.severity)}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>{selectedEvent.description}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">IP Address</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>{selectedEvent.ip_address || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">User Agent</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                    {selectedEvent.user_agent || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">User</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {selectedEvent.user?.username || selectedEvent.user?.email || 'Anonymous'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Method</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>{selectedEvent.method}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">URL</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                    {selectedEvent.url}
                  </Typography>
                </Grid>
                {selectedEvent.detected_pattern && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Detected Pattern</Typography>
                    <Paper sx={{ p: 1.5, mt: 0.5, bgcolor: '#FFF3CD', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {selectedEvent.detected_pattern}
                    </Paper>
                  </Grid>
                )}
                {selectedEvent.request_data && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Request Data</Typography>
                    <Paper sx={{ p: 1.5, mt: 0.5, bgcolor: '#F8F9FA', fontFamily: 'monospace', fontSize: '0.85rem', maxHeight: 200, overflow: 'auto' }}>
                      <pre>{JSON.stringify(selectedEvent.request_data, null, 2)}</pre>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Detected At</Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {new Date(selectedEvent.detected_at || selectedEvent.created_at).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Select
                    value={selectedEvent.status}
                    onChange={(e) => handleStatusUpdate(selectedEvent.eventID, e.target.value)}
                    size="small"
                    sx={{ mt: 0.5, minWidth: 150 }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="investigated">Investigated</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="false_positive">False Positive</MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SecurityMonitoring;

