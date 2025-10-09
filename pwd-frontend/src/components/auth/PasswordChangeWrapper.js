import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PasswordChangeModal from './PasswordChangeModal';
import VisualImpairmentTTSModal from '../shared/VisualImpairmentTTSModal';

const PasswordChangeWrapper = ({ children }) => {
  const { currentUser, updateUser } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTTSModal, setShowTTSModal] = useState(false);
  const [ttsModalShown, setTtsModalShown] = useState(false);

  useEffect(() => {
    // Check if user requires password change
    if (currentUser && currentUser.password_change_required) {
      setShowPasswordModal(true);
    }
  }, [currentUser]);

  const handlePasswordChanged = (updatedUser) => {
    console.log('PasswordChangeWrapper: Password changed, updated user:', updatedUser);
    console.log('PasswordChangeWrapper: Updated user pwd_member:', updatedUser?.pwd_member);
    console.log('PasswordChangeWrapper: Updated user disabilityType:', updatedUser?.disabilityType);
    updateUser(updatedUser);
    setShowPasswordModal(false);
    
    // Check for visual impairment and show TTS modal after password change
    setTimeout(() => {
      console.log('PasswordChangeWrapper: Checking visual impairment after password change');
      checkVisualImpairment(updatedUser);
    }, 1000); // Small delay to ensure user data is updated
  };

  // Check if user has visual impairment and show TTS modal
  const checkVisualImpairment = (user) => {
    console.log('PasswordChangeWrapper: checkVisualImpairment called with user:', user);
    const disabilityType = user?.pwdMember?.disabilityType || user?.pwd_member?.disabilityType || user?.disabilityType;
    console.log('PasswordChangeWrapper: disabilityType:', disabilityType);
    
    const isVisuallyImpaired = disabilityType && (
      disabilityType.toLowerCase().includes('visual') ||
      disabilityType.toLowerCase().includes('blind') ||
      disabilityType.toLowerCase().includes('vision') ||
      disabilityType.toLowerCase().includes('sight')
    );
    
    console.log('PasswordChangeWrapper: isVisuallyImpaired:', isVisuallyImpaired);

    // For testing: Clear localStorage to allow TTS modal to show again
    if (user?.username === 'test_visual_user') {
      localStorage.removeItem('ttsModalShown');
      console.log('PasswordChangeWrapper: Cleared localStorage for test user');
    }

    // Check if TTS modal has been shown before
    const ttsModalShownBefore = localStorage.getItem('ttsModalShown');
    console.log('PasswordChangeWrapper: ttsModalShownBefore:', ttsModalShownBefore);
    console.log('PasswordChangeWrapper: ttsModalShown state:', ttsModalShown);
    
    if (isVisuallyImpaired && !ttsModalShownBefore && !ttsModalShown) {
      console.log('PasswordChangeWrapper: Showing TTS modal');
      setShowTTSModal(true);
      setTtsModalShown(true);
      localStorage.setItem('ttsModalShown', 'true');
    } else {
      console.log('PasswordChangeWrapper: Not showing TTS modal. Reasons:');
      console.log('- isVisuallyImpaired:', isVisuallyImpaired);
      console.log('- ttsModalShownBefore:', ttsModalShownBefore);
      console.log('- ttsModalShown:', ttsModalShown);
    }
  };

  const handleTTSModalClose = () => {
    setShowTTSModal(false);
  };

  const handleEnableTTS = () => {
    // TTS will be enabled by the modal component
    console.log('TTS enabled for visually impaired user');
  };

  const handleModalClose = () => {
    // Don't allow closing the modal if password change is required
    if (currentUser && currentUser.password_change_required) {
      return;
    }
    setShowPasswordModal(false);
  };

  return (
    <>
      {children}
      <PasswordChangeModal
        open={showPasswordModal}
        onClose={handleModalClose}
        onPasswordChanged={handlePasswordChanged}
      />
      
      {/* Visual Impairment TTS Modal */}
      <VisualImpairmentTTSModal
        open={showTTSModal}
        onClose={handleTTSModalClose}
        onEnableTTS={handleEnableTTS}
        disabilityType={currentUser?.pwdMember?.disabilityType || currentUser?.pwd_member?.disabilityType || currentUser?.disabilityType}
      />
    </>
  );
};

export default PasswordChangeWrapper;
