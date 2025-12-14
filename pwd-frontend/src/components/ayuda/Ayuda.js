import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress
} from '@mui/material';
import toastService from '../../services/toastService';
import {
  VolunteerActivism,
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Schedule,
  Warning,
  AttachMoney,
  People,
  LocalShipping,
  Print,
  PendingActions,
  Upload,
  Description,
  Approval,
  PictureAsPdf,
  Menu as MenuIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import AdminSidebar from '../shared/AdminSidebar';
import Staff2Sidebar from '../shared/Staff2Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import pwdMemberService from '../../services/pwdMemberService';
import benefitService from '../../services/benefitService';
import announcementService from '../../services/announcementService';
import { cacheService } from '../../services/cacheService';

const Ayuda = () => {
  const { currentUser } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [pendingSchedules, setPendingSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPendingSchedule, setSelectedPendingSchedule] = useState(null);
  const [approvalFile, setApprovalFile] = useState(null);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [eligibleMembers, setEligibleMembers] = useState([]);
  const [loadingEligibleMembers, setLoadingEligibleMembers] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [approvingSchedule, setApprovingSchedule] = useState(false);
  const [showDraftAnnouncementPopup, setShowDraftAnnouncementPopup] = useState(false);

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

  // Format date and time as MM/DD/YYYY HH:MM AM/PM
  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    
    // Handle date strings that might not have time component
    let date;
    if (typeof dateString === 'string') {
      // If it's just a date (YYYY-MM-DD), add default time
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        date = new Date(dateString + 'T00:00:00');
      } else if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString + 'T00:00:00');
      }
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return null;
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    
    return `${month}/${day}/${year} ${formattedTime}`;
  };

  // Format description with proper bullets and numbering
  const formatDescription = (description) => {
    if (!description) return [];
    
    // Split by lines and process each line
    const lines = description.split('\n');
    const formattedLines = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines but keep them for spacing
      if (!trimmedLine) {
        formattedLines.push({ type: 'empty', content: '' });
        return;
      }
      
      // Check for section headers (all caps words followed by colon, or specific patterns)
      if (trimmedLine.match(/^[A-Z][A-Z\s:]+:$/) || 
          trimmedLine.match(/^[A-Z\s]{3,}:$/) ||
          trimmedLine.match(/^(PROGRAM|ELIGIBILITY|IMPORTANT|CLAIMING|VENUE|CONTACT|NOTE|HOW TO|PROGRAM OVERVIEW|PROGRAM DETAILS):$/i)) {
        formattedLines.push({ type: 'header', content: trimmedLine });
        return;
      }
      
      // Check for numbered lists (1., 2., 3., etc. or 1), 2), etc.)
      if (trimmedLine.match(/^\d+[\.\)]\s/)) {
        formattedLines.push({ type: 'numbered', content: trimmedLine });
        return;
      }
      
      // Check for bullet points (•, -, *, or lines starting with spaces and bullet)
      if (trimmedLine.match(/^[•\-\*]\s/) || 
          trimmedLine.match(/^[•\-\*]/) ||
          trimmedLine.match(/^\s+[•\-\*]/)) {
        formattedLines.push({ type: 'bullet', content: trimmedLine });
        return;
      }
      
      // Regular text
      formattedLines.push({ type: 'text', content: trimmedLine });
    });
    
    return formattedLines;
  };

  // Generate announcement preview based on form data
  const generateAnnouncementPreview = () => {
    if (!formData.type) return [];
    
    const benefitType = formData.type || 'Financial Assistance';
    const amount = formData.amount ? formData.amount.replace(/[₱,]/g, '') : '0.00';
    const benefitDescription = formData.description || '';
    
    // Get selected barangays
    const selectedBarangays = formData.selectedBarangays && formData.selectedBarangays.length > 0
      ? formData.selectedBarangays
      : (formData.barangay && formData.barangay !== 'All Barangays' ? [formData.barangay] : []);
    
    // Format dates
    const distributionDate = formData.distributionDate 
      ? new Date(formData.distributionDate + 'T00:00:00')
      : null;
    const expiryDate = formData.expiryDate 
      ? new Date(formData.expiryDate + 'T00:00:00')
      : null;
    
    // Build description
    let description = "A new Ayuda (Benefit) program has been approved and is now available for claiming.\n\n";
    
    // Program Summary
    description += "PROGRAM SUMMARY:\n";
    description += "This announcement is for the approved " + benefitType + " program";
    if (selectedBarangays.length > 0) {
      description += " targeting the following barangay(s): " + selectedBarangays.join(', ');
    }
    description += ".\n\n";
    
    // Program Details
    description += "PROGRAM DETAILS:\n";
    description += "• Benefit Type: " + benefitType + "\n";
    description += "• Amount: ₱" + amount + "\n";
    if (benefitDescription) {
      description += "• Description: " + benefitDescription + "\n";
    }
    description += "\n";
    
    // Eligibility
    description += "ELIGIBILITY:\n";
    description += "• Must be a registered PWD member\n";
    if (selectedBarangays.length > 0) {
      description += "• Must belong to one of the following barangays: " + selectedBarangays.join(', ') + "\n";
    }
    description += "• Must have completed all required documents\n";
    description += "• Must be in good standing with the PWD registry\n";
    description += "\n";
    
    // Important Dates
    description += "IMPORTANT DATES:\n";
    if (distributionDate) {
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      description += "• Distribution Date: " + monthNames[distributionDate.getMonth()] + " " + 
        distributionDate.getDate() + ", " + distributionDate.getFullYear() + "\n";
    } else {
      description += "• Distribution Date: [TO BE SPECIFIED]\n";
    }
    if (expiryDate) {
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      description += "• Claim Deadline: " + monthNames[expiryDate.getMonth()] + " " + 
        expiryDate.getDate() + ", " + expiryDate.getFullYear() + "\n";
    } else {
      description += "• Claim Deadline: [TO BE SPECIFIED]\n";
    }
    description += "\n";
    
    // Claiming Instructions
    description += "CLAIMING INSTRUCTIONS:\n";
    description += "1. Visit your barangay hall or the designated claiming venue\n";
    description += "2. Present valid ID and PWD card for verification\n";
    description += "3. Wait for verification and approval\n";
    description += "4. Receive your benefit upon approval\n";
    description += "\n";
    
    // Venue
    description += "VENUE:\n";
    description += "• Location: [TO BE SPECIFIED - Venue will be finalized through coordination with Barangay President, PDO Head, and Mayor]\n";
    description += "• PDAO Office Hours: 8am-4pm\n";
    description += "\n";
    
    // Contact Information
    description += "CONTACT INFORMATION:\n";
    description += "• For questions or concerns, please contact your barangay office\n";
    description += "• Office: [TO BE SPECIFIED]\n";
    description += "• Phone: [TO BE SPECIFIED]\n";
    description += "• Email: [TO BE SPECIFIED]\n";
    description += "\n";
    
    // Important Reminders
    description += "IMPORTANT REMINDERS:\n";
    description += "• Please bring all required documents when claiming (Valid ID, PWD Card)\n";
    description += "• Benefits must be claimed before the specified deadline\n";
    description += "• Only eligible members will receive the benefit\n";
    description += "• For any issues or concerns, contact your barangay office immediately\n";
    description += "\n";
    
    description += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    description += "Note: This is a draft announcement. Please complete all [TO BE SPECIFIED] fields, especially the venue details, before posting.\n";
    
    // Format the description similar to formatAnnouncementContent
    const lines = description.split('\n');
    const formattedLines = [];
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        formattedLines.push({ type: 'empty', content: '' });
        return;
      }
      
      // Check for section headers
      if (trimmedLine.match(/^[A-Z][A-Z\s:]+:$/) || 
          trimmedLine.match(/^[A-Z\s]{3,}:$/) ||
          trimmedLine.match(/^(PROGRAM|ELIGIBILITY|IMPORTANT|CLAIMING|VENUE|CONTACT|NOTE):$/i)) {
        formattedLines.push({ type: 'header', content: trimmedLine });
        return;
      }
      
      // Check for numbered lists
      if (trimmedLine.match(/^\d+[\.\)]\s/)) {
        formattedLines.push({ type: 'numbered', content: trimmedLine });
        return;
      }
      
      // Check for bullet points
      if (trimmedLine.match(/^[•\-\*]\s/) || 
          trimmedLine.match(/^[•\-\*]/) ||
          trimmedLine.match(/^\s+[•\-\*]/)) {
        formattedLines.push({ type: 'bullet', content: trimmedLine });
        return;
      }
      
      // Regular text
      formattedLines.push({ type: 'text', content: trimmedLine });
    });
    
    return formattedLines;
  };

  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    description: '',
    targetRecipients: '',
    distributionDate: '',
    expiryDate: '',
    birthdayMonth: '',
    barangay: '',
    selectedBarangays: [], // For Financial Assistance - multiple barangays
    quarter: '',
    quarterly: '',
    status: 'Active'
  });

  // Separate state for editable venue/contact section
  const [venueContact, setVenueContact] = useState({
    venue: '[TO BE ANNOUNCED - Will be finalized through coordination]',
    officeHours: '8am-4pm',
    contact: '[TO BE SPECIFIED]'
  });

  // Generate read-only description template (auto-updates based on form data)
  const generateReadOnlyDescription = () => {
    if (!formData.type) return '';
    
    const benefitType = formData.type || 'Financial Assistance';
    const amount = formData.amount ? formData.amount.replace(/[₱,]/g, '') : '[AMOUNT]';
    const selectedBarangays = formData.selectedBarangays && formData.selectedBarangays.length > 0
      ? formData.selectedBarangays
      : (formData.barangay && formData.barangay !== 'All Barangays' ? [formData.barangay] : []);
    
    // Format dates
    const distributionDate = formData.distributionDate 
      ? (() => {
          const date = new Date(formData.distributionDate + 'T00:00:00');
          const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
          return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
        })()
      : '[DISTRIBUTION DATE]';
    
    const expiryDate = formData.expiryDate 
      ? (() => {
          const date = new Date(formData.expiryDate + 'T00:00:00');
          const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
          return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
        })()
      : '[EXPIRY DATE]';
    
    let template = `PROGRAM OVERVIEW:\n`;
    template += `This ${benefitType} program provides financial assistance to eligible Persons with Disabilities (PWD) in our community.\n\n`;
    
    template += `PROGRAM DETAILS:\n`;
    template += `• Benefit Type: ${benefitType}\n`;
    template += `• Amount per Beneficiary: ₱${amount}\n`;
    if (selectedBarangays.length > 0) {
      template += `• Target Barangays: ${selectedBarangays.join(', ')}\n`;
    }
    template += `• Distribution Date: ${distributionDate}\n`;
    template += `• Claim Deadline: ${expiryDate}\n\n`;
    
    template += `ELIGIBILITY CRITERIA:\n`;
    template += `• Must be a registered PWD member in the City of Cabuyao\n`;
    template += `• Must have completed all required documents and registration\n\n`;
    
    template += `HOW TO CLAIM:\n`;
    template += `1. Visit the designated claiming venue on or after the distribution date\n`;
    template += `2. Present valid government-issued ID and PWD ID card\n`;
    template += `3. Wait for verification and approval\n`;
    template += `4. Receive your benefit upon successful verification\n\n`;
    
    template += `IMPORTANT REMINDERS:\n`;
    template += `• Please bring all required documents when claiming (Valid ID, PWD Card)\n`;
    template += `• Benefits must be claimed before the specified deadline\n`;
    template += `• Only eligible members will receive the benefit\n`;
    template += `• For questions or concerns, please contact your barangay office or the PDAO\n\n`;
    
    return template;
  };

  // Generate full description combining read-only and editable parts
  const generateFullDescription = () => {
    const readOnly = generateReadOnlyDescription();
    const venueContactSection = `VENUE AND CONTACT:\n`;
    const venueContactDetails = `• Venue: ${venueContact.venue}\n`;
    const officeHours = `• Office Hours: ${venueContact.officeHours}\n`;
    const contact = `• Contact: ${venueContact.contact}`;
    
    return readOnly + venueContactSection + venueContactDetails + officeHours + contact;
  };

  // Auto-update description when form data changes (but not when description itself changes to avoid loops)
  useEffect(() => {
    if (formData.type && openDialog) {
      const fullDescription = generateFullDescription();
      // Only update if description is different to avoid infinite loops
      if (formData.description !== fullDescription) {
        setFormData(prev => ({ ...prev, description: fullDescription }));
      }
    }
  }, [formData.type, formData.amount, formData.distributionDate, formData.expiryDate, formData.selectedBarangays, formData.barangay, venueContact, openDialog]);

  const distributionHistory = [];


  const handleStatusChange = async (benefitId, newStatus) => {
    try {
      const updatedBenefits = benefits.map(benefit => 
        benefit.id === benefitId ? { ...benefit, status: newStatus } : benefit
      );
      setBenefits(updatedBenefits);
      
      // Update in localStorage
      localStorage.setItem('benefits', JSON.stringify(updatedBenefits));
      
      // Update in database if using benefitService
      try {
        await benefitService.update(benefitId, { status: newStatus });
      } catch (dbError) {
        console.warn('Failed to update benefit status in database:', dbError);
        // Continue with localStorage update
      }
    } catch (error) {
      console.error('Error updating benefit status:', error);
    }
  };

  const handleOpenDialog = (benefit = null) => {
    // Prevent editing active benefits
    if (benefit && benefit.status === 'Active') {
      toastService.error('Active benefits cannot be edited. Please set the status to Inactive first.');
      return;
    }
    
    if (benefit) {
      setEditingBenefit(benefit);
      setFormData({
        ...benefit
      });
    } else {
      setEditingBenefit(null);
      setFormData({
        type: '',
        amount: '',
        description: '',
        targetRecipients: '',
        distributionDate: '',
        expiryDate: '',
        birthdayMonth: '',
        barangay: '',
        selectedBarangays: [], // For Financial Assistance - multiple barangays
        quarter: '',
        quarterly: '',
        status: 'Active'
      });
    }
    setOpenDialog(true);
  };

  // Helper: ensure unique benefits using a stable composite key (prefer ids)
  const dedupeBenefits = useCallback((list) => {
    const seenById = new Map(); // Map to store benefits by ID
    const seenByComposite = new Map(); // Map to store benefits by composite key (for items without ID)
    const unique = [];
    
    for (const item of list || []) {
      // Prioritize ID-based deduplication
      const itemId = item.id || item.benefitID;
      
      if (itemId) {
        // If we've seen this ID before, keep the one with the most recent updated_at
        if (seenById.has(itemId)) {
          const existing = seenById.get(itemId);
          const existingDate = new Date(existing.updated_at || existing.created_at || 0).getTime();
          const currentDate = new Date(item.updated_at || item.created_at || 0).getTime();
          
          // Keep the more recent one
          if (currentDate > existingDate) {
            // Replace the existing one
            const index = unique.findIndex(b => (b.id || b.benefitID) === itemId);
            if (index !== -1) {
              unique[index] = item;
              seenById.set(itemId, item);
            }
          }
          // Otherwise, skip this duplicate
          continue;
        }
        
        // First time seeing this ID
        seenById.set(itemId, item);
        unique.push(item);
      } else {
        // No ID, use composite key
        const rawDate = item.distributionDate || item.created_at || item.updated_at;
        const normalizedDate = rawDate ? new Date(rawDate).getTime() : 0;
        const normalizedTitle = (item.title || item.benefitType || '').trim().toLowerCase();
        const normalizedBarangay = (item.barangay || 'all').trim().toLowerCase();
        const normalizedAmount = (() => {
          const amt = typeof item.amount === 'string' ? item.amount.replace(/[₱,]/g, '') : item.amount;
          return Number(amt) || 0;
        })();
        const compositeKey = `${normalizedTitle}|${normalizedBarangay}|${normalizedAmount}|${normalizedDate}`;
        
        if (seenByComposite.has(compositeKey)) {
          // Check if this is more recent
          const existing = seenByComposite.get(compositeKey);
          const existingDate = new Date(existing.updated_at || existing.created_at || 0).getTime();
          const currentDate = new Date(item.updated_at || item.created_at || 0).getTime();
          
          if (currentDate > existingDate) {
            // Replace the existing one
            const index = unique.findIndex(b => {
              const bId = b.id || b.benefitID;
              if (bId) return false; // Skip items with IDs
              const bDate = b.distributionDate || b.created_at || b.updated_at;
              const bNormalizedDate = bDate ? new Date(bDate).getTime() : 0;
              const bTitle = (b.title || b.benefitType || '').trim().toLowerCase();
              const bBarangay = (b.barangay || 'all').trim().toLowerCase();
              const bAmount = (() => {
                const amt = typeof b.amount === 'string' ? b.amount.replace(/[₱,]/g, '') : b.amount;
                return Number(amt) || 0;
              })();
              return `${bTitle}|${bBarangay}|${bAmount}|${bNormalizedDate}` === compositeKey;
            });
            if (index !== -1) {
              unique[index] = item;
              seenByComposite.set(compositeKey, item);
            }
          }
          continue;
        }
        
        seenByComposite.set(compositeKey, item);
        unique.push(item);
      }
    }
    return unique;
  }, []);

  const sortBenefits = (list) => {
    return [...list].sort((a, b) => {
      const dateA = new Date(a.created_at || a.distributionDate || a.updated_at || 0);
      const dateB = new Date(b.created_at || b.distributionDate || b.updated_at || 0);
      return dateB - dateA; // Most recent first
    });
  };

  const applyBenefitsState = (list, persist = true) => {
    const deduped = dedupeBenefits(list);
    const sorted = sortBenefits(deduped);
    setBenefits(sorted);
    if (persist) {
      localStorage.setItem('benefits', JSON.stringify(sorted));
    }
    return sorted;
  };

  // Load benefits from database and pending schedules from localStorage when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load benefits from database (all statuses) and sort by most recent first
        const benefitsData = await benefitService.getAll(null, 'all');
        console.log('Loading benefits from database:', benefitsData);
        console.log('Benefits data type:', typeof benefitsData);
        console.log('Is array?', Array.isArray(benefitsData));
        
        // Handle different response structures
        let benefitsArray = [];
        if (Array.isArray(benefitsData)) {
          benefitsArray = benefitsData;
        } else if (benefitsData && benefitsData.data && Array.isArray(benefitsData.data)) {
          benefitsArray = benefitsData.data;
        } else if (benefitsData && Array.isArray(benefitsData.benefits)) {
          benefitsArray = benefitsData.benefits;
        } else if (benefitsData && typeof benefitsData === 'object') {
          // If it's an object but not an array, log it for debugging
          console.warn('Unexpected benefits data structure:', benefitsData);
          benefitsArray = [];
        } else {
          benefitsArray = [];
        }
        
        // Parse selectedBarangays if it's a JSON string and normalize data
        const parsedBenefits = benefitsArray.map(benefit => {
          // Parse selectedBarangays if it's a JSON string
          if (benefit.selectedBarangays && typeof benefit.selectedBarangays === 'string') {
            try {
              benefit.selectedBarangays = JSON.parse(benefit.selectedBarangays);
            } catch (e) {
              console.warn('Failed to parse selectedBarangays for benefit:', benefit.id, e);
              benefit.selectedBarangays = [];
            }
          }
          
          // Ensure selectedBarangays is an array
          if (!Array.isArray(benefit.selectedBarangays)) {
            benefit.selectedBarangays = [];
          }
          
          // Ensure amount is formatted correctly
          if (benefit.amount && typeof benefit.amount === 'number') {
            benefit.amount = `₱${benefit.amount.toLocaleString('en-US')}`;
          }
          
          // Ensure status has a default value
          if (!benefit.status) {
            benefit.status = 'Active';
          }
          
          // Ensure distributed and pending are numbers
          benefit.distributed = benefit.distributed || 0;
          benefit.pending = benefit.pending || 0;
          
          return benefit;
        });
        
        // Check and auto-deactivate benefits where distribution date has passed
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const benefitsWithAutoDeactivation = parsedBenefits.map(benefit => {
          if (benefit.status === 'Active' && benefit.distributionDate) {
            const distributionDate = new Date(benefit.distributionDate);
            distributionDate.setHours(0, 0, 0, 0);
            
            // If distribution date has passed, automatically set to Inactive
            if (distributionDate < today) {
              console.log(`Auto-deactivating benefit ${benefit.id}: distribution date ${benefit.distributionDate} has passed`);
              // Update in database
              benefitService.update(benefit.id, { status: 'Inactive' }).catch(err => {
                console.warn('Failed to auto-deactivate benefit in database:', err);
              });
              return { ...benefit, status: 'Inactive' };
            }
          }
          return benefit;
        });
        
        // Sort by most recent first (created_at or distributionDate)
        // Use applyBenefitsState which includes deduplication
        const sortedBenefits = applyBenefitsState(benefitsWithAutoDeactivation, true);
        
        console.log('Processed and sorted benefits:', sortedBenefits);
        console.log('Total benefits after deduplication:', sortedBenefits.length);

        // Load pending schedules from database (benefits with 'Pending Approval' status)
        const pendingApprovalBenefits = benefitsWithAutoDeactivation.filter(b => b.status === 'Pending Approval');
        console.log('Loading pending approval benefits from database:', pendingApprovalBenefits.length);
        
        // Also load from localStorage for backward compatibility (merge with database data)
        const savedPendingSchedules = localStorage.getItem('pendingSchedules');
        let localStorageSchedules = [];
        if (savedPendingSchedules && savedPendingSchedules !== 'null' && savedPendingSchedules !== 'undefined') {
          try {
            const parsedPendingSchedules = JSON.parse(savedPendingSchedules);
            if (Array.isArray(parsedPendingSchedules)) {
              localStorageSchedules = parsedPendingSchedules;
            }
          } catch (parseError) {
            console.error('Error parsing pending schedules from localStorage:', parseError);
          }
        }
        
        // Merge database and localStorage schedules, prioritizing database data
        const allPendingSchedules = [...pendingApprovalBenefits];
        const dbIds = new Set(pendingApprovalBenefits.map(b => b.id || b.benefitID));
        
        // Add localStorage schedules that aren't already in database
        localStorageSchedules.forEach(schedule => {
          const scheduleId = schedule.id || schedule.benefitID;
          if (!dbIds.has(scheduleId) && schedule.status === 'Pending Approval') {
            allPendingSchedules.push(schedule);
          }
        });
        
        // Normalize all pending schedules
        const normalizedSchedules = allPendingSchedules.map(schedule => {
          // Ensure selectedBarangays is an array
          if (schedule.selectedBarangays && typeof schedule.selectedBarangays === 'string') {
            try {
              schedule.selectedBarangays = JSON.parse(schedule.selectedBarangays);
            } catch (e) {
              schedule.selectedBarangays = [];
            }
          }
          if (!Array.isArray(schedule.selectedBarangays)) {
            schedule.selectedBarangays = [];
          }
          
          // Ensure amount is formatted correctly
          if (schedule.amount && typeof schedule.amount === 'number') {
            schedule.amount = `₱${schedule.amount.toLocaleString('en-US')}`;
          } else if (schedule.amount && !schedule.amount.includes('₱')) {
            // If it's a string without currency symbol, add it
            const numAmount = schedule.amount.replace(/[₱,]/g, '');
            if (!isNaN(numAmount)) {
              schedule.amount = `₱${parseInt(numAmount).toLocaleString('en-US')}`;
            }
          }
          
          // Ensure status is set
          if (!schedule.status) {
            schedule.status = 'Pending Approval';
          }
          
          return schedule;
        });
        
        // Sort by most recent first
        const sortedSchedules = normalizedSchedules.sort((a, b) => {
          const dateA = new Date(a.submittedDate || a.created_at || 0);
          const dateB = new Date(b.submittedDate || b.created_at || 0);
          return dateB - dateA; // Most recent first
        });
        
        console.log('Total pending schedules loaded:', sortedSchedules.length);
        setPendingSchedules(sortedSchedules);
        
        // Update localStorage with merged data (for backward compatibility)
        localStorage.setItem('pendingSchedules', JSON.stringify(sortedSchedules));
      } catch (error) {
        console.error('Error loading data:', error);
        toastService.error('Failed to load benefits data. Please refresh the page.');
        // Fallback to localStorage for benefits if database fails
        try {
          const savedBenefits = localStorage.getItem('benefits');
          if (savedBenefits && savedBenefits !== 'null' && savedBenefits !== 'undefined') {
            const parsedBenefits = JSON.parse(savedBenefits);
            if (Array.isArray(parsedBenefits)) {
              setBenefits(parsedBenefits);
            }
          } else {
            setBenefits([]);
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
          setBenefits([]);
        }
        setPendingSchedules([]);
      }
    };
    
    loadData();
    
    // Set up interval to check and auto-deactivate benefits every hour
    const autoDeactivateInterval = setInterval(() => {
      setBenefits(prevBenefits => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return prevBenefits.map(benefit => {
          if (benefit.status === 'Active' && benefit.distributionDate) {
            const distributionDate = new Date(benefit.distributionDate);
            distributionDate.setHours(0, 0, 0, 0);
            
            // If distribution date has passed, automatically set to Inactive
            if (distributionDate < today) {
              console.log(`Auto-deactivating benefit ${benefit.id}: distribution date ${benefit.distributionDate} has passed`);
              // Update in database
              benefitService.update(benefit.id, { status: 'Inactive' }).catch(err => {
                console.warn('Failed to auto-deactivate benefit in database:', err);
              });
              return { ...benefit, status: 'Inactive' };
            }
          }
          return benefit;
        });
      });
    }, 60 * 60 * 1000); // Check every hour
    
    return () => {
      clearInterval(autoDeactivateInterval);
    };
  }, []);

  // Effect to fetch eligible members when benefit type, month/quarter, and barangay change
  useEffect(() => {
    if (formData.type === 'Financial Assistance' && formData.selectedBarangays.length > 0) {
      fetchEligibleMembers('Financial Assistance', null, formData.selectedBarangays);
    } else if (formData.type === 'Birthday Cash Gift' && formData.birthdayMonth) {
      // For Birthday Cash Gift, allow selecting multiple barangays via checkboxes
      fetchEligibleMembers('Birthday Cash Gift', formData.birthdayMonth, formData.selectedBarangays);
    } else {
      setEligibleMembers([]);
    }
  }, [formData.type, formData.birthdayMonth, formData.barangay, formData.selectedBarangays]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBenefit(null);
    setVenueContact({
      venue: '[TO BE ANNOUNCED - Will be finalized through coordination]',
      officeHours: '8am-4pm',
      contact: '[TO BE SPECIFIED]'
    });
  };

  const handleBarangaySelection = (barangay) => {
    if (formData.type === 'Financial Assistance' || formData.type === 'Birthday Cash Gift') {
      const updatedBarangays = formData.selectedBarangays.includes(barangay)
        ? formData.selectedBarangays.filter(b => b !== barangay)
        : [...formData.selectedBarangays, barangay];
      setFormData({ ...formData, selectedBarangays: updatedBarangays });
    } else {
      setFormData({ ...formData, barangay });
    }
  };

  const handleDeleteBenefit = async (benefitId) => {
    toastService.confirm(
      'Delete Benefit Program',
      'Are you sure you want to delete this benefit program? This action cannot be undone.',
      async () => {
        try {
          await benefitService.delete(benefitId);
          const updatedBenefits = benefits.filter(benefit => benefit.id !== benefitId);
          setBenefits(updatedBenefits);
          // Also update localStorage for backward compatibility
          localStorage.setItem('benefits', JSON.stringify(updatedBenefits));
          toastService.success('Benefit program deleted successfully!');
        } catch (error) {
          console.error('Error deleting benefit:', error);
          toastService.error('Failed to delete benefit program: ' + (error.message || 'Unknown error'));
        }
      }
    );
  };

  const handleDeletePendingSchedule = async (scheduleId) => {
    toastService.confirm(
      'Delete Pending Schedule',
      'Are you sure you want to delete this pending schedule? This action cannot be undone.',
      async () => {
        try {
          // For pending schedules, we'll delete from localStorage for now
          // In the future, you might want to create a separate table for pending schedules
          const updatedPendingSchedules = pendingSchedules.filter(schedule => schedule.id !== scheduleId);
          setPendingSchedules(updatedPendingSchedules);
          localStorage.setItem('pendingSchedules', JSON.stringify(updatedPendingSchedules));
          toastService.success('Pending schedule deleted successfully!');
        } catch (error) {
          console.error('Error deleting pending schedule:', error);
          toastService.error('Failed to delete pending schedule: ' + (error.message || 'Unknown error'));
        }
      }
    );
  };

  const handleSubmit = async () => {
    // Validate selectedBarangays - at least one barangay must be selected
    if (formData.type === 'Financial Assistance' || formData.type === 'Birthday Cash Gift') {
      if (!formData.selectedBarangays || !Array.isArray(formData.selectedBarangays) || formData.selectedBarangays.length === 0) {
        toastService.error('Please select at least one barangay for this benefit.');
        return;
      }
      
      // Filter out empty or invalid barangay entries
      const validBarangays = formData.selectedBarangays.filter(b => b && typeof b === 'string' && b.trim() !== '');
      
      if (validBarangays.length === 0) {
        toastService.error('Please select at least one valid barangay. Empty or invalid entries are not allowed.');
        return;
      }
      
      // Remove duplicates
      const uniqueBarangays = [...new Set(validBarangays)];
      if (uniqueBarangays.length !== formData.selectedBarangays.length) {
        formData.selectedBarangays = uniqueBarangays;
        toastService.info('Removed duplicate barangay selections.');
      }
    }
    
    // Calculate 1 week from today for validation
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    oneWeekFromNow.setHours(0, 0, 0, 0);
    
    // Validate distribution date
    if (formData.distributionDate) {
      const selectedDistributionDate = new Date(formData.distributionDate + 'T00:00:00');
      selectedDistributionDate.setHours(0, 0, 0, 0);
      
      // Check if distribution date is a weekend
      const distDayOfWeek = selectedDistributionDate.getDay();
      if (distDayOfWeek === 0 || distDayOfWeek === 6) {
        toastService.error('Distribution date cannot be on a weekend (Saturday or Sunday). Please select a weekday.');
        return;
      }
      
      if (selectedDistributionDate < oneWeekFromNow) {
        toastService.error('Distribution date must be at least 1 week from today.');
        return;
      }
    }
    
    // Validate expiry date
    if (formData.expiryDate) {
      const selectedExpiryDate = new Date(formData.expiryDate + 'T00:00:00');
      selectedExpiryDate.setHours(0, 0, 0, 0);
      
      // Check if expiry date is a weekend
      const expiryDayOfWeek = selectedExpiryDate.getDay();
      if (expiryDayOfWeek === 0 || expiryDayOfWeek === 6) {
        toastService.error('Expiry date cannot be on a weekend (Saturday or Sunday). Please select a weekday.');
        return;
      }
      
      if (selectedExpiryDate < oneWeekFromNow) {
        toastService.error('Expiry date must be at least 1 week from today.');
        return;
      }
      
      // Also ensure expiry date is after distribution date
      if (formData.distributionDate) {
        const selectedDistributionDate = new Date(formData.distributionDate + 'T00:00:00');
        if (selectedExpiryDate <= selectedDistributionDate) {
          toastService.error('Expiry date must be after the distribution date.');
          return;
        }
      }
    }
    
    if (editingBenefit) {
      // Update existing benefit
      try {
        // Format distribution date to include time (12:00 AM) and use real-time timestamp
        const realTimeNow = new Date().toISOString();
        const updateData = {
          ...formData,
          distributionDate: formData.distributionDate ? (() => {
            const dateObj = new Date(formData.distributionDate);
            dateObj.setHours(0, 0, 0, 0); // Set to 12:00 AM
            return dateObj.toISOString();
          })() : formData.distributionDate,
          updated_at: realTimeNow // Real-time timestamp
        };
        await benefitService.update(editingBenefit.id, updateData);
        const updatedBenefits = benefits.map(benefit => 
          benefit.id === editingBenefit.id 
            ? { 
                ...benefit, 
                type: formData.type,
                amount: formData.amount,
                description: formData.description,
                targetRecipients: formData.targetRecipients,
                distributionDate: updateData.distributionDate,
                expiryDate: formData.expiryDate,
                barangay: formData.barangay,
                selectedBarangays: formData.selectedBarangays,
                quarter: formData.quarter,
                quarterly: formData.quarterly,
                status: formData.status
              }
            : benefit
        );
        setBenefits(updatedBenefits);
        // Save to localStorage for BenefitTracking to access
        localStorage.setItem('benefits', JSON.stringify(updatedBenefits));
        toastService.success('Benefit program updated successfully!');
      } catch (error) {
        console.error('Error updating benefit:', error);
        toastService.error('Failed to update benefit program: ' + (error.message || 'Unknown error'));
      }
    } else {
      // Create new benefit directly in database
      try {
        // Check if there are eligible members and generate PDF first
        if (eligibleMembers.length > 0) {
          const confirmGeneratePDF = await toastService.confirmAsync(
            'Generate PDF for Eligible Members',
            `This benefit program has ${eligibleMembers.length} eligible members. A PDF with the eligible members list and signature spaces will be generated. You must print this PDF and get signatures from the Head of PDAO Office, Barangay President, and Mayor before the program can be approved. Do you want to continue?`
          );
          
          if (!confirmGeneratePDF) {
            return; // User cancelled, don't proceed with submission
          }
          
          // Generate PDF automatically
          await generateEligibleMembersPDF();
        }
        
        // Format distribution date to include time (12:00 AM)
        let formattedDistributionDate = formData.distributionDate;
        if (formData.distributionDate) {
          const dateObj = new Date(formData.distributionDate);
          dateObj.setHours(0, 0, 0, 0); // Set to 12:00 AM
          formattedDistributionDate = dateObj.toISOString();
        }
        
        // Format expiry date
        let formattedExpiryDate = formData.expiryDate;
        if (formData.expiryDate) {
          const dateObj = new Date(formData.expiryDate);
          dateObj.setHours(23, 59, 59, 999); // Set to end of day
          formattedExpiryDate = dateObj.toISOString();
        }
        
        // Create benefit data with Pending Approval status
        const benefitData = {
          ...formData,
          type: formData.type,
          amount: formData.amount,
          description: formData.description,
          targetRecipients: formData.targetRecipients,
          distributionDate: formattedDistributionDate,
          expiryDate: formattedExpiryDate,
          barangay: formData.barangay,
          selectedBarangays: formData.selectedBarangays,
          quarter: formData.quarter,
          birthdayMonth: formData.birthdayMonth,
          status: 'Pending Approval', // Set to Pending Approval initially
          distributed: 0,
          pending: 0,
          color: getColorForType(formData.type),
          submittedDate: new Date().toISOString()
        };
        
        // Create benefit in database
        console.log('Creating benefit in database:', benefitData);
        const savedBenefitResponse = await benefitService.create(benefitData);
        console.log('Benefit created successfully:', savedBenefitResponse);
        
        const savedBenefit = savedBenefitResponse.data || savedBenefitResponse;
        
        // Also add to pending schedules for backward compatibility
        const newPendingSchedule = {
          id: savedBenefit.id || (pendingSchedules.length > 0 ? Math.max(...pendingSchedules.map(p => p.id), 0) + 1 : 1),
          name: formData.type,
          ...benefitData
        };
        const updatedPendingSchedules = [...pendingSchedules, newPendingSchedule];
        setPendingSchedules(updatedPendingSchedules);
        localStorage.setItem('pendingSchedules', JSON.stringify(updatedPendingSchedules));
        
        // Refresh benefits list immediately to show the new benefit
        try {
          const refreshedBenefits = await benefitService.getAll(null, 'all');
          const benefitsArray = Array.isArray(refreshedBenefits) ? refreshedBenefits : 
                               (refreshedBenefits?.data || []);
          
          // Parse and normalize benefits
          const parsedBenefits = benefitsArray.map(benefit => {
            if (benefit.selectedBarangays && typeof benefit.selectedBarangays === 'string') {
              try {
                benefit.selectedBarangays = JSON.parse(benefit.selectedBarangays);
              } catch (e) {
                benefit.selectedBarangays = [];
              }
            }
            if (!Array.isArray(benefit.selectedBarangays)) {
              benefit.selectedBarangays = [];
            }
            if (benefit.amount && typeof benefit.amount === 'number') {
              benefit.amount = `₱${benefit.amount.toLocaleString('en-US')}`;
            }
            if (!benefit.status) {
              benefit.status = 'Active';
            }
            benefit.distributed = benefit.distributed || 0;
            benefit.pending = benefit.pending || 0;
            return benefit;
          });
          
          // Use applyBenefitsState to ensure deduplication and proper sorting
          // This will update the benefits list, but 'Pending Approval' benefits won't show in Available Benefits Programs
          const sortedBenefits = applyBenefitsState(parsedBenefits, true);
          
          console.log('Refreshed benefits after creation:', sortedBenefits.length, 'benefits');
          
          // Update pending schedules to include the new 'Pending Approval' benefit
          const pendingApprovalBenefits = parsedBenefits.filter(b => b.status === 'Pending Approval');
          if (pendingApprovalBenefits.length > 0) {
            const normalizedPending = pendingApprovalBenefits.map(b => {
              if (b.selectedBarangays && typeof b.selectedBarangays === 'string') {
                try {
                  b.selectedBarangays = JSON.parse(b.selectedBarangays);
                } catch (e) {
                  b.selectedBarangays = [];
                }
              }
              if (!Array.isArray(b.selectedBarangays)) {
                b.selectedBarangays = [];
              }
              if (b.amount && typeof b.amount === 'number') {
                b.amount = `₱${b.amount.toLocaleString('en-US')}`;
              }
              return b;
            });
            
            // Merge with existing pending schedules
            setPendingSchedules(prev => {
              const existingIds = new Set(prev.map(p => p.id || p.benefitID));
              const newPending = normalizedPending.filter(b => !existingIds.has(b.id || b.benefitID));
              const merged = [...prev, ...newPending];
              const sorted = merged.sort((a, b) => {
                const dateA = new Date(a.submittedDate || a.created_at || 0);
                const dateB = new Date(b.submittedDate || b.created_at || 0);
                return dateB - dateA;
              });
              localStorage.setItem('pendingSchedules', JSON.stringify(sorted));
              return sorted;
            });
          }
          
          // Switch to Pending Schedules tab to show the new benefit
          setActiveTab(1);
        } catch (refreshError) {
          console.error('Error refreshing benefits after creation:', refreshError);
          // Fallback: add to local state if refresh fails, but use deduplication
          const newBenefit = {
            ...benefitData,
            id: savedBenefit.id || (benefits.length > 0 ? Math.max(...benefits.map(b => b.id || b.benefitID || 0), 0) + 1 : 1)
          };
          const updatedBenefits = [...benefits, newBenefit];
          // Use applyBenefitsState to ensure no duplicates
          const dedupedBenefits = applyBenefitsState(updatedBenefits, true);
        }
        
        if (eligibleMembers.length > 0) {
          toastService.success('Benefit program created successfully! Please print the generated PDF and get the required signatures before the program can be approved.');
        } else {
          toastService.success('Benefit program created successfully! It is now pending approval and will appear in the Pending Schedules tab.');
        }
      } catch (error) {
        console.error('Error creating benefit:', error);
        toastService.error('Failed to create benefit program: ' + (error.message || 'Unknown error'));
      }
    }
    handleCloseDialog();
  };

  // Create announcement for approved benefit
  const createBenefitAnnouncement = async (benefit) => {
    try {
      // Format dates for announcement
      const distributionDate = benefit.distributionDate 
        ? new Date(benefit.distributionDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      // Use expiry date if available, otherwise set to 1 year from distribution date
      let expiryDate = benefit.expiryDate 
        ? new Date(benefit.expiryDate).toISOString().split('T')[0]
        : null;
      
      if (!expiryDate) {
        const oneYearLater = new Date(distributionDate);
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        expiryDate = oneYearLater.toISOString().split('T')[0];
      }

      // Build announcement content
      let announcementContent = `${benefit.description || 'A new benefit program is now available for claiming.'}\n\n`;
      announcementContent += `Benefit Type: ${benefit.type}\n`;
      announcementContent += `Amount: ${benefit.amount}\n\n`;
      
      // Add eligibility criteria
      if (benefit.type === 'Financial Assistance' && benefit.selectedBarangays && benefit.selectedBarangays.length > 0) {
        announcementContent += `Eligibility: This benefit is available for PWD members from the following barangays: ${benefit.selectedBarangays.join(', ')}.\n\n`;
      } else if (benefit.type === 'Birthday Cash Gift' && benefit.birthdayMonth) {
        const quarterName = getQuarterName(benefit.birthdayMonth);
        announcementContent += `Eligibility: This benefit is available for PWD members with birthdays in ${quarterName}.\n`;
        if (benefit.selectedBarangays && benefit.selectedBarangays.length > 0) {
          announcementContent += `Additionally, members must be from the following barangays: ${benefit.selectedBarangays.join(', ')}.\n\n`;
        } else {
          announcementContent += '\n';
        }
      } else if (benefit.barangay && benefit.barangay !== 'All Barangays') {
        announcementContent += `Eligibility: This benefit is available for PWD members from ${benefit.barangay}.\n\n`;
      } else {
        announcementContent += `Eligibility: This benefit is available for all eligible PWD members.\n\n`;
      }

      announcementContent += `Available for claiming from ${formatDateMMDDYYYY(distributionDate)} to ${expiryDate ? formatDateMMDDYYYY(expiryDate) : 'until further notice'}.\n\n`;
      announcementContent += `Please visit the PDAO office or use the QR code scanning feature to claim your benefit.`;

      // Determine target audience and create announcements
      const announcementsToCreate = [];

      if (benefit.type === 'Financial Assistance' && benefit.selectedBarangays && benefit.selectedBarangays.length > 0) {
        // Create one announcement per barangay for Financial Assistance
        for (const barangay of benefit.selectedBarangays) {
          announcementsToCreate.push({
            title: `New Benefit Available: ${benefit.type}`,
            content: announcementContent,
            type: 'Event',
            priority: 'High',
            targetAudience: barangay, // Target specific barangay
            status: 'Active',
            publishDate: distributionDate,
            expiryDate: expiryDate
          });
        }
      } else if (benefit.type === 'Birthday Cash Gift') {
        // For Birthday Cash Gift, use "PWD Members" as target audience
        // The eligibility criteria (quarter) is included in the content
        announcementsToCreate.push({
          title: `New Benefit Available: ${benefit.type}`,
          content: announcementContent,
          type: 'Event',
          priority: 'High',
          targetAudience: 'PWD Members', // All PWD members (eligibility in content)
          status: 'Active',
          publishDate: distributionDate,
          expiryDate: expiryDate || distributionDate
        });
      } else if (benefit.barangay && benefit.barangay !== 'All Barangays') {
        // Single barangay benefit
        announcementsToCreate.push({
          title: `New Benefit Available: ${benefit.type}`,
          content: announcementContent,
          type: 'Event',
          priority: 'High',
          targetAudience: benefit.barangay,
          status: 'Active',
          publishDate: distributionDate,
          expiryDate: expiryDate || distributionDate
        });
      } else {
        // All PWD members
        announcementsToCreate.push({
          title: `New Benefit Available: ${benefit.type}`,
          content: announcementContent,
          type: 'Event',
          priority: 'High',
          targetAudience: 'PWD Members',
          status: 'Active',
          publishDate: distributionDate,
          expiryDate: expiryDate || distributionDate
        });
      }

      // Create all announcements
      for (const announcementData of announcementsToCreate) {
        try {
          await announcementService.create(announcementData);
          console.log('Announcement created successfully:', announcementData.title);
        } catch (announcementError) {
          console.error('Error creating announcement:', announcementError);
          // Continue creating other announcements even if one fails
        }
      }

      return announcementsToCreate.length;
    } catch (error) {
      console.error('Error creating benefit announcement:', error);
      throw error;
    }
  };

  const handleApproveSchedule = async () => {
    if (!approvalFile) {
      toastService.warning('Please upload the signed letter of approval from the mayor first.');
      return;
    }

    if (selectedPendingSchedule) {
      try {
        console.log('Starting approval process...');
        setApprovingSchedule(true);
        console.log('Loading state set to true');
        
        // Create the approved benefit in the database
        const approvedBenefitData = {
          ...selectedPendingSchedule,
          status: 'Active',
          approvalFile: approvalFile.name,
          approvedDate: new Date().toISOString()
        };

        console.log('Creating benefit in database...');
        // Save to database
        const savedBenefitResponse = await benefitService.create(approvedBenefitData);
        console.log('Benefit created successfully:', savedBenefitResponse);
        
        const savedBenefit = savedBenefitResponse.data || savedBenefitResponse;
        
        // Ensure status is set to Active if not provided
        if (!savedBenefit.status) {
          savedBenefit.status = 'Active';
        }
        
        // Normalize the benefit data to match expected structure
        const normalizedBenefit = {
          ...savedBenefit,
          ...approvedBenefitData, // Merge approved data to ensure all fields are present
          id: savedBenefit.id || savedBenefit.benefitID,
          status: 'Active', // Force status to Active for approved benefits
          // Ensure selectedBarangays is an array
          selectedBarangays: Array.isArray(savedBenefit.selectedBarangays) 
            ? savedBenefit.selectedBarangays 
            : (Array.isArray(approvedBenefitData.selectedBarangays)
                ? approvedBenefitData.selectedBarangays
                : (savedBenefit.selectedBarangays ? JSON.parse(savedBenefit.selectedBarangays) : [])),
          // Ensure dates are properly formatted
          distributionDate: savedBenefit.distributionDate || approvedBenefitData.distributionDate,
          expiryDate: savedBenefit.expiryDate || approvedBenefitData.expiryDate,
          // Ensure amount is formatted
          amount: savedBenefit.amount || approvedBenefitData.amount,
          // Ensure distributed and pending are numbers
          distributed: savedBenefit.distributed || 0,
          pending: savedBenefit.pending || 0,
          // Ensure title and type are present
          title: savedBenefit.title || approvedBenefitData.title,
          type: savedBenefit.type || approvedBenefitData.type
        };
        
        console.log('Normalized benefit for approval:', normalizedBenefit);
        console.log('Normalized benefit status:', normalizedBenefit.status);
        
        // Immediately add to local state so it appears right away
        console.log('Adding benefit to local state immediately');
        setBenefits(prevBenefits => {
          // Check if benefit already exists to avoid duplicates
          const exists = prevBenefits.some(b => 
            (b.id === normalizedBenefit.id || b.id === normalizedBenefit.benefitID) ||
            (b.title === normalizedBenefit.title && b.type === normalizedBenefit.type)
          );
          if (exists) {
            console.log('Benefit already exists in state, updating instead');
            return prevBenefits.map(b => 
              (b.id === normalizedBenefit.id || b.id === normalizedBenefit.benefitID) ||
              (b.title === normalizedBenefit.title && b.type === normalizedBenefit.type)
                ? normalizedBenefit
                : b
            );
          }
          const updated = [...prevBenefits, normalizedBenefit];
          const deduped = dedupeBenefits(updated);
          const sorted = sortBenefits(deduped);
          console.log('Added benefit to state, total count:', sorted.length);
          console.log('Active benefits count:', sorted.filter(b => b.status === 'Active').length);
          return sorted;
        });
        
        // Invalidate cache immediately before refreshing
        cacheService.invalidate('/benefits');
        cacheService.invalidate('/benefits-simple');
        
        // Add a small delay to ensure database transaction is committed
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh benefits list to show the new benefit
        // Retry logic to handle potential timing issues
        let refreshAttempts = 0;
        const maxRefreshAttempts = 5;
        let refreshSuccess = false;
        
        while (refreshAttempts < maxRefreshAttempts && !refreshSuccess) {
          try {
            console.log(`Refreshing benefits (attempt ${refreshAttempts + 1}/${maxRefreshAttempts})...`);
            // Skip cache to ensure we get fresh data from the server
            const refreshedBenefits = await benefitService.getAll(null, 'all', true);
            const benefitsArray = Array.isArray(refreshedBenefits) ? refreshedBenefits : 
                                 (refreshedBenefits?.data || []);
            
            console.log('Refreshed benefits count:', benefitsArray.length);
            console.log('Looking for benefit with ID:', savedBenefit.id || savedBenefit.benefitID);
            console.log('Looking for benefit with title:', savedBenefit.title);
            console.log('Normalized benefit status:', normalizedBenefit.status);
            
            // Normalize all benefits to ensure status is correct
            const normalizedBenefitsArray = benefitsArray.map(b => {
              // Parse selectedBarangays if it's a JSON string
              if (b.selectedBarangays && typeof b.selectedBarangays === 'string') {
                try {
                  b.selectedBarangays = JSON.parse(b.selectedBarangays);
                } catch (e) {
                  b.selectedBarangays = [];
                }
              }
              if (!Array.isArray(b.selectedBarangays)) {
                b.selectedBarangays = [];
              }
              // Ensure status is set
              if (!b.status) {
                b.status = 'Active';
              }
              // Ensure distributed and pending are numbers
              b.distributed = b.distributed || 0;
              b.pending = b.pending || 0;
              return b;
            });
            
            // Check if the new benefit is in the refreshed list
            const newBenefitFound = normalizedBenefitsArray.some(b => {
              const idMatch = (b.id === savedBenefit.id || b.id === savedBenefit.benefitID);
              const titleMatch = (b.title === savedBenefit.title && b.type === savedBenefit.type);
              if (idMatch || titleMatch) {
                console.log('Found matching benefit:', b);
                console.log('Found benefit status:', b.status);
              }
              return idMatch || titleMatch;
            });
            
            // Count Active benefits
            const activeCount = normalizedBenefitsArray.filter(b => b.status === 'Active').length;
            console.log('Active benefits count:', activeCount);
            
            if (newBenefitFound || refreshAttempts === maxRefreshAttempts - 1) {
              applyBenefitsState(normalizedBenefitsArray);
              refreshSuccess = true;
              console.log('Benefits refreshed successfully, new benefit found:', newBenefitFound);
              console.log('Total benefits after refresh:', normalizedBenefitsArray.length);
              console.log('Active benefits after refresh:', normalizedBenefitsArray.filter(b => b.status === 'Active').length);
              if (!newBenefitFound) {
                console.warn('New benefit not found in refreshed list, but applying state anyway');
                // Add the normalized benefit to the array if not found
                const finalArray = [...normalizedBenefitsArray, normalizedBenefit];
                applyBenefitsState(finalArray);
              }
            } else {
              refreshAttempts++;
              // Wait a bit longer before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (refreshError) {
            console.error(`Error refreshing benefits (attempt ${refreshAttempts + 1}):`, refreshError);
            refreshAttempts++;
            if (refreshAttempts < maxRefreshAttempts) {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              // Final fallback: add to local state if all refresh attempts fail
              console.warn('All refresh attempts failed, adding benefit to local state');
              setBenefits(prevBenefits => {
                const updated = [...prevBenefits, normalizedBenefit];
                applyBenefitsState(updated, false); // Don't persist in this fallback
                return updated;
              });
            }
          }
        }
        
        // Jump to Active tab so user sees it immediately
        setActiveTab(0);

        // Remove from pending schedules
        const updatedPendingSchedules = pendingSchedules.filter(p => p.id !== selectedPendingSchedule.id);
        setPendingSchedules(updatedPendingSchedules);
        localStorage.setItem('pendingSchedules', JSON.stringify(updatedPendingSchedules));

        // Check if draft announcement was created by backend
        const draftAnnouncementCreated = savedBenefitResponse.draft_announcement_created || false;
        
        // Close dialogs and reset
        setOpenApprovalDialog(false);
        setSelectedPendingSchedule(null);
        setApprovalFile(null);
        
        toastService.success('Benefit program approved and saved to database successfully!');
        
        // Show popup if draft announcement was created
        if (draftAnnouncementCreated) {
          setShowDraftAnnouncementPopup(true);
        }
        
        console.log('Approval process completed successfully');
      } catch (error) {
        console.error('Error approving schedule:', error);
        toastService.error('Failed to approve benefit program: ' + (error.message || 'Unknown error'));
      } finally {
        console.log('Resetting loading state');
        setApprovingSchedule(false);
      }
    } else {
      console.warn('No selectedPendingSchedule found');
    }
  };

  // Maximum file size: 2MB
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setApprovalFile(null);
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toastService.error(`File size (${fileSizeMB}MB) exceeds the maximum limit of 2MB. Please select a smaller file.`);
      setApprovalFile(null);
      return;
    }

    // Check if it's an image or PDF
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.type)) {
      setApprovalFile(file);
    } else {
      toastService.warning('Please upload only image files (JPG, PNG) or PDF files.');
      setApprovalFile(null);
    }
  };

  const generateEligibleMembersPDF = async () => {
    if (eligibleMembers.length === 0) {
      toastService.warning('No eligible members to generate PDF for.');
      return;
    }

    try {
      setGeneratingPDF(true);
      
      // Debug: Log the eligible members being used for PDF
      console.log('Generating PDF for eligible members:', eligibleMembers);
      console.log('Number of eligible members:', eligibleMembers.length);
      
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF('portrait', 'mm', 'a4');
      
      // Add header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('CABUYAO PDAO RMS', 20, 20);
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Eligible Members List for Benefit Program', 20, 30);
      
      // Add benefit program details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Program: ${formData.type}`, 20, 45);
      doc.text(`Type: ${formData.type}`, 20, 52);
      doc.text(`Amount: ${formData.amount}`, 20, 59);
      if ((formData.type === 'Financial Assistance' || formData.type === 'Birthday Cash Gift') && formData.selectedBarangays.length > 0) {
        doc.text(`Barangays: ${formData.selectedBarangays.join(', ')}`, 20, 66);
      } else {
        doc.text(`Barangay: ${formData.barangay || 'All Barangays'}`, 20, 66);
      }
      
      if (formData.type === 'Birthday Cash Gift' && formData.birthdayMonth) {
        doc.text(`Birthday Quarter: ${getQuarterName(formData.birthdayMonth)}`, 20, 73);
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${formatDateMMDDYYYY(new Date().toISOString())}`, 20, 85);
      doc.text(`Total Eligible Members: ${eligibleMembers.length}`, 20, 92);
      
       // Prepare table data - ensure we're using the current eligibleMembers
       const tableData = eligibleMembers.map((member, index) => [
         index + 1,
         member.pwd_id || (member.userID ? `PWD-${member.userID}` : 'Not assigned'),
         (() => {
           const parts = [];
           if (member.firstName) parts.push(member.firstName);
           if (member.middleName && member.middleName.trim().toUpperCase() !== 'N/A') parts.push(member.middleName);
           if (member.lastName) parts.push(member.lastName);
           return parts.join(' ').trim() || 'Name not provided';
         })(),
         getMonthName(new Date(member.birthDate).getMonth() + 1),
         getAge(member.birthDate),
         member.barangay || 'Not specified',
         member.disabilityType || 'Not specified'
       ]);
       
       // Debug: Log the table data being generated
       console.log('Table data for PDF:', tableData);
       
       // Add table
       autoTable(doc, {
         startY: 100,
         head: [['#', 'PWD ID', 'Full Name', 'Birth Month', 'Age', 'Barangay', 'Disability Type']],
         body: tableData,
         theme: 'grid',
         headStyles: {
           fillColor: [39, 174, 96], // Green color
           textColor: 255,
           fontStyle: 'bold',
           fontSize: 10
         },
         bodyStyles: {
           fontSize: 9,
           textColor: [44, 62, 80]
         },
         alternateRowStyles: {
           fillColor: [248, 250, 252]
         },
         margin: { left: 20, right: 20 },
         styles: {
           cellPadding: 3,
           lineColor: [224, 224, 224],
           lineWidth: 0.5
         }
       });
      
      // Add signature section
      const finalY = doc.lastAutoTable.finalY + 20;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNATURES REQUIRED', 20, finalY);
      
      // Add signature lines
      const signatureY = finalY + 20;
      const signatureWidth = 50;
      const signatureSpacing = 60;
      
      // Head of PDAO Office
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Head of PDAO Office', 20, signatureY);
      doc.line(20, signatureY + 2, 20 + signatureWidth, signatureY + 2);
      doc.setFont('helvetica', 'normal');
      doc.text('Signature over Printed Name', 20, signatureY + 8);
      doc.text('Date: _______________', 20, signatureY + 15);
      
      // Barangay President
      doc.setFont('helvetica', 'bold');
      doc.text('Barangay President', 20 + signatureSpacing, signatureY);
      doc.line(20 + signatureSpacing, signatureY + 2, 20 + signatureSpacing + signatureWidth, signatureY + 2);
      doc.setFont('helvetica', 'normal');
      doc.text('Signature over Printed Name', 20 + signatureSpacing, signatureY + 8);
      doc.text('Date: _______________', 20 + signatureSpacing, signatureY + 15);
      
      // Mayor
      doc.setFont('helvetica', 'bold');
      doc.text('Mayor', 20 + (signatureSpacing * 2), signatureY);
      doc.line(20 + (signatureSpacing * 2), signatureY + 2, 20 + (signatureSpacing * 2) + signatureWidth, signatureY + 2);
      doc.setFont('helvetica', 'normal');
      doc.text('Signature over Printed Name', 20 + (signatureSpacing * 2), signatureY + 8);
      doc.text('Date: _______________', 20 + (signatureSpacing * 2), signatureY + 15);
      
      // Add footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('This document must be signed by all three officials before the benefit program can be approved.', 20, signatureY + 35);
      
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
          `PDF generated successfully with ${eligibleMembers.length} eligible members!\n\nThe PDF is now open in a new tab for preview.\n\nClick OK to download the PDF, or Cancel to keep it open for preview only.\n\nRemember: You must print this PDF and get signatures from the Head of PDAO Office, Barangay President, and Mayor before the program can be approved.`
        );
        
        if (userChoice) {
          // User wants to download
          const fileName = `Eligible_Members_${formData.type.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
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
        const fileName = `Eligible_Members_${formData.type.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toastService.error('Failed to generate PDF: ' + (error.message || 'Unknown error'));
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getColorForType = (type) => {
    const colorMap = {
      'Financial Assistance': '#27AE60',
      'Birthday Cash Gift': '#E67E22'
    };
    return colorMap[type] || '#95A5A6';
  };

  const handlePrintBenefit = (benefit) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Benefit Program - ${benefit.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2C3E50;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2C3E50;
              margin: 0;
              font-size: 24px;
            }
            .header h2 {
              color: #7F8C8D;
              margin: 5px 0 0 0;
              font-size: 16px;
              font-weight: normal;
            }
            .benefit-info {
              background: #F8F9FA;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .info-row {
              display: flex;
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              width: 150px;
              color: #2C3E50;
            }
            .info-value {
              flex: 1;
              color: #555;
            }
            .description {
              background: #FFFFFF;
              padding: 15px;
              border-left: 4px solid ${benefit.color};
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #7F8C8D;
              border-top: 1px solid #E0E0E0;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PWD Benefits Program</h1>
            <h2>City of Cabuyao - Persons with Disability Affairs Office</h2>
          </div>
          
          <div class="benefit-info">
            <div class="info-row">
              <div class="info-label">Program Name:</div>
              <div class="info-value">${benefit.name || benefit.type}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Type:</div>
              <div class="info-value">${benefit.type}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Amount:</div>
              <div class="info-value">${benefit.amount}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Target Recipients:</div>
              <div class="info-value">${benefit.targetRecipients}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Barangay:</div>
              <div class="info-value">${benefit.barangay || 'All Barangays'}</div>
            </div>
            ${benefit.type === 'Financial Assistance' ? `
            <div class="info-row">
              <div class="info-label">Barangays:</div>
              <div class="info-value">${benefit.selectedBarangays && benefit.selectedBarangays.length > 0 ? benefit.selectedBarangays.join(', ') : 'All Barangays'}</div>
            </div>
            ` : ''}
            ${benefit.type === 'Birthday Cash Gift' ? `
            <div class="info-row">
              <div class="info-label">Birthday Month Quarter:</div>
              <div class="info-value">${benefit.birthdayMonth ? getQuarterName(benefit.birthdayMonth) : 'All Quarters'}</div>
            </div>
            ` : ''}
            ${benefit.expiryDate ? `
            <div class="info-row">
              <div class="info-label">Expiry Date:</div>
              <div class="info-value">${formatDateMMDDYYYY(benefit.expiryDate)}</div>
            </div>
            ` : ''}
            <div class="info-row">
              <div class="info-label">Status:</div>
              <div class="info-value">${benefit.status}</div>
            </div>
            ${benefit.distributionDate ? `
            <div class="info-row">
              <div class="info-label">Distribution Date:</div>
              <div class="info-value">${formatDateMMDDYYYY(benefit.distributionDate)}</div>
            </div>
            ` : ''}
            ${benefit.birthdayMonth ? `
            <div class="info-row">
              <div class="info-label">Birthday Quarter:</div>
              <div class="info-value">${benefit.birthdayMonth}</div>
            </div>
            ` : ''}
          </div>
          
          <div class="description">
            <strong>Description:</strong><br>
            ${benefit.description}
          </div>
          
          <div class="footer">
            <p>Generated on ${formatDateMMDDYYYY(new Date().toISOString())} at ${new Date().toLocaleTimeString()}</p>
            <p>City of Cabuyao - Persons with Disability Affairs Office</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getStatusColor = (status) => {
    return status === 'Distributed' ? 'success' : status === 'Pending' ? 'warning' : 'error';
  };

  const getStatusIcon = (status) => {
    return status === 'Distributed' ? <CheckCircle /> : status === 'Pending' ? <Schedule /> : <Warning />;
  };

  // Fetch and filter eligible members based on benefit type, month/quarter, and barangay
  const fetchEligibleMembers = async (benefitType, monthOrQuarter, barangayOrBarangays) => {
    if (!benefitType) {
      setEligibleMembers([]);
      return;
    }

    try {
      setLoadingEligibleMembers(true);
      const response = await pwdMemberService.getAll();
      
      // Handle different response structures from the updated service
      const candidates = [
        response?.data?.members,
        response?.members,
        response?.data,
        response
      ];
      const members = candidates.find((v) => Array.isArray(v)) || [];
      
      // Debug: Log the raw data fetched
      console.log('Raw members data fetched:', members);
      console.log('Number of raw members:', members.length);
      console.log('Response structure:', response);
      
      let filteredMembers = [];

      if (benefitType === 'Financial Assistance') {
        // For Financial Assistance, filter by selected barangays (all members from those barangays)
        if (Array.isArray(barangayOrBarangays) && barangayOrBarangays.length > 0) {
          console.log('Filtering Financial Assistance by barangays:', barangayOrBarangays);
          filteredMembers = members.filter(member => {
            // Handle different field names for barangay
            const memberBarangay = (member.barangay || member.Barangay || '').toString().trim().toLowerCase();
            const isIncluded = barangayOrBarangays.some(b => 
              (b || '').toString().trim().toLowerCase() === memberBarangay
            );
            console.log(`Member ${member.firstName} ${member.lastName} from "${member.barangay || member.Barangay}": ${isIncluded ? 'INCLUDED' : 'EXCLUDED'}`);
            return isIncluded;
          });
        } else {
          filteredMembers = members; // Show all members if no specific barangays selected
        }
      } else if (benefitType === 'Birthday Cash Gift') {
        // Filter by quarter
        const quarterMonths = {
          'Q1': [1, 2, 3], // January, February, March
          'Q2': [4, 5, 6], // April, May, June
          'Q3': [7, 8, 9], // July, August, September
          'Q4': [10, 11, 12] // October, November, December
        };
        
        const eligibleMonths = quarterMonths[monthOrQuarter] || [];
        
        filteredMembers = members.filter(member => {
          if (!member.birthDate) return false;
          const birthMonth = new Date(member.birthDate).getMonth() + 1;
          const quarterMatch = eligibleMonths.includes(birthMonth);

          // Support multiple barangays for Birthday Cash Gift as well
          if (Array.isArray(barangayOrBarangays) && barangayOrBarangays.length > 0) {
            const memberBarangay = (member.barangay || member.Barangay || '').toString().trim().toLowerCase();
            const inSelected = barangayOrBarangays.some(b => (b || '').toString().trim().toLowerCase() === memberBarangay);
            return quarterMatch && inSelected;
          }

          return quarterMatch;
        });
      }

      // Debug: Log the filtered results
      console.log('Filtered members for', benefitType, ':', filteredMembers);
      console.log('Number of filtered members:', filteredMembers.length);

      setEligibleMembers(filteredMembers);
    } catch (error) {
      console.error('Error fetching eligible members:', error);
      setEligibleMembers([]);
    } finally {
      setLoadingEligibleMembers(false);
    }
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

  // Get age from birth date
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'white' }}>
      {currentUser?.role === 'Staff2' ? <Staff2Sidebar /> : <AdminSidebar />}
      
      <Box sx={{ 
        flex: 1, 
        ml: '280px', 
        width: 'calc(100% - 280px)', 
        p: 3, 
        bgcolor: 'white'
      }}>

        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: '1px solid #E0E0E0', bgcolor: '#FFFFFF' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 700, 
              color: '#2C3E50',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
            }}>
              Ayuda & Benefits Management
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: '#2C3E50',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  position: 'relative',
                  '&.Mui-selected': {
                    color: '#27AE60',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '12px',
                      right: '12px',
                      height: '3px',
                      backgroundColor: '#27AE60'
                    }
                  }
                },
                '& .MuiTabs-indicator': {
                  display: 'none'
                }
              }}
            >
              <Tab 
                label={`Active Benefits (${benefits.filter(b => b.status === 'Active').length})`} 
                icon={<VolunteerActivism />}
                iconPosition="start"
              />
              <Tab 
                label={`Pending Schedules (${pendingSchedules.length})`} 
                icon={<PendingActions />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {activeTab === 0 ? (
            /* Active Benefits Tab */
            <>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ 
                border: '1px solid #E0E0E0', 
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                '&:hover': { 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography 
                    sx={{ 
                      fontSize: 40, 
                      color: '#27AE60', 
                      mb: 1, 
                      fontWeight: 700,
                      fontFamily: 'Arial, sans-serif'
                    }}
                  >
                    ₱
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                    ₱{benefits.reduce((sum, benefit) => {
                      const amount = benefit.amount ? benefit.amount.replace(/[₱,]/g, '') : '0';
                      return sum + (parseInt(amount) || 0);
                    }, 0).toLocaleString('en-US')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500 }}>
                    Total Distributed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ 
                border: '1px solid #E0E0E0', 
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                '&:hover': { 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <People sx={{ fontSize: 40, color: '#3498DB', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                    {benefits.reduce((sum, benefit) => sum + (benefit.distributed || 0), 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500 }}>
                    Total Recipients
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ 
                border: '1px solid #E0E0E0', 
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                '&:hover': { 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <LocalShipping sx={{ fontSize: 40, color: '#F39C12', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                    {benefits.reduce((sum, benefit) => sum + (benefit.pending || 0), 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500 }}>
                    Pending Distribution
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ 
                border: '1px solid #E0E0E0', 
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                '&:hover': { 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <VolunteerActivism sx={{ fontSize: 40, color: '#9B59B6', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                    {benefits.filter(benefit => benefit.status === 'Active').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500 }}>
                    Active Programs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Benefits Table */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '1.2rem' }}>
              Available Benefits Programs
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ 
                bgcolor: '#27AE60', 
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': { bgcolor: '#229954' } 
              }}
            >
              Add Benefit
            </Button>
          </Box>
          {benefits.filter(benefit => benefit.status === 'Active' || benefit.status === 'Pending Approval').length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6, 
              bgcolor: '#F8F9FA', 
              borderRadius: 2, 
              border: '2px dashed #E0E0E0' 
            }}>
              <VolunteerActivism sx={{ fontSize: 60, color: '#BDC3C7', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#7F8C8D', mb: 1, fontWeight: 600 }}>
                No Benefits Programs Available
              </Typography>
              <Typography variant="body2" sx={{ color: '#95A5A6', mb: 3 }}>
                Start by adding your first benefit program to help PWD members
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ 
                  bgcolor: '#27AE60', 
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#229954' } 
                }}
              >
                Add First Benefit Program
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E0E0E0', borderRadius: 2, mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Barangays</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Distribution Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Distributed</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Pending</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {benefits
                    .filter(benefit => benefit.status === 'Active') // Only show Active benefits in Available Benefits Programs
                    .map((benefit) => (
                    <TableRow 
                      key={benefit.id}
                      sx={{ 
                        '&:hover': { bgcolor: '#F8F9FA' },
                        '&:last-child td': { borderBottom: 0 }
                      }}
                    >
                      <TableCell>
                        <Chip 
                          label={benefit.type} 
                          size="small" 
                          sx={{ 
                            bgcolor: `${benefit.color || '#3498DB'}15`, 
                            color: benefit.color || '#3498DB',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>
                        {benefit.title || benefit.benefitType || benefit.type}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#2C3E50' }}>
                        {benefit.amount || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {benefit.type === 'Financial Assistance' 
                          ? (benefit.selectedBarangays && benefit.selectedBarangays.length > 0 
                              ? benefit.selectedBarangays.join(', ') 
                              : 'All Barangays')
                          : (benefit.barangay || 'All Barangays')
                        }
                      </TableCell>
                      <TableCell>
                        {benefit.distributionDate 
                          ? formatDateMMDDYYYY(benefit.distributionDate) 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#27AE60', fontWeight: 600 }}>
                          {benefit.distributed || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#F39C12', fontWeight: 600 }}>
                          {benefit.pending || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <RadioGroup
                          row
                          value={benefit.status || 'Active'}
                          onChange={(e) => handleStatusChange(benefit.id, e.target.value)}
                          sx={{ gap: 1 }}
                        >
                          <FormControlLabel
                            value="Active"
                            control={
                              <Radio 
                                size="small" 
                                sx={{ 
                                  color: '#27AE60',
                                  '&.Mui-checked': { color: '#27AE60' }
                                }} 
                              />
                            }
                            label={
                              <Typography variant="caption" sx={{ 
                                color: benefit.status === 'Active' ? '#27AE60' : '#2C3E50',
                                fontWeight: benefit.status === 'Active' ? 600 : 400
                              }}>
                                Active
                              </Typography>
                            }
                          />
                          <FormControlLabel
                            value="Inactive"
                            control={
                              <Radio 
                                size="small" 
                                sx={{ 
                                  color: '#E74C3C',
                                  '&.Mui-checked': { color: '#E74C3C' }
                                }} 
                              />
                            }
                            label={
                              <Typography variant="caption" sx={{ 
                                color: benefit.status === 'Inactive' ? '#E74C3C' : '#2C3E50',
                                fontWeight: benefit.status === 'Inactive' ? 600 : 400
                              }}>
                                Inactive
                              </Typography>
                            }
                          />
                        </RadioGroup>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {benefit.status !== 'Active' && (
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDialog(benefit)}
                              sx={{ color: '#2C3E50', '&:hover': { bgcolor: 'rgba(44, 62, 80, 0.1)' } }}
                              title="Edit Benefit"
                            >
                              <Edit />
                            </IconButton>
                          )}
                          {benefit.status === 'Active' && (
                            <Typography variant="caption" sx={{ color: '#7F8C8D', fontStyle: 'italic' }}>
                              Cannot edit active benefits
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Distribution History */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50', fontSize: '1.2rem' }}>
            Recent Distribution History
          </Typography>
          {distributionHistory.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4, 
              bgcolor: '#F8F9FA', 
              borderRadius: 2, 
              border: '2px dashed #E0E0E0' 
            }}>
              <LocalShipping sx={{ fontSize: 40, color: '#BDC3C7', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#7F8C8D', mb: 1, fontWeight: 600 }}>
                No Distribution History
              </Typography>
              <Typography variant="body2" sx={{ color: '#95A5A6' }}>
                Distribution records will appear here once benefits are distributed
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E0E0E0', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'white', borderBottom: '2px solid #E0E0E0' }}>
                    <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Benefit</TableCell>
                    <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Recipient</TableCell>
                    <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Amount</TableCell>
                    <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Date</TableCell>
                    <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Status</TableCell>
                    <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Barangay</TableCell>
                    <TableCell sx={{ color: '#0b87ac', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, px: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {distributionHistory.map((row, index) => (
                    <TableRow key={row.id} sx={{ bgcolor: index % 2 ? '#F7FBFF' : 'white', borderBottom: '1px solid #E0E0E0' }}>
                      <TableCell sx={{ fontWeight: 500, color: '#2C3E50', fontSize: '0.8rem', py: 2, px: 2 }}>{row.benefitName}</TableCell>
                      <TableCell sx={{ color: '#0b87ac', fontWeight: 500, fontSize: '0.8rem', py: 2, px: 2 }}>{row.recipient}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#27AE60', fontSize: '0.8rem', py: 2, px: 2 }}>{row.amount}</TableCell>
                      <TableCell sx={{ color: '#34495E', fontSize: '0.8rem', py: 2, px: 2 }}>{row.date}</TableCell>
                      <TableCell sx={{ py: 2, px: 2 }}>
                        <Chip 
                          icon={getStatusIcon(row.status)}
                          label={row.status} 
                          color={getStatusColor(row.status)} 
                          size="small" 
                          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#0b87ac', fontWeight: 500, fontSize: '0.8rem', py: 2, px: 2 }}>{row.barangay}</TableCell>
                      <TableCell sx={{ py: 2, px: 2 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            sx={{ 
                              color: '#3498DB', 
                              '&:hover': { bgcolor: '#E8F4FD' } 
                            }}
                            title="View Details"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            sx={{ 
                              color: '#E74C3C', 
                              '&:hover': { bgcolor: 'rgba(231, 76, 60, 0.1)' } 
                            }}
                            title="Delete Distribution Record"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
            </>
          ) : (
            /* Pending Schedules Tab */
            <>
              {/* Pending Schedules Summary */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ 
                    border: '1px solid #E0E0E0', 
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <PendingActions sx={{ fontSize: 40, color: '#F39C12', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                        {pendingSchedules.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500 }}>
                        Pending Approval
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ 
                    border: '1px solid #E0E0E0', 
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Schedule sx={{ fontSize: 40, color: '#3498DB', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                        {pendingSchedules.filter(p => p.type === 'Financial').length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500 }}>
                        Financial Programs
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ 
                    border: '1px solid #E0E0E0', 
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Typography 
                        sx={{ 
                          fontSize: 40, 
                          color: '#27AE60', 
                          mb: 1, 
                          fontWeight: 700,
                          fontFamily: 'Arial, sans-serif'
                        }}
                      >
                        ₱
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                        ₱{pendingSchedules.reduce((sum, p) => {
                          const amount = p.amount.replace(/[₱,]/g, '');
                          return sum + (parseInt(amount) || 0);
                        }, 0).toLocaleString('en-US')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500 }}>
                        Total Value
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card elevation={0} sx={{ 
                    border: '1px solid #E0E0E0', 
                    bgcolor: '#FFFFFF',
                    borderRadius: 2,
                    '&:hover': { 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <People sx={{ fontSize: 40, color: '#9B59B6', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
                        {pendingSchedules.filter(p => p.barangay === 'All Barangays').length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 500 }}>
                        City-wide Programs
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Pending Schedules Table */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50', fontSize: '1.2rem' }}>
                Pending Approval Schedules
              </Typography>
              {pendingSchedules.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6, 
                  bgcolor: '#F8F9FA', 
                  borderRadius: 2, 
                  border: '2px dashed #E0E0E0' 
                }}>
                  <PendingActions sx={{ fontSize: 60, color: '#BDC3C7', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#7F8C8D', mb: 1, fontWeight: 600 }}>
                    No Pending Schedules
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#95A5A6', mb: 3 }}>
                    All benefit programs have been approved or no new programs are pending
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E0E0E0', borderRadius: 2, mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Barangays</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Distribution Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Expiry Date</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Submitted</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2C3E50', fontSize: '0.95rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingSchedules.map((schedule) => (
                        <TableRow 
                          key={schedule.id}
                          sx={{ 
                            '&:hover': { bgcolor: '#F8F9FA' },
                            '&:last-child td': { borderBottom: 0 }
                          }}
                        >
                          <TableCell>
                            <Chip 
                              label={schedule.type} 
                              size="small" 
                              sx={{ 
                                bgcolor: `${schedule.color || '#3498DB'}15`, 
                                color: schedule.color || '#3498DB',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#2C3E50' }}>
                            {schedule.name || schedule.type}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#2C3E50' }}>
                            {schedule.amount || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {schedule.type === 'Financial Assistance' 
                              ? (schedule.selectedBarangays && schedule.selectedBarangays.length > 0 
                                  ? schedule.selectedBarangays.join(', ') 
                                  : 'All Barangays')
                              : (schedule.barangay || 'All Barangays')
                            }
                          </TableCell>
                          <TableCell>
                            {schedule.distributionDate 
                              ? formatDateMMDDYYYY(schedule.distributionDate) 
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {schedule.expiryDate 
                              ? formatDateMMDDYYYY(schedule.expiryDate) 
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {schedule.submittedDate 
                              ? formatDateMMDDYYYY(schedule.submittedDate) 
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label="Pending" 
                              size="small" 
                              sx={{ 
                                bgcolor: '#F39C12', 
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="contained"
                                startIcon={<Approval />}
                                onClick={() => {
                                  setSelectedPendingSchedule(schedule);
                                  setOpenApprovalDialog(true);
                                }}
                                sx={{ 
                                  bgcolor: '#27AE60', 
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  px: 2,
                                  py: 0.5,
                                  fontSize: '0.75rem',
                                  '&:hover': { bgcolor: '#229954' } 
                                }}
                              >
                                Review & Approve
                              </Button>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeletePendingSchedule(schedule.id)}
                                sx={{ 
                                  color: '#E74C3C', 
                                  '&:hover': { bgcolor: 'rgba(231, 76, 60, 0.1)' }
                                }}
                                title="Delete Pending Schedule"
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Paper>

        {/* Add/Edit Benefit Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              bgcolor: 'white'
            }
          }}
        >
          <DialogTitle sx={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#2C3E50',
            pb: 3,
            borderBottom: '2px solid #E8F4FD'
          }}>
            {editingBenefit ? 'Edit Benefit Program' : 'Add New Benefit Program'}
          </DialogTitle>
          <DialogContent sx={{ p: 4, bgcolor: 'white' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 700, 
                    color: '#2C3E50'
                  }}>
                    Type
                  </InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    sx={{
                      fontSize: '1rem',
                      borderRadius: 2,
                      backgroundColor: '#FFFFFF',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E0E0E0',
                        borderWidth: 2
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3498DB'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#27AE60'
                      },
                      '& .MuiSelect-select': {
                        padding: '16px 14px',
                        fontSize: '1rem',
                        color: '#2C3E50'
                      },
                      '& .MuiSelect-icon': {
                        color: '#2C3E50'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: 'white',
                          border: '1px solid #E0E0E0',
                          borderRadius: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          '& .MuiMenuItem-root': {
                            color: '#2C3E50',
                            fontSize: '1rem',
                            '&:hover': {
                              bgcolor: '#f5f5f5'
                            },
                            '&.Mui-selected': {
                              bgcolor: 'transparent',
                              '&:hover': {
                                bgcolor: '#f5f5f5'
                              }
                            }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="Financial Assistance" sx={{ fontSize: '1rem' }}>Financial Assistance</MenuItem>
                    <MenuItem value="Birthday Cash Gift" sx={{ fontSize: '1rem' }}>Birthday Cash Gift</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  value={formData.amount}
                  onChange={(e) => {
                    // Only allow numbers (0-9)
                    const inputValue = e.target.value;
                    // Remove all non-numeric characters
                    const numericValue = inputValue.replace(/[^0-9]/g, '');
                    // Format with commas for thousands
                    const formattedValue = numericValue ? parseInt(numericValue, 10).toLocaleString('en-US') : '';
                    setFormData({ ...formData, amount: formattedValue });
                  }}
                  onBlur={(e) => {
                    // Ensure the value is properly formatted on blur
                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                    if (numericValue) {
                      const formattedValue = parseInt(numericValue, 10).toLocaleString('en-US');
                      setFormData({ ...formData, amount: formattedValue });
                    }
                  }}
                  placeholder="e.g., 1500"
                  helperText="Enter amount in numbers only (e.g., 1500 will display as 1,500)"
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#2C3E50'
                    },
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1rem',
                      borderRadius: 2,
                      backgroundColor: '#FFFFFF',
                      '& fieldset': {
                        borderColor: '#E0E0E0',
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: '#3498DB'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#27AE60'
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      padding: '16px 14px',
                      color: '#2C3E50'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Distribution Date"
                  type="date"
                  value={formData.distributionDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (selectedDate) {
                      // Check if the selected date is a weekend
                      const date = new Date(selectedDate + 'T00:00:00');
                      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
                      
                      if (dayOfWeek === 0 || dayOfWeek === 6) {
                        toastService.error('Distribution date cannot be on a weekend (Saturday or Sunday). Please select a weekday.');
                        return;
                      }
                    }
                    // Directly use the selected date value (YYYY-MM-DD format)
                    setFormData({ ...formData, distributionDate: selectedDate });
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: (() => {
                      // Calculate 1 week from today
                      const oneWeekFromNow = new Date();
                      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
                      return oneWeekFromNow.toISOString().split('T')[0];
                    })()
                  }}
                  helperText="Distribution date must be at least 1 week from today and cannot be on a weekend. Time will be set to 12:00 AM."
                  FormHelperTextProps={{
                    sx: {
                      color: '#B0BEC5',
                      fontSize: '0.75rem'
                    }
                  }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#2C3E50'
                    },
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1rem',
                      borderRadius: 2,
                      backgroundColor: '#FFFFFF',
                      '& fieldset': {
                        borderColor: '#E0E0E0',
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: '#3498DB'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#27AE60'
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      padding: '16px 14px',
                      color: '#2C3E50'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (selectedDate) {
                      // Check if the selected date is a weekend
                      const date = new Date(selectedDate + 'T00:00:00');
                      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
                      
                      if (dayOfWeek === 0 || dayOfWeek === 6) {
                        toastService.error('Expiry date cannot be on a weekend (Saturday or Sunday). Please select a weekday.');
                        return;
                      }
                    }
                    // Directly use the selected date value (YYYY-MM-DD format)
                    setFormData({ ...formData, expiryDate: selectedDate });
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: (() => {
                      // Calculate 1 week from today
                      const oneWeekFromNow = new Date();
                      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
                      return oneWeekFromNow.toISOString().split('T')[0];
                    })()
                  }}
                  helperText="Expiry date must be at least 1 week from today and cannot be on a weekend"
                  FormHelperTextProps={{
                    sx: {
                      color: '#B0BEC5',
                      fontSize: '0.75rem'
                    }
                  }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#2C3E50'
                    },
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1rem',
                      borderRadius: 2,
                      backgroundColor: '#FFFFFF',
                      '& fieldset': {
                        borderColor: '#E0E0E0',
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: '#3498DB'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#27AE60'
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      padding: '16px 14px',
                      color: '#2C3E50'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#2C3E50', mb: 2 }}>
                  Description
                </Typography>
                
                {/* Read-only sections */}
                {formData.type && (
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: '#F8F9FA', 
                    borderRadius: 2,
                    border: '1px solid #E0E0E0'
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#2C3E50', 
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.8,
                        fontFamily: 'monospace',
                        fontSize: '0.9rem'
                      }}
                    >
                      {generateReadOnlyDescription()}
                    </Typography>
                  </Paper>
                )}
                
                {/* Editable Venue and Contact Section */}
                <Box sx={{ 
                  p: 2, 
                  bgcolor: '#FFFFFF', 
                  borderRadius: 2,
                  border: '2px solid #0b87ac'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0b87ac', mb: 2 }}>
                    VENUE AND CONTACT (Editable)
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Venue"
                        value={venueContact.venue}
                        onChange={(e) => setVenueContact({ ...venueContact, venue: e.target.value })}
                        placeholder="Enter the claiming venue location"
                        sx={{
                          '& .MuiInputLabel-root': {
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#2C3E50'
                          },
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.9rem',
                            borderRadius: 2,
                            backgroundColor: '#FFFFFF',
                            '& fieldset': {
                              borderColor: '#E0E0E0',
                              borderWidth: 2
                            },
                            '&:hover fieldset': {
                              borderColor: '#3498DB'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#0b87ac'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Office Hours"
                        value={venueContact.officeHours}
                        onChange={(e) => setVenueContact({ ...venueContact, officeHours: e.target.value })}
                        placeholder="e.g., 8am-4pm"
                        sx={{
                          '& .MuiInputLabel-root': {
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#2C3E50'
                          },
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.9rem',
                            borderRadius: 2,
                            backgroundColor: '#FFFFFF',
                            '& fieldset': {
                              borderColor: '#E0E0E0',
                              borderWidth: 2
                            },
                            '&:hover fieldset': {
                              borderColor: '#3498DB'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#0b87ac'
                            }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Contact Information"
                        value={venueContact.contact}
                        onChange={(e) => setVenueContact({ ...venueContact, contact: e.target.value })}
                        placeholder="Enter contact details (phone, email, etc.)"
                        sx={{
                          '& .MuiInputLabel-root': {
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#2C3E50'
                          },
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.9rem',
                            borderRadius: 2,
                            backgroundColor: '#FFFFFF',
                            '& fieldset': {
                              borderColor: '#E0E0E0',
                              borderWidth: 2
                            },
                            '&:hover fieldset': {
                              borderColor: '#3498DB'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#0b87ac'
                            }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              {formData.type === 'Birthday Cash Gift' && (
                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset" fullWidth>
                    <Typography variant="h6" sx={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 700, 
                      color: '#2C3E50',
                      mb: 2
                    }}>
                      Birthday Month Quarter
                    </Typography>
                    <RadioGroup
                      value={formData.birthdayMonth}
                      onChange={(e) => setFormData({ ...formData, birthdayMonth: e.target.value })}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 1,
                        '& .MuiFormControlLabel-root': {
                          margin: 0,
                          '& .MuiRadio-root': {
                            color: '#3498DB',
                            '&.Mui-checked': {
                              color: '#27AE60'
                            }
                          },
                          '& .MuiFormControlLabel-label': {
                            fontSize: '0.9rem',
                            color: '#2C3E50',
                            fontWeight: 500
                          }
                        }
                      }}
                    >
                      <FormControlLabel 
                        value="Q1" 
                        control={<Radio />} 
                        label="Q1 - January, February, March" 
                      />
                      <FormControlLabel 
                        value="Q2" 
                        control={<Radio />} 
                        label="Q2 - April, May, June" 
                      />
                      <FormControlLabel 
                        value="Q3" 
                        control={<Radio />} 
                        label="Q3 - July, August, September" 
                      />
                      <FormControlLabel 
                        value="Q4" 
                        control={<Radio />} 
                        label="Q4 - October, November, December" 
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              )}
              {(formData.type === 'Financial Assistance' || formData.type === 'Birthday Cash Gift') ? (
                // Show checkboxes for Financial Assistance and Birthday Cash Gift
                <Grid item xs={12} md={6}>
                  <FormControl component="fieldset" fullWidth>
                    <Typography variant="h6" sx={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 700, 
                      color: '#2C3E50',
                      mb: 2
                    }}>
                      Select Barangays (Choose one or more barangays)
                    </Typography>
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 1,
                      maxHeight: 200,
                      overflow: 'auto',
                      border: '1px solid #E0E0E0',
                      borderRadius: 2,
                      p: 2,
                      bgcolor: '#F8F9FA'
                    }}>
                      {['Banlic', 'Bigaa', 'Butong', 'Casile', 'Diezmo', 'Gulod', 'Mamatid', 'Marinig', 'Niugan', 'Pittland', 'Pulo', 'Sala', 'San Isidro'].map((barangay) => (
                        <FormControlLabel
                          key={barangay}
                          control={
                            <Checkbox
                              checked={formData.selectedBarangays.includes(barangay)}
                              onChange={() => handleBarangaySelection(barangay)}
                              sx={{
                                color: '#3498DB',
                                '&.Mui-checked': {
                                  color: '#27AE60'
                                }
                              }}
                            />
                          }
                          label={barangay}
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: '0.9rem',
                              color: '#2C3E50',
                              fontWeight: 500
                            }
                          }}
                        />
                      ))}
                    </Box>
                    {formData.selectedBarangays.length > 0 && (
                      <Typography variant="body2" sx={{ color: '#27AE60', fontWeight: 600, mt: 1 }}>
                        Selected: {formData.selectedBarangays.join(', ')}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              ) : (
                // Show dropdown for other benefit types
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 700, 
                      color: '#2C3E50'
                    }}>
                      Barangay
                    </InputLabel>
                    <Select
                      value={formData.barangay}
                      label="Barangay"
                      onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                      sx={{
                        fontSize: '1rem',
                        borderRadius: 2,
                        backgroundColor: '#FFFFFF',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#E0E0E0',
                          borderWidth: 2
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3498DB'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#27AE60'
                        },
                        '& .MuiSelect-select': {
                          padding: '16px 14px',
                          fontSize: '1rem',
                          color: '#2C3E50'
                        },
                        '& .MuiSelect-icon': {
                          color: '#2C3E50'
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: 'white',
                            border: '1px solid #E0E0E0',
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '& .MuiMenuItem-root': {
                              color: '#2C3E50',
                              fontSize: '1rem',
                              '&:hover': {
                                bgcolor: '#f5f5f5'
                              },
                              '&.Mui-selected': {
                                bgcolor: '#E8F4FD',
                                '&:hover': {
                                  bgcolor: '#E8F4FD'
                                }
                              }
                            }
                          }
                        }
                      }}
                    >
                      <MenuItem value="All Barangays" sx={{ fontSize: '1rem' }}>All Barangays</MenuItem>
                      <MenuItem value="Banlic" sx={{ fontSize: '1rem' }}>Banlic</MenuItem>
                      <MenuItem value="Bigaa" sx={{ fontSize: '1rem' }}>Bigaa</MenuItem>
                      <MenuItem value="Butong" sx={{ fontSize: '1rem' }}>Butong</MenuItem>
                      <MenuItem value="Casile" sx={{ fontSize: '1rem' }}>Casile</MenuItem>
                      <MenuItem value="Diezmo" sx={{ fontSize: '1rem' }}>Diezmo</MenuItem>
                      <MenuItem value="Gulod" sx={{ fontSize: '1rem' }}>Gulod</MenuItem>
                      <MenuItem value="Mamatid" sx={{ fontSize: '1rem' }}>Mamatid</MenuItem>
                      <MenuItem value="Marinig" sx={{ fontSize: '1rem' }}>Marinig</MenuItem>
                      <MenuItem value="Niugan" sx={{ fontSize: '1rem' }}>Niugan</MenuItem>
                      <MenuItem value="Pittland" sx={{ fontSize: '1rem' }}>Pittland</MenuItem>
                      <MenuItem value="Pulo" sx={{ fontSize: '1rem' }}>Pulo</MenuItem>
                      <MenuItem value="Sala" sx={{ fontSize: '1rem' }}>Sala</MenuItem>
                      <MenuItem value="San Isidro" sx={{ fontSize: '1rem' }}>San Isidro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>

            {/* Eligible Members Table */}
            {(formData.type === 'Financial Assistance' && formData.selectedBarangays.length > 0) ||
             (formData.type === 'Birthday Cash Gift' && formData.birthdayMonth) ? (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  color: '#2C3E50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <People />
                  Eligible Members Preview
                  {formData.type === 'Financial Assistance' && formData.selectedBarangays.length > 0 && (
                    <Chip 
                      label={`From ${formData.selectedBarangays.join(', ')}`} 
                      size="small" 
                      sx={{ 
                        bgcolor: '#E8F4FD', 
                        color: '#2C3E50',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  )}
                  {formData.type === 'Birthday Cash Gift' && (
                    <Chip 
                      label={getQuarterName(formData.birthdayMonth)} 
                      size="small" 
                      sx={{ 
                        bgcolor: '#E8F4FD', 
                        color: '#2C3E50',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  )}
                </Typography>
                
                {loadingEligibleMembers ? (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    py: 4,
                    bgcolor: '#F8F9FA',
                    borderRadius: 2,
                    border: '1px solid #E0E0E0'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress size={40} sx={{ color: '#27AE60', mb: 2 }} />
                      <Typography variant="body2" sx={{ color: '#2C3E50', fontWeight: 500 }}>
                        Loading eligible members...
                      </Typography>
                    </Box>
                  </Box>
                ) : eligibleMembers.length > 0 ? (
                  <TableContainer component={Paper} elevation={0} sx={{ 
                    border: '1px solid #E0E0E0', 
                    borderRadius: 2,
                    maxHeight: 300,
                    overflow: 'auto'
                  }}>
                    <Table size="small">
                       <TableHead>
                         <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                           <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.875rem' }}>
                             PWD ID
                           </TableCell>
                           <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.875rem' }}>
                             Full Name
                           </TableCell>
                           <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.875rem' }}>
                             Birth Month
                           </TableCell>
                           <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.875rem' }}>
                             Age
                           </TableCell>
                           <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.875rem' }}>
                             Barangay
                           </TableCell>
                           <TableCell sx={{ fontWeight: 600, color: '#2C3E50', fontSize: '0.875rem' }}>
                             Disability Type
                           </TableCell>
                         </TableRow>
                       </TableHead>
                      <TableBody>
                        {eligibleMembers.map((member, index) => {
                          // Debug: Log each member being rendered in the table
                          console.log(`Rendering member ${index + 1}:`, member);
                          return (
                          <TableRow 
                            key={member.id} 
                            sx={{ 
                              bgcolor: index % 2 ? '#F8FAFC' : '#FFFFFF',
                              '&:hover': {
                                bgcolor: '#E8F4FD'
                              }
                            }}
                          >
                            <TableCell sx={{ fontWeight: 500, color: '#2C3E50', fontSize: '0.8rem' }}>
                              {member.pwd_id || (member.userID ? `PWD-${member.userID}` : 'Not assigned')}
                            </TableCell>
                            <TableCell sx={{ color: '#2C3E50', fontSize: '0.8rem' }}>
                              {(() => {
                                const parts = [];
                                if (member.firstName) parts.push(member.firstName);
                                if (member.middleName && member.middleName.trim().toUpperCase() !== 'N/A') parts.push(member.middleName);
                                if (member.lastName) parts.push(member.lastName);
                                if (member.suffix) parts.push(member.suffix);
                                return parts.join(' ').trim() || 'Name not provided';
                              })()}
                            </TableCell>
                            <TableCell sx={{ color: '#2C3E50', fontSize: '0.8rem' }}>
                              {getMonthName(new Date(member.birthDate).getMonth() + 1)}
                            </TableCell>
                            <TableCell sx={{ color: '#2C3E50', fontSize: '0.8rem' }}>
                              {getAge(member.birthDate)}
                            </TableCell>
                            <TableCell sx={{ color: '#2C3E50', fontSize: '0.8rem' }}>
                              {member.barangay || 'Not specified'}
                            </TableCell>
                             <TableCell sx={{ color: '#2C3E50', fontSize: '0.8rem' }}>
                               {member.disabilityType || 'Not specified'}
                             </TableCell>
                           </TableRow>
                           );
                         })}
                       </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4, 
                    bgcolor: '#F8F9FA', 
                    borderRadius: 2, 
                    border: '2px dashed #E0E0E0' 
                  }}>
                    <People sx={{ fontSize: 40, color: '#BDC3C7', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#7F8C8D', mb: 1, fontWeight: 600 }}>
                      No Eligible Members Found
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#95A5A6' }}>
                      {formData.type === 'Financial Assistance' 
                        ? `No PWD members found in selected barangays: ${formData.selectedBarangays.join(', ')}`
                        : `No PWD members have birthdays in ${getQuarterName(formData.birthdayMonth)}${formData.barangay && formData.barangay !== 'All Barangays' ? ` from ${formData.barangay}` : ''}`
                      }
                    </Typography>
                  </Box>
                )}
                
                {eligibleMembers.length > 0 && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: '#E8F5E8', 
                    borderRadius: 2, 
                    border: '1px solid #27AE60' 
                  }}>
                    <Typography variant="body2" sx={{ color: '#27AE60', fontWeight: 600, textAlign: 'center' }}>
                      📊 Total Eligible Members: {eligibleMembers.length}
                      {formData.type === 'Financial Assistance' && formData.selectedBarangays.length > 0 && (
                        <span> • From {formData.selectedBarangays.join(', ')}</span>
                      )}
                      {formData.type === 'Birthday Cash Gift' && formData.barangay && formData.barangay !== 'All Barangays' && (
                        <span> • From {formData.barangay}</span>
                      )}
                      {formData.amount && (
                        <span> • Estimated Total Cost: ₱{(parseInt(formData.amount.replace(/[₱,]/g, '')) * eligibleMembers.length).toLocaleString()}</span>
                      )}
                    </Typography>
                  </Box>
                )}

              </Box>
            ) : null}

            {/* Announcement Preview Section */}
            {(formData.type && (formData.selectedBarangays?.length > 0 || formData.barangay)) && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 2, 
                  color: '#2C3E50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <CampaignIcon sx={{ color: '#0b87ac' }} />
                  Announcement Preview
                  <Chip 
                    label="Draft" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#FFF3E0', 
                      color: '#F57C00',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                </Typography>
                <Alert severity="info" sx={{ mb: 2, bgcolor: '#E3F2FD', border: '1px solid #2196F3' }}>
                  <Typography variant="body2" sx={{ color: '#1976D2', fontWeight: 500 }}>
                    This is a preview of the announcement that will be automatically created when this benefit is approved. 
                    The announcement will be saved as a draft for you to review and complete before posting.
                  </Typography>
                </Alert>
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  bgcolor: '#FAFAFA', 
                  borderRadius: 2,
                  border: '1px solid #E0E0E0',
                  maxHeight: 500,
                  overflow: 'auto'
                }}>
                  <Box sx={{ 
                    color: '#2C3E50', 
                    lineHeight: 1.8,
                    fontFamily: 'inherit',
                    '& .preview-header': {
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: '#0b87ac',
                      mt: 2,
                      mb: 1,
                      display: 'block'
                    },
                    '& .preview-bullet': {
                      display: 'block',
                      pl: 3,
                      mb: 0.5,
                      position: 'relative',
                      '&::before': {
                        content: '"•"',
                        position: 'absolute',
                        left: '8px',
                        fontWeight: 700,
                        color: '#2C3E50'
                      }
                    },
                    '& .preview-numbered': {
                      display: 'block',
                      pl: 3,
                      mb: 0.5
                    },
                    '& .preview-text': {
                      display: 'block',
                      mb: 0.5
                    },
                    '& .preview-empty': {
                      display: 'block',
                      height: '0.5rem'
                    }
                  }}>
                    {generateAnnouncementPreview().map((item, idx) => {
                      if (item.type === 'empty') {
                        return <Box key={idx} className="preview-empty" />;
                      } else if (item.type === 'header') {
                        return (
                          <Typography key={idx} className="preview-header" component="div" variant="h6">
                            {item.content}
                          </Typography>
                        );
                      } else if (item.type === 'bullet') {
                        const text = item.content.replace(/^[•\-\*]\s*/, '');
                        return (
                          <Typography key={idx} className="preview-bullet" component="div" variant="body2">
                            {text}
                          </Typography>
                        );
                      } else if (item.type === 'numbered') {
                        return (
                          <Typography key={idx} className="preview-numbered" component="div" variant="body2">
                            {item.content}
                          </Typography>
                        );
                      } else {
                        return (
                          <Typography key={idx} className="preview-text" component="div" variant="body2">
                            {item.content}
                          </Typography>
                        );
                      }
                    })}
                  </Box>
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 4, 
            pt: 2, 
            borderTop: '2px solid #E8F4FD',
            bgcolor: 'white',
            gap: 2
          }}>
            <Button 
              onClick={handleCloseDialog}
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                color: '#7F8C8D',
                border: '2px solid #E0E0E0',
                '&:hover': { 
                  bgcolor: '#E8F4FD',
                  color: '#2C3E50',
                  borderColor: '#3498DB'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                bgcolor: '#27AE60',
                '&:hover': { 
                  bgcolor: '#229954' 
                }
              }}
            >
              {editingBenefit ? 'Update Benefit' : 'Add Benefit'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog 
          open={openApprovalDialog} 
          onClose={() => {
            setOpenApprovalDialog(false);
            setSelectedPendingSchedule(null);
            setApprovalFile(null);
          }} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              bgcolor: 'white'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#27AE60', 
            color: 'white', 
            fontWeight: 700, 
            fontSize: '1.3rem',
            textAlign: 'center',
            py: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Approval />
              Review & Approve Benefit Program
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 4, bgcolor: 'white' }}>
            {selectedPendingSchedule && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#2C3E50' }}>
                  Program Details
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 600, mb: 0.5 }}>
                      Program Title
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', fontWeight: 500 }}>
                      {selectedPendingSchedule.name || selectedPendingSchedule.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 600, mb: 0.5 }}>
                      Type
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', fontWeight: 500 }}>
                      {selectedPendingSchedule.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 600, mb: 0.5 }}>
                      Amount
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', fontWeight: 500 }}>
                      {selectedPendingSchedule.amount}
                    </Typography>
                  </Grid>
                  {selectedPendingSchedule.type === 'Financial Assistance' ? (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 600, mb: 0.5 }}>
                        Barangays
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#2C3E50', fontWeight: 500 }}>
                        {selectedPendingSchedule.selectedBarangays && selectedPendingSchedule.selectedBarangays.length > 0 ? selectedPendingSchedule.selectedBarangays.join(', ') : 'All Barangays'}
                      </Typography>
                    </Grid>
                  ) : (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 600, mb: 0.5 }}>
                        Barangay
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#2C3E50', fontWeight: 500 }}>
                        {selectedPendingSchedule.barangay || 'All Barangays'}
                      </Typography>
                    </Grid>
                  )}
                  {selectedPendingSchedule.type === 'Birthday Cash Gift' ? (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 600, mb: 0.5 }}>
                        Birthday Month Quarter
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#2C3E50', fontWeight: 500 }}>
                        {selectedPendingSchedule.birthdayMonth ? getQuarterName(selectedPendingSchedule.birthdayMonth) : 'All Quarters'}
                      </Typography>
                    </Grid>
                  ) : selectedPendingSchedule.type === 'Financial Assistance' ? (
                    null
                  ) : (
                    // No additional fields for other benefit types
                    null
                  )}
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 600, mb: 1 }}>
                      Description
                    </Typography>
                    <Box sx={{ 
                      bgcolor: '#F8F9FA', 
                      p: 2, 
                      borderRadius: 2, 
                      border: '1px solid #E0E0E0',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {formatDescription(selectedPendingSchedule.description).map((item, index) => {
                        if (item.type === 'empty') {
                          return <Box key={index} sx={{ height: '8px' }} />;
                        }
                        if (item.type === 'header') {
                          return (
                            <Typography 
                              key={index} 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 700, 
                                color: '#2C3E50', 
                                fontSize: '1rem',
                                mb: 1,
                                mt: index > 0 ? 2 : 0
                              }}
                            >
                              {item.content}
                            </Typography>
                          );
                        }
                        if (item.type === 'numbered') {
                          return (
                            <Typography 
                              key={index} 
                              variant="body2" 
                              sx={{ 
                                color: '#2C3E50', 
                                mb: 0.5,
                                pl: 2,
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              {item.content}
                            </Typography>
                          );
                        }
                        if (item.type === 'bullet') {
                          return (
                            <Typography 
                              key={index} 
                              variant="body2" 
                              sx={{ 
                                color: '#2C3E50', 
                                mb: 0.5,
                                pl: 2,
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              {item.content}
                            </Typography>
                          );
                        }
                        return (
                          <Typography 
                            key={index} 
                            variant="body2" 
                            sx={{ 
                              color: '#2C3E50', 
                              mb: 0.5,
                              whiteSpace: 'pre-wrap'
                            }}
                          >
                            {item.content}
                          </Typography>
                        );
                      })}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 600, mb: 0.5 }}>
                      Distribution Date
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', fontWeight: 500 }}>
                      {selectedPendingSchedule.distributionDate 
                        ? formatDateTime(selectedPendingSchedule.distributionDate) 
                        : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#7F8C8D', fontWeight: 600, mb: 0.5 }}>
                      Expiry Date
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#2C3E50', fontWeight: 500 }}>
                      {selectedPendingSchedule.expiryDate 
                        ? formatDateTime(selectedPendingSchedule.expiryDate) 
                        : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2C3E50' }}>
                  Upload Approval Document
                </Typography>
                <Typography variant="body2" sx={{ color: '#7F8C8D', mb: 3 }}>
                  Please upload the signed letter of approval from the mayor to proceed with the approval.
                </Typography>

                <Box sx={{ 
                  border: '2px dashed #E0E0E0', 
                  borderRadius: 2, 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: '#F8F9FA',
                  mb: 2
                }}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="approval-file-upload"
                  />
                  <label htmlFor="approval-file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Upload />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        borderColor: '#27AE60',
                        color: '#27AE60',
                        '&:hover': {
                          borderColor: '#229954',
                          bgcolor: '#E8F5E8'
                        }
                      }}
                    >
                      Choose File
                    </Button>
                  </label>
                  {approvalFile && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ color: '#27AE60', fontWeight: 600 }}>
                        Selected: {approvalFile.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: 4, 
            pt: 2, 
            borderTop: '2px solid #E8F4FD',
            bgcolor: 'white',
            gap: 2
          }}>
            <Button 
              onClick={() => {
                setOpenApprovalDialog(false);
                setSelectedPendingSchedule(null);
                setApprovalFile(null);
              }}
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                color: '#7F8C8D',
                border: '1px solid #E0E0E0',
                '&:hover': {
                  borderColor: '#BDC3C7',
                  bgcolor: '#F8F9FA'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApproveSchedule} 
              variant="contained"
              disabled={!approvalFile || approvingSchedule}
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                bgcolor: approvingSchedule ? '#BDC3C7' : '#27AE60',
                '&:hover': { 
                  bgcolor: approvingSchedule ? '#BDC3C7' : '#229954' 
                },
                '&:disabled': {
                  bgcolor: '#BDC3C7',
                  color: 'white'
                }
              }}
            >
              {approvingSchedule ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1, color: '#FFFFFF' }} />
                  Approving...
                </>
              ) : (
                'Approve Program'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Draft Announcement Popup */}
        <Dialog
          open={showDraftAnnouncementPopup}
          onClose={() => setShowDraftAnnouncementPopup(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              p: 0,
              bgcolor: '#FFFFFF'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#0b87ac', 
            color: '#FFFFFF', 
            py: 2,
            px: 3,
            borderBottom: '1px solid #E0E0E0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Draft Announcement Created
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3, bgcolor: '#FFFFFF' }}>
            <Alert severity="info" sx={{ mb: 2, bgcolor: '#E3F2FD', border: '1px solid #2196F3' }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                A draft announcement has been created.
              </Typography>
              <Typography variant="body2">
                Please complete all required information before posting to the selected barangays.
              </Typography>
            </Alert>
            <Typography variant="body2" sx={{ color: '#7F8C8D', mt: 2 }}>
              You can find and edit the draft announcement in the Announcements module. 
              Once all required fields are complete, you can post it to make it visible to the targeted barangays.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            pt: 2, 
            borderTop: '1px solid #E0E0E0',
            bgcolor: '#FFFFFF',
            gap: 2
          }}>
            <Button 
              onClick={() => setShowDraftAnnouncementPopup(false)}
              variant="contained"
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                bgcolor: '#0b87ac',
                '&:hover': { 
                  bgcolor: '#0a6d8a' 
                }
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  </Box>
  );
};

export default Ayuda;
