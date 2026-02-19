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
import { useTheme } from '../context/ThemeContext';
import { getAvatarUrl } from '../utils/avatar';

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
  const { darkMode } = useTheme();
  const queryClient = useQueryClient();

  const sectionClass = darkMode ? 'bg-[#121212] border border-[#2a2a2a]' : 'bg-white border border-slate-200';
  const labelClass = darkMode ? 'text-[#b0b0b0]' : 'text-slate-600';
  const inputClass = darkMode
    ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#808080] focus:outline-none focus:border-[#00ffff]'
    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500';
  const textMuted = darkMode ? 'text-[#808080]' : 'text-slate-500';
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const errorClass = darkMode ? 'bg-[#ff3333]/10 border border-[#ff3333]/30 text-[#ff8080]' : 'bg-red-50 border border-red-200 text-red-600';
  const successClass = darkMode ? 'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#a9ffcf]' : 'bg-emerald-50 border border-emerald-200 text-emerald-700';
  const btnPrimary = darkMode ? 'bg-[#00ffff] text-black hover:bg-[#00e6ff]' : 'bg-cyan-500 text-white hover:bg-cyan-600';
  const btnSecondary = darkMode ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]' : 'bg-slate-200 text-slate-800 hover:bg-slate-300';
  const dangerBorder = darkMode ? 'border-[#ff3333] text-[#ff8080] hover:bg-[#ff3333]/10' : 'border-red-500 text-red-600 hover:bg-red-50';

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

  // Photo URL input (for "Update photo" form)
  const [photoInput, setPhotoInput] = useState('');

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
      if (updated) updateUser(updated);
      setPhotoInput('');
      queryClient.invalidateQueries(['me']);
    },
  });

  // Upload photo from device (file input)
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await fetch(`${API_URL}/upload-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      return data;
    },
    onSuccess: (data) => {
      const updated = extractUser(data);
      if (updated) {
        updateUser(updated);
        setProfileForm((prev) => ({ ...prev, photo: updated.photo ?? prev.photo }));
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
        <div className={`text-center py-12 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          You must be logged in to view your profile.
        </div>
      </Layout>
    );
  }

  if (meLoading && !meData) {
    return (
      <Layout>
        <div className={`text-center py-12 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Loading profile...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${textPrimary}`}>Profile</h1>
            <p className={labelClass}>
              Manage your personal information and account settings.
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${
            isFreelancer 
              ? darkMode ? 'bg-[#00ffff]/10 border border-[#00ffff]/30 text-[#00ffff]' : 'bg-cyan-100 border border-cyan-200 text-cyan-700'
              : darkMode ? 'bg-[#9945ff]/10 border border-[#9945ff]/30 text-[#d8b6ff]' : 'bg-violet-100 border border-violet-200 text-violet-700'
          }`}>
            {isFreelancer ? 'Freelancer Account' : 'User Account'}
          </div>
        </div>

        {meError && (
          <div className={`p-3 rounded-lg text-sm ${errorClass}`}>
            {meError.message || 'Failed to load profile data.'}
          </div>
        )}

        <section className={`${sectionClass} rounded-xl p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <img
                  src={getAvatarUrl(profileForm, 96)}
                  alt={profileForm.name}
                  className="w-24 h-24 rounded-full object-cover ring-2 ring-cyan-500/30 dark:ring-[#00ffff]/30"
                  onError={(e) => { e.target.src = getAvatarUrl({ name: profileForm.name }, 96); }}
                />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${textPrimary}`}>{profileForm.name}</h2>
                <p className={`text-sm ${labelClass}`}>{profileForm.email}</p>
                {isFreelancer && (
                  <div className="flex items-center gap-2 mt-2">
                    <Briefcase size={14} className={darkMode ? 'text-[#00ffff]' : 'text-cyan-600'} />
                    <span className={`text-xs ${textMuted}`}>
                      {profileForm.skills?.length || 0} skills listed
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className={`flex-1 border-t sm:border-t-0 sm:border-l ${darkMode ? 'border-[#2a2a2a]' : 'border-slate-200'} pt-4 sm:pt-0 sm:pl-6`}>
              <p className={`text-sm font-medium mb-2 ${labelClass}`}>Profile photo</p>
              <p className={`text-xs ${textMuted} mb-3`}>Upload from your device or paste an image URL. Leave empty to use your initials.</p>
              {/* Upload from device */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                  id="profile-photo-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadPhotoMutation.mutate(file);
                      e.target.value = '';
                    }
                  }}
                />
                <label
                  htmlFor="profile-photo-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${darkMode ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                >
                  <Upload size={16} />
                  {uploadPhotoMutation.isPending ? 'Uploading...' : 'Upload from device'}
                </label>
                <span className={`text-xs ${textMuted}`}>JPEG, PNG, GIF or WebP, max 5MB</span>
              </div>
              {uploadPhotoMutation.error && (
                <p className={`text-xs mb-2 ${errorClass}`}>{uploadPhotoMutation.error.message}</p>
              )}
              {/* Or paste URL */}
              <div className="flex flex-wrap items-end gap-2">
                <input
                  type="url"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="Or paste image URL"
                  className={`flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm ${inputClass}`}
                  disabled={updateProfileMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = photoInput.trim();
                    updateProfileMutation.mutate({ photo: url });
                  }}
                  disabled={updateProfileMutation.isPending}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${btnPrimary}`}
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Use URL'}
                </button>
                {profileForm.photo && (
                  <button
                    type="button"
                    onClick={() => updateProfileMutation.mutate({ photo: '' })}
                    disabled={updateProfileMutation.isPending}
                    className={`px-4 py-2 rounded-lg text-sm ${labelClass} hover:underline`}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={`${sectionClass} rounded-xl p-6 space-y-4`}>
          <h2 className={`text-xl font-semibold ${textPrimary}`}>Personal information</h2>
          <p className={`text-sm ${textMuted}`}>
            Update your basic profile details.
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={`block w-full px-3 py-2 rounded-lg ${inputClass}`}
                  placeholder="Your name"
                  required
                  disabled={updateProfileMutation.isPending}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className={`block w-full px-3 py-2 rounded-lg ${inputClass}`}
                  placeholder="you@example.com"
                  required
                  disabled={updateProfileMutation.isPending}
                />
              </div>
            </div>

            {/* Bio section - only for freelancers */}
            {isFreelancer && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={4}
                  className={`block w-full px-3 py-2 rounded-lg resize-none ${inputClass}`}
                  placeholder="Tell potential clients about yourself, your experience, and what you specialize in..."
                  disabled={updateProfileMutation.isPending}
                />
                <p className={`mt-1 text-xs ${textMuted}`}>
                  Maximum 500 characters. {profileForm.bio?.length || 0}/500
                </p>
              </div>
            )}

            {updateProfileMutation.error && (
              <div className={`p-2 rounded-lg text-xs ${errorClass}`}>
                {updateProfileMutation.error.message || 'Failed to update profile.'}
              </div>
            )}

            {updateProfileMutation.isSuccess && (
              <div className={`p-2 rounded-lg text-xs ${successClass}`}>
                Profile updated successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${btnPrimary}`}
            >
              <Save size={16} />
              {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </section>

        {/* Skills section - only for freelancers */}
        {isFreelancer && (
          <section className={`${sectionClass} rounded-xl p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-semibold ${textPrimary}`}>Skills & Expertise</h2>
                <p className={`text-sm ${textMuted}`}>
                  Add skills to help clients find you.
                </p>
              </div>
              <button
                onClick={() => setIsAddingSkill(true)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${btnSecondary}`}
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
                  <div className={`flex gap-2 p-4 rounded-lg border ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-slate-50 border-slate-200'}`}>
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g., React, Node.js, UI/UX Design..."
                      className={`flex-1 px-3 py-2 rounded-lg ${inputClass}`}
                      autoFocus
                      disabled={addSkillMutation.isPending}
                    />
                    <button
                      type="submit"
                      disabled={!newSkill.trim() || addSkillMutation.isPending}
                      className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${btnPrimary}`}
                    >
                      {addSkillMutation.isPending ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingSkill(false);
                        setNewSkill('');
                      }}
                      className={`px-3 py-2 rounded-lg ${btnSecondary}`}
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
                    className={`group relative px-4 py-2 rounded-lg border ${darkMode ? 'bg-gradient-to-r from-[#00ffff]/10 to-[#9945ff]/10 border-[#00ffff]/30' : 'bg-cyan-50 border-cyan-200'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Code size={14} className={darkMode ? 'text-[#00ffff]' : 'text-cyan-600'} />
                      <span className={`text-sm ${textPrimary}`}>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        disabled={removeSkillMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-200 dark:hover:bg-[#ff3333]/20 rounded"
                      >
                        <X size={14} className="text-red-500 dark:text-[#ff8080]" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className={`text-sm py-4 ${textMuted}`}>
                  No skills added yet. Add your first skill to get started.
                </p>
              )}
            </div>

            {addSkillMutation.error && (
              <div className={`p-2 rounded-lg text-xs ${errorClass}`}>
                {addSkillMutation.error.message}
              </div>
            )}
          </section>
        )}

        {/* CV section - only for freelancers */}
        {/* {isFreelancer && (
          <section className={`${sectionClass} rounded-xl p-6 space-y-4`}>
            <h2 className={`text-xl font-semibold ${textPrimary}`}>CV / Resume</h2>
            <p className={`text-sm ${textMuted}`}>
              Upload your CV to help clients learn more about your experience.
            </p>

            <div className="flex items-center gap-4">
              {profileForm.cv && profileForm.cv !== './' ? (
                <div className={`flex-1 flex items-center justify-between p-4 rounded-lg border ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <Award size={20} className={darkMode ? 'text-[#00ffff]' : 'text-cyan-600'} />
                    <span className={`text-sm ${textPrimary}`}>Current CV uploaded</span>
                  </div>
                  <button
                    onClick={() => window.open(profileForm.cv, '_blank')}
                    className={`px-3 py-1 rounded text-sm ${btnSecondary}`}
                  >
                    View
                  </button>
                </div>
              ) : (
                <button
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${btnSecondary}`}
                >
                  <Upload size={16} />
                  Upload CV
                </button>
              )}
            </div>
          </section>
        )} */}

        {/* Password section */}
        <section className={`${sectionClass} rounded-xl p-6 space-y-4`}>
          <h2 className={`text-xl font-semibold ${textPrimary}`}>Change password</h2>
          <p className={`text-sm ${textMuted}`}>
            Update your password to keep your account secure.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Current password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                className={`block w-full px-3 py-2 rounded-lg ${inputClass}`}
                placeholder="••••••••"
                required
                disabled={updatePasswordMutation.isPending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  New password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className={`block w-full px-3 py-2 rounded-lg ${inputClass}`}
                  placeholder="••••••••"
                  required
                  disabled={updatePasswordMutation.isPending}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPasswordConfirm}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPasswordConfirm: e.target.value }))
                  }
                  className={`block w-full px-3 py-2 rounded-lg ${inputClass}`}
                  placeholder="••••••••"
                  required
                  disabled={updatePasswordMutation.isPending}
                />
              </div>
            </div>

            {updatePasswordMutation.error && (
              <div className={`p-2 rounded-lg text-xs ${errorClass}`}>
                {updatePasswordMutation.error.message || 'Failed to update password.'}
              </div>
            )}

            {updatePasswordMutation.isSuccess && (
              <div className={`p-2 rounded-lg text-xs ${successClass}`}>
                Password updated successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={updatePasswordMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-[#ff3333] text-white rounded-lg text-sm font-medium hover:bg-red-700 dark:hover:bg-[#ff4d4d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Lock size={16} />
              {updatePasswordMutation.isPending ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section className={`rounded-xl p-6 space-y-4 ${darkMode ? 'bg-[#121212] border border-[#ff3333]/40' : 'bg-white border border-red-200'}`}>
          <h2 className={`text-xl font-semibold ${textPrimary}`}>Danger zone</h2>
          <p className={`text-sm ${textMuted}`}>
            Permanently delete your account and all associated data.
          </p>

          {deleteMeMutation.error && (
            <div className={`p-2 rounded-lg text-xs ${errorClass}`}>
              {deleteMeMutation.error.message || 'Failed to delete account.'}
            </div>
          )}

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleteMeMutation.isPending}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-transparent border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${dangerBorder}`}
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