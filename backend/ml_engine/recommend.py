"""
AI/ML Engine for Personalized Learning Recommendations
Simplified version without numpy dependency
"""
from datetime import datetime, timedelta
from collections import defaultdict

class AIEngine:
    """AI Engine for adaptive learning recommendations"""
    
    def __init__(self):
        # Bayesian Knowledge Tracing parameters
        self.p_learn = 0.3  # Probability of learning
        self.p_guess = 0.25  # Probability of guessing correctly
        self.p_slip = 0.1   # Probability of making a mistake
        
        # Difficulty levels
        self.difficulties = ['beginner', 'intermediate', 'advanced']
        
    def evaluate_performance(self, attempts_data):
        """
        Evaluate student performance and provide feedback
        
        Args:
            attempts_data: List of recent quiz attempts with scores and correctness
            
        Returns:
            dict: Evaluation results with feedback and weak areas
        """
        if not attempts_data:
            return {
                'overall_performance': 'No data',
                'mastery_level': 0,
                'weak_areas': [],
                'feedback': 'Start taking quizzes to get personalized feedback!',
                'confidence': 0
            }
        
        # Calculate metrics
        total_attempts = len(attempts_data)
        correct_count = sum(1 for a in attempts_data if a.get('is_correct', False))
        accuracy = (correct_count / total_attempts) * 100 if total_attempts > 0 else 0
        
        # Calculate recent performance (last 10 attempts)
        recent_attempts = attempts_data[-10:]
        recent_correct = sum(1 for a in recent_attempts if a.get('is_correct', False))
        recent_accuracy = (recent_correct / len(recent_attempts)) * 100 if recent_attempts else 0
        
        # Determine mastery level using BKT
        mastery_level = self._calculate_mastery(attempts_data)
        
        # Identify weak areas
        weak_areas = self._identify_weak_areas(attempts_data)
        
        # Generate feedback
        feedback = self._generate_feedback(accuracy, recent_accuracy, mastery_level, weak_areas)
        
        # Calculate confidence in the assessment
        confidence = min(total_attempts / 20, 1.0) * 100  # More attempts = higher confidence
        
        return {
            'overall_performance': self._get_performance_label(accuracy),
            'accuracy': round(accuracy, 2),
            'recent_accuracy': round(recent_accuracy, 2),
            'mastery_level': round(mastery_level, 2),
            'weak_areas': weak_areas,
            'feedback': feedback,
            'confidence': round(confidence, 2),
            'total_attempts': total_attempts,
            'trend': 'improving' if recent_accuracy > accuracy else 'declining' if recent_accuracy < accuracy else 'stable'
        }
    
    def recommend_lessons(self, student_data, available_lessons, limit=5):
        """
        Recommend next lessons based on student performance
        
        Args:
            student_data: Student profile and performance data
            available_lessons: List of available lessons
            limit: Maximum number of recommendations
            
        Returns:
            list: Recommended lessons with reasons
        """
        if not available_lessons:
            return []
        
        student_profile = student_data.get('profile', {})
        attempts = student_data.get('attempts', [])
        completed_lessons = student_data.get('completed_lessons', [])
        
        # Calculate student's current level
        avg_score = student_profile.get('average_score', 0)
        mastery_level = self._calculate_mastery(attempts)
        
        # Determine appropriate difficulty
        if mastery_level < 40:
            target_difficulty = 'beginner'
        elif mastery_level < 70:
            target_difficulty = 'intermediate'
        else:
            target_difficulty = 'advanced'
        
        # Score lessons
        lesson_scores = []
        for lesson in available_lessons:
            if lesson['id'] in completed_lessons:
                continue
                
            score = 0
            reason = []
            
            # Match difficulty level
            if lesson.get('difficulty') == target_difficulty:
                score += 50
                reason.append(f"Matches your {target_difficulty} level")
            
            # Prefer lessons in weak subjects
            weak_areas = self._identify_weak_areas(attempts)
            if lesson.get('subject') in weak_areas:
                score += 30
                reason.append("Helps improve weak areas")
            
            # Check prerequisites
            prereqs = lesson.get('prerequisites', [])
            if all(p in completed_lessons for p in prereqs):
                score += 20
                reason.append("Prerequisites completed")
            elif prereqs:
                score -= 30
                reason.append("Missing prerequisites")
            
            lesson_scores.append({
                'lesson': lesson,
                'score': score,
                'reason': ' | '.join(reason) if reason else 'Recommended for you'
            })
        
        # Sort by score and return top recommendations
        lesson_scores.sort(key=lambda x: x['score'], reverse=True)
        
        recommendations = []
        for item in lesson_scores[:limit]:
            recommendations.append({
                **item['lesson'],
                'recommendation_reason': item['reason'],
                'recommendation_score': item['score']
            })
        
        return recommendations
    
    def detect_learning_gaps(self, attempts, lessons):
        """
        Detect knowledge gaps based on performance
        
        Args:
            attempts: Student's quiz attempts
            lessons: Available lessons
            
        Returns:
            list: Identified learning gaps with suggestions
        """
        gaps = []
        
        # Group attempts by topic/subject
        topic_performance = defaultdict(list)
        for attempt in attempts:
            topic = attempt.get('topic', 'general')
            score = attempt.get('score', 0)
            topic_performance[topic].append(score)
        
        # Identify weak topics
        for topic, scores in topic_performance.items():
            if not scores:
                continue
                
            avg_score = sum(scores) / len(scores)
            
            if avg_score < 60:
                # Find related lessons
                related_lessons = [
                    l for l in lessons 
                    if l.get('subject', '').lower() == topic.lower() 
                    or topic.lower() in l.get('title', '').lower()
                ]
                
                gaps.append({
                    'topic': topic,
                    'average_score': round(avg_score, 2),
                    'severity': 'high' if avg_score < 40 else 'medium',
                    'attempts_count': len(scores),
                    'suggested_lessons': [l['id'] for l in related_lessons[:3]],
                    'description': f"Your average score in {topic} is {avg_score:.1f}%. Consider reviewing related lessons."
                })
        
        # Sort by severity
        gaps.sort(key=lambda x: (x['severity'] == 'high', -x['average_score']), reverse=True)
        
        return gaps
    
    def generate_adaptive_hint(self, question, student_performance, difficulty='medium'):
        """
        Generate contextual hints based on student performance
        
        Args:
            question: The question object
            student_performance: Student's recent performance data
            difficulty: How obvious the hint should be
            
        Returns:
            str: Generated hint
        """
        hints = {
            'easy': [
                f"Think about the key concept: {question.get('topic', 'this topic')}",
                "Break down the problem into smaller steps",
                "Consider what you learned in the related lesson"
            ],
            'medium': [
                "Review the question carefully and identify what's being asked",
                "Try to recall similar examples from your lessons",
                "Eliminate obviously wrong answers first"
            ],
            'hard': [
                "Take your time and read the question again",
                "Think about the fundamental principles involved",
                "Consider all options before answering"
            ]
        }
        
        # Select hint based on difficulty
        hint_list = hints.get(difficulty, hints['medium'])
        
        # Add performance-based encouragement
        mastery = student_performance.get('mastery_level', 0)
        if mastery < 40:
            hint = hint_list[0] + " - You're building your foundation, keep going!"
        elif mastery < 70:
            hint = hint_list[1] + " - You're making good progress!"
        else:
            hint = hint_list[2] + " - Challenge yourself!"
        
        return hint
    
    def predict_success_probability(self, student_data, quiz_data):
        """
        Predict probability of success on a quiz
        
        Args:
            student_data: Student's profile and performance
            quiz_data: Quiz information
            
        Returns:
            float: Probability of success (0-100)
        """
        # Base probability on recent performance
        attempts = student_data.get('attempts', [])
        if not attempts:
            return 50.0  # Neutral starting point
        
        # Calculate recent success rate
        recent = attempts[-5:] if len(attempts) >= 5 else attempts
        success_count = sum(1 for a in recent if a.get('score', 0) >= 70)
        base_probability = (success_count / len(recent)) * 100
        
        # Adjust for quiz difficulty
        quiz_difficulty = quiz_data.get('difficulty', 'intermediate')
        mastery = self._calculate_mastery(attempts)
        
        if quiz_difficulty == 'beginner' and mastery > 40:
            adjustment = 20
        elif quiz_difficulty == 'advanced' and mastery < 60:
            adjustment = -20
        else:
            adjustment = 0
        
        # Final probability
        probability = max(0, min(100, base_probability + adjustment))
        
        return round(probability, 2)
    
    # Helper methods
    
    def _calculate_mastery(self, attempts):
        """Calculate mastery level using simplified BKT"""
        if not attempts:
            return 0.0
        
        # Simple approach: weighted average of recent performance
        total = len(attempts)
        recent_weight = 0.7
        overall_weight = 0.3
        
        # Overall performance
        overall_score = sum(a.get('score', 0) for a in attempts) / total if total > 0 else 0
        
        # Recent performance (last 10 or all if less)
        recent = attempts[-10:] if len(attempts) > 10 else attempts
        recent_score = sum(a.get('score', 0) for a in recent) / len(recent) if recent else 0
        
        # Weighted mastery
        mastery = (recent_score * recent_weight) + (overall_score * overall_weight)
        
        return mastery
    
    def _identify_weak_areas(self, attempts):
        """Identify topics where student is struggling"""
        if not attempts:
            return []
        
        topic_scores = defaultdict(list)
        
        for attempt in attempts:
            topic = attempt.get('topic', 'general')
            score = attempt.get('score', 0)
            topic_scores[topic].append(score)
        
        weak_areas = []
        for topic, scores in topic_scores.items():
            avg_score = sum(scores) / len(scores)
            if avg_score < 60:  # Below 60% is considered weak
                weak_areas.append({
                    'topic': topic,
                    'average_score': round(avg_score, 2),
                    'attempts': len(scores)
                })
        
        # Sort by score (weakest first)
        weak_areas.sort(key=lambda x: x['average_score'])
        
        return [area['topic'] for area in weak_areas[:3]]  # Return top 3 weak topics
    
    def _generate_feedback(self, accuracy, recent_accuracy, mastery, weak_areas):
        """Generate personalized feedback"""
        feedback = []
        
        # Overall performance feedback
        if accuracy >= 80:
            feedback.append("Excellent work! You're demonstrating strong understanding.")
        elif accuracy >= 60:
            feedback.append("Good progress! Keep up the consistent effort.")
        else:
            feedback.append("You're building your foundation. Practice will help!")
        
        # Trend feedback
        if recent_accuracy > accuracy + 10:
            feedback.append("Your recent performance shows great improvement!")
        elif recent_accuracy < accuracy - 10:
            feedback.append("Take time to review concepts that are challenging.")
        
        # Weak areas feedback
        if weak_areas:
            topics = ', '.join(weak_areas)
            feedback.append(f"Focus on: {topics}")
        
        # Mastery feedback
        if mastery >= 80:
            feedback.append("You're close to mastery! Challenge yourself with advanced topics.")
        elif mastery >= 60:
            feedback.append("You're developing solid skills. Keep practicing!")
        
        return ' '.join(feedback)
    
    def _get_performance_label(self, accuracy):
        """Convert accuracy to performance label"""
        if accuracy >= 90:
            return 'Excellent'
        elif accuracy >= 75:
            return 'Good'
        elif accuracy >= 60:
            return 'Satisfactory'
        elif accuracy >= 40:
            return 'Needs Improvement'
        else:
            return 'Struggling'

# Create singleton instance
ai_engine = AIEngine()
