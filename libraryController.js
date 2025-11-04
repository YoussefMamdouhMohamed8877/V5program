// ============================================
// controllers/libraryController.js - User Library
// ============================================

import { query } from '../config/database.js';

// ============================================
// الحصول على مكتبة المستخدم
// ============================================
const getMyLibrary = async (req, res) => {
    try {
        const library = await query(`
            SELECT 
                l.id,
                l.lang_key,
                l.name,
                l.description,
                l.icon,
                l.color,
                up.progress_percentage,
                up.is_completed,
                up.last_accessed,
                ul.added_at
            FROM user_library ul
            INNER JOIN languages l ON ul.language_id = l.id
            LEFT JOIN user_progress up ON ul.user_id = up.user_id AND ul.language_id = up.language_id
            WHERE ul.user_id = ? AND l.is_active = TRUE
            ORDER BY ul.added_at DESC
        `, [req.user.id]);
        
        res.json({
            success: true,
            data: library
        });
        
    } catch (error) {
        console.error('Get library error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// إحصائيات المكتبة
// ============================================
const getLibraryStats = async (req, res) => {
    try {
        const stats = await query(`
            SELECT 
                COUNT(DISTINCT ul.language_id) as total_courses,
                COUNT(DISTINCT CASE WHEN up.is_completed = TRUE THEN ul.language_id END) as completed_courses,
                COUNT(DISTINCT CASE WHEN up.progress_percentage > 0 AND up.is_completed = FALSE THEN ul.language_id END) as in_progress_courses,
                ROUND(AVG(up.progress_percentage), 2) as average_progress
            FROM user_library ul
            LEFT JOIN user_progress up ON ul.user_id = up.user_id AND ul.language_id = up.language_id
            WHERE ul.user_id = ?
        `, [req.user.id]);
        
        res.json({
            success: true,
            data: stats[0]
        });
        
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// الكورسات المكتملة فقط
// ============================================
const getCompletedCourses = async (req, res) => {
    try {
        const completed = await query(`
            SELECT 
                l.lang_key,
                l.name,
                l.icon,
                l.color,
                up.progress_percentage,
                (SELECT MAX(completed_at) FROM completed_steps WHERE user_id = ? AND language_id = l.id) as completed_at
            FROM user_library ul
            INNER JOIN languages l ON ul.language_id = l.id
            INNER JOIN user_progress up ON ul.user_id = up.user_id AND ul.language_id = up.language_id
            WHERE ul.user_id = ? AND up.is_completed = TRUE
            ORDER BY completed_at DESC
        `, [req.user.id, req.user.id]);
        
        res.json({
            success: true,
            data: completed
        });
        
    } catch (error) {
        console.error('Get completed error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// الكورسات قيد الدراسة
// ============================================
const getInProgressCourses = async (req, res) => {
    try {
        const inProgress = await query(`
            SELECT 
                l.lang_key,
                l.name,
                l.icon,
                l.color,
                up.progress_percentage,
                up.last_accessed
            FROM user_library ul
            INNER JOIN languages l ON ul.language_id = l.id
            INNER JOIN user_progress up ON ul.user_id = up.user_id AND ul.language_id = up.language_id
            WHERE ul.user_id = ? AND up.progress_percentage > 0 AND up.is_completed = FALSE
            ORDER BY up.last_accessed DESC
        `, [req.user.id]);
        
        res.json({
            success: true,
            data: inProgress
        });
        
    } catch (error) {
        console.error('Get in progress error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

export {
    getMyLibrary,
    getLibraryStats,
    getCompletedCourses,
    getInProgressCourses
};