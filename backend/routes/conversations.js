const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const authController = require('../controllers/authController');

router.use(authController.protect);

// Get all conversations for logged in user
router.get('/', async (req, res) => {
    try {
        const currentUserId = req.user.id;

        const conversations = await Conversation.find({
            participants: currentUserId,
        })
            .populate('participants', 'name email photo')
            .populate('projectId', 'projectName platform technology status')
            .sort({ lastMessageTime: -1 });

        const conversationsWithUnread = conversations.map((conv) => ({
            ...conv.toObject(),
            unreadCount: conv.unreadCount?.get(currentUserId) || 0,
        }));

        res.json({
            status: 'success',
            data: conversationsWithUnread,
        });
    } catch (error) {
        console.error('Error in GET /conversations:', error);
        res.status(500).json({
            status: 'error',
            error: error.message,
        });
    }
});

// Create new conversation
router.post('/', async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { projectId, participantId } = req.body;

        if (!projectId || !participantId) {
            return res.status(400).json({
                status: 'error',
                error: 'projectId and participantId are required',
            });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, participantId] },
            projectId,
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [currentUserId, participantId],
                projectId,
                unreadCount: {
                    [currentUserId]: 0,
                    [participantId]: 0,
                },
            });
            await conversation.save();
        }

        await conversation.populate('participants', 'name email photo');
        await conversation.populate('projectId', 'projectName platform technology status');

        res.status(201).json({
            status: 'success',
            data: conversation,
        });
    } catch (error) {
        console.error('Error in POST /conversations:', error);
        res.status(500).json({
            status: 'error',
            error: error.message,
        });
    }
});

// Mark conversation as read
router.put('/:conversationId/read', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const currentUserId = req.user.id;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: currentUserId,
        });

        if (!conversation) {
            return res.status(403).json({
                status: 'error',
                error: 'Access denied',
            });
        }

        await Message.updateMany(
            {
                conversationId,
                receiverId: currentUserId,
                read: false,
            },
            { read: true }
        );

        await Conversation.findByIdAndUpdate(conversationId, {
            $set: { [`unreadCount.${currentUserId}`]: 0 },
        });

        res.json({
            status: 'success',
            data: { message: 'Marked as read' },
        });
    } catch (error) {
        console.error('Error in PUT /conversations/read:', error);
        res.status(500).json({
            status: 'error',
            error: error.message,
        });
    }
});

module.exports = router;
