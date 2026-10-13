import React from 'react';

const SummaryCard = ({ title, count, description, icon: Icon, type, onClick }) => {
  return (
    <div
      className={`stat-card stat-${type} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card-header">
        <span className="stat-label">{title}</span>
        <div className="stat-icon-wrapper">
          {Icon && <Icon size={22} />}
        </div>
      </div>
      <div className="stat-value">{count}</div>
      <div className="stat-desc">{description}</div>
    </div>
  );
};

export default SummaryCard;
