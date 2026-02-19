const express = require('express');
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public read-only routes
router.get('/', projectController.getAllProjects);
router.get('/freelancer/:freelancerId', projectController.getFreelancerProjects);
router.get('/client/:clientId', projectController.getClientProjects);
router.get('/:id', projectController.getProject);

// Protected routes (auth required)
router.use(authController.protect);

router.post('/', projectController.createProject);
router.patch('/:id/status', projectController.updateProjectStatus);
router.route('/:id')
    .patch(projectController.updateProject)
    .delete(projectController.deleteProject);

module.exports = router;