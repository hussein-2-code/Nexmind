const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE || process.env.MONGO_URI || 'mongodb://localhost:27017/data';

const demoUsers = [
    {
        name: 'Admin Demo',
        email: 'admin.demo@example.com',
        role: 'admin',
        password: 'Pass1234',
        passwordConfirm: 'Pass1234',
    },
    {
        name: 'Client Demo',
        email: 'client.demo@example.com',
        role: 'user',
        password: 'Pass1234',
        passwordConfirm: 'Pass1234',
    },
    {
        name: 'Freelancer Demo',
        email: 'freelancer.demo@example.com',
        role: 'freelancer',
        password: 'Pass1234',
        passwordConfirm: 'Pass1234',
        skills: ['React', 'Node.js', 'UI Design'],
        bio: 'Demo freelancer account for university project testing.',
    },
];

const seed = async () => {
    try {
        await mongoose.connect(DB, {});

        await User.deleteMany({
            email: { $in: demoUsers.map((u) => u.email) },
        });

        await User.create(demoUsers);

        console.log('Demo users seeded successfully:');
        console.table(
            demoUsers.map((u) => ({
                role: u.role,
                email: u.email,
                password: 'Pass1234',
            }))
        );

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Failed to seed demo users:', err.message);
        try {
            await mongoose.disconnect();
        } catch (_) {
            // ignore disconnect errors
        }
        process.exit(1);
    }
};

seed();
