"""
Quiz routes for taking quizzes and managing quiz attempts
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from database import db
from models.user import User, StudentProfile
from models.lesson import Lesson
from models.quiz import Quiz, Attempt, QuizSession
from ml_engine.recommend import ai_engine
from utils.security import role_required, success_response, error_response

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/lesson/<int:lesson_id>/quizzes', methods=['GET'])
@jwt_required()
def get_lesson_quizzes(lesson_id):
    """Get all quizzes for a lesson"""
    try:
        lesson = Lesson.query.get(lesson_id)
        if not lesson:
            return error_response('Lesson not found', 404)
        
        quizzes = Quiz.query.filter_by(lesson_id=lesson_id).all()
        
        # Don't include answers in the response
        quiz_data = [q.to_dict(include_answer=False) for q in quizzes]
        
        return success_response({'quizzes': quiz_data, 'total': len(quiz_data)})
        
    except Exception as e:
        return error_response(f'Failed to fetch quizzes: {str(e)}', 500)


@quiz_bp.route('/<int:quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz(quiz_id):
    """Get a specific quiz"""
    try:
        quiz = Quiz.query.get(quiz_id)
        
        if not quiz:
            return error_response('Quiz not found', 404)
        
        # Get user's previous attempts on this quiz
        user_id = int(get_jwt_identity())  # Convert string to int
        attempts = Attempt.query.filter_by(
            user_id=user_id,
            quiz_id=quiz_id
        ).order_by(Attempt.timestamp.desc()).limit(5).all()
        
        quiz_data = quiz.to_dict(include_answer=False)
        quiz_data['previous_attempts'] = [a.to_dict() for a in attempts]
        quiz_data['attempt_count'] = len(attempts)
        
        return success_response(quiz_data)
        
    except Exception as e:
        return error_response(f'Failed to fetch quiz: {str(e)}', 500)


@quiz_bp.route('/<int:quiz_id>/attempt', methods=['POST'])
@jwt_required()
def attempt_quiz(quiz_id):
    """Submit a quiz attempt"""
    try:
        user_id = int(get_jwt_identity())  # Convert string to int
        data = request.get_json()
        
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return error_response('Quiz not found', 404)
        
        # Validate answer
        if 'answer' not in data:
            return error_response('Answer is required', 400)
        
        user_answer = data['answer']
        time_taken = data.get('time_taken_seconds', 0)
        
        # Check if answer is correct
        is_correct = quiz.check_answer(user_answer)
        score = quiz.points if is_correct else 0
        
        # Generate AI feedback
        feedback = ai_engine.generate_feedback(
            quiz.to_dict(include_answer=True),
            user_answer,
            quiz.correct_answer
        )
        
        # Create attempt record
        attempt = Attempt(
            user_id=user_id,
            quiz_id=quiz_id,
            user_answer=user_answer,
            is_correct=is_correct,
            score=score,
            time_taken_seconds=time_taken,
            synced=True,
            feedback=feedback
        )
        
        db.session.add(attempt)
        
        # Update student profile statistics
        user = User.query.get(user_id)
        if user.role == 'student' and user.student_profile:
            profile = user.student_profile
            profile.total_quizzes_taken += 1
            
            # Recalculate average score
            all_attempts = Attempt.query.filter_by(user_id=user_id).all()
            if all_attempts:
                total_score = sum(a.score for a in all_attempts)
                max_possible = len(all_attempts) * 10  # Assuming 10 points per quiz
                profile.average_score = (total_score / max_possible) * 100 if max_possible > 0 else 0
        
        db.session.commit()
        
        # Return result with feedback
        result = attempt.to_dict()
        result['correct_answer'] = quiz.correct_answer
        result['explanation'] = quiz.explanation
        result['correct_option'] = quiz.options[quiz.correct_answer] if quiz.correct_answer < len(quiz.options) else None
        
        return success_response(result, 'Quiz attempt submitted successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to submit attempt: {str(e)}', 500)


@quiz_bp.route('/session/start', methods=['POST'])
@jwt_required()
def start_quiz_session():
    """Start a new quiz session for a lesson"""
    try:
        user_id = int(get_jwt_identity())  # Convert string to int
        data = request.get_json()
        
        lesson_id = data.get('lesson_id')
        if not lesson_id:
            return error_response('Lesson ID is required', 400)
        
        lesson = Lesson.query.get(lesson_id)
        if not lesson:
            return error_response('Lesson not found', 404)
        
        # Count quizzes for this lesson
        quiz_count = Quiz.query.filter_by(lesson_id=lesson_id).count()
        
        if quiz_count == 0:
            return error_response('No quizzes available for this lesson', 404)
        
        # Create session
        session = QuizSession(
            user_id=user_id,
            lesson_id=lesson_id,
            total_questions=quiz_count
        )
        
        db.session.add(session)
        db.session.commit()
        
        return success_response(session.to_dict(), 'Quiz session started')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to start session: {str(e)}', 500)


@quiz_bp.route('/session/<int:session_id>/complete', methods=['POST'])
@jwt_required()
def complete_quiz_session(session_id):
    """Complete a quiz session and calculate final score"""
    try:
        user_id = int(get_jwt_identity())  # Convert string to int
        
        session = QuizSession.query.get(session_id)
        if not session:
            return error_response('Session not found', 404)
        
        if session.user_id != user_id:
            return error_response('Unauthorized', 403)
        
        # Get all attempts for this session
        attempts = Attempt.query.filter(
            Attempt.user_id == user_id,
            Attempt.timestamp >= session.started_at
        ).join(Quiz).filter(
            Quiz.lesson_id == session.lesson_id
        ).all()
        
        # Calculate session statistics
        session.correct_answers = sum(1 for a in attempts if a.is_correct)
        session.total_score = sum(a.score for a in attempts)
        session.time_taken_seconds = sum(a.time_taken_seconds for a in attempts)
        session.calculate_score()
        
        # Update lesson progress
        from models.lesson import LessonProgress
        progress = LessonProgress.query.filter_by(
            user_id=user_id,
            lesson_id=session.lesson_id
        ).first()
        
        if progress:
            if session.percentage >= 70:  # 70% passing grade
                progress.mark_complete()
        
        db.session.commit()
        
        return success_response(session.to_dict(), 'Quiz session completed')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to complete session: {str(e)}', 500)


@quiz_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'admin'])
def create_quiz():
    """Create a new quiz (Teacher/Admin only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['lesson_id', 'question', 'options', 'correct_answer']
        for field in required_fields:
            if field not in data:
                return error_response(f'Missing required field: {field}', 400)
        
        # Validate lesson exists
        lesson = Lesson.query.get(data['lesson_id'])
        if not lesson:
            return error_response('Lesson not found', 404)
        
        # Create quiz
        quiz = Quiz(
            lesson_id=data['lesson_id'],
            question=data['question'],
            question_type=data.get('question_type', 'mcq'),
            options=data['options'],
            correct_answer=data['correct_answer'],
            explanation=data.get('explanation', ''),
            difficulty=data.get('difficulty', 'beginner'),
            points=data.get('points', 10),
            hint=data.get('hint')
        )
        
        db.session.add(quiz)
        db.session.commit()
        
        return success_response(
            quiz.to_dict(include_answer=True),
            'Quiz created successfully',
            201
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create quiz: {str(e)}', 500)


@quiz_bp.route('/<int:quiz_id>', methods=['PUT'])
@jwt_required()
@role_required(['teacher', 'admin'])
def update_quiz(quiz_id):
    """Update a quiz"""
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return error_response('Quiz not found', 404)
        
        data = request.get_json()
        
        # Update fields
        if 'question' in data:
            quiz.question = data['question']
        if 'options' in data:
            quiz.options = data['options']
        if 'correct_answer' in data:
            quiz.correct_answer = data['correct_answer']
        if 'explanation' in data:
            quiz.explanation = data['explanation']
        if 'difficulty' in data:
            quiz.difficulty = data['difficulty']
        if 'points' in data:
            quiz.points = data['points']
        if 'hint' in data:
            quiz.hint = data['hint']
        
        db.session.commit()
        
        return success_response(
            quiz.to_dict(include_answer=True),
            'Quiz updated successfully'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to update quiz: {str(e)}', 500)


@quiz_bp.route('/<int:quiz_id>', methods=['DELETE'])
@jwt_required()
@role_required(['teacher', 'admin'])
def delete_quiz(quiz_id):
    """Delete a quiz"""
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return error_response('Quiz not found', 404)
        
        db.session.delete(quiz)
        db.session.commit()
        
        return success_response(None, 'Quiz deleted successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to delete quiz: {str(e)}', 500)


@quiz_bp.route('/sync/offline', methods=['POST'])
@jwt_required()
def sync_offline_attempts():
    """Sync offline quiz attempts"""
    try:
        user_id = int(get_jwt_identity())  # Convert string to int
        data = request.get_json()
        
        attempts_data = data.get('attempts', [])
        if not attempts_data:
            return error_response('No attempts to sync', 400)
        
        synced_count = 0
        errors = []
        
        for attempt_data in attempts_data:
            try:
                quiz_id = attempt_data.get('quiz_id')
                quiz = Quiz.query.get(quiz_id)
                
                if not quiz:
                    errors.append(f'Quiz {quiz_id} not found')
                    continue
                
                # Check if already synced (prevent duplicates)
                existing = Attempt.query.filter_by(
                    user_id=user_id,
                    quiz_id=quiz_id,
                    timestamp=datetime.fromisoformat(attempt_data['timestamp'])
                ).first()
                
                if existing:
                    continue
                
                # Create attempt
                attempt = Attempt(
                    user_id=user_id,
                    quiz_id=quiz_id,
                    user_answer=attempt_data['user_answer'],
                    is_correct=attempt_data['is_correct'],
                    score=attempt_data['score'],
                    time_taken_seconds=attempt_data.get('time_taken_seconds', 0),
                    timestamp=datetime.fromisoformat(attempt_data['timestamp']),
                    synced=True
                )
                
                db.session.add(attempt)
                synced_count += 1
                
            except Exception as e:
                errors.append(f'Error syncing attempt: {str(e)}')
        
        db.session.commit()
        
        return success_response({
            'synced_count': synced_count,
            'errors': errors
        }, f'Synced {synced_count} attempts')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Sync failed: {str(e)}', 500)
