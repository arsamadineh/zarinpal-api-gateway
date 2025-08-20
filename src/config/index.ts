import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  zarinpalMerchantId: process.env.ZARINPAL_MERCHANT_ID || 'YOUR_ZARINPAL_MERCHANT_ID',
  zarinpalApiUrl: process.env.ZARINPAL_API_URL || 'https://api.zarinpal.com/pg/v4/payment/request.json',
  callbackUrl: process.env.CALLBACK_URL || 'http://localhost:3000/api/payment/callback', // Default callback URL
  blockedIps: process.env.BLOCKED_IPS ? process.env.BLOCKED_IPS.split(',') : [],
};
