// src/hooks/useReadAloud.js
import { useState, useEffect, useCallback } from 'react';

export const useReadAloud = () => {
  const [isReading, setIsReading] = useState(false);
  const [currentReadingElement, setCurrentReadingElement] = useState(null);

  // Get read aloud settings from localStorage
  const getReadAloudSettings = useCallback(() => {
    try {
      const settings = localStorage.getItem('accessibilitySettings');
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Error loading read aloud settings:', error);
      return {};
    }
  }, []);

  // Read aloud function
  const readAloud = useCallback(async (text, element = null) => {
    const settings = getReadAloudSettings();
    
    if (!settings.readAloud || !text) return;
    
    try {
      setIsReading(true);
      setCurrentReadingElement(element);
      
      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.readAloudSpeed || 1.0;
      utterance.pitch = settings.speechPitch || 1.0;
      utterance.volume = settings.speechVolume || 1.0;
      
      // Set voice if available
      if (settings.currentVoice && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === settings.currentVoice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      // Handle speech events
      utterance.onend = () => {
        setIsReading(false);
        setCurrentReadingElement(null);
      };
      
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        setIsReading(false);
        setCurrentReadingElement(null);
      };
      
      // Speak the text
      if (window.speechSynthesis) {
        window.speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      console.error('Error reading aloud:', error);
      setIsReading(false);
      setCurrentReadingElement(null);
    }
  }, [getReadAloudSettings]);

  // Stop reading function
  const stopReading = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsReading(false);
    setCurrentReadingElement(null);
  }, []);

  // Read specific element
  const readElement = useCallback((element) => {
    if (!element) return;
    
    const text = element.innerText || element.textContent;
    if (text && text.trim().length > 10) {
      readAloud(text, element);
    }
  }, [readAloud]);

  // Read page content
  const readPage = useCallback(() => {
    const mainContent = document.querySelector('main') || 
                       document.querySelector('[role="main"]') || 
                       document.body;
    
    if (mainContent) {
      const textContent = mainContent.innerText || mainContent.textContent;
      if (textContent && textContent.trim()) {
        readAloud(textContent.substring(0, 2000) + '...');
      }
    }
  }, [readAloud]);

  return {
    isReading,
    currentReadingElement,
    readAloud,
    stopReading,
    readElement,
    readPage,
    getReadAloudSettings
  };
};

export default useReadAloud;
