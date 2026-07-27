const express = require('express');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');
const cors = require('cors');
const fs = require('fs');
const MongoStore = require('connect-mongo');
const { dbUri } = require('./dataBase/db');
const mongoose = require('mongoose');
const errorHandler = require('./services/errorHandler');

const app = express();

// ─── Trust Proxy (Render / Heroku) ───────────────────────────────────────────
app.set('trust proxy', 1);

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.json({ limit: '100mb' }));
app.use(methodOverride('_method'));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.use(express.static(path.join(__dirname, '../../frontend/public')));

// ─── Ensure Uploads Directory ─────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../frontend/public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Session ──────────────────────────────────────────────────────────────────
app.use(session({
    secret: process.env.SESSION_SECRET || 'devsecretkey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        clientPromise: new Promise((resolve) => {
            if (mongoose.connection.readyState === 1) {
                resolve(mongoose.connection.getClient());
            } else {
                mongoose.connection.once('open', () => {
                    resolve(mongoose.connection.getClient());
                });
            }
        }),
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));



// ─── Global View Locals ───────────────────────────────────────────────────────
app.use((req, res, next) => {
    res.locals.user  = req.session.studentId || null;
    res.locals.admin = req.session.adminId   || null;
    next();
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api',       require('./routes/studentRoutes'));

// ─── React SPA Fallback ───────────────────────────────────────────────────────
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.includes('.')) return next();
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'), (err) => {
        if (err) {
            res.status(404).send("Frontend build not found. Please run 'npm run build' in the frontend directory.");
        }
    });
});

// ─── Friendly 404 for Missing Uploads ────────────────────────────────────────
app.get('/uploads/:filename', (req, res) => {
    res.status(404).send(`
        <div style="font-family:sans-serif;padding:2rem;max-width:600px;margin:0 auto;text-align:center">
            <h2 style="color:#ef4444">⚠️ File Not Found</h2>
            <p>Ye upload file nahi mili ya delete ho chuki hai.</p>
            <a href="javascript:history.back()" style="display:inline-block;margin-top:1rem;padding:0.6rem 1.4rem;background:#6366f1;color:white;border-radius:8px;text-decoration:none">← Go Back</a>
        </div>
    `);
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
