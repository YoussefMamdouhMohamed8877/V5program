-- ============================================
-- Fast Learn Programming Database Schema
-- MySQL Database - FIXED VERSION
-- ============================================

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS fast_learn_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fast_learn_db;

-- ============================================
-- جدول المستخدمين
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- جدول اللغات البرمجية (الكورسات)
-- ============================================
CREATE TABLE IF NOT EXISTS languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lang_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    video_id VARCHAR(100) NOT NULL,
    video_type ENUM('video', 'playlist') DEFAULT 'video',
    icon VARCHAR(100),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_lang_key (lang_key),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- جدول خريطة الطريق
-- ============================================
CREATE TABLE IF NOT EXISTS roadmap_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language_id INT NOT NULL,
    step_order INT NOT NULL,
    step_title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
    INDEX idx_language_order (language_id, step_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- جدول المكتبة الشخصية
-- ============================================
CREATE TABLE IF NOT EXISTS user_library (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    language_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_language (user_id, language_id),
    INDEX idx_user (user_id),
    INDEX idx_language (language_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- جدول التقدم
-- ============================================
CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    language_id INT NOT NULL,
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    is_completed BOOLEAN DEFAULT FALSE,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_language_progress (user_id, language_id),
    INDEX idx_user_progress (user_id, language_id),
    INDEX idx_completed (is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- جدول الخطوات المكتملة
-- ============================================
CREATE TABLE IF NOT EXISTS completed_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    language_id INT NOT NULL,
    step_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES roadmap_steps(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_step (user_id, step_id),
    INDEX idx_user_language (user_id, language_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- جدول الملاحظات
-- ============================================
CREATE TABLE IF NOT EXISTS course_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    language_id INT NOT NULL,
    note_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_language_note (user_id, language_id),
    INDEX idx_user_notes (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- جدول الجلسات (لتسجيل الدخول)
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token_hash),
    INDEX idx_user_session (user_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- جدول السجلات (Logs)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_logs (user_id),
    INDEX idx_created (created_at),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- إدراج البيانات الأساسية
-- ============================================

-- إدراج اللغات البرمجية
INSERT INTO languages (lang_key, name, description, video_id, video_type, icon, color) VALUES
('html', 'HTML', 'تعلم HTML من الصفر - لغة ترميز النصوص التشعبية', 'cvNTgKw8VlY', 'video', 'fab fa-html5', '#e34c26'),
('css', 'CSS', 'تعلم CSS من الصفر - تنسيق وتجميل صفحات الويب', 'h1mNPEjva8U', 'video', 'fab fa-css3-alt', '#264de4'),
('javascript', 'JavaScript', 'تعلم JavaScript - لغة البرمجة الأساسية للويب', 'PLknwEmKsW8OuTqUDaFRBiAViDZ5uI3VcE', 'playlist', 'fab fa-js', '#f0db4f'),
('nodejs', 'Node.js', 'تعلم Node.js - برمجة الخوادم بـ JavaScript', 'qmvjwRbtNww', 'video', 'fab fa-node-js', '#68a063'),
('php', 'PHP', 'تعلم PHP - لغة برمجة الويب من جانب الخادم', 'PLeWmXrh00479LgmvKAdU8WV2nRXqX4ley', 'playlist', 'fab fa-php', '#4f5b93'),
('c', 'C', 'تعلم لغة C - أساس البرمجة الحديثة', 'PLoP3S2S1qTfCe3hI4f-spGxg2kHOig33Z', 'playlist', 'fas fa-code', '#00599c'),
('cpp', 'C++', 'تعلم C++ - البرمجة الكائنية التوجه', '07AC2Syf4Yg', 'video', 'fas fa-code', '#00599c'),
('java', 'Java', 'تعلم Java - لغة برمجة قوية ومتعددة المنصات', 'xND0t1pr3KY', 'video', 'fab fa-java', '#5382a1'),
('dart', 'Dart', 'تعلم Dart - لغة Flutter لتطبيقات الموبايل', 'HF2fQ-o_qek', 'video', 'fas fa-mobile-alt', '#0175c2'),
('csharp', 'C#', 'تعلم C# - لغة مايكروسوفت للتطبيقات', 'eeRw__TlgmQ', 'video', 'fas fa-hashtag', '#239120'),
('python', 'Python', 'تعلم Python - لغة سهلة وقوية للمبتدئين', 'mvZHDpCHphk', 'video', 'fab fa-python', '#306998')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- إدراج خريطة الطريق لـ HTML
INSERT INTO roadmap_steps (language_id, step_order, step_title) VALUES
(1, 1, 'مقدمة إلى HTML وبنية الصفحة'),
(1, 2, 'العناصر والوسوم الأساسية'),
(1, 3, 'الروابط والصور'),
(1, 4, 'القوائم والجداول'),
(1, 5, 'النماذج والإدخالات'),
(1, 6, 'HTML5 والعناصر الدلالية'),
(1, 7, 'مشروع عملي متكامل')
ON DUPLICATE KEY UPDATE step_title=VALUES(step_title);

-- إدراج خريطة الطريق لـ CSS
INSERT INTO roadmap_steps (language_id, step_order, step_title) VALUES
(2, 1, 'مقدمة إلى CSS والتحديد'),
(2, 2, 'الألوان والخلفيات'),
(2, 3, 'النصوص والخطوط'),
(2, 4, 'نموذج الصندوق Box Model'),
(2, 5, 'Flexbox للتخطيط'),
(2, 6, 'CSS Grid النظام الشبكي'),
(2, 7, 'التصميم المتجاوب Responsive'),
(2, 8, 'الحركات والتأثيرات')
ON DUPLICATE KEY UPDATE step_title=VALUES(step_title);

-- إدراج خريطة الطريق لـ JavaScript
INSERT INTO roadmap_steps (language_id, step_order, step_title) VALUES
(3, 1, 'أساسيات JavaScript'),
(3, 2, 'المتغيرات والأنواع'),
(3, 3, 'العمليات والشروط'),
(3, 4, 'الحلقات والدوال'),
(3, 5, 'الكائنات والمصفوفات'),
(3, 6, 'DOM Manipulation'),
(3, 7, 'الأحداث Events'),
(3, 8, 'ES6+ الميزات الحديثة'),
(3, 9, 'Async Programming')
ON DUPLICATE KEY UPDATE step_title=VALUES(step_title);

-- ============================================
-- المستخدم الافتراضي (admin)
-- كلمة المرور: admin123 (مُشفّرة بـ bcrypt)
-- ============================================
INSERT INTO users (username, email, password_hash, is_admin) VALUES
('admin', 'admin@fastlearn.com', '$2a$10$rZ5pGPXQ8KqF5LZ3xKdH4O8YvYJxZ3K5nY8L9P2xQ7K8F5L3Z9K4e', TRUE)
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- ============================================
-- Views مفيدة
-- ============================================

-- عرض إحصائيات المستخدمين
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    COUNT(DISTINCT ul.language_id) AS total_courses,
    COUNT(DISTINCT CASE WHEN up.is_completed = TRUE THEN up.language_id END) AS completed_courses,
    ROUND(AVG(up.progress_percentage), 2) AS avg_progress,
    u.created_at,
    u.last_login
FROM users u
LEFT JOIN user_library ul ON u.id = ul.user_id
LEFT JOIN user_progress up ON u.id = up.user_id
GROUP BY u.id, u.username, u.email, u.created_at, u.last_login;

-- عرض إحصائيات اللغات
CREATE OR REPLACE VIEW language_stats AS
SELECT 
    l.id,
    l.lang_key,
    l.name,
    COUNT(DISTINCT ul.user_id) AS enrolled_users,
    COUNT(DISTINCT CASE WHEN up.is_completed = TRUE THEN up.user_id END) AS completed_users,
    ROUND(AVG(up.progress_percentage), 2) AS avg_progress,
    (SELECT COUNT(*) FROM roadmap_steps WHERE language_id = l.id) as total_steps
FROM languages l
LEFT JOIN user_library ul ON l.id = ul.language_id
LEFT JOIN user_progress up ON l.id = up.language_id
WHERE l.is_active = TRUE
GROUP BY l.id, l.lang_key, l.name;

-- ============================================
-- Stored Procedures
-- ============================================

DELIMITER //

-- إضافة كورس للمكتبة
DROP PROCEDURE IF EXISTS add_to_library//
CREATE PROCEDURE add_to_library(
    IN p_user_id INT,
    IN p_lang_key VARCHAR(50)
)
BEGIN
    DECLARE v_language_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- الحصول على language_id
    SELECT id INTO v_language_id FROM languages WHERE lang_key = p_lang_key AND is_active = TRUE LIMIT 1;
    
    IF v_language_id IS NOT NULL THEN
        -- إضافة للمكتبة
        INSERT IGNORE INTO user_library (user_id, language_id) 
        VALUES (p_user_id, v_language_id);
        
        -- إنشاء سجل تقدم
        INSERT IGNORE INTO user_progress (user_id, language_id, progress_percentage, is_completed)
        VALUES (p_user_id, v_language_id, 0, FALSE);
        
        COMMIT;
    ELSE
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Language not found';
    END IF;
END//

-- تحديث التقدم
DROP PROCEDURE IF EXISTS update_progress//
CREATE PROCEDURE update_progress(
    IN p_user_id INT,
    IN p_lang_key VARCHAR(50),
    IN p_completed_steps JSON
)
BEGIN
    DECLARE v_language_id INT;
    DECLARE v_total_steps INT;
    DECLARE v_completed_count INT;
    DECLARE v_progress INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    SELECT id INTO v_language_id FROM languages WHERE lang_key = p_lang_key LIMIT 1;
    
    IF v_language_id IS NOT NULL THEN
        -- عدد الخطوات الكلي
        SELECT COUNT(*) INTO v_total_steps FROM roadmap_steps WHERE language_id = v_language_id;
        
        -- عدد الخطوات المكتملة
        SET v_completed_count = JSON_LENGTH(p_completed_steps);
        
        -- حساب النسبة
        IF v_total_steps > 0 THEN
            SET v_progress = ROUND((v_completed_count / v_total_steps) * 100);
        ELSE
            SET v_progress = 0;
        END IF;
        
        -- تحديث التقدم
        UPDATE user_progress 
        SET 
            progress_percentage = v_progress,
            is_completed = (v_progress = 100),
            last_accessed = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id AND language_id = v_language_id;
        
        COMMIT;
    ELSE
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Language not found';
    END IF;
END//

-- الحصول على إحصائيات المستخدم
DROP PROCEDURE IF EXISTS get_user_stats//
CREATE PROCEDURE get_user_stats(
    IN p_user_id INT
)
BEGIN
    SELECT * FROM user_stats WHERE id = p_user_id;
END//

DELIMITER ;

-- ============================================
-- Triggers
-- ============================================

DELIMITER //

-- تسجيل إضافة كورس
DROP TRIGGER IF EXISTS after_library_insert//
CREATE TRIGGER after_library_insert
AFTER INSERT ON user_library
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action, details)
    VALUES (NEW.user_id, 'add_to_library', JSON_OBJECT('language_id', NEW.language_id));
END//

-- تسجيل إكمال كورس
DROP TRIGGER IF EXISTS after_progress_complete//
CREATE TRIGGER after_progress_complete
AFTER UPDATE ON user_progress
FOR EACH ROW
BEGIN
    IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
        INSERT INTO activity_logs (user_id, action, details)
        VALUES (NEW.user_id, 'complete_course', JSON_OBJECT('language_id', NEW.language_id));
    END IF;
END//

DELIMITER ;

-- ============================================
-- نهاية السكريبت
-- ============================================

-- عرض ملخص
SELECT 'Database setup completed successfully!' AS status;
SELECT COUNT(*) AS total_languages FROM languages;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_roadmap_steps FROM roadmap_steps;