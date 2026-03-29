/**
 * Redis Type Definitions Module
 *
 * Provides TypeScript type definitions and interfaces for Redis connection configuration.
 * These types support both URL-based and configuration-based connection methods with
 * comprehensive option customization through the ioredis library's RedisOptions.
 *
 * @module @types/redis
 */

import { RedisOptions } from "ioredis";

/**
 * RedisURLOptions - Configuration options for URL-based Redis connections
 *
 * Represents a subset of ioredis RedisOptions specifically designed for use with
 * URL-based connection strings. This type excludes connection parameters that are
 * already specified in the URL (host, port, username, password) to avoid duplication
 * and configuration conflicts.
 *
 * Commonly used options include:
 * - maxRetriesPerRequest: Maximum number of retries per request (default: 3)
 * - connectTimeout: Timeout in milliseconds for connection establishment (default: 5000)
 * - lazyConnect: If true, connection is deferred until explicitly called (default: true)
 * - enableReadyCheck: Whether to check Redis readiness before using (default: true)
 * - enableOfflineQueue: Queue commands when Redis is offline (default: true)
 * - retryStrategy: Custom function to determine retry behavior
 * - db: Database number (0-15, can also be specified in URL)
 * - tls: TLS configuration for rediss:// connections
 *
 * @type {Omit<RedisOptions, "host" | "port" | "username" | "password">}
 *
 * @example
 * const urlOptions: RedisURLOptions = {
 *   maxRetriesPerRequest: 5,
 *   connectTimeout: 10000,
 *   lazyConnect: false,
 *   db: 1
 * };
 */
export type RedisURLOptions = Omit<
  RedisOptions,
  "host" | "port" | "username" | "password"
>;

/**
 * RedisConnectURLConfig - Configuration for URL-based Redis connection
 *
 * This interface defines the required and optional parameters for establishing
 * a Redis connection using a connection URL string. The URL follows the standard
 * Redis URI scheme with support for both secure (rediss://) and standard (redis://)
 * protocols.
 *
 * @typedef {Object} RedisConnectURLConfig
 *
 * @property {string} url - Complete Redis connection URL
 *   Format: redis://[username]:[password]@[host]:[port]/[database]
 *   - Supports redis:// (unencrypted) and rediss:// (TLS encrypted) protocols
 *   - username: Authentication username (default: 'default')
 *   - password: Authentication password (required if using ACL or requirepass)
 *   - host: Redis server hostname or IP address
 *   - port: Redis server port (default: 6379)
 *   - database: Target database number 0-15 (optional, default: 0)
 *
 *   Examples:
 *   - redis://default:password@localhost:6379/0
 *   - rediss://user:pass@redis.example.com:6380
 *   - redis://:password@localhost:6379 (no username, uses 'default')
 *
 * @property {RedisURLOptions} [options] - Optional connection configuration
 *   Allows customization of connection behavior, timeouts, retry logic, etc.
 *   See RedisURLOptions for available configuration options.
 *   If not provided, sensible defaults are applied automatically.
 *
 * @example
 * const urlConfig: RedisConnectURLConfig = {
 *   url: 'redis://default:mypassword@localhost:6379/0',
 *   options: {
 *     maxRetriesPerRequest: 5,
 *     connectTimeout: 10000
 *   }
 * };
 *
 * @example
 * // Minimal configuration with defaults
 * const minimalConfig: RedisConnectURLConfig = {
 *   url: 'redis://:password@localhost:6379'
 * };
 */
export type RedisConnectURLConfig = {
  url: string;
  options?: RedisURLOptions;
};

/**
 * RedisConnectConfig - Configuration for credential-based Redis connection
 *
 * This interface defines the required and optional parameters for establishing
 * a Redis connection using individual host, port, and credential parameters.
 * This approach is useful when connection details are stored separately or when
 * URL parsing is not desired.
 *
 * @typedef {Object} RedisConnectConfig
 *
 * @property {number} port - Redis server port number
 *   Valid range: 1-65535
 *   Default Redis port is 6379
 *   Must be provided and must be a positive integer
 *
 * @property {string} username - Redis authentication username
 *   - Required for this implementation
 *   - Typically 'default' for standard Redis or custom username for ACL-enabled Redis
 *   - Used for Redis 6+ ACL authentication
 *   - Cannot be empty string
 *
 * @property {string} password - Redis authentication password
 *   - Required for this implementation
 *   - Must match the password configured on the Redis server
 *   - If Redis has requirepass configured, this password must be provided
 *   - Cannot be empty string
 *
 * @property {RedisOptions} [options] - Optional connection configuration
 *   Allows customization of connection behavior, timeouts, retry logic, etc.
 *   Includes all ioredis RedisOptions not used for basic connection setup.
 *
 *   Commonly used options:
 *   - maxRetriesPerRequest: Number of retries per request (default: 3)
 *   - connectTimeout: Connection timeout in milliseconds (default: 5000)
 *   - lazyConnect: Defer connection establishment (default: true)
 *   - host: Redis server hostname (can be specified here if preferred)
 *   - db: Target database number 0-15 (default: 0)
 *   - enableReadyCheck: Check Redis readiness (default: true)
 *   - enableOfflineQueue: Queue commands when offline (default: true)
 *   - retryStrategy: Custom retry behavior function
 *   - tls: TLS configuration for secure connections
 *   - family: IP family (4 for IPv4, 6 for IPv6, 0 for both)
 *
 *   If not provided, sensible defaults are applied automatically.
 *
 * @example
 * const configBasedConnection: RedisConnectConfig = {
 *   port: 6379,
 *   username: 'default',
 *   password: 'mypassword',
 *   options: {
 *     maxRetriesPerRequest: 5,
 *     connectTimeout: 10000,
 *     db: 1
 *   }
 * };
 *
 * @example
 * // Minimal configuration with defaults
 * const minimalConfig: RedisConnectConfig = {
 *   port: 6379,
 *   username: 'default',
 *   password: 'password'
 * };
 *
 * @example
 * // Configuration for ACL-enabled Redis 6+
 * const aclConfig: RedisConnectConfig = {
 *   port: 6379,
 *   username: 'appuser',
 *   password: 'apppassword',
 *   options: {
 *     db: 2,
 *     connectTimeout: 8000
 *   }
 * };
 */
export type RedisConnectConfig = {
  port: number;
  username: string;
  password: string;
  options?: RedisOptions;
};
