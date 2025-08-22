import React from 'react';

const Notification = ({ message, type = 'success', onClose }) => {
  const bgClass = type === 'success' ? 'bg-success' : 'bg-danger';
  const textClass = type === 'success' ? 'text-white' : 'text-white';

  return (
    <div className={`alert ${bgClass} ${textClass} alert-dismissible fade show position-fixed`} 
         style={{ top: '20px', right: '20px', zIndex: 1050, minWidth: '300px' }}>
      <strong>{type === 'success' ? 'Success!' : 'Error!'}</strong> {message}
      <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
    </div>
  );
};

export default Notification;
