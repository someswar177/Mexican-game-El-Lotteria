import React, { useEffect } from 'react';
import '../CSS/Popup.css';

const Popup = ({ message, onClose }) => {
  useEffect(() => {
    // Automatically close the popup after 4 seconds
    const timer = setTimeout(onClose, 3000);

    // Close popup when clicking outside of it
    const handleClickOutside = (e) => {
      if (e.target.className === 'popup-overlay') {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Popup;
