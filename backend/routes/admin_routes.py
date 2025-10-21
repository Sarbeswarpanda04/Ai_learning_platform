"""
Admin routes for viewing database data
For development/testing purposes only
"""
from flask import Blueprint, jsonify
from models import User, Lesson, StudentProfile
from database import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/api/admin/stats', methods=['GET'])
def get_database_stats():
    """Get database statistics"""
    try:
        users_count = User.query.count()
        lessons_count = Lesson.query.count()
        students_count = User.query.filter_by(role='student').count()
        teachers_count = User.query.filter_by(role='teacher').count()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': users_count,
                'total_lessons': lessons_count,
                'students': students_count,
                'teachers': teachers_count,
                'database': 'PostgreSQL' if 'postgresql' in str(db.engine.url) else 'SQLite'
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_bp.route('/api/admin/users', methods=['GET'])
def get_all_users():
    """Get all users (without passwords)"""
    try:
        users = User.query.all()
        
        users_data = [{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'role': user.role,
            'created_at': user.created_at.isoformat() if hasattr(user, 'created_at') else None
        } for user in users]
        
        return jsonify({
            'success': True,
            'count': len(users_data),
            'users': users_data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@admin_bp.route('/api/admin/lessons', methods=['GET'])
def get_all_lessons():
    """Get all lessons"""
    try:
        lessons = Lesson.query.all()
        
        lessons_data = [{
            'id': lesson.id,
            'title': lesson.title,
            'subject': lesson.subject,
            'difficulty': lesson.difficulty,
            'duration_minutes': lesson.duration_minutes,
            'teacher_id': lesson.teacher_id,
            'created_at': lesson.created_at.isoformat() if hasattr(lesson, 'created_at') else None
        } for lesson in lessons]
        
        return jsonify({
            'success': True,
            'count': len(lessons_data),
            'lessons': lessons_data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
