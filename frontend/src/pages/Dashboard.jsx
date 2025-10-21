import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  TrendingUp, 
  Award, 
  Calendar,
  Clock,
  Target,
  Sparkles,
  Brain,
  MessageSquare,
  Settings,
  ChevronRight,
  Play,
  CheckCircle,
  Star,
  Zap,
  Trophy,
  Flame,
  BarChart3,
  User,
  Bell,
  Search,
  Filter,
  GraduationCap,
  BookMarked,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../utils/store';
import ChatBot from '../components/ChatBot';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    progress: {},
    recommendations: [],
    stats: {},
    recentActivity: [],
    badges: [],
    streak: 0
  });

  // Check authentication
  useEffect(() => {
    const waitForToken = async (timeout = 1000) => {
      const interval = 100;
      const start = Date.now();
      // If already have auth in store or localStorage, resolve immediately
      if (isAuthenticated || localStorage.getItem('accessToken')) return true;
      return new Promise((resolve) => {
        const t = setInterval(() => {
          if (isAuthenticated || localStorage.getItem('accessToken')) {
            clearInterval(t);
            resolve(true);
          } else if (Date.now() - start > timeout) {
            clearInterval(t);
            resolve(false);
          }
        }, interval);
      });
    };

    (async () => {
      const accessToken = localStorage.getItem('accessToken');

      // If no token and not authenticated, wait briefly for tokens to be written (race prevention)
      if (!accessToken && !isAuthenticated) {
        const ok = await waitForToken(1000);
        if (!ok) {
          console.log('Not authenticated after wait, redirecting to login');
          toast.error('Please login to access dashboard');
          navigate('/login');
          return;
        }
      }

      // Fetch dashboard data now that token is available or auth is set
      fetchDashboardData();
    })();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user data from localStorage if not in state
      const storedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
      
      console.log('Fetching dashboard data for user:', storedUser?.id);
      
      // Fetch courses first (critical)
      let coursesArray = [];
      try {
        const coursesRes = await api.get('/api/lessons');
        console.log('Courses fetched successfully:', coursesRes.data);
        
        // Extract courses data - handle different response formats
        if (coursesRes.data.data && Array.isArray(coursesRes.data.data)) {
          coursesArray = coursesRes.data.data;
        } else if (Array.isArray(coursesRes.data)) {
          coursesArray = coursesRes.data;
        } else if (coursesRes.data.lessons && Array.isArray(coursesRes.data.lessons)) {
          coursesArray = coursesRes.data.lessons;
        }
      } catch (coursesError) {
        console.error('Failed to fetch courses (non-fatal):', coursesError.message);
        // Don't throw - allow dashboard to load with empty courses
      }
      
      // Fetch progress data (non-critical)
      let progressData = {};
      try {
        const progressRes = await api.get('/api/ml/student/dashboard');
        progressData = progressRes.data || {};
        console.log('Progress data fetched:', progressData);
      } catch (progressError) {
        console.warn('ML progress endpoint not available (non-fatal):', progressError.message);
        // Continue without progress data
      }
      
      // Fetch recommendations (non-critical)
      let recommendationsData = [];
      if (storedUser?.id) {
        try {
          const recommendationsRes = await api.post('/api/ml/recommend', { 
            user_id: storedUser.id 
          });
          recommendationsData = recommendationsRes.data?.recommendations || [];
          console.log('Recommendations fetched:', recommendationsData.length);
        } catch (recError) {
          console.warn('Recommendations not available (non-fatal):', recError.message);
          // Continue without recommendations
        }
      }

      console.log('Dashboard data loaded successfully:', { 
        coursesCount: coursesArray.length,
        hasProgress: !!progressData,
        recommendationsCount: recommendationsData.length
      });

      // Mock data for demonstration (replace with real data)
      setDashboardData({
        courses: coursesArray,
        progress: progressData || {},
        recommendations: recommendationsData.length > 0 ? recommendationsData : [
          {
            id: 1,
            title: 'Review Mathematics Basics',
            reason: 'You struggled with algebra questions',
            priority: 'high',
            icon: '🔢'
          },
          {
            id: 2,
            title: 'Practice Python Functions',
            reason: 'Complete this topic to unlock advanced concepts',
            priority: 'medium',
            icon: '🐍'
          },
          {
            id: 3,
            title: 'Watch Data Structures Video',
            reason: 'Strengthen your fundamentals',
            priority: 'low',
            icon: '📊'
          }
        ],
        stats: {
          completedLessons: 12,
          totalLessons: 25,
          hoursStudied: 24.5,
          averageScore: 85,
          rank: 15,
          totalUsers: 150
        },
        recentActivity: [
          { id: 1, type: 'completed', title: 'Python Basics', time: '2 hours ago', score: 90 },
          { id: 2, type: 'quiz', title: 'Math Quiz #5', time: '5 hours ago', score: 85 },
          { id: 3, type: 'started', title: 'Data Structures', time: '1 day ago', score: null }
        ],
        badges: [
          { id: 1, name: 'First Steps', icon: '🎯', earned: true, description: 'Complete your first lesson' },
          { id: 2, name: 'Quiz Master', icon: '🏆', earned: true, description: 'Score 90+ on 5 quizzes' },
          { id: 3, name: 'Week Warrior', icon: '🔥', earned: true, description: '7-day learning streak' },
          { id: 4, name: 'Night Owl', icon: '🦉', earned: false, description: 'Study after midnight' },
          { id: 5, name: 'Perfect Score', icon: '⭐', earned: false, description: 'Get 100% on any quiz' }
        ],
        streak: 7
      });
      
    } catch (error) {
      console.error('Critical error loading dashboard:', error);
      
      // Only show error toast if it's not a 401 (which would trigger redirect)
      if (error.response?.status !== 401) {
        toast.error('Some dashboard features are unavailable. Core features still work!');
      }
      
      // Set minimal dashboard data so page doesn't crash
      setDashboardData({
        courses: [],
        progress: {},
        recommendations: [],
        stats: {
          completedLessons: 0,
          totalLessons: 0,
          hoursStudied: 0,
          averageScore: 0,
          rank: 0,
          totalUsers: 0
        },
        recentActivity: [],
        badges: [],
        streak: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const weeklyProgress = [
    { day: 'Mon', hours: 2.5, score: 85 },
    { day: 'Tue', hours: 3.0, score: 88 },
    { day: 'Wed', hours: 1.5, score: 82 },
    { day: 'Thu', hours: 4.0, score: 92 },
    { day: 'Fri', hours: 2.0, score: 87 },
    { day: 'Sat', hours: 5.5, score: 95 },
    { day: 'Sun', hours: 3.5, score: 90 }
  ];

  const subjectPerformance = [
    { subject: 'Math', score: 85 },
    { subject: 'Science', score: 78 },
    { subject: 'Programming', score: 92 },
    { subject: 'English', score: 88 },
    { subject: 'Physics', score: 75 }
  ];

  const radarData = [
    { subject: 'Understanding', value: 85 },
    { subject: 'Application', value: 78 },
    { subject: 'Analysis', value: 90 },
    { subject: 'Memory', value: 82 },
    { subject: 'Speed', value: 88 }
  ];

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

  // Filter courses - ensure courses is an array
  const coursesArray = Array.isArray(dashboardData.courses) ? dashboardData.courses : [];
  const filteredCourses = coursesArray.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'completed' && course.progress === 100) ||
                         (filterStatus === 'in-progress' && course.progress > 0 && course.progress < 100) ||
                         (filterStatus === 'not-started' && course.progress === 0);
    return matchesSearch && matchesFilter;
  });

  // Sidebar navigation
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-16">
      {/* Header - Fixed below main navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 fixed top-16 left-0 right-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left Section - Logo and Welcome */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <GraduationCap className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </motion.div>
              <div className="min-w-0 hidden md:block">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  Welcome back, {user?.name || 'Student'}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden lg:block">Ready to continue your learning journey?</p>
              </div>
              <div className="min-w-0 md:hidden">
                <h1 className="text-base font-bold text-gray-900 truncate">
                  Hi, {user?.name?.split(' ')[0] || 'Student'}! 👋
                </h1>
              </div>
            </div>

            {/* Right Section - Streak, Notifications, Profile */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Streak Counter - Responsive */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-lg"
              >
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <div className="hidden sm:block">
                  <div className="text-xs font-medium leading-tight">Streak</div>
                  <div className="text-base sm:text-lg font-bold leading-tight">{dashboardData.streak} days</div>
                </div>
                <div className="text-sm sm:hidden font-bold">{dashboardData.streak}d</div>
              </motion.div>

              {/* Notifications - Hidden on smallest screens */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 sm:p-3 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl transition hidden xs:block"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-semibold">
                  3
                </span>
              </motion.button>

              {/* Profile */}
              <Link to="/profile">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0"
                >
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Add padding-top to account for both navbars */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-24 sm:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Sidebar - Responsive */}
          <motion.aside
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-3"
          >
            {/* Desktop Sidebar */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg p-4 sticky top-32">
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    whileHover={{ x: 4 }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                ))}
              </nav>
            </div>

            {/* Mobile Horizontal Tabs */}
            <div className="lg:hidden bg-white rounded-xl shadow-lg p-2 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {sidebarItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Main Content - Responsive */}
          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Stats Cards - Fully Responsive */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                      icon={BookOpen}
                      label="Completed Lessons"
                      value={`${dashboardData.stats.completedLessons}/${dashboardData.stats.totalLessons}`}
                      color="purple"
                      trend="+3 this week"
                    />
                    <StatCard
                      icon={Clock}
                      label="Hours Studied"
                      value={dashboardData.stats.hoursStudied}
                      color="blue"
                      trend="+2.5 hrs"
                    />
                    <StatCard
                      icon={Target}
                      label="Average Score"
                      value={`${dashboardData.stats.averageScore}%`}
                      color="green"
                      trend="+5%"
                    />
                    <StatCard
                      icon={Trophy}
                      label="Your Rank"
                      value={`#${dashboardData.stats.rank}`}
                      color="orange"
                      trend={`Top ${Math.round((dashboardData.stats.rank/dashboardData.stats.totalUsers)*100)}%`}
                    />
                  </div>

                  {/* AI Insights Widget */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">AI Learning Insights</h3>
                        <p className="text-white/90 mb-4">
                          Great progress this week! You're excelling in Programming (+15%) but Math needs attention (-5%). 
                          Focus on algebra concepts for the next session.
                        </p>
                        <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Get Personalized Plan
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Progress Chart */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Activity</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={weeklyProgress}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip />
                          <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Subject Performance */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Performance</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={subjectPerformance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="subject" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip />
                          <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {dashboardData.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'completed' ? 'bg-green-100 text-green-600' :
                            activity.type === 'quiz' ? 'bg-blue-100 text-blue-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {activity.type === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                             activity.type === 'quiz' ? <Target className="w-5 h-5" /> :
                             <Play className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600">{activity.time}</p>
                          </div>
                          {activity.score && (
                            <div className="text-lg font-bold text-purple-600">{activity.score}%</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Badges Section */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      Your Badges
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {dashboardData.badges.map((badge) => (
                        <motion.div
                          key={badge.id}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className={`text-center p-4 rounded-xl border-2 transition ${
                            badge.earned 
                              ? 'border-yellow-400 bg-yellow-50' 
                              : 'border-gray-200 bg-gray-50 opacity-50'
                          }`}
                        >
                          <div className="text-4xl mb-2">{badge.icon}</div>
                          <p className="font-semibold text-sm text-gray-900">{badge.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* My Courses Tab */}
              {activeTab === 'courses' && (
                <motion.div
                  key="courses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Search and Filter */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search courses..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500 transition"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500 transition"
                      >
                        <option value="all">All Courses</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="not-started">Not Started</option>
                      </select>
                    </div>
                  </div>

                  {/* Courses Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course, index) => (
                        <CourseCard key={course.id || index} course={course} />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <BookMarked className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No courses found</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* AI Assistant Tab */}
              {activeTab === 'ai-assistant' && (
                <motion.div
                  key="ai-assistant"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* AI Chat Interface */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[500px] flex flex-col">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">AI Learning Assistant</h3>
                        <p className="text-sm text-gray-600">Ask me anything about your studies!</p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Brain className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="bg-purple-50 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                          <p className="text-gray-800">
                            Hello! I'm your AI tutor. I can help you with:
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                              <li>Explaining difficult concepts</li>
                              <li>Recommending study materials</li>
                              <li>Analyzing your performance</li>
                              <li>Creating personalized study plans</li>
                            </ul>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Type your question..."
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-500 transition"
                      />
                      <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition">
                        Send
                      </button>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-6 h-6 text-yellow-500" />
                      Personalized Recommendations
                    </h3>
                    <div className="space-y-3">
                      {dashboardData.recommendations.map((rec) => (
                        <div key={rec.id} className={`p-4 rounded-xl border-2 ${
                          rec.priority === 'high' ? 'border-red-200 bg-red-50' :
                          rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                          'border-green-200 bg-green-50'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{rec.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                              <button className="mt-3 text-purple-600 font-medium text-sm hover:underline">
                                Start Now →
                              </button>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                              rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-green-200 text-green-800'
                            }`}>
                              {rec.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Skills Radar */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Skills Assessment</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" stroke="#666" />
                        <PolarRadiusAxis stroke="#666" />
                        <Radar name="Skills" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed Progress */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Progress</h3>
                    <div className="space-y-4">
                      {subjectPerformance.map((subject, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-gray-700">{subject.subject}</span>
                            <span className="font-bold text-purple-600">{subject.score}%</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${subject.score}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Messages Tab */}
              {activeTab === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Messages & Feedback</h3>
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>No new messages</p>
                  </div>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Settings</h3>
                  <div className="space-y-6">
                    <SettingsSection title="Profile">
                      <input type="text" placeholder="Name" className="input-field" />
                      <input type="email" placeholder="Email" className="input-field" />
                    </SettingsSection>
                    
                    <SettingsSection title="Notifications">
                      <label className="flex items-center justify-between">
                        <span>Email Notifications</span>
                        <input type="checkbox" className="toggle" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span>Push Notifications</span>
                        <input type="checkbox" className="toggle" />
                      </label>
                    </SettingsSection>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* AI Chatbot - Floating at bottom-left */}
      <ChatBot />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, trend }) => {
  const colors = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${colors[color]} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <span className="text-green-600 text-xs sm:text-sm font-medium">{trend}</span>
      </div>
      <p className="text-gray-600 text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );
};

// Course Card Component
const CourseCard = ({ course }) => {
  const progress = course.progress || 0;
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="h-40 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-4 left-4 right-4">
          <h4 className="text-white font-bold text-lg line-clamp-2">{course.title}</h4>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">{course.subject}</span>
          <span className="text-sm font-bold text-purple-600">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Link to={`/lessons/${course.id}`}>
          <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
            {progress > 0 ? 'Continue' : 'Start'} Learning
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
};

// Settings Section Component
const SettingsSection = ({ title, children }) => (
  <div>
    <h4 className="font-semibold text-gray-900 mb-3">{title}</h4>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

export default Dashboard;
