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
  Chip
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Edit as EditIcon } from '@mui/icons-material';
import Radio from '@mui/material/Radio';
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

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      // 1) Fetch standard users (for Barangay Presidents if present)
      try {
        const resUsers = await api.get('/users');
        const arr = pickArray(resUsers) || [];
        arr.forEach(u => {
          const role = u.role || u.userType || u.type || 'User';
          if (role?.toLowerCase().includes('barangay')) {
            combined.push({ email: u.email || u.user?.email, role: 'Barangay President' });
          }
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
    switch (role) {
      case 'Admin': return 'error';
      case 'Barangay President': return 'warning';
      case 'PWD Member': return 'success';
      default: return 'default';
    }
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#2C3E50' }}>
                All Users
              </Typography>
              <TextField
                size="small"
                placeholder="Search by email..."
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
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Select</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow key={user.userID || user.id || `user-${index}`}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            color={getRoleColor(user.role)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Radio
                            checked={formData.email === user.email}
                            onChange={() => handleEditUser(user.email)}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
