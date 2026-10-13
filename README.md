# Student Workload Management System (StudyPulse)

A full-stack academic web application designed to help university students manage multiple coursework assignments, track deadlines, organize academic tasks by priority, and stay focused during study sessions.

Built as a **Web Programming Academic Assignment** adhering strictly to the Product Requirements Document (PRD).

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Key Features](#-key-features)
4. [System Architecture](#-system-architecture)
5. [Database Design](#-database-design)
6. [REST API Documentation](#-rest-api-documentation)
7. [Installation and Setup](#-installation-and-setup)
8. [Running the Application](#-running-the-application)
9. [Project Directory Structure](#-project-directory-structure)
10. [Testing & Verification Guide](#-testing--verification-guide)

---

## 🌟 Project Overview

Students often juggle numerous assignments, lab records, term projects, and semester examinations. Managing these responsibilities without a centralized dashboard often leads to missed deadlines and poor time allocation.

The **Student Workload Management System** solves this by providing:
* Complete **CRUD functionality** for coursework tasks.
* **Dynamic statistics** displaying total, pending, completed, and overdue workloads.
* **Automatic deadline tracking** with timezone-consistent indicators.
* **Priority and deadline sorting** to immediately identify urgent deliverables.
* **Integrated Pomodoro Focus Timer** with customizable study intervals.
* **Interactive REST API Documentation & Playground** directly built into the frontend.
* **Dark Mode & Light Mode** with persistent theme selection.

---

## 🛠️ Technology Stack

| Component | Technology | Responsibility |
|---|---|---|
| **Frontend Framework** | React.js 19 (Vite) | Single-page user interface & reactive state management |
| **Styling & Icons** | Bootstrap 5 + Vanilla CSS + Lucide React | Modern academic UI, responsive grid, dark/light theme |
| **Backend Runtime** | Node.js (v22+) | Server runtime environment |
| **Backend Framework** | Express.js 5 | REST API routing, request validation, error handling |
| **Database** | MongoDB | NoSQL document database for task persistence |
| **Database ODM** | Mongoose 9 | Object Data Modeling, schema validation, timestamps |
| **API Client** | Native Fetch API | Asynchronous frontend-backend communication |

---

## 🚀 Key Features

### 1. Overview Dashboard
* **Dynamic Metric Cards:**
  * **Total Tasks:** Count of all registered coursework.
  * **Pending Tasks:** Active tasks awaiting completion.
  * **Completed Tasks:** Finished assignments.
  * **Overdue Tasks:** Incomplete tasks whose deadline is before the current date.
* **Completion Progress Gauge:** Real-time visual progress bar showing percentage of coursework completed.
* **Upcoming Deadlines Section:** Sorted list of active deadlines excluding completed tasks.

### 2. Coursework Task Management (CRUD)
* **Create Task:** Form modal validating Task Name, Course/Subject, Deadline Date, Priority (`High`, `Medium`, `Low`), and Status (`Pending`, `In Progress`, `Completed`).
* **Read Tasks:** Responsive table displaying Task Name, Course, Deadline, Priority badge, Status badge, and Deadline tracking indicator.
* **Update Task:** Edit modal prefilled with existing values to modify deadlines, priority, or status.
* **Delete Task:** Action with a modal confirmation dialog to prevent accidental removal.

### 3. Automated Deadline Tracking
The system automatically compares each task's deadline with local midnight:
* 🔴 **Overdue:** Deadline has passed and task is not completed.
* 🟠 **Due Today:** Deadline is today and task is not completed.
* 🔵 **Upcoming:** Deadline is in the future.
* 🟢 **Completed:** Marked completed (*never classified as overdue*).

### 4. Priority-Based & Deadline Sorting
* **Priority Order:** High $\rightarrow$ Medium $\rightarrow$ Low.
* **Deadline Order:** Earliest $\rightarrow$ Latest.
* **Live Search & Filter:** Instant filter by course subject or status tabs (All, Pending, In Progress, Completed).

### 5. Interactive Academic Calendar & Schedule
* **Multi-View Modes:**
  * **Month Grid:** Comprehensive monthly calendar grid with status-colored indicator pills, priority dots, and day-overflow indicators.
  * **Week Schedule:** 7-day chronological coursework breakdown for weekly study planning.
  * **Agenda Timeline:** Structured list of upcoming deliverables with direct status toggling and Pomodoro launching.
* **Date-Specific Scheduling:** Click any date cell on the calendar to inspect all tasks due on that day or schedule a new assignment directly prefilled with that deadline date.
* **Multi-Dimensional Filters:** Filter calendar tasks on the fly by Subject, Status (Pending, In Progress, Completed, Overdue), and Priority level.
* **Monthly Metric Highlights:** Top ribbons showing deadlines in month, due today, completed in month, and overdue counts.

### 6. Integrated Pomodoro Focus Timer (Customizable)
* **Custom Duration Setter:** Students can select quick presets (15m, 25m, 45m, 60m), adjust minutes with $+/-$ stepper buttons, or type any custom study time (1–180 minutes).
* **Task Attachment:** Attach any active task to the timer so students stay focused on specific coursework.
* **Acoustic Chime:** Synthesizes a gentle 4-tone chime upon session completion using the HTML5 Web Audio API.
* **Quick Task Completion:** 1-click button to mark the attached task as completed when finished.

### 7. Interactive REST API Documentation & Live Explorer
* Dedicated single-page documentation listing all 6 backend endpoints.
* **Live Playground ("Try It Live"):** Send live HTTP requests directly against MongoDB and view status codes, duration (ms), and formatted JSON responses.
* **Code Snippet Generator:** One-click copy for `cURL` and JavaScript `fetch()` syntax.

### 8. Dark Mode / Light Mode Theme
* Instant theme switching via header toggle with Sun/Moon icons.
* Seamless color scheme across tables, modals, cards, and forms.
* Theme preference stored in `localStorage`.

---

## 🏛️ System Architecture

```text
+------------------------------------------------------------------------------------+
|                                   React Frontend                                   |
|  [Dashboard]  [Manage Tasks]  [Calendar View]  [Pomodoro Timer]  [API Explorer]    |
+-----------------------------------------+------------------------------------------+
                                |
                                | HTTP REST API / JSON
                                v
+----------------------------------------------------------------+
|                      Node.js + Express.js                      |
|  taskRoutes.js  -->  taskController.js  -->  Validation       |
+-------------------------------+--------------------------------+
                                |
                                | Mongoose ODM
                                v
+----------------------------------------------------------------+
|                        MongoDB Database                        |
|                        Collection: tasks                       |
+----------------------------------------------------------------+
```

---

## 🗄️ Database Design

The application uses a single MongoDB collection named `tasks`.

### Mongoose Schema Definition (`backend/models/Task.js`):

```javascript
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
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);
```

### Sample Document:
```json
{
  "_id": "6acb745350e90fcd0e35814e",
  "taskName": "Complete DBMS Normalization Assignment",
  "subject": "Database Management Systems",
  "deadline": "2026-10-13T00:00:00.000Z",
  "priority": "High",
  "status": "In Progress",
  "createdAt": "2026-10-11T11:34:43.936Z",
  "updatedAt": "2026-10-11T11:34:43.936Z"
}
```

---

## 📡 REST API Documentation

Base URL: `http://localhost:5000`

| HTTP Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/health` | Health check & server status | `200` |
| `GET` | `/api/tasks` | Retrieve all tasks sorted by deadline | `200`, `500` |
| `POST` | `/api/tasks` | Create a new academic task | `201`, `400`, `500` |
| `GET` | `/api/tasks/:id` | Retrieve a specific task by ID | `200`, `400`, `404` |
| `PUT` | `/api/tasks/:id` | Update an existing task | `200`, `400`, `404` |
| `DELETE` | `/api/tasks/:id` | Delete a task by ID | `200`, `400`, `404` |

### Sample POST Request Payload:
```json
{
  "taskName": "OS Memory Management Lab Report",
  "subject": "Operating Systems",
  "deadline": "2026-10-20",
  "priority": "High",
  "status": "Pending"
}
```

### Sample Response:
```json
{
  "success": true,
  "data": {
    "_id": "6acb745350e90fcd0e35814f",
    "taskName": "OS Memory Management Lab Report",
    "subject": "Operating Systems",
    "deadline": "2026-10-20T00:00:00.000Z",
    "priority": "High",
    "status": "Pending",
    "createdAt": "2026-10-11T11:34:43.937Z",
    "updatedAt": "2026-10-11T11:34:43.937Z"
  }
}
```

---

## 💻 Installation and Setup

### Prerequisites
* **Node.js** (v18.x or v22.x recommended)
* **npm** (v9.x or higher)
* **MongoDB** (Local MongoDB Community Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 1. Clone or Open Project Directory
```bash
cd "c:\Users\ganes\OneDrive\Desktop\wp"
```

### 2. Install Dependencies
Install all root, backend, and frontend dependencies:
```bash
# In the root workspace:
npm install

# In backend folder:
cd backend && npm install && cd ..

# In frontend folder:
cd frontend && npm install && cd ..
```

### 3. Configure Environment Variables
Verify `backend/.env` exists:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/student_workload
```

### 4. Seed Sample Academic Data
Populate MongoDB with realistic sample coursework records:
```bash
npm run seed
```

---

## 🏃 Running the Application

### Option A: Run Both Frontend and Backend Concurrently (Recommended)
From the root workspace:
```bash
npm run dev
```
* **Frontend:** `http://localhost:5173` (or `http://localhost:5174`)
* **Backend API:** `http://localhost:5000`

### Option B: Run Services Individually

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 📁 Project Directory Structure

```text
student-workload-management/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   └── taskController.js     # CRUD logic, validation & error handlers
│   ├── models/
│   │   └── Task.js               # Mongoose schema for coursework task
│   ├── routes/
│   │   └── taskRoutes.js         # Express REST API endpoints
│   ├── .env                      # Server configuration
│   ├── package.json              # Backend dependencies
│   ├── seed.js                   # Academic sample data seeder
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation header with date & dark mode toggle
│   │   │   ├── Sidebar.jsx       # Sidebar navigation menu
│   │   │   ├── SummaryCard.jsx   # Dashboard dynamic metric card
│   │   │   ├── TaskForm.jsx      # Modal dialog for Add / Edit task
│   │   │   └── TaskTable.jsx     # Coursework data table with badges & actions
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # View 1: Overview metrics & upcoming deadlines
│   │   │   ├── ManageTasks.jsx   # View 2: Full CRUD, sorting, and filters
│   │   │   ├── PomodoroTimer.jsx # Customizable student focus timer
│   │   │   └── ApiDocs.jsx       # Single-page interactive REST API explorer
│   │   ├── services/
│   │   │   └── taskService.js    # Fetch API integration for REST endpoints
│   │   ├── utils/
│   │   │   └── dateUtils.js      # Deadline indicators & date formatting
│   │   ├── App.jsx               # Main state controller & router
│   │   ├── index.css             # Bootstrap 5 integration & custom design tokens
│   │   └── main.jsx              # React DOM mounting
│   ├── index.html                # HTML5 root with Google Fonts
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite configuration & API proxy
├── package.json                  # Root orchestrator with concurrently
└── README.md                     # Comprehensive project documentation
```

---

## 🧪 Testing & Verification Guide

| Test Scenario | Action | Expected Result |
|---|---|---|
| **1. Create Task** | Click "Add Task", submit valid details | Task saves to MongoDB, table updates, toast confirms creation. |
| **2. Validation** | Submit form with blank Task Name or Subject | Client and server validation error flags appear. |
| **3. Retrieve Tasks** | Load Dashboard or Task Manager | All records load from MongoDB ordered by deadline. |
| **4. Edit Task** | Click Edit on an existing task | Modal opens prefilled with data; saving updates MongoDB. |
| **5. Delete Task** | Click Delete icon on a task | Confirmation modal prevents accidental removal; deleting removes document. |
| **6. Overdue Logic** | Check incomplete tasks with past date | Labeled **Overdue**; completed tasks with past date remain **Completed**. |
| **7. Priority Sorting** | Select "Priority: High $\rightarrow$ Low" | High priority tasks display at top of table. |
| **8. Pomodoro Timer** | Adjust minutes (steppers or input) and start | Countdown ring animates; audio chime plays at 00:00. |
| **9. Theme Switcher** | Click Sun/Moon button in Navbar | Switches between dark and light themes smoothly; persists on refresh. |
| **10. API Explorer** | Click "Try It Live" in API Documentation | Executes live HTTP request and renders status code and JSON. |

---

## 🎓 Academic Credits

* **Course:** Web Programming
* **Project:** Student Workload Management System
* **Stack:** MongoDB, Express.js, React.js, Node.js (MERN)
