/**
 * Redis Client Module
 *
 * Provides a singleton-based Redis client with support for both URL-based and configuration-based connections.
 * This module implements the singleton pattern to ensure only one Redis connection exists throughout the application lifecycle.
 *
 * @module redisClient
 */

import Redis, { Redis as RedisClientType, RedisOptions } from "ioredis";
import {
  RedisConnectConfig,
  RedisConnectURLConfig,
  RedisURLOptions,
} from "../@types/redis";

/**
 * RedisClient - Singleton class for managing Redis connections
 *
 * This class provides a centralized, singleton-based interface for connecting to and managing a Redis instance.
 * It supports two connection modes:
 * 1. URL-based connection (e.g., redis://user:password@host:port)
 * 2. Configuration object-based connection (host, port, credentials)
 *
 * The class implements lazy initialization with connection pooling and automatic retry logic.
 * All connection attempts include comprehensive error handling with specific error messages for common failure scenarios.
 *
 * @example
 * // Using URL-based connection
 * const redisClient = RedisClient.getInstance();
 * await redisClient.connectURL({
 *   url: 'redis://default:password@localhost:6379',
 *   options: { maxRetriesPerRequest: 5 }
 * });
 *
 * @example
 * // Using configuration-based connection
 * const redisClient = RedisClient.getInstance();
 * await redisClient.connectConfig({
 *   port: 6379,
 *   username: 'default',
 *   password: 'mypassword',
 *   options: { connectTimeout: 10000 }
 * });
 */
export class RedisClient {
  /**
   * Static instance variable for singleton pattern implementation
   * @private
   * @type {RedisClient | null}
   */
  private static instance: RedisClient | null = null;

  /**
   * Redis client instance from ioredis library
   * @private
   * @type {RedisClientType | null}
   */
  private client: RedisClientType | null = null;

  /**
   * Private constructor to enforce singleton pattern
   * Prevents direct instantiation of RedisClient
   * @private
   */
  private constructor() {}

  /**
   * Generates default and merged URL connection options
   *
   * This method creates a configuration object for URL-based Redis connections by merging
   * user-provided options with sensible defaults. If certain critical options are not provided,
   * this method ensures they are set to predefined defaults.
   *
   * Default values:
   * - maxRetriesPerRequest: 3 (number of retry attempts per request)
   * - connectTimeout: 5000ms (connection establishment timeout)
   * - lazyConnect: true (defer actual connection until explicitly called)
   *
   * @private
   * @param {RedisURLOptions | undefined} opt - Optional URL connection options to merge with defaults
   * @returns {RedisURLOptions} Merged options with defaults applied for missing values
   *
   * @example
   * const options = this.generateURLOptions({ maxRetriesPerRequest: 5 });
   * // Returns { maxRetriesPerRequest: 5, connectTimeout: 5000, lazyConnect: true }
   */
  private generateURLOptions(
    opt: RedisURLOptions | undefined,
  ): RedisURLOptions {
    let option: RedisURLOptions = {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true,
    };
    if (!opt || !opt?.maxRetriesPerRequest || !opt?.connectTimeout) {
      option = {
        ...opt,
        maxRetriesPerRequest: opt?.maxRetriesPerRequest
          ? opt?.maxRetriesPerRequest
          : option.maxRetriesPerRequest,
        connectTimeout: opt?.connectTimeout
          ? opt?.connectTimeout
          : option.connectTimeout,
        lazyConnect: option.lazyConnect,
      };
    }
    return option;
  }

  /**
   * Generates default and merged configuration-based connection options
   *
   * This method creates a configuration object for credential-based Redis connections by merging
   * user-provided options with sensible defaults. Similar to generateURLOptions, it ensures
   * critical configuration parameters have fallback values.
   *
   * Default values:
   * - maxRetriesPerRequest: 3 (number of retry attempts per request)
   * - connectTimeout: 5000ms (connection establishment timeout)
   * - lazyConnect: true (defer actual connection until explicitly called)
   *
   * @private
   * @param {RedisOptions | undefined} opt - Optional configuration options to merge with defaults
   * @returns {RedisOptions} Merged options with defaults applied for missing values
   *
   * @example
   * const options = this.generateConfigOptions({ connectTimeout: 8000 });
   * // Returns { maxRetriesPerRequest: 3, connectTimeout: 8000, lazyConnect: true }
   */
  private generateConfigOptions(opt: RedisOptions | undefined): RedisOptions {
    let option: RedisOptions = {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true,
    };
    if (!opt || !opt?.maxRetriesPerRequest || !opt?.connectTimeout) {
      option = {
        ...opt,
        maxRetriesPerRequest: opt?.maxRetriesPerRequest
          ? opt?.maxRetriesPerRequest
          : option.maxRetriesPerRequest,
        connectTimeout: opt?.connectTimeout
          ? opt?.connectTimeout
          : option.connectTimeout,
        lazyConnect: option.lazyConnect,
      };
    }
    return option;
  }

  /**
   * Retrieves the singleton instance of RedisClient
   *
   * Implements the singleton pattern to ensure only one RedisClient instance exists throughout
   * the application lifecycle. On first call, creates a new instance; on subsequent calls,
   * returns the existing instance.
   *
   * @public
   * @static
   * @returns {RedisClient} The singleton instance of RedisClient
   *
   * @example
   * const redisClient = RedisClient.getInstance();
   * // Always returns the same instance
   */
  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  /**
   * Retrieves the active Redis client connection
   *
   * Returns the underlying ioredis client instance for direct interaction with Redis.
   * This method should only be called after a successful connection has been established
   * via either connectURL() or connectConfig().
   *
   * @public
   * @throws {Error} If called before connection is established (client is null)
   * @returns {RedisClientType} The active ioredis client instance
   *
   * @example
   * const client = redisClient.getClient();
   * await client.set('key', 'value');
   * const value = await client.get('key');
   */
  public getClient(): RedisClientType {
    if (!this.client) {
      throw new Error("Redis not connected. Call connect() first.");
    }
    return this.client;
  }

  /**
   * Establishes a Redis connection using a connection URL string
   *
   * Connects to a Redis instance using a standardized Redis URL format.
   * Supports both 'redis://' and 'rediss://' (TLS) protocols.
   *
   * Connection URL Format:
   * - redis://[username]:[password]@[host]:[port]/[database]
   * - rediss://[username]:[password]@[host]:[port]/[database] (with TLS)
   *
   * Features:
   * - Automatic URL validation for correct protocol prefix
   * - Comprehensive error handling with specific error messages
   * - Automatic client cleanup on connection failure
   * - Support for custom connection options (timeouts, retries, etc.)
   * - Lazy connection pattern for deferred connection establishment
   *
   * Error Handling:
   * - Throws error if already connected to prevent multiple connections
   * - Detects and reports invalid credentials (WRONGPASS)
   * - Detects and reports unreachable server (ECONNREFUSED)
   * - Provides detailed error messages for debugging
   *
   * @public
   * @async
   * @param {RedisConnectURLConfig} url - Connection configuration with URL and optional settings
   * @returns {Promise<void>} Resolves when connection is successfully established
   *
   * @throws {Error} If URL format is invalid (doesn't start with redis:// or rediss://)
   * @throws {Error} If already connected to a Redis instance
   * @throws {Error} If Redis credentials are invalid (WRONGPASS)
   * @throws {Error} If Redis server is unreachable (ECONNREFUSED)
   * @throws {Error} For any other connection errors with detailed message
   *
   * @example
   * const redisClient = RedisClient.getInstance();
   * try {
   *   await redisClient.connectURL({
   *     url: 'redis://default:mypassword@localhost:6379/0',
   *     options: {
   *       maxRetriesPerRequest: 5,
   *       connectTimeout: 10000
   *     }
   *   });
   *   console.log('Connected to Redis');
   * } catch (error) {
   *   console.error('Connection failed:', error.message);
   * }
   */
  public async connectURL(url: RedisConnectURLConfig): Promise<void>;

  public async connectURL(arg: RedisConnectURLConfig): Promise<void> {
    if (this.client) {
      throw new Error("Already connected to a redis instance.");
    }
    arg.options = this.generateURLOptions(arg.options);
    let parsedUrl: URL = new URL(arg.url);
    let url: string;
    if (parsedUrl.protocol === "redis:" || parsedUrl.protocol === "rediss:") {
      url = parsedUrl.toString();
    } else {
      throw new Error(
        `Invalid Redis URL: "${arg}". Expected format: redis://user:password@host:port`,
      );
    }
    const client: Redis = new Redis(url, {
      ...arg.options,
    });
    let connectionError: Error = new Error();
    client.on("error", (err: Error) => {
      connectionError = err;
    });
    try {
      await client.connect();
      this.client = client;
    } catch (e: any) {
      await client.quit().catch(() => {});
      if (connectionError.message.includes("WRONGPASS")) {
        throw new Error("Invalid Redis credentials");
      }
      if (connectionError.message.includes("ECONNREFUSED")) {
        throw new Error("Redis server not reachable");
      }
      throw new Error(
        "Unknown Redis connection error: " + connectionError.message,
      );
    }
    return;
  }

  /**
   * Establishes a Redis connection using individual configuration parameters
   *
   * Connects to a Redis instance using explicit host, port, username, and password parameters.
   * This method is preferred when connection details are stored separately or when URL parsing
   * is not desired.
   *
   * Required Parameters:
   * - port: Redis server port number
   * - username: Redis authentication username (required by this implementation)
   * - password: Redis authentication password (required by this implementation)
   *
   * Features:
   * - Parameter validation with helpful error messages
   * - Comprehensive error handling with specific error messages
   * - Automatic client cleanup on connection failure
   * - Support for custom connection options (timeouts, retries, etc.)
   * - Lazy connection pattern for deferred connection establishment
   *
   * Error Handling:
   * - Throws error if already connected to prevent multiple connections
   * - Validates that all required parameters (username, port, password) are provided
   * - Detects and reports invalid credentials (WRONGPASS)
   * - Detects and reports unreachable server (ECONNREFUSED)
   * - Provides detailed error messages for debugging
   *
   * @public
   * @async
   * @param {RedisConnectConfig} config - Connection configuration with host credentials and optional settings
   * @returns {Promise<void>} Resolves when connection is successfully established
   *
   * @throws {Error} If username, port, or password is not provided
   * @throws {Error} If already connected to a Redis instance
   * @throws {Error} If Redis credentials are invalid (WRONGPASS)
   * @throws {Error} If Redis server is unreachable (ECONNREFUSED)
   * @throws {Error} For any other connection errors with detailed message
   *
   * @example
   * const redisClient = RedisClient.getInstance();
   * try {
   *   await redisClient.connectConfig({
   *     port: 6379,
   *     username: 'default',
   *     password: 'mypassword',
   *     options: {
   *       maxRetriesPerRequest: 5,
   *       connectTimeout: 10000,
   *       db: 0
   *     }
   *   });
   *   console.log('Connected to Redis');
   * } catch (error) {
   *   console.error('Connection failed:', error.message);
   * }
   */
  public async connectConfig(config: RedisConnectConfig): Promise<void>;

  public async connectConfig(arg: RedisConnectConfig): Promise<void> {
    if (this.client) {
      throw new Error("Already connected to a redis instance.");
    }
    arg.options = this.generateConfigOptions(arg.options);
    if (!arg.username || !arg.port || !arg.password) {
      throw new Error(
        "Connection `username`,`port` or `password` not provided.",
      );
    }
    const client: Redis = new Redis({
      port: arg.port,
      username: arg.username,
      password: arg.password,
      ...arg.options,
    });
    let connectionError: Error = new Error();
    client.on("error", (err: Error) => {
      connectionError = err;
    });
    try {
      await client.connect();
      this.client = client;
    } catch (e: any) {
      await client.quit().catch(() => {});
      if (connectionError.message.includes("WRONGPASS")) {
        throw new Error("Invalid Redis credentials");
      }
      if (connectionError.message.includes("ECONNREFUSED")) {
        throw new Error("Redis server not reachable");
      }
      throw new Error(
        "Unknown Redis connection error: " + connectionError.message,
      );
    }
    return;
  }

  /**
   * Gracefully disconnects from the Redis server
   *
   * Closes the active Redis connection and cleans up resources.
   * This method is safe to call even if no connection is currently established.
   * Should be called during application shutdown to ensure proper connection closure.
   *
   * Features:
   * - Safe to call when not connected (no-op if client is null)
   * - Graceful shutdown with proper resource cleanup
   * - Clears the client reference after disconnection
   * - Non-blocking operation with proper async/await support
   *
   * @public
   * @async
   * @returns {Promise<void>} Resolves when connection is successfully closed
   *
   * @example
   * const redisClient = RedisClient.getInstance();
   * // ... use Redis ...
   * await redisClient.disconnect();
   * console.log('Disconnected from Redis');
   *
   * @example
   * // Safe to call even without active connection
   * await redisClient.disconnect(); // Does nothing if not connected
   */
  public async disconnect(): Promise<void> {
    if (!this.client) return;
    await this.client.quit();
    this.client = null;
    return;
  }
}
