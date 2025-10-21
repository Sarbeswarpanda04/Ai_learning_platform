import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Play,
  FileText,
  Video,
  Brain,
  TrendingUp,
  Clock,
  User,
  X,
  Download,
  Share2,
  Star,
  ChevronDown,
  Grid,
  List,
  SlidersHorizontal,
  Zap,
  Award,
  BookMarked,
  Layers
} from 'lucide-react';
import { useAuthStore, useThemeStore } from '../utils/store';
import api from '../utils/api';

const AllLessons = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { theme: currentTheme } = useThemeStore();

  // State management
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    subject: 'all',
    difficulty: 'all',
    type: 'all',
    sortBy: 'latest'
  });

  // Subjects and categories
  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const types = ['All', 'Video', 'Document', 'Interactive'];
  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'popular', label: 'Most Viewed' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'title', label: 'Alphabetical' }
  ];

  // Fetch lessons from backend
  useEffect(() => {
    fetchLessons();
  }, []);

  // Apply filters and search
  useEffect(() => {
    applyFiltersAndSearch();
  }, [lessons, searchQuery, filters]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/lessons');
      
      // Check if we got real data from backend
      if (response.data && response.data.success && response.data.data && response.data.data.items) {
        // Transform backend data to frontend format
        const backendLessons = response.data.data.items.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          subject: lesson.subject,
          description: lesson.content ? lesson.content.substring(0, 200) : 'No description available',
          tags: lesson.tags || [],
          teacher: 'Teacher',
          date: lesson.created_at ? lesson.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          thumbnail: `https://via.placeholder.com/400x250?text=${encodeURIComponent(lesson.title)}`,
          type: lesson.content ? 'Document' : 'Interactive',
          difficulty: lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1),
          duration: `${lesson.duration_minutes || 30} min`,
          views: lesson.views_count || 0,
          rating: 4.5,
          progress: 0,
          aiSummary: lesson.content ? lesson.content.substring(0, 150) + '...' : 'AI-generated summary coming soon.'
        }));
        
        setLessons(backendLessons);
        setFilteredLessons(backendLessons);
        setLoading(false);
        return;
      }
      
      // Fallback to mock data for demonstration
      const mockLessons = [
        {
          id: 1,
          title: 'Introduction to Python Variables',
          subject: 'Computer Science',
          description: 'Learn the fundamentals of variables in Python programming language.',
          tags: ['Python', 'Programming', 'Basics'],
          teacher: 'Dr. Sarah Johnson',
          date: '2024-10-15',
          thumbnail: 'https://via.placeholder.com/400x250?text=Python+Variables',
          type: 'Video',
          difficulty: 'Beginner',
          duration: '45 min',
          views: 1234,
          rating: 4.8,
          progress: 65,
          aiSummary: 'This lesson covers variable declaration, data types, and naming conventions in Python.'
        },
        {
          id: 2,
          title: 'Advanced Calculus: Integration Techniques',
          subject: 'Mathematics',
          description: 'Master advanced integration methods including substitution and integration by parts.',
          tags: ['Calculus', 'Integration', 'Advanced'],
          teacher: 'Prof. Michael Chen',
          date: '2024-10-18',
          thumbnail: 'https://via.placeholder.com/400x250?text=Calculus',
          type: 'Document',
          difficulty: 'Advanced',
          duration: '60 min',
          views: 856,
          rating: 4.9,
          progress: 30,
          aiSummary: 'Comprehensive guide to integration techniques with practice problems and solutions.'
        },
        {
          id: 3,
          title: 'Quantum Mechanics Fundamentals',
          subject: 'Physics',
          description: 'Introduction to quantum mechanics, wave-particle duality, and quantum states.',
          tags: ['Quantum', 'Physics', 'Modern Science'],
          teacher: 'Dr. Emily Watson',
          date: '2024-10-20',
          thumbnail: 'https://via.placeholder.com/400x250?text=Quantum+Physics',
          type: 'Interactive',
          difficulty: 'Intermediate',
          duration: '90 min',
          views: 2341,
          rating: 4.7,
          progress: 0,
          aiSummary: 'Explore the fascinating world of quantum physics with interactive simulations.'
        },
        {
          id: 4,
          title: 'Organic Chemistry: Reaction Mechanisms',
          subject: 'Chemistry',
          description: 'Understanding reaction mechanisms in organic chemistry with practical examples.',
          tags: ['Chemistry', 'Organic', 'Reactions'],
          teacher: 'Dr. Robert Lee',
          date: '2024-10-19',
          thumbnail: 'https://via.placeholder.com/400x250?text=Organic+Chemistry',
          type: 'Video',
          difficulty: 'Intermediate',
          duration: '75 min',
          views: 1567,
          rating: 4.6,
          progress: 45,
          aiSummary: 'Learn reaction mechanisms through step-by-step animations and real-world applications.'
        },
        {
          id: 5,
          title: 'Machine Learning Basics',
          subject: 'Computer Science',
          description: 'Introduction to machine learning algorithms and their applications.',
          tags: ['ML', 'AI', 'Data Science'],
          teacher: 'Dr. Sarah Johnson',
          date: '2024-10-21',
          thumbnail: 'https://via.placeholder.com/400x250?text=Machine+Learning',
          type: 'Interactive',
          difficulty: 'Intermediate',
          duration: '120 min',
          views: 3456,
          rating: 4.9,
          progress: 20,
          aiSummary: 'Hands-on introduction to ML concepts with Python code examples and projects.'
        },
        {
          id: 6,
          title: 'English Literature: Shakespeare',
          subject: 'English',
          description: 'Analyzing the works of William Shakespeare and his impact on literature.',
          tags: ['Literature', 'Shakespeare', 'Classics'],
          teacher: 'Prof. Amanda Brooks',
          date: '2024-10-17',
          thumbnail: 'https://via.placeholder.com/400x250?text=Shakespeare',
          type: 'Document',
          difficulty: 'Beginner',
          duration: '50 min',
          views: 987,
          rating: 4.5,
          progress: 100,
          aiSummary: 'Comprehensive study of Shakespearean plays with modern interpretations.'
        }
      ];

      setLessons(mockLessons);
      setFilteredLessons(mockLessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lessons');
      
      // Fallback to empty array on error
      setLessons([]);
      setFilteredLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...lessons];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply subject filter
    if (filters.subject !== 'all' && filters.subject !== 'All') {
      filtered = filtered.filter(lesson => lesson.subject === filters.subject);
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all' && filters.difficulty !== 'All') {
      filtered = filtered.filter(lesson => lesson.difficulty === filters.difficulty);
    }

    // Apply type filter
    if (filters.type !== 'all' && filters.type !== 'All') {
      filtered = filtered.filter(lesson => lesson.type === filters.type);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredLessons(filtered);
  };

  const handleViewLesson = (lesson) => {
    setSelectedLesson(lesson);
    setShowModal(true);
  };

  const handleEditLesson = (lessonId) => {
    navigate(`/teacher/lesson/edit/${lessonId}`);
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      await api.delete(`/api/teacher/lesson/delete/${lessonId}`);
      toast.success('Lesson deleted successfully');
      setLessons(lessons.filter(l => l.id !== lessonId));
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete lesson');
    }
  };

  const handleStartLesson = (lessonId) => {
    navigate(`/lesson/${lessonId}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video':
        return <Video size={16} />;
      case 'Document':
        return <FileText size={16} />;
      case 'Interactive':
        return <Brain size={16} />;
      default:
        return <BookOpen size={16} />;
    }
  };

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <div className={`min-h-screen ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50'}`}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${currentTheme === 'dark' ? 'bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'} text-white py-16 px-4`}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <BookMarked size={48} className="text-yellow-300" />
              </motion.div>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Explore Lessons Tailored for You 🎓
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Access AI-personalized lessons, interactive content, and progress insights — all in one place.
            </p>
            <div className="flex items-center justify-center space-x-4">
              {isTeacher && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/teacher/create-lesson')}
                  className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Plus size={20} />
                  <span>Create Lesson</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-transparent border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
              >
                <span>{isTeacher ? 'View Analytics' : 'Start Learning'}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <div className={`sticky top-0 z-40 ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search Bar */}
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
                <input
                  type="text"
                  placeholder="Search lessons, tags, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    currentTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                />
              </div>
            </div>

            {/* Filter Toggle and View Mode */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-lg flex items-center space-x-2 ${
                  showFilters
                    ? 'bg-indigo-600 text-white'
                    : currentTheme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <SlidersHorizontal size={20} />
                <span className="hidden md:inline">Filters</span>
              </motion.button>

              {/* View Mode Toggle */}
              <div className={`flex items-center rounded-lg ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} p-1`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 mt-4 border-t border-gray-300 dark:border-gray-600">
                  {/* Subject Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Subject
                    </label>
                    <select
                      value={filters.subject}
                      onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        currentTheme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-indigo-500`}
                    >
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Difficulty
                    </label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        currentTheme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-indigo-500`}
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty}>{difficulty}</option>
                      ))}
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        currentTheme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-indigo-500`}
                    >
                      {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        currentTheme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-indigo-500`}
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <p className={`text-lg ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Found <span className="font-bold text-indigo-600">{filteredLessons.length}</span> lessons
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 animate-pulse`}
              >
                <div className="bg-gray-300 dark:bg-gray-600 h-40 rounded-lg mb-4"></div>
                <div className="bg-gray-300 dark:bg-gray-600 h-6 rounded mb-2"></div>
                <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredLessons.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <BookOpen size={80} className="mx-auto mb-4 text-gray-400" />
            <h3 className={`text-2xl font-bold mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              No lessons found
            </h3>
            <p className={`${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your filters or search query
            </p>
          </motion.div>
        ) : (
          // Lesson Cards
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {filteredLessons.map((lesson) => (
              <motion.div
                key={lesson.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer group`}
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden h-48">
                  <img
                    src={lesson.thumbnail}
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                    <span className="px-2 py-1 bg-black bg-opacity-60 text-white rounded-full text-xs flex items-center space-x-1">
                      {getTypeIcon(lesson.type)}
                      <span>{lesson.type}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                    {lesson.title}
                  </h3>

                  <div className="flex items-center space-x-2 mb-3">
                    <User size={16} className="text-gray-500" />
                    <span className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {lesson.teacher}
                    </span>
                  </div>

                  <p className={`text-sm mb-4 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                    {lesson.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {lesson.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center space-x-4">
                      <span className={`flex items-center space-x-1 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Eye size={16} />
                        <span>{lesson.views}</span>
                      </span>
                      <span className={`flex items-center space-x-1 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Clock size={16} />
                        <span>{lesson.duration}</span>
                      </span>
                      <span className={`flex items-center space-x-1 ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Star size={16} className="text-yellow-500" />
                        <span>{lesson.rating}</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar (for students) */}
                  {!isTeacher && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Progress
                        </span>
                        <span className={`text-xs font-semibold ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {lesson.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${lesson.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewLesson(lesson)}
                      className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium flex items-center justify-center space-x-2 hover:from-indigo-700 hover:to-purple-700"
                    >
                      <Eye size={18} />
                      <span>View</span>
                    </motion.button>

                    {isTeacher && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditLesson(lesson.id)}
                          className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                        >
                          <Edit size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDeleteConfirm(lesson.id)}
                          className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lesson Detail Modal */}
      <AnimatePresence>
        {showModal && selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}
            >
              {/* Modal Header */}
              <div className="relative">
                <img
                  src={selectedLesson.thumbnail}
                  alt={selectedLesson.title}
                  className="w-full h-64 object-cover rounded-t-2xl"
                />
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70"
                >
                  <X size={24} />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(selectedLesson.difficulty)}`}>
                    {selectedLesson.difficulty}
                  </span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <h2 className={`text-3xl font-bold mb-4 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedLesson.title}
                </h2>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <User size={20} className="text-gray-500" />
                    <span className={`${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedLesson.teacher}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={20} className="text-gray-500" />
                    <span className={`${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedLesson.duration}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star size={20} className="text-yellow-500" />
                    <span className={`${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedLesson.rating}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Description
                  </h3>
                  <p className={`${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                    {selectedLesson.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-2 flex items-center space-x-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Brain className="text-purple-600" size={20} />
                    <span>AI Summary</span>
                  </h3>
                  <p className={`${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} italic bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 p-4 rounded-lg`}>
                    {selectedLesson.aiSummary}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-3 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartLesson(selectedLesson.id)}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <Play size={20} />
                    <span>{isTeacher ? 'View Lesson' : 'Start Learning'}</span>
                  </motion.button>
                  {isTeacher && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditLesson(selectedLesson.id)}
                      className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900"
                    >
                      Edit Lesson
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 max-w-md w-full`}
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="text-red-600 dark:text-red-300" size={32} />
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Delete Lesson?
                </h3>
                <p className={`mb-6 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  This action cannot be undone. The lesson will be permanently deleted.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(deleteConfirm)}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllLessons;
