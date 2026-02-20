const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');
const Project = require('../models/projectModel');
const notificationController = require('./notificationController');
// Create a new project
exports.createProject = catchAsync(async (req, res, next) => {
    const { projectName, platform, technology, description, response, client, freeLancer } = req.body;

    // Check if both client and freelancer exist
    const clientExists = await User.findById(client);
    const freelancerExists = await User.findById(freeLancer);

    if (!clientExists || !freelancerExists) {
        return next(new AppError('Client or Freelancer not found', 404));
    }

    const project = await Project.create({
        projectName,
        platform,
        technology,
        description,
        response,
        client,
        freeLancer
    });

    await notificationController.createNotification(freeLancer, {
        type: 'project_assigned',
        title: 'New project assigned',
        message: projectName || 'A client assigned you a new project.',
        link: '/freelancer',
        relatedId: project._id,
        relatedModel: 'Project',
    });

    res.status(201).json({
        status: 'success',
        data: {
            project
        }
    });
});

// Get all projects for a specific freelancer
exports.getFreelancerProjects = catchAsync(async (req, res, next) => {
    const freelancerId = req.params.freelancerId;

    const freelancer = await User.findById(freelancerId);
    if (!freelancer) {
        return next(new AppError('Freelancer not found', 404));
    }

    const projects = await Project.find({ freeLancer: freelancerId })
        .sort('-createdAt')
        .populate('client', 'name email photo')
        .populate('freeLancer', 'name email photo');

    res.status(200).json({
        status: 'success',
        results: projects.length,
        data: {
            projects
        }
    });
});


// Get all projects for a specific client
exports.getClientProjects = catchAsync(async (req, res, next) => {
    const clientId = req.params.clientId;

    const client = await User.findById(clientId);
    if (!client) {
        return next(new AppError('Client not found', 404));
    }

    const projects = await Project.find({ client: clientId })
        .sort('-createdAt')
        .populate('client', 'name email photo')
        .populate('freeLancer', 'name email photo');

    res.status(200).json({
        status: 'success',
        results: projects.length,
        data: {
            projects
        }
    });
});

// Get a single project by ID
exports.getProject = catchAsync(async (req, res, next) => {
    const project = await Project.findById(req.params.id)
        .populate('client', 'name email photo')
        .populate('freeLancer', 'name email photo');

    if (!project) {
        return next(new AppError('No project found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            project
        }
    });
});

// Update a project (general update; for status use updateProjectStatus)
exports.updateProject = catchAsync(async (req, res, next) => {
    const project = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    ).populate('client', 'name email photo')
     .populate('freeLancer', 'name email photo');

    if (!project) {
        return next(new AppError('No project found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            project
        }
    });
});

// Update project status (freelancer only; allowed values: pending, in_progress, completed, cancelled)
const ALLOWED_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];

exports.updateProjectStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const projectId = req.params.id;
    const userId = req.user.id;

    if (!status || !ALLOWED_STATUSES.includes(status.toLowerCase())) {
        return next(new AppError('Invalid status. Use: pending, in_progress, completed, or cancelled', 400));
    }

    const project = await Project.findById(projectId);
    if (!project) {
        return next(new AppError('No project found with that ID', 404));
    }

    const freelancerId = (project.freeLancer && (project.freeLancer._id || project.freeLancer)).toString();
    if (freelancerId !== userId.toString()) {
        return next(new AppError('Only the assigned freelancer can update this project status', 403));
    }

    project.status = status.toLowerCase();
    await project.save({ validateBeforeSave: true });

    const updated = await Project.findById(projectId)
        .populate('client', 'name email photo')
        .populate('freeLancer', 'name email photo');

    const clientId = (updated.client && (updated.client._id || updated.client)).toString();
    if (clientId) {
        await notificationController.createNotification(clientId, {
            type: 'project_status',
            title: 'Project status updated',
            message: `"${updated.projectName}" is now ${status.toLowerCase()}.`,
            link: '/projects',
            relatedId: updated._id,
            relatedModel: 'Project',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            project: updated
        }
    });
});

// Delete a project
exports.deleteProject = catchAsync(async (req, res, next) => {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
        return next(new AppError('No project found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Get all projects (with optional filtering)
exports.getAllProjects = catchAsync(async (req, res, next) => {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let query = Project.find(queryObj)
        .populate('client', 'name email photo')
        .populate('freeLancer', 'name email photo');

    // Sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Execute query
    const projects = await query;

    res.status(200).json({
        status: 'success',
        results: projects.length,
        data: {
            projects
        }
    });
});