"""
Lesson routes for CRUD operations and lesson management
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from database import db
from models.user import User
from models.lesson import Lesson, LessonProgress
from utils.security import role_required, sanitize_input, paginate_query, success_response, error_response

lesson_bp = Blueprint('lessons', __name__)

@lesson_bp.route('', methods=['GET'])
def get_lessons():
    """Get all lessons with optional filtering (public endpoint)"""
    try:
        # Try to verify JWT but don't require it
        try:
            verify_jwt_in_request(optional=True)
        except:
            pass
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        subject = request.args.get('subject')
        difficulty = request.args.get('difficulty')
        search = request.args.get('search')
        
        # Build query
        query = Lesson.query.filter_by(is_published=True)
        
        if subject:
            query = query.filter_by(subject=subject)
        
        if difficulty:
            query = query.filter_by(difficulty=difficulty)
        
        if search:
            search_term = f'%{search}%'
            query = query.filter(
                db.or_(
                    Lesson.title.ilike(search_term),
                    Lesson.content.ilike(search_term)
                )
            )
        
        # Order by created date
        query = query.order_by(Lesson.created_at.desc())
        
        # Paginate
        result = paginate_query(query, page, per_page)
        
        return success_response(result)
        
    except Exception as e:
        return error_response(f'Failed to fetch lessons: {str(e)}', 500)


@lesson_bp.route('/<int:lesson_id>', methods=['GET'])
@jwt_required()
def get_lesson(lesson_id):
    """Get a specific lesson by ID"""
    try:
        lesson = Lesson.query.get(lesson_id)
        
        if not lesson:
            return error_response('Lesson not found', 404)
        
        if not lesson.is_published:
            # Check if user is teacher/admin or creator
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if user.role not in ['teacher', 'admin'] and lesson.created_by != user_id:
                return error_response('Lesson not found', 404)
        
        # Increment view count
        lesson.increment_views()
        
        # Get user's progress on this lesson
        user_id = get_jwt_identity()
        progress = LessonProgress.query.filter_by(
            user_id=user_id,
            lesson_id=lesson_id
        ).first()
        
        lesson_data = lesson.to_dict(include_content=True)
        lesson_data['progress'] = progress.to_dict() if progress else None
        
        return success_response(lesson_data)
        
    except Exception as e:
        return error_response(f'Failed to fetch lesson: {str(e)}', 500)


@lesson_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['teacher', 'admin'])
def create_lesson():
    """Create a new lesson (Teacher/Admin only)"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'subject', 'content', 'difficulty']
        for field in required_fields:
            if field not in data:
                return error_response(f'Missing required field: {field}', 400)
        
        # Create lesson
        lesson = Lesson(
            title=sanitize_input(data['title']),
            subject=sanitize_input(data['subject']),
            content=data['content'],  # Don't sanitize markdown content too aggressively
            difficulty=data['difficulty'],
            duration_minutes=data.get('duration_minutes', 30),
            prerequisites=data.get('prerequisites', []),
            tags=data.get('tags', []),
            is_published=data.get('is_published', True),
            created_by=user_id
        )
        
        db.session.add(lesson)
        db.session.commit()
        
        return success_response(
            lesson.to_dict(),
            'Lesson created successfully',
            201
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create lesson: {str(e)}', 500)


@lesson_bp.route('/<int:lesson_id>', methods=['PUT'])
@jwt_required()
@role_required(['teacher', 'admin'])
def update_lesson(lesson_id):
    """Update an existing lesson"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        lesson = Lesson.query.get(lesson_id)
        
        if not lesson:
            return error_response('Lesson not found', 404)
        
        # Check if user is creator or admin
        if lesson.created_by != user_id and user.role != 'admin':
            return error_response('Not authorized to edit this lesson', 403)
        
        data = request.get_json()
        
        # Update fields
        if 'title' in data:
            lesson.title = sanitize_input(data['title'])
        if 'subject' in data:
            lesson.subject = sanitize_input(data['subject'])
        if 'content' in data:
            lesson.content = data['content']
        if 'difficulty' in data:
            lesson.difficulty = data['difficulty']
        if 'duration_minutes' in data:
            lesson.duration_minutes = data['duration_minutes']
        if 'prerequisites' in data:
            lesson.prerequisites = data['prerequisites']
        if 'tags' in data:
            lesson.tags = data['tags']
        if 'is_published' in data:
            lesson.is_published = data['is_published']
        
        db.session.commit()
        
        return success_response(
            lesson.to_dict(),
            'Lesson updated successfully'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to update lesson: {str(e)}', 500)


@lesson_bp.route('/<int:lesson_id>', methods=['DELETE'])
@jwt_required()
@role_required(['teacher', 'admin'])
def delete_lesson(lesson_id):
    """Delete a lesson"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        lesson = Lesson.query.get(lesson_id)
        
        if not lesson:
            return error_response('Lesson not found', 404)
        
        # Check if user is creator or admin
        if lesson.created_by != user_id and user.role != 'admin':
            return error_response('Not authorized to delete this lesson', 403)
        
        db.session.delete(lesson)
        db.session.commit()
        
        return success_response(None, 'Lesson deleted successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to delete lesson: {str(e)}', 500)


@lesson_bp.route('/<int:lesson_id>/progress', methods=['POST'])
@jwt_required()
def update_progress(lesson_id):
    """Update user's progress on a lesson"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        lesson = Lesson.query.get(lesson_id)
        if not lesson:
            return error_response('Lesson not found', 404)
        
        # Get or create progress
        progress = LessonProgress.query.filter_by(
            user_id=user_id,
            lesson_id=lesson_id
        ).first()
        
        if not progress:
            from datetime import datetime
            progress = LessonProgress(
                user_id=user_id,
                lesson_id=lesson_id,
                started_at=datetime.utcnow()
            )
            db.session.add(progress)
        
        # Update progress
        if 'progress_percentage' in data:
            progress.progress_percentage = min(data['progress_percentage'], 100)
        
        if 'time_spent_minutes' in data:
            progress.time_spent_minutes += data['time_spent_minutes']
        
        if 'status' in data:
            progress.status = data['status']
        
        # Mark as complete if 100%
        if progress.progress_percentage >= 100:
            progress.mark_complete()
        
        from datetime import datetime
        progress.last_accessed = datetime.utcnow()
        
        db.session.commit()
        
        return success_response(
            progress.to_dict(),
            'Progress updated successfully'
        )
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to update progress: {str(e)}', 500)


@lesson_bp.route('/subjects', methods=['GET'])
@jwt_required()
def get_subjects():
    """Get list of all unique subjects"""
    try:
        subjects = db.session.query(Lesson.subject).distinct().all()
        subject_list = [s[0] for s in subjects if s[0]]
        
        return success_response({'subjects': subject_list})
        
    except Exception as e:
        return error_response(f'Failed to fetch subjects: {str(e)}', 500)


@lesson_bp.route('/my-lessons', methods=['GET'])
@jwt_required()
@role_required(['teacher', 'admin'])
def get_my_lessons():
    """Get lessons created by the current teacher"""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = Lesson.query.filter_by(created_by=user_id).order_by(Lesson.created_at.desc())
        result = paginate_query(query, page, per_page)
        
        return success_response(result)
        
    except Exception as e:
        return error_response(f'Failed to fetch lessons: {str(e)}', 500)
