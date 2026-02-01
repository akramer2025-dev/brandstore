# 🛍️ براند ستور - متجر إلكتروني متكامل

![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.19.1-2D3748)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

## 📋 نظرة عامة

منصة تجارة إلكترونية احترافية متكاملة مع نظام إدارة متقدم، تتبع GPS للتوصيل، والدفع عند الاستلام مع فحص المنتجات.

## ✨ المميزات الرئيسية

### 🛒 للعملاء
- ✅ تصفح المنتجات مع بحث وفلترة متقدمة
- ✅ سلة تسوق ذكية مع localStorage
- ✅ نظام طلبات كامل مع تتبع الحالة
- ✅ صفحة شخصية لإدارة الحساب
- ✅ تغيير كلمة المرور
- ✅ عرض تفاصيل الطلبات والحالة

### 🚚 لموظفي التوصيل
- ✅ واجهة خاصة لعرض الطلبات المخصصة
- ✅ تسجيل نتيجة الفحص (قبول/رفض)
- ✅ إرجاع تلقائي للمخزون عند الرفض
- ✅ تتبع موقع GPS مع خرائط Google
- ✅ إشعارات WhatsApp عند تعيين الطلبات

### 👨‍💼 للمديرين
- ✅ لوحة تحكم شاملة
- ✅ إدارة المنتجات مع رفع الصور
- ✅ إدارة الطلبات والعملاء
- ✅ إدارة موظفي التوصيل
- ✅ نظام المخزون مع تتبع المعاملات
- ✅ إدارة الأقمشة (شراء/قص/تكلفة)

## 🎨 التصميم

- 🌙 Dark theme احترافي مع gradients
- 📱 Responsive design كامل
- ✨ Animations سلسة
- 🎯 UX/UI محسّنة
- 🚀 Performance عالي

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 15.5.9** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **Zustand** - State management
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - Server-side
- **Prisma 6.19.1** - ORM
- **SQLite** - Database (production-ready)
- **NextAuth v5** - Authentication
- **bcryptjs** - Password hashing

### Features
- **Image Upload** - Local storage
- **WhatsApp Integration** - Notifications
- **Google Maps** - GPS tracking
- **Real-time Updates** - Polling system

## 📁 هيكل المشروع

```
markting/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── dev.db                  # SQLite database
│   └── seed.ts                 # Seed data
├── public/
│   └── uploads/                # Uploaded images
├── src/
│   ├── app/
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── inventory/
│   │   │   ├── fabrics/
│   │   │   └── delivery-staff/
│   │   ├── api/                # API routes
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── delivery/
│   │   │   ├── user/
│   │   │   └── upload/
│   │   ├── auth/               # Authentication
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Checkout process
│   │   ├── delivery/           # Delivery staff interface
│   │   ├── orders/             # Customer orders
│   │   ├── products/           # Products pages
│   │   ├── profile/            # User profile
│   │   ├── loading.tsx         # Loading page
│   │   ├── not-found.tsx       # 404 page
│   │   └── page.tsx            # Homepage
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── ErrorBoundary.tsx
│   │   ├── Header.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductsSlider.tsx
│   │   └── Skeletons.tsx
│   ├── lib/
│   │   ├── auth.ts             # NextAuth config
│   │   ├── prisma.ts           # Prisma client
│   │   ├── order-service.ts    # Order logic
│   │   ├── fabric-service.ts   # Fabric management
│   │   └── inventory-service.ts
│   ├── store/
│   │   └── cart.ts             # Zustand store
│   └── types/
│       └── next-auth.d.ts
├── .env                        # Environment variables
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## 🚀 التثبيت والإعداد

### 1. المتطلبات
- Node.js 18+
- npm/yarn/pnpm

### 2. التثبيت

```bash
# Clone the repository
git clone <repository-url>
cd markting

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your settings

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### 3. Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (optional)
OPENAI_API_KEY="sk-..."
```

### 4. تشغيل التطبيق

```bash
# Development
npm run dev

# Production
npm run build
npm start

# Open Prisma Studio
npm run prisma:studio
```

## 👥 الحسابات الافتراضية

بعد تشغيل `npm run prisma:seed`:

| الدور | البريد الإلكتروني | كلمة المرور |
|-------|-------------------|--------------|
| لا يوجد مستخدمين افتراضيين |  |  |

## 📱 الصفحات والمسارات

### عامة
- `/` - الصفحة الرئيسية
- `/products` - جميع المنتجات (مع بحث وفلترة)
- `/products/[id]` - تفاصيل المنتج
- `/cart` - سلة التسوق
- `/checkout` - إتمام الطلب
- `/auth/login` - تسجيل الدخول
- `/auth/register` - إنشاء حساب

### للعملاء المسجلين
- `/orders` - طلباتي
- `/profile` - الملف الشخصي

### لموظفي التوصيل
- `/delivery` - طلبات التوصيل
- `/delivery/[id]` - تفاصيل الطلب والفحص

### للمديرين
- `/admin` - لوحة التحكل
- `/admin/products` - إدارة المنتجات
- `/admin/orders` - إدارة الطلبات
- `/admin/orders/[id]` - تفاصيل الطلب
- `/admin/customers` - إدارة العملاء
- `/admin/inventory` - المخزون
- `/admin/fabrics` - إدارة الأقمشة
- `/admin/delivery-staff` - موظفو التوصيل

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/callback/credentials` - Login

### Products
- `GET /api/products` - List products
- `GET /api/products/[id]` - Product details
- `POST /api/products` - Create (Admin)

### Orders
- `GET /api/orders` - User orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Order details
- `PATCH /api/orders/[id]/status` - Update status (Admin)
- `PATCH /api/orders/[id]/assign-delivery` - Assign staff (Admin)

### Delivery
- `GET /api/delivery/orders` - Delivery staff orders
- `GET /api/delivery/orders/[id]` - Order details
- `PATCH /api/delivery/orders/[id]/inspect` - Record inspection

### Categories
- `GET /api/categories` - List categories

### Upload
- `POST /api/upload` - Upload image (Admin)

### User
- `PATCH /api/user/profile` - Update profile
- `PATCH /api/user/change-password` - Change password

## 🎯 المميزات المتقدمة

### 1. نظام COD الكامل
- فحص عند الاستلام
- قبول → تحصيل المبلغ الكامل
- رفض → إرجاع تلقائي للمخزون + رسوم التوصيل فقط

### 2. تتبع GPS
- موقع موظف التوصيل real-time
- تحديث تلقائي كل 30 ثانية
- رابط مباشر لخرائط Google

### 3. إشعارات WhatsApp
- رسالة تلقائية لموظف التوصيل
- تفاصيل الطلب والعنوان
- تعليمات COD

### 4. إدارة المخزون
- تتبع دقيق للكميات
- تنبيهات المخزون المنخفض
- سجل كامل للمعاملات

### 5. نظام الأقمشة
- شراء الأقمشة بالمتر
- قص القماش لإنتاج ملابس
- حساب تلقائي للتكلفة
- إضافة للمخزون

## 🎨 التخصيص

### تغيير الألوان
عدّل في `src/app/globals.css`:
```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --teal-600: #0d9488;
  /* ... */
}
```

### إضافة صفحات جديدة
```bash
# Create new page
mkdir src/app/new-page
touch src/app/new-page/page.tsx
```

## 📊 قاعدة البيانات

### Models
- **User** - المستخدمون
- **Product** - المنتجات
- **Category** - الفئات
- **Order** - الطلبات
- **OrderItem** - عناصر الطلب
- **DeliveryStaff** - موظفو التوصيل
- **InventoryTransaction** - معاملات المخزون
- **Fabric** - الأقمشة
- **FabricPiece** - قطع القماش

### Migrations
```bash
# Create migration
npm run prisma:migrate -- --name migration_name

# Reset database
npx prisma migrate reset

# View database
npm run prisma:studio
```

## 🧪 الاختبار

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build test
npm run build
```

## 📦 الإنتاج

### Deploy to Vercel
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Build locally
```bash
npm run build
npm start
```

## 🤝 المساهمة

Contributions are welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 الترخيص

© 2026 **Eng/Akram elmasry**. جميع الحقوق محفوظة.

## 🆘 الدعم

للمساعدة أو الاستفسارات:
- 📧 Email: [your-email@example.com]
- 💬 Issues: GitHub Issues

## 📝 الملاحظات

- ✅ المشروع جاهز للإنتاج
- ✅ جميع المميزات الأساسية مكتملة
- ✅ التصميم responsive كامل
- ✅ الأمان محسّن
- ⚠️ يُنصح بإضافة SSL للإنتاج
- ⚠️ يُنصح باستخدام PostgreSQL للإنتاج بدلاً من SQLite

---

**Built with ❤️ using Next.js & TypeScript**
