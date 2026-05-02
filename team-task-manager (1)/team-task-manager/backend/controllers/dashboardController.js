const { pool } = require('../config/db');

// GET /api/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Total tasks
    const [totalTasks] = isAdmin
      ? await pool.query('SELECT COUNT(*) AS count FROM tasks')
      : await pool.query('SELECT COUNT(*) AS count FROM tasks WHERE assigned_to = ? OR created_by = ?', [userId, userId]);

    // Tasks by status
    const [tasksByStatus] = isAdmin
      ? await pool.query(`SELECT status, COUNT(*) AS count FROM tasks GROUP BY status`)
      : await pool.query(`SELECT status, COUNT(*) AS count FROM tasks WHERE assigned_to = ? OR created_by = ? GROUP BY status`, [userId, userId]);

    // Overdue tasks
    const [overdueTasks] = isAdmin
      ? await pool.query(`SELECT COUNT(*) AS count FROM tasks WHERE due_date < CURDATE() AND status != 'done'`)
      : await pool.query(`SELECT COUNT(*) AS count FROM tasks WHERE due_date < CURDATE() AND status != 'done' AND (assigned_to = ? OR created_by = ?)`, [userId, userId]);

    // Total projects
    const [totalProjects] = isAdmin
      ? await pool.query('SELECT COUNT(*) AS count FROM projects')
      : await pool.query(`SELECT COUNT(DISTINCT p.id) AS count FROM projects p
          LEFT JOIN project_members pm ON p.id = pm.project_id
          WHERE p.created_by = ? OR pm.user_id = ?`, [userId, userId]);

    // Recent tasks (last 5)
    const [recentTasks] = isAdmin
      ? await pool.query(`SELECT t.*, u.name AS assigned_to_name, p.name AS project_name
          FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id
          LEFT JOIN projects p ON t.project_id = p.id
          ORDER BY t.created_at DESC LIMIT 5`)
      : await pool.query(`SELECT t.*, u.name AS assigned_to_name, p.name AS project_name
          FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id
          LEFT JOIN projects p ON t.project_id = p.id
          WHERE t.assigned_to = ? OR t.created_by = ?
          ORDER BY t.created_at DESC LIMIT 5`, [userId, userId]);

    // Total users (admin only)
    let totalUsers = null;
    if (isAdmin) {
      const [users] = await pool.query('SELECT COUNT(*) AS count FROM users');
      totalUsers = users[0].count;
    }

    res.json({
      stats: {
        totalTasks: totalTasks[0].count,
        totalProjects: totalProjects[0].count,
        overdueTasks: overdueTasks[0].count,
        totalUsers,
        tasksByStatus: tasksByStatus.reduce((acc, row) => {
          acc[row.status] = row.count;
          return acc;
        }, { todo: 0, in_progress: 0, done: 0 })
      },
      recentTasks
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getDashboardStats };
