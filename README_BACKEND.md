# 🚀 Fast Learn Programming - Backend Documentation

## 📋 المحتويات
- [نظرة عامة](#نظرة-عامة)
- [التثبيت](#التثبيت)
- [الإعداد](#الإعداد)
- [API Endpoints](#api-endpoints)
- [الأمان](#الأمان)
- [قاعدة البيانات](#قاعدة-البيانات)

---

## 🎯 نظرة عامة

Backend كامل لمنصة Fast Learn Programming باستخدام:
- **Node.js + Express** - Framework السيرفر
- **MySQL** - قاعدة البيانات
- **JWT** - المصادقة
- **bcrypt** - تشفير كلمات المرور
- **Express Validator** - التحقق من البيانات
- **Helmet** - الأمان
- **Rate Limiting** - الحماية من Spam

---

## 💻 التثبيت

### 1. المتطلبات
```bash
Node.js >= 14.0.0
MySQL >= 5.7 أو MariaDB >= 10.2
npm >= 6.0.0
```

### 2. تحميل المشروع
```bash
git clone <repository-url>
cd fast-learn-programming-backend
npm install
```

### 3. إعداد قاعدة البيانات
```bash
# تسجيل الدخول لـ MySQL
mysql -u root -p

# إنشاء قاعدة البيانات
source database.sql

# أو باستخدام npm script
npm run db:setup
```

### 4. إعداد متغيرات البيئة
```bash
cp .env.example .env
# عدل الملف .env حسب إعداداتك
```

### 5. إضافة البيانات الأولية
```bash
npm run db:seed
```

### 6. تشغيل السيرفر
```bash
# Development
npm run dev

# Production
npm start
```

---

## ⚙️ الإعداد

### ملف .env

```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fast_learn_db

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5500
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### 🔐 Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "yousef",
  "email": "yousef@example.com",
  "password": "password123"
}

Response: {
  "success": true,
  "message": "تم إنشاء الحساب بنجاح",
  "data": {
    "user": { "id": 1, "username": "yousef", ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "yousef@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer YOUR_TOKEN
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

### 📚 Courses

#### Get All Languages
```http
GET /api/courses
```

#### Get Language Details
```http
GET /api/courses/:langKey
# Example: GET /api/courses/html
```

#### Add to Library
```http
POST /api/courses/library/add
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "langKey": "html"
}
```

#### Remove from Library
```http
DELETE /api/courses/library/:langKey
Authorization: Bearer YOUR_TOKEN
```

#### Update Progress
```http
PUT /api/courses/progress
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "langKey": "html",
  "completedSteps": [1, 2, 3, 5]
}
```

#### Save Notes
```http
POST /api/courses/notes
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "langKey": "html",
  "noteText": "ملاحظاتي عن HTML..."
}
```

#### Get Notes
```http
GET /api/courses/notes/:langKey
Authorization: Bearer YOUR_TOKEN
```

---

### 📖 Library

#### Get My Library
```http
GET /api/library
Authorization: Bearer YOUR_TOKEN
```

#### Get Library Stats
```http
GET /api/library/stats
Authorization: Bearer YOUR_TOKEN

Response: {
  "success": true,
  "data": {
    "total_courses": 5,
    "completed_courses": 2,
    "in_progress_courses": 3,
    "average_progress": 45.5
  }
}
```

#### Get Completed Courses
```http
GET /api/library/completed
Authorization: Bearer YOUR_TOKEN
```

#### Get In-Progress Courses
```http
GET /api/library/in-progress
Authorization: Bearer YOUR_TOKEN
```

---

### 👑 Admin Panel

**Note:** جميع المسارات تحتاج `is_admin = true`

#### Dashboard Stats
```http
GET /api/admin/stats
Authorization: Bearer ADMIN_TOKEN

Response: {
  "success": true,
  "data": {
    "total_users": 120,
    "total_languages": 11,
    "total_enrollments": 450,
    "avg_completion_rate": 35.5
  }
}
```

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer ADMIN_TOKEN
```

#### Get User Details
```http
GET /api/admin/users/:userId
Authorization: Bearer ADMIN_TOKEN
```

#### Delete User
```http
DELETE /api/admin/users/:userId
Authorization: Bearer ADMIN_TOKEN
```

#### Toggle User Status
```http
PUT /api/admin/users/:userId/toggle-status
Authorization: Bearer ADMIN_TOKEN
```

#### Course Statistics
```http
GET /api/admin/courses/stats
Authorization: Bearer ADMIN_TOKEN
```

#### Add Language
```http
POST /api/admin/courses
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "langKey": "ruby",
  "name": "Ruby",
  "description": "لغة برمجة ديناميكية",
  "videoId": "VIDEO_ID",
  "videoType": "video",
  "icon": "fab fa-ruby",
  "color": "#CC342D"
}
```

#### Update Language
```http
PUT /api/admin/courses/:langKey
Authorization: Bearer ADMIN_TOKEN
```

#### Delete Language
```http
DELETE /api/admin/courses/:langKey
Authorization: Bearer ADMIN_TOKEN
```

#### Activity Logs
```http
GET /api/admin/logs?limit=50
Authorization: Bearer ADMIN_TOKEN
```

#### Export Data
```http
GET /api/admin/export
Authorization: Bearer ADMIN_TOKEN
```

---

## 🔒 الأمان

### Authentication
- **JWT Tokens** مع expiry time قابل للتخصيص
- **bcrypt** لتشفير كلمات المرور (10 rounds)
- **Refresh tokens** (optional - يمكن إضافته)

### Rate Limiting
```javascript
// General API: 100 requests / 15 minutes
// Auth routes: 5 requests / 15 minutes
```

### CORS
```javascript
// يمكن تحديد Origins مسموحة في .env
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Headers Security
- **Helmet.js** لإضافة Security Headers
- **HTTPS** recommended في الإنتاج

### Input Validation
- **express-validator** للتحقق من جميع المدخلات
- **SQL Injection Protection** عبر Prepared Statements

---

## 🗄️ قاعدة البيانات

### Schema Overview
```
users                 - المستخدمون
languages             - اللغات البرمجية
roadmap_steps         - خريطة الطريق
user_library          - مكتبة المستخدم
user_progress         - التقدم
completed_steps       - الخطوات المكتملة
course_notes          - الملاحظات
user_sessions         - الجلسات
activity_logs         - سجل النشاط
```

### Relationships
```
users (1) ----< (M) user_library
languages (1) ----< (M) user_library
languages (1) ----< (M) roadmap_steps
users + languages ----< user_progress
users + roadmap_steps ----< completed_steps
```

### Indexes
- `users(email, username)` - للبحث السريع
- `user_library(user_id, language_id)` - للمكتبة
- `user_progress(user_id, language_id)` - للتقدم
- `activity_logs(user_id, created_at)` - للسجلات

---

## 🔧 Stored Procedures

### add_to_library
```sql
CALL add_to_library(user_id, lang_key);
```
يضيف كورس للمكتبة ويُنشئ سجل تقدم تلقائياً.

### update_progress
```sql
CALL update_progress(user_id, lang_key, completed_steps_json);
```
يحدث التقدم بناءً على الخطوات المكتملة.

---

## 📊 Views

### user_stats
```sql
SELECT * FROM user_stats WHERE username = 'yousef';
```
عرض إحصائيات المستخدم.

### language_stats
```sql
SELECT * FROM language_stats ORDER BY enrolled_users DESC;
```
إحصائيات كل لغة برمجية.

---

## 🚀 Deployment

### Production Checklist
- [ ] تغيير `JWT_SECRET` لقيمة قوية وعشوائية
- [ ] تعيين `NODE_ENV=production`
- [ ] استخدام HTTPS
- [ ] تفعيل SSL للـ Database
- [ ] مراجعة CORS origins
- [ ] تفعيل Logging متقدم
- [ ] إعداد Backup تلقائي للـ Database
- [ ] استخدام Process Manager (PM2)

### مثال PM2
```bash
npm install -g pm2
pm2 start server.js --name fastlearn-api
pm2 startup
pm2 save
```

---

## 🐛 Debugging

### تفعيل Logs
```bash
NODE_ENV=development npm run dev
```

### اختبار الاتصال
```bash
curl http://localhost:5000/api/health
```

### Database Debug
```sql
SHOW PROCESSLIST;
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;
```

---

## 📞 Support

- **Email:** support@fastlearn.com
- **GitHub:** [Repository Link]
- **Docs:** [Documentation URL]

---

## 📄 License

MIT License - see LICENSE file

---

**Made with ❤️ in Egypt**