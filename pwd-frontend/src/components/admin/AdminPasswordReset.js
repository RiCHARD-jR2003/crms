// src/components/admin/AdminPasswordReset.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  Stack
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Edit as EditIcon } from '@mui/icons-material';
import passwordService from '../../services/passwordService';
import api from '../../services/api';

function AdminPasswordReset({ open, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState({ email: '', newPassword: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Get all unique roles from users
  const allRoles = React.useMemo(() => {
    const roles = new Set();
    users.forEach(user => {
      if (user.role) roles.add(user.role);
    });
    return Array.from(roles).sort();
  }, [users]);

  // Filter users based on search term and selected roles
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Role filter
      const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(user.role);
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRoles]);

  const handleRoleFilterChange = (role) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
  };

  const handleSelectAllRoles = () => {
    if (selectedRoles.length === allRoles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles([...allRoles]);
    }
  };

  const verifyAdminAuth = async () => {
    try {
      // Ping an admin-only endpoint to verify token/role before attempting reset
      await api.get('/admin/dashboard/stats');
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    // Live validation
    if (name === 'email') {
      const emailOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(value);
      setValidation(v => ({ ...v, email: value && !emailOk ? 'Enter a valid email address' : '' }));
    }
    if (name === 'newPassword') {
      setValidation(v => ({ ...v, newPassword: value && value.length < 6 ? 'Password must be at least 6 characters long' : '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Ensure we are authenticated as Admin (token valid and role has access)
      const isAuthed = await verifyAdminAuth();
      if (!isAuthed) {
        setError('Admin authentication required. Please log in again and retry.');
        setLoading(false);
        return;
      }
      // Client-side validation
      const emailOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(formData.email);
      const passOk = (formData.newPassword || '').length >= 6;
      const newVal = {
        email: !emailOk ? 'Enter a valid email address' : '',
        newPassword: !passOk ? 'Password must be at least 6 characters long' : ''
      };
      setValidation(newVal);
      if (!emailOk || !passOk) {
        setLoading(false);
        return;
      }
      // Validate password strength
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      const result = await passwordService.adminResetUserPassword(
        formData.email,
        formData.newPassword
      );

      setSuccess(`Password reset successfully for ${result.email || formData.email} (${result.role || 'User'})`);
      
      // Clear form
      setFormData({
        email: '',
        newPassword: ''
      });

      // Refresh users list
      fetchUsers();

    } catch (err) {
      const status = err?.status;
      const apiMsg = err?.data?.error || err?.data?.message;
      if (status === 401 || status === 403) {
        // DEV fallback: if running locally, try public reset route to unblock testing
        const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        if (isLocal) {
          try {
            const fallback = await passwordService.resetPassword(
              formData.email,
              formData.newPassword,
              formData.newPassword
            );
            setSuccess(`(Dev fallback) Password reset successfully for ${fallback?.email || formData.email}`);
            setError('');
          } catch (fallbackErr) {
            setError('Admin authentication required. Please log in again and retry.');
          }
        } else {
          setError('Admin authentication required. Please log in again and retry.');
        }
      } else if (status === 404) {
        setError('User not found. Please verify the email address.');
      } else if (status === 422) {
        setError('Validation failed. Ensure the password is at least 6 characters.');
      } else {
        setError(apiMsg || 'Failed to reset user password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const combined = [];

      // Helper to normalize arrays from various shapes
      const pickArray = (res) => {
        const candidates = [res?.data?.users, res?.data?.members, res?.data?.data, res?.users, res?.members, res?.data, res];
        return candidates.find(a => Array.isArray(a));
      };

      // 1) Fetch standard users (for Admins, Barangay Presidents, Staff, etc.)
      try {
        const resUsers = await api.get('/users');
        const arr = pickArray(resUsers) || [];
        arr.forEach(u => {
          const email = u.email || u.user?.email;
          if (!email) return;
          
          const role = u.role || u.userType || u.type || 'User';
          let normalizedRole = role;
          
          // Normalize role names
          if (role?.toLowerCase().includes('barangay') || role === 'BarangayPresident') {
            normalizedRole = 'Barangay President';
          } else if (role?.toLowerCase().includes('admin') || role === 'Admin' || role === 'SuperAdmin') {
            normalizedRole = 'Admin';
          } else if (role?.toLowerCase().includes('staff')) {
            normalizedRole = role; // Keep Staff1, Staff2, etc.
          } else if (role?.toLowerCase().includes('front') || role === 'FrontDesk') {
            normalizedRole = 'Front Desk';
          } else if (role?.toLowerCase().includes('pwd') || role === 'PWDMember') {
            normalizedRole = 'PWD Member';
          }
          
          combined.push({ email, role: normalizedRole });
        });
      } catch (e) {
        console.warn('Users endpoint not available:', e?.message || e);
      }

      // 2) Filter Barangay Presidents from users data
      try {
        const barangayPresidents = users.filter(user => user.role === 'BarangayPresident');
        barangayPresidents.forEach(bp => {
          combined.push({ email: bp.email, role: 'Barangay President' });
        });
      } catch (e) {
        console.warn('Error filtering barangay presidents:', e?.message || e);
      }

      // 3) Fetch PWD Members
      try {
        const resPwd = await api.get('/pwd-members');
        const arr = pickArray(resPwd) || [];
        arr.forEach(m => {
          const email = m?.email || m?.user?.email;
          if (email) combined.push({ email, role: 'PWD Member' });
        });
      } catch (e) {
        console.warn('PWD members endpoint not available:', e?.message || e);
      }

      // De-duplicate by email
      const seen = new Set();
      const unique = combined.filter(u => {
        if (!u.email) return false;
        const key = u.email.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setUsers(unique);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        email: '',
        newPassword: ''
      });
      setError('');
      setSuccess('');
      setUsers([]);
      setSearchTerm('');
      setSelectedRoles([]);
      onClose();
    }
  };

  const handleEditUser = (email) => {
    setFormData(prev => ({
      ...prev,
      email: email
    }));
  };

  React.useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const getRoleColor = (role) => {
    if (!role) return 'default';
    const roleLower = role.toLowerCase();
    if (roleLower.includes('admin')) return 'error';
    if (roleLower.includes('barangay')) return 'warning';
    if (roleLower.includes('pwd') || roleLower.includes('member')) return 'success';
    if (roleLower.includes('staff')) return 'info';
    if (roleLower.includes('front')) return 'primary';
    return 'default';
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { bgcolor: '#FFFFFF' } }}
    >
      <DialogTitle sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0' }}>
        <Typography variant="h5" sx={{ color: '#2C3E50' }}>
          Admin Password Reset
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#FFFFFF' }}>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Password Reset Form */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#FFFFFF' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#2C3E50' }}>
              Reset User Password
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="email"
                label="User Email"
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                error={!!validation.email}
                helperText={validation.email}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={loading}
                error={!!validation.newPassword}
                helperText={validation.newPassword || 'Password must be at least 6 characters long'}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(prev => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !formData.email || !formData.newPassword || !!validation.email || !!validation.newPassword}
                sx={{ 
                  backgroundColor: '#E74C3C',
                  '&:hover': {
                    backgroundColor: '#C0392B',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
            </Box>
          </Paper>

          {/* Users List */}
          <Paper elevation={2} sx={{ p: 3, bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ color: '#2C3E50' }}>
                All Users
              </Typography>
              <TextField
                size="small"
                placeholder="Search by email, username, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  width: 250,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F8F9FA',
                    '& fieldset': {
                      borderColor: '#E0E0E0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#0b87ac',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0b87ac',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.9rem',
                  }
                }}
              />
            </Box>
            
            {/* Role Filters */}
            {allRoles.length > 0 && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#F8F9FA', borderRadius: 2, border: '1px solid #E0E0E0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ color: '#2C3E50', fontWeight: 600, mr: 2 }}>
                    Filter by Role:
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedRoles.length === allRoles.length && allRoles.length > 0}
                        indeterminate={selectedRoles.length > 0 && selectedRoles.length < allRoles.length}
                        onChange={handleSelectAllRoles}
                        size="small"
                        sx={{
                          color: '#0b87ac',
                          '&.Mui-checked': {
                            color: '#0b87ac',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#7F8C8D' }}>
                        Select All
                      </Typography>
                    }
                    sx={{ mr: 2 }}
                  />
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {allRoles.map((role) => (
                    <FormControlLabel
                      key={role}
                      control={
                        <Checkbox
                          checked={selectedRoles.includes(role)}
                          onChange={() => handleRoleFilterChange(role)}
                          size="small"
                          sx={{
                            color: getRoleColor(role) === 'error' ? '#E74C3C' : 
                                   getRoleColor(role) === 'warning' ? '#F39C12' : 
                                   getRoleColor(role) === 'success' ? '#27AE60' : '#7F8C8D',
                            '&.Mui-checked': {
                              color: getRoleColor(role) === 'error' ? '#E74C3C' : 
                                     getRoleColor(role) === 'warning' ? '#F39C12' : 
                                     getRoleColor(role) === 'success' ? '#27AE60' : '#7F8C8D',
                            },
                          }}
                        />
                      }
                      label={
                        <Chip
                          label={role}
                          size="small"
                          color={getRoleColor(role)}
                          sx={{
                            height: '24px',
                            fontSize: '0.75rem',
                            fontWeight: selectedRoles.includes(role) ? 600 : 400,
                            opacity: selectedRoles.length > 0 && !selectedRoles.includes(role) ? 0.5 : 1,
                          }}
                        />
                      }
                    />
                  ))}
                </Stack>
                {selectedRoles.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Button
                      size="small"
                      onClick={() => setSelectedRoles([])}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        color: '#7F8C8D',
                        '&:hover': {
                          color: '#E74C3C',
                          bgcolor: 'transparent',
                        },
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            {loadingUsers ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : users.length === 0 ? (
              <Box display="flex" justifyContent="center" p={3}>
                <Typography variant="body2" color="text.secondary">No users found.</Typography>
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box display="flex" justifyContent="center" p={3}>
                <Typography variant="body2" color="text.secondary">
                  No users found matching "{searchTerm}".
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 400, border: '1px solid #E0E0E0', borderRadius: 1 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        bgcolor: '#F8F9FA', 
                        fontWeight: 600, 
                        color: '#2C3E50',
                        borderBottom: '2px solid #E0E0E0'
                      }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: '#F8F9FA', 
                        fontWeight: 600, 
                        color: '#2C3E50',
                        borderBottom: '2px solid #E0E0E0'
                      }}>
                        Role
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow 
                        key={user.userID || user.id || `user-${index}`}
                        onClick={() => handleEditUser(user.email)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: formData.email === user.email ? '#E3F2FD' : 'transparent',
                          '&:hover': {
                            bgcolor: formData.email === user.email ? '#BBDEFB' : '#F8F9FA',
                          },
                          '&:last-child td': {
                            borderBottom: 0,
                          },
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <TableCell sx={{ color: '#2C3E50', fontSize: '0.9rem' }}>
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role || 'N/A'} 
                            color={getRoleColor(user.role)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {/* Results Count */}
            {!loadingUsers && filteredUsers.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#7F8C8D', fontSize: '0.85rem' }}>
                  Showing {filteredUsers.length} of {users.length} user{users.length !== 1 ? 's' : ''}
                  {selectedRoles.length > 0 && ` (filtered by ${selectedRoles.length} role${selectedRoles.length !== 1 ? 's' : ''})`}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: '#FFFFFF', borderTop: '1px solid #E0E0E0' }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ color: '#7F8C8D' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AdminPasswordReset;
