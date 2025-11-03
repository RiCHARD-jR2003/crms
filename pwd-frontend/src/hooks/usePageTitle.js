import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  '/': 'Home',
  '/login': 'Login',
  '/register': 'Register',
  '/password-reset': 'Password Reset',
  '/dashboard': 'Dashboard',
  '/admin-dashboard': 'Admin Dashboard',
  '/pwd-records': 'PWD Records',
  '/pwd-masterlist': 'PWD Masterlist',
  '/pwd-card': 'PWD Card',
  '/analytics': 'Analytics',
  '/ayuda': 'Ayuda',
  '/staff2-ayuda': 'Ayuda',
  '/benefit-tracking': 'Benefit Tracking',
  '/staff2-benefit-tracking': 'Benefit Tracking',
  '/announcement': 'Announcements',
  '/admin-support': 'Support Desk',
  '/document-management': 'Document Management',
  '/audit-logs': 'Audit Logs',
  '/security-monitoring': 'Security Monitoring',
  '/frontdesk-pwd-card': 'PWD Card',
  '/frontdesk-support': 'Support Desk',
  '/frontdesk-announcement': 'Announcements',
  '/barangay-president-dashboard': 'Barangay President Dashboard',
  '/barangay-president-pwd-records': 'PWD Records',
  '/barangay-president-pwd-card': 'PWD Card',
  '/barangay-president-reports': 'Reports',
  '/barangay-president-ayuda': 'Ayuda',
  '/barangay-president-announcement': 'Announcements',
  '/pwd-dashboard': 'PWD Member Dashboard',
  '/pwd-announcements': 'Announcements',
  '/pwd-support': 'Support Desk',
  '/pwd-profile': 'Profile',
  '/pwd-documents': 'Documents',
  '/apply': 'Apply',
  '/about': 'About Us',
  '/contact': 'Contact Us',
  '/unauthorized': 'Unauthorized',
};

// Route patterns for dynamic routes
const routePatterns = [
  { pattern: /^\/check-status\//, title: 'Application Status' },
  { pattern: /^\/document-correction\//, title: 'Document Correction' },
];

export const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    let title = 'PWD System';
    
    // Check exact route matches first
    if (routeTitles[location.pathname]) {
      title = routeTitles[location.pathname];
    } else {
      // Check pattern matches for dynamic routes
      for (const routePattern of routePatterns) {
        if (routePattern.pattern.test(location.pathname)) {
          title = routePattern.title;
          break;
        }
      }
    }
    
    // Update document title
    document.title = title;
  }, [location.pathname]);
};

