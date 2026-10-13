const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/tasks';

/**
 * Fetch all tasks from backend
 * @returns {Promise<Array>} List of tasks
 */
export const getAllTasks = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to fetch tasks (HTTP ${response.status})`);
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[taskService] Error in getAllTasks:', error);
    throw error;
  }
};

/**
 * Fetch a single task by ID
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export const getTaskById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Task not found (HTTP ${response.status})`);
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(`[taskService] Error in getTaskById(${id}):`, error);
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData { taskName, subject, deadline, priority, status }
 * @returns {Promise<Object>} Created task document
 */
export const createTask = async (taskData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to create task (HTTP ${response.status})`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('[taskService] Error in createTask:', error);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {string} id 
 * @param {Object} taskData 
 * @returns {Promise<Object>} Updated task document
 */
export const updateTask = async (id, taskData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to update task (HTTP ${response.status})`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(`[taskService] Error in updateTask(${id}):`, error);
    throw error;
  }
};

/**
 * Delete a task by ID
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export const deleteTask = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to delete task (HTTP ${response.status})`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`[taskService] Error in deleteTask(${id}):`, error);
    throw error;
  }
};
