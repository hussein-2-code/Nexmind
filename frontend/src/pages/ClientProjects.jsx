import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase,
  Calendar,
  User,
  Code,
  Globe,
  Eye,
  X,
  ChevronRight,
  Cpu,
  Smartphone,
  Monitor,
  XCircle
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import MessageButton from '../components/MessageButton';
import { getAvatarUrl } from '../utils/avatar';

const API_URL = 'http://localhost:8000/api/projects/client';

// ------------------ PROJECT PREVIEW MODAL ------------------
const ProjectPreviewModal = ({ isOpen, onClose, project }) => {
  if (!isOpen || !project) return null;

  const getPlatformIcon = (platform) => {
    switch(platform?.toLowerCase()) {
      case 'web': return <Globe size={16} />;
      case 'mobile': return <Smartphone size={16} />;
      case 'desktop': return <Monitor size={16} />;
      default: return <Cpu size={16} />;
    }
  };

  // Use the response directly as it contains both HTML and CSS
  const previewHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* Reset styles for iframe */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: #ffffff;
        }
      </style>
      ${project.response}
    </head>
    <body>
      <!-- The project HTML is already included in response -->
    </body>
    </html>
  `;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl"
        >
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 -left-40 w-80 h-80 bg-[#00ffff]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -right-40 w-80 h-80 bg-[#9945ff]/10 rounded-full blur-3xl" />
          </div>

          {/* Header */}
          <div className="relative p-4 border-b border-[#2a2a2a] bg-[#0a0a0a]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff] to-[#9945ff] rounded-lg blur-md" />
                  <div className="relative w-10 h-10 rounded-lg bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
                    <Briefcase size={20} className="text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{project.projectName}</h2>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1 text-xs text-[#b0b0b0]">
                      <Calendar size={12} />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#b0b0b0]">
                      {getPlatformIcon(project.platform)}
                      {project.platform}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#b0b0b0]">
                      <Code size={12} />
                      {project.technology}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#2a2a2a] text-[#808080] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Project Info Bar */}
          <div className="relative px-4 py-2 bg-[#0f0f0f] border-b border-[#2a2a2a] flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#808080]">Client:</span>
              <span className="text-white">{project.client?.name}</span>
            </div>
            <div className="w-px h-3 bg-[#2a2a2a]" />
            <div className="flex items-center gap-2">
              <span className="text-[#808080]">Freelancer:</span>
              <span className="text-white">{project.freeLancer?.name}</span>
            </div>
            <div className="w-px h-3 bg-[#2a2a2a]" />
            <div className="flex items-center gap-2">
              <span className="text-[#808080]">Description:</span>
              <span className="text-white truncate max-w-md">{project.description}</span>
            </div>
          </div>

          {/* Live Preview - Full Screen Design */}
          <div className="relative bg-white w-full h-[calc(95vh-120px)] overflow-auto scrollbar-modern">
            <iframe
              title="Project Design Preview"
              className="w-full h-full border-0"
              srcDoc={previewHtml}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>

          {/* Close button at bottom for mobile */}
          <div className="absolute bottom-4 right-4 md:hidden">
            <button
              onClick={onClose}
              className="p-3 bg-[#2a2a2a] rounded-full text-white hover:bg-[#3a3a3a] transition-colors shadow-lg"
            >
              <XCircle size={24} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ------------------ PROJECT CARD ------------------
const ProjectCard = ({ project, onClick }) => {
  const getPlatformIcon = (platform) => {
    switch(platform?.toLowerCase()) {
      case 'web': return <Globe size={16} />;
      case 'mobile': return <Smartphone size={16} />;
      case 'desktop': return <Monitor size={16} />;
      default: return <Cpu size={16} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group relative bg-[#121212] border border-[#2a2a2a] rounded-xl overflow-hidden cursor-pointer hover:border-[#00ffff] transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#00ffff]/5 to-[#9945ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff] to-[#9945ff] rounded-lg blur opacity-70" />
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-[#00ffff] transition-colors">
                {project.projectName}
              </h3>
              <p className="text-xs text-[#808080]">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 px-2 py-1 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
            {getPlatformIcon(project.platform)}
            <span className="text-xs text-[#b0b0b0]">{project.platform}</span>
          </div>
        </div>

        <p className="text-sm text-[#b0b0b0] mb-4 line-clamp-2">
          {project.description}
        </p>

        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Code size={14} className="text-[#808080]" />
            <span className="text-xs px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-[#00ffff]">
              {project.technology}
            </span>
          </div>
          {project.status && (
            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
              project.status.toLowerCase() === 'completed' ? 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30' :
              project.status.toLowerCase() === 'cancelled' ? 'bg-[#ff3333]/20 text-[#ff3333] border-[#ff3333]/30' :
              project.status.toLowerCase() === 'in_progress' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
              'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
            }`}>
              {project.status.toLowerCase() === 'in_progress' ? 'In progress' : (project.status.charAt(0).toUpperCase() + project.status.slice(1))}
            </span>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <img src={getAvatarUrl(project.client, 24)} alt={project.client?.name} className="w-6 h-6 rounded-full object-cover" onError={(e) => { e.target.src = getAvatarUrl({ name: project.client?.name }, 24); }} />
            <div className="flex-1">
              <p className="text-xs text-[#808080]">Client</p>
              <p className="text-sm font-medium text-white">{project.client?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <img src={getAvatarUrl(project.freeLancer, 24)} alt={project.freeLancer?.name} className="w-6 h-6 rounded-full object-cover" onError={(e) => { e.target.src = getAvatarUrl({ name: project.freeLancer?.name }, 24); }} />
            <div className="flex-1">
              <p className="text-xs text-[#808080]">Freelancer</p>
              <p className="text-sm font-medium text-white">{project.freeLancer?.name}</p>
            </div>
          </div>
        </div>

        {project._id && project.freeLancer?._id && (
          <div
            className="mt-4 pt-3 border-t border-[#2a2a2a]"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageButton
              projectId={project._id}
              userId={project.freeLancer._id}
              userName={project.freeLancer?.name}
              className="w-full justify-center"
            />
          </div>
        )}

        <div className="flex mt-10 items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00ffff] to-[#9945ff] text-white rounded-lg hover:shadow-lg hover:shadow-[#00ffff]/20 transition-all">
          <div className="flex items-center w-full text-white">
            <span className="text-sm text-center w-full ">View Design</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>

    </motion.div>
  );
};

// ------------------ STATS CARD ------------------
const StatsCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-gradient-to-r ${color} bg-opacity-10`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-[#b0b0b0]">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </motion.div>
);

// ------------------ MAIN COMPONENT ------------------
const ClientProjects = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const clientId = user?._id || user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['client-projects', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('No client ID available');
      const response = await fetch(`${API_URL}/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      return response.json();
    },
    enabled: !!user && !!token,
  });

  const projects = data?.data?.projects || [];

  const totalProjects = projects.length;
  const uniqueTechnologies = [...new Set(projects.map(p => p.technology))].length;
  const totalFreelancers = [...new Set(projects.map(p => p.freeLancer?._id))].length;

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#2a2a2a] border-t-[#00ffff] rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ff3333]/20 flex items-center justify-center">
              <X size={24} className="text-[#ff3333]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Failed to Load Projects</h2>
            <p className="text-[#b0b0b0]">{error.message}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Client Projects</h1>
          <p className="text-[#b0b0b0] text-lg">
            Track and review your AI-generated project designs
          </p>
        </div>

        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              icon={Briefcase}
              label="Total Projects"
              value={totalProjects}
              color="from-[#00ffff] to-[#9945ff]"
            />
            <StatsCard
              icon={Code}
              label="Technologies"
              value={uniqueTechnologies}
              color="from-[#00ff88] to-[#00ffff]"
            />
            <StatsCard
              icon={User}
              label="Freelancers"
              value={totalFreelancers}
              color="from-[#ff3333] to-[#9945ff]"
            />
          </div>
        )}

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
              <Briefcase size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Projects Yet</h2>
            <p className="text-[#b0b0b0] mb-6 max-w-md mx-auto">
              Create your first project with AI and see the designs here!
            </p>
            <button
              onClick={() => navigate('/user')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00ffff] to-[#9945ff] text-white font-medium rounded-lg hover:shadow-lg hover:shadow-[#00ffff]/20 transition-all duration-300"
            >
              <Briefcase size={18} />
              Open Project Studio
            </button>
          </motion.div>
        )}

        <ProjectPreviewModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          project={selectedProject}
        />
      </div>
    </Layout>
  );
};

export default ClientProjects;
