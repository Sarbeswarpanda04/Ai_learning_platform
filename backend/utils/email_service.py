"""
Email Service for sending OTP and notifications using Brevo (formerly Sendinblue)
"""
import os
import random
import string
from datetime import datetime, timedelta
from functools import wraps
import requests

# Store OTPs in memory (in production, use Redis or database)
otp_store = {}

def generate_otp(length=6):
    """Generate a random OTP"""
    return ''.join(random.choices(string.digits, k=length))

def send_email(to_email, subject, html_content, sender_name="EduAI Platform"):
    """
    Send email using Brevo API (formerly Sendinblue)
    """
    try:
        # Brevo API configuration
        api_key = os.environ.get('BREVO_API_KEY') or os.environ.get('SMTP_PASSWORD')
        sender_email = os.environ.get('BREVO_SENDER_EMAIL') or os.environ.get('SMTP_EMAIL', 'app.ailearn@gmail.com')
        
        if not api_key:
            print("Warning: Brevo API key not configured (BREVO_API_KEY)")
            return False
        
        # Brevo API endpoint
        url = "https://api.brevo.com/v3/smtp/email"
        
        # Request headers
        headers = {
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json"
        }
        
        # Email payload
        payload = {
            "sender": {
                "name": sender_name,
                "email": sender_email
            },
            "to": [
                {
                    "email": to_email,
                    "name": to_email.split('@')[0]
                }
            ],
            "subject": subject,
            "htmlContent": html_content
        }
        
        # Send request
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code in [200, 201]:
            print(f"Email sent successfully to {to_email} via Brevo")
            return True
        else:
            print(f"Failed to send email. Status: {response.status_code}, Response: {response.text}")
            return False
        
    except Exception as e:
        print(f"Failed to send email via Brevo: {str(e)}")
        return False

def send_otp_email(email, otp, name="User"):
    """
    Send OTP verification email
    """
    subject = "Verify Your Email - EduAI Platform"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 20px;
                text-align: center;
                color: white;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
            }}
            .content {{
                padding: 40px 30px;
                text-align: center;
            }}
            .otp-box {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-size: 36px;
                font-weight: bold;
                letter-spacing: 8px;
                padding: 20px;
                border-radius: 10px;
                margin: 30px 0;
                display: inline-block;
            }}
            .message {{
                color: #666;
                font-size: 16px;
                line-height: 1.6;
                margin: 20px 0;
            }}
            .footer {{
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #666;
                font-size: 14px;
                border-top: 1px solid #e9ecef;
            }}
            .warning {{
                color: #dc3545;
                font-size: 14px;
                margin-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 EduAI Platform</h1>
                <p>AI-Powered Personalized Learning</p>
            </div>
            <div class="content">
                <h2>Hello {name}! 👋</h2>
                <p class="message">
                    Thank you for signing up with EduAI Platform. To complete your registration, 
                    please verify your email address using the OTP below:
                </p>
                <div class="otp-box">
                    {otp}
                </div>
                <p class="message">
                    This OTP will expire in <strong>10 minutes</strong>.
                </p>
                <p class="warning">
                    ⚠️ If you didn't request this code, please ignore this email.
                </p>
            </div>
            <div class="footer">
                <p>© 2025 EduAI Platform - Learn. Adapt. Succeed.</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, subject, html_content)

def store_otp(email, otp):
    """
    Store OTP with expiration time (10 minutes)
    """
    expiry_time = datetime.now() + timedelta(minutes=10)
    otp_store[email] = {
        'otp': otp,
        'expiry': expiry_time,
        'attempts': 0
    }

def verify_otp(email, otp):
    """
    Verify OTP for given email
    Returns: (success: bool, message: str)
    """
    if email not in otp_store:
        return False, "No OTP found for this email. Please request a new one."
    
    stored_data = otp_store[email]
    
    # Check expiration
    if datetime.now() > stored_data['expiry']:
        del otp_store[email]
        return False, "OTP has expired. Please request a new one."
    
    # Check attempts
    if stored_data['attempts'] >= 3:
        del otp_store[email]
        return False, "Too many incorrect attempts. Please request a new OTP."
    
    # Verify OTP
    if stored_data['otp'] == otp:
        del otp_store[email]  # Remove OTP after successful verification
        return True, "Email verified successfully!"
    else:
        stored_data['attempts'] += 1
        remaining = 3 - stored_data['attempts']
        return False, f"Incorrect OTP. {remaining} attempts remaining."

def resend_otp(email, name="User"):
    """
    Resend OTP to email
    """
    # Generate new OTP
    otp = generate_otp()
    
    # Send email
    if send_otp_email(email, otp, name):
        store_otp(email, otp)
        return True, "OTP sent successfully!"
    else:
        return False, "Failed to send OTP. Please try again."

def cleanup_expired_otps():
    """
    Remove expired OTPs from store
    """
    current_time = datetime.now()
    expired_emails = [
        email for email, data in otp_store.items()
        if current_time > data['expiry']
    ]
    for email in expired_emails:
        del otp_store[email]
