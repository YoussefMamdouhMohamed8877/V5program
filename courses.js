// ============================================
// routes/courses.js - Courses Routes
// ============================================

import express from 'express';
import { body } from 'express-validator';
import {
    getAllLanguages,
    getLanguageById,
    addToLibrary,
    removeFromLibrary,
    updateProgress,
    saveNotes,
    getNotes
} from '../controllers/courseController.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// Validation Rules
// ============================================

const addToLibraryValidation = [
    body('langKey')
        .trim()
        .notEmpty()
        .withMessage('langKey مطلوب')
        .isLength({ max: 50 })
        .withMessage('langKey طويل جداً')
];

const updateProgressValidation = [
    body('langKey')
        .trim()
        .notEmpty()
        .withMessage('langKey مطلوب'),
    
    body('completedSteps')
        .isArray()
        .withMessage('completedSteps يجب أن يكون مصفوفة')
];

const saveNotesValidation = [
    body('langKey')
        .trim()
        .notEmpty()
        .withMessage('langKey مطلوب'),
    
    body('noteText')
        .trim()
        .isLength({ max: 5000 })
        .withMessage('الملاحظة طويلة جداً (حد أقصى 5000 حرف)')
];

// ============================================
// Routes
// ============================================

// @route   GET /api/courses
// @desc    Get all languages/courses
// @access  Public (with optional auth for user-specific data)
router.get('/', optionalAuth, getAllLanguages);

// @route   GET /api/courses/:langKey
// @desc    Get language details with roadmap
// @access  Public (with optional auth)
router.get('/:langKey', optionalAuth, getLanguageById);

// @route   POST /api/courses/library/add
// @desc    Add course to user library
// @access  Private
router.post('/library/add', verifyToken, addToLibraryValidation, addToLibrary);

// @route   DELETE /api/courses/library/:langKey
// @desc    Remove course from user library
// @access  Private
router.delete('/library/:langKey', verifyToken, removeFromLibrary);

// @route   PUT /api/courses/progress
// @desc    Update course progress
// @access  Private
router.put('/progress', verifyToken, updateProgressValidation, updateProgress);

// @route   POST /api/courses/notes
// @desc    Save course notes
// @access  Private
router.post('/notes', verifyToken, saveNotesValidation, saveNotes);

// @route   GET /api/courses/notes/:langKey
// @desc    Get course notes
// @access  Private
router.get('/notes/:langKey', verifyToken, getNotes);

export default router;