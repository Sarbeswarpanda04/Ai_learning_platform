from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import User, StudentProfile, Lesson
from datetime import datetime, timedelta
import random

parent_routes = Blueprint('parent', __name__)

@parent_routes.route('/api/parent/students', methods=['GET'])
def get_all_students():
    """Get list of all students for parent login selection"""
    try:
        students = User.query.filter_by(role='student').all()
        
        students_data = []
        for student in students:
            profile = StudentProfile.query.filter_by(user_id=student.id).first()
            students_data.append({
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'branch': profile.branch if profile else 'N/A',
                'semester': profile.semester if profile else 0
            })
        
        return jsonify({
            'success': True,
            'students': students_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@parent_routes.route('/api/parent/login', methods=['POST'])
def parent_login():
    """Parent login with student ID and parent PIN"""
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        parent_pin = data.get('parent_pin')
        
        if not student_id or not parent_pin:
            return jsonify({
                'success': False,
                'message': 'Student ID and Parent PIN are required'
            }), 400
        
        # Get student
        student = User.query.get(student_id)
        if not student or student.role != 'student':
            return jsonify({
                'success': False,
                'message': 'Student not found'
            }), 404
        
        # Get student profile
        profile = StudentProfile.query.filter_by(user_id=student_id).first()
        
        # Check if parent PIN feature is available and set
        parent_pin_attr = getattr(profile, 'parent_pin', None) if profile else None
        
        if not profile or not parent_pin_attr:
            return jsonify({
                'success': False,
                'message': 'Parent PIN not set for this student. Please ask the student to set up a Parent PIN first.'
            }), 404
        
        # Verify parent PIN
        if parent_pin_attr != parent_pin:
            return jsonify({
                'success': False,
                'message': 'Invalid Parent PIN'
            }), 401
        
        return jsonify({
            'success': True,
            'message': 'Parent login successful',
            'student': {
                'id': student.id,
                'name': student.name,
                'email': student.email
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@parent_routes.route('/api/parent/student/<int:student_id>/dashboard', methods=['GET'])
def get_student_dashboard(student_id):
    """Get student dashboard data for parent"""
    try:
        # Get student
        student = User.query.get(student_id)
        if not student or student.role != 'student':
            return jsonify({
                'success': False,
                'message': 'Student not found'
            }), 404
        
        # Get student profile
        profile = StudentProfile.query.filter_by(user_id=student_id).first()
        
        # Get total lessons
        total_lessons = Lesson.query.count()
        
        # Mock data for now (in production, calculate from actual data)
        lessons_completed = random.randint(5, 15)
        average_score = profile.average_score if profile else random.randint(70, 95)
        study_hours = random.randint(8, 25)
        progress_trend = f"+{random.randint(5, 20)}%"
        
        # Subject performance
        subject_performance = [
            {'name': 'Mathematics', 'score': random.randint(70, 95), 'color': 'from-blue-500 to-cyan-600'},
            {'name': 'Physics', 'score': random.randint(70, 95), 'color': 'from-purple-500 to-pink-600'},
            {'name': 'Chemistry', 'score': random.randint(70, 95), 'color': 'from-orange-500 to-red-600'},
            {'name': 'Computer Science', 'score': random.randint(70, 95), 'color': 'from-green-500 to-emerald-600'},
        ]
        
        # Recent activity
        recent_activity = [
            {
                'type': 'completed',
                'title': 'Completed Data Structures Quiz',
                'description': 'Scored 85% in the assessment',
                'time': '2 hours ago'
            },
            {
                'type': 'started',
                'title': 'Started Machine Learning Course',
                'description': 'Introduction to ML concepts',
                'time': '5 hours ago'
            },
            {
                'type': 'completed',
                'title': 'Finished Python Basics',
                'description': 'All modules completed successfully',
                'time': '1 day ago'
            }
        ]
        
        # Learning goals
        goals = [
            {'title': 'Complete 10 lessons this week', 'completed': True},
            {'title': 'Achieve 80% average score', 'completed': True},
            {'title': 'Finish Data Structures course', 'completed': False},
            {'title': 'Practice 5 coding problems', 'completed': False}
        ]
        
        # AI insight
        ai_insight = f"{student.name} is performing well! They show strong understanding in technical subjects. Encourage more practice in problem-solving."
        
        return jsonify({
            'success': True,
            'student': {
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'branch': profile.branch if profile else 'Computer Science',
                'semester': profile.semester if profile else 4,
                'rollNumber': profile.roll_number if profile and hasattr(profile, 'roll_number') else 'N/A',
                'joinedDate': student.created_at.strftime('%B %Y') if hasattr(student, 'created_at') else 'January 2024'
            },
            'stats': {
                'lessonsCompleted': lessons_completed,
                'totalLessons': total_lessons,
                'averageScore': average_score,
                'studyHours': study_hours,
                'progressTrend': progress_trend,
                'subjectPerformance': subject_performance,
                'goals': goals,
                'aiInsight': ai_insight
            },
            'recentActivity': recent_activity
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@parent_routes.route('/api/student/set-parent-pin', methods=['POST'])
@jwt_required()
def set_parent_pin():
    """Student sets/updates parent PIN"""
    try:
        current_user_id = int(get_jwt_identity())  # Convert string to int
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'student':
            return jsonify({
                'success': False,
                'message': 'Only students can set parent PIN'
            }), 403
        
        data = request.get_json()
        parent_pin = data.get('parent_pin')
        
        if not parent_pin:
            return jsonify({
                'success': False,
                'message': 'Parent PIN is required'
            }), 400
        
        # Validate PIN (6 digits)
        if not parent_pin.isdigit() or len(parent_pin) != 6:
            return jsonify({
                'success': False,
                'message': 'Parent PIN must be exactly 6 digits'
            }), 400
        
        # Get or create student profile
        profile = StudentProfile.query.filter_by(user_id=current_user_id).first()
        
        # Check if parent_pin attribute exists in the model
        if not hasattr(StudentProfile, 'parent_pin'):
            return jsonify({
                'success': False,
                'message': 'Parent PIN feature is not yet available. Database migration pending.'
            }), 503
        
        if not profile:
            profile = StudentProfile(
                user_id=current_user_id,
                branch='Not Set',
                semester=1
            )
            db.session.add(profile)
        
        # Set parent PIN
        profile.parent_pin = parent_pin
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Parent PIN set successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
