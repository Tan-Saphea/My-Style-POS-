import { Server } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './config/database.js';

let server: Server;

/**
 * Bootstrap and start the backend server
 */
const startServer = async (): Promise<void> => {
  // Connect to MongoDB
  await connectDB();

  // Start Express HTTP Server
  server = app.listen(env.PORT, () => {
    logger.info(`My Style TypeScript API running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
    logger.info(`Health Check: http://localhost:${env.PORT}/api/v1/health`);
  });

  // Recommended timeout configs for Node.js behind proxies (Nginx / ALB)
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
};

/**
 * Graceful Shutdown Handler
 */
const gracefulShutdown = (signal: string): void => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      logger.info('Process terminated gracefully.');
      process.exit(0);
    });

    // Force close if graceful shutdown takes too long (10s timeout)
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Process Signal Listeners
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Uncaught Exceptions
process.on('uncaughtException', (err: Error) => {
  logger.fatal({ message: err.message, stack: err.stack }, 'Uncaught Exception! Shutting down immediately...');
  process.exit(1);
});

// Unhandled Promise Rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ reason }, 'Unhandled Promise Rejection! Shutting down...');
  gracefulShutdown('unhandledRejection');
});

// Execute bootstrap
startServer();
