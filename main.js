// ============================================
// main.js - الملف الرئيسي النهائي
// Fast Learn Programming
// ============================================

// ✅ بيانات اللغات البرمجية (كاملة ومُحدّثة)
const languageData = {
    html: {
        name: 'HTML',
        videoId: 'cvNTgKw8VlY',
        type: 'video',
        icon: 'fab fa-html5',
        color: '#e34c26',
        description: 'تعلم HTML من الصفر - لغة ترميز النصوص التشعبية',
        roadmap: [
            'مقدمة إلى HTML وبنية الصفحة',
            'العناصر والوسوم الأساسية',
            'الروابط والصور',
            'القوائم والجداول',
            'النماذج والإدخالات',
            'HTML5 والعناصر الدلالية',
            'مشروع عملي متكامل'
        ]
    },
    css: {
        name: 'CSS',
        videoId: 'h1mNPEjva8U',
        type: 'video',
        icon: 'fab fa-css3-alt',
        color: '#264de4',
        description: 'تعلم CSS من الصفر - تنسيق وتجميل صفحات الويب',
        roadmap: [
            'مقدمة إلى CSS والتحديد',
            'الألوان والخلفيات',
            'النصوص والخطوط',
            'نموذج الصندوق Box Model',
            'Flexbox للتخطيط',
            'CSS Grid النظام الشبكي',
            'التصميم المتجاوب Responsive',
            'الحركات والتأثيرات'
        ]
    },
    javascript: {
        name: 'JavaScript',
        videoId: 'PLknwEmKsW8OuTqUDaFRBiAViDZ5uI3VcE',
        type: 'playlist',
        icon: 'fab fa-js',
        color: '#f0db4f',
        description: 'تعلم JavaScript - لغة البرمجة الأساسية للويب',
        roadmap: [
            'أساسيات JavaScript',
            'المتغيرات والأنواع',
            'العمليات والشروط',
            'الحلقات والدوال',
            'الكائنات والمصفوفات',
            'DOM Manipulation',
            'الأحداث Events',
            'ES6+ الميزات الحديثة',
            'Async Programming'
        ]
    },
    nodejs: {
        name: 'Node.js',
        videoId: 'qmvjwRbtNww',
        type: 'video',
        icon: 'fab fa-node-js',
        color: '#68a063',
        description: 'تعلم Node.js - برمجة الخوادم بـ JavaScript',
        roadmap: [
            'مقدمة إلى Node.js',
            'إعداد البيئة',
            'NPM وإدارة الحزم',
            'بناء سيرفر HTTP',
            'Express Framework',
            'التعامل مع قواعد البيانات',
            'RESTful APIs',
            'المصادقة والأمان'
        ]
    },
    php: {
        name: 'PHP',
        videoId: 'PLeWmXrh00479LgmvKAdU8WV2nRXqX4ley',
        type: 'playlist',
        icon: 'fab fa-php',
        color: '#4f5b93',
        description: 'تعلم PHP - لغة برمجة الويب من جانب الخادم',
        roadmap: [
            'أساسيات PHP',
            'المتغيرات والأنواع',
            'الدوال والملفات',
            'OOP في PHP',
            'التعامل مع MySQL',
            'بناء نظام تسجيل دخول',
            'Laravel Framework',
            'مشاريع عملية'
        ]
    },
    c: {
        name: 'C',
        videoId: 'PLoP3S2S1qTfCe3hI4f-spGxg2kHOig33Z',
        type: 'playlist',
        icon: 'fas fa-code',
        color: '#00599c',
        description: 'تعلم لغة C - أساس البرمجة الحديثة',
        roadmap: [
            'البنية الأساسية للبرنامج',
            'المتغيرات والثوابت',
            'العمليات الحسابية',
            'الشروط والحلقات',
            'الدوال Functions',
            'المصفوفات Arrays',
            'المؤشرات Pointers',
            'البنى Structures',
            'التعامل مع الملفات'
        ]
    },
    cpp: {
        name: 'C++',
        videoId: '07AC2Syf4Yg',
        type: 'video',
        icon: 'fas fa-code',
        color: '#00599c',
        description: 'تعلم C++ - البرمجة الكائنية التوجه',
        roadmap: [
            'أساسيات C++',
            'البرمجة الكائنية OOP',
            'الفئات والكائنات',
            'الوراثة Inheritance',
            'تعدد الأشكال Polymorphism',
            'STL المكتبة القياسية',
            'القوالب Templates',
            'معالجة الاستثناءات',
            'مشاريع متقدمة'
        ]
    },
    java: {
        name: 'Java',
        videoId: 'xND0t1pr3KY',
        type: 'video',
        icon: 'fab fa-java',
        color: '#5382a1',
        description: 'تعلم Java - لغة برمجة قوية ومتعددة المنصات',
        roadmap: [
            'مقدمة إلى Java',
            'أساسيات اللغة',
            'البرمجة الكائنية',
            'المجموعات Collections',
            'معالجة الاستثناءات',
            'الملفات والإدخال/الإخراج',
            'Swing GUI',
            'قواعد البيانات JDBC',
            'مشاريع عملية'
        ]
    },
    dart: {
        name: 'Dart',
        videoId: 'HF2fQ-o_qek',
        type: 'video',
        icon: 'fas fa-mobile-alt',
        color: '#0175c2',
        description: 'تعلم Dart - لغة Flutter لتطبيقات الموبايل',
        roadmap: [
            'مقدمة إلى Dart',
            'أساسيات اللغة',
            'البرمجة الكائنية في Dart',
            'البرمجة غير المتزامنة',
            'مقدمة إلى Flutter',
            'بناء واجهات المستخدم',
            'إدارة الحالة State',
            'تطبيقات الموبايل الكاملة'
        ]
    },
    csharp: {
        name: 'C#',
        videoId: 'eeRw__TlgmQ',
        type: 'video',
        icon: 'fas fa-hashtag',
        color: '#239120',
        description: 'تعلم C# - لغة مايكروسوفت للتطبيقات',
        roadmap: [
            'أساسيات C#',
            '.NET Framework',
            'البرمجة الكائنية',
            'Windows Forms',
            'تطبيقات سطح المكتب',
            'ASP.NET للويب',
            'Unity لتطوير الألعاب',
            'مشاريع متقدمة'
        ]
    },
    python: {
        name: 'Python',
        videoId: 'mvZHDpCHphk',
        type: 'video',
        icon: 'fab fa-python',
        color: '#306998',
        description: 'تعلم Python - لغة سهلة وقوية للمبتدئين',
        roadmap: [
            'مقدمة إلى Python',
            'المتغيرات والأنواع',
            'الشروط والحلقات',
            'الدوال والوحدات',
            'البرمجة الكائنية',
            'التعامل مع الملفات',
            'المكتبات الشهيرة',
            'تحليل البيانات',
            'الذكاء الاصطناعي AI'
        ]
    }
};

// ============================================
// ✅ دالة تشفير بسيطة (للتطوير)
// ============================================
function simpleHash(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(36);
}

// ============================================
// ✅ التحقق من تسجيل الدخول
// ============================================
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const loginLink = document.getElementById('loginLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminLink = document.getElementById('adminLink');
    
    if (user) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            logoutBtn.textContent = `مرحباً ${user.username}`;
        }
        if (adminLink && user.isAdmin) {
            adminLink.style.display = 'block';
        }
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// ============================================
// ✅ تسجيل الخروج
// ============================================
function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('currentUser');
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

// ============================================
// ✅ الوضع الليلي
// ============================================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// ============================================
// ✅ القائمة المحمولة المُحسّنة
// ============================================
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
        
        // ✅ إغلاق عند الضغط خارج القائمة
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }
}

// ============================================
// ✅ تحميل التقدم للبطاقات
// ============================================
function loadProgress() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user) return;
    
    const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const userProgress = progress[user.username] || {};
    
    Object.keys(userProgress).forEach(lang => {
        const card = document.querySelector(`.language-card[data-lang="${lang}"]`);
        if (card) {
            const progressFill = card.querySelector('.progress-fill');
            const progressText = card.querySelector('.progress-text');
            const percent = userProgress[lang].progress || 0;
            
            if (progressFill) progressFill.style.width = percent + '%';
            if (progressText) progressText.textContent = percent + '%';
        }
    });
}

// ============================================
// ✅ معالجة الضغط على البطاقات
// ============================================
function initCardClicks() {
    const cards = document.querySelectorAll('.language-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const lang = card.getAttribute('data-lang');
            navigateToLanguage(lang);
        });
    });
}

// ✅ التنقل للغة (بدون localhost)
function navigateToLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (user) {
        addToLibrary(lang);
    }
    
    // ✅ رابط نسبي فقط
    window.location.href = 'course.html?lang=' + lang;
}

// ✅ إضافة للمكتبة
function addToLibrary(lang) {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user) return;
    
    const library = JSON.parse(localStorage.getItem('userLibrary') || '{}');
    if (!library[user.username]) {
        library[user.username] = [];
    }
    
    if (!library[user.username].includes(lang)) {
        library[user.username].push(lang);
        localStorage.setItem('userLibrary', JSON.stringify(library));
    }
    
    const progress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    if (!progress[user.username]) {
        progress[user.username] = {};
    }
    if (!progress[user.username][lang]) {
        progress[user.username][lang] = {
            progress: 0,
            completed: false,
            completedSteps: [],
            lastAccessed: new Date().toISOString()
        };
        localStorage.setItem('userProgress', JSON.stringify(progress));
    }
}

// ============================================
// ✅ التهيئة عند تحميل الصفحة
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initTheme();
    initMobileMenu();
    loadProgress();
    initCardClicks();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

// ============================================
// تصدير للاستخدام في ملفات أخرى
// ============================================
if (typeof window !== 'undefined') {
    window.languageData = languageData;
    window.checkAuth = checkAuth;
    window.initTheme = initTheme;
    window.initMobileMenu = initMobileMenu;
    window.simpleHash = simpleHash;
}