// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/Landing/LandingPage';
import Login from './components/auth/login';
import Register from './components/auth/Register';
import PasswordReset from './components/auth/PasswordReset';
import AdminDashboard from './components/dashboard/AdminDashboard';
import BarangayPresidentDashboard from './components/dashboard/BarangayPresidentDashboard';
import PWDMemberDashboard from './components/dashboard/PWDMemberDashboard';

// Admin components
import PWDRecords from './components/records/PWDRecords';
import PWDCard from './components/cards/PWDCard';
import Reports from './components/reports/Reports';
import Ayuda from './components/ayuda/Ayuda';
import BenefitTracking from './components/benefit/BenefitTracking';
import Announcement from './components/announcement/Announcement';
import AdminSupportDesk from './components/support/AdminSupportDesk';

// Barangay President components
import BarangayPresidentPWDRecords from './components/records/BarangayPresidentPWDRecords';
import BarangayPresidentPWDCard from './components/cards/BarangayPresidentPWDCard';
import BarangayPresidentReports from './components/reports/BarangayPresidentReports';
import BarangayPresidentAyuda from './components/ayuda/BarangayPresidentAyuda';
import BarangayPresidentAnnouncement from './components/announcement/BarangayPresidentAnnouncement';

// PWD Member components
import PWDMemberAnnouncement from './components/announcement/PWDMemberAnnouncement';
import PWDMemberSupportDesk from './components/support/PWDMemberSupportDesk';
import PWDProfile from './components/profile/PWDProfile';
import MemberDocumentUpload from './components/documents/MemberDocumentUpload';

// Document Management components
import DocumentManagement from './components/documents/DocumentManagement';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2C3E50',
      dark: '#1B2631',
      light: '#34495E',
    },
    secondary: {
      main: '#4CAF50',
      light: '#66BB6A',
      dark: '#388E3C',
    },
    background: {
      default: '#FFFFFF',
      paper: '#2C3E50',
    },
    text: {
      primary: '#000000',
      secondary: '#2C3E50',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#000000 !important',
        },
      },
    },
  },
});

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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
            {currentUser?.role === 'Admin' && <AdminDashboard />}
            {currentUser?.role === 'BarangayPresident' && <BarangayPresidentDashboard />}
            {currentUser?.role === 'PWDMember' && <PWDMemberDashboard />}
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pwd-records" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <PWDRecords />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pwd-card" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <PWDCard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Reports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ayuda" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Ayuda />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/benefit-tracking" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <BenefitTracking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/announcement" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Announcement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-support" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminSupportDesk />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/document-management" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DocumentManagement />
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
      
      <Route path="/unauthorized" element={<div>Unauthorized access</div>} />
      <Route path="/apply" element={<div>Apply for PWD membership — Coming soon</div>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="App">
            <AppContent />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;