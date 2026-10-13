import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ManageTasks from './pages/ManageTasks';
import CalendarView from './pages/CalendarView';
import ApiDocs from './pages/ApiDocs';
import PomodoroTimer from './pages/PomodoroTimer';
import TaskForm from './components/TaskForm';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from './services/taskService';
import { CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'manage-tasks' | 'calendar' | 'pomodoro' | 'api-docs'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [notification, setNotification] = useState(null);

  // Theme Management (Light / Dark mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('study_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('study_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Quick modal from Dashboard
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await getAllTasks();
      setTasks(data);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setIsConnected(false);
      setErrorMessage(
        'Unable to connect to the backend API. Please make sure the server is running on port 5000 and MongoDB is active.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // CRUD Operations
  const handleCreateTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      const newTask = await createTask(taskData);
      setTasks((prev) => [...prev, newTask]);
      showNotification(`Task "${newTask.taskName}" created successfully!`, 'success');
      return newTask;
    } catch (err) {
      showNotification(err.message || 'Failed to create task', 'danger');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      setIsSubmitting(true);
      const updated = await updateTask(id, taskData);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      showNotification(`Task "${updated.taskName}" updated successfully!`, 'success');
      return updated;
    } catch (err) {
      showNotification(err.message || 'Failed to update task', 'danger');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      setIsSubmitting(true);
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showNotification('Task deleted successfully.', 'info');
    } catch (err) {
      showNotification(err.message || 'Failed to delete task', 'danger');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        totalTasks={tasks.length}
        pendingTasks={pendingCount}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          activeView={activeView}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isConnected={isConnected}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Global Toast / Notification */}
        {notification && (
          <div className="px-4 pt-3">
            <div
              className={`alert alert-${notification.type} alert-dismissible fade show d-flex align-items-center justify-content-between mb-0 py-2.5 px-3 rounded-3 shadow-sm`}
              role="alert"
            >
              <div className="d-flex align-items-center gap-2">
                {notification.type === 'danger' ? (
                  <AlertCircle size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                type="button"
                className="btn-close p-2"
                onClick={() => setNotification(null)}
                aria-label="Close"
              />
            </div>
          </div>
        )}

        {/* Connection Error Banner */}
        {errorMessage && (
          <div className="px-4 pt-3">
            <div className="alert alert-danger d-flex align-items-center justify-content-between rounded-3 py-2.5 px-3 mb-0">
              <div className="d-flex align-items-center gap-2">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
              <button
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                onClick={loadTasks}
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Main View rendering */}
        {isLoading && tasks.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center p-5 text-secondary flex-grow-1">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading tasks...</span>
            </div>
            <p className="fw-medium">Loading coursework records...</p>
          </div>
        ) : activeView === 'dashboard' ? (
          <Dashboard
            tasks={tasks}
            onNavigateToTasks={() => setActiveView('manage-tasks')}
            onNavigateToCalendar={() => setActiveView('calendar')}
            onAddNewTask={() => setQuickAddOpen(true)}
          />
        ) : activeView === 'manage-tasks' ? (
          <ManageTasks
            tasks={tasks}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            isSubmitting={isSubmitting}
          />
        ) : activeView === 'calendar' ? (
          <CalendarView
            tasks={tasks}
            onCreateTask={handleCreateTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onNavigateToPomodoro={() => setActiveView('pomodoro')}
            isSubmitting={isSubmitting}
          />
        ) : activeView === 'pomodoro' ? (
          <PomodoroTimer
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
          />
        ) : (
          <ApiDocs tasks={tasks} />
        )}
      </div>

      {/* Quick Add Modal from Dashboard */}
      <TaskForm
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSubmit={async (data) => {
          await handleCreateTask(data);
          setQuickAddOpen(false);
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default App;
