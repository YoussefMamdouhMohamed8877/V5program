// ============================================
// js/auth.js - Authentication Frontend (FIXED)
// ============================================

// دالة التشفير البسيطة
function simpleHash(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(36);
}

// عرض رسالة
function showMessage(message, type = 'success') {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) return;
    
    messageBox.textContent = message;
    messageBox.className = `message-box ${type} show`;
    
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 3000);
}

// التبديل بين نماذج التسجيل وتسجيل الدخول
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');

if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });
}

// ============================================
// تسجيل الدخول
// ============================================
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe')?.checked;
        
        if (!email || !password) {
            showMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'error');
            return;
        }

        // الحصول على المستخدمين
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const passwordHash = simpleHash(password);
        
        // البحث عن المستخدم
        const user = users.find(u => u.email === email && u.passwordHash === passwordHash);
        
        if (!user) {
            showMessage('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
            return;
        }
        
        // حفظ المستخدم الحالي
        const currentUser = {
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin || false
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        showMessage('تم تسجيل الدخول بنجاح! جاري التحويل...', 'success');
        
        // التحويل بعد ثانية
        setTimeout(() => {
            if (user.isAdmin) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);
    });
}

// ============================================
// التسجيل
// ============================================
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms')?.checked;
        
        // التحققات
        if (!username || !email || !password || !confirmPassword) {
            showMessage('يرجى ملء جميع الحقول', 'error');
            return;
        }
        
        if (username.length < 3) {
            showMessage('اسم المستخدم يجب أن يكون 3 أحرف على الأقل', 'error');
            return;
        }
        
        if (!email.includes('@')) {
            showMessage('البريد الإلكتروني غير صحيح', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('كلمات المرور غير متطابقة', 'error');
            return;
        }
        
        if (!agreeTerms) {
            showMessage('يجب الموافقة على الشروط والأحكام', 'error');
            return;
        }
        
        // الحصول على المستخدمين الحاليين
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // التحقق من وجود المستخدم
        if (users.some(u => u.email === email)) {
            showMessage('البريد الإلكتروني مستخدم بالفعل', 'error');
            return;
        }
        
        if (users.some(u => u.username === username)) {
            showMessage('اسم المستخدم مستخدم بالفعل', 'error');
            return;
        }
        
        // إنشاء المستخدم الجديد
        const newUser = {
            username,
            email,
            passwordHash: simpleHash(password),
            isAdmin: false,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        showMessage('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...', 'success');
        
        // تسجيل الدخول التلقائي
        const currentUser = {
            username: newUser.username,
            email: newUser.email,
            isAdmin: false
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
}

// ============================================
// التحقق من تسجيل الدخول عند تحميل الصفحة
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // إذا كان مسجل دخول، حوله للرئيسية
    if (currentUser && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
    
    // إنشاء مستخدم admin افتراضي إذا لم يوجد
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
        const adminUser = {
            username: 'admin',
            email: 'admin@fastlearn.com',
            passwordHash: simpleHash('admin123'),
            isAdmin: true,
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('users', JSON.stringify([adminUser]));
        console.log('✅ تم إنشاء حساب Admin الافتراضي');
        console.log('📧 Email: admin@fastlearn.com');
        console.log('🔑 Password: admin123');
    }
});
