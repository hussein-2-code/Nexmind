const mongoose = require('mongoose');


//review / rating / createdAt / ref to Tour / ref to user;

const projectSchema = new mongoose.Schema(
    {
        projectName:{
            type:String
        },
        platform:{
            type:String
        },
        technology:{
            type:String
        },
        description:{
            type:String
        },
        response:{
            type:String
        },
        client: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A review must belong to a User'],
        },
        freeLancer: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A review must belong to a User'],
        },
                createdAt: {
            type: Date,
            default: Date.now(),
        },
    }
);


const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
