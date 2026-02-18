const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');
const Project = require('../models/projectModel');
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

    // Check if freelancer exists
    const freelancer = await User.findById(freelancerId);
    if (!freelancer) {
        return next(new AppError('Freelancer not found', 404));
    }

    const projects = await Project.find({ freeLancer: freelancerId })
        .populate('client', 'name email') // Populate client details
        .populate('freeLancer', 'name email'); // Populate freelancer details

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

    // Check if client exists
    const client = await User.findById(clientId);
    if (!client) {
        return next(new AppError('Client not found', 404));
    }

    const projects = await Project.find({ client: clientId })
        .populate('client', 'name email')
        .populate('freeLancer', 'name email');

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
        .populate('client', 'name email')
        .populate('freeLancer', 'name email');

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

// Update a project
exports.updateProject = catchAsync(async (req, res, next) => {
    const project = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    ).populate('client', 'name email')
     .populate('freeLancer', 'name email');

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
        .populate('client', 'name email')
        .populate('freeLancer', 'name email');

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