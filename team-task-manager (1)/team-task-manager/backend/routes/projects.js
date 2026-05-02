const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');
const {
  getAllProjects, getProjectById, createProject,
  updateProject, deleteProject, addMember, removeMember
} = require('../controllers/projectController');

router.get('/', verifyToken, getAllProjects);
router.get('/:id', verifyToken, getProjectById);
router.post('/', verifyToken, requireAdmin, createProject);
router.put('/:id', verifyToken, requireAdmin, updateProject);
router.delete('/:id', verifyToken, requireAdmin, deleteProject);
router.post('/:id/members', verifyToken, requireAdmin, addMember);
router.delete('/:id/members/:userId', verifyToken, requireAdmin, removeMember);

module.exports = router;
