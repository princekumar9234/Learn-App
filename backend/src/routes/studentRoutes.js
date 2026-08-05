const express = require("express");
const router = express.Router();
const { ensureStudent, checkBlocked } = require("../services/authMiddleware");
const {
  signup,
  login,
  logout,
  getDashboard,
  getCategoryPage,
  unlockCategory,
  getResource,
  healthCheck,
} = require("../controllers/studentController");

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get("/health", healthCheck);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// ─── Protected Student Routes ─────────────────────────────────────────────────
router.get("/dashboard", ensureStudent, checkBlocked, getDashboard);
router.get("/category/:name", ensureStudent, checkBlocked, getCategoryPage);
router.post(
  "/category/:name/unlock",
  ensureStudent,
  checkBlocked,
  unlockCategory,
);
router.get("/resource/:id", ensureStudent, getResource);

module.exports = router;
