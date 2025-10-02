import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close,
  Download,
  Visibility,
  PictureAsPdf,
  Image,
  Description,
  InsertDriveFile
} from '@mui/icons-material';
import { supportService } from '../../services/supportService';

const FilePreview = ({ open, onClose, messageId, fileName, fileType, fileSize }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  React.useEffect(() => {
    if (open && messageId) {
      loadFilePreview();
    }
  }, [open, messageId]);

  const loadFilePreview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading file preview for messageId:', messageId);
      console.log('File type:', fileType);
      
      // Get the file URL from the backend
      const response = await supportService.downloadAttachment(messageId);
      
      console.log('Response received:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Get the blob from the response
      const blob = await response.blob();
      console.log('Blob created:', blob);
      console.log('Blob type:', blob.type);
      console.log('Blob size:', blob.size);
      
      const url = URL.createObjectURL(blob);
      console.log('Object URL created:', url);
      setFileUrl(url);
    } catch (error) {
      console.error('Error loading file preview:', error);
      if (error.message?.includes('404')) {
        setError('File not found on server');
      } else if (error.message?.includes('403')) {
        setError('Access denied to this file');
      } else {
        setError('Failed to load file preview: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await supportService.forceDownloadAttachment(messageId);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file');
    }
  };

  const handleClose = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setError(null);
    onClose();
  };

  const getFileIcon = () => {
    if (!fileType) return <InsertDriveFile />;
    
    if (fileType.startsWith('image/')) {
      return <Image />;
    } else if (fileType === 'application/pdf') {
      return <PictureAsPdf />;
    } else {
      return <Description />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      );
    }

    if (!fileUrl) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Typography>No preview available</Typography>
        </Box>
      );
    }

    // Image preview
    if (fileType && fileType.startsWith('image/')) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <img
            src={fileUrl}
            alt={fileName}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 4
            }}
            onError={(e) => {
              console.error('Image failed to load:', e);
              console.error('Image src:', fileUrl);
              console.error('File type:', fileType);
              setError('Failed to load image preview');
            }}
            onLoad={() => {
              console.log('Image loaded successfully');
            }}
          />
        </Box>
      );
    }

    // PDF preview
    if (fileType === 'application/pdf') {
      return (
        <Box sx={{ height: 500, width: '100%' }}>
          <iframe
            src={fileUrl}
            width="100%"
            height="100%"
            style={{ border: 'none', borderRadius: 4 }}
            title={fileName}
            onError={(e) => {
              console.error('PDF failed to load:', e);
              setError('Failed to load PDF preview');
            }}
          />
        </Box>
      );
    }

    // Text file preview
    if (fileType && fileType.startsWith('text/')) {
      return (
        <Box sx={{ height: 400, overflow: 'auto', p: 2 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {/* Note: For text files, we'd need to fetch and display the content */}
            Text file preview not implemented yet
          </Typography>
        </Box>
      );
    }

    // Office documents preview (Word, Excel, PowerPoint)
    if (fileType && (
      fileType.includes('wordprocessingml') || 
      fileType.includes('spreadsheetml') || 
      fileType.includes('presentationml') ||
      fileType.includes('msword') ||
      fileType.includes('ms-excel') ||
      fileType.includes('ms-powerpoint')
    )) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            p: 3, 
            backgroundColor: '#F8F9FA', 
            borderRadius: 2,
            border: '2px dashed #DEE2E6',
            maxWidth: 300
          }}>
            {getFileIcon()}
            <Typography variant="h6" sx={{ mt: 2, mb: 1, textAlign: 'center', color: '#495057' }}>
              {fileName}
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#6C757D', mb: 2 }}>
              This is a Microsoft Office document
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#6C757D', mb: 1 }}>
              Preview not available for this file type
            </Typography>
            <Typography variant="caption" sx={{ textAlign: 'center', color: '#6C757D' }}>
              File size: {formatFileSize(fileSize)}
            </Typography>
            <Typography variant="caption" sx={{ textAlign: 'center', color: '#6C757D', mt: 1 }}>
              Click Download to open with Microsoft Office
            </Typography>
          </Box>
        </Box>
      );
    }

    // Default preview for unsupported file types
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          p: 3, 
          backgroundColor: '#F8F9FA', 
          borderRadius: 2,
          border: '2px dashed #DEE2E6',
          maxWidth: 300
        }}>
          {getFileIcon()}
          <Typography variant="h6" sx={{ mt: 2, mb: 1, textAlign: 'center', color: '#495057' }}>
            {fileName}
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#6C757D', mb: 2 }}>
            Preview not available for this file type
          </Typography>
          <Typography variant="caption" sx={{ textAlign: 'center', color: '#6C757D' }}>
            File size: {formatFileSize(fileSize)}
          </Typography>
          <Typography variant="caption" sx={{ textAlign: 'center', color: '#6C757D', mt: 1 }}>
            Click Download to save the file
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xl" 
      fullWidth
      fullScreen={false}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          bgcolor: '#FFFFFF',
          color: '#2C3E50',
        },
      }}
    >
      <DialogTitle sx={{
        bgcolor: '#FFFFFF',
        color: '#000000 !important',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        px: 2,
        borderBottom: '1px solid #E0E0E0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getFileIcon()}
          <Typography variant="h6" sx={{ color: '#000000 !important' }}>
            File Preview
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: '#000000 !important' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#000000' }}>
            {fileName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {fileType} • {formatFileSize(fileSize)}
          </Typography>
        </Box>
        
        {renderPreview()}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: '#FFFFFF', borderTop: '1px solid #E0E0E0' }}>
        <Button onClick={handleClose} sx={{ color: '#000000' }}>
          Close
        </Button>
        <Button 
          onClick={handleDownload}
          variant="contained"
          startIcon={<Download />}
          sx={{
            bgcolor: '#3498DB',
            color: '#FFFFFF',
            '&:hover': { bgcolor: '#2980B9' },
          }}
        >
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilePreview;
