// src/App.js
import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import ResourcePrefetcher from './components/optimization/ResourcePrefetcher';
import { usePageTitle } from './hooks/usePageTitle';
import { getRoleColors, themeColors } from './utils/themeColors';

// Loading component
const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

// Lazy load all components for code splitting
// Landing pages (loaded immediately for better UX)
const LandingPage = lazy(() => import('./components/Landing/LandingPage'));
const AboutUsPage = lazy(() => import('./components/Landing/AboutUsPage'));
const ContactUsPage = lazy(() => import('./components/Landing/ContactUsPage'));

// Auth components
const Login = lazy(() => import('./components/auth/login'));
const Register = lazy(() => import('./components/auth/Register'));
const PasswordReset = lazy(() => import('./components/auth/PasswordReset'));
const PasswordChangeWrapper = lazy(() => import('./components/auth/PasswordChangeWrapper'));

// Dashboard components
const AdminDashboard = lazy(() => import('./components/dashboard/AdminDashboard'));
const BarangayPresidentDashboard = lazy(() => import('./components/dashboard/BarangayPresidentDashboard'));
const PWDMemberDashboard = lazy(() => import('./components/dashboard/PWDMemberDashboard'));
const Staff1Dashboard = lazy(() => import('./components/dashboard/Staff1Dashboard'));
const Staff2Dashboard = lazy(() => import('./components/dashboard/Staff2Dashboard'));
const FrontDeskDashboard = lazy(() => import('./components/dashboard/FrontDeskDashboard'));

// Admin components
const PWDRecords = lazy(() => import('./components/records/PWDRecords'));
const PWDCard = lazy(() => import('./components/cards/PWDCard'));
const Analytics = lazy(() => import('./components/analytics/Analytics'));
const Ayuda = lazy(() => import('./components/ayuda/Ayuda'));
const BenefitTracking = lazy(() => import('./components/benefit/BenefitTracking'));
const ClaimHistory = lazy(() => import('./components/benefit/ClaimHistory'));
const Announcement = lazy(() => import('./components/announcement/Announcement'));
const AdminSupportDesk = lazy(() => import('./components/support/AdminSupportDesk'));
const RenewalDashboard = lazy(() => import('./components/renewal/RenewalDashboard'));

// Barangay President components
const BarangayPresidentPWDRecords = lazy(() => import('./components/records/BarangayPresidentPWDRecords'));
const BarangayPresidentPWDCard = lazy(() => import('./components/cards/BarangayPresidentPWDCard'));
const BarangayPresidentReports = lazy(() => import('./components/reports/BarangayPresidentReports'));
const BarangayPresidentAyuda = lazy(() => import('./components/ayuda/BarangayPresidentAyuda'));
const BarangayPresidentAnnouncement = lazy(() => import('./components/announcement/BarangayPresidentAnnouncement'));

// PWD Member components
const PWDMemberAnnouncement = lazy(() => import('./components/announcement/PWDMemberAnnouncement'));
const PWDMemberSupportDesk = lazy(() => import('./components/support/PWDMemberSupportDesk'));
const PWDProfile = lazy(() => import('./components/profile/PWDProfile'));
const MemberDocumentUpload = lazy(() => import('./components/documents/MemberDocumentUpload'));
const PWDMemberBenefits = lazy(() => import('./components/benefit/PWDMemberBenefits'));

// Application components
const ApplicationForm = lazy(() => import('./components/application/ApplicationForm'));
const ApplicationStatusCheck = lazy(() => import('./components/application/ApplicationStatusCheck'));
const DocumentCorrectionPage = lazy(() => import('./components/application/DocumentCorrectionPage'));

// Document Management components
const DocumentManagement = lazy(() => import('./components/documents/DocumentManagement'));
const AuditLogs = lazy(() => import('./components/audit/AuditLogs'));
const SecurityMonitoring = lazy(() => import('./components/security/SecurityMonitoring'));

// Create theme function that adapts to user role
const createRoleTheme = (role) => {
  const roleColors = getRoleColors(role);
  const semantic = themeColors.semantic;
  
  return createTheme({
    palette: {
      primary: {
        main: roleColors.primary,
        light: roleColors.primaryLight,
        dark: roleColors.primaryDark,
        contrastText: roleColors.primaryContrast,
      },
      secondary: {
        main: roleColors.accent,
        light: roleColors.primaryLight,
        dark: roleColors.primaryDark,
        contrastText: roleColors.primaryContrast,
      },
      success: {
        main: semantic.success.main,
        light: semantic.success.light,
        dark: semantic.success.dark,
        contrastText: semantic.success.contrastText,
      },
      warning: {
        main: semantic.warning.main,
        light: semantic.warning.light,
        dark: semantic.warning.dark,
        contrastText: semantic.warning.contrastText,
      },
      error: {
        main: semantic.error.main,
        light: semantic.error.light,
        dark: semantic.error.dark,
        contrastText: semantic.error.contrastText,
      },
      info: {
        main: semantic.info.main,
        light: semantic.info.light,
        dark: semantic.info.dark,
        contrastText: semantic.info.contrastText,
      },
      background: {
        default: roleColors.bg,
        paper: roleColors.surface,
      },
      text: {
        primary: roleColors.text,
        secondary: roleColors.textSecondary,
      },
    },
    typography: {
      fontFamily: '"Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.4rem',
        lineHeight: 1.2,
        color: roleColors.text,
      },
      h2: {
        fontWeight: 700,
        fontSize: '1.9rem',
        lineHeight: 1.3,
        color: roleColors.text,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
        color: roleColors.text,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
        color: roleColors.text,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.1rem',
        lineHeight: 1.4,
        color: roleColors.text,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.4,
        color: roleColors.text,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '1rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        color: roleColors.text,
      },
      body2: {
        fontSize: '0.95rem',
        lineHeight: 1.5,
        color: roleColors.textSecondary,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: roleColors.bg,
            color: roleColors.text,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 22px',
            minHeight: '44px', // WCAG touch target
            fontWeight: 600,
            boxShadow: themeColors.shadows.sm,
            '&:hover': {
              boxShadow: themeColors.shadows.md,
            },
            '&:focus-visible': {
              boxShadow: themeColors.interactive.focus.ring,
            },
          },
          contained: {
            boxShadow: themeColors.shadows.md,
            '&:hover': {
              boxShadow: themeColors.shadows.lg,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: themeColors.shadows.md,
            border: themeColors.borders.light,
            backgroundColor: roleColors.surface,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: roleColors.surface,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: roleColors.surface,
            color: roleColors.text,
            boxShadow: themeColors.shadows.sm,
            borderBottom: themeColors.borders.light,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: themeColors.borders.light,
            backgroundColor: roleColors.surface,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            fontSize: '0.875rem',
            height: '32px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: roleColors.primary,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: roleColors.primary,
                borderWidth: '2px',
              },
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            minHeight: '44px', // WCAG touch target
            '&:hover': {
              backgroundColor: themeColors.interactive.hover.light,
            },
            '&.Mui-selected': {
              backgroundColor: `${roleColors.primary}15`,
              color: roleColors.primary,
              '&:hover': {
                backgroundColor: `${roleColors.primary}25`,
              },
            },
            '&:focus-visible': {
              boxShadow: themeColors.interactive.focus.ring,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            minWidth: '44px',
            minHeight: '44px', // WCAG touch target
            '&:focus-visible': {
              boxShadow: themeColors.interactive.focus.ring,
            },
          },
        },
      },
    },
  });
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Debug logging
  console.log('ProtectedRoute - currentUser:', currentUser);
  console.log('ProtectedRoute - allowedRoles:', allowedRoles);
  console.log('ProtectedRoute - current pathname:', location.pathname);
  
  if (!currentUser) {
    console.log('ProtectedRoute - No currentUser, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    console.log('ProtectedRoute - Role not allowed:', currentUser.role, 'not in', allowedRoles);
    console.log('ProtectedRoute - Current pathname:', location.pathname);
    return <Navigate to="/unauthorized" />;
  }
  
  console.log('ProtectedRoute - Access granted for role:', currentUser.role);
  return children;
};

function AppContent() {
  const { currentUser } = useAuth();
  
  // Update page title based on current route
  usePageTitle();
  
  useEffect(() => {
    const role = currentUser?.role?.toLowerCase() ?? 'public';
    document.body.dataset.role = role;
    return () => {
      document.body.dataset.role = 'public';
    };
  }, [currentUser]);

  return (
    <>
      <ResourcePrefetcher />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/check-status/:referenceNumber" element={<LandingPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route 
        path="/audit-logs" 
        element={
          <ProtectedRoute allowedRoles={['SuperAdmin']}>
            <AuditLogs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/security-monitoring" 
        element={
          <ProtectedRoute allowedRoles={['SuperAdmin']}>
            <SecurityMonitoring />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/login" 
        element={currentUser ? <Navigate to="/dashboard" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={currentUser ? <Navigate to="/dashboard" /> : <Register />} 
      />
      <Route 
        path="/password-reset" 
        element={currentUser ? <Navigate to="/dashboard" /> : <PasswordReset />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <PasswordChangeWrapper>
              {(() => {
                console.log('Dashboard route - currentUser:', currentUser);
                console.log('Dashboard route - currentUser.role:', currentUser?.role);
                
                if (currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin') {
                  console.log('Dashboard route - Rendering AdminDashboard');
                  return <AdminDashboard />;
                }
                if (currentUser?.role === 'Staff1') {
                  console.log('Dashboard route - Rendering Staff1Dashboard');
                  return <Staff1Dashboard />;
                }
                if (currentUser?.role === 'Staff2') {
                  console.log('Dashboard route - Rendering Staff2Dashboard');
                  return <Staff2Dashboard />;
                }
                if (currentUser?.role === 'FrontDesk') {
                  console.log('Dashboard route - Rendering FrontDeskDashboard');
                  return <FrontDeskDashboard />;
                }
                if (currentUser?.role === 'BarangayPresident') {
                  console.log('Dashboard route - Rendering BarangayPresidentDashboard');
                  return <BarangayPresidentDashboard />;
                }
                if (currentUser?.role === 'PWDMember') {
                  console.log('Dashboard route - Rendering PWDMemberDashboard');
                  return <PWDMemberDashboard />;
                }
                
                console.log('Dashboard route - No matching role, currentUser:', currentUser);
                return <div>No dashboard available for role: {currentUser?.role}</div>;
              })()}
            </PasswordChangeWrapper>
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pwd-records" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin', 'Staff1']}>
            <PWDRecords />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pwd-card" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
            <PWDCard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      {/* Redirect old /reports route to /analytics */}
      <Route 
        path="/reports" 
        element={<Navigate to="/analytics" replace />}
      />
      <Route 
        path="/ayuda" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
            <Ayuda />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/benefit-tracking" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
            <BenefitTracking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/claim-history" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
            <ClaimHistory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/renewal-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
            <RenewalDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/announcement" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
            <Announcement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-support" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
            <AdminSupportDesk />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/document-management" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
            <DocumentManagement />
          </ProtectedRoute>
        } 
      />
      
      {/* Staff1 Routes - PWD Masterlist and PWD Records */}
      <Route 
        path="/pwd-masterlist" 
        element={
          <ProtectedRoute allowedRoles={['Staff1']}>
            <PWDRecords />
          </ProtectedRoute>
        } 
      />
      
      {/* Staff2 Routes - Ayuda and Benefit Tracking */}
      <Route 
        path="/staff2-ayuda" 
        element={
          <ProtectedRoute allowedRoles={['Staff2']}>
            <Ayuda />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/staff2-benefit-tracking" 
        element={
          <ProtectedRoute allowedRoles={['Staff2']}>
            <BenefitTracking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/staff2-claim-history" 
        element={
          <ProtectedRoute allowedRoles={['Staff2']}>
            <ClaimHistory />
          </ProtectedRoute>
        } 
      />
      
      {/* FrontDesk Routes - PWD Card, Support Desk, Announcements */}
      <Route 
        path="/frontdesk-pwd-card" 
        element={
          <ProtectedRoute allowedRoles={['FrontDesk']}>
            <PWDCard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/frontdesk-support" 
        element={
          <ProtectedRoute allowedRoles={['FrontDesk']}>
            <AdminSupportDesk />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/frontdesk-announcement" 
        element={
          <ProtectedRoute allowedRoles={['FrontDesk']}>
            <Announcement />
          </ProtectedRoute>
        } 
      />
      
      {/* Barangay President Routes */}
      <Route 
        path="/barangay-president-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['BarangayPresident']}>
            <BarangayPresidentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barangay-president-pwd-records" 
        element={
          <ProtectedRoute allowedRoles={['BarangayPresident']}>
            <BarangayPresidentPWDRecords />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barangay-president-pwd-card" 
        element={
          <ProtectedRoute allowedRoles={['BarangayPresident']}>
            <BarangayPresidentPWDCard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barangay-president-reports" 
        element={
          <ProtectedRoute allowedRoles={['BarangayPresident']}>
            <BarangayPresidentReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barangay-president-ayuda" 
        element={
          <ProtectedRoute allowedRoles={['BarangayPresident']}>
            <BarangayPresidentAyuda />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barangay-president-announcement" 
        element={
          <ProtectedRoute allowedRoles={['BarangayPresident']}>
            <BarangayPresidentAnnouncement />
          </ProtectedRoute>
        } 
      />
      
      {/* PWD Member Routes */}
      <Route 
        path="/pwd-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['PWDMember']}>
            <PWDMemberDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pwd-announcements" 
        element={
          <ProtectedRoute allowedRoles={['PWDMember']}>
            <PWDMemberAnnouncement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pwd-support" 
        element={
          <ProtectedRoute allowedRoles={['PWDMember']}>
            <PWDMemberSupportDesk />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pwd-profile" 
        element={
          <ProtectedRoute allowedRoles={['PWDMember']}>
            <PWDProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pwd-documents" 
        element={
          <ProtectedRoute allowedRoles={['PWDMember']}>
            <MemberDocumentUpload />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pwd-benefits" 
        element={
          <ProtectedRoute allowedRoles={['PWDMember']}>
            <PWDMemberBenefits />
          </ProtectedRoute>
        } 
      />
      
      <Route path="/unauthorized" element={<div>Unauthorized access</div>} />
      <Route path="/apply" element={<div>Apply for PWD membership — Coming soon</div>} />
      
      {/* Public Document Correction Route */}
      <Route path="/document-correction/:token" element={<DocumentCorrectionPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

// Theme wrapper component that has access to auth context
function ThemeWrapper({ children }) {
  const { currentUser } = useAuth();
  
  // Create dynamic theme based on user role
  const theme = useMemo(() => {
    const role = currentUser?.role || 'admin';
    return createRoleTheme(role);
  }, [currentUser?.role]);
  
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <TranslationProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <ThemeWrapper>
            <CssBaseline />
            <div className="App">
              <AppContent />
            </div>
          </ThemeWrapper>
        </Router>
      </TranslationProvider>
    </AuthProvider>
  );
}

export default App;