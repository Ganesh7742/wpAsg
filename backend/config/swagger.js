const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Workload Management API (StudyPulse)',
      version: '1.0.0',
      description:
        'REST API for managing academic coursework tasks. Built with Node.js, Express.js and MongoDB for the Web Programming assignment.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
      },
    ],
    tags: [
      { name: 'Health', description: 'Server status' },
      { name: 'Tasks', description: 'Coursework task CRUD' },
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          required: ['taskName', 'subject', 'deadline'],
          properties: {
            _id: {
              type: 'string',
              example: '6acb745350e90fcd0e35814e',
              description: 'MongoDB ObjectId (auto-generated)',
            },
            taskName: { type: 'string', example: 'Complete DBMS Normalization Assignment' },
            subject: { type: 'string', example: 'Database Management Systems' },
            deadline: { type: 'string', format: 'date', example: '2026-10-20' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High'], default: 'Medium' },
            status: {
              type: 'string',
              enum: ['Pending', 'In Progress', 'Completed'],
              default: 'Pending',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        TaskInput: {
          type: 'object',
          required: ['taskName', 'subject', 'deadline'],
          properties: {
            taskName: { type: 'string', example: 'OS Memory Management Lab Report' },
            subject: { type: 'string', example: 'Operating Systems' },
            deadline: { type: 'string', format: 'date', example: '2026-10-20' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High'], example: 'High' },
            status: {
              type: 'string',
              enum: ['Pending', 'In Progress', 'Completed'],
              example: 'Pending',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Task Name is required' },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Server health check',
          description: 'Verify backend server status, uptime and connectivity.',
          responses: {
            200: {
              description: 'Server is running',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'OK' },
                      message: { type: 'string', example: 'Student Workload Management API is running' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/tasks': {
        get: {
          tags: ['Tasks'],
          summary: 'Retrieve all tasks',
          description: 'Returns all academic tasks stored in MongoDB, ordered by deadline ascending.',
          responses: {
            200: {
              description: 'List of tasks',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 6 },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Server error',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
        post: {
          tags: ['Tasks'],
          summary: 'Create a new task',
          description: 'Validates input and inserts a new coursework record into MongoDB.',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/TaskInput' } },
            },
          },
          responses: {
            201: {
              description: 'Task created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
            500: {
              description: 'Server error',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      '/api/tasks/{id}': {
        get: {
          tags: ['Tasks'],
          summary: 'Retrieve task by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: '24-character MongoDB ObjectId',
              schema: { type: 'string', example: '6acb745350e90fcd0e35814e' },
            },
          ],
          responses: {
            200: {
              description: 'Single task',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
            400: { description: 'Invalid ID format' },
            404: { description: 'Task not found' },
          },
        },
        put: {
          tags: ['Tasks'],
          summary: 'Update existing task',
          description: 'Updates task details, deadline, priority or status by ID with schema validation.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: '24-character MongoDB ObjectId',
              schema: { type: 'string', example: '6acb745350e90fcd0e35814e' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/TaskInput' } },
            },
          },
          responses: {
            200: { description: 'Task updated' },
            400: { description: 'Validation error / invalid ID' },
            404: { description: 'Task not found' },
          },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Delete task by ID',
          description: 'Permanently removes a coursework task from MongoDB by its ID.',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: '24-character MongoDB ObjectId',
              schema: { type: 'string', example: '6acb745350e90fcd0e35814e' },
            },
          ],
          responses: {
            200: { description: 'Task deleted' },
            400: { description: 'Invalid ID format' },
            404: { description: 'Task not found' },
          },
        },
      },
    },
  },
  apis: [], // spec is defined inline above; no JSDoc scan needed
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
