import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:8000/api';

const MessageButton = ({ projectId, userId, userName, className = '' }) => {
    const navigate = useNavigate();

    const handleStartChat = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_BASE}/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId,
                    participantId: userId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to start conversation');
            }

            const data = await response.json();
            const conversationId = data?.data?._id;
            
            // Navigate to the conversation directly when available
            navigate(conversationId ? `/messages/${conversationId}` : '/messages');
            
            // Show success message
            toast.success(`Now chatting with ${userName || 'user'}`);
            
        } catch (error) {
            console.error('Error starting chat:', error);
            toast.error('Failed to start conversation');
        }
    };

    return (
        <button
            onClick={handleStartChat}
            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00ffff] to-[#9945ff] text-white rounded-lg hover:shadow-lg hover:shadow-[#00ffff]/20 transition-all ${className}`}
        >
            <MessageCircle size={18} />
            <span>Message</span>
        </button>
    );
};

export default MessageButton;
