import React from 'react';
import {
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import {
  formatDateDisplay,
  getDeadlineStatus,
  getRelativeDeadlineText,
} from '../utils/dateUtils';

const TaskTable = ({ tasks, onEdit, onDelete, onAddNew }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon-circle">
          <Inbox size={36} />
        </div>
        <h5 className="fw-bold mb-1">No tasks found</h5>
        <p className="text-secondary small mb-3" style={{ maxWidth: '380px', margin: '0 auto' }}>
          You have no academic tasks matching your current view. Click the button below to add your first assignment or exam deadline!
        </p>
        <button className="btn btn-primary-custom" onClick={onAddNew}>
          Add Your First Task
        </button>
      </div>
    );
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <span className="badge-modern badge-priority-high">High</span>;
      case 'Medium':
        return <span className="badge-modern badge-priority-medium">Medium</span>;
      case 'Low':
        return <span className="badge-modern badge-priority-low">Low</span>;
      default:
        return <span className="badge-modern badge-priority-medium">{priority}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="badge-modern badge-status-pending">
            <Clock size={12} /> Pending
          </span>
        );
      case 'In Progress':
        return (
          <span className="badge-modern badge-status-inprogress">
            <Clock size={12} /> In Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="badge-modern badge-status-completed">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      default:
        return <span className="badge-modern bg-light text-dark">{status}</span>;
    }
  };

  const getDeadlineIndicator = (deadline, status) => {
    const deadlineInfo = getDeadlineStatus(deadline, status);
    const relativeText = getRelativeDeadlineText(deadline, status);

    switch (deadlineInfo.key) {
      case 'Overdue':
        return (
          <span className="badge-modern badge-status-overdue" title={relativeText}>
            <AlertCircle size={12} /> Overdue
          </span>
        );
      case 'Due Today':
        return (
          <span className="badge-modern badge-status-duetoday" title="Due today">
            <AlertTriangle size={12} /> Due Today
          </span>
        );
      case 'Upcoming':
        return (
          <span className="badge-modern badge-status-upcoming" title={relativeText}>
            <Calendar size={12} /> Upcoming
          </span>
        );
      case 'Completed':
        return (
          <span className="badge-modern badge-status-completed" title="Completed">
            <CheckCircle2 size={12} /> Completed
          </span>
        );
      default:
        return <span className="badge-modern bg-light">{deadlineInfo.label}</span>;
    }
  };

  return (
    <div className="table-responsive">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Task Name</th>
            <th>Subject</th>
            <th>Deadline</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Indicator</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const relativeTime = getRelativeDeadlineText(task.deadline, task.status);

            return (
              <tr key={task._id} className={isCompleted ? 'opacity-75' : ''}>
                {/* Task Name */}
                <td>
                  <div className={`fw-semibold ${isCompleted ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                    {task.taskName}
                  </div>
                </td>

                {/* Subject */}
                <td>
                  <span className="badge bg-light text-secondary border px-2 py-1 fw-medium">
                    {task.subject}
                  </span>
                </td>

                {/* Deadline */}
                <td>
                  <div className="d-flex flex-column">
                    <span className="fw-medium text-secondary" style={{ fontSize: '0.88rem' }}>
                      {formatDateDisplay(task.deadline)}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {relativeTime}
                    </span>
                  </div>
                </td>

                {/* Priority */}
                <td>{getPriorityBadge(task.priority)}</td>

                {/* Status */}
                <td>{getStatusBadge(task.status)}</td>

                {/* Deadline Indicator */}
                <td>{getDeadlineIndicator(task.deadline, task.status)}</td>

                {/* Actions */}
                <td className="text-end">
                  <div className="d-inline-flex gap-1">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => onEdit(task)}
                      title="Edit task"
                      aria-label={`Edit ${task.taskName}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => onDelete(task)}
                      title="Delete task"
                      aria-label={`Delete ${task.taskName}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
