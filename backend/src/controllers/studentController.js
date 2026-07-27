const Student = require('../models/Student');
const Resource = require('../models/Resource');
const Category = require('../models/Category');
const bcrypt = require('bcryptjs');

// ─── Auth Controllers ─────────────────────────────────────────────────────────
const signup = async (req, res) => {
    try {
        const { name, email, password, secretPin } = req.body;
        const existing = await Student.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const student = new Student({ name, email, password, secretPin });
        await student.save();
        req.session.studentId = student._id;
        res.status(201).json({
            message: 'Signup success',
            student: {
                id: student._id,
                name: student.name,
                email: student.email
            }
        });
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const student = await Student.findOne({ email });

        if (!student) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (student.isBlocked) {
            return res.status(403).json({ error: 'Your account is blocked' });
        }

        const isMatch = await student.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.studentId = student._id;
        res.json({
            message: 'Login success',
            student: {
                id: student._id,
                name: student.name,
                email: student.email
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

const logout = (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logged out' });
    });
};

// ─── Dashboard Controller ─────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
    try {
        const student = await Student.findById(req.session.studentId).select('-password');
        const distinctCategories = await Resource.distinct('category');
        const defaultCategories = ['HTML', 'CSS', 'Javascript', 'Node.js', 'MongoDB', 'Projects'];
        const catNames = [...new Set([...defaultCategories, ...distinctCategories])];

        const categoryInfo = await Category.find({ name: { $in: catNames } });
        const protectedCategories = categoryInfo.filter(c => c.password).map(c => c.name);
        const unlockedCategories = req.session.unlockedCategories || [];

        res.json({ student, categories: catNames, protectedCategories, unlockedCategories });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Category Controllers ─────────────────────────────────────────────────────
const getCategoryPage = async (req, res) => {
    try {
        const categoryName = req.params.name;
        const category = await Category.findOne({ name: categoryName });
        const student = await Student.findById(req.session.studentId).select('-password');

        if (category && category.password) {
            const unlocked = req.session.unlockedCategories || [];
            if (!unlocked.includes(categoryName)) {
                return res.status(403).json({ error: 'Category is locked', category: categoryName });
            }
        }

        const resources = await Resource.find({ category: categoryName }).sort('-createdAt');
        res.json({ category: categoryName, resources, student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const unlockCategory = async (req, res) => {
    try {
        const categoryName = req.params.name;
        const { password } = req.body;
        const category = await Category.findOne({ name: categoryName });

        if (category && category.password === password) {
            if (!req.session.unlockedCategories) {
                req.session.unlockedCategories = [];
            }
            if (!req.session.unlockedCategories.includes(categoryName)) {
                req.session.unlockedCategories.push(categoryName);
            }
            return res.json({ success: true, message: 'Category unlocked' });
        } else {
            return res.status(401).json({ error: 'Incorrect Password' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Resource Controller ──────────────────────────────────────────────────────
const getResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) return res.status(404).json({ error: 'Resource not found' });
        res.json({ resource });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Health Check ─────────────────────────────────────────────────────────────
const healthCheck = (req, res) => {
    res.json({ status: 'ok', message: 'Learn.Dev API is running' });
};

module.exports = {
    signup,
    login,
    logout,
    getDashboard,
    getCategoryPage,
    unlockCategory,
    getResource,
    healthCheck
};
