import type { FC } from 'react';

import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
}

export const PageHeader: FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  icon = 'fas fa-rocket',
  iconColor 
}) => {
  const iconStyle = iconColor 
    ? { background: iconColor } 
    : undefined;

  return (
    <header className="spendly-header">
      <div className="header-left">
        <div className="logo-icon" style={iconStyle}>
          <i className={icon}></i>
        </div>
        <div className="header-text">
          <h1 className="app-title">{title}</h1>
          {subtitle && <p className="app-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="header-right">
        <button className="icon-btn">
          <i className="fas fa-search"></i>
        </button>
        <button className="icon-btn">
          <i className="fas fa-bell"></i>
        </button>
      </div>
    </header>
  );
};

