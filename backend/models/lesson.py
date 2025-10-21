from database import db
from datetime import datetime

class Lesson(db.Model):
    """Lesson/Content model"""
    __tablename__ = 'lessons'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(100), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)  # Markdown content
    difficulty = db.Column(db.String(20), default='beginner')  # beginner, intermediate, advanced
    duration_minutes = db.Column(db.Integer, default=30)
    prerequisites = db.Column(db.JSON, default=[])  # List of lesson IDs that should be completed first
    tags = db.Column(db.JSON, default=[])  # Searchable tags
    is_published = db.Column(db.Boolean, default=True)
    views_count = db.Column(db.Integer, default=0)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    quizzes = db.relationship('Quiz', backref='lesson', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_content=True):
        """Convert lesson to dictionary"""
        data = {
            'id': self.id,
            'title': self.title,
            'subject': self.subject,
            'difficulty': self.difficulty,
            'duration_minutes': self.duration_minutes,
            'prerequisites': self.prerequisites,
            'tags': self.tags,
            'is_published': self.is_published,
            'views_count': self.views_count,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'quiz_count': self.quizzes.count()
        }
        
        if include_content:
            data['content'] = self.content
        
        return data
    
    def increment_views(self):
        """Increment the view count"""
        self.views_count += 1
        db.session.commit()
    
    def __repr__(self):
        return f'<Lesson {self.title}>'


class LessonProgress(db.Model):
    """Track student progress on lessons"""
    __tablename__ = 'lesson_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    status = db.Column(db.String(20), default='not_started')  # not_started, in_progress, completed
    progress_percentage = db.Column(db.Float, default=0.0)
    time_spent_minutes = db.Column(db.Integer, default=0)
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint
    __table_args__ = (db.UniqueConstraint('user_id', 'lesson_id', name='_user_lesson_uc'),)
    
    def to_dict(self):
        """Convert progress to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'lesson_id': self.lesson_id,
            'status': self.status,
            'progress_percentage': self.progress_percentage,
            'time_spent_minutes': self.time_spent_minutes,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'last_accessed': self.last_accessed.isoformat()
        }
    
    def mark_complete(self):
        """Mark lesson as completed"""
        self.status = 'completed'
        self.progress_percentage = 100.0
        self.completed_at = datetime.utcnow()
        db.session.commit()
    
    def __repr__(self):
        return f'<LessonProgress user={self.user_id} lesson={self.lesson_id}>'
