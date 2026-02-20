import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Trash2,
  Globe,
  Calendar,
  AlertTriangle,
  X,
  Eye,
  Pencil
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000/api/users';
const USERS_QUERY_KEY = ['users'];

// ------------------ API FUNCTIONS ------------------

const fetchUsers = async (token) => {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
};

const deleteUser = async (userId, token) => {
  const response = await fetch(`${API_URL}/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }

  return response.json();
};

const fetchUserById = async (userId, token) => {
  const response = await fetch(`${API_URL}/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to fetch user details');
  }

  return response.json();
};

const updateUserApi = async (userId, payload, token) => {
  const response = await fetch(`${API_URL}/${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user');
  }

  return data;
};

// ------------------ DELETE CONFIRMATION MODAL ------------------

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, user }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#121212] border border-[#2a2a2a] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 51, 51, 0.1)'
          }}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0">
            <div className="absolute top-0 -left-40 w-80 h-80 bg-[#ff3333]/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 -right-40 w-80 h-80 bg-[#9945ff]/20 rounded-full blur-3xl animate-pulse delay-700" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#2a2a2a] text-[#808080] hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="relative p-8">
            {/* Warning icon with animation */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff3333] to-[#ff3333]/50 rounded-full blur-xl opacity-60 animate-pulse" />
                <div className="relative bg-gradient-to-br from-[#ff3333]/20 to-[#ff3333]/5 p-4 rounded-full border-2 border-[#ff3333]/30">
                  <AlertTriangle size={48} className="text-[#ff3333]" />
                </div>
              </motion.div>
            </div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white text-center mb-3"
            >
              Delete User
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[#b0b0b0] text-center mb-8"
            >
              Are you sure you want to delete this user? This action cannot be undone.
            </motion.p>

            {/* User info preview */}
            {user && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-[#1a1a1a] rounded-xl p-4 mb-8 border border-[#2a2a2a]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff] to-[#9945ff] rounded-full blur-sm opacity-70" />
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{user.name || 'Unknown User'}</p>
                    <p className="text-xs text-[#00ffff]">{user.email || 'No email'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-[#ff3333]/20 text-[#ff3333]' :
                      user.role === 'freelancer' ? 'bg-[#00ff88]/20 text-[#00ff88]' :
                      'bg-[#00ffff]/20 text-[#00ffff]'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={onConfirm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#ff3333] to-[#ff3333]/80 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#ff3333]/20 transition-all duration-300 group"
              >
                <Trash2 size={18} className="group-hover:scale-110 transition-transform duration-300" />
                <span>Yes, Delete User</span>
              </button>
              
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white font-medium rounded-lg hover:bg-[#2a2a2a] hover:border-[#00ffff]/50 transition-all duration-300"
              >
                Cancel
              </button>
            </motion.div>

            {/* Security note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-[#808080] text-center mt-6"
            >
              ⚠️ This will permanently remove the user from the database
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ------------------ USER DETAILS MODAL (GET /api/users/:id) ------------------

const UserDetailsModal = ({ isOpen, onClose, userId, token }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserById(userId, token),
    enabled: isOpen && !!userId && !!token,
  });

  if (!isOpen) return null;

  let user = null;
  if (data?.data?.document) user = data.data.document;
  else if (data?.data) user = data.data;
  else user = data;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#121212] border border-[#2a2a2a] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#2a2a2a] text-[#808080] hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="relative p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">User details</h2>

            {isLoading && (
              <p className="text-sm text-[#b0b0b0]">Loading user details...</p>
            )}

            {error && (
              <p className="text-sm text-[#ff8080]">
                {error.message || 'Failed to load user details.'}
              </p>
            )}

            {user && !isLoading && !error && (
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-[#808080]">Name</p>
                  <p className="text-white">{user.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[#808080]">Email</p>
                  <p className="text-white">{user.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[#808080]">Role</p>
                  <p className="text-white">{user.role || 'user'}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ------------------ EDIT USER MODAL (PATCH /api/users/:id) ------------------

const EditUserModal = ({
  isOpen,
  onClose,
  user,
  form,
  setForm,
  onSave,
  isSaving,
}) => {
  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#121212] border border-[#2a2a2a] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#2a2a2a] text-[#808080] hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="relative p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">Edit user</h2>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-[#b0b0b0] mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#00ffff]"
                  placeholder="User name"
                />
              </div>
              <div>
                <label className="block text-[#b0b0b0] mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#00ffff]"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-[#b0b0b0] mb-1">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#00ffff]"
                >
                  <option value="user">User</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-[#00ffff] text-black rounded-lg text-sm font-medium hover:bg-[#00e6ff] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg text-sm font-medium hover:bg-[#2a2a2a]"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ------------------ MAIN COMPONENT ------------------

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
  });
  
  const { token } = useAuth();
  const queryClient = useQueryClient();

  // Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => fetchUsers(token),
    enabled: !!token,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (userId) => deleteUser(userId, token),
    // Optimistic update for instant UI feedback
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY });

      const previousUsers = queryClient.getQueryData(USERS_QUERY_KEY);

      queryClient.setQueryData(USERS_QUERY_KEY, (old) => {
        if (!old) return old;
        const source = old.data?.document || old.document || old;
        if (!Array.isArray(source)) return old;

        const nextList = source.filter(
          (u) => (u._id || u.id) !== userId
        );

        if (old.data?.document) {
          return { ...old, data: { ...old.data, document: nextList } };
        }
        if (old.document) {
          return { ...old, document: nextList };
        }
        return nextList;
      });

      return { previousUsers };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(USERS_QUERY_KEY, context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      setDeleteModalOpen(false);
      setSelectedUser(null);
    },
  });

  // Extract users from response
  let users = [];
  if (data?.data?.document && Array.isArray(data.data.document)) {
    users = data.data.document;
  } else if (data?.document && Array.isArray(data.document)) {
    users = data.document;
  } else if (Array.isArray(data)) {
    users = data;
  }

  // Filter users
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open delete modal
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleDeleteConfirm = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser._id || selectedUser.id);
    }
  };

  // Close delete modal
  const handleDeleteClose = () => {
    setDeleteModalOpen(false);
    setSelectedUser(null);
  };

  // Open details modal
  const handleViewClick = (user) => {
    setSelectedUser(user);
    setDetailsModalOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsModalOpen(false);
  };

  // Open edit modal
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
    });
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
  };

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }) => updateUserApi(userId, payload, token),
    // Optimistic update for smoother UX
    onMutate: async ({ userId, payload }) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY });

      const previousUsers = queryClient.getQueryData(USERS_QUERY_KEY);

      queryClient.setQueryData(USERS_QUERY_KEY, (old) => {
        if (!old) return old;
        const source = old.data?.document || old.document || old;
        if (!Array.isArray(source)) return old;

        const nextList = source.map((u) =>
          (u._id || u.id) === userId ? { ...u, ...payload } : u
        );

        if (old.data?.document) {
          return { ...old, data: { ...old.data, document: nextList } };
        }
        if (old.document) {
          return { ...old, document: nextList };
        }
        return nextList;
      });

      return { previousUsers };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(USERS_QUERY_KEY, context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      setEditModalOpen(false);
    },
  });

  const handleEditSave = () => {
    if (!selectedUser) return;
    const userId = selectedUser._id || selectedUser.id;
    updateUserMutation.mutate({ userId, payload: editForm });
  };

  if (isLoading)
    return (
      <Layout>
        <div className="text-white p-6 text-center">Loading users...</div>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <div className="text-[#ff3333] p-6 text-center">
          Error loading users: {error.message}
          <button 
            onClick={() => queryClient.invalidateQueries(['users'])}
            className="block mx-auto mt-4 px-4 py-2 bg-[#00ffff] text-black rounded-lg"
          >
            Retry
          </button>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            User Directory
          </h1>
          <p className="text-[#b0b0b0]">
            Search, inspect, edit, and remove platform users
          </p>
        </div>

        {/* Search */}
        <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6">
          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]"
            />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#808080] focus:outline-none focus:border-[#00ffff]"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-modern">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
                  <th className="px-6 py-4 text-left text-sm text-[#b0b0b0]">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-[#b0b0b0]">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-[#b0b0b0]">
                    Country
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-[#b0b0b0]">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-[#b0b0b0]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user._id || user.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a]"
                    >
                      <td className="px-6 py-4 text-white">
                        <div>
                          <p className="font-medium">{user.name || 'No Name'}</p>
                          <p className="text-xs text-[#808080]">
                            {user.email || 'No Email'}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-white">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' ? 'bg-[#ff3333]/20 text-[#ff3333]' :
                          user.role === 'freelancer' ? 'bg-[#00ff88]/20 text-[#00ff88]' :
                          'bg-[#00ffff]/20 text-[#00ffff]'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-white">
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-[#808080]" />
                          {user.country || 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-white">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-[#808080]" />
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewClick(user)}
                            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
                          >
                            <Eye size={16} className="text-[#00ffff]" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditClick(user)}
                            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
                            disabled={updateUserMutation.isLoading}
                          >
                            <Pencil
                              size={16}
                              className={updateUserMutation.isLoading ? 'text-[#808080]' : 'text-[#00ff88]'}
                            />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
                            disabled={deleteMutation.isLoading}
                          >
                            <Trash2
                              size={16}
                              className={deleteMutation.isLoading ? 'text-[#808080]' : 'text-[#ff3333]'}
                            />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-[#808080] p-6">
                      No users found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal (GET /api/users/:id) */}
      <UserDetailsModal
        isOpen={detailsModalOpen}
        onClose={handleDetailsClose}
        userId={selectedUser?._id || selectedUser?.id}
        token={token}
      />

      {/* Edit User Modal (PATCH /api/users/:id) */}
      <EditUserModal
        isOpen={editModalOpen}
        onClose={handleEditClose}
        user={selectedUser}
        form={editForm}
        setForm={setEditForm}
        onSave={handleEditSave}
        isSaving={updateUserMutation.isLoading}
      />

      {/* Delete Confirmation Modal (DELETE /api/users/:id) */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        user={selectedUser}
      />
    </Layout>
  );
};

export default UserManagement;
