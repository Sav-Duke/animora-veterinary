# 🔐 Admin Panel Security Guide

## Current Password

**Default Password:** `Animora@2025!`

⚠️ **IMPORTANT:** Change this password immediately!

## How to Change Password

1. Open `admin/index.html`
2. Find line 11: `const ADMIN_PASSWORD = 'Animora@2025!';`
3. Change `'Animora@2025!'` to your new password
4. Open `admin/auth-check.js`
5. Find line 6: `const ADMIN_PASSWORD = 'Animora@2025!';`
6. Change to the SAME password
7. Save both files
8. Push to GitHub to update live site

## Password Requirements

- Minimum 8 characters
- Include uppercase and lowercase letters
- Include numbers
- Include special characters (!@#$%^&*)
- Don't use common words or personal info

## Security Features

✅ **Session-based authentication:** Password required once per browser session
✅ **Auto-redirect:** Unauthorized users sent to main site
✅ **Protected pages:** All admin pages check authentication
✅ **Logout function:** Clear session and return to main site

## Testing

1. Close all browser tabs
2. Visit: http://127.0.0.1:8080/admin
3. Enter password: `Animora@2025!`
4. You should see the admin dashboard

## For Production (Render)

**Better Option:** Use Render's built-in authentication

1. Go to Render Dashboard → Your Service
2. Click **Settings** tab
3. Scroll to **HTTP Basic Auth**
4. Enable it
5. Set username: `admin`
6. Set password: Your choice
7. Save changes

This protects your admin panel BEFORE the page loads - more secure!

## Current Protection Level

🟡 **Medium Security**
- Client-side password check
- Good for private use
- Not suitable for high-security needs

For maximum security, use Render's HTTP Basic Auth + this password protection together!
