import React from 'react';
import './Sidebar.css';

const Sidebar = ({ items, activeId, onItemClick }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <ul className="sidebar-menu">
          {items.map((item, index) => (
            <li key={index} className="sidebar-item">
              <button
                className={`sidebar-link ${activeId === item.id ? 'active' : ''}`}
                onClick={() => onItemClick(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
