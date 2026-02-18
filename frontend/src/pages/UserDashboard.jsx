import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import toast from 'react-hot-toast';

// API URLs
const FREELANCERS_URL = 'http://localhost:8000/api/users/freelancers';
const PROJECTS_URL = 'http://localhost:8000/api/projects';

// ------------------ SELECT FREELANCER MODAL ------------------
const SelectFreelancerModal = ({ isOpen, onClose, token, currentUser, aiResponse, projectDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [hoveredFreelancer, setHoveredFreelancer] = useState(null);

  // Fetch freelancers
  const { data: freelancersData, isLoading: freelancersLoading } = useQuery({
    queryKey: ['freelancers'],
    queryFn: async () => {
      const response = await fetch(FREELANCERS_URL, {
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
      onClose(true);
      toast.success('Project created successfully');
    },
  });

  // Extract freelancers from response
  let freelancers = [];
  if (freelancersData?.data?.freelancers && Array.isArray(freelancersData.data.freelancers)) {
    freelancers = freelancersData.data.freelancers;
  } else if (freelancersData?.data && Array.isArray(freelancersData.data)) {
    freelancers = freelancersData.data;
  } else if (Array.isArray(freelancersData)) {
    freelancers = freelancersData;
  }

  // Filter freelancers
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
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#121212] border border-[#2a2a2a] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 -left-40 w-80 h-80 bg-[#00ffff]/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 -right-40 w-80 h-80 bg-[#9945ff]/20 rounded-full blur-3xl animate-pulse delay-700" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#2a2a2a] text-[#808080] hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="relative p-6 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff] to-[#9945ff] rounded-full blur-sm opacity-70" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
                  <UserPlus size={20} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Select a Freelancer
                </h2>
                <p className="text-sm text-[#b0b0b0]">
                  Choose a freelancer to work on your AI-generated project
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-6">
            {/* Search */}
            <div className="relative mb-6">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]"
              />
              <input
                type="text"
                placeholder="Search freelancers by name, email, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#808080] focus:outline-none focus:border-[#00ffff]"
              />
            </div>
            <div className="flex items-center justify-between mb-4 text-xs">
              <span className="text-[#808080]">
                {filteredFreelancers.length} freelancer{filteredFreelancers.length === 1 ? '' : 's'} found
              </span>
              <span className="text-[#00ffff]">
                {selectedFreelancer ? '1 selected' : 'Select one to continue'}
              </span>
            </div>

            {/* Selected freelancer preview */}
            {selectedFreelancer && (
              <div className="p-4 bg-gradient-to-r from-[#00ffff]/10 to-[#9945ff]/10 border border-[#00ffff] rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {selectedFreelancer.name?.charAt(0) || 'F'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-lg">{selectedFreelancer.name}</p>
                      <p className="text-sm text-[#00ffff]">{selectedFreelancer.email}</p>
                      <p className="text-xs text-[#b0b0b0] mt-1">
                        {selectedFreelancer.skills?.length || 0} skills listed
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFreelancer(null)}
                    className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            {/* Freelancers grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
              {freelancersLoading ? (
                <div className="col-span-2 text-center py-8">
                  <Loader size={30} className="text-[#00ffff] animate-spin mx-auto mb-3" />
                  <p className="text-[#b0b0b0]">Loading freelancers...</p>
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
                    className={`p-5 bg-[#1a1a1a] border-2 rounded-xl cursor-pointer transition-all ${
                      selectedFreelancer?._id === freelancer._id || selectedFreelancer?.id === freelancer.id
                        ? 'border-[#00ffff] bg-[#00ffff]/5'
                        : 'border-[#2a2a2a] hover:border-[#00ffff] hover:bg-[#00ffff]/5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar with status */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff] to-[#9945ff] rounded-full blur-sm opacity-70" />
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {freelancer.name?.charAt(0) || 'F'}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1a1a1a]" />
                      </div>

                      {/* Freelancer info */}
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-1">
                          {freelancer.name}
                        </h3>
                        
                        <div className="space-y-2 text-sm">
                          {/* Email */}
                          <div className="flex items-center gap-2 text-[#b0b0b0]">
                            <Mail size={14} className="text-[#808080]" />
                            <span className="truncate">{freelancer.email}</span>
                          </div>

                          {/* Location if available */}
                          {freelancer.location && (
                            <div className="flex items-center gap-2 text-[#b0b0b0]">
                              <MapPin size={14} className="text-[#808080]" />
                              <span>{freelancer.location}</span>
                            </div>
                          )}

                          {/* Skills */}
                          {freelancer.skills && freelancer.skills.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Code size={14} className="text-[#808080] mt-1" />
                              <div className="flex flex-wrap gap-1">
                                {freelancer.skills.slice(0, 3).map((skill, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-[#2a2a2a] text-xs text-[#00ffff] rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {freelancer.skills.length > 3 && (
                                  <span className="px-2 py-0.5 bg-[#2a2a2a] text-xs text-[#b0b0b0] rounded-full">
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
                              className="mt-3 pt-3 border-t border-[#2a2a2a] text-xs text-[#b0b0b0]"
                            >
                              <div className="flex items-center gap-2">
                                <Award size={12} className="text-[#00ffff]" />
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
                  <p className="text-[#b0b0b0]">No freelancers found</p>
                  <p className="text-xs text-[#808080] mt-2">Try a different name, email, or skill keyword.</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-[#2a2a2a]">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!selectedFreelancer || createProjectMutation.isPending}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00ffff] to-[#9945ff] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#00ffff]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="mt-4 text-sm text-[#ff8080] text-center">
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
      // Extract data from the response structure
      const responseData = data?.data || data;
      
      setUiSummary(responseData.summary || '');
      setUiHtml(responseData.html || '');
      setUiCss(responseData.css || '');
      
      // Store the complete AI response
      setAiResponse({
        summary: responseData.summary || '',
        html: responseData.html || '',
        css: responseData.css || ''
      });
      
      setProjectDetails({
        projectName,
        language,
        targetPlatform,
        description
      });
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
      ? `<!doctype html><html><head><meta charset="utf-8" /><style>${uiCss}</style></head><body>${uiHtml}</body></html>`
      : '';

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Project Studio</h1>
          <p className="text-[#b0b0b0]">
            Welcome {user?.name || 'User'}. Define your project, generate a UI concept, then assign it to a freelancer.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 text-xs rounded-full bg-[#00ffff]/10 border border-[#00ffff]/30 text-[#00ffff]">
              Step 1: Project Brief
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-[#9945ff]/10 border border-[#9945ff]/30 text-[#d8b6ff]">
              Step 2: AI Preview
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]">
              Step 3: Assign Freelancer
            </span>
          </div>
        </div>

        {/* Prompt form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#b0b0b0] mb-1">
                Project name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#00ffff]"
                placeholder="My Awesome App"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b0b0b0] mb-1">
                Programming language / stack
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#00ffff]"
                placeholder="React + Node, Flutter, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b0b0b0] mb-1">
              Target platform
            </label>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              className="w-full md:w-64 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#00ffff]"
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
            <label className="block text-sm font-medium text-[#b0b0b0] mb-1">
              Project description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#00ffff] min-h-[120px]"
              placeholder="Explain what you want to build, main features, target users, and style (e.g. dark, minimal, futuristic)..."
              required
            />
          </div>

          {generateMutation.error && (
            <div className="text-sm text-[#ff8080]">
              {generateMutation.error.message || 'Failed to generate UI.'}
            </div>
          )}

          <button
            type="submit"
            disabled={generateMutation.isPending}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#00ffff] text-black rounded-lg text-sm font-medium hover:bg-[#00e6ff] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generateMutation.isPending ? 'Generating with AI…' : 'Generate UI Concept'}
          </button>
        </form>

        {/* AI response: summary + preview + code */}
        {(uiHtml || uiCss || uiSummary) && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Text summary + code */}
              <div className="space-y-4">
                {uiSummary && (
                  <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-4">
                    <h2 className="text-lg font-semibold text-white mb-2">
                      AI Design Summary
                    </h2>
                    <p className="text-sm text-[#b0b0b0] whitespace-pre-line">
                      {uiSummary}
                    </p>
                  </div>
                )}

                {uiHtml && (
                  <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-white mb-2">
                      Generated HTML
                    </h3>
                    <pre className="text-xs text-[#e5e5e5] overflow-auto max-h-72">
                      <code>{uiHtml}</code>
                    </pre>
                  </div>
                )}

                {uiCss && (
                  <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-white mb-2">
                      Generated CSS
                    </h3>
                    <pre className="text-xs text-[#e5e5e5] overflow-auto max-h-72">
                      <code>{uiCss}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Live preview in isolated iframe */}
              <div className="bg-[#121212] border border-[#2a2a2a] pointer-events-none rounded-xl p-4 cursor-prevent">
                <h2 className="text-lg font-semibold text-white mb-3">
                  Live Dashboard Preview
                </h2>
                {iframeSrcDoc ? (
                  <iframe
                    title="AI Dashboard Preview"
                    className="w-full h-[600px] bg-black rounded-lg border border-[#2a2a2a]"
                    srcDoc={iframeSrcDoc}
                  />
                ) : (
                  <p className="text-sm text-[#808080]">
                    Generate a UI to see the live preview here.
                  </p>
                )}
              </div>
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
        />
      </div>
    </Layout>
  );
};

export default UserDashboard;