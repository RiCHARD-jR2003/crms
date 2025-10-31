import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Announcement as AnnouncementIcon,
  Support as SupportIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  CreditCard as CreditCardIcon,
  Favorite as FavoriteIcon,
  TrackChanges as TrackChangesIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toastService from '../../services/toastService';

const MobileHeader = ({ onMenuToggle, isMenuOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Keep mobile menu items in sync with AdminSidebar
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin-dashboard' },
    { text: 'PWD Records', icon: <PeopleIcon />, path: '/pwd-records' },
    { text: 'PWD Card', icon: <CreditCardIcon />, path: '/pwd-card' },
    { text: 'Analytics', icon: <AssessmentIcon />, path: '/analytics' },
    { text: 'Ayuda', icon: <FavoriteIcon />, path: '/ayuda' },
    { text: 'Benefit Tracking', icon: <TrackChangesIcon />, path: '/benefit-tracking' },
    { text: 'Announcement', icon: <AnnouncementIcon />, path: '/announcement' },
    { text: 'Support Desk', icon: <SupportIcon />, path: '/admin-support' },
    { text: 'Document Management', icon: <DescriptionIcon />, path: '/document-management' },
    // Optional legacy entries if routes exist in app
    // { text: 'Applications', icon: <AssignmentIcon />, path: '/applications' },
    // { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
    if (onMenuToggle) {
      onMenuToggle(!drawerOpen);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    const confirmed = await toastService.confirmAsync(
      'Logout Confirmation',
      'Are you sure you want to logout? You will need to sign in again to access your account.'
    );
    
    if (confirmed) {
      await logout();
      navigate('/login');
      setDrawerOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ width: 280, height: '100%' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: '#1976d2', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Avatar sx={{ backgroundColor: '#FF6B35' }}>
          <AccountCircleIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            PDAO Admin
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {currentUser?.username || 'Administrator'}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ pt: 1 }}>
        {menuItems.map((item, index) => (
          <ListItem
            key={index}
            onClick={() => handleNavigation(item.path)}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              },
              borderRadius: 1,
              mx: 1,
              mb: 0.5
            }}
          >
            <ListItemIcon sx={{ color: '#1976d2' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mt: 2 }} />

      {/* Logout */}
      <List>
        <ListItem
          onClick={handleLogout}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#ffebee'
            },
            borderRadius: 1,
            mx: 1,
            mt: 1
          }}
        >
          <ListItemIcon sx={{ color: '#d32f2f' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout"
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: '#d32f2f'
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  if (!isMobile) {
    return null; // Don't show on desktop
  }

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#1976d2',
          boxShadow: 2
        }}
      >
        <Toolbar sx={{ minHeight: '56px !important' }}>
          {/* Burger Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo/Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                backgroundColor: '#FF6B35',
                mr: 1
              }}
            >
              <AccountCircleIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              PDAO Admin
            </Typography>
          </Box>

          {/* User Info */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                mr: 1,
                fontSize: '0.8rem',
                opacity: 0.9
              }}
            >
              {currentUser?.username || 'Admin'}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            backgroundColor: '#fafafa'
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default MobileHeader;
