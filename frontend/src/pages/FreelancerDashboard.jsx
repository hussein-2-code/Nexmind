import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase,
  Calendar,
  User,
  Code,
  Globe,
  Mail,
  MapPin,
  Phone,
  Award,
  Star,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Settings,
  Edit3,
  Download,
  Share2,
  Filter,
  Search,
  Cpu,
  Smartphone,
  Monitor,
  Layout as LayoutIcon,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import MessageButton from '../components/MessageButton';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../utils/avatar';

const API_URL = 'http://localhost:8000/api/projects/freelancer';
const PROJECTS_BASE_URL = 'http://localhost:8000/api/projects';
const USER_API_URL = 'http://localhost:8000/api/users';

const PROJECT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40 hover:bg-yellow-500/30', active: 'bg-yellow-500/30 border-yellow-500 text-yellow-400' },
  { value: 'completed', label: 'Done', color: 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/40 hover:bg-[#00ff88]/30', active: 'bg-[#00ff88]/30 border-[#00ff88] text-[#00ff88]' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-[#ff3333]/20 text-[#ff3333] border-[#ff3333]/40 hover:bg-[#ff3333]/30', active: 'bg-[#ff3333]/30 border-[#ff3333] text-[#ff4444]' },
];

// ------------------ PROJECT STATUS BADGE ------------------
const ProjectStatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return { color: 'bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30', icon: CheckCircle };
      case 'pending':
        return { color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', icon: AlertCircle };
      case 'cancelled':
        return { color: 'bg-[#ff3333]/20 text-[#ff3333] border-[#ff3333]/30', icon: XCircle };
      default:
        return { color: 'bg-[#808080]/20 text-[#b0b0b0] border-[#2a2a2a]', icon: AlertCircle };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon size={12} />
      {(status && status.charAt(0).toUpperCase() + status.slice(1)) || 'Pending'}
    </span>
  );
};

// ------------------ PROJECT CARD ------------------
const ProjectCard = ({ project, onClick, onStatusChange, token }) => {
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
        {/* Header */}
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
                {new Date(project.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 px-2 py-1 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
            {getPlatformIcon(project.platform)}
            <span className="text-xs text-[#b0b0b0]">{project.platform}</span>
          </div>
        </div>

        {/* Client Info */}
        <div className="flex items-center gap-2 mb-3">
          <img src={getAvatarUrl(project.client, 24)} alt={project.client?.name} className="w-6 h-6 rounded-full object-cover" onError={(e) => { e.target.src = getAvatarUrl({ name: project.client?.name }, 24); }} />
          <div className="flex-1">
            <p className="text-xs text-[#808080]">Client</p>
            <p className="text-sm font-medium text-white">{project.client?.name}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[#b0b0b0] mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex items-center gap-2 mb-3">
          <Code size={14} className="text-[#808080]" />
          <span className="text-xs px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-[#00ffff]">
            {project.technology}
          </span>
        </div>

        {/* Status: pill selector for freelancer */}
        <div className="flex flex-col gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs text-[#808080]">Status</span>
          {onStatusChange && token ? (
            <div className="flex flex-wrap gap-1.5 p-1 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
              {PROJECT_STATUS_OPTIONS.map((opt) => {
                const current = (project.status || 'pending').toLowerCase();
                const isActive = current === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onStatusChange(project._id, opt.value)}
                    className={`min-w-[72px] px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all duration-200 ${isActive ? opt.active : `${opt.color} border-transparent`}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <ProjectStatusBadge status={project.status || 'Pending'} />
          )}
        </div>

        {project._id && project.client?._id && (
          <div
            className="mt-4 pt-3 border-t border-[#2a2a2a]"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageButton
              projectId={project._id}
              userId={project.client._id}
              userName={project.client?.name}
              className="w-full justify-center"
            />
          </div>
        )}

        {/* View Details Button */}
        <div className="flex mt-10 items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00ffff] to-[#9945ff] text-white rounded-lg hover:shadow-lg hover:shadow-[#00ffff]/20 transition-all">
          <div className="flex items-center w-full text-white">
            <span className="text-sm text-center w-full ">View Project</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ------------------ PROJECT DETAILS MODAL ------------------
const ProjectDetailsModal = ({ isOpen, onClose, project, onStatusChange, token }) => {
  if (!isOpen || !project) return null;

  const getPlatformIcon = (platform) => {
    switch(platform?.toLowerCase()) {
      case 'web': return <Globe size={16} />;
      case 'mobile': return <Smartphone size={16} />;
      case 'desktop': return <Monitor size={16} />;
      default: return <Cpu size={16} />;
    }
  };

  const previewHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #ffffff; }
      </style>
      ${project.response}
    </head>
    <body></body>
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
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#0a0a0a] border border-[#2a2a2a] rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="relative p-4 border-b border-[#2a2a2a] bg-[#0a0a0a]/80">
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
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#2a2a2a] text-[#808080] hover:text-white transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>

          {/* Project Info */}
          <div className="relative px-4 py-3 bg-[#0f0f0f] border-b border-[#2a2a2a] grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[#808080] text-xs">Client</p>
              <p className="text-white font-medium">{project.client?.name}</p>
              <p className="text-[#b0b0b0] text-xs">{project.client?.email}</p>
            </div>
            <div>
              <p className="text-[#808080] text-xs">Technology</p>
              <p className="text-white font-medium">{project.technology}</p>
            </div>
            <div>
              <p className="text-[#808080] text-xs mb-1.5">Status</p>
              {onStatusChange && token && project?._id ? (
                <div className="flex flex-wrap gap-1.5">
                  {PROJECT_STATUS_OPTIONS.map((opt) => {
                    const current = (project.status || 'pending').toLowerCase();
                    const isActive = current === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onStatusChange(project._id, opt.value)}
                        className={`min-w-[72px] px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${isActive ? opt.active : `${opt.color} border-transparent`}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <ProjectStatusBadge status={project.status || 'Pending'} />
              )}
            </div>
            <div>
              <p className="text-[#808080] text-xs">Description</p>
              <p className="text-white text-sm truncate">{project.description}</p>
            </div>
          </div>

          {/* Design Preview */}
          <div className="relative bg-white w-full h-[calc(95vh-180px)] overflow-auto">
            <iframe
              title="Project Design"
              className="w-full h-full border-0"
              srcDoc={previewHtml}
              sandbox="allow-scripts"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ------------------ STATS CARD ------------------
const StatsCard = ({ icon: Icon, label, value, sublabel, color }) => (
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
        {sublabel && <p className="text-xs text-[#808080] mt-1">{sublabel}</p>}
      </div>
    </div>
  </motion.div>
);

// ------------------ PROFILE SECTION ------------------
const ProfileSection = ({ user, stats }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121212] border border-[#2a2a2a] rounded-xl overflow-hidden"
    >
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-[#00ffff]/20 to-[#9945ff]/20 relative">
        <button className="absolute top-4 right-4 p-2 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors">
          <Edit3 size={16} className="text-[#b0b0b0]" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="absolute -top-12 left-6">
          <div className="relative">
            <img src={getAvatarUrl(user, 96)} alt={user?.name} className="relative w-24 h-24 rounded-full object-cover border-4 border-[#121212] ring-2 ring-cyan-500/30" onError={(e) => { e.target.src = getAvatarUrl({ name: user?.name }, 96); }} />
            <button className="absolute bottom-0 right-0 p-1.5 bg-[#1a1a1a] rounded-full border-2 border-[#121212] hover:bg-[#2a2a2a] transition-colors" title="Edit profile photo in Profile">
              <Edit3 size={14} className="text-[#b0b0b0]" />
            </button>
          </div>
        </div>

        {/* Name and Title */}
        <div className="ml-28 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="text-[#b0b0b0]">{user?.email}</p>
            </div>
            <button className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm hover:bg-[#2a2a2a] transition-colors flex items-center gap-2">
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[#00ffff]">{stats.totalProjects}</p>
            <p className="text-xs text-[#808080]">Total Projects</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[#00ff88]">{stats.completedProjects}</p>
            <p className="text-xs text-[#808080]">Completed</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.pendingProjects}</p>
            <p className="text-xs text-[#808080]">Pending</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-[#9945ff]">{stats.uniqueClients}</p>
            <p className="text-xs text-[#808080]">Clients</p>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-white mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user?.skills?.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#b0b0b0] hover:border-[#00ffff] hover:text-[#00ffff] transition-all"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {user?.location && (
            <div className="flex items-center gap-2 text-sm text-[#b0b0b0]">
              <MapPin size={16} className="text-[#808080]" />
              {user.location}
            </div>
          )}
          {user?.phone && (
            <div className="flex items-center gap-2 text-sm text-[#b0b0b0]">
              <Phone size={16} className="text-[#808080]" />
              {user.phone}
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="mt-4 flex items-center gap-3">
          {user?.github && (
            <a href={user.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors">
              <Github size={18} className="text-[#b0b0b0]" />
            </a>
          )}
          {user?.linkedin && (
            <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors">
              <Linkedin size={18} className="text-[#b0b0b0]" />
            </a>
          )}
          {user?.twitter && (
            <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors">
              <Twitter size={18} className="text-[#b0b0b0]" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ------------------ MAIN COMPONENT ------------------
const FreelancerDashboard = () => {
  const { user, token } = useAuth();
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch freelancer's projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['freelancer-projects', user?._id],
    queryFn: async () => {
      const freelancerId = user?._id || user?.id;
      if (!freelancerId) throw new Error('No freelancer ID available');

      const response = await fetch(`${API_URL}/${freelancerId}`, {
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

  // Fetch user details with skills
  const { data: userData } = useQuery({
    queryKey: ['user', user?._id],
    queryFn: async () => {
      const response = await fetch(`${USER_API_URL}/${user?._id || user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      return response.json();
    },
    enabled: !!user && !!token,
  });

  const projects = projectsData?.data?.projects || [];
  const userDetails = userData?.data?.document || userData?.data || userData || user;

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.technology?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (project.status?.toLowerCase() || 'pending') === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Update project status (freelancer only)
  const queryClient = useQueryClient();
  const statusMutation = useMutation({
    mutationFn: async ({ projectId, status }) => {
      const response = await fetch(`${PROJECTS_BASE_URL}/${projectId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Failed to update status');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freelancer-projects', user?._id] });
      toast.success('Project status updated');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update status');
    },
  });

  const handleStatusChange = (projectId, status) => {
    statusMutation.mutate({ projectId, status });
  };

  // Calculate stats
  const stats = {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.status?.toLowerCase() === 'completed').length,
    pendingProjects: projects.filter(p => !p.status || p.status.toLowerCase() === 'pending').length,
    cancelledProjects: projects.filter(p => p.status?.toLowerCase() === 'cancelled').length,
    uniqueClients: [...new Set(projects.map(p => p.client?._id))].length
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  if (projectsLoading) {
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Freelancer Workspace</h1>
            <p className="text-[#b0b0b0] text-lg">
              Manage assigned projects, profile data, and delivery previews
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00ffff] to-[#9945ff] text-white rounded-lg hover:shadow-lg hover:shadow-[#00ffff]/20 transition-all">
            <Briefcase size={18} />
            Available for Work
          </button>
        </div>

        {/* Profile Section */}
        <ProfileSection user={userDetails} stats={stats} />

        {/* Stats Overview */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard
              icon={Briefcase}
              label="Total Projects"
              value={stats.totalProjects}
              color="from-[#00ffff] to-[#9945ff]"
            />
            <StatsCard
              icon={CheckCircle}
              label="Completed"
              value={stats.completedProjects}
              sublabel={`${Math.round((stats.completedProjects / stats.totalProjects) * 100)}% success rate`}
              color="from-[#00ff88] to-[#00ffff]"
            />
            <StatsCard
              icon={Clock}
              label="In Progress"
              value={stats.pendingProjects}
              color="from-yellow-500 to-orange-500"
            />
            <StatsCard
              icon={Star}
              label="Client Rating"
              value="4.8"
              sublabel="Based on 12 reviews"
              color="from-[#ff3333] to-[#9945ff]"
            />
          </div>
        )}

        {/* Projects Section */}
        <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl overflow-hidden">
          {/* Projects Header */}
          <div className="p-6 border-b border-[#2a2a2a]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">Your Projects</h2>
              
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-[#808080] focus:outline-none focus:border-[#00ffff] w-full md:w-64"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#00ffff]"
                >
                  <option value="all">All Projects</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onClick={() => handleProjectClick(project)}
                  onStatusChange={handleStatusChange}
                  token={token}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                <Briefcase size={24} className="text-[#808080]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
              <p className="text-[#b0b0b0] text-sm">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'You haven\'t received any projects yet'}
              </p>
            </div>
          )}
        </div>

        {/* Project Details Modal */}
        <ProjectDetailsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          project={selectedProject}
          onStatusChange={handleStatusChange}
          token={token}
        />
      </div>
    </Layout>
  );
};

export default FreelancerDashboard;
