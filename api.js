// ============================================
// js/api.js - API Client
// للربط مع Backend
// ============================================

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// ============================================
// Helper Functions
// ============================================

// الحصول على Token
function getToken() {
    return localStorage.getItem('authToken');
}

// حفظ Token
function setToken(token) {
    localStorage.setItem('authToken', token);
}

// حذف Token
function removeToken() {
    localStorage.removeItem('authToken');
}

// إنشاء Headers
function getHeaders(includeAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (includeAuth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    return headers;
}

// معالجة الأخطاء
function handleError(error) {
    console.error('API Error:', error);
    if (error.message === 'يرجى تسجيل الدخول أولاً') {
        removeToken();
        window.location.href = 'login.html';
        return;
    }
    if (!window.navigator.onLine) {
        throw new Error('No internet connection');
    }
    throw error;
}

// ============================================
// Authentication API
// ============================================

const AuthAPI = {
    // التسجيل
    async register(username, email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'فشل التسجيل');
            }
            
            // حفظ Token
            if (data.data?.token) {
                setToken(data.data.token);
            }
            
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // تسجيل الدخول
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'فشل تسجيل الدخول');
            }
            
            // حفظ Token
            if (data.data?.token) {
                setToken(data.data.token);
            }
            
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // الحصول على معلومات المستخدم
    async getMe() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message);
            }
            
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // تسجيل الخروج
    async logout() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            
            removeToken();
            return data;
        } catch (error) {
            removeToken();
            return handleError(error);
        }
    },
    
    // تغيير كلمة المرور
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'PUT',
                headers: getHeaders(true),
                body: JSON.stringify({ currentPassword, newPassword })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message);
            }
            
            return data;
        } catch (error) {
            return handleError(error);
        }
    }
};

// ============================================
// Courses API
// ============================================

const CoursesAPI = {
    // جميع اللغات
    async getAll() {
        try {
            const response = await fetch(`${API_BASE_URL}/courses`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // لغة محددة
    async getByKey(langKey) {
        try {
            const response = await fetch(`${API_BASE_URL}/courses/${langKey}`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // إضافة للمكتبة
    async addToLibrary(langKey) {
        try {
            const response = await fetch(`${API_BASE_URL}/courses/library/add`, {
                method: 'POST',
                headers: getHeaders(true),
                body: JSON.stringify({ langKey })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message);
            }
            
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // حذف من المكتبة
    async removeFromLibrary(langKey) {
        try {
            const response = await fetch(`${API_BASE_URL}/courses/library/${langKey}`, {
                method: 'DELETE',
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // تحديث التقدم
    async updateProgress(langKey, completedSteps) {
        try {
            const response = await fetch(`${API_BASE_URL}/courses/progress`, {
                method: 'PUT',
                headers: getHeaders(true),
                body: JSON.stringify({ langKey, completedSteps })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // حفظ الملاحظات
    async saveNotes(langKey, noteText) {
        try {
            const response = await fetch(`${API_BASE_URL}/courses/notes`, {
                method: 'POST',
                headers: getHeaders(true),
                body: JSON.stringify({ langKey, noteText })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // الحصول على الملاحظات
    async getNotes(langKey) {
        try {
            const response = await fetch(`${API_BASE_URL}/courses/notes/${langKey}`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    }
};

// ============================================
// Library API
// ============================================

const LibraryAPI = {
    // مكتبتي
    async getMyLibrary() {
        try {
            const response = await fetch(`${API_BASE_URL}/library`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // الإحصائيات
    async getStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/library/stats`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // المكتملة
    async getCompleted() {
        try {
            const response = await fetch(`${API_BASE_URL}/library/completed`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // قيد الدراسة
    async getInProgress() {
        try {
            const response = await fetch(`${API_BASE_URL}/library/in-progress`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    }
};

// ============================================
// Admin API
// ============================================

const AdminAPI = {
    // إحصائيات Dashboard
    async getDashboardStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/stats`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // جميع المستخدمين
    async getAllUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // تفاصيل مستخدم
    async getUserDetails(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // حذف مستخدم
    async deleteUser(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // إحصائيات الكورسات
    async getCourseStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/courses/stats`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // السجلات
    async getActivityLogs(limit = 50) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/logs?limit=${limit}`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    },
    
    // تصدير البيانات
    async exportData() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/export`, {
                headers: getHeaders(true)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            return handleError(error);
        }
    }
};

// ============================================
// Export
// ============================================

// للاستخدام في Frontend
if (typeof window !== 'undefined') {
    window.API = {
        Auth: AuthAPI,
        Courses: CoursesAPI,
        Library: LibraryAPI,
        Admin: AdminAPI,
        getToken,
        setToken,
        removeToken
    };
}

// للاستخدام مع Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthAPI,
        CoursesAPI,
        LibraryAPI,
        AdminAPI
    };
}