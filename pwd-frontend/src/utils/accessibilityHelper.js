// src/utils/accessibilityHelper.js
import screenReaderService from '../services/screenReaderService';

/**
 * Check if a user has visual impairment based on their disability type
 */
export const isVisualImpairment = (user) => {
  if (!user) return false;
  
  const disabilityType = user?.pwdMember?.disabilityType || 
                         user?.pwd_member?.disabilityType || 
                         user?.disabilityType || 
                         '';
  
  if (!disabilityType) return false;
  
  const lowerDisability = disabilityType.toLowerCase();
  return (
    lowerDisability.includes('visual') ||
    lowerDisability.includes('blind') ||
    lowerDisability.includes('vision') ||
    lowerDisability.includes('sight')
  );
};

/**
 * Automatically enable TTS and Read Aloud accessibility features for visually impaired users
 */
export const enableAccessibilityForVisualImpairment = async (user) => {
  if (!isVisualImpairment(user)) {
    return false;
  }

  try {
    console.log('Enabling accessibility features for visually impaired user');
    
    // Enable TTS in screenReaderService
    screenReaderService.setTTSEnabled(true);
    
    // Load existing accessibility settings or create new ones
    let accessibilitySettings = {};
    try {
      const savedSettings = localStorage.getItem('accessibilitySettings');
      if (savedSettings) {
        accessibilitySettings = JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
    
    // Enable screen reader, TTS, and read aloud features
    const updatedSettings = {
      ...accessibilitySettings,
      screenReader: true,
      ttsEnabled: true,
      readAloud: true,
      readAloudSpeed: accessibilitySettings.readAloudSpeed || 1.0,
      readAloudAutoStart: accessibilitySettings.readAloudAutoStart || false,
      speechRate: accessibilitySettings.speechRate || 1.0,
      speechPitch: accessibilitySettings.speechPitch || 1.0,
      speechVolume: accessibilitySettings.speechVolume || 1.0,
    };
    
    // Save updated settings to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(updatedSettings));
    
    // Update speech settings in screenReaderService
    screenReaderService.setSpeechSettings({
      rate: updatedSettings.speechRate || 1.0,
      pitch: updatedSettings.speechPitch || 1.0,
      volume: updatedSettings.speechVolume || 1.0,
      language: updatedSettings.language || 'en'
    });
    
    // Initialize screen reader service if not already initialized
    await screenReaderService.initialize();
    
    console.log('Accessibility features enabled for visually impaired user');
    return true;
  } catch (error) {
    console.error('Error enabling accessibility features:', error);
    return false;
  }
};


