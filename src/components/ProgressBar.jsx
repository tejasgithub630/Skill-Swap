import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ label, progress, colorClass = 'bg-primary' }) => {
  return (
    <div className="progress-container">
      <div className="progress-header flex justify-between items-center">
        <span className="progress-label">{label}</span>
        <span className="progress-percentage">{progress}%</span>
      </div>
      <div className="progress-track">
        <div 
          className={`progress-fill ${colorClass}`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
