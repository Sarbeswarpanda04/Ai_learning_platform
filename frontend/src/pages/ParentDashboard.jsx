import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  LogOut,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  Target,
  Calendar,
  BarChart3,
  Activity,
  CheckCircle,
  AlertCircle,
  Brain
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parentSession, setParentSession] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem('parentSession');
    if (!session) {
      toast.error('Please login as parent first');
      navigate('/');
      return;
    }

    const sessionData = JSON.parse(session);
    setParentSession(sessionData);
    fetchStudentData(sessionData.studentId);
  }, [navigate]);

  const fetchStudentData = async (studentId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/parent/student/${studentId}/dashboard`);
      
      setStudentData(response.data.student);
      setStats(response.data.stats);
      setRecentActivity(response.data.recentActivity || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('parentSession');
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Parent Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitoring: {parentSession?.studentName}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Lessons Completed"
            value={stats?.lessonsCompleted || 0}
            total={stats?.totalLessons || 0}
            color="from-blue-500 to-cyan-600"
          />
          <StatCard
            icon={Award}
            title="Average Score"
            value={`${stats?.averageScore || 0}%`}
            subtitle="Overall Performance"
            color="from-purple-500 to-pink-600"
          />
          <StatCard
            icon={Clock}
            title="Study Time"
            value={`${stats?.studyHours || 0}h`}
            subtitle="This Week"
            color="from-orange-500 to-red-600"
          />
          <StatCard
            icon={TrendingUp}
            title="Progress Trend"
            value={stats?.progressTrend || '+0%'}
            subtitle="vs Last Week"
            color="from-green-500 to-emerald-600"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Performance & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                  Performance Overview
                </h2>
              </div>

              {/* Subject Performance */}
              <div className="space-y-4">
                {stats?.subjectPerformance?.map((subject, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {subject.name}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {subject.score}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.score}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full bg-gradient-to-r ${subject.color || 'from-indigo-500 to-purple-600'}`}
                      />
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-gray-500 py-8">No performance data available</p>
                )}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <Activity className="w-6 h-6 text-indigo-600" />
                Recent Activity
              </h2>

              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className={`p-2 rounded-lg ${activity.type === 'completed' ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                        {activity.type === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No recent activity</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Student Info & Goals */}
          <div className="space-y-6">
            {/* Student Profile */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {studentData?.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{studentData?.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{studentData?.email}</p>
              </div>

              <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                <InfoRow label="Branch" value={studentData?.branch || 'N/A'} />
                <InfoRow label="Semester" value={studentData?.semester || 'N/A'} />
                <InfoRow label="Roll Number" value={studentData?.rollNumber || 'N/A'} />
                <InfoRow label="Joined" value={studentData?.joinedDate || 'N/A'} />
              </div>
            </motion.div>

            {/* Learning Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-indigo-600" />
                Learning Goals
              </h3>

              <div className="space-y-3">
                {stats?.goals?.map((goal, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {goal.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{goal.title}</span>
                  </div>
                )) || (
                  <p className="text-center text-gray-500 py-4">No goals set</p>
                )}
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
            >
              <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5" />
                AI Insights
              </h3>
              <p className="text-sm text-indigo-100">
                {stats?.aiInsight || 'Your child is making steady progress! Keep encouraging regular study habits.'}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, total, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
      {value}{total ? `/${total}` : ''}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
    {subtitle && (
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
    )}
  </motion.div>
);

// Info Row Component
const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
  </div>
);

export default ParentDashboard;
