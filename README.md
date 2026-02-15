# SkillHub - Course Marketplace with Video Upload

A complete course marketplace platform where you can sell courses with video content and upload videos directly through an admin dashboard.

## Features

✅ **Dynamic Course Management** - Fetch courses from the backend API
✅ **Video Upload System** - Upload videos directly to specific courses via admin panel
✅ **Shopping Cart** - Add/remove courses, calculate totals with tax
✅ **Admin Dashboard** - User-friendly interface to manage course videos
✅ **Video Playback** - Built-in video player in course details
✅ **Responsive Design** - Works on desktop and mobile
✅ **Local Storage** - Cart persists across sessions
✅ **Multiple Categories** - Soft Skills, Tech Skills, Biology, and more

## Installation & Setup

### 1. Install Dependencies

```bash
cd d:\internship2
npm install
```

### 2. Start the Server

```bash
npm start
# or
node server.js
```

The server will start on `http://localhost:3000`

### 3. Access the Website

**Main Website:** http://localhost:3000/index.html
**Admin Dashboard:** http://localhost:3000/admin.html

## Usage

### For Customers

1. Open http://localhost:3000/index.html
2. Browse courses by category
3. Click on a course to view details and video (if uploaded)
4. Add courses to cart
5. Proceed to checkout

### For Admin (Upload Videos)

1. Open http://localhost:3000/admin.html
2. Select a course from the dropdown
3. Choose a video file (MP4, WebM, or OGG format)
4. Click "Upload Video"
5. Video will be processed and stored in the database

## File Structure

```
d:\internship2\
├── server.js              # Express backend server
├── index.html             # Main customer website
├── admin.html             # Admin upload dashboard
├── styles.css             # CSS styling
├── script.js              # Frontend JavaScript
├── package.json           # Node.js dependencies
└── uploads/               # Video storage (created automatically)
    └── videos/            # Uploaded videos
```

## API Endpoints

### Get All Courses
```
GET /api/courses
```

### Get Single Course
```
GET /api/courses/:id
```

### Upload Video for Course
```
POST /api/courses/:id/upload-video
Content-Type: multipart/form-data
Body: video file
```

### Delete Video from Course
```
DELETE /api/courses/:id/video
```

## Configuration

- **Server Port:** 3000
- **Video Upload Limit:** 500MB
- **Supported Video Formats:** MP4, WebM, OGG
- **Supported Video Codecs:** H.264, VP8, Theora

## Database Schema

### Course Object
```javascript
{
  id: number,
  title: string,
  category: "soft-skills" | "tech-skills" | "biology",
  description: string,
  price: number,
  level: "Beginner" | "Intermediate" | "Advanced",
  students: number,
  icon: string (emoji),
  videoUrl: string | null,      // Path to uploaded video
  videoUploadedAt: string | null // ISO timestamp
}
```

## Available Courses

### Soft Skills (4 courses)
- Effective Communication - $49.99
- Leadership Fundamentals - $59.99
- Time Management Mastery - $39.99
- Conflict Resolution - $49.99

### Tech Skills (4 courses)
- Python for Beginners - $69.99
- Web Development with React - $79.99
- Data Science Fundamentals - $89.99
- Full Stack Development - $99.99

### Biology (4 courses)
- Cell Biology Essentials - $59.99
- Genetics and Heredity - $59.99
- Molecular Biology - $69.99
- Human Anatomy and Physiology - $79.99

## Troubleshooting

### "Cannot GET /api/courses" Error
- Make sure Node.js server is running
- Run: `npm start`

### Videos Not Uploading
- Check file size (max 500MB)
- Use supported format: MP4, WebM, or OGG
- Ensure uploads/ directory exists

### CORS Error
- This is normal if you're testing. CORS is configured for localhost
- Make sure both server and client are running on localhost:3000

## Future Enhancements

- User authentication and registration
- Real database (MongoDB/PostgreSQL)
- Video transcoding for multiple quality options
- Course completion tracking
- Certificate generation
- Payment integration
- User dashboard with my courses
- Video progress tracking
- Comments and reviews

## Support

For issues or questions, check that:
1. Node.js is installed
2. npm packages are installed: `npm install`
3. Server is running: `npm start`
4. No other application is using port 3000

## License

This is an original creation with no external templates or plagiarized code.
