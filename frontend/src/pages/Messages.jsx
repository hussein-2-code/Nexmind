import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { MessageCircle, Menu, ArrowLeft, Send, Search, Sparkles } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { getAvatarUrl } from '../utils/avatar';

const Messages = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { darkMode } = useTheme();
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
  const messagesEndRef = useRef(null);
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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOtherUser = (conversation) => {
    if (!conversation?.participants) return null;
    return conversation.participants.find((p) => p._id !== currentUserId);
  };

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

  const formatTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage(messageInput);
    setMessageInput('');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (activeChat?._id) {
        fetchMessages(activeChat._id, { silent: true, markRead: false });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeChat?._id, fetchConversations, fetchMessages]);

  useEffect(() => {
    if (!conversationId || !conversations.length) return;
    if (activeChat?._id === conversationId) return;

    const targetConversation = conversations.find((c) => c._id === conversationId);
    if (targetConversation) {
      selectChat(targetConversation);
      if (isMobile) setSidebarOpen(false);
    }
  }, [conversationId, conversations, activeChat?._id, selectChat, isMobile]);

  const bgMain = darkMode ? 'bg-[#0d0d0d]' : 'bg-slate-100';
  const bgCard = darkMode ? 'bg-[#0f0f0f]' : 'bg-white';
  const bgInput = darkMode ? 'bg-[#1a1a1a]' : 'bg-slate-50';
  const border = darkMode ? 'border-[#2a2a2a]' : 'border-slate-200';
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textMuted = darkMode ? 'text-[#b0b0b0]' : 'text-slate-600';
  const textDim = darkMode ? 'text-[#808080]' : 'text-slate-500';
  const placeholder = darkMode ? 'placeholder-[#606060]' : 'placeholder-slate-400';
  const hoverBg = darkMode ? 'hover:bg-[#2a2a2a]' : 'hover:bg-slate-100';
  const hoverBgCard = darkMode ? 'hover:bg-[#1a1a1a]' : 'hover:bg-slate-50';

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-5rem)] min-h-0 max-w-7xl mx-auto">
        <div className="flex-shrink-0 flex items-center justify-between gap-4 py-4 px-1">
          <div className="min-w-0">
            <h1 className={`text-2xl sm:text-3xl font-bold truncate ${textPrimary}`}>Messages</h1>
            <p className={`text-sm truncate ${textMuted}`}>Chat with clients and freelancers</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:bg-[#00ff88]/10 dark:text-[#00ff88] border border-emerald-200 dark:border-[#00ff88]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#00ff88] animate-pulse" />
              Live
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs ${textDim} ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-white border border-slate-200 shadow-sm'}`}>
              5s refresh
            </span>
          </div>
        </div>

        <div className={`flex-1 min-h-0 flex rounded-2xl overflow-hidden shadow-xl ${darkMode ? 'border border-[#2a2a2a] bg-[#0d0d0d]' : 'border border-slate-200 bg-white'}`}>
          <aside
            className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[360px] lg:w-[400px] flex-shrink-0 border-r ${border} ${darkMode ? 'bg-[#0f0f0f]' : 'bg-white'} ${isMobile ? 'absolute inset-0 z-20 rounded-2xl' : ''}`}
          >
            <div className={`flex-shrink-0 p-3 sm:p-4 border-b ${border} ${darkMode ? 'bg-[#0d0d0d]/80' : 'bg-slate-50/80'}`}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className={`text-base sm:text-lg font-semibold ${textPrimary}`}>Conversations</h2>
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`p-2 rounded-xl transition-colors ${hoverBg} ${textMuted}`}
                    aria-label="Close sidebar"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
              </div>
              <div className="relative">
                <Search size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textDim}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name or project..."
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all ${bgInput} border ${border} ${textPrimary} ${placeholder}`}
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
              {loading && !conversations.length ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className={`w-10 h-10 border-2 rounded-full animate-spin mb-4 ${darkMode ? 'border-[#2a2a2a] border-t-[#00ffff]' : 'border-slate-200 border-t-cyan-500'}`} />
                  <p className={`text-sm ${textDim}`}>Loading...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-slate-100 border border-slate-200'}`}>
                    <MessageCircle size={28} className={textDim} />
                  </div>
                  <p className={`font-medium mb-1 ${textPrimary}`}>No conversations</p>
                  <p className={`text-sm ${textDim}`}>Start a chat from a project page</p>
                </div>
              ) : (
                <div className="py-1">
                  {filteredConversations.map((conv) => {
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
                        className={`w-full text-left px-3 sm:px-4 py-3.5 mx-1 rounded-xl transition-all duration-200 border ${
                          isActive
                            ? 'bg-cyan-50 dark:bg-gradient-to-r dark:from-[#00ffff]/15 dark:to-[#9945ff]/15 border-cyan-200 dark:border-[#00ffff]/20'
                            : `${hoverBgCard} border-transparent`
                        }`}
                      >
                        <div className="flex gap-3 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img
                              src={getAvatarUrl(other, 48)}
                              alt={other?.name || 'User'}
                              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover ${
                                isActive ? 'ring-2 ring-cyan-500 dark:ring-[#00ffff] shadow-lg' : ''
                              }`}
                              onError={(e) => { e.target.src = getAvatarUrl({ name: other?.name }, 48); }}
                            />
                            {conv.unreadCount > 0 && (
                              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-cyan-500 dark:bg-[#00ffff] text-white dark:text-[#0a0a0a] text-[10px] font-bold flex items-center justify-center">
                                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <p className={`font-semibold truncate text-sm sm:text-base ${textPrimary}`}>
                                {other?.name || 'Unknown'}
                              </p>
                              <span className={`text-[10px] sm:text-xs flex-shrink-0 ${textDim}`}>
                                {formatTime(conv.lastMessageTime)}
                              </span>
                            </div>
                            <p className="text-xs text-cyan-600 dark:text-[#00ffff]/90 truncate mt-0.5">
                              {conv.projectId?.projectName || 'Project'}
                            </p>
                            <p className={`text-xs truncate mt-0.5 ${textDim}`}>
                              {conv.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <section className={`flex-1 flex flex-col min-w-0 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50'}`}>
            {!sidebarOpen && isMobile && (
              <div className="flex-shrink-0 p-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={`p-2.5 rounded-xl border transition-colors ${bgInput} ${border} ${textMuted} ${hoverBg} ${darkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                  aria-label="Open conversations"
                >
                  <Menu size={20} />
                </button>
              </div>
            )}

            {activeChat ? (
              <>
                <header className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 border-b ${border} ${darkMode ? 'bg-[#0d0d0d]/95' : 'bg-white/95'} backdrop-blur-sm`}>
                  {isMobile && (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className={`p-2 rounded-xl transition-colors ${hoverBg} ${textMuted} ${darkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                      aria-label="Back to conversations"
                    >
                      <Menu size={20} />
                    </button>
                  )}
                  <img
                    src={getAvatarUrl(getOtherUser(activeChat), 44)}
                    alt={getOtherUser(activeChat)?.name || 'User'}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover flex-shrink-0"
                    onError={(e) => { e.target.src = getAvatarUrl({ name: getOtherUser(activeChat)?.name }, 44); }}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-semibold truncate text-sm sm:text-base ${textPrimary}`}>
                      {getOtherUser(activeChat)?.name || 'Conversation'}
                    </h3>
                    <p className={`text-xs truncate ${textDim}`}>
                      {activeChat.projectId?.projectName || 'Project'}
                    </p>
                  </div>
                </header>

                {/* Messages - scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                  <div className="p-4 sm:p-5 pb-2 space-y-3 min-h-full flex flex-col">
                    {messages.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center py-16">
                        <div className="text-center max-w-xs">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-slate-100 border border-slate-200'}`}>
                            <Sparkles size={28} className="text-cyan-500 dark:text-[#00ffff]/60" />
                          </div>
                          <p className={`font-medium mb-1 ${textPrimary}`}>No messages yet</p>
                          <p className={`text-sm ${textDim}`}>Send the first message to start the conversation</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isOwn = msg.senderId?._id === currentUserId;
                        const showDate =
                          index === 0 ||
                          new Date(msg.createdAt).toDateString() !==
                            new Date(messages[index - 1]?.createdAt).toDateString();

                        return (
                          <React.Fragment key={msg._id}>
                            {showDate && (
                              <div className="flex justify-center my-2">
                                <span className={`px-3 py-1.5 rounded-full text-xs ${textDim} ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a]' : 'bg-slate-100 border border-slate-200'}`}>
                                  {new Date(msg.createdAt).toLocaleDateString([], {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: index === 0 ? undefined : 'numeric',
                                  })}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 ${
                                  isOwn
                                    ? 'rounded-br-md bg-gradient-to-br from-cyan-500 to-[#9945ff] text-white shadow-lg shadow-cyan-500/20 dark:shadow-[#00ffff]/10'
                                    : darkMode
                                      ? 'rounded-bl-md bg-[#1a1a1a] text-[#e5e5e5] border border-[#2a2a2a]'
                                      : 'rounded-bl-md bg-white text-slate-800 border border-slate-200 shadow-sm'
                                }`}
                              >
                                <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                                  {msg.content}
                                </p>
                                <div
                                  className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] sm:text-xs ${
                                    isOwn ? 'text-white/80' : textDim
                                  }`}
                                >
                                  <span>{formatTime(msg.createdAt)}</span>
                                  {isOwn && msg.read && (
                                    <span className="opacity-80">✓✓</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input - sticky */}
                <form
                  onSubmit={handleSend}
                  className={`flex-shrink-0 p-3 sm:p-4 border-t ${border} ${darkMode ? 'bg-[#0d0d0d]/95' : 'bg-white/95'} backdrop-blur-sm`}
                >
                  <div className="flex gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className={`flex-1 min-w-0 px-4 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all ${bgInput} border ${border} ${textPrimary} ${placeholder}`}
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="flex-shrink-0 p-3 sm:px-5 sm:py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-[#9945ff] text-white hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <Send size={18} />
                      <span className="hidden sm:inline text-sm">Send</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                <div className="text-center max-w-sm">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-gradient-to-br from-[#00ffff]/20 to-[#9945ff]/20 border border-[#00ffff]/20' : 'bg-cyan-50 border border-cyan-100'}`}>
                    <MessageCircle size={36} className="text-cyan-500 dark:text-[#00ffff]/80 sm:w-10 sm:h-10" />
                  </div>
                  <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${textPrimary}`}>
                    Select a conversation
                  </h3>
                  <p className={`text-sm ${textDim}`}>
                    Choose a chat from the list or start one from a project
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
