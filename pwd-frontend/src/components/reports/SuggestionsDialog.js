import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Paper,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import suggestionsService from '../../services/suggestionsService';

const SuggestionsDialog = ({ 
  open, 
  onClose, 
  suggestions = [], 
  loading = false,
  reportType = 'general'
}) => {
  
  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'warning':
        return <WarningIcon sx={{ color: '#E74C3C' }} />;
      case 'info':
        return <InfoIcon sx={{ color: '#3498DB' }} />;
      case 'success':
        return <CheckCircleIcon sx={{ color: '#27AE60' }} />;
      default:
        return <LightbulbIcon sx={{ color: '#F39C12' }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#E74C3C';
      case 'medium':
        return '#F39C12';
      case 'low':
        return '#27AE60';
      default:
        return '#7F8C8D';
    }
  };

  const getReportTypeTitle = (type) => {
    switch (type) {
      case 'pwd-registration':
        return 'PWD Registration Report';
      case 'card-distribution':
        return 'Card Distribution Report';
      case 'benefits-distribution':
        return 'Benefits Distribution Report';
      case 'complaints-analysis':
        return 'Complaints Analysis Report';
      case 'barangay-performance':
        return 'Barangay Performance Report';
      default:
        return 'Report Analysis';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: '#FFFFFF'
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#FFFFFF',
          color: '#2C3E50',
          borderBottom: '1px solid #E0E0E0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon sx={{ color: '#8E44AD', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50' }}>
            AI-Powered Suggestions
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#7F8C8D',
            '&:hover': {
              backgroundColor: '#F5F5F5',
              color: '#2C3E50'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: '#FFFFFF', py: 3 }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            py: 4 
          }}>
            <CircularProgress sx={{ color: '#8E44AD', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#7F8C8D' }}>
              Analyzing data and generating suggestions...
            </Typography>
          </Box>
        ) : suggestions.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            bgcolor: '#F8F9FA',
            borderRadius: 2,
            border: '1px solid #E0E0E0'
          }}>
            <LightbulbIcon sx={{ fontSize: 48, color: '#BDC3C7', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#7F8C8D', mb: 1 }}>
              No Suggestions Available
            </Typography>
            <Typography variant="body2" sx={{ color: '#95A5A6' }}>
              The current data doesn't require any specific recommendations at this time.
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Report Type Header */}
            <Paper sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: '#F8F4FF', 
              border: '1px solid #E1BEE7',
              borderRadius: 2
            }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600, 
                color: '#8E44AD',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <TrendingUpIcon sx={{ fontSize: 20 }} />
                {getReportTypeTitle(reportType)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#7B1FA2', mt: 0.5 }}>
                Based on the current data analysis, here are our recommendations:
              </Typography>
            </Paper>

            {/* Suggestions List */}
            <List sx={{ p: 0 }}>
              {suggestions.map((suggestion, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      bgcolor: '#FFFFFF',
                      borderRadius: 2,
                      mb: 2,
                      border: '1px solid #E0E0E0',
                      '&:hover': {
                        bgcolor: '#F8F9FA',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      {getSuggestionIcon(suggestion.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600, 
                            color: '#2C3E50',
                            flex: 1
                          }}>
                            {suggestion.title}
                          </Typography>
                          <Chip
                            label={suggestion.priority?.toUpperCase() || 'MEDIUM'}
                            size="small"
                            sx={{
                              bgcolor: getPriorityColor(suggestion.priority),
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ 
                            color: '#7F8C8D', 
                            mb: 2,
                            lineHeight: 1.5
                          }}>
                            {suggestion.description}
                          </Typography>
                          
                          {/* Action Items */}
                          {suggestion.actions && suggestion.actions.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ 
                                color: '#2C3E50', 
                                fontWeight: 600, 
                                mb: 1 
                              }}>
                                Recommended Actions:
                              </Typography>
                              <List dense sx={{ p: 0, bgcolor: '#F8F9FA', borderRadius: 1 }}>
                                {suggestion.actions.map((action, actionIndex) => (
                                  <ListItem key={actionIndex} sx={{ py: 0.5, px: 2 }}>
                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                      <Box sx={{ 
                                        width: 6, 
                                        height: 6, 
                                        borderRadius: '50%', 
                                        bgcolor: '#8E44AD' 
                                      }} />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2" sx={{ 
                                          color: '#2C3E50',
                                          fontSize: '0.85rem'
                                        }}>
                                          {action}
                                        </Typography>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < suggestions.length - 1 && (
                    <Divider sx={{ my: 1, opacity: 0.3 }} />
                  )}
                </React.Fragment>
              ))}
            </List>

            {/* Summary */}
            <Paper sx={{ 
              p: 2, 
              mt: 3, 
              bgcolor: '#E8F5E8', 
              border: '1px solid #C8E6C9',
              borderRadius: 2
            }}>
              <Typography variant="body2" sx={{ 
                color: '#2E7D32',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                💡 These suggestions are generated based on current data patterns and best practices. 
                Consider implementing them to improve system efficiency and user experience.
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        bgcolor: '#FFFFFF', 
        borderTop: '1px solid #E0E0E0',
        px: 3,
        py: 2
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: '#7F8C8D',
            borderColor: '#BDC3C7',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            '&:hover': {
              borderColor: '#8E44AD',
              color: '#8E44AD',
              backgroundColor: '#F8F4FF'
            }
          }}
        >
          Close
        </Button>
        {suggestions.length > 0 && (
          <Button
            variant="contained"
            sx={{
              bgcolor: '#8E44AD',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                bgcolor: '#7D3C98'
              }
            }}
            onClick={() => {
              // Here you could implement functionality to export suggestions
              console.log('Export suggestions:', suggestions);
            }}
          >
            Export Suggestions
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SuggestionsDialog;
