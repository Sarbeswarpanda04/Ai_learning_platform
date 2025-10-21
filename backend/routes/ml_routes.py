"""
ML/AI routes for recommendations and performance evaluation
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.user import User
from models.lesson import Lesson, LessonProgress
from models.quiz import Quiz, Attempt
from ml_engine.recommend import ai_engine
from utils.security import success_response, error_response

ml_bp = Blueprint('ml', __name__)

@ml_bp.route('/evaluate', methods=['POST'])
@jwt_required()
def evaluate_performance():
    """Evaluate student performance using AI"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get student's quiz attempts
        limit = data.get('limit', 50)  # Last 50 attempts
        attempts = Attempt.query.filter_by(user_id=user_id)\
            .order_by(Attempt.timestamp.desc())\
            .limit(limit)\
            .all()
        
        # Convert to dict format for AI engine
        attempts_data = []
        for attempt in attempts:
            quiz = Quiz.query.get(attempt.quiz_id)
            attempts_data.append({
                'quiz_id': attempt.quiz_id,
                'is_correct': attempt.is_correct,
                'score': attempt.score,
                'timestamp': attempt.timestamp.isoformat(),
                'difficulty': quiz.difficulty if quiz else 'beginner',
                'lesson_id': quiz.lesson_id if quiz else None
            })
        
        # Evaluate using AI engine
        evaluation = ai_engine.evaluate_performance(attempts_data)
        
        return success_response(evaluation, 'Performance evaluated successfully')
        
    except Exception as e:
        return error_response(f'Evaluation failed: {str(e)}', 500)


@ml_bp.route('/recommend', methods=['POST'])
@jwt_required()
def recommend_lessons():
    """Get AI-powered lesson recommendations"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        user = User.query.get(user_id)
        if not user:
            return error_response('User not found', 404)
        
        # Gather student data
        student_data = {
            'profile': user.student_profile.to_dict() if user.student_profile else {},
            'attempts': [],
            'completed_lessons': []
        }
        
        # Get recent attempts
        attempts = Attempt.query.filter_by(user_id=user_id)\
            .order_by(Attempt.timestamp.desc())\
            .limit(100)\
            .all()
        
        for attempt in attempts:
            quiz = Quiz.query.get(attempt.quiz_id)
            student_data['attempts'].append({
                'is_correct': attempt.is_correct,
                'score': attempt.score,
                'difficulty': quiz.difficulty if quiz else 'beginner'
            })
        
        # Get completed lessons
        completed = LessonProgress.query.filter_by(
            user_id=user_id,
            status='completed'
        ).all()
        student_data['completed_lessons'] = [p.lesson_id for p in completed]
        
        # Get available lessons
        available_lessons = Lesson.query.filter_by(is_published=True).all()
        lessons_data = [lesson.to_dict(include_content=False) for lesson in available_lessons]
        
        # Get recommendations
        limit = data.get('limit', 5)
        recommendations = ai_engine.recommend_lessons(
            student_data,
            lessons_data,
            limit=limit
        )
        
        return success_response({
            'recommendations': recommendations,
            'total': len(recommendations)
        }, 'Recommendations generated successfully')
        
    except Exception as e:
        return error_response(f'Recommendation failed: {str(e)}', 500)


@ml_bp.route('/learning-gaps', methods=['GET'])
@jwt_required()
def detect_learning_gaps():
    """Detect learning gaps in student performance"""
    try:
        user_id = get_jwt_identity()
        
        # Get all student attempts
        attempts = Attempt.query.filter_by(user_id=user_id).all()
        
        attempts_data = []
        for attempt in attempts:
            quiz = Quiz.query.get(attempt.quiz_id)
            if quiz:
                attempts_data.append({
                    'quiz_id': attempt.quiz_id,
                    'lesson_id': quiz.lesson_id,
                    'is_correct': attempt.is_correct,
                    'difficulty': quiz.difficulty
                })
        
        # Get all lessons
        lessons = Lesson.query.all()
        lessons_data = [l.to_dict(include_content=False) for l in lessons]
        
        # Detect gaps
        gaps = ai_engine.detect_learning_gaps(attempts_data, lessons_data)
        
        return success_response(gaps, 'Learning gaps identified')
        
    except Exception as e:
        return error_response(f'Gap detection failed: {str(e)}', 500)


@ml_bp.route('/adaptive-hint', methods=['POST'])
@jwt_required()
def get_adaptive_hint():
    """Get an adaptive hint for a specific question"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        quiz_id = data.get('quiz_id')
        if not quiz_id:
            return error_response('Quiz ID is required', 400)
        
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return error_response('Quiz not found', 404)
        
        # Get attempt history for similar questions
        attempt_history = Attempt.query.filter_by(
            user_id=user_id,
            quiz_id=quiz_id
        ).all()
        
        # Generate adaptive hint
        hint = ai_engine.generate_adaptive_hint(
            quiz.to_dict(include_answer=True),
            [a.to_dict() for a in attempt_history]
        )
        
        return success_response({'hint': hint})
        
    except Exception as e:
        return error_response(f'Failed to generate hint: {str(e)}', 500)


@ml_bp.route('/student/dashboard', methods=['GET'])
@jwt_required()
def get_student_dashboard():
    """Get comprehensive student dashboard data with AI insights"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'student':
            return error_response('Student account required', 403)
        
        # Get profile
        profile = user.student_profile.to_dict() if user.student_profile else {}
        
        # Get recent attempts
        recent_attempts = Attempt.query.filter_by(user_id=user_id)\
            .order_by(Attempt.timestamp.desc())\
            .limit(50)\
            .all()
        
        attempts_data = []
        for attempt in recent_attempts:
            quiz = Quiz.query.get(attempt.quiz_id)
            attempts_data.append({
                'is_correct': attempt.is_correct,
                'score': attempt.score,
                'timestamp': attempt.timestamp.isoformat(),
                'difficulty': quiz.difficulty if quiz else 'beginner',
                'lesson_id': quiz.lesson_id if quiz else None
            })
        
        # AI Evaluation
        evaluation = ai_engine.evaluate_performance(attempts_data)
        
        # Get progress on lessons
        lesson_progress = LessonProgress.query.filter_by(user_id=user_id).all()
        progress_data = [p.to_dict() for p in lesson_progress]
        
        # Calculate statistics
        total_lessons = Lesson.query.filter_by(is_published=True).count()
        completed_lessons = len([p for p in lesson_progress if p.status == 'completed'])
        in_progress_lessons = len([p for p in lesson_progress if p.status == 'in_progress'])
        
        # Get recent quiz sessions
        from models.quiz import QuizSession
        recent_sessions = QuizSession.query.filter_by(user_id=user_id)\
            .order_by(QuizSession.started_at.desc())\
            .limit(10)\
            .all()
        
        sessions_data = [s.to_dict() for s in recent_sessions]
        
        dashboard_data = {
            'profile': profile,
            'evaluation': evaluation,
            'statistics': {
                'total_lessons': total_lessons,
                'completed_lessons': completed_lessons,
                'in_progress_lessons': in_progress_lessons,
                'total_quizzes_taken': profile.get('total_quizzes_taken', 0),
                'average_score': profile.get('average_score', 0)
            },
            'lesson_progress': progress_data,
            'recent_sessions': sessions_data,
            'achievements': profile.get('achievements', [])
        }
        
        return success_response(dashboard_data)
        
    except Exception as e:
        return error_response(f'Failed to load dashboard: {str(e)}', 500)


@ml_bp.route('/teacher/analytics', methods=['GET'])
@jwt_required()
def get_teacher_analytics():
    """Get teacher analytics dashboard"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role not in ['teacher', 'admin']:
            return error_response('Teacher/Admin account required', 403)
        
        # Get lessons created by teacher
        lessons = Lesson.query.filter_by(created_by=user_id).all()
        lesson_ids = [l.id for l in lessons]
        
        # Get quiz statistics
        total_quizzes = 0
        total_attempts = 0
        total_students = set()
        
        for lesson_id in lesson_ids:
            quizzes = Quiz.query.filter_by(lesson_id=lesson_id).all()
            total_quizzes += len(quizzes)
            
            for quiz in quizzes:
                attempts = Attempt.query.filter_by(quiz_id=quiz.id).all()
                total_attempts += len(attempts)
                total_students.update([a.user_id for a in attempts])
        
        # Get student performance by lesson
        lesson_performance = []
        for lesson in lessons:
            quizzes = Quiz.query.filter_by(lesson_id=lesson.id).all()
            quiz_ids = [q.id for q in quizzes]
            
            if quiz_ids:
                attempts = Attempt.query.filter(Attempt.quiz_id.in_(quiz_ids)).all()
                correct = sum(1 for a in attempts if a.is_correct)
                total = len(attempts)
                accuracy = (correct / total * 100) if total > 0 else 0
                
                lesson_performance.append({
                    'lesson_id': lesson.id,
                    'lesson_title': lesson.title,
                    'total_attempts': total,
                    'accuracy': round(accuracy, 2),
                    'unique_students': len(set(a.user_id for a in attempts))
                })
        
        analytics = {
            'total_lessons': len(lessons),
            'total_quizzes': total_quizzes,
            'total_attempts': total_attempts,
            'unique_students': len(total_students),
            'lesson_performance': lesson_performance
        }
        
        return success_response(analytics)
        
    except Exception as e:
        return error_response(f'Failed to load analytics: {str(e)}', 500)
