const Student = require('../models/Student');

module.exports = {
    ensureStudent: (req, res, next) => {
        if (req.session.studentId) {
            return next();
        }
        res.status(401).json({ error: 'Please login first' });
    },

    ensureAdmin: (req, res, next) => {
        if (req.session.adminId) {
            return next();
        }
        res.status(401).json({ error: 'Admin access required' });
    },

    checkBlocked: async (req, res, next) => {
        if (req.session.studentId) {
            try {
                const student = await Student.findById(req.session.studentId);
                if (student && student.isBlocked) {
                    req.session.destroy((err) => {
                        if (err) console.error('Session destroy error during block check:', err);
                    });
                    return res.status(403).json({ error: 'Your account has been blocked by admin.' });
                }
            } catch (err) {
                console.error(err);
            }
        }
        next();
    }
};
