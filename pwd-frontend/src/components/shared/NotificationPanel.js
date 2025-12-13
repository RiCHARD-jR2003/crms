import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  IconButton,
  Badge,
  Divider,
  Button,
  Tooltip,
  Paper,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  CardMembership as CardMembershipIcon,
  SupportAgent as SupportAgentIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
  NotificationsActive as NotificationsActiveIcon,
  Campaign as CampaignIcon,
  CardGiftcard as BenefitIcon,
  Assignment as ApplicationIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import announcementService from '../../services/announcementService';
import { useAuth } from '../../contexts/AuthContext';

function NotificationPanel({ open, onClose }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Get navigation path based on notification type and user role
  const getNotificationPath = (notification) => {
    const role = currentUser?.role;
    const type = notification.type;
    const data = notification.data || {};

    // Define paths based on user role
    const paths = {
      // PWD Member paths
      PWDMember: {
        announcement: '/dashboard',
        benefit_eligibility: '/benefits',
        benefit_announcement: '/benefits',
        application_status_change: '/profile',
        new_application: '/profile',
        id_claiming: '/profile',
        id_ready: '/profile',
        id_claimed: '/profile',
        card_ready_for_pickup: '/profile',
        member_welcome: '/profile',
        support_ticket_reply: '/pwd-support',
        document_upload: '/documents',
        document_review: '/documents',
        renewal_reminder: '/profile',
        renewal_required: '/profile',
        id_renewal: '/profile',
        assessment_finalized: '/profile',
        default: '/dashboard'
      },
      // Barangay President paths
      BarangayPresident: {
        announcement: '/barangay-president-announcement',
        application_status_change: '/barangay-president-pwd-records',
        new_application: '/barangay-president-pwd-records',
        support_ticket_reply: '/barangay-support',
        benefit_announcement: '/barangay-president-announcement',
        benefit_created: '/barangay-president-ayuda', // Navigate to Ayuda page to announce benefit
        assessment_finalized: '/barangay-president-pwd-records',
        default: '/barangay-president-dashboard'
      },
      // Admin paths
      Admin: {
        announcement: '/announcement',
        application_status_change: '/pwd-records',
        new_application: '/pwd-records',
        support_ticket_reply: '/admin-support',
        id_claiming: '/pwd-card',
        id_renewal: '/pwd-records',
        benefit_eligibility: '/ayuda',
        benefit_announcement: '/ayuda',
        document_upload: '/document-management',
        document_review: '/document-management',
        assessment_scheduled: '/disability-assessment',
        assessment_rescheduled: '/disability-assessment',
        assessment_finalized: '/disability-assessment',
        default: '/admin-dashboard'
      },
      // SuperAdmin paths
      SuperAdmin: {
        announcement: '/announcement',
        application_status_change: '/pwd-records',
        new_application: '/pwd-records',
        support_ticket_reply: '/admin-support',
        id_claiming: '/pwd-card',
        id_renewal: '/pwd-records',
        benefit_eligibility: '/ayuda',
        benefit_announcement: '/ayuda',
        document_upload: '/document-management',
        document_review: '/document-management',
        assessment_scheduled: '/disability-assessment',
        assessment_rescheduled: '/disability-assessment',
        assessment_finalized: '/disability-assessment',
        default: '/admin-dashboard'
      },
      // Front Desk paths
      FrontDesk: {
        announcement: '/announcement',
        application_status_change: '/pwd-records',
        new_application: '/pwd-records',
        support_ticket_reply: '/frontdesk-support',
        id_claiming: '/pwd-card',
        default: '/frontdesk-dashboard'
      },
      // Staff1 paths
      Staff1: {
        announcement: '/announcement',
        application_status_change: '/pwd-masterlist',
        new_application: '/pwd-masterlist',
        support_ticket_reply: '/admin-support',
        id_claiming: '/pwd-card',
        document_upload: '/document-management',
        document_review: '/document-management',
        id_renewal: '/pwd-masterlist',
        default: '/pwd-masterlist'
      },
      // Staff2 paths
      Staff2: {
        announcement: '/announcement',
        benefit_eligibility: '/staff2-ayuda',
        benefit_announcement: '/staff2-ayuda',
        support_ticket_reply: '/admin-support',
        default: '/staff2-ayuda'
      }
    };

    const rolePaths = paths[role] || paths.PWDMember;
    let path = rolePaths[type] || rolePaths.default;

    // Add query parameters for specific navigation
    if (type === 'support_ticket_reply' && data.ticket_id) {
      path += `?ticketId=${data.ticket_id}`;
    } else if ((type === 'application_status_change' || type === 'new_application') && data.application_id) {
      path += `?applicationId=${data.application_id}`;
    } else if ((type === 'announcement' || type === 'benefit_announcement') && data.announcement_id) {
      path += `?announcementId=${data.announcement_id}`;
    } else if ((type === 'benefit_eligibility' || type === 'benefit_created') && data.benefit_id) {
      path += `?benefitId=${data.benefit_id}`;
    } else if (type === 'document_review' && data.document_id) {
      path += `?documentId=${data.document_id}`;
    } else if (type === 'id_renewal' && data.renewal_id) {
      path += `?renewalId=${data.renewal_id}`;
    } else if ((type === 'id_claiming' || type === 'id_ready' || type === 'id_claimed') && data.claim_id) {
      path += `?claimId=${data.claim_id}`;
    }

    return path;
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read first
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }
    
    // For PWD members, open announcements in modal instead of navigating
    if (currentUser?.role === 'PWDMember' && 
        (notification.type === 'announcement' || notification.type === 'benefit_announcement')) {
      // Get announcement ID from notification data
      const announcementId = notification.data?.announcement_id || notification.data?.announcementID;
      
      if (announcementId) {
        // Fetch announcement and open in modal
        try {
          const announcement = await announcementService.getById(announcementId);
          
          // Ensure we have the announcement data
          if (announcement) {
            // Normalize announcement ID field
            const normalizedAnnouncement = {
              ...announcement,
              id: announcement.id || announcement.announcementID || announcementId,
              announcementID: announcement.announcementID || announcement.id || announcementId
            };
            
            // Trigger custom event to open announcement modal
            const event = new CustomEvent('openAnnouncementModal', { 
              detail: { announcement: normalizedAnnouncement } 
            });
            window.dispatchEvent(event);
            
            // Close notification panel
            onClose();
            return;
          }
        } catch (error) {
          console.error('Error fetching announcement:', error);
          // Fall back to navigation if fetch fails
        }
      }
    }
    
    // Get the navigation path
    const path = getNotificationPath(notification);
    
    // Close the panel and navigate
    onClose();
    navigate(path);
  };

  useEffect(() => {
    if (open && currentUser) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Refresh notifications every 30 seconds when panel is open
      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [open, currentUser]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      console.log('Fetching notifications for user:', currentUser?.username, 'Role:', currentUser?.role, 'UserID:', currentUser?.userID);
      const data = await notificationService.getNotifications();
      console.log('Received notifications:', data.length, 'items');
      // Ensure notifications are sorted by created_at descending (latest first)
      // Also sort by id descending as tiebreaker for notifications created at the same time
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.created_at || a.timestamp || 0);
        const dateB = new Date(b.created_at || b.timestamp || 0);
        if (dateB.getTime() !== dateA.getTime()) {
          return dateB - dateA; // Sort by date descending (newest first)
        }
        // If dates are equal, sort by ID descending (newer ID first)
        return (b.id || 0) - (a.id || 0);
      });
      console.log('Sorted notifications:', sorted.length);
      // Ensure the array is in the correct order (newest first)
      setNotifications(sorted);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const success = await notificationService.markAsRead(notificationId);
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
        // Refresh unread count from server to ensure accuracy
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const success = await notificationService.markAllAsRead();
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        );
        // Refresh unread count from server to ensure accuracy
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application_status_change':
      case 'new_application':
        return <ApplicationIcon color="primary" />;
      case 'id_claiming':
      case 'id_ready':
      case 'id_claimed':
      case 'id_claim_initiated':
      case 'card_ready_for_pickup':
      case 'card_claimed':
      case 'card_renewed':
        return <CardMembershipIcon color="success" />;
      case 'support_ticket_reply':
        return <SupportAgentIcon color="info" />;
      case 'document_upload':
      case 'document_review':
        return <DescriptionIcon color="secondary" />;
      case 'renewal_reminder':
      case 'renewal_required':
      case 'id_renewal':
      case 'renewal_submitted':
      case 'renewal_approved':
      case 'renewal_rejected':
        return <RefreshIcon color="warning" />;
      case 'announcement':
      case 'benefit_announcement':
      case 'benefit_created':
        return <CampaignIcon sx={{ color: '#F39C12' }} />;
      case 'benefit_eligibility':
        return <BenefitIcon color="success" />;
      case 'member_welcome':
        return <NotificationsActiveIcon color="success" />;
      case 'assessment_scheduled':
      case 'assessment_rescheduled':
      case 'assessment_finalized':
        return <EventIcon sx={{ color: '#9C27B0' }} />; // Purple icon for assessment events
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100%'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E0E0E0',
            bgcolor: '#FFFFFF'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                color="error"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <Box>
            {unreadNotifications.length > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{ mr: 1, textTransform: 'none' }}
              >
                Mark all read
              </Button>
            )}
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Notifications List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Loading notifications...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: '#BDBDBD', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.is_read ? '#FFFFFF' : '#F0F7FF',
                      borderLeft: notification.is_read ? 'none' : '3px solid #1976D2',
                      '&:hover': {
                        bgcolor: notification.is_read ? '#F5F5F5' : '#E3F2FD'
                      },
                      py: 1.5,
                      px: 2,
                      cursor: 'pointer'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            component="span"
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.is_read ? 500 : 700,
                              color: notification.is_read ? '#424242' : '#1976D2'
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.is_read && (
                            <Box
                              component="span"
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: '#1976D2'
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box component="span">
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              color: '#616161',
                              mb: 0.5,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              display: 'block'
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ color: '#9E9E9E', fontSize: '0.75rem', display: 'block' }}
                          >
                            {notificationService.formatTimestamp(
                              notification.created_at || notification.timestamp
                            )}
                          </Typography>
                        </Box>
                      }
                    />
                    {!notification.is_read && (
                      <Tooltip title="Mark as read">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent navigation when clicking the check icon
                            handleMarkAsRead(notification.id);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItemButton>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}

export default NotificationPanel;

