// src/components/shared/VisualImpairmentTTSModal.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  VolumeUp,
  VolumeOff,
  Close,
  Accessibility,
  PlayArrow,
  Stop,
  Speed,
  Language,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useTranslation } from '../../contexts/TranslationContext';
import { useScreenReader } from '../../hooks/useScreenReader';

function VisualImpairmentTTSModal({ open, onClose, onEnableTTS, disabilityType }) {
  const { t } = useTranslation();
  const {
    isEnabled: screenReaderEnabled,
    isSupported: screenReaderSupported,
    isTTSEnabled,
    availableVoices,
    currentVoice,
    speechSettings,
    speak,
    testScreenReader,
    setTTSEnabled,
    updateSpeechSettings,
    setVoice,
    getVoicesForLanguage,
    getRecommendedVoice,
    testVoice,
    refreshVoices,
    getCapabilities
  } = useScreenReader();

  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Check if user has visual impairment
  const isVisuallyImpaired = disabilityType && (
    disabilityType.toLowerCase().includes('visual') ||
    disabilityType.toLowerCase().includes('blind') ||
    disabilityType.toLowerCase().includes('vision') ||
    disabilityType.toLowerCase().includes('sight')
  );

  useEffect(() => {
    if (open && isVisuallyImpaired) {
      // Load current TTS settings
      setTtsEnabled(isTTSEnabled);
      setSpeechRate(speechSettings?.rate || 1.0);
      setSpeechPitch(speechSettings?.pitch || 1.0);
      setSpeechVolume(speechSettings?.volume || 1.0);
      setSelectedVoice(currentVoice || '');
      
      // Refresh available voices
      refreshVoices();
    }
  }, [open, isVisuallyImpaired, isTTSEnabled, speechSettings, currentVoice, refreshVoices]);

  const handleEnableTTS = () => {
    setTTSEnabled(true);
    updateSpeechSettings({
      rate: speechRate,
      pitch: speechPitch,
      volume: speechVolume
    });
    if (selectedVoice) {
      setVoice(selectedVoice);
    }
    onEnableTTS();
    onClose();
  };

  const handleDisableTTS = () => {
    setTTSEnabled(false);
    setTTSEnabled(false);
    onClose();
  };

  const handleTestVoice = async () => {
    setIsTesting(true);
    try {
      const testText = "This is a test of the text-to-speech feature. You can adjust the settings below to find what works best for you.";
      await speak(testText);
    } catch (error) {
      console.error('Error testing voice:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleVoiceChange = (event) => {
    const voiceId = event.target.value;
    setSelectedVoice(voiceId);
    if (voiceId) {
      setVoice(voiceId);
    }
  };

  const handleSpeechRateChange = (event, newValue) => {
    setSpeechRate(newValue);
    updateSpeechSettings({ rate: newValue });
  };

  const handleSpeechPitchChange = (event, newValue) => {
    setSpeechPitch(newValue);
    updateSpeechSettings({ pitch: newValue });
  };

  const handleSpeechVolumeChange = (event, newValue) => {
    setSpeechVolume(newValue);
    updateSpeechSettings({ volume: newValue });
  };

  if (!isVisuallyImpaired) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          '&:focus': {
            outline: '3px solid #ff6b35'
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Accessibility sx={{ color: '#0b87ac', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50' }}>
            Text-to-Speech Assistant
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            We noticed you have a visual impairment. Would you like to enable our text-to-speech feature 
            to help you navigate the dashboard more easily?
          </Typography>
        </Alert>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Setup
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<VolumeUp />}
                onClick={handleEnableTTS}
                sx={{
                  bgcolor: '#0b87ac',
                  '&:hover': { bgcolor: '#0a6b8a' }
                }}
              >
                Enable TTS
              </Button>
              <Button
                variant="outlined"
                startIcon={<VolumeOff />}
                onClick={handleDisableTTS}
                sx={{
                  borderColor: '#0b87ac',
                  color: '#0b87ac',
                  '&:hover': { borderColor: '#0a6b8a', backgroundColor: '#0b87ac15' }
                }}
              >
                Skip for Now
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Advanced Settings
            </Typography>
            
            {/* Voice Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Voice</InputLabel>
              <Select
                value={selectedVoice}
                onChange={handleVoiceChange}
                label="Voice"
              >
                {availableVoices.map((voice) => (
                  <MenuItem key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Speech Rate */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Speech Rate: {speechRate.toFixed(1)}x
              </Typography>
              <Slider
                value={speechRate}
                onChange={handleSpeechRateChange}
                min={0.5}
                max={2.0}
                step={0.1}
                marks={[
                  { value: 0.5, label: '0.5x' },
                  { value: 1.0, label: '1.0x' },
                  { value: 1.5, label: '1.5x' },
                  { value: 2.0, label: '2.0x' }
                ]}
                sx={{ color: '#0b87ac' }}
              />
            </Box>

            {/* Speech Pitch */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Speech Pitch: {speechPitch.toFixed(1)}x
              </Typography>
              <Slider
                value={speechPitch}
                onChange={handleSpeechPitchChange}
                min={0.5}
                max={2.0}
                step={0.1}
                marks={[
                  { value: 0.5, label: '0.5x' },
                  { value: 1.0, label: '1.0x' },
                  { value: 1.5, label: '1.5x' },
                  { value: 2.0, label: '2.0x' }
                ]}
                sx={{ color: '#0b87ac' }}
              />
            </Box>

            {/* Speech Volume */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Speech Volume: {Math.round(speechVolume * 100)}%
              </Typography>
              <Slider
                value={speechVolume}
                onChange={handleSpeechVolumeChange}
                min={0.1}
                max={1.0}
                step={0.1}
                marks={[
                  { value: 0.1, label: '10%' },
                  { value: 0.5, label: '50%' },
                  { value: 1.0, label: '100%' }
                ]}
                sx={{ color: '#0b87ac' }}
              />
            </Box>

            {/* Test Button */}
            <Button
              variant="outlined"
              startIcon={isTesting ? <Stop /> : <PlayArrow />}
              onClick={handleTestVoice}
              disabled={isTesting}
              sx={{
                borderColor: '#0b87ac',
                color: '#0b87ac',
                '&:hover': { borderColor: '#0a6b8a', backgroundColor: '#0b87ac15' }
              }}
            >
              {isTesting ? 'Testing...' : 'Test Voice'}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} sx={{ color: '#666' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default VisualImpairmentTTSModal;
