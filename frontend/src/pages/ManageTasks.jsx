import React, { useState, useMemo } from 'react';
import {
  Plus,
  ArrowUpDown,
  Search,
  Filter,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import TaskTable from '../components/TaskTable';
import TaskForm from '../components/TaskForm';

const ManageTasks = ({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  isSubmitting,
}) => {
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Sorting and Filtering state
  // PRD 6.4 specifies sorting by priority and deadline
  const [sortBy, setSortBy] = useState('deadline-asc'); // 'deadline-asc', 'deadline-desc', 'priority-desc', 'priority-asc'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Priority ranking for sorting: High=3, Medium=2, Low=1
  const priorityWeight = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const handleOpenAdd = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = async (formData) => {
    if (editingTask && editingTask._id) {
      await onUpdateTask(editingTask._id, formData);
    } else {
      await onCreateTask(formData);
    }
    handleCloseForm();
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    await onDeleteTask(taskToDelete._id);
    setTaskToDelete(null);
  };

  // Filtered and Sorted tasks
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by search query (taskName or subject)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.taskName.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q)
      );
    }

    // Filter by status tab
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Sort as per PRD 6.4
    result.sort((a, b) => {
      if (sortBy === 'deadline-asc') {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sortBy === 'deadline-desc') {
        return new Date(b.deadline) - new Date(a.deadline);
      }
      if (sortBy === 'priority-desc') {
        // High -> Medium -> Low
        const weightDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        if (weightDiff !== 0) return weightDiff;
        // Secondary sort: earliest deadline first
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sortBy === 'priority-asc') {
        // Low -> Medium -> High
        const weightDiff = (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
        if (weightDiff !== 0) return weightDiff;
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return 0;
    });

    return result;
  }, [tasks, sortBy, searchTerm, statusFilter]);

  return (
    <div className="page-body">
      {/* Page Title & Add Button */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Manage Coursework Tasks</h2>
          <p className="text-secondary mb-0">
            View, filter, sort, update, and manage all your academic assignments and tests.
          </p>
        </div>
        <button
          className="btn btn-primary-custom"
          onClick={handleOpenAdd}
          id="btn-add-task"
        >
          <Plus size={18} /> Add Task
        </button>
      </div>

      {/* Main Table Card */}
      <div className="content-card mb-4">
        {/* Controls Toolbar: Sorting & Filtering as required in PRD 6.4 & 8 */}
        <div className="content-card-header flex-column flex-md-row gap-3">
          {/* Search Input */}
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-light text-muted border-end-0">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search task or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search tasks"
            />
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 ms-md-auto">
            {/* Status Filter tabs */}
            <div className="btn-group btn-group-sm" role="group" aria-label="Status filters">
              <button
                type="button"
                className={`btn ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({tasks.length})
              </button>
              <button
                type="button"
                className={`btn ${statusFilter === 'Pending' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter('Pending')}
              >
                Pending
              </button>
              <button
                type="button"
                className={`btn ${statusFilter === 'In Progress' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter('In Progress')}
              >
                In Progress
              </button>
              <button
                type="button"
                className={`btn ${statusFilter === 'Completed' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter('Completed')}
              >
                Completed
              </button>
            </div>

            {/* Sorting Control as per PRD 6.4 */}
            <div className="d-flex align-items-center gap-2">
              <ArrowUpDown size={16} className="text-muted d-none d-sm-inline" />
              <select
                className="form-select form-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: 'auto', minWidth: '190px' }}
                aria-label="Sort tasks by priority or deadline"
                id="select-sort-tasks"
              >
                <option value="deadline-asc">Deadline: Earliest First</option>
                <option value="deadline-desc">Deadline: Latest First</option>
                <option value="priority-desc">Priority: High &rarr; Low</option>
                <option value="priority-asc">Priority: Low &rarr; High</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'all') && (
              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                title="Reset filters"
              >
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Task Table with CRUD actions */}
        <TaskTable
          tasks={processedTasks}
          onEdit={handleOpenEdit}
          onDelete={(task) => setTaskToDelete(task)}
          onAddNew={handleOpenAdd}
        />
      </div>

      {/* Add / Edit Task Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal as per PRD 6.2 */}
      {taskToDelete && (
        <div className="modal-backdrop-custom" onClick={() => setTaskToDelete(null)}>
          <div className="modal-dialog-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom border-bottom-0 pb-0">
              <div className="d-flex align-items-center gap-2 text-danger">
                <div className="p-2 bg-danger-subtle rounded-circle">
                  <AlertTriangle size={20} />
                </div>
                <h5 className="modal-title fw-bold mb-0">Confirm Delete</h5>
              </div>
            </div>
            <div className="modal-body-custom pt-3">
              <p className="mb-2">
                Are you sure you want to delete this academic task?
              </p>
              <div className="p-3 bg-light rounded border">
                <div className="fw-bold text-dark">{taskToDelete.taskName}</div>
                <div className="small text-muted">
                  Subject: {taskToDelete.subject} &bull; Priority: {taskToDelete.priority}
                </div>
              </div>
              <p className="small text-danger mt-2 mb-0">
                This action cannot be undone and will permanently remove the record from MongoDB.
              </p>
            </div>
            <div className="modal-footer-custom">
              <button
                type="button"
                className="btn btn-outline-secondary px-3"
                onClick={() => setTaskToDelete(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTasks;
