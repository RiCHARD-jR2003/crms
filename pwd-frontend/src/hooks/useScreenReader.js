// src/hooks/useScreenReader.js
import { useEffect, useCallback, useState } from 'react';
import screenReaderService from '../services/screenReaderService';

export const useScreenReader = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [currentVoice, setCurrentVoice] = useState(null);
  const [speechSettings, setSpeechSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    language: 'en'
  });

  // Initialize screen reader service
  useEffect(() => {
    const initializeScreenReader = async () => {
      try {
        const initialized = await screenReaderService.initialize();
        setIsInitialized(initialized);
        
        if (initialized) {
          const capabilities = await screenReaderService.getCapabilities();
          setIsSupported(capabilities.supported);
          setIsEnabled(capabilities.enabled);
          setIsSpeaking(capabilities.speaking);
          
          // Load voices - wait a bit for voices to load
          setTimeout(() => {
            setAvailableVoices(screenReaderService.availableVoices);
          }, 1000);
        }
      } catch (error) {
        console.error('Error initializing screen reader:', error);
      }
    };

    initializeScreenReader();
  }, []);

  // Check if screen reader is enabled
  const checkScreenReaderStatus = useCallback(async () => {
    try {
      const enabled = await screenReaderService.isScreenReaderEnabled();
      setIsEnabled(enabled);
      return enabled;
    } catch (error) {
      console.error('Error checking screen reader status:', error);
      return false;
    }
  }, []);

  // Speak text if screen reader is enabled
  const speak = useCallback(async (text, options = {}) => {
    if (!isEnabled) {
      console.warn('Screen reader is not enabled');
      return false;
    }

    try {
      const success = await screenReaderService.speak(text, options);
      if (success) {
        setIsSpeaking(true);
        // Reset speaking state after a delay
        setTimeout(() => setIsSpeaking(false), 1000);
      }
      return success;
    } catch (error) {
      console.error('Error speaking text:', error);
      return false;
    }
  }, [isEnabled]);

  // Stop current speech
  const stop = useCallback(async () => {
    try {
      const success = await screenReaderService.stop();
      if (success) {
        setIsSpeaking(false);
      }
      return success;
    } catch (error) {
      console.error('Error stopping screen reader:', error);
      return false;
    }
  }, []);

  // Pause current speech
  const pause = useCallback(async () => {
    try {
      return await screenReaderService.pause();
    } catch (error) {
      console.error('Error pausing screen reader:', error);
      return false;
    }
  }, []);

  // Resume paused speech
  const resume = useCallback(async () => {
    try {
      return await screenReaderService.resume();
    } catch (error) {
      console.error('Error resuming screen reader:', error);
      return false;
    }
  }, []);

  // Set speech rate
  const setRate = useCallback(async (rate) => {
    try {
      return await screenReaderService.setRate(rate);
    } catch (error) {
      console.error('Error setting speech rate:', error);
      return false;
    }
  }, []);

  // Set speech pitch
  const setPitch = useCallback(async (pitch) => {
    try {
      return await screenReaderService.setPitch(pitch);
    } catch (error) {
      console.error('Error setting speech pitch:', error);
      return false;
    }
  }, []);

  // Set speech volume
  const setVolume = useCallback(async (volume) => {
    try {
      return await screenReaderService.setVolume(volume);
    } catch (error) {
      console.error('Error setting speech volume:', error);
      return false;
    }
  }, []);

  // Announce page navigation
  const announcePageChange = useCallback(async (pageName) => {
    if (!isEnabled) return false;
    return await screenReaderService.announcePageChange(pageName);
  }, [isEnabled]);

  // Announce errors
  const announceError = useCallback(async (errorMessage) => {
    if (!isEnabled) return false;
    return await screenReaderService.announceError(errorMessage);
  }, [isEnabled]);

  // Announce success messages
  const announceSuccess = useCallback(async (successMessage) => {
    if (!isEnabled) return false;
    return await screenReaderService.announceSuccess(successMessage);
  }, [isEnabled]);

  // Announce button clicks
  const announceButtonClick = useCallback(async (buttonName) => {
    if (!isEnabled) return false;
    return await screenReaderService.announceButtonClick(buttonName);
  }, [isEnabled]);

  // Announce dialog changes
  const announceDialogOpen = useCallback(async (dialogName) => {
    if (!isEnabled) return false;
    return await screenReaderService.announceDialogOpen(dialogName);
  }, [isEnabled]);

  const announceDialogClose = useCallback(async (dialogName) => {
    if (!isEnabled) return false;
    return await screenReaderService.announceDialogClose(dialogName);
  }, [isEnabled]);

  // Announce form field changes
  const announceFieldChange = useCallback(async (fieldName, value) => {
    if (!isEnabled) return false;
    return await screenReaderService.announceFieldChange(fieldName, value);
  }, [isEnabled]);

  // Announce table row selection
  const announceRowSelection = useCallback(async (rowNumber, content) => {
    if (!isEnabled) return false;
    return await screenReaderService.announceRowSelection(rowNumber, content);
  }, [isEnabled]);

  // Test screen reader
  const testScreenReader = useCallback(async () => {
    if (!isEnabled) return false;
    return await screenReaderService.testScreenReader();
  }, [isEnabled]);

  // TTS Controls
  const setTTSEnabled = useCallback((enabled) => {
    screenReaderService.setTTSEnabled(enabled);
    setIsTTSEnabled(enabled);
  }, []);

  const updateSpeechSettings = useCallback((settings) => {
    screenReaderService.setSpeechSettings(settings);
    setSpeechSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const setVoice = useCallback((voice) => {
    screenReaderService.setVoice(voice);
    setCurrentVoice(voice);
  }, []);

  const getVoicesForLanguage = useCallback((languageCode) => {
    return screenReaderService.getVoicesForLanguage(languageCode);
  }, []);

  const getRecommendedVoice = useCallback((languageCode) => {
    return screenReaderService.getRecommendedVoice(languageCode);
  }, []);

  const testVoice = useCallback(async (voice) => {
    if (!isTTSEnabled) return false;
    const testText = 'This is a test of the selected voice.';
    return await screenReaderService.speak(testText, { voice });
  }, [isTTSEnabled]);

  const refreshVoices = useCallback(async () => {
    try {
      await screenReaderService.loadWebVoices();
      setAvailableVoices(screenReaderService.availableVoices);
    } catch (error) {
      console.error('Error refreshing voices:', error);
    }
  }, []);

  // Get capabilities
  const getCapabilities = useCallback(async () => {
    try {
      return await screenReaderService.getCapabilities();
    } catch (error) {
      console.error('Error getting capabilities:', error);
      return {
        supported: false,
        enabled: false,
        speaking: false
      };
    }
  }, []);

  return {
    // State
    isEnabled,
    isSupported,
    isInitialized,
    isSpeaking,
    isTTSEnabled,
    availableVoices,
    currentVoice,
    speechSettings,
    
    // Methods
    speak,
    stop,
    pause,
    resume,
    setRate,
    setPitch,
    setVolume,
    checkScreenReaderStatus,
    
    // TTS Controls
    setTTSEnabled,
    updateSpeechSettings,
    setVoice,
    getVoicesForLanguage,
    getRecommendedVoice,
    testVoice,
    refreshVoices,
    
    // Announcement methods
    announcePageChange,
    announceError,
    announceSuccess,
    announceButtonClick,
    announceDialogOpen,
    announceDialogClose,
    announceFieldChange,
    announceRowSelection,
    
    // Utility methods
    testScreenReader,
    getCapabilities
  };
};
