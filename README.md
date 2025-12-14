# 🚀 Animora Web - Quick Start Guide

## Starting the Application

### Option 1: Using the Batch Script (Easiest)
Double-click `start-servers.bat` in the root folder

### Option 2: Manual Start
1. **Start Backend:**
   ```bash
   cd animora-ai/backend
   npm start
   ```

2. **Start Web Server:**
   ```bash
   node server.js
   ```

## Access Points

- 🌐 **Main Website**: http://localhost:8080
- 🏥 **Admin Panel**: http://localhost:8080/admin/
- 🤖 **AI Chat**: http://localhost:8080/animora-ai/chat.html
- ⚙️ **Backend API**: http://localhost:4001

## Features

✅ Complete AI chat system with 100+ animal diseases
✅ Conversational AI (no OpenAI required - uses Groq)
✅ Admin panel with disease database viewer
✅ Integrated into main website
✅ Professional chat interface

## Troubleshooting

**If admin panel downloads a file instead of opening:**
- Server has been fixed to properly serve HTML with correct Content-Type
- Restart servers if issue persists

**If AI doesn't respond:**
- Check backend is running on port 4001
- Check `animora-ai/backend/.env` has valid API keys

**If port is in use:**
- Kill existing node processes: `taskkill /F /IM node.exe`
- Or use different ports in configuration

## System Status Check

Run this in PowerShell to check all services:
```powershell
Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:8080/admin/" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:4001" -UseBasicParsing
```

All should return Status 200
