// src/components/shared/HelpGuide.js
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';

/**
 * HelpGuide Component - Shows step-by-step guides for PWD members
 */
function HelpGuide({ title = "Need Help?", steps = [], type = "info", icon: Icon = HelpIcon }) {
  const [expanded, setExpanded] = useState(false);

  if (!steps || steps.length === 0) return null;

  const getColorScheme = () => {
    switch (type) {
      case 'success':
        return { bgcolor: '#e8f5e9', color: '#2e7d32', borderColor: '#4caf50' };
      case 'warning':
        return { bgcolor: '#fff3e0', color: '#e65100', borderColor: '#ff9800' };
      case 'error':
        return { bgcolor: '#ffebee', color: '#c62828', borderColor: '#f44336' };
      default:
        return { bgcolor: '#e3f2fd', color: '#1565c0', borderColor: '#2196f3' };
    }
  };

  const colors = getColorScheme();

  return (
    <Paper
      sx={{
        mb: 2,
        border: `2px solid ${colors.borderColor}`,
        borderRadius: 2,
        backgroundColor: colors.bgcolor,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Accordion 
        expanded={expanded} 
        onChange={(e, isExpanded) => setExpanded(isExpanded)}
        sx={{ 
          boxShadow: 'none',
          backgroundColor: 'transparent',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: colors.color }} />}
          sx={{
            minHeight: 56,
            '&.Mui-expanded': { minHeight: 56 },
            px: 2,
            py: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            <Icon sx={{ color: colors.color, fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.color }}>
              {title}
            </Typography>
            <Chip 
              label={`${steps.length} Steps`} 
              size="small" 
              sx={{ 
                backgroundColor: colors.borderColor,
                color: 'white',
                fontWeight: 600
              }} 
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 3, pb: 3 }}>
          <List sx={{ py: 0 }}>
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: colors.borderColor,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}
                    >
                      {index + 1}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.color, mb: 0.5 }}>
                        {step.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>
                        {step.description}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < steps.length - 1 && <Divider variant="inset" component="li" sx={{ ml: 7 }} />}
              </React.Fragment>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}

/**
 * HelpTooltip Component - Shows a tooltip with help text
 */
export function HelpTooltip({ title, description, placement = "top" }) {
  return (
    <Tooltip
      title={
        <Box sx={{ p: 1 }}>
          {title && (
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: 'white' }}>
              {title}
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: 'white' }}>
            {description}
          </Typography>
        </Box>
      }
      placement={placement}
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            maxWidth: 300,
            fontSize: '0.875rem'
          }
        },
        arrow: {
          sx: { color: 'rgba(0, 0, 0, 0.9)' }
        }
      }}
    >
      <IconButton size="small" sx={{ color: '#0b87ac', p: 0.5 }}>
        <InfoIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

/**
 * InfoCard Component - Shows helpful information card
 */
export function InfoCard({ title, description, icon: Icon = InfoIcon, variant = "info" }) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#e8f5e9', color: '#2e7d32', icon: '#4caf50' };
      case 'warning':
        return { bg: '#fff3e0', color: '#e65100', icon: '#ff9800' };
      case 'error':
        return { bg: '#ffebee', color: '#c62828', icon: '#f44336' };
      default:
        return { bg: '#e3f2fd', color: '#1565c0', icon: '#2196f3' };
    }
  };

  const colors = getColors();

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.icon}`,
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Icon sx={{ color: colors.icon, fontSize: 32, flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.color, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>
            {description}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default HelpGuide;


