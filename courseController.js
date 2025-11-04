// ============================================
// controllers/courseController.js - Course Management
// ============================================

import { query, transaction } from '../config/database';

// ============================================
// الحصول على جميع اللغات/الكورسات
// ============================================
const getAllLanguages = async (req, res) => {
    try {
        const languages = await query(`
            SELECT 
                l.id,
                l.lang_key,
                l.name,
                l.description,
                l.video_id,
                l.video_type,
                l.icon,
                l.color,
                COUNT(DISTINCT ul.user_id) as enrolled_count
            FROM languages l
            LEFT JOIN user_library ul ON l.id = ul.language_id
            WHERE l.is_active = TRUE
            GROUP BY l.id
            ORDER BY l.name
        `);
        
        res.json({
            success: true,
            data: languages
        });
        
    } catch (error) {
        console.error('Get languages error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// الحصول على لغة محددة مع خريطة الطريق
// ============================================
const getLanguageById = async (req, res) => {
    try {
        const { langKey } = req.params;
        
        // الحصول على اللغة
        const languages = await query(
            'SELECT * FROM languages WHERE lang_key = ? AND is_active = TRUE',
            [langKey]
        );
        
        if (languages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'اللغة غير موجودة'
            });
        }
        
        const language = languages[0];
        
        // الحصول على خريطة الطريق
        const roadmap = await query(
            'SELECT id, step_order, step_title FROM roadmap_steps WHERE language_id = ? ORDER BY step_order',
            [language.id]
        );
        
        language.roadmap = roadmap;
        
        // إذا كان المستخدم مسجل دخول، احصل على تقدمه
        if (req.user) {
            const progress = await query(
                'SELECT progress_percentage, is_completed FROM user_progress WHERE user_id = ? AND language_id = ?',
                [req.user.id, language.id]
            );
            
            const completedSteps = await query(
                'SELECT step_id FROM completed_steps WHERE user_id = ? AND language_id = ?',
                [req.user.id, language.id]
            );
            
            language.userProgress = progress.length > 0 ? progress[0] : null;
            language.completedSteps = completedSteps.map(s => s.step_id);
        }
        
        res.json({
            success: true,
            data: language
        });
        
    } catch (error) {
        console.error('Get language error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// إضافة كورس للمكتبة
// ============================================
const addToLibrary = async (req, res) => {
    try {
        const { langKey } = req.body;
        
        // الحصول على language_id
        const languages = await query(
            'SELECT id FROM languages WHERE lang_key = ? AND is_active = TRUE',
            [langKey]
        );
        
        if (languages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'اللغة غير موجودة'
            });
        }
        
        const languageId = languages[0].id;
        
        // استخدام transaction
        await transaction(async (connection) => {
            // إضافة للمكتبة
            await connection.execute(
                'INSERT IGNORE INTO user_library (user_id, language_id) VALUES (?, ?)',
                [req.user.id, languageId]
            );
            
            // إنشاء سجل تقدم
            await connection.execute(
                'INSERT IGNORE INTO user_progress (user_id, language_id, progress_percentage, is_completed) VALUES (?, ?, 0, FALSE)',
                [req.user.id, languageId]
            );
        });
        
        // تسجيل النشاط
        await query(
            'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
            [req.user.id, 'add_to_library', JSON.stringify({ langKey })]
        );
        
        res.json({
            success: true,
            message: 'تمت الإضافة للمكتبة بنجاح'
        });
        
    } catch (error) {
        console.error('Add to library error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// حذف كورس من المكتبة
// ============================================
const removeFromLibrary = async (req, res) => {
    try {
        const { langKey } = req.params;
        
        const languages = await query(
            'SELECT id FROM languages WHERE lang_key = ?',
            [langKey]
        );
        
        if (languages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'اللغة غير موجودة'
            });
        }
        
        const languageId = languages[0].id;
        
        // حذف من المكتبة (cascade سيحذف التقدم والملاحظات تلقائياً)
        await query(
            'DELETE FROM user_library WHERE user_id = ? AND language_id = ?',
            [req.user.id, languageId]
        );
        
        res.json({
            success: true,
            message: 'تم الحذف من المكتبة'
        });
        
    } catch (error) {
        console.error('Remove from library error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// تحديث التقدم
// ============================================
const updateProgress = async (req, res) => {
    try {
        const { langKey, completedSteps } = req.body;
        
        const languages = await query(
            'SELECT id FROM languages WHERE lang_key = ?',
            [langKey]
        );
        
        if (languages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'اللغة غير موجودة'
            });
        }
        
        const languageId = languages[0].id;
        
        // عدد الخطوات الكلي
        const totalSteps = await query(
            'SELECT COUNT(*) as count FROM roadmap_steps WHERE language_id = ?',
            [languageId]
        );
        
        const total = totalSteps[0].count;
        const completed = completedSteps.length;
        const progress = Math.round((completed / total) * 100);
        
        await transaction(async (connection) => {
            // حذف الخطوات المكتملة القديمة
            await connection.execute(
                'DELETE FROM completed_steps WHERE user_id = ? AND language_id = ?',
                [req.user.id, languageId]
            );
            
            // إضافة الخطوات الجديدة
            if (completedSteps.length > 0) {
                const values = completedSteps.map(stepId => 
                    `(${req.user.id}, ${languageId}, ${stepId})`
                ).join(',');
                
                await connection.execute(
                    `INSERT INTO completed_steps (user_id, language_id, step_id) VALUES ${values}`
                );
            }
            
            // تحديث التقدم
            await connection.execute(
                'UPDATE user_progress SET progress_percentage = ?, is_completed = ? WHERE user_id = ? AND language_id = ?',
                [progress, progress === 100, req.user.id, languageId]
            );
        });
        
        res.json({
            success: true,
            message: 'تم تحديث التقدم',
            data: { progress }
        });
        
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// حفظ/تحديث الملاحظات
// ============================================
const saveNotes = async (req, res) => {
    try {
        const { langKey, noteText } = req.body;
        
        const languages = await query(
            'SELECT id FROM languages WHERE lang_key = ?',
            [langKey]
        );
        
        if (languages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'اللغة غير موجودة'
            });
        }
        
        const languageId = languages[0].id;
        
        // استخدام REPLACE (insert or update)
        await query(
            `INSERT INTO course_notes (user_id, language_id, note_text) 
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE note_text = ?, updated_at = CURRENT_TIMESTAMP`,
            [req.user.id, languageId, noteText, noteText]
        );
        
        res.json({
            success: true,
            message: 'تم حفظ الملاحظات'
        });
        
    } catch (error) {
        console.error('Save notes error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// الحصول على الملاحظات
// ============================================
const getNotes = async (req, res) => {
    try {
        const { langKey } = req.params;
        
        const languages = await query(
            'SELECT id FROM languages WHERE lang_key = ?',
            [langKey]
        );
        
        if (languages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'اللغة غير موجودة'
            });
        }
        
        const notes = await query(
            'SELECT note_text, created_at, updated_at FROM course_notes WHERE user_id = ? AND language_id = ?',
            [req.user.id, languages[0].id]
        );
        
        res.json({
            success: true,
            data: notes.length > 0 ? notes[0] : null
        });
        
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

export {
    getAllLanguages,
    getLanguageById,
    addToLibrary,
    removeFromLibrary,
    updateProgress,
    saveNotes,
    getNotes
};