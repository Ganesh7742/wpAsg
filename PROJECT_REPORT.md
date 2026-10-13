# Academic Project Documentation & Report

**Project Title:** Student Workload Management System (*StudyPulse*)  
**Course:** Web Programming Academic Assignment  
**Architecture:** Full-Stack Web Application (MERN: MongoDB, Express.js, React.js, Node.js)  
**Submission Date:** October 2026  

---

## Executive Summary / Abstract

In university environments, students are required to balance coursework from multiple subjects, including laboratory records, assignments, project deliverables, and examinations. Without an organized, centralized tracking mechanism, students frequently experience cognitive overload, poor time allocation, and missed deadlines.

The **Student Workload Management System** is a responsive, full-stack web application developed using **React.js, Node.js, Express.js, and MongoDB**. The platform provides complete Create, Read, Update, and Delete (CRUD) operations for coursework tasks, an interactive **Academic Calendar & Schedule** (supporting Month, Week, and Agenda views), automated real-time deadline categorization (Overdue, Due Today, Upcoming, and Completed), dynamic dashboard metric cards, multi-criteria sorting (Priority & Deadline), an integrated customizable Pomodoro study focus timer, a single-page interactive REST API explorer, and full dark/light theme support.

---

## 1. Introduction & Objectives

### 1.1 Problem Statement
Traditional methods of tracking student tasks (e.g., paper notebooks, dispersed messaging channels, or basic calendar apps) lack academic context. They do not automatically calculate deadline urgency, separate completed items from overdue penalties, or provide an integrated study timer directly linked to specific coursework tasks.

### 1.2 Project Objectives
* **Centralized Task Management:** Allow students to create, view, update, and remove academic assignments in a unified workspace.
* **Dynamic Metric Dashboard:** Maintain real-time summary statistics reflecting Total, Pending, Completed, and Overdue tasks.
* **Automated Deadline Tracking:** Automatically flag tasks as Overdue, Due Today, or Upcoming based on the current system date, while guaranteeing completed tasks are never marked overdue.
* **Priority Sorting:** Sort coursework based on academic urgency (High $\rightarrow$ Medium $\rightarrow$ Low) and submission deadlines.
* **Academic Calendar & Timeline:** Provide interactive Month, Week, and Agenda deadline visualizations with subject-based filtering and 1-click scheduling.
* **Productivity Integration:** Provide a customizable Pomodoro study timer linked directly to academic tasks.
* **Academic API Transparency:** Expose an interactive REST API playground allowing live requests against the backend without external tools like Postman.

---

## 2. System Architecture & Tech Stack

```text
+-----------------------------------------------------------------------------------+
|                                  CLIENT TIER                                      |
|                       React.js 19 (Vite) + Bootstrap 5                            |
|                                                                                   |
|  [Dashboard View]    [Manage Tasks]    [Academic Calendar]    [Pomodoro Timer]    [REST API Explorer]  |
|   - Summary Cards     - CRUD Table      - Month / Week View    - Customizable      - Live HTTP Tester  |
|   - Progress Bar      - Add/Edit Modal  - Agenda Timeline      - Task Target       - cURL / Fetch Code |
|   - Upcoming Tasks    - Priority Sort   - Date Scheduling      - Audio Chime       - Response Viewer   |
+-------------------------------------------------------------------------------------------------------+
                                          |
                                          | HTTP / JSON (REST API)
                                          v
+-----------------------------------------------------------------------------------+
|                                  SERVER TIER                                      |
|                             Node.js + Express.js                                  |
|                                                                                   |
|     taskRoutes.js  <---->  taskController.js  <---->  Validation Middleware       |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | Mongoose ODM (Query Engine)
                                          v
+-----------------------------------------------------------------------------------+
|                                 DATABASE TIER                                     |
|                               MongoDB Database                                    |
|                               Collection: tasks                                   |
+-----------------------------------------------------------------------------------+
```

### Technology Breakdown

| Component | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React.js | 19.x | Component-based dynamic user interface |
| **Build Tool** | Vite | 8.x | High-speed HMR development server & production bundler |
| **Styling** | Bootstrap + CSS3 | 5.3.x | Grid layout, responsive utilities, custom CSS variables |
| **Icons** | Lucide React | 1.x | Modern UI iconography |
| **Backend Runtime** | Node.js | 22.x | Asynchronous JavaScript server runtime |
| **Backend Framework** | Express.js | 5.x | REST API routing and HTTP request handling |
| **Database** | MongoDB | Community Server | NoSQL JSON document persistence |
| **Database Driver** | Mongoose | 9.x | Schema validation, query building, timestamps |
| **Audio API** | Web Audio API | Standard | In-browser acoustic notification chimes |

---

## 3. Database Design & Data Dictionary

The application employs a single MongoDB collection named `tasks`.

### 3.1 Data Dictionary

| Field Name | Data Type | Required | Default | Allowed Values / Constraints | Description |
|---|---|---|---|---|---|
| `_id` | ObjectId | Yes (Auto) | Auto | Unique 24-character hexadecimal ID | Primary key generated by MongoDB |
| `taskName` | String | Yes | None | Trimmed, non-empty string | The name/title of the academic assignment |
| `subject` | String | Yes | None | Trimmed, non-empty string | Course or subject name (e.g., DBMS, OS) |
| `deadline` | Date | Yes | None | Valid ISO Date object | Target submission deadline |
| `priority` | String | Yes | `"Medium"` | `"Low"`, `"Medium"`, `"High"` | Coursework priority level |
| `status` | String | Yes | `"Pending"` | `"Pending"`, `"In Progress"`, `"Completed"` | Academic task progress status |
| `createdAt` | Date | Yes (Auto) | Auto | Valid ISO Date | Record creation timestamp |
| `updatedAt` | Date | Yes (Auto) | Auto | Valid ISO Date | Record last update timestamp |

### 3.2 Mongoose Schema Implementation (`backend/models/Task.js`)
```javascript
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: [true, 'Task Name is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
```

---

## 4. RESTful API Specification

The backend runs on `http://localhost:5000` with the following endpoints:

### 4.1 Endpoints Table

| # | HTTP Method | Endpoint | Description | Request Body | Success Status |
|---|---|---|---|---|---|
| 1 | `GET` | `/api/health` | Health check & server status | None | `200 OK` |
| 2 | `GET` | `/api/tasks` | Retrieve all tasks (sorted by deadline) | None | `200 OK` |
| 3 | `POST` | `/api/tasks` | Create a new task with validation | Task JSON | `201 Created` |
| 4 | `GET` | `/api/tasks/:id` | Retrieve a single task by its ObjectId | None | `200 OK` |
| 5 | `PUT` | `/api/tasks/:id` | Update an existing task's fields | Task JSON | `200 OK` |
| 6 | `DELETE` | `/api/tasks/:id` | Remove a task from MongoDB | None | `200 OK` |

### 4.2 Sample Request & Response Schemas

#### POST `/api/tasks`
* **Request Body:**
  ```json
  {
    "taskName": "Complete DBMS Normalization Assignment",
    "subject": "Database Management Systems",
    "deadline": "2026-10-20",
    "priority": "High",
    "status": "Pending"
  }
  ```
* **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "_id": "6acb745350e90fcd0e35814e",
      "taskName": "Complete DBMS Normalization Assignment",
      "subject": "Database Management Systems",
      "deadline": "2026-10-20T00:00:00.000Z",
      "priority": "High",
      "status": "Pending",
      "createdAt": "2026-10-11T11:34:43.936Z",
      "updatedAt": "2026-10-11T11:34:43.936Z"
    }
  }
  ```
* **Validation Failure Response (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "message": "Task Name is required"
  }
  ```

---

## 5. Core Business Logic & Algorithms

### 5.1 Automated Deadline Urgency Algorithm (`frontend/src/utils/dateUtils.js`)
To prevent time-zone shifts from causing incorrect date classifications, all dates are normalized to local midnight ($00:00:00$):

$$\text{Normalize}(D) = \text{new Date}(D.\text{year}, D.\text{month}, D.\text{date})$$

* **Rule 1 (Completed):** If $\text{Status} = \text{"Completed"}$, status is `Completed` (Green). *Completed tasks are NEVER categorized as overdue.*
* **Rule 2 (Overdue):** If $\text{Deadline} < \text{Today}$, status is `Overdue` (Red).
* **Rule 3 (Due Today):** If $\text{Deadline} = \text{Today}$, status is `Due Today` (Orange).
* **Rule 4 (Upcoming):** If $\text{Deadline} > \text{Today}$, status is `Upcoming` (Blue).

### 5.2 Multi-Criteria Priority & Deadline Sorting
Tasks can be sorted along two primary dimensions:
1. **Priority Weighting:**
   $$\text{Weight}(\text{High}) = 3, \quad \text{Weight}(\text{Medium}) = 2, \quad \text{Weight}(\text{Low}) = 1$$
   When sorting by priority descending, if weights are equal, the tiebreaker sorts by earliest deadline ascending.
2. **Deadline Sorting:** Chronological comparison of timestamp milliseconds.

### 5.3 Pomodoro Focus Timer Logic
* Configurable study interval: $T \in [1, 180]$ minutes.
* Progress percentage calculation:
  $$\text{Progress} = \left(\frac{T_{\text{total}} - T_{\text{remaining}}}{T_{\text{total}}}\right) \times 100\%$$
* SVG circle circumference calculation:
  $$\text{Dashoffset} = C - \left(\frac{\text{Progress}}{100}\right) \times C, \quad C = 2\pi r$$
### 5.4 Academic Calendar Grid & Scheduling Algorithm (`frontend/src/utils/dateUtils.js`)
* **Grid Generation:** To display a standard monthly grid, the first day of the current month ($D_1$) and last day ($D_{\text{last}}$) are computed.
* **Trailing/Leading Day Calculation:** The preceding month's trailing days are prepended starting from $D_1.\text{getDay()}$, and trailing days from the following month are appended to ensure the grid aligns into a complete $7 \times 5$ (35-cell) or $7 \times 6$ (42-cell) calendar matrix.
* **Direct Date Indexing:** Tasks are indexed into an $O(1)$ lookup hash map keyed by `YYYY-MM-DD`, allowing instant task rendering on any day cell with status-coded indicator pills (Overdue, Due Today, Upcoming, Completed).
* **Multi-View Rendering:** Supports **Month Grid**, **7-Day Week Schedule**, and **Chronological Agenda Timeline** with subject and priority filters.

---

## 6. Frontend Component Architecture

```text
App.jsx (Root State & Navigation Controller)
│
├── Navbar.jsx (Dynamic View Title, Academic Date, Dark Mode Toggle, API Status)
├── Sidebar.jsx (Branding, Navigation Links, Task Count Badge, Academic Info)
│
├── Pages:
│   ├── Dashboard.jsx
│   │   ├── SummaryCard.jsx (Total Tasks, Pending Tasks, Completed, Overdue)
│   │   ├── Overall Completion Rate (Progress Bar)
│   │   └── Upcoming Deadlines List (Earliest active tasks)
│   │
│   ├── ManageTasks.jsx
│   │   ├── Search Input & Status Filter Tabs
│   │   ├── Sorting Dropdown (Priority vs. Deadline)
│   │   ├── TaskTable.jsx (Responsive Table with Indicators & Action Buttons)
│   │   ├── TaskForm.jsx (Add / Edit Modal Dialog with Validation)
│   │   └── Delete Confirmation Modal Dialog
│   │
│   ├── CalendarView.jsx
│   │   ├── Month Grid (7x5 / 7x6 Matrix with Task Status Pills & Indicators)
│   │   ├── Week View (7-Day Detailed Coursework Breakdown)
│   │   ├── Agenda Timeline (Chronological Deadline Feed)
│   │   ├── Dynamic Filters (Subject, Status, Priority)
│   │   └── Selected Day Schedule Panel & 1-Click Date Scheduling Modal
│   │
│   ├── PomodoroTimer.jsx
│   │   ├── Preset Duration Buttons (15m, 25m, 45m, 60m, Breaks)
│   │   ├── Custom Minute Input & Stepper Buttons (+/- 1m, +/- 5m)
│   │   ├── Animated Circular SVG Countdown Ring
│   │   └── Attached Coursework Dropdown & 1-Click Complete Action
│   │
│   └── ApiDocs.jsx
│       ├── REST Endpoint Cards (GET, POST, PUT, DELETE)
│       ├── Live Playground ("Try It Live" with Real-Time Fetch)
│       ├── cURL & JavaScript Fetch Snippet Generators
│       └── Live Response Status, Latency & JSON Formatter
```

---

## 7. Verification & Test Scenarios

| Test Case | Objective | Input / Procedure | Expected Result | Verified Status |
|---|---|---|---|---|
| **TC-01** | Create valid task | Name: "OS Lab", Subject: "OS", Date: Future | 201 Created, MongoDB saves, table updates | ✅ PASSED |
| **TC-02** | Validation rejection | Blank Task Name or Subject | 400 Bad Request, error feedback banner | ✅ PASSED |
| **TC-03** | Retrieve all tasks | Load Dashboard or Task Manager | All records retrieved, sorted by deadline | ✅ PASSED |
| **TC-04** | Update task | Modify status to "Completed" | 200 OK, updated in MongoDB, badges update | ✅ PASSED |
| **TC-05** | Delete confirmation | Click delete icon on task | Modal warns user; clicking confirm removes task | ✅ PASSED |
| **TC-06** | Overdue exclusion | Incomplete past task vs. Completed past task | Incomplete is Red Overdue; Completed is Green | ✅ PASSED |
| **TC-07** | Priority sorting | Sort by "Priority: High $\rightarrow$ Low" | High tasks displayed at top of table | ✅ PASSED |
| **TC-08** | Custom timer | Enter 35 minutes in timer and start | Circular ring scales to 35m; chime plays at 00:00 | ✅ PASSED |
| **TC-09** | Dark mode toggle | Click theme switch icon in navbar | Theme flips immediately and persists in storage | ✅ PASSED |
| **TC-10** | Live API test | Click "Try It Live" on GET /api/tasks | Live 200 OK returned with formatted JSON | ✅ PASSED |
| **TC-11** | Academic Calendar | Navigate to Calendar view, filter by subject | Month grid renders deadlines; clicking date opens schedule | ✅ PASSED |

---

## 8. Deployment & Execution Instructions

### Prerequisites
* **Node.js** (v18+ or v22+)
* **MongoDB** installed and running on `mongodb://127.0.0.1:27017`

### Execution Steps
1. Navigate to project root:
   ```bash
   cd "c:\Users\ganes\OneDrive\Desktop\wp"
   ```
2. Start both services concurrently:
   ```bash
   npm run dev
   ```
3. Access Web Application:
   * **Frontend UI:** `http://localhost:5173` (or `http://localhost:5174`)
   * **Backend API:** `http://localhost:5000`
4. (Optional) Re-seed sample database records:
   ```bash
   npm run seed
   ```

---

## 9. Conclusion

The **Student Workload Management System** successfully addresses the problem of student academic deadline tracking. Built to rigorous academic web programming standards, it incorporates:
* Clean modular separation of concerns (Model-View-Controller backend, component-driven reactive frontend).
* Robust database validation and error handling.
* Innovative student productivity features (customizable Pomodoro timer and interactive API explorer).
* Modern design aesthetics with full responsive design and dark mode.
