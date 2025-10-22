import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  InputAdornment,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import BarangayPresidentSidebar from '../shared/BarangayPresidentSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { filePreviewService } from '../../services/filePreviewService';
import toastService from '../../services/toastService';
import { documentService } from '../../services/documentService';

// Helper function to convert text to proper case
const toProperCase = (text) => {
  if (!text) return '';
  return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

function BarangayPresidentPWDRecords() {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    barangay: '',
    disability: '',
    status: ''
  });

  // Format date as MM/DD/YYYY
  const formatDateMMDDYYYY = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  };

  // Mock data - in real implementation, this would fetch from API filtered by barangay
  const [rows, setRows] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [printing, setPrinting] = useState(false);
  
  // Document correction modal state
  const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
  const [selectedDocumentsForCorrection, setSelectedDocumentsForCorrection] = useState([]);
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documentMapping, setDocumentMapping] = useState({});
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');
  
  // Toast notifications will be used instead of modals

  // Fetch document types
  const fetchDocumentTypes = async () => {
    try {
      const types = await documentService.getActiveDocumentTypes();
      setDocumentTypes(types);
      
      const mapping = documentService.getDocumentFieldMapping(types);
      setDocumentMapping(mapping);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };

  // Helper functions for file handling
  const getFileUrl = (fieldName) => {
    if (!selectedApplication || !selectedApplication[fieldName]) return null;
    
    const fileName = selectedApplication[fieldName];
    
    // Handle JSON string (for arrays stored as strings)
    if (typeof fileName === 'string') {
      try {
        const parsed = JSON.parse(fileName);
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? `${api.getStorageUrl('')}/${parsed[0]}` : null;
        } else {
          return `${api.getStorageUrl('')}/${fileName}`;
        }
      } catch (e) {
        // Not JSON, treat as regular string
        return `${api.getStorageUrl('')}/${fileName}`;
      }
    } else if (Array.isArray(fileName)) {
      // Handle actual array
      return fileName.length > 0 ? `${api.getStorageUrl('')}/${fileName[0]}` : null;
    }
    return null;
  };

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const lowerFileName = fileName.toLowerCase();
    return imageExtensions.some(ext => lowerFileName.includes(ext));
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return '📄';
    const lowerFileName = fileName.toLowerCase();
    if (lowerFileName.includes('.pdf')) return '📄';
    if (lowerFileName.includes('.doc') || lowerFileName.includes('.docx')) return '📝';
    if (lowerFileName.includes('.txt')) return '📄';
    return '📄';
  };

  const handleViewFile = (fileType) => {
    if (!selectedApplication) {
      console.error('No application selected');
      return;
    }
    
    const fileName = selectedApplication[fileType];
    if (!fileName) {
      console.error('No file found for field:', fileType);
      return;
    }

    let fileUrl = null;
    let displayFileName = '';
    
    if (typeof fileName === 'string') {
      try {
        const parsed = JSON.parse(fileName);
        if (Array.isArray(parsed)) {
          fileUrl = parsed.length > 0 ? `${api.getStorageUrl('')}/${parsed[0]}` : null;
          displayFileName = parsed.length > 0 ? parsed[0] : '';
        } else {
          fileUrl = `${api.getStorageUrl('')}/${fileName}`;
          displayFileName = fileName;
        }
      } catch (e) {
        fileUrl = `${api.getStorageUrl('')}/${fileName}`;
        displayFileName = fileName;
      }
    } else if (Array.isArray(fileName)) {
      fileUrl = fileName.length > 0 ? `${api.getStorageUrl('')}/${fileName[0]}` : null;
      displayFileName = fileName.length > 0 ? fileName[0] : '';
    }

    if (fileUrl && isImageFile(displayFileName)) {
      handlePreviewImage(fileUrl, displayFileName);
    } else {
      filePreviewService.openPreview('application-file', selectedApplication.applicationID, fileType);
    }
  };

  const handlePreviewImage = (imageUrl, fileName) => {
    setPreviewImageUrl(imageUrl);
    setPreviewFileName(fileName);
    setPreviewModalOpen(true);
  };

  const handleClosePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewImageUrl('');
    setPreviewFileName('');
  };

  useEffect(() => {
    fetchData();
    fetchDocumentTypes();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const barangay = currentUser?.barangay || 'Unknown Barangay';
      
      // Fetch applications pending barangay approval for this barangay
      const applicationsUrl = `/applications/barangay/${encodeURIComponent(barangay)}/status/Pending%20Barangay%20Approval`;
      
      try {
        const applicationsData = await api.get(applicationsUrl);
        // Transform applications data to proper case
        const transformedApplications = applicationsData.map(app => ({
          ...app,
          firstName: toProperCase(app.firstName),
          lastName: toProperCase(app.lastName),
          disabilityType: toProperCase(app.disabilityType)
        }));
        setApplications(transformedApplications);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setApplications([]);
      }

      // Fetch approved applications (masterlist) for this barangay
      const masterlistUrl = `/applications/barangay/${encodeURIComponent(barangay)}/status/Approved`;
      
      try {
        const masterlistData = await api.get(masterlistUrl);
        // Transform the data to match the expected format
        const transformedData = masterlistData.map((app, index) => ({
          id: app.applicationID || index + 1,
          pwdID: `PWD-${String(app.applicationID || index + 1).padStart(3, '0')}`,
          firstName: toProperCase(app.firstName),
          lastName: toProperCase(app.lastName),
          barangay: app.barangay,
          disabilityType: toProperCase(app.disabilityType),
          status: 'Active', // All approved applications are considered active
          contactNumber: app.contactNumber,
          email: app.email
        }));
        setRows(transformedData);
      } catch (err) {
        console.error('Failed to fetch masterlist data:', err);
        // Fallback to empty array if API fails
        setRows([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
      // Set empty arrays on error
      setApplications([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId) => {
    try {
      await api.post(`/applications/${applicationId}/approve-barangay`, {
        remarks: 'Approved by Barangay President'
      });

      // Refresh the applications list
      await fetchData();
      toastService.success('Application approved successfully!');
    } catch (err) {
      console.error('Error approving application:', err);
      toastService.error('Failed to approve application: ' + (err.message || 'Unknown error'));
    }
  };

  const handlePrintList = () => {
    setPrinting(true);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get barangay name from current user
    const barangay = currentUser?.barangay || 'Unknown Barangay';
    
    // Get current data based on active tab and apply filters
    const baseData = tab === 0 ? rows : applications;
    const currentTitle = tab === 0 ? 'PWD Masterlist' : 'Pending Applications';
    
    // Apply search filter
    let currentData = baseData;
    if (searchTerm) {
      currentData = baseData.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply status filter if active
    if (filters.status && filters.status !== 'all') {
      currentData = currentData.filter(item => 
        item.status && item.status.toLowerCase().includes(filters.status.toLowerCase())
      );
    }
    
    // Apply disability type filter if active
    if (filters.disability && filters.disability !== 'all') {
      currentData = currentData.filter(item => 
        item.disabilityType && item.disabilityType.toLowerCase().includes(filters.disability.toLowerCase())
      );
    }
    
    // Create HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentTitle} - ${barangay}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3498DB;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #2C3E50;
              margin: 0;
              font-size: 24px;
            }
            .header h2 {
              color: #7F8C8D;
              margin: 5px 0;
              font-size: 18px;
            }
            .info {
              margin-bottom: 20px;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #3498DB;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
            .status-pending {
              background-color: #FFF3CD;
              color: #856404;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
            }
            .status-approved {
              background-color: #D4EDDA;
              color: #155724;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
            }
            .status-rejected {
              background-color: #F8D7DA;
              color: #721C24;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #7F8C8D;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CABUYAO PDAO RMS</h1>
            <h2>${currentTitle} - ${barangay}</h2>
            <div class="info">
              Generated on: ${formatDateMMDDYYYY(new Date().toISOString())}
              ${searchTerm ? `<br>Search Filter: "${searchTerm}"` : ''}
              ${filters.status && filters.status !== 'all' ? `<br>Status Filter: ${filters.status}` : ''}
              ${filters.disability && filters.disability !== 'all' ? `<br>Disability Filter: ${filters.disability}` : ''}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                ${tab === 0 ? `
                  <th>PWD ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Disability Type</th>
                  <th>Status</th>
                  <th>Contact Number</th>
                  <th>Email</th>
                ` : `
                  <th>Application ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Disability Type</th>
                  <th>Status</th>
                  <th>Submission Date</th>
                  <th>Contact Number</th>
                  <th>Email</th>
                `}
              </tr>
            </thead>
            <tbody>
              ${currentData.map(item => `
                <tr>
                  ${tab === 0 ? `
                    <td>${item.pwdID || 'N/A'}</td>
                    <td>${item.firstName || 'N/A'}</td>
                    <td>${item.lastName || 'N/A'}</td>
                    <td>${item.disabilityType || 'N/A'}</td>
                    <td><span class="status-approved">${item.status || 'Active'}</span></td>
                    <td>${item.contactNumber || 'N/A'}</td>
                    <td>${item.email || 'N/A'}</td>
                  ` : `
                    <td>${item.applicationID || 'N/A'}</td>
                    <td>${item.firstName || 'N/A'}</td>
                    <td>${item.lastName || 'N/A'}</td>
                    <td>${item.disabilityType || 'N/A'}</td>
                    <td><span class="status-pending">${item.status || 'Pending'}</span></td>
                    <td>${item.submissionDate ? formatDateMMDDYYYY(item.submissionDate) : 'N/A'}</td>
                    <td>${item.contactNumber || 'N/A'}</td>
                    <td>${item.email || 'N/A'}</td>
                  `}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Total Records: ${currentData.length}</p>
            <p>This document was generated by CABUYAO PDAO RMS</p>
          </div>
        </body>
      </html>
    `;
    
    // Check if there's data to print
    if (currentData.length === 0) {
      setPrinting(false);
      toastService.warning('There are no records to print with the current filters.');
      printWindow.close();
      return;
    }
    
    // Write content to the new window
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
      setPrinting(false);
    };
  };

  const handleRejectApplication = async (applicationId) => {
    const remarks = prompt('Please provide a reason for rejection:');
    if (!remarks) return;

    try {
      await api.post(`/applications/${applicationId}/reject`, {
        remarks: remarks
      });

      // Refresh the applications list
      await fetchData();
      toastService.success('Application rejected successfully!');
    } catch (err) {
      console.error('Error rejecting application:', err);
      toastService.error('Failed to reject application: ' + (err.message || 'Unknown error'));
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setViewDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setViewDetailsOpen(false);
    setSelectedApplication(null);
  };

  // Document correction handlers
  const handleRequestCorrection = () => {
    setCorrectionModalOpen(true);
    setSelectedDocumentsForCorrection([]);
    setCorrectionNotes('');
  };

  const handleCloseCorrectionModal = () => {
    setCorrectionModalOpen(false);
    setSelectedDocumentsForCorrection([]);
    setCorrectionNotes('');
  };

  const handleDocumentSelection = (documentType) => {
    setSelectedDocumentsForCorrection(prev => {
      if (prev.includes(documentType)) {
        return prev.filter(doc => doc !== documentType);
      } else {
        return [...prev, documentType];
      }
    });
  };

  const handleSubmitCorrectionRequest = async () => {
    if (selectedDocumentsForCorrection.length === 0) {
      toastService.error('Please select at least one document that needs correction.');
      return;
    }

    // Show confirmation dialog using toast service
    const documentLabels = documentService.getDocumentLabels(documentMapping);

    const selectedDocumentsList = selectedDocumentsForCorrection.map(doc => `• ${documentLabels[doc]}`).join('\n');
    
    const confirmed = await toastService.confirmAsync(
      'Send Correction Request?',
      `Are you sure you want to send a correction request for ${selectedDocumentsForCorrection.length} document(s)?\n\n` +
      `Selected documents:\n${selectedDocumentsList}\n\n` +
      `This will send an email notification to the applicant with a secure link to re-upload the selected documents.`
    );

    if (!confirmed) {
      return;
    }

    try {
      // Debug: Log the data being sent
      const requestData = {
        applicationId: String(selectedApplication.applicationID),
        documentsToCorrect: selectedDocumentsForCorrection,
        notes: correctionNotes,
        requestedBy: String(currentUser.userID),
        requestedByName: currentUser.username || currentUser.email
      };
      
      console.log('Sending correction request with data:', requestData);
      console.log('Current user:', currentUser);

      // Call API to create correction request
      await api.post('/applications/correction-request', requestData);

      toastService.success('Correction request sent! The applicant has been notified via email to re-upload the selected documents.');
      handleCloseCorrectionModal();
    } catch (error) {
      console.error('Error submitting correction request:', error);
      toastService.error('Failed to send correction request. Please try again.');
    }
  };

    const handlePrintApplication = () => {
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('application-details');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>PWD Application Details</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CABUYAO PDAO RMS</h1>
            <h2>PWD Application Details</h2>
            <p>Application ID: ${selectedApplication?.applicationID}</p>
            <p>Date: {formatDateMMDDYYYY(new Date().toISOString())}</p>
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      barangay: '',
      disability: '',
      status: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Filter the rows based on current filters
  const filteredRows = useMemo(() => {
    const dataToFilter = tab === 0 ? rows : applications;
    
    const hasAnyFilters = Object.values(filters).some(value => value !== '');
    if (!hasAnyFilters && !searchTerm) {
      return dataToFilter;
    }

    return dataToFilter.filter(row => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        (row.firstName && row.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.lastName && row.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.pwdID && row.pwdID.toLowerCase().includes(searchTerm.toLowerCase()));

      // Barangay filter
      let matchesBarangay = true;
      if (filters.barangay) {
        matchesBarangay = row.barangay && row.barangay.toLowerCase().includes(filters.barangay.toLowerCase());
      }

      // Disability filter - handle both masterlist and application data
      let matchesDisability = true;
      if (filters.disability) {
        if (tab === 0) {
          // Masterlist data
          matchesDisability = row.disabilityType && row.disabilityType === filters.disability;
        } else {
          // Application data - handle case sensitivity and partial matches
          const rowDisability = row.disabilityType ? row.disabilityType.toLowerCase() : '';
          const filterDisability = filters.disability.toLowerCase();
          
          if (filterDisability.includes('visual')) {
            matchesDisability = rowDisability.includes('visual');
          } else if (filterDisability.includes('physical')) {
            matchesDisability = rowDisability.includes('physical');
          } else {
            matchesDisability = rowDisability.includes(filterDisability);
          }
        }
      }

      // Status filter
      let matchesStatus = true;
      if (filters.status) {
        matchesStatus = row.status && row.status === filters.status;
      }

      return matchesSearch && matchesBarangay && matchesDisability && matchesStatus;
    });
  }, [tab, rows, applications, filters, searchTerm]);

  const paginatedRows = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredRows.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Approved':
        return '#27AE60';
      case 'Pending':
      case 'Pending Barangay Approval':
      case 'Pending Admin Approval':
        return '#F39C12';
      case 'Inactive':
      case 'Rejected':
        return '#E74C3C';
      default:
        return '#7F8C8D';
    }
  };

  const columns = tab === 0 ? [
    { id: 'pwdID', label: 'PWD ID', minWidth: 100 },
    { id: 'firstName', label: 'First Name', minWidth: 120 },
    { id: 'lastName', label: 'Last Name', minWidth: 120 },
    { id: 'barangay', label: 'Barangay', minWidth: 150 },
    { id: 'disabilityType', label: 'Disability Type', minWidth: 150 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'contactNumber', label: 'Contact Number', minWidth: 130 },
    { id: 'email', label: 'Email', minWidth: 180 }
  ] : [
    { id: 'applicationID', label: 'Application ID', minWidth: 120 },
    { id: 'firstName', label: 'First Name', minWidth: 120 },
    { id: 'lastName', label: 'Last Name', minWidth: 120 },
    { id: 'barangay', label: 'Barangay', minWidth: 150 },
    { id: 'disabilityType', label: 'Disability Type', minWidth: 150 },
    { id: 'status', label: 'Status', minWidth: 150 },
    { id: 'submissionDate', label: 'Submission Date', minWidth: 130 },
    { id: 'contactNumber', label: 'Contact Number', minWidth: 130 },
    { id: 'email', label: 'Email', minWidth: 200 },
    { id: 'actions', label: 'Actions', minWidth: 200 }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <BarangayPresidentSidebar />
      
      {/* Main content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        ml: '280px',
        width: 'calc(100% - 280px)',
        bgcolor: '#F7F9FB'
      }}>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '2rem', color: '#1976D2', mb: 1 }}>
              PWD Records - {currentUser?.barangay || 'Your Barangay'}
            </Typography>
            <Typography sx={{ color: '#7F8C8D', fontSize: '1rem' }}>
              Manage and view PWD records for {currentUser?.barangay || 'your barangay'}
            </Typography>
          </Box>

          {/* Tabs and Controls */}
          <Paper elevation={0} sx={{ 
            p: 2, 
            borderRadius: 2, 
            border: '1px solid #E0E0E0', 
            mb: 3,
            backgroundColor: '#FFFFFF'
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Tabs 
                  value={tab} 
                  onChange={handleTabChange}
                  sx={{ 
                    minHeight: 40,
                    '& .MuiTab-root': {
                      color: '#1976D2',
                      fontWeight: 600,
                      textTransform: 'none',
                      bgcolor: '#F8F9FA',
                      borderRadius: '8px 8px 0 0',
                      mx: 0.5,
                      px: 3,
                      '&.Mui-selected': {
                        color: '#FFFFFF !important',
                        fontWeight: 700,
                        bgcolor: '#3498DB !important'
                      }
                    },
                    '& .MuiTabs-indicator': {
                      display: 'none'
                    }
                  }}
                >
                  <Tab label="Masterlist" />
                  <Tab label="Pending Application" />
                </Tabs>
              </Grid>
              <Grid item>
                <Button 
                  startIcon={printing ? <CircularProgress size={16} color="inherit" /> : <PrintIcon />} 
                  variant="outlined" 
                  onClick={handlePrintList}
                  disabled={printing}
                  sx={{ 
                    textTransform: 'none',
                    color: '#FFFFFF',
                    bgcolor: '#3498DB',
                    borderColor: '#3498DB',
                    '&:hover': {
                      borderColor: '#2980B9',
                      bgcolor: '#2980B9',
                      color: '#FFFFFF'
                    },
                    '&:disabled': {
                      bgcolor: '#BDC3C7',
                      borderColor: '#BDC3C7',
                      color: '#FFFFFF'
                    }
                  }}
                >
                  {printing ? 'Printing...' : 'Print List'}
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  startIcon={<FilterListIcon />} 
                  variant={showFilters ? "contained" : "outlined"}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ 
                    textTransform: 'none',
                    bgcolor: showFilters ? '#27AE60' : '#FFFFFF',
                    color: showFilters ? '#FFFFFF' : '#1976D2',
                    borderColor: '#3498DB',
                    '&:hover': {
                      bgcolor: showFilters ? '#229954' : '#F8FAFC',
                      borderColor: '#3498DB',
                      color: showFilters ? '#FFFFFF' : '#1976D2'
                    }
                  }}
                >
                  Filters
                </Button>
              </Grid>
              <Grid item xs>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
                  <TextField 
                    size="small" 
                    placeholder="Search by name or ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ 
                      width: 300,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#FFFFFF',
                        '& fieldset': { borderColor: '#E0E0E0' },
                        '&:hover fieldset': { borderColor: '#BDC3C7' },
                        '&.Mui-focused fieldset': { borderColor: '#3498DB' },
                      },
                      '& .MuiInputBase-input': {
                        color: '#1976D2',
                        fontSize: '0.9rem',
                        '&::placeholder': {
                          color: '#95A5A6',
                          opacity: 1
                        }
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" sx={{ color: '#7F8C8D' }}>
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              </Grid>
            </Grid>

            {/* Filter Section */}
            <Collapse in={showFilters}>
              <Box sx={{ mt: 2, p: 3, bgcolor: '#F8FAFC', borderRadius: 1, border: '1px solid #E0E0E0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976D2' }}>
                    Search Filters
                  </Typography>
                  {hasActiveFilters && (
                    <Button
                      startIcon={<ClearIcon />}
                      onClick={clearFilters}
                      size="small"
                      sx={{ 
                        textTransform: 'none', 
                        color: '#E74C3C',
                        '&:hover': {
                          bgcolor: '#FDF2F2',
                          color: '#C0392B'
                        }
                      }}
                    >
                      Clear All
                    </Button>
                  )}
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: '#1976D2', fontWeight: 600 }}>Barangay</InputLabel>
                      <Select
                        value={filters.barangay}
                        onChange={(e) => handleFilterChange('barangay', e.target.value)}
                        label="Barangay"
                        sx={{
                          bgcolor: '#FFFFFF',
                          '& .MuiSelect-select': {
                            color: '#1976D2',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            py: 1.5
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E0E0E0'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#BDC3C7'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3498DB'
                          }
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: '#FFFFFF',
                              '& .MuiMenuItem-root': {
                                color: '#1976D2',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                py: 1.5,
                                '&:hover': {
                                  bgcolor: '#F8FAFC'
                                },
                                '&.Mui-selected': {
                                  bgcolor: '#E3F2FD',
                                  color: '#1976D2',
                                  '&:hover': {
                                    bgcolor: '#E3F2FD'
                                  }
                                }
                              }
                            }
                          }
                        }}
                      >
                        <MenuItem value="" sx={{ color: '#95A5A6', fontWeight: 600 }}>All Barangays</MenuItem>
                        <MenuItem value={currentUser?.barangay || 'Barangay Poblacion'} sx={{ color: '#1976D2', fontWeight: 600 }}>
                          {currentUser?.barangay || 'Barangay Poblacion'}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: '#1976D2', fontWeight: 600 }}>Disability Type</InputLabel>
                      <Select
                        value={filters.disability}
                        onChange={(e) => handleFilterChange('disability', e.target.value)}
                        label="Disability Type"
                        sx={{
                          bgcolor: '#FFFFFF',
                          '& .MuiSelect-select': {
                            color: '#1976D2',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            py: 1.5
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E0E0E0'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#BDC3C7'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3498DB'
                          }
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: '#FFFFFF',
                              '& .MuiMenuItem-root': {
                                color: '#1976D2',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                py: 1.5,
                                '&:hover': {
                                  bgcolor: '#F8FAFC'
                                },
                                '&.Mui-selected': {
                                  bgcolor: '#E3F2FD',
                                  color: '#1976D2',
                                  '&:hover': {
                                    bgcolor: '#E3F2FD'
                                  }
                                }
                              }
                            }
                          }
                        }}
                      >
                        <MenuItem value="" sx={{ color: '#95A5A6', fontWeight: 600 }}>All Types</MenuItem>
                        <MenuItem value="Visual Impairment" sx={{ color: '#1976D2', fontWeight: 600 }}>Visual Impairment</MenuItem>
                        <MenuItem value="Physical Disability" sx={{ color: '#1976D2', fontWeight: 600 }}>Physical Disability</MenuItem>
                        <MenuItem value="Hearing Impairment" sx={{ color: '#1976D2', fontWeight: 600 }}>Hearing Impairment</MenuItem>
                        <MenuItem value="Intellectual Disability" sx={{ color: '#1976D2', fontWeight: 600 }}>Intellectual Disability</MenuItem>
                        <MenuItem value="Mental Health" sx={{ color: '#1976D2', fontWeight: 600 }}>Mental Health</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ color: '#1976D2', fontWeight: 600 }}>Status</InputLabel>
                      <Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        label="Status"
                        sx={{
                          bgcolor: '#FFFFFF',
                          '& .MuiSelect-select': {
                            color: '#1976D2',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            py: 1.5
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E0E0E0'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#BDC3C7'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3498DB'
                          }
                        }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: '#FFFFFF',
                              '& .MuiMenuItem-root': {
                                color: '#1976D2',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                py: 1.5,
                                '&:hover': {
                                  bgcolor: '#F8FAFC'
                                },
                                '&.Mui-selected': {
                                  bgcolor: '#E3F2FD',
                                  color: '#1976D2',
                                  '&:hover': {
                                    bgcolor: '#E3F2FD'
                                  }
                                }
                              }
                            }
                          }
                        }}
                      >
                        <MenuItem value="" sx={{ color: '#95A5A6', fontWeight: 600 }}>All Status</MenuItem>
                        {tab === 0 ? (
                          <>
                            <MenuItem value="Active" sx={{ color: '#1976D2', fontWeight: 600 }}>Active</MenuItem>
                            <MenuItem value="Inactive" sx={{ color: '#1976D2', fontWeight: 600 }}>Inactive</MenuItem>
                          </>
                        ) : (
                          <>
                            <MenuItem value="Pending" sx={{ color: '#1976D2', fontWeight: 600 }}>Pending</MenuItem>
                            <MenuItem value="Approved" sx={{ color: '#1976D2', fontWeight: 600 }}>Approved</MenuItem>
                            <MenuItem value="Rejected" sx={{ color: '#1976D2', fontWeight: 600 }}>Rejected</MenuItem>
                          </>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Paper>

          {/* Table */}
          <Paper elevation={0} sx={{ 
            border: '1px solid #E0E0E0', 
            borderRadius: 2,
            backgroundColor: '#FFFFFF'
          }}>
            <TableContainer sx={{ 
              maxHeight: 'calc(100vh - 400px)',
              backgroundColor: '#FFFFFF'
            }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        sx={{
                          backgroundColor: '#FFFFFF',
                          color: '#1976D2',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          borderBottom: '2px solid #E0E0E0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.map((row) => (
                    <TableRow hover key={row.applicationID || row.id}>
                      {columns.map((column) => (
                        <TableCell 
                          key={column.id}
                          sx={{ 
                            color: '#000000',
                            borderBottom: '1px solid #E0E0E0',
                            fontWeight: 500,
                            backgroundColor: '#FFFFFF'
                          }}
                        >
                          {column.id === 'status' ? (
                                                         <Chip
                               label={row[column.id]}
                               size="small"
                               sx={{
                                 backgroundColor: `${getStatusColor(row[column.id])}20`,
                                 color: getStatusColor(row[column.id]),
                                 fontWeight: 700,
                                 fontSize: '0.75rem',
                                 textTransform: 'uppercase',
                                 letterSpacing: '0.5px',
                                 border: `1px solid ${getStatusColor(row[column.id])}`,
                                 '&:hover': {
                                   backgroundColor: `${getStatusColor(row[column.id])}30`
                                 }
                               }}
                             />
                          ) : column.id === 'actions' && tab === 1 ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleViewDetails(row)}
                                sx={{
                                  borderColor: '#3498DB',
                                  color: '#3498DB',
                                  textTransform: 'none',
                                  fontSize: '0.7rem',
                                  py: 0.5,
                                  px: 1,
                                  '&:hover': {
                                    borderColor: '#2980B9',
                                    bgcolor: '#3498DB',
                                    color: '#FFFFFF'
                                  }
                                }}
                              >
                                View Details
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleApproveApplication(row.applicationID)}
                                sx={{
                                  bgcolor: '#27AE60',
                                  textTransform: 'none',
                                  fontSize: '0.7rem',
                                  py: 0.5,
                                  px: 1,
                                  '&:hover': {
                                    bgcolor: '#229954'
                                  }
                                }}
                              >
                                Endorse to PWD Office
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleRejectApplication(row.applicationID)}
                                sx={{
                                  borderColor: '#E74C3C',
                                  color: '#E74C3C',
                                  textTransform: 'none',
                                  fontSize: '0.7rem',
                                  py: 0.5,
                                  px: 1,
                                  '&:hover': {
                                    borderColor: '#C0392B',
                                    bgcolor: '#FDF2F2'
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </Box>
                                                     ) : (
                             <span style={{
                               color: column.id === 'applicationID' ? '#1976D2' : 
                                      column.id === 'firstName' || column.id === 'lastName' ? '#1976D2' :
                                      column.id === 'barangay' ? '#2980B9' :
                                      column.id === 'disabilityType' ? '#8E44AD' :
                                      column.id === 'submissionDate' ? '#E67E22' :
                                      column.id === 'contactNumber' ? '#16A085' :
                                      column.id === 'email' ? '#D35400' : '#1976D2',
                               fontWeight: column.id === 'applicationID' ? 700 : 
                                          column.id === 'firstName' || column.id === 'lastName' ? 600 : 500,
                               fontSize: column.id === 'applicationID' ? '0.85rem' : '0.9rem'
                             }}>
                               {row[column.id]}
                             </span>
                           )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                        color: '#1976D2',
                backgroundColor: '#FFFFFF',
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        color: '#1976D2',
                  fontWeight: 500
                },
                '& .MuiTablePagination-toolbar': {
                  backgroundColor: '#FFFFFF'
                },
                '& .MuiTablePagination-select': {
                  backgroundColor: '#FFFFFF'
                }
              }}
            />
          </Paper>

          {/* Summary */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography sx={{ color: '#7F8C8D', fontSize: '0.9rem', fontWeight: 500 }}>
              Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredRows.length)} of {filteredRows.length} records
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Application Details Modal */}
      <Dialog
        open={viewDetailsOpen}
        onClose={handleCloseDetails}
        maxWidth="xl"
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#FFFFFF', 
          color: '#000000', 
          textAlign: 'center',
          py: 2,
          position: 'relative',
          borderBottom: '1px solid #E0E0E0'
        }}>
          <Typography component="div" variant="h6" sx={{ fontWeight: 'bold' }}>
            PWD Application Details
          </Typography>
          <IconButton
            onClick={handleCloseDetails}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#000000'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {selectedApplication && (
            <Box id="application-details" sx={{ p: 3 }}>
              {/* Header Section */}
              <Paper sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: '#F8F9FA',
                border: '2px solid #E9ECEF',
                borderRadius: 2
              }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold', 
                        color: '#1976D2',
                    mb: 1
                  }}>
                    CABUYAO PDAO RMS
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#7F8C8D',
                    fontWeight: 500
                  }}>
                    Persons with Disabilities Application Form
                  </Typography>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                      Application ID:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1976D2' }}>
                      {selectedApplication.applicationID}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976D2' }}>
                      Submission Date:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1976D2' }}>
                      {formatDateMMDDYYYY(selectedApplication.submissionDate)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Personal Information */}
              <Paper sx={{ p: 3, mb: 3, border: '1px solid #DEE2E6' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                        color: '#1976D2',
                  mb: 2,
                  borderBottom: '2px solid #3498DB',
                  pb: 1
                }}>
                  Personal Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      First Name:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.firstName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Last Name:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Middle Name:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.middleName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Birth Date:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {formatDateMMDDYYYY(selectedApplication.birthDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Gender:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Civil Status:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.civilStatus || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Disability Information */}
              <Paper sx={{ p: 3, mb: 3, border: '1px solid #DEE2E6' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                        color: '#1976D2',
                  mb: 2,
                  borderBottom: '2px solid #E74C3C',
                  pb: 1
                }}>
                  Disability Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Disability Type:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.disabilityType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Disability Cause:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.disabilityCause || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Disability Date:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.disabilityDate ? formatDateMMDDYYYY(selectedApplication.disabilityDate) : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Contact Information */}
              <Paper sx={{ p: 3, mb: 3, border: '1px solid #DEE2E6' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                        color: '#1976D2',
                  mb: 2,
                  borderBottom: '2px solid #27AE60',
                  pb: 1
                }}>
                  Contact Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Email Address:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Contact Number:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.contactNumber || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Emergency Contact:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.emergencyContact || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Emergency Phone:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.emergencyPhone || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Emergency Relationship:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.emergencyRelationship || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Address Information */}
              <Paper sx={{ p: 3, mb: 3, border: '1px solid #DEE2E6' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                        color: '#1976D2',
                  mb: 2,
                  borderBottom: '2px solid #F39C12',
                  pb: 1
                }}>
                  Address Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Complete Address:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.address}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Barangay:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.barangay || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      City:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.city || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Postal Code:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.postalCode || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Uploaded Documents */}
              <Paper sx={{ p: 3, mb: 3, border: '1px solid #DEE2E6', bgcolor: '#FFFFFF' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  color: '#0b87ac', 
                  mb: 2,
                  borderBottom: '2px solid #8E44AD',
                  pb: 1
                }}>
                  Uploaded Documents
                </Typography>
                
                <Grid container spacing={2}>
                  {Object.keys(documentMapping).map((fieldName) => {
                    const docInfo = documentMapping[fieldName];
                    const hasDocument = documentService.hasDocument(selectedApplication, fieldName);
                    
                    return (
                      <Grid item xs={12} sm={4} key={fieldName}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E' }}>
                            {docInfo.name}:
                          </Typography>
                          {docInfo.isRequired && (
                            <Box sx={{ mt: 0.5 }}>
                              <Chip 
                                label="Required" 
                                size="small" 
                                sx={{ 
                                  ml: 1, 
                                  bgcolor: '#E74C3C', 
                                  color: '#FFFFFF',
                                  fontSize: '0.6rem',
                                  height: '16px'
                                }} 
                              />
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, minHeight: '120px' }}>
                          {hasDocument ? (
                            <Box 
                              sx={{ 
                                cursor: 'pointer',
                                border: '2px solid #0b87ac',
                                borderRadius: 1,
                                p: 0.5,
                                bgcolor: '#f8f9fa',
                                '&:hover': {
                                  borderColor: '#8E44AD',
                                  bgcolor: '#f0f0f0'
                                }
                              }}
                              onClick={() => handleViewFile(fieldName)}
                            >
                              {(() => {
                                const fileName = selectedApplication[fieldName];
                                const fileUrl = getFileUrl(fieldName);
                                
                                // Parse fileName if it's a JSON string
                                let parsedFiles = fileName;
                                if (typeof fileName === 'string') {
                                  try {
                                    const parsed = JSON.parse(fileName);
                                    if (Array.isArray(parsed)) {
                                      parsedFiles = parsed;
                                    }
                                  } catch (e) {
                                    // Not JSON, treat as single file
                                    parsedFiles = fileName;
                                  }
                                }
                                
                                if (Array.isArray(parsedFiles)) {
                                  // Handle multiple files (like idPictures)
                                  return (
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      {parsedFiles.slice(0, 2).map((file, index) => {
                                        const singleFileUrl = `${api.getStorageUrl('')}/${file}`;
                                        return (
                                          <Box
                                            key={index}
                                            sx={{ 
                                              width: 56, 
                                              height: 80,
                                              borderRadius: 1,
                                              overflow: 'hidden',
                                              bgcolor: isImageFile(file) ? 'transparent' : '#0b87ac',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '1.2rem',
                                              color: 'white',
                                              border: '1px solid #ddd'
                                            }}
                                          >
                                            {isImageFile(file) ? (
                                              <img 
                                                src={singleFileUrl} 
                                                alt="Preview" 
                                                style={{ 
                                                  width: '100%', 
                                                  height: '100%', 
                                                  objectFit: 'cover' 
                                                }}
                                              />
                                            ) : (
                                              getFileIcon(file)
                                            )}
                                          </Box>
                                        );
                                      })}
                                      {parsedFiles.length > 2 && (
                                        <Box sx={{ 
                                          width: 56, 
                                          height: 80, 
                                          bgcolor: '#95A5A6', 
                                          fontSize: '0.8rem',
                                          borderRadius: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: 'white',
                                          border: '1px solid #ddd'
                                        }}>
                                          +{parsedFiles.length - 2}
                                        </Box>
                                      )}
                                    </Box>
                                  );
                                } else {
                                  // Handle single file
                                  return (
                                    <Box
                                      sx={{ 
                                        width: 70, 
                                        height: 100,
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        bgcolor: isImageFile(fileName) ? 'transparent' : '#0b87ac',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        color: 'white',
                                        border: '1px solid #ddd'
                                      }}
                                    >
                                      {isImageFile(fileName) ? (
                                        <img 
                                          src={fileUrl} 
                                          alt="Preview" 
                                          style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover' 
                                          }}
                                        />
                                      ) : (
                                        getFileIcon(fileName)
                                      )}
                                    </Box>
                                  );
                                }
                              })()}
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#7F8C8D', fontStyle: 'italic' }}>
                              No file uploaded
                            </Typography>
                          )}
                        </Box>
                        {docInfo.description && (
                          <Typography variant="caption" sx={{ color: '#7F8C8D', display: 'block', mt: 0.5 }}>
                            {docInfo.description}
                          </Typography>
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>

              {/* Status Information */}
              <Paper sx={{ p: 3, border: '1px solid #DEE2E6' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                        color: '#1976D2',
                  mb: 2,
                  borderBottom: '2px solid #9B59B6',
                  pb: 1
                }}>
                  Application Status
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Current Status:
                    </Typography>
                    <Chip 
                      label={selectedApplication.status || 'Pending'} 
                      sx={{ 
                        bgcolor: (selectedApplication.status || 'Pending') === 'Approved' ? '#27AE60' : 
                               (selectedApplication.status || 'Pending') === 'Pending' ? '#F39C12' : 
                               (selectedApplication.status || 'Pending') === 'Rejected' ? '#E74C3C' : '#95A5A6',
                        color: '#FFFFFF',
                        fontWeight: 'bold'
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#34495E', mb: 0.5 }}>
                      Remarks:
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', mb: 1 }}>
                      {selectedApplication.remarks || 'No remarks provided'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2, 
          bgcolor: '#F8F9FA',
          borderTop: '1px solid #DEE2E6'
        }}>
          <Button
            onClick={handleCloseDetails}
            variant="outlined"
            sx={{
              borderColor: '#6C757D',
              color: '#6C757D',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleRequestCorrection}
            variant="contained"
            startIcon={<EditIcon />}
            sx={{
              bgcolor: '#F39C12',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#E67E22'
              }
            }}
          >
            Request Document Correction
          </Button>
          <Button
            onClick={handlePrintApplication}
            variant="contained"
            startIcon={<PrintIcon />}
            sx={{
              bgcolor: '#3498DB',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#2980B9'
              }
            }}
          >
            Print Application
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Document Correction Modal */}
      <Dialog
        open={correctionModalOpen}
        onClose={handleCloseCorrectionModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            bgcolor: '#FFFFFF'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#F39C12', 
          color: '#FFFFFF', 
          textAlign: 'center',
          py: 2,
          position: 'relative'
        }}>
          <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
            Request Document Correction
          </Typography>
          <IconButton
            onClick={handleCloseCorrectionModal}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#FFFFFF'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, bgcolor: '#FFFFFF' }}>
          <Typography variant="body1" sx={{ mb: 3, color: '#2C3E50' }}>
            Select the documents that need correction for <strong>{selectedApplication?.firstName} {selectedApplication?.lastName}</strong>:
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.keys(documentMapping).map((fieldName) => {
              const docInfo = documentMapping[fieldName];
              return (
                <Grid item xs={12} sm={6} key={fieldName}>
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #DEE2E6', 
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: selectedDocumentsForCorrection.includes(fieldName) ? '#E8F5E8' : '#FFFFFF',
                    borderColor: selectedDocumentsForCorrection.includes(fieldName) ? '#4CAF50' : '#DEE2E6',
                    '&:hover': {
                      borderColor: '#0b87ac',
                      bgcolor: selectedDocumentsForCorrection.includes(fieldName) ? '#E8F5E8' : '#F8F9FA'
                    }
                  }}
                  onClick={() => handleDocumentSelection(fieldName)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        border: '2px solid #0b87ac', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: selectedDocumentsForCorrection.includes(fieldName) ? '#0b87ac' : 'transparent'
                      }}>
                        {selectedDocumentsForCorrection.includes(fieldName) && (
                          <Typography sx={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 'bold' }}>
                            ✓
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {docInfo.name}
                        </Typography>
                        {docInfo.description && (
                          <Typography variant="caption" sx={{ color: '#7F8C8D', display: 'block' }}>
                            {docInfo.description}
                          </Typography>
                        )}
                        {docInfo.isRequired && (
                          <Box sx={{ mt: 0.5 }}>
                            <Chip 
                              label="Required" 
                              size="small" 
                              sx={{ 
                                bgcolor: '#E74C3C', 
                                color: '#FFFFFF',
                                fontSize: '0.7rem',
                                height: '18px'
                              }} 
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Additional Notes (Optional)"
            value={correctionNotes}
            onChange={(e) => setCorrectionNotes(e.target.value)}
            placeholder="Provide specific instructions about what needs to be corrected..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          bgcolor: '#F8F9FA',
          borderTop: '1px solid #DEE2E6'
        }}>
          <Button
            onClick={handleCloseCorrectionModal}
            variant="outlined"
            sx={{
              borderColor: '#6C757D',
              color: '#6C757D',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCorrectionRequest}
            variant="contained"
            sx={{
              bgcolor: '#F39C12',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#E67E22'
              }
            }}
          >
            Send Correction Request
          </Button>
        </DialogActions>
         </Dialog>

         {/* Image Preview Modal - A4 Paper Shape */}
         <Dialog
           open={previewModalOpen}
           onClose={handleClosePreviewModal}
           maxWidth="sm"
           fullWidth
           PaperProps={{
             sx: {
               borderRadius: 2,
               boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
               bgcolor: '#FFFFFF',
               // A4 paper aspect ratio: 1:1.414
               aspectRatio: '1/1.414',
               maxHeight: '90vh',
               display: 'flex',
               flexDirection: 'column'
             }
           }}
         >
           <DialogTitle sx={{ 
             bgcolor: '#0b87ac', 
             color: '#FFFFFF', 
             textAlign: 'center',
             py: 1.5,
             position: 'relative',
             flexShrink: 0
           }}>
             <Typography variant="h2" component="div" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
               Document Preview
             </Typography>
             <IconButton
               onClick={handleClosePreviewModal}
               sx={{
                 position: 'absolute',
                 right: 16,
                 top: '50%',
                 transform: 'translateY(-50%)',
                 color: '#FFFFFF'
               }}
             >
               <CloseIcon />
             </IconButton>
           </DialogTitle>
           
           <DialogContent sx={{ 
             p: 0, 
             bgcolor: '#FFFFFF',
             flex: 1,
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             overflow: 'hidden'
           }}>
             {previewImageUrl && (
               <Box
                 sx={{
                   width: '100%',
                   height: '100%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   bgcolor: '#f5f5f5',
                   position: 'relative'
                 }}
               >
                 <img
                   src={previewImageUrl}
                   alt={previewFileName}
                   style={{
                     maxWidth: '100%',
                     maxHeight: '100%',
                     objectFit: 'contain',
                     borderRadius: '4px',
                     boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                   }}
                   onError={(e) => {
                     console.error('Error loading image:', previewImageUrl);
                     e.target.style.display = 'none';
                   }}
                 />
               </Box>
             )}
           </DialogContent>
           
           <DialogActions sx={{ 
             bgcolor: '#f8f9fa', 
             px: 3, 
             py: 2,
             flexShrink: 0,
             justifyContent: 'center'
           }}>
             <Typography variant="body2" sx={{ color: '#6c757d', fontStyle: 'italic' }}>
               {previewFileName}
             </Typography>
           </DialogActions>
         </Dialog>
      </Box>
    );
  }

  export default BarangayPresidentPWDRecords;
