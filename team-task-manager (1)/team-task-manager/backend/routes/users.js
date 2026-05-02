const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const { getAllUsers, getUserById, updateUserRole } = require('../controllers/userController');

router.get('/', verifyToken, requireAdmin, getAllUsers);
router.get('/:id', verifyToken, getUserById);
router.put('/:id/role', verifyToken, requireAdmin, updateUserRole);

module.exports = router;
