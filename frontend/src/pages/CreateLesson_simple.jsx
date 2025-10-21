import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  ArrowLeft,
  Save,
  Upload,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';
import { useThemeStore } from '../utils/store';

const CreateLesson = () => {
  const navigate = useNavigate();
  const { theme: currentTheme } = useThemeStore();

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    tags: [],
    lessonType: 'theory'
  });

  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.subject) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Lesson created successfully!');
    navigate('/teacher/dashboard');
  };

  return (
    <div className={`min-h-screen ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50'}`}>
      {/* Top Navigation */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className={`flex items-center space-x-2 ${currentTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <BookOpen className="text-indigo-600" size={24} />
                <div>
                  <h1 className={`text-xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Create New Lesson
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Lesson Details
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    currentTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Enter lesson title"
                />
              </div>

              {/* Subject */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    currentTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-indigo-500`}
                  placeholder="e.g. Mathematics, Physics"
                />
              </div>

              {/* Tags */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tags
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      currentTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-indigo-500`}
                    placeholder="Add a tag"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    currentTheme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Describe the lesson content..."
                />
              </div>

              {/* Lesson Type */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Lesson Type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['theory', 'video', 'interactive'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData(prev => ({ ...prev, lessonType: type }))}
                      className={`p-4 rounded-lg border-2 ${
                        formData.lessonType === type
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => navigate('/teacher/dashboard')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <CheckCircle size={20} />
                  <span>Create Lesson</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateLesson;
