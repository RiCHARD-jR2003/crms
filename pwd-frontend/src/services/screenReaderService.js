// src/services/screenReaderService.js
import { ScreenReader } from '@capacitor/screen-reader';
import { Capacitor } from '@capacitor/core';

class ScreenReaderService {
  constructor() {
    this.isEnabled = false;
    this.isInitialized = false;
    this.isTTSEnabled = false;
    this.currentVoice = null;
    this.availableVoices = [];
    this.speechSettings = {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      language: 'en'
    };
  }

  // Initialize the screen reader service
  async initialize() {
    try {
      // Check if we're running on a native platform
      if (!Capacitor.isNativePlatform()) {
        console.log('Running on web platform - using Web Speech API fallback');
        await this.loadWebVoices();
        this.isInitialized = true;
        return true;
      }

      // Check if screen reader is available on native platform
      const isSupported = await ScreenReader.isSupported();
      console.log('Screen Reader supported:', isSupported);
      
      if (isSupported) {
        this.isInitialized = true;
        return true;
      } else {
        console.warn('Screen Reader not supported on this device');
        return false;
      }
    } catch (error) {
      console.error('Error initializing screen reader:', error);
      return false;
    }
  }

  // Check if screen reader is currently enabled
  async isScreenReaderEnabled() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // On web platform, assume screen reader is available via Web Speech API
      if (!Capacitor.isNativePlatform()) {
        this.isEnabled = true;
        return true;
      }
      
      const isEnabled = await ScreenReader.isEnabled();
      this.isEnabled = isEnabled;
      return isEnabled;
    } catch (error) {
      console.error('Error checking screen reader status:', error);
      return false;
    }
  }

  // Speak text using the native screen reader
  async speak(text, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!text || text.trim() === '') {
        console.warn('No text provided to speak');
        return false;
      }

      // On web platform, use Web Speech API
      if (!Capacitor.isNativePlatform()) {
        return this.speakWithWebSpeechAPI(text, options);
      }

      if (!this.isEnabled) {
        console.warn('Screen reader is not enabled');
        return false;
      }

      // Speak the text using Capacitor Screen Reader API
      await ScreenReader.speak({
        value: text,
        language: options.language || 'en',
        rate: options.rate || 1.0,
        pitch: options.pitch || 1.0,
        volume: options.volume || 1.0
      });

      console.log('Screen reader spoke:', text);
      return true;
    } catch (error) {
      console.error('Error speaking text:', error);
      // Fallback to Web Speech API
      return this.speakWithWebSpeechAPI(text, options);
    }
  }

  // Load available voices for Web Speech API
  async loadWebVoices() {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        this.availableVoices = [];
        resolve();
        return;
      }

      const loadVoices = () => {
        this.availableVoices = speechSynthesis.getVoices();
        console.log('Loaded voices:', this.availableVoices.length);
        resolve();
      };

      // Load voices immediately if available
      if (speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        // Wait for voices to load
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    });
  }

  // Get voices for a specific language
  getVoicesForLanguage(languageCode) {
    const languageMap = {
      'en': ['en-US', 'en-GB', 'en-AU', 'en-CA'],
      'tl': ['fil-PH', 'tl-PH'],
      'ceb': ['ceb-PH'],
      'ilo': ['ilo-PH']
    };

    const preferredLanguages = languageMap[languageCode] || ['en-US'];
    
    return this.availableVoices.filter(voice => 
      preferredLanguages.some(lang => voice.lang.startsWith(lang))
    );
  }

  // Set TTS enabled/disabled
  setTTSEnabled(enabled) {
    this.isTTSEnabled = enabled;
    console.log('TTS enabled:', enabled);
  }

  // Set speech settings
  setSpeechSettings(settings) {
    this.speechSettings = { ...this.speechSettings, ...settings };
    console.log('Speech settings updated:', this.speechSettings);
  }

  // Set voice
  setVoice(voice) {
    this.currentVoice = voice;
    console.log('Voice set to:', voice?.name || 'default');
  }

  // Get recommended voice for language
  getRecommendedVoice(languageCode) {
    const voices = this.getVoicesForLanguage(languageCode);
    if (voices.length > 0) {
      // Prefer female voices for better clarity
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen')
      );
      return femaleVoice || voices[0];
    }
    return null;
  }

  // Fallback method using Web Speech API
  speakWithWebSpeechAPI(text, options = {}) {
    try {
      if (!this.isTTSEnabled) {
        console.log('TTS is disabled');
        return false;
      }

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Use current settings or provided options
        utterance.rate = options.rate || this.speechSettings.rate;
        utterance.pitch = options.pitch || this.speechSettings.pitch;
        utterance.volume = options.volume || this.speechSettings.volume;
        utterance.lang = options.language || this.speechSettings.language;
        
        // Set voice if available
        if (this.currentVoice) {
          utterance.voice = this.currentVoice;
        }
        
        speechSynthesis.speak(utterance);
        console.log('Web Speech API spoke:', text);
        return true;
      } else {
        console.warn('Web Speech API not supported');
        return false;
      }
    } catch (error) {
      console.error('Error with Web Speech API:', error);
      return false;
    }
  }

  // Stop current speech
  async stop() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // On web platform, use Web Speech API
      if (!Capacitor.isNativePlatform()) {
        speechSynthesis.cancel();
        console.log('Web Speech API stopped');
        return true;
      }

      await ScreenReader.stop();
      console.log('Screen reader stopped');
      return true;
    } catch (error) {
      console.error('Error stopping screen reader:', error);
      // Fallback to Web Speech API
      speechSynthesis.cancel();
      return false;
    }
  }

  // Check if currently speaking
  async isSpeaking() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // On web platform, use Web Speech API
      if (!Capacitor.isNativePlatform()) {
        return speechSynthesis.speaking;
      }

      const isSpeaking = await ScreenReader.isSpeaking();
      return isSpeaking;
    } catch (error) {
      console.error('Error checking speaking status:', error);
      return false;
    }
  }

  // Pause current speech
  async pause() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await ScreenReader.pause();
      console.log('Screen reader paused');
      return true;
    } catch (error) {
      console.error('Error pausing screen reader:', error);
      return false;
    }
  }

  // Resume paused speech
  async resume() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await ScreenReader.resume();
      console.log('Screen reader resumed');
      return true;
    } catch (error) {
      console.error('Error resuming screen reader:', error);
      return false;
    }
  }

  // Set speech rate
  async setRate(rate) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Rate should be between 0.1 and 3.0
      const clampedRate = Math.max(0.1, Math.min(3.0, rate));
      await ScreenReader.setRate({ rate: clampedRate });
      console.log('Screen reader rate set to:', clampedRate);
      return true;
    } catch (error) {
      console.error('Error setting speech rate:', error);
      return false;
    }
  }

  // Set speech pitch
  async setPitch(pitch) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Pitch should be between 0.1 and 2.0
      const clampedPitch = Math.max(0.1, Math.min(2.0, pitch));
      await ScreenReader.setPitch({ pitch: clampedPitch });
      console.log('Screen reader pitch set to:', clampedPitch);
      return true;
    } catch (error) {
      console.error('Error setting speech pitch:', error);
      return false;
    }
  }

  // Set speech volume
  async setVolume(volume) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Volume should be between 0.0 and 1.0
      const clampedVolume = Math.max(0.0, Math.min(1.0, volume));
      await ScreenReader.setVolume({ volume: clampedVolume });
      console.log('Screen reader volume set to:', clampedVolume);
      return true;
    } catch (error) {
      console.error('Error setting speech volume:', error);
      return false;
    }
  }

  // Announce important page changes
  async announcePageChange(pageName) {
    const text = `Navigated to ${pageName} page`;
    return await this.speak(text);
  }

  // Announce form validation errors
  async announceError(errorMessage) {
    const text = `Error: ${errorMessage}`;
    return await this.speak(text);
  }

  // Announce success messages
  async announceSuccess(successMessage) {
    const text = `Success: ${successMessage}`;
    return await this.speak(text);
  }

  // Announce form field changes
  async announceFieldChange(fieldName, value) {
    const text = `${fieldName} changed to ${value}`;
    return await this.speak(text);
  }

  // Announce button clicks
  async announceButtonClick(buttonName) {
    const text = `${buttonName} button clicked`;
    return await this.speak(text);
  }

  // Announce dialog open/close
  async announceDialogOpen(dialogName) {
    const text = `${dialogName} dialog opened`;
    return await this.speak(text);
  }

  async announceDialogClose(dialogName) {
    const text = `${dialogName} dialog closed`;
    return await this.speak(text);
  }

  // Announce table row selection
  async announceRowSelection(rowNumber, content) {
    const text = `Row ${rowNumber} selected: ${content}`;
    return await this.speak(text);
  }

  // Test screen reader functionality
  async testScreenReader() {
    const testText = 'Screen reader test successful. This is a test of the screen reader functionality.';
    return await this.speak(testText);
  }

  // Get screen reader capabilities
  async getCapabilities() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // On web platform, check Web Speech API capabilities
      if (!Capacitor.isNativePlatform()) {
        const capabilities = {
          supported: 'speechSynthesis' in window,
          enabled: 'speechSynthesis' in window,
          speaking: speechSynthesis.speaking
        };
        console.log('Web Speech API capabilities:', capabilities);
        return capabilities;
      }

      const capabilities = {
        supported: await ScreenReader.isSupported(),
        enabled: await ScreenReader.isEnabled(),
        speaking: await ScreenReader.isSpeaking()
      };

      console.log('Screen reader capabilities:', capabilities);
      return capabilities;
    } catch (error) {
      console.error('Error getting screen reader capabilities:', error);
      return {
        supported: false,
        enabled: false,
        speaking: false
      };
    }
  }
}

// Create singleton instance
const screenReaderService = new ScreenReaderService();

export default screenReaderService;
