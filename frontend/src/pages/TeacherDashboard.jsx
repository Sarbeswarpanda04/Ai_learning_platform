/**
 * Teacher Dashboard - Complete Management Interface
 * Features: Course management, student analytics, assignments, and more
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Plus,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  Edit,
  Eye,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useAuthStore, useThemeStore } from '../utils/store';
import { lessonAPI, quizAPI, mlAPI } from '../utils/api';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingAssignments: 0,
    newMessages: 0,
    trends: {
      students: '+0%',
      courses: '0',
      assignments: '+0%',
      messages: '+0%'
    },
    studentsUp: true,
    coursesUp: true,
    assignmentsUp: true
  });
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch dashboard data - wait for authentication
  useEffect(() => {
    console.log('TeacherDashboard mounted - Auth state:', {
      isAuthenticated,
      hasUser: !!user,
      userName: user?.name,
      userRole: user?.role
    });

    // Only fetch data if authenticated with valid user
    if (isAuthenticated && user) {
      const accessToken = localStorage.getItem('accessToken');
      console.log('TeacherDashboard - Ready to fetch data:', {
        hasAccessToken: !!accessToken,
        tokenPreview: accessToken ? accessToken.substring(0, 30) + '...' : 'none'
      });
      
      if (accessToken) {
        fetchDashboardData();
      } else {
        console.warn('TeacherDashboard - Authenticated but no access token!');
      }
    } else {
      console.log('TeacherDashboard - Waiting for authentication...');
    }
  }, [isAuthenticated, user]); // Re-run when auth state changes

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch real-time dashboard stats from database
      const [statsRes, coursesRes, studentsRes, activityRes] = await Promise.all([
        api.get('/api/teacher/dashboard/stats').catch(err => {
          console.error('Stats API error:', err);
          return { data: { data: null } };
        }),
        lessonAPI.getLessons({ teacher: true }).catch(err => {
          console.error('Courses API error:', err);
          return { data: { data: [] } };
        }),
        api.get('/api/teacher/students').catch(err => {
          console.error('Students API error:', err);
          return { data: { data: [] } };
        }),
        api.get('/api/teacher/recent-activity').catch(err => {
          console.error('Activity API error:', err);
          return { data: { data: [] } };
        })
      ]);

      console.log('Dashboard API responses:', {
        stats: statsRes.data,
        courses: coursesRes.data,
        students: studentsRes.data,
        activity: activityRes.data
      });

      // Set stats from API
      if (statsRes.data?.data) {
        setStats({
          totalStudents: statsRes.data.data.totalStudents || 0,
          activeCourses: statsRes.data.data.activeCourses || 0,
          pendingAssignments: statsRes.data.data.pendingAssignments || 0,
          newMessages: statsRes.data.data.newMessages || 0,
          trends: statsRes.data.data.trends || {},
          studentsUp: statsRes.data.data.studentsUp !== false,
          coursesUp: statsRes.data.data.coursesUp !== false,
          assignmentsUp: statsRes.data.data.assignmentsUp !== false
        });
      }
      
      // Ensure courses is always an array
      const coursesData = coursesRes.data?.data || coursesRes.data?.lessons || [];
      const coursesArray = Array.isArray(coursesData) ? coursesData : [];
      console.log('Processed courses:', coursesArray);
      setCourses(coursesArray);

      // Set students from API
      const studentsData = studentsRes.data?.data || [];
      const studentsArray = Array.isArray(studentsData) ? studentsData : [];
      console.log('Processed students:', studentsArray);
      setStudents(studentsArray);

      // Set recent activity from API
      const activityData = activityRes.data?.data || [];
      if (Array.isArray(activityData) && activityData.length > 0) {
        setRecentActivity(activityData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        hasToken: !!localStorage.getItem('accessToken')
      });
      
      // Set empty array on error to prevent .map() errors
      setCourses([]);
      setStudents([]);
      
      // Don't show error toast for 401 (will auto-redirect to login)
      if (error.response?.status !== 401) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: '#4F46E5' },
    { id: 'courses', icon: BookOpen, label: 'My Courses', color: '#06B6D4' },
    { id: 'students', icon: Users, label: 'Students', color: '#10B981' },
    { id: 'assignments', icon: FileText, label: 'Assignments', color: '#F59E0B' },
    { id: 'schedule', icon: Calendar, label: 'Schedule', color: '#8B5CF6' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', color: '#EC4899' },
    { id: 'settings', icon: Settings, label: 'Settings', color: '#6B7280' },
  ];

  // KPI Cards data
  const kpiCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      trend: stats.trends?.students || '+0%',
      trendUp: stats.studentsUp !== false
    },
    {
      title: 'Active Courses',
      value: stats.activeCourses,
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      trend: stats.trends?.courses || '0',
      trendUp: stats.coursesUp !== false
    },
    {
      title: 'Pending Assignments',
      value: stats.pendingAssignments,
      icon: FileText,
      color: 'from-orange-500 to-red-500',
      trend: stats.trends?.assignments || '+0%',
      trendUp: stats.assignmentsUp !== false
    },
    {
      title: 'New Messages',
      value: stats.newMessages,
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      trend: stats.trends?.messages || '+0%',
      trendUp: true
    }
  ];

  // Animation variants
  const sidebarVariants = {
    open: { width: 280, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { width: 80, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 }
    })
  };

  const CountUpAnimation = ({ end }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      const duration = 2000;
      const steps = 60;
      const increment = end / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [end]);

    return <span>{count}</span>;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex`}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={sidebarOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        className={`${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r fixed left-0 top-0 h-screen overflow-y-auto overflow-x-hidden z-30 shadow-xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 lg:p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 lg:gap-3"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <span className={`text-lg lg:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  EduAI
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            } transition-colors`}
          >
            {sidebarOpen ? (
              <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            ) : (
              <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 lg:mt-8 px-2 lg:px-3 pb-6">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab(item.id);
                  // Close sidebar on mobile after selection
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 lg:gap-4 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl mb-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" style={{ color: isActive ? 'white' : item.color }} />
                <AnimatePresence mode="wait">
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'} transition-all duration-300`}>
        {/* Header */}
        <header className={`${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b sticky top-0 z-20 backdrop-blur-lg bg-opacity-90`}>
          <div className="px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`lg:hidden p-2 rounded-lg ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } transition-colors`}
            >
              <Menu className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md lg:max-w-xl">
              <div className={`relative ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl`}>
                <Search className={`absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 lg:pl-12 pr-3 lg:pr-4 py-2 lg:py-3 text-sm lg:text-base ${
                    theme === 'dark' ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className={`p-2 lg:p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 lg:w-5 lg:h-5" /> : <Moon className="w-4 h-4 lg:w-5 lg:h-5" />}
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 lg:p-3 rounded-xl relative ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <Bell className={`w-4 h-4 lg:w-5 lg:h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </motion.button>

              {/* Profile Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.name || 'Teacher'}&background=4F46E5&color=fff`}
                    alt="Profile"
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full ring-2 ring-indigo-500"
                  />
                  <div className="text-left hidden md:block">
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name || 'Teacher'}
                    </p>
                    <p className="text-xs text-gray-500">Teacher</p>
                  </div>
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute right-0 mt-2 w-48 ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                      } rounded-xl shadow-xl border ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      } py-2`}
                    >
                      <a href="/profile" className={`block px-4 py-2 text-sm ${
                        theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                        Profile
                      </a>
                      <a href="/settings" className={`block px-4 py-2 text-sm ${
                        theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}>
                        Settings
                      </a>
                      <hr className={`my-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
                      <button
                        onClick={() => {
                          localStorage.clear();
                          window.location.href = '/login';
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Greeting Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 lg:mb-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                Welcome back, {user?.name || 'Teacher'} 👋
              </h1>
              <p className="text-sm sm:text-base lg:text-lg opacity-90">Here's your overview for today.</p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -right-20 -bottom-20 w-64 h-64 bg-white opacity-10 rounded-full hidden lg:block"
            />
          </motion.div>

          {/* KPI Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {kpiCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  whileHover={{ scale: 1.02 }}
                  className={`${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-3 lg:mb-4">
                    <div className={`p-2 lg:p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
                      <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <span className={`text-xs lg:text-sm font-semibold ${card.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                      {card.trend}
                    </span>
                  </div>
                  <h3 className={`text-2xl lg:text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <CountUpAnimation end={card.value} />
                  </h3>
                  <p className="text-gray-500 text-xs lg:text-sm">{card.title}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Content Sections Based on Active Tab */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg`}
              >
                <h2 className={`text-lg lg:text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Activity
                </h2>
                <div className="space-y-3 lg:space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 3).map((activity, index) => {
                      const iconMap = {
                        'FileText': FileText,
                        'Award': Award,
                        'MessageSquare': MessageSquare
                      };
                      const Icon = iconMap[activity.icon] || FileText;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                          } hover:shadow-md transition-shadow`}
                        >
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg shrink-0">
                            <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm lg:text-base truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {activity.action}
                            </p>
                            <p className="text-xs lg:text-sm text-gray-500 truncate">{activity.student}</p>
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">{activity.time}</span>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg`}
              >
                <h2 className={`text-lg lg:text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  {[
                    { label: 'Create Course', icon: Plus, color: 'from-blue-500 to-cyan-500' },
                    { label: 'Upload Material', icon: Upload, color: 'from-purple-500 to-pink-500' },
                    { label: 'Schedule Class', icon: Calendar, color: 'from-orange-500 to-red-500' },
                    { label: 'View Analytics', icon: BarChart3, color: 'from-green-500 to-emerald-500' },
                  ].map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-4 lg:p-6 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl transition-shadow`}
                      >
                        <Icon className="w-6 h-6 lg:w-8 lg:h-8 mb-2" />
                        <p className="text-xs lg:text-sm font-semibold">{action.label}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}

          {/* My Courses Section */}
          {activeTab === 'courses' && (
            <CoursesSection courses={courses} theme={theme} />
          )}

          {/* Students Section */}
          {activeTab === 'students' && (
            <StudentsSection students={students} theme={theme} />
          )}

          {/* Assignments Section */}
          {activeTab === 'assignments' && (
            <AssignmentsSection theme={theme} />
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center z-50"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Plus className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
      </motion.button>
    </div>
  );
};

// Courses Section Component
const CoursesSection = ({ courses, theme }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 gap-3">
        <h2 className={`text-xl lg:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          My Courses
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2 text-sm lg:text-base"
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          Create New Course
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {Array.isArray(courses) && courses.length > 0 ? (
          courses.map((course, index) => (
            <motion.div
              key={course.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className={`${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-3 lg:mb-4">
                <div className="p-2 lg:p-3 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl">
                  <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="flex gap-1 lg:gap-2">
                  <button className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className={`text-base lg:text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {course.title || 'Untitled Course'}
              </h3>
              <p className="text-gray-500 text-xs lg:text-sm mb-3 lg:mb-4 line-clamp-2">
                {course.description || course.content?.substring(0, 100) || 'No description available'}
              </p>

              <div className="flex items-center gap-2 mb-2 lg:mb-3">
                <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-400" />
                <span className="text-xs lg:text-sm text-gray-500">
                  {course.views_count || 0} views
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs lg:text-sm mb-1">
                  <span className="text-gray-500">Subject</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {course.subject || 'General'}
                  </span>
                </div>
                <div className="flex justify-between text-xs lg:text-sm mb-1">
                  <span className="text-gray-500">Difficulty</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} capitalize`}>
                    {course.difficulty || 'Beginner'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 lg:py-12">
            <BookOpen className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
            <h3 className={`text-lg lg:text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No courses yet
            </h3>
            <p className="text-sm lg:text-base text-gray-500 mb-3 lg:mb-4">
              Start by creating your first course
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/teacher/create-lesson'}
              className="inline-flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              Create Your First Course
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

// Students Section Component
const StudentsSection = ({ students, theme }) => {
  // Ensure students is always an array
  const studentsList = Array.isArray(students) ? students : [];
  
  return (
    <div>
      <h2 className={`text-xl lg:text-2xl font-bold mb-4 lg:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Student Management
      </h2>

      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl lg:rounded-2xl shadow-lg overflow-hidden`}>
        {studentsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-300">Student</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-300">Progress</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-300">Last Active</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {studentsList.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full shrink-0"
                      />
                      <span className={`font-medium text-sm lg:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-500 text-xs lg:text-sm">{student.email}</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 lg:w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs lg:text-sm font-semibold">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-500 text-xs lg:text-sm">{student.lastActive}</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <button className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                      <Eye className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600 dark:text-indigo-400" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="text-center py-8 lg:py-12">
            <Users className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
            <h3 className={`text-lg lg:text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No students enrolled yet
            </h3>
            <p className="text-sm lg:text-base text-gray-500">
              Students will appear here once they enroll in your courses
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Assignments Section Component
const AssignmentsSection = ({ theme }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 gap-3">
        <h2 className={`text-xl lg:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Assignments & Quizzes
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2 text-sm lg:text-base"
        >
          <Upload className="w-4 h-4 lg:w-5 lg:h-5" />
          Upload Assignment
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg`}
          >
            <div className="flex items-start justify-between mb-3 lg:mb-4">
              <div>
                <h3 className={`text-base lg:text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Data Structures Assignment {item}
                </h3>
                <p className="text-xs lg:text-sm text-gray-500">Due: Dec 25, 2025</p>
              </div>
              <span className="px-2 lg:px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold shrink-0">
                12 Pending
              </span>
            </div>

            <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
              <div className="flex items-center gap-1.5 lg:gap-2">
                <FileText className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-400" />
                <span className="text-xs lg:text-sm text-gray-500">35 Submissions</span>
              </div>
              <div className="flex items-center gap-1.5 lg:gap-2">
                <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-400" />
                <span className="text-xs lg:text-sm text-gray-500">5 days left</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
                View Submissions
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;
