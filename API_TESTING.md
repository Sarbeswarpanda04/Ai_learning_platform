# API Testing Guide

## Using Postman or Thunder Client

### 1. Authentication

#### Sign Up
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test Student",
  "email": "test@example.com",
  "password": "test123",
  "role": "student",
  "profile": {
    "branch": "Computer Science",
    "semester": 3
  }
}
```

#### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "student123"
}

# Save the access_token from response!
```

#### Get Current User
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your_access_token>
```

### 2. Lessons

#### Get All Lessons
```
GET http://localhost:5000/api/lessons
Authorization: Bearer <token>
```

#### Get Specific Lesson
```
GET http://localhost:5000/api/lessons/1
Authorization: Bearer <token>
```

#### Create Lesson (Teacher/Admin only)
```
POST http://localhost:5000/api/lessons
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "title": "Advanced Python Concepts",
  "subject": "Programming",
  "content": "# Advanced Topics\n\nThis lesson covers advanced Python...",
  "difficulty": "advanced",
  "duration_minutes": 45,
  "tags": ["python", "advanced", "oop"]
}
```

### 3. Quizzes

#### Get Lesson Quizzes
```
GET http://localhost:5000/api/quiz/lesson/1/quizzes
Authorization: Bearer <token>
```

#### Attempt Quiz
```
POST http://localhost:5000/api/quiz/1/attempt
Authorization: Bearer <token>
Content-Type: application/json

{
  "answer": 1,
  "time_taken_seconds": 30
}
```

#### Start Quiz Session
```
POST http://localhost:5000/api/quiz/session/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "lesson_id": 1
}
```

### 4. AI/ML Endpoints

#### Get Performance Evaluation
```
POST http://localhost:5000/api/ml/evaluate
Authorization: Bearer <token>
Content-Type: application/json

{
  "limit": 50
}
```

#### Get Recommendations
```
POST http://localhost:5000/api/ml/recommend
Authorization: Bearer <token>
Content-Type: application/json

{
  "limit": 5
}
```

#### Get Student Dashboard
```
GET http://localhost:5000/api/ml/student/dashboard
Authorization: Bearer <token>
```

#### Get Teacher Analytics
```
GET http://localhost:5000/api/ml/teacher/analytics
Authorization: Bearer <teacher_token>
```

## Testing Workflow

1. **Login** → Get access token
2. **Browse Lessons** → Get all lessons
3. **View Lesson** → Get specific lesson with quizzes
4. **Take Quiz** → Submit answers and get feedback
5. **Check Progress** → View dashboard and analytics
6. **Get Recommendations** → Receive AI-powered suggestions

## Expected Responses

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": { /* optional error details */ }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
