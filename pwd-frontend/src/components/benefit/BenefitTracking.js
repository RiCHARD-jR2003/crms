import React, { useState, useEffect } from 'react';
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  Container
} from '@mui/material';
import toastService from '../../services/toastService';
import {
  Print as PrintIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Cake as CakeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Menu as MenuIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import pwdMemberService from '../../services/pwdMemberService';
import benefitService from '../../services/benefitService';
import AdminSidebar from '../shared/AdminSidebar';
import Staff2Sidebar from '../shared/Staff2Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import PWDIDCard from '../cards/PWDIDCard';
import FloatingQRScannerButton from '../qr/FloatingQRScannerButton';

const BenefitTracking = () => {
  const { currentUser } = useAuth();
  const [pwdMembers, setPwdMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [birthdayBenefits, setBirthdayBenefits] = useState([]);
  const [financialBenefits, setFinancialBenefits] = useState([]);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [eligibleBeneficiaries, setEligibleBeneficiaries] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [pwdIdCardOpen, setPwdIdCardOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    ageRange: '',
    birthYear: '',
    birthMonth: '',
    disability: ''
  });

  // Fetch PWD members from API
  const fetchPwdMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pwdMemberService.getAll();
      const candidates = [
        response?.data?.members,
        response?.members,
        response?.data,
        response
      ];
      const members = candidates.find((v) => Array.isArray(v)) || [];
      setPwdMembers(members);
      setFilteredMembers(members);
    } catch (err) {
      console.error('Error fetching PWD members:', err);
      setError('Failed to fetch PWD members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load birthday cash gift and financial assistance benefits from database
  const loadBirthdayBenefits = async () => {
    try {
      setLoading(true);
      const benefits = await benefitService.getAll();
      
      if (Array.isArray(benefits)) {
        // Handle migration from old "Financial" type to "Financial Assistance"
        const migratedBenefits = benefits.map(benefit => {
          if (benefit.type === 'Financial') {
            return { ...benefit, type: 'Financial Assistance' };
          }
          return benefit;
        });
        
        const birthdayBenefits = migratedBenefits.filter(benefit => 
          benefit.type === 'Birthday Cash Gift' && benefit.status === 'Active'
        );
        const financialBenefits = migratedBenefits.filter(benefit => 
          benefit.type === 'Financial Assistance' && benefit.status === 'Active'
        );
        setBirthdayBenefits(birthdayBenefits);
        setFinancialBenefits(financialBenefits);
        
        // Also save to localStorage for backward compatibility
        localStorage.setItem('benefits', JSON.stringify(migratedBenefits));
      } else {
        setBirthdayBenefits([]);
        setFinancialBenefits([]);
      }
    } catch (error) {
      console.error('Error loading benefits from database:', error);
      // Fallback to localStorage if database fails
      try {
        const savedBenefits = localStorage.getItem('benefits');
        if (savedBenefits && savedBenefits !== 'null' && savedBenefits !== 'undefined') {
          const benefits = JSON.parse(savedBenefits);
          if (Array.isArray(benefits)) {
            const birthdayBenefits = benefits.filter(benefit => 
              benefit.type === 'Birthday Cash Gift' && benefit.status === 'Active'
            );
            const financialBenefits = benefits.filter(benefit => 
              benefit.type === 'Financial Assistance' && benefit.status === 'Active'
            );
            setBirthdayBenefits(birthdayBenefits);
            setFinancialBenefits(financialBenefits);
          }
        }
      } catch (localError) {
        console.error('Error loading benefits from localStorage:', localError);
        setBirthdayBenefits([]);
        setFinancialBenefits([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch benefit claims from database
  const fetchBenefitClaims = async (benefitId) => {
    try {
      const response = await fetch(`http://192.168.18.25:8000/api/benefit-claims/${benefitId}`);
      if (response.ok) {
        const claims = await response.json();
        return claims;
      }
      return [];
    } catch (error) {
      console.error('Error fetching benefit claims:', error);
      return [];
    }
  };

  // Get eligible beneficiaries for a specific benefit
  const getEligibleBeneficiaries = async (benefit) => {
    if (!benefit) return [];
    
    console.log('Getting eligible beneficiaries for benefit:', benefit);
    console.log('Available PWD members:', pwdMembers.length);
    
    let eligibleMembers = [];
    
    // For Birthday Cash Gift benefits, filter by birthday month/quarter
    if (benefit.type === 'Birthday Cash Gift' && benefit.birthdayMonth) {
      const quarterMonths = {
        'Q1': [1, 2, 3], // January, February, March
        'Q2': [4, 5, 6], // April, May, June
        'Q3': [7, 8, 9], // July, August, September
        'Q4': [10, 11, 12] // October, November, December
      };
      
      // If a specific month string is provided (e.g., 'October'), use it; otherwise use quarter
      let eligibleMonths = [];
      if (typeof benefit.birthdayMonth === 'string' && benefit.birthdayMonth.startsWith('Q')) {
        eligibleMonths = quarterMonths[benefit.birthdayMonth] || [];
      } else if (typeof benefit.birthdayMonth === 'string') {
        const monthIndex = [
          'January','February','March','April','May','June','July','August','September','October','November','December'
        ].findIndex(m => m.toLowerCase() === benefit.birthdayMonth.toLowerCase());
        eligibleMonths = monthIndex >= 0 ? [monthIndex + 1] : [];
      } else if (Array.isArray(benefit.months)) {
        eligibleMonths = benefit.months.map(m => parseInt(m, 10)).filter(Boolean);
      }
      console.log('Birthday Cash Gift - eligible months:', eligibleMonths);
      
      eligibleMembers = pwdMembers.filter(member => {
        if (!member.birthDate) {
          console.log('Member missing birthDate:', member);
          return false;
        }
        const birthMonth = new Date(member.birthDate).getMonth() + 1;
        const isEligible = eligibleMonths.includes(birthMonth);
        console.log(`Member ${member.firstName} ${member.lastName}: birthMonth=${birthMonth}, eligible=${isEligible}`);
        return isEligible;
      });
    }
    // For Financial Assistance benefits, filter by selected barangays
    else if (benefit.type === 'Financial Assistance') {
      const selected = benefit.selectedBarangays || benefit.barangays || [];
      console.log('Financial Assistance - selected barangays:', selected);
      
      if (selected.length > 0) {
        eligibleMembers = pwdMembers.filter(member => {
          const memberBarangay = (member.barangay || member.Barangay || '').toString().trim().toLowerCase();
          const isEligible = selected.some(b => {
            const selectedBarangay = (b || '').toString().trim().toLowerCase();
            return selectedBarangay === memberBarangay;
          });
          console.log(`Member ${member.firstName} ${member.lastName}: barangay="${memberBarangay}", eligible=${isEligible}`);
          return isEligible;
        });
      } else {
        // If no specific barangays selected, return all members
        console.log('No specific barangays selected, returning all members');
        eligibleMembers = pwdMembers;
      }
    }
    // For other benefit types, return all members
    else {
      console.log('Other benefit type, returning all members');
      eligibleMembers = pwdMembers;
    }
    
    // Fetch real claim data from database
    const claims = await fetchBenefitClaims(benefit.id || benefit.benefitID);
    
    // Map members with their actual claim status
    return eligibleMembers.map(member => {
      const memberClaim = claims.find(claim => (claim.pwdID || claim.userID) === (member.userID || member.id));
      return {
        ...member,
        claimStatus: memberClaim ? 'claimed' : 'unclaimed',
        claimDate: memberClaim ? memberClaim.claimDate : null
      };
    });
  };

  // Handle benefit selection
  const handleBenefitSelect = async (benefit) => {
    console.log('Selected benefit:', benefit);
    console.log('PWD Members count:', pwdMembers.length);
    console.log('PWD Members sample:', pwdMembers.slice(0, 3));
    setSelectedBenefit(benefit);
    const beneficiaries = await getEligibleBeneficiaries(benefit);
    console.log('Eligible beneficiaries:', beneficiaries);
    setEligibleBeneficiaries(beneficiaries);
  };

  // Get month name from month number
  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || 'Unknown';
  };

  // Get quarter name from quarter code
  const getQuarterName = (quarter) => {
    const quarterNames = {
      'Q1': 'Q1 - January, February, March',
      'Q2': 'Q2 - April, May, June',
      'Q3': 'Q3 - July, August, September',
      'Q4': 'Q4 - October, November, December'
    };
    return quarterNames[quarter] || quarter;
  };


  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle QR scan success
  const handleQRScanSuccess = (qrData) => {
    console.log('QR Code scanned successfully:', qrData);
    
    // Find the member by the scanned data
    const scannedMember = pwdMembers.find(member => 
      member.userID === qrData.memberId || 
      member.pwd_id === qrData.pwdId ||
      member.id === qrData.memberId
    );

    if (scannedMember) {
      // Set the scanned member as selected and open benefit claiming
      setSelectedMember(scannedMember);
      setActiveTab(1); // Switch to benefit claiming tab
      
      // Show success message
      setSuccess(`✅ Successfully scanned QR code for ${scannedMember.firstName} ${scannedMember.lastName}`);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError('❌ Member not found. Please ensure the QR code is valid.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle QR scan error
  const handleQRScanError = (error) => {
    console.error('QR scan error:', error);
    setError('❌ Failed to scan QR code. Please try again.');
    setTimeout(() => setError(null), 3000);
  };




  // Handle PWD ID Card
  const handleShowPWDIDCard = (member) => {
    setSelectedMember(member);
    setPwdIdCardOpen(true);
  };

  const handleClosePWDIDCard = () => {
    setPwdIdCardOpen(false);
    setSelectedMember(null);
  };


  useEffect(() => {
    const initializeData = async () => {
      await fetchPwdMembers();
      await loadBirthdayBenefits();
    };
    initializeData();
  }, []);

  // Reload birthday benefits when PWD members change
  useEffect(() => {
    if (pwdMembers.length > 0) {
      loadBirthdayBenefits();
    }
  }, [pwdMembers]);

  // Apply filters
  useEffect(() => {
    let filtered = [...pwdMembers];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(member => 
        member.firstName?.toLowerCase().includes(searchTerm) ||
        member.lastName?.toLowerCase().includes(searchTerm) ||
        member.middleName?.toLowerCase().includes(searchTerm) ||
        member.userID?.toString().includes(searchTerm)
      );
    }

    // Age range filter
    if (filters.ageRange) {
      const currentYear = new Date().getFullYear();
      const [minAge, maxAge] = filters.ageRange.split('-').map(Number);
      filtered = filtered.filter(member => {
        if (!member.birthDate) return false;
        const birthYear = new Date(member.birthDate).getFullYear();
        const age = currentYear - birthYear;
        return age >= minAge && age <= maxAge;
      });
    }

    // Birth year filter
    if (filters.birthYear) {
      filtered = filtered.filter(member => {
        if (!member.birthDate) return false;
        const birthYear = new Date(member.birthDate).getFullYear();
        return birthYear.toString() === filters.birthYear;
      });
    }

    // Birth month filter
    if (filters.birthMonth) {
      filtered = filtered.filter(member => {
        if (!member.birthDate) return false;
        const birthMonth = new Date(member.birthDate).getMonth() + 1;
        return birthMonth.toString() === filters.birthMonth;
      });
    }

    // Disability filter
    if (filters.disability) {
      filtered = filtered.filter(member => 
        member.disabilityType?.toLowerCase().includes(filters.disability.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  }, [pwdMembers, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      ageRange: '',
      birthYear: '',
      birthMonth: '',
      disability: ''
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('benefit-tracking-table');
    const generatedOn = formatDateMMDDYYYY(new Date().toISOString());
    const safeInnerHtml = printContent && printContent.innerHTML ? printContent.innerHTML : '<p>No table content available.</p>';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>PWD Members Master List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
            .filters { margin-bottom: 20px; font-size: 12px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CABUYAO PDAO RMS</h1>
            <h2>PWD Members Master List</h2>
            <p>Generated on: ${generatedOn}</p>
          </div>
          <div class="filters">
            <strong>Applied Filters:</strong>
            ${filters.search ? `Search: ${filters.search} | ` : ''}
            ${filters.ageRange ? `Age Range: ${filters.ageRange} | ` : ''}
            ${filters.birthYear ? `Birth Year: ${filters.birthYear} | ` : ''}
            ${filters.birthMonth ? `Birth Month: ${filters.birthMonth} | ` : ''}
            ${filters.disability ? `Disability: ${filters.disability} | ` : ''}
            Total Records: ${filteredMembers.length}
          </div>
          ${safeInnerHtml}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const generatePDF = async () => {
    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Add header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('CABUYAO PDAO RMS', 20, 20);
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('PWD Members Master List', 20, 30);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${formatDateMMDDYYYY(new Date().toISOString())}`, 20, 40);
      
      // Add filters info
      let filtersText = 'Applied Filters: ';
      if (filters.search) filtersText += `Search: ${filters.search} | `;
      if (filters.ageRange) filtersText += `Age Range: ${filters.ageRange} | `;
      if (filters.birthYear) filtersText += `Birth Year: ${filters.birthYear} | `;
      if (filters.birthMonth) filtersText += `Birth Month: ${filters.birthMonth} | `;
      if (filters.disability) filtersText += `Disability: ${filters.disability} | `;
      filtersText += `Total Records: ${filteredMembers.length}`;
      
      doc.setFontSize(8);
      doc.text(filtersText, 20, 50);
      
      // Prepare table data
      const tableData = filteredMembers.map(member => [
        member.pwd_id || (member.userID ? `PWD-${member.userID}` : 'Not assigned'),
        `${member.firstName || ''} ${member.middleName || ''} ${member.lastName || ''}`.trim() || 'Name not provided',
        getAge(member.birthDate),
        member.birthDate ? formatDateMMDDYYYY(member.birthDate) : 'Not provided',
        member.disabilityType || 'Not specified',
        'Active',
        getRegistrationDate(member) || 'Not available'
      ]);
      
      // Add table
      autoTable(doc, {
        startY: 60,
        head: [['PWD ID', 'Full Name', 'Age', 'Birth Date', 'Disability Type', 'Status', 'Registration Date']],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [44, 62, 80],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 60, left: 20, right: 20 },
        tableWidth: 'auto',
        showHead: 'everyPage',
        didDrawPage: (data) => {
          // Add page numbers
          const pageCount = doc.getNumberOfPages();
          const currentPage = data.pageNumber;
          doc.setFontSize(8);
          doc.text(`Page ${currentPage} of ${pageCount}`, 20, doc.internal.pageSize.height - 10);
        }
      });
      
      // Generate PDF blob and show in new tab for preview
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Open PDF in new tab for preview
      const newWindow = window.open(pdfUrl, '_blank');
      if (newWindow) {
        newWindow.focus();
        
        // Show confirmation dialog with download option
        const userChoice = await toastService.confirmAsync(
          'PDF Generated Successfully',
          `PDF generated successfully with ${filteredMembers.length} PWD members!\n\nThe PDF is now open in a new tab for preview.\n\nClick OK to download the PDF, or Cancel to keep it open for preview only.`
        );
        
        if (userChoice) {
          // User wants to download
          const fileName = `PWD_Members_Master_List_${new Date().toISOString().split('T')[0]}.pdf`;
          const downloadLink = document.createElement('a');
          downloadLink.href = pdfUrl;
          downloadLink.download = fileName;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        
        // Clean up the object URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 10000); // Clean up after 10 seconds
      } else {
        // Fallback if popup is blocked
        toastService.warning('Popup blocked! Please allow popups for this site and try again, or the PDF will be downloaded automatically.');
        const fileName = `PWD_Members_Master_List_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toastService.error('Error generating PDF. Please make sure jsPDF is installed.');
    }
  };

  const getAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getBirthMonth = (birthDate) => {
    if (!birthDate) return 'N/A';
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[new Date(birthDate).getMonth()];
  };

  const getBirthYear = (birthDate) => {
    if (!birthDate) return 'N/A';
    return new Date(birthDate).getFullYear();
  };

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

  // Determine member registration date from available fields
  const getRegistrationDate = (member) => {
    const candidates = [
      member?.registrationDate,
      member?.registration_date,
      member?.dateRegistered,
      member?.created_at,
      member?.createdAt,
      member?.approved_at,
      member?.approvalDate,
    ];
    const value = candidates.find(Boolean);
    if (!value) return null;
    return formatDateMMDDYYYY(value);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        p: 4, 
        minHeight: '100vh',
        bgcolor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Box sx={{ 
          textAlign: 'center',
          p: 4,
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <CircularProgress size={60} sx={{ color: '#2C3E50', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading PWD members...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 4, 
        minHeight: '100vh',
        bgcolor: 'white'
      }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchPwdMembers}
              sx={{ fontWeight: 'bold' }}
            >
              Retry
            </Button>
          }
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            '& .MuiAlert-message': {
              fontSize: '1.1rem'
            }
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'white' }}>
      {/* Role-based Sidebar with Toggle */}
      {currentUser?.role === 'Staff2' ? (
        <Staff2Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      ) : (
        <AdminSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      )}
      
      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1,
        p: { xs: 1, sm: 2, md: 3 },
        ml: { xs: 0, md: '280px' }, // Hide sidebar margin on mobile
        width: { xs: '100%', md: 'calc(100% - 280px)' },
        minHeight: '100vh',
        bgcolor: 'white',
        transition: 'margin-left 0.3s ease-in-out'
      }}>
        <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 1 } }}>
          {/* Mobile Menu Button */}
          <Box sx={{ 
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            mb: 2,
            p: 1
          }}>
            <Button
              variant="outlined"
              startIcon={<MenuIcon />}
              onClick={handleSidebarToggle}
              sx={{
                color: '#566573',
                borderColor: '#D5DBDB',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#253D90',
                  background: '#F4F7FC',
                  color: '#253D90'
                }
              }}
            >
              Menu
            </Button>
          </Box>
          {/* Header */}
          <Box sx={{ 
            mb: { xs: 2, md: 4 },
            textAlign: 'center',
            p: { xs: 2, md: 3 },
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e0e0e0'
          }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                color: '#2C3E50',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              Benefit Tracking
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 400,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Master list of PWD members with filtering and printing capabilities
            </Typography>
          </Box>

          {/* Tabs */}
          <Paper sx={{ 
            mb: { xs: 2, md: 3 }, 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e0e0e0',
            bgcolor: 'white'
          }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                bgcolor: 'white',
                '& .MuiTab-root': {
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  minWidth: { xs: 'auto', sm: 'auto' },
                  color: '#2C3E50'
                },
                '& .Mui-selected': {
                  color: '#2C3E50',
                  bgcolor: '#f5f5f5'
                },
                '& .MuiTabs-indicator': {
                  bgcolor: '#2C3E50'
                }
              }}
            >
              <Tab 
                label="PWD Members Master List" 
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  px: { xs: 1, sm: 2 },
                  color: '#2C3E50'
                }}
              />
              <Tab 
                label={`Birthday Cash Gifts (${birthdayBenefits.length})`} 
                icon={<CakeIcon />}
                iconPosition="start"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  px: { xs: 1, sm: 2 },
                  color: '#2C3E50'
                }}
              />
              <Tab 
                label={`Financial Assistance (${financialBenefits.length})`} 
                icon={<CakeIcon />}
                iconPosition="start"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  px: { xs: 1, sm: 2 },
                  color: '#2C3E50'
                }}
              />
            </Tabs>
          </Paper>

        {/* Tab Content */}
        {activeTab === 0 ? (
          <>
            {/* Summary Cards */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#2C3E50',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Total PWD Members
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                      }}
                    >
                      {pwdMembers.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: '#2C3E50',
                  boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Filtered Results
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                      }}
                    >
                      {filteredMembers.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: '#2C3E50',
                  boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Approved Members
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                      }}
                    >
                      {pwdMembers.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: '#2C3E50',
                  boxShadow: '0 8px 32px rgba(250, 112, 154, 0.3)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Pending Approval
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                      }}
                    >
                      0
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Filters */}
            <Paper sx={{ 
              p: { xs: 2, md: 3 }, 
              mb: { xs: 2, md: 3 }, 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0',
              bgcolor: 'white'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 3 } }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  bgcolor: 'white', 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FilterIcon sx={{ color: '#2C3E50' }} />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#2C3E50',
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }}
                >
                  Filters
                </Typography>
              </Box>
              
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Search"
                    placeholder="Search by name or PWD ID"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#2C3E50' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        color: '#2C3E50',
                        '&:hover fieldset': {
                          borderColor: '#2C3E50',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#2C3E50',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#2C3E50',
                      },
                      '& .MuiOutlinedInput-input::placeholder': {
                        color: '#666',
                        opacity: 0.7,
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={6} sm={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#2C3E50' }}>Age Range</InputLabel>
                    <Select
                      value={filters.ageRange}
                      label="Age Range"
                      onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                      sx={{
                        borderRadius: 2,
                        color: '#2C3E50',
                        bgcolor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2C3E50',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2C3E50',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2C3E50',
                        },
                        '& .MuiSelect-icon': {
                          color: '#2C3E50',
                        },
                        '& .MuiPaper-root': {
                          bgcolor: 'white',
                        },
                        '& .MuiMenuItem-root': {
                          color: '#2C3E50',
                          bgcolor: 'white',
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                          },
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: 'white',
                            '& .MuiMenuItem-root': {
                              color: '#2C3E50',
                              '&:hover': {
                                bgcolor: '#f5f5f5',
                              },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="">All Ages</MenuItem>
                      <MenuItem value="0-17">0-17 years</MenuItem>
                      <MenuItem value="18-30">18-30 years</MenuItem>
                      <MenuItem value="31-50">31-50 years</MenuItem>
                      <MenuItem value="51-65">51-65 years</MenuItem>
                      <MenuItem value="66-100">66+ years</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6} sm={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#2C3E50' }}>Birth Year</InputLabel>
                    <Select
                      value={filters.birthYear}
                      label="Birth Year"
                      onChange={(e) => handleFilterChange('birthYear', e.target.value)}
                      sx={{
                        borderRadius: 2,
                        color: '#2C3E50',
                        bgcolor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2C3E50',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2C3E50',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2C3E50',
                        },
                        '& .MuiSelect-icon': {
                          color: '#2C3E50',
                        },
                        '& .MuiPaper-root': {
                          bgcolor: 'white',
                        },
                        '& .MuiMenuItem-root': {
                          color: '#2C3E50',
                          bgcolor: 'white',
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                          },
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: 'white',
                            '& .MuiMenuItem-root': {
                              color: '#2C3E50',
                              '&:hover': {
                                bgcolor: '#f5f5f5',
                              },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="">All Years</MenuItem>
                      {Array.from({ length: 50 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <MenuItem key={year} value={year.toString()}>
                            {year}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6} sm={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#2C3E50' }}>Birth Month</InputLabel>
                    <Select
                      value={filters.birthMonth}
                      label="Birth Month"
                      onChange={(e) => handleFilterChange('birthMonth', e.target.value)}
                      sx={{
                        borderRadius: 2,
                        color: '#2C3E50',
                        bgcolor: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2C3E50',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2C3E50',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#2C3E50',
                        },
                        '& .MuiSelect-icon': {
                          color: '#2C3E50',
                        },
                        '& .MuiPaper-root': {
                          bgcolor: 'white',
                        },
                        '& .MuiMenuItem-root': {
                          color: '#2C3E50',
                          bgcolor: 'white',
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                          },
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: 'white',
                            '& .MuiMenuItem-root': {
                              color: '#2C3E50',
                              '&:hover': {
                                bgcolor: '#f5f5f5',
                              },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="">All Months</MenuItem>
                      {[
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ].map((month, index) => (
                        <MenuItem key={month} value={(index + 1).toString()}>
                          {month}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6} sm={6} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Disability Type</InputLabel>
                    <Select
                      value={filters.disability}
                      label="Disability Type"
                      onChange={(e) => handleFilterChange('disability', e.target.value)}
                      sx={{ borderRadius: 2 }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: 'white',
                            '& .MuiMenuItem-root': {
                              color: '#2C3E50',
                              '&:hover': { bgcolor: '#f5f5f5' },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {[
                        'Visual Impairment',
                        'Hearing Impairment',
                        'Physical Disability',
                        'Speech and Language Impairment',
                        'Intellectual Disability',
                        'Mental Health Condition',
                        'Learning Disability',
                        'Psychosocial Disability',
                        'Autism Spectrum Disorder',
                        'ADHD',
                        'Orthopedic/Physical Disability',
                        'Chronic Illness',
                        'Multiple Disabilities'
                      ].map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6} sm={6} md={1}>
                  <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={clearFilters}
                      size="small"
                      sx={{ 
                        minWidth: 'auto',
                        borderRadius: 2,
                        borderColor: '#2C3E50',
                        color: '#2C3E50',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        '&:hover': {
                          borderColor: '#f0f0f0',
                          backgroundColor: '#f5f5f5',
                          color: '#2C3E50'
                        }
                      }}
                    >
                      Clear
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Actions */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'stretch', sm: 'center' }, 
              mb: { xs: 2, md: 3 },
              p: { xs: 1, md: 2 },
              bgcolor: 'white',
              borderRadius: 2,
              border: '1px solid #e9ecef',
              gap: { xs: 2, sm: 0 }
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#2C3E50',
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                PWD Members Master List ({filteredMembers.length} records)
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 2 },
                justifyContent: { xs: 'center', sm: 'flex-end' }
              }}>
                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={fetchPwdMembers} 
                    sx={{ 
                      bgcolor: 'white',
                      border: '1px solid #dee2e6',
                      '&:hover': { 
                        bgcolor: '#f8f9fa',
                        borderColor: '#2C3E50'
                      }
                    }}
                  >
                    <RefreshIcon sx={{ color: '#2C3E50' }} />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{ 
                    bgcolor: 'white', 
                    borderRadius: 2,
                    px: { xs: 2, md: 3 },
                    py: 1,
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    '&:hover': { 
                      bgcolor: 'white',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(44, 62, 80, 0.3)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Print List
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PdfIcon />}
                  onClick={generatePDF}
                  sx={{ 
                    bgcolor: '#E74C3C', 
                    borderRadius: 2,
                    px: { xs: 2, md: 3 },
                    py: 1,
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    color: 'white',
                    '&:hover': { 
                      bgcolor: '#C0392B',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Generate PDF
                </Button>
              </Box>
            </Box>

            {/* Table */}
            <TableContainer 
              component={Paper} 
              id="benefit-tracking-table"
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e0e0e0',
                overflow: 'auto',
                maxHeight: { xs: '70vh', md: 'none' },
                bgcolor: 'white'
              }}
            >
              <Table size="small" aria-label="PWD members table">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'white', borderBottom: '2px solid #E0E0E0' }}>
                    <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>PWD ID</TableCell>
                    <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Full Name</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Age</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Birth Date</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Disability Type</TableCell>
                    <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Status</TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' }, color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Registration Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            No PWD members found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try adjusting your filters or refresh the data
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member, index) => (
                      <TableRow 
                        key={member.id}
                        sx={{ 
                          bgcolor: index % 2 ? '#F7FBFF' : 'white',
                          '& .MuiTableCell-root': {
                            borderBottom: '1px solid #E0E0E0'
                          }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: '#1976D2', fontSize: '0.8rem', py: 2, px: 2 }}>
                          {member.pwd_id || (member.userID ? `PWD-${member.userID}` : (
                            <Typography variant="body2" sx={{ color: '#2C3E50', fontStyle: 'italic', fontSize: '0.8rem' }}>
                              Not assigned
                            </Typography>
                          ))}
                        </TableCell>
                        <TableCell sx={{ color: '#0b87ac', fontWeight: 500, fontSize: '0.8rem', py: 2, px: 2 }}>
                          {(() => {
                            const parts = [];
                            if (member.firstName) parts.push(member.firstName);
                            if (member.middleName && member.middleName.trim().toUpperCase() !== 'N/A') parts.push(member.middleName);
                            if (member.lastName) parts.push(member.lastName);
                            const formattedName = parts.join(' ').trim();
                            if (!formattedName) {
                              return (
                                <Typography variant="body2" sx={{ color: '#2C3E50', fontStyle: 'italic', fontSize: '0.8rem' }}>
                                  Name not provided
                                </Typography>
                              );
                            }
                            return formattedName;
                          })()}
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, color: '#34495E', fontWeight: 600, fontSize: '0.8rem', py: 2, px: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#34495E', fontSize: '0.8rem' }}>
                            {getAge(member.birthDate)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, color: '#34495E', fontSize: '0.8rem', py: 2, px: 2 }}>
                          {member.birthDate ? (
                            <Typography variant="body2" sx={{ color: '#34495E', fontSize: '0.8rem' }}>
                              {formatDateMMDDYYYY(member.birthDate)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#2C3E50', fontStyle: 'italic', fontSize: '0.8rem' }}>
                              Not provided
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, color: '#0b87ac', fontWeight: 500, fontSize: '0.8rem', py: 2, px: 2 }}>
                          {member.disabilityType || (
                            <Typography variant="body2" sx={{ color: '#2C3E50', fontStyle: 'italic', fontSize: '0.8rem' }}>
                              Not specified
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 2, px: 2 }}>
                          <Chip
                            label="Active"
                            color="success"
                            size="small"
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              '&.MuiChip-colorSuccess': {
                                bgcolor: '#d4edda',
                                color: '#155724'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' }, color: '#2C3E50' }}>
                          {getRegistrationDate(member) ? (
                            <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                              {getRegistrationDate(member)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" sx={{ color: '#2C3E50', fontStyle: 'italic' }}>
                              Not available
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
            </Table>
          </TableContainer>
          </>
        ) : activeTab === 1 ? (
          /* Birthday Cash Gifts Tab */
          <>
            {/* Birthday Benefits Summary */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #E67E22 0%, #F39C12 100%)',
                  color: '#2C3E50',
                  boxShadow: '0 8px 32px rgba(230, 126, 34, 0.3)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Birthday Benefits
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                      }}
                    >
                      {birthdayBenefits.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)',
                  color: '#2C3E50',
                  boxShadow: '0 8px 32px rgba(39, 174, 96, 0.3)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Total Eligible
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                      }}
                    >
                      {eligibleBeneficiaries.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #3498DB 0%, #5DADE2 100%)',
                  color: '#2C3E50',
                  boxShadow: '0 8px 32px rgba(52, 152, 219, 0.3)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Claimed
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                      }}
                    >
                      {eligibleBeneficiaries.filter(b => b.claimStatus === 'claimed').length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #E74C3C 0%, #EC7063 100%)',
                  color: '#2C3E50',
                  boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Unclaimed
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                      }}
                    >
                      {eligibleBeneficiaries.filter(b => b.claimStatus === 'unclaimed').length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Birthday Benefits Selection */}
            {birthdayBenefits.length === 0 ? (
              <Paper sx={{ 
                p: { xs: 4, md: 6 }, 
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e0e0e0',
                bgcolor: 'white'
              }}>
                <CakeIcon sx={{ fontSize: 60, color: '#BDC3C7', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#2C3E50', mb: 1, fontWeight: 600 }}>
                  No Birthday Cash Gift Benefits Available
                </Typography>
                <Typography variant="body2" sx={{ color: '#2C3E50', mb: 3 }}>
                  Add birthday cash gift benefits in the Ayuda page to track beneficiaries here
                </Typography>
                <Button
                  variant="outlined"
                  onClick={loadBirthdayBenefits}
                  sx={{
                    borderColor: '#E67E22',
                    color: '#E67E22',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#D35400',
                      backgroundColor: '#E67E2215',
                      color: '#D35400'
                    }
                  }}
                >
                  Refresh Benefits
                </Button>
              </Paper>
            ) : (
              <>
                <Paper sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #e0e0e0',
                  bgcolor: 'white'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2C3E50', mb: 2 }}>
                    Select Birthday Cash Gift Benefit
                  </Typography>
                  <Grid container spacing={2}>
                    {birthdayBenefits.map((benefit) => (
                      <Grid item xs={12} sm={6} md={4} key={benefit.id}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            border: selectedBenefit?.id === benefit.id ? '2px solid #2C3E50' : '1px solid #E0E0E0',
                            borderRadius: 2,
                            bgcolor: 'white',
                            '&:hover': { 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              transform: 'translateY(-2px)',
                              transition: 'all 0.3s ease'
                            }
                          }}
                          onClick={() => handleBenefitSelect(benefit)}
                        >
                          <CardContent sx={{ p: 2, bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CakeIcon sx={{ color: '#2C3E50', mr: 1 }} />
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50' }}>
                                {benefit.title || benefit.benefitType || benefit.type}
                              </Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                              {benefit.amount}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#2C3E50', mb: 1 }}>
                              {benefit.description}
                            </Typography>
                            <Chip 
                              label={benefit.type === 'Birthday Cash Gift' ? getQuarterName(benefit.birthdayMonth) : 
                                     benefit.type === 'Financial Assistance' ? 
                                       (benefit.selectedBarangays && benefit.selectedBarangays.length > 0 ? benefit.selectedBarangays.join(', ') : 'All Barangays') :
                                       benefit.quarter || 'All Months'} 
                              size="small" 
                              sx={{ 
                                bgcolor: '#F5F5F5', 
                                color: '#2C3E50',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

                {/* Beneficiaries List */}
                {selectedBenefit && (
                  <Paper sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden',
                    bgcolor: 'white'
                  }}>
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: '#E67E22', 
                      color: '#2C3E50' 
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Eligible Beneficiaries for {selectedBenefit.title || selectedBenefit.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {selectedBenefit.type === 'Birthday Cash Gift' ? getQuarterName(selectedBenefit.birthdayMonth) : 
                         selectedBenefit.type === 'Financial Assistance' ? 
                           (selectedBenefit.selectedBarangays && selectedBenefit.selectedBarangays.length > 0 ? selectedBenefit.selectedBarangays.join(', ') : 'All Barangays') :
                           selectedBenefit.quarter || 'All Months'} • {eligibleBeneficiaries.length} eligible members
                      </Typography>
                    </Box>
                    
                    <TableContainer sx={{ bgcolor: 'white' }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ 
                            bgcolor: 'white',
                            '& .MuiTableCell-head': {
                              fontWeight: 'bold',
                              color: '#2C3E50',
                              fontSize: '0.95rem',
                              borderBottom: '2px solid #dee2e6'
                            }
                          }}>
                            <TableCell>PWD ID</TableCell>
                            <TableCell>Full Name</TableCell>
                            <TableCell>Birth Month</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Barangay</TableCell>
                            <TableCell>Disability Type</TableCell>
                            <TableCell>Claim Status</TableCell>
                            <TableCell>Claim Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {eligibleBeneficiaries.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    No eligible beneficiaries found
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    No PWD members have birthdays in {selectedBenefit.type === 'Birthday Cash Gift' ? getQuarterName(selectedBenefit.birthdayMonth) : 
                           selectedBenefit.type === 'Financial Assistance' ? 
                             (selectedBenefit.selectedBarangays && selectedBenefit.selectedBarangays.length > 0 ? selectedBenefit.selectedBarangays.join(', ') : 'All Barangays') :
                             selectedBenefit.quarter || 'All Months'}
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            eligibleBeneficiaries.map((member, index) => (
                              <TableRow 
                                key={member.id} 
                                hover
                                sx={{ 
                                  '&:hover': {
                                    bgcolor: '#f5f5f5',
                                  },
                                  '& .MuiTableCell-root': {
                                    borderBottom: '1px solid #e9ecef',
                                    py: 2
                                  }
                                }}
                              >
                            <TableCell sx={{ fontWeight: 'medium', color: '#2C3E50' }}>
                              {member.pwd_id || (member.userID ? `PWD-${member.userID}` : 'Not assigned')}
                            </TableCell>
                                <TableCell sx={{ color: '#2C3E50' }}>
                                  {(() => {
                                    const parts = [];
                                    if (member.firstName) parts.push(member.firstName);
                                    if (member.middleName && member.middleName.trim().toUpperCase() !== 'N/A') parts.push(member.middleName);
                                    if (member.lastName) parts.push(member.lastName);
                                    if (member.suffix) parts.push(member.suffix);
                                    return parts.join(' ').trim() || 'Name not provided';
                                  })()}
                                </TableCell>
                                <TableCell sx={{ color: '#2C3E50' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#2C3E50' }}>
                                    {getMonthName(new Date(member.birthDate).getMonth() + 1)}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ color: '#2C3E50' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#2C3E50' }}>
                                    {getAge(member.birthDate)}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ color: '#2C3E50' }}>
                                  {member.barangay || 'Not specified'}
                                </TableCell>
                                <TableCell sx={{ color: '#2C3E50' }}>
                                  {member.disabilityType || 'Not specified'}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={member.claimStatus === 'claimed' ? <CheckCircleIcon /> : <CancelIcon />}
                                    label={member.claimStatus === 'claimed' ? 'Claimed' : 'Unclaimed'}
                                    color={member.claimStatus === 'claimed' ? 'success' : 'error'}
                                    size="small"
                                    sx={{ 
                                      fontWeight: 'bold',
                                      '&.MuiChip-colorSuccess': {
                                        bgcolor: '#d4edda',
                                        color: '#155724'
                                      },
                                      '&.MuiChip-colorError': {
                                        bgcolor: '#f8d7da',
                                        color: '#721c24'
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ color: '#2C3E50' }}>
                                  {member.claimDate ? (
                                    <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                                      {formatDateMMDDYYYY(member.claimDate)}
                                    </Typography>
                                  ) : (
                                    <Typography variant="body2" sx={{ color: '#2C3E50', fontStyle: 'italic' }}>
                                      Not claimed
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </>
            )}
          </>
          ) : (
          /* Financial Assistance Tab */
          <Box sx={{ bgcolor: 'white' }}>
            {/* Financial Assistance Summary */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #E67E22 0%, #F39C12 100%)',
                  color: '#2C3E50',
                  boxShadow: '0 8px 32px rgba(230, 126, 34, 0.3)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Financial Assistance Benefits
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                      }}
                    >
                      {financialBenefits.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)',
                  color: '#2C3E50',
                  boxShadow: '0 8px 32px rgba(39, 174, 96, 0.3)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Total Eligible
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                      }}
                    >
                      {eligibleBeneficiaries.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #3498DB 0%, #5DADE2 100%)',
                  color: '#2C3E50',
                  boxShadow: '0 8px 32px rgba(52, 152, 219, 0.3)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Claimed
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                      }}
                    >
                      {eligibleBeneficiaries.filter(b => b.claimStatus === 'claimed').length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #E74C3C 0%, #EC7063 100%)',
                  color: '#2C3E50',
                  boxShadow: '0 8px 32px rgba(231, 76, 60, 0.3)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.9, 
                        mb: 1,
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Unclaimed
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' }
                      }}
                    >
                      {eligibleBeneficiaries.filter(b => b.claimStatus === 'unclaimed').length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Financial Assistance Benefits Selection */}
            {financialBenefits.length === 0 ? (
              <Paper sx={{ 
                p: { xs: 4, md: 6 }, 
                textAlign: 'center',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e0e0e0',
                bgcolor: 'white'
              }}>
                <CakeIcon sx={{ fontSize: 60, color: '#BDC3C7', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#2C3E50', mb: 1, fontWeight: 600 }}>
                  No Financial Assistance Benefits Available
                </Typography>
                <Typography variant="body2" sx={{ color: '#2C3E50', mb: 3 }}>
                  Add financial assistance benefits in the Ayuda page to track beneficiaries here
                </Typography>
                <Button
                  variant="outlined"
                  onClick={loadBirthdayBenefits}
                  sx={{
                    borderColor: '#E67E22',
                    color: '#E67E22',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#D35400',
                      backgroundColor: '#E67E2215',
                      color: '#D35400'
                    }
                  }}
                >
                  Refresh Benefits
                </Button>
              </Paper>
            ) : (
              <>
                <Paper sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #e0e0e0',
                  bgcolor: 'white'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2C3E50', mb: 2 }}>
                    Select Financial Assistance Benefit
                  </Typography>
                  <Grid container spacing={2}>
                    {financialBenefits.map((benefit) => (
                      <Grid item xs={12} sm={6} md={4} key={benefit.id}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            border: selectedBenefit?.id === benefit.id ? '2px solid #2C3E50' : '1px solid #E0E0E0',
                            borderRadius: 2,
                            bgcolor: 'white',
                            '&:hover': { 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              transform: 'translateY(-2px)',
                              transition: 'all 0.3s ease'
                            }
                          }}
                          onClick={() => handleBenefitSelect(benefit)}
                        >
                          <CardContent sx={{ p: 2, bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CakeIcon sx={{ color: '#2C3E50', mr: 1 }} />
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50' }}>
                                {benefit.title || benefit.benefitType || benefit.type}
                              </Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                              {benefit.amount}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#2C3E50', mb: 1 }}>
                              {benefit.description}
                            </Typography>
                            <Chip 
                              label={benefit.type === 'Birthday Cash Gift' ? getQuarterName(benefit.birthdayMonth) : 
                                     benefit.type === 'Financial Assistance' ? 
                                       (benefit.selectedBarangays && benefit.selectedBarangays.length > 0 ? benefit.selectedBarangays.join(', ') : 'All Barangays') :
                                       benefit.quarter || 'All Months'} 
                              size="small" 
                              sx={{ 
                                bgcolor: '#F5F5F5', 
                                color: '#2C3E50',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

                {/* Beneficiaries List */}
                {selectedBenefit && (
                  <Paper sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden',
                    bgcolor: 'white'
                  }}>
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: '#E67E22', 
                      color: '#2C3E50' 
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Eligible Beneficiaries for {selectedBenefit.title || selectedBenefit.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {selectedBenefit.type === 'Birthday Cash Gift' ? getQuarterName(selectedBenefit.birthdayMonth) : 
                         selectedBenefit.type === 'Financial Assistance' ? 
                           (selectedBenefit.selectedBarangays && selectedBenefit.selectedBarangays.length > 0 ? selectedBenefit.selectedBarangays.join(', ') : 'All Barangays') :
                           selectedBenefit.quarter || 'All Months'} • {eligibleBeneficiaries.length} eligible members
                      </Typography>
                    </Box>
                    
                    <TableContainer sx={{ bgcolor: 'white' }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ 
                            bgcolor: 'white',
                            '& .MuiTableCell-head': {
                              fontWeight: 'bold',
                              color: '#2C3E50',
                              fontSize: '0.95rem',
                              borderBottom: '2px solid #dee2e6'
                            }
                          }}>
                            <TableCell>PWD ID</TableCell>
                            <TableCell>Full Name</TableCell>
                            <TableCell>Birth Month</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Barangay</TableCell>
                            <TableCell>Disability Type</TableCell>
                            <TableCell>Claim Status</TableCell>
                            <TableCell>Claim Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {eligibleBeneficiaries.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    No eligible beneficiaries found
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    No PWD members have birthdays in {selectedBenefit.type === 'Birthday Cash Gift' ? getQuarterName(selectedBenefit.birthdayMonth) : 
                           selectedBenefit.type === 'Financial Assistance' ? 
                             (selectedBenefit.selectedBarangays && selectedBenefit.selectedBarangays.length > 0 ? selectedBenefit.selectedBarangays.join(', ') : 'All Barangays') :
                             selectedBenefit.quarter || 'All Months'}
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            eligibleBeneficiaries.map((member, index) => (
                              <TableRow 
                                key={member.id} 
                                hover
                                sx={{ 
                                  '&:hover': {
                                    bgcolor: '#f5f5f5',
                                  },
                                  '& .MuiTableCell-root': {
                                    borderBottom: '1px solid #e9ecef',
                                    py: 2
                                  }
                                }}
                              >
                            <TableCell sx={{ fontWeight: 'medium', color: '#2C3E50' }}>
                              {member.pwd_id || (member.userID ? `PWD-${member.userID}` : 'Not assigned')}
                            </TableCell>
                                <TableCell sx={{ color: '#2C3E50' }}>
                                  {(() => {
                                    const parts = [];
                                    if (member.firstName) parts.push(member.firstName);
                                    if (member.middleName && member.middleName.trim().toUpperCase() !== 'N/A') parts.push(member.middleName);
                                    if (member.lastName) parts.push(member.lastName);
                                    if (member.suffix) parts.push(member.suffix);
                                    return parts.join(' ').trim() || 'Name not provided';
                                  })()}
                                </TableCell>
                                <TableCell sx={{ color: '#2C3E50' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#2C3E50' }}>
                                    {getMonthName(new Date(member.birthDate).getMonth() + 1)}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ color: '#2C3E50' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#2C3E50' }}>
                                    {getAge(member.birthDate)}
                                  </Typography>
                                </TableCell>
                                <TableCell sx={{ color: '#2C3E50' }}>
                                  {member.barangay || 'Not specified'}
                                </TableCell>
                                <TableCell sx={{ color: '#2C3E50' }}>
                                  {member.disabilityType || 'Not specified'}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={member.claimStatus === 'claimed' ? <CheckCircleIcon /> : <CancelIcon />}
                                    label={member.claimStatus === 'claimed' ? 'Claimed' : 'Unclaimed'}
                                    color={member.claimStatus === 'claimed' ? 'success' : 'error'}
                                    size="small"
                                    sx={{ 
                                      fontWeight: 'bold',
                                      '&.MuiChip-colorSuccess': {
                                        bgcolor: '#d4edda',
                                        color: '#155724'
                                      },
                                      '&.MuiChip-colorError': {
                                        bgcolor: '#f8d7da',
                                        color: '#721c24'
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ color: '#2C3E50' }}>
                                  {member.claimDate ? (
                                    <Typography variant="body2" sx={{ color: '#2C3E50' }}>
                                      {formatDateMMDDYYYY(member.claimDate)}
                                    </Typography>
                                  ) : (
                                    <Typography variant="body2" sx={{ color: '#2C3E50', fontStyle: 'italic' }}>
                                      Not claimed
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </>
            )}
          </Box>
          )}
        </Container>
      </Box>
      


      {/* PWD ID Card Dialog */}
      <PWDIDCard
        open={pwdIdCardOpen}
        onClose={handleClosePWDIDCard}
        member={selectedMember}
      />

      {/* Floating QR Scanner Button */}
      <FloatingQRScannerButton
        onScanSuccess={handleQRScanSuccess}
        onScanError={handleQRScanError}
      />
    </Box>
  );
};

export default BenefitTracking;
