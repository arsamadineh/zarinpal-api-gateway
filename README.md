# درگاه پرداخت زرین‌پال API

این پروژه یک API برای اتصال به درگاه پرداخت زرین‌پال است.

## راه‌اندازی پروژه

برای راه‌اندازی پروژه، مراحل زیر را دنبال کنید:

1. **پیش‌نیازها:**
   - Node.js (نسخه 20 یا بالاتر)
   - npm یا yarn

2. **نصب:**
   ```bash
   npm install
   # یا
   yarn install
   ```

3. **تنظیمات محیط:**
   - یک فایل `.env` در ریشه پروژه ایجاد کنید.
   - متغیرهای محیطی زیر را در فایل `.env` تنظیم کنید:
     ```
     PORT=3000
     NODE_ENV=development
     ZARINPAL_MERCHANT_ID=YOUR_ZARINPAL_MERCHANT_ID
     ZARINPAL_API_URL=https://api.zarinpal.com/pg/v4/payment/request.json # or sandbox url
     BLOCKED_IPS=127.0.0.1,::1 # Optional: Comma separated list of IPs to block
     ```
     - `PORT`: شماره پورتی که سرور باید روی آن اجرا شود.
     - `NODE_ENV`: محیط اجرای برنامه (development یا production).
     - `ZARINPAL_MERCHANT_ID`: شناسه کاربری زرین‌پال شما.
     - `ZARINPAL_API_URL`: آدرس API زرین‌پال.
     - `BLOCKED_IPS`: لیست آی‌پی‌های مسدود شده (اختیاری).

4. **اجرا:**
   ```bash
   npm run dev:local
   # یا
   yarn dev:local
   ```
   این دستور سرور را در حالت توسعه اجرا می‌کند.

## پیکربندی

- **فایل `.env`:**
  - برای تنظیم متغیرهای محیطی از فایل `.env` استفاده کنید.
  - اطمینان حاصل کنید که فایل `.env` در `.gitignore` قرار دارد تا اطلاعات حساس شما در Git ذخیره نشود.

## استفاده از API

### درخواست پرداخت

- **Endpoint:** `/api/payment/request`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "amount": 10000,
    "callback_url": "https://example.com/callback",
    "description": "توضیحات پرداخت",
    "mobile": "09123456789",
    "email": "example@example.com"
  }
  ```
  - `amount`: مبلغ پرداخت به تومان.
  - `callback_url`: آدرس بازگشت پس از پرداخت.
  - `description`: توضیحات پرداخت (اختیاری).
  - `mobile`: شماره موبایل (اختیاری).
  - `email`: ایمیل (اختیاری).

### تایید پرداخت

- **Endpoint:** `/api/payment/verify`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "authority": "YOUR_AUTHORITY",
    "amount": 10000
  }
  ```
  - `authority`: کد تایید پرداخت.
  - `amount`: مبلغ پرداخت به تومان.

## راهنمای توسعه

- **ساختار پروژه:**
  ```
  src/
  ├── config/       # پیکربندی‌ها
  ├── routes/       # مسیرها
  ├── controllers/  # منطق کسب‌وکار
  ├── repositories/ # لایه دسترسی به داده‌ها
  ├── models/       # مدل‌های داده
  ├── middleware/   # میان‌افزارها
  ├── utils/        # ابزارهای کمکی
  ├── utils/errors/ # خطاهای سفارشی
  ├── server.ts     # نقطه ورود برنامه
  ```

- **استفاده از TypeScript:**
  - پروژه با TypeScript نوشته شده است.
  - از تایپ‌های قوی برای جلوگیری از خطاها استفاده کنید.

- **مدیریت خطاها:**
  - از `HttpError` برای مدیریت خطاهای HTTP استفاده کنید.
  - از `errorHandler` برای مدیریت خطاهای سراسری استفاده کنید.

## مشکلات رایج و راه‌حل‌ها

1. **مشکل:** عدم اتصال به درگاه زرین‌پال.
   - **راه‌حل:**
     - اطمینان حاصل کنید که `ZARINPAL_MERCHANT_ID` و `ZARINPAL_API_URL` به درستی تنظیم شده‌اند.
     - از اتصال اینترنت خود مطمئن شوید.

2. **مشکل:** خطای CORS.
   - **راه‌حل:**
     - تنظیمات CORS را در `src/server.ts` بررسی کنید.
     - در حالت توسعه، `origin` را به `"*"` تغییر دهید.
     - در حالت production، `origin` را به دامنه خود تنظیم کنید.

3. **مشکل:** عدم دریافت `req.rawBody`.
   - **راه‌حل:**
     - اطمینان حاصل کنید که middleware مربوطه در `src/server.ts` به درستی تنظیم شده است.

## مشارکت

برای مشارکت در توسعه پروژه، مراحل زیر را دنبال کنید:

1. یک Fork از پروژه ایجاد کنید.
2. تغییرات خود را در یک Branch جدید اعمال کنید.
3. یک Pull Request به Branch اصلی ارسال کنید.

## مجوز

این پروژه تحت مجوز MIT منتشر شده است.
