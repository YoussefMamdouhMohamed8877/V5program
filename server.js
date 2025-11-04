// ============================================
// server.js - Main Server File (FIXED)
// Fast Learn Programming Backend
// ============================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { testConnection } from './config/database.js';

// Import Routes
import authRoutes from './routes/auth.js';
import coursesRoutes from './routes/courses.js';
import libraryRoutes from './routes/library.js';
import adminRoutes from './routes/admin.js';

// Initialize Express
const app = express();

// ============================================
// Security Middleware
// ============================================

// Helmet للأمان
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS
const corsOptions = {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
    message: 'تجاوزت الحد الأقصى للطلبات، يرجى المحاولة لاحقاً',
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'تجاوزت الحد الأقصى لمحاولات تسجيل الدخول'
});

// ============================================
// Body Parsers
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Logging
// ============================================
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ============================================
// Routes (FIXED: Using import instead of require)
// ============================================
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// Health Check
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ============================================
// 404 Handler
// ============================================
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'المسار غير موجود',
        path: req.originalUrl
    });
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // خطأ التحقق من الصحة
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'بيانات غير صحيحة',
            errors: err.errors
        });
    }
    
    // خطأ قاعدة البيانات
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'البيانات موجودة بالفعل'
        });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token غير صالح'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'انتهت صلاحية الجلسة'
        });
    }
    
    // خطأ عام
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'حدث خطأ في السيرفر' 
            : err.message
    });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // اختبار الاتصال بقاعدة البيانات
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ فشل الاتصال بقاعدة البيانات');
            console.error('تأكد من:');
            console.error('1. تشغيل MySQL/MariaDB');
            console.error('2. صحة بيانات الاتصال في .env');
            console.error('3. وجود قاعدة البيانات fast_learn_db');
            process.exit(1);
        }
        
        // تشغيل السيرفر
        app.listen(PORT, () => {
            console.log('\n========================================');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 API: http://localhost:${PORT}/api`);
            console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
            console.log('========================================\n');
        });
        
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();

export default app;