import React, { useState } from 'react';
import {
  Code2,
  Send,
  Copy,
  Check,
  Server,
  Database,
  Globe,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Layers,
} from 'lucide-react';

const API_ENDPOINTS = [
  {
    id: 'health-check',
    method: 'GET',
    path: '/api/health',
    title: 'Server Health Check',
    description: 'Verify backend server status, uptime, and database connectivity.',
    hasParams: false,
    hasBody: false,
    sampleResponse: {
      status: 'OK',
      message: 'Student Workload Management API is running',
      timestamp: '2026-10-11T11:45:00.000Z',
    },
  },
  {
    id: 'get-all-tasks',
    method: 'GET',
    path: '/api/tasks',
    title: 'Retrieve All Tasks',
    description: 'Returns all academic tasks stored in MongoDB, ordered by deadline ascending.',
    hasParams: false,
    hasBody: false,
    sampleResponse: {
      success: true,
      count: 6,
      data: [
        {
          _id: '6acb745350e90fcd0e35814e',
          taskName: 'Complete DBMS Normalization Assignment',
          subject: 'Database Management Systems',
          deadline: '2026-10-13T00:00:00.000Z',
          priority: 'High',
          status: 'In Progress',
          createdAt: '2026-10-11T11:34:43.936Z',
          updatedAt: '2026-10-11T11:34:43.936Z',
        },
      ],
    },
  },
  {
    id: 'create-task',
    method: 'POST',
    path: '/api/tasks',
    title: 'Create New Task',
    description: 'Validates input and inserts a new academic coursework record into MongoDB.',
    hasParams: false,
    hasBody: true,
    defaultBody: JSON.stringify(
      {
        taskName: 'Cloud Computing Architecture Report',
        subject: 'Cloud Computing',
        deadline: '2026-10-24',
        priority: 'High',
        status: 'Pending',
      },
      null,
      2
    ),
    sampleResponse: {
      success: true,
      data: {
        _id: '6acb7499f1a23b456c789012',
        taskName: 'Cloud Computing Architecture Report',
        subject: 'Cloud Computing',
        deadline: '2026-10-24T00:00:00.000Z',
        priority: 'High',
        status: 'Pending',
        createdAt: '2026-10-11T11:46:12.000Z',
        updatedAt: '2026-10-11T11:46:12.000Z',
      },
    },
  },
  {
    id: 'get-task-by-id',
    method: 'GET',
    path: '/api/tasks/:id',
    title: 'Retrieve Task By ID',
    description: 'Fetch details of a specific task using its 24-character MongoDB ObjectId.',
    hasParams: true,
    paramName: 'id',
    paramPlaceholder: 'MongoDB Task ID',
    hasBody: false,
    sampleResponse: {
      success: true,
      data: {
        _id: '6acb745350e90fcd0e35814e',
        taskName: 'Complete DBMS Normalization Assignment',
        subject: 'Database Management Systems',
        deadline: '2026-10-13T00:00:00.000Z',
        priority: 'High',
        status: 'In Progress',
      },
    },
  },
  {
    id: 'update-task-by-id',
    method: 'PUT',
    path: '/api/tasks/:id',
    title: 'Update Existing Task',
    description: 'Updates task details, deadline, priority, or status by ID with schema validation.',
    hasParams: true,
    paramName: 'id',
    paramPlaceholder: 'MongoDB Task ID',
    hasBody: true,
    defaultBody: JSON.stringify(
      {
        taskName: 'Complete DBMS Normalization Assignment (Final)',
        status: 'Completed',
        priority: 'High',
      },
      null,
      2
    ),
    sampleResponse: {
      success: true,
      data: {
        _id: '6acb745350e90fcd0e35814e',
        taskName: 'Complete DBMS Normalization Assignment (Final)',
        status: 'Completed',
        priority: 'High',
        updatedAt: '2026-10-11T11:48:30.000Z',
      },
    },
  },
  {
    id: 'delete-task-by-id',
    method: 'DELETE',
    path: '/api/tasks/:id',
    title: 'Delete Task By ID',
    description: 'Permanently removes a coursework task from MongoDB by its ID.',
    hasParams: true,
    paramName: 'id',
    paramPlaceholder: 'MongoDB Task ID',
    hasBody: false,
    sampleResponse: {
      success: true,
      message: 'Task deleted successfully',
      data: {
        id: '6acb745350e90fcd0e35814e',
      },
    },
  },
];

const ApiDocs = ({ tasks = [] }) => {
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  // Playground state for each endpoint
  const [paramValues, setParamValues] = useState({});
  const [bodyValues, setBodyValues] = useState(() => {
    const initial = {};
    API_ENDPOINTS.forEach((ep) => {
      if (ep.defaultBody) initial[ep.id] = ep.defaultBody;
    });
    return initial;
  });

  const [activeSnippets, setActiveSnippets] = useState({});
  const [testResults, setTestResults] = useState({});
  const [testingIds, setTestingIds] = useState({});

  // Use the first task's ID as quick autofill if available
  const sampleTaskId = tasks.length > 0 ? tasks[0]._id : '6acb745350e90fcd0e35814e';

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMethodBadgeClass = (method) => {
    switch (method) {
      case 'GET':
        return 'bg-success-subtle text-success border border-success-subtle';
      case 'POST':
        return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'PUT':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'DELETE':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      default:
        return 'bg-secondary text-white';
    }
  };

  const handleExecuteRequest = async (ep) => {
    const id = ep.id;
    let url = ep.path;

    if (ep.hasParams) {
      const paramVal = paramValues[id] || sampleTaskId;
      url = url.replace(':id', paramVal);
    }

    setTestingIds((prev) => ({ ...prev, [id]: true }));
    const startTime = performance.now();

    try {
      const options = {
        method: ep.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (ep.hasBody) {
        options.body = bodyValues[id] || ep.defaultBody;
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      const data = await res.json().catch(() => ({}));

      setTestResults((prev) => ({
        ...prev,
        [id]: {
          status: res.status,
          statusText: res.statusText || (res.status === 200 ? 'OK' : res.status === 201 ? 'Created' : 'Error'),
          duration,
          data,
          isError: !res.ok,
        },
      }));
    } catch (err) {
      const endTime = performance.now();
      setTestResults((prev) => ({
        ...prev,
        [id]: {
          status: 0,
          statusText: 'Network / Connection Error',
          duration: Math.round(endTime - startTime),
          data: { error: err.message },
          isError: true,
        },
      }));
    } finally {
      setTestingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filteredEndpoints = API_ENDPOINTS.filter((ep) =>
    filterMethod === 'ALL' ? true : ep.method === filterMethod
  );

  return (
    <div className="page-body">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold mb-0">REST API Explorer & Documentation</h2>
            <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 small">
              v1.0.0
            </span>
          </div>
          <p className="text-secondary mb-0">
            Interactive reference and live testing playground for all backend endpoints of the Student Workload Management System.
          </p>
        </div>

        {/* Global info pills */}
        <div className="d-flex flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 px-3 py-1.5 bg-white border rounded-pill shadow-sm small">
            <Server size={14} className="text-primary" />
            <span className="text-secondary">Base URL:</span>
            <span className="fw-bold font-monospace">http://localhost:5000</span>
          </div>
          <div className="d-flex align-items-center gap-2 px-3 py-1.5 bg-white border rounded-pill shadow-sm small">
            <Database size={14} className="text-success" />
            <span className="text-secondary">Database:</span>
            <span className="fw-bold">MongoDB</span>
          </div>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border rounded-3 shadow-sm text-center">
            <div className="text-muted small text-uppercase fw-semibold mb-1">Endpoints</div>
            <div className="fs-3 fw-bold text-dark">{API_ENDPOINTS.length}</div>
            <div className="small text-muted">All active routes</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border rounded-3 shadow-sm text-center">
            <div className="text-muted small text-uppercase fw-semibold mb-1">Format</div>
            <div className="fs-3 fw-bold text-primary">JSON</div>
            <div className="small text-muted">application/json</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border rounded-3 shadow-sm text-center">
            <div className="text-muted small text-uppercase fw-semibold mb-1">Architecture</div>
            <div className="fs-3 fw-bold text-success">REST</div>
            <div className="small text-muted">Express + Mongoose</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-white border rounded-3 shadow-sm text-center">
            <div className="text-muted small text-uppercase fw-semibold mb-1">Authentication</div>
            <div className="fs-3 fw-bold text-secondary">Public</div>
            <div className="small text-muted">Academic assignment</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Method */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div className="btn-group btn-group-sm" role="group">
          {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((m) => (
            <button
              key={m}
              type="button"
              className={`btn ${filterMethod === m ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterMethod(m)}
            >
              {m} {m === 'ALL' ? `(${API_ENDPOINTS.length})` : ''}
            </button>
          ))}
        </div>

        {tasks.length > 0 && (
          <div className="small text-muted d-flex align-items-center gap-1">
            <Sparkles size={14} className="text-warning" />
            <span>Sample ID from MongoDB available: </span>
            <code className="bg-light px-2 py-0.5 rounded text-dark">{sampleTaskId}</code>
          </div>
        )}
      </div>

      {/* API Endpoints List */}
      <div className="d-flex flex-column gap-3 mb-5">
        {filteredEndpoints.map((ep) => {
          const isTesting = testingIds[ep.id];
          const result = testResults[ep.id];
          const snippetType = activeSnippets[ep.id] || 'curl';
          const currentParamVal = paramValues[ep.id] !== undefined ? paramValues[ep.id] : sampleTaskId;
          const currentUrl = ep.hasParams ? ep.path.replace(':id', currentParamVal) : ep.path;

          const curlCode =
            ep.method === 'GET' || ep.method === 'DELETE'
              ? `curl -X ${ep.method} "http://localhost:5000${currentUrl}"`
              : `curl -X ${ep.method} "http://localhost:5000${currentUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '${(bodyValues[ep.id] || ep.defaultBody || '').replace(/\n/g, '')}'`;

          const fetchCode =
            ep.method === 'GET'
              ? `const response = await fetch("http://localhost:5000${currentUrl}");\nconst data = await response.json();\nconsole.log(data);`
              : `const response = await fetch("http://localhost:5000${currentUrl}", {\n  method: "${ep.method}",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${bodyValues[ep.id] || ep.defaultBody || '{}'})\n});\nconst data = await response.json();\nconsole.log(data);`;

          return (
            <div key={ep.id} className="content-card shadow-sm border">
              {/* Endpoint Header Bar */}
              <div className="content-card-header bg-white d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center gap-2.5 flex-wrap">
                  <span className={`badge px-2.5 py-1.5 fw-bold font-monospace ${getMethodBadgeClass(ep.method)}`}>
                    {ep.method}
                  </span>
                  <span className="font-monospace fw-bold text-dark fs-6">{ep.path}</span>
                  <span className="text-secondary small d-none d-md-inline">&bull; {ep.title}</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                    onClick={() => copyToClipboard(`http://localhost:5000${currentUrl}`, `url-${ep.id}`)}
                    title="Copy full URL"
                  >
                    {copiedId === `url-${ep.id}` ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    <span className="d-none d-sm-inline">Copy URL</span>
                  </button>

                  <button
                    className="btn btn-sm btn-primary-custom d-flex align-items-center gap-1.5"
                    onClick={() => handleExecuteRequest(ep)}
                    disabled={isTesting}
                  >
                    <Send size={13} />
                    <span>{isTesting ? 'Sending...' : 'Try It Live'}</span>
                  </button>
                </div>
              </div>

              {/* Endpoint Content Body */}
              <div className="content-card-body p-3 p-md-4">
                <p className="text-secondary small mb-3">{ep.description}</p>

                {/* Path Parameters section if needed */}
                {ep.hasParams && (
                  <div className="mb-3 p-3 bg-light rounded-3 border">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Path Parameter: <code className="text-danger">:{ep.paramName}</code>
                    </label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text font-monospace bg-white text-muted">ID</span>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        placeholder="MongoDB ObjectId (e.g. 6acb745350e90fcd0e35814e)"
                        value={currentParamVal}
                        onChange={(e) =>
                          setParamValues((prev) => ({ ...prev, [ep.id]: e.target.value }))
                        }
                      />
                      {tasks.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setParamValues((prev) => ({ ...prev, [ep.id]: sampleTaskId }))
                          }
                          title="Use first existing task ID"
                        >
                          Use Sample ID
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Request Body editor if needed */}
                {ep.hasBody && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-semibold text-secondary mb-0">
                        Request Body (JSON)
                      </label>
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-decoration-none small text-primary"
                        onClick={() =>
                          setBodyValues((prev) => ({ ...prev, [ep.id]: ep.defaultBody }))
                        }
                      >
                        Reset to default payload
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      className="form-control font-monospace small bg-light"
                      value={bodyValues[ep.id] || ''}
                      onChange={(e) =>
                        setBodyValues((prev) => ({ ...prev, [ep.id]: e.target.value }))
                      }
                      spellCheck={false}
                    />
                  </div>
                )}

                {/* Code Snippet / Live Response Tabs */}
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className={`btn ${snippetType === 'curl' ? 'btn-secondary text-white' : 'btn-light text-secondary'}`}
                        onClick={() => setActiveSnippets((prev) => ({ ...prev, [ep.id]: 'curl' }))}
                      >
                        cURL
                      </button>
                      <button
                        type="button"
                        className={`btn ${snippetType === 'fetch' ? 'btn-secondary text-white' : 'btn-light text-secondary'}`}
                        onClick={() => setActiveSnippets((prev) => ({ ...prev, [ep.id]: 'fetch' }))}
                      >
                        JavaScript (Fetch)
                      </button>
                    </div>

                    <button
                      className="btn btn-sm btn-link p-0 text-decoration-none text-secondary d-flex align-items-center gap-1"
                      onClick={() =>
                        copyToClipboard(snippetType === 'curl' ? curlCode : fetchCode, `code-${ep.id}`)
                      }
                    >
                      {copiedId === `code-${ep.id}` ? (
                        <Check size={13} className="text-success" />
                      ) : (
                        <Copy size={13} />
                      )}
                      <span className="small">Copy Code</span>
                    </button>
                  </div>

                  {/* Code snippet display */}
                  <div className="bg-dark text-light p-3 rounded-3 font-monospace small position-relative mb-3 overflow-auto" style={{ maxHeight: '140px' }}>
                    <pre className="mb-0 text-light" style={{ whiteSpace: 'pre-wrap' }}>
                      {snippetType === 'curl' ? curlCode : fetchCode}
                    </pre>
                  </div>
                </div>

                {/* Live Execution Results Panel */}
                {result && (
                  <div className="mt-3 p-3 bg-light rounded-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="small fw-bold text-secondary">Live Response:</span>
                        <span
                          className={`badge ${
                            result.isError
                              ? 'bg-danger text-white'
                              : 'bg-success text-white'
                          }`}
                        >
                          {result.status} {result.statusText}
                        </span>
                        <span className="badge bg-secondary-subtle text-secondary small">
                          <Clock size={11} className="me-1" />
                          {result.duration} ms
                        </span>
                      </div>
                      <button
                        className="btn btn-sm btn-link p-0 text-decoration-none text-secondary small d-flex align-items-center gap-1"
                        onClick={() =>
                          copyToClipboard(JSON.stringify(result.data, null, 2), `res-${ep.id}`)
                        }
                      >
                        {copiedId === `res-${ep.id}` ? (
                          <Check size={12} className="text-success" />
                        ) : (
                          <Copy size={12} />
                        )}
                        <span>Copy JSON</span>
                      </button>
                    </div>

                    <div
                      className="bg-white p-3 rounded border font-monospace small overflow-auto"
                      style={{ maxHeight: '240px' }}
                    >
                      <pre className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApiDocs;
