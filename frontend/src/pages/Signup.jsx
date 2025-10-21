import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  BookOpen,
  Shield,
  Sparkles,
  GraduationCap,
  UserCircle,
  Building2,
  ArrowRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../utils/store';

// Signup component - Direct registration without OTP
const Signup = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    preferredSubject: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailChecking, setEmailChecking] = useState(false);

  const subjects = [
    'Programming',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Electronics',
    'Data Science',
    'Web Development',
    'Artificial Intelligence',
    'Machine Learning',
    'Digital Marketing'
  ];

  const userTypes = [
    { value: 'student', label: 'Student', icon: GraduationCap, emoji: '👨‍🎓' },
    { value: 'teacher', label: 'Teacher', icon: UserCircle, emoji: '👩‍🏫' },
    { value: 'admin', label: 'Institution', icon: Building2, emoji: '🏫' }
  ];

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Check email availability
  const checkEmailAvailability = async (email) => {
    if (!validateEmail(email)) return;
    
    setEmailChecking(true);
    try {
      const response = await api.get(`/api/auth/check-email?email=${email}`);
      if (response.data.success) {
        if (!response.data.data.available) {
          setErrors(prev => ({ ...prev, email: 'Email already registered' }));
        } else {
          setErrors(prev => ({ ...prev, email: '' }));
        }
      }
    } catch (error) {
      // Clear any existing email error if check fails
      setErrors(prev => ({ ...prev, email: '' }));
      console.log('Email check skipped:', error.message);
    } finally {
      setEmailChecking(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select user type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        preferred_subject: formData.preferredSubject
      });

      if (response.data.success) {
        toast.success('Account created successfully! 🎉');
        
        // Store auth tokens and user data
        const { user, profile, access_token, refresh_token } = response.data.data;
        
        // Update auth store (this will also update localStorage)
        setAuth(user, profile, access_token, refresh_token);
        
        // Redirect to appropriate dashboard based on role
        setTimeout(() => {
          if (user.role === 'student') {
            navigate('/dashboard');
          } else if (user.role === 'teacher') {
            navigate('/teacher/dashboard');
          } else {
            navigate('/admin/dashboard');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create account. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            x: [0, 20, 0],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            x: [0, -20, 0],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-20"
        />
        
        {/* Floating Icons */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-40 left-1/4 text-white opacity-10"
        >
          <BookOpen size={80} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute bottom-40 right-1/4 text-white opacity-10"
        >
          <Sparkles size={60} />
        </motion.div>
      </div>

      {/* Mini Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 container mx-auto px-6 py-6"
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            <span className="text-2xl font-bold text-white">EduAI</span>
          </Link>

          <Link
            to="/login"
            className="text-white hover:text-white/80 transition flex items-center gap-2"
          >
            Already have an account? <span className="font-semibold">Login</span>
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Section - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">AI-Powered Learning</h3>
                      <p className="text-white/80">Personalized for everyone</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { icon: CheckCircle2, text: 'Adaptive learning paths', color: 'from-green-400 to-emerald-500' },
                      { icon: CheckCircle2, text: 'Real-time progress tracking', color: 'from-blue-400 to-cyan-500' },
                      { icon: CheckCircle2, text: 'Works offline seamlessly', color: 'from-purple-400 to-pink-500' },
                      { icon: CheckCircle2, text: 'Expert teacher support', color: 'from-orange-400 to-red-500' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 + 0.5 }}
                        className="flex items-center gap-3 text-white"
                      >
                        <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <item.icon size={16} />
                        </div>
                        <span className="text-lg">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/20">
                    <div className="flex items-center justify-around text-center">
                      <div>
                        <div className="text-3xl font-bold text-white">10K+</div>
                        <div className="text-white/60 text-sm">Active Learners</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">95%</div>
                        <div className="text-white/60 text-sm">Success Rate</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">50+</div>
                        <div className="text-white/60 text-sm">Courses</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-xl font-bold"
              >
                🎉 Join Free Today!
              </motion.div>
            </div>
          </motion.div>

          {/* Right Section - Signup Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Form Header */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Create Your Free Account 🚀
                  </h1>
                  <p className="text-gray-600">
                    Join EduAI and start learning smarter with personalized insights
                  </p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                          errors.name ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-500"
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={(e) => checkEmailAvailability(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                          errors.email ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {emailChecking && (
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                          <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-500"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                          errors.password ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-500"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="Re-enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-500"
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* User Type */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      I am a
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {userTypes.map((type) => (
                        <motion.button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, role: type.value }))}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            formData.role === type.value
                              ? 'border-indigo-600 bg-indigo-50 shadow-lg'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="text-3xl mb-2">{type.emoji}</div>
                          <div className="text-sm font-medium text-gray-900">{type.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Preferred Subject */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Subject (Optional)
                    </label>
                    <select
                      name="preferredSubject"
                      value={formData.preferredSubject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants}>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Sign Up & Start Learning
                          <ArrowRight size={20} />
                        </>
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Security Note */}
                  <motion.div variants={itemVariants} className="text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Shield size={16} />
                      <span>Your data is securely encrypted and never shared</span>
                    </div>
                  </motion.div>
                </form>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-8 text-white/80 text-sm"
            >
              © 2025 EduAI — Learn. Adapt. Succeed.
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
