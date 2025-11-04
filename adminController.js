// ============================================
// controllers/adminController.js - Admin Controller
// ============================================

import { query, transaction } from '../config/database.js';

// ============================================
// Dashboard Statistics
// ============================================
const getDashboardStats = async (req, res) => {
    try {
        // Total users
        const [totalUsers] = await query('SELECT COUNT(*) as count FROM users');
        
        // Total languages
        const [totalLanguages] = await query('SELECT COUNT(*) as count FROM languages WHERE is_active = TRUE');
        
        // Total enrollments
        const [totalEnrollments] = await query('SELECT COUNT(*) as count FROM user_library');
        
        // Average completion rate
        const [avgCompletion] = await query(
            'SELECT ROUND(AVG(progress_percentage), 2) as avg_completion FROM user_progress'
        );
        
        // Recent activity (last 7 days)
        const [recentActivity] = await query(
            'SELECT COUNT(*) as count FROM activity_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );
        
        res.json({
            success: true,
            data: {
                total_users: totalUsers[0].count,
                total_languages: totalLanguages[0].count,
                total_enrollments: totalEnrollments[0].count,
                avg_completion_rate: avgCompletion[0].avg_completion || 0,
                recent_activity: recentActivity[0].count
            }
        });
        
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// Get All Users
// ============================================
const getAllUsers = async (req, res) => {
    try {
        const users = await query(`
            SELECT 
                u.id,
                u.username,
                u.email,
                u.is_admin,
                u.is_active,
                u.created_at,
                u.last_login,
                COUNT(DISTINCT ul.language_id) as total_courses,
                COUNT(DISTINCT CASE WHEN up.is_completed = TRUE THEN up.language_id END) as completed_courses
            FROM users u
            LEFT JOIN user_library ul ON u.id = ul.user_id
            LEFT JOIN user_progress up ON u.id = up.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);
        
        res.json({
            success: true,
            data: users
        });
        
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// Get User Details
// ============================================
const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // User info
        const [user] = await query(
            'SELECT id, username, email, is_admin, is_active, created_at, last_login FROM users WHERE id = ?',
            [userId]
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        
        // User's courses
        const courses = await query(`
            SELECT 
                l.lang_key,
                l.name,
                up.progress_percentage,
                up.is_completed,
                ul.added_at
            FROM user_library ul
            INNER JOIN languages l ON ul.language_id = l.id
            LEFT JOIN user_progress up ON ul.user_id = up.user_id AND ul.language_id = up.language_id
            WHERE ul.user_id = ?
            ORDER BY ul.added_at DESC
        `, [userId]);
        
        // Activity logs
        const logs = await query(
            'SELECT action, details, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [userId]
        );
        
        res.json({
            success: true,
            data: {
                user: user[0],
                courses,
                recent_activity: logs
            }
        });
        
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// Delete User
// ============================================
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Cannot delete self
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكنك حذف حسابك الخاص'
            });
        }
        
        // Check if user exists
        const [user] = await query('SELECT id FROM users WHERE id = ?', [userId]);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        
        // Delete user (cascade will handle related records)
        await query('DELETE FROM users WHERE id = ?', [userId]);
        
        // Log action
        await query(
            'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
            [req.user.id, 'delete_user', JSON.stringify({ deleted_user_id: userId })]
        );
        
        res.json({
            success: true,
            message: 'تم حذف المستخدم بنجاح'
        });
        
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// Toggle User Status
// ============================================
const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Cannot toggle self
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكنك تعطيل حسابك الخاص'
            });
        }
        
        // Toggle status
        await query(
            'UPDATE users SET is_active = NOT is_active WHERE id = ?',
            [userId]
        );
        
        res.json({
            success: true,
            message: 'تم تحديث حالة المستخدم'
        });
        
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// Get Course Statistics
// ============================================
const getCourseStats = async (req, res) => {
    try {
        const stats = await query(`
            SELECT 
                l.lang_key,
                l.name,
                COUNT(DISTINCT ul.user_id) as enrolled_users,
                COUNT(DISTINCT CASE WHEN up.is_completed = TRUE THEN up.user_id END) as completed_users,
                ROUND(AVG(up.progress_percentage), 2) as avg_progress,
                (SELECT COUNT(*) FROM roadmap_steps WHERE language_id = l.id) as total_steps
            FROM languages l
            LEFT JOIN user_library ul ON l.id = ul.language_id
            LEFT JOIN user_progress up ON l.id = up.language_id
            WHERE l.is_active = TRUE
            GROUP BY l.id, l.lang_key, l.name
            ORDER BY enrolled_users DESC
        `);
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Get course stats error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// Add Language
// ============================================
const addLanguage = async (req, res) => {
    try {
        const { langKey, name, description, videoId, videoType, icon, color } = req.body;
        
        // Check if exists
        const existing = await query('SELECT id FROM languages WHERE lang_key = ?', [langKey]);
        
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'اللغة موجودة بالفعل'
            });
        }
        
        // Insert
        await query(
            'INSERT INTO languages (lang_key, name, description, video_id, video_type, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [langKey, name, description, videoId, videoType, icon, color]
        );
        
        res.status(201).json({
            success: true,
            message: 'تم إضافة اللغة بنجاح'
        });
        
    } catch (error) {
        console.error('Add language error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// Update Language
// ============================================
const updateLanguage = async (req, res) => {
    try {
        const { langKey } = req.params;
        const updates = req.body;
        
        // Build update query
        const fields = [];
        const values = [];
        
        Object.keys(updates).forEach(key => {
            if (['name', 'description', 'video_id', 'video_type', 'icon', 'color'].includes(key)) {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });
        
        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'لا توجد حقول للتحديث'
            });
        }
        
        values.push(langKey);
        
        await query(
            `UPDATE languages SET ${fields.join(', ')} WHERE lang_key = ?`,
            values
        );
        
        res.json({
            success: true,
            message: 'تم تحديث اللغة بنجاح'
        });
        
    } catch (error) {
        console.error('Update language error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// Delete Language
// ============================================
const deleteLanguage = async (req, res) => {
    try {
        const { langKey } = req.params;
        
        await query('DELETE FROM languages WHERE lang_key = ?', [langKey]);
        
        res.json({
            success: true,
            message: 'تم حذف اللغة بنجاح'
        });
        
    } catch (error) {
        console.error('Delete language error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// Get Activity Logs
// ============================================
const getActivityLogs = async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        
        const logs = await query(`
            SELECT 
                al.id,
                al.action,
                al.details,
                al.ip_address,
                al.created_at,
                u.username
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT ?
        `, [parseInt(limit)]);
        
        res.json({
            success: true,
            data: logs
        });
        
    } catch (error) {
        console.error('Get activity logs error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// Export Data
// ============================================
const exportData = async (req, res) => {
    try {
        const data = {
            users: await query('SELECT id, username, email, is_admin, created_at FROM users'),
            languages: await query('SELECT * FROM languages WHERE is_active = TRUE'),
            enrollments: await query('SELECT * FROM user_library'),
            progress: await query('SELECT * FROM user_progress'),
            export_date: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data
        });
        
    } catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

export {
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
};