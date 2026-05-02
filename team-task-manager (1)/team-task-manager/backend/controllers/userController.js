const { pool } = require('../config/db');

// GET /api/users - Admin only - list all users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]
    );
    if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: users[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/users/:id/role - Admin only
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Role must be admin or member.' });
    }
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'User role updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole };
