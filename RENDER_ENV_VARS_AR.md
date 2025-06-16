# كيفية إضافة متغيرات البيئة في Render

## الخطوات:

### 1. الذهاب إلى Environment Variables
- في لوحة التحكم Render الخاصة بمشروعك
- ابحث عن قسم "Environment Variables" أو "Environment"
- اضغط على "Add Environment Variable"

### 2. إضافة المتغيرات المطلوبة

#### المتغير الأول: NODE_ENV
- **Key (المفتاح)**: `NODE_ENV`
- **Value (القيمة)**: `production`

#### المتغير الثاني: MONGODB_URI
- **Key (المفتاح)**: `MONGODB_URI`
- **Value (القيمة)**: رابط قاعدة البيانات MongoDB الخاص بك

## مثال على رابط MongoDB:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

## ملاحظات مهمة:
- استبدل `username` باسم المستخدم الخاص بك
- استبدل `password` بكلمة المرور الخاصة بك
- استبدل `cluster0.xxxxx.mongodb.net` برابط الكلستر الخاص بك
- استبدل `database_name` باسم قاعدة البيانات

## إذا لم يكن لديك رابط MongoDB:
1. اذهب إلى MongoDB Atlas (cloud.mongodb.com)
2. قم بإنشاء حساب مجاني
3. أنشئ كلستر جديد
4. اذهب إلى "Connect" واختر "Connect your application"
5. انسخ الرابط واستبدل username وpassword

## بعد إضافة المتغيرات:
- احفظ التغييرات
- أعد نشر (Deploy) المشروع