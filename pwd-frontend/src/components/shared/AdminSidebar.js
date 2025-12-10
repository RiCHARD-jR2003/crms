import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Avatar, IconButton, Badge, Collapse } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import BarChartIcon from '@mui/icons-material/BarChart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';
import UpdateIcon from '@mui/icons-material/Update';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Menu from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supportService } from '../../services/supportService';
import toastService from '../../services/toastService';
import ChangePassword from '../auth/ChangePassword';
import AdminPasswordReset from '../admin/AdminPasswordReset';
import NotificationBell from './NotificationBell';

function AdminSidebar({ isOpen, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useAuth();
  const [supportNotifications, setSupportNotifications] = useState(0);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [adminPasswordResetOpen, setAdminPasswordResetOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    memberManagement: true,
    benefitTracking: true
  });

  useEffect(() => {
    const fetchSupportNotifications = async () => {
      try {
        const tickets = await supportService.getTickets();
        const openTickets = tickets.filter(ticket => ticket.status === 'open').length;
        setSupportNotifications(openTickets);
      } catch (error) {
        console.error('Error fetching support notifications:', error);
        setSupportNotifications(0);
      }
    };

    fetchSupportNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchSupportNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const confirmed = await toastService.confirmAsync(
      'Logout Confirmation',
      'Are you sure you want to logout? You will need to sign in again to access your account.'
    );
    
    if (confirmed) {
      await logout();
      navigate('/login');
    }
  };

  // Determine which menu item is active based on current path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if any sub-item in a group is active
  const isGroupActive = (paths) => {
    return paths.some(path => isActive(path));
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const SidebarItem = ({ icon, label, path, active = false, badgeCount = 0, isSubItem = false }) => {
    return (
      <Box 
        onClick={() => navigate(path)}
        sx={{
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          px: isSubItem ? 3 : 1.5, // Indent sub-items
          py: 0.75,
          borderRadius: 2, 
          mb: 0.5,
          bgcolor: active ? 'var(--color-primary)' : 'transparent',
          color: active ? '#FFFFFF' : 'var(--color-text-muted)',
          fontWeight: active ? 600 : 500,
          '&:hover': {
            background: active ? 'var(--color-primary-dark)' : 'var(--sidebar-hover)',
            cursor: 'pointer',
            color: active ? '#FFFFFF' : 'var(--color-primary)'
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {badgeCount > 0 ? (
          <Badge badgeContent={badgeCount} color="error">
            {React.cloneElement(icon, { sx: { fontSize: isSubItem ? 18 : 22, color: active ? '#FFFFFF' : 'var(--color-text-muted)' } })}
          </Badge>
        ) : (
          React.cloneElement(icon, { sx: { fontSize: isSubItem ? 18 : 22, color: active ? '#FFFFFF' : 'var(--color-text-muted)' } })
        )}
        <Typography sx={{ fontWeight: 'inherit', fontSize: isSubItem ? '0.9rem' : '0.95rem', color: active ? '#FFFFFF' : 'var(--color-text-muted)' }}>{label}</Typography>
      </Box>
    );
  };

  const SidebarGroup = ({ icon, label, groupName, children, paths = [] }) => {
    const isExpanded = expandedGroups[groupName];
    const groupActive = isGroupActive(paths);
    
    return (
      <Box>
        <Box 
          onClick={() => toggleGroup(groupName)}
          sx={{
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            px: 1.5,
            py: 0.75,
            borderRadius: 2, 
            mb: 0.5,
            bgcolor: groupActive ? 'var(--color-primary)' : 'transparent',
            color: groupActive ? '#FFFFFF' : 'var(--color-text-muted)',
            fontWeight: groupActive ? 600 : 500,
            '&:hover': {
              background: groupActive ? 'var(--color-primary-dark)' : 'var(--sidebar-hover)',
              cursor: 'pointer',
              color: groupActive ? '#FFFFFF' : 'var(--color-primary)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <IconButton 
            size="small" 
            sx={{ 
              p: 0.5, 
              color: groupActive ? '#FFFFFF' : 'var(--color-text-muted)',
              '&:hover': { bgcolor: 'transparent' }
            }}
          >
            {isExpanded ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ChevronRightIcon sx={{ fontSize: 18 }} />}
          </IconButton>
          {React.cloneElement(icon, { sx: { fontSize: 22, color: groupActive ? '#FFFFFF' : 'var(--color-text-muted)' } })}
          <Typography sx={{ fontWeight: 'inherit', fontSize: '0.95rem', color: groupActive ? '#FFFFFF' : 'var(--color-text-muted)' }}>
            {label}
          </Typography>
        </Box>
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 0.5 }}>
            {children}
          </Box>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      width: { xs: isOpen ? 280 : 0, md: 280 },
      bgcolor: 'var(--sidebar-bg)', 
      color: 'var(--color-text)', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      left: 0,
      top: 0,
      borderRight: '1px solid var(--color-border-subtle)',
      zIndex: 1300,
      transition: 'width 0.3s ease-in-out',
      overflow: 'hidden', // Prevent outer container from scrolling
      boxShadow: { xs: isOpen ? '0 20px 35px rgba(11,31,51,0.15)' : 'none', md: '0 8px 24px rgba(11,31,51,0.08)' }
    }}>
      {/* Header with Logo and Toggle Button */}
      <Box sx={{ 
        p: 2, // Reduced padding
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        justifyContent: 'space-between',
        flexShrink: 0 // Prevent header from shrinking
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img 
              src="/images/cropped_image.png" 
              alt="PDAO Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain' 
              }}
            />
          </Box>
          <Box sx={{ display: { xs: isOpen ? 'block' : 'none', md: 'block' } }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#2C3E50', lineHeight: 1.2 }}>
              CABUYAO PDAO
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#2C3E50', lineHeight: 1.2 }}>
              RMS
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Info */}
      <Box sx={{ 
        p: 2, // Reduced padding
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        opacity: { xs: isOpen ? 1 : 0, md: 1 },
        transition: 'opacity 0.3s ease-in-out',
        flexShrink: 0 // Prevent user info from shrinking
      }}>
        <Avatar sx={{ width: 40, height: 40, bgcolor: '#3498DB', color: 'white' }}>
          <PersonIcon />
        </Avatar>
        <Typography sx={{ 
          fontWeight: 600, 
          color: '#2C3E50',
          display: { xs: isOpen ? 'block' : 'none', md: 'block' },
          flex: 1
        }}>
          Hello {currentUser?.role === 'SuperAdmin' ? 'SuperAdmin' : 'Admin'}
        </Typography>
        <NotificationBell />
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ 
        p: 1.5, // Restored to comfortable size
        flex: 1, 
        mt: 1, // Restored to comfortable size
        opacity: { xs: isOpen ? 1 : 0, md: 1 },
        transition: 'opacity 0.3s ease-in-out',
        overflowY: 'auto', // Enable scrolling when needed
        overflowX: 'hidden',
        minHeight: 0, // Allow flex item to shrink
        maxHeight: '100%', // Constrain to parent height
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#a8a8a8',
        },
      }}>
        <SidebarItem 
          icon={<DashboardIcon />} 
          label="Dashboard" 
          path="/admin-dashboard"
          active={isActive('/admin-dashboard') || isActive('/dashboard')}
        />
        
        {/* Member Management Group */}
        <SidebarGroup 
          icon={<PeopleIcon />}
          label="Member Management"
          groupName="memberManagement"
          paths={['/pwd-records', '/pwd-card']}
        >
          <SidebarItem 
            icon={<PeopleIcon />} 
            label="PWD Masterlist" 
            path="/pwd-records"
            active={isActive('/pwd-records')}
            isSubItem={true}
          />
          <SidebarItem 
            icon={<CreditCardIcon />} 
            label="PWD Card" 
            path="/pwd-card"
            active={isActive('/pwd-card')}
            isSubItem={true}
          />
        </SidebarGroup>

        <SidebarItem 
          icon={<BarChartIcon />} 
          label="Analytics" 
          path="/analytics"
          active={isActive('/analytics')}
        />
        
        <SidebarItem 
          icon={<UpdateIcon />} 
          label="ID Renewal" 
          path="/renewal-dashboard"
          active={isActive('/renewal-dashboard')}
        />
        
        <SidebarItem 
          icon={<AssessmentIcon />} 
          label="Disability Assessment" 
          path="/disability-assessment"
          active={isActive('/disability-assessment')}
        />
        
        {/* Benefit Tracking Group */}
        <SidebarGroup 
          icon={<TrackChangesIcon />}
          label="Benefit Tracking"
          groupName="benefitTracking"
          paths={['/ayuda', '/benefit-tracking', '/claim-history']}
        >
          <SidebarItem 
            icon={<FavoriteIcon />} 
            label="Ayuda" 
            path="/ayuda"
            active={isActive('/ayuda')}
            isSubItem={true}
          />
          <SidebarItem 
            icon={<TrackChangesIcon />} 
            label="Benefit Tracking" 
            path="/benefit-tracking"
            active={isActive('/benefit-tracking')}
            isSubItem={true}
          />
          <SidebarItem 
            icon={<DescriptionIcon />} 
            label="Claim History" 
            path="/claim-history"
            active={isActive('/claim-history')}
            isSubItem={true}
          />
        </SidebarGroup>

        <SidebarItem 
          icon={<AnnouncementIcon />} 
          label="Announcement" 
          path="/announcement"
          active={isActive('/announcement')}
        />
        <SidebarItem 
          icon={<SupportAgentIcon />} 
          label="Support Desk" 
          path="/admin-support"
          active={isActive('/admin-support')}
          badgeCount={supportNotifications}
        />
        <SidebarItem 
          icon={<DescriptionIcon />} 
          label="Document Management" 
          path="/document-management"
          active={isActive('/document-management')}
        />
        {currentUser?.role === 'SuperAdmin' && (
          <>
            <SidebarItem 
              icon={<TrackChangesIcon />} 
              label="Audit Logs" 
              path="/audit-logs"
              active={isActive('/audit-logs')}
            />
            <SidebarItem 
              icon={<SecurityIcon />} 
              label="Security Monitoring" 
              path="/security-monitoring"
              active={isActive('/security-monitoring')}
            />
          </>
        )}
      </Box>

      {/* Password Management */}
      <Box sx={{ 
        p: 1, // Further reduced padding
        opacity: { xs: isOpen ? 1 : 0, md: 1 },
        transition: 'opacity 0.3s ease-in-out',
        display: { xs: isOpen ? 'block' : 'none', md: 'block' },
        flexShrink: 0, // Prevent this section from shrinking
        borderTop: '1px solid #E0E0E0' // Add visual separation
      }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<PersonIcon />}
          onClick={() => setChangePasswordOpen(true)}
          size="small"
          sx={{
            color: '#566573',
            borderColor: '#D5DBDB',
            textTransform: 'none',
            fontWeight: 600,
            py: 0.4, // Much smaller padding
            borderRadius: 2,
            mb: 0.3, // Smaller margin
            fontSize: '0.8rem', // Smaller font
            minHeight: '32px', // Smaller button height
            '&:hover': {
              borderColor: '#3498DB',
              background: '#F4F7FC',
              color: '#3498DB'
            }
          }}
        >
          Change Password
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          startIcon={<SupportAgentIcon />}
          onClick={() => setAdminPasswordResetOpen(true)}
          size="small"
          sx={{
            color: '#566573',
            borderColor: '#D5DBDB',
            textTransform: 'none',
            fontWeight: 600,
            py: 0.4, // Much smaller padding
            borderRadius: 2,
            fontSize: '0.8rem', // Smaller font
            minHeight: '32px', // Smaller button height
            '&:hover': {
              borderColor: '#E74C3C',
              background: '#F4F7FC',
              color: '#E74C3C'
            }
          }}
        >
          Reset User Password
        </Button>
      </Box>

      {/* Logout Button */}
      <Box sx={{ 
        p: 1, // Further reduced padding
        opacity: { xs: isOpen ? 1 : 0, md: 1 },
        transition: 'opacity 0.3s ease-in-out',
        display: { xs: isOpen ? 'block' : 'none', md: 'block' },
        flexShrink: 0, // Prevent this section from shrinking
        borderTop: '1px solid #E0E0E0' // Add visual separation
      }}>
        <Button
          fullWidth
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          onClick={handleLogout}
          size="small"
          sx={{
            color: '#566573',
            borderColor: '#D5DBDB',
            textTransform: 'none',
            fontWeight: 600,
            py: 0.4, // Much smaller padding
            borderRadius: 2,
            fontSize: '0.8rem', // Smaller font
            minHeight: '32px', // Smaller button height
            '&:hover': {
              borderColor: '#0b87ac',
              background: '#F4F7FC',
              color: '#0b87ac'
            }
          }}
        >
          Log Out
        </Button>
      </Box>

      {/* Password Management Dialogs */}
      <ChangePassword 
        open={changePasswordOpen} 
        onClose={() => setChangePasswordOpen(false)} 
      />
      <AdminPasswordReset 
        open={adminPasswordResetOpen} 
        onClose={() => setAdminPasswordResetOpen(false)} 
      />
    </Box>
  );
}

export default AdminSidebar;
