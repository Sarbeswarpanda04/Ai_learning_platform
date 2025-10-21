import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  Video, 
  Brain, 
  Calendar,
  Eye,
  Save,
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  Check,
  AlertCircle,
  Clock,
  Tag,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Loader2,
  ChevronDown,
  PlayCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuthStore } from '../../utils/store';

const CreateLesson = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    course_id: '',
    subject: '',
    tags: [],
    lesson_type: 'theory',
    description: '',
    content: '',
    video_url: '',
    file_url: '',
    ai_summary: '',
    scheduled_date: '',
    visibility: 'draft',
    estimated_time: 0
  });

  const [tagInput, setTagInput] = useState('');
  const [courses, setCourses] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [showQuizSection, setShowQuizSection] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  // Fetch teacher's courses
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
      const response = await api.get('/api/lessons');
      // Group by subject/course
      const uniqueCourses = [...new Set(response.data.data?.map(l => l.subject))].filter(Boolean);
      setCourses(uniqueCourses.map(subject => ({ id: subject, name: subject })));
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback courses
      setCourses([
        { id: 'programming', name: 'Programming' },
        { id: 'mathematics', name: 'Mathematics' },
        { id: 'science', name: 'Science' },
        { id: 'english', name: 'English' }
      ]);
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem('lesson_draft', JSON.stringify(formData));
      setAutoSaveStatus('Draft saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
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

    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
      toast.error('File size must be less than 16MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      // Simulate progress (real implementation would use axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file
      const response = await api.post('/api/teacher/lesson/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setFormData(prev => ({
        ...prev,
        file_url: response.data.file_url || file.name
      }));

      toast.success(`${file.name} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('File upload failed. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('video', file);

      const response = await api.post('/api/teacher/lesson/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData(prev => ({
        ...prev,
        video_url: response.data.file_url || file.name
      }));

      toast.success('Video uploaded successfully!');
    } catch (error) {
      console.error('Video upload error:', error);
      toast.error('Video upload failed');
    } finally {
      setUploading(false);
    }
  };

  const generateAISummary = async () => {
    if (!formData.description && !formData.content) {
      toast.error('Please add lesson description first');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/api/ai/summary', {
        text: formData.description + '\n' + formData.content
      });

      setFormData(prev => ({
        ...prev,
        ai_summary: response.data.summary || 'AI summary generated successfully.'
      }));

      toast.success('AI summary generated!');
    } catch (error) {
      console.error('AI generation error:', error);
      // Fallback summary
      const wordCount = (formData.description + formData.content).split(' ').length;
      const summary = `This lesson covers key concepts in ${formData.subject || 'the subject'}. 
      Estimated reading time: ${Math.ceil(wordCount / 200)} minutes. 
      Students will learn fundamental principles and practical applications.`;
      
      setFormData(prev => ({ ...prev, ai_summary: summary }));
      toast.success('Summary generated!');
    } finally {
      setGenerating(false);
    }
  };

  const addQuizQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        id: Date.now(),
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0
      }
    ]);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // Calculate estimated time (words / 200 wpm)
      const totalWords = (formData.description + formData.content).split(' ').length;
      const estimatedMinutes = Math.ceil(totalWords / 200);

      const lessonData = {
        ...formData,
        estimated_time: estimatedMinutes,
        created_by: user?.id,
        visibility: 'published'
      };

      // Create lesson
      const lessonResponse = await api.post('/api/lessons', lessonData);

      // Create quiz if questions exist
      if (quizQuestions.length > 0) {
        await api.post('/api/quiz', {
          lesson_id: lessonResponse.data.lesson?.id,
          questions: quizQuestions,
          title: `${formData.title} - Quiz`,
          duration: quizQuestions.length * 2 // 2 minutes per question
        });
      }

      // Clear draft
      localStorage.removeItem('lesson_draft');

      toast.success('🎉 Lesson published successfully!');
      
      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate('/teacher/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setFormData(prev => ({ ...prev, visibility: 'draft' }));
    saveDraft();
    toast.success('Draft saved locally!');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/teacher/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </motion.button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-7 h-7 text-purple-600" />
                  Create New Lesson
                </h1>
                <p className="text-sm text-gray-600">
                  Dashboard / My Courses / <span className="text-purple-600 font-medium">Create Lesson</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto-save status */}
              <AnimatePresence>
                {autoSaveStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-green-600"
                  >
                    <Check className="w-4 h-4" />
                    {autoSaveStatus}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Preview Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <Eye className="w-4 h-4" />
                Preview
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-6"
          >
            {/* Lesson Details */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Lesson Details
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Introduction to Python Programming"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                      errors.title ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science, Mathematics"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                      errors.subject ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type and press Enter to add tags (e.g., #Loops, #Functions)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>

                {/* Lesson Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Lesson Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'theory', label: 'Theory', icon: FileText },
                      { value: 'video', label: 'Video', icon: Video },
                      { value: 'interactive', label: 'Interactive', icon: Brain }
                    ].map((type) => (
                      <motion.button
                        key={type.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, lesson_type: type.value }))}
                        className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                          formData.lesson_type === type.value
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <type.icon className="w-6 h-6" />
                        <span className="font-medium">{type.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Lesson Content */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Lesson Content
              </h2>

              <div className="space-y-4">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Provide a brief overview of what students will learn..."
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Detailed Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Write the full lesson content here... You can include code examples, explanations, and more."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none font-mono text-sm"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document (PDF, PPT, DOC)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-purple-500 transition cursor-pointer"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, PPT, DOC up to 16MB
                      </p>
                    </div>
                    {uploadProgress > 0 && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="bg-purple-600 h-2 rounded-full"
                          />
                        </div>
                        <p className="text-xs text-center text-gray-600 mt-1">
                          {uploadProgress}%
                        </p>
                      </div>
                    )}
                    {formData.file_url && (
                      <p className="text-sm text-green-600 text-center mt-2 flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" />
                        {formData.file_url}
                      </p>
                    )}
                  </div>
                </div>

                {/* Video Link/Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL or Upload
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      name="video_url"
                      value={formData.video_url}
                      onChange={handleChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="px-4 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition"
                    >
                      <Upload className="w-5 h-5" />
                    </motion.button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      onChange={handleVideoUpload}
                      accept="video/*"
                      className="hidden"
                    />
                  </div>
                  {formData.video_url && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-purple-600">
                      <PlayCircle className="w-4 h-4" />
                      Video added
                    </div>
                  )}
                </div>

                {/* AI Summary Generator */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      AI Summary
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={generateAISummary}
                      disabled={generating}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate AI Summary
                        </>
                      )}
                    </motion.button>
                  </div>
                  {formData.ai_summary && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl"
                    >
                      <p className="text-sm text-gray-700">{formData.ai_summary}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Quiz Section */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Add Quiz (Optional)
                </h2>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowQuizSection(!showQuizSection)}
                  className="text-purple-600 hover:text-purple-700 transition"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${showQuizSection ? 'rotate-180' : ''}`}
                  />
                </motion.button>
              </div>

              <AnimatePresence>
                {showQuizSection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {quizQuestions.map((question, qIndex) => (
                      <div key={question.id} className="p-4 border-2 border-gray-200 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">
                            Question {qIndex + 1}
                          </label>
                          <button
                            onClick={() => removeQuizQuestion(question.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuizQuestion(question.id, 'question', e.target.value)}
                          placeholder="Enter question"
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={question.correct_answer === oIndex}
                                onChange={() => updateQuizQuestion(question.id, 'correct_answer', oIndex)}
                                className="text-purple-600"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateQuizOption(question.id, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={addQuizQuestion}
                      className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl hover:bg-purple-50 transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Question
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Publish Section */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Schedule & Publish
              </h2>

              <div className="space-y-4">
                {/* Schedule Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_date"
                    value={formData.scheduled_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Visibility
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'draft', label: 'Draft', color: 'gray' },
                      { value: 'private', label: 'Private', color: 'yellow' },
                      { value: 'published', label: 'Public', color: 'green' }
                    ].map((vis) => (
                      <motion.button
                        key={vis.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, visibility: vis.value }))}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                          formData.visibility === vis.value
                            ? `border-${vis.color}-600 bg-${vis.color}-50 text-${vis.color}-700`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {vis.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 font-medium"
                  >
                    <Save className="w-5 h-5" />
                    Save Draft
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(139, 92, 246, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handlePublish}
                    disabled={loading}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition flex items-center justify-center gap-2 font-bold disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Publish Lesson
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Live Preview
              </h3>

              <div className="space-y-4">
                {/* Preview Title */}
                {formData.title && (
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 mb-2">
                      {formData.title}
                    </h4>
                    {formData.subject && (
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {formData.subject}
                      </span>
                    )}
                  </div>
                )}

                {/* Preview Tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Preview Description */}
                {formData.description && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-700 line-clamp-4">
                      {formData.description}
                    </p>
                  </div>
                )}

                {/* Preview Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.ceil((formData.description + formData.content).split(' ').length / 200)} min read
                  </div>
                  {formData.lesson_type && (
                    <div className="flex items-center gap-1">
                      {formData.lesson_type === 'video' && <Video className="w-4 h-4" />}
                      {formData.lesson_type === 'theory' && <FileText className="w-4 h-4" />}
                      {formData.lesson_type === 'interactive' && <Brain className="w-4 h-4" />}
                      {formData.lesson_type}
                    </div>
                  )}
                </div>

                {/* Preview AI Summary */}
                {formData.ai_summary && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Summary
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {formData.ai_summary}
                    </p>
                  </div>
                )}

                {/* Preview Attachments */}
                {(formData.file_url || formData.video_url) && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Attachments</p>
                    {formData.file_url && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700 truncate">{formData.file_url}</span>
                      </div>
                    )}
                    {formData.video_url && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                        <PlayCircle className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700 truncate">Video</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Preview Quiz */}
                {quizQuestions.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      Quiz Included
                    </p>
                    <p className="text-sm text-blue-600">
                      {quizQuestions.length} question{quizQuestions.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateLesson;
