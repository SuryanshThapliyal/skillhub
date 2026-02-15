require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillhub';
const isVercel = process.env.VERCEL === '1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

let hasSeeded = false;
let connectingPromise = null;

async function connectToDatabase() {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!connectingPromise) {
        connectingPromise = mongoose.connect(MONGODB_URI);
    }

    await connectingPromise;

    if (!hasSeeded) {
        await seedInitialData();
        hasSeeded = true;
    }
}

const purchaseSchema = new mongoose.Schema({
    courseId: { type: Number, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    purchasedAt: { type: String, required: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
    token: { type: String, default: null },
    createdAt: { type: String, required: true },
    purchases: { type: [purchaseSchema], default: [] }
});

const courseSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    level: { type: String, required: true },
    students: { type: Number, required: true },
    icon: { type: String, required: true },
    videoUrl: { type: String, default: null },
    videoUploadedAt: { type: String, default: null }
});

const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);

// Simple authentication middleware
async function authenticateToken(req, res, next) {
    try {
        await connectToDatabase();
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
}

// Admin authentication middleware
async function authenticateAdmin(req, res, next) {
    try {
        await connectToDatabase();
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
}

// ============ USERS DATABASE ============
const seedAdminUser = {
    username: 'admin',
    email: 'admin@skillhub.com',
    password: 'admin123',
    role: 'admin',
    token: null,
    createdAt: new Date().toISOString(),
    purchases: []
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'videos');
if (!isVercel) {
    try {
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
    } catch (error) {
        console.warn('Uploads directory unavailable:', error.message);
    }
}

// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    // Allow video files only
    const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed'));
    }
};

const upload = multer({
    storage: isVercel ? multer.memoryStorage() : storage,
    fileFilter: fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// In-memory database (in production, use a real database like MongoDB)
// ============ COURSES DATABASE ============
const seedCourses = [
    {
        id: 1,
        title: "Effective Communication",
        category: "soft-skills",
        description: "Master the art of clear communication, presentation skills, and public speaking to excel in your career.",
        price: 49.99,
        level: "Beginner",
        students: 2450,
        icon: "🎤",
        videoUrl: null,
        videoUploadedAt: null
    },
    {
        id: 2,
        title: "Leadership Fundamentals",
        category: "soft-skills",
        description: "Learn to inspire teams, make decisions, and build strong relationships as a leader.",
        price: 59.99,
        level: "Intermediate",
        students: 1890,
        icon: "👨‍💼",
        videoUrl: null,
        videoUploadedAt: null
    },
    {
        id: 3,
        title: "Time Management Mastery",
        category: "soft-skills",
        description: "Boost productivity with proven time management techniques and goal-setting strategies.",
        price: 39.99,
        level: "Beginner",
        students: 3100,
        icon: "⏱️",
        videoUrl: null,
        videoUploadedAt: null
    },
    {
        id: 4,
        title: "Conflict Resolution",
        category: "soft-skills",
        description: "Learn to navigate workplace conflicts and develop negotiation skills for better outcomes.",
        price: 49.99,
        level: "Intermediate",
        students: 1650,
        icon: "🤝",
        videoUrl: null,
        videoUploadedAt: null
    },
    {
        id: 5,
        title: "Python for Beginners",
        category: "tech-skills",
        description: "Start your programming journey with Python, the most beginner-friendly programming language.",
        price: 69.99,
        level: "Beginner",
        students: 5200,
        icon: "🐍",
        videoUrl: null,
        videoUploadedAt: null
    },
    {
        id: 6,
        title: "Web Development with React",
        category: "tech-skills",
        description: "Build modern web applications using React, JavaScript, and contemporary web technologies.",
        price: 79.99,
        level: "Intermediate",
        students: 3400,
        icon: "⚛️",
        videoUrl: null,
        videoUploadedAt: null
    },
    {
        id: 7,
        title: "Data Science Fundamentals",
        category: "tech-skills",
        description: "Learn data analysis, visualization, and machine learning basics using Python and popular libraries.",
        price: 89.99,
        level: "Intermediate",
        students: 2800,
        icon: "📊",
        videoUrl: null,
        videoUploadedAt: null
    },
    {
        id: 8,
        title: "Full Stack Development",
        category: "tech-skills",
        description: "Master both frontend and backend development to build complete web applications.",
        price: 99.99,
        level: "Advanced",
        students: 2100,
        icon: "💻",
        videoUrl: null,
        videoUploadedAt: null
    },
    {
        id: 9,
        title: "Cell Biology Essentials",
        category: "biology",
        description: "Understand cell structure, function, and the processes that sustain all living organisms.",
        price: 59.99,
        level: "Beginner",
        students: 1200,
        icon: "🧬",
        videoUrl: null,
        videoUploadedAt: null
    },
    {
        id: 10,
        title: "Genetics and Heredity",
        category: "biology",
        description: "Explore the principles of genetics, DNA, and how traits are inherited across generations.",
        price: 59.99,
        level: "Intermediate",
        students: 950,
        icon: "🔬",
        videoUrl: null,
        videoUploadedAt: null
    },
    {
        id: 11,
        title: "Molecular Biology",
        category: "biology",
        description: "Deep dive into molecular mechanisms of life, protein synthesis, and cellular regulation.",
        price: 69.99,
        level: "Advanced",
        students: 680,
        icon: "🧪",
        videoUrl: null,
        videoUploadedAt: null
    },
    {
        id: 12,
        title: "Human Anatomy and Physiology",
        category: "biology",
        description: "Learn about the human body systems, organs, and how they work together to maintain life.",
        price: 79.99,
        level: "Intermediate",
        students: 1540,
        icon: "🫀",
        videoUrl: null,
        videoUploadedAt: null
    }
];

async function seedInitialData() {
    const adminExists = await User.findOne({ email: seedAdminUser.email });
    if (!adminExists) {
        await User.create(seedAdminUser);
    }

    const courseCount = await Course.countDocuments();
    if (courseCount === 0) {
        await Course.insertMany(seedCourses);
    }
}

app.use('/api', async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// API Routes

// ============ AUTHENTICATION ROUTES ============

// USER SIGNUP
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email: email }, { username: username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Email or username already exists' });
        }

        // Create new user
        const token = 'token_' + uuidv4();
        const newUser = await User.create({
            username,
            email,
            password, // In production, hash this!
            role: 'user',
            token,
            createdAt: new Date().toISOString(),
            purchases: []
        });

        res.json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// USER LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email, password: password });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate new token
        const token = 'token_' + uuidv4();
        user.token = token;
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// USER LOGOUT
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    req.user.token = null;
    await req.user.save();
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// GET CURRENT USER
app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        purchases: req.user.purchases
    });
});

// ============ COURSE ROUTES ============

// Get all courses
app.get('/api/courses', async (req, res) => {
    const courses = await Course.find().sort({ id: 1 });
    res.json(courses);
});

// Get single course
app.get('/api/courses/:id', async (req, res) => {
    const course = await Course.findOne({ id: parseInt(req.params.id) });
    if (!course) {
        return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
});

// ============ PURCHASE ROUTES ============

// PURCHASE a course
app.post('/api/purchase', authenticateToken, async (req, res) => {
    try {
        const { courses } = req.body; // Array of course IDs

        if (!courses || !Array.isArray(courses) || courses.length === 0) {
            return res.status(400).json({ error: 'No courses to purchase' });
        }

        const purchasedCourses = [];
        let totalPrice = 0;

        const courseDocs = await Course.find({ id: { $in: courses } });
        const courseMap = new Map(courseDocs.map(course => [course.id, course]));

        for (const courseId of courses) {
            const course = courseMap.get(courseId);
            if (course) {
                const alreadyPurchased = req.user.purchases.some(p => p.courseId === courseId);
                if (!alreadyPurchased) {
                    const purchase = {
                        courseId: course.id,
                        title: course.title,
                        price: course.price,
                        purchasedAt: new Date().toISOString()
                    };
                    purchasedCourses.push(purchase);
                    totalPrice += course.price;
                    req.user.purchases.push(purchase);
                }
            }
        }

        await req.user.save();

        res.json({
            success: true,
            message: 'Purchase successful',
            courses: purchasedCourses,
            totalPrice: totalPrice,
            totalWithTax: totalPrice * 1.1
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user purchases
app.get('/api/purchases', authenticateToken, async (req, res) => {
    try {
        const courseIds = req.user.purchases.map(purchase => purchase.courseId);
        const courseDocs = await Course.find({ id: { $in: courseIds } });
        const courseMap = new Map(courseDocs.map(course => [course.id, course]));

        const userCourses = req.user.purchases.map(purchase => {
            const courseData = courseMap.get(purchase.courseId);
            return {
                ...purchase,
                videoUrl: courseData?.videoUrl || null
            };
        });

        res.json({
            purchases: userCourses,
            total: userCourses.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ ADMIN VIDEO UPLOAD ROUTES ============

// Upload video for a course (admin only)
app.post('/api/courses/:id/upload-video', authenticateAdmin, upload.single('video'), async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(400).json({ error: 'Video uploads are disabled in production. Use cloud storage.' });
        }

        const courseId = parseInt(req.params.id);
        const course = await Course.findOne({ id: courseId });

        if (!course) {
            // Clean up uploaded file if course not found
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ error: 'Course not found' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        // Delete old video if exists
        if (course.videoUrl) {
            const oldVideoPath = path.join(__dirname, course.videoUrl);
            if (fs.existsSync(oldVideoPath)) {
                fs.unlinkSync(oldVideoPath);
            }
        }

        // Update course with new video URL
        const videoUrl = `/uploads/videos/${req.file.filename}`;
        course.videoUrl = videoUrl;
        course.videoUploadedAt = new Date().toISOString();
        await course.save();

        res.json({
            success: true,
            message: 'Video uploaded successfully',
            course: course
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete video from a course (admin only)
app.delete('/api/courses/:id/video', authenticateAdmin, async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(400).json({ error: 'Video deletes are disabled in production. Use cloud storage.' });
        }

        const courseId = parseInt(req.params.id);
        const course = await Course.findOne({ id: courseId });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.videoUrl) {
            const videoPath = path.join(__dirname, course.videoUrl);
            if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath);
            }
        }

        course.videoUrl = null;
        course.videoUploadedAt = null;
        await course.save();

        res.json({
            success: true,
            message: 'Video deleted successfully',
            course: course
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve video files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
if (!isVercel) {
    app.listen(PORT, () => {
        console.log(`SkillHub server running on http://localhost:${PORT}`);
        console.log(`Admin dashboard available at http://localhost:${PORT}/admin.html`);
    });
}

module.exports = app;
