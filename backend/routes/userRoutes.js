const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const groqController = require('../controllers/groqController');
const deepseekController = require('../controllers/deepseekController');
const uploadPhoto = require('../utils/uploadPhoto');

const router = express.Router();

// Use DeepSeek if DEEPSEEK_API_KEY is set, otherwise Groq (same route, same response shape)
const generateDashboardUI = (req, res, next) =>
  process.env.DEEPSEEK_API_KEY
    ? deepseekController.generateDashboardUI(req, res, next)
    : groqController.generateDashboardUI(req, res, next);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Public routes for freelancers
router.get('/freelancers', userController.getFreelancers);
router.get('/freelancers/:id', userController.getFreelancerById);

// Protect all routes after this middleware
router.use(authController.protect);

// User profile routes
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// New routes for updating user skills and bio
router.patch('/updateMyBio', userController.updateMyBio);
router.patch('/updateMySkills', userController.updateMySkills);
router.patch('/updateMyProfile', userController.updateMyProfile); // Bulk update for bio, skills, and other profile fields
router.post('/addSkill', userController.addSkill);
//removeSkill
router.delete('/removeSkill/:skill', userController.removeSkill);


// Upload profile photo from device (single file, field name "photo")
router.post('/upload-photo', uploadPhoto, userController.uploadPhoto);

// AI dashboard UI generation (DeepSeek if DEEPSEEK_API_KEY set, else Groq)
router.post('/generate-dashboard-ui', generateDashboardUI);

// Admin only routes
router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers)
    .patch(userController.updateUser);
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;