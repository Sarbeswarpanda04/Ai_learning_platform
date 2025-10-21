from database import db
from datetime import datetime

class Quiz(db.Model):
    """Quiz/Question model"""
    __tablename__ = 'quizzes'
    
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), default='mcq')  # mcq, true_false, short_answer
    options = db.Column(db.JSON, nullable=False)  # List of options for MCQ
    correct_answer = db.Column(db.Integer, nullable=False)  # Index of correct option
    explanation = db.Column(db.Text)  # Explanation for the correct answer
    difficulty = db.Column(db.String(20), default='beginner')
    points = db.Column(db.Integer, default=10)
    hint = db.Column(db.Text, nullable=True)  # Optional hint
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    attempts = db.relationship('Attempt', backref='quiz', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_answer=False):
        """Convert quiz to dictionary"""
        data = {
            'id': self.id,
            'lesson_id': self.lesson_id,
            'question': self.question,
            'question_type': self.question_type,
            'options': self.options,
            'difficulty': self.difficulty,
            'points': self.points,
            'hint': self.hint,
            'created_at': self.created_at.isoformat()
        }
        
        if include_answer:
            data['correct_answer'] = self.correct_answer
            data['explanation'] = self.explanation
        
        return data
    
    def check_answer(self, user_answer):
        """Check if the provided answer is correct"""
        return user_answer == self.correct_answer
    
    def __repr__(self):
        return f'<Quiz {self.id} for Lesson {self.lesson_id}>'


class Attempt(db.Model):
    """Student quiz attempt model"""
    __tablename__ = 'attempts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    user_answer = db.Column(db.Integer, nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    score = db.Column(db.Integer, default=0)  # Points earned
    time_taken_seconds = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    synced = db.Column(db.Boolean, default=True)  # For offline sync tracking
    feedback = db.Column(db.Text, nullable=True)  # AI-generated feedback
    
    def to_dict(self):
        """Convert attempt to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'quiz_id': self.quiz_id,
            'user_answer': self.user_answer,
            'is_correct': self.is_correct,
            'score': self.score,
            'time_taken_seconds': self.time_taken_seconds,
            'timestamp': self.timestamp.isoformat(),
            'synced': self.synced,
            'feedback': self.feedback
        }
    
    def __repr__(self):
        return f'<Attempt user={self.user_id} quiz={self.quiz_id} correct={self.is_correct}>'


class QuizSession(db.Model):
    """Track complete quiz sessions for a lesson"""
    __tablename__ = 'quiz_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    correct_answers = db.Column(db.Integer, default=0)
    total_score = db.Column(db.Integer, default=0)
    percentage = db.Column(db.Float, default=0.0)
    time_taken_seconds = db.Column(db.Integer, default=0)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        """Convert session to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'lesson_id': self.lesson_id,
            'total_questions': self.total_questions,
            'correct_answers': self.correct_answers,
            'total_score': self.total_score,
            'percentage': self.percentage,
            'time_taken_seconds': self.time_taken_seconds,
            'started_at': self.started_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    def calculate_score(self):
        """Calculate final score and percentage"""
        if self.total_questions > 0:
            self.percentage = (self.correct_answers / self.total_questions) * 100
        self.completed_at = datetime.utcnow()
        db.session.commit()
    
    def __repr__(self):
        return f'<QuizSession user={self.user_id} lesson={self.lesson_id}>'
