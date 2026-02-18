import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { MessageCircle, Menu, ArrowLeft, Send, Search, User, Clock } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';

const Messages = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const {
    conversations,
    activeChat,
    messages,
    loading,
    selectChat,
    sendMessage,
    fetchConversations,
    fetchMessages,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const currentUserId = user?._id || user?.id;

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get other participant in conversation
  const getOtherUser = (conversation) => {
    if (!conversation?.participants) return null;
    return conversation.participants.find((p) => p._id !== currentUserId);
  };

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return conversations;

    return conversations.filter((conv) => {
      const other = getOtherUser(conv);
      const projectName = conv?.projectId?.projectName || '';
      return (
        other?.name?.toLowerCase().includes(keyword) ||
        other?.email?.toLowerCase().includes(keyword) ||
        projectName.toLowerCase().includes(keyword)
      );
    });
  }, [conversations, searchTerm]);

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Check if yesterday
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    // Otherwise return date
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Handle send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage(messageInput);
    setMessageInput('');
  };

  // Auto-refresh conversations
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (activeChat?._id) {
        fetchMessages(activeChat._id, { silent: true, markRead: false });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeChat?._id, fetchConversations, fetchMessages]);

  // Handle conversation from URL
  useEffect(() => {
    if (!conversationId || !conversations.length) return;
    if (activeChat?._id === conversationId) return;

    const targetConversation = conversations.find((c) => c._id === conversationId);
    if (targetConversation) {
      selectChat(targetConversation);
      if (isMobile) setSidebarOpen(false);
    }
  }, [conversationId, conversations, activeChat?._id, selectChat, isMobile]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
            <p className="text-[#b0b0b0]">
              Communicate with clients and freelancers about your projects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs bg-[#00ffff]/10 border border-[#00ffff]/30 text-[#00ffff]">
              Live
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-[#2a2a2a] text-[#b0b0b0]">
              Auto-refresh: 5s
            </span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="h-[calc(100vh-220px)] bg-[#121212] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-2xl flex">
          {/* Sidebar - Conversations List */}
          <aside
            className={`${
              sidebarOpen ? 'block' : 'hidden'
            } md:block w-full md:w-[380px] bg-[#151515] border-r border-[#2a2a2a] ${
              isMobile ? 'absolute inset-0 z-20' : 'relative'
            }`}
          >
            <div className="p-4 border-b border-[#2a2a2a] bg-[#121212]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">Conversations</h2>
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-[#2a2a2a] text-[#b0b0b0] transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or project..."
                  className="w-full pl-9 pr-3 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-[#808080] focus:outline-none focus:border-[#00ffff] transition-colors"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="overflow-y-auto h-[calc(100%-118px)]">
              {loading && !conversations.length ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 border-2 border-[#2a2a2a] border-t-[#00ffff] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[#808080]">Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="mx-auto text-[#808080] mb-3" size={40} />
                  <p className="text-[#b0b0b0] font-medium">No conversations found</p>
                  <p className="text-sm text-[#808080] mt-2">
                    Start a conversation from a project page
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const other = getOtherUser(conv);
                  const isActive = activeChat?._id === conv._id;

                  return (
                    <button
                      key={conv._id}
                      type="button"
                      onClick={() => {
                        selectChat(conv);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className={`w-full text-left p-4 border-b border-[#2a2a2a] transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#00ffff]/10 to-[#9945ff]/10' 
                          : 'hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div className={`absolute inset-0 bg-gradient-to-r from-[#00ffff] to-[#9945ff] rounded-full blur-sm opacity-70 ${
                            isActive ? 'opacity-100' : 'opacity-0'
                          }`} />
                          <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {other?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#00ffff] text-black text-xs flex items-center justify-center font-bold border-2 border-[#151515]">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-white truncate">
                              {other?.name || 'Unknown User'}
                            </p>
                            <span className="text-[10px] text-[#808080] whitespace-nowrap">
                              {formatTime(conv.lastMessageTime)}
                            </span>
                          </div>
                          
                          <p className="text-xs text-[#00ffff] truncate mb-1">
                            {conv.projectId?.projectName || 'Project Conversation'}
                          </p>
                          
                          <p className="text-xs text-[#808080] truncate">
                            {conv.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Main Chat Area */}
          <section className="flex-1 flex flex-col bg-[#0f0f0f]">
            {/* Mobile Menu Button */}
            {!sidebarOpen && isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="m-3 p-2 w-fit rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[#b0b0b0] hover:bg-[#2a2a2a] transition-colors"
              >
                <Menu size={18} />
              </button>
            )}

            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-[#2a2a2a] bg-[#121212] flex items-center gap-3">
                  {isMobile && (
                    <button 
                      onClick={() => setSidebarOpen(true)} 
                      className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                    >
                      <Menu size={18} className="text-[#b0b0b0]" />
                    </button>
                  )}
                  
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
                      <span className="text-white font-bold text-base">
                        {getOtherUser(activeChat)?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      {getOtherUser(activeChat)?.name || 'Conversation'}
                    </h3>
                    <p className="text-xs text-[#808080]">
                      {activeChat.projectId?.projectName || 'Project'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center">
                      <div>
                        <MessageCircle size={40} className="mx-auto text-[#808080] mb-3" />
                        <p className="text-[#b0b0b0] font-medium">No messages yet</p>
                        <p className="text-sm text-[#808080] mt-2">
                          Send the first message to start the conversation
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isOwn = msg.senderId?._id === currentUserId;
                      const showDate = index === 0 || 
                        new Date(msg.createdAt).toDateString() !== 
                        new Date(messages[index - 1]?.createdAt).toDateString();

                      return (
                        <React.Fragment key={msg._id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="px-3 py-1 bg-[#1a1a1a] rounded-full text-xs text-[#808080] border border-[#2a2a2a]">
                                {new Date(msg.createdAt).toLocaleDateString([], { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                                isOwn
                                  ? 'bg-gradient-to-r from-[#00ffff] to-[#9945ff] text-white'
                                  : 'bg-[#1a1a1a] text-[#e5e5e5] border border-[#2a2a2a]'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                              <div className={`flex items-center justify-end gap-1 mt-2 text-[10px] ${
                                isOwn ? 'text-white/70' : 'text-[#808080]'
                              }`}>
                                <span>{formatTime(msg.createdAt)}</span>
                                {isOwn && msg.read && (
                                  <span className="ml-1">✓✓</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-[#2a2a2a] bg-[#121212]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-[#808080] focus:outline-none focus:border-[#00ffff] transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-[#00ffff] to-[#9945ff] text-white rounded-xl hover:shadow-lg hover:shadow-[#00ffff]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <Send size={16} />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // No Chat Selected
              <div className="flex-1 flex items-center justify-center px-6 text-center">
                <div>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
                    <MessageCircle size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Select a Conversation
                  </h3>
                  <p className="text-[#808080] max-w-sm">
                    Choose a conversation from the sidebar to start messaging
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;