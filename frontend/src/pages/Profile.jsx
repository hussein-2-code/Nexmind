import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Trash2, 
  Save,
  Plus,
  X,
  Award,
  Code,
  Briefcase,
  Upload,
  Edit3
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000/api/users';

// Normalize user from different possible API response shapes
const extractUser = (data) => {
  if (!data) return null;
  if (data.data?.document) return data.data.document;
  if (data.data?.user) return data.data.user;
  if (data.data) return data.data;
  if (data.user) return data.user;
  return data;
};

const Profile = () => {
  const { token, user, updateUser, logout } = useAuth();
  const queryClient = useQueryClient();

  // Check if user is a freelancer
  const isFreelancer = user?.role === 'freelancer';

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    photo: user?.photo || '',
    cv: user?.cv || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });

  // New skill input state
  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Fetch current user from /me to stay in sync with backend
  const {
    data: meData,
    isLoading: meLoading,
    error: meError,
  } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load profile');
      }

      return data;
    },
    enabled: !!token,
  });

  // Keep local form state in sync with latest user data
  useEffect(() => {
    const sourceUser = extractUser(meData) || user;
    if (sourceUser) {
      setProfileForm({
        name: sourceUser.name || '',
        email: sourceUser.email || '',
        bio: sourceUser.bio || '',
        skills: sourceUser.skills || [],
        photo: sourceUser.photo || '',
        cv: sourceUser.cv || '',
      });
    }
  }, [meData, user]);

  // Update profile (name, email, bio) -> PATCH /updateMe
  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await fetch(`${API_URL}/updateMe`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      return data;
    },
    onSuccess: (data) => {
      const updated = extractUser(data);
      if (updated) {
        updateUser(updated);
      }
      queryClient.invalidateQueries(['me']);
    },
  });

  // Add skill mutation
  const addSkillMutation = useMutation({
    mutationFn: async (skill) => {
      const response = await fetch(`${API_URL}/addSkill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skill }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add skill');
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.data?.skills) {
        updateUser({ ...user, skills: data.data.skills });
        setProfileForm(prev => ({ ...prev, skills: data.data.skills }));
      }
      setNewSkill('');
      setIsAddingSkill(false);
      queryClient.invalidateQueries(['me']);
    },
  });

  // Remove skill mutation
  const removeSkillMutation = useMutation({
    mutationFn: async (skill) => {
      const response = await fetch(`${API_URL}/removeSkill/${encodeURIComponent(skill)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok && response.status !== 200) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to remove skill');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.data?.skills) {
        updateUser({ ...user, skills: data.data.skills });
        setProfileForm(prev => ({ ...prev, skills: data.data.skills }));
      }
      queryClient.invalidateQueries(['me']);
    },
  });

  // Update password -> PATCH /updateMyPassword
  const updatePasswordMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await fetch(`${API_URL}/updateMyPassword`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      return data;
    },
    onSuccess: () => {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
      });
    },
  });

  // Delete current user -> DELETE /deleteMe
  const deleteMeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/deleteMe`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete account');
      }

      return null;
    },
    onSuccess: () => {
      logout();
    },
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: profileForm.name,
      email: profileForm.email,
    };
    // Only include bio if user is freelancer
    if (isFreelancer && profileForm.bio) {
      payload.bio = profileForm.bio;
    }
    updateProfileMutation.mutate(payload);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim()) {
      addSkillMutation.mutate(newSkill.trim());
    }
  };

  const handleRemoveSkill = (skill) => {
    if (window.confirm(`Remove skill "${skill}"?`)) {
      removeSkillMutation.mutate(skill);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    updatePasswordMutation.mutate(passwordForm);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      deleteMeMutation.mutate();
    }
  };

  if (!token) {
    return (
      <Layout>
        <div className="text-center text-white py-12">
          You must be logged in to view your profile.
        </div>
      </Layout>
    );
  }

  if (meLoading && !meData) {
    return (
      <Layout>
        <div className="text-center text-white py-12">Loading profile...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with role badge */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-[#b0b0b0]">
              Manage your personal information and account settings.
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${
            isFreelancer 
              ? 'bg-[#00ffff]/10 border border-[#00ffff]/30 text-[#00ffff]' 
              : 'bg-[#9945ff]/10 border border-[#9945ff]/30 text-[#d8b6ff]'
          }`}>
            {isFreelancer ? 'Freelancer Account' : 'User Account'}
          </div>
        </div>

        {meError && (
          <div className="p-3 rounded-lg bg-[#ff3333]/10 border border-[#ff3333]/30 text-sm text-[#ff8080]">
            {meError.message || 'Failed to load profile data.'}
          </div>
        )}

        {/* Profile picture section - optional for all users */}
        <section className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
                {profileForm.photo ? (
                  <img 
                    src={profileForm.photo} 
                    alt={profileForm.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-white" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-[#2a2a2a] rounded-full border border-[#3a3a3a] hover:bg-[#3a3a3a] transition-colors">
                <Edit3 size={14} className="text-[#b0b0b0]" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{profileForm.name}</h2>
              <p className="text-sm text-[#b0b0b0]">{profileForm.email}</p>
              {isFreelancer && (
                <div className="flex items-center gap-2 mt-2">
                  <Briefcase size={14} className="text-[#00ffff]" />
                  <span className="text-xs text-[#808080]">
                    {profileForm.skills?.length || 0} skills listed
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Profile information */}
        <section className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Personal information</h2>
          <p className="text-sm text-[#808080]">
            Update your basic profile details.
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#b0b0b0] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="block w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg 
                           text-white placeholder-[#808080] 
                           focus:outline-none focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]
                           transition-all duration-200"
                  placeholder="Your name"
                  required
                  disabled={updateProfileMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0b0] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="block w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg 
                           text-white placeholder-[#808080] 
                           focus:outline-none focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]
                           transition-all duration-200"
                  placeholder="you@example.com"
                  required
                  disabled={updateProfileMutation.isPending}
                />
              </div>
            </div>

            {/* Bio section - only for freelancers */}
            {isFreelancer && (
              <div>
                <label className="block text-sm font-medium text-[#b0b0b0] mb-1">
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={4}
                  className="block w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg 
                           text-white placeholder-[#808080] 
                           focus:outline-none focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]
                           transition-all duration-200 resize-none"
                  placeholder="Tell potential clients about yourself, your experience, and what you specialize in..."
                  disabled={updateProfileMutation.isPending}
                />
                <p className="mt-1 text-xs text-[#808080]">
                  Maximum 500 characters. {profileForm.bio?.length || 0}/500
                </p>
              </div>
            )}

            {updateProfileMutation.error && (
              <div className="p-2 rounded-lg bg-[#ff3333]/10 border border-[#ff3333]/30 text-xs text-[#ff8080]">
                {updateProfileMutation.error.message || 'Failed to update profile.'}
              </div>
            )}

            {updateProfileMutation.isSuccess && (
              <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 text-xs text-[#a9ffcf]">
                Profile updated successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ffff] text-black rounded-lg text-sm font-medium hover:bg-[#00e6ff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={16} />
              {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </section>

        {/* Skills section - only for freelancers */}
        {isFreelancer && (
          <section className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Skills & Expertise</h2>
                <p className="text-sm text-[#808080]">
                  Add skills to help clients find you.
                </p>
              </div>
              <button
                onClick={() => setIsAddingSkill(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] text-white rounded-lg text-sm hover:bg-[#3a3a3a] transition-colors"
              >
                <Plus size={16} />
                Add Skill
              </button>
            </div>

            {/* Add skill form */}
            <AnimatePresence>
              {isAddingSkill && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddSkill}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g., React, Node.js, UI/UX Design..."
                      className="flex-1 px-3 py-2 bg-[#121212] border border-[#2a2a2a] rounded-lg text-white placeholder-[#808080] focus:outline-none focus:border-[#00ffff]"
                      autoFocus
                      disabled={addSkillMutation.isPending}
                    />
                    <button
                      type="submit"
                      disabled={!newSkill.trim() || addSkillMutation.isPending}
                      className="px-4 py-2 bg-[#00ffff] text-black rounded-lg text-sm font-medium hover:bg-[#00e6ff] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addSkillMutation.isPending ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingSkill(false);
                        setNewSkill('');
                      }}
                      className="px-3 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a]"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Skills list */}
            <div className="flex flex-wrap gap-2">
              {profileForm.skills && profileForm.skills.length > 0 ? (
                profileForm.skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group relative px-4 py-2 bg-gradient-to-r from-[#00ffff]/10 to-[#9945ff]/10 border border-[#00ffff]/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Code size={14} className="text-[#00ffff]" />
                      <span className="text-sm text-white">{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        disabled={removeSkillMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#ff3333]/20 rounded"
                      >
                        <X size={14} className="text-[#ff8080]" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-[#808080] py-4">
                  No skills added yet. Add your first skill to get started.
                </p>
              )}
            </div>

            {addSkillMutation.error && (
              <div className="p-2 rounded-lg bg-[#ff3333]/10 border border-[#ff3333]/30 text-xs text-[#ff8080]">
                {addSkillMutation.error.message}
              </div>
            )}
          </section>
        )}

        {/* CV section - only for freelancers */}
        {/* {isFreelancer && (
          <section className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">CV / Resume</h2>
            <p className="text-sm text-[#808080]">
              Upload your CV to help clients learn more about your experience.
            </p>

            <div className="flex items-center gap-4">
              {profileForm.cv && profileForm.cv !== './' ? (
                <div className="flex-1 flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                  <div className="flex items-center gap-3">
                    <Award size={20} className="text-[#00ffff]" />
                    <span className="text-sm text-white">Current CV uploaded</span>
                  </div>
                  <button
                    onClick={() => window.open(profileForm.cv, '_blank')}
                    className="px-3 py-1 bg-[#2a2a2a] text-white rounded text-sm hover:bg-[#3a3a3a]"
                  >
                    View
                  </button>
                </div>
              ) : (
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-white rounded-lg text-sm hover:bg-[#3a3a3a] transition-colors"
                >
                  <Upload size={16} />
                  Upload CV
                </button>
              )}
            </div>
          </section>
        )} */}

        {/* Password section */}
        <section className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Change password</h2>
          <p className="text-sm text-[#808080]">
            Update your password to keep your account secure.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#b0b0b0] mb-1">
                Current password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                className="block w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg 
                         text-white placeholder-[#808080] 
                         focus:outline-none focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]
                         transition-all duration-200"
                placeholder="••••••••"
                required
                disabled={updatePasswordMutation.isPending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#b0b0b0] mb-1">
                  New password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className="block w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg 
                           text-white placeholder-[#808080] 
                           focus:outline-none focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]
                           transition-all duration-200"
                  placeholder="••••••••"
                  required
                  disabled={updatePasswordMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#b0b0b0] mb-1">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPasswordConfirm}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPasswordConfirm: e.target.value }))
                  }
                  className="block w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg 
                           text-white placeholder-[#808080] 
                           focus:outline-none focus:border-[#00ffff] focus:ring-1 focus:ring-[#00ffff]
                           transition-all duration-200"
                  placeholder="••••••••"
                  required
                  disabled={updatePasswordMutation.isPending}
                />
              </div>
            </div>

            {updatePasswordMutation.error && (
              <div className="p-2 rounded-lg bg-[#ff3333]/10 border border-[#ff3333]/30 text-xs text-[#ff8080]">
                {updatePasswordMutation.error.message || 'Failed to update password.'}
              </div>
            )}

            {updatePasswordMutation.isSuccess && (
              <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 text-xs text-[#a9ffcf]">
                Password updated successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={updatePasswordMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff3333] text-white rounded-lg text-sm font-medium hover:bg-[#ff4d4d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Lock size={16} />
              {updatePasswordMutation.isPending ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section className="bg-[#121212] border border-[#ff3333]/40 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Danger zone</h2>
          <p className="text-sm text-[#808080]">
            Permanently delete your account and all associated data.
          </p>

          {deleteMeMutation.error && (
            <div className="p-2 rounded-lg bg-[#ff3333]/10 border border-[#ff3333]/30 text-xs text-[#ff8080]">
              {deleteMeMutation.error.message || 'Failed to delete account.'}
            </div>
          )}

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleteMeMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-[#ff3333] text-[#ff8080] rounded-lg text-sm font-medium hover:bg-[#ff3333]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={16} />
            {deleteMeMutation.isPending ? 'Deleting...' : 'Delete my account'}
          </button>
        </section>
      </div>
    </Layout>
  );
};

export default Profile;