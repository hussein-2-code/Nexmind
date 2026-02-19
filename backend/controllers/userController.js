const User = require('../models/userModel');
const AppError = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newobj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newobj[el] = obj[el];
    });
    return newobj;
};

// Factory handlers
exports.getAllUsers = Factory.getAll(User);
exports.getUser = Factory.getOne(User);
exports.updateUser = Factory.updateOne(User);
exports.deleteUser = Factory.deleteOne(User);

// Update current user (excluding password)
exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates, please use /updateMyPassword',
                400
            )
        );
    }

    // Updated allowed fields to include bio and skills
    const filteredBody = filterObj(req.body, 'name', 'email', 'bio', 'skills', 'photo', 'cv');
    
    // If skills are being updated, ensure it's an array
    if (filteredBody.skills && !Array.isArray(filteredBody.skills)) {
        return next(new AppError('Skills must be an array', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    ).select('-password -__v');

    res.status(200).json({
        status: 'success',
        data: updatedUser,
    });
});

// Delete current user (soft delete)
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
    });
});

// Get current user ID middleware
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

// Create user (not used, use signup instead)
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined, please use /signup',
    });
};

// Get all freelancers (optional filter by language/skill)
exports.getFreelancers = catchAsync(async (req, res, next) => {
    const filter = { role: 'freelancer' };

    // Filter by language (matches any skill that contains the language, case-insensitive)
    if (req.query.language && typeof req.query.language === 'string') {
        const language = req.query.language.trim();
        if (language) {
            filter.skills = { $in: [new RegExp(`^${ escapeRegex(language) }$`, 'i')] };
        }
    }

    const freelancers = await User.find(filter)
        .select('-password -__v -passwordResetToken -passwordResetExpires')
        .sort('-createdAt');

    if (!freelancers || freelancers.length === 0) {
        return res.status(200).json({
            status: 'success',
            results: 0,
            data: {
                freelancers: []
            },
            message: req.query.language ? 'No freelancers found for this language' : 'No freelancers found'
        });
    }

    res.status(200).json({
        status: 'success',
        results: freelancers.length,
        data: {
            freelancers
        }
    });
});

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get a specific freelancer by ID
exports.getFreelancerById = catchAsync(async (req, res, next) => {
    const freelancer = await User.findOne({ 
        _id: req.params.id, 
        role: 'freelancer' 
    }).select('-password -__v -passwordResetToken -passwordResetExpires');

    if (!freelancer) {
        return next(new AppError('No freelancer found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            freelancer
        }
    });
});

// ==================== NEW PROFILE MANAGEMENT METHODS ====================

// Update user bio only
exports.updateMyBio = catchAsync(async (req, res, next) => {
    // Check if bio is provided
    if (!req.body.bio) {
        return next(new AppError('Please provide a bio', 400));
    }

    // Update only the bio field
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { bio: req.body.bio },
        {
            new: true,
            runValidators: true,
        }
    ).select('-password -__v');

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// Update user skills only (replace all skills)
exports.updateMySkills = catchAsync(async (req, res, next) => {
    // Check if skills array is provided
    if (!req.body.skills || !Array.isArray(req.body.skills)) {
        return next(new AppError('Please provide an array of skills', 400));
    }

    // Validate skills array (filter out empty strings)
    const validSkills = req.body.skills.filter(skill => 
        skill && typeof skill === 'string' && skill.trim().length > 0
    ).map(skill => skill.trim());

    if (validSkills.length === 0) {
        return next(new AppError('Please provide valid skills', 400));
    }

    // Update skills
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { skills: validSkills },
        {
            new: true,
            runValidators: true,
        }
    ).select('-password -__v');

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// Add a single skill to existing skills
exports.addSkill = catchAsync(async (req, res, next) => {
    const { skill } = req.body;

    if (!skill || typeof skill !== 'string' || skill.trim().length === 0) {
        return next(new AppError('Please provide a valid skill', 400));
    }

    const trimmedSkill = skill.trim();
    const user = await User.findById(req.user.id);
    
    // Check if skill already exists (case insensitive)
    const skillExists = user.skills.some(
        s => s.toLowerCase() === trimmedSkill.toLowerCase()
    );

    if (skillExists) {
        return next(new AppError('Skill already exists in your profile', 400));
    }

    // Add new skill
    user.skills.push(trimmedSkill);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            skills: user.skills
        }
    });
});

// Add multiple skills at once
exports.addMultipleSkills = catchAsync(async (req, res, next) => {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return next(new AppError('Please provide an array of skills', 400));
    }

    // Validate and clean skills
    const validNewSkills = skills
        .filter(skill => skill && typeof skill === 'string' && skill.trim().length > 0)
        .map(skill => skill.trim());

    if (validNewSkills.length === 0) {
        return next(new AppError('Please provide valid skills', 400));
    }

    const user = await User.findById(req.user.id);
    
    // Add only skills that don't already exist (case insensitive)
    const existingSkillsLower = user.skills.map(s => s.toLowerCase());
    const skillsToAdd = validNewSkills.filter(
        skill => !existingSkillsLower.includes(skill.toLowerCase())
    );

    if (skillsToAdd.length === 0) {
        return next(new AppError('All provided skills already exist in your profile', 400));
    }

    // Add new skills
    user.skills.push(...skillsToAdd);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: `Added ${skillsToAdd.length} new skill(s)`,
        data: {
            skills: user.skills
        }
    });
});

// Remove a specific skill
exports.removeSkill = catchAsync(async (req, res, next) => {
    const { skill } = req.params;

    if (!skill) {
        return next(new AppError('Please provide a skill to remove', 400));
    }

    const user = await User.findById(req.user.id);
    
    // Check if skill exists before removing
    const skillExists = user.skills.some(
        s => s.toLowerCase() === skill.toLowerCase()
    );

    if (!skillExists) {
        return next(new AppError('Skill not found in your profile', 404));
    }
    
    // Remove skill (case insensitive)
    user.skills = user.skills.filter(
        s => s.toLowerCase() !== skill.toLowerCase()
    );
    
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: {
            skills: user.skills
        }
    });
});

// Bulk update profile (bio, skills, photo, cv, name, email)
exports.updateMyProfile = catchAsync(async (req, res, next) => {
    // Check for password updates
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates, please use /updateMyPassword',
                400
            )
        );
    }

    // Allowed fields for profile update
    const allowedFields = ['name', 'email', 'bio', 'skills', 'photo', 'cv'];
    const filteredBody = filterObj(req.body, ...allowedFields);

    // If skills are being updated, ensure it's an array and clean it
    if (filteredBody.skills) {
        if (!Array.isArray(filteredBody.skills)) {
            return next(new AppError('Skills must be an array', 400));
        }
        // Clean skills
        filteredBody.skills = filteredBody.skills
            .filter(skill => skill && typeof skill === 'string' && skill.trim().length > 0)
            .map(skill => skill.trim());
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    ).select('-password -__v');

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// Get complete user profile (including bio and skills)
exports.getMyProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id)
        .select('-password -__v -passwordResetToken -passwordResetExpires');

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// Update user photo only (URL from body)
exports.updateMyPhoto = catchAsync(async (req, res, next) => {
    if (!req.body.photo) {
        return next(new AppError('Please provide a photo URL', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { photo: req.body.photo },
        {
            new: true,
            runValidators: true,
        }
    ).select('-password -__v');

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// Upload profile photo from file (multer puts file in req.file)
exports.uploadPhoto = catchAsync(async (req, res, next) => {
    if (!req.file || !req.file.filename) {
        return next(new AppError('Please upload an image file (JPEG, PNG, GIF, or WebP, max 5MB)', 400));
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photoUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { photo: photoUrl },
        { new: true, runValidators: true }
    ).select('-password -__v');

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
            photo: photoUrl,
        },
    });
});

// Update user CV
exports.updateMyCv = catchAsync(async (req, res, next) => {
    if (!req.body.cv) {
        return next(new AppError('Please provide a CV URL', 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { cv: req.body.cv },
        {
            new: true,
            runValidators: true,
        }
    ).select('-password -__v');

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// Search freelancers by skills
exports.searchFreelancersBySkills = catchAsync(async (req, res, next) => {
    const { skills } = req.query;

    if (!skills) {
        return next(new AppError('Please provide skills to search for', 400));
    }

    // Split skills by comma and clean them
    const skillsArray = skills.split(',').map(skill => skill.trim());

    // Find freelancers that have at least one of the specified skills (case insensitive)
    const freelancers = await User.find({
        role: 'freelancer',
        skills: { 
            $in: skillsArray.map(skill => new RegExp(skill, 'i')) 
        }
    }).select('-password -__v -passwordResetToken -passwordResetExpires');

    res.status(200).json({
        status: 'success',
        results: freelancers.length,
        data: {
            freelancers
        }
    });
});

// Get freelancers with pagination and filtering
exports.getFreelancersWithFilters = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { role: 'freelancer' };
    
    // Filter by skills if provided
    if (req.query.skills) {
        const skillsArray = req.query.skills.split(',').map(skill => skill.trim());
        filter.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
    }
    
    // Filter by name if provided
    if (req.query.name) {
        filter.name = new RegExp(req.query.name, 'i');
    }

    const freelancers = await User.find(filter)
        .select('-password -__v -passwordResetToken -passwordResetExpires')
        .skip(skip)
        .limit(limit)
        .sort('-createdAt');

    const total = await User.countDocuments(filter);

    res.status(200).json({
        status: 'success',
        results: freelancers.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        data: {
            freelancers
        }
    });
});

// Check if user has a specific skill
exports.hasSkill = catchAsync(async (req, res, next) => {
    const { skill } = req.params;
    const user = await User.findById(req.user.id);

    const hasSkill = user.skills.some(
        s => s.toLowerCase() === skill.toLowerCase()
    );

    res.status(200).json({
        status: 'success',
        data: {
            hasSkill,
            skill
        }
    });
});

// Get all skills of current user
exports.getMySkills = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('skills');

    res.status(200).json({
        status: 'success',
        data: {
            skills: user.skills || []
        }
    });
});

// Clear all skills
exports.clearAllSkills = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { skills: [] },
        {
            new: true,
            runValidators: false,
        }
    ).select('-password -__v');

    res.status(200).json({
        status: 'success',
        message: 'All skills removed',
        data: {
            user: updatedUser
        }
    });
});