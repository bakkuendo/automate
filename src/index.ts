/**
 * Redis Client Module - Main Export
 *
 * This module serves as the primary entry point for the Redis client package.
 * It re-exports all public APIs from the RedisClient implementation, making them
 * available to consumers of this package.
 *
 * Exported Items:
 * - RedisClient: Singleton class for managing Redis connections
 * - Related type definitions for connection configuration
 *
 * @module redisClient
 * @exports RedisClient
 *
 * @example
 * // Import the Redis client
 * import { RedisClient } from '@your-package/redis-client';
 *
 * // Get singleton instance
 * const redisClient = RedisClient.getInstance();
 *
 * // Connect using URL
 * await redisClient.connectURL({
 *   url: 'redis://default:password@localhost:6379'
 * });
 *
 * // Or connect using config
 * await redisClient.connectConfig({
 *   port: 6379,
 *   username: 'default',
 *   password: 'password'
 * });
 *
 * // Use the client
 * const client = redisClient.getClient();
 * await client.set('key', 'value');
 *
 * // Cleanup on app shutdown
 * await redisClient.disconnect();
 */

export * from "./libs/redisClient";
export * from "./libs/scheduler";
