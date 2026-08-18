import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { env } from './config/env.js';
import { httpLogger } from './config/logger.js';
import { ApiError } from './utils/ApiError.js';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import './models/index.js';
import { v1Routes } from './routes/api.v1.js';

const app: Application = express();

// 1. Disable X-Powered-By header
app.disable('x-powered-by');

// 2. HTTP Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false
  })
);

// 3. CORS Configuration (Allows Next.js frontend and customer website with HttpOnly cookies)
const allowedOrigins = env.FRONTEND_URL.split(',').map((origin) => origin.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(ApiError.forbidden(`Origin "${origin}" is not allowed by CORS policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
  })
);

// 4. Request Logging (Structured Pino HTTP)
app.use(httpLogger);

// 5. Response Compression
app.use(compression());

// 6. Request Body Parsers (Size limits configured to allow local product base64 image data)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. Cookie Parser for secure HttpOnly cookie handling
app.use(cookieParser(env.COOKIE_SECRET));

// 8. Global API Rate Limiter
app.use(globalLimiter);

// 9. API Routes
app.use('/api/v1', v1Routes);

// 10. 404 Handler for Unmatched Routes
app.use(notFoundHandler);

// 11. Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
