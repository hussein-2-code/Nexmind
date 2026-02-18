import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users as UsersIcon,
  Activity,
  UserPlus,
  Eye,
  Globe,
  Code,
  Monitor,
  Smartphone,
  Chrome,
  Apple,
  UserCheck,
  FileText,
  Server,
  Zap,
  Filter,
  Download,
  Clock,
  Shield,
  Star,
  ArrowUp
} from 'lucide-react';
import Layout from '../components/Layout/Layout';

const AdminDashboard = () => {
  return (
    <Layout>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#ff3333]/10 via-[#9945ff]/10 to-[#00ffff]/10 border border-[#2a2a2a] p-6 mb-6`}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-[#00ffff] to-[#00a8ff] bg-clip-text text-transparent">
                Ahmed
              </span>
            </h1>
            <p className="text-[#b0b0b0]">
              Operations Dashboard: live platform health, usage, and team activity.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { title: 'Total Users', value: '24,521', change: '+12%', icon: UsersIcon, color: '#00ffff' },
          { title: 'Active Now', value: '1,429', change: '+5%', icon: Activity, color: '#00ff88' },
          { title: 'New Today', value: '342', change: '+18%', icon: UserPlus, color: '#ff3333' },
          { title: 'Page Views', value: '89.4K', change: '+7%', icon: Eye, color: '#9945ff' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative group bg-[#121212] border border-[#2a2a2a] hover:border-[#00ffff]/50 rounded-xl p-6 overflow-hidden`}
            style={{
              boxShadow: '0 10px 30px -15px rgba(0,255,255,0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#00ffff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex justify-between items-start">
              <div>
                <p className="text-sm text-[#808080]">{stat.title}</p>
                <p className="text-3xl font-bold mt-1 text-white">{stat.value}</p>
                <span className="inline-flex items-center gap-1 text-xs mt-2 text-[#00ff88]">
                  <ArrowUp size={12} />
                  {stat.change} from last week
                </span>
              </div>
              <div 
                className="p-3 rounded-lg bg-opacity-20"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Visitors by Country */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00ffff]/10 rounded-lg">
                <Globe size={20} className="text-[#00ffff]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Visitors by Country</h2>
            </div>
            <button className="text-xs text-[#00ffff]">View All</button>
          </div>

          <div className="space-y-4">
            {[
              { country: 'Egypt', flag: '🇪🇬', visitors: '8,429', percent: 34, color: '#00ffff' },
              { country: 'Saudi Arabia', flag: '🇸🇦', visitors: '6,231', percent: 28, color: '#00ff88' },
              { country: 'UAE', flag: '🇦🇪', visitors: '4,112', percent: 18, color: '#ff3333' },
              { country: 'Kuwait', flag: '🇰🇼', visitors: '2,843', percent: 12, color: '#9945ff' },
              { country: 'Qatar', flag: '🇶🇦', visitors: '1,906', percent: 8, color: '#00a8ff' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.flag}</span>
                  <div>
                    <p className="font-medium text-white">{item.country}</p>
                    <p className="text-xs text-[#808080]">{item.visitors} visitors</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white">{item.percent}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
            <div className="relative h-32 bg-gradient-to-br from-[#00ffff]/5 to-[#9945ff]/5 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-12 gap-1 w-full px-4">
                  {[...Array(48)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: Math.random() * 40 + 20 }}
                      transition={{ duration: 1.5, delay: i * 0.02 }}
                      className="w-full bg-gradient-to-t from-[#00ffff] to-[#9945ff] rounded-t-sm"
                      style={{ 
                        height: `${Math.random() * 40 + 20}px`,
                        opacity: 0.3 + Math.random() * 0.5
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-2 left-2 text-xs text-[#808080]">
                Visitor activity worldwide
              </div>
            </div>
          </div>
        </motion.div>

        {/* Technologies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#9945ff]/10 rounded-lg">
                <Code size={20} className="text-[#9945ff]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Technologies Used</h2>
            </div>
            <span className="text-xs text-[#00ff88]">Live Update</span>
          </div>

          <div className="space-y-5">
            {[
              { name: 'React', icon: '⚛️', users: '12.4K', percent: 78, color: '#00ffff' },
              { name: 'Node.js', icon: '🟢', users: '9.8K', percent: 62, color: '#00ff88' },
              { name: 'Python', icon: '🐍', users: '7.3K', percent: 45, color: '#ff3333' },
              { name: 'Vue.js', icon: '🟢', users: '5.1K', percent: 32, color: '#00a8ff' },
              { name: 'Angular', icon: '🔴', users: '4.2K', percent: 26, color: '#ff3333' },
            ].map((tech, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tech.icon}</span>
                    <span className="font-medium text-white">{tech.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#00ffff]">{tech.users}</span>
                    <span className="text-xs text-[#808080]">{tech.percent}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tech.percent}%` }}
                    transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: tech.color,
                      boxShadow: `0 0 10px ${tech.color}`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Devices & Browsers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00ff88]/10 rounded-lg">
                <Monitor size={20} className="text-[#00ff88]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Devices & Browsers</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-[#00ffff]" />
                <span className="text-sm text-white">Mobile</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">58%</span>
                <span className="text-xs text-[#00ff88]">+12%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '58%' }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-[#00ffff] to-[#00a8ff]"
                style={{ boxShadow: '0 0 10px #00ffff' }}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <Monitor size={18} className="text-[#9945ff]" />
                <span className="text-sm text-white">Desktop</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">32%</span>
                <span className="text-xs text-[#ff3333]">-4%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '32%' }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-[#9945ff] to-[#ff3333]"
                style={{ boxShadow: '0 0 10px #9945ff' }}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <svg className="w-[18px] h-[18px] text-[#00ff88]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2"/>
                  <line x1="8" y1="21" x2="16" y2="21" strokeWidth="2"/>
                  <line x1="12" y1="17" x2="12" y2="21" strokeWidth="2"/>
                </svg>
                <span className="text-sm text-white">Tablet</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">10%</span>
                <span className="text-xs text-[#00ff88]">+2%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '10%' }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-[#00ff88] to-[#00ffff]"
                style={{ boxShadow: '0 0 10px #00ff88' }}
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-white mb-4">Most Used Browsers</h3>
            <div className="space-y-3">
              {[
                { name: 'Chrome', icon: <Chrome size={16} />, percent: 52, color: '#00ffff' },
                { name: 'Safari', icon: <Apple size={16} />, percent: 23, color: '#00a8ff' },
                { name: 'Firefox', icon: '🦊', percent: 15, color: '#ff3333' },
                { name: 'Edge', icon: '🌐', percent: 10, color: '#9945ff' },
              ].map((browser, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#b0b0b0]">{browser.icon}</span>
                    <span className="text-xs text-white">{browser.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{browser.percent}%</span>
                    <div className="w-16 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${browser.percent}%` }}
                        transition={{ duration: 1, delay: 1 + index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: browser.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-white mb-4">Operating Systems</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { os: 'Windows', icon: '🪟', percent: 45, color: '#00ffff' },
                { os: 'macOS', icon: '🍎', percent: 28, color: '#808080' },
                { os: 'Linux', icon: '🐧', percent: 17, color: '#ff3333' },
              ].map((os, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="p-3 bg-[#1a1a1a] rounded-lg text-center"
                >
                  <div className="text-xl mb-1" style={{ color: os.color }}>
                    {os.icon}
                  </div>
                  <p className="text-xs text-white">{os.os}</p>
                  <p className="text-sm font-bold text-white">{os.percent}%</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00ff88]/10 rounded-lg">
                <UserCheck size={20} className="text-[#00ff88]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Recent Users</h2>
            </div>
            <button className="text-xs text-[#00ffff] hover:underline">View All</button>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Mohamed Ahmed', email: 'mohamed@example.com', role: 'Developer', time: '5 minutes ago', avatar: 'MA' },
              { name: 'Sara Khaled', email: 'sara@example.com', role: 'Designer', time: '12 minutes ago', avatar: 'SK' },
              { name: 'Ahmed Ali', email: 'ahmed@example.com', role: 'Marketer', time: '25 minutes ago', avatar: 'AA' },
              { name: 'Fatma Omar', email: 'fatma@example.com', role: 'Manager', time: '1 hour ago', avatar: 'FO' },
            ].map((user, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00ffff] to-[#9945ff] flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{user.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-xs text-[#808080]">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#00ffff]">{user.role}</p>
                  <p className="text-xs text-[#808080]">{user.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ff3333]/10 rounded-lg">
                <Activity size={20} className="text-[#ff3333]" />
              </div>
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
            <span className="text-xs text-[#00ff88] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse"></span>
              Live
            </span>
          </div>

          <div className="space-y-4">
            {[
              { action: 'New user registered', user: 'Mohamed Ahmed', time: '2 minutes ago', icon: UserPlus, color: '#00ff88' },
              { action: 'System updated', user: 'Admin', time: '15 minutes ago', icon: Server, color: '#00ffff' },
              { action: 'New report generated', user: 'Sara Khaled', time: '32 minutes ago', icon: FileText, color: '#9945ff' },
              { action: 'Support ticket created', user: 'Ahmed Ali', time: '1 hour ago', icon: Shield, color: '#ff3333' },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div 
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${activity.color}20` }}
                >
                  <activity.icon size={16} style={{ color: activity.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{activity.action}</p>
                  <p className="text-xs text-[#808080]">{activity.user} • {activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
            <button className="w-full py-2 text-sm text-[#00ffff] hover:text-[#00a8ff] transition-colors">
              View All Activity
            </button>
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-6 bg-[#121212] border border-[#2a2a2a] rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00ffff]/10 rounded-lg">
              <Zap size={20} className="text-[#00ffff]" />
            </div>
            <h2 className="text-lg font-semibold text-white">Performance Metrics</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg text-xs bg-[#1a1a1a] text-[#b0b0b0] flex items-center gap-1 hover:text-white hover:border-[#00ffff] transition-all">
              <Filter size={14} />
              Filter
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs bg-[#1a1a1a] text-[#b0b0b0] flex items-center gap-1 hover:text-white hover:border-[#00ffff] transition-all">
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Load Time', value: '1.2s', change: '-0.3s', icon: Clock, color: '#00ffff' },
            { label: 'Response Rate', value: '98%', change: '+2%', icon: Activity, color: '#00ff88' },
            { label: 'Error Rate', value: '0.02%', change: '-0.01%', icon: Shield, color: '#ff3333' },
            { label: 'User Satisfaction', value: '4.8/5', change: '+0.3', icon: Star, color: '#9945ff' },
          ].map((metric, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-[#1a1a1a] rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <metric.icon size={16} style={{ color: metric.color }} />
                <span className="text-xs text-[#808080]">{metric.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <span className={`text-xs ${metric.change.startsWith('+') ? 'text-[#00ff88]' : 'text-[#ff3333]'}`}>
                {metric.change}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0);
          background-size: 40px 40px;
        }
      `}</style>
    </Layout>
  );
};

export default AdminDashboard;
