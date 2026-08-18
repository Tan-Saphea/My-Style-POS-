import mongoose, { ConnectOptions, ClientSession } from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

let transactionsSupported = false;

/**
 * Sanitizes MongoDB connection URI to avoid logging passwords and secrets.
 * e.g., mongodb://user:pass@host:27017/db -> mongodb://***:***@host:27017/db
 */
export const sanitizeMongoUri = (uri: string): string => {
  if (!uri) return '';
  return uri.replace(/\/\/(.*?)@/, '//***:***@');
};

/**
 * Connect to MongoDB with robust options, connection pooling, and lifecycle event hooks.
 */
export const connectDB = async (): Promise<void> => {
  const sanitizedUri = sanitizeMongoUri(env.MONGODB_URI);

  const mongooseOptions: ConnectOptions = {
    maxPoolSize: 50,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    autoIndex: env.NODE_ENV !== 'production' // Auto-create indexes in development only
  };

  // Connection Event Handlers
  mongoose.connection.on('connected', () => {
    logger.info(`MongoDB Connected successfully: ${sanitizedUri}`);
  });

  mongoose.connection.on('error', (err: Error) => {
    logger.error(`MongoDB Connection Error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB Disconnected. Reconnecting...');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB Reconnected');
  });

  try {
    await mongoose.connect(env.MONGODB_URI, mongooseOptions);
    const hello = await mongoose.connection.db?.admin().command({ hello: 1 });
    transactionsSupported = Boolean(hello?.setName || hello?.msg === 'isdbgrid');
    if (!transactionsSupported) {
      logger.warn(
        'MongoDB is running in standalone mode. Multi-document operations will execute non-transactionally.'
      );
    }
  } catch (error) {
    const err = error as Error;
    logger.error(`Failed to initial connect to MongoDB [${sanitizedUri}]: ${err.message}`);
    await mongoose.disconnect().catch(() => undefined);
    throw error;
  }
};

/**
 * Gracefully disconnect from MongoDB (used during shutdown or testing).
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close(false);
    logger.info('MongoDB connection closed gracefully');
  } catch (error) {
    const err = error as Error;
    logger.error(`Error closing MongoDB connection: ${err.message}`);
  }
};

/**
 * Helper to check if MongoDB is currently ready & connected.
 */
export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const isTransactionCapable = (): boolean => transactionsSupported;

/**
 * Helper to run operations in a transaction if supported, or fallback to non-transactional execution.
 */
export const runInTransaction = async <T>(
  fn: (session: ClientSession | null) => Promise<T>
): Promise<T> => {
  if (isTransactionCapable()) {
    let result: T;
    await mongoose.connection.transaction(async (session) => {
      result = await fn(session);
    });
    return result!;
  }
  return await fn(null);
};
