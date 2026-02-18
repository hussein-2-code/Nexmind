const express = require('express');
const projectController = require('../controllers/projectController');

const router = express.Router();

// Protect all routes after this middleware (if you have authentication)
// router.use(authController.protect);

// Project routes
router.route('/')
    .get(projectController.getAllProjects)
    .post(projectController.createProject);

router.route('/:id')
    .get(projectController.getProject)
    .patch(projectController.updateProject)
    .delete(projectController.deleteProject);

// Specialized routes for freelancer and client projects
router.get('/freelancer/:freelancerId', projectController.getFreelancerProjects);
router.get('/client/:clientId', projectController.getClientProjects);

module.exports = router;