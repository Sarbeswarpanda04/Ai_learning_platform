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
    newMessages: 0
  });
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
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
      // Fetch courses
      const coursesRes = await lessonAPI.getLessons({ teacher: true });
      console.log('Courses API response:', coursesRes.data);
      
      // Ensure courses is always an array
      const coursesData = coursesRes.data?.data || coursesRes.data?.lessons || [];
      const coursesArray = Array.isArray(coursesData) ? coursesData : [];
      
      console.log('Processed courses:', coursesArray);
      setCourses(coursesArray);

      // Mock stats for MVP (you can replace with real API)
      setStats({
        totalStudents: 45,
        activeCourses: coursesArray.length || 5,
        pendingAssignments: 12,
        newMessages: 8
      });

      // Mock students data
      setStudents([
        { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', progress: 85, lastActive: '2 hours ago', avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar' },
        { id: 2, name: 'Priya Singh', email: 'priya@example.com', progress: 92, lastActive: '1 day ago', avatar: 'https://ui-avatars.com/api/?name=Priya+Singh' },
        { id: 3, name: 'Amit Patel', email: 'amit@example.com', progress: 78, lastActive: '3 hours ago', avatar: 'https://ui-avatars.com/api/?name=Amit+Patel' },
      ]);

    } catch (error) {
      console.error('Error fetching courses:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        hasToken: !!localStorage.getItem('accessToken')
      });
      
      // Set empty array on error to prevent .map() errors
      setCourses([]);
      
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
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Active Courses',
      value: stats.activeCourses,
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Pending Assignments',
      value: stats.pendingAssignments,
      icon: FileText,
      color: 'from-orange-500 to-red-500',
      trend: '-3%',
      trendUp: false
    },
    {
      title: 'New Messages',
      value: stats.newMessages,
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
      trend: '+18%',
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
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={sidebarOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        className={`${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r fixed left-0 top-0 h-screen overflow-hidden z-30 shadow-xl`}
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
        <nav className="mt-8 px-3">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl mb-2 transition-all ${
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
      <div className={`flex-1 ${sidebarOpen ? 'ml-[280px]' : 'ml-[80px]'} transition-all duration-300`}>
        {/* Header */}
        <header className={`${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-b sticky top-0 z-20 backdrop-blur-lg bg-opacity-90`}>
          <div className="px-8 py-4 flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className={`relative ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl`}>
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search students or courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 ${
                    theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-6">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-3 rounded-xl relative ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </motion.button>

              {/* Profile Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.name || 'Teacher'}&background=4F46E5&color=fff`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full ring-2 ring-indigo-500"
                  />
                  {sidebarOpen && (
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {user?.name || 'Mr. Sarbeswar'}
                      </p>
                      <p className="text-xs text-gray-500">Teacher</p>
                    </div>
                  )}
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
        <main className="p-8">
          {/* Greeting Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-8 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.name || 'Mr. Sarbeswar'} 👋
              </h1>
              <p className="text-lg opacity-90">Here's your overview for today.</p>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -right-20 -bottom-20 w-64 h-64 bg-white opacity-10 rounded-full"
            />
          </motion.div>

          {/* KPI Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-semibold ${card.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                      {card.trend}
                    </span>
                  </div>
                  <h3 className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <CountUpAnimation end={card.value} />
                  </h3>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Content Sections Based on Active Tab */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}
              >
                <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {[
                    { action: 'New assignment submitted', student: 'Priya Singh', time: '5 min ago', icon: FileText },
                    { action: 'Course completion', student: 'Rajesh Kumar', time: '1 hour ago', icon: Award },
                    { action: 'New message received', student: 'Amit Patel', time: '2 hours ago', icon: MessageSquare },
                  ].map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        } hover:shadow-md transition-shadow`}
                      >
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {activity.action}
                          </p>
                          <p className="text-sm text-gray-500">{activity.student}</p>
                        </div>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}
              >
                <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-4">
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
                        className={`p-6 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl transition-shadow`}
                      >
                        <Icon className="w-8 h-8 mb-2" />
                        <p className="text-sm font-semibold">{action.label}</p>
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
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center z-50"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Plus className="w-8 h-8 text-white" />
      </motion.button>
    </div>
  );
};

// Courses Section Component
const CoursesSection = ({ courses, theme }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          My Courses
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Course
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              } rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {course.title || 'Untitled Course'}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {course.description || course.content?.substring(0, 100) || 'No description available'}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">45 students enrolled</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Course Progress</span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    65%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                  />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No courses yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start by creating your first course
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/teacher/create-lesson'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
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
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Student Management
      </h2>

      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
        {studentsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Progress</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Last Active</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{student.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{student.lastActive}</td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                      <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No students enrolled yet
            </h3>
            <p className="text-gray-500">
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
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Assignments & Quizzes
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload Assignment
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Data Structures Assignment {item}
                </h3>
                <p className="text-sm text-gray-500">Due: Dec 25, 2025</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                12 Pending
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">35 Submissions</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">5 days left</span>
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
