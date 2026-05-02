const { pool } = require('../config/db');

// GET /api/projects - Get all projects (admin: all, member: only their projects)
const getAllProjects = async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'admin') {
      query = `
        SELECT p.*, u.name AS created_by_name,
          COUNT(DISTINCT pm.user_id) AS member_count,
          COUNT(DISTINCT t.id) AS task_count
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT p.*, u.name AS created_by_name,
          COUNT(DISTINCT pm2.user_id) AS member_count,
          COUNT(DISTINCT t.id) AS task_count
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ?
        LEFT JOIN project_members pm2 ON p.id = pm2.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE p.created_by = ? OR pm.user_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;
      params = [req.user.id, req.user.id, req.user.id];
    }

    const [projects] = await pool.query(query, params);
    res.json({ projects });
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const [projects] = await pool.query(
      `SELECT p.*, u.name AS created_by_name FROM projects p
       LEFT JOIN users u ON p.created_by = u.id WHERE p.id = ?`,
      [id]
    );
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found.' });

    const [members] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role FROM project_members pm
       JOIN users u ON pm.user_id = u.id WHERE pm.project_id = ?`,
      [id]
    );

    res.json({ project: projects[0], members });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/projects - Admin only
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required.' });

    const [result] = await pool.query(
      'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
      [name, description || '', req.user.id]
    );

    // Auto-add creator as a member
    await pool.query(
      'INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)',
      [result.insertId, req.user.id]
    );

    res.status(201).json({ message: 'Project created.', projectId: result.insertId });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/projects/:id - Admin only
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const [existing] = await pool.query('SELECT id FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Project not found.' });

    await pool.query(
      'UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description), status = COALESCE(?, status) WHERE id = ?',
      [name, description, status, id]
    );

    res.json({ message: 'Project updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/projects/:id - Admin only
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/projects/:id/members - Admin only
const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: 'userId is required.' });

    await pool.query(
      'INSERT IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)',
      [id, userId]
    );
    res.json({ message: 'Member added to project.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/projects/:id/members/:userId - Admin only
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    await pool.query(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [id, userId]
    );
    res.json({ message: 'Member removed from project.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject, addMember, removeMember };
