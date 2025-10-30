import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow, TextField, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AdminSidebar from '../shared/AdminSidebar';
import MobileHeader from '../shared/MobileHeader';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { contentAreaStyles, mainContainerStyles } from '../../utils/themeStyles';

function AuditLogs() {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.get('/audit-logs');
        setLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = logs.filter(l => {
    const text = `${l?.user?.username || ''} ${l?.user?.role || ''} ${l?.action || ''}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <Box sx={mainContainerStyles}>
      <MobileHeader onMenuToggle={setIsMobileMenuOpen} isMenuOpen={isMobileMenuOpen} />
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Box component="main" sx={{ ...contentAreaStyles, ml: { xs: 0, md: '280px' }, width: { xs: '100%', md: 'calc(100% - 280px)' } }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>Audit Logs</Typography>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search by user, role, or action"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </CardContent>
          </Card>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Card>
              <CardContent>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((log) => (
                      <TableRow key={`${log.logID || log.id}-${log.timestamp}`}>
                        <TableCell>{log?.user?.username || log?.userID}</TableCell>
                        <TableCell>{log?.user?.role || ''}</TableCell>
                        <TableCell>{log?.action}</TableCell>
                        <TableCell>{new Date(log?.timestamp || log?.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">No logs found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default AuditLogs;


