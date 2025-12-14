# Floating Blog Button - Quick Guide

## What It Does
Adds a beautiful floating button to all your website pages that links to your blog. The button:
- ✨ Floats in the bottom-right corner
- 🎨 Has smooth animations (bouncing & pulsing)
- 📱 Responsive (becomes circular on mobile)
- ⚙️ Fully customizable from admin panel

## How to Use

### 1. Enable the Button
1. Go to **Admin Dashboard** → **Floating Blog Button**
2. Toggle **"Enable Floating Blog Button"** to ON
3. Enter your blog URL (can be external like `https://yourblog.com` or internal like `/blog.html`)
4. Click **Save**

### 2. Customize Appearance
- **Button Text**: Change "Blog" to anything you want (max 20 characters)
- **Icon**: Choose from 16 emoji icons (📝, ✍️, 📰, 📖, etc.)
- **Color**: Select from 8 gradient color presets
- **Open Behavior**: Toggle to open blog in new tab or same window

### 3. Add to More Pages
The button automatically appears on all pages that include the script:
```html
<script src="js/floating-blog.js"></script>
```

Add this line before the closing `</body>` tag in any HTML page.

## Current Implementation
✅ **Already added to:**
- index.html (Home page)

📝 **To add to other pages:**
Simply add `<script src="js/floating-blog.js"></script>` before `</body>` in:
- about.html
- services.html
- staff.html
- contact.html
- Or any custom pages

## Features
- 🎯 **Live Preview**: See changes instantly before saving
- 💾 **Persistent**: Settings saved in localStorage
- 🚀 **No Database**: Works entirely client-side
- 📊 **Analytics Ready**: Easy to add tracking to button clicks
- 🎨 **Animated**: Gentle floating and pulsing effects

## Mobile Responsive
On screens < 768px wide:
- Button becomes circular
- Only icon shows (text hidden)
- Size optimized: 60x60px
- Perfect for mobile UX

## Tips
1. Use a short, catchy button text (3-5 characters works best)
2. Choose an icon that matches your blog's theme
3. Test the "Open in new tab" option based on user preference
4. The button appears above footer elements (z-index: 999)
5. Button won't show if disabled or URL is empty

## Quick Access
**Admin Panel**: http://localhost:8080/admin/floating-blog.html
