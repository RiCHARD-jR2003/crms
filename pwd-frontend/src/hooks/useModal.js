import { useState } from 'react';

export const useModal = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: 'Success!',
    message: '',
    type: 'success',
    buttonText: 'Continue',
    onClose: null
  });

  const showModal = (config) => {
    setModalConfig({
      title: config.title || 'Success!',
      message: config.message || '',
      type: config.type || 'success',
      buttonText: config.buttonText || 'Continue',
      onClose: config.onClose || null
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
        onClose: null
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
