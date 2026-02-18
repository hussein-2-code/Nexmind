import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ChatContext = createContext();
const API_BASE = 'http://localhost:8000/api';

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const getAuthHeaders = (extra = {}) => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        ...extra,
    });

    const fetchConversations = useCallback(async () => {
        if (!user) return;

        try {
            const res = await fetch(`${API_BASE}/conversations`, {
                headers: getAuthHeaders(),
            });
            const data = await res.json();
            const nextConversations = data.data || [];
            setConversations(nextConversations);

            if (activeChat?._id) {
                const updatedActive = nextConversations.find((c) => c._id === activeChat._id);
                if (updatedActive) {
                    setActiveChat(updatedActive);
                }
            }
        } catch (error) {
            console.error('Error fetching conversations', error);
        }
    }, [user, activeChat?._id]);

    const fetchMessages = useCallback(async (conversationId, options = {}) => {
        const { silent = false, markRead = true } = options;
        if (!conversationId) return;

        try {
            if (!silent) setLoading(true);

            const res = await fetch(`${API_BASE}/messages/${conversationId}`, {
                headers: getAuthHeaders(),
            });
            const data = await res.json();
            setMessages(data.data?.messages || []);

            if (markRead) {
                await fetch(`${API_BASE}/conversations/${conversationId}/read`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                });
            }
        } catch (error) {
            console.error('Error fetching messages', error);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    const sendMessage = useCallback(async (content) => {
        const currentUserId = user?._id || user?.id;
        if (!content.trim() || !activeChat || !currentUserId) return;

        const receiver = activeChat.participants?.find((p) => p._id !== currentUserId);
        if (!receiver?._id) return;

        try {
            const res = await fetch(`${API_BASE}/messages`, {
                method: 'POST',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    conversationId: activeChat._id,
                    receiverId: receiver._id,
                    content: content.trim(),
                }),
            });

            if (res.ok) {
                await fetchMessages(activeChat._id, { silent: true });
                await fetchConversations();
            }
        } catch (error) {
            toast.error('Failed to send message');
        }
    }, [user, activeChat, fetchMessages, fetchConversations]);

    const selectChat = useCallback((conversation) => {
        setActiveChat(conversation);
        fetchMessages(conversation._id);
    }, [fetchMessages]);

    const startConversation = useCallback(async (projectId, participantId) => {
        try {
            const res = await fetch(`${API_BASE}/conversations`, {
                method: 'POST',
                headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ projectId, participantId }),
            });

            if (!res.ok) {
                throw new Error('Failed to start conversation');
            }

            const data = await res.json();
            await fetchConversations();
            if (data?.data?._id) {
                selectChat(data.data);
            }
            return data?.data;
        } catch (error) {
            toast.error('Failed to start conversation');
            return null;
        }
    }, [fetchConversations, selectChat]);

    useEffect(() => {
        if (user) {
            fetchConversations();
        } else {
            setConversations([]);
            setActiveChat(null);
            setMessages([]);
        }
    }, [user, fetchConversations]);

    return (
        <ChatContext.Provider value={{
            conversations,
            activeChat,
            messages,
            loading,
            selectChat,
            sendMessage,
            startConversation,
            fetchConversations,
            fetchMessages,
        }}>
            {children}
        </ChatContext.Provider>
    );
};
