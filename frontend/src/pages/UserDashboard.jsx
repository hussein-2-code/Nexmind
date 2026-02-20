import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  X, 
  Search, 
  UserPlus, 
  Loader,
  Briefcase,
  Code,
  Zap,
  Award,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../utils/avatar';

// API URLs
const FREELANCERS_URL = 'http://localhost:8000/api/users/freelancers';
const PROJECTS_URL = 'http://localhost:8000/api/projects';

// Get the primary language/stack from "Programming language / stack" input for freelancer filtering.
// Uses the first token (e.g. "React" from "React + Node.js", "Flutter" from "Flutter + Dart").
const getFilterFromLanguageInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed) return '';
  const first = trimmed.split(/[\s,+/]+/)[0]?.trim();
  return first || trimmed;
};

// Extract freelancers array from API response (handles different response shapes).
const extractFreelancers = (data) => {
  if (!data) return [];
  if (data?.data?.freelancers && Array.isArray(data.data.freelancers)) return data.data.freelancers;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

// ------------------ SELECT FREELANCER MODAL ------------------
const SelectFreelancerModal = ({ isOpen, onClose, token, currentUser, aiResponse, projectDetails, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [hoveredFreelancer, setHoveredFreelancer] = useState(null);

  // Filter freelancers by the "Programming language / stack" value the client entered for this project
  const filterLanguage = projectDetails?.language ? getFilterFromLanguageInput(projectDetails.language) : '';
  const freelancersQueryUrl = filterLanguage
    ? `${FREELANCERS_URL}?language=${encodeURIComponent(filterLanguage)}`
    : FREELANCERS_URL;

  // Fetch freelancers (filtered by project language when set)
  const { data: freelancersData, isLoading: freelancersLoading } = useQuery({
    queryKey: ['freelancers', filterLanguage || 'all'],
    queryFn: async () => {
      const response = await fetch(freelancersQueryUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch freelancers');
      }

      return response.json();
    },
    enabled: isOpen && !!token,
  });

  const freelancersFromFilter = extractFreelancers(freelancersData);
  const filteredResultEmpty = !freelancersLoading && !!filterLanguage && freelancersFromFilter.length === 0;

  // When language filter returns no one, fetch all freelancers so the client can still choose
  const { data: allFreelancersData, isLoading: allFreelancersLoading } = useQuery({
    queryKey: ['freelancers', 'all'],
    queryFn: async () => {
      const response = await fetch(FREELANCERS_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch freelancers');
      return response.json();
    },
    enabled: isOpen && !!token && filteredResultEmpty,
  });

  const allFreelancers = extractFreelancers(allFreelancersData);
  const showingAllAsFallback = filteredResultEmpty && allFreelancers.length > 0;
  const freelancers = showingAllAsFallback ? allFreelancers : freelancersFromFilter;
  const isLoading = freelancersLoading || (filteredResultEmpty && allFreelancersLoading);

  const queryClient = useQueryClient();
  const clientId = currentUser?._id || currentUser?.id;

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData) => {
      const response = await fetch(PROJECTS_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create project');
      }

      return data;
    },
    onSuccess: () => {
      setSelectedFreelancer(null);
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: ['client-projects', clientId] });
      }
      onClose(true);
      toast.success('Project created successfully');
    },
  });

  // Filter freelancers (by search term)
  const filteredFreelancers = freelancers.filter((freelancer) =>
    freelancer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freelancer.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectFreelancer = (freelancer) => {
    setSelectedFreelancer(freelancer);
  };

  const handleCreateProject = () => {
    if (!selectedFreelancer || !currentUser || !aiResponse || !projectDetails) return;

    // Combine HTML and CSS into a single response string
    const combinedResponse = `
      <style>${aiResponse.css}</style>
      ${aiResponse.html}
    `;

    const projectData = {
      projectName: projectDetails.projectName,
      platform: projectDetails.targetPlatform === 'web' ? 'Web' : 
                projectDetails.targetPlatform === 'mobile' ? 'Mobile' : 
                projectDetails.targetPlatform === 'desktop' ? 'Desktop' : 'Other',
      technology: projectDetails.language || 'Various',
      description: projectDetails.description,
      response: combinedResponse.trim(), // Store combined HTML+CSS
      client: currentUser._id || currentUser.id,
      freeLancer: selectedFreelancer._id || selectedFreelancer.id
    };

    createProjectMutation.mutate(projectData);
  };

  const handleClose = () => {
    setSelectedFreelancer(null);
    setSearchTerm('');
    onClose(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${darkMode ? 'bg-black/80' : 'bg-black/50'}`}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-modern shadow-2xl ${darkMode ? 'bg-[#121212] border border-[#2a2a2a]' : 'bg-white border border-slate-200'}`}
        >
          {darkMode && (
            <div className="absolute inset-0">
              <div className="absolute top-0 -left-40 w-80 h-80 bg-[#00ffff]/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 -right-40 w-80 h-80 bg-[#9945ff]/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>
          )}

          <button
            onClick={handleClose}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors z-10 ${darkMode ? 'hover:bg-[#2a2a2a] text-[#808080] hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
          >
            <X size={20} />
          </button>

          <div className={`relative p-6 border-b ${darkMode ? 'border-[#2a2a2a]' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff] to-[#9945ff] rounded-full blur-sm opacity-70" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
                  <UserPlus size={20} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Select a Freelancer
                </h2>
                <p className={`text-sm ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
                  Choose a freelancer to work on your AI-generated project
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-6">
            {filterLanguage && !showingAllAsFallback && (
              <p className={`text-sm mb-4 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
                Showing freelancers with <span className="text-cyan-600 dark:text-[#00ffff] font-medium">{filterLanguage}</span> (from your Programming language / stack)
              </p>
            )}
            {showingAllAsFallback && (
              <p className={`text-sm mb-4 px-4 py-2 rounded-lg border ${darkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                No freelancers matched &quot;{filterLanguage}&quot;. Showing <strong>all freelancers</strong> so you can still choose one.
              </p>
            )}

            <div className="relative mb-6">
              <Search
                size={18}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-[#808080]' : 'text-slate-400'}`}
              />
              <input
                type="text"
                placeholder="Search freelancers by name, email, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#808080] focus:border-[#00ffff]' : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500'}`}
              />
            </div>
            <div className="flex items-center justify-between mb-4 text-xs">
              <span className={darkMode ? 'text-[#808080]' : 'text-slate-500'}>
                {filteredFreelancers.length} freelancer{filteredFreelancers.length === 1 ? '' : 's'} found
              </span>
              <span className="text-cyan-600 dark:text-[#00ffff]">
                {selectedFreelancer ? '1 selected' : 'Select one to continue'}
              </span>
            </div>

            {selectedFreelancer && (
              <div className={`p-4 rounded-lg mb-6 border ${darkMode ? 'bg-gradient-to-r from-[#00ffff]/10 to-[#9945ff]/10 border-[#00ffff]' : 'bg-cyan-50 border-cyan-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(selectedFreelancer, 48)}
                      alt={selectedFreelancer.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => { e.target.src = getAvatarUrl({ name: selectedFreelancer.name }, 48); }}
                    />
                    <div>
                      <p className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedFreelancer.name}</p>
                      <p className="text-sm text-cyan-600 dark:text-[#00ffff]">{selectedFreelancer.email}</p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-500'}`}>
                        {selectedFreelancer.skills?.length || 0} skills listed
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFreelancer(null)}
                    className={`px-4 py-2 rounded-lg transition-colors ${darkMode ? 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Freelancers grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto scrollbar-modern p-1">
              {freelancersLoading ? (
                <div className="col-span-2 text-center py-8">
                  <Loader size={30} className="text-cyan-600 dark:text-[#00ffff] animate-spin mx-auto mb-3" />
                  <p className={darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}>Loading freelancers...</p>
                </div>
              ) : filteredFreelancers.length > 0 ? (
                filteredFreelancers.map((freelancer) => (
                  <motion.div
                    key={freelancer._id || freelancer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onHoverStart={() => setHoveredFreelancer(freelancer)}
                    onHoverEnd={() => setHoveredFreelancer(null)}
                    onClick={() => handleSelectFreelancer(freelancer)}
                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedFreelancer?._id === freelancer._id || selectedFreelancer?.id === freelancer.id
                        ? darkMode ? 'border-[#00ffff] bg-[#00ffff]/5' : 'border-cyan-500 bg-cyan-50'
                        : darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#00ffff] hover:bg-[#00ffff]/5' : 'bg-slate-50 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={getAvatarUrl(freelancer, 64)}
                          alt={freelancer.name}
                          className="relative w-16 h-16 rounded-full object-cover ring-2 ring-cyan-500/30 dark:ring-[#00ffff]/30"
                          onError={(e) => { e.target.src = getAvatarUrl({ name: freelancer.name }, 64); }}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 ${darkMode ? 'border-[#1a1a1a]' : 'border-slate-50'}`} />
                      </div>

                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {freelancer.name}
                        </h3>
                        
                        <div className="space-y-2 text-sm">
                          <div className={`flex items-center gap-2 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
                            <Mail size={14} className={darkMode ? 'text-[#808080]' : 'text-slate-400'} />
                            <span className="truncate">{freelancer.email}</span>
                          </div>

                          {freelancer.location && (
                            <div className={`flex items-center gap-2 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
                              <MapPin size={14} className={darkMode ? 'text-[#808080]' : 'text-slate-400'} />
                              <span>{freelancer.location}</span>
                            </div>
                          )}

                          {freelancer.skills && freelancer.skills.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Code size={14} className={`mt-1 ${darkMode ? 'text-[#808080]' : 'text-slate-400'}`} />
                              <div className="flex flex-wrap gap-1">
                                {freelancer.skills.slice(0, 3).map((skill, i) => (
                                  <span
                                    key={i}
                                    className={`px-2 py-0.5 text-xs rounded-full ${darkMode ? 'bg-[#2a2a2a] text-[#00ffff]' : 'bg-slate-200 text-cyan-600'}`}
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {freelancer.skills.length > 3 && (
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${darkMode ? 'bg-[#2a2a2a] text-[#b0b0b0]' : 'bg-slate-200 text-slate-500'}`}>
                                    +{freelancer.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Hover details - additional info */}
                        <AnimatePresence>
                          {hoveredFreelancer?._id === freelancer._id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className={`mt-3 pt-3 border-t text-xs ${darkMode ? 'border-[#2a2a2a] text-[#b0b0b0]' : 'border-slate-200 text-slate-600'}`}
                            >
                              <div className="flex items-center gap-2">
                                <Award size={12} className="text-cyan-600 dark:text-[#00ffff]" />
                                <span>
                                  {freelancer.projectsCompleted || 0} projects completed
                                </span>
                              </div>
                              {freelancer.bio && (
                                <p className="mt-1 line-clamp-2">{freelancer.bio}</p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Selection indicator */}
                      {(selectedFreelancer?._id === freelancer._id || selectedFreelancer?.id === freelancer.id) && (
                        <div className="w-6 h-6 rounded-full bg-[#00ffff] flex items-center justify-center">
                          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className={darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}>No freelancers found</p>
                  <p className={`text-xs mt-2 ${darkMode ? 'text-[#808080]' : 'text-slate-500'}`}>
                    {filterLanguage
                      ? `No freelancers with "${filterLanguage}" in their skills. Try another search or use a different Programming language / stack for your project.`
                      : 'Try a different name, email, or skill keyword.'}
                  </p>
                </div>
              )}
            </div>

            <div className={`flex gap-3 mt-6 pt-4 border-t ${darkMode ? 'border-[#2a2a2a]' : 'border-slate-200'}`}>
              <button
                onClick={handleClose}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:bg-[#2a2a2a]' : 'bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!selectedFreelancer || createProjectMutation.isPending}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00ffff] to-[#9945ff] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/20 dark:hover:shadow-[#00ffff]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createProjectMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Project with Selected Freelancer'
                )}
              </button>
            </div>

            {createProjectMutation.error && (
              <div className="mt-4 text-sm text-red-600 dark:text-[#ff8080] text-center">
                {createProjectMutation.error.message || 'Failed to create project'}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ------------------ MAIN COMPONENT ------------------
const UserDashboard = () => {
  const { user, token } = useAuth();
  const { darkMode } = useTheme();
  const [selectFreelancerModalOpen, setSelectFreelancerModalOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);

  const [projectName, setProjectName] = useState('');
  const [language, setLanguage] = useState('React + Node.js');
  const [targetPlatform, setTargetPlatform] = useState('web');
  const [description, setDescription] = useState('');

  const [uiSummary, setUiSummary] = useState('');
  const [uiHtml, setUiHtml] = useState('');
  const [uiCss, setUiCss] = useState('');
  const [editInstruction, setEditInstruction] = useState('');

  // Function to get default language based on platform
  const getDefaultLanguageForPlatform = (platform) => {
    const defaults = {
      'web': 'React + Node.js',
      'mobile': 'Flutter + Dart',
      'desktop': 'Electron + React',
      'ai-agent': 'Python + LangChain',
      'service': 'Python + FastAPI',
      'other': 'JavaScript'
    };
    return defaults[platform] || 'React + Node.js';
  };

  // Effect to update language when platform changes
  useEffect(() => {
    setLanguage(getDefaultLanguageForPlatform(targetPlatform));
  }, [targetPlatform]);

  const generateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch('http://localhost:8000/api/users/generate-dashboard-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate UI');
      }
      return data;
    },
    onSuccess: (data) => {
      const responseData = data?.data || data;
      setUiSummary(responseData.summary || '');
      setUiHtml(responseData.html || '');
      setUiCss(responseData.css || '');
      setAiResponse({
        summary: responseData.summary || '',
        html: responseData.html || '',
        css: responseData.css || '',
      });
      setProjectDetails({
        projectName,
        language,
        targetPlatform,
        description,
      });
      setEditInstruction('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    generateMutation.mutate({
      projectName,
      language,
      targetPlatform,
      description,
    });
    setDescription("")
  };

  const handleSelectFreelancerClose = (success) => {
    setSelectFreelancerModalOpen(false);
    if (success) {
      setProjectName('');
      setLanguage(getDefaultLanguageForPlatform('web'));
      setTargetPlatform('web');
      setDescription('');
      setUiSummary('');
      setUiHtml('');
      setUiCss('');
      setAiResponse(null);
      setProjectDetails(null);
    }
  };

  const iframeSrcDoc =
    uiHtml && uiCss
      ? `<!doctype html><html><head><meta charset="utf-8" />${targetPlatform === 'mobile' ? '<meta name="viewport" content="width=375, initial-scale=1, maximum-scale=1, user-scalable=no" />' : ''}<style>${uiCss}</style></head><body>${uiHtml}</body></html>`
      : '';

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Project Studio</h1>
          <p className={darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}>
            Welcome {user?.name || 'User'}. Define your project, generate a UI concept, then assign it to a freelancer.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className={`px-3 py-1 text-xs rounded-full border ${darkMode ? 'bg-[#00ffff]/10 border-[#00ffff]/30 text-[#00ffff]' : 'bg-cyan-50 border-cyan-200 text-cyan-700'}`}>
              Step 1: Project Brief
            </span>
            <span className={`px-3 py-1 text-xs rounded-full border ${darkMode ? 'bg-[#9945ff]/10 border-[#9945ff]/30 text-[#d8b6ff]' : 'bg-violet-50 border-violet-200 text-violet-700'}`}>
              Step 2: AI Preview
            </span>
            <span className={`px-3 py-1 text-xs rounded-full border ${darkMode ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              Step 3: Assign Freelancer
            </span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`rounded-xl p-6 space-y-4 border ${darkMode ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-slate-200'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
                Project name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white focus:border-[#00ffff]' : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-cyan-500'}`}
                placeholder="My Awesome App"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
                Programming language / stack
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white focus:border-[#00ffff]' : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-cyan-500'}`}
                placeholder="React + Node, Flutter, etc."
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
              Target platform
            </label>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              className={`w-full md:w-64 px-3 py-2 rounded-lg text-sm focus:outline-none ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white focus:border-[#00ffff]' : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-cyan-500'}`}
            >
              <option value="web">Website / Web app</option>
              <option value="mobile">Mobile app</option>
              <option value="desktop">Desktop app</option>
              <option value="ai-agent">AI agent</option>
              <option value="service">Backend / API service</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
              Project description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none min-h-[120px] ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white focus:border-[#00ffff]' : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-cyan-500'}`}
              placeholder="Explain what you want to build, main features, target users, and style (e.g. dark, minimal, futuristic)..."
              required
            />
          </div>

          {generateMutation.error && (
            <div className="text-sm text-red-600 dark:text-[#ff8080]">
              {generateMutation.error.message || 'Failed to generate UI.'}
            </div>
          )}

          <button
            type="submit"
            disabled={generateMutation.isPending}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-500 text-white hover:bg-cyan-600 dark:bg-[#00ffff] dark:text-black dark:hover:bg-[#00e6ff]"
          >
            {generateMutation.isPending ? 'Generating with AI…' : 'Generate UI Concept'}
          </button>
        </form>

        {/* AI response: summary + preview (code hidden for a cleaner, pro look) */}
        {(uiHtml || uiCss || uiSummary) && (
          <div className="space-y-6">
            {uiSummary && (
              <div className={`rounded-xl p-4 border ${darkMode ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-slate-200'}`}>
                <h2 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  AI Design Summary
                </h2>
                <p className={`text-sm whitespace-pre-line ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
                  {uiSummary}
                </p>
              </div>
            )}

            <div className={`pointer-events-none rounded-xl p-4 cursor-prevent border ${darkMode ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Live Preview
                  </h2>
                  {iframeSrcDoc && (
                    <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-[#2a2a2a] text-[#b0b0b0]' : 'bg-slate-100 text-slate-600'}`}>
                      {targetPlatform === 'mobile' ? 'iPhone SE' : targetPlatform === 'desktop' ? 'Desktop' : 'Web'}
                    </span>
                  )}
                </div>
                {iframeSrcDoc ? (
                  targetPlatform === 'mobile' ? (
                    <div className="flex flex-col items-center">
                      <div className={`relative rounded-[2.5rem] p-3 shadow-2xl ${darkMode ? 'bg-[#0d0d0d] border-2 border-[#333]' : 'bg-slate-800 border-2 border-slate-700'}`} style={{ width: 280 }}>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-5 rounded-full bg-black z-10" />
                        <div className="rounded-[1.75rem] overflow-hidden bg-black flex items-center justify-center" style={{ width: 256, height: 462 }}>
                          <div style={{ width: 256, height: 462, overflow: 'hidden' }}>
                            <iframe
                              title="AI Mobile Preview"
                              className="border-0 block origin-top-left"
                              style={{
                                width: 375,
                                height: 667,
                                transform: 'scale(0.6827)',
                              }}
                              srcDoc={iframeSrcDoc}
                            />
                          </div>
                        </div>
                      </div>
                      <p className={`mt-2 text-xs ${darkMode ? 'text-[#808080]' : 'text-slate-500'}`}>iPhone SE (375×667)</p>
                    </div>
                  ) : targetPlatform === 'desktop' ? (
                    <div className={`rounded-lg overflow-hidden border ${darkMode ? 'border-[#2a2a2a]' : 'border-slate-200'}`}>
                      <div className={`flex items-center gap-2 px-3 py-2 ${darkMode ? 'bg-[#1a1a1a] border-b border-[#2a2a2a]' : 'bg-slate-100 border-b border-slate-200'}`}>
                        <div className="flex gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-red-500/80" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className={`text-xs flex-1 text-center ${darkMode ? 'text-[#808080]' : 'text-slate-500'}`}>Desktop app</span>
                      </div>
                      <iframe
                        title="AI Desktop Preview"
                        className={`w-full border-0 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}
                        style={{ height: 520 }}
                        srcDoc={iframeSrcDoc}
                      />
                    </div>
                  ) : (
                    <iframe
                      title="AI Dashboard Preview"
                      className={`w-full rounded-lg border ${darkMode ? 'bg-black border-[#2a2a2a]' : 'bg-white border-slate-200'}`}
                      style={{ height: 600 }}
                      srcDoc={iframeSrcDoc}
                    />
                  )
                ) : (
                  <p className={`text-sm ${darkMode ? 'text-[#808080]' : 'text-slate-500'}`}>
                    Generate a UI to see the live preview here.
                  </p>
                )}
            </div>

            {/* Edit this preview */}
            <div className={`rounded-xl p-4 sm:p-5 border ${darkMode ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white border-slate-200'}`}>
              <h3 className={`text-base font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Edit this preview
              </h3>
              <p className={`text-sm mb-3 ${darkMode ? 'text-[#b0b0b0]' : 'text-slate-600'}`}>
                Tell the AI what to change (e.g. &quot;make the header blue&quot;, &quot;add a sidebar&quot;). It will update the current design, not start from scratch.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  placeholder="e.g. Make the header darker, add a chart section..."
                  className={`flex-1 px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 ${darkMode ? 'bg-[#1a1a1a] border border-[#2a2a2a] text-white placeholder-[#808080]' : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  disabled={generateMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!editInstruction.trim()) return;
                    generateMutation.mutate({
                      editInstruction: editInstruction.trim(),
                      previousSummary: uiSummary,
                      previousHtml: uiHtml,
                      previousCss: uiCss,
                    });
                  }}
                  disabled={generateMutation.isPending || !editInstruction.trim()}
                  className="px-5 py-3 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {generateMutation.isPending ? 'Applying...' : 'Apply edit'}
                </button>
              </div>
              {generateMutation.error && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400">{generateMutation.error.message}</p>
              )}
            </div>

            {/* Create Project Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectFreelancerModalOpen(true)}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00ffff] to-[#9945ff] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#00ffff]/20 transition-all duration-300 text-lg"
              >
                <Briefcase size={24} />
                <span>Assign Freelancer & Create Project</span>
              </motion.button>
            </div>
          </div>
        )}

        {/* Select Freelancer Modal */}
        <SelectFreelancerModal
          isOpen={selectFreelancerModalOpen}
          onClose={handleSelectFreelancerClose}
          token={token}
          currentUser={user}
          aiResponse={aiResponse}
          projectDetails={projectDetails}
          darkMode={darkMode}
        />
      </div>
    </Layout>
  );
};

export default UserDashboard;