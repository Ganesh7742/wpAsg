import React from 'react';
import { Menu, Calendar, CheckCircle2, AlertCircle, Sun, Moon } from 'lucide-react';

const Navbar = ({ activeView, onToggleSidebar, isConnected, theme, onToggleTheme }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const getHeaderInfo = () => {
    switch (activeView) {
      case 'dashboard':
        return {
          title: 'Overview Dashboard',
          subtitle: 'Monitor your deadlines, priority tasks, and study progress',
        };
      case 'manage-tasks':
        return {
          title: 'Academic Task Manager',
          subtitle: 'Add, update, track, and prioritize your coursework',
        };
      case 'calendar':
        return {
          title: 'Academic Calendar & Schedule',
          subtitle: 'Visual monthly and weekly schedule of coursework submissions and milestones',
        };
      case 'pomodoro':
        return {
          title: 'Pomodoro Study Focus Timer',
          subtitle: 'Boost deep work retention with structured 25-minute study intervals',
        };
      case 'api-docs':
        return {
          title: 'REST API Documentation & Explorer',
          subtitle: 'Complete reference & live interactive playground for all backend endpoints',
        };
      default:
        return {
          title: 'StudyPulse',
          subtitle: 'Student Workload Management System',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <header className="app-header">
      {/* Title & Mobile Toggle */}
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-outline-secondary d-lg-none btn-action"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h5 className="mb-0 fw-bold">{headerInfo.title}</h5>
          <span className={`small ${theme === 'dark' ? 'text-light-emphasis' : 'text-secondary'}`}>
            {headerInfo.subtitle}
          </span>
        </div>
      </div>

      {/* Right-side Utilities */}
      <div className="d-flex align-items-center gap-3">
        {/* Date Display */}
        <div className={`d-none d-md-flex align-items-center gap-2 px-3 py-1.5 rounded-pill border small ${
          theme === 'dark' ? 'bg-dark text-light border-secondary' : 'bg-light text-secondary'
        }`}>
          <Calendar size={14} className="text-primary" />
          <span>{currentDate}</span>
        </div>

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            type="button"
            className={`btn btn-action rounded-circle d-flex align-items-center justify-content-center ${
              theme === 'dark' ? 'btn-outline-light' : 'btn-outline-secondary'
            }`}
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
            style={{ width: '38px', height: '38px', flexShrink: 0 }}
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-warning" />
            ) : (
              <Moon size={17} className="text-secondary" />
            )}
          </button>
        )}

        {/* API Connection Status */}
        <div
          className={`badge rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-2 ${
            isConnected
              ? 'bg-success-subtle text-success border border-success-subtle'
              : 'bg-danger-subtle text-danger border border-danger-subtle'
          }`}
          title={isConnected ? 'Backend API is connected' : 'Backend API connection failed'}
        >
          {isConnected ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span className="small fw-semibold d-none d-sm-inline">
            {isConnected ? 'API Connected' : 'Server Offline'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;