import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', className = '', isLoading = false, ...props }) => {
  return (
    <button 
      className={`custom-btn btn-${variant} ${className} ${isLoading ? 'btn-loading' : ''}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="btn-spinner"></div>
      ) : children}
    </button>
  );
};

export default Button;
