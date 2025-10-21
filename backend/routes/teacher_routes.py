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
