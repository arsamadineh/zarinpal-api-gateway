# پروژه Express.js با TypeScript ساخته شده با Vratix

## ویژگی‌ها

- Express.js با TypeScript
- آبجکت‌های خطای رایج
- میان‌افزار خطا
- آبجکت پاسخ برای پاسخ‌های ساختاریافته API
- پیکربندی تست و پوشش با استفاده از Vitest
- اسکریپت‌های رایج برای اجرا و تست API‌های شما
- بارگذاری مجدد سریع (Hot-reloading) برای توسعه

## پیش‌نیازها

- Node.js نسخه 20 یا بالاتر
- npm، pnpm یا yarn
- Docker (اختیاری)

## شروع به کار

### توسعه محلی

۱. نصب وابستگی‌ها:
```bash
npm install
```

۲. شروع سرور توسعه:
```bash
npm run dev:local
```

سرور روی `http://localhost:3000` با قابلیت بارگذاری مجدد سریع (hot-reloading) شروع به کار خواهد کرد.

### ساخت برای تولید

```bash
npm run build:prod
npm run prod:serve
```

## اسکریپت‌ها

- `npm run dev:local` - شروع سرور توسعه محلی با بارگذاری مجدد سریع
- `npm run build:prod` - ساخت برای تولید
- `npm run prod:serve` - اجرای سرور تولید
- `npm run test` - اجرای تست‌ها
- `npm run coverage` - اجرای تست‌ها با گزارش پوشش

## مجوز

[MIT](./LICENSE)
