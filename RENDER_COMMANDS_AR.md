# أوامر Render الصحيحة لحل مشكلة "vite: not found"

## المشكلة
خطأ "vite: not found" يحدث لأن Render يثبت dependencies الإنتاج فقط، لكن Vite في devDependencies.

## الحل الصحيح

### Build Command (أمر البناء)
```bash
npm install --include=dev && npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

### Start Command (أمر التشغيل)
```bash
npm start
```

### Environment Variables (متغيرات البيئة)
- `NODE_ENV` = `production`
- `MONGODB_URI` = رابط قاعدة البيانات MongoDB الخاص بك

## خطوات التطبيق

1. ادخل إلى لوحة التحكم Render
2. في Build Command، اضغط على "Edit"
3. امسح `npm run build` 
4. ضع الأمر الجديد الطويل أعلاه
5. احفظ التغييرات
6. أعد النشر

## شرح الأمر
- `npm install --include=dev`: يثبت جميع الحزم بما في ذلك devDependencies
- `npx vite build`: يبني واجهة المستخدم
- `npx esbuild server/index.ts...`: يبني الخادم
- `npx` يضمن العثور على الأدوات المطلوبة

هذا سيحل مشكلة "vite: not found" نهائياً.