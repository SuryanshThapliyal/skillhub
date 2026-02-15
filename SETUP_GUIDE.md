# SkillHub Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies

Double-click `setup.bat` in the project folder, or run in terminal:

```bash
cd d:\internship2
npm install
```

### Step 2: Start the Server

Double-click `start.bat`, or run:

```bash
npm start
```

You should see:
```
SkillHub server running on http://localhost:3000
Admin dashboard available at http://localhost:3000/admin.html
```

### Step 3: Open in Browser

- **Customer Website:** http://localhost:3000/index.html
- **Admin Dashboard:** http://localhost:3000/admin.html

---

## How to Use the System

### For Customers (Website)

1. Browse available courses
2. Filter by category (Soft Skills, Tech Skills, Biology)
3. Click on a course to see details and video (if uploaded)
4. Add courses to cart
5. Proceed to checkout

### For Admin (Upload Videos)

1. Go to http://localhost:3000/admin.html
2. Select a course from the dropdown list
3. Click "Select" or choose from the course grid
4. Choose a video file (MP4, WebM, or OGG format)
5. Click "Upload Video"
6. Watch the progress bar
7. Video will be displayed on the course page immediately

---

## Feature Breakdown

### ✅ Dynamic Courses
- Courses are fetched from the backend API
- No hardcoded data
- Changes are reflected in real-time

### ✅ Video Upload System
- Upload videos directly through the admin dashboard
- Supports MP4, WebM, and OGG formats
- Maximum file size: 500MB
- Progress tracking during upload
- Delete videos if needed

### ✅ Video Playback
- Built-in HTML5 video player
- Play videos directly in course details
- Full-screen support
- Download available (browser-dependent)

### ✅ Shopping Cart
- Persistent storage (saves when you close the browser)
- Tax calculation (10%)
- Total and summary
- Remove items
- Checkout functionality

### ✅ Admin Dashboard Features
- List all courses
- View upload status (video uploaded ✓ or not ✗)
- Upload date/time displayed
- Real-time course grid
- Upload progress indicator
- Delete uploaded videos
- Select course from dropdown or grid

---

## File Structure

```
d:\internship2\
├── server.js              ← Backend (Express server)
├── index.html             ← Customer website
├── admin.html             ← Admin upload dashboard
├── styles.css             ← All styling
├── script.js              ← Frontend logic
├── package.json           ← Dependencies
├── setup.bat              ← Install dependencies (Windows)
├── start.bat              ← Start server (Windows)
├── README.md              ← Full documentation
├── SETUP_GUIDE.md         ← This file
└── uploads/               ← Video storage (auto-created)
    └── videos/            ← Uploaded video files
```

---

## Troubleshooting

### Problem: "Cannot find module 'express'"
**Solution:** Run `npm install` first

### Problem: "Error: listen EADDRINUSE :::3000"
**Solution:** Port 3000 is already in use. Either:
- Close other applications using port 3000
- Or change the PORT in server.js to a different number

### Problem: "Videos not showing on website"
**Solution:** 
- Make sure server.js is running
- Refresh the page
- Check admin dashboard shows video as uploaded

### Problem: "Upload fails with 'Network error'"
**Solution:**
- Check file size (max 500MB)
- Ensure file is a valid video format
- Try with a smaller file first
- Check your internet connection

### Problem: "Blank screen on website"
**Solution:**
- Open browser console (F12)
- Check for error messages
- Make sure server is running on localhost:3000
- Try refreshing the page

---

## Adding More Courses

Edit `server.js` and add to the `coursesDatabase` array:

```javascript
{
    id: 13,
    title: "Your Course Title",
    category: "soft-skills", // or "tech-skills" or "biology"
    description: "Course description here",
    price: 99.99,
    level: "Beginner", // Beginner, Intermediate, or Advanced
    students: 100,
    icon: "📚", // Use emoji
    videoUrl: null,
    videoUploadedAt: null
}
```

Then restart the server.

---

## Changing the Port

Edit `server.js` and change:
```javascript
const PORT = 3000;  // Change to any port number
```

---

## Video Format Guide

### Supported Formats
- **MP4** (H.264 video codec) - Most compatible
- **WebM** (VP8/VP9 video codec)
- **OGG** (Theora video codec)

### How to Convert Videos

#### Using FFmpeg (free, open-source):
```bash
# Convert to MP4
ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4

# Convert to WebM
ffmpeg -i input.mp4 -c:v libvpx -c:a libvorbis output.webm
```

#### Using Online Converters:
- https://online-convert.com/
- https://www.cloudconvert.com/

---

## Performance Tips

1. **Optimize videos before uploading**
   - Use MP4 format (most efficient)
   - Keep resolution at 720p or 1080p
   - Compress if possible (keep under 100MB per video)

2. **Organize videos**
   - Keep meaningful file names
   - Upload during off-peak hours for large files

3. **Clear old videos**
   - Delete unused videos to save space
   - Use admin dashboard to manage videos

---

## Security Notes

This is a demo/educational setup. For production:
- Add user authentication
- Implement access control
- Use HTTPS
- Store videos on cloud storage (AWS S3, Google Cloud, etc.)
- Add rate limiting
- Validate file uploads properly
- Use a real database (MongoDB, PostgreSQL, etc.)

---

## Next Steps

1. ✓ Run setup.bat
2. ✓ Run start.bat
3. ✓ Open http://localhost:3000/admin.html
4. ✓ Upload some videos
5. ✓ Visit http://localhost:3000/index.html and see them in action!

---

## Need Help?

1. Check the README.md for detailed information
2. Review comments in server.js and script.js
3. Check browser console (F12) for error messages
4. Verify Node.js and npm are installed: `node --version` and `npm --version`

---

**Happy teaching! 🎓**
