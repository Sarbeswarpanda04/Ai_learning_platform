import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Brain, 
  Wifi, 
  WifiOff, 
  BarChart3, 
  Shield, 
  BookOpen, 
  Target, 
  Zap,
  CheckCircle,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  Star,
  Users,
  TrendingUp,
  Award,
  UserCircle
} from 'lucide-react';
import { useThemeStore } from '../utils/store';
import ParentLoginModal from '../components/ParentLoginModal';

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [parentModalOpen, setParentModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI Personalization",
      description: "Tracks progress and adapts content to your unique learning style",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: WifiOff,
      title: "Offline Learning Mode",
      description: "Works seamlessly even with low or no connectivity",
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: BarChart3,
      title: "Real-time Feedback",
      description: "Smart dashboards provide instant insights into your progress",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Secured by Flask backend and encrypted storage",
      color: "from-green-500 to-emerald-600"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Assess",
      description: "AI analyzes your learning pace and identifies knowledge gaps",
      icon: Target
    },
    {
      number: "02",
      title: "Adapt",
      description: "System curates personalized exercises matching your skill level",
      icon: Zap
    },
    {
      number: "03",
      title: "Advance",
      description: "Improve continuously with real-time feedback and support",
      icon: TrendingUp
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Engineering Student",
      content: "I improved my understanding of circuits in just two weeks! The AI recommendations were spot-on.",
      avatar: "PS",
      rating: 5
    },
    {
      name: "Rahul Kumar",
      role: "Rural School Teacher",
      content: "Even with slow internet, EduAI keeps my students learning. The offline mode is a game-changer.",
      avatar: "RK",
      rating: 5
    },
    {
      name: "Anjali Patel",
      role: "Computer Science Student",
      content: "The personalized learning path helped me master Python in record time. Highly recommended!",
      avatar: "AP",
      rating: 5
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Learners" },
    { value: "95%", label: "Success Rate" },
    { value: "50+", label: "Courses" },
    { value: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Offline Banner */}
      {!isOnline && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 bg-yellow-500 text-white py-2 px-4 text-center z-50 shadow-lg"
        >
          <WifiOff className="inline-block mr-2" size={20} />
          You're offline - but learning continues!
        </motion.div>
      )}

      {/* Header / Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm z-40"
        style={{ marginTop: !isOnline ? '40px' : '0' }}
      >
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                EduAI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                How It Works
              </a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Testimonials
              </a>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              <button
                onClick={() => setParentModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-all duration-300"
              >
                <UserCircle className="w-5 h-5" />
                <span className="font-medium">Parent Login</span>
              </button>

              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Login
              </Link>
              
              <Link
                to="/signup"
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden mt-4 pb-4 space-y-4"
            >
              <a href="#features" className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600">
                Features
              </a>
              <a href="#how-it-works" className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600">
                How It Works
              </a>
              <a href="#testimonials" className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600">
                Testimonials
              </a>
              <button
                onClick={() => {
                  setParentModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition"
              >
                <UserCircle className="w-5 h-5" />
                <span>Parent Login</span>
              </button>
              <Link to="/login" className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600">
                Login
              </Link>
              <Link
                to="/signup"
                className="block px-6 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-full text-center"
              >
                Get Started Free
              </Link>
            </motion.div>
          )}
        </nav>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30"
          />
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ duration: 7, repeat: Infinity }}
            className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 dark:bg-cyan-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30"
          />
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              x: [0, 20, 0]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30"
          />
        </div>

        <motion.div 
          style={{ opacity, scale }}
          className="container mx-auto px-6 relative z-10"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-semibold mb-4">
                  🚀 AI-Powered Learning Platform
                </span>
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
              >
                Empowering Every Learner with{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  AI-Driven Personalized Education
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-xl text-gray-600 dark:text-gray-300"
              >
                Adaptive learning for all — online or offline, on any device. 
                Bridge the urban-rural education gap with intelligent, personalized content.
              </motion.p>

              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/signup"
                  className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#features"
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-full font-semibold hover:border-indigo-600 dark:hover:border-indigo-400 hover:scale-105 transition-all duration-300"
                >
                  Learn More
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div 
                variants={fadeInUp}
                className="grid grid-cols-4 gap-4 pt-8"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side - Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative"
              >
                {/* Main Illustration Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 backdrop-blur-lg">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">AI Learning Assistant</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Analyzing your progress...</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Python Basics</span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">92%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Data Structures</span>
                        <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">68%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Algorithms</span>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">45%</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                        <Zap className="w-5 h-5" />
                        <span className="text-sm font-semibold">Next: Sorting Algorithms</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Icons */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center"
                >
                  <Award className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-lg flex items-center justify-center"
                >
                  <BookOpen className="w-8 h-8 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Effective Learning
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to personalize education and bridge the learning gap
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="group relative"
              >
                <div className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 to-cyan-500/0 group-hover:from-indigo-600/5 group-hover:to-cyan-500/5 rounded-2xl transition-all duration-300" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three simple steps to transform your learning experience
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative mb-12 last:mb-0"
              >
                <div className="flex items-center gap-8">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-white">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center flex-shrink-0">
                        <step.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-12 top-24 w-0.5 h-12 bg-gradient-to-b from-indigo-600 to-cyan-500" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Learners
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See what students and teachers are saying about EduAI
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute inset-0 opacity-10"
        >
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
        </motion.div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Personalize Your Learning Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of learners already using AI-powered education
            </p>

            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-indigo-600 rounded-full font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all duration-300"
            >
              Start Now — It's Free!
              <ChevronRight />
            </Link>

            <p className="mt-6 text-sm opacity-75">
              No credit card required. Works offline too. 🚀
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-8 h-8 text-indigo-400" />
                <span className="text-xl font-bold text-white">EduAI</span>
              </div>
              <p className="text-sm text-gray-400">
                Bridging Urban-Rural Education Gaps with AI-Powered Personalized Learning
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-indigo-400 transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-indigo-400 transition">How It Works</a></li>
                <li><Link to="/signup" className="hover:text-indigo-400 transition">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-indigo-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <div className="flex gap-4">
                <motion.a
                  whileHover={{ scale: 1.2, y: -2 }}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition"
                >
                  <Users className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.2, y: -2 }}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition"
                >
                  <Users className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.2, y: -2 }}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition"
                >
                  <Users className="w-5 h-5" />
                </motion.a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 EduAI — Bridging Urban-Rural Education Gaps with AI</p>
            <p className="mt-2 text-gray-500">
              Built for BPUT Hackathon | Made with ❤️ in India
            </p>
          </div>
        </div>
      </footer>

      {/* Parent Login Modal */}
      <ParentLoginModal 
        isOpen={parentModalOpen} 
        onClose={() => setParentModalOpen(false)} 
      />
    </div>
  );
};

export default LandingPage;
