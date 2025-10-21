import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, ChevronDown, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ParentLoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [parentPin, setParentPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pinError, setPinError] = useState('');

  // Fetch all students
  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await api.get('/api/parent/students');
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setParentPin(value);
      setPinError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    if (parentPin.length !== 6) {
      setPinError('PIN must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/parent/login', {
        student_id: selectedStudent,
        parent_pin: parentPin
      });

      if (response.data.success) {
        // Store parent session
        localStorage.setItem('parentSession', JSON.stringify({
          studentId: selectedStudent,
          studentName: students.find(s => s.id === selectedStudent)?.name,
          timestamp: Date.now()
        }));

        toast.success('Login successful!');
        onClose();
        navigate('/parent/dashboard');
      }
    } catch (error) {
      console.error('Parent login error:', error);
      if (error.response?.status === 401) {
        setPinError('Invalid PIN. Please try again.');
        toast.error('Invalid PIN');
      } else if (error.response?.status === 404) {
        toast.error('Parent PIN not set for this student');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-full">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Parent Login</h2>
                    <p className="text-indigo-100 text-sm">Monitor your child's progress</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Student
                  </label>
                  
                  {loadingStudents ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No students registered yet</p>
                      <p className="text-sm mt-2">Students need to register first</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-700 dark:border-gray-600 text-left flex items-center justify-between transition ${
                          selectedStudent 
                            ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900' 
                            : 'border-gray-300 hover:border-indigo-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className={selectedStudent ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
                            {selectedStudentData?.name || 'Choose a student...'}
                          </span>
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto z-10"
                          >
                            {students.map((student) => (
                              <button
                                key={student.id}
                                type="button"
                                onClick={() => {
                                  setSelectedStudent(student.id);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-gray-600 transition flex items-center gap-3 ${
                                  selectedStudent === student.id ? 'bg-indigo-50 dark:bg-gray-600' : ''
                                }`}
                              >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                  {student.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Parent PIN */}
                {selectedStudent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Parent PIN (6 digits)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={parentPin}
                        onChange={handlePinChange}
                        placeholder="Enter 6-digit PIN"
                        maxLength={6}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition dark:bg-gray-700 dark:text-white ${
                          pinError 
                            ? 'border-red-500 focus:ring-red-200' 
                            : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900'
                        }`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    {pinError && (
                      <p className="mt-1 text-sm text-red-500">{pinError}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      PIN is set by the student from their dashboard
                    </p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading || !selectedStudent || parentPin.length !== 6 || students.length === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                    loading || !selectedStudent || parentPin.length !== 6 || students.length === 0
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    'Login as Parent'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ParentLoginModal;
