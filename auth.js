// ============================================
// middleware/auth.js - Authentication Middleware
// ============================================

import jwt from 'jsonwebtoken';
import { query } from '../config/database';

// التحقق من Token
const verifyToken = async (req, res, next) => {
    try {
        // الحصول على Token من الهيدر
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'يرجى تسجيل الدخول أولاً'
            });
        }
        
        // التحقق من Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // التحقق من وجود المستخدم
        const users = await query(
            'SELECT id, username, email, is_admin, is_active FROM users WHERE id = ? AND is_active = TRUE',
            [decoded.userId]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'المستخدم غير موجود أو غير مفعل'
            });
        }
        
        // إضافة بيانات المستخدم للطلب
        req.user = users[0];
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token غير صالح'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى'
            });
        }
        
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في التحقق من الهوية'
        });
    }
};

// التحقق من صلاحيات المدير
const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({
            success: false,
            message: 'غير مصرح لك بالوصول'
        });
    }
    next();
};

// Middleware اختياري (يسمح بالوصول بدون تسجيل)
const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const users = await query(
                'SELECT id, username, email, is_admin FROM users WHERE id = ? AND is_active = TRUE',
                [decoded.userId]
            );
            
            if (users.length > 0) {
                req.user = users[0];
            }
        }
        
        next();
    } catch (error) {
        // في حالة الخطأ، نكمل بدون مستخدم
        next();
    }
};

export { verifyToken, isAdmin, optionalAuth };