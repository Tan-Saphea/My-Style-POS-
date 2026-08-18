import pino from 'pino';
import { pinoHttp } from 'pino-http';
import { IncomingMessage, ServerResponse } from 'http';
import { env } from './env.js';

// Sensitive keys to strictly redact from all logs
const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'req.body.password',
  'req.body.passwordHash',
  'req.body.currentPassword',
  'req.body.newPassword',
  'req.body.confirmPassword',
  'req.body.refreshToken',
  'req.body.token',
  'req.body.cardNumber',
  'req.body.cvv',
  'req.body.secret'
];

/**
 * Base Pino Logger Configuration
 */
export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: REDACTED_PATHS,
    censor: '[REDACTED]'
  },
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname'
          }
        }
      : undefined,
  timestamp: pino.stdTimeFunctions.isoTime
});

/**
 * Express HTTP Request Logger Middleware (pino-http)
 */
export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
    return `${req.method} ${(req as unknown as { originalUrl?: string }).originalUrl || req.url} - ${res.statusCode}`;
  },
  customErrorMessage: (req: IncomingMessage, res: ServerResponse, err: Error) => {
    return `${req.method} ${(req as unknown as { originalUrl?: string }).originalUrl || req.url} - ${res.statusCode}: ${err.message}`;
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        remoteAddress: req.remoteAddress
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode
      };
    }
  }
});
