# Mokta'b | مكتئب - Online Quiz Platform

منصة تعليمية متطورة لإنشاء وإجراء الاختبارات عبر الإنترنت مع أدوات تحليل متقدمة وتقارير تفصيلية.

## 🚀 الميزات

- ✨ إنشاء اختبارات تفاعلية
- 📊 تحليل مفصل للنتائج
- 📱 تصميم متجاوب لجميع الأجهزة
- 🌙 دعم الوضع المظلم
- 🔒 نظام أمان متقدم
- 📈 تقارير وإحصائيات شاملة
- 🎯 تجربة مستخدم محسنة

## 🛠️ التقنيات المستخدمة

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **State Management**: Zustand
- **UI Components**: Custom components with Lucide icons

## 📋 متطلبات النظام

- Node.js 18+
- MongoDB 4.4+
- npm/yarn/pnpm

## 🚀 البدء السريع

### 1. استنساخ المشروع

```bash
git clone https://github.com/your-username/moktab.git
cd moktab
```

### 2. تثبيت التبعيات

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. إعداد متغيرات البيئة

انسخ ملف `.env.example` إلى `.env.local` وقم بتحديث القيم:

```bash
cp .env.example .env.local
```

قم بتحرير `.env.local` وأضف القيم المطلوبة:

```env
MONGODB_URI=mongodb://localhost:27017/moktab
JWT_SECRET=your-super-secret-jwt-key-here
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 4. تشغيل قاعدة البيانات

تأكد من تشغيل MongoDB على نظامك، ثم قم بتشغيل التطبيق:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 5. فتح التطبيق

افتح [http://localhost:3000](http://localhost:3000) في المتصفح لرؤية التطبيق.

## 🔧 إعداد SEO و Metadata

### إعداد النطاق والـ Metadata

1. **تحديث NEXT_PUBLIC_BASE_URL** في ملف `.env.local` بالنطاق الفعلي
2. **إضافة أكواد التحقق** من محركات البحث:
   - Google Search Console
   - Bing Webmaster
   - Yandex Webmaster
   - Baidu Webmaster

### إعداد الأيقونات (Favicons)

يجب إضافة الأيقونات التالية في مجلد `public/`:

#### أيقونات favicon أساسية:
- `favicon.ico` - الأيقونة الأساسية
- `favicon-16x16.png` - 16×16 بكسل
- `favicon-32x32.png` - 32×32 بكسل

#### أيقونات Apple Touch:
- `apple-touch-icon.png` - عام


#### أيقونات Android/Chrome:
- `android-chrome-192x192.png` - 192×192 بكسل
- `android-chrome-512x512.png` - 512×512 بكسل

#### أيقونات Microsoft Tiles:
- `mstile-70x70.png` - 70×70 بكسل
- `mstile-144x144.png` - 144×144 بكسل
- `mstile-150x150.png` - 150×150 بكسل
- `mstile-310x150.png` - 310×150 بكسل
- `mstile-310x310.png` - 310×310 بكسل

#### أداة توليد الأيقونات:

**تثبيت ImageMagick أولاً:**

##### على Linux/macOS:
```bash
sudo apt-get install imagemagick  # Ubuntu/Debian
brew install imagemagick          # macOS
```

##### على Windows:
- حمل ImageMagick من: https://imagemagick.org/script/download.php#windows
- قم بتثبيته وتأكد من إضافته للـ PATH

**تشغيل السكريبت:**

##### على Linux/macOS:
```bash
./generate-icons.sh path/to/your/logo.png
```

##### على Windows (الطريقة البسيطة - موصى بها):
```powershell
.\generate-icons-simple.ps1
```
هذا السكريبت يستخدم PowerShell مع .NET ولا يحتاج لتثبيت برامج إضافية.

##### على Windows (الطريقة المتقدمة):
```powershell
# يتطلب تثبيت ImageMagick
.\generate-icons.ps1 "public/Images/Logo1.png"
```

**ملاحظة**: تأكد من وجود مجلد `public\` في نفس مجلد السكريبت.

#### إضافة الأيقونات إلى Git:

بعد توليد الأيقونات، أضفها إلى git:

```bash
# إضافة جميع الأيقونات المولدة
git add public/favicon*.* public/apple-touch-icon*.* public/android-chrome*.* public/mstile*.*

# أو استخدم السكريبت المساعد
./add-icons-to-git.sh

# ثم commit
git commit -m "Add favicon icons"
```

**بدائل أخرى:**
- استخدم أدوات مثل GIMP أو Photoshop لإنشاء الأيقونات يدوياً
- استخدم خدمات عبر الإنترنت مثل [RealFaviconGenerator](https://realfavicongenerator.net/)
- أو [Favicon.io](https://favicon.io/favicon-generator/)

### ملفات SEO المهمة

- `public/sitemap.xml` - خريطة الموقع
- `public/robots.txt` - إرشادات محركات البحث
- `public/manifest.json` - إعدادات PWA
- `public/browserconfig.xml` - إعدادات Windows tiles

### إعداد Google Analytics (اختياري)

أضف معرف Google Analytics إلى `.env.local`:

```env
NEXT_PUBLIC_GA_ID=GA-XXXXXXXXXX
```

## 🔒 أمان الموقع

### Security Headers

تم تكوين Security Headers تلقائياً في `next.config.ts`:

- **X-Frame-Options**: يمنع تضمين الموقع في iframe
- **X-Content-Type-Options**: يمنع MIME sniffing
- **X-XSS-Protection**: يحمي من XSS attacks
- **Referrer-Policy**: يتحكم في إرسال referrer information
- **Permissions-Policy**: يحد من استخدام APIs الحساسة
- **Strict-Transport-Security**: يفرض HTTPS

### إعداد HTTPS (للإنتاج)

1. احصل على شهادة SSL من Let's Encrypt أو مزود آخر
2. قم بتكوين الخادم ليستخدم HTTPS
3. تأكد من إعادة توجيه HTTP إلى HTTPS

## 📁 هيكل المشروع

```
moktab/
├── app/                    # Next.js App Router
│   ├── (auth)/            # صفحات المصادقة
│   ├── (dashboard)/       # لوحة التحكم
│   ├── api/               # API Routes
│   └── layout.tsx         # Layout الرئيسي
├── components/            # مكونات React
├── lib/                   # المكتبات والمساعدات
├── public/                # الملفات الثابتة
├── store/                 # إدارة الحالة (Zustand)
└── types/                 # تعريفات TypeScript
```

## 🔐 الأدوار والصلاحيات

- **المدير (Admin)**: إدارة المستخدمين والنظام
- **المعلم (Teacher)**: إنشاء وإدارة الاختبارات
- **الطالب (Student)**: إجراء الاختبارات وعرض النتائج

## 🧪 الاختبار

```bash
npm run test
# or
yarn test
```

## 🚀 النشر

### على Vercel

```bash
npm run build
```

ثم ارفع المشروع إلى [Vercel](https://vercel.com).

### على خادم آخر

```bash
npm run build
npm start
```

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للـ branch (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم

للحصول على المساعدة، يرجى:

- فتح issue في GitHub
- مراسلة فريق التطوير
- مراجعة الوثائق

## 🔄 التحديثات

### الإصدار 1.0.0
- إطلاق المنصة الأساسية
- دعم إنشاء وإجراء الاختبارات
- نظام إدارة المستخدمين
- تقارير أساسية

---

**تم تطوير بواسطة**: Mokta'b Development Team
**الموقع**: [moktab.com](https://moktab.vercel.app)
