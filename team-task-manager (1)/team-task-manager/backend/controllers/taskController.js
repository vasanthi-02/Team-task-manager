const { pool } = require('../config/db');

// GET /api/tasks?projectId=&status=&assignedTo=
const getAllTasks = async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;
    let query = `
      SELECT t.*, 
        u1.name AS assigned_to_name, u1.email AS assigned_to_email,
        u2.name AS created_by_name,
        p.name AS project_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role !== 'admin') {
      query += ` AND (t.assigned_to = ? OR t.created_by = ?)`;
      params.push(req.user.id, req.user.id);
    }
    if (projectId) { query += ' AND t.project_id = ?'; params.push(projectId); }
    if (status) { query += ' AND t.status = ?'; params.push(status); }
    if (assignedTo) { query += ' AND t.assigned_to = ?'; params.push(assignedTo); }

    query += ' ORDER BY t.created_at DESC';

    const [tasks] = await pool.query(query, params);
    res.json({ tasks });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const [tasks] = await pool.query(
      `SELECT t.*, 
        u1.name AS assigned_to_name,
        u2.name AS created_by_name,
        p.name AS project_name
       FROM tasks t
       LEFT JOIN users u1 ON t.assigned_to = u1.id
       LEFT JOIN users u2 ON t.created_by = u2.id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = ?`,
      [id]
    );
    if (tasks.length === 0) return res.status(404).json({ message: 'Task not found.' });
    res.json({ task: tasks[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, due_date, project_id, assigned_to } = req.body;

    if (!title || !project_id) {
      return res.status(400).json({ message: 'Title and project_id are required.' });
    }

    // Verify project exists
    const [projects] = await pool.query('SELECT id FROM projects WHERE id = ?', [project_id]);
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found.' });

    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, project_id, assigned_to, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || '', status || 'todo', priority || 'medium', due_date || null, project_id, assigned_to || null, req.user.id]
    );

    res.status(201).json({ message: 'Task created.', taskId: result.insertId });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, assigned_to } = req.body;

    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Task not found.' });

    const task = existing[0];
    // Members can only update tasks assigned to them (status only)
    if (req.user.role !== 'admin' && task.assigned_to !== req.user.id && task.created_by !== req.user.id) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you.' });
    }

    await pool.query(
      `UPDATE tasks SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        due_date = COALESCE(?, due_date),
        assigned_to = COALESCE(?, assigned_to)
       WHERE id = ?`,
      [title, description, status, priority, due_date, assigned_to, id]
    );

    res.json({ message: 'Task updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role !== 'admin' && existing[0].created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only admins or task creators can delete tasks.' });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
