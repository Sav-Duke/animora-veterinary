# Content Management System - Quick Guide

## Overview
The Animora website now includes a comprehensive Content Management System (CMS) accessible through the admin dashboard. This allows you to easily edit website content without touching the code.

## Access the Admin Dashboard
1. Open your browser and go to: `http://localhost:8080/admin/`
2. You'll see the admin dashboard with various management options

## What You Can Manage

### 1. 👥 Manage Team (Staff Members)
**URL:** `http://localhost:8080/admin/staff-manager.html`

Edit the team members shown on the "Our Team" page:
- Add new team members
- Edit existing members (name, title, bio, image)
- Delete team members
- Upload team member photos

**Changes appear on:** `http://localhost:8080/staff.html`

---

### 2. 🏥 Manage Services
**URL:** `http://localhost:8080/admin/services-manager.html`

Edit all veterinary services across four categories:
- **Pet Care** - Services for domestic animals
- **Livestock Services** - Farm animal services
- **Laboratory & Diagnostics** - Testing services
- **Consultation & Advisory** - Consulting services

For each service you can edit:
- Service title
- Short description (shown on cards)
- Full description (shown when expanded)
- Category placement

**Changes appear on:** `http://localhost:8080/services.html`

---

### 3. 📞 Contact Information
**URL:** `http://localhost:8080/admin/contact-manager.html`

Update clinic contact details:
- Phone number
- Email address
- Physical address
- Business hours (weekdays, Saturday, Sunday)
- Emergency service note
- Social media links (Facebook, Twitter, Instagram)

**Data stored in:** `data/contact-info.json`

---

### 4. 📝 About Content
**URL:** `http://localhost:8080/admin/about-manager.html`

Edit the "About Us" page content:
- Main heading and introduction
- Promise/commitment section
- Mission statement
- Vision statement
- Core values list (add/remove values)

**Changes appear on:** `http://localhost:8080/about.html`

---

## How to Use the CMS

### Adding New Content
1. Click the "➕ Add New" button
2. Fill in all required fields (marked with *)
3. Click "Save"
4. Content appears immediately on the website

### Editing Existing Content
1. Click "Edit" on any item card
2. Update the fields
3. Click "Save"
4. Changes are applied immediately

### Deleting Content
1. Click "Delete" on any item card
2. Confirm the deletion
3. Item is removed from the website

### Tips
- All changes are saved in JSON files in the `data/` folder
- Changes are instant - no need to restart servers
- Always preview changes on the live site
- Keep backups of your data files

---

## Data Storage

All content is stored in JSON files:
```
data/
  ├── staff.json          # Team members
  ├── services.json       # Service offerings
  ├── contact-info.json   # Contact details
  ├── about-content.json  # About page content
  └── vets.json          # Veterinarian directory
```

---

## API Endpoints

The system uses these API endpoints:
- `GET/POST /api/staff` - Team members
- `GET/POST /api/services` - Services
- `GET/POST /api/contact-info` - Contact information
- `GET/POST /api/about-content` - About content

---

## Troubleshooting

**Changes not appearing?**
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors
- Verify the web server is running on port 8080

**Can't save changes?**
- Ensure the web server has write permissions to the `data/` folder
- Check that all required fields are filled

**Lost data?**
- Check the `data/` folder for JSON files
- JSON files are automatically created if missing
- Restore from backup if needed

---

## Advanced: Manual Editing

You can also edit the JSON files directly if needed:

1. Navigate to the `data/` folder
2. Open the JSON file in a text editor
3. Edit the content (follow JSON format)
4. Save the file
5. Refresh the website

**Example - Adding a team member manually:**
```json
{
  "id": 4,
  "name": "Dr. Smith",
  "title": "Exotic Animal Specialist",
  "image": "images/smith.jpg",
  "bio": "Specialized in exotic pet care with 15 years experience."
}
```

---

## Future Enhancements

Possible additions:
- Image upload functionality
- Gallery management
- Blog/news management
- Testimonials management
- Appointment settings
- Email template editor

---

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all servers are running
3. Check file permissions in the `data/` folder
4. Review this guide for proper usage

---

**Happy managing! 🎉**
