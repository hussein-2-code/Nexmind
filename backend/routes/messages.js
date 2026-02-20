const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const authController = require('../controllers/authController');
const notificationController = require('../controllers/notificationController');

router.use(authController.protect);

// Get messages for a conversation
router.get('/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit, 10) || 50, 1);
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

        const messages = await Message.find({ conversationId })
            .populate('senderId', 'name email photo')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Message.countDocuments({ conversationId });

        res.json({
            status: 'success',
            data: {
                messages: messages.reverse(),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Error in GET /messages:', error);
        res.status(500).json({
            status: 'error',
            error: error.message,
        });
    }
});

// Send a new message
router.post('/', async (req, res) => {
    try {
        const { conversationId, receiverId, content } = req.body;
        const currentUserId = req.user.id;

        if (!conversationId || !receiverId || !content?.trim()) {
            return res.status(400).json({
                status: 'error',
                error: 'conversationId, receiverId and content are required',
            });
        }

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

        const receiverIsParticipant = conversation.participants.some(
            (participantId) => participantId.toString() === receiverId
        );

        if (!receiverIsParticipant) {
            return res.status(400).json({
                status: 'error',
                error: 'Receiver is not part of this conversation',
            });
        }

        const message = new Message({
            conversationId,
            senderId: currentUserId,
            receiverId,
            content: content.trim(),
        });
        await message.save();

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: content.trim(),
            lastMessageTime: new Date(),
            $inc: { [`unreadCount.${receiverId}`]: 1 },
        });

        const populatedMessage = await Message.findById(message._id).populate(
            'senderId',
            'name email photo'
        );

        const senderName = populatedMessage.senderId?.name || 'Someone';
        const contentPreview = content.trim().length > 60 ? content.trim().substring(0, 60) + '…' : content.trim();
        await notificationController.createNotification(receiverId, {
            type: 'message',
            title: 'New message',
            message: `${senderName}: ${contentPreview}`,
            link: `/messages/${conversationId}`,
            relatedId: conversationId,
            relatedModel: 'Conversation',
        });

        res.status(201).json({
            status: 'success',
            data: populatedMessage,
        });
    } catch (error) {
        console.error('Error in POST /messages:', error);
        res.status(500).json({
            status: 'error',
            error: error.message,
        });
    }
});

module.exports = router;
