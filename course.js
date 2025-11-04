// ============================================
// course.js - صفحة الكورس النهائية
// ============================================

const urlParams = new URLSearchParams(window.location.search);
const currentLang = urlParams.get('lang');

const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
const isGuest = !currentUser;

const langData = window.languageData[currentLang];

if (!langData) {
    alert('اللغة غير موجودة');
    window.location.href = 'index.html';
}

// تحديث محتوى الصفحة
const courseNameElem = document.getElementById('courseName');
if (courseNameElem) courseNameElem.textContent = `كورس ${langData.name}`;

const courseDescriptionElem = document.getElementById('courseDescription');
if (courseDescriptionElem) courseDescriptionElem.textContent = langData.description;

const videoTitleElem = document.getElementById('videoTitle');
if (videoTitleElem) videoTitleElem.textContent = `شرح ${langData.name}`;

const contentTypeElem = document.getElementById('contentType');
if (contentTypeElem) contentTypeElem.textContent = langData.type === 'video' ? 'فيديو شامل' : 'قائمة تشغيل';

const iconElement = document.querySelector('.course-icon i');
if (iconElement) {
    iconElement.className = langData.icon;
    document.querySelector('.course-icon').style.backgroundColor = langData.color + '40';
}

// ============================================
// تحميل الفيديو
// ============================================
function loadVideo() {
    const videoPlayer = document.getElementById('videoPlayer');
    let embedUrl = '';

    if (langData.type === 'video') {
        embedUrl = `https://www.youtube.com/embed/${langData.videoId}`;
    } else if (langData.type === 'playlist') {
        embedUrl = `https://www.youtube.com/embed/videoseries?list=${langData.videoId}`;
    }

    videoPlayer.innerHTML = `
        <iframe 
            src="${embedUrl}?rel=0&modestbranding=1" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            style="width:100%;height:500px;border:none;border-radius:12px;">
        </iframe>
    `;
}

// ============================================
// تحميل خريطة الطريق
// ============================================
function loadRoadmap() {
    const roadmapList = document.getElementById('roadmapList');
    const progress = getProgress();
    
    if (!roadmapList) return;
    roadmapList.innerHTML = '';
    
    langData.roadmap.forEach((item, index) => {
        const isCompleted = progress.completedSteps?.includes(index) || false;
        
        const roadmapItem = document.createElement('div');
        roadmapItem.className = `roadmap-item ${isCompleted ? 'completed' : ''}`;
        roadmapItem.innerHTML = `
            <div class="roadmap-number">${index + 1}</div>
            <div class="roadmap-text">${item}</div>
            <i class="fas fa-check roadmap-check"></i>
        `;
        
        roadmapItem.addEventListener('click', () => {
            if (isGuest) {
                showGuestPrompt();
            } else {
                toggleStep(index);
            }
        });
        
        roadmapList.appendChild(roadmapItem);
    });
}

// ============================================
// إدارة التقدم
// ============================================
function getProgress() {
    if (isGuest) {
        const guestProgress = JSON.parse(sessionStorage.getItem('guestProgress') || '{}');
        if (!guestProgress[currentLang]) {
            guestProgress[currentLang] = {
                progress: 0,
                completed: false,
                completedSteps: []
            };
        }
        return guestProgress[currentLang];
    }
    
    const allProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    if (!allProgress[currentUser.username]) {
        allProgress[currentUser.username] = {};
    }
    if (!allProgress[currentUser.username][currentLang]) {
        allProgress[currentUser.username][currentLang] = {
            progress: 0,
            completed: false,
            completedSteps: []
        };
    }
    return allProgress[currentUser.username][currentLang];
}

function updateProgress(newProgress) {
    if (isGuest) {
        const guestProgress = JSON.parse(sessionStorage.getItem('guestProgress') || '{}');
        guestProgress[currentLang] = newProgress;
        sessionStorage.setItem('guestProgress', JSON.stringify(guestProgress));
        return;
    }
    
    const allProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    if (!allProgress[currentUser.username]) {
        allProgress[currentUser.username] = {};
    }
    allProgress[currentUser.username][currentLang] = newProgress;
    localStorage.setItem('userProgress', JSON.stringify(allProgress));
}

function toggleStep(stepIndex) {
    const progress = getProgress();
    
    if (!progress.completedSteps) {
        progress.completedSteps = [];
    }
    
    const index = progress.completedSteps.indexOf(stepIndex);
    if (index > -1) {
        progress.completedSteps.splice(index, 1);
    } else {
        progress.completedSteps.push(stepIndex);
    }
    
    updateProgress(progress);
    loadRoadmap();
    updateProgressBar();
}

// ✅ تحديث شريط التقدم (مع حماية القسمة على صفر)
function updateProgressBar() {
    const progress = getProgress();
    const totalSteps = langData.roadmap?.length || 0;
    const completedSteps = progress.completedSteps?.length || 0;
    
    const percentage = totalSteps > 0 
        ? Math.round((completedSteps / totalSteps) * 100) 
        : 0;
    
    progress.progress = percentage;
    updateProgress(progress);
    
    const progressBar = document.getElementById('courseProgressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressStatus = document.getElementById('progressStatus');
    
    if (progressBar) progressBar.style.width = percentage + '%';
    if (progressPercentage) progressPercentage.textContent = percentage + '%';
    
    if (progressStatus) {
        if (percentage === 0) {
            progressStatus.textContent = 'ابدأ الآن';
        } else if (percentage < 100) {
            progressStatus.textContent = 'في التقدم...';
        } else {
            progressStatus.textContent = 'مكتمل! 🎉';
        }
    }
}

// ============================================
// الأزرار
// ============================================
const markCompleteBtn = document.getElementById('markCompleteBtn');
if (markCompleteBtn) {
    markCompleteBtn.addEventListener('click', () => {
        if (isGuest) {
            showGuestPrompt();
            return;
        }
        
        const progress = getProgress();
        progress.completedSteps = langData.roadmap.map((_, index) => index);
        progress.completed = true;
        progress.progress = 100;
        updateProgress(progress);
        loadRoadmap();
        updateProgressBar();
        showNotification('تم تحديد الكورس كمكتمل! 🎉');
    });
}

const resetProgressBtn = document.getElementById('resetProgressBtn');
if (resetProgressBtn) {
    resetProgressBtn.addEventListener('click', () => {
        if (confirm('هل أنت متأكد من إعادة تعيين التقدم؟')) {
            const progress = {
                progress: 0,
                completed: false,
                completedSteps: []
            };
            updateProgress(progress);
            loadRoadmap();
            updateProgressBar();
            showNotification('تم إعادة تعيين التقدم');
        }
    });
}

// ============================================
// الملاحظات
// ============================================
function loadNotes() {
    const notesTextarea = document.getElementById('courseNotes');
    if (!notesTextarea) return;
    
    if (isGuest) {
        const guestNotes = JSON.parse(sessionStorage.getItem('guestNotes') || '{}');
        notesTextarea.value = guestNotes[currentLang] || '';
        return;
    }
    
    const notes = JSON.parse(localStorage.getItem('courseNotes') || '{}');
    const userNotes = notes[currentUser.username] || {};
    notesTextarea.value = userNotes[currentLang] || '';
}

const saveNotesBtn = document.getElementById('saveNotesBtn');
if (saveNotesBtn) {
    saveNotesBtn.addEventListener('click', () => {
        const notesText = document.getElementById('courseNotes').value;
        
        if (isGuest) {
            const guestNotes = JSON.parse(sessionStorage.getItem('guestNotes') || '{}');
            guestNotes[currentLang] = notesText;
            sessionStorage.setItem('guestNotes', JSON.stringify(guestNotes));
            showNotification('تم حفظ الملاحظات مؤقتاً (وضع الزائر)');
            return;
        }
        
        const notes = JSON.parse(localStorage.getItem('courseNotes') || '{}');
        if (!notes[currentUser.username]) {
            notes[currentUser.username] = {};
        }
        notes[currentUser.username][currentLang] = notesText;
        localStorage.setItem('courseNotes', JSON.stringify(notes));
        showNotification('تم حفظ الملاحظات');
    });
}

// ============================================
// الإشعارات
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

function showGuestPrompt() {
    if (confirm('سجل دخول لحفظ تقدمك بشكل دائم!\n\nهل تريد التسجيل الآن؟')) {
        window.location.href = 'login.html';
    }
}

// ============================================
// ملء الشاشة
// ============================================
const fullscreenBtn = document.getElementById('fullscreenBtn');
if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
        const videoContainer = document.getElementById('videoPlayer');
        if (videoContainer.requestFullscreen) {
            videoContainer.requestFullscreen();
        }
    });
}

// ============================================
// إشعار الزائر
// ============================================
function showGuestNotice() {
    if (!isGuest) return;
    
    setTimeout(() => {
        const guestNotice = document.createElement('div');
        guestNotice.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideUp 0.5s ease;
            max-width: 90%;
        `;
        guestNotice.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>🎉 استمتع بالمشاهدة! سجل دخول لحفظ تقدمك</span>
            <a href="login.html" style="background: white; color: #6366f1; padding: 0.5rem 1rem; border-radius: 20px; text-decoration: none; font-weight: 600;">
                سجل الآن
            </a>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0 0.5rem;">×</button>
        `;
        document.body.appendChild(guestNotice);
    }, 3000);
}

// ============================================
// التهيئة
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadVideo();
    loadRoadmap();
    updateProgressBar();
    loadNotes();
    showGuestNotice();
    
    if (typeof checkAuth === 'function') checkAuth();
    if (typeof initTheme === 'function') initTheme();
    if (typeof initMobileMenu === 'function') initMobileMenu();
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
`;
document.head.appendChild(style);