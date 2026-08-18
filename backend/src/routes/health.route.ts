import { Router, Request, Response } from 'express';
import { isDatabaseConnected, isTransactionCapable } from '../config/database.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

interface IHealthCheckData {
  status: 'healthy' | 'degraded';
  service: string;
  timestamp: string;
  uptime: string;
  database: {
    status: 'connected' | 'disconnected';
    transactions: 'available' | 'unavailable';
  };
  memory: {
    rss: string;
    heapUsed: string;
  };
}

/**
 * @route   GET /api/v1/health
 * @desc    System Health & Readiness check endpoint
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const dbConnected = isDatabaseConnected();

    const healthData: IHealthCheckData = {
      status: dbConnected ? 'healthy' : 'degraded',
      service: 'my-style-backend',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
      database: {
        status: dbConnected ? 'connected' : 'disconnected',
        transactions: isTransactionCapable() ? 'available' : 'unavailable'
      },
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
      }
    };

    return ApiResponse.success<IHealthCheckData>(
      res,
      healthData,
      dbConnected ? 'System is healthy and operational' : 'System operational with database degraded'
    );
  })
);

export const healthRoutes: Router = router;
