import React from 'react';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Calendar,
  AlertCircle,
  PlusCircle,
  BookOpen,
} from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import {
  formatDateDisplay,
  getRelativeDeadlineText,
  isTaskOverdue,
} from '../utils/dateUtils';

const Dashboard = ({ tasks, onNavigateToTasks, onNavigateToCalendar, onAddNewTask }) => {
  // Dynamic statistics calculations
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'Completed' && isTaskOverdue(t.deadline, t.status)
  ).length;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Upcoming tasks: exclude completed tasks, sorted by earliest deadline
  const upcomingTasks = tasks
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <div className="page-body">
      {/* Welcome Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Academic Overview</h2>
          <p className="text-secondary mb-0">
            Welcome to your workload dashboard. Review your upcoming deadlines and track your progress.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {onNavigateToCalendar && (
            <button
              className="btn btn-outline-primary d-inline-flex align-items-center gap-1.5"
              onClick={onNavigateToCalendar}
            >
              <Calendar size={16} /> Calendar
            </button>
          )}
          <button
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
            onClick={onNavigateToTasks}
          >
            Manage All Tasks <ArrowRight size={16} />
          </button>
          <button className="btn btn-primary-custom" onClick={onAddNewTask}>
            <PlusCircle size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* 4 Summary Cards as per PRD 6.1 */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <SummaryCard
            title="Total Tasks"
            count={totalTasks}
            description="All registered coursework tasks"
            icon={FolderOpen}
            type="total"
            onClick={onNavigateToTasks}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <SummaryCard
            title="Pending Tasks"
            count={pendingTasks}
            description="Tasks awaiting completion"
            icon={Clock}
            type="pending"
            onClick={onNavigateToTasks}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <SummaryCard
            title="Completed Tasks"
            count={completedTasks}
            description="Tasks successfully finished"
            icon={CheckCircle}
            type="completed"
            onClick={onNavigateToTasks}
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <SummaryCard
            title="Overdue Tasks"
            count={overdueTasks}
            description="Incomplete tasks past deadline"
            icon={AlertTriangle}
            type="overdue"
            onClick={onNavigateToTasks}
          />
        </div>
      </div>

      {/* Progress & Workload Breakdown */}
      <div className="row g-4 mb-4">
        {/* Progress Bar Card */}
        <div className="col-lg-4">
          <div className="content-card h-100 d-flex flex-column">
            <div className="content-card-header">
              <h6 className="fw-bold mb-0">Overall Completion Rate</h6>
              <span className="badge bg-primary-subtle text-primary fw-semibold">
                {completionRate}%
              </span>
            </div>
            <div className="content-card-body flex-grow-1 d-flex flex-column justify-content-center">
              <div className="progress mb-3" style={{ height: '12px' }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${completionRate}%` }}
                  aria-valuenow={completionRate}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
              <div className="d-flex justify-content-between small text-secondary mb-3">
                <span>{completedTasks} completed</span>
                <span>{totalTasks - completedTasks} remaining</span>
              </div>

              <div className="p-3 bg-light rounded-3 mt-auto">
                <div className="d-flex justify-content-between align-items-center mb-2 small">
                  <span className="text-secondary">In Progress:</span>
                  <span className="fw-bold text-primary">{inProgressTasks}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2 small">
                  <span className="text-secondary">Pending:</span>
                  <span className="fw-bold text-warning">{pendingTasks}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center small">
                  <span className="text-secondary">Overdue:</span>
                  <span className="fw-bold text-danger">{overdueTasks}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks Section as per PRD 6.1 */}
        <div className="col-lg-8">
          <div className="content-card h-100">
            <div className="content-card-header">
              <div>
                <h6 className="fw-bold mb-0">Upcoming Deadlines</h6>
                <span className="text-muted small">
                  Active academic tasks ordered by closest deadline
                </span>
              </div>
              <button
                className="btn btn-sm btn-link text-decoration-none text-primary fw-semibold"
                onClick={onNavigateToTasks}
              >
                View All &rarr;
              </button>
            </div>
            <div className="content-card-body p-0">
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-5 text-secondary">
                  <CheckCircle size={40} className="text-success mb-2" />
                  <p className="fw-semibold mb-1">All caught up!</p>
                  <p className="small text-muted mb-0">No pending academic deadlines.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {upcomingTasks.map((task) => {
                    const overdue = isTaskOverdue(task.deadline, task.status);
                    const relativeText = getRelativeDeadlineText(task.deadline, task.status);

                    return (
                      <div
                        key={task._id}
                        className="list-group-item d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3 gap-2"
                      >
                        <div className="d-flex align-items-start gap-3">
                          <div
                            className={`p-2 rounded-3 mt-1 ${
                              overdue
                                ? 'bg-danger-subtle text-danger'
                                : 'bg-primary-subtle text-primary'
                            }`}
                          >
                            {overdue ? <AlertCircle size={18} /> : <BookOpen size={18} />}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark">{task.taskName}</div>
                            <div className="d-flex align-items-center gap-2 mt-1 small text-muted">
                              <span>{task.subject}</span>
                              <span>&bull;</span>
                              <span
                                className={`badge ${
                                  task.priority === 'High'
                                    ? 'bg-danger-subtle text-danger'
                                    : task.priority === 'Medium'
                                    ? 'bg-warning-subtle text-warning-emphasis'
                                    : 'bg-light text-secondary'
                                }`}
                              >
                                {task.priority} Priority
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-3 ms-md-auto">
                          <div className="text-md-end">
                            <div className="small fw-semibold text-secondary">
                              <Calendar size={13} className="me-1" />
                              {formatDateDisplay(task.deadline)}
                            </div>
                            <span
                              className={`small fw-medium ${
                                overdue ? 'text-danger' : 'text-primary'
                              }`}
                            >
                              {relativeText}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
