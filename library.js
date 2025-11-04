// ============================================
// js/my-library.js - My Library Page (FIXED)
// ============================================

const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// التحقق من تسجيل الدخول
if (!currentUser) {
    alert('يجب تسجيل الدخول أولاً');
    window.location.href = 'login.html';
}

// ============================================
// تحميل إحصائيات المكتبة
// ============================================
function loadStats() {
    const library = getUserLibrary();
    const progress = getUserProgress();
    
    const totalCourses = library.length;
    let completedCourses = 0;
    let inProgressCourses = 0;
    let totalProgress = 0;
    
    library.forEach(langKey => {
        const courseProgress = progress[langKey];
        if (courseProgress) {
            totalProgress += courseProgress.progress || 0;
            
            if (courseProgress.progress === 100) {
                completedCourses++;
            } else if (courseProgress.progress > 0) {
                inProgressCourses++;
            }
        }
    });
    
    const averageProgress = totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
    
    // تحديث الإحصائيات
    document.getElementById('totalCourses').textContent = totalCourses;
    document.getElementById('completedCourses').textContent = completedCourses;
    document.getElementById('inProgressCourses').textContent = inProgressCourses;
    document.getElementById('averageProgress').textContent = averageProgress + '%';
}

// ============================================
// الحصول على مكتبة المستخدم
// ============================================
function getUserLibrary() {
    const allLibraries = JSON.parse(localStorage.getItem('userLibrary') || '{}');
    return allLibraries[currentUser.username] || [];
}

function getUserProgress() {
    const allProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    return allProgress[currentUser.username] || {};
}

// ============================================
// عرض الكورسات
// ============================================
function displayCourses(filter = 'all') {
    const library = getUserLibrary();
    const progress = getUserProgress();
    const grid = document.getElementById('libraryGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (library.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    grid.innerHTML = '';
    
    library.forEach(langKey => {
        const langData = window.languageData[langKey];
        if (!langData) return;
        
        const courseProgress = progress[langKey] || { progress: 0, completed: false };
        
        // تطبيق الفلتر
        if (filter === 'completed' && !courseProgress.completed) return;
        if (filter === 'in-progress' && (courseProgress.progress === 0 || courseProgress.completed)) return;
        
        const card = createCourseCard(langKey, langData, courseProgress);
        grid.appendChild(card);
    });
    
    if (grid.children.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">لا توجد كورسات في هذا القسم</div>';
    }
}

// ============================================
// إنشاء بطاقة الكورس
// ============================================
function createCourseCard(langKey, langData, courseProgress) {
    const card = document.createElement('div');
    card.className = 'library-course-card';
    
    const statusBadge = courseProgress.completed 
        ? '<span class="course-status-badge status-completed"><i class="fas fa-check-circle"></i> مكتمل</span>'
        : courseProgress.progress > 0 
            ? '<span class="course-status-badge status-in-progress"><i class="fas fa-clock"></i> قيد الدراسة</span>'
            : '';
    
    card.innerHTML = `
        <div class="course-card-header" style="background: ${langData.color};">
            ${statusBadge}
            <div class="course-card-icon" style="background: rgba(255,255,255,0.2);">
                <i class="${langData.icon}"></i>
            </div>
            <h3>${langData.name}</h3>
            <p>${langData.description}</p>
        </div>
        <div class="course-card-body">
            <div class="course-progress-info">
                <div class="progress-label">
                    <span>التقدم</span>
                    <span class="progress-percentage">${courseProgress.progress || 0}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${courseProgress.progress || 0}%"></div>
                </div>
            </div>
            <div class="course-card-actions">
                <button class="btn-continue" onclick="continueCourse('${langKey}')">
                    <i class="fas fa-play-circle"></i> متابعة
                </button>
                <button class="btn-remove" onclick="removeCourse('${langKey}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// ============================================
// متابعة الكورس
// ============================================
function continueCourse(langKey) {
    window.location.href = `course.html?lang=${langKey}`;
}

// ============================================
// حذف الكورس
// ============================================
function removeCourse(langKey) {
    if (!confirm('هل أنت متأكد من حذف هذا الكورس من مكتبتك؟')) {
        return;
    }
    
    const allLibraries = JSON.parse(localStorage.getItem('userLibrary') || '{}');
    const library = allLibraries[currentUser.username] || [];
    
    const index = library.indexOf(langKey);
    if (index > -1) {
        library.splice(index, 1);
        allLibraries[currentUser.username] = library;
        localStorage.setItem('userLibrary', JSON.stringify(allLibraries));
        
        // إعادة تحميل الصفحة
        loadStats();
        displayCourses(currentFilter);
        
        showNotification('تم حذف الكورس من المكتبة');
    }
}

// ============================================
// الفلاتر
// ============================================
let currentFilter = 'all';

const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // إزالة active من جميع الأزرار
        filterButtons.forEach(b => b.classList.remove('active'));
        
        // إضافة active للزر المضغوط
        btn.classList.add('active');
        
        // تطبيق الفلتر
        currentFilter = btn.getAttribute('data-filter');
        displayCourses(currentFilter);
    });
});

// ============================================
// إشعارات
// ============================================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #10b981;
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ============================================
// التهيئة
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    displayCourses();
    
    if (typeof checkAuth === 'function') checkAuth();
    if (typeof initTheme === 'function') initTheme();
    if (typeof initMobileMenu === 'function') initMobileMenu();
});

// Animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideUp {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);
