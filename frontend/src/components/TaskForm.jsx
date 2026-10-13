import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { formatDateInput } from '../utils/dateUtils';

const TaskForm = ({ isOpen, onClose, onSubmit, initialTask = null, isSubmitting = false }) => {
  const isEditing = Boolean(initialTask && initialTask._id);

  const [formData, setFormData] = useState({
    taskName: '',
    subject: '',
    deadline: '',
    priority: 'Medium',
    status: 'Pending',
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (initialTask) {
      setFormData({
        taskName: initialTask.taskName || '',
        subject: initialTask.subject || '',
        deadline: formatDateInput(initialTask.deadline) || '',
        priority: initialTask.priority || 'Medium',
        status: initialTask.status || 'Pending',
      });
    } else {
      setFormData({
        taskName: '',
        subject: '',
        deadline: '',
        priority: 'Medium',
        status: 'Pending',
      });
    }
    setValidationErrors({});
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errors = {};
    if (!formData.taskName.trim()) {
      errors.taskName = 'Task name is required';
    }
    if (!formData.subject.trim()) {
      errors.subject = 'Subject name is required';
    }
    if (!formData.deadline) {
      errors.deadline = 'Deadline date is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      taskName: formData.taskName.trim(),
      subject: formData.subject.trim(),
    });
  };

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <div>
            <h5 className="modal-title fw-bold mb-0">
              {isEditing ? 'Edit Academic Task' : 'Add New Task'}
            </h5>
            <span className="text-muted small">
              {isEditing
                ? 'Update deadline, priority, or completion status'
                : 'Fill in task details to track coursework deadlines'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light p-1 rounded-circle text-secondary"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-custom">
            {/* Task Name */}
            <div className="mb-3">
              <label htmlFor="taskName" className="form-label fw-semibold small text-secondary">
                Task Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${validationErrors.taskName ? 'is-invalid' : ''}`}
                id="taskName"
                name="taskName"
                placeholder="e.g. Complete DBMS Assignment 3"
                value={formData.taskName}
                onChange={handleChange}
                disabled={isSubmitting}
                autoFocus
              />
              {validationErrors.taskName && (
                <div className="invalid-feedback d-flex align-items-center gap-1">
                  <AlertCircle size={13} /> {validationErrors.taskName}
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="mb-3">
              <label htmlFor="subject" className="form-label fw-semibold small text-secondary">
                Subject / Course <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <BookOpen size={16} />
                </span>
                <input
                  type="text"
                  className={`form-control ${validationErrors.subject ? 'is-invalid' : ''}`}
                  id="subject"
                  name="subject"
                  placeholder="e.g. Database Management Systems"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.subject && (
                <div className="invalid-feedback d-block d-flex align-items-center gap-1 mt-1">
                  <AlertCircle size={13} /> {validationErrors.subject}
                </div>
              )}
            </div>

            {/* Deadline */}
            <div className="mb-3">
              <label htmlFor="deadline" className="form-label fw-semibold small text-secondary">
                Deadline Date <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  className={`form-control ${validationErrors.deadline ? 'is-invalid' : ''}`}
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.deadline && (
                <div className="invalid-feedback d-block d-flex align-items-center gap-1 mt-1">
                  <AlertCircle size={13} /> {validationErrors.deadline}
                </div>
              )}
            </div>

            {/* Priority & Status row */}
            <div className="row g-3">
              {/* Priority */}
              <div className="col-md-6">
                <label htmlFor="priority" className="form-label fw-semibold small text-secondary">
                  Priority <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Status */}
              <div className="col-md-6">
                <label htmlFor="status" className="form-label fw-semibold small text-secondary">
                  Status <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer-custom">
            <button
              type="button"
              className="btn btn-outline-secondary px-3"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary-custom px-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner-border-sm animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Update Task'
              ) : (
                'Save Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
