# Environment Variables Setup for Render

## Required Environment Variables

Add these environment variables in your Render dashboard:

### 1. CORS_ORIGINS
```
http://localhost:5173,http://localhost:5174,https://ai-learning-platform-three.vercel.app
```

### 2. SMTP_EMAIL
Your Gmail address for sending OTP emails
```
your-email@gmail.com
```

### 3. SMTP_PASSWORD
Your Gmail App Password (NOT your regular Gmail password)

**How to get Gmail App Password:**

1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", enable "2-Step Verification" (if not already enabled)
4. After enabling 2-Step Verification, go back to Security
5. Under "Signing in to Google", click on "App passwords"
6. Select "Mail" and "Other (Custom name)"
7. Enter "EduAI Platform" as the custom name
8. Click "Generate"
9. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)
10. Remove spaces and use it: `abcdefghijklmnop`

```
your-16-character-app-password
```

### 4. Existing Variables (keep these as they are)
- `DATABASE_URL` - Your Supabase connection string
- `SECRET_KEY` - Your Flask secret key
- `JWT_SECRET_KEY` - Your JWT secret key
- `FLASK_ENV` - Set to `production`

## Steps to Add on Render:

1. Go to https://dashboard.render.com/
2. Click on your backend service: **ai-learning-platform-eie9**
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable listed above
6. Click **Save Changes**
7. Wait 2-3 minutes for automatic redeployment

## Testing:

After deployment, test the signup flow:
1. Go to https://ai-learning-platform-three.vercel.app/signup
2. Fill in the signup form
3. Click "Sign Up & Start Learning"
4. You should receive an OTP email within 30 seconds
5. Enter the OTP on the verification page
6. After verification, you'll be redirected to the dashboard

## Troubleshooting:

### Email not sending?
- Check SMTP_EMAIL is correct
- Verify SMTP_PASSWORD is your App Password (not regular password)
- Check Gmail settings allow less secure apps
- Look at Render logs for email errors

### CORS errors?
- Verify CORS_ORIGINS includes your Vercel URL
- Make sure there are no spaces in the URL list
- Restart the Render service after updating

### OTP expired?
- OTPs expire after 10 minutes
- Click "Resend OTP" to get a new one
- You have 3 attempts per OTP
