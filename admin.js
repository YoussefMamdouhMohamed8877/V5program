// ============================================
// routes/admin.js - Admin Routes
// ============================================

import express from 'express';
import { body } from 'express-validator';
import {
    getDashboardStats,
    getAllUsers,
    getUserDetails,
    deleteUser,
    toggleUserStatus,
    getCourseStats,
    addLanguage,
    updateLanguage,
    deleteLanguage,
    getActivityLogs,
    exportData
} from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(verifyToken, isAdmin);

// ============================================
// Validation Rules
// ============================================

const addLanguageValidation = [
    body('langKey')
        .trim()
        .notEmpty()
        .withMessage('langKey مطلوب')
        .isLength({ max: 50 })
        .withMessage('langKey طويل جداً'),
    
    body('name')
        .trim()
        .notEmpty()
        .withMessage('اسم اللغة مطلوب')
        .isLength({ max: 100 })
        .withMessage('اسم اللغة طويل جداً'),
    
    body('videoId')
        .trim()
        .notEmpty()
        .withMessage('معرف الفيديو مطلوب'),
    
    body('videoType')
        .isIn(['video', 'playlist'])
        .withMessage('نوع الفيديو يجب أن يكون video أو playlist')
];

// ============================================
// Dashboard & Stats Routes
// ============================================

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', getDashboardStats);

// @route   GET /api/admin/courses/stats
// @desc    Get course statistics
// @access  Private/Admin
router.get('/courses/stats', getCourseStats);

// ============================================
// User Management Routes
// ============================================

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:userId
// @desc    Get user details
// @access  Private/Admin
router.get('/users/:userId', getUserDetails);

// @route   DELETE /api/admin/users/:userId
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:userId', deleteUser);

// @route   PUT /api/admin/users/:userId/toggle-status
// @desc    Toggle user active status
// @access  Private/Admin
router.put('/users/:userId/toggle-status', toggleUserStatus);

// ============================================
// Course Management Routes
// ============================================

// @route   POST /api/admin/courses
// @desc    Add new language/course
// @access  Private/Admin
router.post('/courses', addLanguageValidation, addLanguage);

// @route   PUT /api/admin/courses/:langKey
// @desc    Update language/course
// @access  Private/Admin
router.put('/courses/:langKey', updateLanguage);

// @route   DELETE /api/admin/courses/:langKey
// @desc    Delete language/course
// @access  Private/Admin
router.delete('/courses/:langKey', deleteLanguage);

// ============================================
// Logs & Export Routes
// ============================================

// @route   GET /api/admin/logs
// @desc    Get activity logs
// @access  Private/Admin
router.get('/logs', getActivityLogs);

// @route   GET /api/admin/export
// @desc    Export all data
// @access  Private/Admin
router.get('/export', exportData);

export default router;