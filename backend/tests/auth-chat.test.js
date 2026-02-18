const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const app = require('../app');

let mongoServer;

const signupUser = async ({ name, email, role = 'user' }) => {
    const res = await request(app).post('/api/users/signup').send({
        name,
        email,
        role,
        password: 'Pass1234',
        passwordConfirm: 'Pass1234',
    });

    return res;
};

const loginUser = async ({ email }) => {
    return request(app).post('/api/users/login').send({
        email,
        password: 'Pass1234',
    });
};

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {});
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Auth and Chat Integration', () => {
    test('signup and login should return token', async () => {
        const signupRes = await signupUser({
            name: 'Client One',
            email: 'client1@example.com',
            role: 'user',
        });

        expect(signupRes.statusCode).toBe(201);
        expect(signupRes.body.status).toBe('success');
        expect(signupRes.body.token).toBeTruthy();

        const loginRes = await loginUser({ email: 'client1@example.com' });

        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body.status).toBe('success');
        expect(loginRes.body.token).toBeTruthy();
    });

    test('user can create conversation and send/get message', async () => {
        const clientSignup = await signupUser({
            name: 'Client Two',
            email: 'client2@example.com',
            role: 'user',
        });
        const freelancerSignup = await signupUser({
            name: 'Freelancer Two',
            email: 'freelancer2@example.com',
            role: 'freelancer',
        });

        const clientToken = clientSignup.body.token;
        const freelancerId = freelancerSignup.body.data._id;
        const projectId = new mongoose.Types.ObjectId().toString();

        const createConversationRes = await request(app)
            .post('/api/conversations')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ projectId, participantId: freelancerId });

        expect(createConversationRes.statusCode).toBe(201);
        expect(createConversationRes.body.status).toBe('success');
        expect(createConversationRes.body.data._id).toBeTruthy();

        const conversationId = createConversationRes.body.data._id;

        const sendMessageRes = await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                conversationId,
                receiverId: freelancerId,
                content: 'Hello from client',
            });

        expect(sendMessageRes.statusCode).toBe(201);
        expect(sendMessageRes.body.status).toBe('success');
        expect(sendMessageRes.body.data.content).toBe('Hello from client');

        const getMessagesRes = await request(app)
            .get(`/api/messages/${conversationId}`)
            .set('Authorization', `Bearer ${clientToken}`);

        expect(getMessagesRes.statusCode).toBe(200);
        expect(getMessagesRes.body.status).toBe('success');
        expect(Array.isArray(getMessagesRes.body.data.messages)).toBe(true);
        expect(getMessagesRes.body.data.messages.length).toBe(1);
    });

    test('non participant cannot access conversation messages', async () => {
        const clientSignup = await signupUser({
            name: 'Client Three',
            email: 'client3@example.com',
            role: 'user',
        });
        const freelancerSignup = await signupUser({
            name: 'Freelancer Three',
            email: 'freelancer3@example.com',
            role: 'freelancer',
        });
        await signupUser({
            name: 'Intruder User',
            email: 'intruder@example.com',
            role: 'user',
        });

        const intruderLogin = await loginUser({ email: 'intruder@example.com' });

        const clientToken = clientSignup.body.token;
        const freelancerId = freelancerSignup.body.data._id;
        const intruderToken = intruderLogin.body.token;
        const projectId = new mongoose.Types.ObjectId().toString();

        const createConversationRes = await request(app)
            .post('/api/conversations')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ projectId, participantId: freelancerId });

        const conversationId = createConversationRes.body.data._id;

        const forbiddenRes = await request(app)
            .get(`/api/messages/${conversationId}`)
            .set('Authorization', `Bearer ${intruderToken}`);

        expect(forbiddenRes.statusCode).toBe(403);
        expect(forbiddenRes.body.status).toBe('error');
    });
});
