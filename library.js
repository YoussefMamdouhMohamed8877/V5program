// ============================================
// routes/library.js - Library Routes
// ============================================

import express from 'express';
import {
    getMyLibrary,
    getLibraryStats,
    getCompletedCourses,
    getInProgressCourses
} from '../controllers/libraryController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// Routes - All require authentication
// ============================================

// @route   GET /api/library
// @desc    Get user's library (all enrolled courses)
// @access  Private
router.get('/', verifyToken, getMyLibrary);

// @route   GET /api/library/stats
// @desc    Get library statistics
// @access  Private
router.get('/stats', verifyToken, getLibraryStats);

// @route   GET /api/library/completed
// @desc    Get completed courses only
// @access  Private
router.get('/completed', verifyToken, getCompletedCourses);

// @route   GET /api/library/in-progress
// @desc    Get in-progress courses only
// @access  Private
router.get('/in-progress', verifyToken, getInProgressCourses);

export default router;