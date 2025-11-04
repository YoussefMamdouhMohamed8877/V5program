// ============================================
// controllers/authController.js - Authentication Controller
// ============================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { validationResult } from 'express-validator';

// توليد JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// ============================================
// التسجيل
// ============================================
const register = async (req, res) => {
    try {
        // التحقق من الإدخال
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }
        
        const { username, email, password } = req.body;
        
        // التحقق من وجود المستخدم
        const existingUser = await query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل'
            });
        }
        
        // تشفير كلمة المرور
        const passwordHash = await bcrypt.hash(
            password,
            parseInt(process.env.BCRYPT_ROUNDS) || 10
        );
        
        // إضافة المستخدم
        const result = await query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );
        
        const userId = result.insertId;
        
        // توليد Token
        const token = generateToken(userId);
        
        // تسجيل النشاط
        await query(
            'INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)',
            [userId, 'register', req.ip]
        );
        
        res.status(201).json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح',
            data: {
                user: {
                    id: userId,
                    username,
                    email,
                    isAdmin: false
                },
                token
            }
        });
        
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء التسجيل'
        });
    }
};

// ============================================
// تسجيل الدخول
// ============================================
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صحيحة',
                errors: errors.array()
            });
        }
        
        const { email, password } = req.body;
        
        // البحث عن المستخدم
        const users = await query(
            'SELECT id, username, email, password_hash, is_admin, is_active FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        }
        
        const user = users[0];
        
        // التحقق من حالة الحساب
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'الحساب غير مفعل'
            });
        }
        
        // التحقق من كلمة المرور
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        }
        
        // توليد Token
        const token = generateToken(user.id);
        
        // تحديث آخر تسجيل دخول
        await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );
        
        // تسجيل النشاط
        await query(
            'INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)',
            [user.id, 'login', req.ip]
        );
        
        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.is_admin
                },
                token
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل الدخول'
        });
    }
};

// ============================================
// الحصول على معلومات المستخدم الحالي
// ============================================
const getMe = async (req, res) => {
    try {
        const user = await query(
            'SELECT id, username, email, is_admin, created_at, last_login FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        
        res.json({
            success: true,
            data: user[0]
        });
        
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// تسجيل الخروج
// ============================================
const logout = async (req, res) => {
    try {
        // تسجيل النشاط
        await query(
            'INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)',
            [req.user.id, 'logout', req.ip]
        );
        
        res.json({
            success: true,
            message: 'تم تسجيل الخروج بنجاح'
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

// ============================================
// تغيير كلمة المرور
// ============================================
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // الحصول على كلمة المرور الحالية
        const users = await query(
            'SELECT password_hash FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        
        // التحقق من كلمة المرور الحالية
        const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
        
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'كلمة المرور الحالية غير صحيحة'
            });
        }
        
        // تشفير كلمة المرور الجديدة
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        
        // تحديث كلمة المرور
        await query(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [newPasswordHash, req.user.id]
        );
        
        // تسجيل النشاط
        await query(
            'INSERT INTO activity_logs (user_id, action, ip_address) VALUES (?, ?, ?)',
            [req.user.id, 'change_password', req.ip]
        );
        
        res.json({
            success: true,
            message: 'تم تغيير كلمة المرور بنجاح'
        });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ'
        });
    }
};

export {
    register,
    login,
    getMe,
    logout,
    changePassword
};