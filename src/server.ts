import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import fs from "node:fs";
import https from "node:https";
import rateLimit from "express-rate-limit";
import {
  endpointNotImplemented,
  globalErrorHandler,
} from "@/middleware/errors.js";
import { paymentRoutes } from "@/routes/payment.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

declare module "http" {
  interface IncomingMessage {
    rawBody: string;
  }
}

/*------------- Security Config -------------*/
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// Basic security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === "development" ? "*" : "https://your-production-domain.com", // TODO: replace with your production domain
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// IP Blocking - TODO: Implement a more robust IP blocking mechanism, potentially using a database to store blocked IPs.
const blockedIPs = process.env.BLOCKED_IPS ? process.env.BLOCKED_IPS.split(',') : [];

app.use((req, res, next) => {
  const clientIP = req.ip || req.socket.remoteAddress;
  if (clientIP && blockedIPs.includes(clientIP)) {
    return res.status(403).send('Your IP is blocked.');
  }
  next();
});

/*------------- Middlewares -------------*/
app.use(
  express.json({
    verify: (req, _, buf) => {
      // Provide access to the request raw body
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: false }));

/*------------- Endpoints -------------*/
app.use("/api/payment", paymentRoutes);
/**
 * Example endpoint definition:
 *
 * app.use("/api/user", userRouter);
 */

/*------------- Error middleware -------------*/
app.use(endpointNotImplemented);
app.use(globalErrorHandler);

/*------------- Server Configuration -------------*/
if (NODE_ENV === "production") {
  // HTTPS configuration
  const privateKey = fs.readFileSync('/etc/letsencrypt/live/your-domain.com/privkey.pem', 'utf8'); // TODO: replace with your domain
  const certificate = fs.readFileSync('/etc/letsencrypt/live/your-domain.com/cert.pem', 'utf8'); // TODO: replace with your domain
  const ca = fs.readFileSync('/etc/letsencrypt/live/your-domain.com/chain.pem', 'utf8'); // TODO: replace with your domain

  const httpsServer = https.createServer({
    key: privateKey,
    cert: certificate,
    ca: ca,
  }, app);

  httpsServer.listen(443, () => {
    console.log(`HTTPS Server listening on port 443...`);
  });
} else {
  app.listen(PORT, () => console.log(`Service listening on port ${PORT}...`));
}
