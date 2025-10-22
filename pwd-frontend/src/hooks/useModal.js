import { useState } from 'react';

export const useModal = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: 'Success!',
    message: '',
    type: 'success',
    buttonText: 'Continue',
    onClose: null,
    requireCheckbox: false,
    checkboxLabel: 'I have copied the reference number',
    checkboxChecked: false,
    onCheckboxChange: null
  });

  const showModal = (config) => {
    setModalConfig({
      title: config.title || 'Success!',
      message: config.message || '',
      type: config.type || 'success',
      buttonText: config.buttonText || 'Continue',
      onClose: config.onClose || null,
      requireCheckbox: config.requireCheckbox || false,
      checkboxLabel: config.checkboxLabel || 'I have copied the reference number',
      checkboxChecked: config.checkboxChecked || false,
      onCheckboxChange: config.onCheckboxChange || null
    });
    setModalOpen(true);
  };

  const hideModal = () => {
    setModalOpen(false);
    // Reset config after a short delay to allow for smooth closing animation
    setTimeout(() => {
      setModalConfig({
        title: 'Success!',
        message: '',
        type: 'success',
        buttonText: 'Continue',
        onClose: null,
        requireCheckbox: false,
        checkboxLabel: 'I have copied the reference number',
        checkboxChecked: false,
        onCheckboxChange: null
      });
    }, 300);
  };

  return {
    modalOpen,
    modalConfig,
    showModal,
    hideModal
  };
};
