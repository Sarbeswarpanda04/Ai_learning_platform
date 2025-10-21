# AI Chatbot Setup Guide 🤖

## Overview
The AI Chatbot is a floating assistant powered by Google's Gemini API that helps students with their learning journey. It appears on every student page (Dashboard, Lesson View, Quiz Page, etc.) and provides instant answers to questions.

## Features ✨
- **Floating Chat Bubble**: Fixed at bottom-left corner with gradient styling
- **Expandable Chat Window**: Clean, modern UI with message history
- **AI-Powered Responses**: Uses Gemini-1.5-flash model for fast, accurate answers
- **Persistent Chat History**: Saves conversations using localStorage
- **Keyboard Shortcut**: Press `Ctrl + /` to toggle chatbot
- **Responsive Design**: Adapts to mobile (45px), tablet, and desktop (60px)
- **Typing Indicators**: Shows animated dots while AI is thinking
- **Error Handling**: Graceful fallback messages for offline/API errors

## Setup Instructions 🚀

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the generated API key (it will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

### 2. Configure Backend Environment Variables

#### For Local Development:

1. Open `backend/.env` file (create it if it doesn't exist)
2. Add your Gemini API key:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_actual_api_key_here
```

#### For Render.com Deployment:

1. Log in to your [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service
3. Go to **Environment** tab
4. Add new environment variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key
5. Click **"Save Changes"**
6. Service will automatically redeploy

### 3. Verify Installation

Run the backend server and check the logs:

```bash
cd backend
python app.py
```

You should see:
```
✅ Gemini API configured successfully
```

If you see:
```
⚠️ WARNING: GEMINI_API_KEY not found in environment variables
```
Then the API key is not properly configured.

### 4. Test the Chatbot

1. Start the frontend and backend servers
2. Log in as a student
3. Look for the chatbot bubble at the bottom-left corner
4. Click it to open the chat window
5. Ask a question like: "Explain machine learning basics"
6. The AI should respond within 2-3 seconds

## Usage Examples 💬

### Educational Queries:
- "Explain neural networks in simple terms"
- "What are the best study strategies for math?"
- "Give me an example of recursion in programming"
- "How does photosynthesis work?"

### Study Help:
- "I'm struggling with calculus, can you help?"
- "Break down this concept: [paste your topic]"
- "What are real-world applications of [subject]?"
- "Suggest study tips for exam preparation"

### Motivation:
- "I feel overwhelmed with my studies"
- "How can I stay motivated?"
- "Give me some encouragement"

## API Endpoints 🔌

### Chat Endpoint
```http
POST /api/chat
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "message": "Your question here"
}
```

**Response:**
```json
{
  "reply": "AI-generated response",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

### Status Endpoint
```http
GET /api/chat/status
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "status": "available",
  "configured": true,
  "message": "Chat service is ready"
}
```

## Architecture 🏗️

### Frontend (`ChatBot.jsx`)
- React component with Framer Motion animations
- LocalStorage for chat history persistence
- Axios for API communication
- Responsive design with Tailwind CSS

### Backend (`chat_routes.py`)
- Flask blueprint with JWT authentication
- Gemini API integration using `google-generativeai`
- Educational context prompt engineering
- Comprehensive error handling

## Troubleshooting 🔧

### Issue: "I'm sorry, but the AI service is currently unavailable"
**Solution**: GEMINI_API_KEY environment variable is not set. Follow Step 2 above.

### Issue: "API key" error in backend logs
**Solution**: Your API key might be invalid or expired. Generate a new one from Google AI Studio.

### Issue: Chatbot doesn't appear
**Solution**: 
1. Check if you're logged in as a student
2. Clear browser cache and reload
3. Check browser console for errors (F12)

### Issue: Chat history not persisting
**Solution**: Check if localStorage is enabled in your browser settings.

### Issue: Slow responses
**Solution**: 
1. Check your internet connection
2. Verify Render.com backend is not sleeping (free tier)
3. Consider upgrading to `gemini-1.5-pro` for better quality (but slower)

## Rate Limits & Costs 💰

### Gemini API Free Tier:
- **15 requests per minute** (RPM)
- **1 million tokens per minute** (TPM)
- **1,500 requests per day** (RPD)

For most learning platforms, this is sufficient. If you need more, check [Google AI Pricing](https://ai.google.dev/pricing).

## Customization 🎨

### Change AI Model:
Edit `backend/routes/chat_routes.py`:
```python
# Change from gemini-1.5-flash to gemini-1.5-pro
model = genai.GenerativeModel("gemini-1.5-pro")
```

### Modify System Prompt:
Edit the `system_context` variable in `chat_routes.py` to change how the AI responds.

### Change Appearance:
Edit `frontend/src/components/ChatBot.jsx`:
- Bubble position: Change `bottom-5 left-5` classes
- Color scheme: Modify gradient classes (e.g., `from-blue-600 to-indigo-500`)
- Window size: Change `w-[380px] h-[500px]` classes

## Security Notes 🔒

- ✅ API key stored server-side only (never exposed to frontend)
- ✅ JWT authentication required for all chat endpoints
- ✅ CORS enabled only for trusted origins
- ✅ Input sanitization to prevent injection attacks
- ✅ Rate limiting recommended for production

## Support 🆘

If you encounter issues:
1. Check backend logs for detailed error messages
2. Verify environment variables are set correctly
3. Test API key directly at [Google AI Studio](https://makersuite.google.com/)
4. Clear browser cache and localStorage
5. Restart backend server after env changes

---

**Built with ❤️ using React, Flask, and Google Gemini AI**
