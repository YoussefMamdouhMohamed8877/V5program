// ============================================
// js/admin.js - Admin Dashboard (FIXED)
// ============================================

const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// التحقق من صلاحية Admin
if (!currentUser || !currentUser.isAdmin) {
    alert('غير مصرح لك بالدخول');
    window.location.href = 'index.html';
}

// ============================================
// تحميل إحصائيات Dashboard
// ============================================
function loadDashboardStats() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const allLibraries = JSON.parse(localStorage.getItem('userLibrary') || '{}');
    const allProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    
    // إجمالي المستخدمين
    document.getElementById('totalUsers').textContent = users.length;
    
    // إجمالي الاشتراكات
    let totalEnrollments = 0;
    Object.values(allLibraries).forEach(library => {
        totalEnrollments += library.length;
    });
    document.getElementById('totalEnrollments').textContent = totalEnrollments;
    
    // معدل الإكمال
    let totalProgress = 0;
    let courseCount = 0;
    Object.values(allProgress).forEach(userProgress => {
        Object.values(userProgress).forEach(course => {
            totalProgress += course.progress || 0;
            courseCount++;
        });
    });
    const avgCompletion = courseCount > 0 ? Math.round(totalProgress / courseCount) : 0;
    document.getElementById('completionRate').textContent = avgCompletion + '%';
}

// ============================================
// تحميل قائمة المستخدمين
// ============================================
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const allLibraries = JSON.parse(localStorage.getItem('userLibrary') || '{}');
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--text-secondary);">لا يوجد مستخدمون</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const userLibrary = allLibraries[user.username] || [];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.username} ${user.isAdmin ? '<span style="color: #f59e0b;">👑</span>' : ''}</td>
            <td>${user.email}</td>
            <td>${userLibrary.length}</td>
            <td>${new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
            <td>
                ${user.username !== 'admin' && user.username !== currentUser.username ? 
                    `<button class="btn-delete" onclick="deleteUser('${user.username}')">
                        <i class="fas fa-trash"></i> حذف
                    </button>` : 
                    '<span style="color: var(--text-secondary); font-size: 0.9rem;">محمي</span>'
                }
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// ============================================
// حذف مستخدم
// ============================================
function deleteUser(username) {
    if (!confirm(`هل أنت متأكد من حذف المستخدم: ${username}؟`)) {
        return;
    }
    
    // حذف المستخدم
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter(u => u.username !== username);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // حذف بيانات المستخدم الأخرى
    const allLibraries = JSON.parse(localStorage.getItem('userLibrary') || '{}');
    delete allLibraries[username];
    localStorage.setItem('userLibrary', JSON.stringify(allLibraries));
    
    const allProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    delete allProgress[username];
    localStorage.setItem('userProgress', JSON.stringify(allProgress));
    
    const allNotes = JSON.parse(localStorage.getItem('courseNotes') || '{}');
    delete allNotes[username];
    localStorage.setItem('courseNotes', JSON.stringify(allNotes));
    
    // إعادة تحميل
    loadUsers();
    loadDashboardStats();
    showMessage('تم حذف المستخدم بنجاح');
}

// ============================================
// تحميل إحصائيات الكورسات
// ============================================
function loadCourseStats() {
    const allLibraries = JSON.parse(localStorage.getItem('userLibrary') || '{}');
    const allProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    
    const languageKeys = Object.keys(window.languageData);
    
    languageKeys.forEach(langKey => {
        let enrollments = 0;
        let totalProgress = 0;
        let progressCount = 0;
        
        // حساب الاشتراكات والتقدم
        Object.values(allLibraries).forEach(library => {
            if (library.includes(langKey)) {
                enrollments++;
            }
        });
        
        Object.values(allProgress).forEach(userProgress => {
            if (userProgress[langKey]) {
                totalProgress += userProgress[langKey].progress || 0;
                progressCount++;
            }
        });
        
        const avgProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;
        
        // تحديث الإحصائيات
        const enrollmentElem = document.getElementById(`${langKey}-enrollments`);
        const completionElem = document.getElementById(`${langKey}-completion`);
        
        if (enrollmentElem) enrollmentElem.textContent = enrollments;
        if (completionElem) completionElem.textContent = avgProgress + '%';
    });
}

// ============================================
// تبديل التبويبات
// ============================================
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        // إزالة active من جميع التبويبات
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // إضافة active للتبويب المحدد
        btn.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// ============================================
// إضافة مستخدم جديد
// ============================================
function addUser() {
    const username = prompt('اسم المستخدم:');
    if (!username) return;
    
    const email = prompt('البريد الإلكتروني:');
    if (!email || !email.includes('@')) {
        alert('البريد الإلكتروني غير صحيح');
        return;
    }
    
    const password = prompt('كلمة المرور (افتراضياً: user123):') || 'user123';
    
    // التحقق من عدم وجود المستخدم
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.email === email || u.username === username)) {
        alert('المستخدم موجود بالفعل');
        return;
    }
    
    // إنشاء المستخدم
    const newUser = {
        username,
        email,
        passwordHash: simpleHash(password),
        isAdmin: false,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    loadUsers();
    loadDashboardStats();
    showMessage('تم إضافة المستخدم بنجاح');
}

// ============================================
// تعديل كورس
// ============================================
function editCourse(langKey) {
    alert(`تعديل كورس ${window.languageData[langKey]?.name} - قريباً`);
}

// ============================================
// تصدير البيانات
// ============================================
function exportData() {
    const data = {
        users: JSON.parse(localStorage.getItem('users') || '[]'),
        libraries: JSON.parse(localStorage.getItem('userLibrary') || '{}'),
        progress: JSON.parse(localStorage.getItem('userProgress') || '{}'),
        notes: JSON.parse(localStorage.getItem('courseNotes') || '{}'),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fastlearn-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showMessage('تم تصدير البيانات بنجاح');
}

// ============================================
// مسح كل البيانات
// ============================================
function clearData() {
    if (!confirm('⚠️ تحذير: سيتم حذف جميع البيانات!\n\nهل أنت متأكد؟')) {
        return;
    }
    
    if (!confirm('تأكيد نهائي: لا يمكن التراجع عن هذا الإجراء!')) {
        return;
    }
    
    // حذف كل شيء ما عدا المستخدم الحالي
    const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const adminUser = users.find(u => u.username === currentUser.username);
    
    localStorage.clear();
    
    // إعادة المستخدم الحالي فقط
    if (adminUser) {
        localStorage.setItem('users', JSON.stringify([adminUser]));
        localStorage.setItem('currentUser', JSON.stringify(currentUserData));
    }
    
    showMessage('تم مسح جميع البيانات');
    
    // إعادة تحميل
    setTimeout(() => location.reload(), 1500);
}

// ============================================
// رسائل التنبيه
// ============================================
function showMessage(message) {
    const messageBox = document.createElement('div');
    messageBox.className = 'success-message';
    messageBox.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    document.querySelector('.admin-container').insertBefore(
        messageBox, 
        document.querySelector('.dashboard-stats')
    );
    
    setTimeout(() => messageBox.remove(), 3000);
}

// دالة التشفير (من main.js)
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
// التهيئة
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadUsers();
    loadCourseStats();
    
    if (typeof checkAuth === 'function') checkAuth();
    if (typeof initTheme === 'function') initTheme();
    if (typeof initMobileMenu === 'function') initMobileMenu();
});
