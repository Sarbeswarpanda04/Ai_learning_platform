import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  Video,
  Upload,
  FileText,
  Tag,
  Calendar,
  Eye,
  Save,
  Sparkles,
  Plus,
  X,
  CheckCircle,
  Clock,
  Globe,
  Lock,
  FileEdit,
  ArrowLeft,
  Loader,
  Youtube,
  Link as LinkIcon,
  Brain,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthStore, useThemeStore } from '../utils/store';
import { lessonAPI, quizAPI } from '../utils/api';
import api from '../utils/api';

const CreateLesson = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theme: currentTheme } = useThemeStore();

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    courseId: '',
    subject: '',
    tags: [],
    lessonType: 'theory',
    description: '',
    videoLink: '',
    visibility: 'draft',
    scheduledDate: '',
    estimatedTime: 0
  });

  const [tagInput, setTagInput] = useState('');
  const [courses, setCourses] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showQuizSection, setShowQuizSection] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch teacher's courses on mount
  useEffect(() => {
    fetchCourses();
    // Auto-save draft every 30 seconds
    const autoSaveInterval = setInterval(() => {
      if (formData.title) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  const fetchCourses = async () => {
    try {
      const response = await lessonAPI.getLessons({ teacher: true });
      // Extract unique courses from lessons
      const uniqueCourses = [...new Set(response.data.data?.map(lesson => lesson.subject))];
      setCourses(uniqueCourses.map((subject, idx) => ({ id: idx + 1, name: subject })));
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Use mock data for MVP
      setCourses([
        { id: 1, name: 'C Programming' },
        { id: 2, name: 'Python Basics' },
        { id: 3, name: 'Data Structures' },
        { id: 4, name: 'Web Development' },
        { id: 5, name: 'AI & Machine Learning' }
      ]);
    }
  };

  const saveDraft = () => {
    localStorage.setItem('lesson-draft', JSON.stringify(formData));
    toast.success('Draft saved!', { icon: '💾' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size should not exceed 50MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, PPT, and DOC files are allowed');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      // Simulate upload progress for MVP (replace with actual API call)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Mock API call (replace with actual upload endpoint)
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setUploadedFile({
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          type: file.type,
          url: URL.createObjectURL(file)
        });
        toast.success('File uploaded successfully!');
        setIsUploading(false);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload({ target: { files: [file] } });
    }
  };

  const generateAISummary = async () => {
    if (!formData.description) {
      toast.error('Please add lesson description first');
      return;
    }

    setIsGeneratingSummary(true);
    try {
      // Mock AI summary generation (replace with actual API)
      setTimeout(() => {
        const mockSummary = `This lesson covers the fundamental concepts of ${formData.subject || 'the topic'}, providing students with a comprehensive understanding of key principles. Through practical examples and interactive content, learners will develop essential skills and knowledge applicable to real-world scenarios.`;
        setAiSummary(mockSummary);
        toast.success('AI Summary generated!', { icon: '🤖' });
        setIsGeneratingSummary(false);
      }, 2000);

    } catch (error) {
      console.error('AI Summary error:', error);
      toast.error('Failed to generate summary');
      setIsGeneratingSummary(false);
    }
  };

  const addQuizQuestion = () => {
    setQuizQuestions([...quizQuestions, {
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }]);
  };

  const updateQuizQuestion = (id, field, value) => {
    setQuizQuestions(quizQuestions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateQuizOption = (questionId, optionIndex, value) => {
    setQuizQuestions(quizQuestions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeQuizQuestion = (id) => {
    setQuizQuestions(quizQuestions.filter(q => q.id !== id));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Lesson title is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Lesson description is required';
    }

    if (formData.lessonType === 'video' && !formData.videoLink && !uploadedFile) {
      newErrors.content = 'Please provide video link or upload a file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsPublishing(true);

    try {
      const lessonData = {
        ...formData,
        content: formData.description,
        file: uploadedFile,
        aiSummary,
        quizzes: quizQuestions.filter(q => q.question.trim()),
        createdBy: user.id,
        createdAt: new Date().toISOString()
      };

      // Mock API call (replace with actual endpoint)
      setTimeout(() => {
        console.log('Publishing lesson:', lessonData);
        setIsPublishing(false);
        setShowSuccessModal(true);
        
        // Clear draft
        localStorage.removeItem('lesson-draft');
        
        toast.success('Lesson published successfully!', { icon: '🎉' });
      }, 2000);

    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish lesson');
      setIsPublishing(false);
    }
  };

  const estimatedReadingTime = Math.ceil(formData.description.split(' ').length / 200);

  return (
    <div className={`min-h-screen ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50'}`}>
      {/* Top Navigation Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/teacher/dashboard')}
                className={`flex items-center space-x-2 ${currentTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-indigo-600"
                >
                  <BookOpen size={24} />
                </motion.div>
                <div>
                  <h1 className={`text-xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Create New Lesson
                  </h1>
                  <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Dashboard / My Courses / Create Lesson
                  </p>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={saveDraft}
                className={`p-2 rounded-lg ${currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <Save size={20} className="text-indigo-600" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded-lg ${currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} lg:hidden`}
              >
                <Eye size={20} className="text-indigo-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form Area - Left Side (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* A. Lesson Details Section */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <FileEdit className="text-indigo-600" size={24} />
                  </div>
                  <h2 className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Lesson Details
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Lesson Title */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Lesson Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter the lesson title, e.g., Introduction to Python"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        errors.title 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-300 focus:border-indigo-500'
                      } ${currentTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    />
                    {errors.title && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1 flex items-center space-x-1"
                      >
                        <AlertCircle size={14} />
                        <span>{errors.title}</span>
                      </motion.p>
                    )}
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
                      placeholder="e.g., Programming, Mathematics, Science"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        errors.subject 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-300 focus:border-indigo-500'
                      } ${currentTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    />
                    {errors.subject && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1 flex items-center space-x-1"
                      >
                        <AlertCircle size={14} />
                        <span>{errors.subject}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tags
                    </label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tags like #Loops, #Functions (press Enter)"
                      className={`w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 ${currentTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      <AnimatePresence>
                        {formData.tags.map((tag, index) => (
                          <motion.span
                            key={tag}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm"
                          >
                            <Tag size={14} />
                            <span>{tag}</span>
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:bg-white/20 rounded-full p-0.5"
                            >
                              <X size={14} />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Lesson Type */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Lesson Type
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'theory', icon: Brain, label: 'Theory' },
                        { value: 'video', icon: PlayCircle, label: 'Video' },
                        { value: 'interactive', icon: Sparkles, label: 'Interactive' }
                      ].map((type) => (
                        <motion.button
                          key={type.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData(prev => ({ ...prev, lessonType: type.value }))}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.lessonType === type.value
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                              : 'border-gray-300 hover:border-indigo-300'
                          }`}
                        >
                          <type.icon className={`mx-auto mb-2 ${formData.lessonType === type.value ? 'text-indigo-600' : 'text-gray-400'}`} size={24} />
                          <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {type.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* B. Lesson Content Section */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <FileText className="text-purple-600" size={24} />
                  </div>
                  <h2 className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Lesson Content
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Lesson Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="8"
                      placeholder="Write your lesson content here... You can use Markdown formatting."
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        errors.description 
                          ? 'border-red-500 focus:border-red-600' 
                          : 'border-gray-300 focus:border-indigo-500'
                      } ${currentTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'} font-mono text-sm`}
                    />
                    {errors.description && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1 flex items-center space-x-1"
                      >
                        <AlertCircle size={14} />
                        <span>{errors.description}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* AI Summary Generator */}
                  <div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={generateAISummary}
                      disabled={isGeneratingSummary}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {isGeneratingSummary ? (
                        <>
                          <Loader className="animate-spin" size={20} />
                          <span>Generating AI Summary...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          <span>Generate Summary using AI</span>
                        </>
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {aiSummary && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`mt-4 p-4 rounded-lg border-2 border-purple-300 ${currentTheme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'}`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="text-purple-600" size={18} />
                            <span className={`font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              AI Generated Summary
                            </span>
                          </div>
                          <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {aiSummary}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Upload Lesson File (PDF / PPT / DOC)
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
                        isDragging
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.ppt,.pptx,.doc,.docx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      
                      {uploadedFile ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-center"
                        >
                          <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
                          <p className={`font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {uploadedFile.name}
                          </p>
                          <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {uploadedFile.size}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedFile(null);
                              setUploadProgress(0);
                            }}
                            className="mt-3 text-red-500 hover:text-red-600 text-sm font-medium"
                          >
                            Remove file
                          </button>
                        </motion.div>
                      ) : isUploading ? (
                        <div className="text-center">
                          <Loader className="mx-auto animate-spin text-indigo-600 mb-3" size={48} />
                          <p className={`font-medium mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Uploading... {uploadProgress}%
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                          <p className={`font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Drag & drop your file here
                          </p>
                          <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                            or click to browse (Max 50MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Link */}
                  {formData.lessonType === 'video' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Embed Video Link (Optional)
                      </label>
                      <div className="relative">
                        <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="url"
                          name="videoLink"
                          value={formData.videoLink}
                          onChange={handleInputChange}
                          placeholder="https://youtube.com/watch?v=..."
                          className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 ${currentTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* C. Add Quiz Section */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Brain className="text-green-600" size={24} />
                    </div>
                    <h2 className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Add Quiz (Optional)
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowQuizSection(!showQuizSection)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {showQuizSection ? 'Hide' : 'Show'}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showQuizSection && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {quizQuestions.map((question, qIndex) => (
                        <motion.div
                          key={question.id}
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className={`p-4 rounded-lg border-2 border-gray-300 ${currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className={`font-medium ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              Question {qIndex + 1}
                            </span>
                            <button
                              onClick={() => removeQuizQuestion(question.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X size={20} />
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => updateQuizQuestion(question.id, 'question', e.target.value)}
                            placeholder="Enter your question"
                            className={`w-full px-4 py-2 rounded-lg border border-gray-300 mb-3 ${currentTheme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white'}`}
                          />

                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === oIndex}
                                  onChange={() => updateQuizQuestion(question.id, 'correctAnswer', oIndex)}
                                  className="text-indigo-600"
                                />
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateQuizOption(question.id, oIndex, e.target.value)}
                                  placeholder={`Option ${oIndex + 1}`}
                                  className={`flex-1 px-4 py-2 rounded-lg border border-gray-300 ${currentTheme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white'}`}
                                />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addQuizQuestion}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-indigo-400 text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                      >
                        <Plus size={20} />
                        <span>Add Another Question</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* D. Schedule & Publish Section */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                    <Calendar className="text-cyan-600" size={24} />
                  </div>
                  <h2 className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Schedule & Publish
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Visibility Toggle */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Visibility
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'public', icon: Globe, label: 'Public', color: 'green' },
                        { value: 'private', icon: Lock, label: 'Private', color: 'yellow' },
                        { value: 'draft', icon: FileEdit, label: 'Draft', color: 'gray' }
                      ].map((vis) => (
                        <motion.button
                          key={vis.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData(prev => ({ ...prev, visibility: vis.value }))}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.visibility === vis.value
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <vis.icon className={`mx-auto mb-1 ${formData.visibility === vis.value ? 'text-indigo-600' : 'text-gray-400'}`} size={20} />
                          <span className={`text-sm font-medium ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {vis.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Schedule Date */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Schedule Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 ${currentTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    />
                  </div>

                  {/* Publish Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 relative overflow-hidden group"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                      className="absolute inset-0 bg-white/20 blur-xl"
                    />
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {isPublishing ? (
                        <>
                          <Loader className="animate-spin" size={24} />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={24} />
                          <span>Publish Lesson</span>
                        </>
                      )}
                    </span>
                  </motion.button>
                </div>
              </motion.div>
              
            </div>

            {/* Side Preview Panel - Right Side (1/3) */}
            <AnimatePresence>
              {(showPreview || window.innerWidth >= 1024) && (
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 50, opacity: 0 }}
                  className="lg:col-span-1"
                >
                  <div className={`sticky top-24 ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 max-h-[calc(100vh-120px)] overflow-y-auto`}>
                    <div className="flex items-center space-x-3 mb-6">
                      <Eye className="text-indigo-600" size={24} />
                      <h3 className={`text-xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Live Preview
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Title Preview */}
                      {formData.title && (
                        <div>
                          <h4 className={`text-2xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                            {formData.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock size={16} />
                            <span>{estimatedReadingTime} min read</span>
                          </div>
                        </div>
                      )}

                      {/* Tags Preview */}
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Description Preview */}
                      {formData.description && (
                        <div>
                          <h5 className={`font-semibold mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Description
                          </h5>
                          <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} whitespace-pre-wrap`}>
                            {formData.description.substring(0, 300)}
                            {formData.description.length > 300 && '...'}
                          </p>
                        </div>
                      )}

                      {/* AI Summary Preview */}
                      {aiSummary && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h5 className={`font-semibold mb-2 flex items-center space-x-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <Sparkles size={16} className="text-purple-600" />
                            <span>AI Summary</span>
                          </h5>
                          <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {aiSummary}
                          </p>
                        </div>
                      )}

                      {/* File Preview */}
                      {uploadedFile && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <h5 className={`font-semibold mb-2 flex items-center space-x-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <FileText size={16} className="text-green-600" />
                            <span>Attached File</span>
                          </h5>
                          <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{uploadedFile.size}</p>
                        </div>
                      )}

                      {/* Video Link Preview */}
                      {formData.videoLink && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <h5 className={`font-semibold mb-2 flex items-center space-x-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <Video size={16} className="text-red-600" />
                            <span>Video Link</span>
                          </h5>
                          <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} truncate`}>
                            {formData.videoLink}
                          </p>
                        </div>
                      )}

                      {/* Quiz Preview */}
                      {quizQuestions.length > 0 && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h5 className={`font-semibold mb-2 flex items-center space-x-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            <Brain size={16} className="text-blue-600" />
                            <span>Quiz Questions</span>
                          </h5>
                          <p className={`text-sm ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {quizQuestions.filter(q => q.question.trim()).length} questions added
                          </p>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            formData.visibility === 'public' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : formData.visibility === 'private'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {formData.visibility.charAt(0).toUpperCase() + formData.visibility.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-md w-full shadow-2xl`}
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.5 }}
                  className="inline-block mb-4"
                >
                  <CheckCircle className="text-green-500" size={64} />
                </motion.div>
                
                <h3 className={`text-2xl font-bold mb-2 ${currentTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  🎉 Success!
                </h3>
                <p className={`mb-6 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Your lesson has been successfully published!
                </p>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/teacher/dashboard')}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium"
                  >
                    Go to Dashboard
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowSuccessModal(false);
                      // Reset form
                      setFormData({
                        title: '',
                        courseId: '',
                        subject: '',
                        tags: [],
                        lessonType: 'theory',
                        description: '',
                        videoLink: '',
                        visibility: 'draft',
                        scheduledDate: '',
                        estimatedTime: 0
                      });
                      setUploadedFile(null);
                      setAiSummary('');
                      setQuizQuestions([]);
                    }}
                    className="flex-1 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium"
                  >
                    Create Another
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateLesson;
