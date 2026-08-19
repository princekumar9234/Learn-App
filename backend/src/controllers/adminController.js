const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Resource = require('../models/Resource');
const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ─── Cloudinary / Multer Setup ───────────────────────────────────────────────
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

let storage;
if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
) {
    storage = new CloudinaryStorage({
        cloudinary,
        params: {
            folder: 'learn-platform-uploads',
            resource_type: 'auto',
            public_id: (req, file) =>
                'pdf-' + Date.now() + '-' + file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_')
        }
    });
} else if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    storage = multer.memoryStorage();
} else {
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, '../../../frontend/public/uploads/'));
        },
        filename: function (req, file, cb) {
            cb(null, 'pdf-' + Date.now() + path.extname(file.originalname));
        }
    });
}

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files allowed!'), false);
    }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const escapeRegex = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

const handleCategoryLock = async (catName, isLockEnabled, lockPassword) => {
    const existingCat = await Category.findOne({
        name: { $regex: new RegExp('^' + escapeRegex(catName) + '$', 'i') }
    });

    let finalCategoryName = catName;

    if (existingCat) {
        finalCategoryName = existingCat.name;
        const isCurrentlyLocked = !!existingCat.password;

        if (isLockEnabled) {
            if (!isCurrentlyLocked && !lockPassword) {
                return { error: 'Lock password required to protect this category.' };
            }
            if (lockPassword) {
                existingCat.password = lockPassword;
                await existingCat.save();
            }
        } else {
            if (isCurrentlyLocked) {
                existingCat.password = null;
                await existingCat.save();
            }
        }
    } else {
        let initialPassword = null;
        if (isLockEnabled) {
            if (!lockPassword) {
                return { error: 'Lock password required to protect this category.' };
            }
            initialPassword = lockPassword;
        }
        await Category.create({ name: catName, password: initialPassword });
    }

    return { finalCategoryName };
};

// ─── Auth Controllers ─────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
        req.session.adminId = admin._id;
        res.json({ message: 'Admin login success', admin: { id: admin._id, email: admin.email } });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

const adminLogout = (req, res) => {
    delete req.session.adminId;
    res.json({ message: 'Admin logged out' });
};

// ─── Dashboard Controller ─────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const resourceCount = await Resource.countDocuments();
        const categoryCount = await Category.countDocuments();
        const recentResources = await Resource.find().sort('-createdAt').limit(5);
        res.json({ studentCount, resourceCount, categoryCount, recentResources });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Resource Controllers ─────────────────────────────────────────────────────
const getAllResources = async (req, res) => {
    try {
        const resources = await Resource.find().sort('-createdAt');
        res.json({ resources });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addResource = [
    upload.single('pdf'),
    async (req, res) => {
        try {
            const { title, description, type, category, lockCategoryEnabled, lockCategoryPassword } = req.body;
            let url = req.body.url;
            if (req.file) {
                url = req.file.path || req.file.secure_url || '/uploads/' + req.file.filename;
            }
            if (!url) return res.status(400).json({ error: 'URL or PDF File required' });

            const catName = String(category || '').trim();
            if (!catName) return res.status(400).json({ error: 'Category is required' });

            const isLockEnabled = lockCategoryEnabled === 'true';
            const lockPassword = String(lockCategoryPassword || '').trim();

            const result = await handleCategoryLock(catName, isLockEnabled, lockPassword);
            if (result.error) return res.status(400).json({ error: result.error });

            const resource = await Resource.create({
                title, description, type, url, category: result.finalCategoryName
            });
            res.status(201).json({ message: 'Resource added', resource });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
];

const getResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ error: 'Not found' });
        res.json({ resource });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const editResource = [
    upload.single('pdf'),
    async (req, res) => {
        try {
            const { title, description, type, category, url: bodyUrl, lockCategoryEnabled, lockCategoryPassword } = req.body;
            let url = bodyUrl;
            if (req.file) {
                url = req.file.path || req.file.secure_url || '/uploads/' + req.file.filename;
            }

            const catName = String(category || '').trim();
            if (!catName) return res.status(400).json({ error: 'Category is required' });

            const isLockEnabled = lockCategoryEnabled === 'true';
            const lockPassword = String(lockCategoryPassword || '').trim();

            const result = await handleCategoryLock(catName, isLockEnabled, lockPassword);
            if (result.error) return res.status(400).json({ error: result.error });

            const resource = await Resource.findByIdAndUpdate(
                req.params.id,
                { title, description, type, category: result.finalCategoryName, ...(url && { url }) },
                { new: true }
            );
            res.json({ message: 'Resource updated', resource });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
];

const deleteResource = async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: 'Resource deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Student Management Controllers ──────────────────────────────────────────
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().sort('-createdAt').select('-password');
        res.json({ students });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const toggleBlockStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        student.isBlocked = !student.isBlocked;
        await student.save();
        res.json({ message: 'Status updated', student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Category Controllers ─────────────────────────────────────────────────────
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort('name');
        res.json({ categories });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, password } = req.body;
        const catName = String(name || '').trim();
        if (!catName) return res.status(400).json({ error: 'Category name is required' });

        const finalPassword =
            password === undefined || password === null || String(password).trim() === ''
                ? null
                : String(password).trim();

        const category = await Category.findOneAndUpdate(
            { name: catName },
            { password: finalPassword },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ message: 'Category ready', category });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateCategoryPassword = async (req, res) => {
    try {
        const { categoryId, password } = req.body;
        await Category.findByIdAndUpdate(categoryId, {
            password: password === '' ? null : password
        });
        res.json({ message: 'Category password updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const renameCategory = async (req, res) => {
    try {
        const { categoryId, newName } = req.body;
        if (!newName) return res.status(400).json({ error: 'Name required' });
        const oldCat = await Category.findById(categoryId);
        if (!oldCat) return res.status(404).json({ error: 'Not found' });
        await Resource.updateMany({ category: oldCat.name }, { category: newName });
        await Category.findByIdAndUpdate(categoryId, { name: newName });
        res.json({ message: 'Category renamed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    adminLogin,
    adminLogout,
    getDashboard,
    getAllResources,
    addResource,
    getResource,
    editResource,
    deleteResource,
    getAllStudents,
    toggleBlockStudent,
    getAllCategories,
    createCategory,
    updateCategoryPassword,
    renameCategory
};
