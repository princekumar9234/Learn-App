const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../services/authMiddleware');
const {
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
} = require('../controllers/adminController');

// ─── Public Admin Auth Routes ─────────────────────────────────────────────────
router.post('/login', adminLogin);
router.post('/logout', adminLogout);

// ─── Protected Admin Routes (require admin session) ───────────────────────────
router.use(ensureAdmin);

router.get('/dashboard', getDashboard);

// Resources
router.get('/resources', getAllResources);
router.post('/resource/add', ...addResource);
router.get('/resource/:id', getResource);
router.post('/resource/edit/:id', ...editResource);
router.post('/resource/delete/:id', deleteResource);

// Students
router.get('/students', getAllStudents);
router.post('/student/block/:id', toggleBlockStudent);

// Categories
router.get('/categories', getAllCategories);
router.post('/categories/create', createCategory);
router.post('/categories/update-password', updateCategoryPassword);
router.post('/categories/rename', renameCategory);

module.exports = router;
