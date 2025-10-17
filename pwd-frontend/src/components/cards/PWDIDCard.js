import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import QRCodeService from '../../services/qrCodeService';

const PWDIDCard = ({ member, open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState(null);

  useEffect(() => {
    if (member && open) {
      generateQRCode();
    }
  }, [member, open]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      if (!member) return;

      const qrCodeURL = await QRCodeService.generateMemberQRCode(member);
      setQrCodeDataURL(qrCodeURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>PWD ID Card - ${member.firstName} ${member.lastName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .id-card {
              width: 2in;
              height: 3in;
              border: 2px solid #000;
              background: white;
              position: relative;
              margin: 0 auto;
              box-sizing: border-box;
            }
            .header {
              text-align: center;
              padding: 3px 0;
              border-bottom: 1px solid #000;
              font-size: 6px;
              font-weight: bold;
              line-height: 1.1;
            }
            .content {
              display: flex;
              height: calc(100% - 20px);
            }
            .left-section {
              flex: 1;
              padding: 4px;
              font-size: 5px;
              line-height: 1.1;
            }
            .right-section {
              width: 40px;
              padding: 3px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              border-left: 1px solid #000;
            }
            .photo-placeholder {
              width: 30px;
              height: 30px;
              border: 1px dashed #000;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 4px;
              margin-bottom: 3px;
            }
            .qr-code {
              width: 30px;
              height: 30px;
              border: 1px solid #000;
              margin-top: 3px;
            }
            .footer {
              position: absolute;
              bottom: 3px;
              left: 0;
              right: 0;
              text-align: center;
              font-size: 4px;
              font-weight: bold;
            }
            .pdao-button {
              background: #000;
              color: white;
              padding: 1px 4px;
              font-size: 5px;
              font-weight: bold;
              margin: 1px 0;
              border: none;
            }
            @media print {
              body { margin: 0; }
              .id-card { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">
              REPUBLIC OF THE PHILIPPINES<br>
              PROVINCE OF LAGUNA<br>
              CITY OF CABUYAO<br>
              (P.D.A.O)
            </div>
            
            <div class="content">
              <div class="left-section">
                <div class="pdao-button">CABUYAO PDAO</div>
                <br>
                <strong>NAME:</strong> ${member.firstName} ${member.middleName || ''} ${member.lastName} ${member.suffix || ''}<br>
                <strong>ID NO.:</strong> ${member.pwd_id || `PWD-${member.userID}`}<br>
                <strong>TYPE OF DISABILITY:</strong> ${member.disabilityType || 'NOT SPECIFIED'}<br>
                <strong>SIGNATURE:</strong> _________
              </div>
              
              <div class="right-section">
                <div class="photo-placeholder">PHOTO</div>
                ${qrCodeDataURL ? `<img src="${qrCodeDataURL}" class="qr-code" alt="QR Code" />` : '<div class="qr-code" style="border: 1px dashed #000; display: flex; align-items: center; justify-content: center; font-size: 3px;">QR CODE</div>'}
              </div>
            </div>
            
            <div class="footer">
              VALID ANYWHERE IN THE PHILIPPINES
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDownload = () => {
    // Create a canvas to generate the ID card as an image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (standard ID card size)
    canvas.width = 540; // 3.375 inches at 160 DPI
    canvas.height = 340; // 2.125 inches at 160 DPI
    
    // Draw white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    
    // Draw header
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('REPUBLIC OF THE PHILIPPINES', canvas.width / 2, 25);
    ctx.fillText('PROVINCE OF LAGUNA', canvas.width / 2, 40);
    ctx.fillText('CITY OF CABUYAO', canvas.width / 2, 55);
    ctx.fillText('(P.D.A.O)', canvas.width / 2, 70);
    
    // Draw PDAO button
    ctx.fillStyle = '#000000';
    ctx.fillRect(canvas.width / 2 - 40, 80, 80, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px Arial';
    ctx.fillText('CABUYAO PDAO', canvas.width / 2, 93);
    
    // Draw member information
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`NAME: ${member.firstName} ${member.middleName || ''} ${member.lastName} ${member.suffix || ''}`, 20, 120);
    ctx.fillText(`ID NO.: ${member.pwd_id || `PWD-${member.userID}`}`, 20, 140);
    ctx.fillText(`TYPE OF DISABILITY: ${member.disabilityType || 'NOT SPECIFIED'}`, 20, 160);
    ctx.fillText('SIGNATURE: _________', 20, 180);
    
    // Draw photo placeholder
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(canvas.width - 80, 110, 60, 60);
    ctx.setLineDash([]);
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PHOTO', canvas.width - 50, 145);
    
    // Draw QR code if available
    if (qrCodeDataURL) {
      const qrImage = new Image();
      qrImage.onload = () => {
        ctx.drawImage(qrImage, canvas.width - 80, 180, 60, 60);
        
        // Draw footer
        ctx.font = 'bold 10px Arial';
        ctx.fillText('VALID ANYWHERE IN THE PHILIPPINES', canvas.width / 2, 320);
        
        // Download the image
        const link = document.createElement('a');
        link.download = `PWD-ID-${member.pwd_id || member.userID}.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      qrImage.src = qrCodeDataURL;
    } else {
      // Draw QR placeholder
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(canvas.width - 80, 180, 60, 60);
      ctx.setLineDash([]);
      ctx.font = '8px Arial';
      ctx.fillText('QR CODE', canvas.width - 50, 215);
      
      // Draw footer
      ctx.font = 'bold 10px Arial';
      ctx.fillText('VALID ANYWHERE IN THE PHILIPPINES', canvas.width / 2, 320);
      
      // Download the image
      const link = document.createElement('a');
      link.download = `PWD-ID-${member.pwd_id || member.userID}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (!member) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'white'
        }
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50' }}>
            PWD ID Card
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#2C3E50' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ID Card Preview */}
        <Card sx={{ 
          border: '2px solid #000',
          borderRadius: 2,
          bgcolor: 'white',
          mb: 3,
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <CardContent sx={{ p: 2 }}>
            {/* Header */}
            <Box sx={{ 
              textAlign: 'center', 
              borderBottom: '1px solid #000', 
              pb: 1, 
              mb: 2 
            }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                REPUBLIC OF THE PHILIPPINES
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                PROVINCE OF LAGUNA
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                CITY OF CABUYAO
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                (P.D.A.O)
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch' }}>
              {/* Left Section */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Chip 
                    label="CABUYAO PDAO" 
                    sx={{ 
                      bgcolor: '#000000', 
                      color: '#FFFFFF !important', 
                      fontSize: '0.6rem',
                      height: '20px',
                      mb: 1.5,
                      fontWeight: 'bold',
                      '& .MuiChip-label': {
                        color: '#FFFFFF !important'
                      }
                    }} 
                  />
                  <Typography variant="body2" sx={{ fontSize: '0.7rem', lineHeight: 1.4, mt: 1.5 }}>
                    <strong>NAME:</strong> {member.firstName} {member.middleName || ''} {member.lastName} {member.suffix || ''}<br/><br/>
                    <strong>ID NO.:</strong> {member.pwd_id || `PWD-${member.userID}`}<br/><br/>
                    <strong>TYPE OF DISABILITY:</strong> {member.disabilityType || 'NOT SPECIFIED'}<br/><br/>
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.7rem', lineHeight: 1.4, mt: 2 }}>
                  <strong>SIGNATURE:</strong> _________
                </Typography>
              </Box>

              {/* Right Section */}
              <Box sx={{ 
                width: '80px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                py: 1
              }}>
                {/* Photo Placeholder */}
                <Box sx={{ 
                  width: '60px', 
                  height: '60px', 
                  border: '1px dashed #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem'
                }}>
                  PHOTO
                </Box>

                {/* QR Code */}
                {loading ? (
                  <Box sx={{ 
                    width: '60px', 
                    height: '60px', 
                    border: '1px dashed #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.5rem'
                  }}>
                    Loading...
                  </Box>
                ) : qrCodeDataURL ? (
                  <img 
                    src={qrCodeDataURL} 
                    alt="QR Code" 
                    style={{ 
                      width: '60px', 
                      height: '60px',
                      border: '1px solid #000'
                    }} 
                  />
                ) : (
                  <Box sx={{ 
                    width: '60px', 
                    height: '60px', 
                    border: '1px dashed #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.5rem'
                  }}>
                    QR CODE
                  </Box>
                )}
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ 
              textAlign: 'center', 
              mt: 2, 
              pt: 1, 
              borderTop: '1px solid #000' 
            }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 'bold', 
                fontSize: '0.6rem' 
              }}>
                VALID ANYWHERE IN THE PHILIPPINES
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              bgcolor: '#2C3E50',
              '&:hover': { bgcolor: '#34495E' },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2
            }}
          >
            Print ID Card
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              borderColor: '#2C3E50',
              color: '#2C3E50',
              '&:hover': {
                borderColor: '#34495E',
                backgroundColor: 'rgba(44, 62, 80, 0.1)'
              },
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2
            }}
          >
            Download Image
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PWDIDCard;
