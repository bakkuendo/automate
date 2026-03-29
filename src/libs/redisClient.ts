import Redis, { Redis as RedisClientType, RedisOptions } from "ioredis";
import {
  RedisConnectConfig,
  RedisConnectURLConfig,
  RedisURLOptions,
} from "../@types/redis";

export class RedisClient {
  private static instance: RedisClient | null = null;
  private client: RedisClientType | null = null;

  private constructor() {}

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

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public getClient(): RedisClientType {
    if (!this.client) {
      throw new Error("Redis not connected. Call connect() first.");
    }
    return this.client;
  }

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

  public async disconnect(): Promise<void> {
    if (!this.client) return;
    await this.client.quit();
    this.client = null;
    return;
  }
}
