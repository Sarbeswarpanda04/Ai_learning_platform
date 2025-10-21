from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from database import db
from models import User, StudentProfile, Lesson
from datetime import datetime
import os

teacher_routes = Blueprint('teacher', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'ppt', 'pptx', 'doc', 'docx', 'mp4', 'avi', 'mov', 'wmv'}
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')

# Create upload folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@teacher_routes.route('/api/teacher/courses', methods=['GET'])
@jwt_required()
def get_teacher_courses():
    """Get all lessons created by the teacher (using lessons as courses)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get all lessons created by this teacher
        lessons = Lesson.query.filter_by(created_by=current_user_id).all()
        
        courses_data = [{
            'id': lesson.id,
            'title': lesson.title,
            'description': lesson.content[:100] if lesson.content else '',
            'subject': lesson.subject,
            'difficulty': lesson.difficulty,
            'createdAt': lesson.created_at.isoformat() if hasattr(lesson, 'created_at') else None
        } for lesson in lessons]
        
        return jsonify({'courses': courses_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_routes.route('/api/teacher/lessons/create', methods=['POST'])
@jwt_required()
def create_lesson():
    """Create a new lesson"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title') or not data.get('subject'):
            return jsonify({'error': 'Title and subject are required'}), 400
        
        # Create new lesson
        new_lesson = Lesson(
            title=data['title'],
            subject=data.get('subject'),
            content=data.get('description', ''),
            difficulty=data.get('lessonType', 'beginner'),
            created_by=current_user_id
        )
        
        db.session.add(new_lesson)
        db.session.commit()
        
        return jsonify({
            'message': 'Lesson created successfully',
            'lesson': {
                'id': new_lesson.id,
                'title': new_lesson.title,
                'subject': new_lesson.subject
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@teacher_routes.route('/api/teacher/lesson/upload', methods=['POST'])
@jwt_required()
def upload_lesson_file():
    """Upload lesson file (document or video)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Check if file is present in request
        if 'file' not in request.files and 'video' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files.get('file') or request.files.get('video')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to prevent conflicts
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            file.save(filepath)
            
            # Return file URL (in production, this would be a CDN URL)
            file_url = f"/uploads/{filename}"
            
            return jsonify({
                'success': True,
                'message': 'File uploaded successfully',
                'file_url': file_url,
                'filename': filename
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_routes.route('/api/ai/summary', methods=['POST'])
@jwt_required()
def generate_ai_summary():
    """Generate AI summary for lesson content"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Simple extractive summary (first 3 sentences)
        # In production, use NLP model or GPT API
        sentences = text.split('.')[:3]
        summary = '. '.join(s.strip() for s in sentences if s.strip()) + '.'
        
        # Add some intelligence to the summary
        word_count = len(text.split())
        estimated_time = max(1, word_count // 200)
        
        enhanced_summary = f"{summary}\n\n📚 Key Points:\n"
        enhanced_summary += f"• Estimated reading time: {estimated_time} minutes\n"
        enhanced_summary += f"• Content length: {word_count} words\n"
        enhanced_summary += "• Recommended for: All levels"
        
        return jsonify({
            'success': True,
            'summary': enhanced_summary,
            'metadata': {
                'word_count': word_count,
                'estimated_time': estimated_time,
                'sentences': len(text.split('.'))
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_routes.route('/api/teacher/courses', methods=['GET'])
@jwt_required()
def get_enrolled_students():
    """Get all students (simplified - returns all students in the system)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get all students
        students = User.query.filter_by(role='student').all()
        
        students_data = []
        for student in students:
            profile = StudentProfile.query.filter_by(user_id=student.id).first()
            
            students_data.append({
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'branch': profile.branch if profile else 'N/A',
                'semester': profile.semester if profile else 0,
                'averageScore': profile.average_score if profile else 0
            })
        
        return jsonify({'students': students_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_routes.route('/api/teacher/assignments', methods=['POST'])
@jwt_required()
def create_assignment():
    """Create a new assignment (simplified - returns success message)"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title') or not data.get('lessonId'):
            return jsonify({'error': 'Title and lessonId are required'}), 400
        
        # Verify the lesson exists and belongs to the teacher
        lesson = Lesson.query.get(data['lessonId'])
        if not lesson:
            return jsonify({'error': 'Lesson not found'}), 404
        
        if lesson.created_by != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # For now, just return success (Assignment model not implemented yet)
        return jsonify({
            'message': 'Assignment feature coming soon',
            'assignment': {
                'id': 1,
                'title': data['title'],
                'lessonId': data['lessonId']
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@teacher_routes.route('/api/teacher/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get real-time dashboard statistics for teacher"""
    try:
        current_user_id = get_jwt_identity()
        print(f"📊 Dashboard stats requested by user ID: {current_user_id}")
        
        user = User.query.get(current_user_id)
        
        if not user:
            print(f"❌ User not found: {current_user_id}")
            return jsonify({'error': 'User not found'}), 404
        
        if user.role not in ['teacher', 'admin']:
            print(f"❌ Unauthorized role: {user.role} for user {current_user_id}")
            return jsonify({'error': 'Unauthorized'}), 403
        
        print(f"✅ User verified: {user.name} ({user.role})")
        
        # Get teacher's lessons
        lessons = Lesson.query.filter_by(created_by=current_user_id).all()
        lesson_ids = [lesson.id for lesson in lessons]
        
        # Get total students enrolled in teacher's courses
        from models.lesson import LessonProgress
        enrolled_students = db.session.query(LessonProgress.user_id)\
            .filter(LessonProgress.lesson_id.in_(lesson_ids))\
            .distinct()\
            .count() if lesson_ids else 0
        
        # Get total active courses (published lessons)
        active_courses = Lesson.query.filter_by(
            created_by=current_user_id, 
            is_published=True
        ).count()
        
        # Get pending assignments (quizzes with recent attempts that need review)
        from models.quiz import Quiz, Attempt, QuizSession
        from datetime import timedelta
        
        # Count quiz sessions from last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        pending_assignments = QuizSession.query\
            .join(Lesson, QuizSession.lesson_id == Lesson.id)\
            .filter(
                Lesson.created_by == current_user_id,
                QuizSession.completed_at >= seven_days_ago
            )\
            .count()
        
        # Get new messages (mock for now - can integrate with actual message system)
        new_messages = 0  # TODO: Integrate with actual messaging system
        
        # Calculate trends (compare with previous period)
        fourteen_days_ago = datetime.utcnow() - timedelta(days=14)
        
        # Students trend
        prev_enrolled = db.session.query(LessonProgress.user_id)\
            .filter(
                LessonProgress.lesson_id.in_(lesson_ids),
                LessonProgress.started_at < seven_days_ago,
                LessonProgress.started_at >= fourteen_days_ago
            )\
            .distinct()\
            .count() if lesson_ids else 1
        
        students_trend = round(((enrolled_students - prev_enrolled) / max(prev_enrolled, 1)) * 100, 1) if prev_enrolled > 0 else 0
        
        # Courses trend (new courses in last 7 days)
        new_courses = Lesson.query.filter(
            Lesson.created_by == current_user_id,
            Lesson.created_at >= seven_days_ago
        ).count()
        courses_trend = f"+{new_courses}" if new_courses > 0 else "0"
        
        # Assignments trend
        prev_assignments = QuizSession.query\
            .join(Lesson, QuizSession.lesson_id == Lesson.id)\
            .filter(
                Lesson.created_by == current_user_id,
                QuizSession.completed_at >= fourteen_days_ago,
                QuizSession.completed_at < seven_days_ago
            )\
            .count()
        
        assignments_trend = round(((pending_assignments - prev_assignments) / max(prev_assignments, 1)) * 100, 1) if prev_assignments > 0 else 0
        
        return jsonify({
            'success': True,
            'data': {
                'totalStudents': enrolled_students,
                'activeCourses': active_courses,
                'pendingAssignments': pending_assignments,
                'newMessages': new_messages,
                'trends': {
                    'students': f"{'+' if students_trend > 0 else ''}{students_trend}%",
                    'courses': courses_trend,
                    'assignments': f"{'+' if assignments_trend > 0 else ''}{assignments_trend}%",
                    'messages': '+18%'  # Mock
                },
                'studentsUp': students_trend >= 0,
                'coursesUp': new_courses > 0,
                'assignmentsUp': assignments_trend >= 0
            }
        }), 200
        
    except Exception as e:
        print(f"Error in get_dashboard_stats: {str(e)}")
        return jsonify({'error': str(e)}), 500


@teacher_routes.route('/api/teacher/students', methods=['GET'])
@jwt_required()
def get_teacher_students():
    """Get list of students enrolled in teacher's courses"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get teacher's lessons
        lessons = Lesson.query.filter_by(created_by=current_user_id).all()
        lesson_ids = [lesson.id for lesson in lessons]
        
        if not lesson_ids:
            return jsonify({
                'success': True,
                'data': []
            }), 200
        
        # Get students enrolled in these lessons
        from models.lesson import LessonProgress
        from models.user import StudentProfile
        
        enrolled_students = db.session.query(User, StudentProfile, LessonProgress)\
            .join(StudentProfile, User.id == StudentProfile.user_id)\
            .join(LessonProgress, User.id == LessonProgress.user_id)\
            .filter(LessonProgress.lesson_id.in_(lesson_ids))\
            .distinct(User.id)\
            .all()
        
        students_data = []
        for student, profile, progress in enrolled_students:
            # Calculate average progress for this student
            student_progress = db.session.query(db.func.avg(LessonProgress.progress_percentage))\
                .filter(
                    LessonProgress.user_id == student.id,
                    LessonProgress.lesson_id.in_(lesson_ids)
                )\
                .scalar() or 0
            
            # Get last active time
            last_progress = LessonProgress.query\
                .filter(
                    LessonProgress.user_id == student.id,
                    LessonProgress.lesson_id.in_(lesson_ids)
                )\
                .order_by(LessonProgress.last_accessed.desc())\
                .first()
            
            # Calculate time difference
            last_active = "Never"
            if last_progress and last_progress.last_accessed:
                time_diff = datetime.utcnow() - last_progress.last_accessed
                if time_diff.days > 0:
                    last_active = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
                elif time_diff.seconds >= 3600:
                    hours = time_diff.seconds // 3600
                    last_active = f"{hours} hour{'s' if hours > 1 else ''} ago"
                else:
                    minutes = time_diff.seconds // 60
                    last_active = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
            
            students_data.append({
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'progress': round(student_progress, 1),
                'lastActive': last_active,
                'avatar': f"https://ui-avatars.com/api/?name={student.name.replace(' ', '+')}&background=random"
            })
        
        return jsonify({
            'success': True,
            'data': students_data
        }), 200
        
    except Exception as e:
        print(f"Error in get_teacher_students: {str(e)}")
        return jsonify({'error': str(e)}), 500


@teacher_routes.route('/api/teacher/recent-activity', methods=['GET'])
@jwt_required()
def get_recent_activity():
    """Get recent activity from students in teacher's courses"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get teacher's lessons
        lessons = Lesson.query.filter_by(created_by=current_user_id).all()
        lesson_ids = [lesson.id for lesson in lessons]
        
        if not lesson_ids:
            return jsonify({
                'success': True,
                'data': []
            }), 200
        
        # Get recent quiz completions
        from models.quiz import QuizSession
        from models.lesson import LessonProgress
        
        recent_sessions = QuizSession.query\
            .join(Lesson, QuizSession.lesson_id == Lesson.id)\
            .join(User, QuizSession.user_id == User.id)\
            .filter(
                Lesson.created_by == current_user_id,
                QuizSession.completed_at.isnot(None)
            )\
            .order_by(QuizSession.completed_at.desc())\
            .limit(10)\
            .all()
        
        # Get recent lesson completions
        recent_completions = LessonProgress.query\
            .join(Lesson, LessonProgress.lesson_id == Lesson.id)\
            .join(User, LessonProgress.user_id == User.id)\
            .filter(
                Lesson.created_by == current_user_id,
                LessonProgress.status == 'completed'
            )\
            .order_by(LessonProgress.completed_at.desc())\
            .limit(10)\
            .all()
        
        activities = []
        
        # Add quiz sessions
        for session in recent_sessions:
            student = User.query.get(session.user_id)
            time_diff = datetime.utcnow() - session.completed_at
            
            if time_diff.days > 0:
                time_ago = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
            elif time_diff.seconds >= 3600:
                hours = time_diff.seconds // 3600
                time_ago = f"{hours} hour{'s' if hours > 1 else ''} ago"
            else:
                minutes = max(1, time_diff.seconds // 60)
                time_ago = f"{minutes} min ago"
            
            activities.append({
                'action': 'New assignment submitted',
                'student': student.name if student else 'Unknown',
                'time': time_ago,
                'icon': 'FileText',
                'timestamp': session.completed_at
            })
        
        # Add lesson completions
        for progress in recent_completions:
            student = User.query.get(progress.user_id)
            time_diff = datetime.utcnow() - progress.completed_at
            
            if time_diff.days > 0:
                time_ago = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
            elif time_diff.seconds >= 3600:
                hours = time_diff.seconds // 3600
                time_ago = f"{hours} hour{'s' if hours > 1 else ''} ago"
            else:
                minutes = max(1, time_diff.seconds // 60)
                time_ago = f"{minutes} min ago"
            
            activities.append({
                'action': 'Course completion',
                'student': student.name if student else 'Unknown',
                'time': time_ago,
                'icon': 'Award',
                'timestamp': progress.completed_at
            })
        
        # Sort by timestamp and limit to 10
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        activities = activities[:10]
        
        # Remove timestamp from response
        for activity in activities:
            del activity['timestamp']
        
        return jsonify({
            'success': True,
            'data': activities
        }), 200
        
    except Exception as e:
        print(f"Error in get_recent_activity: {str(e)}")
        return jsonify({'error': str(e)}), 500


@teacher_routes.route('/api/teacher/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    """Get analytics data for teacher's lessons"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['teacher', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get teacher's lessons
        lessons = Lesson.query.filter_by(created_by=current_user_id).all()
        
        # Get total students
        total_students = User.query.filter_by(role='student').count()
        
        # Calculate statistics
        total_lessons = len(lessons)
        
        # Mock data for analytics
        avg_completion = 87
        avg_score = 85
        
        return jsonify({
            'totalStudents': total_students,
            'totalCourses': total_lessons,
            'totalLessons': total_lessons,
            'avgCompletion': avg_completion,
            'avgScore': avg_score,
            'completionTrend': [
                {'month': 'Jan', 'completed': 65},
                {'month': 'Feb', 'completed': 72},
                {'month': 'Mar', 'completed': 68},
                {'month': 'Apr', 'completed': 85},
                {'month': 'May', 'completed': 90},
                {'month': 'Jun', 'completed': 95}
            ],
            'scoresBySubject': [
                {'subject': 'Math', 'avgScore': 85},
                {'subject': 'Physics', 'avgScore': 78},
                {'subject': 'Chemistry', 'avgScore': 82},
                {'subject': 'Biology', 'avgScore': 88},
                {'subject': 'English', 'avgScore': 92}
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
