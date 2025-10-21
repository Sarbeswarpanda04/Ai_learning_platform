from database import db
from datetime import datetime
import bcrypt

class User(db.Model):
    """User model for authentication and role management"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for OAuth users
    role = db.Column(db.String(20), nullable=False, default='student')  # student, teacher, admin
    oauth_provider = db.Column(db.String(50), nullable=True)  # google, facebook, etc.
    oauth_id = db.Column(db.String(200), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    student_profile = db.relationship('StudentProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    attempts = db.relationship('Attempt', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    lessons_created = db.relationship('Lesson', backref='creator', lazy='dynamic')
    
    def set_password(self, password):
        """Hash and set the password"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Check if the provided password matches the hash"""
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'oauth_provider': self.oauth_provider,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def __repr__(self):
        return f'<User {self.email}>'


class StudentProfile(db.Model):
    """Extended profile for students"""
    __tablename__ = 'student_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    branch = db.Column(db.String(100))  # e.g., Computer Science, Mechanical
    semester = db.Column(db.Integer)
    baseline_score = db.Column(db.Float, default=0.0)  # Initial assessment score
    preferences = db.Column(db.JSON, default={})  # Learning preferences, pace, style
    achievements = db.Column(db.JSON, default=[])  # Badges and milestones
    total_lessons_completed = db.Column(db.Integer, default=0)
    total_quizzes_taken = db.Column(db.Integer, default=0)
    average_score = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert profile to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'branch': self.branch,
            'semester': self.semester,
            'baseline_score': self.baseline_score,
            'preferences': self.preferences,
            'achievements': self.achievements,
            'total_lessons_completed': self.total_lessons_completed,
            'total_quizzes_taken': self.total_quizzes_taken,
            'average_score': self.average_score,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def add_achievement(self, achievement_name, achievement_data):
        """Add a new achievement/badge"""
        if not isinstance(self.achievements, list):
            self.achievements = []
        
        achievement = {
            'name': achievement_name,
            'data': achievement_data,
            'earned_at': datetime.utcnow().isoformat()
        }
        self.achievements.append(achievement)
        db.session.commit()
    
    def __repr__(self):
        return f'<StudentProfile user_id={self.user_id}>'
