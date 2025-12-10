import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import NotificationPanel from './NotificationPanel';

function NotificationBell() {
  const { currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
      
      // Refresh unread count every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleClick = () => {
    setPanelOpen(true);
    // Refresh count when opening panel
    fetchUnreadCount();
  };

  const handleClose = () => {
    setPanelOpen(false);
    // Refresh count when closing panel to ensure accuracy
    fetchUnreadCount();
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <Tooltip title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Badge badgeContent={unreadCount > 0 ? unreadCount : 0} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <NotificationPanel open={panelOpen} onClose={handleClose} />
    </>
  );
}

export default NotificationBell;

