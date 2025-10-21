from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import google.generativeai as genai
import os
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print(f"✅ Gemini API configured successfully")
else:
    print("⚠️ WARNING: GEMINI_API_KEY not found in environment variables")

@chat_bp.route('/api/chat', methods=['POST'])
@jwt_required()
def chat():
    """
    Handle chat requests from students
    Accepts user message and returns AI-generated response using Gemini API
    """
    try:
        # Get current user ID
        user_id = int(get_jwt_identity())
        
        # Get user message from request
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({"error": "Message cannot be empty"}), 400
        
        # Check if Gemini API key is configured
        if not GEMINI_API_KEY:
            return jsonify({
                "reply": "I'm sorry, but the AI service is currently unavailable. Please contact your administrator to configure the Gemini API key."
            }), 503
        
        print(f"[CHAT] User {user_id} asked: {user_message[:100]}...")
        
        # Create Gemini model instance
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Create educational context prompt
        system_context = """You are EduAI Assistant, a helpful and friendly AI tutor for students. 
Your role is to:
- Explain complex topics in simple, easy-to-understand language
- Provide study tips and learning strategies
- Answer questions about various subjects (math, science, programming, etc.)
- Motivate and encourage students in their learning journey
- Suggest practical examples and real-world applications
- Break down difficult concepts into smaller, manageable parts

Keep your responses concise, clear, and student-friendly. Use examples when helpful.
If a question is unclear, ask for clarification politely."""
        
        # Combine context with user message
        full_prompt = f"{system_context}\n\nStudent Question: {user_message}"
        
        # Generate response from Gemini
        response = model.generate_content(full_prompt)
        ai_reply = response.text
        
        print(f"[CHAT] AI responded with {len(ai_reply)} characters")
        
        # Return the AI response
        return jsonify({
            "reply": ai_reply,
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        print(f"❌ [CHAT ERROR] {str(e)}")
        
        # Handle specific Gemini API errors
        if "API key" in str(e).lower():
            return jsonify({
                "reply": "I'm having trouble connecting to the AI service. Please try again in a moment."
            }), 503
        
        # Generic error response
        return jsonify({
            "reply": "I'm sorry, I encountered an error processing your request. Could you please try rephrasing your question?"
        }), 500

@chat_bp.route('/api/chat/status', methods=['GET'])
@jwt_required()
def chat_status():
    """
    Check if the chat service is available
    """
    try:
        is_configured = GEMINI_API_KEY is not None
        
        return jsonify({
            "status": "available" if is_configured else "unavailable",
            "configured": is_configured,
            "message": "Chat service is ready" if is_configured else "Gemini API key not configured"
        }), 200
        
    except Exception as e:
        print(f"❌ [CHAT STATUS ERROR] {str(e)}")
        return jsonify({
            "status": "error",
            "configured": False,
            "message": str(e)
        }), 500
