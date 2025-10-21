import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import { useThemeStore } from '../utils/store';

const Analytics = () => {
  const { theme: currentTheme } = useThemeStore();

  // Mock data for analytics
  const completionTrend = [
    { month: 'Jan', completed: 65 },
    { month: 'Feb', completed: 72 },
    { month: 'Mar', completed: 68 },
    { month: 'Apr', completed: 85 },
    { month: 'May', completed: 90 },
    { month: 'Jun', completed: 95 }
  ];

  const scoresBySubject = [
    { subject: 'Math', avgScore: 85 },
    { subject: 'Physics', avgScore: 78 },
    { subject: 'Chemistry', avgScore: 82 },
    { subject: 'Biology', avgScore: 88 },
    { subject: 'English', avgScore: 92 }
  ];

  const attendanceData = [
    { name: 'Present', value: 85, color: '#10b981' },
    { name: 'Absent', value: 10, color: '#ef4444' },
    { name: 'Late', value: 5, color: '#f59e0b' }
  ];

  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users, color: 'blue', trend: '+12%' },
    { title: 'Active Courses', value: '28', icon: BookOpen, color: 'green', trend: '+5%' },
    { title: 'Avg Completion', value: '87%', icon: TrendingUp, color: 'purple', trend: '+8%' },
    { title: 'Avg Score', value: '85%', icon: Award, color: 'orange', trend: '+3%' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`${
              currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-xl shadow-lg p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900 rounded-lg`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
              <span className="text-green-600 text-sm font-semibold">{stat.trend}</span>
            </div>
            <h3 className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {stat.value}
            </h3>
            <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {stat.title}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Completion Trend */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}
        >
          <h3 className={`text-lg font-bold mb-4 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Course Completion Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={completionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'dark' ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="month" stroke={currentTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={currentTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Average Scores by Subject */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}
        >
          <h3 className={`text-lg font-bold mb-4 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Average Scores by Subject
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoresBySubject}>
              <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'dark' ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="subject" stroke={currentTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={currentTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="avgScore" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Attendance Distribution */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}
        >
          <h3 className={`text-lg font-bold mb-4 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Attendance Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {attendanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}
        >
          <h3 className={`text-lg font-bold mb-4 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { action: 'New student enrolled', course: 'Advanced Physics', time: '2 hours ago' },
              { action: 'Assignment submitted', course: 'Calculus I', time: '5 hours ago' },
              { action: 'Quiz completed', course: 'Organic Chemistry', time: '1 day ago' },
              { action: 'New course created', course: 'Machine Learning', time: '2 days ago' }
            ].map((activity, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <p className={`font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {activity.action}
                </p>
                <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {activity.course}
                </p>
                <p className={`text-xs ${currentTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  {activity.time}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
