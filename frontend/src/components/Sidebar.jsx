import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  GraduationCap,
  X,
  Layers,
  Terminal,
  Timer,
  Calendar,
} from 'lucide-react';

const Sidebar = ({ activeView, setActiveView, isOpen, onClose, totalTasks, pendingTasks }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop d-lg-none" onClick={onClose} />}

      <aside className={`app-sidebar ${isOpen ? 'show' : ''}`}>
        {/* Brand header */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <div className="flex-grow-1">
            <div className="brand-title">StudyPulse</div>
            <div className="brand-subtitle">Workload Manager</div>
          </div>
          <button
            className="btn btn-sm btn-light d-lg-none p-1 text-secondary"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          <div className="text-muted small px-3 mb-2 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
            Navigation
          </div>

          <button
            className={`nav-link-custom text-start w-100 ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('dashboard');
              if (onClose) onClose();
            }}
          >
            <LayoutDashboard size={18} />
            <span className="flex-grow-1">Dashboard</span>
          </button>

          <button
            className={`nav-link-custom text-start w-100 ${activeView === 'manage-tasks' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('manage-tasks');
              if (onClose) onClose();
            }}
          >
            <CheckSquare size={18} />
            <span className="flex-grow-1">Manage Tasks</span>
            {pendingTasks > 0 && (
              <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-1 small">
                {pendingTasks}
              </span>
            )}
          </button>

          <button
            className={`nav-link-custom text-start w-100 ${activeView === 'calendar' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('calendar');
              if (onClose) onClose();
            }}
          >
            <Calendar size={18} />
            <span className="flex-grow-1">Calendar</span>
            <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
              Schedule
            </span>
          </button>

          <button
            className={`nav-link-custom text-start w-100 ${activeView === 'pomodoro' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('pomodoro');
              if (onClose) onClose();
            }}
          >
            <Timer size={18} />
            <span className="flex-grow-1">Study Timer</span>
            <span className="badge bg-indigo-subtle text-primary rounded-pill px-2 py-0.5" style={{ fontSize: '0.68rem', background: '#eef2ff' }}>
              Focus
            </span>
          </button>

          <button
            className={`nav-link-custom text-start w-100 ${activeView === 'api-docs' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('api-docs');
              if (onClose) onClose();
            }}
          >
            <Terminal size={18} />
            <span className="flex-grow-1">API Documentation</span>
            <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
              REST
            </span>
          </button>
        </nav>

        {/* Sidebar Footer Info */}
        <div className="sidebar-footer">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Layers size={16} className="text-primary" />
            <span className="small fw-semibold text-secondary">Academic Session</span>
          </div>
          <div className="p-2.5 bg-white rounded border small">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Total Enrolled:</span>
              <span className="fw-bold">{totalTasks} tasks</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Need Action:</span>
              <span className="fw-bold text-warning">{pendingTasks} pending</span>
            </div>
          </div>
          <div className="text-center mt-2">
            <span className="text-muted" style={{ fontSize: '0.7rem' }}>
              Web Programming Assignment
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
